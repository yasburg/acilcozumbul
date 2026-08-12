"use client";

import { useEffect, useRef, useState } from "react";
import { Btn, Field, Spinner } from "@/components/ui";
import { YasalOnayKutusu } from "@/components/yasal/YasalOnayKutusu";
import { gtagUserDataAyarla } from "@/lib/gtag";
import { metaUserDataSakla } from "@/lib/meta-pixel";
import {
  musteriFunnelOlayBirKez,
  musteriFunnelOlayGonder,
} from "@/lib/musteri-funnel-client";
import type { MusteriFunnelId } from "@/lib/musteri-funnel";
import { telefonDogrulamaHatasi } from "@/lib/telefon";

type Props = {
  funnelId: MusteriFunnelId;
  ad: string;
  telefon: string;
  yasalOnay: boolean;
  onAdChange: (v: string) => void;
  onTelefonChange: (v: string) => void;
  onYasalOnayChange: (v: boolean) => void;
  telefonHata?: string;
  yasalHata?: string;
  sorunLabel?: string | null;
  onGeri: () => void;
  /** OTP doğrulandıktan sonra talep oluşturma */
  onHazir: () => void | Promise<void>;
  submitting?: boolean;
  submitEtiket?: React.ReactNode;
  /** Step-window progress indicator, rendered above the Geri/Devam row */
  progress?: React.ReactNode;
};

function dogrulanmisUserDataSakla(telefon: string, ad: string) {
  if (!telefon.trim()) return;
  metaUserDataSakla({
    phone: telefon,
    firstName: ad.trim() || undefined,
  });
  gtagUserDataAyarla({
    phone: telefon,
    firstName: ad.trim() || undefined,
  });
}

/**
 * Form son adımı: telefon + isim + yasal onay + OTP.
 * Talep oluşturulmadan önce numarayı doğrular (sesli arama için gerekli).
 */
export function MusteriFormIletisimOtp({
  funnelId,
  ad,
  telefon,
  yasalOnay,
  onAdChange,
  onTelefonChange,
  onYasalOnayChange,
  telefonHata = "",
  yasalHata = "",
  sorunLabel,
  onGeri,
  onHazir,
  submitting = false,
  submitEtiket,
  progress,
}: Props) {
  const [adim, setAdim] = useState<"iletisim" | "otp">("iletisim");
  const [otpKod, setOtpKod] = useState("");
  const [loading, setLoading] = useState(false);
  const [hata, setHata] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [kodGonderildi, setKodGonderildi] = useState(false);
  const [yenidenSn, setYenidenSn] = useState(0);
  const [gelistirmeKodu, setGelistirmeKodu] = useState<string | null>(null);
  const [maske, setMaske] = useState("");
  const yasalOnayRef = useRef<HTMLDivElement>(null);
  const gonderildiRef = useRef(false);

  useEffect(() => {
    musteriFunnelOlayBirKez(funnelId, "form_adim_bilgi", {
      props: { kaynak: "form" },
    });
  }, [funnelId]);

  useEffect(() => {
    if (yenidenSn <= 0) return;
    const t = setTimeout(() => setYenidenSn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [yenidenSn]);

  /** Telefon değişince OTP adımını sıfırla */
  useEffect(() => {
    if (adim === "otp" && gonderildiRef.current) {
      setAdim("iletisim");
      setKodGonderildi(false);
      setOtpKod("");
      setMesaj("");
      setGelistirmeKodu(null);
      gonderildiRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- yalnızca telefon değişiminde
  }, [telefon]);

  function iletisimDogrula(): boolean {
    const telHata = telefonDogrulamaHatasi(telefon);
    if (telHata) {
      setHata(telHata);
      return false;
    }
    if (!ad.trim()) {
      setHata("İsminizi girin.");
      return false;
    }
    if (!yasalOnay) {
      setHata("Devam etmek için yasal metinleri onaylayın.");
      yasalOnayRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return false;
    }
    return true;
  }

  async function kodGonder() {
    if (!iletisimDogrula()) return;
    setLoading(true);
    setHata("");
    setMesaj("");
    try {
      const r = await fetch("/api/musteri/otp/gonder", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefon }),
      });
      const j = await r.json().catch(() => ({}));
      if (j.zatenDogrulandi) {
        dogrulanmisUserDataSakla(
          typeof j.telefon === "string" ? j.telefon : telefon,
          ad
        );
        void musteriFunnelOlayGonder(funnelId, "otp_dogrulandi", {
          telefon: typeof j.telefon === "string" ? j.telefon : telefon,
          birKez: true,
          props: { kaynak: "form", zaten: true },
        });
        await onHazir();
        return;
      }
      if (!r.ok && !j.kodBekliyor) {
        throw new Error(
          typeof j.error === "string" ? j.error : "Kod gönderilemedi."
        );
      }
      if (typeof j.telefonMaskeli === "string") setMaske(j.telefonMaskeli);
      setAdim("otp");
      setKodGonderildi(true);
      gonderildiRef.current = true;
      setMesaj(
        typeof j.mesaj === "string" ? j.mesaj : "Doğrulama kodu gönderildi."
      );
      if (typeof j.yenidenGonderSn === "number") {
        setYenidenSn(j.yenidenGonderSn);
      }
      if (typeof j.gelistirmeKodu === "string") {
        setGelistirmeKodu(j.gelistirmeKodu);
      }
      if (j.smsGonderildi || j.gelistirmeKodu || j.kodBekliyor) {
        void musteriFunnelOlayGonder(funnelId, "otp_gonder", {
          telefon,
          props: { kaynak: "form" },
        });
      }
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Kod gönderilemedi.");
    } finally {
      setLoading(false);
    }
  }

  async function kodDogrula() {
    if (otpKod.length !== 6) {
      setHata("6 haneli kodu girin.");
      return;
    }
    setLoading(true);
    setHata("");
    try {
      const r = await fetch("/api/musteri/otp/dogrula", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefon, kod: otpKod }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        void musteriFunnelOlayGonder(funnelId, "otp_hata", {
          telefon,
          props: { kaynak: "form" },
          analitik: false,
        });
        throw new Error(
          typeof j.error === "string" ? j.error : "Doğrulama başarısız."
        );
      }
      const tel =
        typeof j.telefon === "string" ? j.telefon : telefon.trim();
      dogrulanmisUserDataSakla(tel, ad);
      void musteriFunnelOlayGonder(funnelId, "otp_dogrulandi", {
        telefon: tel,
        birKez: true,
        props: { kaynak: "form" },
      });
      await onHazir();
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Doğrulama başarısız.");
    } finally {
      setLoading(false);
    }
  }

  const mesgul = loading || submitting;

  return (
    <div className="space-y-4 animate-fade-in pb-40">
      <h2 className="text-[1.75rem] sm:text-3xl font-bold leading-[1.1] tracking-tight text-[var(--acb-dark)]">İletişim bilgileriniz</h2>
      {sorunLabel ? (
        <p className="text-sm text-slate-600">
          Seçilen sorun:{" "}
          <span className="font-medium text-slate-900">{sorunLabel}</span>
        </p>
      ) : null}
      <p className="text-sm text-slate-600">
        Telefonunuzu SMS ile doğrulayın. Talebiniz alındığında sizi arayabilmemiz
        için gerekli.
      </p>

      {adim === "iletisim" ? (
        <>
          <Field
            label="Telefon"
            type="tel"
            placeholder="05XX XXX XX XX"
            value={telefon}
            onChange={(e) => {
              onTelefonChange(e.target.value);
              setHata("");
            }}
            autoComplete="tel"
            inputMode="tel"
            name="telefon"
            required
            invalid={!!telefonHata || (!!hata && hata.includes("telefon"))}
          />
          {telefonHata ? (
            <p className="text-sm text-red-600 -mt-2" role="alert">
              {telefonHata}
            </p>
          ) : null}
          <Field
            label="İsminiz"
            placeholder="Örn. Ahmet"
            value={ad}
            onChange={(e) => {
              onAdChange(e.target.value);
              setHata("");
            }}
            autoComplete="given-name"
            name="ad"
            required
          />
          <div ref={yasalOnayRef} className="scroll-mt-28 space-y-2">
            <YasalOnayKutusu
              checked={yasalOnay}
              onChange={(checked) => {
                onYasalOnayChange(checked);
                setHata("");
              }}
              invalid={!!yasalHata}
            />
            {yasalHata ? (
              <p className="text-sm text-red-600" role="alert">
                {yasalHata}
              </p>
            ) : null}
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-slate-600">
            {maske || "Telefonunuza"} gelen 6 haneli kodu girin.
          </p>
          {mesaj ? <p className="text-sm text-emerald-700">{mesaj}</p> : null}
          {gelistirmeKodu ? (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Geliştirme kodu:{" "}
              <span className="font-mono font-bold">{gelistirmeKodu}</span>
            </p>
          ) : null}
          <Field
            label="Doğrulama kodu"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            value={otpKod}
            onChange={(e) =>
              setOtpKod(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            autoComplete="one-time-code"
          />
          <button
            type="button"
            className="text-sm text-amber-700 font-medium disabled:text-slate-400"
            disabled={mesgul || yenidenSn > 0}
            onClick={() => void kodGonder()}
          >
            {yenidenSn > 0
              ? `Yeni kod (${yenidenSn}s)`
              : "Kodu tekrar gönder"}
          </button>
          <button
            type="button"
            className="block text-sm text-slate-500 hover:underline"
            disabled={mesgul}
            onClick={() => {
              setAdim("iletisim");
              setKodGonderildi(false);
              gonderildiRef.current = false;
              setHata("");
            }}
          >
            Numarayı değiştir
          </button>
        </>
      )}

      {hata ? (
        <p className="text-sm text-red-600" role="alert">
          {hata}
        </p>
      ) : null}

      {progress}
      <div className="flex gap-3 pt-1">
        <Btn
          type="button"
          variant="secondary"
          className="!w-auto flex-1"
          disabled={mesgul}
          onClick={onGeri}
        >
          Geri
        </Btn>
        {adim === "iletisim" ? (
          <Btn
            type="button"
            className="flex-[2]"
            disabled={mesgul}
            onClick={() => void kodGonder()}
          >
            {loading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Spinner className="size-4 border-white/40 border-t-white" />
                Gönderiliyor…
              </span>
            ) : (
              "Doğrulama kodu gönder"
            )}
          </Btn>
        ) : (
          <Btn
            type="button"
            className="flex-[2]"
            disabled={mesgul || (kodGonderildi && otpKod.length !== 6)}
            onClick={() => void kodDogrula()}
          >
            {submitting || loading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Spinner className="size-4 border-white/40 border-t-white" />
                {submitting ? "Gönderiliyor…" : "Doğrulanıyor…"}
              </span>
            ) : (
              submitEtiket ?? "Onayla ve teklif iste"
            )}
          </Btn>
        )}
      </div>
    </div>
  );
}
