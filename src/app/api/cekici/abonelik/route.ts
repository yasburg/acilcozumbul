import { NextResponse } from "next/server";
import { getAktifAbonelik } from "@/lib/abonelik-db";
import { getCurrentCekici } from "@/lib/auth";
import { ensureSeedData } from "@/lib/seed";

export async function GET() {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const abonelik = await getAktifAbonelik(cekici.id);
  return NextResponse.json({ abonelik: abonelik ?? null });
}
