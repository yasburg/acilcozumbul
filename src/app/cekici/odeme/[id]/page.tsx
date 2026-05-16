"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { Btn, Field, Card } from "@/components/ui";

export default function OdemePage() {
  const params = useParams();
  const router = useRouter();
  const odemeId = params.id as string;

  const [miktar, setMiktar] = useState(0);
  const [tutar, setTutar] = useState(0);
  const [kartNo, setKartNo] = useState("");
  const [sonKullanma, setSonKullanma] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/cekici/me").then((r) => {
      if (!r.ok) router.push("/cekici/giris");
    });
    const stored = sessionStorage.getItem(`odeme-${odemeId}`);
    if (stored) {
      const d = JSON.parse(stored);
      setMiktar(d.miktar);
      setTutar(d.tutar);
    }
  }, [odemeId, router]);

  async function odemeYap(e: React.FormEvent) {
    e.preventDefault();
    if (!kartNo || !sonKullanma || !cvv) {
      setError("Kart bilgilerini doldurun.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/cekici/odeme/${odemeId}/tamamla`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      sessionStorage.removeItem(`odeme-${odemeId}`);
      router.push(
        `/cekici/panel?tab=hesabim&mesaj=kredi-eklendi&eklenen=${data.eklenenKredi}`
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ödeme başarısız.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <MobileShell showBrand={false} subtitle="Güvenli Ödeme — Sanal POS (Demo)">
      <div className="rounded-t-2xl bg-gradient-to-r from-slate-800 to-slate-700 text-white p-4 mb-6 -mx-4 mt-2">
        <p className="text-xs opacity-80">acilcozumbul.com</p>
        <p className="font-semibold">Banka Sanal POS</p>
        <p className="text-2xl font-bold mt-2">{tutar || "—"} ₺</p>
        {miktar > 0 && (
          <p className="text-sm opacity-90">{miktar} kredi satın alımı</p>
        )}
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </Card>
      )}

      <form onSubmit={odemeYap} className="space-y-4">
        <Field
          label="Kart Numarası"
          placeholder="4242 4242 4242 4242"
          value={kartNo}
          onChange={(e) => setKartNo(e.target.value)}
          inputMode="numeric"
        />
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Son Kullanma"
            placeholder="12/28"
            value={sonKullanma}
            onChange={(e) => setSonKullanma(e.target.value)}
          />
          <Field
            label="CVV"
            placeholder="123"
            type="password"
            maxLength={4}
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}
          />
        </div>

        <Card className="bg-emerald-50 border-emerald-200">
          <p className="text-xs text-emerald-800">
            🔒 Demo ortamı — gerçek ödeme alınmaz. &quot;Ödeme Yap&quot; sonrası
            uygulamaya dönersiniz.
          </p>
        </Card>

        <Btn type="submit" disabled={loading}>
          {loading ? "İşleniyor…" : "Ödeme Yap"}
        </Btn>
      </form>
    </MobileShell>
  );
}
