"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import {
  stickyCtaOffsetAyarla,
  stickyCtaOffsetTemizle,
} from "@/lib/sticky-cta-offset";
import { SorunSecimi } from "@/components/SorunSecimi";
import { AnaSayfaOzellikSeridi } from "@/components/AnaSayfaOzellikSeridi";
import { AnaSayfaFiyatHesaplamaTeaser } from "@/components/AnaSayfaFiyatHesaplamaTeaser";
import { AnaSayfaHizmetVerCta } from "@/components/AnaSayfaHizmetVerCta";
import { AnaSayfaHizliBaglantilar } from "@/components/AnaSayfaHizliBaglantilar";
import { Btn, Field, Card, Spinner, TextArea, SelectField } from "@/components/ui";
import { KULLANIMA_ACIK_ILLER } from "@/lib/cekici-sehir-acilis";
import { ilceListesi } from "@/lib/il-ilce";
import { illerSecimSirasi, sehirdeYazi } from "@/lib/turkiye-il-nufus";
import {
  hizmetQuerydenSorunTipi,
  sorunAracModeliAlaniGoster,
  sorunAracModeliGerekliMi,
  sorunCagriButonEtiketi,
  sorunFotografAlaniGoster,
  sorunFotografGerekliMi,
  sorunHedefKonumGerekliMi,
  sorunMetniOlustur,
  sorunTipiBul,
  HEDEF_BILINMIYOR_EK_SURE_DK,
} from "@/lib/sorun-tipleri";
import { ARAC_TIPLERI, aracModeliMetniOlustur } from "@/lib/arac-tipi";
import { AracTipiIkon } from "@/components/AracTipiIkon";
import { GpsHttpsBanner } from "@/components/GpsHttpsBanner";
import { ChromeAcSecenegi } from "@/components/ChromeAcSecenegi";
import { YasalOnayKutusu } from "@/components/yasal/YasalOnayKutusu";
import { YasalSiteFooter } from "@/components/yasal/YasalSiteFooter";
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
import { seoHizmetListesi } from "@/lib/seo-hizmetler";
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

const NasilCalisirSerit = dynamic(
  () =>
    import("@/components/NasilCalisirSerit").then((m) => ({
      default: m.NasilCalisirSerit,
    })),
  {
    ssr: true,
    loading: () => (
      <div className="mb-4 min-h-[9.5rem] rounded-xl border border-amber-100 bg-amber-50/40" aria-hidden />
    ),
  }
);

const HizmetVerenSayimAlani = dynamic(
  () =>
    import("@/components/HizmetVerenSayimAlani").then((m) => ({
      default: m.HizmetVerenSayimAlani,
    })),
  {
    ssr: false,
    loading: () => (
      <div
        className="mb-0 min-h-[2.75rem] rounded-xl border border-emerald-100 bg-emerald-50/40"
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
  | "konum"
  | "sorun"
  | "fotograf"
  | "arac_tipi"
  | "arac_modeli"
  | "ek_detay"
  | "ihale"
  | "hedef";

/** Sabit kanonik sıra — aktifAdimlar() bundan filtreler, göreli sıra hep aynı */
const TUM_ADIMLAR: Step[] = [
  "konum",
  "sorun",
  "fotograf",
  "arac_tipi",
  "arac_modeli",
  "ek_detay",
  "ihale",
  "hedef",
];

/** Konum → sorun → [fotoğraf/araç tipi/araç modeli/ek detay/ihale] → hedef */
function aktifAdimlar(sorunTipi: string, hedefGerekli: boolean): Step[] {
  return TUM_ADIMLAR.filter((adim) => {
    if (adim === "fotograf") return sorunFotografAlaniGoster(sorunTipi);
    if (adim === "arac_tipi" || adim === "arac_modeli") {
      return sorunAracModeliAlaniGoster(sorunTipi);
    }
    if (adim === "hedef") return hedefGerekli;
    return true;
  });
}

/** Eski tek «detay» adımının bölündüğü alt adımlar */
const DETAY_ALT_ADIMLARI: Step[] = [
  "fotograf",
  "arac_tipi",
  "arac_modeli",
  "ek_detay",
  "ihale",
];

const ADIM_OLAYLARI: Partial<Record<Step, string>> = {
  sorun: "form_adim_sorun",
  konum: "form_adim_konum",
  fotograf: "form_adim_fotograf",
  arac_tipi: "form_adim_arac_tipi",
  arac_modeli: "form_adim_arac_modeli",
  ek_detay: "form_adim_ek_detay",
  ihale: "form_adim_ihale",
  hedef: "form_adim_hedef",
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

/** Konum sonrası tüm adımlarda ortak sticky alt nav (Geri + Devam) */
function AdimAltNav({
  devamMetin,
  devamDisabled = false,
  devamGlow = false,
  onGeri,
  onDevam,
}: {
  devamMetin: React.ReactNode;
  devamDisabled?: boolean;
  /** Seçim yapıldıktan sonra Devam butonunda amber glow */
  devamGlow?: boolean;
  onGeri: () => void;
  onDevam: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const guncelle = () => stickyCtaOffsetAyarla(el.offsetHeight);
    guncelle();
    const ro = new ResizeObserver(guncelle);
    ro.observe(el);
    return () => {
      ro.disconnect();
      stickyCtaOffsetTemizle();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_-4px_rgba(0,0,0,0.08)]"
    >
      <div className="mx-auto flex max-w-lg gap-3">
        <Btn
          type="button"
          variant="secondary"
          className="!w-auto flex-1"
          onClick={onGeri}
        >
          Geri
        </Btn>
        <Btn
          type="button"
          className={[
            "flex-[2]",
            devamGlow && !devamDisabled
              ? "ring-2 ring-amber-300/90 shadow-[0_0_16px_4px_rgba(245,158,11,0.55)] animate-pulse"
              : "",
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
  );
}

/** Hedef sayfası — sticky alt panel: uyarı + yasal onay + Geri/CTA */
function HedefAltNav({
  hedefSeciliMi,
  yasalOnayRef,
  yasalOnay,
  onYasalOnayChange,
  yasalOnayHata,
  onGeri,
  onDevam,
  devamDisabled = false,
  devamGlow = false,
  devamIcerik,
}: {
  hedefSeciliMi: boolean;
  yasalOnayRef: React.RefObject<HTMLDivElement | null>;
  yasalOnay: boolean;
  onYasalOnayChange: (checked: boolean) => void;
  yasalOnayHata: string;
  onGeri: () => void;
  onDevam: () => void;
  devamDisabled?: boolean;
  devamGlow?: boolean;
  devamIcerik: React.ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const guncelle = () => stickyCtaOffsetAyarla(el.offsetHeight);
    guncelle();
    const ro = new ResizeObserver(guncelle);
    ro.observe(el);
    return () => {
      ro.disconnect();
      stickyCtaOffsetTemizle();
    };
  }, [hedefSeciliMi, yasalOnayHata]);

  return (
    <div
      ref={rootRef}
      className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_-4px_rgba(0,0,0,0.08)]"
    >
      <div className="mx-auto max-w-lg space-y-2">
        {!hedefSeciliMi && (
          <p
            className="text-sm font-semibold text-red-600 text-center"
            role="alert"
          >
            Bir opsiyonu seçiniz
          </p>
        )}
        <div ref={yasalOnayRef} className="scroll-mt-28 space-y-1.5">
          <YasalOnayKutusu
            checked={yasalOnay}
            onChange={onYasalOnayChange}
            invalid={!!yasalOnayHata}
            kucukMetin
          />
          {yasalOnayHata && (
            <p className="text-xs text-red-600" role="alert">
              {yasalOnayHata}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Btn
            type="button"
            variant="secondary"
            className="!w-auto flex-1"
            onClick={onGeri}
          >
            Geri
          </Btn>
          <Btn
            type="button"
            className={[
              "flex-[2]",
              devamGlow && !devamDisabled
                ? "ring-2 ring-amber-300/90 shadow-[0_0_16px_4px_rgba(245,158,11,0.55)] animate-pulse"
                : "",
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
    </div>
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
  const [step, setStep] = useState<Step>("konum");
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
  const [konumToastTop, setKonumToastTop] = useState(56);
  const gpsIstekRef = useRef(0);
  const konumToastTimerRef = useRef<number | null>(null);
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
  const yasalOnayRef = useRef<HTMLDivElement>(null);
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
  const [fotografHatasi, setFotografHatasi] = useState(false);
  const [sorunDetayHatasi, setSorunDetayHatasi] = useState(false);
  const [arizaAdresDuzenle, setArizaAdresDuzenle] = useState(false);
  const [yasalOnay, setYasalOnay] = useState(false);
  const [bilgiAlanMesajlari, setBilgiAlanMesajlari] = useState({
    yasalOnay: "",
    telefon: "",
  });

  const [form, setForm] = useState({
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
  });
  const [fotografOnizleme, setFotografOnizleme] = useState<string | null>(null);
  const [fotografData, setFotografData] = useState<string | null>(null);
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
    step: "konum" as Step,
    form,
    yasalOnay: false,
    fotografOnizleme: null as string | null,
    fotografData: null as string | null,
    hedefBilinmiyor: false,
    ihaleSureTipi: "acil" as IhaleSureTipi,
    ihaleOzelBitis: "",
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
          ? "hedef"
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
    if (step !== "ek_detay") setSorunDetayHatasi(false);
    if (step !== "ihale") setIhaleSureHatasi(false);
    if (step !== "konum") {
      setAdSoyadHatasi(false);
      setArizaAdresDuzenle(false);
    }
    setBilgiAlanMesajlari({ yasalOnay: "", telefon: "" });
  }, [step]);

  useEffect(() => {
    if (step !== "konum") return;
    const guvenli = konumGuvenliMi();
    setGpsGuvenli(guvenli);
    if (!guvenli) {
      setKonumIzni("unknown");
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
      sorunFotografGerekliMi(form.sorunTipi) && !fotografData;
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

    if (hedefIdx > konumIdx && !konumSecimiHazir()) {
      setError("Önce otomatik konum alın veya şehir ve ilçe seçin.");
      setStep("konum");
      return;
    }

    if (hedefIdx > sorunIdx) {
      if (!form.sorunTipi) {
        setError("Lütfen sorununuzu seçin.");
        setStep("sorun");
        return;
      }
    }

    /* Konum adımından çıkarken URL’yi şehir/ilçe ile senkronize et */
    if (step === "konum" && hedef !== "konum" && seciliSehir) {
      const yol = musteriKonumYolu(seciliSehir, seciliIlce || null);
      musteriFormTaslakKaydet({
        v: 1,
        step: hedef,
        form,
        yasalOnay,
        fotografOnizleme,
        fotografData,
        hedefBilinmiyor,
        ihaleSureTipi,
        ihaleOzelBitis: ihaleOzelBitis || undefined,
      });
      if (
        typeof window !== "undefined" &&
        window.location.pathname !== yol
      ) {
        router.push(yol);
        return;
      }
    }

    setStep(hedef);
    setError("");
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
    });
  }

  function yasalOnayaKaydir() {
    window.setTimeout(() => {
      yasalOnayRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 50);
  }

  async function konumKaydet(
    lat: number,
    lng: number,
    adres: string,
    hedef: boolean
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
    const header = document.getElementById("app-shell-header");
    if (header) {
      setKonumToastTop(Math.round(header.getBoundingClientRect().bottom) + 6);
    }
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
      await konumKaydet(latitude, longitude, adres, hedef);
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
        const yol = musteriKonumYolu(il, ilce);
        if (
          typeof window !== "undefined" &&
          window.location.pathname !== yol
        ) {
          router.replace(yol);
        } else {
          setStep("sorun");
        }
      }
      setKonumIzni("granted");
      setKonumIzniBekleniyor(false);
    } catch (e) {
      if (gpsIstekRef.current !== istekId) return;
      setKonumBasarisiz(true);
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
            await konumKaydet(g.lat, g.lng, g.adres, hedef);
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
        hedef
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
      await konumKaydet(g.lat, g.lng, g.adres, hedef);
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
        await konumKaydet(g.lat, g.lng, g.adres, false);
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
      void cekiciBul();
      return;
    }
    if (await adresKoordinatDoldur(true)) void cekiciBul();
  }

  const hedefSeciliMi = hedefOpsiyon != null;

  const hedefGonderilebilir =
    hedefOpsiyon === "bilmiyorum" ||
    (hedefOpsiyon != null &&
      Boolean(form.hedefAdres.trim() && form.hedefLat && form.hedefLng));

  /** Seçim yoksa veya kendim-arat adresi eksikse CTA kapalı */
  const hedefIleriEngelli =
    loading || adresGeocodeYukleniyor || !hedefGonderilebilir;

  const hedefGlowSinif =
    "border-amber-400 bg-white text-slate-900 ring-2 ring-amber-300/80 shadow-[0_0_14px_3px_rgba(245,158,11,0.55)] animate-pulse";
  const hedefNormalSinif = "border-slate-200 bg-white text-slate-900";

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
          <div className="rounded-xl border-2 border-emerald-400 bg-emerald-50 px-3.5 py-3 space-y-2">
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
    if (!yasalOnay) {
      setError("Talep göndermek için yasal metinleri onaylayın.");
      setBilgiAlanMesajlari((m) => ({
        ...m,
        yasalOnay: "Yasal metinleri onaylamanız zorunludur.",
      }));
      yasalOnayaKaydir();
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
    if (sorunAracModeliGerekliMi(form.sorunTipi) && !form.aracModeli.trim()) {
      setError("Araç modelini girin (ör. Audi A3 sedan).");
      setStep("arac_modeli");
      return;
    }
    if (sorunFotografGerekliMi(form.sorunTipi) && !fotografData) {
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
    try {
      const res = await fetch("/api/talep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          konum: { lat: form.lat, lng: form.lng, adres: form.adres },
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
          sorunDetay: form.sorunDetay,
          aracModeli: aracModeliMetniOlustur(form.aracTipi, form.aracModeli),
          fotograf: fotografData || undefined,
          sorun: sorunMetniOlustur(form.sorunTipi, form.sorunDetay),
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

  const adimIlerlemeCubugu = (
    <div className="flex w-full gap-1">
      {steps.map((s, i) => {
        const aktifIdx = steps.findIndex((x) => x.key === step);
        const gecildi = i < aktifIdx;
        const buradayiz = i === aktifIdx;
        return (
          <button
            key={s.key}
            type="button"
            onClick={() => adimGit(s.key)}
            className={[
              "flex-1 h-1.5 rounded-full transition",
              buradayiz
                ? "bg-amber-500 shadow-[0_0_10px_2px_rgba(245,158,11,0.65)] animate-pulse"
                : gecildi
                  ? "bg-amber-500"
                  : "bg-slate-200",
            ].join(" ")}
            aria-label={`Adım ${s.label}`}
            aria-current={buradayiz ? "step" : undefined}
          />
        );
      })}
    </div>
  );

  const adimUstBilgi = (compact: boolean) => (
    <div className="w-full space-y-1.5">
      <HizmetVerenSayimAlani
        sorunTipi={form.sorunTipi || null}
        sehirAd={seciliSehir || null}
        compact={compact}
      />
      {adimIlerlemeCubugu}
    </div>
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
  const digerSecenekler =
    seoLinkSehir === ISTANBUL_IL
      ? seoHizmetListesi().map((h) => ({
          href: `/istanbul/${h.slug}`,
          label: `İstanbul ${h.etiket}`,
        }))
      : anaSayfaSehirBaglantilari().map((l) => ({
          href: l.href,
          label: l.ad,
        }));
  const seoHero =
    seoHeroBaslik ??
    (seoLinkSehir === ISTANBUL_IL ? ISTANBUL_ANA_HERO : seoIcerik.h1);

  const hizmetVerenHeader = (
    <Link
      href="/kayit/b"
      className="inline-flex h-7 items-center justify-center rounded-lg bg-amber-500 px-2.5 text-xs font-semibold text-white shadow-sm shadow-amber-500/20 transition touch-manipulation hover:bg-amber-600 active:scale-[0.98] sm:h-8 sm:px-3.5 sm:text-sm"
    >
      Hizmet Ver
    </Link>
  );

  return (
    <MobileShell
      subtitle={undefined}
      subtitleAlign={step === "konum" ? "right" : "center"}
      brandAlign={step === "konum" ? "left" : "right"}
      backLabel={step === "konum" ? undefined : "Geri"}
      onBack={step === "konum" ? undefined : oncekiAdimaDon}
      headerBadge={step === "konum" ? adimUstBilgi(true) : undefined}
      headerCenter={step === "konum" ? undefined : adimUstBilgi(true)}
      headerEnd={step === "konum" ? hizmetVerenHeader : undefined}
      onBrandClick={() => {
        setStep("konum");
        setError("");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      footer={<YasalSiteFooter />}
      footerClassName={
        step === "hedef"
          ? "pb-56"
          : step !== "konum"
            ? "pb-28"
            : undefined
      }
    >
      {konumIzniToast && (
        <div
          role="status"
          className="fixed inset-x-0 z-20 flex justify-center px-3 pointer-events-none"
          style={{ top: konumToastTop }}
        >
          <div className="pointer-events-auto w-full max-w-lg rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-snug text-amber-950 shadow-md">
            {konumIzniToast}
          </div>
        </div>
      )}

      {step === "konum" && (
        <div className="mb-4 space-y-3">
          <div className="space-y-2.5">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold leading-snug tracking-tight text-slate-900">
                Yolda mı kaldınız?
              </h1>
              <p className="mt-1.5 text-base sm:text-lg font-bold leading-snug text-slate-800">
                Kayıt olmadan 2 dakikada{" "}
                <span className="text-amber-600">10+ çekiciden teklif alın.</span>
              </p>
              <p className="mt-1.5 text-sm leading-snug text-slate-600">
                Fiyatları karşılaştırın, uygun olanı siz seçin.
              </p>
            </div>
            <div className="text-xs text-slate-700 leading-snug space-y-0.5">
              <p>
                <span className="text-emerald-600 font-semibold">✓</span>{" "}
                Ücretsiz
                {" "}
                <span className="text-emerald-600 font-semibold">✓</span> Ödeme
                yok
              </p>
              <p>
                <span className="text-emerald-600 font-semibold">✓</span>{" "}
                Bilgileriniz yalnızca seçtiğiniz çekici ile paylaşılır
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
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
        <div className="space-y-4 animate-fade-in pb-28">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold leading-snug tracking-tight text-slate-900">
              {seciliIlce && seciliSehir
                ? `${seciliIlce}, ${sehirdeYazi(seciliSehir)} ne arıyorsunuz?`
                : seciliSehir
                  ? `${sehirdeYazi(seciliSehir)} ne arıyorsunuz?`
                  : "Ne arıyorsunuz?"}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Yakındaki hizmet verenler teklif göndersin.
            </p>
          </div>
          <SorunSecimi
            seciliTip={form.sorunTipi}
            detay={form.sorunDetay}
            onTipSec={(id) => {
              update("sorunTipi", id);
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
            }}
            onDetayChange={(v) => update("sorunDetay", v)}
            sadeceTipSecimi
          />
          <NasilCalisirSerit aktifFormAdimi={step} />
          <AdimAltNav
            devamMetin="Devam Et"
            devamDisabled={!form.sorunTipi}
            devamGlow={!!form.sorunTipi}
            onGeri={oncekiAdimaDon}
            onDevam={() => {
              if (!form.sorunTipi) {
                setError("Lütfen sorununuzu seçin.");
                return;
              }
              setError("");
              const sonraki = sonrakiAdim("sorun");
              if (sonraki) adimGit(sonraki);
            }}
          />
        </div>
      )}

      {step === "fotograf" && (
        <div className="space-y-4 animate-fade-in pb-28">
          <h2 className="text-xl font-bold">Arıza Fotoğrafı</h2>
          <p className="text-slate-500 text-sm">
            Bir fotoğraf ekleyin — çekici doğru teklif verebilsin (isteğe
            bağlı).
          </p>
          <div ref={fotografRef} className="scroll-mt-44">
            <ArizaFotografAlani
              onizleme={fotografOnizleme}
              invalid={fotografHatasi}
              zorunlu={sorunFotografGerekliMi(form.sorunTipi)}
              onDegisti={(dataUrl) => {
                setFotografOnizleme(dataUrl);
                setFotografData(dataUrl);
                if (dataUrl) setFotografHatasi(false);
              }}
            />
            {fotografHatasi && (
              <p className="text-sm text-red-600 mt-1" role="alert">
                Arıza fotoğrafı zorunludur — çekici doğru teklif verebilsin.
              </p>
            )}
          </div>
          <AdimAltNav
            devamMetin={
              fotografData || fotografOnizleme
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
        <div className="space-y-4 animate-fade-in pb-28">
          <h2 className="text-xl font-bold">Araç Tipi</h2>
          <p className="text-slate-500 text-sm">
            Aracınızın tipini seçin (isteğe bağlı).
          </p>
          <div
            className="grid grid-cols-1 gap-1.5"
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
                  onClick={() => update("aracTipi", secili ? "" : t.id)}
                  className={`w-full text-left rounded-xl border px-3.5 py-2.5 flex items-center gap-2.5 transition touch-manipulation ${
                    secili
                      ? "border-amber-500 bg-amber-50 ring-2 ring-amber-500/25"
                      : "border-slate-200 bg-white hover:border-amber-300"
                  }`}
                >
                  <span
                    className={`inline-flex size-8 shrink-0 items-center justify-center ${
                      secili ? "text-amber-700" : "text-slate-500"
                    }`}
                  >
                    <AracTipiIkon tip={t.id} className="size-8" />
                  </span>
                  <span
                    className={`font-medium text-sm flex-1 min-w-0 ${
                      secili ? "text-amber-900" : "text-slate-800"
                    }`}
                  >
                    {t.etiket}
                  </span>
                  {secili ? (
                    <span className="shrink-0 text-amber-600 text-base">
                      ✓
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
          <AdimAltNav
            devamMetin="Devam Et"
            onGeri={oncekiAdimaDon}
            onDevam={() => {
              const sonraki = sonrakiAdim("arac_tipi");
              if (sonraki) adimGit(sonraki);
            }}
          />
        </div>
      )}

      {step === "arac_modeli" && (
        <div className="space-y-4 animate-fade-in pb-28">
          <h2 className="text-xl font-bold">Araç Modeli</h2>
          <p className="text-slate-500 text-sm">
            Aracın modelini yazın — çekici doğru teklif verebilsin (isteğe
            bağlı).
          </p>
          <div ref={aracModeliRef} className="scroll-mt-44">
            <Field
              label="Araç modeli (isteğe bağlı)"
              placeholder="Örn. Audi A3, Renault Clio"
              value={form.aracModeli}
              onChange={(e) => update("aracModeli", e.target.value)}
              invalid={aracModeliHatasi}
              ref={(el) => {
                if (!el) return;
                el.focus({ preventScroll: true });
              }}
            />
          </div>
          <AdimAltNav
            devamMetin="Devam Et"
            onGeri={oncekiAdimaDon}
            onDevam={() => {
              if (!aracModeliAdimiDevam()) return;
              const sonraki = sonrakiAdim("arac_modeli");
              if (sonraki) adimGit(sonraki);
            }}
          />
        </div>
      )}

      {step === "ek_detay" && (
        <div className="space-y-4 animate-fade-in pb-28">
          <h2 className="text-xl font-bold">Sorun Detayı</h2>
          <p className="text-slate-500 text-sm">
            {hedefKonumGerekli
              ? "Arıza hakkında ek bilgi verin — çekici doğru teklif verebilsin."
              : "Bulunduğunuz yerde hizmet alacaksınız — ek bilgi verin."}
          </p>

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
                rows={3}
                placeholder="Sorununuzu kısaca yazın…"
                value={form.sorunDetay}
                onChange={(e) => update("sorunDetay", e.target.value)}
                aria-invalid={sorunDetayHatasi || undefined}
                className={`w-full rounded-xl bg-white border px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 resize-none ${
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
              label="Ek detay (isteğe bağlı)"
              placeholder="Örn: Otoyol km 42, sağ şeritteyim"
              value={form.sorunDetay}
              onChange={(e) => update("sorunDetay", e.target.value)}
              rows={2}
            />
          )}

          <AdimAltNav
            devamMetin="Devam Et"
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
        <div className="space-y-4 animate-fade-in pb-40">
          <h2 className="text-xl font-bold">İhale Süresi</h2>
          <p className="text-slate-500 text-sm">
            Teklif toplama süresini seçin — süre dolunca en uygun teklifi
            seçersiniz.
          </p>

          <IhaleSureSecimi
            value={ihaleSureTipi}
            ozelBitis={ihaleOzelBitis}
            invalid={ihaleSureHatasi}
            onChange={(tip, ozel) => {
              setIhaleSureTipi(tip);
              setIhaleOzelBitis(ozel);
              setIhaleSureHatasi(false);
            }}
          />

          {!hedefKonumGerekli && (
            <div ref={yasalOnayRef} className="scroll-mt-28 space-y-2">
              <YasalOnayKutusu
                checked={yasalOnay}
                onChange={(checked) => {
                  setYasalOnay(checked);
                  if (checked) {
                    setBilgiAlanMesajlari((m) => ({ ...m, yasalOnay: "" }));
                  }
                }}
                invalid={!!bilgiAlanMesajlari.yasalOnay}
              />
              {bilgiAlanMesajlari.yasalOnay && (
                <p className="text-sm text-red-600" role="alert">
                  {bilgiAlanMesajlari.yasalOnay}
                </p>
              )}
            </div>
          )}

          <AdimAltNav
            devamMetin={
              loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Spinner className="size-4 border-white/40 border-t-white" />
                  Gönderiliyor…
                </span>
              ) : sonrakiAdim("ihale") ? (
                "Devam Et"
              ) : (
                sorunCagriButonEtiketi(form.sorunTipi)
              )
            }
            devamDisabled={loading}
            onGeri={oncekiAdimaDon}
            onDevam={() => {
              if (!ihaleAdimiDevam()) return;
              const sonraki = sonrakiAdim("ihale");
              if (sonraki) {
                adimGit(sonraki);
                return;
              }
              if (!yasalOnay) {
                setBilgiAlanMesajlari((m) => ({
                  ...m,
                  yasalOnay: "Yasal metinleri onaylamanız zorunludur.",
                }));
                setError("Talep göndermek için yasal metinleri onaylayın.");
                yasalOnayaKaydir();
                return;
              }
              void cekiciBul();
            }}
          />
        </div>
      )}

      {step === "konum" && (
        <div className="space-y-4 animate-fade-in">
          {arizaKonumGpsAlindi && form.adres ? (
            <Card className="bg-emerald-50 border-emerald-200">
              <p className="text-xs text-emerald-700 uppercase tracking-wide mb-1">
                Arıza konumu (GPS)
              </p>
              <p className="text-sm text-emerald-900 leading-relaxed">
                {form.adres}
              </p>
              {(seciliIlce || seciliSehir) && (
                <p className="mt-1 text-xs text-emerald-800">
                  {[seciliIlce, seciliSehir].filter(Boolean).join(", ")}
                </p>
              )}
              <button
                type="button"
                onClick={() => {
                  gpsIptal();
                  setGpsYukleniyor(false);
                  setArizaAdresDuzenle(true);
                  setForm((f) => ({
                    ...f,
                    lat: 0,
                    lng: 0,
                    adres: "",
                  }));
                  setSeciliSehir(varsayilanSehir ?? "");
                  setSeciliIlce(varsayilanIlce ?? "");
                  setError("");
                  setBilgiMesaj("");
                  setKonumBasarisiz(false);
                }}
                className="mt-2 text-xs text-emerald-800 underline font-medium"
              >
                Konumu değiştir
              </button>
            </Card>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
                <div className="grid grid-cols-1 gap-2.5">
                  <div className="grid grid-cols-2 gap-2.5 items-end">
                    <div className="min-w-0 space-y-1.5">
                      <span className="block text-sm font-semibold text-slate-800">
                        Şehriniz
                      </span>
                      <div className="relative">
                        {!seciliSehir ? (
                          <span
                            className="pointer-events-none absolute -inset-1 rounded-xl bg-amber-400/35 blur-md animate-pulse"
                            aria-hidden
                          />
                        ) : null}
                        <SelectField
                          aria-label="Şehir"
                          className={[
                            "!py-2.5 !px-3 !pr-9 relative text-[0.9375rem]",
                            !seciliSehir
                              ? "border-amber-400 ring-2 ring-amber-300/80 shadow-[0_0_14px_3px_rgba(245,158,11,0.55)]"
                              : "",
                          ].join(" ")}
                          value={seciliSehir}
                          onChange={(e) => {
                            const il = e.target.value;
                            setSeciliSehir(il);
                            setSeciliIlce("");
                            setError("");
                            const yol = musteriKonumYolu(il || null, null);
                            if (
                              typeof window !== "undefined" &&
                              window.location.pathname !== yol
                            ) {
                              router.push(yol);
                            }
                          }}
                        >
                          <option value="">Şehir seçin</option>
                          {illerSecimSirasi(
                            acikIller.length > 0
                              ? acikIller
                              : [...KULLANIMA_ACIK_ILLER]
                          ).map((il) => (
                            <option key={il} value={il}>
                              {il}
                            </option>
                          ))}
                        </SelectField>
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
                      <SelectField
                        aria-label="İlçe"
                        className="!py-2.5 !px-3 !pr-9 text-[0.9375rem]"
                        value={seciliIlce}
                        disabled={!seciliSehir}
                        onChange={(e) => {
                          const ilce = e.target.value;
                          setSeciliIlce(ilce);
                          setError("");
                          const yol = musteriKonumYolu(
                            seciliSehir || null,
                            ilce || null
                          );
                          const hasGps = !!(form.lat && form.lng);
                          if (ilce && hasGps) {
                            setArizaAdresDuzenle(false);
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
                            if (
                              typeof window !== "undefined" &&
                              window.location.pathname !== yol
                            ) {
                              router.push(yol);
                            } else {
                              adimGit("sorun");
                            }
                            return;
                          }
                          if (
                            typeof window !== "undefined" &&
                            window.location.pathname !== yol
                          ) {
                            router.push(yol);
                          }
                        }}
                      >
                        <option value="">
                          {seciliSehir ? "İlçe seçin" : "Önce şehir"}
                        </option>
                        {seciliSehir
                          ? ilceListesi(seciliSehir).map((ilce) => (
                              <option key={ilce} value={ilce}>
                                {ilce}
                              </option>
                            ))
                          : null}
                      </SelectField>
                    </div>
                  </div>
                  <Btn
                    className="!w-full !min-h-0 !rounded-xl !py-2.5 !px-5 !text-sm"
                    onClick={async () => {
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
                              await konumKaydet(g.lat, g.lng, g.adres, false);
                            } else {
                              setForm((f) => ({ ...f, adres: adresMetni }));
                            }
                          } finally {
                            setAdresGeocodeYukleniyor(false);
                          }
                        } else if (!form.adres.trim()) {
                          setForm((f) => ({ ...f, adres: adresMetni }));
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

                      setError(
                        "Otomatik konum alın veya şehir ve ilçe seçin."
                      );
                    }}
                    disabled={adresGeocodeYukleniyor || gpsYukleniyor}
                  >
                    {adresGeocodeYukleniyor ? (
                      <span className="inline-flex items-center justify-center gap-2">
                        <Spinner className="size-4 border-white/40 border-t-white" />
                        …
                      </span>
                    ) : (
                      "Ücretsiz Teklif Al"
                    )}
                  </Btn>
                </div>
              </div>

              {gpsGuvenli ? (
                <div className="space-y-2">
                  <Btn
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setError("");
                      void konumAl(false);
                    }}
                    disabled={gpsYukleniyor}
                    className="w-full !py-3 text-sm"
                  >
                    📍 Konum kullan
                  </Btn>
                  {konumBasarisiz ? <ChromeAcSecenegi /> : null}
                </div>
              ) : (
                <GpsHttpsBanner compact />
              )}
            </div>
          )}

          {arizaKonumGpsAlindi && form.adres ? (
            <div className="space-y-2">
              <Btn
                className="w-full"
                onClick={async () => {
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
                          await konumKaydet(g.lat, g.lng, g.adres, false);
                        } else {
                          setForm((f) => ({ ...f, adres: adresMetni }));
                        }
                      } finally {
                        setAdresGeocodeYukleniyor(false);
                      }
                    } else if (!form.adres.trim()) {
                      setForm((f) => ({ ...f, adres: adresMetni }));
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
                }}
                disabled={adresGeocodeYukleniyor || gpsYukleniyor}
              >
                {adresGeocodeYukleniyor ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Spinner className="size-4 border-white/40 border-t-white" />
                    Adres işleniyor…
                  </span>
                ) : (
                  "Ücretsiz Teklif Al"
                )}
              </Btn>
            </div>
          ) : null}

          {(gpsYukleniyor || adresGeocodeYukleniyor) && (
            <div
              className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
              role="status"
            >
              <Spinner className="mt-0.5" />
              <div className="text-sm text-amber-900 leading-relaxed min-w-0">
                {gpsYukleniyor ? (
                  <>
                    <p className="font-medium">
                      {konumIzniBekleniyor
                        ? "Konum izni bekleniyor…"
                        : "Konumunuz alınıyor…"}
                    </p>
                    <p className="text-xs text-amber-800 mt-1">
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

          <>
            <AnaSayfaOzellikSeridi />
            <AnaSayfaFiyatHesaplamaTeaser />
            <AnaSayfaHizmetVerCta />
            {!varsayilanSehir ? <AnaSayfaHizliBaglantilar /> : null}
          </>

          <div className="pt-6 border-t border-slate-200 space-y-8">
            <SehirSeoIcerikBolumu
              sehirAd={seoLinkSehir || ISTANBUL_IL}
              icerik={seoIcerik}
              heroBaslik={seoHero}
              baglantilar={seoLinkler}
              bolgeLinkleri={seoBolgeChip}
              yogunluk={varsayilanSehir ? "kompakt" : "genis"}
              ozetGoster={!varsayilanSehir}
            />
            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                Diğer seçenekler
              </h2>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                {digerSecenekler.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-amber-800 underline underline-offset-2 hover:text-amber-950"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      )}

      {step === "hedef" && (
        <div className="space-y-4 pb-48">
          <h2 className="text-xl font-bold">Nereye Çekilecek?</h2>
          <p className="text-slate-500 text-sm">
            {sorunLabel
              ? googleOneriAktif
                ? `${sorunLabel} için semtinizdeki oto tamirleri ve yakındaki oto sanayileri öneriyoruz — birini seçin veya adresi siz yazın.`
                : `${sorunLabel} için semtinizdeki oto tamirleri ve yakındaki oto sanayileri öneriyoruz — birini seçin veya adresi siz yazın.`
              : "Aracınızın götürülmesini istediğiniz adresi belirtin."}
          </p>

          <div className="grid gap-2">
            <button
              type="button"
              onClick={() => enYakinHedefSec("oto_tamir")}
              disabled={oneriYukleniyor && oneriler.length === 0}
              className={`w-full rounded-xl border px-4 py-3.5 text-left font-semibold text-sm transition touch-manipulation active:scale-[0.99] disabled:opacity-50 ${
                enYakinModSeciliMi("oto_tamir") || hedefOpsiyon === "oto_tamir"
                  ? "border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-200"
                  : !hedefSeciliMi
                    ? hedefGlowSinif
                    : `${hedefNormalSinif} hover:border-blue-400`
              }`}
            >
              En yakın oto servis
              {enYakinModSeciliMi("oto_tamir") || hedefOpsiyon === "oto_tamir"
                ? " ✓"
                : ""}
            </button>
            <button
              type="button"
              onClick={() => enYakinHedefSec("oto_sanayi")}
              disabled={oneriYukleniyor && oneriler.length === 0}
              className={`w-full rounded-xl border px-4 py-3.5 text-left font-semibold text-sm transition touch-manipulation active:scale-[0.99] disabled:opacity-50 ${
                enYakinModSeciliMi("oto_sanayi") ||
                hedefOpsiyon === "oto_sanayi"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-200"
                  : !hedefSeciliMi
                    ? hedefGlowSinif
                    : `${hedefNormalSinif} hover:border-emerald-400`
              }`}
            >
              En yakın oto sanayi
              {enYakinModSeciliMi("oto_sanayi") ||
              hedefOpsiyon === "oto_sanayi"
                ? " ✓"
                : ""}
            </button>

            {hedefBilinmiyor ? (
              <div
                id="hedef-secim-ozeti"
                className="rounded-xl border border-amber-500 bg-amber-50 ring-2 ring-amber-200 overflow-hidden scroll-mt-24"
              >
                <button
                  type="button"
                  onClick={hedefBilmiyorumSec}
                  className="w-full text-left px-4 pt-3.5 pb-2 font-semibold text-sm text-amber-950"
                >
                  Bilmiyorum, sonra seçeceğim ✓
                </button>
                <div className="px-4 pb-3">
                  <p className="text-sm text-amber-900 leading-relaxed">
                    Hedefi sonra seçebilirsiniz. Tahmini sürelere ortalama{" "}
                    <strong>+{HEDEF_BILINMIYOR_EK_SURE_DK} dk</strong> eklenir.
                  </p>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={hedefBilmiyorumSec}
                className={`w-full rounded-xl border px-4 py-3.5 text-left font-semibold text-sm transition touch-manipulation active:scale-[0.99] ${
                  !hedefSeciliMi
                    ? hedefGlowSinif
                    : `${hedefNormalSinif} hover:border-amber-400`
                }`}
              >
                Bilmiyorum, sonra seçeceğim
              </button>
            )}

            {hedefKendimArat ? (
              <div
                id="hedef-secim-ozeti"
                className="rounded-xl border border-amber-500 bg-amber-50 ring-2 ring-amber-200 overflow-hidden scroll-mt-24"
              >
                <button
                  type="button"
                  onClick={hedefKendimAratSec}
                  className="w-full text-left px-4 pt-3.5 pb-2 font-semibold text-sm text-amber-950"
                >
                  Çekeceğim adresi kendim aratacağım ✓
                </button>
                <div className="px-4 pb-3 space-y-1">
                  {hedefAdresAramaAlani()}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={hedefKendimAratSec}
                className={`w-full rounded-xl border px-4 py-3.5 text-left font-semibold text-sm transition touch-manipulation active:scale-[0.99] ${
                  !hedefSeciliMi
                    ? hedefGlowSinif
                    : `${hedefNormalSinif} hover:border-amber-400`
                }`}
              >
                Çekeceğim adresi kendim aratacağım
              </button>
            )}
          </div>

          {oneriYukleniyor && oneriler.length === 0 && (
            <div
              className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
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
                ) : yeniOneriApiSayisi >= 5 ? (
                  "🔄 Önceki önerilerden rastgele"
                ) : (
                  `🔄 Yeni öneriler ver (${5 - yeniOneriApiSayisi} kaldı)`
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
                                <span className="text-xs font-semibold text-amber-700">
                                  ★ {o.puan}
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
                            className="rounded-xl border border-amber-500 bg-amber-50 ring-2 ring-amber-200 overflow-hidden scroll-mt-24"
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
                          className="w-full text-left rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-amber-400"
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
                          className="rounded-xl border border-amber-500 bg-amber-50 ring-2 ring-amber-200 overflow-hidden scroll-mt-24"
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
                        className="w-full text-left rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-amber-400"
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
      {step === "hedef" && (
        <HedefAltNav
          hedefSeciliMi={hedefSeciliMi}
          yasalOnayRef={yasalOnayRef}
          yasalOnay={yasalOnay}
          onYasalOnayChange={(checked) => {
            setYasalOnay(checked);
            if (checked) {
              setBilgiAlanMesajlari((m) => ({ ...m, yasalOnay: "" }));
            }
          }}
          yasalOnayHata={bilgiAlanMesajlari.yasalOnay}
          onGeri={oncekiAdimaDon}
          devamDisabled={hedefIleriEngelli}
          devamGlow={hedefGonderilebilir}
          devamIcerik={
            loading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Spinner className="size-4 border-white/40 border-t-white" />
                Gönderiliyor…
              </span>
            ) : adresGeocodeYukleniyor ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Spinner className="size-4 border-white/40 border-t-white" />
                Adres işleniyor…
              </span>
            ) : (
              "Ücretsiz teklif iste"
            )
          }
          onDevam={() => {
            if (!hedefGonderilebilir) return;
            if (!yasalOnay) {
              setBilgiAlanMesajlari((m) => ({
                ...m,
                yasalOnay: "Yasal metinleri onaylamanız zorunludur.",
              }));
              setError("Talep göndermek için yasal metinleri onaylayın.");
              yasalOnayaKaydir();
              return;
            }
            void hedefIleriGit();
          }}
        />
      )}
    </MobileShell>
  );
}
