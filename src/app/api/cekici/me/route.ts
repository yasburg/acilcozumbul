import { NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { ensureSeedData } from "@/lib/seed";
import { sehirKullanimAcikMiDb } from "@/lib/cekici-sehir-acilis-db";
import {
  cekiciKurulumIlerleme,
  cekiciProfilHazirMi,
} from "@/lib/cekici-profil-hazir";
import { cekiciToplamKredi } from "@/lib/kredi-bakiye";

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
    kredi: cekiciToplamKredi(cekici),
    abonelikKredi: cekici.abonelikKredi ?? 0,
    satinAlinanKredi: cekici.kredi,
    sehir: cekici.sehir,
    sehirKullanimAcik: await sehirKullanimAcikMiDb(cekici.sehir),
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
