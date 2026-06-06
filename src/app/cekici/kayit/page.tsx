"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MobileShell } from "@/components/MobileShell";
import { Btn, Field, SelectField, SifreAlani, Card } from "@/components/ui";
import { KayitKontenjanBilgi } from "@/components/KayitKontenjanBilgi";
import { cekiciFetch } from "@/lib/cekici-fetch";
import { DESTEKLENEN_ILLER } from "@/lib/il-ilce";
import { YasalOnayKutusu } from "@/components/yasal/YasalOnayKutusu";
import { YasalSiteFooter } from "@/components/yasal/YasalSiteFooter";
import { telefonDogrulamaHatasi, telefonGecerliMi } from "@/lib/telefon";
import { davetKoduNormalize } from "@/lib/davet-kodu";

type KayitAlan = "ad" | "soyad" | "telefon" | "sifre" | "sifreTekrar" | "yasalOnay";

type AlanHatalari = Record<KayitAlan, boolean>;

const BOS_ALAN_HATALARI: AlanHatalari = {
  ad: false,
  soyad: false,
  telefon: false,
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

  const adRef = useRef<HTMLDivElement>(null);
  const telefonRef = useRef<HTMLDivElement>(null);
  const sifreRef = useRef<HTMLDivElement>(null);
  const sifreTekrarRef = useRef<HTMLDivElement>(null);
  const yasalRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    ad: "",
    soyad: "",
    telefon: "",
    sehir: "İstanbul",
    sifre: "",
    sifreTekrar: "",
    davetKodu: davetParam,
  });
  const [davetMesaj, setDavetMesaj] = useState("");
  const [davetGecersiz, setDavetGecersiz] = useState(false);
  const [davetKontrol, setDavetKontrol] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [yasalOnay, setYasalOnay] = useState(false);
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

  function alanaKaydir(ref: React.RefObject<HTMLDivElement | null>) {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        scrollBelowStickyHeader(ref.current);
      });
    });
  }

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

    const hatalar: AlanHatalari = {
      ad: adBos,
      soyad: soyadBos,
      telefon: telefonBos || telefonGecersiz,
      sifre: sifreBos || sifreKisa,
      sifreTekrar: sifreTekrarBos || sifreUyumsuz,
      yasalOnay: !yasalOnay,
    };
    setAlanHatalari(hatalar);

    const mesajlar: Partial<Record<KayitAlan, string>> = {};
    if (adBos) mesajlar.ad = "Ad girin.";
    if (soyadBos) mesajlar.soyad = "Soyad girin.";
    if (telefonBos) mesajlar.telefon = "Telefon numarası girin.";
    else if (telefonGecersiz)
      mesajlar.telefon = telefonDogrulamaHatasi(form.telefon);
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
        alan: "telefon",
        ref: telefonRef,
        mesaj: telefonBos
          ? "Telefon numarası girin."
          : telefonDogrulamaHatasi(form.telefon),
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

  async function kayitOl(e: React.FormEvent) {
    e.preventDefault();
    if (!formDogrula()) return;

    setLoading(true);
    try {
      const res = await cekiciFetch("/api/cekici/kayit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ad: `${form.ad.trim()} ${form.soyad.trim()}`.trim(),
          telefon: form.telefon,
          sehir: form.sehir,
          sifre: form.sifre,
          kayitKodu: form.davetKodu.trim()
            ? davetKoduNormalize(form.davetKodu)
            : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.refresh();
      router.push("/cekici/panel?mesaj=kayit-basarili");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kayıt başarısız.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <MobileShell
      subtitle="Hizmet veren kaydı — acilcozumbul.com"
      backHref="/cekici/giris"
      footer={<YasalSiteFooter />}
    >
      <KayitKontenjanBilgi
        onizlemeGercekKayit={
          Number.isFinite(onizlemeGercekKayit) ? onizlemeGercekKayit : undefined
        }
      />

      {error && (
        <Card className="border-red-200 bg-red-50 mb-4">
          <p className="text-red-700 text-sm" role="alert">
            {error}
          </p>
        </Card>
      )}

      <form onSubmit={kayitOl} className="space-y-4" noValidate>
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

        <div className="scroll-mt-28">
          <SelectField
            label="İl"
            value={form.sehir}
            onChange={(e) => setForm((f) => ({ ...f, sehir: e.target.value }))}
          >
            {DESTEKLENEN_ILLER.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </SelectField>
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

        <p className="text-xs text-slate-500">
          Kayıt ücretsizdir. Kredi yükleyerek bölgenizdeki talep SMS bildirimlerini
          alırsınız (1 kredi = 1 bildirim ve panelde talep görünürlüğü). Teklif
          vermek ücretsizdir.
        </p>

        <Btn type="submit" disabled={loading}>
          {loading ? "Kayıt yapılıyor…" : "Kayıt Ol"}
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

export default function CekiciKayitPage() {
  return (
    <Suspense
      fallback={
        <MobileShell subtitle="Hizmet veren kaydı" backHref="/cekici/giris">
          <p className="text-center text-slate-500 py-12">Yükleniyor…</p>
        </MobileShell>
      }
    >
      <KayitIcerik />
    </Suspense>
  );
}
