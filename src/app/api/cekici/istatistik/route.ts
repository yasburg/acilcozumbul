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

  let teklifVerdigim = 0;
  let buHaftaHarcanan = 0;

  for (const talep of talepler) {
    for (const teklif of talep.teklifler ?? []) {
      if (teklif.cekiciId !== cekici.id) continue;
      teklifVerdigim += 1;
      if (new Date(teklif.tarih) >= haftaBas) {
        buHaftaHarcanan += 1;
      }
    }
  }

  const beniTercihEdenler = talepler.filter(
    (t) => t.durum === "anlaşıldı" && t.kazananCekiciId === cekici.id
  ).length;

  const kazandigim = talepler.filter((t) =>
    t.teklifler?.some((te) => te.cekiciId === cekici.id && te.durum === "kazandi")
  ).length;

  const tercihEdilmedim = talepler.filter((t) =>
    (t.haricTutulanCekiciIds ?? []).includes(cekici.id)
  ).length;

  const tercihOrani =
    kazandigim > 0 ? Math.round((beniTercihEdenler / kazandigim) * 100) : 0;

  return NextResponse.json({
    teklifVerdigim,
    satinAldiklarim: kazandigim,
    beniTercihEdenler,
    tercihEdilmedim,
    tercihOrani,
    buHaftaHarcanan,
    mevcutKredi: cekici.kredi,
  });
}
