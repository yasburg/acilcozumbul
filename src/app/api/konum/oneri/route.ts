import { NextRequest, NextResponse } from "next/server";
import { hedefKonumOnerileri } from "@/lib/konum-oneri";

export async function GET(request: NextRequest) {
  const lat = Number(request.nextUrl.searchParams.get("lat"));
  const lng = Number(request.nextUrl.searchParams.get("lng"));

  if (!lat || !lng) {
    return NextResponse.json({ error: "lat ve lng gerekli." }, { status: 400 });
  }

  const oneriler = await hedefKonumOnerileri(lat, lng);
  return NextResponse.json({ oneriler });
}
