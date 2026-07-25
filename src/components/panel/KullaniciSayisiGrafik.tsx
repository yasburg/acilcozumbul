"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui";
import {
  cekiciKayitSerisiPencere,
  type CekiciKayitGunNokta,
} from "@/lib/cekici-kayit-serisi";

type Pencere = 30 | 90 | "hepsi";

function gunEtiket(gun: string): string {
  const [, m, d] = gun.split("-");
  return `${d}.${m}`;
}

/** Günlük çubuk + kümülatif çizgi; nokta üstünde toplam, altında +günlük */
function KullaniciSayisiSvg({
  noktalar,
}: {
  noktalar: CekiciKayitGunNokta[];
}) {
  const W = 640;
  const H = 260;
  const padL = 40;
  const padR = 16;
  const padT = 32;
  const padB = 44;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const maxKum = Math.max(1, ...noktalar.map((n) => n.kumulatif));
  const maxGun = Math.max(1, ...noktalar.map((n) => n.gunluk));
  const n = Math.max(1, noktalar.length - 1);

  const xAt = (i: number) =>
    padL + (noktalar.length <= 1 ? plotW / 2 : (i / n) * plotW);
  const yKum = (v: number) => padT + plotH - (v / maxKum) * plotH;
  /** Çubuklar kümülatif ölçeğin ~%45’ini kullanır; çizgi baskın kalır */
  const barMaxH = plotH * 0.45;
  const yGunH = (v: number) => (v / maxGun) * barMaxH;

  const etiketAdim = Math.max(1, Math.ceil(noktalar.length / 8));
  const etiketGoster = (i: number) =>
    i % etiketAdim === 0 || i === noktalar.length - 1;

  const yTickler = [0, Math.round(maxKum / 2), maxKum].filter(
    (v, i, a) => a.indexOf(v) === i
  );

  const barW = Math.max(
    2,
    Math.min(18, (plotW / Math.max(1, noktalar.length)) * 0.55)
  );

  const pts = noktalar
    .map((p, i) => `${xAt(i)},${yKum(p.kumulatif)}`)
    .join(" ");
  const area =
    noktalar.length > 0
      ? `${padL},${padT + plotH} ${pts} ${xAt(noktalar.length - 1)},${padT + plotH}`
      : "";

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto"
      role="img"
      aria-label="Günlük ve kümülatif kullanıcı sayısı"
    >
      {yTickler.map((v) => (
        <g key={v}>
          <line
            x1={padL}
            x2={W - padR}
            y1={yKum(v)}
            y2={yKum(v)}
            stroke="#e2e8f0"
            strokeWidth={1}
          />
          <text
            x={padL - 6}
            y={yKum(v) + 3}
            textAnchor="end"
            className="fill-slate-400"
            fontSize={10}
          >
            {v}
          </text>
        </g>
      ))}

      {/* Günlük çubuklar */}
      {noktalar.map((p, i) => {
        const h = Math.max(0, yGunH(p.gunluk));
        const x = xAt(i) - barW / 2;
        const y = padT + plotH - h;
        return (
          <rect
            key={`bar-${p.gun}`}
            x={x}
            y={y}
            width={barW}
            height={h}
            rx={2}
            className="fill-amber-300/80"
          >
            <title>
              {p.gun}: +{p.gunluk} kayıt (kümülatif {p.kumulatif})
            </title>
          </rect>
        );
      })}

      {area && (
        <polygon points={area} className="fill-amber-100" opacity={0.55} />
      )}
      <polyline
        points={pts}
        fill="none"
        className="stroke-amber-600"
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {noktalar.map((p, i) => {
        if (!etiketGoster(i)) return null;
        const cx = xAt(i);
        const cy = yKum(p.kumulatif);
        const deltaY = Math.min(H - 22, cy + 14);
        return (
          <g key={p.gun}>
            <circle
              cx={cx}
              cy={cy}
              r={3.5}
              className="fill-amber-700 stroke-white"
              strokeWidth={1.5}
            >
              <title>
                {p.gun}: {p.kumulatif} kullanıcı (+{p.gunluk})
              </title>
            </circle>
            <text
              x={cx}
              y={Math.max(12, cy - 8)}
              textAnchor="middle"
              className="fill-slate-800"
              fontSize={10}
              fontWeight={600}
            >
              {p.kumulatif}
            </text>
            <text
              x={cx}
              y={deltaY}
              textAnchor="middle"
              className="fill-amber-800"
              fontSize={9}
              fontWeight={600}
            >
              +{p.gunluk}
            </text>
            <text
              x={cx}
              y={H - 10}
              textAnchor="middle"
              className="fill-slate-400"
              fontSize={9}
            >
              {gunEtiket(p.gun)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function KullaniciSayisiGrafik({
  seri,
}: {
  seri: CekiciKayitGunNokta[];
}) {
  const [pencere, setPencere] = useState<Pencere>(90);

  const gorunen = useMemo(
    () => cekiciKayitSerisiPencere(seri, pencere),
    [seri, pencere]
  );

  const son = gorunen[gorunen.length - 1];
  const toplamGunluk = gorunen.reduce((a, n) => a + n.gunluk, 0);

  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-800">Kullanıcı sayısı</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Kayıtlı çekiciler (tester hariç) · Europe/Istanbul
            {son
              ? ` · son: ${son.kumulatif} · pencerede +${toplamGunluk}`
              : ""}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-0.5 w-3 rounded bg-amber-600"
                aria-hidden
              />
              Kümülatif
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-300"
                aria-hidden
              />
              Günlük
            </span>
          </p>
        </div>
        <div className="flex rounded-xl border border-slate-200 p-0.5 bg-slate-50">
          {(
            [
              [30, "30g"],
              [90, "90g"],
              ["hepsi", "Tümü"],
            ] as const
          ).map(([id, etiket]) => (
            <button
              key={String(id)}
              type="button"
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                pencere === id
                  ? "bg-white shadow text-slate-900"
                  : "text-slate-600"
              }`}
              onClick={() => setPencere(id)}
            >
              {etiket}
            </button>
          ))}
        </div>
      </div>

      <KullaniciSayisiSvg noktalar={gorunen} />
    </Card>
  );
}
