"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SpinnerWheel } from "react-spin-prize";
import {
  CARK_DILIMLER,
  CARK_DILIM_SAYISI,
  CARK_SEGMENT_RENKLER,
  type CarkOdulSms,
} from "@/lib/kayit-cark";
import {
  carkAutoOpenedIsaretle,
  carkAutoOpenedMi,
  carkCompletedMi,
  carkDismissedIsaretle,
  carkDismissedMi,
  carkOdulOku,
  carkOdulSakla,
} from "@/lib/kayit-cark-client";
import {
  kayitFunnelOlayBirKez,
  kayitFunnelOlayGonder,
} from "@/lib/kayit-funnel-client";

type ModalAsama = "spin" | "tekrar" | "odul";

type Props = {
  funnelId: string;
  aktif: boolean;
};

type SpinSonuc =
  | { tip: "tekrar"; dilimIndex: number }
  | {
      tip: "odul";
      dilimIndex: number;
      rewardSms: CarkOdulSms;
      token: string;
    };

function dilimEtiketKisa(etiket: string): string {
  return etiket.replace("\n", " ");
}

export function KayitCarkKampanya({ funnelId, aktif }: Props) {
  const [mounted, setMounted] = useState(false);
  const [ikonHazir, setIkonHazir] = useState(false);
  const [ikonGitti, setIkonGitti] = useState(false);
  const [modalAcik, setModalAcik] = useState(false);
  const [asama, setAsama] = useState<ModalAsama>("spin");
  const [donuyor, setDonuyor] = useState(false);
  const [rewardSms, setRewardSms] = useState<CarkOdulSms | null>(null);
  const [hata, setHata] = useState("");
  const [winningIndex, setWinningIndex] = useState(0);
  const [autoSpinTrigger, setAutoSpinTrigger] = useState(0);
  const [wheelSize, setWheelSize] = useState(280);
  const pendingSonuc = useRef<SpinSonuc | null>(null);
  const spinBeklemeRef = useRef<number | null>(null);
  const reducedMotion = useRef(false);

  const wheelItems = useMemo(
    () =>
      CARK_DILIMLER.map((d, i) => ({
        id: i,
        label: dilimEtiketKisa(d.etiket),
        color:
          d.tip === 200
            ? "#22c55e"
            : d.tip === "tekrar"
              ? "#fef3c7"
              : CARK_SEGMENT_RENKLER[i] ?? "#fdba74",
        textColor: d.tip === 200 ? "#ffffff" : "#1e293b",
      })),
    []
  );

  useEffect(() => {
    return () => {
      if (spinBeklemeRef.current != null) {
        window.clearTimeout(spinBeklemeRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    reducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const olc = () =>
      setWheelSize(Math.min(260, Math.max(220, window.innerWidth - 96)));
    olc();
    window.addEventListener("resize", olc);
    return () => window.removeEventListener("resize", olc);
  }, []);

  useEffect(() => {
    if (!aktif) {
      setIkonHazir(false);
      return;
    }
    setIkonGitti(false);
    setIkonHazir(true);
    kayitFunnelOlayBirKez(funnelId, "wheel_icon_viewed");
  }, [aktif, funnelId]);

  const modalAc = useCallback(
    (opening: "icon_click" | "automatic") => {
      const mevcut = carkOdulOku();
      if (mevcut && carkCompletedMi()) {
        setRewardSms(mevcut.rewardSms);
        setAsama("odul");
      } else {
        setAsama("spin");
        setRewardSms(null);
      }
      setHata("");
      setModalAcik(true);
      if (opening === "icon_click") {
        void kayitFunnelOlayGonder(funnelId, "wheel_icon_clicked");
      } else {
        carkAutoOpenedIsaretle();
        void kayitFunnelOlayGonder(funnelId, "wheel_auto_opened");
      }
    },
    [funnelId]
  );

  useEffect(() => {
    if (!aktif || !ikonHazir || ikonGitti) return;
    if (carkAutoOpenedMi() || carkDismissedMi() || carkCompletedMi()) return;
    const t = window.setTimeout(() => {
      if (carkAutoOpenedMi() || carkDismissedMi() || carkCompletedMi()) return;
      modalAc("automatic");
    }, 6000);
    return () => clearTimeout(t);
  }, [aktif, ikonHazir, ikonGitti, modalAc]);

  function modalKapat() {
    if (donuyor) return;
    setModalAcik(false);
    carkDismissedIsaretle();
    void kayitFunnelOlayGonder(funnelId, "wheel_modal_closed");
  }

  async function cevirBaslat() {
    if (donuyor || carkCompletedMi()) return;
    setDonuyor(true);
    setHata("");
    void kayitFunnelOlayGonder(funnelId, "wheel_spin_started");

    try {
      const res = await fetch("/api/cekici/kayit/cark/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof d.error === "string" ? d.error : "Çark çevrilemedi."
        );
      }

      const dilimIndex = Number(d.dilimIndex);
      if (
        !Number.isFinite(dilimIndex) ||
        dilimIndex < 0 ||
        dilimIndex >= CARK_DILIM_SAYISI
      ) {
        throw new Error("Geçersiz çark sonucu.");
      }

      if (d.tip === "tekrar") {
        pendingSonuc.current = { tip: "tekrar", dilimIndex };
      } else {
        pendingSonuc.current = {
          tip: "odul",
          dilimIndex,
          rewardSms: Number(d.rewardSms) as CarkOdulSms,
          token: String(d.token ?? ""),
        };
      }

      setWinningIndex(dilimIndex);
      setAutoSpinTrigger((n) => n + 1);
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Çark çevrilemedi.");
      setDonuyor(false);
    }
  }

  function spinBitti() {
    const sonuc = pendingSonuc.current;
    pendingSonuc.current = null;
    if (!sonuc) {
      setDonuyor(false);
      return;
    }

    if (spinBeklemeRef.current != null) {
      window.clearTimeout(spinBeklemeRef.current);
    }
    // Sonuç ekranına geçmeden önce çarkın durduğu dilimi göstersin
    spinBeklemeRef.current = window.setTimeout(() => {
      spinBeklemeRef.current = null;
      setDonuyor(false);

      if (sonuc.tip === "tekrar") {
        void kayitFunnelOlayGonder(funnelId, "wheel_spin_retry_result");
        setAsama("tekrar");
        return;
      }

      setRewardSms(sonuc.rewardSms);
      if (sonuc.token) {
        carkOdulSakla({ rewardSms: sonuc.rewardSms, token: sonuc.token });
      }
      void kayitFunnelOlayGonder(funnelId, "wheel_spin_reward_result", {
        meta: { reward_sms: sonuc.rewardSms },
      });
      void kayitFunnelOlayGonder(funnelId, `wheel_reward_${sonuc.rewardSms}`);
      setAsama("odul");
      setIkonGitti(true);
    }, 2000);
  }

  function odulClaim() {
    void kayitFunnelOlayGonder(funnelId, "wheel_reward_claim_clicked", {
      meta: rewardSms ? { reward_sms: rewardSms } : undefined,
    });
    setModalAcik(false);
    carkDismissedIsaretle();
    setIkonGitti(true);
  }

  if (!aktif || !mounted) return null;

  const ikonGorunur = ikonHazir && !ikonGitti;

  const ui = (
    <>
      <div
        className="fixed z-[80] right-3 transition-[transform,opacity] duration-500 ease-out"
        style={{
          top: "70vh",
          transform: ikonGorunur
            ? "translateY(-50%) translateX(0)"
            : "translateY(-50%) translateX(140%)",
          opacity: ikonGorunur ? 1 : 0,
          pointerEvents: ikonGorunur ? "auto" : "none",
        }}
        aria-hidden={!ikonGorunur}
      >
        <div
          className={ikonGorunur && !modalAcik ? "animate-cark-ikon-titre" : ""}
        >
          <button
            type="button"
            onClick={() => modalAc("icon_click")}
            className="flex flex-col items-center gap-1 touch-manipulation active:scale-95"
            aria-label="SMS kazan — ücretsiz SMS çarkı"
          >
            <span className="relative flex size-[3.2rem] md:size-[3.6rem] items-center justify-center">
              <span
                className={`pointer-events-none absolute inset-[-6px] rounded-full bg-amber-400/45 blur-md ${
                  ikonGorunur && !modalAcik ? "animate-cark-ikon-glow" : "opacity-40"
                }`}
                aria-hidden
              />
              {/* Flaticon: Design Circle — lucky / fortune wheel */}
              <img
                src="/icons/fortune-wheel.png"
                alt=""
                width={58}
                height={58}
                draggable={false}
                className="relative size-[3.2rem] md:size-[3.6rem] object-contain drop-shadow-md select-none"
              />
            </span>
            <span className="rounded-md bg-slate-900/90 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white shadow-sm whitespace-nowrap">
              SMS kazan 🎁
            </span>
          </button>
        </div>
      </div>

      {modalAcik && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cark-baslik"
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            aria-label="Kapat"
            disabled={donuyor}
            onClick={modalKapat}
          />
          <div className="relative w-full max-w-[340px] max-h-[min(88vh,640px)] overflow-y-auto rounded-2xl bg-white shadow-[0_20px_50px_rgba(15,23,42,0.25)] border border-slate-100 p-4 pt-5 animate-popup-in">
            <button
              type="button"
              disabled={donuyor}
              onClick={modalKapat}
              className="absolute right-2.5 top-2.5 size-8 rounded-full bg-slate-100 text-slate-600 font-bold text-base leading-none disabled:opacity-40"
              aria-label="Kapat"
            >
              ×
            </button>

            {asama === "spin" && (
              <div className="space-y-2.5">
                <h2
                  id="cark-baslik"
                  className="text-lg font-bold text-slate-900 pr-8 text-center"
                >
                  Ücretsiz SMS Kazan
                </h2>
                <p className="text-xs text-slate-600 leading-snug text-center px-1">
                  Çarkı çevir, 10–200 ücretsiz talep bildirimi kazan.
                </p>

                <div className="flex justify-center py-1">
                  <SpinnerWheel
                    items={wheelItems}
                    winningIndex={winningIndex}
                    autoSpinTrigger={autoSpinTrigger}
                    onSpinComplete={spinBitti}
                    onButtonClick={() => {
                      void cevirBaslat();
                    }}
                    disabled={donuyor}
                    duration={reducedMotion.current ? 600 : 3200}
                    size={wheelSize}
                    fontSize={22}
                    borderWidth={8}
                    borderColor="#f59e0b"
                    buttonText="ÇEVİR"
                    buttonColor="#f59e0b"
                    buttonTextColor="#ffffff"
                    buttonBorderColor="#ffffff"
                    buttonBorderWidth={3}
                    buttonSize={Math.round(wheelSize * 0.135)}
                    buttonFontSize={11}
                    textLayout="horizontal"
                  />
                </div>
                <p className="text-[11px] text-slate-500 text-center leading-snug">
                  Kazandığınız SMS’ler yeni müşteri talebi bildirimlerinde
                  kullanılır.
                </p>
                {hata && (
                  <p className="text-sm text-red-600 text-center">{hata}</p>
                )}
              </div>
            )}

            {asama === "tekrar" && (
              <div className="space-y-3 pt-4 text-center">
                <h2 className="text-lg font-bold text-slate-900">
                  Bir çevirme hakkı daha! 🎉
                </h2>
                <p className="text-sm text-slate-600">
                  Ücretsiz SMS hediyenizi kazanmak için tekrar çevirin.
                </p>
                <button
                  type="button"
                  disabled={donuyor}
                  onClick={() => {
                    setAsama("spin");
                    window.setTimeout(() => void cevirBaslat(), 80);
                  }}
                  className="w-full min-h-[48px] rounded-xl bg-amber-500 text-white font-bold text-base"
                >
                  TEKRAR ÇEVİR
                </button>
              </div>
            )}

            {asama === "odul" && rewardSms != null && (
              <div className="space-y-3 pt-4 text-center">
                <h2 className="text-lg font-bold text-slate-900">
                  Tebrikler, {rewardSms} SMS! 🎉
                </h2>
                <p className="text-sm text-slate-600 leading-snug">
                  Bölgenizde yeni talep açılınca ücretsiz SMS alabilirsiniz.
                </p>
                <button
                  type="button"
                  onClick={odulClaim}
                  className="w-full min-h-[48px] rounded-xl bg-amber-500 text-white font-bold text-base"
                >
                  {rewardSms} SMS’imi hesabıma ekle
                </button>
                <p className="text-[11px] text-slate-500">
                  Telefon doğrulanınca hediye hesabınıza tanımlanır.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );

  return createPortal(ui, document.body);
}
