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
  return `${(oran * 100).toFixed(2)}%`;
}

function bugun(): string {
  return new Date().toISOString().slice(0, 10);
}

function gunEksi(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

const HUNI_ADIM_RENKLERI = [
  "#c45c5c",
  "#d4a017",
  "#e8a54b",
  "#c9852e",
  "#5ba3d9",
  "#4a6fa5",
  "#3d8b7a",
  "#2f6b5f",
  "#6b7c8a",
] as const;

function HuniSvgYatay({ adimlar }: { adimlar: HuniAdim[] }) {
  const n = adimlar.length;
  const svgW = Math.max(520, n * 110);
  const topPad = 6;
  const funnelH = 96;
  const labelH = 58;
  const svgH = topPad + funnelH + labelH;
  const baseline = topPad + funnelH;
  const maxCount = Math.max(...adimlar.map((a) => a.sessionSayisi), 1);
  const basSayi = Math.max(adimlar[0]?.sessionSayisi ?? 0, 1);
  const maxBandH = funnelH - 6;
  const minBandH = maxBandH * 0.2;
  const heights = adimlar.map(
    (a) => minBandH + (maxBandH - minBandH) * (a.sessionSayisi / maxCount)
  );
  const segW = svgW / n;

  return (
    <div className="rounded-xl bg-slate-100 px-2 py-3 overflow-x-auto">
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full min-w-[28rem] block"
        role="img"
        aria-label="Kayıt hunisi yatay"
      >
        {adimlar.map((a, i) => {
          const x0 = i * segW;
          const x1 = (i + 1) * segW;
          const hL = heights[i]!;
          const hR = i === n - 1 ? hL : heights[i + 1]!;
          const yL = baseline - hL;
          const yR = baseline - hR;
          const points = `${x0},${yL} ${x1},${yR} ${x1},${baseline} ${x0},${baseline}`;
          const midX = (x0 + x1) / 2;
          const midY = (yL + yR) / 2 + (baseline - (yL + yR) / 2) * 0.35;
          const totalYuzde = (a.sessionSayisi / basSayi) * 100;
          const oncekiSayi =
            i === 0 ? a.sessionSayisi : adimlar[i - 1]!.sessionSayisi;
          const adimYuzde =
            i === 0
              ? 100
              : oncekiSayi > 0
                ? (a.sessionSayisi / oncekiSayi) * 100
                : 0;

          return (
            <g key={a.adim}>
              <polygon
                points={points}
                fill={HUNI_ADIM_RENKLERI[i % HUNI_ADIM_RENKLERI.length]}
              />
              <text
                x={midX}
                y={midY + 4}
                textAnchor="middle"
                fill="#fff"
                fontSize={13}
                fontWeight={700}
              >
                {a.sessionSayisi}
              </text>
              <text
                x={midX}
                y={baseline + 16}
                textAnchor="middle"
                fill="#334155"
                fontSize={10}
                fontWeight={600}
              >
                {a.label}
              </text>
              <text
                x={midX}
                y={baseline + 30}
                textAnchor="middle"
                fill="#64748b"
                fontSize={10}
                fontWeight={700}
              >
                {totalYuzde.toFixed(2)}%
              </text>
              <text
                x={midX}
                y={baseline + 44}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize={9}
              >
                adım {adimYuzde.toFixed(2)}%
              </text>
            </g>
          );
        })}
      </svg>
      <p className="text-[10px] text-slate-400 px-1 mt-1">
        Üst %: total (ilk adıma göre) · Alt %: önceki adıma göre
      </p>
    </div>
  );
}

function HuniSvgDikey({ adimlar }: { adimlar: HuniAdim[] }) {
  const n = adimlar.length;
  const labelW = 100;
  const pctSolW = 52;
  const funnelW = 180;
  const pctSagW = 52;
  const svgW = labelW + pctSolW + funnelW + pctSagW;
  const segH = 54;
  const svgH = n * segH + 22;
  const funnelLeft = labelW + pctSolW;
  const cx = funnelLeft + funnelW / 2;
  const maxBand = funnelW - 12;
  const minBand = maxBand * 0.32;
  const maxCount = Math.max(...adimlar.map((a) => a.sessionSayisi), 1);
  const basSayi = Math.max(adimlar[0]?.sessionSayisi ?? 0, 1);
  const genislikler = adimlar.map(
    (a) => minBand + (maxBand - minBand) * (a.sessionSayisi / maxCount)
  );

  return (
    <div className="rounded-xl bg-slate-100 px-2 py-3">
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full block"
        role="img"
        aria-label="Kayıt hunisi dikey"
      >
        <text
          x={labelW + pctSolW / 2}
          y={12}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize={9}
        >
          total
        </text>
        <text
          x={funnelLeft + funnelW + pctSagW / 2}
          y={12}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize={9}
        >
          adım
        </text>
        {adimlar.map((a, i) => {
          const topW = genislikler[i]!;
          const bottomW = i === n - 1 ? topW : genislikler[i + 1]!;
          const y0 = i * segH + 18;
          const y1 = y0 + segH - 2;
          const x0t = cx - topW / 2;
          const x1t = cx + topW / 2;
          const x0b = cx - bottomW / 2;
          const x1b = cx + bottomW / 2;
          const points = `${x0t},${y0} ${x1t},${y0} ${x1b},${y1} ${x0b},${y1}`;
          const midY = (y0 + y1) / 2;
          const totalYuzde = (a.sessionSayisi / basSayi) * 100;
          const oncekiSayi =
            i === 0 ? a.sessionSayisi : adimlar[i - 1]!.sessionSayisi;
          const adimYuzde =
            i === 0
              ? 100
              : oncekiSayi > 0
                ? (a.sessionSayisi / oncekiSayi) * 100
                : 0;

          return (
            <g key={a.adim}>
              <text
                x={labelW - 4}
                y={midY + 4}
                textAnchor="end"
                fill="#475569"
                fontSize={11}
                fontWeight={600}
              >
                {a.label}
              </text>
              <text
                x={labelW + pctSolW / 2}
                y={midY + 4}
                textAnchor="middle"
                fill="#64748b"
                fontSize={10}
                fontWeight={700}
              >
                {totalYuzde.toFixed(2)}%
              </text>
              <polygon
                points={points}
                fill={HUNI_ADIM_RENKLERI[i % HUNI_ADIM_RENKLERI.length]}
              />
              <text
                x={cx}
                y={midY + 5}
                textAnchor="middle"
                fill="#fff"
                fontSize={15}
                fontWeight={700}
              >
                {a.sessionSayisi}
              </text>
              <text
                x={funnelLeft + funnelW + pctSagW / 2}
                y={midY + 4}
                textAnchor="middle"
                fill="#64748b"
                fontSize={10}
                fontWeight={700}
              >
                {adimYuzde.toFixed(2)}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function HuniSvg({
  adimlar,
  yon = "dikey",
}: {
  adimlar: HuniAdim[];
  yon?: "yatay" | "dikey";
}) {
  if (!adimlar.length) {
    return <p className="text-sm text-slate-500">Veri yok.</p>;
  }
  return yon === "yatay" ? (
    <HuniSvgYatay adimlar={adimlar} />
  ) : (
    <HuniSvgDikey adimlar={adimlar} />
  );
}

function gunKisaEtiket(gun: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(gun);
  if (!m) return gun;
  return `${m[3]}.${m[2]}`;
}

function TrendSvg({ gunluk }: { gunluk: Gunluk[] }) {
  if (gunluk.length < 2) {
    return (
      <p className="text-sm text-slate-500">
        Trend için en az 2 gün veri gerekir.
      </p>
    );
  }
  const w = Math.max(420, gunluk.length * 56);
  const h = 160;
  const padL = 28;
  const padR = 28;
  const padT = 32;
  const padB = 32;
  const maxY = Math.max(...gunluk.map((g) => g.goruldu), 1);

  const xAt = (i: number) =>
    padL + (i / Math.max(gunluk.length - 1, 1)) * (w - padL - padR);

  const yAt = (v: number) =>
    h - padB - (v / maxY) * (h - padT - padB);

  const pts = gunluk
    .map((g, i) => `${xAt(i)},${yAt(g.goruldu)}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img">
      <text x={padL} y={14} fontSize={10} className="fill-slate-500">
        Günlük görülme
      </text>
      <polyline
        fill="none"
        stroke="#d97706"
        strokeWidth={2.5}
        points={pts}
      />
      {gunluk.map((g, i) => {
        const x = xAt(i);
        const y = yAt(g.goruldu);
        return (
          <g key={g.gun}>
            <circle cx={x} cy={y} r={3.5} fill="#d97706" />
            <text
              x={x}
              y={y - 10}
              textAnchor="middle"
              fill="#334155"
              fontSize={11}
              fontWeight={700}
            >
              {g.goruldu}
            </text>
            <text
              x={x}
              y={h - 12}
              textAnchor="middle"
              fill="#64748b"
              fontSize={10}
            >
              {gunKisaEtiket(g.gun)}
            </text>
          </g>
        );
      })}
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

  function presetBugun() {
    const g = bugun();
    setFrom(g);
    setTo(g);
  }

  function presetDun() {
    const g = gunEksi(1);
    setFrom(g);
    setTo(g);
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
    <div className="space-y-6 w-full">
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
            onClick={presetBugun}
          >
            Bugün
          </button>
          <button
            type="button"
            className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            onClick={presetDun}
          >
            Dün
          </button>
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
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-stretch">
          <Card className="space-y-2 min-w-0">
            <h2 className="text-sm font-semibold text-slate-900">
              Session hunisi
            </h2>
            <p className="text-xs text-slate-500">
              Seçili funnellerde unique session adım geçişi (yatay).
            </p>
            <HuniSvg adimlar={huni} yon="yatay" />
          </Card>
          <Card className="space-y-2 min-w-0">
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
            {karsilastirmaFunneller.map((k) => (
              <div key={k.funnel} className="space-y-1">
                <p className="text-xs font-bold uppercase text-slate-600">
                  Funnel {k.funnel}
                </p>
                <HuniSvg adimlar={k.adimlar} />
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
            <p className="text-xs text-slate-500 mt-0.5">
              Seçili tarih aralığına göre (funnel chip filtresi uygulanmaz).
            </p>
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
