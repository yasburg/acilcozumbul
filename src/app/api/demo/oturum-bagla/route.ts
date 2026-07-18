import { NextRequest, NextResponse } from "next/server";
import {
  DEMO_COOKIE,
  demoModuAcikMi,
  getAktifDemoOturum,
} from "@/lib/demo-oturum";

/** Mobil / başka cihaz: ?demo=oturumId ile çerezi bağla */
export async function POST(request: NextRequest) {
  if (!demoModuAcikMi()) {
    return NextResponse.json({ error: "Demo modu kapalı." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const id = String(body.id ?? "").trim();
  if (!id) {
    return NextResponse.json({ error: "Demo oturum id gerekli." }, { status: 400 });
  }

  const oturum = await getAktifDemoOturum(id);
  if (!oturum) {
    return NextResponse.json(
      { error: "Demo oturumu bulunamadı veya süresi dolmuş." },
      { status: 404 }
    );
  }

  const res = NextResponse.json({
    ok: true,
    id: oturum.id,
    kalanSn: oturum.kalanSn,
    anaTalepId: oturum.durum.anaTalepId,
  });

  res.cookies.set(DEMO_COOKIE, oturum.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: Math.max(60, oturum.kalanSn),
    path: "/",
  });

  return res;
}
