import { NextResponse } from "next/server";
import { getTumDegerlendirmeler } from "@/lib/memnuniyet";

export async function GET() {
  const liste = await getTumDegerlendirmeler();
  const ortalama =
    liste.length > 0
      ? Math.round(
          (liste.reduce((s, d) => s + d.puan, 0) / liste.length) * 10
        ) / 10
      : null;

  return NextResponse.json({
    liste,
    ozet: {
      toplam: liste.length,
      ortalama,
    },
  });
}
