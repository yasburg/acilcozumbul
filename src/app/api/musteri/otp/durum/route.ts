import { NextResponse } from "next/server";
import { getDogrulanmisTelefon } from "@/lib/musteri-auth";

export async function GET() {
  const telefon = await getDogrulanmisTelefon();
  return NextResponse.json({ dogrulandi: !!telefon, telefon: telefon ?? undefined });
}
