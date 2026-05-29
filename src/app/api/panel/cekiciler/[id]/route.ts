import { NextResponse } from "next/server";
import { getCekiciById } from "@/lib/db";
import { cekiciPanelOzet } from "@/lib/panel";
import { ensureSeedData } from "@/lib/seed";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSeedData();
  const { id } = await params;
  const cekici = await getCekiciById(id);
  if (!cekici) {
    return NextResponse.json({ error: "Çekici bulunamadı." }, { status: 404 });
  }
  return NextResponse.json({
    ...cekiciPanelOzet(cekici),
    token: cekici.token,
  });
}
