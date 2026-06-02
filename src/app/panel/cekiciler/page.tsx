"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";
import { formatKredi } from "@/lib/talep-utils";
import type { CekiciPanelOzet } from "@/lib/panel";

export default function PanelCekicilerPage() {
  const [liste, setListe] = useState<CekiciPanelOzet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/panel/cekiciler")
      .then((r) => r.json())
      .then(setListe)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Çekiciler</h2>
          <p className="text-sm text-slate-500">
            Kayıt olan kullanıcılar — detay ve panele geçiş
          </p>
        </div>
        <Link
          href="/cekici/kayit"
          className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white"
        >
          + Yeni kayıt
        </Link>
      </div>

      {loading && <p className="text-sm text-slate-500">Yükleniyor…</p>}

      {!loading && liste.length === 0 && (
        <Card>
          <p className="text-slate-600 text-sm">Henüz kayıtlı çekici yok.</p>
          <Link href="/cekici/kayit" className="text-amber-600 text-sm font-medium mt-2 inline-block">
            İlk kaydı oluştur →
          </Link>
        </Card>
      )}

      <div className="space-y-3">
        {liste.map((c) => (
          <Link key={c.id} href={`/panel/cekiciler/${c.id}`}>
            <Card className="hover:border-amber-300 transition">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">{c.ad}</p>
                  <p className="text-sm text-slate-600">{c.telefon}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="text-amber-600 font-bold">
                    {formatKredi(c.kredi)} kredi
                  </p>
                  <p className="text-slate-500">{c.sehir}</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Kayıt: {new Date(c.kayitTarihi).toLocaleString("tr-TR")}
                {c.hizmetBolgeleri && Object.keys(c.hizmetBolgeleri).length > 0
                  ? ` · ${Object.values(c.hizmetBolgeleri).flat().length} ilçe`
                  : c.hizmetIlceleri && c.hizmetIlceleri.length > 0
                  ? ` · ${c.hizmetIlceleri.length} ilçe`
                  : " · ilçe seçilmemiş"}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
