"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MobileShell } from "@/components/MobileShell";
import { Btn, Field, SifreAlani, Card } from "@/components/ui";
import { epostaGecerliMi } from "@/lib/eposta";
import { cekiciFetch } from "@/lib/cekici-fetch";
import { TELEFON_ORNEK_GIRISLERI } from "@/lib/telefon";
import { posthogOlayYakala } from "@/lib/posthog-client";

function epostaGibiMi(deger: string): boolean {
  return deger.includes("@");
}

function GirisIcerik() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [telefon, setTelefon] = useState("");
  const [sifre, setSifre] = useState("");
  const [otp, setOtp] = useState("");
  const [otpMod, setOtpMod] = useState(false);
  const [otpAsama, setOtpAsama] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [yenidenSn, setYenidenSn] = useState(0);
  const [bilgiBanner, setBilgiBanner] = useState("");
  const [beniAnimsa, setBeniAnimsa] = useState(true);

  useEffect(() => {
    if (searchParams.get("eposta") !== "1") return;
    const params = new URLSearchParams();
    const next = searchParams.get("next");
    const hata = searchParams.get("hata");
    if (next) params.set("next", next);
    if (hata) params.set("hata", hata);
    const q = params.toString();
    router.replace(q ? `/panel?${q}` : "/panel");
  }, [searchParams, router]);

  useEffect(() => {
    const tel = searchParams.get("telefon")?.trim();
    if (tel) setTelefon(tel);
    if (searchParams.get("otp") === "1") setOtpMod(true);
    if (searchParams.get("mesaj") === "zaten-kayitli") {
      setBilgiBanner(
        "Telefonunuz zaten kayıtlı, giriş yapabilirsiniz."
      );
    }
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get("eposta") === "1") return;
    if (searchParams.get("mesaj") === "hesap-silindi") return;
    if (searchParams.get("mesaj") === "zaten-kayitli") return;
    void cekiciFetch("/api/cekici/me").then((res) => {
      if (res.ok) router.replace("/cekici/panel");
    });
  }, [router, searchParams]);

  useEffect(() => {
    if (yenidenSn <= 0) return;
    const t = setTimeout(() => setYenidenSn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [yenidenSn]);

  async function uyeGiris(kimlik: string, sifreDeger: string) {
    const epostaIle = epostaGecerliMi(kimlik);
    const res = await cekiciFetch("/api/cekici/giris", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        epostaIle
          ? { eposta: kimlik.trim(), sifre: sifreDeger, beniAnimsa }
          : { telefon: kimlik.trim(), sifre: sifreDeger, beniAnimsa }
      ),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(typeof d.error === "string" ? d.error : "Giriş başarısız.");
    }
    posthogOlayYakala("cekici_giris", {
      rol: "cekici",
      yontem: epostaIle ? "eposta" : "telefon",
    });
    router.refresh();
    router.push("/cekici/panel");
  }

  async function otpKodGonder() {
    setLoading(true);
    setError("");
    setMesaj("");
    try {
      const res = await cekiciFetch("/api/cekici/giris/otp/gonder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefon: telefon.trim() }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok && !d.kodBekliyor) {
        throw new Error(typeof d.error === "string" ? d.error : "Kod gönderilemedi.");
      }
      setOtpAsama(true);
      setYenidenSn(Number(d.yenidenGonderSn) || 60);
      setMesaj(typeof d.mesaj === "string" ? d.mesaj : "Kod gönderildi.");
      if (d.gelistirmeKodu) {
        setMesaj((m) => `${m} (geliştirme: ${d.gelistirmeKodu})`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kod gönderilemedi.");
    } finally {
      setLoading(false);
    }
  }

  async function otpIleGiris() {
    setLoading(true);
    setError("");
    try {
      const res = await cekiciFetch("/api/cekici/giris/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telefon: telefon.trim(),
          otpKod: otp.trim(),
          beniAnimsa,
        }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof d.error === "string" ? d.error : "Giriş başarısız.");
      }
      posthogOlayYakala("cekici_giris", { rol: "cekici", yontem: "otp" });
      router.refresh();
      router.push(
        typeof d.yonlendir === "string" ? d.yonlendir : "/cekici/panel"
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Giriş başarısız.");
    } finally {
      setLoading(false);
    }
  }

  async function girisOturumAc() {
    setLoading(true);
    setError("");
    const kimlik = telefon.trim();
    try {
      await uyeGiris(kimlik, sifre);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Giriş başarısız.";
      if (msg === "Failed to fetch" || msg.includes("NetworkError")) {
        setError(
          "Sunucuya ulaşılamadı. Telefonda https://10.55.33.167:3000 adresini kullanın (http değil)."
        );
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  if (searchParams.get("eposta") === "1") {
    return (
      <MobileShell subtitle="Yönlendiriliyor…">
        <p className="text-center text-slate-500 py-12">Panele yönlendiriliyor…</p>
      </MobileShell>
    );
  }

  return (
    <MobileShell subtitle="Üye girişi">
      {searchParams.get("mesaj") === "hesap-silindi" && (
        <Card className="border-emerald-200 bg-emerald-50 mb-4">
          <p className="text-emerald-800 text-sm">
            Hesabınız silindi. Yeniden kayıt olarak devam edebilirsiniz.
          </p>
        </Card>
      )}

      {bilgiBanner && (
        <Card className="border-amber-200 bg-amber-50 mb-4">
          <p className="text-amber-950 text-sm font-medium">{bilgiBanner}</p>
        </Card>
      )}

      {typeof window !== "undefined" &&
        window.location.protocol === "http:" &&
        !window.location.hostname.includes("localhost") && (
          <Card className="border-amber-200 bg-amber-50 mb-4">
            <p className="text-amber-900 text-sm">
              Bu sayfa <strong>http</strong> ile açılmış. Giriş için{" "}
              <strong>https://10.55.33.167:3000</strong> kullanın (
              <code className="text-xs">npm run dev:lan:https</code>).
            </p>
          </Card>
        )}

      {error && (
        <Card className="border-red-200 bg-red-50 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </Card>
      )}

      <div className="space-y-4">
        <div className="flex rounded-xl border border-slate-200 p-1 bg-slate-50">
          <button
            type="button"
            className={`flex-1 rounded-lg py-2 text-sm font-medium ${
              !otpMod ? "bg-white shadow text-slate-900" : "text-slate-600"
            }`}
            onClick={() => {
              setOtpMod(false);
              setOtpAsama(false);
              setError("");
            }}
          >
            Şifre ile
          </button>
          <button
            type="button"
            className={`flex-1 rounded-lg py-2 text-sm font-medium ${
              otpMod ? "bg-white shadow text-slate-900" : "text-slate-600"
            }`}
            onClick={() => {
              setOtpMod(true);
              setError("");
            }}
          >
            SMS kodu ile
          </button>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          {otpMod
            ? "Telefonunuza gelen kod ile giriş yapın. Şifresiz kayıt olan hesaplar için bu yolu kullanın."
            : "Üye hesabı için telefon numaranızı ve şifrenizi girin. Kredi ödemesinde doğruladığınız fatura e-postası ile de giriş yapabilirsiniz."}
        </p>
        {!otpMod && (
          <p className="text-xs text-slate-500 leading-relaxed">
            Kabul edilen telefon girişleri:{" "}
            {TELEFON_ORNEK_GIRISLERI.map((ornek, i) => (
              <span key={ornek}>
                {i > 0 && ", "}
                <span className="font-mono text-slate-600">{ornek}</span>
              </span>
            ))}
          </p>
        )}

        <Field
          label={otpMod ? "Telefon" : "Telefon veya e-posta"}
          type="text"
          autoComplete="username"
          placeholder={
            otpMod ? "05XX XXX XX XX" : "05XX XXX XX XX veya ornek@mail.com"
          }
          value={telefon}
          onChange={(e) => setTelefon(e.target.value)}
        />

        <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer select-none">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
            checked={beniAnimsa}
            onChange={(e) => setBeniAnimsa(e.target.checked)}
          />
          <span>Beni bu cihazda anımsa</span>
        </label>

        {!otpMod ? (
          <>
            <SifreAlani
              label="Şifre"
              autoComplete="current-password"
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
            />
            <div className="flex justify-end">
              <Link
                href="/cekici/sifremi-unuttum"
                className="text-sm text-amber-600 font-medium"
              >
                Şifremi unuttum
              </Link>
            </div>
            <Btn onClick={() => void girisOturumAc()} disabled={loading}>
              {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
            </Btn>
          </>
        ) : !otpAsama ? (
          <Btn
            onClick={() => void otpKodGonder()}
            disabled={loading || telefon.trim().length < 10}
          >
            {loading ? "Gönderiliyor…" : "SMS kodu gönder"}
          </Btn>
        ) : (
          <>
            <Field
              label="SMS kodu"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
            />
            {mesaj && <p className="text-sm text-emerald-700">{mesaj}</p>}
            <Btn
              onClick={() => void otpIleGiris()}
              disabled={loading || otp.length !== 6}
            >
              {loading ? "Doğrulanıyor…" : "Kod ile giriş yap"}
            </Btn>
            <button
              type="button"
              className="text-sm text-amber-700 font-medium disabled:opacity-40"
              disabled={yenidenSn > 0 || loading}
              onClick={() => void otpKodGonder()}
            >
              {yenidenSn > 0
                ? `Tekrar gönder (${yenidenSn})`
                : "Kodu tekrar gönder"}
            </button>
          </>
        )}
      </div>

      <p className="text-center text-sm text-slate-500 mt-6">
        Hesabınız yok mu?{" "}
        <Link href="/kayit/b" className="text-amber-600 font-medium">
          Kayıt olun
        </Link>
      </p>

      <p className="text-center mt-6">
        <Link href="/" className="text-sm text-slate-500">
          ← Müşteri ana sayfa
        </Link>
      </p>
    </MobileShell>
  );
}

export default function CekiciGirisPage() {
  return (
    <Suspense
      fallback={
        <MobileShell subtitle="Giriş">
          <p className="text-center text-slate-500 py-12">Yükleniyor…</p>
        </MobileShell>
      }
    >
      <GirisIcerik />
    </Suspense>
  );
}
