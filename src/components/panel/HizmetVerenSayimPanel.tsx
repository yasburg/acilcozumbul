"use client";

import { Card } from "@/components/ui";
import {
  hizmetVerenEtiket,
  type HizmetVerenSayimOzet,
} from "@/lib/hizmet-veren-sayim";
import { sorunTipiBul } from "@/lib/sorun-tipleri";
import { SorunIkon } from "@/lib/acb-icons";

export function HizmetVerenSayimPanel({
  ozet,
}: {
  ozet: HizmetVerenSayimOzet;
}) {
  const gorunur = ozet.satirlar.filter((s) => s.aktif > 0);

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-semibold text-slate-900">Hizmet verenler</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Hizmet tipine göre kayıtlı ve şu an müsait (çalışma saati içinde)
          </p>
        </div>
        <div className="text-right text-xs text-slate-500">
          <p>
            <span className="font-semibold text-emerald-700">
              {ozet.benzersizCevrimici}
            </span>{" "}
            / {ozet.benzersizAktif} çekici çevrimiçi
          </p>
        </div>
      </div>

      {gorunur.length === 0 ? (
        <p className="text-sm text-slate-500">Kayıtlı hizmet veren yok.</p>
      ) : (
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                <th className="pb-2 pr-3 font-medium">Hizmet</th>
                <th className="pb-2 px-3 font-medium text-right">Kayıtlı</th>
                <th className="pb-2 pl-3 font-medium text-right">Çevrimiçi</th>
              </tr>
            </thead>
            <tbody>
              {gorunur.map((s) => {
                const tip = sorunTipiBul(s.sorunTipi);
                return (
                  <tr
                    key={s.sorunTipi}
                    className="border-b border-slate-50 last:border-0"
                  >
                    <td className="py-2.5 pr-3">
                      {tip ? (
                        <SorunIkon
                          id={tip.id}
                          className="mr-1.5 inline-block size-4 align-[-2px]"
                        />
                      ) : null}
                      <span className="text-slate-800">
                        {tip?.label ?? s.sorunTipi}
                      </span>
                      <span className="block text-xs text-slate-400">
                        {hizmetVerenEtiket(s.sorunTipi)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-medium text-slate-700">
                      {s.aktif}
                    </td>
                    <td className="py-2.5 pl-3 text-right tabular-nums font-semibold text-emerald-700">
                      {s.cevrimici}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
