"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { SorunSecimi } from "@/components/SorunSecimi";
import { Btn, Field, Card } from "@/components/ui";
import { sorunMetniOlustur, sorunTipiBul } from "@/lib/sorun-tipleri";
import { KonumIzniYardim } from "@/components/KonumIzniYardim";
import {
  konumAlEsnek,
  konumGuvenliMi,
  konumHataMesaji,
  konumIzniDinle,
  konumIzniOku,
  reverseGeocode,
  type KonumIzniDurumu,
} from "@/lib/konum-client";
import { telefonGecerliMi, telefonMaskele, telefonNormalize } from "@/lib/telefon";

type Step = "bilgi" | "kod" | "konum" | "sorun" | "hedef";

interface KonumOneri {
  ad: string;
  adres: string;
  lat: number;
  lng: number;
  mesafeKm?: number;
}

const STEP_SIRA: Step[] = ["bilgi", "kod", "konum", "sorun", "hedef"];
const OTP_BEKLEYEN_KEY = "acilcozum_otp_bekleyen";

export default function HomePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("bilgi");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bilgiMesaj, setBilgiMesaj] = useState("");
  const [konumYukleniyor, setKonumYukleniyor] = useState(false);
  const [oneriYukleniyor, setOneriYukleniyor] = useState(false);
  const [oneriler, setOneriler] = useState<KonumOneri[]>([]);
  const [telefonDogrulandi, setTelefonDogrulandi] = useState(false);
  const [otpKod, setOtpKod] = useState("");
  const [gelistirmeKodu, setGelistirmeKodu] = useState<string | null>(null);
  const [yenidenGonderSn, setYenidenGonderSn] = useState(0);
  const [otpBekleniyor, setOtpBekleniyor] = useState(false);
  const [gpsGuvenli, setGpsGuvenli] = useState(true);
  const [konumIzni, setKonumIzni] = useState<KonumIzniDurumu>("unknown");
  const [konumIzniBekleniyor, setKonumIzniBekleniyor] = useState(false);

  const [form, setForm] = useState({
    ad: "",
    soyad: "",
    telefon: "",
    lat: 0,
    lng: 0,
    adres: "",
    hedefLat: 0,
    hedefLng: 0,
    hedefAdres: "",
    sorunTipi: "",
    sorunDetay: "",
  });

  useEffect(() => {
    setGpsGuvenli(konumGuvenliMi());
  }, []);

  useEffect(() => {
    if (step !== "konum" && step !== "hedef") return;
    konumIzniOku().then(setKonumIzni);
    return konumIzniDinle(setKonumIzni);
  }, [step]);

  useEffect(() => {
    fetch("/api/musteri/otp/durum", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.dogrulandi && d.telefon) {
          setTelefonDogrulandi(true);
          setForm((f) => ({ ...f, telefon: d.telefon }));
        }
      })
      .catch(() => {});

    try {
      const kayitli = sessionStorage.getItem(OTP_BEKLEYEN_KEY);
      if (kayitli) {
        setOtpBekleniyor(true);
        setForm((f) => (f.telefon ? f : { ...f, telefon: kayitli }));
      }
    } catch {
      /* sessionStorage yok */
    }
  }, []);

  useEffect(() => {
    if (!telefonGecerliMi(form.telefon)) {
      setOtpBekleniyor(false);
      return;
    }
    const tel = telefonNormalize(form.telefon);
    const t = setTimeout(() => {
      fetch(`/api/musteri/otp/bekleyen?telefon=${encodeURIComponent(tel)}`, {
        credentials: "include",
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.bekliyor) {
            setOtpBekleniyor(true);
            setYenidenGonderSn(d.yenidenGonderSn ?? 0);
            if (d.gelistirmeKodu) setGelistirmeKodu(d.gelistirmeKodu);
          }
        })
        .catch(() => {});
    }, 400);
    return () => clearTimeout(t);
  }, [form.telefon]);

  useEffect(() => {
    if (yenidenGonderSn <= 0) return;
    const t = setInterval(() => {
      setYenidenGonderSn((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [yenidenGonderSn]);

  function update(field: string, value: string | number) {
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (field === "telefon" && value !== f.telefon) {
        setTelefonDogrulandi(false);
        setGelistirmeKodu(null);
        setOtpBekleniyor(false);
        try {
          sessionStorage.removeItem(OTP_BEKLEYEN_KEY);
        } catch {
          /* ignore */
        }
      }
      return next;
    });
  }

  function adimGit(hedef: Step) {
    const hedefIdx = STEP_SIRA.indexOf(hedef);
    const kodIdx = STEP_SIRA.indexOf("kod");
    if (hedefIdx > kodIdx && !telefonDogrulandi) {
      setError("Devam etmek için telefon doğrulaması gerekli.");
      setStep(telefonDogrulandi ? hedef : "kod");
      return;
    }
    setStep(hedef);
    setError("");
  }

  function kodAdiminaGec(opts?: {
    mesaj?: string;
    gelistirmeKodu?: string | null;
    yenidenGonderSn?: number;
  }) {
    const tel = telefonNormalize(form.telefon);
    setOtpBekleniyor(true);
    setStep("kod");
    setError("");
    if (opts?.mesaj) setBilgiMesaj(opts.mesaj);
    if (opts?.gelistirmeKodu !== undefined) {
      setGelistirmeKodu(opts.gelistirmeKodu);
    }
    if (opts?.yenidenGonderSn != null) setYenidenGonderSn(opts.yenidenGonderSn);
    try {
      sessionStorage.setItem(OTP_BEKLEYEN_KEY, tel);
    } catch {
      /* ignore */
    }
  }

  async function kodGonder() {
    setError("");
    setBilgiMesaj("");
    if (!form.telefon.trim()) {
      setError("Telefon numarası girin (05XX XXX XX XX).");
      return;
    }
    if (!telefonGecerliMi(form.telefon)) {
      setError("Geçerli bir cep telefonu girin (05XX XXX XX XX).");
      return;
    }

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setLoading(true);
    try {
      const res = await fetch("/api/musteri/otp/gonder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ telefon: telefonNormalize(form.telefon) }),
      });
      let data: {
        error?: string;
        mesaj?: string;
        gelistirmeKodu?: string;
        yenidenGonderSn?: number;
        smsGonderildi?: boolean;
        smsHatasi?: string;
        kodBekliyor?: boolean;
      };
      try {
        data = await res.json();
      } catch {
        throw new Error(
          "Sunucuya ulaşılamadı. Bilgisayarda npm run dev:lan çalışıyor mu?"
        );
      }

      if (data.kodBekliyor) {
        setOtpKod("");
        kodAdiminaGec({
          mesaj: data.mesaj ?? "SMS'teki kodu girin.",
          gelistirmeKodu: data.gelistirmeKodu ?? null,
          yenidenGonderSn: data.yenidenGonderSn ?? 60,
        });
        return;
      }

      if (!res.ok) {
        throw new Error(
          data.error ?? `İstek başarısız (${res.status}). ${data.mesaj ?? ""}`
        );
      }

      setOtpKod("");
      kodAdiminaGec({
        yenidenGonderSn: data.yenidenGonderSn ?? 60,
        gelistirmeKodu: data.gelistirmeKodu ?? null,
      });

      if (data.smsGonderildi) {
        setBilgiMesaj(data.mesaj ?? "Kod gönderildi.");
      } else if (data.gelistirmeKodu) {
        setBilgiMesaj(
          data.mesaj ?? "SMS gelmediyse aşağıdaki geliştirme kodunu girin."
        );
      } else {
        setError(
          [data.mesaj, data.smsHatasi].filter(Boolean).join(" ") ||
            "SMS gönderilemedi."
        );
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Kod gönderilemedi.";
      if (msg === "Failed to fetch" || msg.includes("NetworkError")) {
        setError(
          "Sunucuya ulaşılamadı. Telefonda https://10.55.33.167:3000 kullanın (http değil)."
        );
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function kodDogrula() {
    setError("");
    if (otpKod.length !== 6) {
      setError("6 haneli doğrulama kodunu girin.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/musteri/otp/dogrula", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          telefon: telefonNormalize(form.telefon),
          kod: otpKod,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTelefonDogrulandi(true);
      setOtpBekleniyor(false);
      setGelistirmeKodu(null);
      setBilgiMesaj("");
      try {
        sessionStorage.removeItem(OTP_BEKLEYEN_KEY);
      } catch {
        /* ignore */
      }
      setStep("konum");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Doğrulama başarısız.");
    } finally {
      setLoading(false);
    }
  }

  async function konumKaydet(
    lat: number,
    lng: number,
    adres: string,
    hedef: boolean
  ) {
    if (hedef) {
      setForm((f) => ({
        ...f,
        hedefLat: lat,
        hedefLng: lng,
        hedefAdres: adres,
      }));
    } else {
      setForm((f) => ({
        ...f,
        lat,
        lng,
        adres,
      }));
    }
  }

  async function konumAl(hedef = false) {
    setKonumYukleniyor(true);
    setError("");
    setKonumIzniBekleniyor(false);

    if (!navigator.geolocation) {
      setError("Tarayıcınız konum desteklemiyor. Adresi elle yazın.");
      setKonumYukleniyor(false);
      return;
    }
    if (!konumGuvenliMi()) {
      setError(konumHataMesaji());
      setKonumYukleniyor(false);
      return;
    }

    const izin = await konumIzniOku();
    setKonumIzni(izin);

    if (izin === "denied") {
      setError(
        "Konum izni reddedilmiş. Aşağıdaki adımlarla Ayarlar’dan açın, sayfayı yenileyin ve tekrar deneyin."
      );
      setKonumYukleniyor(false);
      return;
    }

    setKonumIzniBekleniyor(true);
    try {
      const pos = await konumAlEsnek();
      const { latitude, longitude } = pos.coords;
      const adres = await reverseGeocode(latitude, longitude);
      await konumKaydet(latitude, longitude, adres, hedef);
      setKonumIzni("granted");
      setKonumIzniBekleniyor(false);
    } catch (e) {
      const code =
        e && typeof e === "object" && "code" in e
          ? (e as GeolocationPositionError).code
          : undefined;
      if (code === 1) {
        setKonumIzni("denied");
        setKonumIzniBekleniyor(false);
      }
      setError(konumHataMesaji(code));
    } finally {
      setKonumYukleniyor(false);
      setKonumIzniBekleniyor(false);
    }
  }

  async function konumIzniYenile() {
    const izin = await konumIzniOku();
    setKonumIzni(izin);
    if (izin === "granted") setError("");
  }

  async function yaklasikKonumAl(hedef = false) {
    setKonumYukleniyor(true);
    setError("");
    try {
      const res = await fetch("/api/konum/ip-tahmin");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const uyari = " (yaklaşık konum)";
      await konumKaydet(
        data.lat,
        data.lng,
        (data.adres ?? "") + uyari,
        hedef
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yaklaşık konum alınamadı.");
    } finally {
      setKonumYukleniyor(false);
    }
  }

  async function cozumOner() {
    if (!form.lat || !form.lng) {
      setError("Önce arıza konumunuzu paylaşın.");
      return;
    }
    if (!form.sorunTipi) {
      setError("Önce sorununuzu seçin.");
      setStep("sorun");
      return;
    }
    setOneriYukleniyor(true);
    setError("");
    setOneriler([]);
    try {
      const res = await fetch(
        `/api/konum/oneri?lat=${form.lat}&lng=${form.lng}&sorunTipi=${encodeURIComponent(form.sorunTipi)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Öneri alınamadı.");
      setOneriler(data.oneriler ?? []);
      if (!data.oneriler?.length) {
        setError("Yakında öneri bulunamadı. Adresi elle yazabilirsiniz.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Öneri alınamadı.");
    } finally {
      setOneriYukleniyor(false);
    }
  }

  function oneriSec(o: KonumOneri) {
    setForm((f) => ({
      ...f,
      hedefLat: o.lat,
      hedefLng: o.lng,
      hedefAdres: o.adres,
    }));
    setOneriler([]);
  }

  async function cekiciBul() {
    setError("");
    if (!telefonDogrulandi) {
      setError("Telefon doğrulaması gerekli.");
      setStep("kod");
      return;
    }
    if (!form.ad || !form.soyad || !form.telefon) {
      setError("Ad, soyad ve telefon zorunludur.");
      setStep("bilgi");
      return;
    }
    if (!form.adres) {
      setError("Arıza konumu gerekli.");
      setStep("konum");
      return;
    }
    if (!form.sorunTipi) {
      setError("Lütfen sorununuzu seçin.");
      setStep("sorun");
      return;
    }
    if (form.sorunTipi === "diger" && !form.sorunDetay.trim()) {
      setError("Lütfen sorununuzu kısaca açıklayın.");
      setStep("sorun");
      return;
    }
    if (!form.hedefAdres) {
      setError("Aracın çekileceği adres gerekli.");
      setStep("hedef");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/talep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ad: form.ad,
          soyad: form.soyad,
          telefon: form.telefon,
          konum: { lat: form.lat, lng: form.lng, adres: form.adres },
          hedefKonum: {
            lat: form.hedefLat,
            lng: form.hedefLng,
            adres: form.hedefAdres,
          },
          sorunTipi: form.sorunTipi,
          sorunDetay: form.sorunDetay,
          sorun: sorunMetniOlustur(form.sorunTipi, form.sorunDetay),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bir hata oluştu.");
      router.push(`/bekle/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Talep gönderilemedi.");
    } finally {
      setLoading(false);
    }
  }

  const steps: { key: Step; label: string }[] = [
    { key: "bilgi", label: "1" },
    { key: "kod", label: "2" },
    { key: "konum", label: "3" },
    { key: "sorun", label: "4" },
    { key: "hedef", label: "5" },
  ];

  const sorunLabel = form.sorunTipi
    ? sorunTipiBul(form.sorunTipi)?.label
    : null;

  const lanHttpsUyarisi =
    typeof window !== "undefined" &&
    window.location.protocol === "http:" &&
    !window.location.hostname.includes("localhost");

  return (
    <MobileShell subtitle="Yolda mı kaldınız? Hemen çekici bulun.">
      {lanHttpsUyarisi && (
        <Card className="border-amber-200 bg-amber-50 mb-4">
          <p className="text-amber-900 text-sm">
            Sayfa <strong>http</strong> ile açılmış; butonlar çalışmayabilir.{" "}
            <strong>https://10.55.33.167:3000</strong> adresini kullanın.
          </p>
        </Card>
      )}

      <div className="flex gap-1.5 mb-6">
        {steps.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => adimGit(s.key)}
            className={`flex-1 h-1.5 rounded-full transition ${
              step === s.key ? "bg-amber-500" : "bg-slate-200"
            }`}
            aria-label={`Adım ${s.label}`}
          />
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {bilgiMesaj && (step === "kod" || step === "bilgi") && (
        <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
          {bilgiMesaj}
        </div>
      )}

      {step === "bilgi" && (
        <form
          className="space-y-4 animate-fade-in"
          onSubmit={(e) => {
            e.preventDefault();
            if (loading) return;
            if (telefonDogrulandi) adimGit("konum");
            else void kodGonder();
          }}
        >
          <h2 className="text-xl font-bold">İletişim Bilgileri</h2>
          <p className="text-slate-500 text-sm">
            Önce telefonunuzu doğrulayın; ardından talebe devam edin.
          </p>
          <Field
            label="Telefon"
            type="tel"
            placeholder="05XX XXX XX XX"
            value={form.telefon}
            onChange={(e) => update("telefon", e.target.value)}
            autoComplete="tel"
            inputMode="tel"
            enterKeyHint="go"
            name="telefon"
            required
          />
          <Field
            label="Ad"
            placeholder="Ahmet"
            value={form.ad}
            onChange={(e) => update("ad", e.target.value)}
            autoComplete="given-name"
            enterKeyHint="next"
            name="ad"
          />
          <Field
            label="Soyad"
            placeholder="Yılmaz"
            value={form.soyad}
            onChange={(e) => update("soyad", e.target.value)}
            autoComplete="family-name"
            enterKeyHint="done"
            name="soyad"
          />
          {telefonDogrulandi && (
            <Card className="bg-emerald-50 border-emerald-200">
              <p className="text-sm text-emerald-800">
                ✓ {telefonMaskele(form.telefon)} doğrulandı
              </p>
            </Card>
          )}
          {telefonDogrulandi ? (
            <Btn type="submit">Devam Et</Btn>
          ) : (
            <>
              <Btn type="submit" disabled={loading}>
                {loading ? "Kod gönderiliyor…" : "Doğrulama Kodu Gönder"}
              </Btn>
              {(otpBekleniyor || yenidenGonderSn > 0) && (
                <Btn
                  type="button"
                  variant="outline"
                  onClick={() =>
                    kodAdiminaGec({
                      mesaj: "SMS ile gelen 6 haneli kodu girin.",
                    })
                  }
                >
                  SMS Kodunu Gir
                </Btn>
              )}
              <p className="text-xs text-slate-500 text-center">
                {otpBekleniyor || yenidenGonderSn > 0
                  ? "Kod geldi mi? «SMS Kodunu Gir» ile doğrulama adımına geçin."
                  : "Önce telefon doğrulanır; ad/soyadı sonraki adımlarda da tamamlayabilirsiniz."}
              </p>
            </>
          )}
        </form>
      )}

      {step === "kod" && (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!loading && otpKod.length === 6) void kodDogrula();
          }}
        >
          <h2 className="text-xl font-bold">Telefon Doğrulama</h2>
          <p className="text-slate-500 text-sm">
            {telefonMaskele(form.telefon)} numarasına gelen 6 haneli kodu girin.
          </p>
          {gelistirmeKodu && (
            <Card className="bg-amber-50 border-amber-200">
              <p className="text-xs text-amber-800">
                Geliştirme kodu:{" "}
                <span className="font-mono font-bold text-lg">{gelistirmeKodu}</span>
              </p>
            </Card>
          )}
          <Field
            label="Doğrulama kodu"
            type="text"
            inputMode="numeric"
            placeholder="123456"
            maxLength={6}
            value={otpKod}
            onChange={(e) => setOtpKod(e.target.value.replace(/\D/g, "").slice(0, 6))}
            autoComplete="one-time-code"
            enterKeyHint="done"
            name="otp"
            required
          />
          <Btn type="submit" disabled={loading || otpKod.length !== 6}>
            {loading ? "Doğrulanıyor…" : "Onayla ve Devam Et"}
          </Btn>
          <button
            type="button"
            onClick={() => void kodGonder()}
            disabled={loading || yenidenGonderSn > 0}
            className="w-full min-h-[44px] text-sm text-amber-600 font-medium touch-manipulation disabled:text-slate-400"
          >
            {yenidenGonderSn > 0
              ? `Yeni kod (${yenidenGonderSn}s)`
              : "Kodu tekrar gönder"}
          </button>
          <Btn variant="outline" type="button" onClick={() => setStep("bilgi")}>
            Geri — bilgileri düzenle
          </Btn>
        </form>
      )}

      {step === "konum" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Arıza Konumu</h2>
          <p className="text-slate-500 text-sm">
            Aracınızın şu an bulunduğu yeri paylaşın.
          </p>
          {!gpsGuvenli && (
            <Card className="bg-amber-50 border-amber-200">
              <p className="text-sm text-amber-900 leading-relaxed">
                Telefonda <strong>http://</strong> ile açıldığı için GPS kapalıdır.
                Adresi aşağıya yazın veya bilgisayarda{" "}
                <code className="text-xs">npm run dev:lan:https</code> ile{" "}
                <strong>https://</strong> adresinden deneyin (sertifikaya güvenin).
              </p>
            </Card>
          )}
          <KonumIzniYardim
            durum={konumIzni}
            gpsGuvenli={gpsGuvenli}
            bekleniyor={konumIzniBekleniyor}
          />
          <Btn
            type="button"
            variant="secondary"
            onClick={() => konumAl(false)}
            disabled={konumYukleniyor || !gpsGuvenli}
          >
            {konumYukleniyor
              ? konumIzniBekleniyor
                ? "İzin penceresinde «İzin Ver»e dokunun…"
                : "Konum alınıyor…"
              : "📍 Konumumu Paylaş (GPS)"}
          </Btn>
          {konumIzni === "denied" && gpsGuvenli && (
            <button
              type="button"
              onClick={konumIzniYenile}
              className="w-full text-sm text-amber-600 font-medium underline"
            >
              Ayarlardan izin verdim — yeniden kontrol et
            </button>
          )}
          <Btn
            type="button"
            variant="outline"
            onClick={() => yaklasikKonumAl(false)}
            disabled={konumYukleniyor}
            className="!py-3 text-sm"
          >
            Yaklaşık konum (mobil veri / canlı site)
          </Btn>
          <Field
            label="Adres"
            placeholder="İstanbul, Bayrampaşa, ..."
            value={form.adres}
            onChange={(e) => update("adres", e.target.value)}
          />
          {form.adres && (
            <Card>
              <p className="text-xs text-slate-500 mb-1">Arıza konumu</p>
              <p className="text-sm leading-relaxed">{form.adres}</p>
            </Card>
          )}
          <div className="flex gap-3">
            <Btn variant="outline" onClick={() => adimGit("kod")}>
              Geri
            </Btn>
            <Btn onClick={() => adimGit("sorun")} disabled={!form.adres}>
              Devam Et
            </Btn>
          </div>
        </div>
      )}

      {step === "sorun" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Sorununuz</h2>
          <p className="text-slate-500 text-sm">
            Sorununuzu seçin; bir sonraki adımda size uygun hedef yerler önereceğiz.
          </p>
          <SorunSecimi
            seciliTip={form.sorunTipi}
            detay={form.sorunDetay}
            onTipSec={(id) => update("sorunTipi", id)}
            onDetayChange={(v) => update("sorunDetay", v)}
          />
          <div className="flex gap-3 pt-2">
            <Btn variant="outline" onClick={() => adimGit("konum")}>
              Geri
            </Btn>
            <Btn
              onClick={() => adimGit("hedef")}
              disabled={
                !form.sorunTipi ||
                (form.sorunTipi === "diger" && !form.sorunDetay.trim())
              }
            >
              Devam Et
            </Btn>
          </div>
        </div>
      )}

      {step === "hedef" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Nereye Çekilecek?</h2>
          <p className="text-slate-500 text-sm">
            {sorunLabel
              ? `${sorunLabel} için uygun yerler önerilir veya adresi siz yazın.`
              : "Aracınızın götürülmesini istediğiniz adresi belirtin."}
          </p>
          <Btn
            type="button"
            variant="secondary"
            onClick={cozumOner}
            disabled={oneriYukleniyor || !form.lat || !form.sorunTipi}
          >
            {oneriYukleniyor
              ? "Öneriler hesaplanıyor…"
              : "✨ Soruna Göre Çözüm Öner"}
          </Btn>
          {oneriler.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Önerilen yerler
              </p>
              {oneriler.map((o) => (
                <button
                  key={o.adres}
                  type="button"
                  onClick={() => oneriSec(o)}
                  className="w-full text-left rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-amber-400 transition"
                >
                  <p className="font-medium text-slate-900">{o.ad}</p>
                  {o.mesafeKm != null && (
                    <p className="text-xs text-amber-600 mt-0.5">
                      ~{o.mesafeKm} km
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {o.adres}
                  </p>
                </button>
              ))}
            </div>
          )}
          {gpsGuvenli && (
            <KonumIzniYardim
              durum={konumIzni}
              gpsGuvenli={gpsGuvenli}
              bekleniyor={konumIzniBekleniyor}
            />
          )}
          {!gpsGuvenli && (
            <p className="text-xs text-amber-700">
              Hedef için GPS yine http:// ile çalışmaz; adresi elle yazın.
            </p>
          )}
          <Btn
            type="button"
            variant="outline"
            onClick={() => konumAl(true)}
            disabled={konumYukleniyor || !gpsGuvenli}
          >
            📍 Hedef olarak GPS konumum
          </Btn>
          <Field
            label="Hedef adres"
            placeholder="Oto sanayi, servis, ev adresi…"
            value={form.hedefAdres}
            onChange={(e) => update("hedefAdres", e.target.value)}
          />
          {form.hedefAdres && (
            <Card>
              <p className="text-xs text-slate-500 mb-1">Çekilecek yer</p>
              <p className="text-sm leading-relaxed">{form.hedefAdres}</p>
            </Card>
          )}
          <div className="flex gap-3">
            <Btn variant="outline" onClick={() => adimGit("sorun")}>
              Geri
            </Btn>
            <Btn onClick={cekiciBul} disabled={loading || !form.hedefAdres}>
              {loading ? "Gönderiliyor…" : "🚛 Çekici Bul"}
            </Btn>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-slate-500 mt-8">
        <a href="/panel" className="text-amber-600 underline">
          Yönetim paneli
        </a>
      </p>
    </MobileShell>
  );
}
