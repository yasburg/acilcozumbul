"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MobileShell } from "@/components/MobileShell";
import { Btn, Card } from "@/components/ui";
import { formatKredi } from "@/lib/talep-utils";
import type { ListeDurumu } from "@/lib/types";
import { cekiciFetch } from "@/lib/cekici-fetch";

type Tab = "musteriler" | "hesabim";

interface Istatistik {
  satinAldiklarim: number;
  beniTercihEdenler: number;
  tercihEdilmedim: number;
  tercihOrani: number;
  tercihPuani: number | null;
  fiyatGarantiPuani: number;
  fiyatGarantiYuzde: number;
  hizmetPuani: number | null;
  hizmetDegerlendirmeAdet: number;
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
  teklifSayisi?: number;
  enDusukTeklif?: number;
  benimTeklifim?: boolean;
  kazandim?: boolean;
  telefon?: string;
  listeDurumu?: ListeDurumu;
}

interface PanelData {
  bekleyen: TalepOzet[];
  teklifVerdigim: TalepOzet[];
  kazandiklarim: TalepOzet[];
  kaybettiklerim: TalepOzet[];
  tercihEdilmedi: TalepOzet[];
  bugunTumu: TalepOzet[];
  satinAlinanlar?: TalepOzet[];
  baskasiAldi?: TalepOzet[];
}

const BADGE: Record<
  string,
  { label: string; className: string }
> = {
  acik: { label: "Açık ihale", className: "bg-amber-50 text-amber-700" },
  teklif_verdim: { label: "Teklif verdim", className: "bg-blue-50 text-blue-700" },
  kazandim: { label: "Kazandım", className: "bg-emerald-50 text-emerald-700" },
  kaybettim: { label: "Kaybettim", className: "bg-slate-100 text-slate-600" },
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
  talep: TalepOzet;
  kilitle?: boolean;
}) {
  const durum = talep.listeDurumu ?? "acik";
  const badge = BADGE[durum] ?? BADGE.kaybettim;

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
              {talep.teklifSayisi != null && talep.teklifSayisi > 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  {talep.teklifSayisi} teklif
                  {talep.enDusukTeklif != null && ` · en düşük ${talep.enDusukTeklif} TL`}
                </p>
              )}
            </>
          )}
          {kilitle && durum === "kaybettim" && (
            <p className="text-sm text-slate-500 mt-1">Başka çekici seçildi</p>
          )}
          {kilitle && durum === "tercih_edilmedi" && (
            <p className="text-sm text-slate-500 mt-1">Müşteri sizi tercih etmedi</p>
          )}
          {talep.telefon && durum === "kazandim" && (
            <p className="text-amber-700 font-mono text-sm mt-2">{talep.telefon}</p>
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
  const [panelYetkili, setPanelYetkili] = useState(false);
  const [panelEposta, setPanelEposta] = useState<string | null>(null);
  const [panelNext, setPanelNext] = useState("/panel");
  const [cikisYukleniyor, setCikisYukleniyor] = useState(false);

  const oturumuKapat = useCallback(async () => {
    setCikisYukleniyor(true);
    try {
      await cekiciFetch("/api/cekici/cikis", { method: "POST" });
      await fetch("/api/panel/cikis", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      /* yine de girişe yönlendir */
    } finally {
      setCikisYukleniyor(false);
      router.push("/cekici/giris");
      router.refresh();
    }
  }, [router]);

  const yukle = useCallback(async () => {
    const nextParam = searchParams.get("next");
    if (nextParam?.startsWith("/panel")) setPanelNext(nextParam);

    const [meRes, talepRes, statRes, panelRes] = await Promise.all([
      cekiciFetch("/api/cekici/me"),
      cekiciFetch("/api/cekici/talepler"),
      cekiciFetch("/api/cekici/istatistik"),
      fetch("/api/panel/oturum", { credentials: "include" }),
    ]);

    let yetkili = false;
    if (panelRes.ok) {
      const p = await panelRes.json();
      yetkili = !!p.yetkili;
      setPanelYetkili(yetkili);
      setPanelEposta(p.eposta ?? null);
    } else {
      setPanelYetkili(false);
    }

    if (!meRes.ok) {
      if (yetkili) {
        setLoading(false);
        return;
      }
      router.push("/cekici/giris");
      return;
    }
    setCekici(await meRes.json());
    if (talepRes.ok) setData(await talepRes.json());
    if (statRes.ok) setIstatistik(await statRes.json());
    setLoading(false);
  }, [router, searchParams]);

  useEffect(() => {
    yukle();
    const interval = setInterval(yukle, 5000);
    return () => clearInterval(interval);
  }, [yukle]);

  useEffect(() => {
    const mesaj = searchParams.get("mesaj");
    if (mesaj === "musteri-alindi") {
      setFlash("Teklifiniz kabul edildi! Müşteri bilgilerine ulaşabilirsiniz.");
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

  if (loading) {
    return (
      <MobileShell subtitle="Çekici Paneli" footer={tabBar}>
        <p className="text-center text-slate-500 py-12">Yükleniyor…</p>
      </MobileShell>
    );
  }

  if (!cekici && panelYetkili) {
    return (
      <MobileShell subtitle="Hesabım" footer={tabBar}>
        <div className="space-y-4 animate-fade-in">
          <Card className="bg-slate-50 border-slate-200">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
              Yetkili girişi
            </p>
            <p className="text-sm text-slate-800">
              {panelEposta ?? "Yönetici hesabı"} ile giriş yaptınız.
            </p>
          </Card>
          <Link href={panelNext.startsWith("/panel") ? panelNext : "/panel"}>
            <Btn>📋 Yönetim paneline git</Btn>
          </Link>
          <Link href="/cekici/giris">
            <Btn variant="outline">📱 Üye girişi (telefon / kayıt)</Btn>
          </Link>
          <Btn
            variant="danger"
            onClick={() => void oturumuKapat()}
            disabled={cikisYukleniyor}
          >
            {cikisYukleniyor ? "Çıkış yapılıyor…" : "Çıkış yap"}
          </Btn>
        </div>
      </MobileShell>
    );
  }

  if (!cekici) {
    return (
      <MobileShell subtitle="Çekici Paneli">
        <p className="text-center text-slate-500 py-12">Yönlendiriliyor…</p>
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
              Açık ihaleler
            </h2>
            {data.bekleyen.length === 0 ? (
              <Card>
                <p className="text-sm text-slate-500 text-center py-2 leading-relaxed">
                  Bölgenizde ve hesabınızda tanımlı sorun tiplerine uygun açık
                  talep yok. Ayarlardan ilçe ve sorun tiplerinizi kontrol edin.
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
              Teklif verdiğim
            </h2>
            {(data.teklifVerdigim?.length ?? 0) === 0 ? (
              <Card>
                <p className="text-sm text-slate-500 text-center py-2">
                  Bekleyen teklifiniz yok.
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {data.teklifVerdigim!.map((t) => (
                  <TalepKarti key={t.id} talep={t} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
              Kazandıklarım
            </h2>
            {(data.kazandiklarim?.length ?? 0) === 0 ? (
              <Card>
                <p className="text-sm text-slate-500 text-center py-2">
                  Henüz kazandığınız müşteri yok.
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {data.kazandiklarim!.map((t) => (
                  <TalepKarti key={t.id} talep={t} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
              Kaybettiklerim
            </h2>
            {(data.kaybettiklerim?.length ?? 0) === 0 ? (
              <Card>
                <p className="text-sm text-slate-500 text-center py-2">
                  Kaybedilen ihale yok.
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {data.kaybettiklerim!.map((t) => (
                  <TalepKarti key={t.id} talep={t} kilitle />
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
                      t.listeDurumu === "kaybettim" ||
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
                  <p className="text-xs text-slate-500 mt-1">Kazandıklarım</p>
                </Card>
                <Card className="text-center py-3">
                  <p className="text-2xl font-bold text-emerald-600">
                    {istatistik.tercihPuani != null
                      ? `${istatistik.tercihPuani}/5`
                      : "—"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Tercih puanı
                    {istatistik.tercihPuani != null
                      ? ` (%${istatistik.tercihOrani})`
                      : ""}
                  </p>
                </Card>
                <Card className="text-center py-3">
                  <p className="text-2xl font-bold text-blue-600">
                    {istatistik.hizmetPuani != null
                      ? `${istatistik.hizmetPuani}/5`
                      : "—"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Hizmet puanı
                    {istatistik.hizmetDegerlendirmeAdet > 0
                      ? ` (${istatistik.hizmetDegerlendirmeAdet} değ.)`
                      : ""}
                  </p>
                </Card>
                <Card className="text-center py-3">
                  <p className="text-2xl font-bold text-slate-700">
                    {istatistik.fiyatGarantiPuani}/5
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Fiyat garantisi (%{istatistik.fiyatGarantiYuzde})
                  </p>
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

          {panelYetkili && (
            <Link
              href={panelNext.startsWith("/panel") ? panelNext : "/panel"}
            >
              <Btn variant="secondary">📋 Yönetim paneline git</Btn>
            </Link>
          )}

          <Link href="/cekici/ayarlar">
            <Btn variant="secondary">📊 Ayarlar & Detaylı İstatistikler</Btn>
          </Link>

          <Link href="/cekici/kredi">
            <Btn>💳 Kredi Satın Al</Btn>
          </Link>

          <Link href="/demo/sms">
            <Btn variant="secondary">📱 Demo SMS Kayıtları</Btn>
          </Link>

          <Btn
            variant="danger"
            onClick={() => void oturumuKapat()}
            disabled={cikisYukleniyor}
          >
            {cikisYukleniyor ? "Çıkış yapılıyor…" : "Çıkış yap"}
          </Btn>
        </div>
      )}
    </MobileShell>
  );
}
