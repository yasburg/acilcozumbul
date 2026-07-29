import {
  haritaYaricapLog,
  haritaSehirNoktalari,
  TURKIYE_HARITA,
  TURKIYE_HARITA_OUTLINE,
  ilKoordinatBul,
  turkiyeProjeksiyon,
} from "@/lib/turkiye-il-koordinat";

type SehirAdet = { sehir: string; adet: number };

type HaritaNokta = SehirAdet & {
  noktaId: string;
  x: number;
  y: number;
  r: number;
  etiketGoster: boolean;
};

/** Google Analytics benzeri renkler */
const RENK = {
  zemin: "#f8f9fa",
  kara: "#ffffff",
  sinir: "#dadce0",
  etiket: "#5f6368",
  mavi: "#1a73e8",
  maviSecili: "#174ea6",
} as const;

export function PanelCekiciHarita({
  sehirAdetleri,
  seciliSehir,
  onSehirSec,
  sayilariGizle = false,
}: {
  sehirAdetleri: SehirAdet[];
  seciliSehir?: string;
  onSehirSec?: (sehir: string) => void;
  /** Ekran paylaşımı — adet etiketlerini gizle */
  sayilariGizle?: boolean;
}) {
  const maxAdet = Math.max(0, ...sehirAdetleri.map((s) => s.adet));
  const noktalar: HaritaNokta[] = sehirAdetleri
    .flatMap((s) => {
      const koors = haritaSehirNoktalari(s.sehir);
      const r = sayilariGizle
        ? 10
        : haritaYaricapLog(s.adet, maxAdet);
      return koors.map((koor, i) => {
        const { x, y } = turkiyeProjeksiyon(koor.lon, koor.lat);
        return {
          ...s,
          noktaId: `${s.sehir}-${i}`,
          x,
          y,
          r,
          etiketGoster: i === 0,
        };
      });
    })
    .sort((a, b) => b.r - a.r);

  const eslesmeyen = sehirAdetleri.filter((s) => !ilKoordinatBul(s.sehir));
  const { width, height } = TURKIYE_HARITA;

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-h-[280px]"
          role="img"
          aria-label="Şehir bazında çekici kayıt haritası"
        >
          <defs>
            <filter id="harita-golge" x="-20%" y="-20%" width="140%" height="140%">
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
            filter="url(#harita-golge)"
          />

          {noktalar.map((n) => {
            const secili = seciliSehir === n.sehir;
            const renk = secili ? RENK.maviSecili : RENK.mavi;
            return (
              <g
                key={n.noktaId}
                transform={`translate(${n.x}, ${n.y})`}
                className={onSehirSec ? "cursor-pointer" : undefined}
                onClick={() => onSehirSec?.(n.sehir)}
              >
                <title>
                  {sayilariGizle ? n.sehir : `${n.sehir}: ${n.adet} kayıt`}
                </title>
                <circle
                  r={n.r}
                  fill={renk}
                  fillOpacity={secili ? 0.38 : 0.28}
                  stroke={renk}
                  strokeOpacity={0.45}
                  strokeWidth={1}
                />
                <circle r={3.5} fill="#ffffff" stroke={renk} strokeWidth={1.5} />
              </g>
            );
          })}

          {noktalar
            .filter((n) => n.etiketGoster)
            .map((n) => {
              const secili = seciliSehir === n.sehir;
              return (
                <g
                  key={`label-${n.noktaId}`}
                  transform={`translate(${n.x}, ${n.y + n.r + 12})`}
                  className={onSehirSec ? "cursor-pointer" : undefined}
                  onClick={() => onSehirSec?.(n.sehir)}
                >
                  <text
                    textAnchor="middle"
                    className="select-none"
                    fill={secili ? RENK.maviSecili : RENK.etiket}
                    fontSize={11}
                    fontWeight={secili ? 700 : 500}
                  >
                    {n.sehir}
                  </text>
                  {!sayilariGizle && (
                    <text
                      textAnchor="middle"
                      y={13}
                      className="select-none tabular-nums"
                      fill={secili ? RENK.maviSecili : "#80868b"}
                      fontSize={10}
                      fontWeight={600}
                    >
                      {n.adet} kayıt
                    </text>
                  )}
                </g>
              );
            })}
        </svg>
      </div>
      <p className="text-xs text-slate-500">
        {sayilariGizle
          ? "Sayılar gizli. Şehre tıklayınca filtre uygulanır."
          : "Daire boyutu kayıt sayısına göre logaritmik ölçeklenir. Şehre tıklayınca filtre uygulanır."}
      </p>
      {eslesmeyen.length > 0 && (
        <p className="text-xs text-amber-700">
          Haritada konumlanamayan:{" "}
          {sayilariGizle
            ? eslesmeyen.map((s) => s.sehir).join(", ")
            : eslesmeyen.map((s) => `${s.sehir} (${s.adet})`).join(", ")}
        </p>
      )}
    </div>
  );
}
