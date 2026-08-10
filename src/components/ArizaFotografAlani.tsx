"use client";

import { useRef, useState } from "react";
import { Btn, Card } from "@/components/ui";
import { AcbIcons, ACB_ICON_STROKE } from "@/lib/acb-icons";
import { fotografSikistir } from "@/lib/fotograf-client";

export const MAX_ARIZA_FOTOGRAF = 5;

interface ArizaFotografAlaniProps {
  fotograflar: string[];
  onDegisti: (dataUrls: string[]) => void;
  invalid?: boolean;
  max?: number;
}

export function ArizaFotografAlani({
  fotograflar,
  onDegisti,
  invalid = false,
  max = MAX_ARIZA_FOTOGRAF,
}: ArizaFotografAlaniProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");

  const kalan = Math.max(0, max - fotograflar.length);

  async function dosyaSec(e: React.ChangeEvent<HTMLInputElement>) {
    const dosyalar = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!dosyalar.length || kalan <= 0) return;

    setYukleniyor(true);
    setHata("");
    try {
      const eklenecek = dosyalar.slice(0, kalan);
      const yeniler: string[] = [];
      for (const dosya of eklenecek) {
        yeniler.push(await fotografSikistir(dosya));
      }
      onDegisti([...fotograflar, ...yeniler]);
      if (dosyalar.length > kalan) {
        setHata(`En fazla ${max} fotoğraf ekleyebilirsiniz.`);
      }
    } catch (err) {
      setHata(err instanceof Error ? err.message : "Fotoğraf yüklenemedi.");
    } finally {
      setYukleniyor(false);
    }
  }

  function kaldir(index: number) {
    onDegisti(fotograflar.filter((_, i) => i !== index));
    setHata("");
  }

  return (
    <div className="space-y-3">
      {fotograflar.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {fotograflar.map((src, i) => (
            <Card
              key={`${i}-${src.slice(0, 32)}`}
              className="overflow-hidden p-0 border-slate-200"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Arıza fotoğrafı ${i + 1}`}
                className="h-32 w-full object-cover"
              />
              <div className="flex gap-2 p-2 border-t border-slate-100">
                <Btn
                  type="button"
                  variant="outline"
                  className="!py-1.5 text-sm flex-1"
                  onClick={() => kaldir(i)}
                  disabled={yukleniyor}
                >
                  Kaldır
                </Btn>
              </div>
            </Card>
          ))}
        </div>
      )}

      {kalan > 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={yukleniyor}
          className={`w-full rounded-xl border-2 border-dashed px-4 py-8 text-center transition disabled:opacity-60 ${
            invalid
              ? "border-red-400 bg-red-50/80 hover:bg-red-50"
              : "border-amber-300 bg-amber-50/50 hover:bg-amber-50"
          }`}
        >
          <AcbIcons.camera
            className={`mx-auto mb-2 size-8 ${
              invalid ? "text-red-700" : "text-amber-800"
            }`}
            strokeWidth={ACB_ICON_STROKE}
          />
          <span
            className={`text-sm font-medium block ${
              invalid ? "text-red-800" : "text-amber-900"
            }`}
          >
            {yukleniyor
              ? "Fotoğraf hazırlanıyor…"
              : fotograflar.length
                ? "Fotoğraf ekle"
                : "Fotoğraf çek veya seç"}
          </span>
          {fotograflar.length > 0 && (
            <span className="mt-1 block text-xs text-slate-500">
              {fotograflar.length}/{max} · {kalan} daha ekleyebilirsiniz
            </span>
          )}
        </button>
      ) : (
        <p className="text-xs text-slate-500 text-center">
          En fazla {max} fotoğraf eklenebilir.
        </p>
      )}

      {hata && (
        <p className="text-sm text-red-600" role="alert">
          {hata}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        {...(fotograflar.length === 0 ? { capture: "environment" as const } : {})}
        multiple
        className="hidden"
        onChange={dosyaSec}
      />
    </div>
  );
}
