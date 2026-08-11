import { NextRequest, NextResponse } from "next/server";
import { profilFotoOnaySmsTopluKuyrugaAl } from "@/lib/cekici-karar-sms";
import { getCekiciler } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import { smsBaseUrl } from "@/lib/sms-base-url";
import { smsDurumu } from "@/lib/sms-provider";
import { createClient } from "@/lib/supabase/server";
import { panelEpostaIzinli } from "@/lib/supabase/env";
import { telefonGecerliMi } from "@/lib/telefon";

async function panelKullanici() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email || !panelEpostaIzinli(user.email)) return null;
  return user;
}

/** Onaylı profil foto sahiplerine toplu onay SMS’i kuyruğa alır. */
export async function POST(request: NextRequest) {
  const user = await panelKullanici();
  if (!user) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  await ensureSeedData();
  const cekiciler = await getCekiciler();
  const onaylilar = cekiciler.filter(
    (c) =>
      !c.testerHesap &&
      c.profilFotoDurum === "onaylandi" &&
      Boolean(c.profilFotoUrl?.trim()) &&
      telefonGecerliMi(c.telefon)
  );

  if (onaylilar.length === 0) {
    return NextResponse.json({
      ok: true,
      aliciSayisi: 0,
      mesaj: "Onaylı profil fotoğrafı olan alıcı yok.",
    });
  }

  const durum = smsDurumu();
  const baseUrl = smsBaseUrl(
    `${request.nextUrl.protocol}//${request.nextUrl.host}`
  );
  const sms = await profilFotoOnaySmsTopluKuyrugaAl({
    alicilar: onaylilar.map((c) => ({ telefon: c.telefon, ad: c.ad })),
    baseUrl,
    gonderenEposta: user.email ?? "panel:profil-foto-onay-toplu",
    tetikleMod: "after",
  });

  if (!sms.ok) {
    return NextResponse.json(
      {
        error: sms.hata ?? "SMS kuyruğa alınamadı.",
        aliciSayisi: sms.aliciSayisi,
        gercekGonderim: durum.gercekGonderim,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    aliciSayisi: sms.aliciSayisi,
    smsIsId: sms.isId ?? null,
    gercekGonderim: durum.gercekGonderim,
    mesaj: durum.gercekGonderim
      ? `${sms.aliciSayisi} kişiye onay SMS’i kuyruğa alındı.`
      : `${sms.aliciSayisi} kişi kuyruğa alındı (Netgsm kapalı — demo/log).`,
  });
}
