"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { CekiciRotaPanel } from "@/components/CekiciRotaPanel";
import { koordinatGecerli } from "@/lib/koordinat";
import { useKazananKonumPaylas } from "@/hooks/useKazananKonumPaylas";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MobileShell } from "@/components/MobileShell";
import { Btn, Card, Field } from "@/components/ui";
import { cekiciFetch } from "@/lib/cekici-fetch";
import { DemoHeaderBadge } from "@/components/DemoHeaderBadge";
import { OnayliCekiciRozeti } from "@/components/OnayliCekiciRozeti";
import { useKisiselVeriGizle } from "@/hooks/useKisiselVeriGizle";
import {
  adGoster,
  adresGoster,
  soyadGoster,
  telefonGoster,
} from "@/lib/kisisel-veri-gizle";
import { posthogOlayBirKez, posthogOlayYakala } from "@/lib/posthog-client";

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
  onizleme?: {
    bolge: string;
    sorunOzet: string;
    hedefBolge?: string;
    aracModeli?: string;
  };
  teklifUcretsiz?: boolean;
  erisimYok?: boolean;
  kredi?: number;
  benimTeklif?: {
    fiyat: number;
    ilkFiyat?: number;
    tahminiSureDk: number;
    mesaj?: string;
  };
  teklifSayisi?: number;
  ihaleBitis?: string;
  ad?: string;
  soyad?: string;
  telefon?: string;
  konum?: { adres?: string; lat: number; lng: number };
  hedefKonum?: { adres?: string; lat: number; lng: number };
  sorun?: string;
  aracModeli?: string;
  fotografUrls?: string[];
  onayliCekici?: boolean;
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
  const [demoAktif, setDemoAktif] = useState(false);

  const [fiyat, setFiyat] = useState("");
  const [sure, setSure] = useState("30");
  const [mesaj, setMesaj] = useState("");
  const demoTalep = id.startsWith("demo-");
  const { seviye: gizlilik } = useKisiselVeriGizle(demoAktif || demoTalep);

  const yukle = useCallback(async () => {
    setError("");
    try {
      const smsLinki = Boolean(token);
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
        // SMS linki = giriş adımı (panel şifre girişi olmadan)
        posthogOlayBirKez(`acil_ph_cekici_giris_sms_${id}`, "cekici_giris", {
          rol: "cekici",
          yontem: "sms_link",
          talep_id: id,
        });
      }

      const [meRes, talepRes, demoRes] = await Promise.all([
        cekiciFetch("/api/cekici/me"),
        cekiciFetch(`/api/cekici/talep/${id}`),
        cekiciFetch("/api/cekici/demo-durum"),
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

      const talepData = (await talepRes.json()) as TalepDurum;
      setTalep(talepData);

      // Panel katıl veya SMS: ihaleye erişim açıldığında
      const ihalede =
        !talepData.erisimYok &&
        (Boolean(talepData.onizleme) ||
          Boolean(talepData.teklifVerdim) ||
          Boolean(talepData.kazandim));
      if (ihalede) {
        posthogOlayBirKez(
          `acil_ph_cekici_ihaleye_katil_${id}`,
          "cekici_ihaleye_katil",
          {
            rol: "cekici",
            talep_id: id,
            kaynak: smsLinki ? "sms" : "panel",
            demo: id.startsWith("demo-"),
          }
        );
      }

      if (demoRes.ok) {
        const d = await demoRes.json();
        setDemoAktif(!!d.aktif);
      } else {
        setDemoAktif(false);
      }
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
      posthogOlayYakala("cekici_teklif_ver", {
        rol: "cekici",
        talep_id: id,
        fiyat: fiyatNum,
        tahmini_sure_dk: Number(sure) || 30,
        kaynak: token ? "sms" : "panel",
        demo: demoTalep || demoAktif,
      });
      await yukle();
    } catch {
      setError("Teklif gönderilemedi.");
    } finally {
      setIslem(false);
    }
  }

  const telefonHref =
    gizlilik === "yok" && talep?.telefon
      ? `tel:${talep.telefon.replace(/\s/g, "")}`
      : "#";

  const teklifVerebilir =
    talep &&
    talep.ihaleAcik &&
    !talep.kazandim &&
    !talep.teklifVerdim &&
    !talep.tercihEdilmedi &&
    !talep.ihaleKapandi &&
    !talep.erisimYok &&
    talep.onizleme;

  const musteriKoordinat = useMemo(() => {
    if (!talep?.konum || !koordinatGecerli(talep.konum)) return null;
    return { lat: talep.konum.lat, lng: talep.konum.lng };
  }, [talep?.konum?.lat, talep?.konum?.lng]);

  const hedefKoordinat = useMemo(() => {
    if (!talep?.hedefKonum || !koordinatGecerli(talep.hedefKonum)) return null;
    return { lat: talep.hedefKonum.lat, lng: talep.hedefKonum.lng };
  }, [talep?.hedefKonum?.lat, talep?.hedefKonum?.lng]);

  const rotaSureGoster =
    !!musteriKoordinat &&
    (teklifVerebilir || (talep?.teklifVerdim && talep.ihaleAcik && !talep.kazandim));

  const toplamSureAyarla = useCallback((dk: number) => {
    setSure(String(Math.max(5, dk)));
  }, []);

  useKazananKonumPaylas(id, !!talep?.kazandim);

  return (
    <MobileShell
      showBrand={false}
      backHref="/cekici/panel"
      subtitle={
        cekici
          ? `Hoş geldin, ${adGoster(cekici.ad, gizlilik)}`
          : "Çekici Paneli"
      }
      headerBadge={demoAktif ? <DemoHeaderBadge /> : undefined}
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
              {rotaSureGoster && musteriKoordinat && talep.ihaleAcik && (
                <CekiciRotaPanel
                  key={`rota-bekle-${id}`}
                  musteriKonum={musteriKoordinat}
                  hedefKonum={hedefKoordinat}
                  compact
                />
              )}
              <Card className="border-amber-200 bg-amber-50">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <p className="text-xs text-amber-700 uppercase tracking-wide">
                    Teklifiniz
                  </p>
                  {talep.onayliCekici && <OnayliCekiciRozeti kucuk />}
                </div>
                <p className="text-2xl font-bold text-amber-600">
                  {talep.benimTeklif.fiyat} TL
                </p>
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
                <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                  Teklif fiyatı değiştirilemez.
                </p>
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
                {talep.onizleme!.aracModeli && (
                  <p className="text-sm text-slate-700 mt-2">
                    🚗 {talep.onizleme!.aracModeli}
                  </p>
                )}
                {talep.fotografUrls && talep.fotografUrls.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {talep.fotografUrls.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-lg overflow-hidden border border-slate-200"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt="Arıza fotoğrafı"
                          className="w-full max-h-40 object-cover"
                        />
                      </a>
                    ))}
                  </div>
                )}
                <p className="text-xs text-slate-500 mt-3 border-t border-slate-100 pt-3">
                  Tam adres ve harita, ihaleyi kazandığınızda görünür.
                </p>
              </Card>
              {rotaSureGoster && musteriKoordinat && (
                <CekiciRotaPanel
                  key={`rota-teklif-${id}`}
                  musteriKonum={musteriKoordinat}
                  hedefKonum={hedefKoordinat}
                  onToplamSure={toplamSureAyarla}
                />
              )}
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

          {talep.erisimYok && (
            <Card className="border-amber-200 bg-amber-50 text-center py-6">
              <p className="font-semibold text-amber-900">Talep görüntülenemiyor</p>
              <p className="text-sm text-amber-800 mt-2 leading-relaxed">
                {talep.mesaj ??
                  "Bu talep size SMS ile bildirilmedi. Panelde yalnızca bildirim aldığınız talepler görünür."}
              </p>
              <Link
                href="/cekici/kredi"
                className="inline-block mt-4 text-sm font-semibold text-amber-700 underline"
              >
                Kredi yükle
              </Link>
            </Card>
          )}

          {talep.kazandim && (
            <>
              <Card>
                <p className="text-xs text-emerald-600 uppercase tracking-wide mb-3">
                  Kazandınız — Müşteri Bilgileri
                </p>
                <p className="text-lg font-bold mb-1 text-slate-900">
                  {adGoster(talep.ad, gizlilik)}{" "}
                  {soyadGoster(talep.soyad, gizlilik)}
                </p>
                <p className="text-amber-600 font-mono text-lg mb-3">
                  {telefonGoster(talep.telefon, gizlilik)}
                </p>
                <p className="text-sm text-slate-600 mb-1">
                  📍 Arıza: {adresGoster(talep.konum?.adres, gizlilik)}
                </p>
                {talep.hedefKonum && (
                  <p className="text-sm text-amber-700 mb-2">
                    → Hedef: {adresGoster(talep.hedefKonum.adres, gizlilik)}
                  </p>
                )}
                <p className="text-sm text-slate-500 border-t border-slate-100 pt-3 mt-3">
                  {talep.sorun}
                </p>
                {talep.aracModeli && (
                  <p className="text-sm text-slate-700 mt-2">
                    🚗 {talep.aracModeli}
                  </p>
                )}
                {talep.fotografUrls && talep.fotografUrls.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-slate-500">Arıza fotoğrafı</p>
                    {talep.fotografUrls.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-lg overflow-hidden border border-slate-200"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt="Arıza fotoğrafı"
                          className="w-full max-h-48 object-cover"
                        />
                      </a>
                    ))}
                  </div>
                )}
                {talep.benimTeklif && (
                  <p className="text-sm font-semibold text-emerald-700 mt-3">
                    Teklifiniz: {talep.benimTeklif.fiyat} TL
                  </p>
                )}
              </Card>
              {gizlilik !== "yok" ? (
                <Btn variant="success" disabled>
                  📞 {gizlilik === "tam" ? "Telefon gizli" : "Telefon maskeli"}
                </Btn>
              ) : (
                <a href={telefonHref}>
                  <Btn variant="success">📞 Müşteriye Ara</Btn>
                </a>
              )}
              {musteriKoordinat && (
                <CekiciRotaPanel
                  key={`rota-${id}`}
                  musteriKonum={musteriKoordinat}
                  hedefKonum={hedefKoordinat}
                  haritaButonu
                />
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
