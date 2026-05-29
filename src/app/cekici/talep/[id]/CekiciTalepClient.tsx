"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MobileShell } from "@/components/MobileShell";
import { Btn, Card, Field } from "@/components/ui";
import { cekiciFetch } from "@/lib/cekici-fetch";

interface TalepDurum {
  id: string;
  durum: string;
  kazandim?: boolean;
  teklifVerdim?: boolean;
  ihaleAcik?: boolean;
  ihaleKapandi?: boolean;
  kaybettim?: boolean;
  tercihEdilmedi?: boolean;
  mesaj?: string;
  onizleme?: { bolge: string; sorunOzet: string; hedefBolge?: string };
  teklifUcretsiz?: boolean;
  kredi?: number;
  benimTeklif?: {
    fiyat: number;
    ilkFiyat?: number;
    fiyatDegisti?: boolean;
    tahminiSureDk: number;
    mesaj?: string;
  };
  fiyatDegisti?: boolean;
  fiyatDegistiUyari?: string;
  teklifSayisi?: number;
  ihaleBitis?: string;
  ad?: string;
  soyad?: string;
  telefon?: string;
  konum?: { adres: string; lat: number; lng: number };
  hedefKonum?: { adres: string; lat: number; lng: number };
  sorun?: string;
}

export default function CekiciTalepClient() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const token = searchParams.get("t");

  const [talep, setTalep] = useState<TalepDurum | null>(null);
  const [cekici, setCekici] = useState<{ ad: string; kredi: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [islem, setIslem] = useState(false);
  const [error, setError] = useState("");
  const [teklifGonderildi, setTeklifGonderildi] = useState(false);

  const [fiyat, setFiyat] = useState("");
  const [sure, setSure] = useState("30");
  const [mesaj, setMesaj] = useState("");
  const [fiyatGuncelle, setFiyatGuncelle] = useState(false);
  const [yeniFiyat, setYeniFiyat] = useState("");

  const yukle = useCallback(async () => {
    setError("");
    try {
      if (token) {
        const authRes = await cekiciFetch("/api/cekici/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        if (!authRes.ok) {
          setError("SMS linki geçersiz veya süresi dolmuş.");
          setLoading(false);
          return;
        }
      }

      const [meRes, talepRes] = await Promise.all([
        cekiciFetch("/api/cekici/me"),
        cekiciFetch(`/api/cekici/talep/${id}`),
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

  async function fiyatGuncelleGonder() {
    const fiyatNum = Number(yeniFiyat);
    if (!fiyatNum || fiyatNum < 100) {
      setError("Geçerli bir fiyat girin (min. 100 TL).");
      return;
    }
    setIslem(true);
    setError("");
    try {
      const res = await cekiciFetch(`/api/cekici/talep/${id}/teklif`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fiyat: fiyatNum }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.uyari) setError(data.uyari);
      setFiyatGuncelle(false);
      await yukle();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fiyat güncellenemedi.");
    } finally {
      setIslem(false);
    }
  }

  async function teklifVer() {
    const fiyatNum = Number(fiyat);
    if (!fiyatNum || fiyatNum < 100) {
      setError("Geçerli bir fiyat girin (min. 100 TL).");
      return;
    }

    setIslem(true);
    setError("");
    try {
      const res = await cekiciFetch(`/api/cekici/talep/${id}/teklif`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fiyat: fiyatNum,
          tahminiSureDk: Number(sure) || 30,
          mesaj: mesaj.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Teklif gönderilemedi.");
        if (data.tercihEdilmedi) {
          setTalep((t) =>
            t ? { ...t, tercihEdilmedi: true, onizleme: undefined, mesaj: data.error } : t
          );
        }
        return;
      }
      if (cekici && data.kredi != null) setCekici({ ...cekici, kredi: data.kredi });
      setTeklifGonderildi(true);
      setFiyatGuncelle(false);
      await yukle();
    } catch {
      setError("Teklif gönderilemedi.");
    } finally {
      setIslem(false);
    }
  }

  const telefonHref = talep?.telefon
    ? `tel:${talep.telefon.replace(/\s/g, "")}`
    : "#";

  const teklifVerebilir =
    talep &&
    talep.ihaleAcik &&
    !talep.kazandim &&
    !talep.teklifVerdim &&
    !talep.tercihEdilmedi &&
    !talep.ihaleKapandi &&
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

      {teklifGonderildi && talep?.teklifVerdim && (
        <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
          <p className="text-sm font-semibold text-emerald-800">✅ Teklifiniz alındı!</p>
          <p className="text-xs text-emerald-700 mt-1">
            Teklif vermek ücretsiz — müşteri seçim yapana kadar bekleyin.
          </p>
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
                Bu talebe tekrar teklif veremezsiniz.
              </p>
            </Card>
          )}

          {talep.ihaleKapandi && !talep.kazandim && (
            <Card className="border-slate-200 bg-slate-50 text-center py-6">
              <p className="text-4xl mb-3">{talep.kaybettim ? "📤" : "🔒"}</p>
              <p className="font-semibold text-slate-800">
                {talep.kaybettim ? "Teklifiniz seçilmedi" : "İhale kapandı"}
              </p>
              <p className="text-sm text-slate-500 mt-2">
                {talep.mesaj ?? "Müşteri başka bir çekiciyi seçti."}
              </p>
            </Card>
          )}

          {talep.teklifVerdim && talep.benimTeklif && !talep.kazandim && (
            <>
              {talep.fiyatDegisti && (
                <Card className="border-red-200 bg-red-50">
                  <p className="text-sm font-semibold text-red-800">
                    ⚠️ Fiyat değişikliği uyarısı
                  </p>
                  <p className="text-xs text-red-700 mt-2 leading-relaxed">
                    {talep.fiyatDegistiUyari ??
                      "Teklif fiyatını değiştirdiniz. Müşteri bu teklifle sizi seçemez."}
                  </p>
                </Card>
              )}
              <Card className="border-amber-200 bg-amber-50">
                <p className="text-xs text-amber-700 uppercase tracking-wide mb-2">
                  Teklifiniz
                </p>
                <p className="text-2xl font-bold text-amber-600">
                  {talep.benimTeklif.fiyat} TL
                </p>
                {talep.benimTeklif.ilkFiyat != null &&
                  talep.benimTeklif.ilkFiyat !== talep.benimTeklif.fiyat && (
                    <p className="text-xs text-red-600 mt-1">
                      İlk fiyat: {talep.benimTeklif.ilkFiyat} TL
                    </p>
                  )}
                <p className="text-sm text-slate-600 mt-1">
                  Tahmini ~{talep.benimTeklif.tahminiSureDk} dk
                </p>
                <p className="text-xs text-slate-500 mt-3">
                  Müşteri seçim yapana kadar bekleyin.
                </p>
                {talep.teklifSayisi != null && (
                  <p className="text-xs text-amber-700 mt-2">
                    Toplam {talep.teklifSayisi} aktif teklif
                  </p>
                )}
                {!fiyatGuncelle ? (
                  <button
                    type="button"
                    onClick={() => {
                      setYeniFiyat(String(talep.benimTeklif!.fiyat));
                      setFiyatGuncelle(true);
                    }}
                    className="text-xs text-amber-800 underline mt-3"
                  >
                    Fiyatı güncelle (müşteri seçemez)
                  </button>
                ) : (
                  <div className="mt-3 space-y-2 border-t border-amber-200 pt-3">
                    <Field
                      label="Yeni fiyat (TL)"
                      type="number"
                      value={yeniFiyat}
                      onChange={(e) => setYeniFiyat(e.target.value)}
                    />
                    <Btn onClick={fiyatGuncelleGonder} disabled={islem} className="!py-2 text-sm">
                      Fiyatı kaydet
                    </Btn>
                    <button
                      type="button"
                      onClick={() => setFiyatGuncelle(false)}
                      className="text-xs text-slate-500 w-full text-center"
                    >
                      İptal
                    </button>
                  </div>
                )}
              </Card>
            </>
          )}

          {teklifVerebilir && (
            <>
              <Card>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">
                  Talep özeti
                </p>
                <p className="font-medium mb-1 text-slate-900">
                  📍 {talep.onizleme!.bolge}
                </p>
                {talep.onizleme!.hedefBolge && (
                  <p className="text-sm text-amber-700 mb-2">
                    → {talep.onizleme!.hedefBolge}
                  </p>
                )}
                <p className="text-sm text-slate-600">{talep.onizleme!.sorunOzet}</p>
              </Card>
              <p className="text-sm text-emerald-700 text-center font-medium">
                Teklif vermek ücretsizdir.
              </p>
              <Field
                label="Fiyat (TL)"
                type="number"
                placeholder="1500"
                value={fiyat}
                onChange={(e) => setFiyat(e.target.value)}
              />
              <Field
                label="Tahmini süre (dk)"
                type="number"
                value={sure}
                onChange={(e) => setSure(e.target.value)}
              />
              <Field
                label="Mesaj (isteğe bağlı)"
                placeholder="Hemen yola çıkabilirim"
                value={mesaj}
                onChange={(e) => setMesaj(e.target.value)}
              />
              <Btn onClick={teklifVer} disabled={islem}>
                {islem ? "Gönderiliyor…" : "Teklif Ver (Ücretsiz)"}
              </Btn>
            </>
          )}

          {talep.kazandim && (
            <>
              <Card>
                <p className="text-xs text-emerald-600 uppercase tracking-wide mb-3">
                  Kazandınız — Müşteri Bilgileri
                </p>
                <p className="text-lg font-bold mb-1 text-slate-900">
                  {talep.ad} {talep.soyad}
                </p>
                <p className="text-amber-600 font-mono text-lg mb-3">
                  {talep.telefon}
                </p>
                <p className="text-sm text-slate-600 mb-1">
                  📍 Arıza: {talep.konum?.adres}
                </p>
                {talep.hedefKonum && (
                  <p className="text-sm text-amber-700 mb-2">
                    → Hedef: {talep.hedefKonum.adres}
                  </p>
                )}
                <p className="text-sm text-slate-500 border-t border-slate-100 pt-3 mt-3">
                  {talep.sorun}
                </p>
                {talep.benimTeklif && (
                  <p className="text-sm font-semibold text-emerald-700 mt-3">
                    Teklifiniz: {talep.benimTeklif.fiyat} TL
                  </p>
                )}
              </Card>
              <a href={telefonHref}>
                <Btn variant="success">📞 Müşteriye Ara</Btn>
              </a>
              {talep.konum && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=${talep.konum.lat},${talep.konum.lng}&destination=${talep.hedefKonum?.lat ?? talep.konum.lat},${talep.hedefKonum?.lng ?? talep.konum.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Btn variant="secondary">Rota — Haritada Aç</Btn>
                </a>
              )}
            </>
          )}

          <Link href="/cekici/kredi">
            <Btn variant="outline">Kredi Satın Al</Btn>
          </Link>
        </div>
      )}
    </MobileShell>
  );
}
