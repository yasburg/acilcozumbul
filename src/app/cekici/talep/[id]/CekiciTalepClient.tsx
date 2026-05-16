"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MobileShell } from "@/components/MobileShell";
import { Btn, Card } from "@/components/ui";

interface TalepOnizleme {
  id: string;
  durum: string;
  satinAlindi: boolean;
  baskaSatinAldi?: boolean;
  tercihEdilmedi?: boolean;
  mesaj?: string;
  onizleme?: { bolge: string; sorunOzet: string };
  krediMaliyet?: number;
  kredi?: number;
  ad?: string;
  soyad?: string;
  telefon?: string;
  konum?: { adres: string; lat: number; lng: number };
  sorun?: string;
}

export default function CekiciTalepClient() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const token = searchParams.get("t");

  const [talep, setTalep] = useState<TalepOnizleme | null>(null);
  const [cekici, setCekici] = useState<{ ad: string; kredi: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [islem, setIslem] = useState(false);
  const [error, setError] = useState("");
  const [musteriAlindi, setMusteriAlindi] = useState(false);

  const yukle = useCallback(async () => {
    setError("");
    try {
      if (token) {
        await fetch("/api/cekici/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
      }

      const [meRes, talepRes] = await Promise.all([
        fetch("/api/cekici/me"),
        fetch(`/api/cekici/talep/${id}`),
      ]);

      if (!meRes.ok) {
        setError("Giriş yapılamadı. SMS linkini kullanın.");
        setLoading(false);
        return;
      }

      const me = await meRes.json();
      setCekici({ ad: me.ad, kredi: me.kredi });

      if (!talepRes.ok) {
        const err = await talepRes.json();
        setError(err.error || "Talep yüklenemedi.");
        setLoading(false);
        return;
      }

      setTalep(await talepRes.json());
    } catch {
      setError("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    yukle();
    const interval = setInterval(yukle, 4000);
    return () => clearInterval(interval);
  }, [yukle]);

  async function satinAl() {
    setIslem(true);
    setError("");
    try {
      const res = await fetch(`/api/cekici/talep/${id}/satin-al`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "İşlem başarısız.");
        if (data.tercihEdilmedi) {
          setTalep((t) =>
            t
              ? {
                  ...t,
                  tercihEdilmedi: true,
                  baskaSatinAldi: false,
                  onizleme: undefined,
                  mesaj: "Müşteri sizi tercih etmedi.",
                }
              : t
          );
        }
        return;
      }
      setTalep({
        id,
        durum: "satın_alındı",
        satinAlindi: true,
        ad: data.ad,
        soyad: data.soyad,
        telefon: data.telefon,
        konum: data.konum,
        sorun: data.sorun,
      });
      if (cekici) setCekici({ ...cekici, kredi: data.kredi ?? cekici.kredi - 1 });
      setMusteriAlindi(true);
      setTimeout(() => {
        router.push("/cekici/panel?tab=musteriler&mesaj=musteri-alindi");
      }, 1500);
    } catch {
      setError("İşlem başarısız.");
    } finally {
      setIslem(false);
    }
  }

  const telefonHref = talep?.telefon
    ? `tel:${talep.telefon.replace(/\s/g, "")}`
    : "#";

  const satınAlinabilir =
    talep &&
    !talep.satinAlindi &&
    !talep.baskaSatinAldi &&
    !talep.tercihEdilmedi &&
    talep.onizleme;

  return (
    <MobileShell
      showBrand={false}
      backHref="/cekici/panel"
      subtitle={cekici ? `Hoş geldin, ${cekici.ad}` : "Çekici Paneli"}
    >
      {loading && (
        <p className="text-center text-slate-500 py-12">Yükleniyor…</p>
      )}

      {musteriAlindi && (
        <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
          <p className="text-sm font-semibold text-emerald-800">✅ Müşteri alındı!</p>
          <p className="text-xs text-emerald-700 mt-1">Panele yönlendiriliyorsunuz…</p>
        </div>
      )}

      {error && !loading && (
        <Card className="border-red-200 bg-red-50 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </Card>
      )}

      {talep && !loading && (
        <div className="space-y-4">
          {cekici && (
            <div className="flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
              <span className="text-sm text-amber-800">Krediniz</span>
              <span className="text-xl font-bold text-amber-600">{cekici.kredi}</span>
            </div>
          )}

          {talep.tercihEdilmedi && (
            <Card className="border-slate-200 bg-slate-50 text-center py-6">
              <p className="text-4xl mb-3">😔</p>
              <p className="font-semibold text-slate-800">Müşteri sizi tercih etmedi</p>
              <p className="text-sm text-slate-500 mt-2">
                Müşteri yeni çekici aradı. Bu talebi tekrar satın alamazsınız.
              </p>
            </Card>
          )}

          {talep.baskaSatinAldi && !talep.satinAlindi && (
            <Card className="border-slate-200 bg-slate-50 text-center py-6">
              <p className="text-4xl mb-3">🔒</p>
              <p className="font-semibold text-slate-800">Müşteri satın alındı</p>
              <p className="text-sm text-slate-500 mt-2">
                {talep.mesaj ??
                  "Bu müşteri başka bir çekici tarafından alındı. Bilgilere yalnızca satın alan çekici ulaşabilir."}
              </p>
            </Card>
          )}

          {satınAlinabilir && (
            <>
              <Card>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">
                  Önizleme (kısıtlı)
                </p>
                <p className="font-medium mb-2 text-slate-900">
                  📍 {talep.onizleme!.bolge}
                </p>
                <p className="text-sm text-slate-600">{talep.onizleme!.sorunOzet}</p>
              </Card>
              <p className="text-sm text-slate-500 text-center">
                Müşteri bilgilerini görmek için{" "}
                <strong className="text-amber-600">1 kredi</strong> harcanır.
              </p>
              {(cekici?.kredi ?? 0) < 1 ? (
                <Link href="/cekici/kredi">
                  <Btn variant="primary">Kredi Satın Al</Btn>
                </Link>
              ) : (
                <Btn onClick={satinAl} disabled={islem}>
                  {islem ? "İşleniyor…" : "Müşteriye Satın Al (1 Kredi)"}
                </Btn>
              )}
            </>
          )}

          {talep.satinAlindi && (
            <>
              <Card>
                <p className="text-xs text-emerald-600 uppercase tracking-wide mb-3">
                  Müşteri Bilgileri
                </p>
                <p className="text-lg font-bold mb-1 text-slate-900">
                  {talep.ad} {talep.soyad}
                </p>
                <p className="text-amber-600 font-mono text-lg mb-3">
                  {talep.telefon}
                </p>
                <p className="text-sm text-slate-600 mb-2">
                  📍 {talep.konum?.adres}
                </p>
                <p className="text-sm text-slate-500 border-t border-slate-100 pt-3 mt-3">
                  {talep.sorun}
                </p>
              </Card>
              <a href={telefonHref}>
                <Btn variant="success">📞 Müşteriye Ara</Btn>
              </a>
              {talep.konum && (
                <a
                  href={`https://www.google.com/maps?q=${talep.konum.lat},${talep.konum.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Btn variant="secondary">Haritada Aç</Btn>
                </a>
              )}
            </>
          )}

          {!talep.satinAlindi && (
            <Link href="/cekici/kredi">
              <Btn variant="outline">Kredi Satın Al</Btn>
            </Link>
          )}
        </div>
      )}
    </MobileShell>
  );
}
