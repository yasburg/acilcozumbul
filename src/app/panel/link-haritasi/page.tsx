import Link from "next/link";
import { Card } from "@/components/ui";
import { smsBaseUrl } from "@/lib/sms-base-url";
import { KAYIT_FUNNEL_VARSAYILAN } from "@/lib/kayit-funnel";
import {
  SMS50_KAMPANYA_KODU,
  sms50LinkHaritasi,
} from "@/lib/sms50-kampanya";

export default function PanelLinkHaritasiPage() {
  const base = smsBaseUrl();
  const satirlar = sms50LinkHaritasi(base);
  const ozel = satirlar.filter((s) => s.ozelHarita);

  return (
    <div className="space-y-4 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Link haritalama</h1>
        <p className="text-sm text-slate-500 mt-1">
          Kısa SMS linklerinin (`/sms50a` … `/sms50z`) hangi kayıt sayfasına
          gittiği ve kampanya kodunun nasıl eklendiği.
        </p>
      </div>

      <Card className="space-y-2 text-sm text-slate-700">
        <p>
          Varsayılan hedef:{" "}
          <code className="bg-slate-100 px-1 rounded">
            /kayit/{KAYIT_FUNNEL_VARSAYILAN}
          </code>{" "}
          · kampanya kodu{" "}
          <code className="bg-slate-100 px-1 rounded">{SMS50_KAMPANYA_KODU}</code>{" "}
          query ile otomatik dolar.
        </p>
        {ozel.length > 0 && (
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            {ozel.map((s) => (
              <li key={s.varyant}>
                <code className="font-mono">{s.kisaPath}</code> →{" "}
                <code className="font-mono">/kayit/{s.kayitFunnel}</code> (
                {s.kayitFunnelEtiket})
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-slate-500">
          Harita kaynağı:{" "}
          <code className="bg-slate-100 px-1 rounded">
            src/lib/sms50-kampanya.ts → SMS50_KAYIT_FUNNEL_HARITASI
          </code>
        </p>
      </Card>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
            <tr>
              <th className="px-3 py-2">Kısa link</th>
              <th className="px-3 py-2">Hedef kayıt</th>
              <th className="px-3 py-2">Kampanya</th>
              <th className="px-3 py-2">Tam yönlendirme</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {satirlar.map((s) => (
              <tr
                key={s.varyant}
                className={s.ozelHarita ? "bg-amber-50/60" : undefined}
              >
                <td className="px-3 py-2 align-top">
                  <a
                    href={s.kisaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-amber-800 hover:underline"
                  >
                    {s.kisaPath}
                  </a>
                  {s.ozelHarita && (
                    <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                      özel
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 align-top">
                  <Link
                    href={`/kayit/${s.kayitFunnel}`}
                    className="font-mono text-slate-800 hover:underline"
                  >
                    /kayit/{s.kayitFunnel}
                  </Link>
                  <span className="block text-xs text-slate-500 mt-0.5">
                    {s.kayitFunnelEtiket}
                  </span>
                </td>
                <td className="px-3 py-2 align-top font-mono text-xs">
                  {s.kampanyaKodu}
                </td>
                <td className="px-3 py-2 align-top max-w-md">
                  <a
                    href={s.hedefUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono text-slate-600 break-all hover:underline"
                  >
                    {s.hedefPath}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
