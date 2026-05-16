"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MobileShell } from "@/components/MobileShell";
import { Btn, Card } from "@/components/ui";
import { formatKredi } from "@/lib/talep-utils";
import type { ListeDurumu } from "@/lib/types";

type Tab = "musteriler" | "hesabim";

interface Istatistik {
  satinAldiklarim: number;
  beniTercihEdenler: number;
  tercihEdilmedim: number;
  tercihOrani: number;
  buHaftaHarcanan: number;
}

interface TalepOzet {
  id: string;
  ad: string;
  soyad: string;
  bolge: string;
  sorunOzet: string;
  durum: string;
  olusturulma: string;
  satinAlindi?: boolean;
  benimMusterim?: boolean;
  telefon?: string;
  listeDurumu?: ListeDurumu;
}

interface GecmisKayit extends TalepOzet {
  satinAlmaTarihi: string;
  tercihEdilmedi?: boolean;
  aktif: boolean;
}

interface PanelData {
  bekleyen: TalepOzet[];
  baskasiAldi: TalepOzet[];
  tercihEdilmedi: TalepOzet[];
  satinAlinanlar: TalepOzet[];
  bugunTumu: TalepOzet[];
  gecmisSatinAlimlar: GecmisKayit[];
}

const BADGE: Record<
  string,
  { label: string; className: string }
> = {
  acik: { label: "Açık", className: "bg-amber-50 text-amber-700" },
  benim: { label: "Aktif", className: "bg-emerald-50 text-emerald-700" },
  baskasi_aldi: { label: "Satın alındı", className: "bg-slate-100 text-slate-600" },
  tercih_edilmedi: {
    label: "Tercih edilmedi",
    className: "bg-red-50 text-red-600",
  },
  anlasildi: { label: "Tamamlandı", className: "bg-slate-100 text-slate-500" },
};

function TalepKarti({
  talep,
  kilitle = false,
}: {
  talep: TalepOzet | GecmisKayit;
  kilitle?: boolean;
}) {
  const gecmis = "satinAlmaTarihi" in talep ? (talep as GecmisKayit) : null;
  const durum = talep.listeDurumu ?? (gecmis?.aktif ? "benim" : "baskasi_aldi");
  const badge = BADGE[durum] ?? BADGE.baskasi_aldi;

  const icerik = (
    <Card
      className={`transition ${
        kilitle
          ? "opacity-90 cursor-default"
          : "hover:border-amber-300 active:scale-[0.99]"
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900">
            {talep.ad} {talep.soyad.charAt(0)}.
          </p>
          {!kilitle && (
            <>
              <p className="text-sm text-slate-500 mt-0.5">📍 {talep.bolge}</p>
              <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                {talep.sorunOzet}
              </p>
            </>
          )}
          {kilitle && durum === "baskasi_aldi" && (
            <p className="text-sm text-slate-500 mt-1">
              Başka çekici müşteriyi aldı
            </p>
          )}
          {kilitle && durum === "tercih_edilmedi" && (
            <p className="text-sm text-slate-500 mt-1">Müşteri sizi tercih etmedi</p>
          )}
          {talep.telefon && durum === "benim" && (
            <p className="text-amber-700 font-mono text-sm mt-2">{talep.telefon}</p>
          )}
          {gecmis?.tercihEdilmedi && (
            <p className="text-xs text-red-500 mt-1">Müşteri sizi tercih etmedi</p>
          )}
        </div>
        <span
          className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>
      <p className="text-xs text-slate-400 mt-2">
        {new Date(talep.olusturulma).toLocaleTimeString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </Card>
  );

  if (kilitle) return icerik;
  return <Link href={`/cekici/talep/${talep.id}`}>{icerik}</Link>;
}

export default function CekiciPanelTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab =
    searchParams.get("tab") === "hesabim" ? "hesabim" : "musteriler";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [cekici, setCekici] = useState<{
    ad: string;
    kredi: number;
    sehir: string;
    telefon: string;
  } | null>(null);
  const [data, setData] = useState<PanelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState<string | null>(null);
  const [istatistik, setIstatistik] = useState<Istatistik | null>(null);

  const yukle = useCallback(async () => {
    const [meRes, talepRes, statRes] = await Promise.all([
      fetch("/api/cekici/me"),
      fetch("/api/cekici/talepler"),
      fetch("/api/cekici/istatistik"),
    ]);
    if (!meRes.ok) {
      router.push("/cekici/giris");
      return;
    }
    setCekici(await meRes.json());
    if (talepRes.ok) setData(await talepRes.json());
    if (statRes.ok) setIstatistik(await statRes.json());
    setLoading(false);
  }, [router]);

  useEffect(() => {
    yukle();
    const interval = setInterval(yukle, 5000);
    return () => clearInterval(interval);
  }, [yukle]);

  useEffect(() => {
    const mesaj = searchParams.get("mesaj");
    if (mesaj === "musteri-alindi") {
      setFlash("Müşteri alındı! Bilgileri görüntüleyebilirsiniz.");
      setTab("musteriler");
    }
    if (mesaj === "kredi-eklendi") {
      const eklenen = searchParams.get("eklenen");
      setFlash(
        eklenen
          ? `${eklenen} kredi hesabınıza eklendi.`
          : "Kredi satın alma başarılı."
      );
      setTab("hesabim");
    }
    if (mesaj === "kayit-basarili") {
      setFlash("Kayıt başarılı! Hoş geldiniz.");
    }
  }, [searchParams]);

  const tabBar = (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white safe-bottom">
      <div className="flex max-w-lg mx-auto">
        {(
          [
            { key: "musteriler" as Tab, label: "Müşteriler", icon: "👥" },
            { key: "hesabim" as Tab, label: "Hesabım", icon: "⚙️" },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex-1 py-3 text-center text-sm font-medium transition ${
              tab === t.key
                ? "text-amber-600 border-t-2 border-amber-500 -mt-px"
                : "text-slate-500"
            }`}
          >
            <span className="block text-lg">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  );

  if (loading || !cekici) {
    return (
      <MobileShell subtitle="Çekici Paneli" footer={tabBar}>
        <p className="text-center text-slate-500 py-12">Yükleniyor…</p>
      </MobileShell>
    );
  }

  return (
    <MobileShell subtitle={`Hoş geldin, ${cekici.ad}`} footer={tabBar}>
      {flash && (
        <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex justify-between items-start gap-2">
          <p className="text-sm text-emerald-800 font-medium">✅ {flash}</p>
          <button
            type="button"
            onClick={() => setFlash(null)}
            className="text-emerald-600 text-lg leading-none"
            aria-label="Kapat"
          >
            ×
          </button>
        </div>
      )}

      {tab === "musteriler" && data && (
        <div className="space-y-6 animate-fade-in">
          <section>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
              Henüz satın alınmamış
            </h2>
            {data.bekleyen.length === 0 ? (
              <Card>
                <p className="text-sm text-slate-500 text-center py-2">
                  Şu an satın alabileceğiniz açık talep yok.
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {data.bekleyen.map((t) => (
                  <TalepKarti key={t.id} talep={t} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
              Satın alınmış (başkası aldı)
            </h2>
            {data.baskasiAldi.length === 0 ? (
              <Card>
                <p className="text-sm text-slate-500 text-center py-2">
                  Başkası tarafından alınan talep yok.
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {data.baskasiAldi.map((t) => (
                  <TalepKarti key={t.id} talep={t} kilitle />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
              Satın aldıklarım
            </h2>
            {data.satinAlinanlar.length === 0 ? (
              <Card>
                <p className="text-sm text-slate-500 text-center py-2">
                  Henüz müşteri almadınız.
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {data.satinAlinanlar.map((t) => (
                  <TalepKarti key={t.id} talep={t} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
              Müşteri sizi tercih etmedi
            </h2>
            {data.tercihEdilmedi.length === 0 ? (
              <Card>
                <p className="text-sm text-slate-500 text-center py-2">
                  Henüz elenen talep yok.
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {data.tercihEdilmedi.map((t) => (
                  <TalepKarti key={t.id} talep={t} kilitle />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
              Bugün — tüm müşteriler
            </h2>
            {data.bugunTumu.length === 0 ? (
              <Card>
                <p className="text-sm text-slate-500 text-center py-2">
                  Bugün henüz talep yok.
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {data.bugunTumu.map((t) => (
                  <TalepKarti
                    key={t.id}
                    talep={t}
                    kilitle={
                      t.listeDurumu === "baskasi_aldi" ||
                      t.listeDurumu === "tercih_edilmedi"
                    }
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {tab === "hesabim" && (
        <div className="space-y-4 animate-fade-in">
          <Card>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Krediniz</p>
            <p className="text-4xl font-bold text-amber-600 mt-1">
              {formatKredi(cekici.kredi)}
            </p>
            <p className="text-sm text-slate-500 mt-2">
              {cekici.ad} · {cekici.sehir}
            </p>
            <p className="text-sm text-slate-600">{cekici.telefon}</p>
          </Card>

          {istatistik && (
            <section>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
                Özet istatistikler
              </h2>
              <div className="grid grid-cols-2 gap-2">
                <Card className="text-center py-3">
                  <p className="text-2xl font-bold text-amber-600">
                    {istatistik.satinAldiklarim}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Satın aldıklarım</p>
                </Card>
                <Card className="text-center py-3">
                  <p className="text-2xl font-bold text-emerald-600">
                    %{istatistik.tercihOrani}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Beni tercih edenler</p>
                </Card>
                <Card className="text-center py-3">
                  <p className="text-2xl font-bold text-red-600">
                    {istatistik.tercihEdilmedim}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Tercih edilmedim</p>
                </Card>
                <Card className="text-center py-3">
                  <p className="text-2xl font-bold text-slate-800">
                    {formatKredi(istatistik.buHaftaHarcanan)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Bu hafta harcanan</p>
                </Card>
              </div>
            </section>
          )}

          <Link href="/cekici/ayarlar">
            <Btn variant="secondary">📊 Ayarlar & Detaylı İstatistikler</Btn>
          </Link>

          <Link href="/cekici/kredi">
            <Btn>💳 Kredi Satın Al</Btn>
          </Link>

          <section>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
              Daha önce satın aldıklarım
            </h2>
            {!data?.gecmisSatinAlimlar.length ? (
              <Card>
                <p className="text-sm text-slate-500 text-center py-2">
                  Henüz geçmiş kayıt yok.
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {data.gecmisSatinAlimlar.map((t) => (
                  <TalepKarti
                    key={`${t.id}-${t.satinAlmaTarihi}`}
                    talep={t}
                    kilitle={!t.aktif}
                  />
                ))}
              </div>
            )}
          </section>

          <Link href="/demo/sms">
            <Btn variant="secondary">📱 Demo SMS Kayıtları</Btn>
          </Link>
        </div>
      )}
    </MobileShell>
  );
}
