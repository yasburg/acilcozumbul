"use client";

import { useEffect, useRef, useState } from "react";
import { Btn, Card, SifreAlani } from "@/components/ui";
import { cekiciFetch } from "@/lib/cekici-fetch";
import type { BildirimSeviye } from "@/lib/ihale";

type Paket = {
  seviye: BildirimSeviye;
  kredi: number;
  baslik: string;
  aciklama: string;
  onerilen?: boolean;
};

type Durum = {
  bildirimSeviye: BildirimSeviye;
  bildirimKredi: number;
  paketler: Paket[];
  telefon: string;
  smsGercek: boolean;
};

export function PremiumSmsAyarlari() {
  const [durum, setDurum] = useState<Durum | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hedefSeviye, setHedefSeviye] = useState<BildirimSeviye | null>(null);
  const [sifre, setSifre] = useState("");
  const [islem, setIslem] = useState(false);
  const [mesaj, setMesaj] = useState("");
  const [hata, setHata] = useState("");
  const sifreBolumRef = useRef<HTMLDivElement>(null);
  const sifreInputRef = useRef<HTMLInputElement>(null);

  async function yukle() {
    const res = await cekiciFetch("/api/cekici/premium-sms");
    if (!res.ok) return;
    setDurum(await res.json());
  }

  useEffect(() => {
    void yukle().finally(() => setYukleniyor(false));
  }, []);

  useEffect(() => {
    if (hedefSeviye == null) return;
    const t = window.setTimeout(() => {
      sifreBolumRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      sifreInputRef.current?.focus({ preventScroll: true });
    }, 50);
    return () => window.clearTimeout(t);
  }, [hedefSeviye]);

  function secimBaslat(seviye: BildirimSeviye) {
    if (!durum || seviye === durum.bildirimSeviye) return;
    setHedefSeviye(seviye);
    setSifre("");
    setHata("");
    setMesaj("");
  }

  function iptal() {
    setHedefSeviye(null);
    setSifre("");
    setHata("");
  }

  async function kaydet() {
    if (hedefSeviye == null) return;
    if (!sifre.trim()) {
      setHata("Hesap şifrenizi girin.");
      return;
    }
    setIslem(true);
    setHata("");
    setMesaj("");
    try {
      const res = await cekiciFetch("/api/cekici/premium-sms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bildirimSeviye: hedefSeviye, sifre }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Kaydedilemedi.");
      setMesaj(data.mesaj);
      setHedefSeviye(null);
      setSifre("");
      await yukle();
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Kaydedilemedi.");
    } finally {
      setIslem(false);
    }
  }

  if (yukleniyor || !durum) {
    return <p className="text-sm text-slate-500">Bildirim paketi yükleniyor…</p>;
  }

  return (
    <section>
      <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
        Bildirim paketi
      </h2>
      <Card className="space-y-3">
        <p className="text-xs text-slate-600 leading-relaxed">
          Yeni talepler için nasıl haberdar olmak istediğinizi seçin. Varsayılan
          ve önerilen paket sesli arama + hızlı SMS’tir.
        </p>

        <div className="space-y-2">
          {durum.paketler.map((p) => {
            const secili = durum.bildirimSeviye === p.seviye;
            const hedef = hedefSeviye === p.seviye;
            return (
              <button
                key={p.seviye}
                type="button"
                onClick={() => secimBaslat(p.seviye)}
                disabled={islem}
                className={`w-full text-left rounded-xl border px-3 py-3 transition ${
                  secili
                    ? "border-amber-500 bg-amber-50 ring-1 ring-amber-500/30"
                    : hedef
                      ? "border-amber-400 bg-amber-50/40"
                      : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {p.baslik}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">{p.aciklama}</p>
                  </div>
                  {secili && (
                    <span className="shrink-0 text-xs font-semibold text-amber-800">
                      Aktif
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {hata && (
          <p className="text-sm text-red-600" role="alert">
            {hata}
          </p>
        )}
        {mesaj && (
          <p className="text-sm text-emerald-800" role="status">
            {mesaj}
          </p>
        )}

        {hedefSeviye != null && (
          <div
            ref={sifreBolumRef}
            className="space-y-3 border-t border-slate-100 pt-3 scroll-mt-24"
          >
            <p className="text-xs text-slate-600">
              Paketi değiştirmek için hesap şifrenizi girin.
            </p>
            <SifreAlani
              ref={sifreInputRef}
              label="Hesap şifresi"
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              autoComplete="current-password"
              placeholder="Şifreniz"
              className="!border-amber-400 !ring-4 !ring-amber-400/45 !shadow-[0_0_0_1px_rgba(245,158,11,0.35),0_0_20px_rgba(245,158,11,0.45)] focus:!ring-amber-400/55"
            />
            <Btn
              type="button"
              onClick={() => void kaydet()}
              disabled={islem || !sifre.trim()}
            >
              {islem ? "Kaydediliyor…" : "Şifreyi onayla ve kaydet"}
            </Btn>
            <button
              type="button"
              onClick={iptal}
              className="w-full text-sm text-slate-500 underline"
            >
              Vazgeç
            </button>
          </div>
        )}
      </Card>
    </section>
  );
}
