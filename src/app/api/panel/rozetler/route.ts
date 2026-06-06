import { NextResponse } from "next/server";
import { getCekiciler } from "@/lib/db";
import { rozetPanelVerisi } from "@/lib/rozet-panel";
import { ensureSeedData } from "@/lib/seed";

export async function GET() {
  await ensureSeedData();
  const cekiciler = await getCekiciler();
  return NextResponse.json(rozetPanelVerisi(cekiciler));
}
