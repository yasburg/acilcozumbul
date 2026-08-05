"use client";

import { useRef, useState } from "react";
import { Btn, Card } from "@/components/ui";
import { fotografSikistir } from "@/lib/fotograf-client";

interface ArizaFotografAlaniProps {
  onizleme: string | null;
  onDegisti: (dataUrl: string | null) => void;
  zorunlu?: boolean;
  invalid?: boolean;
  /** Önizleme varken Kaldır yerine Devam et gösterilir */
  onDevam?: () => void;
}

export function ArizaFotografAlani({
  onizleme,
  onDegisti,
  zorunlu = false,
  invalid = false,
  onDevam,
}: ArizaFotografAlaniProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");

  async function dosyaSec(e: React.ChangeEvent<HTMLInputElement>) {
    const dosya = e.target.files?.[0];
    e.target.value = "";
    if (!dosya) return;

    setYukleniyor(true);
    setHata("");
    try {
      const dataUrl = await fotografSikistir(dosya);
      onDegisti(dataUrl);
    } catch (err) {
      setHata(err instanceof Error ? err.message : "Fotoğraf yüklenemedi.");
      onDegisti(null);
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <div className="space-y-2">
      <p
        className={`text-sm font-medium ${invalid ? "text-red-700" : "text-slate-800"}`}
      >
        Arıza fotoğrafı{" "}
        {zorunlu ? (
          <span className="text-red-600 font-medium">(zorunlu)</span>
        ) : (
          <span className="text-slate-500 font-normal">(isteğe bağlı)</span>
        )}
      </p>
      <p className="text-xs text-slate-500 leading-relaxed">
        Aracınızın veya sorunun fotoğrafını çekin — çekici doğru teklif verebilsin.
      </p>

      {onizleme ? (
        <Card className="overflow-hidden p-0 border-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={onizleme}
            alt="Arıza fotoğrafı önizleme"
            className="w-full max-h-48 object-cover"
          />
          <div className="flex gap-2 p-3 border-t border-slate-100">
            <Btn
              type="button"
              variant="outline"
              className="!py-2 text-sm flex-1"
              onClick={() => inputRef.current?.click()}
              disabled={yukleniyor}
            >
              Değiştir
            </Btn>
            <Btn
              type="button"
              variant={onDevam ? undefined : "outline"}
              className="!py-2 text-sm flex-1"
              onClick={() => (onDevam ? onDevam() : onDegisti(null))}
              disabled={yukleniyor}
            >
              {onDevam ? "Devam et" : "Kaldır"}
            </Btn>
          </div>
        </Card>
      ) : (
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
          <span className="text-3xl block mb-2">📷</span>
          <span
            className={`text-sm font-medium ${invalid ? "text-red-800" : "text-amber-900"}`}
          >
            {yukleniyor ? "Fotoğraf hazırlanıyor…" : "Fotoğraf çek veya seç"}
          </span>
        </button>
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
        capture="environment"
        className="hidden"
        onChange={dosyaSec}
      />
    </div>
  );
}
