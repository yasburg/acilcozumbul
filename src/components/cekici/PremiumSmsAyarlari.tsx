"use client";

import { useEffect, useState } from "react";
import { Btn, Card, SifreAlani } from "@/components/ui";
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
  const [sifreAsama, setSifreAsama] = useState(false);
  const [hedefAcik, setHedefAcik] = useState(false);
  const [sifre, setSifre] = useState("");
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

  function sifreFormuAc(acikYap: boolean) {
    setHedefAcik(acikYap);
    setSifreAsama(true);
    setSifre("");
    setHata("");
    setMesaj("");
  }

  function sifreFormuKapat() {
    setSifreAsama(false);
    setSifre("");
    setHata("");
  }

  async function kaydet() {
    if (!sifre.trim()) {
      setHata("Hesap şifrenizi girin.");
      return;
    }
    setIslem(true);
    setHata("");
    setMesaj("");
    try {
      const res = await cekiciFetch("/api/cekici/premium-sms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ premiumSmsAktif: hedefAcik, sifre }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Kaydedilemedi.");
      setMesaj(data.mesaj);
      setSifreAsama(false);
      setSifre("");
      await yukle();
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Kaydedilemedi.");
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
            : `Yeni talepler toplu SMS ile gelir (${durum.panelKredi} kredi). Anlık OTP SMS için Premium’i hesap şifrenizle açın (${durum.premiumKredi} kredi).`}
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

        {!sifreAsama ? (
          durum.premiumSmsAktif ? (
            <Btn
              type="button"
              onClick={() => sifreFormuAc(false)}
              disabled={islem}
              className="!bg-slate-700 hover:!bg-slate-800"
            >
              Premium SMS’i kapat
            </Btn>
          ) : (
            <Btn type="button" onClick={() => sifreFormuAc(true)} disabled={islem}>
              Premium SMS’i aktif et
            </Btn>
          )
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-600">
              {hedefAcik
                ? "Premium SMS’i açmak için hesap şifrenizi girin."
                : "Premium SMS’i kapatmak için hesap şifrenizi girin."}
            </p>
            <SifreAlani
              label="Hesap şifresi"
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              autoComplete="current-password"
              placeholder="Şifreniz"
            />
            <Btn
              type="button"
              onClick={() => void kaydet()}
              disabled={islem || !sifre.trim()}
            >
              {islem
                ? "Kaydediliyor…"
                : hedefAcik
                  ? "Şifreyi onayla ve aç"
                  : "Şifreyi onayla ve kapat"}
            </Btn>
            <button
              type="button"
              onClick={sifreFormuKapat}
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
