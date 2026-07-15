"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MobileShell } from "@/components/MobileShell";
import { Card } from "@/components/ui";
import { telefonGoster } from "@/lib/kisisel-veri-gizle";

interface SmsKaydi {
  id: string;
  cekiciTelefon: string;
  mesaj: string;
  link: string;
  gonderim: string;
  aliciTipi?: "cekici" | "musteri";
  saglayici?: string;
  gonderildi?: boolean;
  kaynak?: "prod" | "video-demo";
}

export default function DemoSmsPage() {
  const [log, setLog] = useState<SmsKaydi[]>([]);
  const [loading, setLoading] = useState(true);
  const [durum, setDurum] = useState<{
    gercekGonderim: boolean;
    saglayici: string;
  } | null>(null);
  const [basliklar, setBasliklar] = useState<{
    basarili: boolean;
    basliklar: string[];
    hata?: string;
    kod?: string;
  } | null>(null);
  const [baslikYukleniyor, setBaslikYukleniyor] = useState(false);
  const videoDemoVar = log.some((s) => s.kaynak === "video-demo");

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

  async function baslikSorgula() {
    setBaslikYukleniyor(true);
    try {
      const res = await fetch("/api/demo/netgsm-baslik");
      setBasliklar(await res.json());
    } catch {
      setBasliklar({ basarili: false, basliklar: [], hata: "İstek başarısız" });
    } finally {
      setBaslikYukleniyor(false);
    }
  }

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

      {videoDemoVar && (
        <Card className="mb-4 border-amber-200 bg-amber-50">
          <p className="text-sm font-semibold text-amber-900">
            🎬 Video demo SMS’leri üstte
          </p>
          <p className="text-xs text-amber-800 mt-1 leading-relaxed">
            Aktif demo oturumundaki simüle SMS’ler listeleniyor (telefona
            gitmez). Prod logları altında kalır. Yönetim:{" "}
            <Link href="/panel/demo" className="underline font-medium">
              /panel/demo
            </Link>
          </p>
        </Card>
      )}

      <Card className="mb-4">
        <p className="text-sm font-semibold text-slate-800 mb-2">
          Netgsm gönderici adları
        </p>
        <p className="text-xs text-slate-500 mb-3 leading-relaxed">
          Onaylı başlıkları API ile sorgular.{" "}
          <a
            href="https://www.netgsm.com.tr/dokuman/?language=PHP#gonderici-adi-sorgulama"
            className="text-amber-600 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Dokümantasyon
          </a>
        </p>
        <button
          type="button"
          onClick={baslikSorgula}
          disabled={baslikYukleniyor}
          className="text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 w-full"
        >
          {baslikYukleniyor ? "Sorgulanıyor…" : "Gönderici adlarını sorgula"}
        </button>
        {basliklar && (
          <div className="mt-3 text-sm">
            {basliklar.basarili ? (
              <>
                <p className="text-emerald-700 font-medium mb-1">
                  .env NETGSM_MSGHEADER için bunlardan birini kullanın:
                </p>
                <ul className="list-disc pl-5 text-slate-700 space-y-1">
                  {basliklar.basliklar.map((b) => (
                    <li key={b}>
                      <code className="text-amber-800">{b}</code>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-red-600 text-xs leading-relaxed">
                {basliklar.kod && <span className="font-mono">[{basliklar.kod}] </span>}
                {basliklar.hata ?? "Sorgu başarısız"}
              </p>
            )}
          </div>
        )}
      </Card>

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
              {s.kaynak === "video-demo" && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  Video demo
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-1 font-mono">
              {telefonGoster(s.cekiciTelefon, "yari")}
            </p>
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
