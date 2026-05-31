"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Btn, Card, Field } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

function GirisForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hataParam = searchParams.get("hata");
  const next = searchParams.get("next") || "/panel";

  const [eposta, setEposta] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  const yapilandirmaHata =
    hataParam === "supabase-yok"
      ? "Supabase anahtarları tanımlı değil (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)."
      : hataParam === "yetkisiz"
        ? "Bu hesabın panele erişim yetkisi yok."
        : "";

  async function giris(e: React.FormEvent) {
    e.preventDefault();
    setHata("");
    setYukleniyor(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: eposta.trim(),
        password: sifre,
      });
      if (error) {
        setHata(
          error.message === "Invalid login credentials"
            ? "E-posta veya şifre hatalı."
            : error.message
        );
        return;
      }
      router.replace(next.startsWith("/panel") ? next : "/panel");
      router.refresh();
    } catch {
      setHata("Giriş yapılamadı.");
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <div className="min-h-dvh bg-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-xl font-bold text-slate-900">Yönetim paneli</h1>
        <p className="text-sm text-slate-500 mt-1">
          Supabase hesabınızla giriş yapın.
        </p>

        {(yapilandirmaHata || hata) && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
            {yapilandirmaHata || hata}
          </div>
        )}

        <form onSubmit={giris} className="mt-6 space-y-4">
          <Field
            label="E-posta"
            type="email"
            autoComplete="email"
            value={eposta}
            onChange={(e) => setEposta(e.target.value)}
            required
          />
          <Field
            label="Şifre"
            type="password"
            autoComplete="current-password"
            value={sifre}
            onChange={(e) => setSifre(e.target.value)}
            required
          />
          <Btn type="submit" disabled={yukleniyor}>
            {yukleniyor ? "Giriş…" : "Giriş yap"}
          </Btn>
        </form>

        <p className="text-xs text-slate-500 mt-6 leading-relaxed">
          İlk kurulum: Supabase → Authentication → Users → kullanıcı oluşturun.
          İsteğe bağlı{" "}
          <code className="text-[11px]">PANEL_ADMIN_EMAILS</code> ile sadece
          belirli e-postalara izin verin.
        </p>

        <Link href="/" className="text-sm text-amber-600 mt-4 inline-block">
          ← Ana sayfa
        </Link>
      </Card>
    </div>
  );
}

export default function PanelGirisPage() {
  return (
    <Suspense
      fallback={
        <p className="text-center text-slate-500 py-12">Yükleniyor…</p>
      }
    >
      <GirisForm />
    </Suspense>
  );
}
