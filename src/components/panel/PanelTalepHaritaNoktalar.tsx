import {
  TURKIYE_HARITA,
  TURKIYE_HARITA_OUTLINE,
  turkiyeProjeksiyon,
} from "@/lib/turkiye-il-koordinat";
import { panelTalepDurumEtiketi } from "@/lib/panel-talep";

export type TalepHaritaNokta = {
  id: string;
  lat: number;
  lng: number;
  sehir: string;
  ilce: string | null;
  durum: string;
  olusturulma: string;
};

const RENK = {
  zemin: "#f8f9fa",
  kara: "#ffffff",
  sinir: "#dadce0",
  nokta: "#ea580c",
  noktaSecili: "#c2410c",
  ihalede: "#f59e0b",
  anlasildi: "#059669",
  diger: "#64748b",
} as const;

function durumRenk(durum: string): string {
  if (durum === "ihalede" || durum === "yeniden_ihalede") return RENK.ihalede;
  if (durum === "anlaşıldı") return RENK.anlasildi;
  if (durum === "kazanan_belli") return RENK.nokta;
  return RENK.diger;
}

export function PanelTalepHaritaNoktalar({
  noktalar,
  seciliSehir,
  onNoktaSec,
  sayilariGizle = false,
}: {
  noktalar: TalepHaritaNokta[];
  seciliSehir?: string;
  onNoktaSec?: (id: string) => void;
  sayilariGizle?: boolean;
}) {
  const { width, height } = TURKIYE_HARITA;
  const gosterilen = seciliSehir
    ? noktalar.filter((n) => n.sehir === seciliSehir)
    : noktalar;

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-h-[280px]"
          role="img"
          aria-label="Türkiye talep haritası"
        >
          <defs>
            <filter id="talep-harita-golge" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.08" />
            </filter>
          </defs>

          <rect width={width} height={height} fill={RENK.zemin} />
          <path
            d={TURKIYE_HARITA_OUTLINE}
            fill={RENK.kara}
            stroke={RENK.sinir}
            strokeWidth={1.2}
            strokeLinejoin="round"
            filter="url(#talep-harita-golge)"
          />

          {gosterilen.map((n) => {
            const { x, y } = turkiyeProjeksiyon(n.lng, n.lat);
            const renk = durumRenk(n.durum);
            const yer = n.ilce ? `${n.ilce}, ${n.sehir}` : n.sehir;
            return (
              <g
                key={n.id}
                transform={`translate(${x}, ${y})`}
                className={onNoktaSec ? "cursor-pointer" : undefined}
                onClick={() => onNoktaSec?.(n.id)}
              >
                <title>
                  {yer} · {panelTalepDurumEtiketi(n.durum)} ·{" "}
                  {new Date(n.olusturulma).toLocaleString("tr-TR")}
                </title>
                <circle
                  r={5.5}
                  fill={renk}
                  fillOpacity={0.85}
                  stroke="#ffffff"
                  strokeWidth={1.5}
                />
              </g>
            );
          })}
        </svg>
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> İhalede
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-orange-600" /> Kazanan belli
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Anlaşıldı
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-500" /> Diğer
        </span>
        <span className="text-slate-400">
          {!sayilariGizle && (
            <>
              · {gosterilen.length} nokta
              {seciliSehir ? ` (${seciliSehir})` : ""}
            </>
          )}
        </span>
      </div>
    </div>
  );
}
