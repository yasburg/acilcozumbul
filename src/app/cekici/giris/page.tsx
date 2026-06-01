"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MobileShell } from "@/components/MobileShell";
import { Btn, Field, Card } from "@/components/ui";
import { cekiciFetch } from "@/lib/cekici-fetch";
import { createClient } from "@/lib/supabase/client";

function epostaGibiMi(deger: string): boolean {
  return deger.includes("@");
}

function GirisIcerik() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [telefon, setTelefon] = useState("");
  const [sifre, setSifre] = useState("");
  const [token, setToken] = useState("");
  const [smsMod, setSmsMod] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const panelNext = searchParams.get("next") || "/panel";
  const hataParam = searchParams.get("hata");
  const yapilandirmaHata =
    hataParam === "supabase-yok"
      ? "Supabase anahtarları tanımlı değil."
      : hataParam === "yetkisiz"
        ? "Bu e-postanın panele erişim yetkisi yok."
        : "";

  useEffect(() => {
    if (searchParams.get("eposta") === "1") {
      setTelefon((v) => (v.includes("@") ? v : ""));
    }
  }, [searchParams]);

  async function yoneticiGiris(eposta: string, sifreDeger: string) {
    const supabase = createClient();
    const { error: authErr } = await supabase.auth.signInWithPassword({
      email: eposta.trim(),
      password: sifreDeger,
    });
    if (authErr) {
      throw new Error(
        authErr.message === "Invalid login credentials"
          ? "E-posta veya şifre hatalı."
          : authErr.message
      );
    }

    const oturum = await fetch("/api/panel/oturum", { credentials: "include" });
    const data = await oturum.json();
    if (!data.yetkili) {
      await supabase.auth.signOut();
      throw new Error("Bu hesabın yönetim paneline erişim yetkisi yok.");
    }

    router.refresh();
    const hedef =
      panelNext.startsWith("/panel") && panelNext !== "/panel/giris"
        ? panelNext
        : "/panel";
    router.push(hedef);
  }

  async function uyeGiris(opts?: {
    telefon?: string;
    sifre?: string;
    token?: string;
  }) {
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
      throw new Error(typeof d.error === "string" ? d.error : "Giriş başarısız.");
    }
    router.refresh();
    router.push("/cekici/panel");
  }

  async function girisOturumAc() {
    setLoading(true);
    setError("");
    const kimlik = telefon.trim();
    try {
      if (epostaGibiMi(kimlik)) {
        await yoneticiGiris(kimlik, sifre);
        return;
      }
      await uyeGiris();
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
    <MobileShell subtitle="Üye girişi — çekici, lastikçi, anahtarcı">
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

      {(yapilandirmaHata || error) && (
        <Card className="border-red-200 bg-red-50 mb-4">
          <p className="text-red-700 text-sm">{yapilandirmaHata || error}</p>
        </Card>
      )}

      <div className="space-y-4">
        <p className="text-sm text-slate-600 leading-relaxed">
          Üye hesabı için telefon numaranızı, yönetim paneli için yetkili
          e-postanızı ve şifrenizi girin.
        </p>

        {!smsMod ? (
          <>
            <Field
              label="Telefon veya e-posta"
              type="text"
              autoComplete="username"
              placeholder="05XX XXX XX XX veya ornek@mail.com"
              value={telefon}
              onChange={(e) => setTelefon(e.target.value)}
            />
            <Field
              label="Şifre"
              type="password"
              autoComplete="current-password"
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
            />
            <Btn onClick={() => void girisOturumAc()} disabled={loading}>
              {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
            </Btn>
            <button
              type="button"
              onClick={() => setSmsMod(true)}
              className="w-full text-sm text-slate-500 underline"
            >
              SMS linki ile giriş (üye)
            </button>
          </>
        ) : (
          <>
            <Field
              label="SMS linkindeki token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <Btn
              onClick={() => void uyeGiris()}
              disabled={loading || !token}
            >
              Token ile Giriş
            </Btn>
            <button
              type="button"
              onClick={() => setSmsMod(false)}
              className="w-full text-sm text-slate-500 underline"
            >
              Telefon / e-posta ile giriş
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
