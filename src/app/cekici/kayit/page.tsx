"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MobileShell } from "@/components/MobileShell";
import { Btn, Field, SifreAlani, Card } from "@/components/ui";
import { KayitKontenjanBilgi } from "@/components/KayitKontenjanBilgi";
import { cekiciFetch } from "@/lib/cekici-fetch";
import { DESTEKLENEN_ILLER } from "@/lib/il-ilce";
import { YasalOnayKutusu } from "@/components/yasal/YasalOnayKutusu";
import { YasalSiteFooter } from "@/components/yasal/YasalSiteFooter";
function KayitIcerik() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const onizlemeRaw = searchParams.get("onizleme");
  const onizlemeGercekKayit =
    process.env.NODE_ENV === "development" && onizlemeRaw
      ? Number.parseInt(onizlemeRaw, 10)
      : undefined;
  const [form, setForm] = useState({
    ad: "",
    telefon: "",
    sehir: "İstanbul",
    sifre: "",
    sifreTekrar: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [yasalOnay, setYasalOnay] = useState(false);

  const formGonderilebilir = !loading && yasalOnay;

  async function kayitOl(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!yasalOnay) {
      setError("Kayıt için yasal metinleri onaylayın.");
      return;
    }

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
    <MobileShell
      subtitle="Hizmet veren kaydı — acilcozumbul.com"
      backHref="/cekici/giris"
      footer={<YasalSiteFooter />}
    >
      <KayitKontenjanBilgi
        onizlemeGercekKayit={
          Number.isFinite(onizlemeGercekKayit) ? onizlemeGercekKayit : undefined
        }
      />

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
          <span className="text-sm font-medium text-slate-700">İl</span>
          <select
            value={form.sehir}
            onChange={(e) => setForm((f) => ({ ...f, sehir: e.target.value }))}
            className="w-full rounded-xl bg-white border border-slate-200 px-4 py-3.5 text-slate-900"
          >
            {DESTEKLENEN_ILLER.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <SifreAlani
          label="Şifre"
          placeholder="En az 6 karakter"
          autoComplete="new-password"
          value={form.sifre}
          onChange={(e) => setForm((f) => ({ ...f, sifre: e.target.value }))}
        />
        <SifreAlani
          label="Şifre Tekrar"
          autoComplete="new-password"
          value={form.sifreTekrar}
          onChange={(e) => setForm((f) => ({ ...f, sifreTekrar: e.target.value }))}
        />

        <YasalOnayKutusu
          checked={yasalOnay}
          onChange={setYasalOnay}
          rol="hizmet-veren"
        />

        <p className="text-xs text-slate-500">
          Kayıt ücretsizdir. Kredi yükleyerek bölgenizdeki talep SMS bildirimlerini
          alırsınız (1 kredi = 1 bildirim ve panelde talep görünürlüğü). Teklif
          vermek ücretsizdir.
        </p>

        <Btn type="submit" disabled={!formGonderilebilir}>
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

export default function CekiciKayitPage() {
  return (
    <Suspense
      fallback={
        <MobileShell subtitle="Hizmet veren kaydı" backHref="/cekici/giris">
          <p className="text-center text-slate-500 py-12">Yükleniyor…</p>
        </MobileShell>
      }
    >
      <KayitIcerik />
    </Suspense>
  );
}
