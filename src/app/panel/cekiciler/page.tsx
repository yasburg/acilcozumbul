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

const PANEL_GIZLE_KEY = "acil_panel_kisisel_veri_gizli";
const SEHIR_YOK = "Belirtilmemiş";

function sehirEtiketi(sehir: string | undefined | null): string {
  const s = (sehir ?? "").trim();
  return s || SEHIR_YOK;
}

export default function PanelCekicilerPage() {
  const [liste, setListe] = useState<CekiciPanelOzet[]>([]);
  const [loading, setLoading] = useState(true);
  const [gizli, setGizli] = useState(false);
  const [sehirFiltre, setSehirFiltre] = useState("");

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

  const sehirler = useMemo(() => {
    const set = new Set<string>();
    for (const c of liste) set.add(sehirEtiketi(c.sehir));
    return [...set].sort((a, b) => a.localeCompare(b, "tr"));
  }, [liste]);

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
      .sort(([a], [b]) => a.localeCompare(b, "tr"))
      .map(([sehir, cekiciler]) => ({
        sehir,
        cekiciler,
        adet: cekiciler.length,
      }));
  }, [liste, sehirFiltre]);

  const gosterilenAdet = gruplar.reduce((n, g) => n + g.adet, 0);

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
        <div className="max-w-xs">
          <SelectField
            label="Şehir"
            value={sehirFiltre}
            onChange={(e) => setSehirFiltre(e.target.value)}
          >
            <option value="">Tüm şehirler</option>
            {sehirler.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </SelectField>
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

      {!loading && liste.length > 0 && gruplar.length === 0 && (
        <Card>
          <p className="text-slate-600 text-sm">
            Bu şehirde çekici yok.
          </p>
        </Card>
      )}

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
    </div>
  );
}
