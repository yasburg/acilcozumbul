import { NextRequest, NextResponse } from "next/server";
import { getTalepById, updateTalep } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import { isDemoTalepId } from "@/lib/demo-oturum";
import { isSimulasyonTalep } from "@/lib/simulasyon-ihale-db";
import { guvenlikOlayiKaydet, talepFraudKontrol } from "@/lib/talep-fraud";
import { ipHash, istekIp } from "@/lib/request-ip";
import { notifyMusteri } from "@/lib/sms";
import { smsBaseUrl } from "@/lib/sms-base-url";
import {
  telefonDogrulamaHatasi,
  telefonGecerliMi,
  telefonMaskele,
  telefonNormalize,
} from "@/lib/telefon";
import { talepIletisimTamMi } from "@/lib/talep-iletisim";

const GUNCELLENEBILIR: ReadonlySet<string> = new Set([
  "ihalede",
  "yeniden_ihalede",
]);

/**
 * Teklif seçimi öncesi müşteri ad/soyad/telefon yazar.
 * OTP bu telefondan sonra gönderilir.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSeedData();
  const { id } = await params;

  if (isDemoTalepId(id)) {
    return NextResponse.json({
      ok: true,
      demoModu: true,
      telefonMaskeli: "05XX *** ** XX",
    });
  }

  const body = await request.json().catch(() => ({}));
  const ad = typeof body.ad === "string" ? body.ad.trim() : "";
  const soyadHam = typeof body.soyad === "string" ? body.soyad.trim() : "";
  const soyad = soyadHam || "-";
  const telefonHam = typeof body.telefon === "string" ? body.telefon.trim() : "";

  if (!ad) {
    return NextResponse.json({ error: "İsminizi girin." }, { status: 400 });
  }
  const telHata = telefonDogrulamaHatasi(telefonHam);
  if (telHata) {
    return NextResponse.json({ error: telHata }, { status: 400 });
  }

  const talep = await getTalepById(id);
  if (!talep) {
    return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  }

  if (await isSimulasyonTalep(id)) {
    return NextResponse.json(
      { error: "Bu talep için işlem yapılamıyor." },
      { status: 409 }
    );
  }

  if (talep.kazananCekiciId) {
    return NextResponse.json(
      { error: "Çekici seçildikten sonra iletişim değiştirilemez." },
      { status: 409 }
    );
  }

  if (!GUNCELLENEBILIR.has(talep.durum)) {
    return NextResponse.json(
      { error: "Bu talep durumunda iletişim güncellenemez." },
      { status: 409 }
    );
  }

  const telNorm = telefonNormalize(telefonHam);
  const oncekiTam = talepIletisimTamMi(talep);
  const oncekiTel = telefonGecerliMi(talep.telefon)
    ? telefonNormalize(talep.telefon)
    : "";

  /* Aynı numara zaten kayıtlıysa sadece adı güncelle */
  if (oncekiTam && oncekiTel === telNorm) {
    talep.ad = ad;
    talep.soyad = soyad;
    await updateTalep(talep);
    return NextResponse.json({
      ok: true,
      telefon: telNorm,
      telefonMaskeli: telefonMaskele(telNorm),
    });
  }

  const ip = istekIp(request);
  const hash = ipHash(ip);
  const fraud = await talepFraudKontrol(telNorm, hash);
  if (!fraud.ok) {
    return NextResponse.json({ error: fraud.hata }, { status: 429 });
  }

  const oncekiBos = !oncekiTel;
  talep.ad = ad;
  talep.soyad = soyad;
  talep.telefon = telNorm;
  await updateTalep(talep);

  await guvenlikOlayiKaydet({
    anahtar: hash ? `ip:${hash}` : `tel:${telNorm}`,
    olayTipi: "talep_olustur",
    ipHash: hash,
    telefon: telNorm,
  });

  if (oncekiBos) {
    const baseUrl = smsBaseUrl(
      `${request.nextUrl.protocol}//${request.nextUrl.host}`
    );
    try {
      await notifyMusteri(talep, "talep_alindi", baseUrl);
    } catch (e) {
      console.error("[iletisim] talep_alindi sms", e);
    }
  }

  return NextResponse.json({
    ok: true,
    telefon: telNorm,
    telefonMaskeli: telefonMaskele(telNorm),
  });
}
