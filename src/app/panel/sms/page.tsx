"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";
import type { SmsKaydi } from "@/lib/types";

export default function PanelSmsPage() {
  const [kayitlar, setKayitlar] = useState<SmsKaydi[]>([]);
  const [durum, setDurum] = useState<{
    gercekGonderim: boolean;
    saglayici: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/panel/sms")
      .then((r) => r.json())
      .then((d) => {
        setKayitlar(d.kayitlar ?? []);
        setDurum(d.durum ?? null);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">SMS</h2>
          <p className="text-sm text-slate-500">Gönderim geçmişi (çekici + müşteri)</p>
        </div>
        <Link
          href="/demo/sms"
          className="text-sm text-amber-600 font-medium self-end"
        >
          Netgsm test →
        </Link>
      </div>

      {durum && (
        <Card
          className={
            durum.gercekGonderim
              ? "bg-emerald-50 border-emerald-200"
              : "bg-amber-50 border-amber-200"
          }
        >
          <p className="text-sm font-medium">
            {durum.gercekGonderim
              ? `Gerçek gönderim: ${durum.saglayici}`
              : "Demo — Netgsm yapılandırılmamış"}
          </p>
        </Card>
      )}

      {loading && <p className="text-sm text-slate-500">Yükleniyor…</p>}

      {!loading && kayitlar.length === 0 && (
        <Card>
          <p className="text-slate-600 text-sm">Henüz SMS kaydı yok.</p>
        </Card>
      )}

      <div className="space-y-3">
        {kayitlar.map((k) => (
          <Card key={k.id} className="text-sm">
            <div className="flex flex-wrap justify-between gap-2 mb-2">
              <span className="font-medium text-slate-800">
                {k.aliciTipi === "musteri" ? "Müşteri" : "Çekici"} · {k.cekiciTelefon}
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
