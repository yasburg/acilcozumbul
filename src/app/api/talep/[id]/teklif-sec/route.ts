import { NextRequest, NextResponse } from "next/server";
import { getCekiciById, getTalepById } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import { teklifFiyatDegistiMi } from "@/lib/cekici-puan";
import { kaybedenTeklifleriIsaretle } from "@/lib/ihale";
import {
  demoTalepGetir,
  demoTeklifSec,
  isDemoTalepId,
} from "@/lib/demo-oturum";
import { isSimulasyonTalep } from "@/lib/simulasyon-ihale-db";
import { getDogrulanmisTelefon } from "@/lib/musteri-auth";
import { telefonMaskele, telefonNormalize } from "@/lib/telefon";
import { notifyCekiciSecildi } from "@/lib/sms";
import { smsBaseUrl } from "@/lib/sms-base-url";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSeedData();
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const teklifId =
    typeof body.teklifId === "string" ? body.teklifId.trim() : "";

  if (!teklifId) {
    return NextResponse.json({ error: "Teklif seçin." }, { status: 400 });
  }

  if (isDemoTalepId(id)) {
    const demoCtx = await demoTalepGetir(id, request);
    if (!demoCtx) {
      return NextResponse.json(
        { error: "Demo oturumu bulunamadı.", demoHatasi: true },
        { status: 404 }
      );
    }

    try {
      const { kazananTeklif } = await demoTeklifSec(
        demoCtx.oturum,
        id,
        teklifId
      );
      return NextResponse.json({
        cekiciAd: kazananTeklif.cekiciAd,
        fiyat: kazananTeklif.fiyat,
        mesaj: "Çekici seçildi. Kısa süre içinde sizi arayacak.",
        demoModu: true,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Teklif seçilemedi.";
      if (msg.includes("Zaten")) {
        return NextResponse.json({ error: msg }, { status: 409 });
      }
      if (msg.includes("fiyatını değiştirdi")) {
        const talep = demoCtx.talep;
        const teklif = talep.teklifler?.find((t) => t.id === teklifId);
        const ilk = teklif?.ilkFiyat ?? teklif?.fiyat;
        return NextResponse.json(
          {
            error: `Bu çekici teklif fiyatını değiştirdi (${ilk} TL → ${teklif?.fiyat} TL). Güvenlik nedeniyle bu teklifle seçim yapılamaz.`,
            fiyatDegisti: true,
            ilkFiyat: ilk,
            guncelFiyat: teklif?.fiyat,
            demoModu: true,
          },
          { status: 403 }
        );
      }
      return NextResponse.json({ error: msg }, { status: 400 });
    }
  }

  const talep = await getTalepById(id);
  if (!talep) {
    return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  }

  if (await isSimulasyonTalep(id)) {
    return NextResponse.json(
      { error: "Bu talep için seçim yapılamıyor." },
      { status: 409 }
    );
  }

  const talepTel = telefonNormalize(talep.telefon);
  const dogrulanmis = await getDogrulanmisTelefon();
  if (!dogrulanmis || dogrulanmis !== talepTel) {
    return NextResponse.json(
      {
        error: "Teklif seçmek için telefon doğrulaması gerekli.",
        telefonDogrulamaGerekli: true,
        telefonMaskeli: telefonMaskele(talep.telefon),
      },
      { status: 403 }
    );
  }

  if (talep.kazananCekiciId) {
    return NextResponse.json({ error: "Zaten bir çekici seçildi." }, { status: 409 });
  }

  const teklif = talep.teklifler?.find((t) => t.id === teklifId && t.durum === "aktif");
  if (!teklif) {
    return NextResponse.json({ error: "Geçersiz teklif." }, { status: 400 });
  }

  if (teklifFiyatDegistiMi(teklif)) {
    const ilk = teklif.ilkFiyat ?? teklif.fiyat;
    return NextResponse.json(
      {
        error: `Bu çekici teklif fiyatını değiştirdi (${ilk} TL → ${teklif.fiyat} TL). Güvenlik nedeniyle bu teklifle seçim yapılamaz.`,
        fiyatDegisti: true,
        ilkFiyat: ilk,
        guncelFiyat: teklif.fiyat,
      },
      { status: 403 }
    );
  }

  teklif.durum = "kazandi";
  talep.kazananCekiciId = teklif.cekiciId;
  talep.kazananTeklifId = teklif.id;
  talep.durum = "kazanan_belli";
  talep.anlasmaDurumu = "bekliyor";

  await kaybedenTeklifleriIsaretle(talep, teklif.id);

  const cekici = await getCekiciById(teklif.cekiciId);
  if (cekici) {
    const baseUrl = smsBaseUrl(
      `${request.nextUrl.protocol}//${request.nextUrl.host}`
    );
    try {
      await notifyCekiciSecildi(cekici, talep, baseUrl);
    } catch (e) {
      console.error("[teklif-sec] çekici bildirim", e);
    }
  }

  return NextResponse.json({
    cekiciAd: cekici?.ad ?? teklif.cekiciAd,
    cekiciProfilFotoUrl:
      cekici?.profilFotoDurum === "onaylandi" && cekici.profilFotoUrl?.trim()
        ? cekici.profilFotoUrl.trim()
        : null,
    fiyat: teklif.fiyat,
    mesaj: "Çekici seçildi. Kısa süre içinde sizi arayacak.",
  });
}
