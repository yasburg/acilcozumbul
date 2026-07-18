import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import {
  demoCookieYanitaYaz,
  demoModuAcikMi,
  demoOturumCekiciIcin,
} from "@/lib/demo-oturum";

export async function GET(request: NextRequest) {
  if (!demoModuAcikMi()) {
    return NextResponse.json({ aktif: false });
  }

  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ aktif: false });
  }

  const oturum = await demoOturumCekiciIcin(cekici.id, request);
  if (!oturum) {
    return NextResponse.json({ aktif: false });
  }

  const res = NextResponse.json({
    aktif: true,
    kalanSn: oturum.kalanSn,
    anaTalepId: oturum.durum.anaTalepId,
    oturumId: oturum.id,
  });
  demoCookieYanitaYaz(res, oturum);
  return res;
}
