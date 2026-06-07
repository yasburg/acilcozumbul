"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Btn, Card } from "@/components/ui";
import { cekiciFetch } from "@/lib/cekici-fetch";
import { konumAlEsnek, konumGuvenliMi } from "@/lib/konum-client";
import { latLngStr, type LatLng } from "@/lib/koordinat";
import { istemciYerelMi } from "@/lib/yerel-ortam";
import { haritaSecenekleri } from "@/lib/harita-yonlendirme";

interface RotaSureleri {
  sizeMusteriDk: number;
  musteriHedefDk: number | null;
  toplamDk: number;
  hedefVar: boolean;
  kaynak?: "google" | "osrm";
  googleUyari?: string;
}

interface CekiciRotaPanelProps {
  musteriKonum: LatLng;
  hedefKonum?: LatLng | null;
  /** Tahmini süre alanını otomatik doldur */
  onToplamSure?: (dk: number) => void;
  compact?: boolean;
  /** İhale kazanıldıktan sonra — «Haritada rotayı göster» + harici harita */
  haritaButonu?: boolean;
}

function embedDirectionsUrl(
  cekici: LatLng,
  musteri: LatLng,
  hedef?: LatLng | null,
  apiKey?: string
): string | null {
  if (!apiKey) return null;
  const params = new URLSearchParams({
    key: apiKey,
    origin: latLngStr(cekici),
    destination: latLngStr(hedef ?? musteri),
    mode: "driving",
  });
  if (hedef) {
    params.set("waypoints", latLngStr(musteri));
  }
  return `https://www.google.com/maps/embed/v1/directions?${params.toString()}`;
}

export function CekiciRotaPanel({
  musteriKonum,
  hedefKonum,
  onToplamSure,
  compact = false,
  haritaButonu = false,
}: CekiciRotaPanelProps) {
  const [cekiciKonum, setCekiciKonum] = useState<LatLng | null>(null);
  const [konumHata, setKonumHata] = useState("");
  const [konumYukleniyor, setKonumYukleniyor] = useState(true);
  const [sureYukleniyor, setSureYukleniyor] = useState(false);
  const [sureHata, setSureHata] = useState("");
  const [sureler, setSureler] = useState<RotaSureleri | null>(null);
  const [haritaAcik, setHaritaAcik] = useState(false);
  const [disHaritaSecim, setDisHaritaSecim] = useState(false);
  const onToplamSureRef = useRef(onToplamSure);
  onToplamSureRef.current = onToplamSure;
  const musteriRef = useRef(musteriKonum);
  const hedefRef = useRef(hedefKonum);
  musteriRef.current = musteriKonum;
  hedefRef.current = hedefKonum;
  const ilkHesapYapildiRef = useRef(false);

  const embedKey =
    typeof process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === "string"
      ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.trim()
      : "";

  const konumAl = useCallback(async () => {
    setKonumYukleniyor(true);
    setKonumHata("");
    if (!konumGuvenliMi()) {
      setKonumHata(
        "Konum için HTTPS gerekir. Harita yine de müşteri/hedef rotasını açabilir."
      );
      setKonumYukleniyor(false);
      return;
    }
    try {
      const pos = await konumAlEsnek();
      setCekiciKonum({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    } catch {
      setKonumHata(
        "Konumunuz alınamadı. İzin verin veya haritayı Google Maps’te açın."
      );
    } finally {
      setKonumYukleniyor(false);
    }
  }, []);

  useEffect(() => {
    void konumAl();
  }, [konumAl]);

  const sureHesapla = useCallback(async () => {
    if (!cekiciKonum) return;
    setSureYukleniyor(true);
    setSureHata("");
    try {
      const res = await cekiciFetch("/api/cekici/rota-suresi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cekiciKonum,
          musteriKonum: musteriRef.current,
          hedefKonum: hedefRef.current ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSureHata(data.error ?? "Süre hesaplanamadı.");
        setSureler(null);
        return;
      }
      const s: RotaSureleri = {
        sizeMusteriDk: data.sizeMusteriDk,
        musteriHedefDk: data.musteriHedefDk ?? null,
        toplamDk: data.toplamDk,
        hedefVar: !!data.hedefVar,
        kaynak: data.kaynak,
        googleUyari: data.googleUyari,
      };
      setSureler(s);
      onToplamSureRef.current?.(s.toplamDk);
    } catch {
      setSureHata("Bağlantı hatası.");
    } finally {
      setSureYukleniyor(false);
    }
  }, [cekiciKonum]);

  /** İlk GPS alındığında bir kez hesapla; sayfa yenilemesinde tekrar etme */
  useEffect(() => {
    if (!cekiciKonum || ilkHesapYapildiRef.current) return;
    ilkHesapYapildiRef.current = true;
    void sureHesapla();
  }, [cekiciKonum, sureHesapla]);

  const haritaUrl =
    cekiciKonum && embedKey
      ? embedDirectionsUrl(cekiciKonum, musteriKonum, hedefKonum, embedKey)
      : null;

  const disHaritaSecenekleri = haritaSecenekleri(musteriKonum, {
    cekici: cekiciKonum,
    hedef: hedefKonum,
  });

  const ozetMetin = sureler
    ? sureler.hedefVar && sureler.musteriHedefDk != null
      ? `~${sureler.sizeMusteriDk} dk size · ~${sureler.musteriHedefDk} dk çekme · ~${sureler.toplamDk} dk toplam`
      : `~${sureler.sizeMusteriDk} dk (konumunuza → müşteri)`
    : null;

  return (
    <>
      <Card className={compact ? "!p-3" : ""}>
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">
          Yol süresi
          {sureler?.kaynak === "osrm"
            ? " (tahmini)"
            : sureler?.kaynak === "google"
              ? " (Google)"
              : " (Google Maps)"}
        </p>

        {sureler?.googleUyari && istemciYerelMi() && (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-2">
            {sureler.googleUyari}
          </p>
        )}

        {konumYukleniyor && (
          <p className="text-sm text-slate-500">Konumunuz alınıyor…</p>
        )}

        {konumHata && !cekiciKonum && (
          <p className="text-xs text-amber-700 mb-2">{konumHata}</p>
        )}

        {sureYukleniyor && cekiciKonum && (
          <p className="text-sm text-slate-500">Rota süresi hesaplanıyor…</p>
        )}

        {sureHata && (
          <p className="text-xs text-red-600 mb-2">{sureHata}</p>
        )}

        {ozetMetin && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-800 leading-snug">
              {ozetMetin}
            </p>
            {sureler?.hedefVar && sureler.musteriHedefDk != null && (
              <ul className="text-xs text-slate-600 space-y-0.5">
                <li>① Konumunuz → müşteri (arıza): ~{sureler.sizeMusteriDk} dk</li>
                <li>
                  ② Müşteri → hedef (çekme): ~{sureler.musteriHedefDk} dk
                </li>
                <li className="font-semibold text-amber-700">
                  Toplam tahmini: ~{sureler.toplamDk} dk
                </li>
              </ul>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2 mt-3">
          {haritaButonu && (
            <>
              <button
                type="button"
                onClick={() => setHaritaAcik(true)}
                disabled={!cekiciKonum}
                className="w-full rounded-xl border-2 border-blue-200 bg-blue-50 px-4 py-3 text-left transition hover:border-blue-300 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-sm font-semibold text-blue-900 block">
                  🗺️ Haritada rotayı göster
                </span>
                <span className="text-xs text-blue-700 mt-0.5 block">
                  {cekiciKonum
                    ? "Siz · müşteri · hedef (Google Maps)"
                    : "Önce konum izni gerekli"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setDisHaritaSecim(true)}
                className="w-full rounded-xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3 text-left transition hover:border-emerald-300 active:scale-[0.99]"
              >
                <span className="text-sm font-semibold text-emerald-900 block">
                  📍 Rotayı haritada aç
                </span>
                <span className="text-xs text-emerald-700 mt-0.5 block">
                  Google Maps veya Apple Maps
                </span>
              </button>
            </>
          )}

          {!cekiciKonum && (
            <Btn
              type="button"
              variant="outline"
              onClick={() => void konumAl()}
              className="!py-2 text-sm"
            >
              Konumumu yeniden al
            </Btn>
          )}

          {cekiciKonum && (
            <Btn
              type="button"
              variant="outline"
              onClick={() => void sureHesapla()}
              disabled={sureYukleniyor || konumYukleniyor}
              className="!py-2 text-sm"
            >
              {sureYukleniyor
                ? "Hesaplanıyor…"
                : sureler
                  ? "Süreyi yeniden hesapla"
                  : sureHata
                    ? "Süreyi tekrar hesapla"
                    : "Süreyi hesapla"}
            </Btn>
          )}
        </div>
      </Card>

      {haritaButonu && disHaritaSecim && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4 safe-bottom"
          role="dialog"
          aria-modal="true"
          aria-label="Harita uygulaması seçin"
          onClick={() => setDisHaritaSecim(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="font-semibold text-slate-900">Rotayı haritada aç</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Navigasyon uygulamanızı seçin
              </p>
            </div>
            <div className="p-2 flex flex-col gap-1">
              {disHaritaSecenekleri.map((sec) => (
                <a
                  key={sec.id}
                  href={sec.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setDisHaritaSecim(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-800 hover:bg-slate-50 active:bg-slate-100 transition"
                >
                  <span className="text-xl" aria-hidden>
                    {sec.id === "apple" ? "🍎" : "🗺️"}
                  </span>
                  {sec.label}
                </a>
              ))}
            </div>
            <div className="p-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDisHaritaSecim(false)}
                className="w-full rounded-xl py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {haritaButonu && haritaAcik && cekiciKonum && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/60 p-4 safe-bottom"
          role="dialog"
          aria-modal="true"
          aria-label="Rota haritası"
        >
          <div className="mx-auto w-full max-w-lg flex flex-col flex-1 min-h-0 bg-white rounded-2xl overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <div>
                <p className="font-semibold text-slate-900">Rota haritası</p>
                <p className="text-xs text-slate-500">
                  Mavi rota: siz → müşteri → hedef
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHaritaAcik(false)}
                className="text-2xl leading-none text-slate-400 px-2"
                aria-label="Kapat"
              >
                ×
              </button>
            </div>

            <div className="flex-1 min-h-[50vh] bg-slate-100 relative">
              {haritaUrl ? (
                <iframe
                  title="Google Maps rota"
                  src={haritaUrl}
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="p-6 text-center space-y-3">
                  <p className="text-sm text-slate-600">
                    Gömülü harita için{" "}
                    <code className="text-xs">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>{" "}
                    tanımlayın (Maps Embed API).
                  </p>
                  {disHaritaSecenekleri[0] && (
                    <a
                      href={disHaritaSecenekleri[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Btn>{disHaritaSecenekleri[0].label}</Btn>
                    </a>
                  )}
                </div>
              )}
            </div>

            {sureler && (
              <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-700">
                {ozetMetin}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
