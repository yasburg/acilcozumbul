"use client";

import { useEffect, useRef, useState } from "react";
import { Btn, SifreAlani } from "@/components/ui";
import { cekiciFetch } from "@/lib/cekici-fetch";
import type { BildirimSeviye } from "@/lib/ihale";
import { AcbIcons, ACB_ICON_STROKE } from "@/lib/acb-icons";

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
  cashbackAktif?: boolean;
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
  const Bell = AcbIcons.bell;
  const Check = AcbIcons.check;

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
    return <p className="text-xs text-slate-500 text-center py-6">Bildirim paketleri yükleniyor…</p>;
  }

  return (
    <div className="space-y-4">
      {hata && (
        <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-xs text-red-700 font-medium">
          {hata}
        </div>
      )}
      {mesaj && (
        <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-xs text-emerald-800 font-medium">
          {mesaj}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-emerald-600 shrink-0" strokeWidth={ACB_ICON_STROKE} />
            <span className="text-sm font-bold text-slate-900">Bildirim Paketi</span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {durum.paketler.find((p) => p.seviye === durum.bildirimSeviye)?.kredi ?? 3} Kredi / Bildirim
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Yeni müşteri talepleri geldiğinde nasıl haberdar olmak istediğinizi belirleyin.
          {durum.cashbackAktif
            ? " Teklif verirseniz seçili paketin kredisi hesabınıza iade edilir."
            : ""}
        </p>

        <div className="space-y-2.5 pt-1">
          {durum.paketler.map((p) => {
            const secili = durum.bildirimSeviye === p.seviye;
            const hedef = hedefSeviye === p.seviye;
            return (
              <button
                key={p.seviye}
                type="button"
                onClick={() => secimBaslat(p.seviye)}
                disabled={islem}
                className={`w-full text-left rounded-2xl border p-3.5 transition-all relative ${
                  secili
                    ? "border-emerald-500 bg-emerald-50/70 shadow-sm"
                    : hedef
                    ? "border-emerald-400 bg-emerald-50/30 ring-2 ring-emerald-500/20"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-bold ${secili ? "text-emerald-950" : "text-slate-900"}`}>
                        {p.baslik}
                      </span>
                      {p.onerilen && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                          Önerilen
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{p.aciklama}</p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-xs font-bold text-slate-900 px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200/60">
                      {p.kredi} Kredi
                      {durum.cashbackAktif && secili ? " · teklifte iade" : ""}
                    </span>
                    {secili ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                        <Check className="size-3.5" strokeWidth={ACB_ICON_STROKE * 1.3} /> Aktif
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-400 hover:text-emerald-700">
                        Seç
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {hedefSeviye != null && (
          <div
            ref={sifreBolumRef}
            className="space-y-3 border-t border-slate-100 pt-4 mt-2 animate-fade-in"
          >
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
              Bildirim paketini değiştirmek için hesap şifrenizi doğrulamanız gereklidir.
            </div>
            <SifreAlani
              ref={sifreInputRef}
              label="Hesap Şifreniz"
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              autoComplete="current-password"
              placeholder="Şifrenizi girin"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={iptal}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Vazgeç
              </button>
              <Btn
                type="button"
                onClick={() => void kaydet()}
                disabled={islem || !sifre.trim()}
                className="flex-1 justify-center"
              >
                {islem ? "Kaydediliyor…" : "Onayla ve Kaydet"}
              </Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
