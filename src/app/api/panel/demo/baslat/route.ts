import { after } from "next/server";
import { NextRequest, NextResponse } from "next/server";
import {
  baslatDemoOturum,
  DEMO_COOKIE,
  demoModuAcikMi,
} from "@/lib/demo-oturum";
import { demoTakipGecikmeMs, demoTakipIsleIfDue } from "@/lib/demo-takip";
import { smsBaseUrl } from "@/lib/sms-base-url";

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
    const gecikmeMs = demoTakipGecikmeMs();
    const baseUrl = smsBaseUrl(
      `${request.nextUrl.protocol}//${request.nextUrl.host}`
    );

    after(() => {
      void (async () => {
        await new Promise((r) => setTimeout(r, gecikmeMs + 250));
        await demoTakipIsleIfDue({ cekiciId: oturum.cekiciId, baseUrl });
      })().catch((e) => console.error("[demo] takip after", e));
    });

    const res = NextResponse.json({
      id: oturum.id,
      cekiciId: oturum.cekiciId,
      kalanSn: oturum.kalanSn,
      anaTalepId: oturum.durum.anaTalepId,
      musteriLink: `/bekle/${oturum.durum.anaTalepId}?demo=${oturum.id}`,
      cekiciPanelLink: `/cekici/panel`,
      takipGecikmeSn: Math.round(gecikmeMs / 1000),
      mesaj: `Demo başlatıldı. Seçili çekici hesabıyla telefonda /cekici/panel açın — demo otomatik görünür. ~${Math.round(gecikmeMs / 1000)} sn sonra yalnızca bu çekiciye SMS + sesli mesajlı gerçek talep açılır.`,
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
