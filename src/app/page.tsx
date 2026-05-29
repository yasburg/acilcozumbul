"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { SorunSecimi } from "@/components/SorunSecimi";
import { Btn, Field, Card } from "@/components/ui";
import { sorunMetniOlustur, sorunTipiBul } from "@/lib/sorun-tipleri";
import { telefonMaskele } from "@/lib/telefon";

type Step = "bilgi" | "kod" | "konum" | "sorun" | "hedef";

interface KonumOneri {
  ad: string;
  adres: string;
  lat: number;
  lng: number;
  mesafeKm?: number;
}

const STEP_SIRA: Step[] = ["bilgi", "kod", "konum", "sorun", "hedef"];

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
    fetch("/api/musteri/otp/durum")
      .then((r) => r.json())
      .then((d) => {
        if (d.dogrulandi && d.telefon) {
          setTelefonDogrulandi(true);
          setForm((f) => ({ ...f, telefon: d.telefon }));
        }
      })
      .catch(() => {});
  }, []);

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

  async function kodGonder() {
    setError("");
    setBilgiMesaj("");
    if (!form.telefon.trim()) {
      setError("Telefon numarası girin.");
      return;
    }
    if (!form.ad.trim() || !form.soyad.trim()) {
      setError("Ad ve soyad zorunludur.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/musteri/otp/gonder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefon: form.telefon }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBilgiMesaj(data.mesaj ?? "Kod gönderildi.");
      setGelistirmeKodu(data.gelistirmeKodu ?? null);
      setYenidenGonderSn(data.yenidenGonderSn ?? 60);
      setOtpKod("");
      setStep("kod");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kod gönderilemedi.");
    } finally {
      setLoading(false);
    }
  }

  async function kodDogrula() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/musteri/otp/dogrula", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefon: form.telefon, kod: otpKod }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTelefonDogrulandi(true);
      setGelistirmeKodu(null);
      setBilgiMesaj("");
      setStep("konum");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Doğrulama başarısız.");
    } finally {
      setLoading(false);
    }
  }

  async function konumAl(hedef = false) {
    setKonumYukleniyor(true);
    setError("");
    if (!navigator.geolocation) {
      setError("Tarayıcınız konum desteklemiyor. Adresi elle yazın.");
      setKonumYukleniyor(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let adres = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=tr`
          );
          const data = await res.json();
          if (data.display_name) adres = data.display_name;
        } catch {
          /* koordinat kalır */
        }
        if (hedef) {
          setForm((f) => ({
            ...f,
            hedefLat: latitude,
            hedefLng: longitude,
            hedefAdres: adres,
          }));
        } else {
          setForm((f) => ({
            ...f,
            lat: latitude,
            lng: longitude,
            adres,
          }));
        }
        setKonumYukleniyor(false);
      },
      () => {
        setError("Konum alınamadı. Lütfen adresi elle girin.");
        setKonumYukleniyor(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
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

      {bilgiMesaj && step === "kod" && (
        <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
          {bilgiMesaj}
        </div>
      )}

      {step === "bilgi" && (
        <div className="space-y-4 animate-fade-in">
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
          />
          <Field
            label="Ad"
            placeholder="Ahmet"
            value={form.ad}
            onChange={(e) => update("ad", e.target.value)}
            autoComplete="given-name"
          />
          <Field
            label="Soyad"
            placeholder="Yılmaz"
            value={form.soyad}
            onChange={(e) => update("soyad", e.target.value)}
            autoComplete="family-name"
          />
          {telefonDogrulandi && (
            <Card className="bg-emerald-50 border-emerald-200">
              <p className="text-sm text-emerald-800">
                ✓ {telefonMaskele(form.telefon)} doğrulandı
              </p>
            </Card>
          )}
          {telefonDogrulandi ? (
            <Btn onClick={() => adimGit("konum")}>Devam Et</Btn>
          ) : (
            <Btn onClick={kodGonder} disabled={loading}>
              {loading ? "Kod gönderiliyor…" : "Doğrulama Kodu Gönder"}
            </Btn>
          )}
        </div>
      )}

      {step === "kod" && (
        <div className="space-y-4">
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
          />
          <Btn onClick={kodDogrula} disabled={loading || otpKod.length !== 6}>
            {loading ? "Doğrulanıyor…" : "Onayla ve Devam Et"}
          </Btn>
          <button
            type="button"
            onClick={kodGonder}
            disabled={loading || yenidenGonderSn > 0}
            className="w-full text-sm text-amber-600 font-medium disabled:text-slate-400"
          >
            {yenidenGonderSn > 0
              ? `Yeni kod (${yenidenGonderSn}s)`
              : "Kodu tekrar gönder"}
          </button>
          <Btn variant="outline" onClick={() => setStep("bilgi")}>
            Geri — bilgileri düzenle
          </Btn>
        </div>
      )}

      {step === "konum" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Arıza Konumu</h2>
          <p className="text-slate-500 text-sm">
            Aracınızın şu an bulunduğu yeri paylaşın.
          </p>
          <Btn
            type="button"
            variant="secondary"
            onClick={() => konumAl(false)}
            disabled={konumYukleniyor}
          >
            {konumYukleniyor ? "Konum alınıyor…" : "📍 Konumumu Paylaş"}
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
          <Btn
            type="button"
            variant="outline"
            onClick={() => konumAl(true)}
            disabled={konumYukleniyor}
          >
            📍 Hedef olarak konumumu kullan
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
