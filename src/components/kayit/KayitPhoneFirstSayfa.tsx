"use client";

import { Suspense, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MobileShell } from "@/components/MobileShell";
import { Btn, Field, Card } from "@/components/ui";
import { ACB_SHELL_MAX_W } from "@/lib/design-tokens";
import { KayitKontenjanBilgi } from "@/components/KayitKontenjanBilgi";
import { CekiciKayitLandingHero } from "@/components/cekici/CekiciKayitLandingHero";
import { YasalOnayKutusu } from "@/components/yasal/YasalOnayKutusu";
import type { KayitFunnelTanim } from "@/lib/kayit-funnel";
import { TELEFON_ORNEK_GIRISLERI } from "@/lib/telefon";
import {
  kayitFunnelAlanDoldu,
  kayitFunnelAlanFocus,
  kayitFunnelOlayBirKez,
  kayitFunnelOlayGonder,
  kayitFunnelSessionId,
} from "@/lib/kayit-funnel-client";
import { idleSonra } from "@/lib/idle-sonra";
import { cerezBannerAc, cerezOnayOku } from "@/lib/cerez-onay";

function cerezOnaySubscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener("acil-cerez-banner", handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("acil-cerez-banner", handler);
  };
}

function cerezOnaySecildiMi(): boolean {
  return cerezOnayOku() != null;
}

function KayitHeaderGiris() {
  return (
    <div className="flex flex-col items-end gap-1 max-w-[11rem] sm:max-w-none sm:flex-row sm:items-center sm:gap-2">
      <span className="text-[11px] sm:text-xs text-slate-600 leading-tight text-right">
        Zaten hesabınız var mı?
      </span>
      <Link
        href="/cekici/giris"
        className="inline-flex items-center justify-center rounded-full bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-700 touch-manipulation"
      >
        Giriş yapın
      </Link>
    </div>
  );
}

/** Analitik — dinamik import; posthog/gtag/pixel kayıt bundle’ına girmesin */
function posthogYakala(
  olay: string,
  props?: Record<string, unknown>
): void {
  void import("@/lib/posthog-client").then((m) => {
    m.posthogKampanyaKaydet();
    m.posthogOlayYakala(olay, props);
  });
}

function tiktokView(content_id: string, content_name: string): void {
  void import("@/lib/tiktok-pixel").then((m) =>
    m.tiktokPixelViewContent({ content_id, content_name })
  );
}

function tiktokClick(content_id: string, content_name: string): void {
  void import("@/lib/tiktok-pixel").then((m) =>
    m.tiktokPixelClickButton({ content_id, content_name })
  );
}

/** Meta CompleteRegistration bir kez (A formu / onay ile aynı anahtar) */
const META_COMPLETE_REG_KEY = "acil_meta_complete_reg";

const GUVEN = [
  "Kayıt ücretsiz",
  "Teklif vermek ücretsiz",
  "Komisyon yok",
] as const;

const ADIMLAR = [
  {
    ikon: "📍",
    baslik: "Çalıştığınız bölgeyi seçin",
    metin: "Hangi ilçelerde hizmet verdiğinizi belirtin.",
  },
  {
    ikon: "📲",
    baslik: "Yeni talep gelince SMS alın",
    metin: "Bölgenizde müşteri talep açtığında telefonunuza bildirim gelir.",
  },
  {
    ikon: "💰",
    baslik: "Fiyat verin, müşteri sizi seçsin",
    metin:
      "Fiyatınızı ve varış sürenizi yazın. Seçilirseniz telefon ve konum açılır.",
  },
] as const;

const SSS = [
  {
    q: "Kayıt ücretli mi?",
    a: "Hayır. Kayıt olmak ve fiyat teklifi vermek ücretsizdir.",
  },
  {
    q: "Kayıt olunca hemen iş gelir mi?",
    a: "İş garantisi verilmez. Seçtiğiniz bölgede uygun müşteri talebi açıldığında bildirim alırsınız.",
  },
  {
    q: "Müşterinin telefonu ne zaman görünür?",
    a: "Müşteri teklifinizi seçtiğinde telefon ve konum bilgileri açılır.",
  },
  {
    q: "Kredi ne zaman kullanılır?",
    a: "Yeni bir talep size bildirim olarak açıldığında 1 kredi kullanılır. Teklif verirken ayrıca kredi düşmez.",
  },
  {
    q: "İstanbul dışında kayıt olabilir miyim?",
    a: "Olabilirsiniz. Şehriniz aktif olduğunda öncelikli olarak bilgilendirilirsiniz.",
  },
] as const;

function PhoneFirstIcerik({ funnel }: { funnel: KayitFunnelTanim }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLDivElement>(null);
  const telefonRef = useRef<HTMLInputElement>(null);
  const aKartlari = Boolean(funnel.aLandingKartlari);
  const cerezSecildi = useSyncExternalStore(
    cerezOnaySubscribe,
    cerezOnaySecildiMi,
    () => true
  );

  const onizlemeRaw = searchParams.get("onizleme");
  const onizlemeGercekKayit =
    process.env.NODE_ENV === "development" && onizlemeRaw
      ? Number.parseInt(onizlemeRaw, 10)
      : NaN;

  const [telefon, setTelefon] = useState("");
  const [otp, setOtp] = useState("");
  const [otpAsama, setOtpAsama] = useState(false);
  const urlDavet = (
    searchParams.get("kampanya") ||
    searchParams.get("davet") ||
    searchParams.get("kod") ||
    ""
  ).trim();
  const [davetDuzenleme, setDavetDuzenleme] = useState<string | null>(null);
  const davetKodu = davetDuzenleme ?? urlDavet;
  const setDavetKodu = setDavetDuzenleme;
  const [yasalOnay, setYasalOnay] = useState(false);
  const [yasalHata, setYasalHata] = useState(false);
  const [telefonHata, setTelefonHata] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [yenidenSn, setYenidenSn] = useState(0);
  const [basarili, setBasarili] = useState(false);

  const smsTokenParam = searchParams.get("sms_token")?.trim() || "";

  useEffect(() => {
    kayitFunnelOlayBirKez(
      funnel.id,
      "goruldu",
      smsTokenParam ? { meta: { kaynak: "sms50" } } : undefined
    );
    return idleSonra(() => {
      posthogYakala("cekici_kayit_goruldu", {
        rol: "cekici",
        funnel: funnel.id,
      });
      tiktokView(`kayit_${funnel.id}`, `cekici_kayit_${funnel.id}`);
    });
  }, [funnel.id, smsTokenParam]);

  useEffect(() => {
    if (yenidenSn <= 0) return;
    const t = setTimeout(() => setYenidenSn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [yenidenSn]);

  function funnelMeta() {
    return smsTokenParam ? { kaynak: "sms50" as const } : undefined;
  }

  function kodGonderTikla() {
    if (loading) return;
    const rakamSayisi = telefon.replace(/\D/g, "").length;
    if (rakamSayisi < 10) {
      setTelefonHata(true);
      telefonRef.current?.focus();
      telefonRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }
    setTelefonHata(false);
    void kodGonder();
  }

  async function kodGonder() {
    if (!yasalOnay) {
      setYasalHata(true);
      setError("Yasal metinleri onaylamanız zorunludur.");
      return;
    }
    setLoading(true);
    setError("");
    setMesaj("");
    setYasalHata(false);
    try {
      tiktokClick(`kayit_${funnel.id}_otp`, "telefonuma_kod_gonder");
      void kayitFunnelOlayGonder(
        funnel.id,
        otpAsama ? "btn_otp_yeniden" : "btn_otp_gonder",
        { meta: funnelMeta() }
      );
      void kayitFunnelOlayGonder(funnel.id, "otp_gonder", {
        meta: funnelMeta(),
      });
      const res = await fetch("/api/cekici/kayit/otp/gonder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefon: telefon.trim() }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.status === 409) {
        void kayitFunnelOlayGonder(funnel.id, "zaten_kayitli", {
          meta: funnelMeta(),
        });
        const q = new URLSearchParams({
          telefon: telefon.trim(),
          mesaj: "zaten-kayitli",
        });
        router.push(`/cekici/giris?${q.toString()}`);
        return;
      }
      if (!res.ok && !d.kodBekliyor) {
        throw new Error(typeof d.error === "string" ? d.error : "Kod gönderilemedi.");
      }
      setOtpAsama(true);
      setYenidenSn(Number(d.yenidenGonderSn) || 60);
      setMesaj(typeof d.mesaj === "string" ? d.mesaj : "Kod gönderildi.");
      if (d.gelistirmeKodu) {
        setMesaj((m) => `${m} (geliştirme kodu: ${d.gelistirmeKodu})`);
      }
      posthogYakala("cekici_otp_gonder", {
        rol: "cekici",
        funnel: funnel.id,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kod gönderilemedi.");
    } finally {
      setLoading(false);
    }
  }

  async function hesapOlustur() {
    if (!yasalOnay) {
      setYasalHata(true);
      setError("Yasal metinleri onaylamanız zorunludur.");
      return;
    }
    setLoading(true);
    setError("");
    setYasalHata(false);
    try {
      tiktokClick(`kayit_${funnel.id}_dogrula`, "dogrula_ve_kaydi_tamamla");
      void kayitFunnelOlayGonder(funnel.id, "btn_kayit_submit", {
        meta: funnelMeta(),
      });
      const smsToken = searchParams.get("sms_token")?.trim() || undefined;
      const res = await fetch("/api/cekici/kayit/hizli", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telefon: telefon.trim(),
          otpKod: otp.trim(),
          funnel: funnel.id,
          sessionId: kayitFunnelSessionId(),
          kayitKodu: davetKodu.trim() || undefined,
          smsToken,
        }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.status === 409) {
        void kayitFunnelOlayGonder(funnel.id, "zaten_kayitli", {
          meta: funnelMeta(),
        });
        const q = new URLSearchParams({
          telefon: telefon.trim(),
          mesaj: "zaten-kayitli",
        });
        router.push(`/cekici/giris?${q.toString()}`);
        return;
      }
      if (!res.ok) {
        void kayitFunnelOlayGonder(funnel.id, "otp_hata", {
          meta: funnelMeta(),
        });
        throw new Error(typeof d.error === "string" ? d.error : "Kayıt başarısız.");
      }
      posthogYakala("cekici_kayit_tamamlandi", {
        rol: "cekici",
        funnel: funnel.id,
        hizli: true,
      });
      /* Funnel B+: telefon OTP sonrası → Meta + TikTok kayıt dönüşümü */
      const cekiciId =
        typeof d.id === "string" ? d.id : String(d.id ?? "");
      const telefonTrim = telefon.trim();
      try {
        if (sessionStorage.getItem(META_COMPLETE_REG_KEY) !== "1") {
          sessionStorage.setItem(META_COMPLETE_REG_KEY, "1");
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
        }
      } catch {
        void import("@/lib/meta-pixel").then((m) =>
          m.metaPixelCompleteRegistration({
            content_name: `cekici_kayit_${funnel.id}`,
            phone: telefonTrim,
            externalId: cekiciId || null,
          })
        );
      }
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
      const hedef =
        typeof d.yonlendir === "string" && d.yonlendir.startsWith("/")
          ? d.yonlendir
          : "/kayit/kurulum";
      router.replace(hedef);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kayıt başarısız.");
    } finally {
      setLoading(false);
    }
  }

  if (basarili) {
    return (
      <MobileShell subtitle="Kayıt tamam" headerEnd={<KayitHeaderGiris />}>
        <Card className="space-y-4 border-emerald-200 bg-emerald-50">
          <h1 className="text-xl font-bold text-slate-900">
            Kaydınız oluşturuldu
          </h1>
          <p className="text-[17px] text-slate-700 leading-relaxed">
            Hesap kurulumunu tamamla ve bonus kredi kazan.
          </p>
          <Btn
            className="w-full min-h-[52px] text-base"
            onClick={() => {
              tiktokClick(`kayit_${funnel.id}_kurulum`, "hesap_kurulumuna_gec");
              router.push("/kayit/kurulum");
            }}
          >
            Hesap kurulumunu tamamla
          </Btn>
        </Card>
      </MobileShell>
    );
  }

  function kaydaKaydir() {
    kayitFunnelOlayBirKez(funnel.id, "cta_kayit_basla", {
      meta: funnelMeta(),
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <MobileShell
      headerEnd={<KayitHeaderGiris />}
      footer={
        !otpAsama ? (
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(15,23,42,0.06)]">
            <div className={`mx-auto w-full ${ACB_SHELL_MAX_W} space-y-1.5`}>
              <Btn
                className="w-full min-h-[48px] text-base bg-amber-600 hover:bg-amber-700"
                disabled={loading}
                onClick={kodGonderTikla}
              >
                {loading ? "Gönderiliyor…" : "Telefonuma kod gönder"}
              </Btn>
              <p className="text-center text-[11px] text-slate-500 leading-snug">
                SMS ile doğrulanır · Kart gerekmez · ~2 dk
                {!cerezSecildi ? (
                  <>
                    {" · "}
                    <button
                      type="button"
                      className="underline text-slate-500 hover:text-slate-700"
                      onClick={() => cerezBannerAc()}
                    >
                      Çerezleri yönet
                    </button>
                  </>
                ) : null}
              </p>
            </div>
          </div>
        ) : undefined
      }
    >
      <div className={`space-y-5 ${!otpAsama ? "pb-28" : "pb-8"}`}>
        {aKartlari && (
          <div className="space-y-3">
            <KayitKontenjanBilgi
              onizlemeGercekKayit={
                Number.isFinite(onizlemeGercekKayit)
                  ? onizlemeGercekKayit
                  : undefined
              }
            />
            <CekiciKayitLandingHero
              onKayitBasla={kaydaKaydir}
              ctaMetin="Ücretsiz kaydı başlat"
            />
          </div>
        )}

        <section className="space-y-3">
          {!aKartlari && (
            <>
              {funnel.ustBaslik ? (
                <p className="text-[11px] font-semibold tracking-wide text-amber-800 uppercase">
                  {funnel.ustBaslik}
                </p>
              ) : null}
              <h1 className="text-[1.35rem] font-bold text-slate-900 leading-snug">
                {funnel.baslik}
              </h1>
              <p className="text-sm text-slate-600 leading-snug">
                {funnel.altMetin}
              </p>
              <ul className="space-y-1 text-sm text-slate-800">
                {GUVEN.map((g) => (
                  <li key={g} className="flex gap-2">
                    <span className="text-emerald-600 font-bold" aria-hidden>
                      ✓
                    </span>
                    {g}
                  </li>
                ))}
              </ul>
            </>
          )}

          <div
            ref={formRef}
            id="kayit-form"
            className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-3.5 space-y-2.5 shadow-sm"
          >
            <h2 className="font-semibold text-slate-900 text-base">
              Ücretsiz kaydı başlat
            </h2>
            <p className="text-sm font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 leading-snug">
              İlk 50 çekiciye 50 SMS ücretsiz.
            </p>
            {!otpAsama ? (
              <>
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
                  onBlur={() =>
                    kayitFunnelAlanDoldu(funnel.id, "telefon", telefon)
                  }
                  className="text-base min-h-[46px]"
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
                {mesaj && <p className="text-sm text-emerald-700">{mesaj}</p>}
                {error && <p className="text-sm text-red-600">{error}</p>}
              </>
            ) : (
              <>
                <p className="text-sm text-slate-600">
                  Kod gönderildi:{" "}
                  <span className="font-medium text-slate-900">{telefon}</span>
                </p>
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
                <Btn
                  className="w-full min-h-[52px] text-base bg-amber-600 hover:bg-amber-700"
                  disabled={loading || otp.length !== 6}
                  onClick={() => void hesapOlustur()}
                >
                  {loading ? "Doğrulanıyor…" : "Doğrula ve kaydı tamamla"}
                </Btn>
                <div className="flex flex-wrap gap-3 text-sm">
                  <button
                    type="button"
                    className="text-amber-800 font-medium disabled:opacity-40"
                    disabled={yenidenSn > 0 || loading}
                    onClick={() => void kodGonder()}
                  >
                    {yenidenSn > 0
                      ? `Tekrar gönder (${yenidenSn})`
                      : "Kodu tekrar gönder"}
                  </button>
                  <button
                    type="button"
                    className="text-slate-600 font-medium"
                    onClick={() => {
                      setOtpAsama(false);
                      setOtp("");
                      setError("");
                    }}
                  >
                    Numarayı değiştir
                  </button>
                </div>
                {mesaj && <p className="text-sm text-emerald-700">{mesaj}</p>}
                {error && <p className="text-sm text-red-600">{error}</p>}
              </>
            )}
          </div>

          {funnel.tesvikMetin && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-sm font-medium text-amber-900">
                {funnel.tesvikBaslik}
              </p>
              <p className="text-[17px] font-bold text-amber-950 mt-0.5">
                {funnel.tesvikMetin}
              </p>
            </div>
          )}

          <div className="rounded-xl border border-slate-100 bg-white px-3.5 py-3 space-y-2">
            <p className="text-sm font-medium text-slate-800">Davet kodum var</p>
            <Field
              label="Davet / kampanya kodu"
              value={davetKodu}
              onChange={(e) => setDavetKodu(e.target.value)}
              placeholder="Opsiyonel"
            />
          </div>
        </section>

        <section aria-labelledby="nasil-calisir-baslik">
          <h2
            id="nasil-calisir-baslik"
            className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2 px-0.5"
          >
            Sistem nasıl çalışıyor?
          </h2>
          <div className="grid gap-2">
            {ADIMLAR.map((a) => (
              <Card
                key={a.baslik}
                className="!py-3 !px-3.5 flex gap-3 items-start border-slate-100"
              >
                <span className="text-2xl shrink-0" aria-hidden>
                  {a.ikon}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {a.baslik}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {a.metin}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section aria-labelledby="ucretler-baslik">
          <h2
            id="ucretler-baslik"
            className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2 px-0.5"
          >
            Ücretler nasıl çalışıyor?
          </h2>
          <Card className="!p-3.5 border-emerald-100 bg-emerald-50/40 space-y-2">
            <p className="text-sm font-semibold text-slate-900">
              Kayıt ve teklif vermek ücretsizdir
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bölgenizdeki yeni bir talep size SMS ve panel bildirimi olarak
              açıldığında 1 bildirim kredisi kullanılır. Teklif verirken ek
              kredi düşmez. Paket satın almak zorunlu değildir.
            </p>
            <p className="text-xs text-slate-800 font-medium leading-relaxed pt-1 border-t border-emerald-100/80">
              Müşteriden komisyon kesmeyiz. Ödemeyi müşteriyle doğrudan kendi
              aranızda yaparsınız.
            </p>
          </Card>
        </section>

        <section aria-labelledby="sss-baslik">
          <h2
            id="sss-baslik"
            className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2 px-0.5"
          >
            Sık sorulan sorular
          </h2>
          <div className="space-y-2">
            {SSS.map((s) => (
              <details
                key={s.q}
                className="rounded-xl border border-slate-100 bg-white px-3.5 py-3 group"
              >
                <summary className="cursor-pointer text-sm font-semibold text-slate-900 list-none flex items-center justify-between gap-2">
                  <span>{s.q}</span>
                  <span
                    className="text-slate-400 text-xs shrink-0 group-open:rotate-180 transition"
                    aria-hidden
                  >
                    ▼
                  </span>
                </summary>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  {s.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        <p className="text-center text-sm text-slate-500 px-0.5">
          Zaten üye misiniz?{" "}
          <Link href="/cekici/giris" className="text-amber-800 font-medium">
            Giriş yapın
          </Link>
          {" · "}
          <Link href="/cekici/giris" className="text-slate-600">
            Takıldın mı? Destek için giriş sayfasından yazın
          </Link>
        </p>
      </div>

    </MobileShell>
  );
}

export function KayitPhoneFirstSayfa({ funnel }: { funnel: KayitFunnelTanim }) {
  return (
    <Suspense
      fallback={
        <MobileShell subtitle="Kayıt" headerEnd={<KayitHeaderGiris />}>
          <p className="text-center text-slate-500 py-12">Yükleniyor…</p>
        </MobileShell>
      }
    >
      <PhoneFirstIcerik funnel={funnel} />
    </Suspense>
  );
}
