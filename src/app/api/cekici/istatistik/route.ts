import { NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { getTalepler } from "@/lib/db";
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

  const talepler = await getTalepler();
  const haftaBas = haftaBaslangici();

  let satinAldiklarim = 0;
  let buHaftaHarcanan = 0;

  for (const talep of talepler) {
    for (const kayit of talep.satinAlmaGecmisi ?? []) {
      if (kayit.cekiciId !== cekici.id) continue;
      satinAldiklarim += 1;
      if (new Date(kayit.tarih) >= haftaBas) {
        buHaftaHarcanan += 1;
      }
    }
  }

  const beniTercihEdenler = talepler.filter(
    (t) =>
      t.durum === "anlaşıldı" &&
      t.satinAlanCekiciId === cekici.id &&
      t.satinAlmaGecmisi?.some((g) => g.cekiciId === cekici.id && !g.tercihEdilmedi)
  ).length;

  const tercihEdilmedim = talepler.filter((t) =>
    t.satinAlmaGecmisi?.some(
      (g) => g.cekiciId === cekici.id && g.tercihEdilmedi
    )
  ).length;

  const tercihOrani =
    satinAldiklarim > 0
      ? Math.round((beniTercihEdenler / satinAldiklarim) * 100)
      : 0;

  return NextResponse.json({
    satinAldiklarim,
    beniTercihEdenler,
    tercihEdilmedim,
    tercihOrani,
    buHaftaHarcanan,
    mevcutKredi: cekici.kredi,
  });
}
