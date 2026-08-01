"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { Btn, Card, Field } from "@/components/ui";
import {
  ABONELIK_PAKETLERI,
  KREDI_SATIN_AL_PAKETLERI,
  type KrediPaketKaynak,
  type KrediPaketTl,
  krediPaketListesi,
  krediPaketOdenecekTL,
} from "@/lib/kredi-fiyat";
import { formatKredi } from "@/lib/talep-utils";
import { cekiciFetch } from "@/lib/cekici-fetch";
import { posthogOlayYakala } from "@/lib/posthog-client";
import { gtagAdsKrediSepeteEklemeDonusumu } from "@/lib/gtag";

type AbonelikOzet = {
  id: string;
  paketTl: number;
  status: string;
  renewsAt?: string;
  retryCount: number;
};

export default function KrediPage() {
  const router = useRouter();
  const [kredi, setKredi] = useState(0);
  const [kaynak, setKaynak] = useState<KrediPaketKaynak>("abonelik");
  const [seciliPaket, setSeciliPaket] = useState<KrediPaketTl>(999);
  const [loading, setLoading] = useState(false);
  const [iptalYukleniyor, setIptalYukleniyor] = useState(false);
  const [error, setError] = useState("");
  const [abonelik, setAbonelik] = useState<AbonelikOzet | null>(null);

  const [eposta, setEposta] = useState("");
  const [kod, setKod] = useState("");
  const [epostaDogrulandi, setEpostaDogrulandi] = useState(false);
  const [otpBekliyor, setOtpBekliyor] = useState(false);
  const [yenidenSn, setYenidenSn] = useState(0);
  const [gelistirmeKodu, setGelistirmeKodu] = useState<string>();
  const [otpYukleniyor, setOtpYukleniyor] = useState(false);

  const paketler = krediPaketListesi(kaynak);
  const paket = paketler.find((p) => p.tutarTL === seciliPaket) ?? paketler[1]!;
  const odenecek = krediPaketOdenecekTL(paket);
  const aktifAbonelikVar =
    abonelik?.status === "active" || abonelik?.status === "past_due";

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

  const abonelikYukle = useCallback(async () => {
    const res = await cekiciFetch("/api/cekici/abonelik");
    if (!res.ok) return;
    const d = await res.json();
    setAbonelik(d.abonelik ?? null);
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
    void abonelikYukle();
  }, [router, epostaDurumYukle, abonelikYukle]);

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
      posthogOlayYakala("cekici_eposta_otp_gonder", {
        rol: "cekici",
        kaynak: "kredi",
      });
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
      posthogOlayYakala("cekici_eposta_dogrulandi", {
        rol: "cekici",
        kaynak: "kredi",
      });
    } catch (e) {
      const hata = e instanceof Error ? e.message : "Doğrulama başarısız.";
      posthogOlayYakala("cekici_eposta_dogrulama_basarisiz", {
        rol: "cekici",
        kaynak: "kredi",
        hata,
      });
      setError(hata);
    } finally {
      setOtpYukleniyor(false);
    }
  }

  async function odemeyeGit() {
    if (!epostaDogrulandi) {
      setError("Ödeme için önce e-posta adresinizi doğrulayın.");
      return;
    }
    if (kaynak === "abonelik" && aktifAbonelikVar) {
      setError("Zaten aktif bir aboneliğiniz var.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await cekiciFetch("/api/cekici/odeme/baslat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paketTl: paket.tutarTL, eposta, kaynak }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      posthogOlayYakala("cekici_odeme_baslat", {
        rol: "cekici",
        odeme_tipi: kaynak,
        paket_tl: paket.tutarTL,
        odeme_id: data.odemeId,
      });
      gtagAdsKrediSepeteEklemeDonusumu({
        value: Number(data.tutar) || odenecek,
        user: { email: eposta },
      });
      sessionStorage.setItem(
        `odeme-${data.odemeId}`,
        JSON.stringify({
          miktar: data.miktar,
          tutar: data.tutar,
          listeFiyati: data.listeFiyati ?? paket.tutarTL,
          garantiAktif: data.garantiAktif,
          odemeTipi: data.odemeTipi,
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

  async function abonelikIptal() {
    if (!confirm("Aboneliği iptal etmek istediğinize emin misiniz? Kalan krediniz silinmez; otomatik yenileme durur.")) {
      return;
    }
    setIptalYukleniyor(true);
    setError("");
    try {
      const res = await cekiciFetch("/api/cekici/abonelik/iptal", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAbonelik(null);
      posthogOlayYakala("cekici_abonelik_iptal", { rol: "cekici" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "İptal başarısız.");
    } finally {
      setIptalYukleniyor(false);
    }
  }

  function kaynakDegistir(k: KrediPaketKaynak) {
    setKaynak(k);
    const liste = k === "abonelik" ? ABONELIK_PAKETLERI : KREDI_SATIN_AL_PAKETLERI;
    if (!liste.some((p) => p.tutarTL === seciliPaket)) {
      setSeciliPaket(999);
    }
  }

  return (
    <MobileShell backHref="/cekici/panel?tab=hesabim" subtitle="Kredi / Abonelik">
      <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 mb-6 flex justify-between items-center">
        <span className="text-sm text-slate-600">Mevcut kredi</span>
        <span className="text-2xl font-bold text-amber-600">{formatKredi(kredi)}</span>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </Card>
      )}

      {abonelik && aktifAbonelikVar && (
        <Card className="border-emerald-200 bg-emerald-50/80 mb-4 space-y-2">
          <p className="text-sm font-semibold text-emerald-900">
            Abonelik {abonelik.status === "past_due" ? "(ödeme gecikti)" : "aktif"}
          </p>
          <p className="text-sm text-emerald-800">
            Paket: {abonelik.paketTl} TL
            {abonelik.renewsAt
              ? ` · Sonraki yenileme: ${new Date(abonelik.renewsAt).toLocaleDateString("tr-TR")}`
              : ""}
          </p>
          {abonelik.status === "past_due" && (
            <p className="text-xs text-amber-800">
              Ödeme alınamadı. Kartınızı kontrol edin veya yeniden abone olun.
            </p>
          )}
          <Btn
            type="button"
            variant="secondary"
            onClick={() => void abonelikIptal()}
            disabled={iptalYukleniyor}
          >
            {iptalYukleniyor ? "İptal ediliyor…" : "Aboneliği iptal et"}
          </Btn>
        </Card>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100">
          {(
            [
              ["abonelik", "Abonelik"],
              ["kredi", "Kredi satın al"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => kaynakDegistir(k)}
              className={`rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                kaynak === k
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

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
          {kaynak === "abonelik"
            ? "Minimum 499 TL · Her ay otomatik yenilenir (Garanti)"
            : "Minimum 499 TL · Tek seferlik yükleme · Teklif vermek ücretsiz"}
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {paketler.map((p) => {
            const secili = p.tutarTL === paket.tutarTL;
            const fiyat = krediPaketOdenecekTL(p);
            const onerilen = p.tutarTL === 999;
            const enAvantajli = p.tutarTL === 1999;
            return (
              <button
                key={`${kaynak}-${p.tutarTL}`}
                type="button"
                onClick={() => setSeciliPaket(p.tutarTL)}
                className={`rounded-xl border-2 p-4 text-left transition-colors relative ${
                  secili
                    ? "border-amber-500 bg-amber-50"
                    : "border-slate-200 bg-white hover:border-amber-300"
                }`}
              >
                {(onerilen || enAvantajli) && (
                  <span className="absolute top-2 right-2 text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                    {onerilen ? "Önerilen" : "En avantajlı"}
                  </span>
                )}
                <p className="text-lg font-bold text-slate-900">
                  {formatKredi(p.kredi)} kredi
                </p>
                <p className="text-sm text-slate-600 mt-1">{p.tutarTL} TL paket</p>
                {p.bonusKredi > 0 && (
                  <p className="text-sm font-semibold text-emerald-700 mt-2">
                    +{p.bonusKredi} bonus kredi
                  </p>
                )}
                <p className="text-sm font-semibold text-amber-700 mt-2">
                  {fiyat} ₺
                  {kaynak === "abonelik" ? " / ay" : ""}
                </p>
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

        <Btn
          onClick={odemeyeGit}
          disabled={
            loading ||
            !epostaDogrulandi ||
            (kaynak === "abonelik" && aktifAbonelikVar)
          }
        >
          {loading
            ? "Yönlendiriliyor…"
            : kaynak === "abonelik"
              ? `💳 ${odenecek} ₺ — Abone ol`
              : `💳 ${odenecek} ₺ — Ödemeye Git`}
        </Btn>
      </div>
    </MobileShell>
  );
}
