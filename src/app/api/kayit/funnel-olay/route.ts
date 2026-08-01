import { NextRequest, NextResponse } from "next/server";
import {
  kaydetKayitFunnelOlay,
  kayitFunnelOlayMi,
  kayitFunnelOlaySunucuOnlyMi,
  type KayitFunnelOlayMeta,
} from "@/lib/kayit-funnel-olay";
import { kayitFunnelMi } from "@/lib/kayit-funnel";

/** Public: funnel sayfa olayları (görüntülenme, focus, buton, otp_gonder) */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const funnel = String(body.funnel ?? "").toLowerCase();
  const olay = String(body.olay ?? "");
  if (!kayitFunnelMi(funnel) || !kayitFunnelOlayMi(olay)) {
    return NextResponse.json({ error: "Geçersiz olay." }, { status: 400 });
  }
  if (kayitFunnelOlaySunucuOnlyMi(olay)) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  let meta: KayitFunnelOlayMeta | null = null;
  if (body.meta && typeof body.meta === "object" && !Array.isArray(body.meta)) {
    const clean: KayitFunnelOlayMeta = {};
    for (const [k, v] of Object.entries(body.meta as Record<string, unknown>)) {
      if (typeof k !== "string" || k.length > 40) continue;
      if (
        typeof v === "string" ||
        typeof v === "number" ||
        typeof v === "boolean"
      ) {
        if (typeof v === "string" && v.length > 80) continue;
        clean[k] = v;
      }
    }
    if (Object.keys(clean).length) meta = clean;
  }

  await kaydetKayitFunnelOlay({
    funnel,
    olay,
    sessionId: typeof body.sessionId === "string" ? body.sessionId : null,
    cekiciId: typeof body.cekiciId === "string" ? body.cekiciId : null,
    meta,
  });
  return NextResponse.json({ ok: true });
}
