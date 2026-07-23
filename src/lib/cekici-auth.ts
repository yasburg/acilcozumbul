import { randomBytes } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "./supabase/admin";
import { updateCekici } from "./db";
import type { Cekici } from "./types";
import { telefonNormalize } from "./telefon";

/** Auth e-posta kimliği (telefon → geçerli e-posta formatı) */
export function cekiciAuthEmail(telefonHam: string): string {
  const tel = telefonNormalize(telefonHam);
  return `${tel}@cekici.acilcozumbul.internal`;
}

/** Kullanıcıya gösterilmeyen rastgele parola (passwordless kayıt) */
export function cekiciAuthRastgeleSifre(): string {
  return randomBytes(24).toString("base64url");
}

function authAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon) {
    throw new Error("Supabase Auth için URL ve ANON KEY gerekli.");
  }
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function authSignIn(
  telefon: string,
  sifre: string
): Promise<{ ok: true; userId: string } | { ok: false }> {
  const client = authAnonClient();
  const { data, error } = await client.auth.signInWithPassword({
    email: cekiciAuthEmail(telefon),
    password: sifre,
  });
  if (error || !data.user) return { ok: false };
  await client.auth.signOut().catch(() => {});
  return { ok: true, userId: data.user.id };
}

export async function cekiciAuthKullaniciOlustur(input: {
  telefon: string;
  sifre: string;
  cekiciId: string;
  ad?: string;
}): Promise<string> {
  const email = cekiciAuthEmail(input.telefon);
  const { data, error } = await getSupabaseAdmin().auth.admin.createUser({
    email,
    password: input.sifre,
    email_confirm: true,
    user_metadata: {
      rol: "cekici",
      cekici_id: input.cekiciId,
      telefon: telefonNormalize(input.telefon),
      ad: input.ad ?? null,
    },
  });
  if (error || !data.user) {
    throw new Error(error?.message ?? "Auth kullanıcısı oluşturulamadı.");
  }
  return data.user.id;
}

export async function cekiciAuthSifreGuncelle(
  authUserId: string,
  sifre: string
): Promise<void> {
  const { error } = await getSupabaseAdmin().auth.admin.updateUserById(
    authUserId,
    { password: sifre }
  );
  if (error) throw new Error(error.message);
}

export async function cekiciAuthKullaniciSil(
  authUserId: string
): Promise<void> {
  const { error } = await getSupabaseAdmin().auth.admin.deleteUser(authUserId);
  if (error) {
    console.warn("[cekici-auth] auth user silinemedi:", error.message);
  }
}

/** Şifreyi Supabase Auth ile doğrula */
export async function cekiciAuthSifreDogrula(
  telefon: string,
  sifre: string
): Promise<boolean> {
  const sonuc = await authSignIn(telefon, sifre);
  return sonuc.ok;
}

/**
 * Legacy plaintext → Auth migrate.
 * Başarılı olursa auth_user_id yazar ve sifre alanını temizler.
 */
export async function cekiciSifreyiAuthaTasi(
  cekici: Cekici,
  sifre: string
): Promise<Cekici> {
  if (cekici.authUserId) {
    await cekiciAuthSifreGuncelle(cekici.authUserId, sifre);
    if (cekici.sifre) {
      const temiz = { ...cekici, sifre: "" };
      await updateCekici(temiz);
      return temiz;
    }
    return cekici;
  }

  let authUserId: string;
  try {
    authUserId = await cekiciAuthKullaniciOlustur({
      telefon: cekici.telefon,
      sifre,
      cekiciId: cekici.id,
      ad: cekici.ad,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (!/already|exists|registered|duplicate/i.test(msg)) throw e;

    const giris = await authSignIn(cekici.telefon, sifre);
    if (giris.ok) {
      authUserId = giris.userId;
    } else {
      // Auth hesabı var, şifre farklı — recovery link ile kullanıcıyı bulup şifreyi güncelle
      const email = cekiciAuthEmail(cekici.telefon);
      const { data: linkData, error: linkErr } =
        await getSupabaseAdmin().auth.admin.generateLink({
          type: "recovery",
          email,
        });
      const userId = linkData?.user?.id;
      if (linkErr || !userId) {
        throw new Error(
          linkErr?.message ??
            "Mevcut Auth hesabı güncellenemedi. Destek ile iletişime geçin."
        );
      }
      await cekiciAuthSifreGuncelle(userId, sifre);
      authUserId = userId;
    }
  }

  const guncel: Cekici = {
    ...cekici,
    authUserId,
    sifre: "",
  };
  await updateCekici(guncel);
  return guncel;
}

/**
 * Giriş doğrulama: Auth varsa Auth; yoksa legacy plaintext + lazy migrate.
 */
export async function cekiciGirisSifreKontrol(
  cekici: Cekici,
  sifre: string
): Promise<boolean> {
  if (cekici.authUserId) {
    return cekiciAuthSifreDogrula(cekici.telefon, sifre);
  }

  if (cekici.sifre && cekici.sifre === sifre) {
    try {
      await cekiciSifreyiAuthaTasi(cekici, sifre);
      return true;
    } catch (e) {
      console.error("[cekici-auth] lazy migrate başarısız:", e);
      return false;
    }
  }

  // sifre sütunu boş ama Auth'ta hesap olabilir
  const giris = await authSignIn(cekici.telefon, sifre);
  if (!giris.ok) return false;

  if (!cekici.authUserId) {
    try {
      await updateCekici({
        ...cekici,
        authUserId: giris.userId,
        sifre: "",
      });
    } catch (e) {
      console.warn("[cekici-auth] auth_user_id bağlanamadı:", e);
    }
  }
  return true;
}
