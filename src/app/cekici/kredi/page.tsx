"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { Btn, Card, Field } from "@/components/ui";
import {
  KREDI_PAKETLERI,
  type KrediPaketTl,
  krediPaketOdenecekTL,
} from "@/lib/kredi-fiyat";
import { formatKredi } from "@/lib/talep-utils";
import { cekiciFetch } from "@/lib/cekici-fetch";
import { posthogOlayYakala } from "@/lib/posthog-client";

export default function KrediPage() {
  const router = useRouter();
  const [kredi, setKredi] = useState(0);
  const [seciliPaket, setSeciliPaket] = useState<KrediPaketTl>(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [eposta, setEposta] = useState("");
  const [kod, setKod] = useState("");
  const [epostaDogrulandi, setEpostaDogrulandi] = useState(false);
  const [otpBekliyor, setOtpBekliyor] = useState(false);
  const [yenidenSn, setYenidenSn] = useState(0);
  const [gelistirmeKodu, setGelistirmeKodu] = useState<string>();
  const [otpYukleniyor, setOtpYukleniyor] = useState(false);

  const paket = KREDI_PAKETLERI.find((p) => p.tutarTL === seciliPaket)!;
  const odenecek = krediPaketOdenecekTL(paket);
  const indirimli = paket.indirimYuzde > 0;

  const epostaDurumYukle = useCallback(async (mail: string) => {
    if (!mail.trim()) return;
    const res = await cekiciFetch(
      `/api/cekici/odeme/eposta/durum?eposta=${encodeURIComponent(mail)}`
    );
    if (!res.ok) return;
    const d = await res.json();
    setEpostaDogrulandi(Boolean(d.dogrulandi));
    setOtpBekliyor(Boolean(d.bekliyor));
    setYenidenSn(d.yenidenGonderSn ?? 0);
    setGelistirmeKodu(d.gelistirmeKodu);
    if (d.kayitliEposta && !mail) setEposta(d.kayitliEposta);
  }, []);

  useEffect(() => {
    cekiciFetch("/api/cekici/me")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setKredi(d.kredi);
        if (d.faturaEposta) {
          setEposta(d.faturaEposta);
          void epostaDurumYukle(d.faturaEposta);
        }
      })
      .catch(() => router.push("/cekici/giris"));
  }, [router, epostaDurumYukle]);

  useEffect(() => {
    if (yenidenSn <= 0 || epostaDogrulandi) return;
    const t = setInterval(() => setYenidenSn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [yenidenSn, epostaDogrulandi]);

  async function kodGonder() {
    setOtpYukleniyor(true);
    setError("");
    try {
      const res = await cekiciFetch("/api/cekici/odeme/eposta/gonder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eposta }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOtpBekliyor(true);
      setYenidenSn(data.yenidenGonderSn ?? 60);
      setGelistirmeKodu(data.gelistirmeKodu);
      if (data.demo) {
        setError("Demo: e-posta konsola yazıldı (RESEND_API_KEY yok).");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kod gönderilemedi.");
    } finally {
      setOtpYukleniyor(false);
    }
  }

  async function kodDogrula() {
    setOtpYukleniyor(true);
    setError("");
    try {
      const res = await cekiciFetch("/api/cekici/odeme/eposta/dogrula", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eposta, kod }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEpostaDogrulandi(true);
      setOtpBekliyor(false);
      setKod("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Doğrulama başarısız.");
    } finally {
      setOtpYukleniyor(false);
    }
  }

  async function odemeyeGit() {
    if (!epostaDogrulandi) {
      setError("Ödeme için önce e-posta adresinizi doğrulayın.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await cekiciFetch("/api/cekici/odeme/baslat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paketTl: seciliPaket, eposta }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      posthogOlayYakala("cekici_odeme_baslat", {
        rol: "cekici",
        paket_tl: seciliPaket,
        odeme_id: data.odemeId,
      });
      sessionStorage.setItem(
        `odeme-${data.odemeId}`,
        JSON.stringify({
          miktar: data.miktar,
          tutar: data.tutar,
          listeFiyati: data.listeFiyati ?? paket.tutarTL,
          garantiAktif: data.garantiAktif,
          eposta,
        })
      );
      router.push(`/cekici/odeme/${data.odemeId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "İşlem başarısız.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <MobileShell backHref="/cekici/panel?tab=hesabim" subtitle="Kredi satın al">
      <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 mb-6 flex justify-between items-center">
        <span className="text-sm text-slate-600">Mevcut kredi</span>
        <span className="text-2xl font-bold text-amber-600">{formatKredi(kredi)}</span>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </Card>
      )}

      <div className="space-y-4">
        <Card>
          <p className="text-sm font-medium text-slate-800 mb-3">
            Fatura e-postası (zorunlu)
          </p>
          <p className="text-xs text-slate-500 mb-3">
            Ödeme öncesi doğrulama gerekir. Fatura bu adrese iletilecektir.
          </p>
          <Field
            label="E-posta"
            type="email"
            placeholder="ornek@firma.com"
            value={eposta}
            onChange={(e) => {
              setEposta(e.target.value);
              setEpostaDogrulandi(false);
              setOtpBekliyor(false);
            }}
            disabled={epostaDogrulandi}
          />
          {epostaDogrulandi ? (
            <p className="text-sm text-emerald-700 font-medium mt-2">
              ✓ E-posta doğrulandı
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {!otpBekliyor ? (
                <Btn
                  type="button"
                  variant="secondary"
                  onClick={() => void kodGonder()}
                  disabled={otpYukleniyor || !eposta.trim()}
                >
                  {otpYukleniyor ? "Gönderiliyor…" : "Doğrulama kodu gönder"}
                </Btn>
              ) : (
                <>
                  <Field
                    label="6 haneli kod"
                    placeholder="123456"
                    value={kod}
                    onChange={(e) => setKod(e.target.value)}
                    inputMode="numeric"
                  />
                  {gelistirmeKodu && (
                    <p className="text-xs text-blue-700 bg-blue-50 rounded-lg px-3 py-2">
                      Geliştirme kodu: <strong>{gelistirmeKodu}</strong>
                    </p>
                  )}
                  <Btn
                    type="button"
                    onClick={() => void kodDogrula()}
                    disabled={otpYukleniyor || kod.length < 6}
                  >
                    {otpYukleniyor ? "Kontrol…" : "E-postayı doğrula"}
                  </Btn>
                  <button
                    type="button"
                    disabled={yenidenSn > 0 || otpYukleniyor}
                    onClick={() => void kodGonder()}
                    className="text-xs text-amber-700 underline w-full text-center disabled:opacity-50"
                  >
                    {yenidenSn > 0
                      ? `Yeni kod (${yenidenSn}s)`
                      : "Kodu tekrar gönder"}
                  </button>
                </>
              )}
            </div>
          )}
        </Card>

        <p className="text-sm font-medium text-slate-700">Paket seçin</p>
        <p className="text-xs text-slate-500 -mt-2">
          Minimum 100 TL · Teklif vermek ücretsiz
        </p>

        <div className="grid grid-cols-2 gap-3">
          {KREDI_PAKETLERI.map((p) => {
            const secili = p.tutarTL === seciliPaket;
            const fiyat = krediPaketOdenecekTL(p);
            return (
              <button
                key={p.tutarTL}
                type="button"
                onClick={() => setSeciliPaket(p.tutarTL)}
                className={`rounded-xl border-2 p-4 text-left transition-colors ${
                  secili
                    ? "border-amber-500 bg-amber-50"
                    : "border-slate-200 bg-white hover:border-amber-300"
                }`}
              >
                <p className="text-lg font-bold text-slate-900">
                  {formatKredi(p.kredi)} kredi
                </p>
                <p className="text-sm text-slate-600 mt-1">{p.tutarTL} TL paket</p>
                {p.indirimYuzde > 0 ? (
                  <p className="text-sm font-semibold text-emerald-700 mt-2">
                    {fiyat} ₺ öde
                    <span className="block text-xs font-normal text-slate-500 line-through">
                      {p.tutarTL} ₺
                    </span>
                  </p>
                ) : (
                  <p className="text-sm font-semibold text-amber-700 mt-2">
                    {fiyat} ₺
                  </p>
                )}
              </button>
            );
          })}
        </div>

        <Card className="bg-slate-50">
          <div className="flex justify-between text-sm mt-2">
            <span className="text-slate-700 font-medium">Ödenecek</span>
            <span className="font-bold text-amber-600 text-lg">{odenecek} ₺</span>
          </div>
        </Card>

        {!epostaDogrulandi && (
          <Card className="border-amber-300 bg-amber-50">
            <p className="text-sm text-amber-950 leading-relaxed">
              Ödeme yapmak için e-posta adresinizi doğrulamanız gerekiyor.
            </p>
          </Card>
        )}

        <Btn onClick={odemeyeGit} disabled={loading || !epostaDogrulandi}>
          {loading ? "Yönlendiriliyor…" : `💳 ${odenecek} ₺ — Ödemeye Git`}
        </Btn>
      </div>
    </MobileShell>
  );
}
