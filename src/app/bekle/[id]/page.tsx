"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { DemoHeaderBadge } from "@/components/DemoHeaderBadge";
import { Btn, Card } from "@/components/ui";
import { MemnuniyetFormu } from "@/components/MemnuniyetFormu";
import { PuanGostergesi } from "@/components/PuanGostergesi";
import { OnayliCekiciRozeti } from "@/components/OnayliCekiciRozeti";
import { teklifleriSirala } from "@/lib/teklif-siralama";
import { IhaleBekleAnimasyon } from "@/components/IhaleBekleAnimasyon";
import { MusteriCekiciTakipHarita } from "@/components/MusteriCekiciTakipHarita";
import { BekleHedefDegistir } from "@/components/BekleHedefDegistir";
import { koordinatGecerli } from "@/lib/koordinat";
import { sorunHedefKonumGerekliMi } from "@/lib/sorun-tipleri";
import {
  musteriBildirimIzniIste,
  musteriYeniTeklifBildir,
} from "@/lib/musteri-bildirim";
import { adSoyadSatirGoster } from "@/lib/kisisel-veri-gizle";
import { posthogOlayYakala } from "@/lib/posthog-client";
import { musteriFunnelOlay } from "@/lib/musteri-funnel";
import { metaPixelLead } from "@/lib/meta-pixel";
import { tiktokPixelLead } from "@/lib/tiktok-pixel";

type Durum =
  | "ihale_bekliyor"
  | "teklif_sec"
  | "cekici_bulundu"
  | "anlasma_bekliyor"
  | "anlasildi"
  | "yeniden_araniyor";

interface TeklifOzet {
  id: string;
  cekiciAd: string;
  fiyat: number;
  ilkFiyat: number;
  fiyatDegisti: boolean;
  secilebilir: boolean;
  tahminiSureDk: number;
  gelisSureDk?: number;
  cekmeSureDk?: number | null;
  mesaj?: string;
  tarih?: string;
  tercihPuani: number | null;
  tercihYuzde: number | null;
  hizmetPuani: number | null;
  hizmetDegerlendirmeAdet?: number;
  fiyatGarantiPuani: number;
  fiyatGarantiYuzde: number;
  onayliCekici?: boolean;
  profilFotoUrl?: string | null;
}

/** Teklifin ne kadar önce geldiği (küçük etiket) */
function teklifNeKadarOnce(tarih: string | undefined, simdiMs: number): string | null {
  if (!tarih) return null;
  const t = new Date(tarih).getTime();
  if (Number.isNaN(t)) return null;
  const sn = Math.max(0, Math.floor((simdiMs - t) / 1000));
  if (sn < 45) return "Az önce";
  const dk = Math.floor(sn / 60);
  if (dk < 60) return `${dk} dk önce`;
  const sa = Math.floor(dk / 60);
  if (sa < 24) return `${sa} sa önce`;
  return `${Math.floor(sa / 24)} g önce`;
}

const demoHeaderBadge = <DemoHeaderBadge />;

interface MemnuniyetState {
  degerlendirildi: boolean;
  formAcik: boolean;
  beklemede: boolean;
  kalanMs: number;
  puan?: number;
  puanGenel?: number;
  puanFiyat?: number;
  puanSure?: number;
}

export default function BeklePage() {
  return (
    <Suspense
      fallback={
        <MobileShell>
          <p className="text-center text-slate-500 py-12">Yükleniyor…</p>
        </MobileShell>
      }
    >
      <BekleIcerik />
    </Suspense>
  );
}

function BekleIcerik() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const demoParam = searchParams.get("demo");
  const [demoHazir, setDemoHazir] = useState(!demoParam);
  const [headerYukseklik, setHeaderYukseklik] = useState(78);
  const [durum, setDurum] = useState<Durum>("ihale_bekliyor");
  const [teklifler, setTeklifler] = useState<TeklifOzet[]>([]);
  const [simdiMs, setSimdiMs] = useState(() => Date.now());
  const [cekiciAd, setCekiciAd] = useState<string | null>(null);
  const [cekiciProfilFotoUrl, setCekiciProfilFotoUrl] = useState<string | null>(
    null
  );
  const [kazananFiyat, setKazananFiyat] = useState<number | null>(null);
  const [islem, setIslem] = useState(false);
  const [mesaj, setMesaj] = useState("");
  const [ihaleBitis, setIhaleBitis] = useState<string | null>(null);
  const [memnuniyet, setMemnuniyet] = useState<MemnuniyetState | null>(null);
  const [memnuniyetYenile, setMemnuniyetYenile] = useState(0);
  const [operatorSayisi, setOperatorSayisi] = useState(0);
  const [animasyonBitti, setAnimasyonBitti] = useState(false);
  const [sorunTipi, setSorunTipi] = useState<string | null>(null);
  const [musteriKonum, setMusteriKonum] = useState<{
    lat: number;
    lng: number;
    adres: string;
  } | null>(null);
  const [hedefKonum, setHedefKonum] = useState<{
    lat: number;
    lng: number;
    adres: string;
  } | null>(null);
  const [hedefDegistirildi, setHedefDegistirildi] = useState(false);
  const [hedefBilinmiyor, setHedefBilinmiyor] = useState(false);
  const oncekiTeklifSayisi = useRef(0);
  const ilkTeklifKontrol = useRef(true);
  const teklifAlindiKaydedildi = useRef(false);
  const anlasildiRef = useRef(false);

  function musteriFunnelProps(extra?: Record<string, unknown>) {
    return {
      talep_id: id,
      ...(sorunTipi ? { sorun_tipi: sorunTipi } : {}),
      ...extra,
    };
  }
  const demoTalep = id.startsWith("demo-");
  const gizlilik = demoTalep ? "yari" : "yok";
  const cekiciAdGoster = adSoyadSatirGoster(cekiciAd, gizlilik);
  const [teklifBanner, setTeklifBanner] = useState<string | null>(null);

  useEffect(() => {
    if (!teklifBanner) return;
    const t = setTimeout(() => setTeklifBanner(null), 8000);
    return () => clearTimeout(t);
  }, [teklifBanner]);

  useEffect(() => {
    if (teklifler.length === 0) return;
    const t = setInterval(() => setSimdiMs(Date.now()), 30_000);
    return () => clearInterval(t);
  }, [teklifler.length]);

  useEffect(() => {
    if (!demoParam) {
      setDemoHazir(true);
      return;
    }
    let iptal = false;
    void fetch("/api/demo/oturum-bagla", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id: demoParam }),
    })
      .catch(() => null)
      .finally(() => {
        if (!iptal) setDemoHazir(true);
      });
    return () => {
      iptal = true;
    };
  }, [demoParam]);

  useEffect(() => {
    const el = document.getElementById("app-shell-header");
    if (!el) return;
    const guncelle = () =>
      setHeaderYukseklik(Math.ceil(el.getBoundingClientRect().height));
    guncelle();
    const ro = new ResizeObserver(guncelle);
    ro.observe(el);
    return () => ro.disconnect();
  }, [durum, demoTalep, teklifBanner]);

  function gelenTeklifBanner() {
    if (!teklifBanner) return null;
    return (
      <div
        role="status"
        className="mb-3 rounded-xl bg-amber-500 px-3 py-2.5 text-center text-sm font-semibold text-white shadow-sm"
      >
        <button
          type="button"
          className="w-full"
          onClick={() => setTeklifBanner(null)}
        >
          {teklifBanner}
        </button>
      </div>
    );
  }

  useEffect(() => {
    try {
      const kayitli = sessionStorage.getItem(`acil_bekle_${id}`);
      if (kayitli != null) setOperatorSayisi(Number(kayitli) || 0);
    } catch {
      /* ignore */
    }
    void musteriBildirimIzniIste();
  }, [id]);

  /* Müşteri formu tamamlandı → Lead (formda da ateşlenir; çift sayım yok) */
  useEffect(() => {
    if (demoTalep || demoParam) return;
    let sorun: string | null = null;
    let telefon: string | null = null;
    try {
      if (sessionStorage.getItem(`acil_meta_lead_${id}`) === "1") return;
      sessionStorage.setItem(`acil_meta_lead_${id}`, "1");
      sorun = sessionStorage.getItem(`acil_bekle_sorun_${id}`);
      telefon = sessionStorage.getItem(`acil_bekle_tel_${id}`);
    } catch {
      /* private mode — yine de dene */
    }
    void metaPixelLead({
      content_name: sorun || "musteri_talep",
      phone: telefon,
      externalId: id,
    });
    void tiktokPixelLead({ content_name: sorun || "musteri_talep" });
  }, [id, demoTalep, demoParam]);

  useEffect(() => {
    if (!demoHazir) return;

    let aktif = true;
    let zamanlayici: ReturnType<typeof setTimeout> | undefined;

    const planla = (ms: number) => {
      if (!aktif) return;
      zamanlayici = setTimeout(() => void kontrol(), ms);
    };

    const kontrol = async () => {
      if (!aktif) return;
      try {
        const durumRes = await fetch(`/api/talep/${id}`);
        if (!durumRes.ok) {
          planla(8000);
          return;
        }
        const data = await durumRes.json();

        if (data.bildirilenSayisi != null) {
          setOperatorSayisi(data.bildirilenSayisi);
        }
        if (typeof data.sorunTipi === "string" && data.sorunTipi) {
          setSorunTipi(data.sorunTipi);
        }
                        if (data.konum) {
                          setMusteriKonum((prev) => {
                            const k = data.konum as {
                              lat: number;
                              lng: number;
                              adres: string;
                            };
                            if (
                              prev &&
                              Math.abs(prev.lat - k.lat) < 1e-7 &&
                              Math.abs(prev.lng - k.lng) < 1e-7 &&
                              prev.adres === k.adres
                            ) {
                              return prev;
                            }
                            return k;
                          });
                        }
                        if (data.hedefKonum) {
                          setHedefKonum((prev) => {
                            const k = data.hedefKonum as {
                              lat: number;
                              lng: number;
                              adres: string;
                            };
                            if (
                              prev &&
                              Math.abs(prev.lat - k.lat) < 1e-7 &&
                              Math.abs(prev.lng - k.lng) < 1e-7 &&
                              prev.adres === k.adres
                            ) {
                              return prev;
                            }
                            return k;
                          });
                        }
        if (typeof data.hedefKonumDegistirildi === "boolean") {
          setHedefDegistirildi(data.hedefKonumDegistirildi);
        }
        if (typeof data.hedefBilinmiyor === "boolean") {
          setHedefBilinmiyor(data.hedefBilinmiyor);
        }

        if (data.tamamlandi) {
          anlasildiRef.current = true;
          setDurum("anlasildi");
          setCekiciAd(data.cekiciAd ?? null);
          setCekiciProfilFotoUrl(
            typeof data.cekiciProfilFotoUrl === "string"
              ? data.cekiciProfilFotoUrl
              : null
          );
          if (data.memnuniyet) setMemnuniyet(data.memnuniyet);
          planla(30_000);
          return;
        }

        if (data.yenidenAranıyor) {
          anlasildiRef.current = false;
          setCekiciAd(null);
          setCekiciProfilFotoUrl(null);
          setTeklifBanner(null);
          const teklifRes = await fetch(`/api/talep/${id}/teklifler`);
          if (teklifRes.ok) {
            const teklifData = await teklifRes.json();
            const liste = teklifData.teklifler ?? [];
            setTeklifler(liste);
            setIhaleBitis(teklifData.ihaleBitis ?? null);
            if (typeof teklifData.hedefBilinmiyor === "boolean") {
              setHedefBilinmiyor(teklifData.hedefBilinmiyor);
            }
            if (liste.length > 0) {
              setAnimasyonBitti(true);
              setDurum("teklif_sec");
              oncekiTeklifSayisi.current = liste.length;
              planla(4000);
              return;
            }
          }
          setTeklifler([]);
          setAnimasyonBitti(false);
          oncekiTeklifSayisi.current = 0;
          ilkTeklifKontrol.current = true;
          teklifAlindiKaydedildi.current = false;
          setDurum("yeniden_araniyor");
          planla(4000);
          return;
        }

        if (data.kazananSecildi && data.anlasmaBekliyor && !anlasildiRef.current) {
          setDurum("anlasma_bekliyor");
          setCekiciAd(data.cekiciAd ?? "Çekici");
          setCekiciProfilFotoUrl(
            typeof data.cekiciProfilFotoUrl === "string"
              ? data.cekiciProfilFotoUrl
              : null
          );
          setKazananFiyat(data.kazananFiyat ?? null);
          planla(8000);
          return;
        }

        if (data.kazananSecildi) {
          setDurum("cekici_bulundu");
          setCekiciAd(data.cekiciAd ?? "Çekici");
          setCekiciProfilFotoUrl(
            typeof data.cekiciProfilFotoUrl === "string"
              ? data.cekiciProfilFotoUrl
              : null
          );
          planla(8000);
          return;
        }

        const teklifRes = await fetch(`/api/talep/${id}/teklifler`);
        if (teklifRes.ok) {
          const teklifData = await teklifRes.json();
          const yeniSayi = teklifData.teklifler?.length ?? 0;
          if (
            !ilkTeklifKontrol.current &&
            yeniSayi > oncekiTeklifSayisi.current &&
            yeniSayi > 0
          ) {
            const artis = yeniSayi - oncekiTeklifSayisi.current;
            const son = teklifData.teklifler[teklifData.teklifler.length - 1];
            if (son) {
              musteriYeniTeklifBildir(son.fiyat, son.cekiciAd);
            }
            setTeklifBanner(
              artis === 1 && yeniSayi === 1
                ? "Gelen teklifler — aşağıdan inceleyebilirsiniz."
                : `Yeni teklif geldi (${yeniSayi} teklif).`
            );
          }
          ilkTeklifKontrol.current = false;
          oncekiTeklifSayisi.current = yeniSayi;
          setTeklifler(teklifData.teklifler ?? []);
          setIhaleBitis(teklifData.ihaleBitis ?? null);
          if (typeof teklifData.hedefBilinmiyor === "boolean") {
            setHedefBilinmiyor(teklifData.hedefBilinmiyor);
          }
          if (yeniSayi > 0) {
            setAnimasyonBitti(true);
            setDurum("teklif_sec");
            if (!teklifAlindiKaydedildi.current) {
              teklifAlindiKaydedildi.current = true;
              posthogOlayYakala(
                "teklif_alindi",
                musteriFunnelProps({
                  teklif_sayisi: yeniSayi,
                  sorun_tipi:
                    typeof data.sorunTipi === "string" && data.sorunTipi
                      ? data.sorunTipi
                      : sorunTipi || undefined,
                })
              );
              musteriFunnelOlay(
                "offer_received",
                musteriFunnelProps({
                  teklif_sayisi: yeniSayi,
                  sorun_tipi:
                    typeof data.sorunTipi === "string" && data.sorunTipi
                      ? data.sorunTipi
                      : sorunTipi || undefined,
                })
              );
            }
          } else {
            setDurum("ihale_bekliyor");
          }
        }
        planla(4000);
      } catch {
        planla(8000);
      }
    };

    void kontrol();
    return () => {
      aktif = false;
      if (zamanlayici) clearTimeout(zamanlayici);
    };
  }, [id, memnuniyetYenile, demoHazir]);

  async function teklifSec(teklifId: string) {
    setIslem(true);
    setMesaj("");
    try {
      const res = await fetch(`/api/talep/${id}/teklif-sec`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teklifId }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fiyatDegisti) {
          setMesaj(data.error);
        }
        throw new Error(data.error);
      }
      setCekiciAd(data.cekiciAd);
      setCekiciProfilFotoUrl(
        typeof data.cekiciProfilFotoUrl === "string"
          ? data.cekiciProfilFotoUrl
          : null
      );
      setKazananFiyat(data.fiyat);
      setDurum("anlasma_bekliyor");
      setMesaj("Çekici seçildi. Kısa süre içinde sizi arayacak.");
      posthogOlayYakala(
        "teklif_secildi",
        musteriFunnelProps({
          teklif_id: teklifId,
          fiyat: data.fiyat,
        })
      );
      musteriFunnelOlay(
        "provider_selected",
        musteriFunnelProps({
          teklif_id: teklifId,
          fiyat: data.fiyat,
        })
      );
    } catch (e) {
      setMesaj(e instanceof Error ? e.message : "Seçim başarısız.");
    } finally {
      setIslem(false);
    }
  }

  async function anlasmaBildir(sonuc: "anlasti" | "anlasamadi") {
    setIslem(true);
    setMesaj("");
    try {
      const res = await fetch(`/api/talep/${id}/anlasma`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sonuc }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (sonuc === "anlasti") {
        anlasildiRef.current = true;
        setDurum("anlasildi");
        setMesaj("");
        posthogOlayYakala(
          "anlasma_onaylandi",
          musteriFunnelProps({ fiyat: kazananFiyat })
        );
      } else {
        anlasildiRef.current = false;
        setCekiciAd(null);
        setCekiciProfilFotoUrl(null);
        posthogOlayYakala("anlasma_reddedildi", musteriFunnelProps());

        const teklifRes = await fetch(`/api/talep/${id}/teklifler`);
        const teklifData = teklifRes.ok ? await teklifRes.json() : null;
        const kalan =
          typeof data.kalanTeklifSayisi === "number"
            ? data.kalanTeklifSayisi
            : (teklifData?.teklifler?.length ?? 0);

        if (data.tekliflereDon || kalan > 0) {
          setTeklifler(teklifData?.teklifler ?? []);
          setIhaleBitis(teklifData?.ihaleBitis ?? null);
          oncekiTeklifSayisi.current = kalan;
          setAnimasyonBitti(true);
          setDurum("teklif_sec");
          setTeklifBanner(
            data.mesaj ??
              "Önceki çekici ile anlaşılamadı. Diğer tekliflerden seçebilirsiniz."
          );
          setMesaj("");
        } else {
          setTeklifler([]);
          setAnimasyonBitti(false);
          oncekiTeklifSayisi.current = 0;
          ilkTeklifKontrol.current = true;
          teklifAlindiKaydedildi.current = false;
          setDurum("yeniden_araniyor");
          setMesaj(
            data.mesaj ?? "İhale yeniden açıldı. Yeni teklifler bekleniyor."
          );
        }
      }
    } catch (e) {
      setMesaj(e instanceof Error ? e.message : "İşlem başarısız.");
    } finally {
      setIslem(false);
    }
  }

  if (durum === "anlasma_bekliyor" || durum === "anlasildi") {
    const anlasildi = durum === "anlasildi";
    const takipKonum =
      musteriKonum && koordinatGecerli(musteriKonum) ? musteriKonum : null;
    const takipHedef =
      hedefKonum && koordinatGecerli(hedefKonum) ? hedefKonum : null;
    const formAcik =
      anlasildi && memnuniyet?.formAcik && !memnuniyet.degerlendirildi;
    const degerlendirildi = anlasildi && memnuniyet?.degerlendirildi;

    return (
      <MobileShell headerBadge={demoTalep ? demoHeaderBadge : undefined}>
        <div className="space-y-6 py-4">
          <div className="text-center">
            {cekiciProfilFotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cekiciProfilFotoUrl}
                alt=""
                className="size-20 rounded-full object-cover border-2 border-emerald-200 mx-auto mb-4 bg-slate-100"
              />
            ) : (
              <div className="text-5xl mb-4">{anlasildi ? "✅" : "🚛"}</div>
            )}
            <h2 className="text-xl font-bold text-slate-900">
              {anlasildi ? "Anlaşma sağlandı" : "Çekici Seçildi!"}
            </h2>
            <p className="text-slate-600 mt-2 text-sm">
              <strong>{cekiciAdGoster}</strong>
              {kazananFiyat != null && (
                <> · <span className="text-amber-600">{kazananFiyat} TL</span></>
              )}
              {!anlasildi && (
                <>
                  <br />
                  Sizi arayacak veya aradı. Anlaşma durumunuzu bildirin:
                </>
              )}
            </p>
          </div>

          {takipKonum && (
            <MusteriCekiciTakipHarita
              talepId={id}
              musteriKonum={takipKonum}
              hedefKonum={takipHedef}
            />
          )}

          {!anlasildi && mesaj && (
            <Card className="bg-amber-50 border-amber-200">
              <p className="text-sm text-amber-900">{mesaj}</p>
            </Card>
          )}

          {!anlasildi && (
            <>
              <Btn
                variant="success"
                onClick={() => anlasmaBildir("anlasti")}
                disabled={islem}
              >
                ✅ Çekici ile anlaştım
              </Btn>
              <Btn
                variant="danger"
                onClick={() => anlasmaBildir("anlasamadi")}
                disabled={islem}
              >
                ❌ Anlaşamadım — başka çekici ara
              </Btn>
            </>
          )}

          {anlasildi && (
            <>
              <Card className="bg-emerald-50 border-emerald-200">
                <p className="text-sm font-medium text-emerald-900">
                  {cekiciAdGoster} sizi birazdan arayacak.
                </p>
                <p className="text-xs text-emerald-800 mt-2 leading-relaxed">
                  Yoldayken çekiciyi yukarıdaki haritadan canlı takip
                  edebilirsiniz.
                </p>
              </Card>

              <Card className="bg-slate-50 border-slate-200">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Çekiciyi değerlendirmek ve sonraki müşterilere hizmet
                  kalitesini arttırmak için size{" "}
                  <strong>3 saat sonra</strong> gönderilecek değerlendirme
                  formunu doldurmanızı rica ederiz.
                </p>
              </Card>

              {degerlendirildi && (
                <Card className="bg-emerald-50 border-emerald-200 text-center py-4">
                  <p className="text-sm text-emerald-800 font-medium">
                    ✓ Değerlendirmeniz alındı, teşekkürler!
                  </p>
                </Card>
              )}

              {formAcik && (
                <MemnuniyetFormu
                  talepId={id}
                  cekiciAd={cekiciAdGoster || undefined}
                  sorunTipi={sorunTipi}
                  onTamamlandi={() => setMemnuniyetYenile((n) => n + 1)}
                />
              )}
            </>
          )}
        </div>
      </MobileShell>
    );
  }

  if (durum === "teklif_sec") {
    const fiyatlar = teklifler.map((t) => t.fiyat);
    const minFiyat = fiyatlar.length ? Math.min(...fiyatlar) : null;
    const maxFiyat = fiyatlar.length ? Math.max(...fiyatlar) : null;
    const fiyatOzet =
      minFiyat == null || maxFiyat == null
        ? null
        : minFiyat === maxFiyat
          ? `${minFiyat.toLocaleString("tr-TR")} TL`
          : `${minFiyat.toLocaleString("tr-TR")} – ${maxFiyat.toLocaleString("tr-TR")} TL`;

    return (
      <MobileShell headerBadge={demoTalep ? demoHeaderBadge : undefined}>
        <div className="space-y-4 py-2">
          {gelenTeklifBanner()}
          <div
            className="sticky z-[9] -mx-4 px-4 pt-1 pb-3 mb-1 bg-slate-50/95 backdrop-blur-md border-b border-slate-200/90 shadow-[0_4px_12px_-8px_rgba(15,23,42,0.25)]"
            style={{ top: headerYukseklik }}
          >
            <div className="text-center">
              <h2 className="text-xl font-bold text-slate-900">Gelen Teklifler</h2>
              <p className="text-slate-500 text-sm mt-1">
                Onaylı çekici teklifleri üstte listelenir
              </p>
              {teklifler.length > 0 && (
                <div className="mt-3 rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2.5">
                  <p className="text-sm font-semibold text-amber-950">
                    {teklifler.length} teklif
                    {fiyatOzet ? (
                      <span className="font-normal text-amber-900">
                        {" "}
                        · Fiyat aralığı:{" "}
                        <span className="font-semibold tabular-nums">{fiyatOzet}</span>
                      </span>
                    ) : null}
                  </p>
                </div>
              )}
            </div>
          </div>

          {mesaj && (
            <Card className="bg-amber-50 border-amber-200">
              <p className="text-sm text-amber-900">{mesaj}</p>
            </Card>
          )}

          <div className="space-y-3">
            {teklifleriSirala(teklifler).map((t) => {
              const geldiOnce = teklifNeKadarOnce(t.tarih, simdiMs);
              const gelisDk = t.gelisSureDk ?? t.tahminiSureDk;
              const cekmeDk = t.cekmeSureDk ?? null;
              return (
                <Card
                  key={t.id}
                  className={`border-slate-200 overflow-hidden ${
                    t.fiyatDegisti ? "border-red-200 bg-red-50/30" : ""
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <PuanGostergesi
                        label="Tercih puanı"
                        puan={t.tercihPuani}
                        yuzde={t.tercihYuzde}
                        yuzdeEtiket="müşteri tercihi"
                        variant="amber"
                      />
                      <PuanGostergesi
                        label="Hizmet puanı"
                        puan={t.hizmetPuani}
                        altMetin={
                          t.hizmetDegerlendirmeAdet
                            ? `${t.hizmetDegerlendirmeAdet} değerlendirme`
                            : undefined
                        }
                        variant="blue"
                      />
                      <PuanGostergesi
                        label="Fiyat garantisi"
                        puan={t.fiyatGarantiPuani}
                        yuzde={t.fiyatGarantiYuzde}
                        yuzdeEtiket="sabit fiyat"
                        variant="emerald"
                      />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        {t.profilFotoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={t.profilFotoUrl}
                            alt=""
                            className="size-9 rounded-full object-cover border border-slate-200 bg-slate-100 shrink-0"
                          />
                        ) : null}
                        <p className="font-semibold text-slate-900">
                          {adSoyadSatirGoster(t.cekiciAd, gizlilik)}
                        </p>
                        {t.onayliCekici && <OnayliCekiciRozeti kucuk />}
                      </div>
                      <p className="text-2xl font-bold text-amber-600 mt-1">
                        {t.fiyat} TL
                      </p>
                      {t.fiyatDegisti && t.ilkFiyat !== t.fiyat && (
                        <p className="text-xs text-red-600 mt-1 font-medium">
                          ⚠️ İlk teklif {t.ilkFiyat} TL idi — fiyat değiştirildi
                        </p>
                      )}
                      <div className="mt-1 space-y-0.5 text-xs text-slate-500">
                        <p>
                          Yanınıza ~{gelisDk} dk
                          {geldiOnce ? (
                            <span className="text-slate-400">
                              {" "}
                              · {geldiOnce}
                            </span>
                          ) : null}
                        </p>
                        {cekmeDk != null ? (
                          <p>
                            Çekilecek yere ~{cekmeDk} dk
                            {hedefBilinmiyor ? (
                              <span className="text-slate-400">
                                {" "}
                                · hedef belirsiz
                              </span>
                            ) : null}
                          </p>
                        ) : null}
                      </div>
                      {t.mesaj?.trim() && (
                        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                          {t.mesaj}
                        </p>
                      )}
                    </div>

                    {t.fiyatDegisti ? (
                      <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-800 leading-relaxed">
                        Bu çekici teklif fiyatını sonradan değiştirdi. Güvenlik
                        nedeniyle bu teklifle anlaşamazsınız.
                      </div>
                    ) : (
                      <Btn
                        onClick={() => teklifSec(t.id)}
                        disabled={islem || !t.secilebilir}
                        className="!py-3 text-sm"
                      >
                        Bu teklifi seç
                      </Btn>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          <Card>
            <p className="text-xs text-slate-500 leading-relaxed">
              Daha fazla teklif gelebilir. İhale süresi dolana kadar bekleyebilir
              veya mevcut tekliflerden birini seçebilirsiniz.
            </p>
          </Card>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell headerBadge={demoTalep ? demoHeaderBadge : undefined}>
      <div className="flex flex-col items-center px-4 pb-8 pt-2">
        {gelenTeklifBanner()}
        {durum === "yeniden_araniyor" && (
          <Card className="w-full mb-6 bg-amber-50 border-amber-200">
            <p className="text-sm text-amber-900">
              Önceki çekici ile anlaşılamadı. İhale yeniden açıldı, teklifler bekleniyor…
            </p>
          </Card>
        )}

        {!animasyonBitti && teklifler.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[55dvh] text-center w-full">
            <IhaleBekleAnimasyon
              operatorSayisi={operatorSayisi}
              onTamamlandi={() => setAnimasyonBitti(true)}
            />
            <p className="text-slate-500 text-sm mt-6 mb-2">
              Operatörler bilgilendiriliyor…
            </p>
            {ihaleBitis && (
              <p className="text-xs text-slate-400">
                İhale bitiş:{" "}
                {new Date(ihaleBitis).toLocaleTimeString("tr-TR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
            <p className="text-xs text-slate-400 mt-8 max-w-xs">
              {operatorSayisi > 0
                ? `${operatorSayisi} operatöre bildirim gönderildi. Yeni teklif gelince SMS alabilirsiniz.`
                : "Yakındaki operatörler aranıyor. Teklifler geldikçe burada listelenecek."}
            </p>
          </div>
        ) : (
          <div className="w-full max-w-lg space-y-4">
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-amber-200 animate-ping opacity-40" />
                <div className="absolute inset-0 flex items-center justify-center text-4xl">
                  🚛
                </div>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">
                {teklifler.length > 0
                  ? "Teklifler geliyor"
                  : "Çekiciler teklif veriyor"}
              </h2>
              <p className="text-slate-500 text-sm mb-2">
                {teklifler.length > 0
                  ? `${teklifler.length} teklif alındı`
                  : "Teklifler bekleniyor…"}
              </p>
              {ihaleBitis && (
                <p className="text-xs text-slate-400 mb-2">
                  İhale bitiş:{" "}
                  {new Date(ihaleBitis).toLocaleTimeString("tr-TR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
              <div className="flex gap-1.5 justify-center mb-2">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {operatorSayisi > 0
                  ? `${operatorSayisi} operatöre bildirim gönderildi.`
                  : "Yakındaki operatörler aranıyor."}
              </p>
            </div>

            {(sorunHedefKonumGerekliMi(sorunTipi ?? undefined) ||
              hedefKonum) &&
              musteriKonum &&
              koordinatGecerli(musteriKonum) && (
                <BekleHedefDegistir
                  talepId={id}
                  musteriKonum={musteriKonum}
                  hedefKonum={hedefKonum}
                  sorunTipi={sorunTipi}
                  degistirildi={hedefDegistirildi}
                  onGuncellendi={(hedef) => {
                    setHedefKonum(hedef);
                    setHedefDegistirildi(true);
                    setHedefBilinmiyor(false);
                  }}
                />
              )}
          </div>
        )}
      </div>
    </MobileShell>
  );
}
