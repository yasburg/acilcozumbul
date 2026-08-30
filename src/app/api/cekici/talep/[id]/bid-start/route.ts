import { NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { getTalepById } from "@/lib/db";
import { dakikaYasi, marketplaceOlayKaydet } from "@/lib/marketplace-events";

/** Teklif alanına ilk odaklanma: client analytics iznine bağımlı olmayan funnel olayı. */
export async function POST(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const cekici = await getCurrentCekici();
  if (!cekici) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  const { id } = await ctx.params;
  const talep = await getTalepById(id);
  if (!talep) return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  await marketplaceOlayKaydet({
    eventType: "driver_bid_started", talepId: id, cekiciId: cekici.id,
    eventKey: `bid-started:${id}:${cekici.id}`,
    properties: { request_age_min: dakikaYasi(talep.olusturulma), bid_count: talep.teklifler.length },
  });
  return NextResponse.json({ ok: true });
}
