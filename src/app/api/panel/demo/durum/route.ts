import { NextResponse } from "next/server";
import {
  demoCookieOturumId,
  demoModuAcikMi,
  getAktifDemoOturum,
} from "@/lib/demo-oturum";
import { getCekiciById } from "@/lib/db";

export async function GET() {
  if (!demoModuAcikMi()) {
    return NextResponse.json({ aktif: false, kapali: true });
  }

  const id = await demoCookieOturumId();
  const oturum = await getAktifDemoOturum(id);
  if (!oturum) {
    return NextResponse.json({ aktif: false });
  }

  const cekici = await getCekiciById(oturum.cekiciId);

  return NextResponse.json({
    aktif: true,
    id: oturum.id,
    cekiciId: oturum.cekiciId,
    cekiciAd: cekici?.ad,
    kalanSn: oturum.kalanSn,
    anaTalepId: oturum.durum.anaTalepId,
    musteriLink: `/bekle/${oturum.durum.anaTalepId}`,
    sms: oturum.durum.sms.slice(0, 10),
    talepSayisi: oturum.durum.talepler.length,
  });
}
