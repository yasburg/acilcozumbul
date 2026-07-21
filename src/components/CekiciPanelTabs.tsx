"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MobileShell } from "@/components/MobileShell";
import { Btn, Card, Field, SifreAlani } from "@/components/ui";
import { formatKredi } from "@/lib/talep-utils";
import type { ListeDurumu } from "@/lib/types";
import { cekiciFetch } from "@/lib/cekici-fetch";
import { HESAP_SIL_ONAY_METNI } from "@/lib/cekici-hesap-sil-onay";
import { useCekiciKonumSync } from "@/hooks/useCekiciKonumSync";
import { KonumGuncellemeGostergesi } from "@/components/KonumGuncellemeGostergesi";
import { DavetKoduAyarlari } from "@/components/cekici/DavetKoduAyarlari";
import { OnayliCekiciHesap } from "@/components/cekici/OnayliCekiciHesap";
import { CekiciAyarlarPanel } from "@/components/cekici/CekiciAyarlarPanel";
import { OnayliCekiciRozeti } from "@/components/OnayliCekiciRozeti";
import { DemoHeaderBadge } from "@/components/DemoHeaderBadge";
import { useKisiselVeriGizle } from "@/hooks/useKisiselVeriGizle";
import {
  adGoster,
  adresGoster,
  soyadKisaltGoster,
  telefonGoster,
  type GizlilikSeviye,
} from "@/lib/kisisel-veri-gizle";
import { posthogOlayBirKez, posthogOlayYakala } from "@/lib/posthog-client";

type Tab = "musteriler" | "hesabim" | "ayarlar";

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
  kazancBuAy: number;
  kazancToplam: number;
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
  bekleyenGizli?: TalepOzet[];
  teklifVerdigim: TalepOzet[];
  kazandiklarim: TalepOzet[];
  kaybettiklerim: TalepOzet[];
  tercihEdilmedi: TalepOzet[];
  bugunTumu: TalepOzet[];
  kredi?: number;
  krediYok?: boolean;
  demoModu?: boolean;
  satinAlinanlar?: TalepOzet[];
  baskasiAldi?: TalepOzet[];
}

const BADGE: Record<
  string,
  { label: string; className: string }
> = {
  acik: { label: "Açık ihale", className: "bg-amber-50 text-amber-700" },
  gizli: { label: "Kilitli", className: "bg-slate-100 text-slate-500" },
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
  gizlilik = "yok",
}: {
  talep: TalepOzet;
  kilitle?: boolean;
  gizlilik?: GizlilikSeviye;
}) {
  const durum = talep.listeDurumu ?? "acik";
  const badge = BADGE[durum] ?? BADGE.kaybettim;
  const ad = adGoster(talep.ad, gizlilik);
  const soyad = soyadKisaltGoster(talep.soyad, gizlilik);
  const telefon = telefonGoster(talep.telefon, gizlilik);
  const bolge = adresGoster(talep.bolge, gizlilik);

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
            {ad} {soyad}
          </p>
          {!kilitle && (
            <>
              <p className="text-sm text-slate-500 mt-0.5">📍 {bolge}</p>
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
            <p className="text-amber-700 font-mono text-sm mt-2">{telefon}</p>
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

function GizliTalepKarti({
  talep,
  kredi,
  yukleniyor,
  demoModu,
  onKatil,
}: {
  talep: TalepOzet;
  kredi: number;
  yukleniyor: boolean;
  demoModu?: boolean;
  onKatil: (talepId: string) => void;
}) {
  const katilabilir = demoModu || kredi >= 1;

  return (
    <button
      type="button"
      disabled={yukleniyor}
      onClick={() => onKatil(talep.id)}
      className="w-full text-left touch-manipulation disabled:opacity-60"
    >
      <Card className="relative overflow-hidden border border-dashed border-amber-300/80 bg-gradient-to-b from-slate-50 to-white p-0">
        <div className="p-4 blur-[4px] opacity-50 select-none pointer-events-none">
          <p className="font-semibold text-slate-800">Yeni müşteri talebi</p>
          <p className="text-sm text-slate-500 mt-1">📍 {talep.bolge}</p>
          <p className="text-sm text-slate-600 mt-2">Çekici ihtiyacı · detaylar gizli</p>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/75 backdrop-blur-[2px] px-4 py-6">
          <span className="text-2xl mb-2" aria-hidden>
            🔒
          </span>
          <p className="text-sm font-semibold text-amber-900 text-center leading-snug">
            {katilabilir
              ? "1 kredi ile ihaleye katıl"
              : "Kredi yükleyin, ihaleye katılın"}
          </p>
          <p className="text-xs text-slate-500 text-center mt-1">
            {katilabilir
              ? "Dokunun — müşteri bilgisi ve teklif açılır"
              : "1 kredi = 1 talep (teklif ücretsiz)"}
          </p>
        </div>
      </Card>
    </button>
  );
}

export default function CekiciPanelTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab: Tab =
    tabParam === "hesabim"
      ? "hesabim"
      : tabParam === "ayarlar"
        ? "ayarlar"
        : "musteriler";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [cekici, setCekici] = useState<{
    ad: string;
    kredi: number;
    sehir: string;
    telefon: string;
    hizmetModu?: string;
    menzilKm?: number;
    rozetAktif?: boolean;
    sehirKullanimAcik?: boolean;
  } | null>(null);

  const konumSync = useCekiciKonumSync(cekici?.hizmetModu);
  const [data, setData] = useState<PanelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState<string | null>(null);
  const [istatistik, setIstatistik] = useState<Istatistik | null>(null);
  const [panelYetkili, setPanelYetkili] = useState(false);
  const [panelEposta, setPanelEposta] = useState<string | null>(null);
  const [panelNext, setPanelNext] = useState("/panel");
  const [cikisYukleniyor, setCikisYukleniyor] = useState(false);
  const [katilYukleniyor, setKatilYukleniyor] = useState<string | null>(null);
  const [demoAktif, setDemoAktif] = useState(false);
  const [hesapSilAdim, setHesapSilAdim] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [hesapSiliyor, setHesapSiliyor] = useState(false);
  const [hesapSilHata, setHesapSilHata] = useState("");
  const [hesapSilSifre, setHesapSilSifre] = useState("");
  const [hesapSilOnayMetni, setHesapSilOnayMetni] = useState("");
  const [hesapSilKod, setHesapSilKod] = useState("");
  const [hesapSilSmsMesaj, setHesapSilSmsMesaj] = useState("");
  const [hesapSilGelistirmeKodu, setHesapSilGelistirmeKodu] = useState("");
  const [hesapSilYenidenSn, setHesapSilYenidenSn] = useState(0);
  const [hesapSilKodGonderiliyor, setHesapSilKodGonderiliyor] = useState(false);
  const { seviye: gizlilik, hesapSeviye } = useKisiselVeriGizle(
    demoAktif || Boolean(data?.demoModu)
  );

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

  const hesapSilSifirla = useCallback(() => {
    setHesapSilAdim(0);
    setHesapSilHata("");
    setHesapSilSifre("");
    setHesapSilOnayMetni("");
    setHesapSilKod("");
    setHesapSilSmsMesaj("");
    setHesapSilGelistirmeKodu("");
    setHesapSilYenidenSn(0);
  }, []);

  useEffect(() => {
    if (hesapSilYenidenSn <= 0) return;
    const t = window.setInterval(() => {
      setHesapSilYenidenSn((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(t);
  }, [hesapSilYenidenSn]);

  const hesapSilKodGonder = useCallback(async () => {
    if (!hesapSilSifre.trim()) {
      setHesapSilHata("Şifrenizi girin.");
      return;
    }
    setHesapSilKodGonderiliyor(true);
    setHesapSilHata("");
    try {
      const res = await cekiciFetch("/api/cekici/hesap/sil/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sifre: hesapSilSifre,
          onayMetni: hesapSilOnayMetni,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof body.error === "string" ? body.error : "Kod gönderilemedi."
        );
      }
      setHesapSilSmsMesaj(
        typeof body.mesaj === "string" ? body.mesaj : "Kod gönderildi."
      );
      setHesapSilGelistirmeKodu(
        typeof body.gelistirmeKodu === "string" ? body.gelistirmeKodu : ""
      );
      setHesapSilYenidenSn(Number(body.yenidenGonderSn) || 60);
      setHesapSilAdim(4);
      setHesapSilKod("");
    } catch (e) {
      setHesapSilHata(e instanceof Error ? e.message : "Kod gönderilemedi.");
    } finally {
      setHesapSilKodGonderiliyor(false);
    }
  }, [hesapSilSifre, hesapSilOnayMetni]);

  const hesabiSil = useCallback(async () => {
    if (!hesapSilSifre.trim()) {
      setHesapSilHata("Hesabı silmek için şifrenizi girin.");
      return;
    }
    if (!hesapSilKod.trim()) {
      setHesapSilHata("SMS kodunu girin.");
      return;
    }
    setHesapSiliyor(true);
    setHesapSilHata("");
    try {
      const res = await cekiciFetch("/api/cekici/hesap/sil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sifre: hesapSilSifre,
          kod: hesapSilKod,
          onayMetni: hesapSilOnayMetni,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof body.error === "string" ? body.error : "Hesap silinemedi."
        );
      }
      posthogOlayYakala("cekici_hesap_silindi", { rol: "cekici" });
      hesapSilSifirla();
      router.push("/cekici/giris?mesaj=hesap-silindi");
      router.refresh();
    } catch (e) {
      setHesapSilHata(
        e instanceof Error ? e.message : "Hesap silinemedi."
      );
    } finally {
      setHesapSiliyor(false);
    }
  }, [hesapSilSifre, hesapSilKod, hesapSilOnayMetni, hesapSilSifirla, router]);

  const ihaleyeKatil = useCallback(
    async (talepId: string) => {
      const mevcutKredi = data?.kredi ?? cekici?.kredi ?? 0;
      if (!data?.demoModu && mevcutKredi < 1) {
        router.push("/cekici/kredi");
        return;
      }
      setKatilYukleniyor(talepId);
      try {
        const res = await cekiciFetch(`/api/cekici/talep/${talepId}/katil`, {
          method: "POST",
        });
        const body = await res.json();
        if (!res.ok) {
          if (body.yetersizKredi) {
            router.push("/cekici/kredi");
            return;
          }
          setFlash(body.error || "Katılım başarısız.");
          return;
        }
        if (cekici && body.kredi != null) {
          setCekici({ ...cekici, kredi: body.kredi });
        }
        posthogOlayBirKez(
          `acil_ph_cekici_ihaleye_katil_${talepId}`,
          "cekici_ihaleye_katil",
          {
            rol: "cekici",
            talep_id: talepId,
            kaynak: "panel",
            demo: Boolean(data?.demoModu),
          }
        );
        router.push(`/cekici/talep/${talepId}`);
      } catch {
        setFlash("Bağlantı hatası.");
      } finally {
        setKatilYukleniyor(null);
      }
    },
    [cekici, data?.demoModu, data?.kredi, router]
  );

  const yukle = useCallback(async () => {
    const nextParam = searchParams.get("next");
    if (nextParam?.startsWith("/panel")) setPanelNext(nextParam);

    const [meRes, talepRes, statRes, panelRes, demoRes] = await Promise.all([
      cekiciFetch("/api/cekici/me"),
      cekiciFetch("/api/cekici/talepler"),
      cekiciFetch("/api/cekici/istatistik"),
      fetch("/api/panel/oturum", { credentials: "include" }),
      cekiciFetch("/api/cekici/demo-durum"),
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
    if (demoRes.ok) {
      const d = await demoRes.json();
      setDemoAktif(!!d.aktif);
    } else {
      setDemoAktif(false);
    }
    setLoading(false);
  }, [router, searchParams]);

  useEffect(() => {
    yukle();
    const interval = setInterval(yukle, 5000);
    return () => clearInterval(interval);
  }, [yukle]);

  useEffect(() => {
    const mesaj = searchParams.get("mesaj");
    if (!mesaj) return;

    if (mesaj === "musteri-alindi") {
      setFlash("Teklifiniz kabul edildi! Müşteri bilgilerine ulaşabilirsiniz.");
      setTab("musteriler");
      router.replace("/cekici/panel?tab=musteriler", { scroll: false });
      return;
    }
    if (mesaj === "rozet-aktif") {
      setFlash(
        "Onaylı çekici rozetiniz aktif. Teklifleriniz müşteri ekranında üst sıralarda görünür."
      );
      setTab("hesabim");
      router.replace("/cekici/panel?tab=hesabim", { scroll: false });
      return;
    }
    if (mesaj === "kredi-eklendi") {
      let eklenen: string | null = null;
      try {
        const kayit = sessionStorage.getItem("acil_odeme_basarili");
        if (kayit) {
          const s = JSON.parse(kayit) as { eklenenKredi?: number };
          if (s.eklenenKredi != null) eklenen = String(s.eklenenKredi);
          sessionStorage.removeItem("acil_odeme_basarili");
        }
      } catch {
        /* ignore */
      }
      if (!eklenen) eklenen = searchParams.get("eklenen");
      setFlash(
        eklenen
          ? `Kredi satın alma başarılı. ${eklenen} kredi hesabınıza eklendi.`
          : "Kredi satın alma başarılı."
      );
      setTab("hesabim");
      router.replace("/cekici/panel?tab=hesabim", { scroll: false });
      return;
    }
    if (mesaj === "kayit-basarili") {
      setFlash("Kayıt başarılı! Hoş geldiniz.");
      router.replace("/cekici/panel", { scroll: false });
    }
  }, [searchParams, router]);

  useEffect(() => {
    const next: Tab =
      tabParam === "hesabim"
        ? "hesabim"
        : tabParam === "ayarlar"
          ? "ayarlar"
          : "musteriler";
    setTab(next);
  }, [tabParam]);

  function tabDegistir(next: Tab) {
    setTab(next);
    router.replace(`/cekici/panel?tab=${next}`, { scroll: false });
  }

  const tabBar = (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white safe-bottom">
      <div className="flex max-w-lg mx-auto">
        {(
          [
            { key: "musteriler" as Tab, label: "İhaleler", icon: "✅" },
            { key: "hesabim" as Tab, label: "Hesabım", icon: "👤" },
            { key: "ayarlar" as Tab, label: "Ayarlar", icon: "⚙️" },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => tabDegistir(t.key)}
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
          <div className="flex flex-col gap-3">
            <Link
              href={panelNext.startsWith("/panel") ? panelNext : "/panel"}
              className="block"
            >
              <Btn>📋 Yönetim paneline git</Btn>
            </Link>
            <Link href="/cekici/giris" className="block">
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
    <MobileShell
      subtitle={
        tab === "ayarlar"
          ? "Ayarlar"
          : tab === "hesabim"
            ? "Hesabım"
            : `Hoş geldin, ${adGoster(cekici.ad, gizlilik)}`
      }
      headerBadge={
        demoAktif || data?.demoModu ? <DemoHeaderBadge /> : undefined
      }
      footer={tabBar}
    >
      {(demoAktif || data?.demoModu) && (
        <Card className="mb-4 border-amber-300 bg-amber-50">
          <p className="text-sm font-semibold text-amber-900">
            Demo modu — gerçek veri değişmiyor
          </p>
          <p className="text-xs text-amber-800 mt-1 leading-relaxed">
            Mock ihaleler geçici; kredi ve production talepler etkilenmez.
          </p>
        </Card>
      )}
      {konumSync.aktif && (
        <KonumGuncellemeGostergesi
          aktif
          gonderiliyor={konumSync.gonderiliyor}
          hata={konumSync.hata}
          sonGuncelleme={konumSync.sonGuncelleme}
          onYenile={konumSync.yenile}
        />
      )}
      {tab === "musteriler" && cekici.hizmetModu === "konum" && (
        <Card className="mb-4 border-blue-200 bg-blue-50">
          <p className="text-sm text-blue-900 leading-relaxed">
            📍 Konum menzili aktif — menzil{" "}
            <strong>{cekici.menzilKm ?? 0} km</strong>. Konumunuz dakikada bir
            güncellenir; talepler menzile göre gelir.
          </p>
        </Card>
      )}
      {tab === "musteriler" &&
        cekici.hizmetModu !== "konum" &&
        cekici.hizmetModu != null && (
          <Card className="mb-4 border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-800 leading-relaxed">
              📍 İl/ilçe eşleşmesi aktif. Konumunuz yine de dakikada bir
              güncellenir (canlı takip ve harita için).
            </p>
          </Card>
        )}

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

      {tab === "musteriler" && cekici.sehirKullanimAcik === false && (
        <Card className="mb-4 border-amber-300 bg-amber-50">
          <p className="text-sm font-semibold text-amber-950 mb-2">
            {cekici.sehir} henüz kullanıma açılmadı
          </p>
          <p className="text-sm text-amber-900 leading-relaxed">
            Kaydınız alındı. Şehriniz açılana kadar taleplere teklif veremez ve
            paneli kullanamazsınız. Sizi bekleme listesinde önde tutacağız;
            açılışta bilgilendirileceksiniz.
          </p>
        </Card>
      )}

      {tab === "musteriler" && data && cekici.sehirKullanimAcik !== false && (
        <div className="space-y-6 animate-fade-in">
          {data.krediYok && (data.bekleyenGizli?.length ?? 0) > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <p className="text-sm text-amber-900 leading-relaxed">
                Bölgenizde kilitli talepler var.{" "}
                <strong>1 kredi</strong> ile ihaleye katılabilir veya yeni talepler
                için SMS alabilirsiniz (teklif ücretsiz).
              </p>
              <Link
                href="/cekici/kredi"
                className="inline-block mt-2 text-sm font-semibold text-amber-700 underline"
              >
                Kredi yükle
              </Link>
            </Card>
          )}

          <section>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
              Açık ihaleler
            </h2>
            {data.bekleyen.length === 0 && (data.bekleyenGizli?.length ?? 0) === 0 ? (
              <Card>
                <p className="text-sm text-slate-500 text-center py-2 leading-relaxed">
                  Bölgenize uygun açık talep yok. Ayarlarınızı kontrol edin.
                </p>
              </Card>
            ) : (
              <div className="flex flex-col gap-4">
                {data.bekleyen.map((t) => (
                  <TalepKarti
                    key={t.id}
                    talep={t}
                    gizlilik={gizlilik}
                  />
                ))}
                {(data.bekleyenGizli ?? []).map((t) => (
                  <GizliTalepKarti
                    key={t.id}
                    talep={t}
                    kredi={data.kredi ?? cekici.kredi}
                    yukleniyor={katilYukleniyor === t.id}
                    demoModu={data.demoModu}
                    onKatil={ihaleyeKatil}
                  />
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
                  <TalepKarti
                    key={t.id}
                    talep={t}
                    gizlilik={gizlilik}
                  />
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
                  <TalepKarti
                    key={t.id}
                    talep={t}
                    gizlilik={gizlilik}
                  />
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
                  <TalepKarti
                    key={t.id}
                    talep={t}
                    kilitle
                    gizlilik={gizlilik}
                  />
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
                  <TalepKarti
                    key={t.id}
                    talep={t}
                    kilitle
                    gizlilik={gizlilik}
                  />
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
                    gizlilik={gizlilik}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {tab === "hesabim" && (
        <div className="space-y-4 animate-fade-in">
          <DavetKoduAyarlari />

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Krediniz</p>
              {cekici.rozetAktif && <OnayliCekiciRozeti kucuk />}
            </div>
            <div className="flex items-center justify-between gap-3 mt-1">
              <p className="text-4xl font-bold text-amber-600">
                {formatKredi(cekici.kredi)}
              </p>
              <Link href="/cekici/kredi" className="shrink-0">
                <Btn className="w-auto min-h-0 py-2.5 px-4 text-sm whitespace-nowrap">
                  💳 Kredi Satın Al
                </Btn>
              </Link>
            </div>
            <p className="text-sm text-slate-500 mt-2">
              {adGoster(cekici.ad, hesapSeviye)} · {cekici.sehir}
            </p>
            <p className="text-sm text-slate-600">
              {telefonGoster(cekici.telefon, hesapSeviye)}
            </p>
          </Card>

          <OnayliCekiciHesap />

          {istatistik && (
            <section>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
                Özet istatistikler
              </h2>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <Card className="text-center py-3 border-emerald-200 bg-emerald-50/50">
                  <p className="text-xl font-bold text-emerald-700 tabular-nums">
                    {(istatistik.kazancBuAy ?? 0).toLocaleString("tr-TR")} TL
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Bu ay (kazanılan / anlaşılan)
                  </p>
                </Card>
                <Card className="text-center py-3 border-emerald-200 bg-emerald-50/50">
                  <p className="text-xl font-bold text-emerald-800 tabular-nums">
                    {(istatistik.kazancToplam ?? 0).toLocaleString("tr-TR")} TL
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Toplam (kazanılan / anlaşılan)
                  </p>
                </Card>
              </div>
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

          <div className="flex flex-col gap-3 pt-1">
            {panelYetkili && (
              <Link
                href={panelNext.startsWith("/panel") ? panelNext : "/panel"}
                className="block"
              >
                <Btn variant="secondary">📋 Yönetim paneline git</Btn>
              </Link>
            )}

            <Btn
              variant="danger"
              onClick={() => void oturumuKapat()}
              disabled={cikisYukleniyor || hesapSiliyor}
            >
              {cikisYukleniyor ? "Çıkış yapılıyor…" : "Çıkış yap"}
            </Btn>

            <div className="pt-6 border-t border-slate-100">
              <button
                type="button"
                className="text-[11px] text-slate-400 underline-offset-2 hover:text-slate-500 hover:underline disabled:opacity-50"
                onClick={() => {
                  hesapSilSifirla();
                  setHesapSilAdim(1);
                }}
                disabled={hesapSiliyor || cikisYukleniyor}
              >
                Hesap silme
              </button>
            </div>
          </div>

          {hesapSilAdim > 0 && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
              role="dialog"
              aria-modal="true"
              aria-labelledby="hesap-sil-onay-baslik"
            >
              <Card className="w-full max-w-md shadow-xl space-y-4 max-h-[90dvh] overflow-y-auto">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  Adım {hesapSilAdim} / 4
                </p>

                {hesapSilAdim === 1 && (
                  <>
                    <h3
                      id="hesap-sil-onay-baslik"
                      className="text-lg font-bold text-slate-900"
                    >
                      Emin misiniz?
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Hesap silme geri alınamaz. Kredi bakiyeniz, ödeme
                      geçmişiniz, belgeleriniz ve tüm kayıtlarınız kalıcı olarak
                      silinir.
                    </p>
                    <div className="flex flex-col-reverse sm:flex-row gap-2">
                      <Btn
                        variant="secondary"
                        onClick={hesapSilSifirla}
                      >
                        Vazgeç
                      </Btn>
                      <Btn
                        variant="danger"
                        onClick={() => {
                          setHesapSilHata("");
                          setHesapSilAdim(2);
                        }}
                      >
                        Evet, devam et
                      </Btn>
                    </div>
                  </>
                )}

                {hesapSilAdim === 2 && (
                  <>
                    <h3
                      id="hesap-sil-onay-baslik"
                      className="text-lg font-bold text-slate-900"
                    >
                      Onay metnini yazın
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Devam etmek için kutuya aynen şunu yazın:{" "}
                      <span className="font-mono font-semibold text-slate-800">
                        {HESAP_SIL_ONAY_METNI}
                      </span>
                    </p>
                    <Field
                      label="Onay metni"
                      value={hesapSilOnayMetni}
                      onChange={(e) => {
                        setHesapSilOnayMetni(e.target.value);
                        if (hesapSilHata) setHesapSilHata("");
                      }}
                      autoComplete="off"
                      spellCheck={false}
                    />
                    {hesapSilHata && (
                      <p className="text-sm text-red-700" role="alert">
                        {hesapSilHata}
                      </p>
                    )}
                    <div className="flex flex-col-reverse sm:flex-row gap-2">
                      <Btn
                        variant="secondary"
                        onClick={() => {
                          setHesapSilHata("");
                          setHesapSilAdim(1);
                        }}
                      >
                        Geri
                      </Btn>
                      <Btn
                        variant="danger"
                        onClick={() => {
                          const ok =
                            hesapSilOnayMetni
                              .trim()
                              .toLocaleUpperCase("tr")
                              .replace(/\s+/g, " ") === HESAP_SIL_ONAY_METNI;
                          if (!ok) {
                            setHesapSilHata(
                              `Lütfen «${HESAP_SIL_ONAY_METNI}» yazın.`
                            );
                            return;
                          }
                          setHesapSilHata("");
                          setHesapSilAdim(3);
                        }}
                      >
                        Devam
                      </Btn>
                    </div>
                  </>
                )}

                {hesapSilAdim === 3 && (
                  <>
                    <h3
                      id="hesap-sil-onay-baslik"
                      className="text-lg font-bold text-slate-900"
                    >
                      Şifre ve SMS doğrulama
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Şifrenizi girin; kayıtlı telefonunuza SMS ile kod
                      göndereceğiz.
                    </p>
                    <SifreAlani
                      label="Şifre"
                      autoComplete="current-password"
                      value={hesapSilSifre}
                      onChange={(e) => {
                        setHesapSilSifre(e.target.value);
                        if (hesapSilHata) setHesapSilHata("");
                      }}
                      disabled={hesapSilKodGonderiliyor}
                    />
                    {hesapSilHata && (
                      <p className="text-sm text-red-700" role="alert">
                        {hesapSilHata}
                      </p>
                    )}
                    <div className="flex flex-col-reverse sm:flex-row gap-2">
                      <Btn
                        variant="secondary"
                        onClick={() => {
                          setHesapSilHata("");
                          setHesapSilAdim(2);
                        }}
                        disabled={hesapSilKodGonderiliyor}
                      >
                        Geri
                      </Btn>
                      <Btn
                        variant="danger"
                        onClick={() => void hesapSilKodGonder()}
                        disabled={
                          hesapSilKodGonderiliyor || !hesapSilSifre.trim()
                        }
                      >
                        {hesapSilKodGonderiliyor
                          ? "Kod gönderiliyor…"
                          : "SMS kodu gönder"}
                      </Btn>
                    </div>
                  </>
                )}

                {hesapSilAdim === 4 && (
                  <>
                    <h3
                      id="hesap-sil-onay-baslik"
                      className="text-lg font-bold text-slate-900"
                    >
                      SMS kodunu girin
                    </h3>
                    {hesapSilSmsMesaj && (
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {hesapSilSmsMesaj}
                      </p>
                    )}
                    {hesapSilGelistirmeKodu && (
                      <p className="text-xs font-mono text-amber-800 bg-amber-50 rounded-lg px-2 py-1.5">
                        Geliştirme kodu: {hesapSilGelistirmeKodu}
                      </p>
                    )}
                    <Field
                      label="6 haneli kod"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={hesapSilKod}
                      onChange={(e) => {
                        setHesapSilKod(
                          e.target.value.replace(/\D/g, "").slice(0, 6)
                        );
                        if (hesapSilHata) setHesapSilHata("");
                      }}
                      disabled={hesapSiliyor}
                    />
                    {hesapSilHata && (
                      <p className="text-sm text-red-700" role="alert">
                        {hesapSilHata}
                      </p>
                    )}
                    <button
                      type="button"
                      className="text-xs text-slate-500 underline-offset-2 hover:underline disabled:opacity-40"
                      disabled={
                        hesapSilYenidenSn > 0 ||
                        hesapSilKodGonderiliyor ||
                        hesapSiliyor
                      }
                      onClick={() => void hesapSilKodGonder()}
                    >
                      {hesapSilYenidenSn > 0
                        ? `Yeniden gönder (${hesapSilYenidenSn} sn)`
                        : "Kodu yeniden gönder"}
                    </button>
                    <div className="flex flex-col-reverse sm:flex-row gap-2">
                      <Btn
                        variant="secondary"
                        onClick={() => {
                          setHesapSilHata("");
                          setHesapSilAdim(3);
                        }}
                        disabled={hesapSiliyor}
                      >
                        Geri
                      </Btn>
                      <Btn
                        variant="danger"
                        onClick={() => void hesabiSil()}
                        disabled={
                          hesapSiliyor || hesapSilKod.replace(/\D/g, "").length !== 6
                        }
                      >
                        {hesapSiliyor
                          ? "Siliniyor…"
                          : "Hesabımı kalıcı olarak sil"}
                      </Btn>
                    </div>
                  </>
                )}
              </Card>
            </div>
          )}
        </div>
      )}

      {tab === "ayarlar" && <CekiciAyarlarPanel />}
    </MobileShell>
  );
}
