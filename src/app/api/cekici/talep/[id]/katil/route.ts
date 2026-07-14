import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { getTalepById, updateCekici, updateTalep } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import {
  cekiciAcikTalepUygunMu,
  cekiciBildirimKrediTutari,
  cekiciTalebeBildirildiMi,
  cekiciYeterliBildirimKredisi,
} from "@/lib/ihale";
import { smsBaseUrl } from "@/lib/sms-base-url";
import { cekiciTalepSmsMetni } from "@/lib/sms";
import { sendSms } from "@/lib/sms-provider";
import { demoTalepGetir, demoKatil, isDemoTalepId } from "@/lib/demo-oturum";
import { demoKatilMesaji } from "@/lib/demo-responses";

/** Kredi ile ihaleye katıl (gizli talebi aç; premium ise SMS de gider) */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const { id } = await params;
  const tutar = cekiciBildirimKrediTutari(cekici);

  if (isDemoTalepId(id)) {
    const demoCtx = await demoTalepGetir(id, request, cekici.id);
    if (!demoCtx) {
      return NextResponse.json(
        { error: "Demo oturumu bulunamadı.", demoHatasi: true },
        { status: 404 }
      );
    }
    const talep = demoCtx.talep;
    if (cekiciTalebeBildirildiMi(talep, cekici.id)) {
      return NextResponse.json({ success: true, zatenAcik: true, demoModu: true });
    }
    await demoKatil(demoCtx.oturum, id, cekici.id);
    return NextResponse.json(demoKatilMesaji(cekici));
  }

  const talep = await getTalepById(id);
  if (!talep) {
    return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  }

  if (!cekiciAcikTalepUygunMu(talep, cekici)) {
    return NextResponse.json(
      { error: "Bu talebe katılım açık değil." },
      { status: 409 }
    );
  }

  if (cekiciTalebeBildirildiMi(talep, cekici.id)) {
    return NextResponse.json({ success: true, zatenAcik: true });
  }

  if (!cekiciYeterliBildirimKredisi(cekici.kredi, tutar)) {
    return NextResponse.json(
      {
        error: `İhaleye katılmak için en az ${tutar} kredi gerekir.`,
        yetersizKredi: true,
        mevcutKredi: cekici.kredi,
        gerekenKredi: tutar,
      },
      { status: 402 }
    );
  }

  cekici.kredi -= tutar;
  await updateCekici(cekici);

  talep.bildirilenCekiciIds = [
    ...new Set([...(talep.bildirilenCekiciIds ?? []), cekici.id]),
  ];
  await updateTalep(talep);

  if (cekici.premiumSmsAktif) {
    const baseUrl = smsBaseUrl(
      process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.acilcozumbul.com"
    );
    const { mesaj, link } = cekiciTalepSmsMetni(talep, cekici, baseUrl);
    await sendSms(cekici.telefon, mesaj, {
      aliciTipi: "cekici",
      cekiciId: cekici.id,
      talepId: talep.id,
      link,
      krediDus: false,
      kanal: "otp",
    });
  }

  return NextResponse.json({
    success: true,
    kredi: cekici.kredi,
    harcananKredi: tutar,
    premiumSms: Boolean(cekici.premiumSmsAktif),
    mesaj: cekici.premiumSmsAktif
      ? "İhaleye katıldınız. Anlık SMS de gönderildi."
      : "İhaleye katıldınız. Teklif verebilirsiniz.",
  });
}
