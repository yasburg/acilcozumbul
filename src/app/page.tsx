"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { SorunSecimi } from "@/components/SorunSecimi";
import { Btn, Field, Card } from "@/components/ui";
import { sorunMetniOlustur } from "@/lib/sorun-tipleri";

type Step = "bilgi" | "konum" | "sorun";

export default function HomePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("bilgi");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [konumYukleniyor, setKonumYukleniyor] = useState(false);

  const [form, setForm] = useState({
    ad: "",
    soyad: "",
    telefon: "",
    lat: 0,
    lng: 0,
    adres: "",
    sorunTipi: "",
    sorunDetay: "",
  });

  function update(field: string, value: string | number) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function konumAl() {
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
          if (data.display_name) {
            adres = data.display_name;
          }
        } catch {
          /* adres koordinat olarak kalır */
        }
        setForm((f) => ({
          ...f,
          lat: latitude,
          lng: longitude,
          adres,
        }));
        setKonumYukleniyor(false);
      },
      () => {
        setError("Konum alınamadı. Lütfen adresi elle girin.");
        setKonumYukleniyor(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  async function cekiciBul() {
    setError("");
    if (!form.ad || !form.soyad || !form.telefon) {
      setError("Ad, soyad ve telefon zorunludur.");
      setStep("bilgi");
      return;
    }
    if (!form.adres) {
      setError("Konum bilgisi gerekli.");
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
  ];

  return (
    <MobileShell subtitle="Yolda mı kaldınız? Hemen çekici bulun.">
      <div className="flex gap-2 mb-6">
        {steps.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setStep(s.key)}
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

      {step === "bilgi" && (
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-xl font-bold">İletişim Bilgileri</h2>
          <p className="text-slate-500 text-sm">
            Çekici sizi arayabilsin diye bilgilerinizi girin.
          </p>
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
          <Field
            label="Telefon"
            type="tel"
            placeholder="05XX XXX XX XX"
            value={form.telefon}
            onChange={(e) => update("telefon", e.target.value)}
            autoComplete="tel"
          />
          <Btn onClick={() => setStep("konum")}>Devam Et</Btn>
        </div>
      )}

      {step === "konum" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Konumunuz</h2>
          <p className="text-slate-500 text-sm">
            Size en yakın çekiciyi bulmak için konumunuzu paylaşın.
          </p>
          <Btn
            type="button"
            variant="secondary"
            onClick={konumAl}
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
              <p className="text-xs text-slate-500 mb-1">Seçilen konum</p>
              <p className="text-sm leading-relaxed">{form.adres}</p>
            </Card>
          )}
          <div className="flex gap-3">
            <Btn variant="outline" onClick={() => setStep("bilgi")}>
              Geri
            </Btn>
            <Btn onClick={() => setStep("sorun")} disabled={!form.adres}>
              Devam Et
            </Btn>
          </div>
        </div>
      )}

      {step === "sorun" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Sorununuz</h2>
          <p className="text-slate-500 text-sm">
            En yaygın sorunlardan birini seçin.
          </p>
          <SorunSecimi
            seciliTip={form.sorunTipi}
            detay={form.sorunDetay}
            onTipSec={(id) => update("sorunTipi", id)}
            onDetayChange={(v) => update("sorunDetay", v)}
          />
          <div className="flex gap-3 pt-2">
            <Btn variant="outline" onClick={() => setStep("konum")}>
              Geri
            </Btn>
            <Btn
              onClick={cekiciBul}
              disabled={loading || !form.sorunTipi}
            >
              {loading ? "Gönderiliyor…" : "🚛 Çekici Bul"}
            </Btn>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-slate-500 mt-8">
        Demo:{" "}
        <a href="/demo/sms" className="text-amber-600 underline">
          gönderilen SMS&apos;leri gör
        </a>
      </p>
    </MobileShell>
  );
}
