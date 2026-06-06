import { NextResponse } from "next/server";
import { getCekiciById } from "@/lib/db";
import { silCekiciCascade } from "@/lib/cekici-sil";
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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await silCekiciCascade(id);
    return NextResponse.json({ mesaj: "Hizmet veren ve ilişkili kayıtlar silindi." });
  } catch (e) {
    const mesaj = e instanceof Error ? e.message : "Silinemedi.";
    return NextResponse.json({ error: mesaj }, { status: 400 });
  }
}
