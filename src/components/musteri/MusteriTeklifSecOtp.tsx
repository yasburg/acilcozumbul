"use client";

import { useEffect, useState } from "react";
import { Btn, Card, Field } from "@/components/ui";
import {
  musteriFunnelIdTalepOku,
  musteriFunnelOlayGonder,
} from "@/lib/musteri-funnel-client";
import { musteriFunnelMi } from "@/lib/musteri-funnel";
import { gtagUserDataAyarla } from "@/lib/gtag";
import { metaUserDataSakla } from "@/lib/meta-pixel";

type Props = {
  talepId: string;
  telefonMaskeli: string;
  onIptal: () => void;
  onDogrulandi: () => void;
};

function funnelIdCoz(talepId: string): string {
  const kayitli = musteriFunnelIdTalepOku(talepId);
  if (kayitli && musteriFunnelMi(kayitli)) return kayitli;
  return "a";
}

function dogrulanmisUserDataSakla(telefon?: string | null) {
  if (!telefon?.trim()) return;
  metaUserDataSakla({ phone: telefon });
  gtagUserDataAyarla({ phone: telefon });
}

export function MusteriTeklifSecOtp({
  talepId,
  telefonMaskeli,
  onIptal,
  onDogrulandi,
}: Props) {
  const [otpKod, setOtpKod] = useState("");
  const [loading, setLoading] = useState(false);
  const [hata, setHata] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [kodGonderildi, setKodGonderildi] = useState(false);
  const [yenidenSn, setYenidenSn] = useState(0);
  const [gelistirmeKodu, setGelistirmeKodu] = useState<string | null>(null);
  const [maske, setMaske] = useState(telefonMaskeli);

  useEffect(() => {
    if (yenidenSn <= 0) return;
    const t = setTimeout(() => setYenidenSn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [yenidenSn]);

  async function kodGonder() {
    setLoading(true);
    setHata("");
    setMesaj("");
    try {
      const r = await fetch("/api/musteri/otp/gonder", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ talepId }),
      });
      const j = await r.json().catch(() => ({}));
      if (j.zatenDogrulandi) {
        dogrulanmisUserDataSakla(
          typeof j.telefon === "string" ? j.telefon : null
        );
        void musteriFunnelOlayGonder(funnelIdCoz(talepId), "otp_dogrulandi", {
          talepId,
          birKez: true,
          props: { kaynak: "teklif_sec", zaten: true },
        });
        onDogrulandi();
        return;
      }
      if (!r.ok && !j.kodBekliyor) {
        throw new Error(j.error ?? "Kod gönderilemedi.");
      }
      if (j.telefonMaskeli) setMaske(String(j.telefonMaskeli));
      setKodGonderildi(true);
      setMesaj(
        typeof j.mesaj === "string"
          ? j.mesaj
          : "Doğrulama kodu gönderildi."
      );
      if (typeof j.yenidenGonderSn === "number") {
        setYenidenSn(j.yenidenGonderSn);
      }
      if (typeof j.gelistirmeKodu === "string") {
        setGelistirmeKodu(j.gelistirmeKodu);
      }
      if (j.smsGonderildi || j.gelistirmeKodu || j.kodBekliyor) {
        void musteriFunnelOlayGonder(funnelIdCoz(talepId), "otp_gonder", {
          talepId,
          props: { kaynak: "teklif_sec" },
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
        body: JSON.stringify({ talepId, kod: otpKod }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        void musteriFunnelOlayGonder(funnelIdCoz(talepId), "otp_hata", {
          talepId,
          props: { kaynak: "teklif_sec" },
          analitik: false,
        });
        throw new Error(j.error ?? "Doğrulama başarısız.");
      }
      dogrulanmisUserDataSakla(
        typeof j.telefon === "string" ? j.telefon : null
      );
      void musteriFunnelOlayGonder(funnelIdCoz(talepId), "otp_dogrulandi", {
        talepId,
        birKez: true,
        props: { kaynak: "teklif_sec" },
      });
      onDogrulandi();
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Doğrulama başarısız.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-md space-y-4 !p-5">
        <h2 className="text-lg font-semibold text-slate-900">
          Telefon doğrulama
        </h2>
        <p className="text-sm text-slate-600">
          Teklif seçmek için {maske || "telefonunuza"} gelen SMS kodunu
          onaylayın. Onaydan sonra çekici bilgilendirilir.
        </p>

        {!kodGonderildi ? (
          <Btn
            type="button"
            disabled={loading}
            onClick={() => void kodGonder()}
          >
            {loading ? "Gönderiliyor…" : "Doğrulama kodu gönder"}
          </Btn>
        ) : (
          <>
            {mesaj && <p className="text-sm text-emerald-700">{mesaj}</p>}
            {gelistirmeKodu && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Geliştirme kodu:{" "}
                <span className="font-mono font-bold">{gelistirmeKodu}</span>
              </p>
            )}
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
            <Btn
              type="button"
              disabled={loading || otpKod.length !== 6}
              onClick={() => void kodDogrula()}
            >
              {loading ? "Doğrulanıyor…" : "Onayla ve teklifi seç"}
            </Btn>
            <button
              type="button"
              className="w-full text-sm text-amber-700 font-medium disabled:text-slate-400"
              disabled={loading || yenidenSn > 0}
              onClick={() => void kodGonder()}
            >
              {yenidenSn > 0
                ? `Yeni kod (${yenidenSn}s)`
                : "Kodu tekrar gönder"}
            </button>
          </>
        )}

        {hata && (
          <p className="text-sm text-red-600" role="alert">
            {hata}
          </p>
        )}

        <button
          type="button"
          className="w-full text-sm text-slate-500 hover:underline"
          disabled={loading}
          onClick={onIptal}
        >
          Vazgeç
        </button>
      </Card>
    </div>
  );
}
