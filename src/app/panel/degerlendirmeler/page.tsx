"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";

interface DegerlendirmeSatir {
  id: string;
  talepId: string;
  cekiciId: string;
  puan: number;
  puanGenel: number;
  puanFiyat: number;
  puanSure: number;
  yorum?: string;
  olusturulma: string;
  cekiciAd?: string;
  musteriAd?: string;
}

interface Ozet {
  toplam: number;
  ortalama: number | null;
}

export default function PanelDegerlendirmelerPage() {
  const [liste, setListe] = useState<DegerlendirmeSatir[]>([]);
  const [ozet, setOzet] = useState<Ozet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/panel/degerlendirmeler")
      .then((r) => r.json())
      .then((d) => {
        setListe(d.liste ?? []);
        setOzet(d.ozet ?? null);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Müşteri değerlendirmeleri</h2>
        <p className="text-sm text-slate-500">
          Anlaşmadan 2 saat sonra müşterilerin verdiği puanlar (çekiciye etkisi
          panelde görünür; çekici tarafında ayrıca açıklanmaz).
        </p>
      </div>

      {ozet && (
        <div className="grid grid-cols-2 gap-3 max-w-md">
          <Card className="text-center py-4">
            <p className="text-3xl font-bold text-amber-600">{ozet.toplam}</p>
            <p className="text-xs text-slate-500 mt-1">Toplam değerlendirme</p>
          </Card>
          <Card className="text-center py-4">
            <p className="text-3xl font-bold text-emerald-600">
              {ozet.ortalama != null ? `${ozet.ortalama}/5` : "—"}
            </p>
            <p className="text-xs text-slate-500 mt-1">Ortalama puan</p>
          </Card>
        </div>
      )}

      {loading && <p className="text-sm text-slate-500">Yükleniyor…</p>}

      {!loading && liste.length === 0 && (
        <Card>
          <p className="text-sm text-slate-600">Henüz değerlendirme yok.</p>
        </Card>
      )}

      <div className="space-y-3">
        {liste.map((d) => (
          <Card key={d.id}>
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900">
                  Ortalama {d.puan}/5
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Genel {d.puanGenel}/5 · Fiyat {d.puanFiyat}/5 · Süre{" "}
                  {d.puanSure}/5
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  Müşteri: {d.musteriAd ?? "—"} · Çekici:{" "}
                  {d.cekiciAd ? (
                    <Link
                      href={`/panel/cekiciler/${d.cekiciId}`}
                      className="text-amber-600 hover:underline"
                    >
                      {d.cekiciAd}
                    </Link>
                  ) : (
                    d.cekiciId
                  )}
                </p>
              </div>
              <p className="text-xs text-slate-400">
                {new Date(d.olusturulma).toLocaleString("tr-TR")}
              </p>
            </div>
            {d.yorum?.trim() && (
              <p className="text-sm text-slate-700 mt-3 border-t border-slate-100 pt-3 leading-relaxed">
                {d.yorum}
              </p>
            )}
            <p className="text-xs text-slate-400 mt-2 font-mono">Talep: {d.talepId}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
