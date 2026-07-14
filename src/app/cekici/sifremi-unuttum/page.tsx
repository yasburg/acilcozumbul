"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { Btn, Field, SifreAlani, Card } from "@/components/ui";
import { telefonMaskele } from "@/lib/telefon";

type Adim = "telefon" | "sifre" | "tamam";

export default function SifremiUnuttumPage() {
  const router = useRouter();
  const [adim, setAdim] = useState<Adim>("telefon");
  const [telefon, setTelefon] = useState("");
  const [kod, setKod] = useState("");
  const [yeniSifre, setYeniSifre] = useState("");
  const [yeniSifreTekrar, setYeniSifreTekrar] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bilgi, setBilgi] = useState("");
  const [gelistirmeKodu, setGelistirmeKodu] = useState<string | null>(null);
  const [yenidenSn, setYenidenSn] = useState(0);

  useEffect(() => {
    if (yenidenSn <= 0) return;
    const t = window.setInterval(() => {
      setYenidenSn((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(t);
  }, [yenidenSn]);

  async function kodGonder() {
    setError("");
    setBilgi("");
    setLoading(true);
    try {
      const res = await fetch("/api/cekici/sifre/otp/gonder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefon }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Kod gönderilemedi.");

      setGelistirmeKodu(data.gelistirmeKodu ?? null);
      setYenidenSn(data.yenidenGonderSn ?? 60);
      setBilgi(data.mesaj ?? "Doğrulama kodu gönderildi.");
      setAdim("sifre");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kod gönderilemedi.");
    } finally {
      setLoading(false);
    }
  }

  async function sifreSifirla() {
    setError("");
    setBilgi("");
    setLoading(true);
    try {
      const res = await fetch("/api/cekici/sifre/sifirla", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telefon,
          kod,
          yeniSifre,
          yeniSifreTekrar,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Şifre güncellenemedi.");

      setBilgi(data.mesaj ?? "Şifreniz güncellendi.");
      setAdim("tamam");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Şifre güncellenemedi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <MobileShell
      subtitle="Şifre sıfırlama"
      backHref="/cekici/giris"
      backLabel="Giriş"
    >
      {(error || bilgi) && (
        <Card
          className={`mb-4 ${
            error ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50"
          }`}
        >
          <p className={`text-sm ${error ? "text-red-700" : "text-emerald-800"}`}>
            {error || bilgi}
          </p>
        </Card>
      )}

      {adim === "telefon" && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Kayıtlı telefon numaranıza WhatsApp ile doğrulama kodu gönderilir. Kodu
            girdikten sonra yeni şifrenizi belirleyin.
          </p>
          <Field
            label="Telefon"
            type="tel"
            placeholder="05XX XXX XX XX"
            value={telefon}
            onChange={(e) => setTelefon(e.target.value)}
            autoComplete="tel"
          />
          <Btn onClick={() => void kodGonder()} disabled={loading || !telefon.trim()}>
            {loading ? "Gönderiliyor…" : "Doğrulama kodu gönder"}
          </Btn>
        </div>
      )}

      {adim === "sifre" && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            {telefonMaskele(telefon)} numarasına gönderilen 6 haneli kodu ve yeni
            şifrenizi girin.
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
            value={kod}
            onChange={(e) => setKod(e.target.value.replace(/\D/g, "").slice(0, 6))}
          />
          <SifreAlani
            label="Yeni şifre"
            autoComplete="new-password"
            placeholder="En az 6 karakter"
            value={yeniSifre}
            onChange={(e) => setYeniSifre(e.target.value)}
          />
          <SifreAlani
            label="Yeni şifre tekrar"
            autoComplete="new-password"
            value={yeniSifreTekrar}
            onChange={(e) => setYeniSifreTekrar(e.target.value)}
          />
          <Btn
            onClick={() => void sifreSifirla()}
            disabled={
              loading ||
              kod.length !== 6 ||
              yeniSifre.length < 6 ||
              !yeniSifreTekrar
            }
          >
            {loading ? "Kaydediliyor…" : "Şifreyi güncelle"}
          </Btn>
          <button
            type="button"
            onClick={() => void kodGonder()}
            disabled={loading || yenidenSn > 0}
            className="w-full text-sm text-amber-600 font-medium disabled:text-slate-400"
          >
            {yenidenSn > 0 ? `Kodu tekrar gönder (${yenidenSn}s)` : "Kodu tekrar gönder"}
          </button>
          <button
            type="button"
            onClick={() => {
              setAdim("telefon");
              setKod("");
              setError("");
            }}
            className="w-full text-sm text-slate-500 underline"
          >
            Telefonu değiştir
          </button>
        </div>
      )}

      {adim === "tamam" && (
        <div className="space-y-4">
          <Card className="border-emerald-200 bg-emerald-50">
            <p className="text-sm text-emerald-800 font-medium">
              Şifreniz güncellendi.
            </p>
          </Card>
          <Btn onClick={() => router.push("/cekici/giris")}>Giriş sayfasına git</Btn>
        </div>
      )}

      {adim !== "tamam" && (
        <p className="text-center text-sm text-slate-500 mt-8">
          <Link href="/cekici/giris" className="text-amber-600 font-medium">
            ← Giriş sayfası
          </Link>
        </p>
      )}
    </MobileShell>
  );
}
