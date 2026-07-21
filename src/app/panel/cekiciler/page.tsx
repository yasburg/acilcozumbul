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
import { PanelCekiciHarita } from "@/components/panel/PanelCekiciHarita";

const PANEL_GIZLE_KEY = "acil_panel_kisisel_veri_gizli";
const SEHIR_YOK = "Belirtilmemiş";

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

export default function PanelCekicilerPage() {
  const [liste, setListe] = useState<CekiciPanelOzet[]>([]);
  const [loading, setLoading] = useState(true);
  const [gizli, setGizli] = useState(false);
  const [sehirFiltre, setSehirFiltre] = useState("");
  const [siralama, setSiralama] = useState<SehirSiralama>("adet");
  const [gorunum, setGorunum] = useState<Gorunum>("ozet");

  useEffect(() => {
    try {
      setGizli(window.localStorage.getItem(PANEL_GIZLE_KEY) === "1");
    } catch {
      /* ignore */
    }
    fetch("/api/panel/cekiciler")
      .then((r) => r.json())
      .then(setListe)
      .finally(() => setLoading(false));
  }, []);

  const seviye: GizlilikSeviye = gizli ? "yari" : "yok";

  const sehirAdetleri = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of liste) {
      const sehir = sehirEtiketi(c.sehir);
      map.set(sehir, (map.get(sehir) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([sehir, adet]) => ({ sehir, adet }))
      .sort((a, b) => sehirKarsilastir(a, b, siralama));
  }, [liste, siralama]);

  const gruplar = useMemo(() => {
    const map = new Map<string, CekiciPanelOzet[]>();
    for (const c of liste) {
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
  }, [liste, sehirFiltre, siralama]);

  const ozetSatirlar = useMemo(() => {
    if (!sehirFiltre) return sehirAdetleri;
    return sehirAdetleri.filter((s) => s.sehir === sehirFiltre);
  }, [sehirAdetleri, sehirFiltre]);

  const gosterilenAdet = ozetSatirlar.reduce((n, s) => n + s.adet, 0);

  function gizlemeyiDegistir() {
    const sonraki = !gizli;
    setGizli(sonraki);
    try {
      window.localStorage.setItem(PANEL_GIZLE_KEY, sonraki ? "1" : "0");
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Çekiciler</h2>
          <p className="text-sm text-slate-500">
            Kayıt olan kullanıcılar — detay ve panele geçiş
            {!loading && liste.length > 0
              ? ` · ${liste.length} kayıt`
              : ""}
            {sehirFiltre && gosterilenAdet !== liste.length
              ? ` · ${gosterilenAdet} gösteriliyor`
              : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
            href="/cekici/kayit"
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
              <option value="">Tüm şehirler ({liste.length})</option>
              {sehirAdetleri.map(({ sehir, adet }) => (
                <option key={sehir} value={sehir}>
                  {sehir} ({adet})
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
            href="/cekici/kayit"
            className="text-amber-600 text-sm font-medium mt-2 inline-block"
          >
            İlk kaydı oluştur →
          </Link>
        </Card>
      )}

      {!loading && liste.length > 0 && gorunum === "ozet" && (
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

      {!loading && liste.length > 0 && gorunum === "harita" && (
        <PanelCekiciHarita
          sehirAdetleri={ozetSatirlar}
          seciliSehir={sehirFiltre || undefined}
          onSehirSec={(sehir) =>
            setSehirFiltre((onceki) => (onceki === sehir ? "" : sehir))
          }
        />
      )}

      {!loading &&
        liste.length > 0 &&
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
                  <Link key={c.id} href={`/panel/cekiciler/${c.id}`}>
                    <Card className="hover:border-amber-300 transition">
                      <div className="flex flex-wrap justify-between gap-2">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {adSoyadSatirGoster(c.ad, seviye)}
                          </p>
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
                        Kayıt:{" "}
                        {new Date(c.kayitTarihi).toLocaleString("tr-TR")}
                        {c.hizmetBolgeleri &&
                        Object.keys(c.hizmetBolgeleri).length > 0
                          ? ` · ${Object.values(c.hizmetBolgeleri).flat().length} ilçe`
                          : c.hizmetIlceleri && c.hizmetIlceleri.length > 0
                            ? ` · ${c.hizmetIlceleri.length} ilçe`
                            : " · ilçe seçilmemiş"}
                      </p>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
