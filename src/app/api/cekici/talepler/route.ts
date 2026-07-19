import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { getTaleplerBugun } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import {
  cekiciAcikTalepUygunMu,
  cekiciHaricMi,
  cekiciTalebeBildirildiMi,
  cekiciTeklifVerdiMi,
  cekiciBildirimKrediTutari,
  cekiciYeterliBildirimKredisi,
} from "@/lib/ihale";
import {
  isBugun,
  talepBolge,
  talepSorunOzet,
} from "@/lib/talep-utils";
import type { Cekici, ListeDurumu, Talep, TalepOzet } from "@/lib/types";
import { demoCookieYanitaYaz, demoOturumCekiciIcin, demoPanelVerisi } from "@/lib/demo-oturum";

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
  if (cekiciAcikTalepUygunMu(talep, cekici)) {
    if (cekiciTalebeBildirildiMi(talep, cekiciId)) return "acik";
    return "gizli";
  }
  return "kaybettim";
}

function toOzet(talep: Talep, cekici: Cekici): TalepOzet {
  const cekiciId = cekici.id;
  const kazandim = talep.kazananCekiciId === cekiciId;
  const durum = listeDurumuBelirle(talep, cekici);
  const aktifTeklifler = talep.teklifler?.filter((t) => t.durum === "aktif") ?? [];
  const benimTeklif = talep.teklifler?.find((t) => t.cekiciId === cekiciId);

  const gizli = durum === "gizli";

  return {
    id: talep.id,
    ad: gizli ? "•••" : talep.ad,
    soyad: gizli ? "" : talep.soyad,
    bolge: talepBolge(talep),
    sorunOzet: gizli ? "Detaylar için ihaleye katılın" : talepSorunOzet(talep.sorun),
    durum: talep.durum,
    olusturulma: talep.olusturulma,
    teklifSayisi: gizli ? undefined : aktifTeklifler.length,
    enDusukTeklif: gizli
      ? undefined
      : aktifTeklifler.length
        ? Math.min(...aktifTeklifler.map((t) => t.fiyat))
        : undefined,
    benimTeklifim: !!benimTeklif,
    kazandim,
    telefon: kazandim ? talep.telefon : undefined,
    listeDurumu: durum,
    gizli,
  };
}

export async function GET(request: NextRequest) {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const talepler = await getTaleplerBugun();
  const bugun = talepler.filter((t) => isBugun(t.olusturulma));

  const ilgili = bugun.filter((t) => {
    if (t.kazananCekiciId === cekici.id) return true;
    if (t.teklifler?.some((te) => te.cekiciId === cekici.id)) return true;
    if (cekiciAcikTalepUygunMu(t, cekici)) {
      return true;
    }
    return false;
  });

  const tumOzet = ilgili.map((t) => toOzet(t, cekici));

  const bekleyen = tumOzet.filter((t) => t.listeDurumu === "acik");
  const bekleyenGizli = tumOzet.filter((t) => t.listeDurumu === "gizli");
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

  const demoOturum = await demoOturumCekiciIcin(cekici.id, request);
  if (demoOturum) {
    const demo = demoPanelVerisi(demoOturum, cekici);
    const res = NextResponse.json({
      bekleyen: [...demo.bekleyen, ...bekleyen],
      bekleyenGizli: [...demo.bekleyenGizli, ...bekleyenGizli],
      teklifVerdigim: [...demo.teklifVerdigim, ...teklifVerdigim],
      kazandiklarim: [...demo.kazandiklarim, ...kazandiklarim],
      kaybettiklerim: [...demo.kaybettiklerim, ...kaybettiklerim],
      tercihEdilmedi: [...demo.tercihEdilmedi, ...tercihEdilmedi],
      bugunTumu: [...demo.bugunTumu, ...bugunTumu].sort(
        (a, b) =>
          new Date(b.olusturulma).getTime() - new Date(a.olusturulma).getTime()
      ),
      kredi: cekici.kredi,
      krediYok: !cekiciYeterliBildirimKredisi(
        cekici.kredi,
        cekiciBildirimKrediTutari(cekici)
      ),
      bildirimKredi: cekiciBildirimKrediTutari(cekici),
      premiumSmsAktif: Boolean(cekici.premiumSmsAktif),
      satinAlinanlar: [...demo.kazandiklarim, ...kazandiklarim],
      baskasiAldi: [...demo.kaybettiklerim, ...kaybettiklerim],
      demoModu: true,
    });
    demoCookieYanitaYaz(res, demoOturum);
    return res;
  }

  return NextResponse.json({
    bekleyen,
    bekleyenGizli,
    teklifVerdigim,
    kazandiklarim,
    kaybettiklerim,
    tercihEdilmedi,
    bugunTumu,
    kredi: cekici.kredi,
    krediYok: !cekiciYeterliBildirimKredisi(
      cekici.kredi,
      cekiciBildirimKrediTutari(cekici)
    ),
    bildirimKredi: cekiciBildirimKrediTutari(cekici),
    premiumSmsAktif: Boolean(cekici.premiumSmsAktif),
    // Geriye uyumluluk
    satinAlinanlar: kazandiklarim,
    baskasiAldi: kaybettiklerim,
  });
}
