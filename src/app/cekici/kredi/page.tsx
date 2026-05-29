"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { Btn, Card } from "@/components/ui";
import { formatKredi } from "@/lib/talep-utils";

export default function KrediPage() {
  const router = useRouter();
  const [kredi, setKredi] = useState(0);
  const [miktar, setMiktar] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/cekici/me")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setKredi(d.kredi))
      .catch(() => router.push("/cekici/giris"));
  }, [router]);

  async function odemeyeGit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/cekici/odeme/baslat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ miktar }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      sessionStorage.setItem(
        `odeme-${data.odemeId}`,
        JSON.stringify({ miktar: data.miktar, tutar: data.tutar })
      );
      router.push(`/cekici/odeme/${data.odemeId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "İşlem başarısız.");
    } finally {
      setLoading(false);
    }
  }

  const tutar = miktar * 50;

  return (
    <MobileShell backHref="/cekici/panel?tab=hesabim" subtitle="Kredi satın al">
      <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 mb-6 flex justify-between items-center">
        <span className="text-sm text-slate-600">Mevcut kredi</span>
        <span className="text-2xl font-bold text-amber-600">{formatKredi(kredi)}</span>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </Card>
      )}

      <div className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">
            Kaç kredi almak istiyorsunuz?
          </span>
          <input
            type="range"
            min={1}
            max={50}
            value={miktar}
            onChange={(e) => setMiktar(Number(e.target.value))}
            className="w-full accent-amber-500"
          />
          <div className="flex justify-between text-sm">
            <span className="text-amber-600 font-bold text-2xl">{miktar} kredi</span>
            <span className="text-slate-500">{tutar} ₺</span>
          </div>
        </label>

        <p className="text-xs text-slate-500">
          1 kredi = 1 talep SMS bildirimi · 50 ₺ · Teklif vermek ücretsiz
        </p>

        <Card className="bg-slate-50">
          <p className="text-sm text-slate-600">
            Ödeme için güvenli sanal POS sayfasına yönlendirileceksiniz. İşlem
            sonrası otomatik olarak uygulamaya dönersiniz.
          </p>
        </Card>

        <Btn onClick={odemeyeGit} disabled={loading}>
          {loading ? "Yönlendiriliyor…" : `💳 ${tutar} ₺ — Ödemeye Git`}
        </Btn>
      </div>
    </MobileShell>
  );
}
