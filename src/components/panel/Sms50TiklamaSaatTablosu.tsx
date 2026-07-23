"use client";

type SaatIzgarasi = {
  grid: number[][];
  gunToplam: number[];
  saatToplam: number[];
  toplam: number;
  maxHucre: number;
};

const GUNLER = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"] as const;

function hucreRengi(deger: number, max: number, toplamMu: boolean): string {
  if (deger <= 0) {
    return toplamMu ? "bg-violet-50 text-slate-400" : "bg-violet-50/80 text-slate-400";
  }
  const oran = max > 0 ? deger / max : 0;
  if (toplamMu) {
    if (oran >= 0.75) return "bg-teal-700 text-white";
    if (oran >= 0.45) return "bg-violet-700 text-white";
    if (oran >= 0.2) return "bg-violet-500 text-white";
    return "bg-violet-300 text-violet-950";
  }
  if (oran >= 0.75) return "bg-violet-600 text-white";
  if (oran >= 0.45) return "bg-violet-400 text-white";
  if (oran >= 0.2) return "bg-violet-300 text-violet-950";
  return "bg-violet-200 text-violet-900";
}

export function Sms50TiklamaSaatTablosu({ data }: { data: SaatIzgarasi }) {
  const maxGun = Math.max(1, ...data.gunToplam);
  const maxSaat = Math.max(1, ...data.saatToplam);
  const maxHucre = Math.max(1, data.maxHucre);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap justify-between gap-2 items-end">
        <div>
          <h3 className="font-semibold text-slate-800">Tıklama zamanı</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Gün × saat (Europe/Istanbul). Toplam: {data.toplam}
          </p>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white p-2">
        <table className="border-separate border-spacing-0.5 text-[10px] leading-none mx-auto">
          <thead>
            <tr>
              <th className="w-8 p-0" />
              {Array.from({ length: 24 }, (_, h) => (
                <th
                  key={h}
                  className="w-5 min-w-[1.25rem] pb-1 font-medium text-slate-400 text-center"
                >
                  {h}
                </th>
              ))}
              <th className="w-6 min-w-[1.5rem] pb-1 font-semibold text-slate-500 text-center">
                Tüm
              </th>
            </tr>
          </thead>
          <tbody>
            {GUNLER.map((gunEtiket, gun) => (
              <tr key={gunEtiket}>
                <th className="pr-1 text-right font-medium text-slate-500 whitespace-nowrap">
                  {gunEtiket}
                </th>
                {Array.from({ length: 24 }, (_, saat) => {
                  const v = data.grid[gun]?.[saat] ?? 0;
                  return (
                    <td key={saat} className="p-0">
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-sm tabular-nums ${hucreRengi(v, maxHucre, false)}`}
                        title={`${gunEtiket} ${saat}:00 — ${v}`}
                      >
                        {v}
                      </div>
                    </td>
                  );
                })}
                <td className="p-0">
                  <div
                    className={`flex h-5 w-6 items-center justify-center rounded-sm tabular-nums font-semibold ${hucreRengi(data.gunToplam[gun] ?? 0, maxGun, true)}`}
                    title={`${gunEtiket} toplam — ${data.gunToplam[gun] ?? 0}`}
                  >
                    {data.gunToplam[gun] ?? 0}
                  </div>
                </td>
              </tr>
            ))}
            <tr>
              <th className="pr-1 text-right font-semibold text-slate-600 pt-0.5">
                Tüm
              </th>
              {Array.from({ length: 24 }, (_, saat) => {
                const v = data.saatToplam[saat] ?? 0;
                return (
                  <td key={saat} className="p-0 pt-0.5">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-sm tabular-nums font-semibold ${hucreRengi(v, maxSaat, true)}`}
                      title={`Saat ${saat} toplam — ${v}`}
                    >
                      {v}
                    </div>
                  </td>
                );
              })}
              <td className="p-0 pt-0.5">
                <div
                  className={`flex h-5 w-6 items-center justify-center rounded-sm tabular-nums font-bold ${hucreRengi(data.toplam, Math.max(1, data.toplam), true)}`}
                  title={`Genel toplam — ${data.toplam}`}
                >
                  {data.toplam}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
