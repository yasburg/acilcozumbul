"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";
import type {
  DavetKullanimSatir,
  DavetLiderSatir,
  DavetPanelOzet,
} from "@/lib/davet-panel";

function CekiciLink({
  id,
  ad,
}: {
  id: string;
  ad?: string;
}) {
  return (
    <Link
      href={`/panel/cekiciler/${id}`}
      className="text-amber-600 hover:underline font-medium"
    >
      {ad ?? id}
    </Link>
  );
}

export default function PanelDavetlerPage() {
  const [liste, setListe] = useState<DavetKullanimSatir[]>([]);
  const [liderler, setLiderler] = useState<DavetLiderSatir[]>([]);
  const [ozet, setOzet] = useState<DavetPanelOzet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/panel/davet-kullanimlari", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setListe(d.liste ?? []);
        setLiderler(d.liderler ?? []);
        setOzet(d.ozet ?? null);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Davet kodları</h2>
        <p className="text-sm text-slate-500 mt-1">
          Hizmet verenlerin paylaştığı davet kodları ve kayıt bonusları. Yeni
          üye {ozet?.bonusDavetli ?? 20} kredi, kod sahibi{" "}
          {ozet?.bonusDavetEden ?? 10} kredi alır.
        </p>
      </div>

      {ozet && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Card className="text-center py-4">
            <p className="text-3xl font-bold text-amber-600">
              {ozet.toplamKullanim}
            </p>
            <p className="text-xs text-slate-500 mt-1">Başarılı kayıt</p>
          </Card>
          <Card className="text-center py-4">
            <p className="text-3xl font-bold text-slate-800">
              {ozet.aktifKodSayisi}
            </p>
            <p className="text-xs text-slate-500 mt-1">Aktif davet kodu</p>
          </Card>
          <Card className="text-center py-4">
            <p className="text-3xl font-bold text-emerald-600">
              {ozet.toplamDavetliKredi}
            </p>
            <p className="text-xs text-slate-500 mt-1">Yeni üyelere verilen</p>
          </Card>
          <Card className="text-center py-4">
            <p className="text-3xl font-bold text-blue-600">
              {ozet.toplamDavetEdenKredi}
            </p>
            <p className="text-xs text-slate-500 mt-1">Davet edenlere verilen</p>
          </Card>
          <Card className="text-center py-4 col-span-2 sm:col-span-1">
            <p className="text-3xl font-bold text-violet-600">
              {ozet.toplamDavetliKredi + ozet.toplamDavetEdenKredi}
            </p>
            <p className="text-xs text-slate-500 mt-1">Toplam bonus kredi</p>
          </Card>
        </div>
      )}

      {loading && <p className="text-sm text-slate-500">Yükleniyor…</p>}

      {!loading && liderler.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900">
            En çok davet edenler
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-500">
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Hizmet veren</th>
                  <th className="px-4 py-3 font-medium">Kod</th>
                  <th className="px-4 py-3 font-medium text-right">Kayıt</th>
                  <th className="px-4 py-3 font-medium text-right">Kazanılan</th>
                </tr>
              </thead>
              <tbody>
                {liderler.map((l, i) => (
                  <tr
                    key={l.cekiciId}
                    className="border-b border-slate-50 last:border-0"
                  >
                    <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      <CekiciLink id={l.cekiciId} ad={l.cekiciAd} />
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700">
                      {l.davetKodu ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {l.kullanimSayisi}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-700">
                      +{l.toplamKazandigiKredi} kredi
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-900">
          Kullanım geçmişi
        </h3>

        {!loading && liste.length === 0 && (
          <Card>
            <p className="text-sm text-slate-600">
              Henüz davet kodu ile kayıt yok.
            </p>
          </Card>
        )}

        <div className="space-y-3">
          {liste.map((k) => (
            <Card key={k.id}>
              <div className="flex flex-wrap justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-mono text-sm font-semibold text-amber-700">
                    {k.davetKodu}
                  </p>
                  <p className="text-sm text-slate-700">
                    Davet eden:{" "}
                    <CekiciLink id={k.davetEdenId} ad={k.davetEdenAd} />
                  </p>
                  <p className="text-sm text-slate-700">
                    Yeni üye:{" "}
                    <CekiciLink id={k.yeniCekiciId} ad={k.yeniCekiciAd} />
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Yeni üye +{k.davetliKredi} · Davet eden +{k.davetEdenKredi}{" "}
                    kredi
                  </p>
                </div>
                <p className="text-xs text-slate-400 whitespace-nowrap">
                  {new Date(k.olusturulma).toLocaleString("tr-TR")}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
