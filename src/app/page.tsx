"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { SorunSecimi } from "@/components/SorunSecimi";
import { Btn, Field, Card } from "@/components/ui";
import { sorunMetniOlustur, sorunTipiBul } from "@/lib/sorun-tipleri";
import { KonumIzniYardim } from "@/components/KonumIzniYardim";
import { GpsHttpsBanner } from "@/components/GpsHttpsBanner";
import {
  geocodeAdres,
  cihazPlatformu,
  konumAlEsnek,
  konumGuvenliMi,
  konumHataMesaji,
  konumIzniDinle,
  konumIzniOku,
  reverseGeocode,
  type KonumIzniDurumu,
} from "@/lib/konum-client";
import { telefonGecerliMi, telefonMaskele, telefonNormalize } from "@/lib/telefon";

type Step = "bilgi" | "konum" | "sorun" | "hedef";

interface KonumOneri {
  ad: string;
  adres: string;
  lat: number;
  lng: number;
  mesafeKm?: number;
}

const STEP_SIRA: Step[] = ["bilgi", "konum", "sorun", "hedef"];
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
  const [otpHata, setOtpHata] = useState("");
  const [gelistirmeKodu, setGelistirmeKodu] = useState<string | null>(null);
  const [yenidenGonderSn, setYenidenGonderSn] = useState(0);
  const [otpBekleniyor, setOtpBekleniyor] = useState(false);
  const [kodGirisAcik, setKodGirisAcik] = useState(false);
  const [gpsGuvenli, setGpsGuvenli] = useState(false);
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
    const guvenli = konumGuvenliMi();
    setGpsGuvenli(guvenli);
    if (!guvenli) {
      setKonumIzni("unknown");
      return;
    }
    konumIzniOku().then((izin) => {
      if (izin === "denied" && cihazPlatformu() === "ios") {
        setKonumIzni("prompt");
      } else {
        setKonumIzni(izin);
      }
    });
    return konumIzniDinle((izin) => {
      if (izin === "denied" && cihazPlatformu() === "ios") {
        setKonumIzni("prompt");
      } else {
        setKonumIzni(izin);
      }
    });
  }, [step]);

  useEffect(() => {
    fetch("/api/musteri/otp/durum", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.dogrulandi && d.telefon) {
          setTelefonDogrulandi(true);
          setForm((f) => ({ ...f, telefon: d.telefon }));
          setStep("bilgi");
        } else {
          setTelefonDogrulandi(false);
        }
      })
      .catch(() => {});

    try {
      const kayitli = sessionStorage.getItem(OTP_BEKLEYEN_KEY);
      if (kayitli) {
        setOtpBekleniyor(true);
        setKodGirisAcik(true);
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
            setKodGirisAcik(true);
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
    if (hedefIdx > 0 && !telefonDogrulandi) {
      setError("Devam etmek için telefon doğrulaması gerekli.");
      setKodGirisAcik(true);
      setStep("bilgi");
      return;
    }
    setStep(hedef);
    setError("");
  }

  function kodGirisGoster(opts?: {
    mesaj?: string;
    gelistirmeKodu?: string | null;
    yenidenGonderSn?: number;
  }) {
    const tel = telefonNormalize(form.telefon);
    setOtpBekleniyor(true);
    setKodGirisAcik(true);
    setStep("bilgi");
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
        setTelefonDogrulandi(false);
        kodGirisGoster({
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
      setTelefonDogrulandi(false);
      kodGirisGoster({
        yenidenGonderSn: data.yenidenGonderSn ?? 60,
        gelistirmeKodu: data.gelistirmeKodu ?? null,
        mesaj: data.smsGonderildi
          ? (data.mesaj ?? "Kod gönderildi. Aşağıya girin.")
          : data.gelistirmeKodu
            ? (data.mesaj ?? "SMS gelmediyse geliştirme kodunu girin.")
            : undefined,
      });

      if (!data.smsGonderildi && !data.gelistirmeKodu) {
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
    setOtpHata("");
    if (otpKod.length !== 6) {
      const msg = "6 haneli doğrulama kodunu girin.";
      setOtpHata(msg);
      setError(msg);
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
      if (!res.ok) {
        const msg =
          data.error ??
          "Doğrulama kodu hatalı. SMS’teki 6 haneli kodu kontrol edin.";
        setOtpHata(msg);
        setError(msg);
        return;
      }
      setOtpHata("");
      setTelefonDogrulandi(true);
      setOtpBekleniyor(false);
      setKodGirisAcik(false);
      setGelistirmeKodu(null);
      setBilgiMesaj("");
      setOtpKod("");
      try {
        sessionStorage.removeItem(OTP_BEKLEYEN_KEY);
      } catch {
        /* ignore */
      }
      setStep("konum");
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Doğrulama kodu doğrulanamadı.";
      setOtpHata(msg);
      setError(msg);
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
      setGpsGuvenli(false);
      setKonumIzni("unknown");
      setError(
        "GPS için https:// adresi gerekli. Yukarıdaki «HTTPS ile aç» butonunu kullanın veya adresi aşağıya yazın."
      );
      setKonumYukleniyor(false);
      return;
    }

    setKonumIzniBekleniyor(true);
    const izin = await konumIzniOku();
    if (izin === "granted") setKonumIzni("granted");
    else if (izin !== "denied") setKonumIzni(izin);
    /* Safari: permissions “denied” olsa bile GPS dene (site ayarı Allow olabilir) */
    try {
      const pos = await konumAlEsnek();
      const { latitude, longitude } = pos.coords;
      const adres = await reverseGeocode(latitude, longitude);
      await konumKaydet(latitude, longitude, adres, hedef);
      if (!hedef) {
        setBilgiMesaj("✓ GPS konumu alındı. Ad ve soyadı kontrol edip «Devam Et»e basın.");
      }
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
    setError("");
    await konumAl(false);
  }

  async function yaklasikKonumAl(hedef = false) {
    setKonumYukleniyor(true);
    setError("");
    try {
      const res = await fetch("/api/konum/ip-tahmin");
      const data = await res.json();
      if (!res.ok) {
        const mevcut = hedef ? form.hedefAdres : form.adres;
        if (mevcut.trim().length >= 4) {
          const g = await geocodeAdres(mevcut);
          if (g) {
            await konumKaydet(g.lat, g.lng, g.adres, hedef);
            setBilgiMesaj("Adres haritada işaretlendi.");
            return;
          }
        }
        throw new Error(
          data.error ??
            "Yerel Wi‑Fi’de IP konumu çalışmaz. Adresi yazıp «Devam Et»e basın veya HTTPS ile GPS kullanın."
        );
      }
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

  /** Elle yazılan adresi koordinata çevir (GPS yokken öneriler için) */
  async function adresKoordinatDoldur(hedef = false): Promise<boolean> {
    const adres = (hedef ? form.hedefAdres : form.adres).trim();
    if (!adres) {
      setError(hedef ? "Hedef adres gerekli." : "Adres gerekli.");
      return false;
    }
    const lat = hedef ? form.hedefLat : form.lat;
    const lng = hedef ? form.hedefLng : form.lng;
    if (lat && lng) return true;

    setKonumYukleniyor(true);
    setError("");
    const g = await geocodeAdres(adres);
    setKonumYukleniyor(false);
    if (g) {
      await konumKaydet(g.lat, g.lng, g.adres, hedef);
      return true;
    }
    setBilgiMesaj(
      "Adres kaydedildi. Daha net yazarsanız (ilçe, mahalle) harita önerileri iyileşir."
    );
    return true;
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
    if (!form.lat || !form.lng) {
      const ok = await adresKoordinatDoldur(false);
      if (!ok) return;
    }
    if (!telefonDogrulandi) {
      setError("Telefon doğrulaması gerekli.");
      setKodGirisAcik(true);
      setStep("bilgi");
      return;
    }
    if (!form.ad?.trim() || !form.soyad?.trim() || !form.telefon) {
      setError("Ad ve soyad zorunludur (arıza konumu adımında).");
      setStep("konum");
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
    { key: "konum", label: "2" },
    { key: "sorun", label: "3" },
    { key: "hedef", label: "4" },
  ];

  const sorunLabel = form.sorunTipi
    ? sorunTipiBul(form.sorunTipi)?.label
    : null;

  const arızaKonumuHazir =
    !!form.adres.trim() || (!!form.lat && !!form.lng);

  return (
    <MobileShell subtitle="Yolda mı kaldınız? Hemen çekici bulun.">

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

      {bilgiMesaj && (step === "bilgi" || step === "konum") && (
        <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
          {bilgiMesaj}
        </div>
      )}

      {step === "bilgi" && (
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-xl font-bold">Telefon Doğrulama</h2>
          <p className="text-slate-500 text-sm">
            {telefonDogrulandi
              ? "Telefonunuz doğrulandı. Arıza konumuna geçebilirsiniz."
              : "SMS kodu ile telefonunuzu doğrulayın. Ad ve soyad bir sonraki adımda."}
          </p>

          {telefonDogrulandi ? (
            <>
              <Card className="bg-emerald-50 border-emerald-200">
                <p className="text-sm text-emerald-800">
                  ✓ {telefonMaskele(form.telefon)} doğrulandı
                </p>
              </Card>
              <Btn type="button" onClick={() => adimGit("konum")}>
                Arıza Konumuna Git
              </Btn>
            </>
          ) : (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (loading) return;
                if (kodGirisAcik) {
                  if (otpKod.length === 6) void kodDogrula();
                  else setError("6 haneli doğrulama kodunu girin.");
                  return;
                }
                void kodGonder();
              }}
            >
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
                disabled={kodGirisAcik}
              />

              {kodGirisAcik && (
                <>
                  <p className="text-sm text-slate-600">
                    {telefonMaskele(form.telefon)} numarasına gelen 6 haneli kodu
                    girin.
                  </p>
                  {gelistirmeKodu && (
                    <Card className="bg-amber-50 border-amber-200">
                      <p className="text-xs text-amber-800">
                        Geliştirme kodu:{" "}
                        <span className="font-mono font-bold text-lg">
                          {gelistirmeKodu}
                        </span>
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
                    onChange={(e) => {
                      setOtpHata("");
                      setError("");
                      setOtpKod(e.target.value.replace(/\D/g, "").slice(0, 6));
                    }}
                    autoComplete="one-time-code"
                    enterKeyHint="done"
                    name="otp"
                    required
                    aria-invalid={!!otpHata}
                    className={
                      otpHata
                        ? "border-red-400 ring-2 ring-red-200 focus:border-red-500 focus:ring-red-300/50"
                        : undefined
                    }
                  />
                  {otpHata && (
                    <div
                      className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 font-medium"
                      role="alert"
                    >
                      ⚠️ {otpHata}
                    </div>
                  )}
                  <Btn type="submit" disabled={loading || otpKod.length !== 6}>
                    {loading ? "Doğrulanıyor…" : "Onayla — Arıza Konumuna Git"}
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
                  <Btn
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setKodGirisAcik(false);
                      setOtpKod("");
                    }}
                  >
                    Telefonu değiştir
                  </Btn>
                </>
              )}

              {!kodGirisAcik && (
                <>
                  <Btn type="submit" disabled={loading}>
                    {loading ? "Kod gönderiliyor…" : "Doğrulama Kodu Gönder"}
                  </Btn>
                  {(otpBekleniyor || yenidenGonderSn > 0) && (
                    <Btn
                      type="button"
                      variant="outline"
                      onClick={() =>
                        kodGirisGoster({
                          mesaj: "SMS ile gelen 6 haneli kodu girin.",
                        })
                      }
                    >
                      SMS Kodunu Gir
                    </Btn>
                  )}
                </>
              )}
            </form>
          )}
        </div>
      )}

      {step === "konum" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Arıza Konumu</h2>
          <p className="text-slate-500 text-sm">
            İletişim bilgilerinizi ve aracınızın bulunduğu yeri girin.
          </p>

          {!gpsGuvenli && <GpsHttpsBanner compact />}

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Ad"
              placeholder="Ahmet"
              value={form.ad}
              onChange={(e) => update("ad", e.target.value)}
              autoComplete="given-name"
              name="ad"
              required
            />
            <Field
              label="Soyad"
              placeholder="Yılmaz"
              value={form.soyad}
              onChange={(e) => update("soyad", e.target.value)}
              autoComplete="family-name"
              name="soyad"
              required
            />
          </div>
          <p className="text-xs text-slate-500 -mt-2">
            Telefon: {telefonMaskele(form.telefon)}
          </p>

          <Field
            label="Arıza adresi"
            placeholder="Örn. İstanbul, Bayrampaşa, …"
            value={form.adres}
            onChange={(e) => update("adres", e.target.value)}
            onBlur={() => {
              if (form.adres.trim().length >= 6 && !form.lat) {
                void geocodeAdres(form.adres).then((g) => {
                  if (g) void konumKaydet(g.lat, g.lng, g.adres, false);
                });
              }
            }}
          />
          <Btn
            type="button"
            variant="secondary"
            onClick={async () => {
              if (!form.adres.trim()) {
                setError("Önce arıza adresini yazın.");
                return;
              }
              setKonumYukleniyor(true);
              setError("");
              const g = await geocodeAdres(form.adres);
              setKonumYukleniyor(false);
              if (g) {
                await konumKaydet(g.lat, g.lng, g.adres, false);
                setBilgiMesaj("Adres haritada işaretlendi.");
              } else {
                setError(
                  "Adres bulunamadı. İlçe ve mahalle ekleyerek tekrar deneyin."
                );
              }
            }}
            disabled={konumYukleniyor || !form.adres.trim()}
          >
            {konumYukleniyor ? "Adres işleniyor…" : "📍 Adresi haritaya işle"}
          </Btn>

          {gpsGuvenli && (
            <>
              <KonumIzniYardim
                durum={konumIzni}
                gpsGuvenli={gpsGuvenli}
                bekleniyor={konumIzniBekleniyor}
              />
              <Btn
                type="button"
                variant="outline"
                onClick={() => konumAl(false)}
                disabled={konumYukleniyor}
                className="!py-3 text-sm"
              >
                {konumYukleniyor
                  ? konumIzniBekleniyor
                    ? "İzin penceresinde «İzin Ver»e dokunun…"
                    : "Konum alınıyor…"
                  : "veya GPS konumumu paylaş"}
              </Btn>
              {konumIzni === "denied" && (
                <button
                  type="button"
                  onClick={konumIzniYenile}
                  className="w-full text-sm text-amber-600 font-medium underline"
                >
                  Ayarlardan izin verdim — yeniden kontrol et
                </button>
              )}
            </>
          )}
          {form.adres && (
            <Card>
              <p className="text-xs text-slate-500 mb-1">Arıza konumu</p>
              <p className="text-sm leading-relaxed">{form.adres}</p>
            </Card>
          )}
          <div className="flex gap-3">
            <Btn variant="outline" onClick={() => adimGit("bilgi")}>
              Geri
            </Btn>
            <Btn
              onClick={async () => {
                if (!arızaKonumuHazir) {
                  setError(
                    "Arıza konumu gerekli. GPS paylaşın veya adresi yazıp «Adresi haritaya işle»ye basın."
                  );
                  return;
                }
                if (!form.ad.trim() || !form.soyad.trim()) {
                  setError("Devam etmek için ad ve soyad girin (yukarıdaki alanlar).");
                  return;
                }
                if (await adresKoordinatDoldur(false)) adimGit("sorun");
              }}
              disabled={konumYukleniyor || !arızaKonumuHazir}
            >
              {konumYukleniyor ? "Adres işleniyor…" : "Devam Et"}
            </Btn>
            {!arızaKonumuHazir && !konumYukleniyor && (
              <p className="text-xs text-amber-700 text-center">
                Devam için GPS konumu paylaşın veya arıza adresini yazın.
              </p>
            )}
            {arızaKonumuHazir &&
              (!form.ad.trim() || !form.soyad.trim()) &&
              !konumYukleniyor && (
                <p className="text-xs text-amber-700 text-center">
                  Konum hazır — devam için ad ve soyadı doldurun.
                </p>
              )}
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
            onBlur={() => {
              if (form.hedefAdres.trim().length >= 6 && !form.hedefLat) {
                void geocodeAdres(form.hedefAdres).then((g) => {
                  if (g) void konumKaydet(g.lat, g.lng, g.adres, true);
                });
              }
            }}
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
            <Btn
              onClick={async () => {
                if (await adresKoordinatDoldur(true)) void cekiciBul();
              }}
              disabled={loading || !form.hedefAdres.trim() || konumYukleniyor}
            >
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
