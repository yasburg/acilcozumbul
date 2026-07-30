"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MobileShell } from "@/components/MobileShell";
import { Btn, Field, Card } from "@/components/ui";
import { KayitKontenjanBilgi } from "@/components/KayitKontenjanBilgi";
import { CekiciKayitLandingHero } from "@/components/cekici/CekiciKayitLandingHero";
import { YasalOnayKutusu } from "@/components/yasal/YasalOnayKutusu";
import type { KayitFunnelTanim } from "@/lib/kayit-funnel";
import { TELEFON_ORNEK_GIRISLERI } from "@/lib/telefon";
import {
  kayitFunnelOlayGonder,
  kayitFunnelSessionId,
} from "@/lib/kayit-funnel-client";
import { idleSonra } from "@/lib/idle-sonra";

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
  const aKartlari = Boolean(funnel.aLandingKartlari);

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [yenidenSn, setYenidenSn] = useState(0);
  const [basarili, setBasarili] = useState(false);

  useEffect(() => {
    void kayitFunnelOlayGonder(funnel.id, "goruldu");
    return idleSonra(() => {
      posthogYakala("cekici_kayit_goruldu", {
        rol: "cekici",
        funnel: funnel.id,
      });
      tiktokView(`kayit_${funnel.id}`, `cekici_kayit_${funnel.id}`);
    });
  }, [funnel.id]);

  useEffect(() => {
    if (yenidenSn <= 0) return;
    const t = setTimeout(() => setYenidenSn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [yenidenSn]);

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
      void kayitFunnelOlayGonder(funnel.id, "otp_gonder");
      const res = await fetch("/api/cekici/kayit/otp/gonder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefon: telefon.trim() }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.status === 409) {
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
        const q = new URLSearchParams({
          telefon: telefon.trim(),
          mesaj: "zaten-kayitli",
        });
        router.push(`/cekici/giris?${q.toString()}`);
        return;
      }
      if (!res.ok) {
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
          void import("@/lib/meta-pixel").then((m) =>
            m.metaPixelCompleteRegistration({
              content_name: `cekici_kayit_${funnel.id}`,
            })
          );
        }
      } catch {
        void import("@/lib/meta-pixel").then((m) =>
          m.metaPixelCompleteRegistration({
            content_name: `cekici_kayit_${funnel.id}`,
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
      setBasarili(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kayıt başarısız.");
    } finally {
      setLoading(false);
    }
  }

  if (basarili) {
    return (
      <MobileShell subtitle="Kayıt tamam" backHref="/cekici/giris">
        <Card className="space-y-4 border-emerald-200 bg-emerald-50">
          <h1 className="text-xl font-bold text-slate-900">
            Kaydınız oluşturuldu
          </h1>
          <p className="text-[17px] text-slate-700 leading-relaxed">
            Bölgenize uygun işleri alabilmeniz için hesabınızı hazırlayalım.
            Yaklaşık 2 dakika sürer.
          </p>
          <Btn
            className="w-full min-h-[52px] text-base"
            onClick={() => {
              tiktokClick(
                `kayit_${funnel.id}_kurulum`,
                "hesabimi_hazirlamaya_basla"
              );
              router.push("/kayit/kurulum");
            }}
          >
            Hesabımı hazırlamaya başla
          </Btn>
        </Card>
      </MobileShell>
    );
  }

  function kaydaKaydir() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <MobileShell subtitle="Çekici kaydı" backHref="/cekici/giris">
      <div className="space-y-8 pb-8">
        {aKartlari && (
          <div className="space-y-4">
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

        <section className="space-y-4">
          {!aKartlari && (
            <>
              <p className="text-xs font-semibold tracking-wide text-amber-800 uppercase">
                {funnel.ustBaslik}
              </p>
              <h1 className="text-[1.65rem] font-bold text-slate-900 leading-snug">
                {funnel.baslik}
              </h1>
              <p className="text-[17px] text-slate-600 leading-relaxed">
                {funnel.altMetin}
              </p>
              <ul className="space-y-1.5 text-[16px] text-slate-800">
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
            className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm"
          >
            <h2 className="font-semibold text-slate-900 text-lg">
              Ücretsiz kaydı başlat
            </h2>
            {!otpAsama ? (
              <>
                <Field
                  label="Telefon numaranız"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder={TELEFON_ORNEK_GIRISLERI[0] ?? "05XX XXX XX XX"}
                  value={telefon}
                  onChange={(e) => setTelefon(e.target.value)}
                  onFocus={() => {
                    void kayitFunnelOlayGonder(funnel.id, "telefon_focus");
                  }}
                  className="text-lg min-h-[52px]"
                />
                <YasalOnayKutusu
                  checked={yasalOnay}
                  onChange={(v) => {
                    setYasalOnay(v);
                    if (v) {
                      setYasalHata(false);
                      setError("");
                    }
                  }}
                  invalid={yasalHata}
                  rol="hizmet-veren"
                />
                <Btn
                  className="w-full min-h-[52px] text-base bg-amber-600 hover:bg-amber-700"
                  disabled={loading || telefon.trim().length < 10 || !yasalOnay}
                  onClick={() => void kodGonder()}
                >
                  {loading ? "Gönderiliyor…" : "Telefonuma kod gönder"}
                </Btn>
                <p className="text-sm text-slate-500 leading-relaxed">
                  SMS ile doğrulanır. Kart bilgisi gerekmez. Yaklaşık 2 dakika
                  sürer.
                </p>
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
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
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
              </>
            )}
            {mesaj && <p className="text-sm text-emerald-700">{mesaj}</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
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
        <MobileShell subtitle="Kayıt" backHref="/cekici/giris">
          <p className="text-center text-slate-500 py-12">Yükleniyor…</p>
        </MobileShell>
      }
    >
      <PhoneFirstIcerik funnel={funnel} />
    </Suspense>
  );
}
