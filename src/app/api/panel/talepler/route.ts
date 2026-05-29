import { NextResponse } from "next/server";
import { getTalepler } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";

export async function GET() {
  await ensureSeedData();
  const talepler = await getTalepler();
  return NextResponse.json(
    talepler.sort(
      (a, b) =>
        new Date(b.olusturulma).getTime() - new Date(a.olusturulma).getTime()
    )
  );
}
