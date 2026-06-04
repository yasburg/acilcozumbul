import { NextRequest, NextResponse } from "next/server";
import { funnelOlayKaydet, type FunnelOlay } from "@/lib/funnel";
import { ipHash, istekIp } from "@/lib/request-ip";

const IZINLI: FunnelOlay[] = [
  "form_basla",
  "otp_gonder",
  "otp_dogrulandi",
  "talep_olustur",
];

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const olay = body.olay as FunnelOlay;
  if (!IZINLI.includes(olay)) {
    return NextResponse.json({ error: "Geçersiz olay." }, { status: 400 });
  }

  const ip = istekIp(request);
  await funnelOlayKaydet({
    olay,
    telefon: typeof body.telefon === "string" ? body.telefon : null,
    ipHash: ipHash(ip),
    talepId: typeof body.talepId === "string" ? body.talepId : null,
  });

  return NextResponse.json({ ok: true });
}
