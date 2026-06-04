"use client";

import { useEffect, useState } from "react";
import { Btn, Card, Field } from "@/components/ui";
import { cekiciFetch } from "@/lib/cekici-fetch";

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
    return <p className="text-sm text-slate-500">Müsaitlik yükleniyor…</p>;
  }

  return (
    <section>
      <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
        Müsaitlik saati
      </h2>
      <Card className="mb-3">
        <p className="text-sm text-slate-600 leading-relaxed">
          Bu saatler dışında yeni talep SMS&apos;i almazsınız — kredi israfını
          azaltır. Kapalıyken 7/24 bildirim alırsınız.
        </p>
        {ozet && (
          <p className="text-xs text-slate-500 mt-2">Şu an: {ozet}</p>
        )}
      </Card>

      {hata && (
        <Card className="mb-3 border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{hata}</p>
        </Card>
      )}
      {mesaj && (
        <Card className="mb-3 border-emerald-200 bg-emerald-50">
          <p className="text-sm text-emerald-800">{mesaj}</p>
        </Card>
      )}

      <Card className="space-y-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={aktif}
            onChange={(e) => setAktif(e.target.checked)}
            className="rounded border-slate-300 text-amber-600"
          />
          <span className="text-sm font-medium text-slate-800">
            Müsaitlik saatini kullan
          </span>
        </label>

        {aktif && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Başlangıç"
                placeholder="08:00"
                value={baslangic}
                onChange={(e) => setBaslangic(e.target.value)}
              />
              <Field
                label="Bitiş"
                placeholder="22:00"
                value={bitis}
                onChange={(e) => setBitis(e.target.value)}
              />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600 mb-2">Günler</p>
              <div className="flex flex-wrap gap-2">
                {GUNLER.map((g) => (
                  <button
                    key={g.v}
                    type="button"
                    onClick={() => gunToggle(g.v)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
                      gunler.includes(g.v)
                        ? "bg-amber-100 border-amber-400 text-amber-900"
                        : "bg-white border-slate-200 text-slate-500"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <Btn onClick={() => void kaydet()} disabled={kaydediyor}>
          {kaydediyor ? "Kaydediliyor…" : "Müsaitlik ayarını kaydet"}
        </Btn>
      </Card>
    </section>
  );
}
