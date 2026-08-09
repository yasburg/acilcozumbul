"use client";

import { useCallback, useEffect, useState } from "react";
import { Btn, Card } from "@/components/ui";
import type { SesliMesajSablon } from "@/lib/sesli-mesaj";

type Sonuc =
  | {
      ok: true;
      sablonId: string;
      label: string;
      audioId: string;
      telefon: string;
      bulkid?: string;
      kod?: string;
    }
  | {
      ok: false;
      error: string;
      kod?: string;
      raw?: string;
    };

export default function PanelSesliMesajDemoPage() {
  const [sablonlar, setSablonlar] = useState<SesliMesajSablon[]>([]);
  const [telefon, setTelefon] = useState("");
  const [loading, setLoading] = useState(true);
  const [gonderiliyor, setGonderiliyor] = useState<string | null>(null);
  const [sonuc, setSonuc] = useState<Sonuc | null>(null);
  const [hata, setHata] = useState("");

  const yukle = useCallback(async () => {
    setLoading(true);
    setHata("");
    try {
      const res = await fetch("/api/panel/sesli-mesaj/demo", {
        credentials: "include",
      });
      if (!res.ok) {
        setHata("Şablonlar yüklenemedi.");
        return;
      }
      const data = (await res.json()) as { sablonlar: SesliMesajSablon[] };
      setSablonlar(data.sablonlar ?? []);
    } catch {
      setHata("Şablonlar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  async function gonder(sablon: SesliMesajSablon) {
    setSonuc(null);
    setHata("");
    setGonderiliyor(sablon.id);

    try {
      const res = await fetch("/api/panel/sesli-mesaj/demo", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sablonId: sablon.id,
          telefon,
          audioId: sablon.audioId || undefined,
        }),
      });
      const data = (await res.json()) as Sonuc & { error?: string };
      if (!res.ok || !("ok" in data) || !data.ok) {
        setSonuc({
          ok: false,
          error: data.error ?? "Gönderim başarısız.",
          kod: "kod" in data ? data.kod : undefined,
          raw: "raw" in data ? data.raw : undefined,
        });
        return;
      }
      setSonuc(data);
    } catch {
      setSonuc({ ok: false, error: "Ağ hatası." });
    } finally {
      setGonderiliyor(null);
    }
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">Sesli mesaj demo</h2>
        <p className="text-sm text-slate-500 mt-1">
          Netgsm’e yüklü kayıtlarla test araması. Onaydan sonra talep akışına
          bağlanacak; şimdilik yalnızca buradan gönderilir.
        </p>
      </div>

      <Card className="space-y-3">
        <label className="block text-sm font-medium text-slate-700">
          Alıcı telefon
          <input
            type="tel"
            inputMode="tel"
            placeholder="05XX XXX XX XX"
            value={telefon}
            onChange={(e) => setTelefon(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-base"
          />
        </label>
        <p className="text-xs text-slate-500">
          Gerçek arama başlar (Netgsm bakiyesi düşer). Saat aralığı Netgsm
          hesabınıza göre işlenir.
        </p>
      </Card>

      {loading ? (
        <p className="text-sm text-slate-500">Yükleniyor…</p>
      ) : (
        <div className="space-y-3">
          {sablonlar.map((s) => (
            <Card key={s.id} className="space-y-3">
              <div>
                <h3 className="font-semibold text-slate-900">{s.label}</h3>
                <p className="text-sm text-slate-600 mt-0.5">{s.aciklama}</p>
                {s.audioId && (
                  <p className="text-xs text-slate-500 mt-2 font-mono">
                    AudioID: {s.audioId}
                    {s.sureSn != null ? ` · ${s.sureSn} sn` : ""}
                  </p>
                )}
              </div>

              <Btn
                type="button"
                disabled={!!gonderiliyor || !s.audioId}
                onClick={() => void gonder(s)}
              >
                {gonderiliyor === s.id ? "Gönderiliyor…" : "Bu mesajı ara"}
              </Btn>
            </Card>
          ))}
        </div>
      )}

      {hata && (
        <p className="text-sm text-red-600" role="alert">
          {hata}
        </p>
      )}

      {sonuc && (
        <Card
          className={
            sonuc.ok
              ? "bg-emerald-50 border-emerald-200"
              : "bg-red-50 border-red-200"
          }
        >
          {sonuc.ok ? (
            <div className="text-sm space-y-1">
              <p className="font-semibold text-emerald-900">Arama kuyruğa alındı</p>
              <p className="text-slate-700">{sonuc.label}</p>
              <p className="font-mono text-xs text-slate-600">
                {sonuc.telefon} · AudioID {sonuc.audioId}
                {sonuc.bulkid ? ` · bulkid ${sonuc.bulkid}` : ""}
              </p>
            </div>
          ) : (
            <div className="text-sm space-y-1">
              <p className="font-semibold text-red-800">Gönderilemedi</p>
              <p className="text-red-700">{sonuc.error}</p>
              {sonuc.raw && (
                <p className="font-mono text-xs text-slate-600 break-all">
                  {sonuc.raw}
                </p>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
