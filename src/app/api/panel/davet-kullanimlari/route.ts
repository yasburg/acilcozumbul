import { NextResponse } from "next/server";
import { getDavetPanelVerisi } from "@/lib/davet-panel";

export async function GET() {
  const veri = await getDavetPanelVerisi();
  return NextResponse.json(veri);
}
