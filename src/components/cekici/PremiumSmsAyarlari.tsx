"use client";

import { useEffect, useState } from "react";
import { Btn, Card, Field } from "@/components/ui";
import { cekiciFetch } from "@/lib/cekici-fetch";

type Durum = {
  premiumSmsAktif: boolean;
  bildirimKredi: number;
  panelKredi: number;
  premiumKredi: number;
  telefon: string;
  smsGercek: boolean;
};

export function PremiumSmsAyarlari() {
  const [durum, setDurum] = useState<Durum | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [otpAsama, setOtpAsama] = useState(false);
  const [otpKod, setOtpKod] = useState("");
  const [yenidenSn, setYenidenSn] = useState(0);
  const [gelistirmeKodu, setGelistirmeKodu] = useState<string | null>(null);
  const [islem, setIslem] = useState(false);
  const [mesaj, setMesaj] = useState("");
  const [hata, setHata] = useState("");

  async function yukle() {
    const res = await cekiciFetch("/api/cekici/premium-sms");
    if (!res.ok) return;
    setDurum(await res.json());
  }

  useEffect(() => {
    void yukle().finally(() => setYukleniyor(false));
  }, []);

  useEffect(() => {
    if (yenidenSn <= 0) return;
    const t = window.setInterval(() => {
      setYenidenSn((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(t);
  }, [yenidenSn]);

  async function otpGonder() {
    setIslem(true);
    setHata("");
    setMesaj("");
    try {
      const res = await cekiciFetch("/api/cekici/premium-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ islem: "otp_gonder" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Kod gönderilemedi.");
      setOtpAsama(true);
      setOtpKod("");
      setYenidenSn(data.yenidenGonderSn ?? 60);
      setGelistirmeKodu(data.gelistirmeKodu ?? null);
      setMesaj(data.mesaj ?? "Doğrulama kodu gönderildi.");
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Kod gönderilemedi.");
    } finally {
      setIslem(false);
    }
  }

  async function premiumAc() {
    setIslem(true);
    setHata("");
    setMesaj("");
    try {
      const res = await cekiciFetch("/api/cekici/premium-sms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ premiumSmsAktif: true, otpKod }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Aktifleştirilemedi.");
      setMesaj(data.mesaj);
      setOtpAsama(false);
      setOtpKod("");
      setGelistirmeKodu(null);
      await yukle();
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Aktifleştirilemedi.");
    } finally {
      setIslem(false);
    }
  }

  async function premiumKapat() {
    setIslem(true);
    setHata("");
    setMesaj("");
    try {
      const res = await cekiciFetch("/api/cekici/premium-sms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ premiumSmsAktif: false }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Kapatılamadı.");
      setMesaj(data.mesaj);
      setOtpAsama(false);
      await yukle();
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Kapatılamadı.");
    } finally {
      setIslem(false);
    }
  }

  if (yukleniyor || !durum) {
    return <p className="text-sm text-slate-500">Premium SMS yükleniyor…</p>;
  }

  return (
    <section>
      <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
        Premium SMS
      </h2>
      <Card
        className={
          durum.premiumSmsAktif
            ? "border-emerald-200 bg-emerald-50/50"
            : "border-slate-200"
        }
      >
        <p className="text-sm font-semibold text-slate-900 mb-1">
          {durum.premiumSmsAktif
            ? "Premium SMS açık"
            : "Standart SMS (toplu)"}
        </p>
        <p className="text-xs text-slate-600 leading-relaxed mb-3">
          {durum.premiumSmsAktif
            ? `Yeni talepler anlık OTP SMS ile gelir. Bildirim başına ${durum.premiumKredi} kredi. İsterseniz kapatıp standart toplu SMS’e (${durum.panelKredi} kredi) dönebilirsiniz.`
            : `Yeni talepler toplu SMS ile gelir (${durum.panelKredi} kredi). Anlık OTP SMS için Premium’i telefon doğrulamasıyla açın (${durum.premiumKredi} kredi).`}
        </p>

        {hata && (
          <p className="text-sm text-red-600 mb-2" role="alert">
            {hata}
          </p>
        )}
        {mesaj && (
          <p className="text-sm text-emerald-800 mb-2" role="status">
            {mesaj}
          </p>
        )}

        {durum.premiumSmsAktif ? (
          <Btn
            type="button"
            onClick={() => void premiumKapat()}
            disabled={islem}
            className="!bg-slate-700 hover:!bg-slate-800"
          >
            {islem ? "Kaydediliyor…" : "Premium SMS’i kapat"}
          </Btn>
        ) : !otpAsama ? (
          <Btn type="button" onClick={() => void otpGonder()} disabled={islem}>
            {islem ? "Kod gönderiliyor…" : "Premium SMS’i aktif et"}
          </Btn>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-600">
              {durum.telefon} numarasına gelen 6 haneli kodu girin.
            </p>
            {gelistirmeKodu && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Geliştirme kodu:{" "}
                <span className="font-mono font-bold">{gelistirmeKodu}</span>
              </p>
            )}
            <Field
              label="SMS doğrulama kodu"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otpKod}
              onChange={(e) =>
                setOtpKod(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="123456"
            />
            <Btn
              type="button"
              onClick={() => void premiumAc()}
              disabled={islem || otpKod.length !== 6}
            >
              {islem ? "Doğrulanıyor…" : "Kodu onayla ve aktif et"}
            </Btn>
            <button
              type="button"
              onClick={() => void otpGonder()}
              disabled={islem || yenidenSn > 0}
              className="w-full text-sm text-amber-700 font-medium disabled:text-slate-400"
            >
              {yenidenSn > 0
                ? `Kodu tekrar gönder (${yenidenSn}s)`
                : "Kodu tekrar gönder"}
            </button>
            <button
              type="button"
              onClick={() => {
                setOtpAsama(false);
                setOtpKod("");
                setHata("");
              }}
              className="w-full text-sm text-slate-500 underline"
            >
              Vazgeç
            </button>
          </div>
        )}
      </Card>
    </section>
  );
}
