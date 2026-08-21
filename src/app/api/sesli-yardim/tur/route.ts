import { NextRequest, NextResponse } from "next/server";
import { sesliDiyalogTuru } from "@/lib/fish-audio-diyalog";
import type { SesliKonum, SesliTalepGirdi } from "@/lib/fish-audio-talep";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    text?: string;
    girdi?: SesliTalepGirdi;
    konum?: SesliKonum | null;
  };
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "Metin gerekli." }, { status: 400 });
  }
  const sonuc = sesliDiyalogTuru({
    metin: text,
    girdi: body.girdi ?? {},
    konum: body.konum ?? null,
  });
  return NextResponse.json({ ...sonuc, maliyetUsd: 0 });
}
