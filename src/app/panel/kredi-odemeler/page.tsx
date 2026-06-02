"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";

type Ozet = {
  id: string;
  cekiciAd: string;
  cekiciTelefon: string;
  miktar: number;
  tutar: number;
  listeFiyati?: number;
  paketTl: number;
  faturaEposta: string;
  kurumsal: boolean;
  sirketUnvan?: string;
  odemeReferans?: string;
  demoOdeme: boolean;
  olusturulma: string;
};

export default function PanelKrediOdemelerPage() {
  const [liste, setListe] = useState<Ozet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/panel/kredi-odemeler")
      .then((r) => (r.ok ? r.json() : []))
      .then(setListe)
      .finally(() => setLoading(false));
  }, []);

  const toplamTutar = liste.reduce((s, k) => s + k.tutar, 0);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Kredi satın alımları</h2>
        <p className="text-sm text-slate-500">
          Fatura ve ödeme özeti — tamamlanan işlemler
        </p>
      </div>

      {!loading && liste.length > 0 && (
        <Card className="bg-slate-50">
          <p className="text-sm text-slate-600">
            Toplam <strong>{liste.length}</strong> işlem ·{" "}
            <strong>{toplamTutar.toLocaleString("tr-TR")} ₺</strong> tahsilat
          </p>
        </Card>
      )}

      {loading && <p className="text-sm text-slate-500">Yükleniyor…</p>}

      {!loading && liste.length === 0 && (
        <Card>
          <p className="text-sm text-slate-600">Henüz tamamlanan kredi ödemesi yok.</p>
        </Card>
      )}

      <div className="space-y-3">
        {liste.map((k) => (
          <Link key={k.id} href={`/panel/kredi-odemeler/${k.id}`}>
            <Card className="hover:border-amber-300 transition">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <p className="font-semibold">{k.cekiciAd}</p>
                  <p className="text-sm text-slate-600">{k.cekiciTelefon}</p>
                  <p className="text-xs text-slate-500 mt-1">{k.faturaEposta}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-amber-700">{k.tutar} ₺</p>
                  <p className="text-xs text-slate-500">{k.miktar} kredi</p>
                  {k.kurumsal && (
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full mt-1 inline-block">
                      Kurumsal
                    </span>
                  )}
                  {k.demoOdeme && (
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full mt-1 inline-block ml-1">
                      Demo
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {new Date(k.olusturulma).toLocaleString("tr-TR")}
                {k.odemeReferans ? ` · Ref: ${k.odemeReferans}` : ""}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
