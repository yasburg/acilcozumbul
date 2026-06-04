import { NextResponse } from "next/server";
import { countCekiciler } from "@/lib/db";
import { kayitKontenjanHesapla } from "@/lib/cekici-kayit-kontenjan";
import { ensureSeedData } from "@/lib/seed";

export async function GET() {
  await ensureSeedData();
  const gercekKayit = await countCekiciler();
  const durum = kayitKontenjanHesapla(gercekKayit);
  return NextResponse.json(durum);
}
