"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { Btn, Card } from "@/components/ui";
import {
  KREDI_PAKETLERI,
  type KrediPaketTl,
  krediPaketOdenecekTL,
} from "@/lib/kredi-fiyat";
import { formatKredi } from "@/lib/talep-utils";
import { cekiciFetch } from "@/lib/cekici-fetch";

export default function KrediPage() {
  const router = useRouter();
  const [kredi, setKredi] = useState(0);
  const [seciliPaket, setSeciliPaket] = useState<KrediPaketTl>(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const paket = KREDI_PAKETLERI.find((p) => p.tutarTL === seciliPaket)!;
  const odenecek = krediPaketOdenecekTL(paket);
  const indirimli = paket.indirimYuzde > 0;

  useEffect(() => {
    cekiciFetch("/api/cekici/me")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setKredi(d.kredi))
      .catch(() => router.push("/cekici/giris"));
  }, [router]);

  async function odemeyeGit() {
    setLoading(true);
    setError("");
    try {
      const res = await cekiciFetch("/api/cekici/odeme/baslat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paketTl: seciliPaket }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      sessionStorage.setItem(
        `odeme-${data.odemeId}`,
        JSON.stringify({
          miktar: data.miktar,
          tutar: data.tutar,
          listeFiyati: paket.tutarTL,
          garantiAktif: data.garantiAktif,
        })
      );
      router.push(`/cekici/odeme/${data.odemeId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "İşlem başarısız.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <MobileShell backHref="/cekici/panel?tab=hesabim" subtitle="Kredi satın al">
      <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 mb-6 flex justify-between items-center">
        <span className="text-sm text-slate-600">Mevcut kredi</span>
        <span className="text-2xl font-bold text-amber-600">{formatKredi(kredi)}</span>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </Card>
      )}

      <div className="space-y-4">
        <p className="text-sm font-medium text-slate-700">
          Kaç kredi almak istiyorsunuz?
        </p>
        <p className="text-xs text-slate-500 -mt-2">
          Minimum 100 TL · 1 kredi = 1 talep SMS bildirimi ve panelde görünürlük · Teklif ücretsiz
        </p>

        <div className="grid grid-cols-2 gap-3">
          {KREDI_PAKETLERI.map((p) => {
            const secili = p.tutarTL === seciliPaket;
            const fiyat = krediPaketOdenecekTL(p);
            return (
              <button
                key={p.tutarTL}
                type="button"
                onClick={() => setSeciliPaket(p.tutarTL)}
                className={`rounded-xl border-2 p-4 text-left transition-colors ${
                  secili
                    ? "border-amber-500 bg-amber-50"
                    : "border-slate-200 bg-white hover:border-amber-300"
                }`}
              >
                <p className="text-lg font-bold text-slate-900">
                  {formatKredi(p.kredi)} kredi
                </p>
                <p className="text-sm text-slate-600 mt-1">{p.tutarTL} TL paket</p>
                {p.indirimYuzde > 0 ? (
                  <p className="text-sm font-semibold text-emerald-700 mt-2">
                    {fiyat} ₺ öde
                    <span className="block text-xs font-normal text-slate-500 line-through">
                      {p.tutarTL} ₺
                    </span>
                    <span className="text-xs">%{p.indirimYuzde} indirim</span>
                  </p>
                ) : (
                  <p className="text-sm font-semibold text-amber-700 mt-2">
                    {fiyat} ₺
                  </p>
                )}
              </button>
            );
          })}
        </div>

        <Card className="bg-slate-50">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Eklenecek kredi</span>
            <span className="font-semibold">{formatKredi(paket.kredi)}</span>
          </div>
          {indirimli && (
            <div className="flex justify-between text-sm mt-1">
              <span className="text-slate-600">Liste fiyatı</span>
              <span className="text-slate-400 line-through">{paket.tutarTL} ₺</span>
            </div>
          )}
          <div className="flex justify-between text-sm mt-2 pt-2 border-t border-slate-200">
            <span className="text-slate-700 font-medium">Ödenecek</span>
            <span className="font-bold text-amber-600 text-lg">{odenecek} ₺</span>
          </div>
        </Card>

        <Card className="bg-slate-50">
          <p className="text-sm text-slate-600">
            Ödeme için güvenli sanal POS sayfasına yönlendirileceksiniz. İşlem
            sonrası otomatik olarak uygulamaya dönersiniz.
          </p>
        </Card>

        <Btn onClick={odemeyeGit} disabled={loading}>
          {loading ? "Yönlendiriliyor…" : `💳 ${odenecek} ₺ — Ödemeye Git`}
        </Btn>
      </div>
    </MobileShell>
  );
}
