"use client";

import { useEffect, useMemo, useState } from "react";
import {
  TURKIYE_IL_SINIR_VIEWBOX,
  TURKIYE_IL_SINIR_GENISLIK,
  TURKIYE_IL_SINIR_YUKSEKLIK,
  TURKIYE_IL_SINIR,
  type IlSinirVerisi,
  ilSinirBul,
  ilYoluOlustur,
  ilIcindeRastgeleNokta,
} from "@/lib/turkiye-il-sinir";
import { DESTEKLENEN_ILLER } from "@/lib/il-ilce";
import { enBuyukIller, sehirYolYardimTalepParcalari } from "@/lib/turkiye-il-nufus";

const HARITA_W = TURKIYE_IL_SINIR_GENISLIK;
const HARITA_H = TURKIYE_IL_SINIR_YUKSEKLIK;
const MERKEZ_X = HARITA_W / 2;
const MERKEZ_Y = HARITA_H / 2;
const GECIS_MS = 600;
const ILK_UCUS_GECIKME_MS = 250;
const OLCEK_MIN = 1.9;
const OLCEK_MAX = 8;

/**
 * Haritanın kart genişliği responsive olduğundan gerçek ekran-px karşılığı
 * bilinemez; tipik mobil kapsayıcı genişliği varsayılarak SVG birimlerine
 * kabaca kalibre edilir (dar ekranlarda biraz büyük, geniş ekranlarda biraz
 * küçük görünür — ikisi de kabul edilebilir).
 */
const KALIBRASYON_GENISLIK_PX = 380;

function birim(ekranPx: number, olcek: number): number {
  return (ekranPx * HARITA_W) / (olcek * KALIBRASYON_GENISLIK_PX);
}

const ONE_CIKAN_ILLER = new Set(enBuyukIller(6));

function tohum(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a: number) {
  return function rastgele() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Seçili ilin tamamı (adalar / Boğaz'ın iki yakası dahil) kart içinde
 * güzelce çerçevelenecek şekilde yakınlaştırma ölçeğini hesaplar. */
function ilOlcegiHesapla(kutu: IlSinirVerisi["kutu"]): number {
  const genislik = Math.max(1, kutu.maxX - kutu.minX);
  const yukseklik = Math.max(1, kutu.maxY - kutu.minY);
  const oranX = (HARITA_W * 0.58) / genislik;
  const oranY = (HARITA_H * 0.78) / yukseklik;
  return Math.min(OLCEK_MAX, Math.max(OLCEK_MIN, Math.min(oranX, oranY)));
}

type TalepNoktasi = {
  id: string;
  cx: number;
  cy: number;
  r: number;
  delayMs: number;
  kalici: boolean;
};

/** Talep noktalarını ilin gerçek sınırı içinde (deniz/komşu ile taşmadan)
 * reddetme örneklemesiyle üretir. */
function talepNoktalariUret(sehir: string, olcek: number): TalepNoktasi[] {
  const veri = ilSinirBul(sehir);
  if (!veri) return [];
  const rasgele = mulberry32(tohum(sehir));
  const adet = 8 + Math.floor(rasgele() * 5);
  const noktalar: TalepNoktasi[] = [];
  for (let i = 0; i < adet; i++) {
    const nokta = ilIcindeRastgeleNokta(sehir, rasgele);
    if (!nokta) continue;
    noktalar.push({
      id: `${sehir}-${i}`,
      cx: nokta.x - veri.merkez.x,
      cy: nokta.y - veri.merkez.y,
      r: birim(3 + rasgele() * 2.2, olcek),
      delayMs: Math.round(i * 32 + rasgele() * 30),
      kalici: i % 3 === 0,
    });
  }
  return noktalar;
}

type Faz = "genel" | "geciyor" | "yerlesti";

export function KayitSehirHarita({
  sehir,
  onSehirSec,
  className = "",
}: {
  sehir: string;
  onSehirSec: (il: string) => void;
  className?: string;
}) {
  const [faz, setFaz] = useState<Faz>("genel");

  // Şehir değişince (arama/GPS/başka bir nokta) harita zaten yakınlaşmışsa
  // doğrudan yeni konuma kayar — render sırasında state ayarlamak, React'ın
  // "prop değişince state uyarlama" deseni: fazladan bir effect turu olmadan
  // aynı render geçişinde uygulanır.
  const [izlenenSehir, setIzlenenSehir] = useState(sehir);
  if (sehir !== izlenenSehir) {
    setIzlenenSehir(sehir);
    if (faz !== "genel") setFaz("geciyor");
  }

  useEffect(() => {
    const t = window.setTimeout(() => {
      setFaz((f) => (f === "genel" ? "geciyor" : f));
    }, ILK_UCUS_GECIKME_MS);
    return () => window.clearTimeout(t);
    // Yalnızca ilk yüklemede tetiklenir; sonraki şehir değişimleri yukarıdaki
    // render-sırası uyarlamasıyla yönetilir.
  }, []);

  const veriSecili = ilSinirBul(sehir);
  const olcekSecili = veriSecili ? ilOlcegiHesapla(veriSecili.kutu) : 1;

  const donusum =
    faz === "genel" || !veriSecili
      ? "translate(0px, 0px) scale(1)"
      : `translate(${MERKEZ_X - veriSecili.merkez.x * olcekSecili}px, ${
          MERKEZ_Y - veriSecili.merkez.y * olcekSecili
        }px) scale(${olcekSecili})`;

  const noktalar = faz === "yerlesti" ? talepNoktalariUret(sehir, olcekSecili) : [];
  const talep = useMemo(() => sehirYolYardimTalepParcalari(sehir), [sehir]);

  function gecisBittiginde(e: React.TransitionEvent<SVGGElement>) {
    if (e.target !== e.currentTarget || e.propertyName !== "transform") return;
    setFaz("yerlesti");
  }

  return (
    <div
      className={`relative w-full overflow-hidden rounded-[var(--acb-radius-lg)] border border-slate-200 bg-gradient-to-b from-[#eef8f1] to-[#eef3f0] shadow-[var(--acb-shadow)] ${className}`}
    >
      <svg
        viewBox={TURKIYE_IL_SINIR_VIEWBOX}
        className="h-[240px] w-full xs:h-[270px] sm:h-[320px]"
        role="img"
        aria-label={`Türkiye haritası, seçili şehir: ${sehir}`}
      >
        <defs>
          <radialGradient id="acb-harita-zemin" cx="50%" cy="35%" r="80%">
            <stop offset="0%" stopColor="#f0faf3" />
            <stop offset="100%" stopColor="#e3f1e8" />
          </radialGradient>
          <filter
            id="acb-harita-golge"
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >
            <feDropShadow
              dx="0"
              dy="1.2"
              stdDeviation="2.4"
              floodColor="#0f2f1c"
              floodOpacity="0.16"
            />
          </filter>
        </defs>

        <rect width={HARITA_W} height={HARITA_H} fill="url(#acb-harita-zemin)" />

        <g
          onTransitionEnd={gecisBittiginde}
          style={{
            transform: donusum,
            transformOrigin: "0px 0px",
            transition: `transform ${GECIS_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
          }}
        >
          {DESTEKLENEN_ILLER.map((il) => {
            const veri = TURKIYE_IL_SINIR[il];
            if (!veri) return null;
            const secili = il === sehir;
            const oneCikan = ONE_CIKAN_ILLER.has(il);
            const genel = faz === "genel";
            return (
              <g key={il}>
                <path
                  d={ilYoluOlustur(veri)}
                  fill={secili ? "#5fbf7a" : "#dcefe1"}
                  fillOpacity={secili ? 0.85 : 1}
                  stroke="#ffffff"
                  strokeWidth={0.9}
                  strokeLinejoin="round"
                  onClick={() => onSehirSec(il)}
                  className="cursor-pointer touch-manipulation transition-[fill-opacity] duration-150 hover:fill-opacity-80"
                />
                {oneCikan && genel && (
                  <text
                    x={veri.merkez.x}
                    y={veri.merkez.y}
                    textAnchor="middle"
                    fontSize={birim(8.5, 1)}
                    fontWeight={700}
                    fill="#3c4f45"
                    className="pointer-events-none select-none"
                  >
                    {il}
                  </text>
                )}
              </g>
            );
          })}

          {faz === "yerlesti" && veriSecili && (
            <path
              d={ilYoluOlustur(veriSecili)}
              fill="var(--acb-green)"
              fillOpacity={0.14}
              stroke="var(--acb-green)"
              strokeOpacity={0.7}
              strokeWidth={birim(2, olcekSecili)}
              strokeLinejoin="round"
              filter="url(#acb-harita-golge)"
              className="acb-harita-vurgu-in pointer-events-none"
            />
          )}

          {veriSecili && (
            <g
              key={sehir}
              transform={`translate(${veriSecili.merkez.x}, ${veriSecili.merkez.y})`}
            >
              <circle
                r={birim(16, olcekSecili)}
                fill="none"
                stroke="var(--acb-green)"
                strokeWidth={birim(2, olcekSecili)}
                className="acb-harita-pin-ping"
              />

              {faz === "yerlesti" &&
                noktalar.map((n) => (
                  <circle
                    key={n.id}
                    cx={n.cx}
                    cy={n.cy}
                    r={n.r}
                    fill="#ffffff"
                    stroke="var(--acb-green)"
                    strokeWidth={birim(1.1, olcekSecili)}
                    className={
                      n.kalici
                        ? "acb-harita-talep-belir acb-harita-talep-nabiz"
                        : "acb-harita-talep-belir"
                    }
                    style={{ animationDelay: `${n.delayMs}ms` }}
                  />
                ))}

              <circle
                r={birim(8, olcekSecili)}
                fill="#ffffff"
                stroke="var(--acb-green)"
                strokeWidth={birim(2.4, olcekSecili)}
                className="acb-harita-pin-drop"
              />
              <circle
                r={birim(3.4, olcekSecili)}
                fill="var(--acb-green)"
                className="acb-harita-pin-drop"
              />

              <text
                y={-birim(15, olcekSecili)}
                textAnchor="middle"
                fontSize={birim(13, olcekSecili)}
                fontWeight={700}
                fill="var(--acb-dark)"
                className="acb-harita-pin-drop select-none"
                style={{
                  paintOrder: "stroke",
                  stroke: "#ffffff",
                  strokeWidth: birim(3, olcekSecili),
                }}
              >
                {sehir}
              </text>
            </g>
          )}
        </g>
      </svg>

      {talep && (
        <div className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-[var(--acb-dark)] shadow-sm ring-1 ring-black/5 backdrop-blur">
          <span className="size-1.5 rounded-full bg-[var(--acb-green)] animate-pulse" />
          Günlük ~{talep.adetYazi} talep
        </div>
      )}
    </div>
  );
}
