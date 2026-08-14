import { NextResponse } from "next/server";
import { getCekiciler } from "@/lib/db";
import { profilFotoPanelVerisiYukle } from "@/lib/profil-foto-panel";
import { ensureSeedData } from "@/lib/seed";

export async function GET() {
  await ensureSeedData();
  const cekiciler = await getCekiciler();
  return NextResponse.json(await profilFotoPanelVerisiYukle(cekiciler));
}
