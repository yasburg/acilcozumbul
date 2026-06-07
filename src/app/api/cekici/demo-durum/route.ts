import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { demoOturumCekiciIcin, demoModuAcikMi } from "@/lib/demo-oturum";

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

  return NextResponse.json({
    aktif: true,
    kalanSn: oturum.kalanSn,
    anaTalepId: oturum.durum.anaTalepId,
  });
}
