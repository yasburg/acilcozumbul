"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui";
import {
  cekiciKayitSerisiPencere,
  type CekiciKayitGunNokta,
} from "@/lib/cekici-kayit-serisi";

type Mod = "kumulatif" | "gunluk";
type Pencere = 30 | 90 | "hepsi";

function gunEtiket(gun: string): string {
  const [, m, d] = gun.split("-");
  return `${d}.${m}`;
}

function KullaniciSayisiSvg({
  noktalar,
  mod,
}: {
  noktalar: CekiciKayitGunNokta[];
  mod: Mod;
}) {
  const W = 640;
  const H = 220;
  const padL = 40;
  const padR = 12;
  const padT = 16;
  const padB = 36;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const degerler = noktalar.map((n) =>
    mod === "kumulatif" ? n.kumulatif : n.gunluk
  );
  const maxY = Math.max(1, ...degerler);
  const n = Math.max(1, noktalar.length - 1);

  const xAt = (i: number) =>
    padL + (noktalar.length <= 1 ? plotW / 2 : (i / n) * plotW);
  const yAt = (v: number) => padT + plotH - (v / maxY) * plotH;

  const etiketAdim = Math.max(1, Math.ceil(noktalar.length / 8));
  const yTickler = [0, Math.round(maxY / 2), maxY].filter(
    (v, i, a) => a.indexOf(v) === i
  );

  if (mod === "gunluk") {
    const barW = Math.max(
      2,
      Math.min(18, (plotW / Math.max(1, noktalar.length)) * 0.7)
    );
    return (
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label="Günlük kullanıcı kaydı"
      >
        {yTickler.map((v) => (
          <g key={v}>
            <line
              x1={padL}
              x2={W - padR}
              y1={yAt(v)}
              y2={yAt(v)}
              stroke="#e2e8f0"
              strokeWidth={1}
            />
            <text
              x={padL - 6}
              y={yAt(v) + 3}
              textAnchor="end"
              className="fill-slate-400"
              fontSize={10}
            >
              {v}
            </text>
          </g>
        ))}
        {noktalar.map((p, i) => {
          const h = Math.max(0, (p.gunluk / maxY) * plotH);
          const x = xAt(i) - barW / 2;
          const y = padT + plotH - h;
          return (
            <g key={p.gun}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={h}
                rx={2}
                className="fill-amber-500"
              >
                <title>
                  {p.gun}: {p.gunluk} kayıt
                </title>
              </rect>
              {i % etiketAdim === 0 || i === noktalar.length - 1 ? (
                <text
                  x={xAt(i)}
                  y={H - 10}
                  textAnchor="middle"
                  className="fill-slate-400"
                  fontSize={9}
                >
                  {gunEtiket(p.gun)}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    );
  }

  const pts = noktalar
    .map((p, i) => `${xAt(i)},${yAt(p.kumulatif)}`)
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
      aria-label="Kümülatif kullanıcı sayısı"
    >
      {yTickler.map((v) => (
        <g key={v}>
          <line
            x1={padL}
            x2={W - padR}
            y1={yAt(v)}
            y2={yAt(v)}
            stroke="#e2e8f0"
            strokeWidth={1}
          />
          <text
            x={padL - 6}
            y={yAt(v) + 3}
            textAnchor="end"
            className="fill-slate-400"
            fontSize={10}
          >
            {v}
          </text>
        </g>
      ))}
      {area && (
        <polygon points={area} className="fill-amber-100" opacity={0.9} />
      )}
      <polyline
        points={pts}
        fill="none"
        className="stroke-amber-600"
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {noktalar.map((p, i) =>
        i % etiketAdim === 0 || i === noktalar.length - 1 ? (
          <text
            key={p.gun}
            x={xAt(i)}
            y={H - 10}
            textAnchor="middle"
            className="fill-slate-400"
            fontSize={9}
          >
            {gunEtiket(p.gun)}
          </text>
        ) : null
      )}
      {noktalar.length > 0 && (
        <circle
          cx={xAt(noktalar.length - 1)}
          cy={yAt(noktalar[noktalar.length - 1]!.kumulatif)}
          r={3.5}
          className="fill-amber-700"
        >
          <title>
            {noktalar[noktalar.length - 1]!.gun}:{" "}
            {noktalar[noktalar.length - 1]!.kumulatif} kullanıcı
          </title>
        </circle>
      )}
    </svg>
  );
}

export function KullaniciSayisiGrafik({
  seri,
}: {
  seri: CekiciKayitGunNokta[];
}) {
  const [mod, setMod] = useState<Mod>("kumulatif");
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
              ? mod === "kumulatif"
                ? ` · son: ${son.kumulatif}`
                : ` · pencerede ${toplamGunluk} kayıt`
              : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-xl border border-slate-200 p-0.5 bg-slate-50">
            {(
              [
                ["kumulatif", "Kümülatif"],
                ["gunluk", "Günlük"],
              ] as const
            ).map(([id, etiket]) => (
              <button
                key={id}
                type="button"
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                  mod === id
                    ? "bg-white shadow text-slate-900"
                    : "text-slate-600"
                }`}
                onClick={() => setMod(id)}
              >
                {etiket}
              </button>
            ))}
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
      </div>

      <KullaniciSayisiSvg noktalar={gorunen} mod={mod} />
    </Card>
  );
}
