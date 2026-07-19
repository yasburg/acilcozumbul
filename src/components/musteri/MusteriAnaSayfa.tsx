"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { SorunSecimi } from "@/components/SorunSecimi";
import { ArizaFotografAlani } from "@/components/ArizaFotografAlani";
import { Btn, Field, Card, Spinner, TextArea } from "@/components/ui";
import {
  hizmetQuerydenSorunTipi,
  sorunAracModeliGerekliMi,
  sorunCagriButonEtiketi,
  sorunFotografAlaniGoster,
  sorunFotografGerekliMi,
  sorunHedefKonumGerekliMi,
  sorunMetniOlustur,
  sorunTipiBul,
} from "@/lib/sorun-tipleri";
import { KonumIzniYardim } from "@/components/KonumIzniYardim";
import { GpsHttpsBanner } from "@/components/GpsHttpsBanner";
import { YasalOnayKutusu } from "@/components/yasal/YasalOnayKutusu";
import { NasilCalisirSerit } from "@/components/NasilCalisirSerit";
import { HizmetVerenSayimGostergesi } from "@/components/HizmetVerenSayimGostergesi";
import { useHizmetVerenSayim } from "@/hooks/useHizmetVerenSayim";
import { YasalSiteFooter } from "@/components/yasal/YasalSiteFooter";
import { SssBolumu } from "@/components/seo/SssBolumu";
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
import {
  telefonDogrulamaHatasi,
  telefonGecerliMi,
  telefonMaskele,
  telefonNormalize,
} from "@/lib/telefon";
import { googleMapsYapilandirildi } from "@/lib/google-maps";
import type { KonumOneri } from "@/lib/hedef-oneri-data";
import type { HedefOneriKaynak } from "@/lib/konum-oneri";
import {
  posthogKampanyaKaydet,
  posthogOlayYakala,
} from "@/lib/posthog-client";
import { gtagAdsFiyatTeklifiDonusumu } from "@/lib/gtag";
import {
  musteriProfilKaydet,
  musteriProfilOku,
} from "@/lib/musteri-profil";

type Step = "bilgi" | "konum" | "sorun" | "detay" | "hedef";

const STEP_SIRA: Step[] = ["sorun", "bilgi", "konum", "detay", "hedef"];
const OTP_BEKLEYEN_KEY = "acilcozum_otp_bekleyen";
const ADIM_OLAYLARI: Partial<Record<Step, string>> = {
  bilgi: "adim_bilgi",
  konum: "adim_konum",
  detay: "adim_detay",
  hedef: "adim_hedef",
};

function funnelKaydet(
  olay: string,
  telefon?: string,
  posthogProps?: Record<string, unknown>
) {
  void fetch("/api/musteri/funnel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ olay, telefon }),
  });
  posthogOlayYakala(olay, posthogProps);
}

function sorunProps(sorunTipi: string): Record<string, unknown> {
  return sorunTipi ? { sorun_tipi: sorunTipi } : {};
}

/** Kayıtlı ad/soyadı boş alanlara uygular; dolu alanlara dokunmaz */
function kayitliAdSoyadUygula(
  telefon: string,
  mevcut: { ad: string; soyad: string }
): { telefon: string; ad: string; soyad: string } {
  const profil = musteriProfilOku(telefon);
  return {
    telefon,
    ad: mevcut.ad.trim() ? mevcut.ad : (profil?.ad ?? mevcut.ad),
    soyad: mevcut.soyad.trim() ? mevcut.soyad : (profil?.soyad ?? mevcut.soyad),
  };
}

export default function MusteriAnaSayfa() {
  return (
    <Suspense
      fallback={
        <MobileShell>
          <p className="text-center text-slate-500 py-12">Yükleniyor…</p>
        </MobileShell>
      }
    >
      <MusteriAnaSayfaIcerik />
    </Suspense>
  );
}

function MusteriAnaSayfaIcerik() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { ozet: hizmetVerenSayim, yukleniyor: hizmetVerenYukleniyor } =
    useHizmetVerenSayim();
  const [step, setStep] = useState<Step>("sorun");
  const hizmetUygulandi = useRef(false);
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
  const [telefonDogrulandi, setTelefonDogrulandi] = useState(false);
  const [otpKod, setOtpKod] = useState("");
  const [otpHata, setOtpHata] = useState("");
  const [gelistirmeKodu, setGelistirmeKodu] = useState<string | null>(null);
  const [yenidenGonderSn, setYenidenGonderSn] = useState(0);
  const [otpBekleniyor, setOtpBekleniyor] = useState(false);
  const [kodGirisAcik, setKodGirisAcik] = useState(false);
  const [gpsGuvenli, setGpsGuvenli] = useState(false);
  const [konumIzni, setKonumIzni] = useState<KonumIzniDurumu>("unknown");
  const [konumIzniBekleniyor, setKonumIzniBekleniyor] = useState(false);
  const konumIsimRef = useRef<HTMLDivElement>(null);
  const aracModeliRef = useRef<HTMLDivElement>(null);
  const fotografRef = useRef<HTMLDivElement>(null);
  const arizaAdresRef = useRef<HTMLInputElement>(null);
  const konumGpsIlkDeneme = useRef(false);
  const stepRef = useRef<Step>("sorun");
  const formLatRef = useRef(0);
  const gpsYukleniyorRef = useRef(false);
  const oneriOffsetRef = useRef(0);
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
    aracModeli: "",
  });
  const [fotografOnizleme, setFotografOnizleme] = useState<string | null>(null);
  const [fotografData, setFotografData] = useState<string | null>(null);

  useEffect(() => {
    setGpsGuvenli(konumGuvenliMi());
    posthogKampanyaKaydet();
    funnelKaydet("form_basla");
  }, []);

  useEffect(() => {
    if (hizmetUygulandi.current) return;
    const tip = hizmetQuerydenSorunTipi(searchParams.get("hizmet"));
    if (!tip) return;
    hizmetUygulandi.current = true;
    setForm((f) => ({ ...f, sorunTipi: tip }));
    setStep("bilgi");
    posthogOlayYakala("sorun_secildi", {
      sorun_tipi: tip,
      kaynak: "hizmet_query",
    });
  }, [searchParams]);

  useEffect(() => {
    const olay = ADIM_OLAYLARI[step];
    if (!olay) return;
    posthogOlayYakala(olay, sorunProps(form.sorunTipi));
    // yalnızca adım değişince; sorunTipi o anki değeri taşır
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  stepRef.current = step;
  formLatRef.current = form.lat;
  gpsYukleniyorRef.current = gpsYukleniyor;

  useEffect(() => {
    if (step !== "detay") {
      setAracModeliHatasi(false);
      setFotografHatasi(false);
      setSorunDetayHatasi(false);
    }
    if (step !== "konum") {
      setAdSoyadHatasi(false);
      setArizaAdresDuzenle(false);
    }
    if (step !== "bilgi") {
      setBilgiAlanMesajlari({ yasalOnay: "", telefon: "" });
    }
  }, [step]);

  useEffect(() => {
    if (step !== "konum" && step !== "hedef") return;
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
        stepRef.current === "konum" &&
        izin === "granted" &&
        !formLatRef.current &&
        !gpsYukleniyorRef.current
      ) {
        void konumAl(false);
      }
    });
  }, [step]);

  useEffect(() => {
    if (step !== "konum") {
      konumGpsIlkDeneme.current = false;
      return;
    }
    if (konumGpsIlkDeneme.current || !konumGuvenliMi()) return;
    if (form.lat && form.lng) return;

    konumGpsIlkDeneme.current = true;
    void konumAl(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- yalnızca konum adımına girildiğinde
  }, [step]);

  useEffect(() => {
    if (step !== "konum" || gpsYukleniyor) return;
    if (form.lat && form.lng) {
      setArizaAdresDuzenle(false);
      return;
    }
    if (!konumGpsIlkDeneme.current) return;
    window.requestAnimationFrame(() => {
      arizaAdresRef.current?.focus({ preventScroll: true });
    });
  }, [step, gpsYukleniyor, form.lat, form.lng]);

  useEffect(() => {
    fetch("/api/musteri/otp/durum", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.dogrulandi && d.telefon) {
          setTelefonDogrulandi(true);
          setForm((f) => ({ ...f, ...kayitliAdSoyadUygula(d.telefon, f) }));
          setOtpBekleniyor(false);
          setKodGirisAcik(false);
          try {
            sessionStorage.removeItem(OTP_BEKLEYEN_KEY);
          } catch {
            /* ignore */
          }
        } else {
          setTelefonDogrulandi(false);
        }
      })
      .catch(() => {});

    try {
      const kayitli = sessionStorage.getItem(OTP_BEKLEYEN_KEY);
      if (kayitli) {
        // Durum cevabı gelene kadar bekleyen OTP’yi göster; doğrulanmışsa yukarıda temizlenir
        setOtpBekleniyor(true);
        setKodGirisAcik(true);
        setStep("bilgi");
        setForm((f) => (f.telefon ? f : { ...f, telefon: kayitli }));
      }
    } catch {
      /* sessionStorage yok */
    }
  }, []);

  useEffect(() => {
    if (!telefonGecerliMi(form.telefon)) {
      setOtpBekleniyor(false);
      return;
    }
    const tel = telefonNormalize(form.telefon);
    const t = setTimeout(() => {
      fetch(`/api/musteri/otp/bekleyen?telefon=${encodeURIComponent(tel)}`, {
        credentials: "include",
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.bekliyor) {
            setOtpBekleniyor(true);
            setKodGirisAcik(true);
            setYenidenGonderSn(d.yenidenGonderSn ?? 0);
            if (d.gelistirmeKodu) setGelistirmeKodu(d.gelistirmeKodu);
          }
        })
        .catch(() => {});
    }, 400);
    return () => clearTimeout(t);
  }, [form.telefon]);

  useEffect(() => {
    if (yenidenGonderSn <= 0) return;
    const t = setInterval(() => {
      setYenidenGonderSn((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [yenidenGonderSn]);

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

  function detayAdimiDevam(): boolean {
    const detayEksik =
      form.sorunTipi === "diger" && !form.sorunDetay.trim();
    const aracEksik =
      sorunAracModeliGerekliMi(form.sorunTipi) && !form.aracModeli.trim();
    const fotografEksik =
      sorunFotografGerekliMi(form.sorunTipi) && !fotografData;

    setSorunDetayHatasi(detayEksik);
    if (detayEksik) {
      setError("Lütfen sorununuzu kısaca açıklayın.");
      return false;
    }
    if (aracEksik || fotografEksik) {
      konumZorunluAlanHatasiGoster(aracEksik, fotografEksik);
      return false;
    }
    setError("");
    setAracModeliHatasi(false);
    setFotografHatasi(false);
    setSorunDetayHatasi(false);
    return true;
  }

  function konumZorunluAlanHatasiGoster(
    aracEksik: boolean,
    fotografEksik: boolean
  ) {
    setAracModeliHatasi(aracEksik);
    setFotografHatasi(fotografEksik);

    const parcalar: string[] = [];
    if (fotografEksik) parcalar.push("arıza fotoğrafı");
    if (aracEksik) parcalar.push("araç modeli");
    setError(
      `Devam etmek için ${parcalar.join(" ve ")} zorunludur — lütfen doldurun.`
    );

    const hedef = fotografEksik
      ? fotografRef.current
      : aracEksik
        ? aracModeliRef.current
        : null;
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        scrollBelowStickyHeader(hedef);
      });
    });
  }

  function adSoyadKaydet() {
    if (!telefonDogrulandi) return;
    musteriProfilKaydet(form.telefon, form.ad, form.soyad);
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
      if (field === "telefon" && value !== f.telefon) {
        setTelefonDogrulandi(false);
        setGelistirmeKodu(null);
        setOtpBekleniyor(false);
        try {
          sessionStorage.removeItem(OTP_BEKLEYEN_KEY);
        } catch {
          /* ignore */
        }
      }
      return next;
    });
  }

  function adimGit(hedef: Step) {
    const hedefIdx = STEP_SIRA.indexOf(hedef);
    const sorunIdx = STEP_SIRA.indexOf("sorun");
    const bilgiIdx = STEP_SIRA.indexOf("bilgi");

    if (hedefIdx > sorunIdx) {
      if (!form.sorunTipi) {
        setError("Lütfen sorununuzu seçin.");
        setStep("sorun");
        return;
      }
    }

    if (hedefIdx > bilgiIdx && !yasalOnay) {
      setError("Devam etmek için yasal metinleri onaylayın.");
      setStep("bilgi");
      return;
    }

    if (hedefIdx > bilgiIdx && !telefonDogrulandi) {
      setError("Devam etmek için telefon doğrulaması gerekli.");
      setKodGirisAcik(true);
      setStep("bilgi");
      return;
    }

    setStep(hedef);
    setError("");
  }

  function kodGirisGoster(opts?: {
    mesaj?: string;
    gelistirmeKodu?: string | null;
    yenidenGonderSn?: number;
  }) {
    const tel = telefonNormalize(form.telefon);
    setOtpBekleniyor(true);
    setKodGirisAcik(true);
    setStep("bilgi");
    setError("");
    if (opts?.mesaj) setBilgiMesaj(opts.mesaj);
    if (opts?.gelistirmeKodu !== undefined) {
      setGelistirmeKodu(opts.gelistirmeKodu);
    }
    if (opts?.yenidenGonderSn != null) setYenidenGonderSn(opts.yenidenGonderSn);
    try {
      sessionStorage.setItem(OTP_BEKLEYEN_KEY, tel);
    } catch {
      /* ignore */
    }
  }

  function bilgiAdimiAlanlariniDogrula(): boolean {
    const mesajlar = { yasalOnay: "", telefon: "" };
    let gecersiz = false;

    if (!yasalOnay) {
      mesajlar.yasalOnay = "Yasal metinleri onaylamanız zorunludur.";
      gecersiz = true;
    }
    if (!form.telefon.trim()) {
      mesajlar.telefon = "Telefon numarası zorunludur.";
      gecersiz = true;
    } else if (!telefonGecerliMi(form.telefon)) {
      mesajlar.telefon = telefonDogrulamaHatasi(form.telefon);
      gecersiz = true;
    }

    setBilgiAlanMesajlari(mesajlar);
    if (gecersiz) {
      setError(
        mesajlar.yasalOnay && mesajlar.telefon
          ? "Devam etmek için zorunlu alanları doldurun."
          : mesajlar.yasalOnay || mesajlar.telefon
      );
      return false;
    }

    setBilgiAlanMesajlari({ yasalOnay: "", telefon: "" });
    return true;
  }

  async function kodGonder() {
    setError("");
    setBilgiMesaj("");
    if (!bilgiAdimiAlanlariniDogrula()) {
      return;
    }

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setLoading(true);
    try {
      const res = await fetch("/api/musteri/otp/gonder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ telefon: telefonNormalize(form.telefon) }),
      });
      let data: {
        error?: string;
        mesaj?: string;
        gelistirmeKodu?: string;
        yenidenGonderSn?: number;
        smsGonderildi?: boolean;
        smsHatasi?: string;
        kodBekliyor?: boolean;
        zatenDogrulandi?: boolean;
        telefon?: string;
      };
      try {
        data = await res.json();
      } catch {
        throw new Error(
          "Sunucuya ulaşılamadı. Bilgisayarda npm run dev:lan çalışıyor mu?"
        );
      }

      if (data.zatenDogrulandi) {
        setTelefonDogrulandi(true);
        setOtpBekleniyor(false);
        setKodGirisAcik(false);
        setGelistirmeKodu(null);
        setOtpKod("");
        setForm((f) => ({
          ...f,
          ...kayitliAdSoyadUygula(
            typeof data.telefon === "string" ? data.telefon : f.telefon,
            f
          ),
        }));
        setBilgiMesaj(
          data.mesaj ?? "Bu numara bugün doğrulanmış. Tekrar SMS gerekmez."
        );
        try {
          sessionStorage.removeItem(OTP_BEKLEYEN_KEY);
        } catch {
          /* ignore */
        }
        if (yasalOnay) setStep("konum");
        return;
      }

      if (data.kodBekliyor) {
        setOtpKod("");
        setTelefonDogrulandi(false);
        kodGirisGoster({
          mesaj: data.mesaj ?? "SMS'teki kodu girin.",
          gelistirmeKodu: data.gelistirmeKodu ?? null,
          yenidenGonderSn: data.yenidenGonderSn ?? 60,
        });
        return;
      }

      if (!res.ok) {
        throw new Error(
          data.error ?? `İstek başarısız (${res.status}). ${data.mesaj ?? ""}`
        );
      }

      setOtpKod("");
      setTelefonDogrulandi(false);
      kodGirisGoster({
        yenidenGonderSn: data.yenidenGonderSn ?? 60,
        gelistirmeKodu: data.gelistirmeKodu ?? null,
        mesaj: data.smsGonderildi
          ? (data.mesaj ?? "Kod gönderildi. Aşağıya girin.")
          : data.gelistirmeKodu
            ? (data.mesaj ?? "Kod gelmediyse geliştirme kodunu girin.")
            : undefined,
      });

      if (data.smsGonderildi || data.gelistirmeKodu) {
        posthogOlayYakala("otp_gonder", sorunProps(form.sorunTipi));
      }

      if (!data.smsGonderildi && !data.gelistirmeKodu) {
        setError(
          [data.mesaj, data.smsHatasi].filter(Boolean).join(" ") ||
            "Doğrulama kodu gönderilemedi."
        );
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Kod gönderilemedi.";
      if (msg === "Failed to fetch" || msg.includes("NetworkError")) {
        setError(
          "Sunucuya ulaşılamadı. Telefonda https://10.55.33.167:3000 kullanın (http değil)."
        );
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function kodDogrula() {
    setError("");
    setOtpHata("");
    if (otpKod.length !== 6) {
      const msg = "6 haneli doğrulama kodunu girin.";
      setOtpHata(msg);
      setError(msg);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/musteri/otp/dogrula", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          telefon: telefonNormalize(form.telefon),
          kod: otpKod,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg =
          data.error ??
          "Doğrulama kodu hatalı. SMS’teki 6 haneli kodu kontrol edin.";
        setOtpHata(msg);
        setError(msg);
        return;
      }
      setOtpHata("");
      setTelefonDogrulandi(true);
      setOtpBekleniyor(false);
      setKodGirisAcik(false);
      setGelistirmeKodu(null);
      setBilgiMesaj("");
      setOtpKod("");
      setForm((f) => ({
        ...f,
        ...kayitliAdSoyadUygula(
          typeof data.telefon === "string" ? data.telefon : f.telefon,
          f
        ),
      }));
      posthogOlayYakala("otp_dogrulandi", sorunProps(form.sorunTipi));
      try {
        sessionStorage.removeItem(OTP_BEKLEYEN_KEY);
      } catch {
        /* ignore */
      }
      setStep("konum");
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Doğrulama kodu doğrulanamadı.";
      setOtpHata(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function konumKaydet(
    lat: number,
    lng: number,
    adres: string,
    hedef: boolean
  ) {
    if (hedef) {
      setForm((f) => ({
        ...f,
        hedefLat: lat,
        hedefLng: lng,
        hedefAdres: adres,
      }));
    } else {
      setForm((f) => ({
        ...f,
        lat,
        lng,
        adres,
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
    const izin = await konumIzniOku();
    if (gpsIstekRef.current !== istekId) return;
    if (izin === "granted") setKonumIzni("granted");
    else if (izin !== "denied") setKonumIzni(izin);
    /* Safari: permissions “denied” olsa bile GPS dene (site ayarı Allow olabilir) */
    try {
      const pos = await konumAlEsnek();
      if (gpsIstekRef.current !== istekId) return;
      const { latitude, longitude } = pos.coords;
      const adres = await reverseGeocode(latitude, longitude);
      if (gpsIstekRef.current !== istekId) return;
      await konumKaydet(latitude, longitude, adres, hedef);
      if (!hedef) {
        setArizaAdresDuzenle(false);
        setBilgiMesaj("✓ GPS konumu alındı. Ad ve soyadı kontrol edip «Devam Et»e basın.");
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

  async function cozumOner(yenile = false) {
    if (!form.sorunTipi) {
      setError("Önce sorununuzu seçin.");
      setStep("sorun");
      return;
    }

    const oncekiOneriler = yenile ? oneriler : [];
    const queryOffset = yenile ? oneriOffsetRef.current : 0;

    setOneriYukleniyor(true);
    setError("");
    if (!yenile) setOneriler([]);

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
        `/api/konum/oneri?lat=${lat}&lng=${lng}&sorunTipi=${encodeURIComponent(form.sorunTipi)}&limit=3&offset=${queryOffset}${excludeQs}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Öneri alınamadı.");

      const gelen: KonumOneri[] = data.oneriler ?? [];
      setOneriler(gelen);
      setOneriKaynak(data.kaynak ?? null);
      setOneriAcikFiltre(!!data.acikFiltrelendi);

      if (yenile) {
        oneriOffsetRef.current += 1;
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

  function oneriSec(o: KonumOneri) {
    setForm((f) => ({
      ...f,
      hedefLat: o.lat,
      hedefLng: o.lng,
      hedefAdres: o.adres,
    }));
    setOneriler([]);
  }

  async function cekiciBul() {
    setError("");
    if (!form.lat || !form.lng) {
      const ok = await adresKoordinatDoldur(false);
      if (!ok) return;
    }
    if (!yasalOnay) {
      setError("Talep göndermek için yasal metinleri onaylayın.");
      setStep("bilgi");
      return;
    }
    if (!telefonDogrulandi) {
      setError("Telefon doğrulaması gerekli.");
      setKodGirisAcik(true);
      setStep("bilgi");
      return;
    }
    if (!form.ad?.trim() || !form.soyad?.trim() || !form.telefon) {
      setError("Ad ve soyad zorunludur (arıza konumu adımında).");
      setStep("konum");
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
      setStep("detay");
      return;
    }
    if (sorunAracModeliGerekliMi(form.sorunTipi) && !form.aracModeli.trim()) {
      setError("Araç modelini girin (ör. Audi A3 sedan).");
      setStep("detay");
      return;
    }
    if (sorunFotografGerekliMi(form.sorunTipi) && !fotografData) {
      setError("Arıza fotoğrafı gerekli.");
      setStep("detay");
      return;
    }
    if (sorunHedefKonumGerekliMi(form.sorunTipi) && !form.hedefAdres) {
      setError("Aracın çekileceği adres gerekli.");
      setStep("hedef");
      return;
    }

    setLoading(true);
    const hedefGerekli = sorunHedefKonumGerekliMi(form.sorunTipi);
    try {
      const res = await fetch("/api/talep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ad: form.ad,
          soyad: form.soyad,
          telefon: form.telefon,
          konum: { lat: form.lat, lng: form.lng, adres: form.adres },
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
          aracModeli: form.aracModeli.trim() || undefined,
          fotograf: fotografData || undefined,
          sorun: sorunMetniOlustur(form.sorunTipi, form.sorunDetay),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bir hata oluştu.");
      musteriProfilKaydet(form.telefon, form.ad, form.soyad);
      posthogOlayYakala("talep_olustur", {
        sorun_tipi: form.sorunTipi,
        bildirilen_sayisi: data.bildirilenSayisi ?? 0,
      });
      gtagAdsFiyatTeklifiDonusumu();
      try {
        sessionStorage.setItem(
          `acil_bekle_${data.id}`,
          String(data.bildirilenSayisi ?? 0)
        );
      } catch {
        /* ignore */
      }
      router.push(`/bekle/${data.id}`);
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

  useEffect(() => {
    if (step === "hedef" && !hedefKonumGerekli) {
      setStep("detay");
    }
  }, [step, hedefKonumGerekli]);

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

  return (
    <MobileShell
      subtitle="Yolda mı kaldınız? Hemen en hızlı ve uygun teklifleri alın."
      subtitleAlign="right"
      footer={<YasalSiteFooter />}
    >
      <h1 className="sr-only">
        Acil çekici, lastikçi ve yol yardım — yakınınızdaki hizmet verenlerden
        teklif alın
      </h1>

      <div className="flex gap-1.5 mb-6">
        {steps.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => adimGit(s.key)}
            className={`flex-1 h-1.5 rounded-full transition ${
              step === s.key ? "bg-amber-500" : "bg-slate-200"
            }`}
            aria-label={`Adım ${s.label}`}
          />
        ))}
      </div>

      <NasilCalisirSerit aktifFormAdimi={step} />

      <div className="mb-4">
        <HizmetVerenSayimGostergesi
          sorunTipi={form.sorunTipi || null}
          ozet={hizmetVerenSayim}
          yukleniyor={hizmetVerenYukleniyor}
        />
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {bilgiMesaj && (step === "bilgi" || step === "detay" || step === "konum") && (
        <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
          {bilgiMesaj}
        </div>
      )}

      {step === "sorun" && (
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-xl font-bold">Sorununuz</h2>
          <p className="text-slate-500 text-sm">Aşağıdan sorununuzu seçin.</p>
          <SorunSecimi
            seciliTip={form.sorunTipi}
            detay={form.sorunDetay}
            onTipSec={(id) => {
              update("sorunTipi", id);
              posthogOlayYakala("sorun_secildi", { sorun_tipi: id });
            }}
            onDetayChange={(v) => update("sorunDetay", v)}
            sadeceTipSecimi
            onDevam={() => {
              if (!form.sorunTipi) {
                setError("Lütfen sorununuzu seçin.");
                return;
              }
              setError("");
              adimGit("bilgi");
            }}
          />
        </div>
      )}

      {step === "bilgi" && (
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-xl font-bold">Telefon Doğrulama</h2>
          <p className="text-slate-500 text-sm">
            {telefonDogrulandi
              ? "Telefonunuz bugün doğrulanmış; tekrar SMS gerekmez. Arıza konumuna geçebilirsiniz."
              : "SMS kodu ile telefonunuzu doğrulayın. Konum ve araç bilgileri sonraki adımlarda."}
          </p>
          {sorunLabel && (
            <Card className="bg-slate-50 border-slate-200">
              <p className="text-xs text-slate-500">Seçilen sorun</p>
              <p className="text-sm font-medium text-slate-900">{sorunLabel}</p>
            </Card>
          )}

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
            <p className="text-sm text-red-600 -mt-2" role="alert">
              {bilgiAlanMesajlari.yasalOnay}
            </p>
          )}

          {telefonDogrulandi ? (
            <>
              <Card className="bg-emerald-50 border-emerald-200">
                <p className="text-sm text-emerald-800">
                  ✓ {telefonMaskele(form.telefon)} bugün doğrulandı
                </p>
              </Card>
              <div className="flex gap-3">
                <Btn variant="outline" type="button" onClick={() => adimGit("sorun")}>
                  Geri
                </Btn>
                <Btn type="button" onClick={() => adimGit("konum")} disabled={!yasalOnay}>
                  Arıza Konumuna Git
                </Btn>
              </div>
            </>
          ) : (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (loading) return;
                if (kodGirisAcik) {
                  if (!yasalOnay) {
                    setBilgiAlanMesajlari((m) => ({
                      ...m,
                      yasalOnay: "Yasal metinleri onaylamanız zorunludur.",
                    }));
                    setError("Devam etmek için yasal metinleri onaylayın.");
                    return;
                  }
                  if (otpKod.length === 6) void kodDogrula();
                  else setError("6 haneli doğrulama kodunu girin.");
                  return;
                }
                void kodGonder();
              }}
            >
              <Field
                label="Telefon"
                type="tel"
                placeholder="05XX XXX XX XX"
                value={form.telefon}
                onChange={(e) => {
                  update("telefon", e.target.value);
                  setBilgiAlanMesajlari((m) => ({ ...m, telefon: "" }));
                  setError("");
                }}
                autoComplete="tel"
                inputMode="tel"
                enterKeyHint="go"
                name="telefon"
                required
                disabled={kodGirisAcik}
                invalid={!!bilgiAlanMesajlari.telefon}
              />
              {bilgiAlanMesajlari.telefon && (
                <p className="text-sm text-red-600 -mt-2" role="alert">
                  {bilgiAlanMesajlari.telefon}
                </p>
              )}

              {kodGirisAcik && (
                <>
                  <p className="text-sm text-slate-600">
                    {telefonMaskele(form.telefon)} numarasına gelen 6 haneli kodu
                    girin.
                  </p>
                  {gelistirmeKodu && (
                    <Card className="bg-amber-50 border-amber-200">
                      <p className="text-xs text-amber-800">
                        Geliştirme kodu:{" "}
                        <span className="font-mono font-bold text-lg">
                          {gelistirmeKodu}
                        </span>
                      </p>
                    </Card>
                  )}
                  <Field
                    label="Doğrulama kodu"
                    type="text"
                    inputMode="numeric"
                    placeholder="123456"
                    maxLength={6}
                    value={otpKod}
                    onChange={(e) => {
                      setOtpHata("");
                      setError("");
                      setOtpKod(e.target.value.replace(/\D/g, "").slice(0, 6));
                    }}
                    autoComplete="one-time-code"
                    enterKeyHint="done"
                    name="otp"
                    required
                    aria-invalid={!!otpHata}
                    className={
                      otpHata
                        ? "border-red-400 ring-2 ring-red-200 focus:border-red-500 focus:ring-red-300/50"
                        : undefined
                    }
                  />
                  {otpHata && (
                    <div
                      className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 font-medium"
                      role="alert"
                    >
                      ⚠️ {otpHata}
                    </div>
                  )}
                  <Btn type="submit" disabled={loading || otpKod.length !== 6}>
                    {loading ? "Doğrulanıyor…" : "Onayla — Arıza Konumuna Git"}
                  </Btn>
                  <button
                    type="button"
                    onClick={() => void kodGonder()}
                    disabled={loading || yenidenGonderSn > 0}
                    className="w-full min-h-[44px] text-sm text-amber-600 font-medium touch-manipulation disabled:text-slate-400"
                  >
                    {yenidenGonderSn > 0
                      ? `Yeni kod (${yenidenGonderSn}s)`
                      : "Kodu tekrar gönder"}
                  </button>
                  <Btn
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setKodGirisAcik(false);
                      setOtpKod("");
                    }}
                  >
                    Telefonu değiştir
                  </Btn>
                </>
              )}

              {!kodGirisAcik && (
                <>
                  <Btn variant="outline" type="button" onClick={() => adimGit("sorun")}>
                    Geri
                  </Btn>
                  <Btn type="submit" disabled={loading}>
                    {loading ? "Kod gönderiliyor…" : "Doğrulama Kodu Gönder"}
                  </Btn>
                  {(otpBekleniyor || yenidenGonderSn > 0) && (
                    <Btn
                      type="button"
                      variant="outline"
                      onClick={() =>
                        kodGirisGoster({
                          mesaj: "SMS ile gelen 6 haneli kodu girin.",
                        })
                      }
                    >
                      SMS Kodunu Gir
                    </Btn>
                  )}
                </>
              )}
            </form>
          )}
        </div>
      )}

      {step === "detay" && (
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-xl font-bold">Sorun Detayı</h2>
          <p className="text-slate-500 text-sm">
            {hedefKonumGerekli
              ? "Aracınız ve arıza hakkında bilgi verin — çekici doğru teklif verebilsin."
              : "Bulunduğunuz yerde hizmet alacaksınız — ek bilgi verin."}
          </p>

          {sorunLabel && (
            <Card className="bg-slate-50 border-slate-200">
              <p className="text-xs text-slate-500">Seçilen sorun</p>
              <p className="text-sm font-medium text-slate-900">{sorunLabel}</p>
            </Card>
          )}

          {sorunFotografAlaniGoster(form.sorunTipi) && (
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
          )}

          {sorunAracModeliGerekliMi(form.sorunTipi) && (
            <div ref={aracModeliRef} className="scroll-mt-44">
              <Field
                label="Araç modeli"
                placeholder="Örn. Audi A3 sedan, Renault Clio hatchback"
                value={form.aracModeli}
                onChange={(e) => update("aracModeli", e.target.value)}
                invalid={aracModeliHatasi}
                required
              />
              {aracModeliHatasi && (
                <p className="text-sm text-red-600 mt-1" role="alert">
                  Araç modeli zorunludur (ör. Audi A3 sedan).
                </p>
              )}
            </div>
          )}

          {form.sorunTipi === "diger" ? (
            <label className="block space-y-1.5">
              <span
                className={`text-sm font-medium ${sorunDetayHatasi ? "text-red-700" : "text-slate-700"}`}
              >
                Sorununuzu açıklayın
              </span>
              <textarea
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

          {(aracModeliHatasi || fotografHatasi || sorunDetayHatasi) && error && (
            <div
              className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Btn variant="outline" onClick={() => adimGit("konum")}>
              Geri
            </Btn>
            <Btn
              onClick={() => {
                if (!detayAdimiDevam()) return;
                if (hedefKonumGerekli) {
                  adimGit("hedef");
                } else {
                  void cekiciBul();
                }
              }}
              disabled={loading}
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Spinner className="size-4 border-white/40 border-t-white" />
                  Gönderiliyor…
                </span>
              ) : hedefKonumGerekli ? (
                "Devam Et"
              ) : (
                sorunCagriButonEtiketi(form.sorunTipi)
              )}
            </Btn>
          </div>
        </div>
      )}

      {step === "konum" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Arıza Konumu</h2>
          <p className="text-slate-500 text-sm">
            İletişim bilgilerinizi ve aracınızın bulunduğu yeri girin.
          </p>

          {!gpsGuvenli && <GpsHttpsBanner compact />}

          <div ref={konumIsimRef} className="scroll-mt-44 space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Ad"
                placeholder="Ahmet"
                value={form.ad}
                onChange={(e) => update("ad", e.target.value)}
                onBlur={adSoyadKaydet}
                autoComplete="given-name"
                name="ad"
                required
                invalid={adSoyadHatasi && !form.ad.trim()}
              />
              <Field
                label="Soyad"
                placeholder="Yılmaz"
                value={form.soyad}
                onChange={(e) => update("soyad", e.target.value)}
                onBlur={adSoyadKaydet}
                autoComplete="family-name"
                name="soyad"
                required
                invalid={adSoyadHatasi && !form.soyad.trim()}
              />
            </div>
            {adSoyadHatasi && (
              <p className="text-sm text-red-600" role="alert">
                Devam etmek için ad ve soyad girin (yukarıdaki alanlar).
              </p>
            )}
          </div>
          <p className="text-xs text-slate-500 -mt-2">
            Telefon: {telefonMaskele(form.telefon)}
          </p>

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

          {arizaKonumGpsAlindi && form.adres ? (
            <Card className="bg-emerald-50 border-emerald-200">
              <p className="text-xs text-emerald-700 uppercase tracking-wide mb-1">
                Arıza konumu (GPS)
              </p>
              <p className="text-sm text-emerald-900 leading-relaxed">
                {form.adres}
              </p>
              <button
                type="button"
                onClick={() => setArizaAdresDuzenle(true)}
                className="mt-2 text-xs text-emerald-800 underline font-medium"
              >
                Adresi düzelt
              </button>
            </Card>
          ) : (
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
                      if (g) void konumKaydet(g.lat, g.lng, g.adres, false);
                    });
                  }
                }}
              />
              {!gpsYukleniyor && (
                <p className="text-xs text-slate-500">
                  {gpsGuvenli
                    ? "Konum otomatik alınamadıysa aracınızın bulunduğu adresi yazın."
                    : "GPS için HTTPS gerekir; adresi elle yazabilirsiniz."}
                </p>
              )}
            </div>
          )}

          {gpsGuvenli && !arizaKonumGpsAlindi && !gpsYukleniyor && (
            <>
              <KonumIzniYardim
                durum={konumIzni}
                gpsGuvenli={gpsGuvenli}
                bekleniyor={konumIzniBekleniyor}
              />
              <Btn
                type="button"
                variant="outline"
                onClick={() => konumAl(false)}
                disabled={gpsYukleniyor}
                className="!py-3 text-sm"
              >
                📍 GPS konumumu tekrar dene
              </Btn>
              {konumIzni === "denied" && (
                <button
                  type="button"
                  onClick={konumIzniYenile}
                  className="w-full text-sm text-amber-600 font-medium underline"
                >
                  Ayarlardan izin verdim — yeniden kontrol et
                </button>
              )}
            </>
          )}

          <div className="space-y-2">
            <div className="flex gap-3">
              <Btn variant="outline" onClick={() => adimGit("bilgi")}>
                Geri
              </Btn>
              <Btn
                onClick={async () => {
                  setError("");
                  if (!arızaKonumuHazir) {
                    setError(
                      "Arıza konumu gerekli. GPS paylaşın veya arıza adresini yazın."
                    );
                    return;
                  }
                  if (!form.ad.trim() || !form.soyad.trim()) {
                    konumIsimHatasiGoster();
                    return;
                  }
                  setAdSoyadHatasi(false);
                  musteriProfilKaydet(form.telefon, form.ad, form.soyad);
                  if (gpsYukleniyor) gpsIptal();
                  const ok = await adresKoordinatDoldur(false);
                  if (ok) adimGit("detay");
                }}
                disabled={devamEtEngelli}
              >
                {adresGeocodeYukleniyor ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Spinner className="size-4 border-white/40 border-t-white" />
                    Adres işleniyor…
                  </span>
                ) : (
                  "Devam Et"
                )}
              </Btn>
            </div>
            {!arızaKonumuHazir && !gpsYukleniyor && !adresGeocodeYukleniyor && (
              <p className="text-xs text-amber-700 text-center">
                Devam için arıza adresini yazın veya GPS izni verin.
              </p>
            )}
            {arızaKonumuHazir &&
              (!form.ad.trim() || !form.soyad.trim()) &&
              !gpsYukleniyor &&
              !adresGeocodeYukleniyor && (
                <p className="text-xs text-amber-700 text-center">
                  Konum hazır — devam için ad ve soyadı doldurun.
                </p>
              )}
          </div>
        </div>
      )}

      {step === "hedef" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Nereye Çekilecek?</h2>
          <p className="text-slate-500 text-sm">
            {sorunLabel
              ? googleOneriAktif
                ? `${sorunLabel} için Google’da şu an açık olan yakın 3 yeri öneriyoruz — birini seçin veya adresi siz yazın.`
                : `${sorunLabel} için yakın 3 yer öneriyoruz — birini seçin veya adresi siz yazın.`
              : "Aracınızın götürülmesini istediğiniz adresi belirtin."}
          </p>

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
            oneriKaynak === "nominatim" &&
            oneriler.length > 0 && (
              <Card className="bg-slate-50 border-slate-200 !py-3">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Açık/kapalı bilgisi doğrulanamadı; yakın yerler harita
                  verisinden listelendi.
                </p>
              </Card>
            )}

          {!cozumOneriAktif && !oneriYukleniyor && (
            <p className="text-xs text-slate-500 text-center">
              Öneri için önce sorun tipi ve arıza konumu gerekli.
            </p>
          )}

          {oneriler.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Önerilen yerler ({oneriler.length})
              </p>
              {oneriler.map((o) => (
                <button
                  key={o.placeId ?? o.adres}
                  type="button"
                  onClick={() => oneriSec(o)}
                  className="w-full text-left rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-amber-400 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-slate-900">{o.ad}</p>
                    {oneriAcikFiltre && (
                      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                        Açık
                      </span>
                    )}
                  </div>
                  {o.mesafeKm != null && (
                    <p className="text-xs text-amber-600 mt-0.5">
                      ~{o.mesafeKm} km
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {o.adres}
                  </p>
                </button>
              ))}
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
                    {googleOneriAktif && oneriAcikFiltre
                      ? "Şu an açık yeni yerler aranıyor…"
                      : "Yeni öneriler aranıyor…"}
                  </span>
                ) : googleOneriAktif ? (
                  "🔄 Yeni açık öneriler ver"
                ) : (
                  "🔄 Yeni öneriler ver"
                )}
              </Btn>
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

          {gpsGuvenli && (
            <KonumIzniYardim
              durum={konumIzni}
              gpsGuvenli={gpsGuvenli}
              bekleniyor={konumIzniBekleniyor}
            />
          )}
          <Btn
            type="button"
            variant="outline"
            onClick={() => konumAl(true)}
            disabled={gpsYukleniyor || !gpsGuvenli}
          >
            {gpsYukleniyor ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Spinner className="size-4" />
                Konum alınıyor…
              </span>
            ) : (
              "📍 Hedef olarak GPS konumum"
            )}
          </Btn>
          <Field
            label="Hedef adres"
            placeholder="Oto sanayi, servis, ev adresi…"
            value={form.hedefAdres}
            onChange={(e) => update("hedefAdres", e.target.value)}
            onBlur={() => {
              if (form.hedefAdres.trim().length >= 6 && !form.hedefLat) {
                void geocodeAdres(form.hedefAdres).then((g) => {
                  if (g) void konumKaydet(g.lat, g.lng, g.adres, true);
                });
              }
            }}
          />
          {form.hedefAdres && (
            <Card>
              <p className="text-xs text-slate-500 mb-1">Çekilecek yer</p>
              <p className="text-sm leading-relaxed">{form.hedefAdres}</p>
            </Card>
          )}
          <div className="flex gap-3">
            <Btn variant="outline" onClick={() => adimGit("detay")}>
              Geri
            </Btn>
            <Btn
              onClick={async () => {
                if (gpsYukleniyor) gpsIptal();
                if (await adresKoordinatDoldur(true)) void cekiciBul();
              }}
              disabled={
                loading ||
                !form.hedefAdres.trim() ||
                adresGeocodeYukleniyor
              }
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
                sorunCagriButonEtiketi(form.sorunTipi)
              )}
            </Btn>
          </div>
        </div>
      )}

      {step === "sorun" && (
        <>
          <SssBolumu />
          <p className="text-center text-xs text-slate-500 mt-6">
            <Link
              href="/cekici/giris"
              className="text-amber-600 underline font-medium"
            >
              Çekici / lastikçi / anahtarcı girişi
            </Link>
          </p>
        </>
      )}
    </MobileShell>
  );
}
