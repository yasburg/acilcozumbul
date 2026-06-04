"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BrandLogoYazili } from "@/components/BrandLogo";
import { Btn, Field, SifreAlani, Card } from "@/components/ui";

type PanelGirisFormProps = {
  nextHref?: string;
  hataMesaji?: string;
};

export function PanelGirisForm({ nextHref = "/panel", hataMesaji }: PanelGirisFormProps) {
  const router = useRouter();
  const [eposta, setEposta] = useState("");
  const [sifre, setSifre] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function girisYap(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/panel/giris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ eposta: eposta.trim(), sifre }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Giriş başarısız."
        );
      }

      const hedef =
        nextHref.startsWith("/panel") && nextHref !== "/panel/giris"
          ? nextHref
          : "/panel";

      router.refresh();
      router.replace(hedef);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş başarısız.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-slate-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <BrandLogoYazili
            href="/"
            className="h-10 w-auto max-w-[220px] object-contain"
          />
          <h1 className="text-xl font-bold text-slate-900">Yönetim Paneli</h1>
          <p className="text-sm text-slate-500 text-center">
            Yönetici hesabınızla giriş yapın.
          </p>
        </div>

        {(hataMesaji || error) && (
          <Card className="border-red-200 bg-red-50 mb-4">
            <p className="text-red-700 text-sm">{hataMesaji || error}</p>
          </Card>
        )}

        <Card>
          <form onSubmit={(e) => void girisYap(e)} className="space-y-4">
            <Field
              label="E-posta"
              type="email"
              autoComplete="username"
              placeholder="admin@ornek.com"
              value={eposta}
              onChange={(e) => setEposta(e.target.value)}
              disabled={loading}
            />
            <SifreAlani
              label="Şifre"
              autoComplete="current-password"
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              disabled={loading}
            />
            <Btn type="submit" disabled={loading} className="w-full">
              {loading ? "Giriş yapılıyor…" : "Panele giriş"}
            </Btn>
          </form>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-6">
          <Link href="/cekici/giris" className="text-amber-600 font-medium">
            Çekici üye girişi →
          </Link>
        </p>
      </div>
    </div>
  );
}
