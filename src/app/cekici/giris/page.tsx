"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MobileShell } from "@/components/MobileShell";
import { Btn, Field, Card } from "@/components/ui";

const DEMO_HESAPLAR = [
  { ad: "Ahmet Yılmaz", telefon: "05321112233", sifre: "123456" },
  { ad: "Mehmet Demir", telefon: "05334445566", sifre: "123456" },
];

export default function CekiciGirisPage() {
  const router = useRouter();
  const [telefon, setTelefon] = useState("");
  const [sifre, setSifre] = useState("");
  const [token, setToken] = useState("");
  const [smsMod, setSmsMod] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function giris(opts?: { telefon?: string; sifre?: string; token?: string }) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/cekici/giris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telefon: opts?.telefon ?? telefon,
          sifre: opts?.sifre ?? sifre,
          token: opts?.token ?? (smsMod ? token : undefined),
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      router.push("/cekici/panel");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Giriş başarısız.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <MobileShell subtitle="Çekici girişi">
      {error && (
        <Card className="border-red-200 bg-red-50 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </Card>
      )}

      <div className="space-y-4">
        {!smsMod ? (
          <>
            <Field
              label="Telefon"
              type="tel"
              placeholder="05XX XXX XX XX"
              value={telefon}
              onChange={(e) => setTelefon(e.target.value)}
            />
            <Field
              label="Şifre"
              type="password"
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
            />
            <Btn onClick={() => giris()} disabled={loading}>
              {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
            </Btn>
            <button
              type="button"
              onClick={() => setSmsMod(true)}
              className="w-full text-sm text-slate-500 underline"
            >
              SMS linki ile giriş
            </button>
          </>
        ) : (
          <>
            <Field
              label="SMS linkindeki token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <Btn onClick={() => giris()} disabled={loading || !token}>
              Token ile Giriş
            </Btn>
            <button
              type="button"
              onClick={() => setSmsMod(false)}
              className="w-full text-sm text-slate-500 underline"
            >
              Telefon ile giriş
            </button>
          </>
        )}

        <p className="text-xs text-slate-500 text-center">Demo hesaplar</p>
        <div className="space-y-2">
          {DEMO_HESAPLAR.map((d) => (
            <button
              key={d.telefon}
              type="button"
              onClick={() => giris({ telefon: d.telefon, sifre: d.sifre })}
              disabled={loading}
              className="w-full text-left rounded-xl bg-white border border-slate-200 px-4 py-3 hover:border-amber-300 text-sm"
            >
              {d.ad}
            </button>
          ))}
        </div>
      </div>

      <p className="text-center text-sm text-slate-500 mt-6">
        Hesabınız yok mu?{" "}
        <Link href="/cekici/kayit" className="text-amber-600 font-medium">
          Kayıt olun
        </Link>
      </p>
    </MobileShell>
  );
}
