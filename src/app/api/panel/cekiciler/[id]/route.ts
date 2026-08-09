import { NextResponse } from "next/server";
import { getCekiciById } from "@/lib/db";
import { silCekiciCascade } from "@/lib/cekici-sil";
import { cekiciPanelOzet } from "@/lib/panel";
import { ensureSeedData } from "@/lib/seed";
import { countTekliflerByCekici } from "@/lib/teklif-db";

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
  const teklif = await countTekliflerByCekici(id).catch(() => ({
    toplam: 0,
    kazanilan: 0,
    fiyatDegistiren: 0,
  }));
  return NextResponse.json({
    ...cekiciPanelOzet(cekici),
    teklifSayisi: teklif.toplam,
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
