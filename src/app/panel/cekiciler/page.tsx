"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, SelectField } from "@/components/ui";
import { formatKredi } from "@/lib/talep-utils";
import {
  adSoyadSatirGoster,
  telefonGoster,
  type GizlilikSeviye,
} from "@/lib/kisisel-veri-gizle";
import type { CekiciPanelOzet } from "@/lib/panel";
import { cekiciPanelTesterAyir } from "@/lib/panel";
import { PanelCekiciHarita } from "@/components/panel/PanelCekiciHarita";
import { DESTEKLENEN_ILLER, IL_ILCELER } from "@/lib/il-ilce";

const PANEL_GIZLE_KEY = "acil_panel_kisisel_veri_gizli";
const PANEL_SAYI_GIZLE_KEY = "acil_panel_cekici_sayi_gizli";
const SEHIR_YOK = "Belirtilmemiş";
const TOPLAM_SEHIR = DESTEKLENEN_ILLER.length;
const TOPLAM_ILCE = DESTEKLENEN_ILLER.reduce(
  (n, il) => n + (IL_ILCELER[il]?.length ?? 0),
  0
);

function kapsamaYuzde(parca: number, toplam: number): number {
  if (toplam <= 0) return 0;
  return Math.round((parca / toplam) * 1000) / 10;
}

type SehirSiralama = "adet" | "alfa";
type Gorunum = "liste" | "ozet" | "harita";

function sehirEtiketi(sehir: string | undefined | null): string {
  const s = (sehir ?? "").trim();
  return s || SEHIR_YOK;
}

function sehirKarsilastir(
  a: { sehir: string; adet: number },
  b: { sehir: string; adet: number },
  siralama: SehirSiralama
): number {
  if (siralama === "alfa") return a.sehir.localeCompare(b.sehir, "tr");
  if (b.adet !== a.adet) return b.adet - a.adet;
  return a.sehir.localeCompare(b.sehir, "tr");
}

/** Benzersiz ilçe anahtarı — aynı ad farklı illerde çakışmasın */
function cekiciIlceAnahtarlari(c: CekiciPanelOzet): string[] {
  const bolgeler = c.hizmetBolgeleri;
  if (bolgeler && Object.keys(bolgeler).length > 0) {
    return Object.entries(bolgeler).flatMap(([il, ilceler]) =>
      (ilceler ?? [])
        .map((ilce) => ilce.trim())
        .filter(Boolean)
        .map((ilce) => `${il.trim()}|${ilce}`)
    );
  }
  const sehir = sehirEtiketi(c.sehir);
  return (c.hizmetIlceleri ?? [])
    .map((ilce) => ilce.trim())
    .filter(Boolean)
    .map((ilce) => `${sehir}|${ilce}`);
}

function CekiciKart({
  c,
  seviye,
  tester = false,
}: {
  c: CekiciPanelOzet;
  seviye: GizlilikSeviye;
  tester?: boolean;
}) {
  return (
    <Link key={c.id} href={`/panel/cekiciler/${c.id}`}>
      <Card
        className={`hover:border-amber-300 transition ${
          tester ? "border-violet-200 bg-violet-50/40" : ""
        }`}
      >
        <div className="flex flex-wrap justify-between gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-slate-900">
                {adSoyadSatirGoster(c.ad, seviye)}
              </p>
              {tester && (
                <span className="rounded-md bg-violet-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-900">
                  Tester
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600">
              {telefonGoster(c.telefon, seviye)}
            </p>
          </div>
          <div className="text-right text-sm">
            <p className="text-amber-600 font-bold">
              {formatKredi(c.kredi)} kredi
            </p>
            <p className="text-slate-500">{c.sehir}</p>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Kayıt: {new Date(c.kayitTarihi).toLocaleString("tr-TR")}
          {c.hizmetBolgeleri && Object.keys(c.hizmetBolgeleri).length > 0
            ? ` · ${Object.values(c.hizmetBolgeleri).flat().length} ilçe`
            : c.hizmetIlceleri && c.hizmetIlceleri.length > 0
              ? ` · ${c.hizmetIlceleri.length} ilçe`
              : " · ilçe seçilmemiş"}
        </p>
      </Card>
    </Link>
  );
}

export default function PanelCekicilerPage() {
  const [liste, setListe] = useState<CekiciPanelOzet[]>([]);
  const [loading, setLoading] = useState(true);
  const [gizli, setGizli] = useState(false);
  const [sayiGizli, setSayiGizli] = useState(false);
  const [sehirFiltre, setSehirFiltre] = useState("");
  const [siralama, setSiralama] = useState<SehirSiralama>("adet");
  const [gorunum, setGorunum] = useState<Gorunum>("ozet");

  useEffect(() => {
    try {
      setGizli(window.localStorage.getItem(PANEL_GIZLE_KEY) === "1");
      setSayiGizli(window.localStorage.getItem(PANEL_SAYI_GIZLE_KEY) === "1");
    } catch {
      /* ignore */
    }
    fetch("/api/panel/cekiciler")
      .then((r) => r.json())
      .then(setListe)
      .finally(() => setLoading(false));
  }, []);

  const seviye: GizlilikSeviye = gizli ? "yari" : "yok";

  const { testerler, cekiciler } = useMemo(
    () => cekiciPanelTesterAyir(liste),
    [liste]
  );

  const sehirAdetleri = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of cekiciler) {
      const sehir = sehirEtiketi(c.sehir);
      map.set(sehir, (map.get(sehir) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([sehir, adet]) => ({ sehir, adet }))
      .sort((a, b) => sehirKarsilastir(a, b, siralama));
  }, [cekiciler, siralama]);

  const gruplar = useMemo(() => {
    const map = new Map<string, CekiciPanelOzet[]>();
    for (const c of cekiciler) {
      const sehir = sehirEtiketi(c.sehir);
      if (sehirFiltre && sehir !== sehirFiltre) continue;
      const mevcut = map.get(sehir);
      if (mevcut) mevcut.push(c);
      else map.set(sehir, [c]);
    }
    return [...map.entries()]
      .map(([sehir, cekiciler]) => ({
        sehir,
        cekiciler,
        adet: cekiciler.length,
      }))
      .sort((a, b) => sehirKarsilastir(a, b, siralama));
  }, [cekiciler, sehirFiltre, siralama]);

  const ozetSatirlar = useMemo(() => {
    if (!sehirFiltre) return sehirAdetleri;
    return sehirAdetleri.filter((s) => s.sehir === sehirFiltre);
  }, [sehirAdetleri, sehirFiltre]);

  const gosterilenAdet = ozetSatirlar.reduce((n, s) => n + s.adet, 0);

  const kapsama = useMemo(() => {
    const sehirler = new Set<string>();
    const ilceler = new Set<string>();
    for (const c of cekiciler) {
      const sehir = sehirEtiketi(c.sehir);
      if (sehir !== SEHIR_YOK) sehirler.add(sehir);
      for (const anahtar of cekiciIlceAnahtarlari(c)) ilceler.add(anahtar);
    }
    const sehirSayisi = sehirler.size;
    const ilceSayisi = ilceler.size;
    return {
      sehirSayisi,
      ilceSayisi,
      sehirYuzde: kapsamaYuzde(sehirSayisi, TOPLAM_SEHIR),
      ilceYuzde: kapsamaYuzde(ilceSayisi, TOPLAM_ILCE),
    };
  }, [cekiciler]);

  function gizlemeyiDegistir() {
    const sonraki = !gizli;
    setGizli(sonraki);
    try {
      window.localStorage.setItem(PANEL_GIZLE_KEY, sonraki ? "1" : "0");
    } catch {
      /* ignore */
    }
  }

  function sayiGizlemeyiDegistir() {
    const sonraki = !sayiGizli;
    setSayiGizli(sonraki);
    try {
      window.localStorage.setItem(PANEL_SAYI_GIZLE_KEY, sonraki ? "1" : "0");
    } catch {
      /* ignore */
    }
  }

  const haritadaSayiGizle = gorunum === "harita" && sayiGizli;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Çekiciler</h2>
          <p className="text-sm text-slate-500">
            Kayıt olan kullanıcılar — detay ve panele geçiş
            {!loading &&
              cekiciler.length > 0 &&
              !haritadaSayiGizle &&
              ` · ${cekiciler.length} kayıt`}
            {!loading &&
              testerler.length > 0 &&
              !haritadaSayiGizle &&
              ` · ${testerler.length} tester`}
            {sehirFiltre &&
              gosterilenAdet !== cekiciler.length &&
              !haritadaSayiGizle &&
              ` · ${gosterilenAdet} gösteriliyor`}
          </p>
          {!loading && cekiciler.length > 0 && !haritadaSayiGizle && (
            <p className="mt-1 text-sm font-medium text-slate-700">
              {kapsama.sehirSayisi}/{TOPLAM_SEHIR} şehir (%
              {kapsama.sehirYuzde.toLocaleString("tr-TR")}) ·{" "}
              {kapsama.ilceSayisi}/{TOPLAM_ILCE} ilçe (%
              {kapsama.ilceYuzde.toLocaleString("tr-TR")})
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {gorunum === "harita" && (
            <button
              type="button"
              onClick={sayiGizlemeyiDegistir}
              aria-pressed={sayiGizli}
              className={`rounded-xl px-4 py-2 text-sm font-semibold border transition ${
                sayiGizli
                  ? "border-slate-800 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              {sayiGizli ? "Sayılar gizli" : "Verileri gizle"}
            </button>
          )}
          <button
            type="button"
            onClick={gizlemeyiDegistir}
            aria-pressed={gizli}
            className={`rounded-xl px-4 py-2 text-sm font-semibold border transition ${
              gizli
                ? "border-violet-300 bg-violet-50 text-violet-800"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            {gizli ? "Kişisel veriler gizli" : "Kişisel verileri gizle"}
          </button>
          <Link
            href="/kayit/a"
            className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white"
          >
            + Yeni kayıt
          </Link>
        </div>
      </div>

      {!loading && liste.length > 0 && (
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[10rem] max-w-xs flex-1">
            <SelectField
              label="Şehir"
              value={sehirFiltre}
              onChange={(e) => setSehirFiltre(e.target.value)}
            >
              <option value="">
                {haritadaSayiGizle
                  ? "Tüm şehirler"
                  : `Tüm şehirler (${cekiciler.length})`}
              </option>
              {sehirAdetleri.map(({ sehir, adet }) => (
                <option key={sehir} value={sehir}>
                  {haritadaSayiGizle ? sehir : `${sehir} (${adet})`}
                </option>
              ))}
            </SelectField>
          </div>
          <div className="min-w-[10rem] max-w-xs flex-1">
            <SelectField
              label="Sıralama"
              value={siralama}
              onChange={(e) =>
                setSiralama(e.target.value as SehirSiralama)
              }
            >
              <option value="adet">Çoktan aza</option>
              <option value="alfa">Alfabetik</option>
            </SelectField>
          </div>
          <div
            className="flex rounded-xl border border-slate-200 bg-white p-1"
            role="group"
            aria-label="Görünüm"
          >
            <button
              type="button"
              onClick={() => setGorunum("liste")}
              aria-pressed={gorunum === "liste"}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                gorunum === "liste"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Liste
            </button>
            <button
              type="button"
              onClick={() => setGorunum("ozet")}
              aria-pressed={gorunum === "ozet"}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                gorunum === "ozet"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Özet
            </button>
            <button
              type="button"
              onClick={() => setGorunum("harita")}
              aria-pressed={gorunum === "harita"}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                gorunum === "harita"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Harita
            </button>
          </div>
        </div>
      )}

      {loading && <p className="text-sm text-slate-500">Yükleniyor…</p>}

      {!loading && liste.length === 0 && (
        <Card>
          <p className="text-slate-600 text-sm">Henüz kayıtlı çekici yok.</p>
          <Link
            href="/kayit/a"
            className="text-amber-600 text-sm font-medium mt-2 inline-block"
          >
            İlk kaydı oluştur →
          </Link>
        </Card>
      )}

      {!loading &&
        (cekiciler.length > 0 || testerler.length > 0) &&
        gorunum === "ozet" && (
        <div className="space-y-4">
          {cekiciler.length > 0 && (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-slate-500">
                    <th className="px-4 py-3 font-medium">Şehir</th>
                    <th className="px-4 py-3 font-medium text-right">
                      Kayıt sayısı
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ozetSatirlar.map(({ sehir, adet }) => (
                    <tr
                      key={sehir}
                      className="border-b border-slate-50 last:border-0"
                    >
                      <td className="px-4 py-3 text-slate-900">{sehir}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                        {adet}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-200 bg-slate-50 font-semibold text-slate-900">
                    <td className="px-4 py-3">Toplam</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {gosterilenAdet}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {testerler.length > 0 && (
            <div className="overflow-x-auto rounded-2xl border border-violet-200 bg-violet-50/40">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-violet-100 text-left text-violet-800">
                    <th className="px-4 py-3 font-medium">Tester</th>
                    <th className="px-4 py-3 font-medium text-right">Adet</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-3 text-violet-950">
                      Tester hesapları
                      <span className="block text-xs font-normal text-violet-700 mt-0.5">
                        İstatistik dışı · şehir sayımlarına dahil değil
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-violet-900">
                      {testerler.length}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!loading && cekiciler.length > 0 && gorunum === "harita" && (
        <PanelCekiciHarita
          sehirAdetleri={ozetSatirlar}
          seciliSehir={sehirFiltre || undefined}
          sayilariGizle={sayiGizli}
          onSehirSec={(sehir) =>
            setSehirFiltre((onceki) => (onceki === sehir ? "" : sehir))
          }
        />
      )}

      {!loading &&
        cekiciler.length > 0 &&
        gorunum === "liste" &&
        gruplar.length === 0 && (
          <Card>
            <p className="text-slate-600 text-sm">Bu şehirde çekici yok.</p>
          </Card>
        )}

      {gorunum === "liste" && (
        <div className="space-y-6">
          {gruplar.map((grup) => (
            <section key={grup.sehir} className="space-y-3">
              <div className="flex items-baseline justify-between gap-2 border-b border-slate-200 pb-2">
                <h3 className="text-lg font-semibold text-slate-900">
                  {grup.sehir}
                </h3>
                <span className="text-sm font-medium text-slate-500 tabular-nums">
                  {grup.adet} çekici
                </span>
              </div>
              <div className="space-y-3">
                {grup.cekiciler.map((c) => (
                  <CekiciKart key={c.id} c={c} seviye={seviye} />
                ))}
              </div>
            </section>
          ))}

          {testerler.length > 0 && (
            <section className="space-y-3 rounded-2xl border border-violet-200 bg-violet-50/30 p-4">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wide text-violet-900">
                  Tester hesapları
                </h3>
                <span className="text-xs font-medium text-violet-700 tabular-nums">
                  {testerler.length} hesap · istatistik dışı
                </span>
              </div>
              <div className="space-y-3">
                {testerler.map((c) => (
                  <CekiciKart key={c.id} c={c} seviye={seviye} tester />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
