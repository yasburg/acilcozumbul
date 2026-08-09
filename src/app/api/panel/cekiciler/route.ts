import { NextResponse } from "next/server";
import { getCekiciler } from "@/lib/db";
import { cekiciPanelOzet } from "@/lib/panel";
import { ensureSeedData } from "@/lib/seed";
import { countTeklifSayilariByCekici } from "@/lib/teklif-db";

export async function GET() {
  await ensureSeedData();
  const [cekiciler, teklifMap] = await Promise.all([
    getCekiciler(),
    countTeklifSayilariByCekici().catch((e) => {
      console.error("[panel/cekiciler] teklif sayımı", e);
      return new Map<string, number>();
    }),
  ]);
  return NextResponse.json(
    cekiciler
      .map((c) => ({
        ...cekiciPanelOzet(c),
        teklifSayisi: teklifMap.get(c.id) ?? 0,
      }))
      .sort(
        (a, b) =>
          new Date(b.kayitTarihi).getTime() - new Date(a.kayitTarihi).getTime()
      )
  );
}
