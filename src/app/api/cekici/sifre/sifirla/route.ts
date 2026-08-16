import { NextRequest, NextResponse } from "next/server";
import {
  cekiciSifreOtpDogrula,
  cekiciSifreOtpTemizle,
} from "@/lib/cekici-sifre-otp";
import { cekiciSifreyiAuthaTasi } from "@/lib/cekici-auth";
import { getCekiciByTelefon } from "@/lib/db";
import { telefonGecerliMi, telefonNormalize } from "@/lib/telefon";
import { ensureSeedData } from "@/lib/seed";

export async function POST(request: NextRequest) {
  await ensureSeedData();
  const { telefon, kod, yeniSifre, yeniSifreTekrar } = await request.json();

  if (!telefonGecerliMi(String(telefon ?? ""))) {
    return NextResponse.json({ error: "Geçersiz telefon numarası." }, { status: 400 });
  }

  const sifre = String(yeniSifre ?? "").trim();
  const sifreTekrar = String(yeniSifreTekrar ?? "").trim();

  if (sifre.length < 6) {
    return NextResponse.json(
      { error: "Yeni şifre en az 6 karakter olmalıdır." },
      { status: 400 }
    );
  }

  if (sifre !== sifreTekrar) {
    return NextResponse.json({ error: "Şifreler eşleşmiyor." }, { status: 400 });
  }

  const tel = telefonNormalize(String(telefon));
  const cekici = await getCekiciByTelefon(tel);
  if (!cekici?.aktif) {
    return NextResponse.json({ error: "Üye bulunamadı." }, { status: 404 });
  }

  const dogrulama = await cekiciSifreOtpDogrula(telefon, String(kod ?? ""));
  if (!dogrulama.ok) {
    return NextResponse.json({ error: dogrulama.hata }, { status: 400 });
  }

  try {
    await cekiciSifreyiAuthaTasi(cekici, sifre);
  } catch (e) {
    const mesaj = e instanceof Error ? e.message : "Şifre güncellenemedi.";
    return NextResponse.json({ error: mesaj }, { status: 400 });
  }

  await cekiciSifreOtpTemizle(tel);

  return NextResponse.json({
    mesaj: "Şifreniz güncellendi. Giriş yapabilirsiniz.",
  });
}
