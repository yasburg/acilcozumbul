import { NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { getTalepler } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import {
  acikTalepMi,
  baskaCekiciAktifMi,
  cekiciSatınAlabilirMi,
  cekiciTercihEdilmediMi,
  isBugun,
  talepBolge,
  talepSorunOzet,
} from "@/lib/talep-utils";
import type { ListeDurumu, Talep, TalepOzet } from "@/lib/types";

function listeDurumuBelirle(talep: Talep, cekiciId: string): ListeDurumu {
  if (talep.satinAlanCekiciId === cekiciId) return "benim";
  if (talep.durum === "anlaşıldı") return "anlasildi";
  if (cekiciTercihEdilmediMi(talep, cekiciId)) return "tercih_edilmedi";
  if (baskaCekiciAktifMi(talep, cekiciId)) return "baskasi_aldi";
  if (cekiciSatınAlabilirMi(talep, cekiciId)) return "acik";
  if (acikTalepMi(talep)) return "acik";
  return "baskasi_aldi";
}

function toOzet(talep: Talep, cekiciId: string): TalepOzet {
  const benimMusterim = talep.satinAlanCekiciId === cekiciId;
  const durum = listeDurumuBelirle(talep, cekiciId);
  return {
    id: talep.id,
    ad: talep.ad,
    soyad: talep.soyad,
    bolge: talepBolge(talep),
    sorunOzet: talepSorunOzet(talep.sorun),
    durum: talep.durum,
    olusturulma: talep.olusturulma,
    satinAlindi: !!talep.satinAlanCekiciId,
    benimMusterim,
    anlasmaDurumu: talep.anlasmaDurumu,
    telefon: benimMusterim ? talep.telefon : undefined,
    listeDurumu: durum,
  };
}

export async function GET() {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const talepler = await getTalepler();
  const bugun = talepler.filter((t) => isBugun(t.olusturulma));

  const ilgili = bugun.filter(
    (t) =>
      t.bildirilenCekiciIds.includes(cekici.id) ||
      t.satinAlanCekiciId === cekici.id ||
      t.satinAlmaGecmisi?.some((g) => g.cekiciId === cekici.id)
  );

  const tumOzet = ilgili.map((t) => toOzet(t, cekici.id));

  const bekleyen = tumOzet.filter((t) => t.listeDurumu === "acik");

  const baskasiAldi = tumOzet.filter((t) => t.listeDurumu === "baskasi_aldi");

  const tercihEdilmedi = tumOzet.filter(
    (t) => t.listeDurumu === "tercih_edilmedi"
  );

  const satinAlinanlar = tumOzet.filter((t) => t.listeDurumu === "benim");

  const gecmisSatinAlimlar = talepler
    .filter((t) =>
      t.satinAlmaGecmisi?.some((g) => g.cekiciId === cekici.id)
    )
    .map((t) => {
      const kayit = t.satinAlmaGecmisi!.find((g) => g.cekiciId === cekici.id)!;
      return {
        ...toOzet(t, cekici.id),
        satinAlmaTarihi: kayit.tarih,
        tercihEdilmedi: kayit.tercihEdilmedi,
        aktif: t.satinAlanCekiciId === cekici.id,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.satinAlmaTarihi).getTime() -
        new Date(a.satinAlmaTarihi).getTime()
    );

  const bugunTumu = [...tumOzet].sort(
    (a, b) =>
      new Date(b.olusturulma).getTime() - new Date(a.olusturulma).getTime()
  );

  return NextResponse.json({
    bekleyen,
    baskasiAldi,
    tercihEdilmedi,
    satinAlinanlar,
    bugunTumu,
    gecmisSatinAlimlar,
  });
}
