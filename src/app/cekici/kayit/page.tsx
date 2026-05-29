"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MobileShell } from "@/components/MobileShell";
import { Btn, Field, Card } from "@/components/ui";
import { cekiciFetch } from "@/lib/cekici-fetch";

const SEHIRLER = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana"];

export default function CekiciKayitPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    ad: "",
    telefon: "",
    sehir: "İstanbul",
    sifre: "",
    sifreTekrar: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function kayitOl(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.sifre !== form.sifreTekrar) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);
    try {
      const res = await cekiciFetch("/api/cekici/kayit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ad: form.ad,
          telefon: form.telefon,
          sehir: form.sehir,
          sifre: form.sifre,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.refresh();
      router.push("/cekici/panel?mesaj=kayit-basarili");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kayıt başarısız.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <MobileShell subtitle="Çekici kaydı — acilcozumbul.com">
      {error && (
        <Card className="border-red-200 bg-red-50 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </Card>
      )}

      <form onSubmit={kayitOl} className="space-y-4">
        <Field
          label="Ad Soyad"
          placeholder="Ahmet Yılmaz"
          value={form.ad}
          onChange={(e) => setForm((f) => ({ ...f, ad: e.target.value }))}
        />
        <Field
          label="Telefon"
          type="tel"
          placeholder="05XX XXX XX XX"
          value={form.telefon}
          onChange={(e) => setForm((f) => ({ ...f, telefon: e.target.value }))}
        />
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Şehir</span>
          <select
            value={form.sehir}
            onChange={(e) => setForm((f) => ({ ...f, sehir: e.target.value }))}
            className="w-full rounded-xl bg-white border border-slate-200 px-4 py-3.5 text-slate-900"
          >
            {SEHIRLER.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <Field
          label="Şifre"
          type="password"
          placeholder="En az 6 karakter"
          value={form.sifre}
          onChange={(e) => setForm((f) => ({ ...f, sifre: e.target.value }))}
        />
        <Field
          label="Şifre Tekrar"
          type="password"
          value={form.sifreTekrar}
          onChange={(e) => setForm((f) => ({ ...f, sifreTekrar: e.target.value }))}
        />

        <p className="text-xs text-slate-500">
          Kayıt ücretsizdir. Kredi yükleyerek bölgenizdeki talep SMS bildirimlerini
          alırsınız (1 kredi = 1 bildirim). Teklif vermek ücretsizdir.
        </p>

        <Btn type="submit" disabled={loading}>
          {loading ? "Kayıt yapılıyor…" : "Kayıt Ol"}
        </Btn>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Hesabınız var mı?{" "}
        <Link href="/cekici/giris" className="text-amber-600 font-medium">
          Giriş yapın
        </Link>
      </p>
    </MobileShell>
  );
}
