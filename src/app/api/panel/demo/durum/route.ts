import { NextResponse } from "next/server";
import {
  DEMO_COOKIE,
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
    const res = NextResponse.json({ aktif: false });
    if (id) {
      res.cookies.set(DEMO_COOKIE, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
      });
    }
    return res;
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
