/**
 * Mevcut cekiciler.sifre (plaintext) kayıtlarını Supabase Auth'a taşır.
 *
 * Kullanım (proje kökünde, .env yüklü):
 *   node --env-file=.env scripts/migrate-cekici-passwords-to-auth.mjs
 *
 * Önce SQL migration 018_cekici_supabase_auth.sql uygulanmış olmalı.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const service = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!url || !service || !anon) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_ANON_KEY gerekli."
  );
  process.exit(1);
}

const admin = createClient(url, service, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function authEmail(telefon) {
  const d = String(telefon).replace(/\D/g, "");
  let n = d;
  if (n.startsWith("90") && n.length === 12) n = "0" + n.slice(2);
  if (n.length === 10 && n.startsWith("5")) n = "0" + n;
  return `${n}@cekici.acilcozumbul.internal`;
}

async function main() {
  const { data: rows, error } = await admin
    .from("cekiciler")
    .select("id, ad, telefon, sifre, auth_user_id");
  if (error) throw error;

  let ok = 0;
  let atla = 0;
  let hata = 0;

  for (const row of rows ?? []) {
    if (row.auth_user_id) {
      atla++;
      continue;
    }
    const sifre = typeof row.sifre === "string" ? row.sifre.trim() : "";
    if (!sifre) {
      console.warn(`atlandı (şifre yok): ${row.telefon}`);
      atla++;
      continue;
    }

    const email = authEmail(row.telefon);
    let userId = null;

    const created = await admin.auth.admin.createUser({
      email,
      password: sifre,
      email_confirm: true,
      user_metadata: {
        rol: "cekici",
        cekici_id: row.id,
        telefon: row.telefon,
        ad: row.ad,
      },
    });

    if (created.data?.user?.id) {
      userId = created.data.user.id;
    } else {
      const link = await admin.auth.admin.generateLink({
        type: "recovery",
        email,
      });
      userId = link.data?.user?.id ?? null;
      if (userId) {
        await admin.auth.admin.updateUserById(userId, { password: sifre });
      } else {
        console.error(`hata ${row.telefon}:`, created.error?.message ?? link.error?.message);
        hata++;
        continue;
      }
    }

    const { error: upErr } = await admin
      .from("cekiciler")
      .update({ auth_user_id: userId, sifre: null })
      .eq("id", row.id);
    if (upErr) {
      console.error(`db hata ${row.telefon}:`, upErr.message);
      hata++;
      continue;
    }

    console.log(`ok: ${row.telefon} → ${userId}`);
    ok++;
  }

  console.log(`bitti: ok=${ok} atlandı=${atla} hata=${hata}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
