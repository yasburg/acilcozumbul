import { NextRequest, NextResponse } from "next/server";
import {
  kaydetMusteriFunnelOlay,
  musteriFunnelOlayMi,
  type MusteriFunnelOlayMeta,
} from "@/lib/musteri-funnel-olay";
import { musteriFunnelMi } from "@/lib/musteri-funnel";

/** Public: müşteri anasayfa funnel olayları */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const funnel = String(body.funnel ?? "").toLowerCase();
  const olay = String(body.olay ?? "");
  if (!musteriFunnelMi(funnel) || !musteriFunnelOlayMi(olay)) {
    return NextResponse.json({ error: "Geçersiz olay." }, { status: 400 });
  }

  let meta: MusteriFunnelOlayMeta | null = null;
  if (body.meta && typeof body.meta === "object" && !Array.isArray(body.meta)) {
    const clean: MusteriFunnelOlayMeta = {};
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

  await kaydetMusteriFunnelOlay({
    funnel,
    olay,
    sessionId: typeof body.sessionId === "string" ? body.sessionId : null,
    telefon: typeof body.telefon === "string" ? body.telefon : null,
    talepId: typeof body.talepId === "string" ? body.talepId : null,
    meta,
  });
  return NextResponse.json({ ok: true });
}
