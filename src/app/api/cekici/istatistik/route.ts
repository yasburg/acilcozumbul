import { NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { getSmsLog, getTaleplerByKazananCekici } from "@/lib/db";
import { cekiciPuanOzeti } from "@/lib/cekici-puan";
import { SMS_BILDIRIM_KREDI } from "@/lib/ihale";
import { ensureSeedData } from "@/lib/seed";
import { countHaricByCekici } from "@/lib/talep-iliski-db";
import type { Talep } from "@/lib/types";

function haftaBaslangici(): Date {
  const d = new Date();
  const gun = d.getDay();
  const fark = gun === 0 ? 6 : gun - 1;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - fark);
  return d;
}

/** YYYY-MM (Europe/Istanbul) */
function istanbulAyAnahtari(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
  }).format(new Date(iso));
}

function kazananTeklifFiyati(talep: Talep, cekiciId: string): number | null {
  if (talep.kazananCekiciId !== cekiciId) return null;
  if (talep.durum !== "anlaşıldı" && talep.durum !== "kazanan_belli") {
    return null;
  }
  const teklif =
    (talep.kazananTeklifId
      ? talep.teklifler?.find((t) => t.id === talep.kazananTeklifId)
      : undefined) ??
    talep.teklifler?.find(
      (t) => t.cekiciId === cekiciId && t.durum === "kazandi"
    );
  if (!teklif || typeof teklif.fiyat !== "number") return null;
  return teklif.fiyat;
}

export async function GET() {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const haftaBas = haftaBaslangici();
  const [puan, smsLog, tercihEdilmedim, talepler] = await Promise.all([
    cekiciPuanOzeti(cekici.id),
    getSmsLog({
      cekiciId: cekici.id,
      sinceIso: haftaBas.toISOString(),
      limit: 2000,
    }),
    countHaricByCekici(cekici.id),
    getTaleplerByKazananCekici(cekici.id),
  ]);

  const buHaftaHarcanan =
    smsLog.filter(
      (k) =>
        k.aliciTipi === "cekici" &&
        k.gonderildi &&
        new Date(k.gonderim) >= haftaBas
    ).length * SMS_BILDIRIM_KREDI;

  const buAyAnahtar = istanbulAyAnahtari(new Date().toISOString());
  let kazancBuAy = 0;
  let kazancToplam = 0;
  for (const talep of talepler) {
    const fiyat = kazananTeklifFiyati(talep, cekici.id);
    if (fiyat == null) continue;
    kazancToplam += fiyat;
    const tarih = talep.anlasildiAt ?? talep.olusturulma;
    if (istanbulAyAnahtari(tarih) === buAyAnahtar) {
      kazancBuAy += fiyat;
    }
  }

  return NextResponse.json({
    teklifVerdigim: puan.toplamTeklif,
    satinAldiklarim: puan.kazanilanTeklif,
    beniTercihEdenler: puan.anlasilanIs,
    tercihEdilmedim,
    tercihOrani: puan.tercihYuzde ?? 0,
    tercihPuani: puan.gorunurTercihPuani ?? puan.tercihPuani,
    fiyatGarantiPuani: puan.fiyatGarantiPuani,
    fiyatGarantiYuzde: puan.fiyatGarantiYuzde,
    hizmetPuani: puan.hizmetPuani,
    hizmetDegerlendirmeAdet: puan.hizmetDegerlendirmeAdet,
    buHaftaHarcanan,
    mevcutKredi: cekici.kredi,
    kazancBuAy,
    kazancToplam,
  });
}
