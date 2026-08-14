import { NextRequest, NextResponse } from "next/server";
import { getCekiciById, updateCekiciProfilFotoDurum } from "@/lib/db";
import { profilFotoSonucSmsKuyrugaAl } from "@/lib/cekici-karar-sms";
import { ensureSeedData } from "@/lib/seed";
import { smsBaseUrl } from "@/lib/sms-base-url";
import type { ProfilFotoDurum } from "@/lib/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSeedData();
    const { id } = await params;
    const cekici = await getCekiciById(id);
    if (!cekici) {
      return NextResponse.json({ error: "Çekici bulunamadı." }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const durum = body.profilFotoDurum as ProfilFotoDurum | undefined;

    if (durum !== "onaylandi" && durum !== "reddedildi") {
      return NextResponse.json(
        { error: "profilFotoDurum: onaylandi veya reddedildi olmalı." },
        { status: 400 }
      );
    }

    if (cekici.profilFotoDurum !== "beklemede") {
      return NextResponse.json(
        {
          error: `Bu başvuru "${cekici.profilFotoDurum ?? "yok"}" durumunda; onay/red için beklemede olmalı.`,
        },
        { status: 400 }
      );
    }

    if (!cekici.profilFotoUrl?.trim()) {
      return NextResponse.json(
        { error: "Yüklü profil fotoğrafı yok." },
        { status: 400 }
      );
    }

    if (durum === "reddedildi" && !String(body.profilFotoRedNedeni ?? "").trim()) {
      return NextResponse.json({ error: "Red nedeni girin." }, { status: 400 });
    }

    const redNedeni =
      durum === "reddedildi"
        ? String(body.profilFotoRedNedeni).trim()
        : null;

    const kaydedilen = await updateCekiciProfilFotoDurum(id, {
      profilFotoDurum: durum,
      profilFotoRedNedeni: redNedeni,
    });

    const baseUrl = smsBaseUrl(
      `${request.nextUrl.protocol}//${request.nextUrl.host}`
    );
    const sms = await profilFotoSonucSmsKuyrugaAl({
      telefon: cekici.telefon,
      ad: cekici.ad,
      durum: kaydedilen === "onaylandi" ? "onaylandi" : "reddedildi",
      redNedeni,
      baseUrl,
      gonderenEposta: "panel:profil-foto",
    });

    return NextResponse.json({
      mesaj:
        kaydedilen === "onaylandi"
          ? sms.ok
            ? "Profil fotoğrafı onaylandı. Bilgilendirme SMS’i kuyruğa alındı."
            : "Profil fotoğrafı onaylandı; SMS kuyruğa alınamadı."
          : sms.ok
            ? "Profil fotoğrafı reddedildi. Red nedeniyle SMS kuyruğa alındı."
            : "Profil fotoğrafı reddedildi; SMS kuyruğa alınamadı.",
      profilFotoDurum: kaydedilen,
      smsKuyruk: sms.ok,
      smsIsId: sms.isId ?? null,
      smsHata: sms.hata ?? null,
    });
  } catch (e) {
    const mesaj = e instanceof Error ? e.message : "Güncellenemedi.";
    console.error("[panel/profil-foto]", mesaj);
    return NextResponse.json({ error: mesaj }, { status: 500 });
  }
}
