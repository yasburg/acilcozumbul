"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MobileShell } from "@/components/MobileShell";
import { Btn, Field, SelectField, SifreAlani, Card } from "@/components/ui";
import { KayitKontenjanBilgi } from "@/components/KayitKontenjanBilgi";
import { CekiciKayitLanding } from "@/components/cekici/CekiciKayitLanding";
import { cekiciFetch } from "@/lib/cekici-fetch";
import { DESTEKLENEN_ILLER } from "@/lib/il-ilce";
import { ISTANBUL_IL } from "@/lib/istanbul-ilceler";
import {
  KULLANIMA_ACIK_ILLER,
  sehirKullanimAcikMi,
} from "@/lib/cekici-sehir-acilis";
import { YasalOnayKutusu } from "@/components/yasal/YasalOnayKutusu";
import { YasalSiteFooter } from "@/components/yasal/YasalSiteFooter";
import { telefonDogrulamaHatasi, telefonGecerliMi, telefonMaskele } from "@/lib/telefon";
import { davetKoduNormalize } from "@/lib/davet-kodu";
import { posthogKampanyaKaydet, posthogOlayYakala } from "@/lib/posthog-client";
import { metaPixelCompleteRegistration } from "@/lib/meta-pixel";
import { gtagAdsKaydolmaDonusumuBirKez } from "@/lib/gtag";
import {
  tiktokPixelClickButton,
  tiktokPixelHesapOlustur,
  tiktokPixelKayitOl,
  tiktokPixelViewContent,
} from "@/lib/tiktok-pixel";
import {
  DOGUM_AYLARI,
  dogumAyGunSayisi,
  dogumParcalarindanIso,
  dogumTarihiDogrula,
  dogumYilSecenekleri,
} from "@/lib/dogum-tarihi";

/** Meta CompleteRegistration bir kez (onay sayfası da aynı anahtarı kullanır) */
const META_COMPLETE_REG_KEY = "acil_meta_complete_reg";

type KayitAlan =
  | "ad"
  | "soyad"
  | "dogumTarihi"
  | "telefon"
  | "sehir"
  | "sifre"
  | "sifreTekrar"
  | "yasalOnay";

type AlanHatalari = Record<KayitAlan, boolean>;

const BOS_ALAN_HATALARI: AlanHatalari = {
  ad: false,
  soyad: false,
  dogumTarihi: false,
  telefon: false,
  sehir: false,
  sifre: false,
  sifreTekrar: false,
  yasalOnay: false,
};

const MIN_SIFRE_UZUNLUK = 6;

function AlanHataMetni({ mesaj }: { mesaj?: string }) {
  if (!mesaj) return null;
  return (
    <p className="text-sm text-red-600 mt-1.5" role="alert">
      {mesaj}
    </p>
  );
}

function scrollBelowStickyHeader(el: HTMLElement | null) {
  if (!el) return;
  const header = document.getElementById("app-shell-header");
  const headerH = header?.getBoundingClientRect().height ?? 160;
  const gap = 16;
  const top = el.getBoundingClientRect().top + window.scrollY - headerH - gap;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

function KayitIcerik() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const onizlemeRaw = searchParams.get("onizleme");
  const onizlemeGercekKayit =
    process.env.NODE_ENV === "development" && onizlemeRaw
      ? Number.parseInt(onizlemeRaw, 10)
      : undefined;
  const davetParam =
    searchParams.get("kampanya")?.trim() ||
    searchParams.get("davet")?.trim() ||
    searchParams.get("kod")?.trim() ||
    "";
  const smsTokenParam = searchParams.get("sms_token")?.trim() || "";

  const adRef = useRef<HTMLDivElement>(null);
  const dogumRef = useRef<HTMLDivElement>(null);
  const telefonRef = useRef<HTMLDivElement>(null);
  const sehirRef = useRef<HTMLDivElement>(null);
  const sifreRef = useRef<HTMLDivElement>(null);
  const sifreTekrarRef = useRef<HTMLDivElement>(null);
  const yasalRef = useRef<HTMLDivElement>(null);
  const otpRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [form, setForm] = useState({
    ad: "",
    soyad: "",
    dogumGun: "",
    dogumAy: "",
    dogumYil: "",
    telefon: "",
    sehir: ISTANBUL_IL,
    sifre: "",
    sifreTekrar: "",
    davetKodu: davetParam,
  });
  const [davetMesaj, setDavetMesaj] = useState("");
  const [davetGecersiz, setDavetGecersiz] = useState(false);
  const [davetKontrol, setDavetKontrol] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpAsamasi, setOtpAsamasi] = useState(false);
  const [otpKod, setOtpKod] = useState("");
  const [otpBilgi, setOtpBilgi] = useState("");
  const [gelistirmeKodu, setGelistirmeKodu] = useState<string | null>(null);
  const [yenidenSn, setYenidenSn] = useState(0);
  const [error, setError] = useState("");
  const [yasalOnay, setYasalOnay] = useState(false);
  const [acikIller, setAcikIller] = useState<readonly string[]>([
    ...KULLANIMA_ACIK_ILLER,
  ]);
  const [alanHatalari, setAlanHatalari] =
    useState<AlanHatalari>(BOS_ALAN_HATALARI);
  const [alanMesajlari, setAlanMesajlari] = useState<
    Partial<Record<KayitAlan, string>>
  >({});

  function alanHatasiTemizle(alan: KayitAlan) {
    setAlanHatalari((h) => (h[alan] ? { ...h, [alan]: false } : h));
    setAlanMesajlari((m) => {
      if (!m[alan]) return m;
      const next = { ...m };
      delete next[alan];
      return next;
    });
  }

  function alanaKaydir(ref: React.RefObject<HTMLElement | null>) {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        scrollBelowStickyHeader(ref.current);
      });
    });
  }

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
    if (yenidenSn <= 0) return;
    const t = window.setInterval(() => {
      setYenidenSn((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(t);
  }, [yenidenSn]);

  useEffect(() => {
    posthogKampanyaKaydet();
    posthogOlayYakala("cekici_kayit_goruldu", { rol: "cekici", funnel: "a" });
    tiktokPixelViewContent({
      content_id: "kayit_a",
      content_name: "cekici_kayit_kontrol",
    });
    void fetch("/api/kayit/funnel-olay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ funnel: "a", olay: "goruldu" }),
    }).catch(() => {});
  }, []);

  useEffect(() => {
    void cekiciFetch("/api/cekici/me").then((res) => {
      if (res.ok) router.replace("/cekici/panel");
    });
  }, [router]);

  useEffect(() => {
    setOtpAsamasi(false);
    setOtpKod("");
    setOtpBilgi("");
    setGelistirmeKodu(null);
    setYenidenSn(0);
  }, [form.telefon]);

  useEffect(() => {
    const kod = davetKoduNormalize(form.davetKodu.trim());
    if (!kod) {
      setDavetMesaj("");
      setDavetGecersiz(false);
      setDavetKontrol(false);
      return;
    }

    let iptal = false;
    setDavetKontrol(true);
    setDavetGecersiz(false);

    const t = window.setTimeout(() => {
      void fetch(`/api/cekici/kayit-kodu/dogrula?kod=${encodeURIComponent(kod)}`)
        .then(async (res) => {
          if (iptal) return;
          const d = await res.json();
          setDavetKontrol(false);
          if (!res.ok) {
            setDavetGecersiz(true);
            setDavetMesaj(d.hata ?? "Geçersiz kod.");
            return;
          }
          setDavetGecersiz(false);
          setDavetMesaj(d.mesaj ?? `Kayıt olunca ${d.bonus ?? 0} kredi hediye.`);
        })
        .catch(() => {
          if (iptal) return;
          setDavetKontrol(false);
          setDavetGecersiz(false);
          setDavetMesaj("");
        });
    }, 400);

    return () => {
      iptal = true;
      window.clearTimeout(t);
    };
  }, [form.davetKodu]);

  function formDogrula(): boolean {
    const adBos = !form.ad.trim();
    const soyadBos = !form.soyad.trim();
    const dogumIso = dogumParcalarindanIso(
      form.dogumGun,
      form.dogumAy,
      form.dogumYil
    );
    const dogum = dogumTarihiDogrula(dogumIso);
    const telefonBos = !form.telefon.trim();
    const telefonGecersiz = !telefonBos && !telefonGecerliMi(form.telefon);
    const sifreKisa =
      form.sifre.length > 0 && form.sifre.length < MIN_SIFRE_UZUNLUK;
    const sifreBos = !form.sifre.trim();
    const sifreTekrarBos = !form.sifreTekrar.trim();
    const sifreUyumsuz =
      !sifreTekrarBos &&
      !sifreBos &&
      !sifreKisa &&
      form.sifre !== form.sifreTekrar;

    const sehirBos = !form.sehir.trim();
    const hatalar: AlanHatalari = {
      ad: adBos,
      soyad: soyadBos,
      dogumTarihi: !dogum.ok,
      telefon: telefonBos || telefonGecersiz,
      sehir: sehirBos,
      sifre: sifreBos || sifreKisa,
      sifreTekrar: sifreTekrarBos || sifreUyumsuz,
      yasalOnay: !yasalOnay,
    };
    setAlanHatalari(hatalar);

    const mesajlar: Partial<Record<KayitAlan, string>> = {};
    if (adBos) mesajlar.ad = "Ad girin.";
    if (soyadBos) mesajlar.soyad = "Soyad girin.";
    if (!dogum.ok) mesajlar.dogumTarihi = dogum.hata;
    if (telefonBos) mesajlar.telefon = "Telefon numarası girin.";
    else if (telefonGecersiz)
      mesajlar.telefon = telefonDogrulamaHatasi(form.telefon);
    if (sehirBos) mesajlar.sehir = "Şehir seçin.";
    if (sifreBos) mesajlar.sifre = "Şifre girin.";
    else if (sifreKisa)
      mesajlar.sifre = `Şifre en az ${MIN_SIFRE_UZUNLUK} karakter olmalıdır.`;
    if (sifreTekrarBos) mesajlar.sifreTekrar = "Şifre tekrarını girin.";
    else if (sifreUyumsuz) {
      mesajlar.sifreTekrar = "Şifreler eşleşmiyor.";
      if (!sifreKisa && !sifreBos) mesajlar.sifre = "Şifreler eşleşmiyor.";
    }
    if (!yasalOnay) mesajlar.yasalOnay = "Yasal metinleri onaylayın.";
    setAlanMesajlari(mesajlar);

    if (form.davetKodu.trim()) {
      if (davetKontrol) {
        setError("Davet kodu kontrol ediliyor, lütfen bekleyin.");
        return false;
      }
      if (davetGecersiz) {
        setError(davetMesaj || "Geçersiz davet kodu.");
        return false;
      }
    }

    const kontroller: {
      alan: KayitAlan;
      ref: React.RefObject<HTMLDivElement | null>;
      mesaj: string;
    }[] = [
      { alan: "ad", ref: adRef, mesaj: "Ad girin." },
      { alan: "soyad", ref: adRef, mesaj: "Soyad girin." },
      {
        alan: "dogumTarihi",
        ref: dogumRef,
        mesaj: mesajlar.dogumTarihi ?? "Doğum tarihi girin.",
      },
      {
        alan: "telefon",
        ref: telefonRef,
        mesaj: telefonBos
          ? "Telefon numarası girin."
          : telefonDogrulamaHatasi(form.telefon),
      },
      {
        alan: "sehir",
        ref: sehirRef,
        mesaj: "Şehir seçin.",
      },
      {
        alan: "sifre",
        ref: sifreRef,
        mesaj: mesajlar.sifre ?? "Şifre gerekli.",
      },
      {
        alan: "sifreTekrar",
        ref: sifreTekrarRef,
        mesaj: mesajlar.sifreTekrar ?? "Şifre tekrarı gerekli.",
      },
      {
        alan: "yasalOnay",
        ref: yasalRef,
        mesaj: "Kayıt için yasal metinleri onaylayın.",
      },
    ];

    for (const { alan, ref, mesaj } of kontroller) {
      if (hatalar[alan]) {
        setError(mesaj);
        alanaKaydir(ref);
        return false;
      }
    }

    setError("");
    setAlanMesajlari({});
    return true;
  }

  function kaydaKaydir() {
    alanaKaydir(formRef);
  }

  async function otpGonder() {
    if (!formDogrula()) return;

    setLoading(true);
    setError("");
    setOtpBilgi("");
    try {
      const res = await cekiciFetch("/api/cekici/kayit/otp/gonder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefon: form.telefon }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Kod gönderilemedi.");

      setGelistirmeKodu(data.gelistirmeKodu ?? null);
      setYenidenSn(data.yenidenGonderSn ?? 60);
      setOtpBilgi(data.mesaj ?? "Doğrulama kodu gönderildi.");
      setOtpAsamasi(true);
      setOtpKod("");
      alanaKaydir(otpRef);
      posthogOlayYakala("cekici_otp_gonder", {
        rol: "cekici",
        sehir: form.sehir || undefined,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kod gönderilemedi.");
    } finally {
      setLoading(false);
    }
  }

  async function kayitOl(e: React.FormEvent) {
    e.preventDefault();
    if (!otpAsamasi) {
      tiktokPixelClickButton({
        content_id: "kayit_a_otp_gonder",
        content_name: "ucretsiz_cekici_kaydi_olustur",
      });
      await otpGonder();
      return;
    }

    if (!formDogrula()) return;

    if (otpKod.length !== 6) {
      setError("6 haneli doğrulama kodunu girin.");
      alanaKaydir(otpRef);
      return;
    }

    tiktokPixelClickButton({
      content_id: "kayit_a_kayit_ol",
      content_name: "kayit_ol",
    });

    setLoading(true);
    setError("");
    try {
      const res = await cekiciFetch("/api/cekici/kayit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ad: `${form.ad.trim()} ${form.soyad.trim()}`.trim(),
          telefon: form.telefon,
          sehir: form.sehir,
          sifre: form.sifre,
          dogumTarihi: dogumParcalarindanIso(
            form.dogumGun,
            form.dogumAy,
            form.dogumYil
          ),
          otpKod,
          kayitKodu: form.davetKodu.trim()
            ? davetKoduNormalize(form.davetKodu)
            : undefined,
          smsToken: smsTokenParam || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      posthogOlayYakala("cekici_kayit_tamamlandi", {
        rol: "cekici",
        sehir: form.sehir || undefined,
        davet_kodu: Boolean(form.davetKodu.trim()),
      });
      /* Funnel A: kayıt + hesap aynı anda — son onayda ikisi birden */
      const cekiciId =
        typeof data.id === "string" ? data.id : String(data.id ?? "");
      try {
        if (sessionStorage.getItem(META_COMPLETE_REG_KEY) !== "1") {
          sessionStorage.setItem(META_COMPLETE_REG_KEY, "1");
          metaPixelCompleteRegistration({ content_name: "cekici_kayit" });
        }
      } catch {
        metaPixelCompleteRegistration({ content_name: "cekici_kayit" });
      }
      await tiktokPixelKayitOl({
        content_name: "cekici_kayit_a",
        phone: form.telefon,
        externalId: cekiciId || null,
      });
      await tiktokPixelHesapOlustur({
        content_name: "cekici_hesap_a",
        phone: form.telefon,
        externalId: cekiciId || null,
      });
      /* Google Ads kaydolma — gtag hazır olunca; tam sayfa onay’da yedek */
      gtagAdsKaydolmaDonusumuBirKez({
        phone: form.telefon,
        firstName: form.ad,
        lastName: form.soyad,
      });
      /* Tam sayfa yüklemesi: Google Ads / GA «sayfa yükleme» dönüşümü için soft navigate kullanma */
      const sehirQs = form.sehir.trim()
        ? `?sehir=${encodeURIComponent(form.sehir.trim())}`
        : "";
      window.location.assign(`/cekici/kayit/onay${sehirQs}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kayıt başarısız.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <MobileShell
      subtitle="Çekici ve yol yardım — ücretsiz kayıt"
      backHref="/cekici/giris"
      footer={<YasalSiteFooter />}
    >
      <KayitKontenjanBilgi
        onizlemeGercekKayit={
          Number.isFinite(onizlemeGercekKayit) ? onizlemeGercekKayit : undefined
        }
      />

      <CekiciKayitLanding onKayitBasla={kaydaKaydir} />

      {error && (
        <Card className="border-red-200 bg-red-50 mb-4">
          <p className="text-red-700 text-sm" role="alert">
            {error}
          </p>
        </Card>
      )}

      {otpBilgi && (
        <Card className="border-emerald-200 bg-emerald-50 mb-4">
          <p className="text-emerald-800 text-sm" role="status">
            {otpBilgi}
          </p>
        </Card>
      )}

      <form ref={formRef} onSubmit={kayitOl} className="space-y-4" noValidate>
        <h2 className="text-base font-semibold text-slate-900">Kayıt formu</h2>
        <div ref={adRef} className="scroll-mt-28 space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Ad"
              placeholder="Ahmet"
              value={form.ad}
              onChange={(e) => {
                alanHatasiTemizle("ad");
                setForm((f) => ({ ...f, ad: e.target.value }));
              }}
              autoComplete="given-name"
              name="ad"
              invalid={alanHatalari.ad}
              required
            />
            <Field
              label="Soyad"
              placeholder="Yılmaz"
              value={form.soyad}
              onChange={(e) => {
                alanHatasiTemizle("soyad");
                setForm((f) => ({ ...f, soyad: e.target.value }));
              }}
              autoComplete="family-name"
              name="soyad"
              invalid={alanHatalari.soyad}
              required
            />
          </div>
          {(alanHatalari.ad || alanHatalari.soyad) && (
            <AlanHataMetni
              mesaj={
                alanMesajlari.ad ??
                alanMesajlari.soyad ??
                "Ad ve soyad girin."
              }
            />
          )}
        </div>

        <div ref={dogumRef} className="scroll-mt-28 space-y-1.5">
          <p
            className={`text-sm font-medium ${
              alanHatalari.dogumTarihi ? "text-red-700" : "text-slate-700"
            }`}
          >
            Doğum tarihi
          </p>
          <div className="grid grid-cols-3 gap-2">
            <SelectField
              label="Gün"
              value={form.dogumGun}
              onChange={(e) => {
                alanHatasiTemizle("dogumTarihi");
                setForm((f) => ({ ...f, dogumGun: e.target.value }));
              }}
              invalid={alanHatalari.dogumTarihi}
              required
              aria-label="Doğum günü"
            >
              <option value="">Gün</option>
              {Array.from(
                {
                  length: dogumAyGunSayisi(
                    Number(form.dogumYil) || 2000,
                    Number(form.dogumAy) || 1
                  ),
                },
                (_, i) => i + 1
              ).map((g) => (
                <option key={g} value={String(g)}>
                  {g}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="Ay"
              value={form.dogumAy}
              onChange={(e) => {
                alanHatasiTemizle("dogumTarihi");
                const ay = e.target.value;
                setForm((f) => {
                  const maxGun = dogumAyGunSayisi(
                    Number(f.dogumYil) || 2000,
                    Number(ay) || 1
                  );
                  const gun = Number(f.dogumGun);
                  return {
                    ...f,
                    dogumAy: ay,
                    dogumGun:
                      gun && gun > maxGun ? String(maxGun) : f.dogumGun,
                  };
                });
              }}
              invalid={alanHatalari.dogumTarihi}
              required
              aria-label="Doğum ayı"
            >
              <option value="">Ay</option>
              {DOGUM_AYLARI.map((a) => (
                <option key={a.deger} value={String(a.deger)}>
                  {a.etiket}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="Yıl"
              value={form.dogumYil}
              onChange={(e) => {
                alanHatasiTemizle("dogumTarihi");
                const yil = e.target.value;
                setForm((f) => {
                  const maxGun = dogumAyGunSayisi(
                    Number(yil) || 2000,
                    Number(f.dogumAy) || 1
                  );
                  const gun = Number(f.dogumGun);
                  return {
                    ...f,
                    dogumYil: yil,
                    dogumGun:
                      gun && gun > maxGun ? String(maxGun) : f.dogumGun,
                  };
                });
              }}
              invalid={alanHatalari.dogumTarihi}
              required
              aria-label="Doğum yılı"
            >
              <option value="">Yıl</option>
              {dogumYilSecenekleri().map((y) => (
                <option key={y} value={String(y)}>
                  {y}
                </option>
              ))}
            </SelectField>
          </div>
          <AlanHataMetni mesaj={alanMesajlari.dogumTarihi} />
          <p className="text-xs text-slate-500 mt-1">
            En az 18 yaşında olmalısınız.
          </p>
        </div>

        <div ref={telefonRef} className="scroll-mt-28">
          <Field
            label="Telefon"
            type="tel"
            placeholder="05XX XXX XX XX"
            value={form.telefon}
            onChange={(e) => {
              alanHatasiTemizle("telefon");
              setForm((f) => ({ ...f, telefon: e.target.value }));
            }}
            invalid={alanHatalari.telefon}
            required
          />
          <AlanHataMetni mesaj={alanMesajlari.telefon} />
        </div>

        <div ref={sehirRef} className="scroll-mt-28">
          <SelectField
            label="Şehir"
            value={form.sehir}
            onChange={(e) => {
              alanHatasiTemizle("sehir");
              setForm((f) => ({ ...f, sehir: e.target.value }));
            }}
            invalid={alanHatalari.sehir}
            required
          >
            <option value="">Şehir seçin</option>
            {DESTEKLENEN_ILLER.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </SelectField>
          <AlanHataMetni mesaj={alanMesajlari.sehir} />
          {form.sehir && !sehirKullanimAcikMi(form.sehir, acikIller) ? (
            <Card className="mt-2 border-amber-300 bg-amber-50">
              <p className="text-sm text-amber-950 leading-relaxed">
                Şu anda kayıt olabilirsiniz; fakat{" "}
                <strong>{form.sehir}</strong> kullanıma açılana kadar uygulamayı
                kullanamazsınız. Sizi bekleme listesinde önde tutacağız.
              </p>
            </Card>
          ) : (
            <p className="text-xs text-slate-500 mt-1">
              Açık şehirlerde panel hemen kullanılır. Kapalı illerden kayıt
              olabilirsiniz; şehir açılınca öncelikli bilgilendirilirsiniz.
              Kayıt sonrası Ayarlar&apos;da ilçeleri daraltabilirsiniz.
            </p>
          )}
        </div>

        <div className="scroll-mt-28">
          <Field
            label="Davet / kampanya kodu (isteğe bağlı)"
            placeholder="ör. TIKTOK100 veya arkadaşınızın kodu"
            value={form.davetKodu}
            onChange={(e) => {
              setDavetMesaj("");
              setDavetGecersiz(false);
              setDavetKontrol(false);
              setForm((f) => ({
                ...f,
                davetKodu: davetKoduNormalize(e.target.value),
              }));
            }}
            invalid={davetGecersiz}
            maxLength={20}
          />
          {form.davetKodu.trim() ? (
            <p
              className={`text-sm mt-1.5 ${
                davetGecersiz
                  ? "text-red-600"
                  : davetKontrol
                    ? "text-slate-500"
                    : "text-emerald-700"
              }`}
              role="status"
            >
              {davetMesaj ||
                (davetGecersiz
                  ? "Geçersiz davet kodu."
                  : "Kod kontrol ediliyor…")}
            </p>
          ) : (
            <p className="text-xs text-slate-500 mt-1">
              Davet kodu (20 kredi) veya kampanya kodu (reklam / sosyal medya)
              girebilirsiniz.
            </p>
          )}
        </div>

        <div ref={sifreRef} className="scroll-mt-28">
          <SifreAlani
            label="Şifre"
            placeholder="En az 6 karakter"
            autoComplete="new-password"
            value={form.sifre}
            onChange={(e) => {
              alanHatasiTemizle("sifre");
              setForm((f) => ({ ...f, sifre: e.target.value }));
            }}
            invalid={alanHatalari.sifre}
            required
          />
          <p className="text-xs text-slate-500 mt-1">
            En az {MIN_SIFRE_UZUNLUK} karakter (harf ve rakam).
          </p>
          <AlanHataMetni mesaj={alanMesajlari.sifre} />
        </div>

        <div ref={sifreTekrarRef} className="scroll-mt-28">
          <SifreAlani
            label="Şifre Tekrar"
            placeholder="Şifrenizi tekrar girin"
            autoComplete="new-password"
            value={form.sifreTekrar}
            onChange={(e) => {
              alanHatasiTemizle("sifreTekrar");
              if (alanHatalari.sifre && alanMesajlari.sifre === "Şifreler eşleşmiyor.") {
                alanHatasiTemizle("sifre");
              }
              setForm((f) => ({ ...f, sifreTekrar: e.target.value }));
            }}
            invalid={alanHatalari.sifreTekrar}
            required
          />
          <AlanHataMetni mesaj={alanMesajlari.sifreTekrar} />
        </div>

        <div ref={yasalRef} className="scroll-mt-28">
          <YasalOnayKutusu
            checked={yasalOnay}
            onChange={(v) => {
              alanHatasiTemizle("yasalOnay");
              setYasalOnay(v);
            }}
            invalid={alanHatalari.yasalOnay}
            rol="hizmet-veren"
          />
          <AlanHataMetni mesaj={alanMesajlari.yasalOnay} />
        </div>

        {otpAsamasi && (
          <div ref={otpRef} className="scroll-mt-28 space-y-3">
            <Card className="bg-slate-50 border-slate-200">
              <p className="text-sm text-slate-600 leading-relaxed">
                {telefonMaskele(form.telefon)} numarasına gönderilen 6 haneli
                kodu girin. Kodu onayladıktan sonra hesabınız oluşturulur.
              </p>
            </Card>
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
              label="SMS doğrulama kodu"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              maxLength={6}
              value={otpKod}
              onChange={(e) => {
                setError("");
                setOtpKod(e.target.value.replace(/\D/g, "").slice(0, 6));
              }}
            />
            <button
              type="button"
              onClick={() => void otpGonder()}
              disabled={loading || yenidenSn > 0}
              className="w-full text-sm text-amber-600 font-medium disabled:text-slate-400"
            >
              {yenidenSn > 0
                ? `Kodu tekrar gönder (${yenidenSn}s)`
                : "Kodu tekrar gönder"}
            </button>
            <button
              type="button"
              onClick={() => {
                setOtpAsamasi(false);
                setOtpKod("");
                setOtpBilgi("");
                setError("");
              }}
              className="w-full text-sm text-slate-500 underline"
            >
              Telefonu değiştir
            </button>
          </div>
        )}

        <p className="text-xs text-slate-500">
          Bildirim almak için kredi yüklemeniz gerekir (1 kredi = 1 talep
          bildirimi). Teklif vermek her zaman ücretsizdir.
        </p>

        <Btn
          type="submit"
          disabled={
            loading || (otpAsamasi && otpKod.length !== 6)
          }
        >
          {loading
            ? otpAsamasi
              ? "Kayıt yapılıyor…"
              : "Kod gönderiliyor…"
            : otpAsamasi
              ? "Kayıt Ol"
              : "Ücretsiz çekici kaydı oluştur"}
        </Btn>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Hesabınız var mı?{" "}
        <Link href="/cekici/giris" className="text-amber-600 font-medium">
          Giriş yapın
        </Link>
      </p>
    </MobileShell>
  );
}

export function CekiciKayitKontrolSayfa() {
  return (
    <Suspense
      fallback={
        <MobileShell subtitle="Çekici kaydı" backHref="/cekici/giris">
          <p className="text-center text-slate-500 py-12">Yükleniyor…</p>
        </MobileShell>
      }
    >
      <KayitIcerik />
    </Suspense>
  );
}

export default CekiciKayitKontrolSayfa;
