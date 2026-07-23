import { NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { ensureSeedData } from "@/lib/seed";
import { sehirKullanimAcikMi } from "@/lib/cekici-sehir-acilis";
import {
  cekiciKurulumIlerleme,
  cekiciProfilHazirMi,
} from "@/lib/cekici-profil-hazir";

export async function GET() {
  await ensureSeedData();
  const cekici = await getCurrentCekici();

  if (!cekici) {
    return NextResponse.json({ error: "Giriş yapılmamış." }, { status: 401 });
  }

  const profilHazir = cekiciProfilHazirMi(cekici);
  const ilerleme = cekiciKurulumIlerleme(cekici);

  return NextResponse.json({
    id: cekici.id,
    ad: cekici.ad,
    telefon: cekici.telefon,
    kredi: cekici.kredi,
    sehir: cekici.sehir,
    sehirKullanimAcik: sehirKullanimAcikMi(cekici.sehir),
    hizmetModu: cekici.hizmetModu ?? "il_ilce",
    menzilKm: cekici.menzilKm ?? 30,
    faturaEposta: cekici.faturaEposta ?? null,
    faturaEpostaDogrulandi: Boolean(cekici.faturaEpostaDogrulandi),
    belgeDurum: cekici.belgeDurum ?? "yok",
    rozetAktif: Boolean(cekici.rozetAktif),
    profilHazir,
    kurulumTamam: cekici.kurulumTamam !== false,
    kurulumYuzde: ilerleme.yuzde,
  });
}
