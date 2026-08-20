import { NextResponse } from "next/server";
import { getFaturaLinkById } from "@/lib/fatura-link-db";
import { faturaPdfIndir } from "@/lib/fatura-storage";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Panel: kayıtlı fatura PDF indir */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
      return NextResponse.json({ error: "Geçersiz fatura." }, { status: 400 });
    }

    const fatura = await getFaturaLinkById(id);
    if (!fatura) {
      return NextResponse.json({ error: "Fatura bulunamadı." }, { status: 404 });
    }

    const bytes = await faturaPdfIndir(fatura.storagePath);
    if (!bytes || bytes.length < 5) {
      return NextResponse.json({ error: "PDF bulunamadı." }, { status: 404 });
    }

    const filename = `${fatura.belgeNo.replace(/[^\w.-]+/g, "_")}.pdf`;
    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(bytes.length),
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch (e) {
    console.error("[panel/faturalar/pdf]", e);
    return NextResponse.json(
      { error: "PDF indirilemedi." },
      { status: 500 }
    );
  }
}
