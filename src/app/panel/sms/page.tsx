"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";
import type { SmsKaydi } from "@/lib/types";

type Saglik = {
  pencereSaat: number;
  toplam: number;
  basarili: number;
  basarisiz: number;
  hataOraniYuzde: number;
  alarm: boolean;
  alarmEsikYuzde: number;
  netgsmHataKodlari: Record<string, number>;
  sonBasarisiz: Array<{
    gonderim: string;
    telefon: string;
    hata?: string;
    aliciTipi?: string;
  }>;
};

export default function PanelSmsPage() {
  const [kayitlar, setKayitlar] = useState<SmsKaydi[]>([]);
  const [durum, setDurum] = useState<{
    gercekGonderim: boolean;
    saglayici: string;
  } | null>(null);
  const [saglik, setSaglik] = useState<{
    son24Saat: Saglik;
    son7Gun: Saglik;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/panel/sms", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setKayitlar(d.kayitlar ?? []);
        setDurum(d.durum ?? null);
        setSaglik(d.saglik ?? null);
      })
      .finally(() => setLoading(false));
  }, []);

  const s24 = saglik?.son24Saat;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">SMS sağlık panosu</h2>
          <p className="text-sm text-slate-500">
            Netgsm gönderim geçmişi ve hata oranı
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <Link
            href="/panel/sms/toplu"
            className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white"
          >
            Toplu SMS gönder
          </Link>
          <Link
            href="/demo/sms"
            className="text-sm text-amber-600 font-medium self-end"
          >
            Netgsm test →
          </Link>
        </div>
      </div>

      {durum && (
        <Card
          className={
            durum.gercekGonderim
              ? s24?.alarm
                ? "bg-red-50 border-red-200"
                : "bg-emerald-50 border-emerald-200"
              : "bg-amber-50 border-amber-200"
          }
        >
          <p className="text-sm font-medium">
            {durum.gercekGonderim
              ? `Gerçek gönderim: ${durum.saglayici}`
              : "Demo — Netgsm yapılandırılmamış"}
          </p>
          {s24 && s24.toplam > 0 && (
            <p
              className={`text-sm mt-2 ${
                s24.alarm ? "text-red-800 font-semibold" : "text-slate-700"
              }`}
            >
              Son 24 saat: {s24.basarili} başarılı, {s24.basarisiz} başarısız — hata
              oranı %{s24.hataOraniYuzde}
              {s24.alarm &&
                ` (alarm: ≥%${s24.alarmEsikYuzde}, min ${10} SMS)`}
            </p>
          )}
        </Card>
      )}

      {saglik && (
        <div className="grid gap-4 sm:grid-cols-2">
          <SaglikKart baslik="Son 24 saat" veri={saglik.son24Saat} />
          <SaglikKart baslik="Son 7 gün" veri={saglik.son7Gun} />
        </div>
      )}

      {s24 && Object.keys(s24.netgsmHataKodlari).length > 0 && (
        <Card>
          <h3 className="font-semibold text-slate-800 mb-2">
            Netgsm hata kodları (24 saat)
          </h3>
          <ul className="text-sm space-y-1">
            {Object.entries(s24.netgsmHataKodlari).map(([kod, adet]) => (
              <li key={kod} className="flex justify-between">
                <span className="font-mono text-slate-600">{kod}</span>
                <span className="font-semibold">{adet}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {s24 && s24.sonBasarisiz.length > 0 && (
        <Card>
          <h3 className="font-semibold text-slate-800 mb-2">Son başarısız SMS</h3>
          <ul className="space-y-2 text-sm">
            {s24.sonBasarisiz.map((b, i) => (
              <li key={i} className="border-b border-slate-100 pb-2 last:border-0">
                <span className="text-slate-500">
                  {new Date(b.gonderim).toLocaleString("tr-TR")} ·{" "}
                  {b.aliciTipi ?? "?"} · {b.telefon}
                </span>
                {b.hata && (
                  <p className="text-red-700 text-xs mt-0.5">{b.hata}</p>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {loading && <p className="text-sm text-slate-500">Yükleniyor…</p>}

      {!loading && kayitlar.length === 0 && (
        <Card>
          <p className="text-slate-600 text-sm">Henüz SMS kaydı yok.</p>
        </Card>
      )}

      <h3 className="font-semibold text-slate-800 pt-2">Son kayıtlar</h3>
      <div className="space-y-3">
        {kayitlar.map((k) => (
          <Card key={k.id} className="text-sm">
            <div className="flex flex-wrap justify-between gap-2 mb-2">
              <span className="font-medium text-slate-800">
                {k.aliciTipi === "musteri" ? "Müşteri" : "Çekici"} ·{" "}
                {k.cekiciTelefon}
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded ${
                  k.gonderildi
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {k.gonderildi ? "Gönderildi" : "Gönderilmedi"}
              </span>
            </div>
            <p className="text-slate-700 leading-relaxed">{k.mesaj}</p>
            {!k.gonderildi && k.hata && (
              <p className="text-xs text-red-600 mt-1">{k.hata}</p>
            )}
            <p className="text-xs text-slate-400 mt-2">
              {new Date(k.gonderim).toLocaleString("tr-TR")}
              {k.saglayici ? ` · ${k.saglayici}` : ""}
            </p>
            {k.link && (
              <a
                href={k.link}
                className="text-xs text-amber-600 break-all mt-1 inline-block"
                target="_blank"
                rel="noreferrer"
              >
                {k.link}
              </a>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function SaglikKart({ baslik, veri }: { baslik: string; veri: Saglik }) {
  return (
    <Card>
      <p className="text-xs text-slate-500 uppercase tracking-wide">{baslik}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{veri.toplam}</p>
      <p className="text-sm text-slate-600 mt-1">
        {veri.basarili} OK · {veri.basarisiz} hata
      </p>
      <p
        className={`text-sm font-medium mt-2 ${
          veri.alarm ? "text-red-700" : "text-emerald-700"
        }`}
      >
        Hata oranı %{veri.hataOraniYuzde}
      </p>
    </Card>
  );
}
