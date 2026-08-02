import { NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { faturaPdfErisimKontrol } from "@/lib/fatura-link";
import { getFaturaLinkById } from "@/lib/fatura-link-db";
import { faturaPdfIndir } from "@/lib/fatura-storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const cekici = await getCurrentCekici();
  const { id } = await params;

  const fatura = await getFaturaLinkById(id);
  const erisim = faturaPdfErisimKontrol({
    oturumCekiciId: cekici?.id ?? null,
    faturaCekiciId: fatura?.cekiciId,
  });

  if (!erisim.ok) {
    return NextResponse.json(
      { error: erisim.status === 401 ? "Giriş gerekli." : "Bulunamadı." },
      { status: erisim.status }
    );
  }

  const bytes = await faturaPdfIndir(fatura!.storagePath);
  if (!bytes) {
    return NextResponse.json(
      { error: "PDF bulunamadı." },
      { status: 404 }
    );
  }

  const filename = `${fatura!.belgeNo}.pdf`;
  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
