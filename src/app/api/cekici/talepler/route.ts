import { NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { getTalepler } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import { cekiciTalepBolgesineUygunMu } from "@/lib/cekici-bolge";
import { cekiciTalepSorununaUygunMu } from "@/lib/cekici-sorun";
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
import type { Cekici, ListeDurumu, Talep, TalepOzet } from "@/lib/types";

function listeDurumuBelirle(talep: Talep, cekici: Cekici): ListeDurumu {
  const cekiciId = cekici.id;
  if (talep.kazananCekiciId === cekiciId) return "kazandim";
  if (talep.durum === "anlaşıldı" && talep.kazananCekiciId === cekiciId)
    return "anlasildi";
  if (cekiciHaricMi(talep, cekiciId)) return "tercih_edilmedi";
  if (talep.kazananCekiciId && talep.kazananCekiciId !== cekiciId) {
    return "kaybettim";
  }
  if (cekiciTeklifVerdiMi(talep, cekiciId)) return "teklif_verdim";
  if (
    ihaleAcikMi(talep) &&
    !cekiciHaricMi(talep, cekiciId) &&
    cekiciTalepBolgesineUygunMu(cekici, talep) &&
    cekiciTalepSorununaUygunMu(cekici, talep)
  ) {
    return "acik";
  }
  return "kaybettim";
}

function toOzet(talep: Talep, cekici: Cekici): TalepOzet {
  const cekiciId = cekici.id;
  const kazandim = talep.kazananCekiciId === cekiciId;
  const durum = listeDurumuBelirle(talep, cekici);
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

  const ilgili = bugun.filter((t) => {
    if (t.kazananCekiciId === cekici.id) return true;
    if (t.teklifler?.some((te) => te.cekiciId === cekici.id)) return true;
    if (
      ihaleAcikMi(t) &&
      !cekiciHaricMi(t, cekici.id) &&
      cekiciTalepBolgesineUygunMu(cekici, t) &&
      cekiciTalepSorununaUygunMu(cekici, t)
    ) {
      return true;
    }
    return false;
  });

  const tumOzet = ilgili.map((t) => toOzet(t, cekici));

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
