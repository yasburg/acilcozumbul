"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createPortal } from "react-dom";
import { MobileShell } from "@/components/MobileShell";
import { OpeningLogo } from "@/components/acb/OpeningLogo";
import { FlowProgress } from "@/components/acb/FlowProgress";
import { Btn, Field, Card, Spinner } from "@/components/ui";
import { YasalOnayKutusu } from "@/components/yasal/YasalOnayKutusu";
import { IlceSecimi } from "@/components/IlceSecimi";
import type { KayitFunnelTanim, KayitHizmetOnsecim } from "@/lib/kayit-funnel";
import { kayitHizmetSorunOnerisi } from "@/lib/kayit-funnel";
import {
  kayitFunnelOlayBirKez,
  kayitFunnelOlayGonder,
  kayitFunnelSessionId,
  kayitFunnelAlanFocus,
  kayitFunnelAlanDoldu,
} from "@/lib/kayit-funnel-client";
import { TELEFON_ORNEK_GIRISLERI } from "@/lib/telefon";
import { DESTEKLENEN_ILLER, ilceListesi } from "@/lib/il-ilce";
import {
  ISTANBUL_ASYA_ILCELER,
  ISTANBUL_AVRUPA_ILCELER,
  ISTANBUL_IL,
} from "@/lib/istanbul-ilceler";
import { KULLANIMA_ACIK_ILLER } from "@/lib/cekici-sehir-acilis";
import { idleSonra } from "@/lib/idle-sonra";
import { gecerliSorunTipi } from "@/lib/sorun-tipleri";
import { KayitCarkKampanya } from "@/components/kayit/KayitCarkKampanya";
import { KayitSehirHarita } from "@/components/kayit/KayitSehirHarita";
import { carkOdulOku, carkOdulTemizle } from "@/lib/kayit-cark-client";
import { cihazPlatformu } from "@/lib/konum-client";
import { SorunIkon } from "@/lib/acb-icons";
import { ACB_SHELL_MAX_W } from "@/lib/design-tokens";
import {
  stickyCtaGercekYukseklik,
  stickyCtaOffsetAyarla,
  stickyCtaOffsetTemizle,
} from "@/lib/sticky-cta-offset";
import { MapPin, Search } from "lucide-react";

type Adim =
  | "is"
  | "is_coklu"
  | "sehir"
  | "bolge"
  | "ilce"
  | "telefon"
  | "otp"
  | "basarili";

type YakaSecim = "avrupa" | "anadolu" | "her_iki" | "belirli";

const HIZMET_KARTLARI: {
  id: Exclude<KayitHizmetOnsecim, null>;
  sorunId: string;
  baslik: string;
  alt?: string;
}[] = [
  {
    id: "cekici",
    sorunId: "cekici",
    baslik: "Çekici / oto kurtarma",
    alt: "Arıza, kaza ve nakliye talepleri",
  },
  {
    id: "lastik",
    sorunId: "lastik",
    baslik: "Mobil lastikçi",
    alt: "Yerinde lastik tamiri ve değişimi",
  },
  {
    id: "anahtar",
    sorunId: "kilit",
    baslik: "Oto anahtarcı",
    alt: "Kilit açma ve anahtar desteği",
  },
  {
    id: "birden_fazla",
    sorunId: "ariza",
    baslik: "Birden fazla hizmet veriyorum",
    alt: "Çekici + lastik + anahtar + akü",
  },
];

const COKLU_HIZMETLER: { id: string; label: string; sorunId: string }[] = [
  { id: "cekici", label: "Araç çekme / kurtarma", sorunId: "cekici" },
  { id: "arac-tasima", label: "Araç nakliye / taşıma", sorunId: "arac-tasima" },
  { id: "lastik", label: "Mobil lastik yardımı", sorunId: "lastik" },
  { id: "aku", label: "Akü takviyesi & değişim", sorunId: "aku" },
  { id: "yakit", label: "Yakıt & şarj desteği", sorunId: "yakit" },
  { id: "kilit", label: "Oto anahtar & çilingir", sorunId: "kilit" },
];

const POPULER_SEHIRLER = [
  "İstanbul",
  "Ankara",
  "İzmir",
  "Bursa",
  "Antalya",
  "Kocaeli",
  "Adana",
  "Konya",
  "Muğla",
  "Gaziantep",
];

function adimIlerlemeIndex(adim: Adim): number {
  switch (adim) {
    case "is":
    case "is_coklu":
      return 1;
    case "sehir":
    case "bolge":
    case "ilce":
      return 2;
    case "telefon":
    case "otp":
    case "basarili":
      return 3;
    default:
      return 1;
  }
}

function yakaIlceleri(y: YakaSecim): string[] {
  if (y === "avrupa") return [...ISTANBUL_AVRUPA_ILCELER];
  if (y === "anadolu") return [...ISTANBUL_ASYA_ILCELER];
  if (y === "her_iki") {
    return [...ISTANBUL_AVRUPA_ILCELER, ...ISTANBUL_ASYA_ILCELER];
  }
  return [];
}

function hizmetEtiket(h: KayitHizmetOnsecim): string {
  switch (h) {
    case "cekici":
      return "çekici";
    case "lastik":
      return "mobil lastik";
    case "anahtar":
      return "oto anahtar";
    case "birden_fazla":
      return "yol yardım";
    default:
      return "iş";
  }
}

/** Sticky alt navigasyon barı (FlowProgress + Geri + Devam) */
function KayitStickyNav({
  onGeri,
  onDevam,
  devamDisabled = false,
  devamMetin = "Devam et",
  loading = false,
  progress,
  geriGizle = false,
}: {
  onGeri?: () => void;
  onDevam: () => void;
  devamDisabled?: boolean;
  devamMetin?: React.ReactNode;
  loading?: boolean;
  progress?: React.ReactNode;
  geriGizle?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const el = rootRef.current;
    if (!el) return;
    const guncelle = () => stickyCtaOffsetAyarla(stickyCtaGercekYukseklik(el));
    guncelle();
    const ro = new ResizeObserver(guncelle);
    ro.observe(el);
    // Progress -mt-8 taşması kök kutusunu büyütmez; alt ağacı da izle.
    for (const child of el.children) ro.observe(child);
    return () => {
      ro.disconnect();
      stickyCtaOffsetTemizle();
    };
  }, [mounted, devamDisabled, loading, progress]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={rootRef}
      className="fixed inset-x-0 bottom-0 z-20 pointer-events-none px-4 pt-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className={`mx-auto ${ACB_SHELL_MAX_W} pointer-events-auto`}>
        {progress ? (
          <div className="-mt-8 mb-2 flex justify-center">{progress}</div>
        ) : null}
        <div className="flex gap-3">
          {!geriGizle && onGeri ? (
            <Btn
              type="button"
              variant="geri"
              className="shrink-0 min-w-[4.25rem] max-w-[5.5rem] !px-3 text-xs xs:text-sm"
              onClick={onGeri}
              disabled={loading}
            >
              Geri
            </Btn>
          ) : null}
          <Btn
            type="button"
            className={[
              "flex-1 !font-bold !tracking-wide",
              !devamDisabled && !loading ? "animate-devam-glow" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={onDevam}
            disabled={devamDisabled || loading}
          >
            {loading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Spinner className="size-4 border-white/40 border-t-white" />
                İşlem yapılıyor…
              </span>
            ) : (
              devamMetin
            )}
          </Btn>
        </div>
      </div>
    </div>,
    document.body
  );
}

function WizardIcerik({ funnel }: { funnel: KayitFunnelTanim }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const telefonRef = useRef<HTMLInputElement>(null);

  const [adim, setAdim] = useState<Adim>("is");
  const [hizmet, setHizmet] = useState<KayitHizmetOnsecim>(null);
  const [cokluSorunlar, setCokluSorunlar] = useState<string[]>([]);
  const [sehir, setSehir] = useState(ISTANBUL_IL);
  const [sehirAra, setSehirAra] = useState("");
  const [acikIller, setAcikIller] = useState<readonly string[]>([
    ...KULLANIMA_ACIK_ILLER,
  ]);
  const [yaka, setYaka] = useState<YakaSecim | null>(null);
  const [ilceler, setIlceler] = useState<string[]>([]);
  const [telefon, setTelefon] = useState("");
  const [telefonHata, setTelefonHata] = useState(false);
  const [ornekSmsAcik, setOrnekSmsAcik] = useState(false);
  const [ornekSmsCikis, setOrnekSmsCikis] = useState(false);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartY = useRef(0);
  const touchCurrentY = useRef(0);
  const isSwiping = useRef(false);
  const [smsIpucu, setSmsIpucu] = useState(false);
  const [telefonParlama, setTelefonParlama] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "other">(
    "other"
  );
  const [otp, setOtp] = useState("");
  const [yasalOnay, setYasalOnay] = useState(false);
  const [yasalHata, setYasalHata] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [yenidenSn, setYenidenSn] = useState(0);
  const sonOtpDeneme = useRef("");

  const urlDavet = (
    searchParams.get("kampanya") ||
    searchParams.get("davet") ||
    searchParams.get("kod") ||
    ""
  ).trim();
  const smsToken = searchParams.get("sms_token")?.trim() || undefined;

  useEffect(() => {
    setPlatform(cihazPlatformu());
  }, []);

  useEffect(() => {
    let iptal = false;
    void fetch("/api/sehir-acilis")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (iptal || !d?.acikIller || !Array.isArray(d.acikIller)) return;
        setAcikIller(d.acikIller.map(String));
      })
      .catch(() => {});
    return () => {
      iptal = true;
    };
  }, []);

  useEffect(() => {
    const sehirQ = searchParams.get("sehir")?.trim();
    if (sehirQ && DESTEKLENEN_ILLER.includes(sehirQ)) {
      setSehir(sehirQ);
    }
    kayitFunnelOlayBirKez(funnel.id, "goruldu");
    return idleSonra(() => {
      void import("@/lib/posthog-client").then((m) => {
        m.posthogKampanyaKaydet();
        m.posthogOlayYakala("cekici_kayit_goruldu", {
          rol: "cekici",
          funnel: funnel.id,
        });
      });
      void import("@/lib/tiktok-pixel").then((m) =>
        m.tiktokPixelViewContent({
          content_id: `kayit_${funnel.id}`,
          content_name: `cekici_kayit_${funnel.id}`,
        })
      );
    });
  }, [funnel.id, searchParams]);

  useEffect(() => {
    if (yenidenSn <= 0) return;
    const t = setTimeout(() => setYenidenSn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [yenidenSn]);

  useEffect(() => {
    if (adim !== "telefon") {
      setOrnekSmsAcik(false);
      setOrnekSmsCikis(false);
      setDragOffsetY(0);
      setSmsIpucu(false);
      setTelefonParlama(false);
      return;
    }
    const t = setTimeout(() => {
      setOrnekSmsCikis(false);
      setDragOffsetY(0);
      setOrnekSmsAcik(true);
      try {
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate([35, 55, 35, 40, 70]);
        }
      } catch {
        /* iOS / izin yok */
      }
    }, 450);
    return () => clearTimeout(t);
  }, [adim]);

  useEffect(() => {
    if (!ornekSmsAcik || ornekSmsCikis) return;
    const titre = () => {
      try {
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate([25, 40, 25]);
        }
      } catch {
        /* ignore */
      }
    };
    const id = window.setInterval(titre, 2000);
    return () => window.clearInterval(id);
  }, [ornekSmsAcik, ornekSmsCikis]);

  function banneriKapat() {
    setOrnekSmsCikis(true);
    window.setTimeout(() => {
      setOrnekSmsAcik(false);
      setOrnekSmsCikis(false);
      setDragOffsetY(0);
    }, 320);
  }

  function handleTouchStart(e: React.TouchEvent | React.MouseEvent) {
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    touchStartY.current = clientY;
    touchCurrentY.current = clientY;
    isSwiping.current = false;
    setIsDragging(true);
  }

  function handleTouchMove(e: React.TouchEvent | React.MouseEvent) {
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    touchCurrentY.current = clientY;
    const deltaY = clientY - touchStartY.current;
    if (deltaY < -4) {
      isSwiping.current = true;
    }
    const offset = deltaY < 0 ? deltaY : deltaY * 0.15;
    setDragOffsetY(offset);
  }

  function handleTouchEnd() {
    setIsDragging(false);
    const deltaY = touchCurrentY.current - touchStartY.current;
    if (deltaY <= -30 || (isSwiping.current && deltaY < -15)) {
      banneriKapat();
    } else {
      setDragOffsetY(0);
      isSwiping.current = false;
    }
  }

  function ornekSmsTikla() {
    if (ornekSmsCikis) return;
    setOrnekSmsCikis(true);
    setSmsIpucu(true);
    setTelefonParlama(true);
    window.requestAnimationFrame(() => {
      telefonRef.current?.focus();
    });
    window.setTimeout(() => {
      setOrnekSmsAcik(false);
      setOrnekSmsCikis(false);
      setDragOffsetY(0);
    }, 360);
    window.setTimeout(() => setTelefonParlama(false), 2200);
  }

  function handleBannerClick() {
    if (isSwiping.current || Math.abs(dragOffsetY) > 8) return;
    ornekSmsTikla();
  }

  const sorunTipleri = useMemo(() => {
    if (hizmet === "birden_fazla") {
      return cokluSorunlar.filter(gecerliSorunTipi);
    }
    return kayitHizmetSorunOnerisi(hizmet);
  }, [hizmet, cokluSorunlar]);

  const sehirIlceler = useMemo(() => ilceListesi(sehir), [sehir]);
  const istanbulMu = sehir === ISTANBUL_IL;

  const sehirAramaSonuclari = useMemo(() => {
    const q = sehirAra.trim().toLocaleLowerCase("tr-TR");
    if (q.length < 1) return [];
    return DESTEKLENEN_ILLER.filter((il) =>
      il.toLocaleLowerCase("tr-TR").includes(q)
    ).slice(0, 8);
  }, [sehirAra]);

  function sehirSec(il: string) {
    setSehir(il);
    setSehirAra("");
  }

  const telefonBaslik = useMemo(() => {
    const hEtiket = hizmetEtiket(hizmet);
    if (istanbulMu && yaka === "avrupa") {
      return `Avrupa Yakası’ndaki ${hEtiket} taleplerini alın`;
    }
    if (istanbulMu && yaka === "anadolu") {
      return `Anadolu Yakası’ndaki ${hEtiket} taleplerini alın`;
    }
    if (istanbulMu && yaka === "her_iki") {
      return `İstanbul’daki ${hEtiket} taleplerini alın`;
    }
    if (istanbulMu && yaka === "belirli") {
      return `Seçtiğiniz bölgelerdeki ${hEtiket} taleplerini alın`;
    }
    return `${sehir}’deki ${hEtiket} taleplerini almak için telefonunuzu doğrulayın`;
  }, [hizmet, istanbulMu, yaka, sehir]);

  function ilceleriHesapla(): string[] {
    if (!istanbulMu) return [...sehirIlceler];
    if (yaka === "belirli") return ilceler;
    if (yaka) return yakaIlceleri(yaka);
    return [];
  }

  function wizardAdimOlay(
    hedef: Adim
  ): "form_adim_1" | "form_adim_2" | "form_adim_3" | null {
    switch (hedef) {
      case "is":
      case "is_coklu":
        return "form_adim_1";
      case "sehir":
      case "bolge":
      case "ilce":
        return "form_adim_2";
      case "telefon":
      case "otp":
        return "form_adim_3";
      default:
        return null;
    }
  }

  function adimaIlerle(yeni: Adim) {
    setAdim(yeni);
    const olay = wizardAdimOlay(yeni);
    if (olay) kayitFunnelOlayBirKez(funnel.id, olay);
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
    });
  }

  function hizmetSec(id: Exclude<KayitHizmetOnsecim, null>) {
    setHizmet(id);
    void kayitFunnelOlayGonder(funnel.id, "cta_kayit_basla", {
      meta: { hizmet: id },
    });
    kayitFunnelOlayBirKez(funnel.id, "form_adim_1");
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
    });
    if (id === "birden_fazla") {
      setAdim("is_coklu");
      return;
    }
    adimaIlerle("sehir");
  }

  function geri() {
    setError("");
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
    });
    if (adim === "is_coklu") setAdim("is");
    else if (adim === "sehir") setAdim(hizmet === "birden_fazla" ? "is_coklu" : "is");
    else if (adim === "bolge") setAdim("sehir");
    else if (adim === "ilce") setAdim("bolge");
    else if (adim === "telefon") {
      setAdim(istanbulMu ? (yaka === "belirli" ? "ilce" : "bolge") : "sehir");
    } else if (adim === "otp") setAdim("telefon");
  }

  async function kodGonder() {
    if (!yasalOnay) {
      setYasalHata(true);
      setError("Yasal metinleri onaylamanız zorunludur.");
      return;
    }
    const rakam = telefon.replace(/\D/g, "");
    if (rakam.length < 10) {
      setTelefonHata(true);
      telefonRef.current?.focus();
      return;
    }
    setTelefonHata(false);
    setLoading(true);
    setError("");
    setMesaj("");
    try {
      void kayitFunnelOlayGonder(funnel.id, "btn_otp_gonder");
      void kayitFunnelOlayGonder(funnel.id, "otp_gonder");
      const res = await fetch("/api/cekici/kayit/otp/gonder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefon: telefon.trim() }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.status === 409) {
        void kayitFunnelOlayGonder(funnel.id, "zaten_kayitli");
        const q = new URLSearchParams({
          telefon: telefon.trim(),
          mesaj: "zaten-kayitli",
        });
        router.push(`/cekici/giris?${q.toString()}`);
        return;
      }
      if (!res.ok && !d.kodBekliyor) {
        throw new Error(
          typeof d.error === "string" ? d.error : "Kod gönderilemedi."
        );
      }
      setYenidenSn(Number(d.yenidenGonderSn) || 60);
      setMesaj(typeof d.mesaj === "string" ? d.mesaj : "Kod gönderildi.");
      if (d.gelistirmeKodu) {
        setMesaj((m) => `${m} (geliştirme: ${d.gelistirmeKodu})`);
      }
      adimaIlerle("otp");
      setOtp("");
      sonOtpDeneme.current = "";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kod gönderilemedi.");
    } finally {
      setLoading(false);
    }
  }

  async function hesapOlustur(otpKod: string) {
    if (loading || sonOtpDeneme.current === otpKod) return;
    if (!yasalOnay) {
      setYasalHata(true);
      setError("Yasal metinleri onaylamanız zorunludur.");
      return;
    }
    sonOtpDeneme.current = otpKod;
    setLoading(true);
    setError("");
    try {
      void kayitFunnelOlayGonder(funnel.id, "btn_kayit_submit");
      const res = await fetch("/api/cekici/kayit/hizli", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telefon: telefon.trim(),
          otpKod: otpKod.trim(),
          funnel: funnel.id,
          sessionId: kayitFunnelSessionId(),
          kayitKodu: urlDavet || undefined,
          smsToken,
          sehir,
          hizmetIlceleri: ilceleriHesapla(),
          hizmetSorunTipleri: sorunTipleri,
          hizmetOnsecim: hizmet,
          carkToken: carkOdulOku()?.token,
        }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.status === 409) {
        void kayitFunnelOlayGonder(funnel.id, "zaten_kayitli");
        const q = new URLSearchParams({
          telefon: telefon.trim(),
          mesaj: "zaten-kayitli",
        });
        router.push(`/cekici/giris?${q.toString()}`);
        return;
      }
      if (!res.ok) {
        void kayitFunnelOlayGonder(funnel.id, "otp_hata");
        throw new Error(
          typeof d.error === "string" ? d.error : "Kayıt başarısız."
        );
      }
      carkOdulTemizle();
      try {
        sessionStorage.setItem(
          "kayit_c_secim",
          JSON.stringify({
            hizmet,
            sehir,
            yaka,
            sorunTipleri,
            ilceler: ilceleriHesapla(),
          })
        );
      } catch {
        /* ignore */
      }
      const cekiciId =
        typeof d.id === "string" ? d.id : String(d.id ?? "");
      const telefonTrim = telefon.trim();
      void import("@/lib/meta-pixel").then((m) => {
        m.metaKayitUserSakla({
          phone: telefonTrim,
          externalId: cekiciId || null,
        });
        return m.metaPixelCompleteRegistration({
          content_name: `cekici_kayit_${funnel.id}`,
          phone: telefonTrim,
          externalId: cekiciId || null,
        });
      });
      void import("@/lib/gtag").then((m) =>
        m.gtagAdsKaydolmaDonusumuBirKez({ phone: telefonTrim })
      );
      void import("@/lib/tiktok-pixel").then((m) =>
        m.tiktokPixelKayitOl({
          content_name: `cekici_kayit_${funnel.id}`,
          phone: telefonTrim,
          externalId: cekiciId || null,
        })
      );
      // API yonlendir varsa onu kullan; yoksa hesap kurulumu
      const hedef =
        typeof d.yonlendir === "string" && d.yonlendir.startsWith("/")
          ? d.yonlendir
          : "/kayit/kurulum";
      router.replace(hedef);
    } catch (e) {
      sonOtpDeneme.current = "";
      setError(e instanceof Error ? e.message : "Kayıt başarısız.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (adim !== "otp" || otp.length !== 6 || loading) return;
    void hesapOlustur(otp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp, adim]);

  const flowProgressBar = (
    <FlowProgress
      current={adimIlerlemeIndex(adim)}
      total={3}
      onStepClick={(i) => {
        if (i === 0 && adim !== "is") setAdim("is");
        else if (i === 1 && (adim === "telefon" || adim === "otp")) {
          setAdim(istanbulMu ? (yaka === "belirli" ? "ilce" : "bolge") : "sehir");
        }
      }}
      className="mb-2"
    />
  );

  const smsBannerGosterimde =
    adim === "telefon" && ornekSmsAcik && !ornekSmsCikis;
  const contentShiftY = smsBannerGosterimde
    ? Math.max(0, 130 + dragOffsetY)
    : 0;

  return (
    <MobileShell hideHeader lockViewport={true}>
      <OpeningLogo
        forceDocked={true}
        offsetY={contentShiftY}
        center={
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Ücretsiz Firma Kaydı
          </span>
        }
        trailing={
          <Link
            href="/cekici/giris"
            className="group inline-flex items-center gap-1 rounded-full border border-[#9ee3b2] bg-[#eaf8ee] px-3 py-1 text-[11px] font-bold text-[#0b4e1e] shadow-[0_2px_8px_rgba(8,155,45,0.14)] transition-all duration-200 hover:border-[#089b2d] hover:bg-[#d5f3dc] hover:shadow-[0_4px_12px_rgba(8,155,45,0.22)] active:scale-95 touch-manipulation"
          >
            Giriş yap →
          </Link>
        }
        onClick={() => setAdim("is")}
      />

      <KayitCarkKampanya funnelId={funnel.id} aktif={adim === "is"} />

      {adim === "telefon" && ornekSmsAcik && (
        <div
          className={`fixed z-[60] pointer-events-none ${
            platform === "android"
              ? "left-3.5 right-3.5 top-[max(0.5rem,env(safe-area-inset-top))]"
              : "left-3.5 right-3.5 top-[max(0.65rem,env(safe-area-inset-top))]"
          } ${
            ornekSmsCikis ? "animate-sms-banner-out" : "animate-sms-banner-in"
          }`}
          style={{
            transform: `translateY(${dragOffsetY}px) scale(${Math.max(0.92, 1 + dragOffsetY / 600)})`,
            opacity: Math.max(0.15, 1 + dragOffsetY / 110),
            transition: isDragging
              ? "none"
              : "transform 0.28s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.28s ease-out",
          }}
        >
          <div
            className={`absolute pointer-events-none animate-sms-banner-sis blur-2xl ${
              platform === "android"
                ? "-inset-3 rounded-2xl bg-blue-400/25"
                : "-inset-5 rounded-[2.25rem] bg-emerald-300/35"
            }`}
            aria-hidden
          />
          <div
            className={`absolute pointer-events-none animate-sms-banner-sis blur-xl ${
              platform === "android"
                ? "-inset-1 rounded-xl bg-white/50"
                : "-inset-2 rounded-[1.75rem] bg-white/40"
            }`}
            style={{ animationDelay: "0.35s" }}
            aria-hidden
          />

          {platform === "android" ? (
            <div className="relative animate-sms-banner-titre">
              <button
                type="button"
                onClick={handleBannerClick}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
                onMouseDown={handleTouchStart}
                onMouseMove={handleTouchMove}
                onMouseUp={handleTouchEnd}
                className="relative pointer-events-auto w-full animate-sms-banner-glow touch-manipulation select-none text-left rounded-2xl border border-white/80 bg-white/94 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_14px_36px_rgba(0,0,0,0.15)] px-4 py-3.5 active:scale-[0.99] cursor-grab active:cursor-grabbing"
                aria-label="Örnek SMS bildirimi (Kapatmak için yukarı kaydırın)"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="size-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center shadow-sm"
                    aria-hidden
                  >
                    ✉
                  </span>
                  <span className="text-[11px] font-medium uppercase tracking-wide text-slate-600">
                    Mesajlar · şimdi
                  </span>
                </div>
                <p className="text-[14px] font-bold text-slate-900 leading-snug">
                  AcilÇözümBul
                </p>
                <p className="text-[13px] text-slate-700 leading-snug mt-0.5 line-clamp-2">
                  Bölgenizde yeni bir {hizmetEtiket(hizmet)} talebi var. Teklif
                  vermek için dokunun.
                </p>
              </button>
            </div>
          ) : (
            <div className="relative animate-sms-banner-titre">
              <button
                type="button"
                onClick={handleBannerClick}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
                onMouseDown={handleTouchStart}
                onMouseMove={handleTouchMove}
                onMouseUp={handleTouchEnd}
                className="relative pointer-events-auto w-full animate-sms-banner-glow touch-manipulation select-none text-left rounded-[22px] border border-white/80 bg-white/92 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_16px_40px_rgba(0,0,0,0.16),0_4px_12px_rgba(0,0,0,0.06)] px-4 py-3.5 active:scale-[0.99] cursor-grab active:cursor-grabbing"
                aria-label="Örnek SMS bildirimi (Kapatmak için yukarı kaydırın)"
              >
                <div className="flex items-start gap-3">
                  <span
                    className="size-10 shrink-0 rounded-[12px] bg-[#089b2d] text-white flex items-center justify-center text-lg shadow-sm"
                    aria-hidden
                  >
                    💬
                  </span>
                  <span className="min-w-0 flex-1 pt-0.5">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-semibold text-slate-900 tracking-tight">
                        Mesajlar
                      </span>
                      <span className="text-[11px] text-slate-500">şimdi</span>
                    </span>
                    <span className="block text-[13px] font-bold text-slate-900 mt-0.5">
                      AcilÇözümBul
                    </span>
                    <span className="block text-[13px] text-slate-700 leading-snug mt-0.5 line-clamp-2">
                      Bölgenizde yeni bir {hizmetEtiket(hizmet)} talebi var.
                      Teklif vermek için dokunun.
                    </span>
                  </span>
                </div>
              </button>
            </div>
          )}
        </div>
      )}

      <div
        className="space-y-5 pb-8"
        style={{
          transform: `translateY(${contentShiftY}px)`,
          transition: isDragging
            ? "none"
            : "transform 0.32s cubic-bezier(0.25, 1, 0.5, 1)",
        }}
      >
        {adim === "is" && (
          <div key="is" className="space-y-5 animate-fade-in">
            <section className="space-y-3.5">
              <div>
                <h1 className="text-[1.35rem] font-bold text-slate-900 leading-snug">
                  Bölgenizde yeni işler açıldığında telefonunuza gelsin.
                </h1>
                <p className="text-sm text-slate-600 leading-snug mt-1.5">
                  Hizmetinizi seçin, çalışma bölgenizi belirleyin, müşteri talep
                  açınca anında haberdar olun.
                </p>
              </div>

              <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 text-xs py-1">
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
                  <span className="size-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">
                    ✓
                  </span>
                  Kayıt ücretsiz
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
                  <span className="size-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">
                    ✓
                  </span>
                  Teklif vermek ücretsiz
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
                  <span className="size-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">
                    ✓
                  </span>
                  Komisyon yok
                </span>
              </div>

              <div className="pt-1">
                <h2 className="text-lg font-bold text-slate-900">
                  Hangi hizmetleri veriyorsunuz?
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Yalnızca seçtiğiniz işlerle ilgili talepleri göndeririz.
                </p>
              </div>

              <div className="space-y-2.5">
                {HIZMET_KARTLARI.map((k) => {
                  const aktif = hizmet === k.id;
                  return (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() => hizmetSec(k.id)}
                      className={`group w-full text-left rounded-[var(--acb-radius)] border p-4 flex items-center gap-3.5 touch-manipulation transition-all duration-200 active:scale-[0.98] ${
                        aktif
                          ? "border-[var(--acb-green)] bg-[#eaf8ee] shadow-[0_2px_12px_rgba(8,155,45,0.15)] ring-1 ring-[var(--acb-green)]"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 shadow-[var(--acb-shadow)]"
                      }`}
                    >
                      <div
                        className={`size-11 shrink-0 rounded-xl flex items-center justify-center transition-colors ${
                          aktif
                            ? "bg-white text-[var(--acb-green)] shadow-sm"
                            : "bg-slate-50 text-slate-700 border border-slate-100 group-hover:bg-white"
                        }`}
                      >
                        <SorunIkon id={k.sorunId} className="size-6" active={aktif} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span
                          className={`block font-semibold text-[16px] leading-snug ${
                            aktif ? "text-[var(--acb-dark)]" : "text-slate-900"
                          }`}
                        >
                          {k.baslik}
                        </span>
                        {k.alt ? (
                          <span className="block text-xs text-slate-500 mt-0.5 leading-snug">
                            {k.alt}
                          </span>
                        ) : null}
                      </div>
                      {aktif ? (
                        <span
                          className="shrink-0 size-6 rounded-full bg-[var(--acb-green)] text-white text-xs font-bold flex items-center justify-center shadow-sm"
                          aria-hidden
                        >
                          ✓
                        </span>
                      ) : (
                        <span
                          className="shrink-0 text-slate-300 text-xl font-light leading-none group-hover:text-slate-400 group-hover:translate-x-0.5 transition-transform"
                          aria-hidden
                        >
                          ›
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            <KayitStickyNav
              progress={flowProgressBar}
              devamDisabled={!hizmet}
              devamMetin={hizmet ? "Devam et" : "Önce hizmet seç"}
              geriGizle={true}
              onDevam={() => {
                if (!hizmet) return;
                if (hizmet === "birden_fazla") setAdim("is_coklu");
                else adimaIlerle("sehir");
              }}
            />
          </div>
        )}

        {adim === "is_coklu" && (
          <div key="is_coklu" className="space-y-5 animate-fade-in">
            <section className="space-y-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Hangi hizmetleri veriyorsunuz?
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Birden fazla seçebilirsiniz.
                </p>
              </div>

              <div className="space-y-2.5">
                {COKLU_HIZMETLER.map((h) => {
                  const on = cokluSorunlar.includes(h.id);
                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() =>
                        setCokluSorunlar((prev) =>
                          on ? prev.filter((x) => x !== h.id) : [...prev, h.id]
                        )
                      }
                      className={`group w-full text-left rounded-[var(--acb-radius)] border p-3.5 flex items-center gap-3.5 touch-manipulation transition-all duration-200 active:scale-[0.98] ${
                        on
                          ? "border-[var(--acb-green)] bg-[#eaf8ee] shadow-[0_2px_10px_rgba(8,155,45,0.12)] ring-1 ring-[var(--acb-green)]"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 shadow-[var(--acb-shadow)]"
                      }`}
                    >
                      <div
                        className={`size-10 shrink-0 rounded-lg flex items-center justify-center transition-colors ${
                          on
                            ? "bg-white text-[var(--acb-green)] shadow-sm"
                            : "bg-slate-50 text-slate-700 border border-slate-100 group-hover:bg-white"
                        }`}
                      >
                        <SorunIkon id={h.sorunId} className="size-5" active={on} />
                      </div>
                      <span
                        className={`flex-1 font-semibold text-[15px] ${
                          on ? "text-[var(--acb-dark)]" : "text-slate-800"
                        }`}
                      >
                        {h.label}
                      </span>
                      <span
                        className={`shrink-0 size-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                          on
                            ? "bg-[var(--acb-green)] text-white shadow-sm"
                            : "border border-slate-300 bg-slate-50 text-transparent"
                        }`}
                        aria-hidden
                      >
                        ✓
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <KayitStickyNav
              progress={flowProgressBar}
              devamDisabled={cokluSorunlar.length === 0}
              devamMetin={
                cokluSorunlar.length > 0
                  ? `Devam et (${cokluSorunlar.length} seçildi)`
                  : "En az bir hizmet seçin"
              }
              onGeri={geri}
              onDevam={() => adimaIlerle("sehir")}
            />
          </div>
        )}

        {adim === "sehir" && (
          <div key="sehir" className="space-y-5 animate-fade-in">
            <section className="space-y-4">
              <div>
                <h1 className="text-[1.35rem] font-bold text-slate-900 leading-snug">
                  Hangi şehirde hizmet veriyorsunuz?
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Müşteri taleplerini almak istediğiniz şehri belirleyin.
                </p>
              </div>

              <KayitSehirHarita sehir={sehir} onSehirSec={sehirSec} />

              {/* Arama Çubuğu */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                <input
                  type="search"
                  autoComplete="off"
                  placeholder="Şehir ara… (örn. İzmir, Ankara, Antalya)"
                  value={sehirAra}
                  onChange={(e) => setSehirAra(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-9 py-3 text-[15px] font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-[var(--acb-shadow)] focus:border-[var(--acb-green)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--acb-green)_25%,transparent)]"
                />
                {sehirAra.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSehirAra("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 size-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs hover:bg-slate-300"
                    aria-label="Aramayı temizle"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Arama Sonuçları (Yazılıyorsa) */}
              {sehirAra.trim().length > 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-md divide-y divide-slate-100 max-h-60 overflow-y-auto">
                  {sehirAramaSonuclari.map((il) => {
                    const secili = sehir === il;
                    return (
                      <button
                        key={il}
                        type="button"
                        onClick={() => sehirSec(il)}
                        className={`w-full text-left px-4 py-3 text-[15px] font-medium flex items-center justify-between transition touch-manipulation ${
                          secili
                            ? "bg-[#eaf8ee] text-[#0b4e1e] font-semibold"
                            : "text-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <MapPin
                            className={`size-4 ${
                              secili
                                ? "text-[var(--acb-green)]"
                                : "text-slate-400"
                            }`}
                          />
                          {il}
                        </span>
                        {secili ? (
                          <span className="size-5 rounded-full bg-[var(--acb-green)] text-white text-xs flex items-center justify-center font-bold">
                            ✓
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                  {sehirAramaSonuclari.length === 0 && (
                    <div className="p-4 text-center text-sm text-slate-500">
                      "{sehirAra}" ile eşleşen şehir bulunamadı.
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Popüler Şehirler Hızlı Seçim */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Popüler Şehirler
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {POPULER_SEHIRLER.map((il) => {
                        const secili = sehir === il;
                        return (
                          <button
                            key={il}
                            type="button"
                            onClick={() => sehirSec(il)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all touch-manipulation active:scale-95 ${
                              secili
                                ? "bg-[#eaf8ee] text-[#0b4e1e] border border-[#9ee3b2] shadow-sm ring-1 ring-[#9ee3b2]"
                                : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm"
                            }`}
                          >
                            {secili ? (
                              <span className="size-1.5 rounded-full bg-[var(--acb-green)]" />
                            ) : null}
                            {il}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Seçili Şehir Kartı */}
                  <div className="rounded-[var(--acb-radius)] border border-[#9ee3b2] bg-[#eaf8ee] p-4 flex items-center gap-3.5 shadow-[0_2px_10px_rgba(8,155,45,0.12)]">
                    <div className="size-11 rounded-xl bg-white text-[var(--acb-green)] flex items-center justify-center shadow-sm shrink-0">
                      <MapPin className="size-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-xs font-semibold text-emerald-800 uppercase tracking-wide">
                        Seçili Hizmet Şehri
                      </span>
                      <span className="block font-bold text-slate-900 text-lg leading-tight mt-0.5">
                        {sehir}
                      </span>
                    </div>
                    <span className="shrink-0 size-6 rounded-full bg-[var(--acb-green)] text-white text-xs font-bold flex items-center justify-center shadow-sm">
                      ✓
                    </span>
                  </div>
                </>
              )}
            </section>

            <KayitStickyNav
              progress={flowProgressBar}
              devamDisabled={!sehir}
              devamMetin={sehir === ISTANBUL_IL ? "Bölgemi seç" : "Devam et"}
              onGeri={geri}
              onDevam={() => {
                if (sehir === ISTANBUL_IL) adimaIlerle("bolge");
                else {
                  setYaka(null);
                  setIlceler([]);
                  adimaIlerle("telefon");
                }
              }}
            />
          </div>
        )}

        {adim === "bolge" && (
          <div key="bolge" className="space-y-5 animate-fade-in">
            <section className="space-y-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  İstanbul’da hangi bölgelerde çalışıyorsunuz?
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Size yalnızca çalışabileceğiniz bölgelerdeki talepleri göndeririz.
                </p>
              </div>

              <div className="space-y-2.5">
                {(
                  [
                    ["avrupa", "Avrupa Yakası", "Tüm Avrupa yakası ilçeleri"],
                    ["anadolu", "Anadolu Yakası", "Tüm Anadolu yakası ilçeleri"],
                    ["her_iki", "Her iki yakada", "İstanbul geneli tüm ilçeler"],
                    ["belirli", "Belirli ilçeleri seçmek istiyorum", "Özel ilçe listesi seçimi"],
                  ] as const
                ).map(([id, label, sub]) => {
                  const aktif = yaka === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setYaka(id);
                        if (id === "belirli") {
                          setIlceler([]);
                          adimaIlerle("ilce");
                        } else {
                          setIlceler(yakaIlceleri(id));
                          adimaIlerle("telefon");
                        }
                      }}
                      className={`group w-full text-left rounded-[var(--acb-radius)] border p-4 flex items-center gap-3.5 touch-manipulation transition-all duration-200 active:scale-[0.98] ${
                        aktif
                          ? "border-[var(--acb-green)] bg-[#eaf8ee] shadow-[0_2px_12px_rgba(8,155,45,0.15)] ring-1 ring-[var(--acb-green)]"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 shadow-[var(--acb-shadow)]"
                      }`}
                    >
                      <div
                        className={`size-10 shrink-0 rounded-xl flex items-center justify-center transition-colors ${
                          aktif
                            ? "bg-white text-[var(--acb-green)] shadow-sm"
                            : "bg-slate-50 text-slate-700 border border-slate-100 group-hover:bg-white"
                        }`}
                      >
                        <MapPin className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span
                          className={`block font-semibold text-[16px] leading-snug ${
                            aktif ? "text-[var(--acb-dark)]" : "text-slate-900"
                          }`}
                        >
                          {label}
                        </span>
                        <span className="block text-xs text-slate-500 mt-0.5 leading-snug">
                          {sub}
                        </span>
                      </div>
                      {aktif ? (
                        <span
                          className="shrink-0 size-6 rounded-full bg-[var(--acb-green)] text-white text-xs font-bold flex items-center justify-center shadow-sm"
                          aria-hidden
                        >
                          ✓
                        </span>
                      ) : (
                        <span
                          className="shrink-0 text-slate-300 text-xl font-light leading-none group-hover:text-slate-400 group-hover:translate-x-0.5 transition-transform"
                          aria-hidden
                        >
                          ›
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            <KayitStickyNav
              progress={flowProgressBar}
              devamDisabled={!yaka}
              devamMetin={yaka ? "Devam et" : "Bölge seçin"}
              onGeri={geri}
              onDevam={() => {
                if (!yaka) return;
                if (yaka === "belirli") adimaIlerle("ilce");
                else {
                  setIlceler(yakaIlceleri(yaka));
                  adimaIlerle("telefon");
                }
              }}
            />
          </div>
        )}

        {adim === "ilce" && (
          <div key="ilce" className="space-y-5 animate-fade-in">
            <section className="space-y-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Hangi ilçelerde çalışıyorsunuz?
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Hizmet vermek istediğiniz ilçeleri işaretleyin.
                </p>
              </div>

              <IlceSecimi
                il={ISTANBUL_IL}
                tumIlceler={sehirIlceler}
                seciliIlceler={ilceler}
                onToggle={(ilce) =>
                  setIlceler((prev) =>
                    prev.includes(ilce)
                      ? prev.filter((x) => x !== ilce)
                      : [...prev, ilce]
                  )
                }
                onTumunuSec={() => setIlceler([...sehirIlceler])}
                onTemizle={() => setIlceler([])}
              />
            </section>

            <KayitStickyNav
              progress={flowProgressBar}
              devamDisabled={ilceler.length === 0}
              devamMetin={
                ilceler.length > 0
                  ? `Devam et (${ilceler.length} ilçe)`
                  : "En az bir ilçe seçin"
              }
              onGeri={geri}
              onDevam={() => adimaIlerle("telefon")}
            />
          </div>
        )}

        {adim === "telefon" && (
          <div key="telefon" className="space-y-5 animate-fade-in">
            <section className="space-y-4">
              <div>
                <h1 className="text-[1.35rem] font-bold text-slate-900 leading-snug">
                  {telefonBaslik}
                </h1>
                <p className="text-sm text-slate-600 leading-snug mt-1">
                  Bölgenizde yeni bir {hizmetEtiket(hizmet)} işi açıldığında size SMS
                  ile anında bildirelim.
                </p>
              </div>

              {smsIpucu && (
                <div
                  className="text-sm font-medium text-emerald-950 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 leading-snug animate-fade-in"
                  role="status"
                >
                  Müşterileri size SMS olarak gönderebilmemiz için telefon
                  numaranızı girin.
                </div>
              )}

              <Field
                ref={telefonRef}
                label="Telefon numaranız"
                inputMode="tel"
                autoComplete="tel"
                placeholder={TELEFON_ORNEK_GIRISLERI[0] ?? "05XX XXX XX XX"}
                value={telefon}
                invalid={telefonHata}
                onChange={(e) => {
                  setTelefon(e.target.value);
                  if (telefonHata) setTelefonHata(false);
                  kayitFunnelAlanDoldu(funnel.id, "telefon", e.target.value);
                }}
                onFocus={() => {
                  void kayitFunnelOlayGonder(funnel.id, "telefon_focus");
                  kayitFunnelAlanFocus(funnel.id, "telefon");
                }}
                className={`text-base min-h-[48px] ${
                  telefonParlama ? "animate-hedef-secim-parla" : ""
                }`}
              />
              {telefonHata && (
                <p className="text-sm text-red-600" role="alert">
                  Telefon numarası geçersiz
                </p>
              )}

              <YasalOnayKutusu
                checked={yasalOnay}
                onChange={(v) => {
                  setYasalOnay(v);
                  if (v) {
                    setYasalHata(false);
                    setError("");
                    kayitFunnelOlayBirKez(funnel.id, "yasal_onay_tik");
                  }
                }}
                invalid={yasalHata}
                rol="hizmet-veren"
                kucukMetin
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
            </section>

            <KayitStickyNav
              progress={flowProgressBar}
              devamDisabled={loading || telefon.replace(/\D/g, "").length < 10 || !yasalOnay}
              devamMetin="Telefonuma kod gönder"
              loading={loading}
              onGeri={geri}
              onDevam={() => void kodGonder()}
            />
          </div>
        )}

        {adim === "otp" && (
          <div key="otp" className="space-y-5 animate-fade-in">
            <section className="space-y-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Telefonunuzu doğrulayın
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  <span className="font-semibold text-slate-900">{telefon}</span> numarasına 6 haneli kod gönderdik.
                </p>
              </div>

              {mesaj && <p className="text-sm text-emerald-700 font-medium">{mesaj}</p>}

              <Field
                label="SMS kodu"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="6 haneli kod"
                value={otp}
                onFocus={() => kayitFunnelAlanFocus(funnel.id, "otp")}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(v);
                  kayitFunnelAlanDoldu(funnel.id, "otp", v);
                }}
                className="text-lg tracking-widest min-h-[52px] text-center font-bold"
              />

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex flex-wrap gap-4 text-sm pt-1">
                <button
                  type="button"
                  className="text-emerald-800 font-semibold disabled:opacity-40 hover:underline"
                  disabled={yenidenSn > 0 || loading}
                  onClick={() => void kodGonder()}
                >
                  {yenidenSn > 0
                    ? `Tekrar kod gönder (${yenidenSn})`
                    : "Tekrar kod gönder"}
                </button>
                <button
                  type="button"
                  className="text-slate-600 font-medium hover:text-slate-900 hover:underline"
                  onClick={() => {
                    setAdim("telefon");
                    setOtp("");
                    setError("");
                    sonOtpDeneme.current = "";
                  }}
                >
                  Numarayı değiştir
                </button>
              </div>
            </section>

            <KayitStickyNav
              progress={flowProgressBar}
              devamDisabled={loading || otp.length !== 6}
              devamMetin="Onayla ve kaydol"
              loading={loading}
              onGeri={geri}
              onDevam={() => void hesapOlustur(otp)}
            />
          </div>
        )}

        {adim === "basarili" && (
          <div key="basarili" className="animate-fade-in">
            <Card className="space-y-4 border-emerald-200 bg-emerald-50">
              <h1 className="text-xl font-bold text-slate-900">
                Kaydınız oluşturuldu ✓
              </h1>
              <p className="text-[17px] text-slate-700 leading-relaxed">
                Hesap kurulumunu tamamla ve bonus kredi kazan.
              </p>
              <Btn onClick={() => router.push("/kayit/kurulum")}>
                Hesap kurulumunu tamamla
              </Btn>
            </Card>
          </div>
        )}
      </div>
    </MobileShell>
  );
}

export function KayitSecimWizardSayfa({
  funnel,
}: {
  funnel: KayitFunnelTanim;
}) {
  return (
    <Suspense
      fallback={
        <MobileShell hideHeader>
          <OpeningLogo forceDocked={true} />
          <p className="text-center text-slate-500 py-12">Yükleniyor…</p>
        </MobileShell>
      }
    >
      <WizardIcerik funnel={funnel} />
    </Suspense>
  );
}

