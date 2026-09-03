"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import {
  stickyCtaGercekYukseklik,
  stickyCtaOffsetAyarla,
  stickyCtaOffsetTemizle,
} from "@/lib/sticky-cta-offset";
import { SorunSecimi } from "@/components/SorunSecimi";
import { EmergencyHero } from "@/components/acb/EmergencyHero";
import { FlowProgress } from "@/components/acb/FlowProgress";
import { OpeningLogo } from "@/components/acb/OpeningLogo";
import {
  StepTestimonialCard,
  CustomerTestimonialSection,
  TeklifGeriSayimPill,
} from "@/components/acb";
import { AcbIcons, ACB_ICON_STROKE, SorunIkon } from "@/lib/acb-icons";
import { AnaSayfaOzellikSeridi } from "@/components/AnaSayfaOzellikSeridi";
import { AnaSayfaFiyatHesaplamaTeaser } from "@/components/AnaSayfaFiyatHesaplamaTeaser";
import { AnaSayfaHizmetVerCta } from "@/components/AnaSayfaHizmetVerCta";
import { AnaSayfaHizliBaglantilar } from "@/components/AnaSayfaHizliBaglantilar";
import { Btn, Field, Card, Spinner, TextArea, SelectField, CustomSelect } from "@/components/ui";
import { ACB_CTA, ACB_SHELL_MAX_W } from "@/lib/design-tokens";
import { KULLANIMA_ACIK_ILLER } from "@/lib/cekici-sehir-acilis";
import { ilceListesi } from "@/lib/il-ilce";
import { illerSecimSirasi, sehirdeYazi } from "@/lib/turkiye-il-nufus";
import {
  hizmetQuerydenSorunTipi,
  sorunAracModeliAlaniGoster,
  sorunAracModeliGerekliMi,
  sorunFotografAlaniGoster,
  sorunFotografGerekliMi,
  sorunHedefKonumGerekliMi,
  sorunLastikDurumuAlaniGoster,
  sorunLastikDurumuGerekliMi,
  sorunMetniOlustur,
  sorunTeklifNotuPlaceholder,
  sorunTipiBul,
  sorunYakitTipiAlaniGoster,
  sorunYakitTipiGerekliMi,
  sorunKilitDurumuAlaniGoster,
  sorunKilitDurumuGerekliMi,
  UCRETSIZ_TEKLIF_CTA,
} from "@/lib/sorun-tipleri";
import { telefonDogrulamaHatasi } from "@/lib/telefon";
import { ARAC_TIPLERI, aracDurumuMetniOlustur, aracTipiEtiket } from "@/lib/arac-tipi";
import { ARAC_DURUMLARI, aracDurumuEtiket } from "@/lib/arac-durumu";
import {
  LASTIK_DURUMLARI,
  LASTIK_DURUMU_BILGI,
  lastikDurumuEtiket,
} from "@/lib/lastik-durumu";
import { YAKIT_TIPLERI, yakitTipiEtiket } from "@/lib/yakit-tipi";
import { KILIT_DURUMLARI, kilitDurumuEtiket } from "@/lib/kilit-durumu";
import { AracTipiIkon } from "@/components/AracTipiIkon";
import { GpsHttpsBanner } from "@/components/GpsHttpsBanner";
import { YasalSiteFooter } from "@/components/yasal/YasalSiteFooter";
import { MusteriFormIletisimOtp } from "@/components/musteri/MusteriFormIletisimOtp";
import { useMusteriAktifTalepYonlendir } from "@/components/musteri/useMusteriAktifTalepYonlendir";
import { musteriAktifTalepKaydet } from "@/lib/musteri-aktif-talep";
import {
  geocodeAdres,
  cihazPlatformu,
  konumAlEsnek,
  konumGuvenliMi,
  konumHataMesaji,
  konumIzniDinle,
  konumIzniOku,
  reverseGeocode,
  type KonumIzniDurumu,
} from "@/lib/konum-client";
import { googleMapsYapilandirildi } from "@/lib/google-maps";
import type { KonumOneri } from "@/lib/hedef-oneri-data";
import { otoTamirAramaSorgusu } from "@/lib/hedef-oneri-data";
import { parseIlIlce } from "@/lib/konum-parse";
import { seoIlceGetir, seoSehirGetir } from "@/lib/seo-geo";
import {
  anaSayfaSehirBaglantilari,
  anaSayfaSeoIcerik,
  ISTANBUL_IL,
  seoBolgeBaglantilari,
  type SeoLandingIcerik,
} from "@/lib/seo-icerik";
import {
  ISTANBUL_ANA_HERO,
  SehirSeoIcerikBolumu,
} from "@/components/seo/SehirSeoIcerikBolumu";
import { musteriKonumYolu } from "@/lib/seo-talep";
import type { HedefOneriKaynak } from "@/lib/konum-oneri";
import {
  posthogKampanyaKaydet,
  posthogOlayYakala,
} from "@/lib/posthog-client";
import { gtagAdsAnaSayfaGoruntulemeDonusumu, gtagAdsFiyatTeklifiDonusumu } from "@/lib/gtag";
import { metaPixelLead } from "@/lib/meta-pixel";
import {
  tiktokPixelLead,
  tiktokPixelSearch,
  tiktokPixelViewContent,
} from "@/lib/tiktok-pixel";
import {
  musteriProfilKaydet,
} from "@/lib/musteri-profil";
import {
  musteriFormTaslakBosMu,
  musteriFormTaslakKaydet,
  musteriFormTaslakOku,
  musteriFormTaslakSil,
  type MusteriFormAlanlari,
} from "@/lib/musteri-form-taslak";
import type { MusteriFunnelId } from "@/lib/musteri-funnel";
import {
  musteriFunnelIdTalepKaydet,
  musteriFunnelOlayBirKez,
  musteriFunnelOlayGonder,
} from "@/lib/musteri-funnel-client";
import type { IhaleSureTipi } from "@/lib/ihale";
import { ihaleBitisHesapla } from "@/lib/ihale";
import { IhaleSureSecimi } from "@/components/musteri/IhaleSureSecimi";

const HedefOneriHarita = dynamic(
  () =>
    import("@/components/HedefOneriHarita").then((m) => ({
      default: m.HedefOneriHarita,
    })),
  {
    ssr: false,
    loading: () => (
      <div
        className="min-h-[12rem] rounded-xl border border-slate-100 bg-slate-50"
        aria-hidden
      />
    ),
  }
);

const ArizaFotografAlani = dynamic(
  () =>
    import("@/components/ArizaFotografAlani").then((m) => ({
      default: m.ArizaFotografAlani,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[8rem] rounded-xl border border-slate-100 bg-slate-50" aria-hidden />
    ),
  }
);


type Step =
  | "giris"
  | "konum"
  | "sorun"
  | "fotograf"
  | "lastik_durumu"
  | "yakit_tipi"
  | "kilit_durumu"
  | "arac_tipi"
  | "arac_modeli"
  | "arac_durumu"
  | "ek_detay"
  | "ihale"
  | "hedef"
  | "ozet"
  | "telefon";

/** Seçim sonrası otomatik sonraki adıma geçiş gecikmesi */
const ADIM_OTOMATIK_GECIS_MS = 500;

/** Sabit kanonik sıra — aktifAdimlar() bundan filtreler, göreli sıra hep aynı */
const TUM_ADIMLAR: Step[] = [
  "giris",
  "konum",
  "sorun",
  "lastik_durumu",
  "yakit_tipi",
  "kilit_durumu",
  "fotograf",
  "arac_tipi",
  "arac_modeli",
  "arac_durumu",
  "ek_detay",
  "ihale",
  "hedef",
  "ozet",
  "telefon",
];

/**
 * Giriş → konum → sorun → [lastik] → [yakıt] → [kilit] → [fotoğraf] →
 * [araç tipi] → [araç durumu] → ek detay → ihale → [hedef] → telefon
 * Marka/model (arac_modeli) adımı yok.
 */
function aktifAdimlar(sorunTipi: string, hedefGerekli: boolean): Step[] {
  return TUM_ADIMLAR.filter((adim) => {
    if (adim === "arac_modeli") return false;
    if (adim === "fotograf") return sorunFotografAlaniGoster(sorunTipi);
    if (adim === "lastik_durumu") return sorunLastikDurumuAlaniGoster(sorunTipi);
    if (adim === "yakit_tipi") return sorunYakitTipiAlaniGoster(sorunTipi);
    if (adim === "kilit_durumu") return sorunKilitDurumuAlaniGoster(sorunTipi);
    if (adim === "arac_tipi" || adim === "arac_durumu") {
      return sorunAracModeliAlaniGoster(sorunTipi);
    }
    if (adim === "hedef") return hedefGerekli;
    return true;
  });
}

/** Progress göstergesinde giriş ekranı sayılmaz */
function progressAdimlari(sorunTipi: string, hedefGerekli: boolean): Step[] {
  return aktifAdimlar(sorunTipi, hedefGerekli).filter((a) => a !== "giris");
}

/** Özet ekranında ihale süresi görüntüleme etiketleri — IhaleSureSecimi ile aynı metinler */
const IHALE_SURE_ETIKET: Record<IhaleSureTipi, string> = {
  acil: "Acil — 1 saat",
  "1_gun": "1 Gün",
  "1_hafta": "1 Hafta",
  ozel: "Özel tarih",
};

/** Eski tek «detay» adımının bölündüğü alt adımlar */
const DETAY_ALT_ADIMLARI: Step[] = [
  "lastik_durumu",
  "yakit_tipi",
  "kilit_durumu",
  "fotograf",
  "arac_tipi",
  "arac_modeli",
  "arac_durumu",
  "ek_detay",
  "ihale",
];

const ADIM_OLAYLARI: Partial<Record<Step, string>> = {
  giris: "form_adim_giris",
  sorun: "form_adim_sorun",
  konum: "form_adim_konum",
  fotograf: "form_adim_fotograf",
  lastik_durumu: "form_adim_lastik_durumu",
  yakit_tipi: "form_adim_yakit_tipi",
  kilit_durumu: "form_adim_kilit_durumu",
  arac_tipi: "form_adim_arac_tipi",
  arac_modeli: "form_adim_arac_modeli",
  arac_durumu: "form_adim_arac_durumu",
  ek_detay: "form_adim_ek_detay",
  ihale: "form_adim_ihale",
  hedef: "form_adim_hedef",
  ozet: "form_adim_ozet",
  telefon: "form_adim_bilgi",
};

type MusteriAnaSayfaProps = {
  funnelId?: MusteriFunnelId;
  /** Örn. `/istanbul` — şehir filtresi önceden seçili */
  varsayilanSehir?: string;
  /** Örn. `/istanbul/bayrampasa` — ilçe önceden seçili */
  varsayilanIlce?: string;
  /** Form altı SEO gövdesi (sunucudan) */
  seoIcerik?: SeoLandingIcerik;
  seoHeroBaslik?: string;
  seoSehirAd?: string;
  seoBaglantilar?: { ad: string; href: string }[];
  seoBolgeLinkleri?: { ad: string; href: string }[];
};

function sorunProps(sorunTipi: string): Record<string, unknown> {
  return sorunTipi ? { sorun_tipi: sorunTipi } : {};
}

/** Sticky alt nav — Geri solunda, beyaz zemin */
const GERI_BTN_SINIF = "shrink-0 min-w-[4.25rem] max-w-[5.5rem] !px-3 text-xs xs:text-sm";

function AcilYardimStickyCta({
  onClick,
  onGeri,
  disabled,
  yukleniyor,
  label = ACB_CTA.konumOtomatikAl,
  devamGlow = true,
  progress,
}: {
  onClick: () => void;
  onGeri: () => void;
  disabled?: boolean;
  yukleniyor?: boolean;
  label?: string;
  devamGlow?: boolean;
  /** Step-window progress indicator, rendered above the Geri/Devam row */
  progress?: React.ReactNode;
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
    return () => {
      ro.disconnect();
      stickyCtaOffsetTemizle();
    };
  }, [mounted]);

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
          <Btn
            type="button"
            variant="geri"
            className={GERI_BTN_SINIF}
            onClick={onGeri}
          >
            Geri
          </Btn>
          <Btn
            type="button"
            variant="primary"
            onClick={onClick}
            disabled={disabled}
            className={[
              "flex-[2] !font-bold !tracking-wide",
              devamGlow && !disabled
                ? "ring-2 ring-[color-mix(in_srgb,var(--acb-green)_45%,transparent)] shadow-[var(--acb-shadow-cta)] animate-devam-glow"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {yukleniyor ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Spinner className="size-4 border-white/40 border-t-white" />
                Konum alınıyor…
              </span>
            ) : (
              label
            )}
          </Btn>
        </div>
      </div>
    </div>,
    document.body
  );
}

/** Şehir / ilçe seçiminde dikkat çekmek için */
const KONUM_SELECT_GLOW =
  "border-[var(--acb-green)] ring-2 ring-[color-mix(in_srgb,var(--acb-green)_50%,transparent)] shadow-[0_0_14px_3px_rgba(8,155,45,0.45)]";

/** Konum sonrası tüm adımlarda ortak sticky alt nav (Geri + Devam) */
function AdimAltNav({
  devamMetin,
  devamDisabled = false,
  devamGlow = true,
  geriMetin = "Geri",
  onGeri,
  onDevam,
  progress,
}: {
  devamMetin: React.ReactNode;
  devamDisabled?: boolean;
  /** Seçim yapıldıktan sonra Devam butonunda amber glow */
  devamGlow?: boolean;
  geriMetin?: string;
  onGeri: () => void;
  onDevam: () => void;
  /** Step-window progress indicator, rendered above the Geri/Devam row */
  progress?: React.ReactNode;
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
    return () => {
      ro.disconnect();
      stickyCtaOffsetTemizle();
    };
  }, [mounted]);

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
          <Btn
            type="button"
            variant="geri"
            className={GERI_BTN_SINIF}
            onClick={onGeri}
          >
            {geriMetin}
          </Btn>
          <Btn
            type="button"
            className={[
              "flex-[2]",
              devamGlow && !devamDisabled ? "animate-devam-glow" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={onDevam}
            disabled={devamDisabled}
          >
            {devamMetin}
          </Btn>
        </div>
      </div>
    </div>,
    document.body
  );
}

/** Hedef sayfası — sticky alt panel: Geri / Devam */
function HedefAltNav({
  hedefSeciliMi,
  onGeri,
  onDevam,
  devamDisabled = false,
  devamGlow = true,
  devamIcerik,
  progress,
}: {
  hedefSeciliMi: boolean;
  onGeri: () => void;
  onDevam: () => void;
  devamDisabled?: boolean;
  devamGlow?: boolean;
  devamIcerik: React.ReactNode;
  /** Step-window progress indicator, rendered above the Geri/Devam row */
  progress?: React.ReactNode;
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
    return () => {
      ro.disconnect();
      stickyCtaOffsetTemizle();
    };
  }, [mounted, hedefSeciliMi]);

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
          <Btn
            type="button"
            variant="geri"
            className={GERI_BTN_SINIF}
            onClick={onGeri}
          >
            Geri
          </Btn>
          <Btn
            type="button"
            className={[
              "flex-[2]",
              devamGlow && !devamDisabled ? "animate-devam-glow" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={onDevam}
            disabled={devamDisabled}
          >
            {devamIcerik}
          </Btn>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function MusteriAnaSayfa({
  funnelId = "a",
  varsayilanSehir,
  varsayilanIlce,
  seoIcerik,
  seoHeroBaslik,
  seoSehirAd,
  seoBaglantilar,
  seoBolgeLinkleri,
}: MusteriAnaSayfaProps) {
  return (
    <Suspense
      fallback={
        <MobileShell>
          <p className="text-center text-slate-500 py-12">Yükleniyor…</p>
        </MobileShell>
      }
    >
      <MusteriAnaSayfaIcerik
        funnelId={funnelId}
        varsayilanSehir={varsayilanSehir}
        varsayilanIlce={varsayilanIlce}
        seoIcerik={seoIcerik}
        seoHeroBaslik={seoHeroBaslik}
        seoSehirAd={seoSehirAd}
        seoBaglantilar={seoBaglantilar}
        seoBolgeLinkleri={seoBolgeLinkleri}
      />
    </Suspense>
  );
}

function MusteriAnaSayfaIcerik({
  funnelId,
  varsayilanSehir,
  varsayilanIlce,
  seoIcerik: seoIcerikProp,
  seoHeroBaslik,
  seoSehirAd,
  seoBaglantilar,
  seoBolgeLinkleri,
}: {
  funnelId: MusteriFunnelId;
  varsayilanSehir?: string;
  varsayilanIlce?: string;
  seoIcerik?: SeoLandingIcerik;
  seoHeroBaslik?: string;
  seoSehirAd?: string;
  seoBaglantilar?: { ad: string; href: string }[];
  seoBolgeLinkleri?: { ad: string; href: string }[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  useMusteriAktifTalepYonlendir();
  const [step, setStep] = useState<Step>("giris");
  /** Step-content enter animation direction — presentational only, never read by nav logic. */
  const prevStepForAnimRef = useRef<Step>("giris");
  const stepAnimDirectionRef = useRef<"forward" | "backward">("forward");
  const [heroReady, setHeroReady] = useState(() => {
    try {
      return typeof window !== "undefined" && sessionStorage.getItem("acb_hero_intro_seen") === "1";
    } catch {
      return false;
    }
  });
  const [aracMarka, setAracMarka] = useState("");
  const [aracModelOnly, setAracModelOnly] = useState("");
  const [konumSheetAcik, setKonumSheetAcik] = useState(false);
  const [seciliSehir, setSeciliSehir] = useState(varsayilanSehir ?? "");
  const [seciliIlce, setSeciliIlce] = useState(varsayilanIlce ?? "");
  const [acikIller, setAcikIller] = useState<string[]>([
    ...KULLANIMA_ACIK_ILLER,
  ]);
  const hizmetUygulandi = useRef(false);
  const hizmetKaydirTip = useRef<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bilgiMesaj, setBilgiMesaj] = useState("");
  const [gpsYukleniyor, setGpsYukleniyor] = useState(false);
  const [adresGeocodeYukleniyor, setAdresGeocodeYukleniyor] = useState(false);
  const [konumIzniToast, setKonumIzniToast] = useState<string | null>(null);
  const gpsIstekRef = useRef(0);
  const konumToastTimerRef = useRef<number | null>(null);
  const ilceDevamTimerRef = useRef<number | null>(null);
  const sorunDevamTimerRef = useRef<number | null>(null);
  const aracTipiDevamTimerRef = useRef<number | null>(null);
  const aracDurumuDevamTimerRef = useRef<number | null>(null);
  const lastikDurumuDevamTimerRef = useRef<number | null>(null);
  const yakitTipiDevamTimerRef = useRef<number | null>(null);
  const kilitDurumuDevamTimerRef = useRef<number | null>(null);
  const ihaleDevamTimerRef = useRef<number | null>(null);
  const [oneriYukleniyor, setOneriYukleniyor] = useState(false);
  const [oneriler, setOneriler] = useState<KonumOneri[]>([]);
  const [oneriKaynak, setOneriKaynak] = useState<HedefOneriKaynak | null>(
    null
  );
  const [oneriAcikFiltre, setOneriAcikFiltre] = useState(false);
  const [oneriSemt, setOneriSemt] = useState<string | null>(null);
  const [gpsGuvenli, setGpsGuvenli] = useState(false);
  const [konumIzni, setKonumIzni] = useState<KonumIzniDurumu>("unknown");
  const [konumIzniBekleniyor, setKonumIzniBekleniyor] = useState(false);
  const [konumBasarisiz, setKonumBasarisiz] = useState(false);
  const konumIsimRef = useRef<HTMLDivElement>(null);
  const aracModeliRef = useRef<HTMLDivElement>(null);
  const fotografRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef<Step>("sorun");
  const formLatRef = useRef(0);
  const gpsYukleniyorRef = useRef(false);
  const oneriOffsetRef = useRef(0);
  /** İlk yükleme + en fazla 5 «Yeni öneriler» API çağrısından biriken havuz */
  const oneriHavuzRef = useRef<KonumOneri[]>([]);
  const yeniOneriApiSayisiRef = useRef(0);
  const [yeniOneriApiSayisi, setYeniOneriApiSayisi] = useState(0);
  const hedefOneriBaslatildi = useRef(false);
  const [adSoyadHatasi, setAdSoyadHatasi] = useState(false);
  const [aracModeliHatasi, setAracModeliHatasi] = useState(false);
  const [aracDurumuHatasi, setAracDurumuHatasi] = useState(false);
  const [lastikDurumuHatasi, setLastikDurumuHatasi] = useState(false);
  const [yakitTipiHatasi, setYakitTipiHatasi] = useState(false);
  const [kilitDurumuHatasi, setKilitDurumuHatasi] = useState(false);
  const [fotografHatasi, setFotografHatasi] = useState(false);
  const [sorunDetayHatasi, setSorunDetayHatasi] = useState(false);
  const [arizaAdresDuzenle, setArizaAdresDuzenle] = useState(false);
  const [yasalOnay, setYasalOnay] = useState(false);
  const [bilgiAlanMesajlari, setBilgiAlanMesajlari] = useState({
    yasalOnay: "",
    telefon: "",
  });

  const [form, setForm] = useState<MusteriFormAlanlari>({
    ad: "",
    soyad: "",
    telefon: "",
    lat: 0,
    lng: 0,
    adres: "",
    hedefLat: 0,
    hedefLng: 0,
    hedefAdres: "",
    sorunTipi: "",
    sorunDetay: "",
    aracTipi: "",
    aracModeli: "",
    aracDurumu: "",
    lastikDurumu: "",
    yakitTipi: "",
    kilitDurumu: "",
  });
  const [fotografOnizleme, setFotografOnizleme] = useState<string[]>([]);
  const [fotografData, setFotografData] = useState<string[]>([]);
  const [ihaleSureTipi, setIhaleSureTipi] = useState<IhaleSureTipi>("acil");
  const [ihaleOzelBitis, setIhaleOzelBitis] = useState("");
  const [ihaleSureHatasi, setIhaleSureHatasi] = useState(false);
  const [hedefBilinmiyor, setHedefBilinmiyor] = useState(false);
  const [hedefKendimArat, setHedefKendimArat] = useState(false);
  /** Nereye çekilecek: 4 opsiyondan hangisi tıklandı (taslak adres glow’u bozmasın) */
  const [hedefOpsiyon, setHedefOpsiyon] = useState<
    null | "oto_tamir" | "oto_sanayi" | "bilmiyorum" | "kendim"
  >(null);
  /** Kullanıcının yazdığı arama metni (bulunan tam adresten ayrı) */
  const [hedefAramaMetni, setHedefAramaMetni] = useState("");
  const [taslakHazir, setTaslakHazir] = useState(false);
  const taslakAnlikRef = useRef({
    step: "giris" as Step,
    form,
    yasalOnay: false,
    fotografOnizleme: [] as string[],
    fotografData: [] as string[],
    hedefBilinmiyor: false,
    ihaleSureTipi: "acil" as IhaleSureTipi,
    ihaleOzelBitis: "",
    aracMarka: "",
  });

  /** App/sekme dönüşünde formu geri yükle (sessionStorage) */
  useEffect(() => {
    const t = musteriFormTaslakOku();
    if (t && !musteriFormTaslakBosMu(t)) {
      setForm(t.form);
      const gecerliAdimlar = aktifAdimlar(
        t.form.sorunTipi,
        sorunHedefKonumGerekliMi(t.form.sorunTipi)
      );
      const istenenAdim: Step =
        t.step === "bilgi"
          ? "telefon"
          : t.step === "detay"
            ? (gecerliAdimlar.find((a) => DETAY_ALT_ADIMLARI.includes(a)) ??
              "ek_detay")
            : TUM_ADIMLAR.includes(t.step as Step)
              ? (t.step as Step)
              : "konum";
      /* Atlanan adıma (ör. fotoğrafsız tip) düşülmesin — en yakın geçerliye çek */
      const adim = gecerliAdimlar.includes(istenenAdim)
        ? istenenAdim
        : [...TUM_ADIMLAR]
            .slice(0, TUM_ADIMLAR.indexOf(istenenAdim) + 1)
            .reverse()
            .find((a) => gecerliAdimlar.includes(a)) ?? "konum";
      setStep(adim);
      setYasalOnay(t.yasalOnay);
      setFotografOnizleme(t.fotografOnizleme);
      setFotografData(t.fotografData);
      setHedefBilinmiyor(t.hedefBilinmiyor === true);
      if (t.hedefBilinmiyor === true) {
        setHedefOpsiyon("bilmiyorum");
      } else if (t.form.hedefAdres?.trim() && t.form.hedefLat && t.form.hedefLng) {
        setHedefOpsiyon("kendim");
        setHedefKendimArat(true);
      }
      if (t.ihaleSureTipi) setIhaleSureTipi(t.ihaleSureTipi);
      if (t.ihaleOzelBitis) setIhaleOzelBitis(t.ihaleOzelBitis);
      if (t.aracMarka) {
        setAracMarka(t.aracMarka);
        const full = t.form.aracModeli.trim();
        const prefix = t.aracMarka.trim();
        const model =
          prefix && full.toLowerCase().startsWith(prefix.toLowerCase())
            ? full.slice(prefix.length).trim()
            : full;
        setAracModelOnly(model);
      } else if (t.form.aracModeli) {
        setAracModelOnly(t.form.aracModeli);
      }
      if (t.form.adres) {
        const { il, ilce } = parseIlIlce(t.form.adres);
        if (il) setSeciliSehir(il);
        if (ilce) setSeciliIlce(ilce);
      }
    }
    setTaslakHazir(true);
  }, []);

  useEffect(() => {
    setGpsGuvenli(konumGuvenliMi());
    posthogKampanyaKaydet();
    musteriFunnelOlayBirKez(funnelId, "goruldu", {
      props: { content_name: "musteri_ana_sayfa" },
    });
    tiktokPixelViewContent({
      content_id: "musteri_talep",
      content_name: "musteri_ana_sayfa",
    });
    gtagAdsAnaSayfaGoruntulemeDonusumu();
    const onCerez = () => gtagAdsAnaSayfaGoruntulemeDonusumu();
    window.addEventListener("acil-cerez-banner", onCerez);
    return () => window.removeEventListener("acil-cerez-banner", onCerez);
  }, [funnelId]);

  useEffect(() => {
    let iptal = false;
    (async () => {
      try {
        const r = await fetch("/api/sehir-acilis");
        const j = (await r.json().catch(() => ({}))) as {
          acikIller?: string[];
        };
        if (!iptal && Array.isArray(j.acikIller) && j.acikIller.length > 0) {
          setAcikIller(j.acikIller);
        }
      } catch {
        /* fallback */
      }
    })();
    return () => {
      iptal = true;
    };
  }, []);

  useEffect(() => {
    const qSehir = searchParams.get("sehir")?.trim().toLowerCase();
    const qIlce = searchParams.get("ilce")?.trim().toLowerCase();
    if (!qSehir) return;
    const sehir = seoSehirGetir(qSehir);
    if (!sehir) return;
    setSeciliSehir(sehir.ad);
    if (qIlce) {
      const ilce = seoIlceGetir(qSehir, qIlce);
      if (ilce) setSeciliIlce(ilce.ad);
    }
  }, [searchParams]);

  useEffect(() => {
    if (hizmetUygulandi.current) return;
    const tip =
      hizmetQuerydenSorunTipi(searchParams.get("sorun")) ??
      hizmetQuerydenSorunTipi(searchParams.get("hizmet"));
    if (!tip) return;
    hizmetUygulandi.current = true;
    hizmetKaydirTip.current = tip;
    setForm((f) => ({ ...f, sorunTipi: tip }));
    /* Konum adımı önce; sorun tipi önceden seçili kalır */
    posthogOlayYakala("sorun_secildi", {
      sorun_tipi: tip,
      kaynak: searchParams.get("sorun") ? "sorun_query" : "hizmet_query",
    });
    musteriFunnelOlayBirKez(funnelId, "service_selected", {
      props: {
        sorun_tipi: tip,
        kaynak: searchParams.get("sorun") ? "sorun_query" : "hizmet_query",
      },
    });
    musteriFunnelOlayBirKez(funnelId, "form_adim_sorun", {
      props: { sorun_tipi: tip },
      analitik: false,
    });
  }, [searchParams, funnelId]);

  useEffect(() => {
    const tip = hizmetKaydirTip.current;
    if (!tip || form.sorunTipi !== tip || step !== "sorun") return;
    hizmetKaydirTip.current = null;
    const kaydir = () => {
      document
        .querySelector(`[data-sorun-id="${tip}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    const t = window.setTimeout(kaydir, 80);
    return () => window.clearTimeout(t);
  }, [form.sorunTipi, step]);

  useEffect(() => {
    const olay = ADIM_OLAYLARI[step];
    if (!olay) return;
    musteriFunnelOlayBirKez(funnelId, olay, {
      props: sorunProps(form.sorunTipi),
    });
    // yalnızca adım değişince; sorunTipi o anki değeri taşır
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, funnelId]);

  /** Adım 2+ parçalarını sorun seçiminden sonra ısıt (foto) */
  useEffect(() => {
    if (step === "sorun") return;
    void import("@/components/ArizaFotografAlani");
  }, [step]);

  useEffect(() => {
    return () => {
      if (konumToastTimerRef.current != null) {
        window.clearTimeout(konumToastTimerRef.current);
      }
      if (ilceDevamTimerRef.current != null) {
        window.clearTimeout(ilceDevamTimerRef.current);
      }
      if (sorunDevamTimerRef.current != null) {
        window.clearTimeout(sorunDevamTimerRef.current);
      }
      if (aracTipiDevamTimerRef.current != null) {
        window.clearTimeout(aracTipiDevamTimerRef.current);
      }
      if (aracDurumuDevamTimerRef.current != null) {
        window.clearTimeout(aracDurumuDevamTimerRef.current);
      }
      if (ihaleDevamTimerRef.current != null) {
        window.clearTimeout(ihaleDevamTimerRef.current);
      }
    };
  }, []);

  stepRef.current = step;
  formLatRef.current = form.lat;
  gpsYukleniyorRef.current = gpsYukleniyor;
  taslakAnlikRef.current = {
    step,
    form,
    yasalOnay,
    fotografOnizleme,
    fotografData,
    hedefBilinmiyor,
    ihaleSureTipi,
    ihaleOzelBitis,
    aracMarka,
  };

  /** Seçimler + alanlar: her değişimde ve arka plana geçince kaydet */
  useEffect(() => {
    if (!taslakHazir) return;
    const taslak = {
      v: 1 as const,
      step,
      form,
      yasalOnay,
      fotografOnizleme,
      fotografData,
      hedefBilinmiyor,
      ihaleSureTipi,
      ihaleOzelBitis: ihaleOzelBitis || undefined,
      aracMarka,
    };
    if (musteriFormTaslakBosMu(taslak)) {
      musteriFormTaslakSil();
      return;
    }
    musteriFormTaslakKaydet(taslak);
  }, [
    taslakHazir,
    step,
    form,
    yasalOnay,
    fotografOnizleme,
    fotografData,
    hedefBilinmiyor,
    ihaleSureTipi,
    ihaleOzelBitis,
    aracMarka,
  ]);

  useEffect(() => {
    if (!taslakHazir) return;
    const flush = () => {
      const a = taslakAnlikRef.current;
      const taslak = {
        v: 1 as const,
        step: a.step,
        form: a.form,
        yasalOnay: a.yasalOnay,
        fotografOnizleme: a.fotografOnizleme,
        fotografData: a.fotografData,
        hedefBilinmiyor: a.hedefBilinmiyor,
        ihaleSureTipi: a.ihaleSureTipi,
        ihaleOzelBitis: a.ihaleOzelBitis || undefined,
        aracMarka: a.aracMarka,
      };
      if (musteriFormTaslakBosMu(taslak)) musteriFormTaslakSil();
      else musteriFormTaslakKaydet(taslak);
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [taslakHazir]);

  useEffect(() => {
    if (step !== "fotograf") setFotografHatasi(false);
    if (step !== "arac_modeli") setAracModeliHatasi(false);
    if (step !== "arac_durumu") setAracDurumuHatasi(false);
    if (step !== "lastik_durumu") setLastikDurumuHatasi(false);
    if (step !== "yakit_tipi") setYakitTipiHatasi(false);
    if (step !== "kilit_durumu") setKilitDurumuHatasi(false);
    if (step !== "ek_detay") setSorunDetayHatasi(false);
    if (step !== "ihale") setIhaleSureHatasi(false);
    if (step !== "konum") {
      setAdSoyadHatasi(false);
      setArizaAdresDuzenle(false);
    }
    if (step !== "sorun" && sorunDevamTimerRef.current != null) {
      window.clearTimeout(sorunDevamTimerRef.current);
      sorunDevamTimerRef.current = null;
    }
    if (step !== "arac_tipi" && aracTipiDevamTimerRef.current != null) {
      window.clearTimeout(aracTipiDevamTimerRef.current);
      aracTipiDevamTimerRef.current = null;
    }
    if (step !== "arac_durumu" && aracDurumuDevamTimerRef.current != null) {
      window.clearTimeout(aracDurumuDevamTimerRef.current);
      aracDurumuDevamTimerRef.current = null;
    }
    if (step !== "lastik_durumu" && lastikDurumuDevamTimerRef.current != null) {
      window.clearTimeout(lastikDurumuDevamTimerRef.current);
      lastikDurumuDevamTimerRef.current = null;
    }
    if (step !== "yakit_tipi" && yakitTipiDevamTimerRef.current != null) {
      window.clearTimeout(yakitTipiDevamTimerRef.current);
      yakitTipiDevamTimerRef.current = null;
    }
    if (step !== "kilit_durumu" && kilitDurumuDevamTimerRef.current != null) {
      window.clearTimeout(kilitDurumuDevamTimerRef.current);
      kilitDurumuDevamTimerRef.current = null;
    }
    if (step !== "ihale" && ihaleDevamTimerRef.current != null) {
      window.clearTimeout(ihaleDevamTimerRef.current);
      ihaleDevamTimerRef.current = null;
    }
    setBilgiAlanMesajlari({ yasalOnay: "", telefon: "" });
  }, [step]);

  useEffect(() => {
    if (step !== "konum") return;
    const guvenli = konumGuvenliMi();
    setGpsGuvenli(guvenli);
    if (!guvenli) {
      setKonumIzni("unknown");
      setKonumSheetAcik(true);
      return;
    }
    konumIzniOku().then((izin) => {
      if (izin === "denied" && cihazPlatformu() === "ios") {
        setKonumIzni("prompt");
      } else {
        setKonumIzni(izin);
      }
    });
    return konumIzniDinle((izin) => {
      if (izin === "denied" && cihazPlatformu() === "ios") {
        setKonumIzni("prompt");
      } else {
        setKonumIzni(izin);
      }
    });
  }, [step]);

  function adSoyadKaydet() {
    if (!form.telefon.trim()) return;
    musteriProfilKaydet(form.telefon, form.ad, form.soyad.trim() || "-");
  }

  function scrollBelowStickyHeader(el: HTMLElement | null) {
    if (!el) return;
    const header = document.getElementById("app-shell-header");
    const headerH = header?.getBoundingClientRect().height ?? 160;
    const gap = 16;
    const top = el.getBoundingClientRect().top + window.scrollY - headerH - gap;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  function konumIsimHatasiGoster() {
    const mesaj = "Devam etmek için ad ve soyad girin (yukarıdaki alanlar).";
    setAdSoyadHatasi(true);
    setError(mesaj);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        scrollBelowStickyHeader(konumIsimRef.current);
      });
    });
  }

  /** `fotograf` adımında Devam — foto isteğe bağlı (bugün hiçbir tip zorunlu değil) */
  function fotografAdimiDevam(): boolean {
    const fotografEksik =
      sorunFotografGerekliMi(form.sorunTipi) && fotografData.length === 0;
    setFotografHatasi(fotografEksik);
    if (fotografEksik) {
      setError(
        "Arıza fotoğrafı zorunludur — çekici doğru teklif verebilsin."
      );
      return false;
    }
    setError("");
    return true;
  }

  /** `arac_modeli` adımında Devam — model isteğe bağlı (bugün hiçbir tip zorunlu değil) */
  function aracModeliAdimiDevam(): boolean {
    const aracEksik =
      sorunAracModeliGerekliMi(form.sorunTipi) && !form.aracModeli.trim();
    setAracModeliHatasi(aracEksik);
    if (aracEksik) {
      setError("Araç modelini girin (ör. Audi A3 sedan).");
      return false;
    }
    setError("");
    return true;
  }

  /** `arac_durumu` adımında Devam — durum seçimi (main ile aynı) */
  function aracDurumuAdimiDevam(): boolean {
    const eksik =
      sorunAracModeliAlaniGoster(form.sorunTipi) && !form.aracDurumu.trim();
    setAracDurumuHatasi(eksik);
    if (eksik) {
      setError("Araç durumunu seçin.");
      return false;
    }
    setError("");
    return true;
  }

  /** `lastik_durumu` adımında Devam — zorunlu */
  function lastikDurumuAdimiDevam(): boolean {
    const eksik =
      sorunLastikDurumuGerekliMi(form.sorunTipi) && !form.lastikDurumu.trim();
    setLastikDurumuHatasi(eksik);
    if (eksik) {
      setError("Lastik durumunu seçin.");
      return false;
    }
    setError("");
    return true;
  }

  /** `yakit_tipi` adımında Devam — zorunlu */
  function yakitTipiAdimiDevam(): boolean {
    const eksik =
      sorunYakitTipiGerekliMi(form.sorunTipi) && !form.yakitTipi.trim();
    setYakitTipiHatasi(eksik);
    if (eksik) {
      setError("Yakıt tipini seçin.");
      return false;
    }
    setError("");
    return true;
  }

  /** `kilit_durumu` adımında Devam — zorunlu */
  function kilitDurumuAdimiDevam(): boolean {
    const eksik =
      sorunKilitDurumuGerekliMi(form.sorunTipi) && !form.kilitDurumu.trim();
    setKilitDurumuHatasi(eksik);
    if (eksik) {
      setError("Kilit durumunu seçin.");
      return false;
    }
    setError("");
    return true;
  }

  /** `ek_detay` adımında Devam — «diğer» tipinde açıklama zorunlu */
  function ekDetayAdimiDevam(): boolean {
    const detayEksik = form.sorunTipi === "diger" && !form.sorunDetay.trim();
    setSorunDetayHatasi(detayEksik);
    if (detayEksik) {
      setError("Lütfen sorununuzu kısaca açıklayın.");
      return false;
    }
    setError("");
    return true;
  }

  /** `ihale` adımında Devam — süre seçimi doğrulanır */
  function ihaleAdimiDevam(): boolean {
    const sure = ihaleBitisHesapla(ihaleSureTipi, {
      ozelBitis: ihaleOzelBitis,
    });
    if (!sure.ok) {
      setIhaleSureHatasi(true);
      setError(sure.hata);
      return false;
    }
    setIhaleSureHatasi(false);
    setError("");
    return true;
  }

  function update(field: string, value: string | number) {
    if (field === "ad" || field === "soyad") {
      setAdSoyadHatasi(false);
    }
    if (field === "aracModeli") {
      setAracModeliHatasi(false);
    }
    if (field === "aracDurumu") {
      setAracDurumuHatasi(false);
    }
    if (field === "lastikDurumu") {
      setLastikDurumuHatasi(false);
    }
    if (field === "yakitTipi") {
      setYakitTipiHatasi(false);
    }
    if (field === "kilitDurumu") {
      setKilitDurumuHatasi(false);
    }
    if (field === "sorunDetay") {
      setSorunDetayHatasi(false);
    }
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (field === "hedefAdres" && value !== f.hedefAdres) {
        next.hedefLat = 0;
        next.hedefLng = 0;
        if (hedefBilinmiyor) setHedefBilinmiyor(false);
      }
      return next;
    });
  }

  function konumSecimiHazir(): boolean {
    return (
      !!form.adres.trim() ||
      (!!form.lat && !!form.lng) ||
      (!!seciliSehir && !!seciliIlce)
    );
  }

  function adimGit(hedef: Step) {
    const hedefIdx = TUM_ADIMLAR.indexOf(hedef);
    const konumIdx = TUM_ADIMLAR.indexOf("konum");
    const sorunIdx = TUM_ADIMLAR.indexOf("sorun");
    /* Timer’lardan çağrılınca stale form olmasın — anlık ref */
    const anlik = taslakAnlikRef.current.form;

    if (
      hedefIdx > konumIdx &&
      !(
        !!anlik.adres.trim() ||
        (!!anlik.lat && !!anlik.lng) ||
        (!!seciliSehir && !!seciliIlce)
      )
    ) {
      setError("Önce otomatik konum alın veya şehir ve ilçe seçin.");
      setStep("konum");
      return;
    }

    if (hedefIdx > sorunIdx) {
      if (!anlik.sorunTipi) {
        setError("Lütfen sorununuzu seçin.");
        setStep("sorun");
        return;
      }
    }

    /* Konum adımından çıkarken URL’yi senkronize et — remount yok (push akışı sıfırlar) */
    if (step === "konum" && hedef !== "konum" && seciliSehir) {
      const yol = musteriKonumYolu(seciliSehir, seciliIlce || null);
      musteriFormTaslakKaydet({
        v: 1,
        step: hedef,
        form: anlik,
        yasalOnay,
        fotografOnizleme,
        fotografData,
        hedefBilinmiyor,
        ihaleSureTipi,
        ihaleOzelBitis: ihaleOzelBitis || undefined,
      });
      if (
        typeof window !== "undefined" &&
        yol &&
        window.location.pathname !== yol
      ) {
        window.history.replaceState(window.history.state, "", yol);
      }
    }

    setStep(hedef);
    setError("");
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
      const main = document.querySelector("main");
      if (main instanceof HTMLElement) main.scrollTop = 0;
    });
  }

  async function konumKaydet(
    lat: number,
    lng: number,
    adres: string,
    hedef: boolean,
    kaynak?: "gps" | "manuel"
  ) {
    if (hedef) {
      setHedefBilinmiyor(false);
      setForm((f) => ({
        ...f,
        hedefLat: lat,
        hedefLng: lng,
        hedefAdres: adres,
      }));
      hedefAlanaKaydir("hedef-secim-ozeti");
    } else {
      setForm((f) => ({
        ...f,
        lat,
        lng,
        adres,
        ...(kaynak ? { konumKaynak: kaynak } : {}),
      }));
      const { il, ilce } = parseIlIlce(adres);
      if (il) setSeciliSehir(il);
      if (ilce) setSeciliIlce(ilce);
    }
  }

  function gpsIptal() {
    gpsIstekRef.current += 1;
    setGpsYukleniyor(false);
    setKonumIzniBekleniyor(false);
  }

  function konumIzniToastGoster(mesaj: string) {
    setKonumIzniToast(mesaj);
    if (konumToastTimerRef.current != null) {
      window.clearTimeout(konumToastTimerRef.current);
    }
    konumToastTimerRef.current = window.setTimeout(() => {
      setKonumIzniToast(null);
      konumToastTimerRef.current = null;
    }, 5000);
  }

  async function konumAl(hedef = false) {
    const istekId = ++gpsIstekRef.current;
    setGpsYukleniyor(true);
    setError("");
    setKonumIzniBekleniyor(false);
    setKonumBasarisiz(false);

    if (!navigator.geolocation) {
      setError("Tarayıcınız konum desteklemiyor. Adresi elle yazın.");
      setKonumBasarisiz(true);
      if (gpsIstekRef.current === istekId) setGpsYukleniyor(false);
      return;
    }
    if (!konumGuvenliMi()) {
      setGpsGuvenli(false);
      setKonumIzni("unknown");
      setError(
        "GPS için https:// adresi gerekli. Yukarıdaki «HTTPS ile aç» butonunu kullanın veya adresi aşağıya yazın."
      );
      setKonumBasarisiz(true);
      if (gpsIstekRef.current === istekId) setGpsYukleniyor(false);
      return;
    }

    setKonumIzniBekleniyor(true);
    /*
     * Safari iOS: getCurrentPosition tıklama (user gesture) içinde senkron
     * başlamalı. permissions.query await edilirse izin diyaloğu çıkmayabilir.
     */
    const konumPromise = konumAlEsnek();
    void konumIzniOku().then((izin) => {
      if (gpsIstekRef.current !== istekId) return;
      if (izin === "granted") setKonumIzni("granted");
      else if (izin !== "denied") setKonumIzni(izin);
    });
    try {
      const pos = await konumPromise;
      if (gpsIstekRef.current !== istekId) return;
      const { latitude, longitude } = pos.coords;
      const adres = await reverseGeocode(latitude, longitude);
      if (gpsIstekRef.current !== istekId) return;
      await konumKaydet(
        latitude,
        longitude,
        adres,
        hedef,
        hedef ? undefined : "gps"
      );
      if (!hedef) {
        setArizaAdresDuzenle(false);
        setError("");
        setBilgiMesaj("");
        setKonumBasarisiz(false);
        const { il, ilce } = parseIlIlce(adres);
        if (il) setSeciliSehir(il);
        if (ilce) setSeciliIlce(ilce);
        const sonrakiForm: MusteriFormAlanlari = {
          ...form,
          lat: latitude,
          lng: longitude,
          adres,
          konumKaynak: "gps",
        };
        musteriFormTaslakKaydet({
          v: 1,
          step: "sorun",
          form: sonrakiForm,
          yasalOnay,
          fotografOnizleme,
          fotografData,
          hedefBilinmiyor,
          ihaleSureTipi,
          ihaleOzelBitis: ihaleOzelBitis || undefined,
        });
        /* Skip konum confirmation — go straight to sorun (no remount via router) */
        setError("");
        setStep("sorun");
        const yol = musteriKonumYolu(il, ilce);
        if (
          typeof window !== "undefined" &&
          yol &&
          window.location.pathname !== yol
        ) {
          window.history.replaceState(window.history.state, "", yol);
        }
      }
      setKonumIzni("granted");
      setKonumIzniBekleniyor(false);
    } catch (e) {
      if (gpsIstekRef.current !== istekId) return;
      setKonumBasarisiz(true);
      setKonumSheetAcik(true);
      const code =
        e && typeof e === "object" && "code" in e
          ? (e as GeolocationPositionError).code
          : undefined;
      if (code === 1) {
        setKonumIzni("denied");
        setKonumIzniBekleniyor(false);
        konumIzniToastGoster(
          "Konum izni verilmedi veya reddedildi. Ayarlar’dan açabilirsiniz."
        );
      } else {
        setError(konumHataMesaji(code));
      }
    } finally {
      if (gpsIstekRef.current === istekId) {
        setGpsYukleniyor(false);
        setKonumIzniBekleniyor(false);
      }
    }
  }

  /** Şehir + ilçe ile manuel konum kaydı → sorun adımı */
  async function konumManuelDevam(
    sehir = seciliSehir,
    ilce = seciliIlce
  ): Promise<boolean> {
    setError("");
    if (gpsYukleniyor) gpsIptal();

    if (arizaKonumGpsAlindi && form.adres) {
      const ok = await adresKoordinatDoldur(false);
      if (ok) {
        adimGit("sorun");
        return true;
      }
      return false;
    }

    if (sehir && ilce) {
      const adresMetni =
        form.adres.trim() || `${ilce}, ${sehir}, Türkiye`;
      if (!form.lat || !form.lng) {
        setAdresGeocodeYukleniyor(true);
        try {
          const g = await geocodeAdres(`${ilce}, ${sehir}, Türkiye`);
          if (g) {
            await konumKaydet(g.lat, g.lng, g.adres, false, "manuel");
          } else {
            setForm((f) => ({
              ...f,
              adres: adresMetni,
              konumKaynak: "manuel",
            }));
          }
        } finally {
          setAdresGeocodeYukleniyor(false);
        }
      } else {
        setForm((f) => ({
          ...f,
          adres: form.adres.trim() || adresMetni,
          konumKaynak: "manuel",
        }));
      }
      setArizaAdresDuzenle(false);
      adimGit("sorun");
      return true;
    }

    if (form.adres.trim().length >= 6) {
      const ok = await adresKoordinatDoldur(false);
      if (ok) {
        adimGit("sorun");
        return true;
      }
    }

    setKonumSheetAcik(true);
    setError("Otomatik konum alın veya şehir ve ilçe seçin.");
    return false;
  }

  async function yaklasikKonumAl(hedef = false) {
    setAdresGeocodeYukleniyor(true);
    setError("");
    try {
      const res = await fetch("/api/konum/ip-tahmin");
      const data = await res.json();
      if (!res.ok) {
        const mevcut = hedef ? form.hedefAdres : form.adres;
        if (mevcut.trim().length >= 4) {
          const g = await geocodeAdres(mevcut);
          if (g) {
            await konumKaydet(
              g.lat,
              g.lng,
              g.adres,
              hedef,
              hedef ? undefined : "manuel"
            );
            setBilgiMesaj("Adres haritada işaretlendi.");
            return;
          }
        }
        throw new Error(
          data.error ??
            "Yerel Wi‑Fi’de IP konumu çalışmaz. Adresi yazıp «Devam Et»e basın veya HTTPS ile GPS kullanın."
        );
      }
      const uyari = " (yaklaşık konum)";
      await konumKaydet(
        data.lat,
        data.lng,
        (data.adres ?? "") + uyari,
        hedef,
        hedef ? undefined : "manuel"
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yaklaşık konum alınamadı.");
    } finally {
      setAdresGeocodeYukleniyor(false);
    }
  }

  /** Elle yazılan adresi koordinata çevir (GPS yokken öneriler için) */
  async function adresKoordinatDoldur(hedef = false): Promise<boolean> {
    const adres = (hedef ? form.hedefAdres : form.adres).trim();
    if (!adres) {
      setError(hedef ? "Hedef adres gerekli." : "Adres gerekli.");
      return false;
    }
    const lat = hedef ? form.hedefLat : form.lat;
    const lng = hedef ? form.hedefLng : form.lng;
    if (lat && lng) return true;

    setAdresGeocodeYukleniyor(true);
    setError("");
    const g = await geocodeAdres(adres);
    setAdresGeocodeYukleniyor(false);
    if (g) {
      await konumKaydet(
        g.lat,
        g.lng,
        g.adres,
        hedef,
        hedef ? undefined : "manuel"
      );
      return true;
    }
    setBilgiMesaj(
      "Adres kaydedildi. Daha net yazarsanız (ilçe, mahalle) harita önerileri iyileşir."
    );
    return true;
  }

  /** Hedef adresi elle yazınca «Arat» — her zaman yeniden geocode */
  async function hedefAdresAra() {
    const adres = hedefAramaMetni.trim() || form.hedefAdres.trim();
    if (adres.length < 4) {
      setError("Aramak için daha net bir adres yazın (ilçe, mahalle…).");
      return;
    }
    setAdresGeocodeYukleniyor(true);
    setError("");
    setBilgiMesaj("");
    const g = await geocodeAdres(adres);
    setAdresGeocodeYukleniyor(false);
    if (g) {
      if (!hedefAramaMetni.trim()) setHedefAramaMetni(adres);
      await konumKaydet(g.lat, g.lng, g.adres, true);
      return;
    }
    setError(
      "Adres bulunamadı. İl, ilçe ve mahalle ekleyerek tekrar «Arat»a basın."
    );
  }

  async function cozumOner(yenile = false) {
    if (!form.sorunTipi) {
      setError("Önce sorununuzu seçin.");
      setStep("sorun");
      return;
    }

    const YENI_ONERI_API_LIMIT = 5;

    /* Limit aşıldı — API yok, ilk turdaki havuzdan rastgele */
    if (yenile && yeniOneriApiSayisiRef.current >= YENI_ONERI_API_LIMIT) {
      const ornek = rastgeleServisOnerileri(oneriHavuzRef.current);
      if (!ornek.length) {
        setError("Öneri havuzu boş. Hedef adresi elle yazabilirsiniz.");
        return;
      }
      setOneriler(ornek);
      setError("");
      setBilgiMesaj(
        "Yeni arama limiti doldu; önceki önerilerden rastgele gösteriliyor."
      );
      hedefAlanaKaydir("hedef-grup-oto_tamir");
      return;
    }

    const oncekiOneriler = yenile
      ? oneriHavuzRef.current.length > 0
        ? oneriHavuzRef.current
        : oneriler
      : [];

    setOneriYukleniyor(true);
    setError("");
    setBilgiMesaj("");
    if (!yenile) {
      setOneriler([]);
      oneriHavuzRef.current = [];
      yeniOneriApiSayisiRef.current = 0;
      setYeniOneriApiSayisi(0);
    }

    try {
      let lat = form.lat;
      let lng = form.lng;
      if (!lat || !lng) {
        if (!form.adres.trim()) {
          setError("Önce arıza konumunuzu paylaşın.");
          setStep("konum");
          return;
        }
        const g = await geocodeAdres(form.adres);
        if (!g) {
          setError(
            "Arıza adresi haritada bulunamadı. «Arıza Konumu» adımında adresi ilçe ve mahalle ile netleştirin."
          );
          return;
        }
        await konumKaydet(g.lat, g.lng, g.adres, false, "manuel");
        lat = g.lat;
        lng = g.lng;
      }

      let excludeQs = "";
      if (oncekiOneriler.length > 0) {
        excludeQs += `&exclude=${encodeURIComponent(oncekiOneriler.map((o) => o.adres).join("|"))}`;
        const ids = oncekiOneriler
          .map((o) => o.placeId)
          .filter((id): id is string => !!id);
        if (ids.length > 0) {
          excludeQs += `&excludeIds=${encodeURIComponent(ids.join("|"))}`;
        }
      }

      const res = await fetch(
        `/api/konum/oneri?lat=${lat}&lng=${lng}&mod=servis${
          form.adres.trim()
            ? `&adres=${encodeURIComponent(form.adres.trim())}`
            : ""
        }${excludeQs}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Öneri alınamadı.");

      const gelen: KonumOneri[] = data.oneriler ?? [];
      setOneriler(gelen);
      setOneriKaynak(data.kaynak ?? null);
      setOneriAcikFiltre(!!data.acikFiltrelendi);
      setOneriSemt(
        typeof data.semt === "string" && data.semt.trim()
          ? data.semt.trim()
          : null
      );

      oneriHavuzaEkle(gelen);

      if (yenile) {
        oneriOffsetRef.current += 1;
        yeniOneriApiSayisiRef.current += 1;
        setYeniOneriApiSayisi(yeniOneriApiSayisiRef.current);
      } else {
        oneriOffsetRef.current = 1;
      }

      if (!gelen.length) {
        setError(
          yenile
            ? googleMapsYapilandirildi()
              ? "Şu an açık başka yer bulunamadı. Hedef adresi elle yazabilirsiniz."
              : "Yeni öneri bulunamadı. Hedef adresi aşağıya elle yazabilirsiniz."
            : googleMapsYapilandirildi()
              ? "Yakında şu an açık yer bulunamadı. Hedef adresi elle yazabilirsiniz."
              : "Yakında öneri bulunamadı. Hedef adresi elle yazabilirsiniz."
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Öneri alınamadı.");
    } finally {
      setOneriYukleniyor(false);
    }
  }

  function oneriHavuzaEkle(liste: KonumOneri[]) {
    const map = new Map<string, KonumOneri>();
    for (const o of oneriHavuzRef.current) {
      map.set(o.placeId ?? o.adres, o);
    }
    for (const o of liste) {
      map.set(o.placeId ?? o.adres, o);
    }
    oneriHavuzRef.current = Array.from(map.values());
  }

  function rastgeleServisOnerileri(havuz: KonumOneri[]): KonumOneri[] {
    function karistir<T>(arr: T[]): T[] {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }
    const tamir = karistir(
      havuz.filter((o) => o.kategori === "oto_tamir" || !o.kategori)
    ).slice(0, 5);
    const sanayi = karistir(
      havuz.filter((o) => o.kategori === "oto_sanayi")
    ).slice(0, 3);
    return [
      ...tamir.map((o, i) => ({ ...o, etiketNo: i + 1 })),
      ...sanayi.map((o, i) => ({ ...o, etiketNo: i + 1 })),
    ];
  }

  function oneriSec(o: KonumOneri) {
    setHedefBilinmiyor(false);
    setHedefKendimArat(false);
    setHedefOpsiyon(
      o.kategori === "oto_sanayi" ? "oto_sanayi" : "oto_tamir"
    );
    setForm((f) => ({
      ...f,
      hedefLat: o.lat,
      hedefLng: o.lng,
      hedefAdres: o.adres,
    }));
    hedefAlanaKaydir("hedef-secim-ozeti");
  }

  function hedefAlanaKaydir(elementId: string) {
    window.setTimeout(() => {
      document
        .getElementById(elementId)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
  }

  function enYakinHedefSec(kategori: "oto_tamir" | "oto_sanayi") {
    setError("");
    setHedefBilinmiyor(false);
    setHedefKendimArat(false);
    setHedefOpsiyon(kategori);
    const grupId =
      kategori === "oto_tamir"
        ? "hedef-grup-oto_tamir"
        : "hedef-grup-oto_sanayi";
    hedefAlanaKaydir(grupId);

    const kategorili = oneriler.filter((o) => o.kategori === kategori);
    const yedek =
      !oneriler.some((o) => o.kategori) && kategori === "oto_tamir"
        ? oneriler
        : [];
    const liste = (kategorili.length ? kategorili : yedek)
      .slice()
      .sort((a, b) => (a.mesafeKm ?? 999) - (b.mesafeKm ?? 999));
    const enYakin = liste[0];
    if (!enYakin) {
      setError(
        oneriYukleniyor
          ? "Öneriler yükleniyor, biraz bekleyin…"
          : kategori === "oto_tamir"
            ? "Yakın oto servis bulunamadı. Listeden seçin veya adresi yazın."
            : "Yakın oto sanayi bulunamadı. Listeden seçin veya adresi yazın."
      );
      return;
    }
    setHedefBilinmiyor(false);
    setForm((f) => ({
      ...f,
      hedefLat: enYakin.lat,
      hedefLng: enYakin.lng,
      hedefAdres: enYakin.adres,
    }));
    hedefAlanaKaydir("hedef-secim-ozeti");
  }

  function hedefBilmiyorumSec() {
    setError("");
    setHedefKendimArat(false);
    setHedefBilinmiyor(true);
    setHedefOpsiyon("bilmiyorum");
    setForm((f) => ({
      ...f,
      hedefLat: 0,
      hedefLng: 0,
      hedefAdres: "",
    }));
    hedefAlanaKaydir("hedef-secim-ozeti");
  }

  function hedefKendimAratSec() {
    setError("");
    setHedefBilinmiyor(false);
    setHedefKendimArat(true);
    setHedefOpsiyon("kendim");
    if (!hedefAramaMetni.trim() && form.hedefAdres.trim() && !form.hedefLat) {
      setHedefAramaMetni(form.hedefAdres);
    }
    hedefAlanaKaydir("hedef-secim-ozeti");
  }

  async function hedefIleriGit() {
    if (gpsYukleniyor) gpsIptal();
    if (hedefBilinmiyor) {
      adimGit("ozet");
      return;
    }
    if (await adresKoordinatDoldur(true)) adimGit("ozet");
  }

  const hedefSeciliMi = hedefOpsiyon != null;

  const hedefGonderilebilir =
    hedefOpsiyon === "bilmiyorum" ||
    (hedefOpsiyon != null &&
      Boolean(form.hedefAdres.trim() && form.hedefLat && form.hedefLng));

  /** Seçim yoksa veya kendim-arat adresi eksikse CTA kapalı */
  const hedefIleriEngelli =
    loading || adresGeocodeYukleniyor || !hedefGonderilebilir;

  const hedefNormalSinif =
    "border-slate-200 bg-white text-slate-900 shadow-[var(--acb-shadow)] hover:shadow-[var(--acb-shadow-lg)]";

  function hedefOneriSeciliMi(o: KonumOneri): boolean {
    if (hedefBilinmiyor || hedefKendimArat || !form.hedefLat || !form.hedefLng) {
      return false;
    }
    return (
      Math.abs(form.hedefLat - o.lat) < 1e-5 &&
      Math.abs(form.hedefLng - o.lng) < 1e-5
    );
  }

  function enYakinModSeciliMi(kategori: "oto_tamir" | "oto_sanayi"): boolean {
    if (hedefBilinmiyor || hedefKendimArat || !form.hedefLat) return false;
    return oneriler.some(
      (o) => o.kategori === kategori && hedefOneriSeciliMi(o)
    );
  }

  function hedefAdresAramaAlani() {
    const adresBulundu =
      !!form.hedefAdres.trim() && !!form.hedefLat && !!form.hedefLng;
    return (
      <div className="space-y-3">
        <div className="flex gap-2 items-stretch">
          <input
            type="text"
            placeholder="Örn: İkitelli Oto Sanayi, Başakşehir"
            value={hedefAramaMetni}
            onChange={(e) => {
              const v = e.target.value;
              setHedefAramaMetni(v);
              /* Yeni arama → önceki sonucu temizle */
              if (form.hedefLat || form.hedefLng) {
                setForm((f) => ({
                  ...f,
                  hedefLat: 0,
                  hedefLng: 0,
                  hedefAdres: "",
                }));
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void hedefAdresAra();
              }
            }}
            className="min-w-0 flex-1 rounded-xl bg-white border border-slate-200 px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            name="hedef-adres-arama"
            enterKeyHint="search"
          />
          <button
            type="button"
            onClick={() => void hedefAdresAra()}
            disabled={!hedefAramaMetni.trim() || adresGeocodeYukleniyor}
            className="shrink-0 rounded-xl bg-amber-500 px-4 min-h-[52px] font-semibold text-sm text-white touch-manipulation active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 hover:bg-amber-600"
          >
            {adresGeocodeYukleniyor ? (
              <span className="inline-flex items-center gap-2">
                <Spinner className="size-4 border-white/40 border-t-white" />
                Aranıyor
              </span>
            ) : (
              "Arat"
            )}
          </button>
        </div>
        {adresBulundu ? (
          <div className="rounded-[var(--acb-radius)] border-2 border-emerald-400 bg-emerald-50 px-3.5 py-3 space-y-2 shadow-[var(--acb-shadow)]">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
              Bulunan tam adres — kontrol edin
            </p>
            <p className="text-sm font-semibold text-slate-900 leading-snug break-words">
              {form.hedefAdres}
            </p>
            <p className="text-xs text-emerald-900 leading-relaxed">
              Doğruysa aşağıdaki çağır butonuyla devam edin. Değilse aramayı
              düzeltip tekrar «Arat»a basın.
            </p>
          </div>
        ) : hedefAramaMetni.trim() ? (
          <p className="text-xs text-slate-600 leading-relaxed">
            «Arat»a basın — bulunan tam adres burada görünecek.
          </p>
        ) : (
          <p className="text-xs text-slate-600 leading-relaxed">
            Servis, oto sanayi veya ev adresini yazın; «Arat» ile bulun.
          </p>
        )}
      </div>
    );
  }

  async function cekiciBul() {
    setError("");
    if (!form.lat || !form.lng) {
      const ok = await adresKoordinatDoldur(false);
      if (!ok) return;
    }
    const telHata = telefonDogrulamaHatasi(form.telefon);
    if (telHata) {
      setError(telHata);
      setBilgiAlanMesajlari((m) => ({ ...m, telefon: telHata }));
      setStep("telefon");
      return;
    }
    if (!form.ad.trim()) {
      setError("İsminizi girin.");
      setStep("telefon");
      return;
    }
    if (!yasalOnay) {
      setError("Talep göndermek için yasal metinleri onaylayın.");
      setBilgiAlanMesajlari((m) => ({
        ...m,
        yasalOnay: "Yasal metinleri onaylamanız zorunludur.",
      }));
      setStep("telefon");
      return;
    }
    if (!form.adres) {
      setError("Arıza konumu gerekli.");
      setStep("konum");
      return;
    }
    if (!form.sorunTipi) {
      setError("Lütfen sorununuzu seçin.");
      setStep("sorun");
      return;
    }
    if (form.sorunTipi === "diger" && !form.sorunDetay.trim()) {
      setError("Lütfen sorununuzu kısaca açıklayın.");
      setStep("ek_detay");
      return;
    }
    if (sorunLastikDurumuGerekliMi(form.sorunTipi) && !form.lastikDurumu.trim()) {
      setError("Lastik durumunu seçin.");
      setStep("lastik_durumu");
      return;
    }
    if (sorunYakitTipiGerekliMi(form.sorunTipi) && !form.yakitTipi.trim()) {
      setError("Yakıt tipini seçin.");
      setStep("yakit_tipi");
      return;
    }
    if (sorunKilitDurumuGerekliMi(form.sorunTipi) && !form.kilitDurumu.trim()) {
      setError("Kilit durumunu seçin.");
      setStep("kilit_durumu");
      return;
    }
    if (sorunFotografGerekliMi(form.sorunTipi) && fotografData.length === 0) {
      setError("Arıza fotoğrafı gerekli.");
      setStep("fotograf");
      return;
    }
    {
      const sure = ihaleBitisHesapla(ihaleSureTipi, {
        ozelBitis: ihaleOzelBitis,
      });
      if (!sure.ok) {
        setIhaleSureHatasi(true);
        setError(sure.hata);
        setStep("ihale");
        return;
      }
    }
    if (
      sorunHedefKonumGerekliMi(form.sorunTipi) &&
      !hedefBilinmiyor &&
      !form.hedefAdres
    ) {
      setError("Aracın çekileceği adres gerekli.");
      setStep("hedef");
      return;
    }

    setLoading(true);
    const hedefGerekli =
      sorunHedefKonumGerekliMi(form.sorunTipi) && !hedefBilinmiyor;
    const sorunDetayGonder = form.sorunDetay.trim();
    try {
      const res = await fetch("/api/talep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ad: form.ad.trim(),
          soyad: form.soyad.trim() || "-",
          telefon: form.telefon.trim(),
          konum: {
            lat: form.lat,
            lng: form.lng,
            adres: form.adres,
            kaynak: form.konumKaynak === "gps" ? "gps" : "manuel",
          },
          ...(hedefBilinmiyor ? { hedefBilinmiyor: true } : {}),
          ...(hedefGerekli
            ? {
                hedefKonum: {
                  lat: form.hedefLat,
                  lng: form.hedefLng,
                  adres: form.hedefAdres,
                },
              }
            : {}),
          sorunTipi: form.sorunTipi,
          sorunDetay: sorunDetayGonder,
          lastikDurumu: form.lastikDurumu.trim() || undefined,
          yakitTipi: form.yakitTipi.trim() || undefined,
          kilitDurumu: form.kilitDurumu.trim() || undefined,
          aracTipi: form.aracTipi.trim() || undefined,
          aracDurumu: form.aracDurumu.trim() || undefined,
          aracModeli: aracDurumuMetniOlustur(
            form.aracTipi,
            aracDurumuEtiket(form.aracDurumu) ?? form.aracModeli
          ),
          fotograflar: fotografData.length ? fotografData : undefined,
          sorun: (() => {
            let metin = sorunMetniOlustur(form.sorunTipi, sorunDetayGonder);
            const lastik = lastikDurumuEtiket(form.lastikDurumu);
            if (lastik) metin = `${metin} · ${lastik}`;
            const yakit = yakitTipiEtiket(form.yakitTipi);
            if (yakit) metin = `${metin} · ${yakit}`;
            const kilit = kilitDurumuEtiket(form.kilitDurumu);
            if (kilit) metin = `${metin} · ${kilit}`;
            return metin;
          })(),
          ihaleSureTipi,
          ...(ihaleSureTipi === "ozel" && ihaleOzelBitis
            ? { ihaleOzelBitis }
            : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bir hata oluştu.");
      musteriFormTaslakSil();
      posthogOlayYakala("talep_olustur", {
        sorun_tipi: form.sorunTipi,
        bildirilen_sayisi: data.bildirilenSayisi ?? 0,
      });
      void musteriFunnelOlayGonder(funnelId, "talep_olustur", {
        talepId: typeof data.id === "string" ? data.id : String(data.id ?? ""),
        props: {
          sorun_tipi: form.sorunTipi,
          bildirilen_sayisi: data.bildirilenSayisi ?? 0,
        },
        analitik: false,
      });
      if (typeof data.id === "string" || data.id != null) {
        musteriFunnelIdTalepKaydet(String(data.id), funnelId);
        musteriAktifTalepKaydet(String(data.id));
      }
      /* Meta + TikTok Lead: bekle sayfasına gitmeden önce + bir kez (bekle yedek) */
      try {
        if (sessionStorage.getItem(`acil_meta_lead_${data.id}`) !== "1") {
          sessionStorage.setItem(`acil_meta_lead_${data.id}`, "1");
          metaPixelLead({
            content_name: form.sorunTipi || "musteri_talep",
            externalId:
              typeof data.id === "string" ? data.id : String(data.id ?? ""),
          });
          void tiktokPixelLead({
            content_name: form.sorunTipi || "musteri_talep",
            externalId: typeof data.id === "string" ? data.id : String(data.id ?? ""),
          });
        }
        sessionStorage.setItem(
          `acil_bekle_${data.id}`,
          String(data.bildirilenSayisi ?? 0)
        );
        if (form.sorunTipi) {
          sessionStorage.setItem(`acil_bekle_sorun_${data.id}`, form.sorunTipi);
        }
      } catch {
        void metaPixelLead({
          content_name: form.sorunTipi || "musteri_talep",
        });
        void tiktokPixelLead({
          content_name: form.sorunTipi || "musteri_talep",
        });
      }
      /* Google Ads «Tıklama» snippet: conversion → event_callback → /bekle */
      gtagAdsFiyatTeklifiDonusumu({
        transactionId:
          typeof data.id === "string" ? data.id : String(data.id ?? ""),
        url: `/bekle/${data.id}`,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Talep gönderilemedi.");
    } finally {
      setLoading(false);
    }
  }

  const hedefKonumGerekli = sorunHedefKonumGerekliMi(form.sorunTipi);

  const adimSirasi = aktifAdimlar(form.sorunTipi, hedefKonumGerekli);
  const steps: { key: Step; label: string }[] = adimSirasi.map(
    (key, i) => ({ key, label: String(i + 1) })
  );

  /** Geçerli adım listesinde bir sonraki adım (yoksa null → submit) */
  function sonrakiAdim(mevcut: Step): Step | null {
    const idx = adimSirasi.indexOf(mevcut);
    return idx >= 0 && idx < adimSirasi.length - 1
      ? adimSirasi[idx + 1]!
      : null;
  }

  function oncekiAdimaDon() {
    const idx = steps.findIndex((s) => s.key === step);
    if (idx > 0) {
      setStep(steps[idx - 1]!.key);
      setError("");
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "auto" });
      });
      return;
    }
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    }
  }

  /** Sorun adımından: konum atlama efektini kırıp konum seçimine dön */
  function konumuDegistir() {
    if (sorunDevamTimerRef.current != null) {
      window.clearTimeout(sorunDevamTimerRef.current);
      sorunDevamTimerRef.current = null;
    }
    gpsIptal();
    setGpsYukleniyor(false);
    setArizaAdresDuzenle(true);
    const { il, ilce } = parseIlIlce(form.adres);
    const sehirKorunan =
      seciliSehir.trim() || il || varsayilanSehir || "";
    const ilceKorunan =
      seciliIlce.trim() || ilce || varsayilanIlce || "";
    setForm((f) => ({
      ...f,
      lat: 0,
      lng: 0,
      adres: "",
      konumKaynak: undefined,
    }));
    setSeciliSehir(sehirKorunan);
    setSeciliIlce(ilceKorunan);
    setError("");
    setBilgiMesaj("");
    setKonumBasarisiz(false);
    setStep("konum");
    /* Şehir+ilçe zaten doluysa sheet açmaya gerek yok */
    setKonumSheetAcik(!(sehirKorunan && ilceKorunan));
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
    });
  }

  const sorunLabel = form.sorunTipi
    ? sorunTipiBul(form.sorunTipi)?.label
    : null;

  const arızaKonumuHazir =
    !!form.adres.trim() || (!!form.lat && !!form.lng);

  const devamEtEngelli =
    !arızaKonumuHazir || adresGeocodeYukleniyor;

  const arızaKoordinatiVar = !!(form.lat && form.lng);
  const arizaKonumGpsAlindi = arızaKoordinatiVar && !arizaAdresDuzenle;
  const cozumOneriAktif =
    !!form.sorunTipi && (arızaKoordinatiVar || !!form.adres.trim());

  const googleOneriAktif = googleMapsYapilandirildi();

  /** Atlanan bir adımda kalınırsa (ör. tip değişti, hedef artık gerekmiyor) en yakın geçerli adıma çek */
  useEffect(() => {
    if (adimSirasi.includes(step)) return;
    const idx = TUM_ADIMLAR.indexOf(step);
    const enYakin = [...TUM_ADIMLAR]
      .slice(0, idx + 1)
      .reverse()
      .find((a) => adimSirasi.includes(a));
    setStep(enYakin ?? "sorun");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- adimSirasi her render türetiliyor
  }, [step, form.sorunTipi, hedefKonumGerekli]);

  useEffect(() => {
    if (step !== "hedef") {
      hedefOneriBaslatildi.current = false;
      return;
    }
    if (hedefOneriBaslatildi.current || !cozumOneriAktif || oneriYukleniyor) return;
    hedefOneriBaslatildi.current = true;
    void cozumOner(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- yalnızca hedef adımına girildiğinde
  }, [step, cozumOneriAktif]);

  /** Konum alındıysa onay ekranını atla → sorun (02) */
  useEffect(() => {
    if (step !== "konum") return;
    if (!arizaKonumGpsAlindi || !form.adres.trim()) return;
    if (arizaAdresDuzenle || gpsYukleniyor) return;
    const { il, ilce } = parseIlIlce(form.adres);
    const sehir = seciliSehir || il;
    const ilceAd = seciliIlce || ilce;
    if (sehir && !seciliSehir) setSeciliSehir(sehir);
    if (ilceAd && !seciliIlce) setSeciliIlce(ilceAd);
    musteriFormTaslakKaydet({
      v: 1,
      step: "sorun",
      form,
      yasalOnay,
      fotografOnizleme,
      fotografData,
      hedefBilinmiyor,
      ihaleSureTipi,
      ihaleOzelBitis: ihaleOzelBitis || undefined,
    });
    setError("");
    setStep("sorun");
    const yol = musteriKonumYolu(sehir || null, ilceAd || null);
    if (
      typeof window !== "undefined" &&
      yol &&
      window.location.pathname !== yol
    ) {
      window.history.replaceState(window.history.state, "", yol);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when GPS location is ready on konum
  }, [
    step,
    arizaKonumGpsAlindi,
    form.adres,
    arizaAdresDuzenle,
    gpsYukleniyor,
  ]);

  const progressSteps = progressAdimlari(form.sorunTipi, hedefKonumGerekli);
  const progressCurrent =
    Math.max(1, progressSteps.indexOf(step as (typeof progressSteps)[number]) + 1);

  /** Rendered once, reused across whichever bottom nav is mounted for the current step. */
  const flowProgressBar =
    step === "giris" ? null : (
      <FlowProgress
        current={progressCurrent}
        total={progressSteps.length}
        onStepClick={(i) => {
          const hedef = progressSteps[i];
          if (hedef) adimGit(hedef);
        }}
        className="mb-2"
      />
    );

  const adimUstBilgi =
    step === "giris" ? null : (
      <TeklifGeriSayimPill
        step={step}
        progressCurrent={progressCurrent}
        progressTotal={progressSteps.length}
      />
    );

  const seoIcerik = seoIcerikProp ?? anaSayfaSeoIcerik();
  const seoLinkSehir = seoSehirAd || seciliSehir;
  const seoLinkler =
    seoBaglantilar ??
    (seoLinkSehir
      ? seoBolgeBaglantilari(seoLinkSehir)
      : anaSayfaSehirBaglantilari());
  const seoBolgeChip =
    seoBolgeLinkleri ??
    (seoLinkSehir === ISTANBUL_IL
      ? seoLinkler.filter((l) => l.ad !== ISTANBUL_IL)
      : seoLinkler);
  const seoHero =
    seoHeroBaslik ??
    (seoLinkSehir === ISTANBUL_IL ? ISTANBUL_ANA_HERO : seoIcerik.h1);

  const girisEkrani = step === "giris";
  /** YARDIM AL sonrası: sticky alt nav + scrollable main (içerik sığmazsa kaydır) */
  const akisKilitli = !girisEkrani;

  useEffect(() => {
    if (!akisKilitli) return;
    window.scrollTo(0, 0);
    const main = document.querySelector("main");
    if (main instanceof HTMLElement) main.scrollTop = 0;
  }, [step, akisKilitli]);

  function yardimAlBaslat() {
    setError("");
    setKonumSheetAcik(true);
    window.scrollTo(0, 0);
    posthogOlayYakala("yardim_al_tiklandi", {});
    musteriFunnelOlayBirKez(funnelId, "form_adim_giris", {
      props: {},
    });
    /* Konum zaten varsa onay ekranını atla → sorun */
    if (arizaKonumGpsAlindi && form.adres.trim()) {
      adimGit("sorun");
      return;
    }
    adimGit("konum");
    if (gpsGuvenli) {
      void konumAl(false);
    }
  }


  const konumGosterimMetni =
    seciliIlce
      ? seciliIlce
      : seciliSehir
        ? seciliSehir
        : form.adres.trim()
          ? form.adres.split(",")[0]?.trim() || "Konum"
          : "Konum";

  const konumTamMetin =
    seciliIlce && seciliSehir
      ? `${seciliIlce}, ${seciliSehir}`
      : seciliSehir || form.adres;

  const konumHeaderTrailing =
    step === "giris" ? (
      <Btn
        type="button"
        variant="primary"
        onClick={yardimAlBaslat}
        className="!w-auto !min-h-0 !py-1.5 !px-3.5 !text-xs !font-bold !tracking-wider !rounded-[10px]"
      >
        YARDIM AL
      </Btn>
    ) : step !== "konum" ? (
      <button
        type="button"
        onClick={konumuDegistir}
        title={`Konumu değiştir: ${konumTamMetin}`}
        className="group inline-flex max-w-[10rem] sm:max-w-[14rem] items-center gap-1.5 rounded-full border border-[#9ee3b2] bg-[#eaf8ee] px-2.5 py-1 text-[10px] sm:text-[11px] font-bold text-[#0b4e1e] shadow-[0_2px_8px_rgba(8,155,45,0.14)] transition-all duration-200 hover:border-[#089b2d] hover:bg-[#d5f3dc] hover:shadow-[0_4px_12px_rgba(8,155,45,0.22)] active:scale-95 touch-manipulation shrink-0"
      >
        <MapPin className="size-3 shrink-0 text-[#089b2d] transition-transform group-hover:scale-110" strokeWidth={2.5} />
        <span className="truncate tracking-tight">{konumGosterimMetni}</span>
      </button>
    ) : null;

  /** Derived purely for the step-content enter animation direction — read-only, doesn't affect step/nav logic. */
  if (prevStepForAnimRef.current !== step) {
    const prevIndex = TUM_ADIMLAR.indexOf(prevStepForAnimRef.current);
    const nextIndex = TUM_ADIMLAR.indexOf(step);
    stepAnimDirectionRef.current = nextIndex >= prevIndex ? "forward" : "backward";
    prevStepForAnimRef.current = step;
  }

  return (
    <MobileShell
      hideHeader
      showBrand={false}
      lockViewport={akisKilitli}
      footer={girisEkrani ? <YasalSiteFooter /> : undefined}
    >

      <OpeningLogo
        forceDocked={!girisEkrani}
        scrollDock={girisEkrani}
        heroReady={heroReady}
        onClick={() => {
          setStep("giris");
          setKonumSheetAcik(false);
          setError("");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        center={adimUstBilgi}
        trailing={konumHeaderTrailing}
      />
      <div key={step} data-direction={stepAnimDirectionRef.current} className="acb-step-transition">
      {step === "konum" && !arizaKonumGpsAlindi ? (
        <AcilYardimStickyCta
          progress={flowProgressBar}
          onGeri={oncekiAdimaDon}
          label={
            konumBasarisiz || (seciliSehir && seciliIlce) || !gpsGuvenli
              ? "Devam et"
              : ACB_CTA.konumOtomatikAl
          }
          onClick={() => {
            setError("");
            const manuelHazir = !!(seciliSehir && seciliIlce);
            if (
              manuelHazir ||
              konumBasarisiz ||
              !gpsGuvenli
            ) {
              if (!manuelHazir) {
                setKonumSheetAcik(true);
                setError("Şehir ve ilçe seçin.");
                return;
              }
              void konumManuelDevam();
              return;
            }
            void konumAl(false);
          }}
          disabled={gpsYukleniyor || adresGeocodeYukleniyor}
          yukleniyor={gpsYukleniyor}
        />
      ) : null}
      {step === "giris" && (
        <>
          <EmergencyHero onHeroReady={setHeroReady} onYardimAl={yardimAlBaslat} />
          <div className="mt-10 space-y-8 border-t border-[var(--acb-border)] pt-8">
            <div id="nasil-calisir" className="scroll-mt-[calc(4.75rem+env(safe-area-inset-top))]">
              <AnaSayfaOzellikSeridi />
            </div>
            <CustomerTestimonialSection />
            <AnaSayfaFiyatHesaplamaTeaser />
            <AnaSayfaHizmetVerCta />
            {!varsayilanSehir ? <AnaSayfaHizliBaglantilar /> : null}
            <SehirSeoIcerikBolumu
              sehirAd={seoLinkSehir || ISTANBUL_IL}
              icerik={seoIcerik}
              heroBaslik={seoHero}
              baglantilar={seoLinkler}
              bolgeLinkleri={seoBolgeChip}
              yogunluk={varsayilanSehir ? "kompakt" : "genis"}
              ozetGoster={!varsayilanSehir}
            />
          </div>
        </>
      )}

      {error &&
        step !== "giris" &&
        step !== "sorun" &&
        step !== "konum" &&
        step !== "telefon" && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {bilgiMesaj &&
        (step === "konum" || step === "hedef" || DETAY_ALT_ADIMLARI.includes(step)) && (
        <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
          {bilgiMesaj}
        </div>
      )}

      {step === "sorun" && (
        <div className="space-y-5 animate-fade-in">
          <div className="space-y-1">
            <h2 className="text-[1.75rem] sm:text-3xl font-bold leading-[1.12] tracking-tight text-[var(--acb-dark)]">
              Nasıl yardımcı olalım?
            </h2>
            <p className="text-sm text-[var(--acb-muted)] leading-snug">
              Bir hizmet seç — devam edelim.
            </p>
            {form.adres ? (
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--acb-dark)]">
                <AcbIcons.location
                  className="size-3.5 shrink-0 text-[var(--acb-green)]"
                  strokeWidth={ACB_ICON_STROKE}
                  aria-hidden
                />
                <span>{form.adres}</span>
              </p>
            ) : null}
          </div>
          <SorunSecimi
            seciliTip={form.sorunTipi}
            detay={form.sorunDetay}
            izgara
            onTipSec={(id) => {
              if (sorunDevamTimerRef.current != null) {
                window.clearTimeout(sorunDevamTimerRef.current);
                sorunDevamTimerRef.current = null;
              }
              update("sorunTipi", id);
              if (id !== "lastik") {
                update("lastikDurumu", "");
              }
              if (id !== "yakit") {
                update("yakitTipi", "");
              }
              if (id !== "kilit") {
                update("kilitDurumu", "");
              }
              /* Timer adimGit stale form görmesin — ref’i hemen güncelle */
              const formAnlik = {
                ...taslakAnlikRef.current.form,
                sorunTipi: id,
                lastikDurumu: id === "lastik" ? taslakAnlikRef.current.form.lastikDurumu : "",
                yakitTipi: id === "yakit" ? taslakAnlikRef.current.form.yakitTipi : "",
                kilitDurumu: id === "kilit" ? taslakAnlikRef.current.form.kilitDurumu : "",
              };
              taslakAnlikRef.current = {
                ...taslakAnlikRef.current,
                form: formAnlik,
              };
              posthogOlayYakala("sorun_secildi", { sorun_tipi: id });
              musteriFunnelOlayBirKez(funnelId, "service_selected", {
                props: { sorun_tipi: id },
              });
              musteriFunnelOlayBirKez(funnelId, "form_adim_sorun", {
                props: { sorun_tipi: id },
                analitik: false,
              });
              const label = sorunTipiBul(id)?.label ?? id;
              tiktokPixelSearch({
                search_string: label,
                content_id: id,
                content_name: label,
              });
              setError("");
              /* update async — sonraki adımı yeni tip ile hesapla */
              const sirasi = aktifAdimlar(
                id,
                sorunHedefKonumGerekliMi(id)
              );
              const idx = sirasi.indexOf("sorun");
              const sonraki =
                idx >= 0 && idx < sirasi.length - 1 ? sirasi[idx + 1]! : null;
              if (sonraki) {
                sorunDevamTimerRef.current = window.setTimeout(() => {
                  sorunDevamTimerRef.current = null;
                  adimGit(sonraki);
                }, ADIM_OTOMATIK_GECIS_MS);
              }
            }}
            onDetayChange={(v) => update("sorunDetay", v)}
            sadeceTipSecimi
          />
          <StepTestimonialCard step="sorun" />
          <AdimAltNav
            progress={flowProgressBar}
            devamMetin={form.sorunTipi ? "Devam et" : "Önce hizmet seç"}
            devamDisabled={!form.sorunTipi}
            onGeri={konumuDegistir}
            onDevam={() => {
              if (sorunDevamTimerRef.current != null) {
                window.clearTimeout(sorunDevamTimerRef.current);
                sorunDevamTimerRef.current = null;
              }
              if (!form.sorunTipi) {
                setError("Lütfen bir hizmet seçin.");
                return;
              }
              setError("");
              const sonraki = sonrakiAdim("sorun");
              if (sonraki) adimGit(sonraki);
            }}
          />
        </div>
      )}

      {step === "kilit_durumu" && (
        <div className="space-y-5 animate-fade-in">
          <div className="space-y-1">
            <h2 className="text-[1.75rem] sm:text-3xl font-bold leading-[1.12] tracking-tight text-[var(--acb-dark)]">
              Kilit durumu
            </h2>
            <p className="text-sm text-[var(--acb-muted)] leading-snug">
              Durumu seçin — zorunlu.
            </p>
          </div>
          <div
            className="grid grid-cols-1 gap-2"
            role="listbox"
            aria-label="Kilit durumu"
          >
            {KILIT_DURUMLARI.map((d) => {
              const secili = form.kilitDurumu === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  role="option"
                  aria-selected={secili}
                  onClick={() => {
                    if (kilitDurumuDevamTimerRef.current != null) {
                      window.clearTimeout(kilitDurumuDevamTimerRef.current);
                      kilitDurumuDevamTimerRef.current = null;
                    }
                    setKilitDurumuHatasi(false);
                    setError("");
                    if (secili) {
                      update("kilitDurumu", "");
                      return;
                    }
                    update("kilitDurumu", d.id);
                    kilitDurumuDevamTimerRef.current = window.setTimeout(() => {
                      kilitDurumuDevamTimerRef.current = null;
                      const sonraki = sonrakiAdim("kilit_durumu");
                      if (sonraki) adimGit(sonraki);
                    }, ADIM_OTOMATIK_GECIS_MS);
                  }}
                  className={`w-full text-left rounded-[var(--acb-radius-lg)] border px-4 py-3.5 flex items-center gap-2 transition-[border-color,background-color,box-shadow,transform] duration-200 active:duration-100 ease-out touch-manipulation hover:-translate-y-px active:translate-y-0 active:scale-[0.99] ${
                    secili
                      ? "border-[var(--acb-green)] bg-[var(--acb-soft)] ring-2 ring-[color-mix(in_srgb,var(--acb-green)_30%,transparent)] shadow-[var(--acb-shadow-lg)]"
                      : kilitDurumuHatasi
                        ? "border-red-400 bg-white"
                        : "border-[var(--acb-border)] bg-white hover:border-[color-mix(in_srgb,var(--acb-green)_45%,white)] shadow-[var(--acb-shadow)] hover:shadow-[var(--acb-shadow-lg)]"
                  }`}
                >
                  <span className="font-semibold text-sm flex-1 min-w-0 text-[var(--acb-dark)]">
                    {d.etiket}
                  </span>
                  {secili ? (
                    <AcbIcons.check
                      className="size-4 shrink-0 text-[var(--acb-green)]"
                      strokeWidth={ACB_ICON_STROKE}
                      aria-hidden
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
          {kilitDurumuHatasi && (
            <p className="text-sm text-red-600" role="alert">
              Kilit durumunu seçin.
            </p>
          )}
          <StepTestimonialCard step="kilit_durumu" />
          <AdimAltNav
            progress={flowProgressBar}
            devamMetin="Devam et"
            devamGlow={!!form.kilitDurumu}
            onGeri={oncekiAdimaDon}
            onDevam={() => {
              if (kilitDurumuDevamTimerRef.current != null) {
                window.clearTimeout(kilitDurumuDevamTimerRef.current);
                kilitDurumuDevamTimerRef.current = null;
              }
              if (!kilitDurumuAdimiDevam()) return;
              const sonraki = sonrakiAdim("kilit_durumu");
              if (sonraki) adimGit(sonraki);
            }}
          />
        </div>
      )}

      {step === "yakit_tipi" && (
        <div className="space-y-5 animate-fade-in">
          <div className="space-y-1">
            <h2 className="text-[1.75rem] sm:text-3xl font-bold leading-[1.12] tracking-tight text-[var(--acb-dark)]">
              Yakıt tipi
            </h2>
            <p className="text-sm text-[var(--acb-muted)] leading-snug">
              Aracınızın yakıt / şarj tipini seçin — zorunlu.
            </p>
          </div>
          <div
            className="grid grid-cols-1 gap-2"
            role="listbox"
            aria-label="Yakıt tipi"
          >
            {YAKIT_TIPLERI.map((d) => {
              const secili = form.yakitTipi === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  role="option"
                  aria-selected={secili}
                  onClick={() => {
                    if (yakitTipiDevamTimerRef.current != null) {
                      window.clearTimeout(yakitTipiDevamTimerRef.current);
                      yakitTipiDevamTimerRef.current = null;
                    }
                    setYakitTipiHatasi(false);
                    setError("");
                    if (secili) {
                      update("yakitTipi", "");
                      return;
                    }
                    update("yakitTipi", d.id);
                    yakitTipiDevamTimerRef.current = window.setTimeout(() => {
                      yakitTipiDevamTimerRef.current = null;
                      const sonraki = sonrakiAdim("yakit_tipi");
                      if (sonraki) adimGit(sonraki);
                    }, ADIM_OTOMATIK_GECIS_MS);
                  }}
                  className={`w-full text-left rounded-[var(--acb-radius-lg)] border px-4 py-3.5 flex items-center gap-2 transition-[border-color,background-color,box-shadow,transform] duration-200 active:duration-100 ease-out touch-manipulation hover:-translate-y-px active:translate-y-0 active:scale-[0.99] ${
                    secili
                      ? "border-[var(--acb-green)] bg-[var(--acb-soft)] ring-2 ring-[color-mix(in_srgb,var(--acb-green)_30%,transparent)] shadow-[var(--acb-shadow-lg)]"
                      : yakitTipiHatasi
                        ? "border-red-400 bg-white"
                        : "border-[var(--acb-border)] bg-white hover:border-[color-mix(in_srgb,var(--acb-green)_45%,white)] shadow-[var(--acb-shadow)] hover:shadow-[var(--acb-shadow-lg)]"
                  }`}
                >
                  <span className="font-semibold text-sm flex-1 min-w-0 text-[var(--acb-dark)]">
                    {d.etiket}
                  </span>
                  {secili ? (
                    <AcbIcons.check
                      className="size-4 shrink-0 text-[var(--acb-green)]"
                      strokeWidth={ACB_ICON_STROKE}
                      aria-hidden
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
          {yakitTipiHatasi && (
            <p className="text-sm text-red-600" role="alert">
              Yakıt tipini seçin.
            </p>
          )}
          <StepTestimonialCard step="yakit_tipi" />
          <AdimAltNav
            progress={flowProgressBar}
            devamMetin="Devam et"
            devamGlow={!!form.yakitTipi}
            onGeri={oncekiAdimaDon}
            onDevam={() => {
              if (yakitTipiDevamTimerRef.current != null) {
                window.clearTimeout(yakitTipiDevamTimerRef.current);
                yakitTipiDevamTimerRef.current = null;
              }
              if (!yakitTipiAdimiDevam()) return;
              const sonraki = sonrakiAdim("yakit_tipi");
              if (sonraki) adimGit(sonraki);
            }}
          />
        </div>
      )}

      {step === "lastik_durumu" && (
        <div className="space-y-5 animate-fade-in">
          <div className="space-y-1">
            <h2 className="text-[1.75rem] sm:text-3xl font-bold leading-[1.12] tracking-tight text-[var(--acb-dark)]">
              Lastik durumu
            </h2>
            <p className="text-sm text-[var(--acb-muted)] leading-snug">
              Lastiğin durumunu seçin — zorunlu.
            </p>
          </div>
          <div
            className="grid grid-cols-1 gap-3"
            role="listbox"
            aria-label="Lastik durumu"
          >
            {LASTIK_DURUMLARI.map((d) => {
              const secili = form.lastikDurumu === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  role="option"
                  aria-selected={secili}
                  onClick={() => {
                    if (lastikDurumuDevamTimerRef.current != null) {
                      window.clearTimeout(lastikDurumuDevamTimerRef.current);
                      lastikDurumuDevamTimerRef.current = null;
                    }
                    setLastikDurumuHatasi(false);
                    setError("");
                    if (secili) {
                      update("lastikDurumu", "");
                      return;
                    }
                    update("lastikDurumu", d.id);
                    lastikDurumuDevamTimerRef.current = window.setTimeout(() => {
                      lastikDurumuDevamTimerRef.current = null;
                      const sonraki = sonrakiAdim("lastik_durumu");
                      if (sonraki) adimGit(sonraki);
                    }, ADIM_OTOMATIK_GECIS_MS);
                  }}
                  className={`w-full text-left rounded-[var(--acb-radius-lg)] border px-4.5 py-4 flex items-center justify-between gap-3 transition-[border-color,background-color,box-shadow,transform] duration-200 active:duration-100 ease-out touch-manipulation hover:-translate-y-px active:translate-y-0 active:scale-[0.99] ${
                    secili
                      ? "border-[var(--acb-green)] bg-[var(--acb-soft)] ring-2 ring-[color-mix(in_srgb,var(--acb-green)_30%,transparent)] shadow-[var(--acb-shadow-lg)]"
                      : lastikDurumuHatasi
                        ? "border-red-400 bg-white"
                        : "border-[var(--acb-border)] bg-white hover:border-[color-mix(in_srgb,var(--acb-green)_45%,white)] shadow-[var(--acb-shadow)] hover:shadow-[var(--acb-shadow-lg)]"
                  }`}
                >
                  <span
                    className="font-semibold text-base flex-1 min-w-0 text-[var(--acb-dark)]"
                  >
                    {d.etiket}
                  </span>
                  {secili ? (
                    <AcbIcons.check
                      className="size-5 shrink-0 text-[var(--acb-green)]"
                      strokeWidth={ACB_ICON_STROKE}
                      aria-hidden
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
          <div
            className="rounded-[var(--acb-radius-lg)] border border-[var(--acb-warn-border)] bg-[var(--acb-warn-soft)] px-4 py-3 text-sm text-[var(--acb-dark)] leading-relaxed"
            role="note"
          >
            {LASTIK_DURUMU_BILGI}
          </div>
          {lastikDurumuHatasi && (
            <p className="text-sm text-red-600" role="alert">
              Lastik durumunu seçin.
            </p>
          )}
          <StepTestimonialCard step="lastik_durumu" />
          <AdimAltNav
            progress={flowProgressBar}
            devamMetin="Devam et"
            devamGlow={!!form.lastikDurumu}
            onGeri={oncekiAdimaDon}
            onDevam={() => {
              if (lastikDurumuDevamTimerRef.current != null) {
                window.clearTimeout(lastikDurumuDevamTimerRef.current);
                lastikDurumuDevamTimerRef.current = null;
              }
              if (!lastikDurumuAdimiDevam()) return;
              const sonraki = sonrakiAdim("lastik_durumu");
              if (sonraki) adimGit(sonraki);
            }}
          />
        </div>
      )}

      {step === "fotograf" && (
        <div className="space-y-4 animate-fade-in">
          <div className="space-y-1">
            <h2 className="text-[1.75rem] sm:text-3xl font-bold leading-[1.12] tracking-tight text-[var(--acb-dark)]">
              Araç ve Arıza Fotoğrafı
            </h2>
            <p className="text-sm text-[var(--acb-muted)] leading-snug">
              Araç ve arıza fotoğrafı yükleyiniz — çekici doğru teklif verebilsin.
            </p>
          </div>
          <div ref={fotografRef} className="scroll-mt-44 space-y-3">
            <ArizaFotografAlani
              fotograflar={fotografData.length ? fotografData : fotografOnizleme}
              invalid={fotografHatasi}
              onDegisti={(urls) => {
                setFotografOnizleme(urls);
                setFotografData(urls);
                if (urls.length) setFotografHatasi(false);
              }}
            />
            {fotografHatasi && (
              <p className="text-sm text-red-600 mt-1" role="alert">
                Araç ve arıza fotoğrafı zorunludur — çekici doğru teklif
                verebilsin.
              </p>
            )}
            {!fotografHatasi && (
              <p className="text-sm text-slate-500 text-center leading-snug">
                Fotoğrafsız devam edebilirsiniz.
              </p>
            )}
          </div>
          <StepTestimonialCard step="fotograf" />
          <AdimAltNav
            progress={flowProgressBar}
            devamMetin={
              fotografData.length || fotografOnizleme.length
                ? "Devam et"
                : "Fotoğrafsız devam et"
            }
            onGeri={oncekiAdimaDon}
            onDevam={() => {
              if (!fotografAdimiDevam()) return;
              const sonraki = sonrakiAdim("fotograf");
              if (sonraki) adimGit(sonraki);
            }}
          />
        </div>
      )}

      {step === "arac_tipi" && (
        <div className="flex min-h-[calc(100dvh-10.5rem)] flex-col gap-1.5 animate-fade-in">
          <div className="shrink-0 space-y-1">
            <h2 className="text-[1.75rem] sm:text-3xl font-bold leading-[1.12] tracking-tight text-[var(--acb-dark)]">Araç Tipi</h2>
            <p className="text-sm text-[var(--acb-muted)] leading-snug">
              Aracınızın tipini seçin (isteğe bağlı).
            </p>
          </div>
          <div
            className="grid flex-1 auto-rows-fr grid-cols-3 content-stretch gap-2 [@media(min-height:740px)]:grid-cols-2 [@media(min-height:740px)]:gap-2.5"
            role="listbox"
            aria-label="Araç tipi"
          >
            {ARAC_TIPLERI.map((t) => {
              const secili = form.aracTipi === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="option"
                  aria-selected={secili}
                  onClick={() => {
                    if (aracTipiDevamTimerRef.current != null) {
                      window.clearTimeout(aracTipiDevamTimerRef.current);
                      aracTipiDevamTimerRef.current = null;
                    }
                    if (secili) {
                      update("aracTipi", "");
                      return;
                    }
                    update("aracTipi", t.id);
                    aracTipiDevamTimerRef.current = window.setTimeout(() => {
                      aracTipiDevamTimerRef.current = null;
                      const sonraki = sonrakiAdim("arac_tipi");
                      if (sonraki) adimGit(sonraki);
                    }, ADIM_OTOMATIK_GECIS_MS);
                  }}
                  className={`flex h-full min-h-[6.25rem] w-full flex-col items-center justify-center gap-2 rounded-[var(--acb-radius-lg)] border px-2 py-3 text-center transition-[border-color,background-color,box-shadow,transform] duration-200 active:duration-100 ease-out touch-manipulation hover:-translate-y-px active:translate-y-0 [@media(min-height:740px)]:min-h-[7.25rem] ${
                    secili
                      ? "border-[var(--acb-green)] bg-[var(--acb-soft)] ring-2 ring-[color-mix(in_srgb,var(--acb-green)_30%,transparent)] shadow-[var(--acb-shadow-lg)]"
                      : "border-[var(--acb-border)] bg-white shadow-[var(--acb-shadow)] hover:border-[color-mix(in_srgb,var(--acb-green)_45%,white)] hover:shadow-[var(--acb-shadow-lg)]"
                  }`}
                >
                  <span
                    className={`inline-flex size-14 items-center justify-center [@media(min-height:740px)]:size-[4.25rem] ${
                      secili
                        ? "text-[var(--acb-green)]"
                        : "text-[var(--acb-muted)]"
                    }`}
                  >
                    <AracTipiIkon
                      tip={t.id}
                      className="size-14 [@media(min-height:740px)]:size-[4.25rem]"
                    />
                  </span>
                  <span className="px-0.5 text-xs font-medium leading-tight text-[var(--acb-dark)] [@media(min-height:740px)]:text-[13px]">
                    {t.etiket}
                  </span>
                </button>
              );
            })}
          </div>
          <StepTestimonialCard step="arac_tipi" />
          <AdimAltNav
            progress={flowProgressBar}
            devamMetin="Devam et"
            onGeri={oncekiAdimaDon}
            onDevam={() => {
              if (aracTipiDevamTimerRef.current != null) {
                window.clearTimeout(aracTipiDevamTimerRef.current);
                aracTipiDevamTimerRef.current = null;
              }
              const sonraki = sonrakiAdim("arac_tipi");
              if (sonraki) adimGit(sonraki);
            }}
          />
        </div>
      )}

      {step === "arac_modeli" && (
        <div className="space-y-5 animate-fade-in">
          <div className="space-y-1">
            <h2 className="text-[1.75rem] sm:text-3xl font-bold leading-[1.12] tracking-tight text-[var(--acb-dark)]">
              Aracın hangisi?
            </h2>
            <p className="text-sm text-[var(--acb-muted)] leading-snug">
              Marka ve model yeterli.
            </p>
          </div>
          <div ref={aracModeliRef} className="space-y-3 scroll-mt-44">
            <Field
              label="Marka"
              placeholder="Örn. Renault"
              value={aracMarka}
              onChange={(e) => {
                const marka = e.target.value;
                setAracMarka(marka);
                update(
                  "aracModeli",
                  [marka.trim(), aracModelOnly.trim()]
                    .filter(Boolean)
                    .join(" ")
                );
              }}
              ref={(el) => {
                if (!el) return;
                el.focus({ preventScroll: true });
              }}
            />
            <Field
              label="Model"
              placeholder="Örn. Clio"
              value={aracModelOnly}
              onChange={(e) => {
                const model = e.target.value;
                setAracModelOnly(model);
                update(
                  "aracModeli",
                  [aracMarka.trim(), model.trim()].filter(Boolean).join(" ")
                );
              }}
              invalid={aracModeliHatasi}
            />
          </div>
          <StepTestimonialCard step="arac_modeli" />
          <AdimAltNav
            progress={flowProgressBar}
            devamMetin="Devam et"
            onGeri={oncekiAdimaDon}
            onDevam={() => {
              if (!aracModeliAdimiDevam()) return;
              const sonraki = sonrakiAdim("arac_modeli");
              if (sonraki) adimGit(sonraki);
            }}
          />
        </div>
      )}

      {step === "arac_durumu" && (
        <div className="space-y-4 animate-fade-in">
          <div className="space-y-1">
            <h2 className="text-[1.75rem] sm:text-3xl font-bold leading-[1.12] tracking-tight text-[var(--acb-dark)]">Aracın Durumu</h2>
            <p className="text-sm text-[var(--acb-muted)] leading-snug">
              Çekici doğru ekipmanla gelsin — aracın durumunu seçin.
            </p>
          </div>
          <div
            className="grid grid-cols-1 gap-3 scroll-mt-44"
            role="listbox"
            aria-label="Araç durumu"
          >
            {ARAC_DURUMLARI.map((d) => {
              const secili = form.aracDurumu === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  role="option"
                  aria-selected={secili}
                  onClick={() => {
                    if (aracDurumuDevamTimerRef.current != null) {
                      window.clearTimeout(aracDurumuDevamTimerRef.current);
                      aracDurumuDevamTimerRef.current = null;
                    }
                    setAracDurumuHatasi(false);
                    setError("");
                    if (secili) {
                      update("aracDurumu", "");
                      return;
                    }
                    update("aracDurumu", d.id);
                    aracDurumuDevamTimerRef.current = window.setTimeout(() => {
                      aracDurumuDevamTimerRef.current = null;
                      const sonraki = sonrakiAdim("arac_durumu");
                      if (sonraki) adimGit(sonraki);
                    }, ADIM_OTOMATIK_GECIS_MS);
                  }}
                  className={`w-full text-left rounded-[var(--acb-radius-lg)] border px-4.5 py-4 flex items-center justify-between gap-3 transition-[border-color,background-color,box-shadow,transform] duration-200 active:duration-100 ease-out touch-manipulation hover:-translate-y-px active:translate-y-0 active:scale-[0.99] ${
                    secili
                      ? "border-[var(--acb-green)] bg-[var(--acb-soft)] ring-2 ring-[color-mix(in_srgb,var(--acb-green)_30%,transparent)] shadow-[var(--acb-shadow-lg)]"
                      : aracDurumuHatasi
                        ? "border-red-400 bg-white"
                        : "border-[var(--acb-border)] bg-white hover:border-[color-mix(in_srgb,var(--acb-green)_45%,white)] shadow-[var(--acb-shadow)] hover:shadow-[var(--acb-shadow-lg)]"
                  }`}
                >
                  <span
                    className="font-semibold text-base flex-1 min-w-0 text-[var(--acb-dark)]"
                  >
                    {d.etiket}
                  </span>
                  {secili ? (
                    <AcbIcons.check
                      className="size-5 shrink-0 text-[var(--acb-green)]"
                      strokeWidth={ACB_ICON_STROKE}
                      aria-hidden
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
          {aracDurumuHatasi && (
            <p className="text-sm text-red-600" role="alert">
              Araç durumunu seçin.
            </p>
          )}
          <StepTestimonialCard step="arac_durumu" />
          <AdimAltNav
            progress={flowProgressBar}
            devamMetin="Devam et"
            devamGlow={!!form.aracDurumu}
            onGeri={oncekiAdimaDon}
            onDevam={() => {
              if (aracDurumuDevamTimerRef.current != null) {
                window.clearTimeout(aracDurumuDevamTimerRef.current);
                aracDurumuDevamTimerRef.current = null;
              }
              if (!aracDurumuAdimiDevam()) return;
              const sonraki = sonrakiAdim("arac_durumu");
              if (sonraki) adimGit(sonraki);
            }}
          />
        </div>
      )}

      {step === "ek_detay" && (
        <div className="space-y-5 animate-fade-in">
          <div className="space-y-1">
            <h2 className="text-[1.75rem] sm:text-3xl font-bold leading-[1.12] tracking-tight text-[var(--acb-dark)]">
              Teklif Notu
            </h2>
            <p className="text-sm text-[var(--acb-muted)] leading-snug">
              Çekiciye iletilecek kısa not — doğru teklif için yardımcı olur.
            </p>
          </div>

          {form.sorunTipi === "diger" ? (
            <label className="block space-y-1.5">
              <span
                className={`text-sm font-medium ${sorunDetayHatasi ? "text-red-700" : "text-slate-700"}`}
              >
                Sorununuzu açıklayın
              </span>
              <textarea
                ref={(el) => {
                  if (!el) return;
                  /* autoFocus ortayı kaydırır; üstte kalsın */
                  el.focus({ preventScroll: true });
                }}
                rows={4}
                placeholder={sorunTeklifNotuPlaceholder(form.sorunTipi)}
                value={form.sorunDetay}
                onChange={(e) => update("sorunDetay", e.target.value)}
                aria-invalid={sorunDetayHatasi || undefined}
                className={`w-full rounded-[var(--acb-radius)] bg-white border px-4 py-3.5 text-slate-900 placeholder:text-slate-400 shadow-[inset_0_1px_2px_rgba(27,45,42,0.035)] transition-[box-shadow,border-color] duration-200 ease-out focus:shadow-none focus:outline-none focus:ring-2 resize-none whitespace-pre-line ${
                  sorunDetayHatasi
                    ? "border-red-500 ring-red-500/30 focus:ring-red-500/40"
                    : "border-slate-200 focus:ring-amber-500/40 focus:border-amber-500"
                }`}
              />
              {sorunDetayHatasi && (
                <p className="text-sm text-red-600" role="alert">
                  Sorun açıklaması zorunludur.
                </p>
              )}
            </label>
          ) : (
            <TextArea
              placeholder={sorunTeklifNotuPlaceholder(form.sorunTipi)}
              value={form.sorunDetay}
              onChange={(e) => update("sorunDetay", e.target.value)}
              rows={4}
              className="whitespace-pre-line"
              aria-label="Teklif notu"
            />
          )}

          {form.sorunTipi !== "diger" && (
            <p className="text-sm text-slate-500 text-center leading-snug">
              Burayı doldurmadan ilerleyebilirsiniz.
            </p>
          )}

          <StepTestimonialCard step="ek_detay" />
          <AdimAltNav
            progress={flowProgressBar}
            devamMetin="Devam et"
            onGeri={oncekiAdimaDon}
            onDevam={() => {
              if (!ekDetayAdimiDevam()) return;
              const sonraki = sonrakiAdim("ek_detay");
              if (sonraki) adimGit(sonraki);
            }}
          />
        </div>
      )}

      {step === "ihale" && (
        <div className="space-y-4 animate-fade-in">
          <div className="space-y-1">
            <h2 className="text-[1.75rem] sm:text-3xl font-bold leading-[1.12] tracking-tight text-[var(--acb-dark)]">İhale Süresi</h2>
            <p className="text-sm text-[var(--acb-muted)] leading-snug">
              Teklif toplama süresini seçin — süre dolunca en uygun teklifi seçersiniz.
            </p>
          </div>

          <IhaleSureSecimi
            value={ihaleSureTipi}
            ozelBitis={ihaleOzelBitis}
            invalid={ihaleSureHatasi}
            onChange={(tip, ozel) => {
              setIhaleSureTipi(tip);
              setIhaleOzelBitis(ozel);
              setIhaleSureHatasi(false);
              if (ihaleDevamTimerRef.current != null) {
                window.clearTimeout(ihaleDevamTimerRef.current);
                ihaleDevamTimerRef.current = null;
              }
              // Özel tarih: kullanıcı bitiş seçene kadar otomatik devam yok
              if (tip === "ozel") return;
              ihaleDevamTimerRef.current = window.setTimeout(() => {
                ihaleDevamTimerRef.current = null;
                const sure = ihaleBitisHesapla(tip, { ozelBitis: ozel });
                if (!sure.ok) {
                  setIhaleSureHatasi(true);
                  setError(sure.hata);
                  return;
                }
                const sonraki = sonrakiAdim("ihale");
                if (sonraki) adimGit(sonraki);
              }, ADIM_OTOMATIK_GECIS_MS);
            }}
          />

          <StepTestimonialCard step="ihale" />
          <AdimAltNav
            progress={flowProgressBar}
            devamMetin="Devam Et"
            devamDisabled={loading}
            onGeri={oncekiAdimaDon}
            onDevam={() => {
              if (ihaleDevamTimerRef.current != null) {
                window.clearTimeout(ihaleDevamTimerRef.current);
                ihaleDevamTimerRef.current = null;
              }
              if (!ihaleAdimiDevam()) return;
              const sonraki = sonrakiAdim("ihale");
              if (sonraki) adimGit(sonraki);
            }}
          />
        </div>
      )}

      {step === "konum" && (
        <div className="space-y-5 animate-fade-in">
          <div className="space-y-1">
            <h2 className="text-[1.75rem] sm:text-3xl font-bold leading-[1.12] tracking-tight text-[var(--acb-dark)]">
              Önce konumunu bulalım.
            </h2>
            <p className="text-sm text-[var(--acb-muted)] leading-snug">
              Bulunduğunuz şehir ve ilçeyi seçin.
            </p>
          </div>
          {arizaKonumGpsAlindi && form.adres ? (
            <Card className="!bg-[var(--acb-soft)] !border-[color-mix(in_srgb,var(--acb-green)_35%,white)] !rounded-[var(--acb-radius-lg)]">
              <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--acb-green)]">
                <AcbIcons.location
                  className="size-3.5"
                  strokeWidth={ACB_ICON_STROKE}
                  aria-hidden
                />
                Konumunuz
              </p>
              <p className="text-sm font-semibold text-[var(--acb-dark)] leading-relaxed">
                {form.adres}
              </p>
              {(seciliIlce || seciliSehir) && (
                <p className="mt-1 text-xs text-[var(--acb-muted)]">
                  {[seciliIlce, seciliSehir].filter(Boolean).join(", ")}
                </p>
              )}
              <button
                type="button"
                onClick={() => {
                  gpsIptal();
                  setGpsYukleniyor(false);
                  setArizaAdresDuzenle(true);
                  const { il, ilce } = parseIlIlce(form.adres);
                  const sehirKorunan =
                    seciliSehir.trim() || il || varsayilanSehir || "";
                  const ilceKorunan =
                    seciliIlce.trim() || ilce || varsayilanIlce || "";
                  setForm((f) => ({
                    ...f,
                    lat: 0,
                    lng: 0,
                    adres: "",
                    konumKaynak: undefined,
                  }));
                  setSeciliSehir(sehirKorunan);
                  setSeciliIlce(ilceKorunan);
                  setError("");
                  setBilgiMesaj("");
                  setKonumBasarisiz(false);
                }}
                className="mt-2 min-h-[var(--acb-touch)] text-sm text-[var(--acb-dark)] underline font-semibold touch-manipulation"
              >
                Konumu değiştir
              </button>
            </Card>
          ) : (
            <div className="space-y-3">
              {!gpsGuvenli ? <GpsHttpsBanner compact /> : null}

              <div className="rounded-[var(--acb-radius-lg)] border border-[var(--acb-border)] bg-white px-3.5 py-3.5 space-y-2.5 shadow-[var(--acb-shadow-lg)]">
                  <p className="text-sm font-semibold text-[var(--acb-dark)]">
                    {ACB_CTA.adresAra}
                  </p>
                  <div className="space-y-2.5">
                    <div className="min-w-0 space-y-1.5">
                      <span className="block text-sm font-semibold text-slate-800">
                        Şehriniz
                      </span>
                      <div className="relative">
                        {!seciliSehir ? (
                          <span
                            className="pointer-events-none absolute -inset-1 rounded-xl bg-[var(--acb-green)]/30 blur-md animate-pulse"
                            aria-hidden
                          />
                        ) : null}
                        <CustomSelect
                          aria-label="Şehir"
                          placeholder="Şehir seçin"
                          searchPlaceholder="Şehir ara…"
                          className={[
                            "!py-2.5 !px-3 text-[0.9375rem]",
                            !seciliSehir ? KONUM_SELECT_GLOW : "",
                          ].join(" ")}
                          value={seciliSehir}
                          options={illerSecimSirasi(
                            acikIller.length > 0
                              ? acikIller
                              : [...KULLANIMA_ACIK_ILLER]
                          )}
                          onChange={(il) => {
                            if (ilceDevamTimerRef.current != null) {
                              window.clearTimeout(ilceDevamTimerRef.current);
                              ilceDevamTimerRef.current = null;
                            }
                            setSeciliSehir(il);
                            setSeciliIlce("");
                            setError("");
                          }}
                        />
                      </div>
                    </div>
                    <div
                      className={`min-w-0 space-y-1.5 transition-opacity ${
                        seciliSehir ? "" : "opacity-60"
                      }`}
                    >
                      <span
                        className={`block text-sm font-semibold ${
                          seciliSehir ? "text-slate-800" : "text-slate-400"
                        }`}
                      >
                        İlçeniz
                      </span>
                      <div className="relative">
                        {seciliSehir && !seciliIlce ? (
                          <span
                            className="pointer-events-none absolute -inset-1 rounded-xl bg-[var(--acb-green)]/30 blur-md animate-pulse"
                            aria-hidden
                          />
                        ) : null}
                        <CustomSelect
                          aria-label="İlçe"
                          placeholder={seciliSehir ? "İlçe seçin" : "Önce şehir"}
                          searchPlaceholder="İlçe ara…"
                          disabled={!seciliSehir}
                          className={[
                            "!py-2.5 !px-3 text-[0.9375rem]",
                            seciliSehir && !seciliIlce ? KONUM_SELECT_GLOW : "",
                          ].join(" ")}
                          value={seciliIlce}
                          options={seciliSehir ? ilceListesi(seciliSehir) : []}
                          onChange={(ilce) => {
                            if (ilceDevamTimerRef.current != null) {
                              window.clearTimeout(ilceDevamTimerRef.current);
                              ilceDevamTimerRef.current = null;
                            }
                            setSeciliIlce(ilce);
                            setError("");
                            if (!ilce) return;
                            const sehir = seciliSehir;
                            ilceDevamTimerRef.current = window.setTimeout(() => {
                              ilceDevamTimerRef.current = null;
                              void konumManuelDevam(sehir, ilce);
                            }, ADIM_OTOMATIK_GECIS_MS);
                          }}
                        />
                      </div>
                    </div>
                  </div>
              </div>
              {error || konumIzniToast ? (
                <div
                  role={error ? "alert" : "status"}
                  className="!mt-5 w-full rounded-[var(--acb-radius-lg)] border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-snug text-red-700"
                >
                  {error || konumIzniToast}
                </div>
              ) : null}
            </div>
          )}

          <StepTestimonialCard step="konum" />

          {arizaKonumGpsAlindi && form.adres ? (
            <AdimAltNav
              progress={flowProgressBar}
              devamMetin={
                adresGeocodeYukleniyor ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Spinner className="size-4 border-white/40 border-t-white" />
                    Adres işleniyor…
                  </span>
                ) : (
                  "Devam et"
                )
              }
              devamDisabled={adresGeocodeYukleniyor || gpsYukleniyor}
              onGeri={oncekiAdimaDon}
              onDevam={() => {
                void (async () => {
                  setError("");
                  if (gpsYukleniyor) gpsIptal();

                  if (arizaKonumGpsAlindi && form.adres) {
                    const ok = await adresKoordinatDoldur(false);
                    if (ok) adimGit("sorun");
                    return;
                  }

                  if (seciliSehir && seciliIlce) {
                    const adresMetni =
                      form.adres.trim() ||
                      `${seciliIlce}, ${seciliSehir}, Türkiye`;
                    if (!form.lat || !form.lng) {
                      setAdresGeocodeYukleniyor(true);
                      try {
                        const g = await geocodeAdres(
                          `${seciliIlce}, ${seciliSehir}, Türkiye`
                        );
                        if (g) {
                          await konumKaydet(
                            g.lat,
                            g.lng,
                            g.adres,
                            false,
                            "manuel"
                          );
                        } else {
                          setForm((f) => ({
                            ...f,
                            adres: adresMetni,
                            konumKaynak: "manuel",
                          }));
                        }
                      } finally {
                        setAdresGeocodeYukleniyor(false);
                      }
                    } else {
                      setForm((f) => ({
                        ...f,
                        adres: form.adres.trim() || adresMetni,
                        konumKaynak: "manuel",
                      }));
                    }
                    adimGit("sorun");
                    return;
                  }

                  if (form.adres.trim().length >= 6) {
                    const ok = await adresKoordinatDoldur(false);
                    if (ok) {
                      adimGit("sorun");
                      return;
                    }
                  }

                  setError("Otomatik konum alın veya şehir ve ilçe seçin.");
                })();
              }}
            />
          ) : null}

          {(gpsYukleniyor || adresGeocodeYukleniyor) && (
            <div
              className="flex items-start gap-3 rounded-[var(--acb-radius)] border border-[color-mix(in_srgb,var(--acb-orange)_40%,white)] bg-[color-mix(in_srgb,var(--acb-orange)_12%,white)] px-4 py-3"
              role="status"
            >
              <Spinner className="mt-0.5" />
              <div className="text-sm text-[var(--acb-dark)] leading-relaxed min-w-0">
                {gpsYukleniyor ? (
                  <>
                    <p className="font-medium">
                      {konumIzniBekleniyor
                        ? "Konum izni bekleniyor…"
                        : "Konumunuz alınıyor…"}
                    </p>
                    <p className="text-xs text-[var(--acb-muted)] mt-1">
                      İzin penceresinde «İzin Ver»e dokunun; konum otomatik
                      yazılacak.
                    </p>
                  </>
                ) : (
                  <p className="font-medium">Adres doğrulanıyor…</p>
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {step === "hedef" && (
        <div className="space-y-4 animate-fade-in">
          <div className="space-y-1">
            <h2 className="text-[1.75rem] sm:text-3xl font-bold leading-[1.12] tracking-tight text-[var(--acb-dark)]">Nereye Çekilecek?</h2>
            <p className="text-sm text-[var(--acb-muted)] leading-snug">
              {sorunLabel
                ? googleOneriAktif
                  ? `${sorunLabel} için semtinizdeki oto tamirleri ve yakındaki oto sanayileri öneriyoruz — birini seçin veya adresi siz yazın.`
                  : `${sorunLabel} için semtinizdeki oto tamirleri ve yakındaki oto sanayileri öneriyoruz — birini seçin veya adresi siz yazın.`
                : "Aracınızın götürülmesini istediğiniz adresi belirtin."}
            </p>
          </div>

          <div className="grid gap-2">
            <button
              type="button"
              onClick={() => enYakinHedefSec("oto_tamir")}
              disabled={oneriYukleniyor && oneriler.length === 0}
              className={`w-full flex items-center justify-between gap-2 rounded-[var(--acb-radius-lg)] border px-4 py-3.5 text-left font-semibold text-sm transition-[border-color,background-color,box-shadow,transform] duration-200 active:duration-100 ease-out touch-manipulation hover:-translate-y-px active:translate-y-0 active:scale-[0.99] disabled:opacity-50 ${
                enYakinModSeciliMi("oto_tamir") || hedefOpsiyon === "oto_tamir"
                  ? "border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-200 shadow-sm"
                  : `${hedefNormalSinif} hover:border-blue-400`
              }`}
            >
              <span>En yakın oto servis</span>
              {enYakinModSeciliMi("oto_tamir") || hedefOpsiyon === "oto_tamir" ? (
                <AcbIcons.check
                  className="size-4 shrink-0"
                  strokeWidth={ACB_ICON_STROKE}
                  aria-hidden
                />
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => enYakinHedefSec("oto_sanayi")}
              disabled={oneriYukleniyor && oneriler.length === 0}
              className={`w-full flex items-center justify-between gap-2 rounded-[var(--acb-radius-lg)] border px-4 py-3.5 text-left font-semibold text-sm transition-[border-color,background-color,box-shadow,transform] duration-200 active:duration-100 ease-out touch-manipulation hover:-translate-y-px active:translate-y-0 active:scale-[0.99] disabled:opacity-50 ${
                enYakinModSeciliMi("oto_sanayi") ||
                hedefOpsiyon === "oto_sanayi"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-200 shadow-sm"
                  : `${hedefNormalSinif} hover:border-emerald-400`
              }`}
            >
              <span>En yakın oto sanayi</span>
              {enYakinModSeciliMi("oto_sanayi") ||
              hedefOpsiyon === "oto_sanayi" ? (
                <AcbIcons.check
                  className="size-4 shrink-0"
                  strokeWidth={ACB_ICON_STROKE}
                  aria-hidden
                />
              ) : null}
            </button>

            {hedefBilinmiyor ? (
              <div
                id="hedef-secim-ozeti"
                className="rounded-[var(--acb-radius-lg)] border border-amber-500 bg-amber-50 ring-2 ring-amber-200 shadow-[var(--acb-shadow-lg)] overflow-hidden scroll-mt-24"
              >
                <button
                  type="button"
                  onClick={hedefBilmiyorumSec}
                  className="w-full flex items-center justify-between gap-2 text-left px-4 pt-3.5 pb-2 font-semibold text-sm text-amber-950"
                >
                  <span>Bilmiyorum, sonra seçeceğim</span>
                  <AcbIcons.check
                    className="size-4 shrink-0"
                    strokeWidth={ACB_ICON_STROKE}
                    aria-hidden
                  />
                </button>
                <div className="px-4 pb-3">
                  <p className="text-sm text-amber-900 leading-relaxed">
                    Hedefi sonra seçebilirsiniz.
                  </p>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={hedefBilmiyorumSec}
                className={`w-full rounded-[var(--acb-radius-lg)] border px-4 py-3.5 text-left font-semibold text-sm transition-[border-color,background-color,box-shadow,transform] duration-200 active:duration-100 ease-out touch-manipulation hover:-translate-y-px active:translate-y-0 active:scale-[0.99] ${hedefNormalSinif} hover:border-amber-400`}
              >
                Bilmiyorum, sonra seçeceğim
              </button>
            )}

            {hedefKendimArat ? (
              <div
                id="hedef-secim-ozeti"
                className="rounded-[var(--acb-radius-lg)] border border-amber-500 bg-amber-50 ring-2 ring-amber-200 shadow-[var(--acb-shadow-lg)] overflow-hidden scroll-mt-24"
              >
                <button
                  type="button"
                  onClick={hedefKendimAratSec}
                  className="w-full flex items-center justify-between gap-2 text-left px-4 pt-3.5 pb-2 font-semibold text-sm text-amber-950"
                >
                  <span>Çekeceğim adresi kendim aratacağım</span>
                  <AcbIcons.check
                    className="size-4 shrink-0"
                    strokeWidth={ACB_ICON_STROKE}
                    aria-hidden
                  />
                </button>
                <div className="px-4 pb-3 space-y-1">
                  {hedefAdresAramaAlani()}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={hedefKendimAratSec}
                className={`w-full rounded-[var(--acb-radius-lg)] border px-4 py-3.5 text-left font-semibold text-sm transition-[border-color,background-color,box-shadow,transform] duration-200 active:duration-100 ease-out touch-manipulation hover:-translate-y-px active:translate-y-0 active:scale-[0.99] ${hedefNormalSinif} hover:border-amber-400`}
              >
                Çekeceğim adresi kendim aratacağım
              </button>
            )}
          </div>

          <StepTestimonialCard step="hedef" />

          {oneriYukleniyor && oneriler.length === 0 && (
            <div
              className="flex items-center gap-3 rounded-[var(--acb-radius-lg)] border border-amber-200 bg-amber-50 px-4 py-3 shadow-[var(--acb-shadow)]"
              role="status"
            >
              <Spinner className="mt-0.5" />
              <p className="text-sm font-medium text-amber-900">
                {googleOneriAktif
                  ? "Google’da şu an açık olan yakın yerler aranıyor…"
                  : "Yakın yerler aranıyor…"}
              </p>
            </div>
          )}

          {!oneriYukleniyor && oneriAcikFiltre && oneriler.length > 0 && (
            <Card className="bg-emerald-50 border-emerald-200 !py-3">
              <p className="text-sm text-emerald-800 leading-relaxed">
                Öneriler Google’dan alınır; yalnızca{" "}
                <strong>şu an açık</strong> görünen işletmeler listelenir.
              </p>
            </Card>
          )}

          {!oneriYukleniyor &&
            (oneriKaynak === "nominatim" || oneriKaynak === "maps_scrape") &&
            oneriler.length > 0 && (
              <Card className="bg-slate-50 border-slate-200 !py-3">
                <p className="text-sm text-slate-600 leading-relaxed">
                  {oneriKaynak === "maps_scrape"
                    ? "Öneriler Google Maps aramasından alındı (Places API yedek yolu)."
                    : "Açık/kapalı bilgisi doğrulanamadı; yakın yerler harita verisinden listelendi."}
                </p>
              </Card>
            )}

          {!cozumOneriAktif && !oneriYukleniyor && (
            <p className="text-xs text-slate-500 text-center">
              Öneri için önce sorun tipi ve arıza konumu gerekli.
            </p>
          )}

          {oneriler.length > 0 && (
            <div className="space-y-4">
              <HedefOneriHarita
                oneriler={oneriler}
                ariza={
                  form.lat && form.lng
                    ? { lat: form.lat, lng: form.lng }
                    : null
                }
                secili={
                  form.hedefLat && form.hedefLng
                    ? { lat: form.hedefLat, lng: form.hedefLng }
                    : null
                }
                onSec={oneriSec}
                mapsArama={otoTamirAramaSorgusu({
                  semt: oneriSemt,
                  il: form.adres.trim()
                    ? parseIlIlce(form.adres).il
                    : null,
                })}
              />
              <Btn
                type="button"
                variant="secondary"
                onClick={() => void cozumOner(true)}
                disabled={oneriYukleniyor || !cozumOneriAktif}
                className="!py-3 text-sm"
              >
                {oneriYukleniyor ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Spinner className="size-4 border-slate-400 border-t-slate-600" />
                    Yeni öneriler aranıyor…
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center gap-1.5">
                    <AcbIcons.refresh
                      className="size-4"
                      strokeWidth={ACB_ICON_STROKE}
                      aria-hidden
                    />
                    {yeniOneriApiSayisi >= 5
                      ? "Önceki önerilerden rastgele"
                      : `Yeni öneriler ver (${5 - yeniOneriApiSayisi} kaldı)`}
                  </span>
                )}
              </Btn>
              {(
                [
                  {
                    key: "oto_tamir" as const,
                    baslik: oneriSemt
                      ? `Semtinizdeki oto tamirler (${oneriSemt})`
                      : "Semtinizdeki oto tamirler",
                    renk: "text-blue-700",
                    pin: "bg-blue-100 text-blue-800",
                  },
                  {
                    key: "oto_sanayi" as const,
                    baslik: "Oto sanayi",
                    renk: "text-emerald-700",
                    pin: "bg-emerald-100 text-emerald-800",
                  },
                ] as const
              ).map((grup) => {
                const liste = oneriler.filter((o) => o.kategori === grup.key);
                if (liste.length === 0) return null;
                return (
                  <div
                    key={grup.key}
                    id={`hedef-grup-${grup.key}`}
                    className="space-y-2 scroll-mt-24"
                  >
                    <p
                      className={`text-xs font-semibold uppercase tracking-wide ${grup.renk}`}
                    >
                      {grup.baslik} ({liste.length})
                    </p>
                    {liste.map((o, i) => {
                      const seciliMi = hedefOneriSeciliMi(o);
                      const no = o.etiketNo ?? i + 1;
                      const icerik = (
                        <>
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-slate-900 min-w-0">
                              <span
                                className={`inline-flex size-5 items-center justify-center rounded-full text-xs font-bold mr-2 align-middle ${grup.pin}`}
                              >
                                {no}
                              </span>
                              {o.ad}
                            </p>
                            <div className="shrink-0 flex flex-col items-end gap-1">
                              {o.puan != null && (
                                <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-[var(--acb-dark)]">
                                  <AcbIcons.rating
                                    className="size-3"
                                    strokeWidth={ACB_ICON_STROKE}
                                    aria-hidden
                                  />
                                  {o.puan}
                                </span>
                              )}
                              {oneriAcikFiltre && (
                                <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                                  Açık
                                </span>
                              )}
                            </div>
                          </div>
                          {o.mesafeKm != null && (
                            <p className="text-xs text-slate-600 mt-0.5 pl-7">
                              ~{o.mesafeKm} km
                              {o.puanSayisi != null
                                ? ` · ${o.puanSayisi} değerlendirme`
                                : ""}
                            </p>
                          )}
                          <p className="text-xs text-slate-500 mt-1 pl-7 line-clamp-2">
                            {o.adres}
                          </p>
                        </>
                      );

                      if (seciliMi) {
                        return (
                          <div
                            key={o.placeId ?? `${o.adres}-${i}`}
                            id="hedef-secim-ozeti"
                            className="rounded-[var(--acb-radius-lg)] border border-amber-500 bg-amber-50 ring-2 ring-amber-200 shadow-[var(--acb-shadow-lg)] overflow-hidden scroll-mt-24"
                          >
                            <button
                              type="button"
                              onClick={() => oneriSec(o)}
                              aria-pressed
                              className="w-full text-left px-4 py-3"
                            >
                              {icerik}
                            </button>
                          </div>
                        );
                      }

                      return (
                        <button
                          key={o.placeId ?? `${o.adres}-${i}`}
                          type="button"
                          onClick={() => oneriSec(o)}
                          aria-pressed={false}
                          className="w-full text-left rounded-[var(--acb-radius-lg)] border border-slate-200 bg-white px-4 py-3 shadow-[var(--acb-shadow)] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:border-amber-400 hover:shadow-[var(--acb-shadow-lg)] active:translate-y-0 active:scale-[0.99]"
                        >
                          {icerik}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
              {/* kategori yoksa (eski/yedek) düz liste */}
              {!oneriler.some((o) => o.kategori) && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">
                    Önerilen yerler ({oneriler.length})
                  </p>
                  {oneriler.map((o, i) => {
                    const seciliMi = hedefOneriSeciliMi(o);
                    const icerik = (
                      <>
                        <p className="font-medium text-slate-900">
                          <span className="inline-flex size-5 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-xs font-bold mr-2 align-middle">
                            {i + 1}
                          </span>
                          {o.ad}
                        </p>
                        {o.mesafeKm != null && (
                          <p className="text-xs text-amber-600 mt-0.5">
                            ~{o.mesafeKm} km
                          </p>
                        )}
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {o.adres}
                        </p>
                      </>
                    );
                    if (seciliMi) {
                      return (
                        <div
                          key={o.placeId ?? o.adres}
                          id="hedef-secim-ozeti"
                          className="rounded-[var(--acb-radius-lg)] border border-amber-500 bg-amber-50 ring-2 ring-amber-200 shadow-[var(--acb-shadow-lg)] overflow-hidden scroll-mt-24"
                        >
                          <button
                            type="button"
                            onClick={() => oneriSec(o)}
                            aria-pressed
                            className="w-full text-left px-4 py-3"
                          >
                            {icerik}
                          </button>
                        </div>
                      );
                    }
                    return (
                      <button
                        key={o.placeId ?? o.adres}
                        type="button"
                        onClick={() => oneriSec(o)}
                        aria-pressed={false}
                        className="w-full text-left rounded-[var(--acb-radius-lg)] border border-slate-200 bg-white px-4 py-3 shadow-[var(--acb-shadow)] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:border-amber-400 hover:shadow-[var(--acb-shadow-lg)] active:translate-y-0 active:scale-[0.99]"
                      >
                        {icerik}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {!oneriYukleniyor &&
            cozumOneriAktif &&
            oneriler.length === 0 &&
            hedefOneriBaslatildi.current && (
              <Btn
                type="button"
                variant="secondary"
                onClick={() => void cozumOner(false)}
              >
                Tekrar öneri dene
              </Btn>
            )}

        </div>
      )}
      {step === "ozet" && (
        <div className="space-y-5 animate-fade-in">
          <div className="space-y-1">
            <h2 className="text-[1.75rem] sm:text-3xl font-bold leading-[1.12] tracking-tight text-[var(--acb-dark)]">
              Talebini kontrol et
            </h2>
            <p className="text-sm text-[var(--acb-muted)] leading-snug">
              Göndermeden önce bilgilerini gözden geçir.
            </p>
          </div>

          <div className="overflow-hidden rounded-[var(--acb-radius-lg)] border border-[var(--acb-border)] bg-white shadow-[var(--acb-shadow)] divide-y divide-[var(--acb-border)]">
            <div className="flex items-start justify-between gap-3 px-4 py-3.5">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--acb-soft)]">
                  <SorunIkon id={form.sorunTipi} className="size-5" active />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--acb-muted)]">
                    Hizmet
                  </p>
                  <p className="truncate text-sm font-semibold text-[var(--acb-dark)]">
                    {sorunLabel ?? "—"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => adimGit("sorun")}
                className="shrink-0 text-xs font-semibold text-[var(--acb-dark)] underline touch-manipulation"
              >
                Değiştir
              </button>
            </div>

            <div className="flex items-start justify-between gap-3 px-4 py-3.5">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--acb-soft)]">
                  <AcbIcons.location
                    className="size-5 text-[var(--acb-green)]"
                    strokeWidth={ACB_ICON_STROKE}
                    aria-hidden
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--acb-muted)]">
                    Konum
                  </p>
                  <p className="text-sm font-semibold leading-snug text-[var(--acb-dark)]">
                    {form.adres || "—"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => adimGit("konum")}
                className="shrink-0 text-xs font-semibold text-[var(--acb-dark)] underline touch-manipulation"
              >
                Değiştir
              </button>
            </div>

            {sorunAracModeliAlaniGoster(form.sorunTipi) &&
            (form.aracTipi || form.aracDurumu) ? (
              <div className="flex items-start justify-between gap-3 px-4 py-3.5">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--acb-soft)]">
                    <AcbIcons.car
                      className="size-5 text-[var(--acb-green)]"
                      strokeWidth={ACB_ICON_STROKE}
                      aria-hidden
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--acb-muted)]">
                      Araç
                    </p>
                    <p className="text-sm font-semibold leading-snug text-[var(--acb-dark)]">
                      {[aracTipiEtiket(form.aracTipi), aracDurumuEtiket(form.aracDurumu)]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => adimGit("arac_tipi")}
                  className="shrink-0 text-xs font-semibold text-[var(--acb-dark)] underline touch-manipulation"
                >
                  Değiştir
                </button>
              </div>
            ) : null}

            {hedefKonumGerekli ? (
              <div className="flex items-start justify-between gap-3 px-4 py-3.5">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--acb-soft)]">
                    <AcbIcons.navigation
                      className="size-5 text-[var(--acb-green)]"
                      strokeWidth={ACB_ICON_STROKE}
                      aria-hidden
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--acb-muted)]">
                      Nereye çekilecek
                    </p>
                    <p className="text-sm font-semibold leading-snug text-[var(--acb-dark)]">
                      {hedefBilinmiyor
                        ? "Bilmiyorum, sonra seçeceğim"
                        : form.hedefAdres || "—"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => adimGit("hedef")}
                  className="shrink-0 text-xs font-semibold text-[var(--acb-dark)] underline touch-manipulation"
                >
                  Değiştir
                </button>
              </div>
            ) : null}

            <div className="flex items-start justify-between gap-3 px-4 py-3.5">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--acb-soft)]">
                  <AcbIcons.clock
                    className="size-5 text-[var(--acb-green)]"
                    strokeWidth={ACB_ICON_STROKE}
                    aria-hidden
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--acb-muted)]">
                    Teklif toplama süresi
                  </p>
                  <p className="text-sm font-semibold text-[var(--acb-dark)]">
                    {IHALE_SURE_ETIKET[ihaleSureTipi]}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => adimGit("ihale")}
                className="shrink-0 text-xs font-semibold text-[var(--acb-dark)] underline touch-manipulation"
              >
                Değiştir
              </button>
            </div>
          </div>

          {form.sorunDetay.trim() ? (
            <div className="rounded-[var(--acb-radius-lg)] border border-[var(--acb-border)] bg-white px-4 py-3.5 shadow-[var(--acb-shadow)]">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--acb-muted)]">
                Teklif notu
              </p>
              <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--acb-dark)]">
                {form.sorunDetay}
              </p>
            </div>
          ) : null}

          <StepTestimonialCard step="ozet" />

          <AdimAltNav
            progress={flowProgressBar}
            devamMetin="Devam et"
            onGeri={oncekiAdimaDon}
            onDevam={() => adimGit("telefon")}
          />
        </div>
      )}
      {step === "telefon" && (
        <MusteriFormIletisimOtp
          progress={flowProgressBar}
          funnelId={funnelId}
          ad={form.ad}
          telefon={form.telefon}
          yasalOnay={yasalOnay}
          onAdChange={(v) => {
            update("ad", v);
            setBilgiAlanMesajlari((m) => ({ ...m, telefon: "" }));
          }}
          onTelefonChange={(v) => {
            update("telefon", v);
            setBilgiAlanMesajlari((m) => ({ ...m, telefon: "" }));
            setError("");
          }}
          onYasalOnayChange={(checked) => {
            setYasalOnay(checked);
            if (checked) {
              setBilgiAlanMesajlari((m) => ({ ...m, yasalOnay: "" }));
            }
          }}
          telefonHata={bilgiAlanMesajlari.telefon}
          yasalHata={bilgiAlanMesajlari.yasalOnay}
          sorunLabel={sorunLabel}
          onGeri={oncekiAdimaDon}
          submitting={loading}
          submitEtiket={UCRETSIZ_TEKLIF_CTA}
          onHazir={() => cekiciBul()}
        />
      )}

      {step === "hedef" && (
        <HedefAltNav
          progress={flowProgressBar}
          hedefSeciliMi={hedefSeciliMi}
          onGeri={oncekiAdimaDon}
          devamDisabled={hedefIleriEngelli}
          devamIcerik={
            adresGeocodeYukleniyor ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Spinner className="size-4 border-white/40 border-t-white" />
                Adres işleniyor…
              </span>
            ) : (
              "Devam et"
            )
          }
          onDevam={() => {
            if (!hedefGonderilebilir) return;
            void hedefIleriGit();
          }}
        />
      )}
      </div>
    </MobileShell>
  );
}
