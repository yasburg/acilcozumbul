"use client";

import { useCallback, useEffect, useState } from "react";
import { Btn, Card, Field } from "@/components/ui";
import { cekiciFetch, cekiciJson } from "@/lib/cekici-fetch";

type DavetKoduDurum = {
  davetKodu: string | null;
  davetliBonus: number;
  davetEdenBonus: number;
  kayitLink: string | null;
};

export function DavetKoduAyarlari() {
  const [durum, setDurum] = useState<DavetKoduDurum | null>(null);
  const [giris, setGiris] = useState("");
  const [loading, setLoading] = useState(true);
  const [kaydediyor, setKaydediyor] = useState(false);
  const [hata, setHata] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [kopyalandi, setKopyalandi] = useState(false);

  const yukle = useCallback(async () => {
    setLoading(true);
    try {
      const res = await cekiciFetch("/api/cekici/davet-kodu");
      const d = await cekiciJson<DavetKoduDurum>(res);
      setDurum(d);
      if (d.davetKodu) setGiris(d.davetKodu);
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  async function kodKaydet(olustur = false) {
    setKaydediyor(true);
    setHata("");
    setMesaj("");
    try {
      const res = await cekiciFetch("/api/cekici/davet-kodu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          olustur ? { olustur: true } : { davetKodu: giris.trim() }
        ),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Kaydedilemedi.");
      setMesaj(d.mesaj ?? "Davet kodu kaydedildi.");
      setGiris(d.davetKodu ?? giris);
      await yukle();
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Kaydedilemedi.");
    } finally {
      setKaydediyor(false);
    }
  }

  async function linkKopyala() {
    if (!durum?.kayitLink) return;
    try {
      await navigator.clipboard.writeText(durum.kayitLink);
      setKopyalandi(true);
      window.setTimeout(() => setKopyalandi(false), 2000);
    } catch {
      setHata("Link kopyalanamadı.");
    }
  }

  if (loading) {
    return (
      <Card>
        <p className="text-sm text-slate-500">Davet kodu yükleniyor…</p>
      </Card>
    );
  }

  const kodHazir = Boolean(durum?.davetKodu);

  return (
    <section>
      <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
        Davet kodu
      </h2>
      <Card className="space-y-4">
        <p className="text-sm text-slate-600 leading-relaxed">
          Arkadaşınız kayıt olurken kodunuzu girerse{" "}
          <strong>{durum?.davetliBonus ?? 20} kredi</strong> hediye alır; size{" "}
          <strong>{durum?.davetEdenBonus ?? 10} kredi</strong> eklenir.
        </p>

        {kodHazir ? (
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
            <p className="text-xs text-amber-800 uppercase tracking-wide font-semibold">
              Kodunuz
            </p>
            <p className="text-2xl font-bold text-amber-900 tracking-wider mt-1">
              {durum?.davetKodu}
            </p>
          </div>
        ) : (
          <>
            <Field
              label="Davet kodu oluştur"
              placeholder="ör. YASIN2024"
              value={giris}
              onChange={(e) => {
                setHata("");
                setGiris(e.target.value.toLocaleUpperCase("tr-TR"));
              }}
              maxLength={20}
              disabled={kaydediyor}
            />
            <p className="text-xs text-slate-500 -mt-2">
              4–20 karakter, harf ve rakam. Kaydettikten sonra değiştirilemez.
            </p>
            <div className="flex flex-wrap gap-2">
              <Btn
                type="button"
                onClick={() => void kodKaydet(false)}
                disabled={kaydediyor || !giris.trim()}
              >
                {kaydediyor ? "Kaydediliyor…" : "Kodu kaydet"}
              </Btn>
              <Btn
                type="button"
                variant="outline"
                onClick={() => void kodKaydet(true)}
                disabled={kaydediyor}
              >
                Otomatik oluştur
              </Btn>
            </div>
          </>
        )}

        {durum?.kayitLink && (
          <div className="space-y-2">
            <p className="text-xs text-slate-500">Kayıt linki</p>
            <p className="text-xs text-slate-700 break-all bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
              {durum.kayitLink}
            </p>
            <Btn type="button" variant="outline" onClick={() => void linkKopyala()}>
              {kopyalandi ? "Kopyalandı ✓" : "Linki kopyala"}
            </Btn>
          </div>
        )}

        {hata && (
          <p className="text-sm text-red-600" role="alert">
            {hata}
          </p>
        )}
        {mesaj && (
          <p className="text-sm text-emerald-700" role="status">
            {mesaj}
          </p>
        )}
      </Card>
    </section>
  );
}
