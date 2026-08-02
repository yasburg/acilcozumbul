import { NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { listeleFaturaLinkCekici } from "@/lib/fatura-link-db";
import { getKrediOdemeById } from "@/lib/kredi-odeme";

export async function GET() {
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const linkler = await listeleFaturaLinkCekici(cekici.id);
  const faturalar = await Promise.all(
    linkler.map(async (f) => {
      const odeme = f.krediOdemeId
        ? await getKrediOdemeById(f.krediOdemeId)
        : undefined;
      return {
        id: f.id,
        belgeNo: f.belgeNo,
        createdAt: f.createdAt,
        tutar: odeme?.tutar ?? null,
        paketTl: odeme?.paketTl ?? null,
        miktar: odeme?.miktar ?? null,
        odemeReferans: odeme?.odemeReferans ?? null,
      };
    })
  );

  return NextResponse.json({ faturalar });
}
