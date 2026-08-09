"use client";

import { useRef, useState } from "react";
import { Btn, Card } from "@/components/ui";
import { fotografSikistir } from "@/lib/fotograf-client";

export const MAX_ARIZA_FOTOGRAF = 2;

export type ArizaFotografSlotlari = [string | null, string | null];

const SLOT_ETIKETLER = ["Araç fotoğrafı", "Arıza fotoğrafı"] as const;

interface ArizaFotografAlaniProps {
  /** Sabit 2 slot: [araç, arıza] */
  fotograflar: ArizaFotografSlotlari;
  onDegisti: (fotograflar: ArizaFotografSlotlari) => void;
  zorunlu?: boolean;
  invalid?: boolean;
  /** Üst başlığı bileşen içinde gösterme */
  baslikGizle?: boolean;
}

export function arizaFotograflariListe(
  slotlar: ArizaFotografSlotlari
): string[] {
  return slotlar.filter((x): x is string => Boolean(x));
}

export function ArizaFotografAlani({
  fotograflar,
  onDegisti,
  zorunlu = false,
  invalid = false,
  baslikGizle = false,
}: ArizaFotografAlaniProps) {
  const input0 = useRef<HTMLInputElement>(null);
  const input1 = useRef<HTMLInputElement>(null);
  const inputRefs = [input0, input1] as const;
  const [yukleniyorIdx, setYukleniyorIdx] = useState<number | null>(null);
  const [hata, setHata] = useState("");

  function guncelle(idx: 0 | 1, dataUrl: string | null) {
    const sonraki: ArizaFotografSlotlari = [...fotograflar];
    sonraki[idx] = dataUrl;
    onDegisti(sonraki);
  }

  async function dosyaSec(
    idx: 0 | 1,
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const dosya = e.target.files?.[0];
    e.target.value = "";
    if (!dosya) return;

    setYukleniyorIdx(idx);
    setHata("");
    try {
      const dataUrl = await fotografSikistir(dosya);
      guncelle(idx, dataUrl);
    } catch (err) {
      setHata(err instanceof Error ? err.message : "Fotoğraf yüklenemedi.");
    } finally {
      setYukleniyorIdx(null);
    }
  }

  return (
    <div className="space-y-3">
      {!baslikGizle && (
        <>
          <p
            className={`text-sm font-medium ${invalid ? "text-red-700" : "text-slate-800"}`}
          >
            Araç ve arıza fotoğrafı yükleyiniz
            {zorunlu ? (
              <span className="text-red-600 font-medium"> (zorunlu)</span>
            ) : (
              <span className="text-slate-500 font-normal"> (isteğe bağlı)</span>
            )}
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            En fazla 2 fotoğraf — çekici doğru teklif verebilsin.
          </p>
        </>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SLOT_ETIKETLER.map((etiket, i) => {
          const idx = i as 0 | 1;
          const onizleme = fotograflar[idx];
          const yukleniyor = yukleniyorIdx === idx;
          return (
            <div key={etiket} className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-700">{etiket}</p>
              {onizleme ? (
                <Card className="overflow-hidden p-0 border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={onizleme}
                    alt={`${etiket} önizleme`}
                    className="w-full max-h-40 object-cover"
                  />
                  <div className="flex gap-2 p-2.5 border-t border-slate-100">
                    <Btn
                      type="button"
                      variant="outline"
                      className="!py-1.5 text-xs flex-1"
                      onClick={() => inputRefs[idx].current?.click()}
                      disabled={yukleniyorIdx != null}
                    >
                      Değiştir
                    </Btn>
                    <Btn
                      type="button"
                      variant="outline"
                      className="!py-1.5 text-xs flex-1"
                      onClick={() => guncelle(idx, null)}
                      disabled={yukleniyorIdx != null}
                    >
                      Kaldır
                    </Btn>
                  </div>
                </Card>
              ) : (
                <button
                  type="button"
                  onClick={() => inputRefs[idx].current?.click()}
                  disabled={yukleniyorIdx != null}
                  className={`w-full rounded-xl border-2 border-dashed px-3 py-6 text-center transition disabled:opacity-60 ${
                    invalid
                      ? "border-red-400 bg-red-50/80 hover:bg-red-50"
                      : "border-amber-300 bg-amber-50/50 hover:bg-amber-50"
                  }`}
                >
                  <span className="text-2xl block mb-1.5">📷</span>
                  <span
                    className={`text-xs font-medium ${invalid ? "text-red-800" : "text-amber-900"}`}
                  >
                    {yukleniyor ? "Hazırlanıyor…" : "Çek veya seç"}
                  </span>
                </button>
              )}
              <input
                ref={inputRefs[idx]}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => void dosyaSec(idx, e)}
              />
            </div>
          );
        })}
      </div>

      {!zorunlu && (
        <p className="text-sm text-slate-500 text-center leading-snug">
          Fotoğrafsız devam edebilirsiniz.
        </p>
      )}

      {hata && (
        <p className="text-sm text-red-600" role="alert">
          {hata}
        </p>
      )}
    </div>
  );
}
