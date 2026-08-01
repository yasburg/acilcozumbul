import { NextResponse } from "next/server";
import { kayitCarkSpin } from "@/lib/kayit-cark-db";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { deneme?: unknown };
    const denemeHam = Number(body.deneme);
    const deneme = denemeHam === 2 ? 2 : 1;
    const sonuc = await kayitCarkSpin({ deneme });
    return NextResponse.json(sonuc);
  } catch (e) {
    console.error("[cark/spin]", e);
    return NextResponse.json(
      { error: "Çark çevrilemedi." },
      { status: 500 }
    );
  }
}
