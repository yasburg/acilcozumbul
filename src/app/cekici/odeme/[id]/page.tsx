"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { Btn, Field, Card } from "@/components/ui";
import { cekiciFetch } from "@/lib/cekici-fetch";
import { odemeOnaySessionKey, type OdemeOnayKayit } from "@/lib/odeme-onay";
import { posthogOlayYakala } from "@/lib/posthog-client";
import { gtagAdsKrediSatinAlmaDonusumu } from "@/lib/gtag";

const KREDI_ODEME_ADIMLARI = [
  "Kart doğrulanıyor",
  "Kart doğrulandı",
  "Bankayla iletişim kuruluyor",
  "Kart onaylandı",
  "Ödeme gerçekleşti",
  "Kredileriniz hesabınıza yüklendi",
] as const;

const ROZET_ODEME_ADIMLARI = [
  "Kart doğrulanıyor",
  "Kart doğrulandı",
  "Bankayla iletişim kuruluyor",
  "Kart onaylandı",
  "Ödeme gerçekleşti",
  "Onaylı çekici rozetiniz aktifleştirildi",
] as const;

const ABONELIK_ODEME_ADIMLARI = [
  "Kart doğrulanıyor",
  "Kart doğrulandı",
  "Bankayla iletişim kuruluyor",
  "Kart onaylandı",
  "Ödeme gerçekleşti",
  "Aboneliğiniz aktifleştirildi",
] as const;

function bekle(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function OdemeIslemAnimasyon({
  aktifAdim,
  adimlar,
}: {
  aktifAdim: number;
  adimlar: readonly string[];
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm px-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="w-14 h-14 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin mb-8" />
      <ul className="w-full max-w-sm space-y-3">
        {adimlar.map((adim, i) => {
          const tamam = i < aktifAdim;
          const suAn = i === aktifAdim;
          return (
            <li
              key={adim}
              className={`flex items-center gap-2 text-sm transition-colors duration-300 ${
                tamam
                  ? "text-emerald-700 font-medium"
                  : suAn
                    ? "text-amber-700 font-semibold"
                    : "text-slate-300"
              }`}
            >
              <span className="w-5 text-center shrink-0" aria-hidden>
                {tamam ? "✓" : suAn ? "●" : "○"}
              </span>
              <span>{adim}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function OdemePage() {
  const params = useParams();
  const router = useRouter();
  const odemeId = params.id as string;

  const [miktar, setMiktar] = useState(0);
  const [tutar, setTutar] = useState(0);
  const [listeFiyati, setListeFiyati] = useState(0);
  const [eposta, setEposta] = useState("");
  const [telefon, setTelefon] = useState("");
  const [adres, setAdres] = useState("");
  const [tcKimlik, setTcKimlik] = useState("");
  const [kurumsal, setKurumsal] = useState(false);
  const [sirketUnvan, setSirketUnvan] = useState("");
  const [vergiNo, setVergiNo] = useState("");
  const [kartNo, setKartNo] = useState("");
  const [sktAy, setSktAy] = useState("");
  const [sktYil, setSktYil] = useState("");
  const [cvv, setCvv] = useState("");
  const sktYilRef = useRef<HTMLInputElement>(null);
  const cvvRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [odemeAnimasyon, setOdemeAnimasyon] = useState(false);
  const [animasyonAdim, setAnimasyonAdim] = useState(0);
  const [error, setError] = useState("");
  const [garantiAktif, setGarantiAktif] = useState(false);
  const [smokeDolduruldu, setSmokeDolduruldu] = useState(false);
  const [odemeTipi, setOdemeTipi] = useState<"kredi" | "rozet" | "abonelik">(
    "kredi"
  );

  const odemeAdimlari =
    odemeTipi === "rozet"
      ? ROZET_ODEME_ADIMLARI
      : odemeTipi === "abonelik"
        ? ABONELIK_ODEME_ADIMLARI
        : KREDI_ODEME_ADIMLARI;

  useEffect(() => {
    let iptal = false;

    async function yukle() {
      const me = await cekiciFetch("/api/cekici/me");
      if (!me.ok) {
        router.push("/cekici/giris");
        return;
      }
      const meData = await me.json();
      if (!iptal) setTelefon(meData.telefon ?? "");

      const detay = await cekiciFetch(`/api/cekici/odeme/${odemeId}`);
      if (detay.ok && !iptal) {
        const d = await detay.json();
        setMiktar(d.miktar);
        setTutar(d.tutar);
        setListeFiyati(Number(d.listeFiyati) || d.tutar);
        setOdemeTipi(
          d.odemeTipi === "rozet" || d.odemeTipi === "abonelik"
            ? d.odemeTipi
            : "kredi"
        );
        setEposta(d.faturaEposta ?? meData.faturaEposta ?? "");
        setAdres(d.faturaAdres ?? "");
        setTcKimlik(d.faturaTcKimlik ?? "");
        setKurumsal(Boolean(d.kurumsal));
        setSirketUnvan(d.sirketUnvan ?? "");
        setVergiNo(d.vergiNo ?? "");
        setGarantiAktif(Boolean(d.garantiAktif));
      } else {
        const stored = sessionStorage.getItem(`odeme-${odemeId}`);
        if (stored && !iptal) {
          const s = JSON.parse(stored);
          setMiktar(s.miktar);
          setTutar(s.tutar);
          setListeFiyati(Number(s.listeFiyati) || s.tutar);
          setOdemeTipi(
            s.odemeTipi === "rozet" || s.odemeTipi === "abonelik"
              ? s.odemeTipi
              : "kredi"
          );
          setEposta(s.eposta ?? meData.faturaEposta ?? "");
          setGarantiAktif(Boolean(s.garantiAktif));
        } else if (!iptal) {
          setEposta(meData.faturaEposta ?? "");
        }
      }

      const ayar = await cekiciFetch("/api/cekici/odeme/ayar");
      if (!ayar.ok || iptal) return;
      const a = await ayar.json();
      if (!iptal) {
        setGarantiAktif(Boolean(a.garantiAktif));
        if (a.smokeKart) {
          setKartNo(a.smokeKart.kartNo);
          const [ay, yil] = String(a.smokeKart.sonKullanma).split("/");
          setSktAy((ay ?? "").replace(/\D/g, "").slice(0, 2));
          setSktYil((yil ?? "").replace(/\D/g, "").slice(-2));
          setCvv(a.smokeKart.cvv);
          setSmokeDolduruldu(true);
        }
      }
    }

    void yukle();
    return () => {
      iptal = true;
    };
  }, [odemeId, router]);

  function sktAyDegistir(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value.replace(/\D/g, "").slice(0, 2);
    setSktAy(v);
    if (v.length === 2) sktYilRef.current?.focus();
  }

  function sktYilDegistir(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value.replace(/\D/g, "").slice(0, 2);
    setSktYil(v);
    if (v.length === 2) cvvRef.current?.focus();
  }

  async function odemeAdimlariniOynat(iptalRef: { value: boolean }) {
    for (let i = 0; i < odemeAdimlari.length; i++) {
      if (iptalRef.value) return;
      setAnimasyonAdim(i);
      await bekle(1000);
    }
  }

  async function odemeYap(e: React.FormEvent) {
    e.preventDefault();
    const sonKullanma =
      sktAy && sktYil ? `${sktAy.padStart(2, "0")}/${sktYil}` : "";
    if (!kartNo || !sonKullanma || !cvv) {
      setError("Kart bilgilerini doldurun.");
      return;
    }

    setLoading(true);
    setError("");
    setOdemeAnimasyon(true);
    setAnimasyonAdim(0);

    const iptalRef = { value: false };

    const animasyonGorev = odemeAdimlariniOynat(iptalRef);

    try {
      const res = await cekiciFetch(`/api/cekici/odeme/${odemeId}/tamamla`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kartNo,
          sonKullanma,
          cvv,
          faturaEposta: eposta,
          faturaAdres: adres || undefined,
          faturaTcKimlik: tcKimlik || undefined,
          kurumsal,
          sirketUnvan: kurumsal ? sirketUnvan : undefined,
          vergiNo: kurumsal ? vergiNo : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const err = new Error(
          typeof data.error === "string" && data.error
            ? data.error
            : "Ödeme başarısız."
        ) as Error & { code?: string };
        if (typeof data.code === "string") err.code = data.code;
        throw err;
      }

      await animasyonGorev;

      const tip: "kredi" | "rozet" | "abonelik" =
        data.odemeTipi === "rozet" || odemeTipi === "rozet"
          ? "rozet"
          : data.odemeTipi === "abonelik" || odemeTipi === "abonelik"
            ? "abonelik"
            : "kredi";

      posthogOlayYakala("cekici_odeme_tamamla", {
        rol: "cekici",
        odeme_id: odemeId,
        odeme_tipi: tip,
        odeme_durumu: "basarili",
        eklenen_kredi: data.eklenenKredi,
      });

      if (tip === "kredi") {
        gtagAdsKrediSatinAlmaDonusumu({
          transactionId: odemeId,
          value: Number(tutar) || Number(data.tutar) || undefined,
          user: { email: eposta, phone: telefon },
        });
      }

      sessionStorage.removeItem(`odeme-${odemeId}`);

      const onay: OdemeOnayKayit = {
        odemeTipi: tip,
        eklenenKredi: data.eklenenKredi,
        toplamKredi: data.toplamKredi,
        tutar: tutar || undefined,
      };
      sessionStorage.setItem(odemeOnaySessionKey(odemeId), JSON.stringify(onay));
      router.replace(`/cekici/odeme/${odemeId}/onay`);
    } catch (err) {
      iptalRef.value = true;
      setOdemeAnimasyon(false);
      setAnimasyonAdim(0);
      const hata = err instanceof Error ? err.message : "Ödeme başarısız.";
      const bankaKodu =
        err instanceof Error && "code" in err && typeof err.code === "string"
          ? err.code
          : undefined;
      posthogOlayYakala("cekici_odeme_tamamla", {
        rol: "cekici",
        odeme_id: odemeId,
        odeme_tipi: odemeTipi,
        odeme_durumu: "basarisiz",
        hata,
        ...(bankaKodu ? { banka_kodu: bankaKodu } : {}),
      });
      setError(hata);
    } finally {
      setLoading(false);
    }
  }

  return (
    <MobileShell
      showBrand={false}
      backHref={
        odemeAnimasyon
          ? undefined
          : odemeTipi === "rozet"
            ? "/cekici/panel?tab=hesabim"
            : "/cekici/kredi"
      }
      backLabel="İptal"
      subtitle={
        garantiAktif
          ? "Güvenli Ödeme — Garanti Sanal POS"
          : "Güvenli Ödeme — Sanal POS (Demo)"
      }
    >
      {odemeAnimasyon && (
        <OdemeIslemAnimasyon aktifAdim={animasyonAdim} adimlar={odemeAdimlari} />
      )}

      <div className="rounded-t-2xl bg-gradient-to-r from-slate-800 to-slate-700 text-white p-4 mb-6 -mx-4 mt-2">
        <p className="text-xs opacity-80">acilcozumbul.com</p>
        <p className="font-semibold">Banka Sanal POS</p>
        <p className="text-2xl font-bold mt-2">{tutar || "—"} ₺</p>
        {listeFiyati > tutar && (
          <p className="text-xs opacity-75 line-through">{listeFiyati} ₺</p>
        )}
        {odemeTipi === "rozet" ? (
          <p className="text-sm opacity-90 mt-1">
            Onaylı çekici rozeti — teklifleriniz üst sıralarda
          </p>
        ) : odemeTipi === "abonelik" ? (
          miktar > 0 && (
            <p className="text-sm opacity-90">
              {miktar} kredi / aylık abonelik
            </p>
          )
        ) : (
          miktar > 0 && (
            <p className="text-sm opacity-90">{miktar} kredi satın alımı</p>
          )
        )}
      </div>

      {odemeTipi === "rozet" && (
        <Card className="border-emerald-200 bg-emerald-50 mb-4">
          <p className="text-sm text-emerald-900 leading-relaxed">
            Ödeme sonrası hesabınızda doğrulanmış rozet görünür ve müşterilere
            verdiğiniz teklifler listede öncelikli sıralanır.
          </p>
        </Card>
      )}
      {odemeTipi === "abonelik" && (
        <Card className="border-amber-200 bg-amber-50 mb-4">
          <p className="text-sm text-amber-950 leading-relaxed">
            Abonelik her ay otomatik yenilenir (Garanti). İstediğiniz zaman kredi
            sayfasından iptal edebilirsiniz; kalan krediniz silinmez.
          </p>
        </Card>
      )}

      {error && !odemeAnimasyon && (
        <Card className="border-red-200 bg-red-50 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </Card>
      )}

      <form onSubmit={odemeYap} className="space-y-4">
        <Card>
          <p className="text-sm font-medium text-slate-800 mb-3">Kart bilgileri</p>
          <Field
            label="Kart Numarası"
            placeholder="4242 4242 4242 4242"
            value={kartNo}
            onChange={(e) => setKartNo(e.target.value)}
            inputMode="numeric"
            disabled={loading}
          />
          <div className="grid grid-cols-3 gap-3">
            <Field
              label="Ay"
              placeholder="12"
              value={sktAy}
              onChange={sktAyDegistir}
              inputMode="numeric"
              maxLength={2}
              autoComplete="cc-exp-month"
              disabled={loading}
            />
            <Field
              ref={sktYilRef}
              label="Yıl"
              placeholder="28"
              value={sktYil}
              onChange={sktYilDegistir}
              inputMode="numeric"
              maxLength={2}
              autoComplete="cc-exp-year"
              disabled={loading}
            />
            <Field
              ref={cvvRef}
              label="CVV"
              placeholder="123"
              type="password"
              maxLength={4}
              value={cvv}
              onChange={(e) =>
                setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              inputMode="numeric"
              autoComplete="cc-csc"
              disabled={loading}
            />
          </div>
        </Card>

        <Card>
          <p className="text-sm font-medium text-slate-800 mb-3">
            İletişim bilgileri
          </p>
          <Field
            label="E-posta"
            type="email"
            value={eposta}
            onChange={() => {}}
            disabled
          />
          <Field
            label="Telefon"
            type="tel"
            value={telefon}
            onChange={() => {}}
            disabled
          />
          <p className="text-xs text-slate-500 mt-2">
            E-posta ödeme öncesi doğrulandı. Telefon hesabınızdaki kayıtlı numaradır.
          </p>
        </Card>

        <Card>
          <p className="text-sm font-medium text-slate-800 mb-3">
            Fatura bilgileri
          </p>
          <Field
            label="TC kimlik no (isteğe bağlı)"
            placeholder="11 hane"
            value={tcKimlik}
            onChange={(e) => setTcKimlik(e.target.value)}
            inputMode="numeric"
            disabled={loading}
          />
          <Field
            label="Adres (isteğe bağlı)"
            placeholder="Fatura adresi"
            value={adres}
            onChange={(e) => setAdres(e.target.value)}
            disabled={loading}
          />

          <label className="flex items-center gap-2 mt-3 cursor-pointer">
            <input
              type="checkbox"
              checked={kurumsal}
              onChange={(e) => setKurumsal(e.target.checked)}
              disabled={loading}
              className="rounded border-slate-300 text-amber-600"
            />
            <span className="text-sm text-slate-700">Kurumsal fatura istiyorum</span>
          </label>

          {kurumsal && (
            <div className="mt-3 space-y-3 pl-1 border-l-2 border-amber-200">
              <Field
                label="Şirket ünvanı"
                value={sirketUnvan}
                onChange={(e) => setSirketUnvan(e.target.value)}
                disabled={loading}
              />
              <Field
                label="Vergi no"
                placeholder="10 veya 11 hane"
                value={vergiNo}
                onChange={(e) => setVergiNo(e.target.value)}
                inputMode="numeric"
                disabled={loading}
              />
            </div>
          )}
        </Card>

        {smokeDolduruldu && !odemeAnimasyon && (
          <Card className="bg-blue-50 border-blue-200">
            <p className="text-xs text-blue-800">
              Test kartı .env GARANTI_SMOKE_* alanlarından dolduruldu.
            </p>
          </Card>
        )}

        {!garantiAktif && !odemeAnimasyon && (
          <Card className="bg-emerald-50 border-emerald-200">
            <p className="text-xs text-emerald-800">
              Demo ortamı — gerçek ödeme alınmaz.
            </p>
          </Card>
        )}

        <Btn type="submit" disabled={loading || odemeAnimasyon}>
          {loading ? "İşleniyor…" : "Ödeme Yap"}
        </Btn>
      </form>
    </MobileShell>
  );
}
