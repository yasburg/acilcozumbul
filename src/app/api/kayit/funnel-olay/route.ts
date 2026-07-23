import { NextRequest, NextResponse } from "next/server";
import { kaydetKayitFunnelOlay, kayitFunnelOlayMi } from "@/lib/kayit-funnel-olay";
import { kayitFunnelMi } from "@/lib/kayit-funnel";

/** Public: funnel sayfa olayları (görüntülenme, focus, otp_gonder) */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const funnel = String(body.funnel ?? "").toLowerCase();
  const olay = String(body.olay ?? "");
  if (!kayitFunnelMi(funnel) || !kayitFunnelOlayMi(olay)) {
    return NextResponse.json({ error: "Geçersiz olay." }, { status: 400 });
  }
  /* Hesap / kurulum olayları sunucu tarafında yazılır */
  if (
    olay === "hesap" ||
    olay === "otp_ok" ||
    olay.startsWith("kurulum_") ||
    olay === "panel_hazir"
  ) {
    return NextResponse.json({ ok: true, skipped: true });
  }
  await kaydetKayitFunnelOlay({
    funnel,
    olay,
    sessionId: typeof body.sessionId === "string" ? body.sessionId : null,
    cekiciId: typeof body.cekiciId === "string" ? body.cekiciId : null,
  });
  return NextResponse.json({ ok: true });
}
