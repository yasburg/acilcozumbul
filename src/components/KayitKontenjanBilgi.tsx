"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui";
import type { KayitKontenjanDurum } from "@/lib/cekici-kayit-kontenjan";
import { kayitKontenjanHesapla } from "@/lib/cekici-kayit-kontenjan";

type Props = {
  /** Yalnızca geliştirmede: ?onizleme=97 ile önizleme */
  onizlemeGercekKayit?: number;
};

export function KayitKontenjanBilgi({ onizlemeGercekKayit }: Props = {}) {
  const [durum, setDurum] = useState<KayitKontenjanDurum | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    if (
      typeof onizlemeGercekKayit === "number" &&
      Number.isFinite(onizlemeGercekKayit)
    ) {
      setDurum(kayitKontenjanHesapla(onizlemeGercekKayit));
      setYukleniyor(false);
      return;
    }

    let iptal = false;
    void fetch("/api/cekici/kayit/durum")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!iptal && d) setDurum(d as KayitKontenjanDurum);
      })
      .finally(() => {
        if (!iptal) setYukleniyor(false);
      });
    return () => {
      iptal = true;
    };
  }, [onizlemeGercekKayit]);

  if (yukleniyor) {
    return (
      <Card className="mb-4 border-slate-200 bg-slate-50 animate-pulse">
        <div className="h-16 rounded-lg bg-slate-200/80" />
      </Card>
    );
  }

  if (!durum) return null;

  const dolulukYuzde = Math.round(
    (durum.gosterilenKayit / durum.limit) * 100
  );

  return (
    <Card
      className={`mb-4 ${
        durum.sonKontenjanModu
          ? "border-amber-300 bg-amber-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-800 mb-1">
        Erken faz — sınırlı üye kaydı
      </p>
      <p className="text-sm text-slate-700 leading-relaxed mb-3">
        Erken fazda panel kullanımı yalnızca <strong>İstanbul</strong>’da açık
        (kontenjan <strong>{durum.limit} hizmet veren</strong>). Diğer
        illerden de kayıt olabilirsiniz; şehriniz açılana kadar bekleme
        listesinde önde tutulursunuz. Gösterge İstanbul doluluğunu yansıtır.
      </p>

      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-slate-600">
          <strong className="text-slate-900">{durum.gosterilenKayit}</strong>
          {" / "}
          {durum.limit} İstanbul kontenjanı
        </span>
        <span
          className={
            durum.sonKontenjanModu
              ? "font-semibold text-amber-800"
              : "text-slate-600"
          }
        >
          {durum.sonKontenjanModu
            ? `Son ${durum.gosterilenKalan} kontenjan!`
            : `${durum.gosterilenKalan} kontenjan kaldı`}
        </span>
      </div>

      <div
        className="h-2 rounded-full bg-slate-200 overflow-hidden"
        role="progressbar"
        aria-valuenow={durum.gosterilenKayit}
        aria-valuemin={0}
        aria-valuemax={durum.limit}
      >
        <div
          className={`h-full rounded-full transition-all ${
            durum.sonKontenjanModu ? "bg-amber-500" : "bg-emerald-500"
          }`}
          style={{ width: `${Math.min(100, dolulukYuzde)}%` }}
        />
      </div>

      {durum.sonKontenjanModu && (
        <p className="text-sm font-semibold text-amber-900 mt-3">
          Son {durum.gosterilenKalan} İstanbul kontenjanı — hemen kayıt olun!
        </p>
      )}
    </Card>
  );
}
