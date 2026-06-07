"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Btn, Card } from "@/components/ui";
import type { CekiciPanelOzet } from "@/lib/panel";
import type { DemoSimuleOlay } from "@/lib/demo-oturum";

type DemoSms = {
  id: string;
  aliciTipi: "cekici" | "musteri";
  telefon: string;
  mesaj: string;
  link?: string;
  gonderim: string;
};

type DemoDurum = {
  aktif: boolean;
  kapali?: boolean;
  id?: string;
  cekiciId?: string;
  cekiciAd?: string;
  kalanSn?: number;
  anaTalepId?: string;
  musteriLink?: string;
  sms?: DemoSms[];
  talepSayisi?: number;
};

const SIMULE_ADIMLAR: { olay: DemoSimuleOlay; label: string; aciklama: string }[] =
  [
    {
      olay: "ihaleyi_ac",
      label: "İhaleyi aç",
      aciklama: "Gizli talebi çekiciye bildir (SMS simülasyonu)",
    },
    {
      olay: "rakip_teklif",
      label: "Rakip teklifi",
      aciklama: "Müşteriye rakip çekici teklifi ekle",
    },
    {
      olay: "benim_teklifim",
      label: "Benim teklifim",
      aciklama: "Demo çekicinin teklifini ekle (panelden)",
    },
    {
      olay: "musteri_yeni_teklif_sms",
      label: "Yeni teklif SMS",
      aciklama: "Müşteriye yeni teklif bildirimi",
    },
    {
      olay: "musteri_secti",
      label: "Müşteri seçti",
      aciklama: "Kazanan çekiciyi belirle",
    },
    {
      olay: "yeni_ihale_gizli",
      label: "Yeni gizli ihale",
      aciklama: "Ek kilitli talep ekle",
    },
  ];

function kalanSureFormat(sn: number): string {
  const dk = Math.floor(sn / 60);
  const s = sn % 60;
  return `${dk}:${s.toString().padStart(2, "0")}`;
}

export default function PanelDemoPage() {
  const [cekiciler, setCekiciler] = useState<CekiciPanelOzet[]>([]);
  const [seciliId, setSeciliId] = useState("");
  const [sureDk, setSureDk] = useState(5);
  const [durum, setDurum] = useState<DemoDurum | null>(null);
  const [loading, setLoading] = useState(true);
  const [islem, setIslem] = useState(false);
  const [mesaj, setMesaj] = useState("");
  const [hata, setHata] = useState("");

  const yukleDurum = useCallback(async () => {
    const res = await fetch("/api/panel/demo/durum", { credentials: "include" });
    const data = (await res.json()) as DemoDurum;
    setDurum(data);
    return data;
  }, []);

  useEffect(() => {
    void Promise.all([
      fetch("/api/panel/cekiciler", { credentials: "include" }).then((r) =>
        r.ok ? r.json() : []
      ),
      yukleDurum(),
    ])
      .then(([list]) => {
        setCekiciler(list);
        if (list.length) {
          setSeciliId((prev) => prev || list[0]!.id);
        }
      })
      .finally(() => setLoading(false));
  }, [yukleDurum]);

  useEffect(() => {
    if (!durum?.aktif) return;
    const t = setInterval(() => {
      void yukleDurum();
    }, 1000);
    return () => clearInterval(t);
  }, [durum?.aktif, yukleDurum]);

  async function baslat() {
    if (!seciliId) return;
    setIslem(true);
    setHata("");
    setMesaj("");
    try {
      const res = await fetch("/api/panel/demo/baslat", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cekiciId: seciliId, sureDk }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Başlatılamadı.");
      setMesaj(data.mesaj ?? "Demo başlatıldı.");
      await yukleDurum();
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Hata");
    } finally {
      setIslem(false);
    }
  }

  async function durdur() {
    setIslem(true);
    setHata("");
    try {
      await fetch("/api/panel/demo/durdur", {
        method: "POST",
        credentials: "include",
      });
      setMesaj("Demo sonlandırıldı.");
      await yukleDurum();
    } catch {
      setHata("Durdurulamadı.");
    } finally {
      setIslem(false);
    }
  }

  async function simule(olay: DemoSimuleOlay) {
    setIslem(true);
    setHata("");
    try {
      const res = await fetch("/api/panel/demo/simule", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ olay }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Simülasyon başarısız.");
      setMesaj(`${olay} uygulandı.`);
      await yukleDurum();
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Hata");
    } finally {
      setIslem(false);
    }
  }

  async function linkKopyala(link: string) {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${link}`
      );
      setMesaj("Müşteri linki kopyalandı.");
    } catch {
      setHata("Kopyalanamadı.");
    }
  }

  if (loading) {
    return <p className="text-slate-500 py-8">Yükleniyor…</p>;
  }

  if (durum?.kapali) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <h2 className="text-xl font-bold text-amber-900">Demo modu kapalı</h2>
        <p className="text-sm text-amber-800 mt-2">
          Ortam değişkeni <code className="text-xs">DEMO_MODE_ENABLED=false</code>{" "}
          ile devre dışı.
        </p>
      </Card>
    );
  }

  const aktif = durum?.aktif;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">Video demo</h2>
        <p className="text-sm text-slate-500 mt-1">
          Gerçek çekici hesabıyla panel akışını kaydetmek için geçici mock ihaleler.
          Production taleplerine yazılmaz.
        </p>
      </div>

      {mesaj && (
        <Card className="border-emerald-200 bg-emerald-50">
          <p className="text-sm text-emerald-800">{mesaj}</p>
        </Card>
      )}
      {hata && (
        <Card className="border-red-200 bg-red-50">
          <p className="text-sm text-red-800">{hata}</p>
        </Card>
      )}

      {!aktif ? (
        <Card>
          <h3 className="font-semibold mb-3">Demo başlat</h3>
          <label className="block text-sm text-slate-600 mb-1">Çekici</label>
          <select
            value={seciliId}
            onChange={(e) => setSeciliId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm mb-3"
          >
            {cekiciler.map((c) => (
              <option key={c.id} value={c.id}>
                {c.ad} — {c.sehir} ({c.telefon})
              </option>
            ))}
          </select>
          <label className="block text-sm text-slate-600 mb-1">
            Süre (dakika, max 30)
          </label>
          <input
            type="number"
            min={1}
            max={30}
            value={sureDk}
            onChange={(e) => setSureDk(Number(e.target.value) || 5)}
            className="w-24 rounded-xl border border-slate-200 px-3 py-2 text-sm mb-4"
          />
          <Btn onClick={() => void baslat()} disabled={islem || !seciliId}>
            {islem ? "Başlatılıyor…" : "Demo başlat"}
          </Btn>
          <p className="text-xs text-slate-500 mt-3 leading-relaxed">
            Demo başladıktan sonra aynı tarayıcıda seçilen çekici hesabıyla{" "}
            <Link href="/cekici/giris" className="text-amber-600 underline">
              giriş yapın
            </Link>
            . Mock ihaleler İhaleler sekmesinde görünür.
          </p>
        </Card>
      ) : (
        <>
          <Card className="border-amber-200 bg-amber-50">
            <div className="flex flex-wrap justify-between gap-3 items-start">
              <div>
                <p className="text-xs uppercase tracking-wide text-amber-700 font-semibold">
                  Aktif demo
                </p>
                <p className="font-bold text-lg text-amber-950 mt-1">
                  {durum.cekiciAd ?? durum.cekiciId}
                </p>
                <p className="text-sm text-amber-800 mt-1">
                  Kalan:{" "}
                  <strong>{kalanSureFormat(durum.kalanSn ?? 0)}</strong>
                  {" · "}
                  {durum.talepSayisi ?? 0} mock talep
                </p>
              </div>
              <Btn variant="danger" onClick={() => void durdur()} disabled={islem}>
                Durdur
              </Btn>
            </div>
          </Card>

          {durum.musteriLink && (
            <Card>
              <h3 className="font-semibold mb-2">Müşteri ekranı</h3>
              <p className="text-sm text-slate-600 mb-2">
                Bekleme sayfası — teklifleri görmek için aynı tarayıcıda açın
                (demo çerezi gerekir).
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={durum.musteriLink}
                  target="_blank"
                  className="text-sm font-medium text-amber-600 underline"
                >
                  {durum.musteriLink}
                </Link>
                <button
                  type="button"
                  onClick={() => void linkKopyala(durum.musteriLink!)}
                  className="text-xs text-slate-500 underline"
                >
                  Kopyala
                </button>
              </div>
            </Card>
          )}

          <Card>
            <h3 className="font-semibold mb-3">Simülasyon adımları</h3>
            <div className="space-y-2">
              {SIMULE_ADIMLAR.map(({ olay, label, aciklama }) => (
                <div
                  key={olay}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-slate-500">{aciklama}</p>
                  </div>
                  <Btn
                    variant="outline"
                    className="shrink-0 text-xs py-1.5 px-3"
                    onClick={() => void simule(olay)}
                    disabled={islem}
                  >
                    Çalıştır
                  </Btn>
                </div>
              ))}
            </div>
          </Card>

          {(durum.sms?.length ?? 0) > 0 && (
            <Card>
              <h3 className="font-semibold mb-3">Simüle SMS (son 10)</h3>
              <ul className="space-y-2">
                {durum.sms!.map((s) => (
                  <li
                    key={s.id}
                    className="text-sm border-b border-slate-100 pb-2 last:border-0"
                  >
                    <span className="text-xs text-slate-400">
                      {new Date(s.gonderim).toLocaleTimeString("tr-TR")} ·{" "}
                      {s.aliciTipi}
                    </span>
                    <p className="text-slate-800">{s.mesaj}</p>
                    {s.link && (
                      <Link href={s.link} className="text-xs text-amber-600 underline">
                        {s.link}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
