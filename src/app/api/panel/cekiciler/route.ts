import { NextResponse } from "next/server";
import { getCekiciler } from "@/lib/db";
import { cekiciPanelOzet } from "@/lib/panel";
import { ensureSeedData } from "@/lib/seed";

export async function GET() {
  await ensureSeedData();
  const cekiciler = await getCekiciler();
  return NextResponse.json(
    cekiciler
      .map(cekiciPanelOzet)
      .sort(
        (a, b) =>
          new Date(b.kayitTarihi).getTime() - new Date(a.kayitTarihi).getTime()
      )
  );
}
