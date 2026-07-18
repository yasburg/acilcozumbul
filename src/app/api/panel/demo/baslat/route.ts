import { NextRequest, NextResponse } from "next/server";
import {
  baslatDemoOturum,
  DEMO_COOKIE,
  demoModuAcikMi,
} from "@/lib/demo-oturum";

export async function POST(request: NextRequest) {
  if (!demoModuAcikMi()) {
    return NextResponse.json({ error: "Demo modu kapalı." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const cekiciId = String(body.cekiciId ?? "").trim();
  const sureDk = Number(body.sureDk ?? 5);

  if (!cekiciId) {
    return NextResponse.json({ error: "cekiciId gerekli." }, { status: 400 });
  }

  try {
    const oturum = await baslatDemoOturum({ cekiciId, sureDk });
    const res = NextResponse.json({
      id: oturum.id,
      cekiciId: oturum.cekiciId,
      kalanSn: oturum.kalanSn,
      anaTalepId: oturum.durum.anaTalepId,
      musteriLink: `/bekle/${oturum.durum.anaTalepId}?demo=${oturum.id}`,
      mesaj:
        "Demo oturumu başlatıldı. Müşteri linkini telefonda da açabilirsiniz (?demo= parametresi çerezi bağlar).",
    });

    res.cookies.set(DEMO_COOKIE, oturum.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: sureDk * 60,
      path: "/",
    });

    return res;
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Başlatılamadı." },
      { status: 400 }
    );
  }
}
