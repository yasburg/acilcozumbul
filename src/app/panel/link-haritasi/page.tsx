"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";
import { KAYIT_FUNNEL_VARSAYILAN } from "@/lib/kayit-funnel";
import { SMS50_KAMPANYA_KODU } from "@/lib/sms50-kampanya";
import type { Sms50LinkHaritaSatir } from "@/lib/sms50-kampanya";

type FunnelSecenek = { id: string; etiket: string };

export default function PanelLinkHaritasiPage() {
  const [satirlar, setSatirlar] = useState<Sms50LinkHaritaSatir[]>([]);
  const [funneller, setFunneller] = useState<FunnelSecenek[]>([]);
  const [loading, setLoading] = useState(true);
  const [hata, setHata] = useState<string | null>(null);
  const [kaydedilen, setKaydedilen] = useState<string | null>(null);
  const [bekleyen, setBekleyen] = useState<Set<string>>(new Set());

  const yukle = useCallback(async () => {
    setLoading(true);
    setHata(null);
    try {
      const r = await fetch("/api/panel/sms50-link-harita", {
        credentials: "include",
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error ?? "Yüklenemedi.");
      setSatirlar(j.satirlar ?? []);
      setFunneller(j.funneller ?? []);
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  const ozel = satirlar.filter((s) => s.ozelHarita);

  async function hedefDegistir(varyant: string, kayitFunnel: string) {
    const onceki = satirlar.find((s) => s.varyant === varyant);
    if (!onceki || onceki.kayitFunnel === kayitFunnel) return;

    setHata(null);
    setKaydedilen(null);
    setBekleyen((prev) => new Set(prev).add(varyant));
    setSatirlar((prev) =>
      prev.map((s) =>
        s.varyant === varyant
          ? {
              ...s,
              kayitFunnel: kayitFunnel as typeof s.kayitFunnel,
              kayitFunnelEtiket:
                funneller.find((f) => f.id === kayitFunnel)?.etiket ??
                s.kayitFunnelEtiket,
              ozelHarita: kayitFunnel !== KAYIT_FUNNEL_VARSAYILAN,
            }
          : s
      )
    );

    try {
      const r = await fetch("/api/panel/sms50-link-harita", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ varyant, kayitFunnel }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error ?? "Güncellenemedi.");
      if (j.satir) {
        setSatirlar((prev) =>
          prev.map((s) => (s.varyant === varyant ? j.satir : s))
        );
      }
      setKaydedilen(
        `/sms50${varyant} → /kayit/${kayitFunnel} kaydedildi.`
      );
    } catch (e) {
      if (onceki) {
        setSatirlar((prev) =>
          prev.map((s) => (s.varyant === varyant ? onceki : s))
        );
      }
      setHata(e instanceof Error ? e.message : "Güncellenemedi.");
    } finally {
      setBekleyen((prev) => {
        const n = new Set(prev);
        n.delete(varyant);
        return n;
      });
    }
  }

  return (
    <div className="space-y-4 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Link haritalama</h1>
        <p className="text-sm text-slate-500 mt-1">
          Kısa SMS linklerinin (`/sms50a` … `/sms50z`) hangi kayıt sayfasına
          gittiği ve kampanya kodunun nasıl eklendiği. Hedef kayıt sütunundan
          değiştirebilirsiniz.
        </p>
      </div>

      {hata && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {hata}
        </p>
      )}
      {kaydedilen && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
          {kaydedilen}
        </p>
      )}

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
          Değişiklikler veritabanına yazılır; kısa link tıklanınca hemen
          geçerli olur.
        </p>
      </Card>

      <Card className="overflow-x-auto p-0">
        {loading ? (
          <p className="px-3 py-8 text-sm text-slate-500 text-center">
            Yükleniyor…
          </p>
        ) : (
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
                    <select
                      className="w-full max-w-[16rem] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-800 disabled:opacity-50"
                      value={s.kayitFunnel}
                      disabled={bekleyen.has(s.varyant)}
                      onChange={(e) =>
                        void hedefDegistir(s.varyant, e.target.value)
                      }
                      aria-label={`${s.kisaPath} hedef kayıt`}
                    >
                      {funneller.map((f) => (
                        <option key={f.id} value={f.id}>
                          /kayit/{f.id} — {f.etiket}
                        </option>
                      ))}
                      {!funneller.some((f) => f.id === s.kayitFunnel) && (
                        <option value={s.kayitFunnel}>
                          /kayit/{s.kayitFunnel} — {s.kayitFunnelEtiket}
                        </option>
                      )}
                    </select>
                    <Link
                      href={`/kayit/${s.kayitFunnel}`}
                      className="mt-1 inline-block text-xs text-slate-500 hover:underline"
                    >
                      Önizle
                    </Link>
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
        )}
      </Card>
    </div>
  );
}
