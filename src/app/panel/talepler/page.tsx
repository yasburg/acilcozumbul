"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";
import type { Talep } from "@/lib/types";

export default function PanelTaleplerPage() {
  const [liste, setListe] = useState<Talep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/panel/talepler")
      .then((r) => r.json())
      .then(setListe)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Talepler</h2>
        <p className="text-sm text-slate-500">Müşteri talepleri ve durumları</p>
      </div>

      {loading && <p className="text-sm text-slate-500">Yükleniyor…</p>}

      {!loading && liste.length === 0 && (
        <Card>
          <p className="text-slate-600 text-sm">Henüz talep yok.</p>
          <Link href="/" className="text-amber-600 text-sm font-medium mt-2 inline-block">
            Ana sayfadan talep oluştur →
          </Link>
        </Card>
      )}

      <div className="space-y-3">
        {liste.map((t) => (
          <Card key={t.id}>
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <p className="font-semibold">
                  {t.ad} {t.soyad}
                </p>
                <p className="text-sm text-slate-600">{t.telefon}</p>
              </div>
              <span className="text-xs font-medium uppercase tracking-wide text-amber-700 bg-amber-50 px-2 py-1 rounded-lg h-fit">
                {t.durum}
              </span>
            </div>
            <p className="text-sm text-slate-700 mt-2 line-clamp-2">{t.sorun}</p>
            <p className="text-xs text-slate-500 mt-1">
              {t.konum.adres}
              {t.konumIlce ? ` · ${t.konumIlce}` : ""}
            </p>
            <p className="text-xs text-slate-400 mt-2">
              {new Date(t.olusturulma).toLocaleString("tr-TR")} ·{" "}
              {t.teklifler?.length ?? 0} teklif
            </p>
            <div className="flex flex-wrap gap-3 mt-3 text-sm">
              <Link
                href={`/bekle/${t.id}`}
                className="text-amber-600 font-medium"
                target="_blank"
              >
                Bekleme sayfası →
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
