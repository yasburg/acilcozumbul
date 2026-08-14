import { NextRequest, NextResponse } from "next/server";
import { getCekiciById, updateCekiciBelgeDurum } from "@/lib/db";
import { rozetBelgeSonucSmsKuyrugaAl } from "@/lib/cekici-karar-sms";
import { ensureSeedData } from "@/lib/seed";
import { smsBaseUrl } from "@/lib/sms-base-url";
import type { BelgeDurum } from "@/lib/types";

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
    const durum = body.belgeDurum as BelgeDurum | undefined;

    if (durum !== "onaylandi" && durum !== "reddedildi") {
      return NextResponse.json(
        { error: "belgeDurum: onaylandi veya reddedildi olmalı." },
        { status: 400 }
      );
    }

    if (cekici.belgeDurum !== "beklemede") {
      return NextResponse.json(
        {
          error: `Bu başvuru "${cekici.belgeDurum ?? "yok"}" durumunda; onay/red için beklemede olmalı.`,
        },
        { status: 400 }
      );
    }

    if (durum === "reddedildi" && !String(body.belgeRedNedeni ?? "").trim()) {
      return NextResponse.json({ error: "Red nedeni girin." }, { status: 400 });
    }

    const redNedeni =
      durum === "reddedildi" ? String(body.belgeRedNedeni).trim() : null;

    const kaydedilen = await updateCekiciBelgeDurum(id, {
      belgeDurum: durum,
      belgeRedNedeni: redNedeni,
    });

    const baseUrl = smsBaseUrl(
      `${request.nextUrl.protocol}//${request.nextUrl.host}`
    );
    const sms = await rozetBelgeSonucSmsKuyrugaAl({
      telefon: cekici.telefon,
      ad: cekici.ad,
      durum: kaydedilen === "onaylandi" ? "onaylandi" : "reddedildi",
      redNedeni,
      baseUrl,
      gonderenEposta: "panel:rozet-belge",
    });

    return NextResponse.json({
      mesaj:
        kaydedilen === "onaylandi"
          ? sms.ok
            ? "Belgeler onaylandı. Bilgilendirme SMS’i kuyruğa alındı."
            : "Belgeler onaylandı; SMS kuyruğa alınamadı."
          : sms.ok
            ? "Belgeler reddedildi. Red nedeniyle SMS kuyruğa alındı."
            : "Belgeler reddedildi; SMS kuyruğa alınamadı.",
      belgeDurum: kaydedilen,
      smsKuyruk: sms.ok,
      smsIsId: sms.isId ?? null,
      smsHata: sms.hata ?? null,
    });
  } catch (e) {
    const mesaj = e instanceof Error ? e.message : "Belge güncellenemedi.";
    console.error("[panel/belge]", mesaj);
    return NextResponse.json({ error: mesaj }, { status: 500 });
  }
}
