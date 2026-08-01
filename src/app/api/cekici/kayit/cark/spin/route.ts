import { NextResponse } from "next/server";
import { kayitCarkSpin } from "@/lib/kayit-cark-db";

export async function POST() {
  try {
    const sonuc = await kayitCarkSpin();
    return NextResponse.json(sonuc);
  } catch (e) {
    console.error("[cark/spin]", e);
    return NextResponse.json(
      { error: "Çark çevrilemedi." },
      { status: 500 }
    );
  }
}
