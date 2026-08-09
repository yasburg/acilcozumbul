"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";
import {
  satinAlmaFaturaGruplari,
  type SatinAlmaFiltre,
  type SatinAlmaTip,
} from "@/lib/panel-satin-almalar";

type Ozet = {
  id: string;
  tip: SatinAlmaTip;
  tipEtiket: string;
  cekiciAd: string;
  cekiciTelefon: string;
  cekiciSehir?: string;
  miktar: number;
  tutar: number;
  faturaEposta: string;
  kurumsal: boolean;
  demoOdeme: boolean;
  odemeReferans?: string;
  olusturulma: string;
  faturaYuklu: boolean;
};

const FILTRELER: { id: SatinAlmaFiltre; label: string }[] = [
  { id: "hepsi", label: "Hepsi" },
  { id: "abonelik", label: "Abonelik ödemesi" },
  { id: "kredi", label: "Kredi alımı" },
];

function tipRozetSinif(tip: SatinAlmaTip): string {
  if (tip === "kredi") return "bg-amber-50 text-amber-800";
  if (tip === "abonelik_yenileme") return "bg-sky-50 text-sky-800";
  return "bg-emerald-50 text-emerald-800";
}

function SatinAlmaKart({ k }: { k: Ozet }) {
  return (
    <Link href={`/panel/kredi-odemeler/${k.id}`}>
      <Card
        className={`hover:border-amber-300 transition ${
          k.faturaYuklu ? "" : "border-amber-200 bg-amber-50/40"
        }`}
      >
        <div className="flex flex-wrap justify-between gap-2">
          <div>
            <p className="font-semibold">{k.cekiciAd}</p>
            <p className="text-sm text-slate-600">{k.cekiciTelefon}</p>
            {k.cekiciSehir ? (
              <p className="text-sm text-slate-600">{k.cekiciSehir}</p>
            ) : null}
            <p className="text-xs text-slate-500 mt-1">{k.faturaEposta}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  k.faturaYuklu
                    ? "bg-green-100 text-green-800"
                    : "bg-orange-100 text-orange-800"
                }`}
              >
                {k.faturaYuklu ? "Fatura yüklü" : "Fatura yok"}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${tipRozetSinif(k.tip)}`}
              >
                {k.tipEtiket}
              </span>
              {k.kurumsal && (
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                  Kurumsal
                </span>
              )}
              {k.demoOdeme && (
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  Demo
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-amber-700">{k.tutar} ₺</p>
            <p className="text-xs text-slate-500">{k.miktar} kredi</p>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          {new Date(k.olusturulma).toLocaleString("tr-TR")}
          {k.odemeReferans ? ` · Ref: ${k.odemeReferans}` : ""}
        </p>
      </Card>
    </Link>
  );
}

function GrupBaslik({
  baslik,
  adet,
}: {
  baslik: string;
  adet: number;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2 pt-2">
      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
        {baslik}
      </h3>
      <span className="text-xs text-slate-400 tabular-nums">{adet}</span>
    </div>
  );
}

export default function PanelSatinAlmalarPage() {
  const [filtre, setFiltre] = useState<SatinAlmaFiltre>("hepsi");
  const [liste, setListe] = useState<Ozet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = filtre === "hepsi" ? "" : `?tip=${filtre}`;
    fetch(`/api/panel/kredi-odemeler${q}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setListe)
      .finally(() => setLoading(false));
  }, [filtre]);

  const { bekleyen, yuklu } = useMemo(
    () => satinAlmaFaturaGruplari(liste),
    [liste]
  );
  const toplamTutar = liste.reduce((s, k) => s + k.tutar, 0);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Satın almalar</h2>
        <p className="text-sm text-slate-500">
          Abonelik ve kredi alımları — fatura yükleme
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTRELER.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFiltre(f.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              filtre === f.id
                ? "bg-amber-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {!loading && liste.length > 0 && (
        <Card className="bg-slate-50">
          <p className="text-sm text-slate-600">
            Toplam <strong>{liste.length}</strong> işlem ·{" "}
            <strong>{bekleyen.length}</strong> fatura bekliyor ·{" "}
            <strong>{toplamTutar.toLocaleString("tr-TR")} ₺</strong> tahsilat
          </p>
        </Card>
      )}

      {loading && <p className="text-sm text-slate-500">Yükleniyor…</p>}

      {!loading && liste.length === 0 && (
        <Card>
          <p className="text-sm text-slate-600">
            Bu filtrede tamamlanan satın alma yok.
          </p>
        </Card>
      )}

      {!loading && bekleyen.length > 0 && (
        <div className="space-y-3">
          <GrupBaslik baslik="Fatura bekleyen" adet={bekleyen.length} />
          {bekleyen.map((k) => (
            <SatinAlmaKart key={k.id} k={k} />
          ))}
        </div>
      )}

      {!loading && yuklu.length > 0 && (
        <div className="space-y-3">
          <GrupBaslik baslik="Fatura yüklü" adet={yuklu.length} />
          {yuklu.map((k) => (
            <SatinAlmaKart key={k.id} k={k} />
          ))}
        </div>
      )}
    </div>
  );
}
