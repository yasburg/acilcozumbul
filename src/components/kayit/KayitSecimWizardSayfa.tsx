"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MobileShell } from "@/components/MobileShell";
import { Btn, Field, Card } from "@/components/ui";
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
import { DESTEKLENEN_ILLER, ilGecerliMi, ilceListesi } from "@/lib/il-ilce";
import {
  ISTANBUL_ASYA_ILCELER,
  ISTANBUL_AVRUPA_ILCELER,
  ISTANBUL_IL,
} from "@/lib/istanbul-ilceler";
import {
  KULLANIMA_ACIK_ILLER,
  sehirKullanimAcikMi,
} from "@/lib/cekici-sehir-acilis";
import { idleSonra } from "@/lib/idle-sonra";
import { gecerliSorunTipi } from "@/lib/sorun-tipleri";
import { KayitCarkKampanya } from "@/components/kayit/KayitCarkKampanya";
import { carkOdulOku, carkOdulTemizle } from "@/lib/kayit-cark-client";
import {
  konumAlEsnek,
  konumGuvenliMi,
  konumHataMesaji,
  reverseGeocode,
  cihazPlatformu,
} from "@/lib/konum-client";
import { parseIlIlce } from "@/lib/konum-parse";
import { sehirYolYardimTalepParcalari } from "@/lib/turkiye-il-nufus";

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
  ikon: string;
  baslik: string;
  alt?: string;
}[] = [
  { id: "cekici", ikon: "🚛", baslik: "Çekici / oto kurtarma" },
  { id: "lastik", ikon: "🛞", baslik: "Mobil lastikçi" },
  { id: "anahtar", ikon: "🔑", baslik: "Oto anahtarcı" },
  {
    id: "birden_fazla",
    ikon: "🔧",
    baslik: "Birden fazla hizmet veriyorum",
    alt: "çekici + lastik + anahtar",
  },
];

const COKLU_HIZMETLER: { id: string; label: string }[] = [
  { id: "cekici", label: "Araç çekme" },
  { id: "arac-tasima", label: "Araç taşıma" },
  { id: "lastik", label: "Lastik yardımı" },
  { id: "aku", label: "Akü takviyesi" },
  { id: "yakit", label: "Yakıt desteği" },
  { id: "kilit", label: "Araç anahtarı" },
];

/** Ana akış 3 adım — şehir + bölge/ilçe aynı adımda (2) */
function ilerlemeBilgi(
  adim: Adim
): { no: number; etiket: string } | null {
  switch (adim) {
    case "is":
    case "is_coklu":
      return { no: 1, etiket: "Hizmet seçimi" };
    case "sehir":
    case "bolge":
    case "ilce":
      return { no: 2, etiket: "Şehir ve bölge" };
    case "telefon":
    case "otp":
      return { no: 3, etiket: "Telefon doğrulama" };
    default:
      return null;
  }
}

function KayitHeaderGiris() {
  return (
    <p className="text-xs text-slate-600 text-right leading-tight">
      Hesabınız var mı?{" "}
      <Link
        href="/cekici/giris"
        className="font-semibold text-amber-800 underline-offset-2 hover:underline touch-manipulation"
      >
        Giriş yap
      </Link>
    </p>
  );
}

function IlerlemeCubugu({ adim }: { adim: Adim }) {
  const bil = ilerlemeBilgi(adim);
  if (!bil) return null;
  return (
    <div className="space-y-1.5" aria-label={`Adım ${bil.no} / 3`}>
      <p className="text-xs font-medium text-slate-500">
        {bil.no} / 3 — {bil.etiket}
      </p>
      <div className="flex gap-1.5" aria-hidden>
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={`h-1 flex-1 rounded-full ${
              n <= bil.no ? "bg-amber-500" : "bg-slate-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
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

function yakaIlceleri(y: YakaSecim): string[] {
  if (y === "avrupa") return [...ISTANBUL_AVRUPA_ILCELER];
  if (y === "anadolu") return [...ISTANBUL_ASYA_ILCELER];
  if (y === "her_iki") {
    return [...ISTANBUL_AVRUPA_ILCELER, ...ISTANBUL_ASYA_ILCELER];
  }
  return [];
}

function SecimKart({
  ikon,
  baslik,
  alt,
  aktif,
  onClick,
}: {
  ikon?: string;
  baslik: string;
  alt?: string;
  aktif?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-2xl border px-4 py-3.5 min-h-[64px] flex items-center gap-3 touch-manipulation transition active:scale-[0.98] active:bg-slate-50 ${
        aktif
          ? "border-amber-400 bg-amber-50 shadow-sm ring-1 ring-amber-300/60"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80"
      }`}
    >
      {ikon ? (
        <span className="text-2xl shrink-0" aria-hidden>
          {ikon}
        </span>
      ) : null}
      <span className="flex-1 min-w-0">
        <span className="block font-semibold text-slate-900 text-[17px] leading-snug">
          {baslik}
        </span>
        {alt ? (
          <span className="block text-xs text-slate-500 mt-0.5 leading-snug">
            {alt}
          </span>
        ) : null}
      </span>
      {aktif ? (
        <span
          className="shrink-0 size-6 rounded-full bg-amber-500 text-white text-sm font-bold flex items-center justify-center"
          aria-hidden
        >
          ✓
        </span>
      ) : (
        <span className="shrink-0 text-slate-300 text-xl font-light leading-none" aria-hidden>
          ›
        </span>
      )}
    </button>
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
  const [sehirAramaAcik, setSehirAramaAcik] = useState(false);
  const [konumYukleniyor, setKonumYukleniyor] = useState(false);
  const [konumHata, setKonumHata] = useState("");
  const [acikIller, setAcikIller] = useState<readonly string[]>([
    ...KULLANIMA_ACIK_ILLER,
  ]);
  const [yaka, setYaka] = useState<YakaSecim | null>(null);
  const [ilceler, setIlceler] = useState<string[]>([]);
  const [telefon, setTelefon] = useState("");
  const [telefonHata, setTelefonHata] = useState(false);
  const [ornekSmsAcik, setOrnekSmsAcik] = useState(false);
  const [ornekSmsCikis, setOrnekSmsCikis] = useState(false);
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
      setSmsIpucu(false);
      setTelefonParlama(false);
      return;
    }
    const t = setTimeout(() => {
      setOrnekSmsCikis(false);
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
    }, 360);
    window.setTimeout(() => setTelefonParlama(false), 2200);
  }

  const sorunTipleri = useMemo(() => {
    if (hizmet === "birden_fazla") {
      return cokluSorunlar.filter(gecerliSorunTipi);
    }
    return kayitHizmetSorunOnerisi(hizmet);
  }, [hizmet, cokluSorunlar]);

  const sehirIlceler = useMemo(() => ilceListesi(sehir), [sehir]);
  const istanbulMu = sehir === ISTANBUL_IL;
  const sehirAcik = sehirKullanimAcikMi(sehir, acikIller);

  const sehirAramaSonuclari = useMemo(() => {
    const q = sehirAra.trim().toLocaleLowerCase("tr-TR");
    if (q.length < 1) return [];
    return DESTEKLENEN_ILLER.filter((il) =>
      il.toLocaleLowerCase("tr-TR").includes(q)
    ).slice(0, 8);
  }, [sehirAra]);

  const sehirTalep = useMemo(
    () => (sehir ? sehirYolYardimTalepParcalari(sehir) : null),
    [sehir]
  );

  function sehirSec(il: string) {
    setSehir(il);
    setSehirAra("");
    setSehirAramaAcik(false);
    setKonumHata("");
  }

  async function konumdanSehirAl() {
    setKonumHata("");
    setKonumYukleniyor(true);
    try {
      if (!konumGuvenliMi()) {
        setKonumHata(
          "Konum için https:// gerekli. Şehrinizi arayarak seçebilirsiniz."
        );
        return;
      }
      const pos = await konumAlEsnek();
      const { latitude, longitude } = pos.coords;
      const adres = await reverseGeocode(latitude, longitude);
      const { il } = parseIlIlce(adres);
      if (!il || !ilGecerliMi(il)) {
        setKonumHata(
          "Şehriniz tespit edilemedi. Aşağıdan arayarak seçin."
        );
        return;
      }
      sehirSec(il);
    } catch (e) {
      const code =
        e && typeof e === "object" && "code" in e
          ? (e as GeolocationPositionError).code
          : undefined;
      setKonumHata(konumHataMesaji(code));
    } finally {
      setKonumYukleniyor(false);
    }
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
    if (!istanbulMu) return [];
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

  /** İleri adım — huni olaylarını bir kez yazar (geri gitmede setAdim kullan) */
  function adimaIlerle(yeni: Adim) {
    setAdim(yeni);
    const olay = wizardAdimOlay(yeni);
    if (olay) kayitFunnelOlayBirKez(funnel.id, olay);
  }

  function hizmetSec(id: Exclude<KayitHizmetOnsecim, null>) {
    setHizmet(id);
    void kayitFunnelOlayGonder(funnel.id, "cta_kayit_basla", {
      meta: { hizmet: id },
    });
    kayitFunnelOlayBirKez(funnel.id, "form_adim_1");
    if (id === "birden_fazla") {
      setAdim("is_coklu");
      return;
    }
    adimaIlerle("sehir");
  }

  function geri() {
    setError("");
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
      setAdim("basarili");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- yalnızca 6 hanede tetikle
  }, [otp, adim]);

  const geriGoster =
    adim !== "is" && adim !== "basarili" && adim !== "otp";

  return (
    <MobileShell
      headerEnd={adim === "is" ? <KayitHeaderGiris /> : undefined}
      headerCompact={adim === "is"}
      onBack={geriGoster ? geri : undefined}
      backLabel={geriGoster ? "Geri" : undefined}
    >
      <KayitCarkKampanya funnelId={funnel.id} aktif={adim === "is"} />

      {adim === "telefon" && ornekSmsAcik && (
        <div
          className={`fixed z-[60] pointer-events-none ${
            platform === "android"
              ? "left-3 right-3 top-[max(0.5rem,env(safe-area-inset-top))]"
              : "left-3 right-3 top-[max(0.65rem,env(safe-area-inset-top))]"
          } ${
            ornekSmsCikis ? "animate-sms-banner-out" : "animate-sms-banner-in"
          }`}
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
                onClick={ornekSmsTikla}
                className="relative pointer-events-auto w-full animate-sms-banner-glow touch-manipulation text-left rounded-xl border border-slate-200/80 bg-[#f3f4f6] shadow-md px-3.5 py-3 active:scale-[0.99]"
                aria-label="Örnek SMS bildirimi"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="size-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center"
                    aria-hidden
                  >
                    ✉
                  </span>
                  <span className="text-[11px] font-medium uppercase tracking-wide text-slate-600">
                    Mesajlar · şimdi
                  </span>
                </div>
                <p className="text-[14px] font-semibold text-slate-900 leading-snug">
                  acilcozumbul
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
                onClick={ornekSmsTikla}
                className="relative pointer-events-auto w-full animate-sms-banner-glow touch-manipulation text-left rounded-[22px] border border-white/55 bg-white/85 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] px-3.5 py-3 active:scale-[0.99]"
                aria-label="Örnek SMS bildirimi"
              >
                <div className="flex items-start gap-3">
                  <span
                    className="size-10 shrink-0 rounded-[11px] bg-emerald-500 text-white flex items-center justify-center text-lg shadow-sm"
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
                    <span className="block text-[13px] font-semibold text-slate-900 mt-0.5">
                      acilcozumbul
                    </span>
                    <span className="block text-[13px] text-slate-600 leading-snug mt-0.5 line-clamp-2">
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

      <div className="space-y-5 pb-8">
        {adim !== "basarili" && <IlerlemeCubugu adim={adim} />}

        {adim === "is" && (
          <section className="space-y-3.5">
            <h1 className="text-[1.35rem] font-bold text-slate-900 leading-snug">
              Bölgenizde yeni işler açıldığında telefonunuza gelsin.
            </h1>
            <p className="text-sm text-slate-600 leading-snug">
              Hizmetinizi seçin, çalışma bölgenizi belirleyin, müşteri talep
              açınca fiyatınızı ve varış sürenizi yazın.
            </p>
            <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
              <li>
                <span className="text-emerald-700 font-bold" aria-hidden>
                  ✓
                </span>{" "}
                <span className="font-bold text-emerald-800">
                  Kayıt ücretsiz
                </span>
              </li>
              <li>
                <span className="text-emerald-700 font-bold" aria-hidden>
                  ✓
                </span>{" "}
                <span className="font-bold text-emerald-800">
                  Teklif vermek ücretsiz
                </span>
              </li>
              <li>
                <span className="text-emerald-700 font-bold" aria-hidden>
                  ✓
                </span>{" "}
                <span className="font-bold text-emerald-800">Komisyon yok</span>
              </li>
            </ul>
            <h2 className="text-lg font-bold text-slate-900 pt-1">
              Hangi hizmetleri veriyorsunuz?
            </h2>
            <p className="text-xs text-slate-500 -mt-1">
              Yalnızca seçtiğiniz işlerle ilgili talepleri göndeririz.
            </p>
            <div className="space-y-2.5">
              {HIZMET_KARTLARI.map((k) => (
                <SecimKart
                  key={k.id}
                  ikon={k.ikon}
                  baslik={k.baslik}
                  alt={k.alt}
                  aktif={hizmet === k.id}
                  onClick={() => hizmetSec(k.id)}
                />
              ))}
            </div>
          </section>
        )}

        {adim === "is_coklu" && (
          <section className="space-y-4">
            <h1 className="text-xl font-bold text-slate-900">
              Hangi hizmetleri veriyorsunuz?
            </h1>
            <p className="text-sm text-slate-600">
              Birden fazla seçebilirsiniz.
            </p>
            <div className="space-y-2">
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
                    className={`w-full text-left rounded-xl border px-4 py-3 font-medium ${
                      on
                        ? "border-amber-400 bg-amber-50 text-slate-900"
                        : "border-slate-200 bg-white text-slate-800"
                    }`}
                  >
                    {on ? "✓ " : ""}
                    {h.label}
                  </button>
                );
              })}
            </div>
            <Btn
              disabled={cokluSorunlar.length === 0}
              onClick={() => adimaIlerle("sehir")}
            >
              Devam et
            </Btn>
          </section>
        )}

        {adim === "sehir" && (
          <section className="space-y-4">
            {sehirTalep && (
              <p className="text-sm text-slate-700 leading-snug bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3">
                <span className="font-bold text-amber-600">
                  {sehirTalep.sehirde}
                </span>{" "}
                günde yaklaşık{" "}
                <span className="font-bold text-amber-600">
                  {sehirTalep.adetYazi}
                </span>{" "}
                yol yardım talebi oluyor.
              </p>
            )}
            <h1 className="text-xl font-bold text-slate-900">
              Hangi şehirde hizmet veriyorsunuz?
            </h1>

            {sehirAramaAcik ? (
              <div className="rounded-2xl border border-amber-400 bg-amber-50/40 p-3 space-y-2 ring-1 ring-amber-300/60">
                <input
                  type="search"
                  autoFocus
                  autoComplete="address-level1"
                  placeholder="Şehir ara… (Ankara, İzmir)"
                  value={sehirAra}
                  onChange={(e) => setSehirAra(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-base min-h-[48px] outline-none focus:border-amber-400"
                />
                {sehirAramaSonuclari.length > 0 && (
                  <ul className="rounded-xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto">
                    {sehirAramaSonuclari.map((il) => (
                      <li key={il}>
                        <button
                          type="button"
                          className={`w-full text-left px-4 py-3 text-[15px] touch-manipulation ${
                            sehir === il
                              ? "bg-amber-50 font-semibold text-slate-900"
                              : "text-slate-800 hover:bg-slate-50"
                          }`}
                          onClick={() => sehirSec(il)}
                        >
                          {il}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {sehirAra.trim().length > 0 &&
                  sehirAramaSonuclari.length === 0 && (
                    <p className="text-sm text-slate-500 px-1">
                      Şehir bulunamadı.
                    </p>
                  )}
                <button
                  type="button"
                  className="text-sm font-medium text-slate-600 px-1"
                  onClick={() => {
                    setSehirAramaAcik(false);
                    setSehirAra("");
                  }}
                >
                  Vazgeç
                </button>
              </div>
            ) : (
              <div className="w-full rounded-2xl border border-amber-400 bg-amber-50 shadow-sm ring-1 ring-amber-300/60 px-4 py-3.5 min-h-[64px] flex items-center gap-3">
                <span className="text-2xl shrink-0" aria-hidden>
                  📍
                </span>
                <span className="flex-1 min-w-0 font-semibold text-slate-900 text-[17px] leading-snug">
                  {sehir}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSehirAramaAcik(true);
                    setSehirAra("");
                  }}
                  className="shrink-0 text-sm font-semibold text-amber-800 underline-offset-2 hover:underline touch-manipulation px-1 py-1"
                >
                  Değiştir
                </button>
              </div>
            )}

            <button
              type="button"
              disabled={konumYukleniyor || sehirAramaAcik}
              onClick={() => void konumdanSehirAl()}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 min-h-[52px] flex items-center justify-center gap-2 text-[15px] font-semibold text-slate-800 touch-manipulation hover:bg-slate-50 active:scale-[0.98] disabled:opacity-50"
            >
              {konumYukleniyor ? "Konum alınıyor…" : "veya konumdan otomatik al"}
            </button>
            {konumHata && (
              <p className="text-sm text-red-600" role="alert">
                {konumHata}
              </p>
            )}
            {sehir !== ISTANBUL_IL && sehir && !sehirAcik && !sehirAramaAcik && (
              <Card className="border-amber-200 bg-amber-50 space-y-1">
                <p className="text-sm font-semibold text-amber-950">
                  Şehriniz henüz aktif değil.
                </p>
                <p className="text-sm text-amber-900 leading-snug">
                  Kaydınızı tamamlayın, bölgeniz açıldığında öncelikli olarak
                  bilgilendirelim.
                </p>
              </Card>
            )}
            <Btn
              disabled={!sehir || sehirAramaAcik}
              onClick={() => {
                if (sehir === ISTANBUL_IL) adimaIlerle("bolge");
                else {
                  setYaka(null);
                  setIlceler([]);
                  adimaIlerle("telefon");
                }
              }}
            >
              {sehir === ISTANBUL_IL ? "Bölgemi seç" : "Devam et"}
            </Btn>
          </section>
        )}

        {adim === "bolge" && (
          <section className="space-y-4">
            <h1 className="text-xl font-bold text-slate-900">
              İstanbul’da hangi bölgelerde çalışıyorsunuz?
            </h1>
            <p className="text-sm text-slate-600">
              Size yalnızca çalışabileceğiniz bölgelerdeki talepleri göndeririz.
            </p>
            {(
              [
                ["avrupa", "Avrupa Yakası"],
                ["anadolu", "Anadolu Yakası"],
                ["her_iki", "Her iki yakada"],
                ["belirli", "Belirli ilçeleri seçmek istiyorum"],
              ] as const
            ).map(([id, label]) => (
              <SecimKart
                key={id}
                baslik={label}
                aktif={yaka === id}
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
              />
            ))}
          </section>
        )}

        {adim === "ilce" && (
          <section className="space-y-4">
            <h1 className="text-xl font-bold text-slate-900">
              Hangi ilçelerde çalışıyorsunuz?
            </h1>
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
            <Btn
              disabled={ilceler.length === 0}
              onClick={() => adimaIlerle("telefon")}
            >
              Devam et
            </Btn>
          </section>
        )}

        {adim === "telefon" && (
          <section className="space-y-4">
            <h1 className="text-[1.35rem] font-bold text-slate-900 leading-snug">
              {telefonBaslik}
            </h1>
            <p className="text-sm text-slate-600 leading-snug">
              Bölgenizde yeni bir {hizmetEtiket(hizmet)} işi açıldığında size SMS
              gönderelim.
            </p>
            {smsIpucu && (
              <p
                className="text-sm font-medium text-amber-950 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-3 leading-snug animate-fade-in"
                role="status"
              >
                Müşterileri size SMS olarak gönderebilmemiz için telefon
                numaranızı girin.
              </p>
            )}
            {!sehirAcik && (
              <Card className="border-amber-200 bg-amber-50">
                <p className="text-sm text-amber-900 leading-snug">
                  {sehir} henüz aktif değil — kaydınızı alın, açıldığında öncelikli
                  bilgilendirilirsiniz.
                </p>
              </Card>
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
            <Btn disabled={loading} onClick={() => void kodGonder()}>
              {loading ? "Gönderiliyor…" : "Telefonuma kod gönder"}
            </Btn>
            <p className="text-center text-xs text-slate-500">
              Kayıt ücretsiz · Kart gerekmez · Teklif vermek ücretsiz
            </p>
          </section>
        )}

        {adim === "otp" && (
          <section className="space-y-4">
            <h1 className="text-xl font-bold text-slate-900">
              Telefonunuzu doğrulayın
            </h1>
            <p className="text-sm text-slate-600">
              {telefon} numarasına 6 haneli kod gönderdik.
            </p>
            {mesaj && <p className="text-sm text-emerald-700">{mesaj}</p>}
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
              className="text-lg tracking-widest min-h-[52px]"
            />
            {loading && (
              <p className="text-sm text-slate-500">Doğrulanıyor…</p>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex flex-wrap gap-3 text-sm">
              <button
                type="button"
                className="text-amber-800 font-medium disabled:opacity-40"
                disabled={yenidenSn > 0 || loading}
                onClick={() => void kodGonder()}
              >
                {yenidenSn > 0
                  ? `Tekrar kod gönder (${yenidenSn})`
                  : "Tekrar kod gönder"}
              </button>
              <button
                type="button"
                className="text-slate-600 font-medium"
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
        )}

        {adim === "basarili" && (
          <Card className="space-y-4 border-emerald-200 bg-emerald-50">
            <h1 className="text-xl font-bold text-slate-900">
              Kaydınız oluşturuldu ✓
            </h1>
            <p className="text-[17px] text-slate-700 leading-relaxed">
              İş bildirimlerini doğru gönderebilmemiz için son ayarlarınızı
              tamamlayın.
            </p>
            <Btn onClick={() => router.push("/kayit/kurulum")}>
              Hesabımı hazırlamaya başla
            </Btn>
          </Card>
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
        <MobileShell headerEnd={<KayitHeaderGiris />}>
          <p className="text-center text-slate-500 py-12">Yükleniyor…</p>
        </MobileShell>
      }
    >
      <WizardIcerik funnel={funnel} />
    </Suspense>
  );
}
