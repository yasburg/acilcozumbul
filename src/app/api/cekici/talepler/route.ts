import { NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { getTalepler } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import {
  cekiciHaricMi,
  cekiciTeklifVerdiMi,
  ihaleAcikMi,
} from "@/lib/ihale";
import {
  isBugun,
  talepBolge,
  talepSorunOzet,
} from "@/lib/talep-utils";
import type { ListeDurumu, Talep, TalepOzet } from "@/lib/types";

function listeDurumuBelirle(talep: Talep, cekiciId: string): ListeDurumu {
  if (talep.kazananCekiciId === cekiciId) return "kazandim";
  if (talep.durum === "anlaşıldı" && talep.kazananCekiciId === cekiciId)
    return "anlasildi";
  if (cekiciHaricMi(talep, cekiciId)) return "tercih_edilmedi";
  if (talep.kazananCekiciId && talep.kazananCekiciId !== cekiciId) {
    return cekiciTeklifVerdiMi(talep, cekiciId) ? "kaybettim" : "acik";
  }
  if (cekiciTeklifVerdiMi(talep, cekiciId)) return "teklif_verdim";
  if (ihaleAcikMi(talep) && !cekiciHaricMi(talep, cekiciId)) return "acik";
  return "kaybettim";
}

function toOzet(talep: Talep, cekiciId: string): TalepOzet {
  const kazandim = talep.kazananCekiciId === cekiciId;
  const durum = listeDurumuBelirle(talep, cekiciId);
  const aktifTeklifler = talep.teklifler?.filter((t) => t.durum === "aktif") ?? [];
  const benimTeklif = talep.teklifler?.find((t) => t.cekiciId === cekiciId);

  return {
    id: talep.id,
    ad: talep.ad,
    soyad: talep.soyad,
    bolge: talepBolge(talep),
    sorunOzet: talepSorunOzet(talep.sorun),
    durum: talep.durum,
    olusturulma: talep.olusturulma,
    teklifSayisi: aktifTeklifler.length,
    enDusukTeklif: aktifTeklifler.length
      ? Math.min(...aktifTeklifler.map((t) => t.fiyat))
      : undefined,
    benimTeklifim: !!benimTeklif,
    kazandim,
    telefon: kazandim ? talep.telefon : undefined,
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
      t.kazananCekiciId === cekici.id ||
      t.teklifler?.some((te) => te.cekiciId === cekici.id)
  );

  const tumOzet = ilgili.map((t) => toOzet(t, cekici.id));

  const bekleyen = tumOzet.filter((t) => t.listeDurumu === "acik");
  const teklifVerdigim = tumOzet.filter((t) => t.listeDurumu === "teklif_verdim");
  const kazandiklarim = tumOzet.filter((t) => t.listeDurumu === "kazandim");
  const kaybettiklerim = tumOzet.filter(
    (t) => t.listeDurumu === "kaybettim" && t.benimTeklifim
  );
  const tercihEdilmedi = tumOzet.filter((t) => t.listeDurumu === "tercih_edilmedi");

  const bugunTumu = [...tumOzet].sort(
    (a, b) =>
      new Date(b.olusturulma).getTime() - new Date(a.olusturulma).getTime()
  );

  return NextResponse.json({
    bekleyen,
    teklifVerdigim,
    kazandiklarim,
    kaybettiklerim,
    tercihEdilmedi,
    bugunTumu,
    // Geriye uyumluluk
    satinAlinanlar: kazandiklarim,
    baskasiAldi: kaybettiklerim,
  });
}
