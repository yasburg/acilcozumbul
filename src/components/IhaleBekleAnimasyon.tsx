"use client";

import { useEffect, useState } from "react";

type Asama =
  | "tespit"
  | "bulundu"
  | "gonderiliyor"
  | "gonderildi"
  | "bekleniyor";

const ASAMA_SURE_MS = 5000;
const TOPLAM_MS = ASAMA_SURE_MS * 4;

interface IhaleBekleAnimasyonProps {
  operatorSayisi: number;
  onTamamlandi?: () => void;
}

const ASAMA_METIN: Record<Asama, (n: number) => string> = {
  tespit: () => "Menzildeki operatörler tespit ediliyor…",
  bulundu: (n) =>
    n > 0
      ? `${n} operatör tespit edildi`
      : "Yakındaki operatörler aranıyor…",
  gonderiliyor: (n) =>
    n > 0
      ? `${n} operatöre SMS gönderiliyor…`
      : "Operatörlere bildirim gönderiliyor…",
  gonderildi: (n) =>
    n > 0
      ? `${n} operatöre SMS gönderildi ✓`
      : "Bildirimler iletildi ✓",
  bekleniyor: () => "Teklifler bekleniyor…",
};

export function IhaleBekleAnimasyon({
  operatorSayisi,
  onTamamlandi,
}: IhaleBekleAnimasyonProps) {
  const [gecenMs, setGecenMs] = useState(0);
  const [tamamlandi, setTamamlandi] = useState(false);

  useEffect(() => {
    const baslangic = Date.now();
    const id = setInterval(() => {
      const g = Date.now() - baslangic;
      if (g >= TOPLAM_MS) {
        setGecenMs(TOPLAM_MS);
        setTamamlandi(true);
        clearInterval(id);
        onTamamlandi?.();
      } else {
        setGecenMs(g);
      }
    }, 100);
    return () => clearInterval(id);
  }, [onTamamlandi]);

  const asamaIdx = Math.min(3, Math.floor(gecenMs / ASAMA_SURE_MS));
  const asamalar: Asama[] = ["tespit", "bulundu", "gonderiliyor", "gonderildi"];
  const asama: Asama = tamamlandi ? "bekleniyor" : asamalar[asamaIdx];
  const ilerleme = tamamlandi
    ? 100
    : Math.min(100, (gecenMs / TOPLAM_MS) * 100);

  const n = Math.max(operatorSayisi, 0);
  const metin = ASAMA_METIN[asama](n);

  return (
    <div className="w-full max-w-sm space-y-5">
      <div className="relative w-28 h-28 mx-auto">
        {!tamamlandi && (
          <>
            <div className="absolute inset-0 rounded-full border-4 border-amber-200 animate-ping opacity-40" />
            <div className="absolute inset-3 rounded-full border-4 border-amber-400/50 animate-pulse" />
          </>
        )}
        <div className="absolute inset-0 flex items-center justify-center text-5xl">
          {asama === "tespit" && "🔍"}
          {asama === "bulundu" && "📡"}
          {asama === "gonderiliyor" && "📤"}
          {asama === "gonderildi" && "✅"}
          {asama === "bekleniyor" && "🚛"}
        </div>
      </div>

      <div className="space-y-2">
        <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-300 ease-out"
            style={{ width: `${ilerleme}%` }}
          />
        </div>
        <p className="text-sm font-semibold text-slate-800 min-h-[2.5rem] flex items-center justify-center text-center px-2">
          {metin}
          {asama === "gonderiliyor" && (
            <span className="inline-flex gap-0.5 ml-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1 h-1 rounded-full bg-amber-600 animate-bounce"
                  style={{ animationDelay: `${i * 0.12}s` }}
                />
              ))}
            </span>
          )}
        </p>
      </div>

      {asama === "bulundu" && n > 0 && (
        <div className="flex justify-center gap-1.5 flex-wrap">
          {Array.from({ length: Math.min(n, 8) }).map((_, i) => (
            <span
              key={i}
              className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-sm"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              🚛
            </span>
          ))}
          {n > 8 && (
            <span className="text-xs text-slate-500 self-center">+{n - 8}</span>
          )}
        </div>
      )}

      {tamamlandi && (
        <div className="flex gap-1.5 justify-center">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
