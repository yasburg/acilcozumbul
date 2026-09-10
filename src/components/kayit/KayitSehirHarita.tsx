"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
const KAYDIR_SONRASI_MS = 520;
const OLCEK_MIN = 1.9;
const OLCEK_MAX = 8;
/** Sticky nav / üst güvenli alan — harita bu çizginin altında görünmeli. */
const KAYDIR_UST_PAY_PX = 72;

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

/**
 * Kenar illerde (İstanbul, İzmir…) etiketi içeri kaydırır / textAnchor
 * değiştirir; böylece taşan harfler viewBox dışında kesilmez.
 */
function etiketKonumu(
  merkez: { x: number; y: number },
  metin: string,
  fontSize: number
): { x: number; y: number; textAnchor: "start" | "middle" | "end" } {
  const tahminiYarim = (metin.length * fontSize * 0.58) / 2;
  const pay = Math.max(6, fontSize * 0.35);
  let x = merkez.x;
  let textAnchor: "start" | "middle" | "end" = "middle";

  if (merkez.x - tahminiYarim < pay) {
    textAnchor = "start";
    x = Math.max(pay, merkez.x);
  } else if (merkez.x + tahminiYarim > HARITA_W - pay) {
    textAnchor = "end";
    x = Math.min(HARITA_W - pay, merkez.x);
  }

  const y = Math.min(
    HARITA_H - fontSize * 0.25,
    Math.max(fontSize * 0.9, merkez.y + fontSize * 0.35)
  );

  return { x, y, textAnchor };
}

function haritaGorunurMu(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= KAYDIR_UST_PAY_PX &&
    rect.bottom <= window.innerHeight - 12 &&
    rect.top < window.innerHeight &&
    rect.bottom > 0
  );
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
  const kokRef = useRef<HTMLDivElement>(null);
  const [faz, setFaz] = useState<Faz>("genel");
  /** Yakınlaştırma hedefi — scroll bitene kadar eski şehirde kalır. */
  const [ucusSehir, setUcusSehir] = useState(sehir);

  useEffect(() => {
    if (!sehir) {
      setUcusSehir("");
      setFaz("genel");
      return;
    }

    let iptal = false;
    let timer = 0;
    const el = kokRef.current;
    const kaydir = el ? !haritaGorunurMu(el) : false;

    if (kaydir && el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    const bekleMs = kaydir ? KAYDIR_SONRASI_MS : ILK_UCUS_GECIKME_MS;
    timer = window.setTimeout(() => {
      if (iptal) return;
      setUcusSehir(sehir);
      setFaz("geciyor");
    }, bekleMs);

    return () => {
      iptal = true;
      window.clearTimeout(timer);
    };
  }, [sehir]);

  const veriUcus = ilSinirBul(ucusSehir);
  const olcekUcus = veriUcus ? ilOlcegiHesapla(veriUcus.kutu) : 1;

  const donusum =
    faz === "genel" || !veriUcus
      ? "translate(0px, 0px) scale(1)"
      : `translate(${MERKEZ_X - veriUcus.merkez.x * olcekUcus}px, ${
          MERKEZ_Y - veriUcus.merkez.y * olcekUcus
        }px) scale(${olcekUcus})`;

  const noktalar =
    faz === "yerlesti" && ucusSehir
      ? talepNoktalariUret(ucusSehir, olcekUcus)
      : [];
  const talep = useMemo(
    () => sehirYolYardimTalepParcalari(ucusSehir || sehir),
    [ucusSehir, sehir]
  );

  const etiketFont = birim(7.5, 1);
  const oneCikanEtiketler = useMemo(() => {
    return DESTEKLENEN_ILLER.flatMap((il) => {
      if (!ONE_CIKAN_ILLER.has(il)) return [];
      const veri = TURKIYE_IL_SINIR[il];
      if (!veri) return [];
      const konum = etiketKonumu(veri.merkez, il, etiketFont);
      return [{ il, ...konum }];
    });
  }, [etiketFont]);

  function gecisBittiginde(e: React.TransitionEvent<SVGGElement>) {
    if (e.target !== e.currentTarget || e.propertyName !== "transform") return;
    setFaz("yerlesti");
  }

  return (
    <div
      ref={kokRef}
      className={`relative w-full overflow-hidden rounded-[var(--acb-radius-lg)] border border-slate-200 bg-gradient-to-b from-[#eef8f1] to-[#eef3f0] shadow-[var(--acb-shadow)] ${className}`}
    >
      <svg
        viewBox={TURKIYE_IL_SINIR_VIEWBOX}
        className="h-[240px] w-full overflow-visible xs:h-[270px] sm:h-[320px]"
        role="img"
        aria-label={
          sehir
            ? `Türkiye haritası, seçili şehir: ${sehir}`
            : "Türkiye haritası, şehir seçin"
        }
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
            return (
              <path
                key={il}
                d={ilYoluOlustur(veri)}
                fill={secili ? "#5fbf7a" : "#dcefe1"}
                fillOpacity={secili ? 0.85 : 1}
                stroke="#ffffff"
                strokeWidth={0.9}
                strokeLinejoin="round"
                onClick={() => onSehirSec(il)}
                className="cursor-pointer touch-manipulation transition-[fill-opacity] duration-150 hover:fill-opacity-80"
              />
            );
          })}

          {/* Etiketler tüm illerin üstünde — sonraki path'ler yazıyı örtmesin */}
          {faz === "genel" &&
            oneCikanEtiketler.map(({ il, x, y, textAnchor }) => (
              <text
                key={`etiket-${il}`}
                x={x}
                y={y}
                textAnchor={textAnchor}
                fontSize={etiketFont}
                fontWeight={700}
                fill="#3c4f45"
                className="pointer-events-none select-none"
                style={{
                  paintOrder: "stroke",
                  stroke: "#eef6f0",
                  strokeWidth: etiketFont * 0.22,
                }}
              >
                {il}
              </text>
            ))}

          {faz === "yerlesti" && veriUcus && (
            <path
              d={ilYoluOlustur(veriUcus)}
              fill="var(--acb-green)"
              fillOpacity={0.14}
              stroke="var(--acb-green)"
              strokeOpacity={0.7}
              strokeWidth={birim(2, olcekUcus)}
              strokeLinejoin="round"
              filter="url(#acb-harita-golge)"
              className="acb-harita-vurgu-in pointer-events-none"
            />
          )}

          {veriUcus && faz !== "genel" && (
            <g
              key={ucusSehir}
              transform={`translate(${veriUcus.merkez.x}, ${veriUcus.merkez.y})`}
            >
              <circle
                r={birim(16, olcekUcus)}
                fill="none"
                stroke="var(--acb-green)"
                strokeWidth={birim(2, olcekUcus)}
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
                    strokeWidth={birim(1.1, olcekUcus)}
                    className={
                      n.kalici
                        ? "acb-harita-talep-belir acb-harita-talep-nabiz"
                        : "acb-harita-talep-belir"
                    }
                    style={{ animationDelay: `${n.delayMs}ms` }}
                  />
                ))}

              <circle
                r={birim(8, olcekUcus)}
                fill="#ffffff"
                stroke="var(--acb-green)"
                strokeWidth={birim(2.4, olcekUcus)}
                className="acb-harita-pin-drop"
              />
              <circle
                r={birim(3.4, olcekUcus)}
                fill="var(--acb-green)"
                className="acb-harita-pin-drop"
              />

              <text
                y={-birim(15, olcekUcus)}
                textAnchor="middle"
                fontSize={birim(13, olcekUcus)}
                fontWeight={700}
                fill="var(--acb-dark)"
                className="acb-harita-pin-drop select-none"
                style={{
                  paintOrder: "stroke",
                  stroke: "#ffffff",
                  strokeWidth: birim(3, olcekUcus),
                }}
              >
                {ucusSehir}
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
