import { NextResponse } from "next/server";
import { getKrediOdemeById } from "@/lib/kredi-odeme";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const kayit = await getKrediOdemeById(id);
  if (!kayit) {
    return NextResponse.json({ error: "Kayıt bulunamadı." }, { status: 404 });
  }
  return NextResponse.json(kayit);
}
