"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";

type OzetSatir = {
  funnel: string;
  etiket: string;
  yol: string;
  goruldu: number;
  otpGonder: number;
  hesap: number;
  panelHazir: number;
  otpOran: number | null;
  hesapOran: number | null;
  hazirOran: number | null;
};

type HuniAdim = {
  adim: string;
  label: string;
  sessionSayisi: number;
  oncekiOran: number | null;
};

type PanelOzet = {
  session: number;
  goruldu: number;
  otpGonder: number;
  hesap: number;
  panelHazir: number;
  hesapOran: number | null;
  hazirOran: number | null;
};

type OlayHacmi = {
  olay: string;
  sayi: number;
  byFunnel: Record<string, number>;
};

type Gunluk = { gun: string; goruldu: number; hesap: number };

const FUNNEL_CHIPLER = ["a", "b", "c", "d", "e"] as const;

function yuzde(oran: number | null): string {
  if (oran == null) return "—";
  return `${(oran * 100).toFixed(1)}%`;
}

function bugun(): string {
  return new Date().toISOString().slice(0, 10);
}

function gunEksi(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

function HuniSvg({ adimlar, renk = "#d97706" }: { adimlar: HuniAdim[]; renk?: string }) {
  if (!adimlar.length) {
    return <p className="text-sm text-slate-500">Veri yok.</p>;
  }
  const max = Math.max(...adimlar.map((a) => a.sessionSayisi), 1);
  const w = 320;
  const rowH = 36;
  const h = adimlar.length * rowH + 8;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-md" role="img">
      {adimlar.map((a, i) => {
        const barW = Math.max(24, (a.sessionSayisi / max) * (w - 120));
        const y = i * rowH + 4;
        const drop =
          i > 0 && adimlar[i - 1]!.sessionSayisi > 0
            ? 1 - a.sessionSayisi / adimlar[i - 1]!.sessionSayisi
            : null;
        return (
          <g key={a.adim}>
            <text x={0} y={y + 16} className="fill-slate-600" fontSize={11}>
              {a.label}
            </text>
            <rect
              x={100}
              y={y + 4}
              width={barW}
              height={20}
              rx={3}
              fill={renk}
              opacity={0.85 - i * 0.08}
            />
            <text
              x={108 + barW}
              y={y + 18}
              className="fill-slate-800"
              fontSize={11}
              fontWeight={600}
            >
              {a.sessionSayisi}
              {drop != null && drop > 0
                ? ` (−${(drop * 100).toFixed(0)}%)`
                : ""}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function TrendSvg({ gunluk }: { gunluk: Gunluk[] }) {
  if (gunluk.length < 2) {
    return (
      <p className="text-sm text-slate-500">
        Trend için en az 2 gün veri gerekir.
      </p>
    );
  }
  const w = 420;
  const h = 140;
  const pad = 28;
  const maxY = Math.max(...gunluk.map((g) => Math.max(g.goruldu, g.hesap)), 1);

  const pts = (key: "goruldu" | "hesap") =>
    gunluk
      .map((g, i) => {
        const x =
          pad + (i / Math.max(gunluk.length - 1, 1)) * (w - pad * 2);
        const y = h - pad - (g[key] / maxY) * (h - pad * 2);
        return `${x},${y}`;
      })
      .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-lg" role="img">
      <polyline
        fill="none"
        stroke="#94a3b8"
        strokeWidth={2}
        points={pts("goruldu")}
      />
      <polyline
        fill="none"
        stroke="#d97706"
        strokeWidth={2.5}
        points={pts("hesap")}
      />
      <text x={pad} y={14} fontSize={10} className="fill-slate-500">
        Gri: görülme · Amber: hesap
      </text>
      <text x={pad} y={h - 6} fontSize={10} className="fill-slate-400">
        {gunluk[0]?.gun} → {gunluk[gunluk.length - 1]?.gun}
      </text>
    </svg>
  );
}

export default function PanelKayitFunnelsPage() {
  const [liste, setListe] = useState<OzetSatir[]>([]);
  const [ozet, setOzet] = useState<PanelOzet | null>(null);
  const [huni, setHuni] = useState<HuniAdim[]>([]);
  const [karsilastirma, setKarsilastirma] = useState<
    { funnel: string; adimlar: HuniAdim[] }[]
  >([]);
  const [olayHacmi, setOlayHacmi] = useState<OlayHacmi[]>([]);
  const [gunluk, setGunluk] = useState<Gunluk[]>([]);
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(true);
  const [from, setFrom] = useState(() => gunEksi(6));
  const [to, setTo] = useState(() => bugun());
  const [secili, setSecili] = useState<string[]>(["a", "b"]);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    setHata("");
    try {
      const qs = new URLSearchParams({
        from,
        to,
        funnels: secili.join(","),
      });
      const res = await fetch(`/api/panel/kayit-funnels?${qs}`, {
        credentials: "include",
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error ?? "Yüklenemedi.");
      setListe(d.liste ?? []);
      setOzet(d.ozet ?? null);
      setHuni(d.huni ?? []);
      setKarsilastirma(d.karsilastirma ?? []);
      setOlayHacmi(d.olayHacmi ?? []);
      setGunluk(d.gunluk ?? []);
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Yüklenemedi.");
      setListe([]);
      setOzet(null);
      setHuni([]);
      setKarsilastirma([]);
      setOlayHacmi([]);
      setGunluk([]);
    } finally {
      setYukleniyor(false);
    }
  }, [from, to, secili]);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  const karsilastirmaFunneller = useMemo(
    () => karsilastirma.filter((k) => secili.includes(k.funnel)),
    [karsilastirma, secili]
  );

  function preset(gun: number) {
    setTo(bugun());
    setFrom(gunEksi(gun - 1));
  }

  function toggleFunnel(f: string) {
    setSecili((prev) => {
      if (prev.includes(f)) {
        const next = prev.filter((x) => x !== f);
        return next.length ? next : prev;
      }
      return [...prev, f].sort();
    });
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-wrap justify-between gap-3 items-end">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Kayıt funnelleri</h1>
          <p className="text-sm text-slate-500 mt-1">
            Session hunisi, A/B karşılaştırma ve olay hacmi.
          </p>
        </div>
        <button
          type="button"
          className="text-sm font-medium text-amber-700"
          onClick={() => void yukle()}
        >
          Yenile
        </button>
      </div>

      <Card className="space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Tarih
          </span>
          <button
            type="button"
            className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => preset(7)}
          >
            7 gün
          </button>
          <button
            type="button"
            className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => preset(30)}
          >
            30 gün
          </button>
          <label className="text-xs text-slate-600 flex items-center gap-1">
            Başlangıç
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded border border-slate-200 px-1.5 py-1 text-xs"
            />
          </label>
          <label className="text-xs text-slate-600 flex items-center gap-1">
            Bitiş
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded border border-slate-200 px-1.5 py-1 text-xs"
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Funnel
          </span>
          {FUNNEL_CHIPLER.map((f) => {
            const on = secili.includes(f);
            return (
              <button
                key={f}
                type="button"
                onClick={() => toggleFunnel(f)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold uppercase ${
                  on
                    ? "bg-amber-600 text-white"
                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {f}
              </button>
            );
          })}
          <button
            type="button"
            className="text-xs font-medium text-slate-500 underline"
            onClick={() => setSecili([...FUNNEL_CHIPLER])}
          >
            Hepsi
          </button>
        </div>
      </Card>

      {yukleniyor && <p className="text-sm text-slate-500">Yükleniyor…</p>}
      {hata && <p className="text-sm text-red-600">{hata}</p>}

      {!yukleniyor && !hata && ozet && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            ["Session", ozet.session],
            ["Görülme", ozet.goruldu],
            ["OTP", ozet.otpGonder],
            ["Hesap", ozet.hesap],
            ["Hesap%", yuzde(ozet.hesapOran)],
            ["Hazır%", yuzde(ozet.hazirOran)],
          ].map(([k, v]) => (
            <Card key={String(k)} className="!py-3 !px-3">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">
                {k}
              </p>
              <p className="text-lg font-bold tabular-nums text-slate-900 mt-0.5">
                {v}
              </p>
            </Card>
          ))}
        </div>
      )}

      {!yukleniyor && !hata && (
        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Session hunisi
            </h2>
            <p className="text-xs text-slate-500">
              Seçili funnellerde unique session adım geçişi.
            </p>
            <HuniSvg adimlar={huni} />
          </Card>
          <Card className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Günlük trend
            </h2>
            <TrendSvg gunluk={gunluk} />
          </Card>
        </div>
      )}

      {!yukleniyor && !hata && karsilastirmaFunneller.length > 0 && (
        <Card className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">
            A/B karşılaştırması
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {karsilastirmaFunneller.map((k, i) => (
              <div key={k.funnel} className="space-y-1">
                <p className="text-xs font-bold uppercase text-slate-600">
                  Funnel {k.funnel}
                </p>
                <HuniSvg
                  adimlar={k.adimlar}
                  renk={i % 2 === 0 ? "#d97706" : "#0f766e"}
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {!yukleniyor && !hata && (
        <Card className="overflow-x-auto p-0">
          <div className="px-3 py-2 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Olay hacmi</h2>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="px-3 py-2">Olay</th>
                <th className="px-3 py-2 tabular-nums">Toplam</th>
                {secili.map((f) => (
                  <th key={f} className="px-3 py-2 tabular-nums uppercase">
                    {f}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {olayHacmi.map((r) => (
                <tr key={r.olay} className="hover:bg-slate-50/80">
                  <td className="px-3 py-2 font-mono text-xs text-slate-800">
                    {r.olay}
                  </td>
                  <td className="px-3 py-2 tabular-nums font-semibold">
                    {r.sayi}
                  </td>
                  {secili.map((f) => (
                    <td key={f} className="px-3 py-2 tabular-nums text-slate-600">
                      {r.byFunnel[f] ?? 0}
                    </td>
                  ))}
                </tr>
              ))}
              {!olayHacmi.length && (
                <tr>
                  <td
                    colSpan={2 + secili.length}
                    className="px-3 py-4 text-slate-500 text-sm"
                  >
                    Bu aralıkta olay yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      )}

      {!yukleniyor && !hata && (
        <Card className="overflow-x-auto p-0">
          <div className="px-3 py-2 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">
              Tüm aktif funneller (özet)
            </h2>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="px-3 py-2">Funnel</th>
                <th className="px-3 py-2">Link</th>
                <th className="px-3 py-2 tabular-nums">Görülme</th>
                <th className="px-3 py-2 tabular-nums">OTP</th>
                <th className="px-3 py-2 tabular-nums">Hesap</th>
                <th className="px-3 py-2 tabular-nums">Hazır</th>
                <th className="px-3 py-2 tabular-nums">OTP%</th>
                <th className="px-3 py-2 tabular-nums">Hesap%</th>
                <th className="px-3 py-2 tabular-nums">Hazır/hesap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {liste.map((r) => (
                <tr key={r.funnel} className="hover:bg-slate-50/80">
                  <td className="px-3 py-2 font-semibold text-slate-900">
                    {r.funnel.toUpperCase()}
                    <span className="block text-xs font-normal text-slate-500">
                      {r.etiket}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      href={r.yol}
                      className="text-amber-700 text-xs font-medium"
                      target="_blank"
                    >
                      {r.yol}
                    </Link>
                  </td>
                  <td className="px-3 py-2 tabular-nums">{r.goruldu}</td>
                  <td className="px-3 py-2 tabular-nums">{r.otpGonder}</td>
                  <td className="px-3 py-2 tabular-nums">{r.hesap}</td>
                  <td className="px-3 py-2 tabular-nums">{r.panelHazir}</td>
                  <td className="px-3 py-2 tabular-nums">{yuzde(r.otpOran)}</td>
                  <td className="px-3 py-2 tabular-nums">
                    {yuzde(r.hesapOran)}
                  </td>
                  <td className="px-3 py-2 tabular-nums">
                    {yuzde(r.hazirOran)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
