import {
  haritaYaricapLog,
  TURKIYE_HARITA,
  ilKoordinatBul,
  turkiyeProjeksiyon,
} from "@/lib/turkiye-il-koordinat";

type SehirAdet = { sehir: string; adet: number };

/**
 * Basitleştirilmiş Türkiye kara silüeti (WGS84 → aynı projeksiyon).
 * Kabaca kıyı hattı; illüstratif panel haritası için yeterli.
 */
const TURKIYE_SILUET_LON_LAT: [number, number][] = [
  [26.0, 41.85],
  [26.55, 41.7],
  [27.5, 41.75],
  [28.0, 41.95],
  [29.1, 41.25],
  [29.9, 41.35],
  [31.2, 41.55],
  [32.5, 41.75],
  [33.8, 42.05],
  [35.0, 42.0],
  [36.2, 41.55],
  [37.5, 41.15],
  [38.8, 41.05],
  [40.0, 41.15],
  [41.2, 41.35],
  [42.5, 41.3],
  [43.5, 41.15],
  [44.2, 40.0],
  [44.5, 39.5],
  [44.3, 37.6],
  [43.5, 37.1],
  [42.5, 37.2],
  [41.0, 37.0],
  [40.0, 36.9],
  [38.5, 36.7],
  [36.5, 36.0],
  [36.0, 35.9],
  [35.5, 36.2],
  [34.5, 36.3],
  [33.0, 36.2],
  [32.0, 36.5],
  [30.5, 36.2],
  [29.2, 36.6],
  [28.0, 36.7],
  [27.2, 37.0],
  [26.5, 37.8],
  [26.2, 38.5],
  [26.4, 39.3],
  [26.1, 39.8],
  [26.0, 40.5],
  [26.0, 41.85],
];

function siluetPath(): string {
  return TURKIYE_SILUET_LON_LAT.map(([lon, lat], i) => {
    const { x, y } = turkiyeProjeksiyon(lon, lat);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ") + " Z";
}

export function PanelCekiciHarita({
  sehirAdetleri,
  seciliSehir,
  onSehirSec,
}: {
  sehirAdetleri: SehirAdet[];
  seciliSehir?: string;
  onSehirSec?: (sehir: string) => void;
}) {
  const maxAdet = Math.max(0, ...sehirAdetleri.map((s) => s.adet));
  const noktalar = sehirAdetleri
    .map((s) => {
      const koor = ilKoordinatBul(s.sehir);
      if (!koor) return null;
      const { x, y } = turkiyeProjeksiyon(koor.lon, koor.lat);
      const r = haritaYaricapLog(s.adet, maxAdet);
      return { ...s, x, y, r };
    })
    .filter((n): n is NonNullable<typeof n> => n != null)
    /* Büyük daireler altta kalsın, küçükler üstte okunur */
    .sort((a, b) => b.r - a.r);

  const eslesmeyen = sehirAdetleri.filter((s) => !ilKoordinatBul(s.sehir));
  const { width, height } = TURKIYE_HARITA;

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-h-[240px]"
          role="img"
          aria-label="Şehir bazında çekici kayıt haritası"
        >
          <rect width={width} height={height} fill="#e8f1f8" />
          <path
            d={siluetPath()}
            fill="#f8fafc"
            stroke="#94a3b8"
            strokeWidth={2}
            strokeLinejoin="round"
          />
          {noktalar.map((n) => {
            const secili = seciliSehir === n.sehir;
            return (
              <g
                key={n.sehir}
                transform={`translate(${n.x}, ${n.y})`}
                className={onSehirSec ? "cursor-pointer" : undefined}
                onClick={() => onSehirSec?.(n.sehir)}
              >
                <title>
                  {n.sehir}: {n.adet} kayıt
                </title>
                <circle
                  r={n.r}
                  fill={secili ? "#f59e0b" : "#fbbf24"}
                  fillOpacity={0.85}
                  stroke={secili ? "#b45309" : "#d97706"}
                  strokeWidth={secili ? 2.5 : 1.5}
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="select-none"
                  fill="#78350f"
                  fontSize={Math.max(11, Math.min(16, n.r * 0.55))}
                  fontWeight={700}
                >
                  {n.adet}
                </text>
                {n.r >= 22 && (
                  <text
                    textAnchor="middle"
                    y={n.r + 12}
                    fill="#334155"
                    fontSize={11}
                    fontWeight={600}
                  >
                    {n.sehir}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <p className="text-xs text-slate-500">
        Daire boyutu kayıt sayısına göre logaritmik ölçeklenir. Şehre tıklayınca
        filtre uygulanır.
      </p>
      {eslesmeyen.length > 0 && (
        <p className="text-xs text-amber-700">
          Haritada konumlanamayan:{" "}
          {eslesmeyen.map((s) => `${s.sehir} (${s.adet})`).join(", ")}
        </p>
      )}
    </div>
  );
}
