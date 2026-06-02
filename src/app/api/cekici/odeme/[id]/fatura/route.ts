import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { cekiciEpostaDogrulandiMi } from "@/lib/cekici-email-otp";
import { faturaAlanlariniDogrula } from "@/lib/odeme-fatura";
import { guncelleBekleyenOdemeFatura } from "@/lib/odeme";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const faturaSonuc = faturaAlanlariniDogrula(body);

  if (!faturaSonuc.ok) {
    return NextResponse.json({ error: faturaSonuc.hata }, { status: 400 });
  }

  const dogrulandi = await cekiciEpostaDogrulandiMi(
    cekici.id,
    faturaSonuc.data.faturaEposta
  );
  if (!dogrulandi) {
    return NextResponse.json(
      { error: "Önce fatura e-postasını doğrulayın." },
      { status: 403 }
    );
  }

  const guncel = await guncelleBekleyenOdemeFatura(
    id,
    cekici.id,
    faturaSonuc.data
  );
  if (!guncel) {
    return NextResponse.json({ error: "Ödeme bulunamadı." }, { status: 404 });
  }

  return NextResponse.json({ success: true, fatura: faturaSonuc.data });
}
