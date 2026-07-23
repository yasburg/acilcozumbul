"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MobileShell } from "@/components/MobileShell";
import { Btn, Field, Card } from "@/components/ui";
import type { KayitFunnelTanim } from "@/lib/kayit-funnel";
import { TELEFON_ORNEK_GIRISLERI } from "@/lib/telefon";
import { posthogKampanyaKaydet, posthogOlayYakala } from "@/lib/posthog-client";
import {
  kayitFunnelOlayGonder,
  kayitFunnelSessionId,
} from "@/lib/kayit-funnel-client";

const GUVEN = [
  "Kayıt ücretsiz",
  "Teklif vermek ücretsiz",
  "Komisyon yok",
] as const;

const ADIMLAR = [
  {
    baslik: "Çalıştığınız bölgeyi seçin",
    metin: "Hangi ilçelerde hizmet verdiğinizi belirtin.",
  },
  {
    baslik: "Yeni talep gelince SMS alın",
    metin: "Bölgenizde müşteri talep açtığında telefonunuza bildirim gelir.",
  },
  {
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

  const [telefon, setTelefon] = useState("");
  const [otp, setOtp] = useState("");
  const [otpAsama, setOtpAsama] = useState(false);
  const [davetAcik, setDavetAcik] = useState(false);
  const [davetKodu, setDavetKodu] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [yenidenSn, setYenidenSn] = useState(0);
  const [basarili, setBasarili] = useState(false);

  useEffect(() => {
    posthogKampanyaKaydet();
    const kod =
      searchParams.get("kampanya") ||
      searchParams.get("davet") ||
      searchParams.get("kod") ||
      "";
    if (kod.trim()) {
      setDavetKodu(kod.trim());
      setDavetAcik(false);
    }
    posthogOlayYakala("cekici_kayit_goruldu", {
      rol: "cekici",
      funnel: funnel.id,
    });
    void kayitFunnelOlayGonder(funnel.id, "goruldu");
  }, [funnel.id, searchParams]);

  useEffect(() => {
    if (yenidenSn <= 0) return;
    const t = setTimeout(() => setYenidenSn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [yenidenSn]);

  async function kodGonder() {
    setLoading(true);
    setError("");
    setMesaj("");
    try {
      void kayitFunnelOlayGonder(funnel.id, "otp_gonder");
      const res = await fetch("/api/cekici/kayit/otp/gonder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefon: telefon.trim() }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok && !d.kodBekliyor) {
        throw new Error(typeof d.error === "string" ? d.error : "Kod gönderilemedi.");
      }
      setOtpAsama(true);
      setYenidenSn(Number(d.yenidenGonderSn) || 60);
      setMesaj(typeof d.mesaj === "string" ? d.mesaj : "Kod gönderildi.");
      if (d.gelistirmeKodu) {
        setMesaj((m) => `${m} (geliştirme kodu: ${d.gelistirmeKodu})`);
      }
      posthogOlayYakala("cekici_otp_gonder", {
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
    setLoading(true);
    setError("");
    try {
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
      if (!res.ok) {
        throw new Error(typeof d.error === "string" ? d.error : "Kayıt başarısız.");
      }
      posthogOlayYakala("cekici_kayit_tamamlandi", {
        rol: "cekici",
        funnel: funnel.id,
        hizli: true,
      });
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
            onClick={() => router.push("/kayit/kurulum")}
          >
            Hesabımı hazırlamaya başla
          </Btn>
        </Card>
      </MobileShell>
    );
  }

  return (
    <MobileShell subtitle="Çekici kaydı" backHref="/cekici/giris">
      <div className="space-y-8 pb-8">
        <section className="space-y-4">
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

          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
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
                <Btn
                  className="w-full min-h-[52px] text-base bg-amber-600 hover:bg-amber-700"
                  disabled={loading || telefon.trim().length < 10}
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

          <details className="text-sm text-slate-600">
            <summary
              className="cursor-pointer font-medium text-slate-800"
              onClick={() => setDavetAcik(true)}
            >
              Davet kodum var
            </summary>
            {(davetAcik || davetKodu) && (
              <div className="mt-2">
                <Field
                  label="Davet / kampanya kodu"
                  value={davetKodu}
                  onChange={(e) => setDavetKodu(e.target.value)}
                  placeholder="Opsiyonel"
                />
              </div>
            )}
          </details>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            Sistem nasıl çalışıyor?
          </h2>
          <ol className="space-y-3">
            {ADIMLAR.map((a, i) => (
              <li
                key={a.baslik}
                className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <p className="font-semibold text-slate-900">
                  {i + 1}. {a.baslik}
                </p>
                <p className="text-[16px] text-slate-600 mt-1">{a.metin}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">
            Ücretler nasıl çalışıyor?
          </h2>
          <p className="text-[17px] font-semibold text-slate-900">
            Kayıt ve teklif vermek ücretsizdir
          </p>
          <p className="text-[16px] text-slate-600 leading-relaxed">
            Bölgenizdeki yeni bir talep size SMS ve panel bildirimi olarak
            açıldığında 1 bildirim kredisi kullanılır. Teklif verirken ek kredi
            düşmez. Paket satın almak zorunlu değildir.
          </p>
          <p className="text-[16px] text-slate-800 font-medium leading-relaxed">
            Müşteriden komisyon kesmeyiz. Ödemeyi müşteriyle doğrudan kendi
            aranızda yaparsınız.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">Sık sorulan sorular</h2>
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-100">
            {SSS.map((s) => (
              <details key={s.q} className="px-3 py-2.5 group">
                <summary className="cursor-pointer font-medium text-slate-900 text-[16px]">
                  {s.q}
                </summary>
                <p className="mt-2 text-[15px] text-slate-600 leading-relaxed">
                  {s.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        <p className="text-center text-sm text-slate-500">
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
