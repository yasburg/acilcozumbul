"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";

type Ozet = {
  funnel: string;
  etiket: string;
  yol: string;
  goruldu: number;
  otpGonder: number;
  hesap: number;
  panelHazir: number;
  otpOran: number | null;
  hesapOran: number | null;
  hazirOran: number | null;
};

function yuzde(oran: number | null): string {
  if (oran == null) return "—";
  return `${(oran * 100).toFixed(1)}%`;
}

export default function PanelKayitFunnelsPage() {
  const [liste, setListe] = useState<Ozet[]>([]);
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(true);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    setHata("");
    try {
      const res = await fetch("/api/panel/kayit-funnels", {
        credentials: "include",
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error ?? "Yüklenemedi.");
      setListe(d.liste ?? []);
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Yüklenemedi.");
      setListe([]);
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex flex-wrap justify-between gap-2 items-end">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Kayıt funnelleri</h1>
          <p className="text-sm text-slate-500 mt-1">
            `/kayit/a` … `/kayit/d` görüntülenme → OTP → hesap → kurulum
            tamam oranları.
          </p>
        </div>
        <button
          type="button"
          className="text-sm font-medium text-amber-700"
          onClick={() => void yukle()}
        >
          Yenile
        </button>
      </div>

      {yukleniyor && <p className="text-sm text-slate-500">Yükleniyor…</p>}
      {hata && <p className="text-sm text-red-600">{hata}</p>}

      {!yukleniyor && !hata && (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="px-3 py-2">Funnel</th>
                <th className="px-3 py-2">Link</th>
                <th className="px-3 py-2 tabular-nums">Görülme</th>
                <th className="px-3 py-2 tabular-nums">OTP</th>
                <th className="px-3 py-2 tabular-nums">Hesap</th>
                <th className="px-3 py-2 tabular-nums">Hazır</th>
                <th className="px-3 py-2 tabular-nums">OTP%</th>
                <th className="px-3 py-2 tabular-nums">Hesap%</th>
                <th className="px-3 py-2 tabular-nums">Hazır/hesap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {liste.map((r) => (
                <tr key={r.funnel} className="hover:bg-slate-50/80">
                  <td className="px-3 py-2 font-semibold text-slate-900">
                    {r.funnel.toUpperCase()}
                    <span className="block text-xs font-normal text-slate-500">
                      {r.etiket}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      href={r.yol}
                      className="text-amber-700 text-xs font-medium"
                      target="_blank"
                    >
                      {r.yol}
                    </Link>
                  </td>
                  <td className="px-3 py-2 tabular-nums">{r.goruldu}</td>
                  <td className="px-3 py-2 tabular-nums">{r.otpGonder}</td>
                  <td className="px-3 py-2 tabular-nums">{r.hesap}</td>
                  <td className="px-3 py-2 tabular-nums">{r.panelHazir}</td>
                  <td className="px-3 py-2 tabular-nums">{yuzde(r.otpOran)}</td>
                  <td className="px-3 py-2 tabular-nums">
                    {yuzde(r.hesapOran)}
                  </td>
                  <td className="px-3 py-2 tabular-nums">
                    {yuzde(r.hazirOran)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
