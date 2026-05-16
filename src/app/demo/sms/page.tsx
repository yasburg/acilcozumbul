"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MobileShell } from "@/components/MobileShell";
import { Card } from "@/components/ui";

interface SmsKaydi {
  id: string;
  cekiciTelefon: string;
  mesaj: string;
  link: string;
  gonderim: string;
  aliciTipi?: "cekici" | "musteri";
  saglayici?: string;
  gonderildi?: boolean;
}

export default function DemoSmsPage() {
  const [log, setLog] = useState<SmsKaydi[]>([]);
  const [loading, setLoading] = useState(true);
  const [durum, setDurum] = useState<{
    gercekGonderim: boolean;
    saglayici: string;
  } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/demo/sms").then((r) => r.json()),
      fetch("/api/demo/sms-durum").then((r) => r.json()),
    ])
      .then(([smsLog, smsDurum]) => {
        setLog(smsLog);
        setDurum(smsDurum);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <MobileShell backHref="/" subtitle="SMS kayıtları (çekici + müşteri)">
      {durum && (
        <Card
          className={`mb-4 ${
            durum.gercekGonderim
              ? "bg-emerald-50 border-emerald-200"
              : "bg-amber-50 border-amber-200"
          }`}
        >
          <p className="text-sm font-semibold text-slate-800">
            {durum.gercekGonderim
              ? `✅ Gerçek SMS aktif (${durum.saglayici})`
              : "⚠️ Demo mod — SMS telefona gitmiyor"}
          </p>
          {!durum.gercekGonderim && (
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              <code className="text-amber-800">.env.local</code> dosyasına Netgsm
              bilgilerini ekleyin: NETGSM_USERNAME, NETGSM_PASSWORD,
              NETGSM_MSGHEADER
            </p>
          )}
        </Card>
      )}

      {loading && <p className="text-slate-500 text-center py-8">Yükleniyor…</p>}

      {!loading && log.length === 0 && (
        <Card>
          <p className="text-sm text-slate-500">
            Henüz SMS yok. Ana sayfadan bir talep oluşturun.
          </p>
          <Link href="/" className="text-amber-600 text-sm mt-2 inline-block">
            Talep oluştur →
          </Link>
        </Card>
      )}

      <div className="space-y-3">
        {log.map((s) => (
          <Card key={s.id}>
            <div className="flex gap-2 mb-2 flex-wrap">
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  s.aliciTipi === "musteri"
                    ? "bg-blue-50 text-blue-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {s.aliciTipi === "musteri" ? "Müşteri" : "Çekici"}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {s.saglayici ?? "demo"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-1">{s.cekiciTelefon}</p>
            <p className="text-sm text-slate-600 mb-3 leading-relaxed">{s.mesaj}</p>
            {s.link && s.aliciTipi !== "musteri" && (
              <Link
                href={s.link.replace(/^https?:\/\/[^/]+/, "")}
                className="inline-block text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg"
              >
                Linke git →
              </Link>
            )}
            <p className="text-xs text-slate-400 mt-2">
              {new Date(s.gonderim).toLocaleString("tr-TR")}
            </p>
          </Card>
        ))}
      </div>
    </MobileShell>
  );
}
