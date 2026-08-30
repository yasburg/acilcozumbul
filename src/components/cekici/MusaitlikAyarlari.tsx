"use client";

import { useEffect, useState } from "react";
import { Btn, Field } from "@/components/ui";
import { cekiciFetch } from "@/lib/cekici-fetch";
import { AcbIcons, ACB_ICON_STROKE } from "@/lib/acb-icons";

const GUNLER: { v: number; label: string }[] = [
  { v: 1, label: "Pzt" },
  { v: 2, label: "Sal" },
  { v: 3, label: "Çar" },
  { v: 4, label: "Per" },
  { v: 5, label: "Cum" },
  { v: 6, label: "Cmt" },
  { v: 7, label: "Paz" },
];

export function MusaitlikAyarlari() {
  const [aktif, setAktif] = useState(false);
  const [baslangic, setBaslangic] = useState("08:00");
  const [bitis, setBitis] = useState("22:00");
  const [gunler, setGunler] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);
  const [ozet, setOzet] = useState("");
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydediyor, setKaydediyor] = useState(false);
  const [mesaj, setMesaj] = useState("");
  const [hata, setHata] = useState("");
  const Clock = AcbIcons.clock;

  useEffect(() => {
    void cekiciFetch("/api/cekici/musaitlik")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setAktif(Boolean(d.musaitlikAktif));
        setBaslangic(d.musaitlikBaslangic ?? "08:00");
        setBitis(d.musaitlikBitis ?? "22:00");
        setGunler(d.musaitlikGunler ?? [1, 2, 3, 4, 5, 6, 7]);
        setOzet(d.ozet ?? "");
      })
      .finally(() => setYukleniyor(false));
  }, []);

  function gunToggle(g: number) {
    setGunler((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g].sort()
    );
    setMesaj("");
  }

  async function kaydet() {
    setKaydediyor(true);
    setHata("");
    setMesaj("");
    try {
      const res = await cekiciFetch("/api/cekici/musaitlik", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          musaitlikAktif: aktif,
          musaitlikBaslangic: baslangic,
          musaitlikBitis: bitis,
          musaitlikGunler: gunler,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMesaj(data.mesaj);
      setOzet(data.ozet ?? "");
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Kayıt başarısız.");
    } finally {
      setKaydediyor(false);
    }
  }

  if (yukleniyor) {
    return <p className="text-xs text-slate-500 text-center py-6">Müsaitlik ayarları yükleniyor…</p>;
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

      <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4 shadow-sm">
        {/* Switch Card */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-emerald-600 shrink-0" strokeWidth={ACB_ICON_STROKE} />
              <span className="text-sm font-bold text-slate-900">
                Özel Çalışma Saatleri
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mt-1">
              {aktif
                ? "Yalnızca belirlediğiniz gün ve saatlerde yeni talep bildirimi alırsınız."
                : "Kapalıyken 7/24 günün her saati bildirim alırsınız (Tavsiye edilen)."}
            </p>
            {ozet && (
              <span className="inline-block mt-2 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                Şu an: {ozet}
              </span>
            )}
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={aktif}
            aria-label="Müsaitlik saatini kullan"
            onClick={() => {
              setAktif(!aktif);
              setMesaj("");
            }}
            className={`relative shrink-0 w-12 h-7 rounded-full transition-colors cursor-pointer ${
              aktif ? "bg-emerald-600" : "bg-slate-300"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                aktif ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Özel Saat Detayları */}
        {aktif && (
          <div className="pt-3 border-t border-slate-100 space-y-4 animate-fade-in">
            <div>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Hizmet Verdiğiniz Günler
              </p>
              <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                {GUNLER.map((g) => {
                  const secili = gunler.includes(g.v);
                  return (
                    <button
                      key={g.v}
                      type="button"
                      onClick={() => gunToggle(g.v)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                        secili
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {g.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Başlangıç Saati"
                placeholder="08:00"
                value={baslangic}
                onChange={(e) => {
                  setBaslangic(e.target.value);
                  setMesaj("");
                }}
              />
              <Field
                label="Bitiş Saati"
                placeholder="22:00"
                value={bitis}
                onChange={(e) => {
                  setBitis(e.target.value);
                  setMesaj("");
                }}
              />
            </div>
          </div>
        )}

        <Btn
          onClick={() => void kaydet()}
          disabled={kaydediyor}
          className="w-full justify-center shadow-md shadow-emerald-700/10"
        >
          {kaydediyor ? "Kaydediliyor…" : "Müsaitlik ayarını kaydet"}
        </Btn>
      </div>
    </div>
  );
}
