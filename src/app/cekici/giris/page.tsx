"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MobileShell } from "@/components/MobileShell";
import { Btn, Field, Card } from "@/components/ui";
import { cekiciFetch } from "@/lib/cekici-fetch";

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
      const res = await cekiciFetch("/api/cekici/giris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telefon: opts?.telefon ?? telefon,
          sifre: opts?.sifre ?? sifre,
          token: opts?.token ?? (smsMod ? token : undefined),
        }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof d.error === "string" ? d.error : "Giriş başarısız."
        );
      }
      router.refresh();
      router.push("/cekici/panel");
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

  return (
    <MobileShell subtitle="Çekici girişi">
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
