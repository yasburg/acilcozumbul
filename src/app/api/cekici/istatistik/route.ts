import { NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { getSmsLog, getTalepler } from "@/lib/db";
import { cekiciPuanOzeti } from "@/lib/cekici-puan";
import { SMS_BILDIRIM_KREDI } from "@/lib/ihale";
import { ensureSeedData } from "@/lib/seed";

function haftaBaslangici(): Date {
  const d = new Date();
  const gun = d.getDay();
  const fark = gun === 0 ? 6 : gun - 1;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - fark);
  return d;
}

export async function GET() {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const haftaBas = haftaBaslangici();
  const puan = await cekiciPuanOzeti(cekici.id);

  const smsLog = await getSmsLog();
  const buHaftaHarcanan =
    smsLog.filter(
      (k) =>
        k.cekiciId === cekici.id &&
        k.aliciTipi === "cekici" &&
        k.gonderildi &&
        new Date(k.gonderim) >= haftaBas
    ).length * SMS_BILDIRIM_KREDI;

  const talepler = await getTalepler();
  const tercihEdilmedim = talepler.filter((t) =>
    (t.haricTutulanCekiciIds ?? []).includes(cekici.id)
  ).length;

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
  });
}
