"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { SorunSecimi } from "@/components/SorunSecimi";
import { Btn, Field, Spinner, TextArea } from "@/components/ui";
import {
  hizmetQuerydenSorunTipi,
  sorunAracModeliAlaniGoster,
  sorunAracModeliGerekliMi,
  sorunCagriButonEtiketi,
  sorunFotografAlaniGoster,
  sorunFotografGerekliMi,
  sorunHedefKonumGerekliMi,
  sorunLastikDurumuAlaniGoster,
  sorunLastikDurumuGerekliMi,
  sorunMetniOlustur,
  sorunTipiBul,
} from "@/lib/sorun-tipleri";
import {
  LASTIK_DURUMLARI,
  LASTIK_DURUMU_BILGI,
  lastikDurumuEtiket,
} from "@/lib/lastik-durumu";
import { GpsHttpsBanner } from "@/components/GpsHttpsBanner";
import { ChromeAcSecenegi } from "@/components/ChromeAcSecenegi";
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
import type { HedefOneriKaynak } from "@/lib/konum-oneri";
import {
  posthogKampanyaKaydet,
  posthogOlayYakala,
} from "@/lib/posthog-client";
import {
  musteriFunnelOlay,
  type MusteriFunnelId,
} from "@/lib/musteri-funnel";
import {
  musteriFunnelIdTalepKaydet,
  musteriFunnelOlayBirKez,
  musteriFunnelOlayGonder,
} from "@/lib/musteri-funnel-client";
import { gtagAdsAnaSayfaGoruntulemeDonusumu, gtagAdsFiyatTeklifiDonusumu, gtagUserDataAyarla } from "@/lib/gtag";
import { metaPixelLead, metaUserDataSakla } from "@/lib/meta-pixel";
import {
  tiktokPixelLead,
  tiktokPixelSearch,
  tiktokPixelViewContent,
} from "@/lib/tiktok-pixel";
import {
  musteriFormAdimDonusumNormalize,
  musteriFormTaslakBosMu,
  musteriFormTaslakKaydet,
  musteriFormTaslakOku,
  musteriFormTaslakSil,
  type MusteriFormAlanlari,
} from "@/lib/musteri-form-taslak";
import type { IhaleSureTipi } from "@/lib/ihale";
import { ihaleBitisHesapla } from "@/lib/ihale";
import { IhaleSureSecimi } from "@/components/musteri/IhaleSureSecimi";
import { MusteriFormIletisimOtp } from "@/components/musteri/MusteriFormIletisimOtp";
import { telefonDogrulamaHatasi } from "@/lib/telefon";
import { musteriProfilKaydet } from "@/lib/musteri-profil";
import { ARAC_DURUMLARI, aracDurumuEtiket } from "@/lib/arac-durumu";
import { aracDurumuMetniOlustur } from "@/lib/arac-tipi";
import type { ArizaFotografSlotlari } from "@/components/ArizaFotografAlani";
import { arizaFotograflariListe } from "@/components/ArizaFotografAlani";

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

const SssBolumu = dynamic(
  () =>
    import("@/components/seo/SssBolumu").then((m) => ({
      default: m.SssBolumu,
    })),
  { ssr: true }
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

const HedefOneriHarita = dynamic(
  () =>
    import("@/components/HedefOneriHarita").then((m) => ({
      default: m.HedefOneriHarita,
    })),
  {
    ssr: false,
    loading: () => (
      <div
        className="min-h-[14rem] rounded-xl border border-slate-200 bg-slate-50"
        aria-hidden
      />
    ),
  }
);

const KonumIzniYardim = dynamic(
  () =>
    import("@/components/KonumIzniYardim").then((m) => ({
      default: m.KonumIzniYardim,
    })),
  {
    ssr: false,
    loading: () => <div className="min-h-[3rem]" aria-hidden />,
  }
);

type Step = "sorun" | "hedef" | "bilgi";

/** Sorun → [hedef] → iletişim + OTP */
const STEP_SIRA: Step[] = ["sorun", "hedef", "bilgi"];
const ADIM_OLAYLARI: Partial<Record<Step, string>> = {
  hedef: "form_adim_hedef",
  bilgi: "form_adim_bilgi",
};

type MusteriDonusumSayfaProps = {
  funnelId?: MusteriFunnelId;
};

function sorunProps(sorunTipi: string): Record<string, unknown> {
  return sorunTipi ? { sorun_tipi: sorunTipi } : {};
}

export default function MusteriDonusumSayfa({
  funnelId = "b",
}: MusteriDonusumSayfaProps) {
  return (
    <Suspense
      fallback={
        <MobileShell>
          <p className="text-center text-slate-500 py-12">Yükleniyor…</p>
        </MobileShell>
      }
    >
      <MusteriDonusumSayfaIcerik funnelId={funnelId} />
    </Suspense>
  );
}

function MusteriDonusumSayfaIcerik({
  funnelId,
}: {
  funnelId: MusteriFunnelId;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [step, setStep] = useState<Step>("sorun");
  const hizmetUygulandi = useRef(false);
  const hizmetKaydirTip = useRef<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bilgiMesaj, setBilgiMesaj] = useState("");
  const [gpsYukleniyor, setGpsYukleniyor] = useState(false);
  const [adresGeocodeYukleniyor, setAdresGeocodeYukleniyor] = useState(false);
  const gpsIstekRef = useRef(0);
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
  const aracDurumuRef = useRef<HTMLDivElement>(null);
  const fotografRef = useRef<HTMLDivElement>(null);
  const arizaAdresRef = useRef<HTMLInputElement>(null);
  const konumGpsIlkDeneme = useRef(false);
  const stepRef = useRef<Step>("sorun");
  const formLatRef = useRef(0);
  const gpsYukleniyorRef = useRef(false);
  const oneriOffsetRef = useRef(0);
  /** İlk yükleme + en fazla 5 «Yeni öneriler» API çağrısından biriken havuz */
  const oneriHavuzRef = useRef<KonumOneri[]>([]);
  const yeniOneriApiSayisiRef = useRef(0);
  const [yeniOneriApiSayisi, setYeniOneriApiSayisi] = useState(0);
  const hedefOneriBaslatildi = useRef(false);
  const [aracDurumuHatasi, setAracDurumuHatasi] = useState(false);
  const [lastikDurumuHatasi, setLastikDurumuHatasi] = useState(false);
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
  });
  const [fotografSlotlari, setFotografSlotlari] =
    useState<ArizaFotografSlotlari>([null, null]);
  const fotografListesi = arizaFotograflariListe(fotografSlotlari);
  const [ihaleSureTipi, setIhaleSureTipi] = useState<IhaleSureTipi>("acil");
  const [ihaleOzelBitis, setIhaleOzelBitis] = useState("");
  const [ihaleSureHatasi, setIhaleSureHatasi] = useState(false);
  const [hedefBilinmiyor, setHedefBilinmiyor] = useState(false);
  const [hedefKendimArat, setHedefKendimArat] = useState(false);
  const [hedefHaritaAra, setHedefHaritaAra] = useState(false);
  const [hedefSecimUyari, setHedefSecimUyari] = useState("");
  const [hedefSecimParlama, setHedefSecimParlama] = useState(false);
  const hedefSecimParlamaTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  /** Kullanıcının yazdığı arama metni (bulunan tam adresten ayrı) */
  const [hedefAramaMetni, setHedefAramaMetni] = useState("");
  const [taslakHazir, setTaslakHazir] = useState(false);
  const taslakAnlikRef = useRef({
    step: "sorun" as Step,
    form,
    yasalOnay: false,
    fotografOnizleme: [null, null] as ArizaFotografSlotlari,
    fotografData: [null, null] as ArizaFotografSlotlari,
    hedefBilinmiyor: false,
    ihaleSureTipi: "acil" as IhaleSureTipi,
    ihaleOzelBitis: "",
  });

  /** App/sekme dönüşünde formu geri yükle (sessionStorage) */
  useEffect(() => {
    const t = musteriFormTaslakOku();
    if (t && !musteriFormTaslakBosMu(t)) {
      setForm(t.form);
      const adim = musteriFormAdimDonusumNormalize(t.step);
      setStep(
        adim === "hedef" && !sorunHedefKonumGerekliMi(t.form.sorunTipi)
          ? "sorun"
          : adim
      );
      setYasalOnay(t.yasalOnay);
      setFotografSlotlari(
        t.fotografData[0] || t.fotografOnizleme[0]
          ? [
              t.fotografData[0] ?? t.fotografOnizleme[0],
              t.fotografData[1] ?? t.fotografOnizleme[1],
            ]
          : t.fotografOnizleme
      );
      setHedefBilinmiyor(t.hedefBilinmiyor === true);
      if (t.ihaleSureTipi) setIhaleSureTipi(t.ihaleSureTipi);
      if (t.ihaleOzelBitis) setIhaleOzelBitis(t.ihaleOzelBitis);
    }
    setTaslakHazir(true);
  }, []);

  useEffect(() => {
    setGpsGuvenli(konumGuvenliMi());
    posthogKampanyaKaydet();
    musteriFunnelOlayBirKez(funnelId, "goruldu", {
      props: { content_name: "musteri_donusum" },
    });
    musteriFunnelOlay("request_page_view", { funnel: funnelId });
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
    if (hizmetUygulandi.current) return;
    const tip =
      hizmetQuerydenSorunTipi(searchParams.get("sorun")) ??
      hizmetQuerydenSorunTipi(searchParams.get("hizmet"));
    if (!tip) return;
    hizmetUygulandi.current = true;
    hizmetKaydirTip.current = tip;
    setForm((f) => ({ ...f, sorunTipi: tip }));
    setStep("sorun");
    posthogOlayYakala("sorun_secildi", {
      sorun_tipi: tip,
      kaynak: searchParams.get("sorun") ? "sorun_query" : "hizmet_query",
    });
    musteriFunnelOlay("service_selected", {
      sorun_tipi: tip,
      kaynak: searchParams.get("sorun") ? "sorun_query" : "hizmet_query",
      funnel: funnelId,
    });
    musteriFunnelOlayBirKez(funnelId, "service_selected", {
      props: { sorun_tipi: tip },
      analitik: false,
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

  /** Adım 2+ parçalarını sorun seçiminden sonra ısıt (foto / konum yardım) */
  useEffect(() => {
    if (step === "sorun") return;
    void import("@/components/ArizaFotografAlani");
    void import("@/components/KonumIzniYardim");
  }, [step]);

  stepRef.current = step;
  formLatRef.current = form.lat;
  gpsYukleniyorRef.current = gpsYukleniyor;
  taslakAnlikRef.current = {
    step,
    form,
    yasalOnay,
    fotografOnizleme: fotografSlotlari,
    fotografData: fotografSlotlari,
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
      fotografOnizleme: fotografSlotlari,
      fotografData: fotografSlotlari,
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
    fotografSlotlari,
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
    if (step === "sorun") {
      setAracDurumuHatasi(false);
      setFotografHatasi(false);
      setSorunDetayHatasi(false);
      setArizaAdresDuzenle(false);
    }
    setBilgiAlanMesajlari({ yasalOnay: "", telefon: "" });
  }, [step]);

  useEffect(() => {
    if (step !== "sorun") return;
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
      if (
        stepRef.current === "sorun" &&
        izin === "granted" &&
        !formLatRef.current &&
        !gpsYukleniyorRef.current
      ) {
        void konumAl(false);
      }
    });
  }, [step]);

  useEffect(() => {
    if (step !== "sorun") {
      konumGpsIlkDeneme.current = false;
      return;
    }
    if (konumGpsIlkDeneme.current || !konumGuvenliMi()) return;
    if (form.lat && form.lng) return;
    if (!form.sorunTipi) return;

    konumGpsIlkDeneme.current = true;
    void konumAl(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sorun seçilince bir kez GPS dene
  }, [step, form.sorunTipi]);

  useEffect(() => {
    if (step !== "sorun" || gpsYukleniyor) return;
    if (form.lat && form.lng) {
      setArizaAdresDuzenle(false);
      return;
    }
    if (!konumGpsIlkDeneme.current) return;
    window.requestAnimationFrame(() => {
      arizaAdresRef.current?.focus({ preventScroll: true });
    });
  }, [step, gpsYukleniyor, form.lat, form.lng]);

  function scrollBelowStickyHeader(el: HTMLElement | null) {
    if (!el) return;
    const header = document.getElementById("app-shell-header");
    const headerH = header?.getBoundingClientRect().height ?? 160;
    const gap = 16;
    const top = el.getBoundingClientRect().top + window.scrollY - headerH - gap;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  function detayAdimiDevam(): boolean {
    const detayEksik =
      form.sorunTipi === "diger" && !form.sorunDetay.trim();
    const aracEksik =
      sorunAracModeliGerekliMi(form.sorunTipi) && !form.aracDurumu.trim();
    const lastikEksik =
      sorunLastikDurumuGerekliMi(form.sorunTipi) && !form.lastikDurumu.trim();
    const fotografEksik =
      sorunFotografGerekliMi(form.sorunTipi) && fotografListesi.length === 0;

    setSorunDetayHatasi(detayEksik);
    if (detayEksik) {
      setError("Lütfen sorununuzu kısaca açıklayın.");
      return false;
    }
    setLastikDurumuHatasi(lastikEksik);
    if (lastikEksik) {
      setError("Lastik durumunu seçin.");
      return false;
    }
    if (aracEksik || fotografEksik) {
      konumZorunluAlanHatasiGoster(aracEksik, fotografEksik);
      return false;
    }
    setError("");
    setAracDurumuHatasi(false);
    setFotografHatasi(false);
    setSorunDetayHatasi(false);
    return true;
  }

  function konumZorunluAlanHatasiGoster(
    aracEksik: boolean,
    fotografEksik: boolean
  ) {
    setAracDurumuHatasi(aracEksik);
    setFotografHatasi(fotografEksik);

    const parcalar: string[] = [];
    if (fotografEksik) parcalar.push("arıza fotoğrafı");
    if (aracEksik) parcalar.push("araç durumu");
    setError(
      `Devam etmek için ${parcalar.join(" ve ")} zorunludur — lütfen doldurun.`
    );

    const hedef = fotografEksik
      ? fotografRef.current
      : aracEksik
        ? aracDurumuRef.current
        : null;
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        scrollBelowStickyHeader(hedef);
      });
    });
  }

  function update(field: string, value: string | number) {
    if (field === "aracDurumu") {
      setAracDurumuHatasi(false);
    }
    if (field === "lastikDurumu") {
      setLastikDurumuHatasi(false);
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

  function adimGit(hedef: Step) {
    const hedefIdx = STEP_SIRA.indexOf(hedef);
    const sorunIdx = STEP_SIRA.indexOf("sorun");

    if (hedefIdx > sorunIdx) {
      if (!form.sorunTipi) {
        setError("Lütfen sorununuzu seçin.");
        musteriFunnelOlay("form_validation_error", { alan: "sorunTipi" });
        setStep("sorun");
        return;
      }
      const konumHazir = !!form.adres.trim() || (!!form.lat && !!form.lng);
      if (!konumHazir) {
        setError("Arıza konumu gerekli. GPS paylaşın veya adresi yazın.");
        musteriFunnelOlay("form_validation_error", { alan: "konum" });
        setStep("sorun");
        return;
      }
    }

    setStep(hedef);
    setError("");
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
      setError("");
      setForm((f) => ({
        ...f,
        lat,
        lng,
        adres,
        ...(kaynak ? { konumKaynak: kaynak } : {}),
      }));
    }
  }

  function gpsIptal() {
    gpsIstekRef.current += 1;
    setGpsYukleniyor(false);
    setKonumIzniBekleniyor(false);
  }

  async function konumAl(hedef = false) {
    const istekId = ++gpsIstekRef.current;
    setGpsYukleniyor(true);
    setError("");
    setKonumIzniBekleniyor(false);

    if (!navigator.geolocation) {
      setError("Tarayıcınız konum desteklemiyor. Adresi elle yazın.");
      if (gpsIstekRef.current === istekId) setGpsYukleniyor(false);
      return;
    }
    if (!konumGuvenliMi()) {
      setGpsGuvenli(false);
      setKonumIzni("unknown");
      setError(
        "GPS için https:// adresi gerekli. Yukarıdaki «HTTPS ile aç» butonunu kullanın veya adresi aşağıya yazın."
      );
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
        setBilgiMesaj("✓ GPS konumu alındı.");
        musteriFunnelOlay("location_confirmed", sorunProps(form.sorunTipi));
      }
      setKonumIzni("granted");
      setKonumIzniBekleniyor(false);
    } catch (e) {
      if (gpsIstekRef.current !== istekId) return;
      const code =
        e && typeof e === "object" && "code" in e
          ? (e as GeolocationPositionError).code
          : undefined;
      if (code === 1) {
        setKonumIzni("denied");
        setKonumIzniBekleniyor(false);
        musteriFunnelOlay("gps_denied", sorunProps(form.sorunTipi));
      }
      setError(konumHataMesaji(code));
    } finally {
      if (gpsIstekRef.current === istekId) {
        setGpsYukleniyor(false);
        setKonumIzniBekleniyor(false);
      }
    }
  }

  async function konumIzniYenile() {
    setError("");
    await konumAl(false);
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
          setStep("sorun");
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

  function hedefSecimUyariGoster() {
    setHedefSecimUyari(
      "Devam etmek için bir hedef seçin: bilmiyorum, haritadan ara veya adresi yazın."
    );
    setHedefSecimParlama(true);
    if (hedefSecimParlamaTimer.current) {
      clearTimeout(hedefSecimParlamaTimer.current);
    }
    hedefSecimParlamaTimer.current = setTimeout(() => {
      setHedefSecimParlama(false);
      hedefSecimParlamaTimer.current = null;
    }, 2200);
  }

  function hedefSecimUyariTemizle() {
    setHedefSecimUyari("");
    setHedefSecimParlama(false);
    if (hedefSecimParlamaTimer.current) {
      clearTimeout(hedefSecimParlamaTimer.current);
      hedefSecimParlamaTimer.current = null;
    }
  }

  function oneriSec(o: KonumOneri) {
    hedefSecimUyariTemizle();
    setHedefBilinmiyor(false);
    setHedefKendimArat(false);
    setHedefHaritaAra(true);
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
    hedefSecimUyariTemizle();
    setHedefBilinmiyor(false);
    setHedefKendimArat(false);
    setHedefHaritaAra(true);
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
    hedefSecimUyariTemizle();
    setHedefKendimArat(false);
    setHedefHaritaAra(false);
    setHedefBilinmiyor(true);
    musteriFunnelOlay("destination_selected", {
      ...sorunProps(form.sorunTipi),
      mod: "bilmiyorum",
    });
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
    hedefSecimUyariTemizle();
    setHedefBilinmiyor(false);
    setHedefHaritaAra(false);
    setHedefKendimArat(true);
    if (!hedefAramaMetni.trim() && form.hedefAdres.trim() && !form.hedefLat) {
      setHedefAramaMetni(form.hedefAdres);
    }
    hedefAlanaKaydir("hedef-secim-ozeti");
  }

  function hedefHaritaAraSec() {
    setError("");
    hedefSecimUyariTemizle();
    setHedefBilinmiyor(false);
    setHedefKendimArat(false);
    setHedefHaritaAra(true);
    musteriFunnelOlay("destination_map_open", sorunProps(form.sorunTipi));
    if (oneriler.length === 0 && !oneriYukleniyor) {
      void cozumOner(false);
    }
    hedefAlanaKaydir("hedef-harita-paneli");
  }

  function hedefFotografKontrol(): boolean {
    setFotografHatasi(false);
    const sure = ihaleBitisHesapla(ihaleSureTipi, {
      ozelBitis: ihaleOzelBitis,
    });
    if (!sure.ok) {
      setIhaleSureHatasi(true);
      setError(sure.hata);
      return false;
    }
    setIhaleSureHatasi(false);
    return true;
  }

  async function hedefIleriGit() {
    if (gpsYukleniyor) gpsIptal();
    if (!hedefFotografKontrol()) return;

    const hedefHazir =
      hedefBilinmiyor ||
      Boolean(form.hedefLat && form.hedefLng && form.hedefAdres.trim()) ||
      (hedefKendimArat &&
        Boolean(hedefAramaMetni.trim() || form.hedefAdres.trim()));

    if (!hedefHazir) {
      hedefSecimUyariGoster();
      return;
    }

    if (hedefBilinmiyor) {
      musteriFunnelOlay("destination_selected", {
        ...sorunProps(form.sorunTipi),
        mod: "bilmiyorum",
      });
      adimGit("bilgi");
      return;
    }
    if (hedefHaritaAra && form.hedefLat && form.hedefLng && form.hedefAdres.trim()) {
      musteriFunnelOlay("destination_selected", {
        ...sorunProps(form.sorunTipi),
        mod: "harita",
      });
      adimGit("bilgi");
      return;
    }
    if (await adresKoordinatDoldur(true)) {
      musteriFunnelOlay("destination_selected", {
        ...sorunProps(form.sorunTipi),
        mod: "adres",
      });
      adimGit("bilgi");
    } else {
      musteriFunnelOlay("address_not_found", sorunProps(form.sorunTipi));
    }
  }

  const hedefIleriEngelli =
    loading ||
    (!hedefBilinmiyor &&
      (!form.hedefAdres.trim() || adresGeocodeYukleniyor));

  function hedefNavButonlari(className = "mt-3") {
    return (
      <div className={className}>
        <Btn
          className="w-full"
          onClick={() => {
            void hedefIleriGit();
          }}
          disabled={hedefIleriEngelli}
        >
          {loading ? (
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
            "Devam Et"
          )}
        </Btn>
      </div>
    );
  }

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
    if (hedefBilinmiyor || hedefKendimArat || !hedefHaritaAra || !form.hedefLat)
      return false;
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
    const telHata = telefonDogrulamaHatasi(form.telefon);
    if (telHata) {
      setError(telHata);
      setBilgiAlanMesajlari((m) => ({ ...m, telefon: telHata }));
      setStep("bilgi");
      return;
    }
    if (!form.ad.trim()) {
      setError("İsminizi girin.");
      setStep("bilgi");
      return;
    }
    if (!yasalOnay) {
      setError("Talep göndermek için yasal metinleri onaylayın.");
      setBilgiAlanMesajlari((m) => ({
        ...m,
        yasalOnay: "Yasal metinleri onaylamanız zorunludur.",
      }));
      setStep("bilgi");
      return;
    }
    if (!form.adres) {
      setError("Arıza konumu gerekli.");
      setStep("sorun");
      return;
    }
    if (!form.sorunTipi) {
      setError("Lütfen sorununuzu seçin.");
      setStep("sorun");
      return;
    }
    if (form.sorunTipi === "diger" && !form.sorunDetay.trim()) {
      setError("Lütfen sorununuzu kısaca açıklayın.");
      setStep(sorunHedefKonumGerekliMi(form.sorunTipi) ? "hedef" : "sorun");
      return;
    }
    if (sorunLastikDurumuGerekliMi(form.sorunTipi) && !form.lastikDurumu.trim()) {
      setError("Lastik durumunu seçin.");
      setStep("sorun");
      return;
    }
    if (sorunAracModeliGerekliMi(form.sorunTipi) && !form.aracDurumu.trim()) {
      setError("Araç durumunu seçin.");
      setStep(sorunHedefKonumGerekliMi(form.sorunTipi) ? "hedef" : "sorun");
      return;
    }
    if (sorunFotografGerekliMi(form.sorunTipi) && fotografListesi.length === 0) {
      setError("Araç ve arıza fotoğrafı gerekli.");
      setStep(sorunHedefKonumGerekliMi(form.sorunTipi) ? "hedef" : "sorun");
      return;
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

    const musteriAd = form.ad.trim();
    const musteriSoyad = form.soyad.trim() || "-";
    musteriProfilKaydet(form.telefon, musteriAd, musteriSoyad);
    metaUserDataSakla({
      phone: form.telefon,
      firstName: musteriAd,
      lastName: musteriSoyad !== "-" ? musteriSoyad : undefined,
    });
    gtagUserDataAyarla({
      phone: form.telefon,
      firstName: musteriAd,
      lastName: musteriSoyad !== "-" ? musteriSoyad : undefined,
    });

    setLoading(true);
    const hedefGerekli =
      sorunHedefKonumGerekliMi(form.sorunTipi) && !hedefBilinmiyor;
    try {
      const res = await fetch("/api/talep", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ad: musteriAd,
          soyad: musteriSoyad,
          telefon: form.telefon,
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
          sorunDetay: form.sorunDetay,
          lastikDurumu: form.lastikDurumu.trim() || undefined,
          aracModeli: aracDurumuMetniOlustur(
            form.aracTipi,
            aracDurumuEtiket(form.aracDurumu) ?? ""
          ),
          fotograflar: fotografListesi.length ? fotografListesi : undefined,
          sorun: (() => {
            const temel = sorunMetniOlustur(form.sorunTipi, form.sorunDetay);
            const lastik = lastikDurumuEtiket(form.lastikDurumu);
            return lastik ? `${temel} · ${lastik}` : temel;
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
      musteriFunnelOlay("request_submitted", {
        sorun_tipi: form.sorunTipi,
        bildirilen_sayisi: data.bildirilenSayisi ?? 0,
      });
      void musteriFunnelOlayGonder(funnelId, "talep_olustur", {
        talepId: typeof data.id === "string" ? data.id : String(data.id ?? ""),
        telefon: form.telefon,
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
        if (form.telefon.trim()) {
          sessionStorage.setItem(
            `acil_bekle_tel_${data.id}`,
            form.telefon.trim()
          );
        }
        if (sessionStorage.getItem(`acil_meta_lead_${data.id}`) !== "1") {
          sessionStorage.setItem(`acil_meta_lead_${data.id}`, "1");
          metaPixelLead({
            content_name: form.sorunTipi || "musteri_talep",
            externalId:
              typeof data.id === "string" ? data.id : String(data.id ?? ""),
            phone: form.telefon,
            firstName: musteriAd,
            lastName: musteriSoyad !== "-" ? musteriSoyad : undefined,
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
          phone: form.telefon,
          firstName: musteriAd,
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

  const steps: { key: Step; label: string }[] = STEP_SIRA.filter(
    (s) => s !== "hedef" || hedefKonumGerekli
  ).map((key, i) => ({ key, label: String(i + 1) }));

  function oncekiAdimaDon() {
    musteriFunnelOlay("back_button_clicked", { step, ...sorunProps(form.sorunTipi) });
    const idx = steps.findIndex((s) => s.key === step);
    if (idx > 0) {
      adimGit(steps[idx - 1]!.key);
      return;
    }
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    }
  }

  const arızaKonumuHazir =
    !!form.adres.trim() || (!!form.lat && !!form.lng);

  const devamEtEngelli = adresGeocodeYukleniyor;

  const arızaKoordinatiVar = !!(form.lat && form.lng);
  const arizaKonumGpsAlindi = arızaKoordinatiVar && !arizaAdresDuzenle;
  const cozumOneriAktif =
    !!form.sorunTipi && (arızaKoordinatiVar || !!form.adres.trim());

  const googleOneriAktif = googleMapsYapilandirildi();

  useEffect(() => {
    if (step === "hedef" && !hedefKonumGerekli) {
      setStep("sorun");
    }
  }, [step, hedefKonumGerekli]);

  useEffect(() => {
    if (step === "hedef") {
      musteriFunnelOlay("destination_view", sorunProps(form.sorunTipi));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => {
    if (!hedefSecimUyari || step !== "hedef") return;
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document
          .getElementById("hedef-secim-uyari")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }, [hedefSecimUyari, step]);

  useEffect(() => {
    return () => {
      if (hedefSecimParlamaTimer.current) {
        clearTimeout(hedefSecimParlamaTimer.current);
      }
    };
  }, []);

  const adimIlerlemeCubugu = (
    <div className="w-full space-y-1">
      <p className="text-[11px] font-medium text-slate-600 text-center tabular-nums">
        {(() => {
          const idx = Math.max(0, steps.findIndex((s) => s.key === step));
          const etiket =
            step === "sorun"
              ? "Sorun ve konum"
              : "Hedef";
          return `${idx + 1} / ${steps.length} — ${etiket}`;
        })()}
      </p>
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
                  ? "bg-amber-500 shadow-[0_0_8px_1px_rgba(245,158,11,0.5)]"
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
    </div>
  );

  const adimUstBilgi = (
    <div className="w-full space-y-1">
      <HizmetVerenSayimAlani
        sorunTipi={form.sorunTipi || null}
        compact
      />
      {adimIlerlemeCubugu}
    </div>
  );

  return (
    <MobileShell
      subtitle={undefined}
      subtitleAlign="center"
      brandAlign={step === "sorun" ? "left" : "right"}
      backLabel={step === "sorun" ? undefined : "Geri"}
      onBack={step === "sorun" ? undefined : oncekiAdimaDon}
      headerCenter={step === "sorun" ? undefined : adimUstBilgi}
      headerCompact={step === "sorun"}
      headerEnd={
        step === "sorun" ? (
          <Link
            href="/cekici/giris"
            className="text-[11px] font-medium text-slate-400 hover:text-slate-600 touch-manipulation max-w-[7.5rem] text-right leading-tight"
          >
            Firma Girişi
          </Link>
        ) : undefined
      }
      onBrandClick={() => {
        setStep("sorun");
        setError("");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      footer={<YasalSiteFooter />}
    >
      <h1 className="sr-only">
        Acil çekici, lastikçi ve yol yardım — yakınınızdaki hizmet verenlerden
        teklif alın
      </h1>

      {error && !(step === "sorun" && form.sorunTipi) && (
        <div className="mb-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {bilgiMesaj && (step === "sorun" || step === "hedef" || step === "bilgi") && (
        <div className="mb-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
          {bilgiMesaj}
        </div>
      )}

      {step === "sorun" && (
        <div className="space-y-2.5 animate-fade-in">
          <div>
            <h2 className="text-[2.05rem] sm:text-[2.25rem] font-bold leading-[1.15] tracking-tight text-slate-900">
              Yolda mı kaldınız?
            </h2>
            <p className="mt-2 text-[1.45rem] sm:text-[1.55rem] font-bold leading-snug text-slate-800">
              Kayıt olmadan 2 dakikada
              <br />
              <span className="text-amber-600">10+ çekiciden teklif alın.</span>
            </p>
            <p className="mt-2 text-[17px] leading-snug text-slate-600">
              Fiyatları karşılaştırın, uygun olanı siz seçin.
            </p>
          </div>

          <div className="text-xs text-slate-700 leading-snug space-y-0.5">
            <p>
              <span className="text-emerald-600 font-semibold">✓</span> Ücretsiz
              {" "}
              <span className="text-emerald-600 font-semibold">✓</span> Ödeme
              yok
            </p>
            <p>
              <span className="text-emerald-600 font-semibold">✓</span>{" "}
              Bilgileriniz yalnızca seçtiğiniz çekici ile paylaşılır
            </p>
          </div>

          <HizmetVerenSayimAlani sorunTipi={form.sorunTipi || null} />

          <SorunSecimi
            seciliTip={form.sorunTipi}
            detay={form.sorunDetay}
            onTipSec={(id) => {
              update("sorunTipi", id);
              if (id !== "lastik") {
                update("lastikDurumu", "");
                setLastikDurumuHatasi(false);
              }
              posthogOlayYakala("sorun_secildi", { sorun_tipi: id });
              musteriFunnelOlay("service_selected", { sorun_tipi: id });
              musteriFunnelOlayBirKez(funnelId, "service_selected", {
                props: { sorun_tipi: id },
                analitik: false,
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
            kompaktKart
            konumIcerik={
              form.sorunTipi ? (
                <div id="ariza-konumu" className="space-y-2">
                  {sorunLastikDurumuAlaniGoster(form.sorunTipi) && (
                    <div className="space-y-2 mb-3">
                      <p className="text-sm font-semibold text-slate-800">
                        Lastik durumu{" "}
                        <span className="text-red-600 font-medium">
                          (zorunlu)
                        </span>
                      </p>
                      <div
                        className="grid grid-cols-1 gap-1.5"
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
                                update("lastikDurumu", secili ? "" : d.id);
                                setLastikDurumuHatasi(false);
                              }}
                              className={`w-full text-left rounded-xl border px-3 py-2.5 text-sm font-medium transition touch-manipulation ${
                                secili
                                  ? "border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-500/25"
                                  : lastikDurumuHatasi
                                    ? "border-red-400 bg-white text-slate-800"
                                    : "border-slate-200 bg-white text-slate-800 hover:border-amber-300"
                              }`}
                            >
                              {d.etiket}
                              {secili ? (
                                <span className="float-right text-amber-600">
                                  ✓
                                </span>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-950 leading-relaxed">
                        {LASTIK_DURUMU_BILGI}
                      </div>
                      {lastikDurumuHatasi ? (
                        <p className="text-sm text-red-600" role="alert">
                          Lastik durumunu seçin.
                        </p>
                      ) : null}
                    </div>
                  )}
                  {error && (
                    <div
                      className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700"
                      role="alert"
                    >
                      {error}
                    </div>
                  )}
                  {!gpsGuvenli && <GpsHttpsBanner compact />}

                  {(gpsYukleniyor || adresGeocodeYukleniyor) && (
                    <div
                      className="flex items-start gap-2.5 rounded-lg border border-amber-300 bg-white/80 px-3 py-2.5"
                      role="status"
                    >
                      <Spinner className="mt-0.5 size-4 shrink-0" />
                      <div className="text-sm text-amber-950 leading-snug min-w-0">
                        {gpsYukleniyor ? (
                          <>
                            <p className="font-medium">
                              {konumIzniBekleniyor
                                ? "Konum izni bekleniyor…"
                                : "Konumunuz alınıyor…"}
                            </p>
                            <p className="text-xs text-amber-800 mt-0.5">
                              İzin penceresinde «İzin Ver»e dokunun.
                            </p>
                          </>
                        ) : (
                          <p className="font-medium">Adres doğrulanıyor…</p>
                        )}
                      </div>
                    </div>
                  )}

                  {arizaKonumGpsAlindi && form.adres.trim() ? (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                      <p className="text-[10px] text-emerald-700 uppercase tracking-wide mb-0.5">
                        Arıza konumu (GPS)
                      </p>
                      <p className="text-sm text-emerald-900 leading-snug">
                        {form.adres}
                      </p>
                      <button
                        type="button"
                        onClick={() => setArizaAdresDuzenle(true)}
                        className="mt-1.5 text-xs text-emerald-800 underline font-medium"
                      >
                        Adresi düzelt
                      </button>
                    </div>
                  ) : null}

                  {!arizaKonumGpsAlindi && !gpsYukleniyor && (
                    <div className="space-y-2">
                      <Field
                        ref={arizaAdresRef}
                        label="Arıza adresi"
                        placeholder="Örn. İstanbul, Bayrampaşa, mahalle, sokak…"
                        value={form.adres}
                        onChange={(e) => update("adres", e.target.value)}
                        onBlur={() => {
                          if (form.adres.trim().length >= 6 && !form.lat) {
                            void geocodeAdres(form.adres).then((g) => {
                              if (g)
                                void konumKaydet(
                                  g.lat,
                                  g.lng,
                                  g.adres,
                                  false,
                                  "manuel"
                                );
                            });
                          }
                        }}
                      />
                      {gpsGuvenli && (
                        <>
                          <Btn
                            type="button"
                            className="w-full !py-2.5 text-sm"
                            onClick={() => {
                              void konumAl(false).then(() => {
                                musteriFunnelOlay(
                                  "location_confirmed",
                                  sorunProps(form.sorunTipi)
                                );
                              });
                            }}
                            disabled={gpsYukleniyor}
                          >
                            📍 Konumumu kullan
                          </Btn>
                          <KonumIzniYardim
                            durum={konumIzni}
                            gpsGuvenli={gpsGuvenli}
                            bekleniyor={konumIzniBekleniyor}
                          />
                          {konumIzni !== "denied" && <ChromeAcSecenegi />}
                        </>
                      )}
                    </div>
                  )}

                </div>
              ) : null
            }
            devamDisabled={devamEtEngelli || loading}
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
                "Devam Et"
              )
            }
            onDevam={async () => {
              setError("");
              if (!form.sorunTipi) {
                setError("Lütfen sorununuzu seçin.");
                return;
              }
              if (!arızaKonumuHazir) {
                if (gpsYukleniyor) gpsIptal();
                setError(
                  "Arıza konumu gerekli. GPS paylaşın veya adresi yazın."
                );
                musteriFunnelOlay("form_validation_error", {
                  alan: "konum",
                });
                return;
              }
              if (!hedefKonumGerekli && !detayAdimiDevam()) return;
              if (gpsYukleniyor) gpsIptal();
              const ok = await adresKoordinatDoldur(false);
              if (!ok) return;
              musteriFunnelOlay(
                "location_confirmed",
                sorunProps(form.sorunTipi)
              );
              musteriFunnelOlay(
                "request_started",
                sorunProps(form.sorunTipi)
              );
              if (hedefKonumGerekli) {
                adimGit("hedef");
              } else {
                adimGit("bilgi");
              }
            }}
          />

          {form.sorunTipi && !hedefKonumGerekli ? (
            <details className="rounded-xl border border-slate-200 bg-white px-3 py-2">
              <summary className="cursor-pointer text-sm font-medium text-slate-800 touch-manipulation">
                Araç ve fotoğraf bilgisi ekle — opsiyonel
              </summary>
              <div className="mt-3 space-y-3 pb-1">
                {sorunFotografAlaniGoster(form.sorunTipi) && (
                  <div ref={fotografRef}>
                    <ArizaFotografAlani
                      fotograflar={fotografSlotlari}
                      invalid={fotografHatasi}
                      zorunlu={sorunFotografGerekliMi(form.sorunTipi)}
                      onDegisti={(slotlar) => {
                        setFotografSlotlari(slotlar);
                        if (arizaFotograflariListe(slotlar).length > 0) {
                          setFotografHatasi(false);
                        }
                      }}
                    />
                    {sorunFotografGerekliMi(form.sorunTipi) ? (
                      <p className="text-xs text-amber-700 mt-1">Zorunlu</p>
                    ) : (
                      <p className="text-xs text-slate-500 mt-1">Opsiyonel</p>
                    )}
                  </div>
                )}
                {sorunAracModeliAlaniGoster(form.sorunTipi) && (
                  <div ref={aracDurumuRef} className="space-y-2 scroll-mt-24">
                    <p className="text-sm font-semibold text-slate-800">
                      Aracın durumu
                    </p>
                    <div
                      className="grid grid-cols-1 gap-1.5"
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
                              update("aracDurumu", secili ? "" : d.id);
                              setAracDurumuHatasi(false);
                            }}
                            className={`w-full text-left rounded-xl border px-3 py-2.5 text-sm font-medium transition touch-manipulation ${
                              secili
                                ? "border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-500/25"
                                : aracDurumuHatasi
                                  ? "border-red-400 bg-white text-slate-800"
                                  : "border-slate-200 bg-white text-slate-800 hover:border-amber-300"
                            }`}
                          >
                            {d.etiket}
                            {secili ? (
                              <span className="float-right text-amber-600">
                                ✓
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                    {aracDurumuHatasi ? (
                      <p className="text-sm text-red-600" role="alert">
                        Araç durumunu seçin.
                      </p>
                    ) : null}
                  </div>
                )}
                {form.sorunTipi === "diger" ? (
                  <TextArea
                    label="Sorununuzu açıklayın"
                    placeholder="Kısaca yazın…"
                    value={form.sorunDetay}
                    onChange={(e) => update("sorunDetay", e.target.value)}
                    rows={2}
                  />
                ) : (
                  <TextArea
                    label="Teklif notu (isteğe bağlı)"
                    placeholder={
                      "Örn:\nKaza yaptım, aracımı en yakın servise götürmek istiyorum\nOtoyolda kaldım, sağ şeritteyim\nMotor çalışmıyor, evime çekilsin"
                    }
                    value={form.sorunDetay}
                    onChange={(e) => update("sorunDetay", e.target.value)}
                    rows={4}
                    className="whitespace-pre-line"
                  />
                )}
              </div>
            </details>
          ) : null}

          <NasilCalisirSerit aktifFormAdimi={step} />
        </div>
      )}

      {step === "hedef" && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold">Aracınız nereye götürülecek?</h2>
            <p className="text-slate-500 text-sm mt-1">
              Haritadan oto tamir seçin, adresi yazın veya bilmiyorum deyin.
            </p>
          </div>

          {hedefSecimUyari && (
            <div
              id="hedef-secim-uyari"
              className="rounded-xl bg-amber-50 border border-amber-300 px-4 py-3 text-sm text-amber-950 scroll-mt-24"
              role="alert"
            >
              {hedefSecimUyari}
            </div>
          )}

          {hedefBilinmiyor ? (
            <div
              id="hedef-secim-ozeti"
              className={`rounded-xl border border-amber-500 bg-amber-50 ring-2 ring-amber-200 overflow-hidden scroll-mt-24 ${
                hedefSecimParlama ? "animate-hedef-secim-parla" : ""
              }`}
            >
              <button
                type="button"
                onClick={hedefBilmiyorumSec}
                className="w-full text-left px-4 pt-3.5 pb-2 font-semibold text-sm text-amber-950"
              >
                Bilmiyorum, çekiciyle birlikte karar vereceğim ✓
              </button>
              <div className="px-4 pb-3">
                <p className="text-sm text-amber-900 leading-relaxed">
                  Hedefi sonra seçebilirsiniz.
                </p>
                {hedefNavButonlari()}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={hedefBilmiyorumSec}
              className={`w-full rounded-xl border bg-white px-4 py-3.5 text-left font-semibold text-sm text-slate-900 transition touch-manipulation hover:border-amber-400 ${
                hedefSecimParlama
                  ? "border-amber-500 animate-hedef-secim-parla"
                  : "border-slate-200"
              }`}
            >
              Bilmiyorum, çekiciyle birlikte karar vereceğim
            </button>
          )}

          {hedefHaritaAra ? (
            <div
              id="hedef-harita-paneli"
              className={`rounded-xl border border-amber-500 bg-amber-50/40 ring-2 ring-amber-200 overflow-hidden scroll-mt-24 ${
                hedefSecimParlama ? "animate-hedef-secim-parla" : ""
              }`}
            >
              <button
                type="button"
                onClick={hedefHaritaAraSec}
                className="w-full text-left px-4 pt-3.5 pb-2 font-semibold text-sm text-amber-950 bg-amber-50"
              >
                Haritadan Oto Tamir Ara ✓
              </button>
              <div className="px-3 pb-3 space-y-3 bg-white/80">
                <div className="grid gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => enYakinHedefSec("oto_tamir")}
                    disabled={oneriYukleniyor && oneriler.length === 0}
                    className={`w-full rounded-xl border px-4 py-3 text-left font-semibold text-sm transition touch-manipulation disabled:opacity-50 ${
                      enYakinModSeciliMi("oto_tamir")
                        ? "border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-200"
                        : "border-slate-200 bg-white text-slate-900 hover:border-blue-400"
                    }`}
                  >
                    En yakın oto servis
                    {enYakinModSeciliMi("oto_tamir") ? " ✓" : ""}
                  </button>
                  <button
                    type="button"
                    onClick={() => enYakinHedefSec("oto_sanayi")}
                    disabled={oneriYukleniyor && oneriler.length === 0}
                    className={`w-full rounded-xl border px-4 py-3 text-left font-semibold text-sm transition touch-manipulation disabled:opacity-50 ${
                      enYakinModSeciliMi("oto_sanayi")
                        ? "border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-200"
                        : "border-slate-200 bg-white text-slate-900 hover:border-emerald-400"
                    }`}
                  >
                    En yakın oto sanayi
                    {enYakinModSeciliMi("oto_sanayi") ? " ✓" : ""}
                  </button>
                </div>

                {oneriYukleniyor && oneriler.length === 0 && (
                  <div
                    className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
                    role="status"
                  >
                    <Spinner className="mt-0.5" />
                    <p className="text-sm font-medium text-amber-900">
                      {googleOneriAktif
                        ? "Semtinizdeki oto tamir ve oto sanayiler aranıyor…"
                        : "Yakın oto tamir ve oto sanayiler aranıyor…"}
                    </p>
                  </div>
                )}

                {!cozumOneriAktif && !oneriYukleniyor && (
                  <p className="text-xs text-slate-500 text-center">
                    Öneri için önce arıza konumu gerekli.
                  </p>
                )}

                {oneriler.length > 0 && (
                  <div className="space-y-3">
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
                        "Önceki önerilerden rastgele"
                      ) : (
                        `Yeni öneriler (${5 - yeniOneriApiSayisi} kaldı)`
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
                      const liste = oneriler.filter(
                        (o) => o.kategori === grup.key
                      );
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
                                  <p className="font-medium text-slate-900 min-w-0 text-sm">
                                    <span
                                      className={`inline-flex size-5 items-center justify-center rounded-full text-xs font-bold mr-2 align-middle ${grup.pin}`}
                                    >
                                      {no}
                                    </span>
                                    {o.ad}
                                  </p>
                                  {o.puan != null && (
                                    <span className="shrink-0 text-xs font-semibold text-amber-700">
                                      ★ {o.puan}
                                    </span>
                                  )}
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
                                    className="w-full text-left px-4 pt-3 pb-2"
                                  >
                                    {icerik}
                                  </button>
                                  <div className="px-4 pb-3">
                                    {hedefNavButonlari()}
                                  </div>
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
                  </div>
                )}

                {!oneriYukleniyor &&
                  cozumOneriAktif &&
                  oneriler.length === 0 && (
                    <Btn
                      type="button"
                      variant="secondary"
                      onClick={() => void cozumOner(false)}
                    >
                      Tekrar öneri dene
                    </Btn>
                  )}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={hedefHaritaAraSec}
              className={`w-full rounded-xl border bg-white px-4 py-3.5 text-left font-semibold text-sm text-slate-900 transition touch-manipulation hover:border-amber-400 ${
                hedefSecimParlama
                  ? "border-amber-500 animate-hedef-secim-parla"
                  : "border-slate-200"
              }`}
            >
              Haritadan Oto Tamir Ara
            </button>
          )}

          {hedefKendimArat ? (
            <div
              id="hedef-secim-ozeti"
              className={`rounded-xl border border-amber-500 bg-amber-50 ring-2 ring-amber-200 overflow-hidden scroll-mt-24 ${
                hedefSecimParlama ? "animate-hedef-secim-parla" : ""
              }`}
            >
              <button
                type="button"
                onClick={hedefKendimAratSec}
                className="w-full text-left px-4 pt-3.5 pb-2 font-semibold text-sm text-amber-950"
              >
                Adresi Kendim Yazacağım ✓
              </button>
              <div className="px-4 pb-3 space-y-2">
                {hedefAdresAramaAlani()}
                {hedefNavButonlari()}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={hedefKendimAratSec}
              className={`w-full rounded-xl border bg-white px-4 py-3.5 text-left font-semibold text-sm text-slate-900 transition touch-manipulation hover:border-amber-400 ${
                hedefSecimParlama
                  ? "border-amber-500 animate-hedef-secim-parla"
                  : "border-slate-200"
              }`}
            >
              Adresi Kendim Yazacağım
            </button>
          )}

          <div
            ref={fotografRef}
            className="rounded-xl border border-slate-200 bg-white px-3 py-3 space-y-3 scroll-mt-24"
          >
            <p className="text-sm font-semibold text-slate-900">
              Araç ve arıza fotoğrafı yükleyiniz{" "}
              <span className="text-slate-500 font-medium">(isteğe bağlı)</span>
            </p>
            <ArizaFotografAlani
              fotograflar={fotografSlotlari}
              baslikGizle
              invalid={fotografHatasi}
              zorunlu={false}
              onDegisti={(slotlar) => {
                setFotografSlotlari(slotlar);
                if (arizaFotograflariListe(slotlar).length > 0) {
                  setFotografHatasi(false);
                }
              }}
            />
            {sorunAracModeliAlaniGoster(form.sorunTipi) && (
              <div ref={aracDurumuRef} className="space-y-2 scroll-mt-24">
                <p className="text-sm font-semibold text-slate-800">
                  Aracın durumu
                </p>
                <div
                  className="grid grid-cols-1 gap-1.5"
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
                          update("aracDurumu", secili ? "" : d.id);
                          setAracDurumuHatasi(false);
                        }}
                        className={`w-full text-left rounded-xl border px-3 py-2.5 text-sm font-medium transition touch-manipulation ${
                          secili
                            ? "border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-500/25"
                            : aracDurumuHatasi
                              ? "border-red-400 bg-white text-slate-800"
                              : "border-slate-200 bg-white text-slate-800 hover:border-amber-300"
                        }`}
                      >
                        {d.etiket}
                        {secili ? (
                          <span className="float-right text-amber-600">✓</span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
                {aracDurumuHatasi ? (
                  <p className="text-sm text-red-600" role="alert">
                    Araç durumunu seçin.
                  </p>
                ) : null}
              </div>
            )}
            <TextArea
              label="Teklif notu (isteğe bağlı)"
              placeholder={
                "Örn:\nKaza yaptım, aracımı en yakın servise götürmek istiyorum\nOtoyolda kaldım, sağ şeritteyim\nMotor çalışmıyor, evime çekilsin"
              }
              value={form.sorunDetay}
              onChange={(e) => update("sorunDetay", e.target.value)}
              rows={4}
              className="whitespace-pre-line"
            />
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
          </div>
        </div>
      )}

      {step === "bilgi" && (
        <MusteriFormIletisimOtp
          funnelId={funnelId}
          ad={form.ad}
          telefon={form.telefon}
          yasalOnay={yasalOnay}
          onAdChange={(v) => update("ad", v)}
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
          onGeri={oncekiAdimaDon}
          submitting={loading}
          submitEtiket={sorunCagriButonEtiketi(form.sorunTipi)}
          onHazir={() => cekiciBul()}
        />
      )}

      {step === "sorun" && <SssBolumu />}

      {step === "sorun" && (
        <p className="mt-8 mb-2 text-center text-sm text-slate-600">
          <Link
            href="/a"
            className="font-medium text-amber-700 underline underline-offset-2"
          >
            Hizmet veren misiniz? İş almak için kayıt olun →
          </Link>
        </p>
      )}
    </MobileShell>
  );
}
