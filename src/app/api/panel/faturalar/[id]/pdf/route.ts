import { NextResponse } from "next/server";
import { getFaturaLinkById } from "@/lib/fatura-link-db";
import { faturaPdfIndir } from "@/lib/fatura-storage";

/** Panel: kayıtlı fatura PDF indir */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const fatura = await getFaturaLinkById(id);
  if (!fatura) {
    return NextResponse.json({ error: "Fatura bulunamadı." }, { status: 404 });
  }

  const bytes = await faturaPdfIndir(fatura.storagePath);
  if (!bytes) {
    return NextResponse.json({ error: "PDF bulunamadı." }, { status: 404 });
  }

  const filename = `${fatura.belgeNo}.pdf`;
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
