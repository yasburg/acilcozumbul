"use client";

import { useEffect, useRef, useState } from "react";
import { AcbIcons, ACB_ICON_STROKE } from "@/lib/acb-icons";
import { Search, Radio, Send, CircleCheck } from "lucide-react";

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
      ? `${n} operatöre SMS gönderildi`
      : "Bildirimler iletildi",
  bekleniyor: () => "Teklifler bekleniyor…",
};

function AsamaIkon({ asama }: { asama: Asama }) {
  const cls = "size-10 text-[var(--acb-dark)]";
  if (asama === "tespit") {
    return <Search className={cls} strokeWidth={ACB_ICON_STROKE} aria-hidden />;
  }
  if (asama === "bulundu") {
    return <Radio className={cls} strokeWidth={ACB_ICON_STROKE} aria-hidden />;
  }
  if (asama === "gonderiliyor") {
    return <Send className={cls} strokeWidth={ACB_ICON_STROKE} aria-hidden />;
  }
  if (asama === "gonderildi") {
    return (
      <CircleCheck
        className="size-10 text-[var(--acb-green)]"
        strokeWidth={ACB_ICON_STROKE}
        aria-hidden
      />
    );
  }
  const Truck = AcbIcons.towing;
  return <Truck className={cls} strokeWidth={ACB_ICON_STROKE} aria-hidden />;
}

export function IhaleBekleAnimasyon({
  operatorSayisi,
  onTamamlandi,
}: IhaleBekleAnimasyonProps) {
  const [gecenMs, setGecenMs] = useState(0);
  const [tamamlandi, setTamamlandi] = useState(false);
  const onTamamlandiRef = useRef(onTamamlandi);
  onTamamlandiRef.current = onTamamlandi;

  useEffect(() => {
    const baslangic = Date.now();
    const id = setInterval(() => {
      const g = Date.now() - baslangic;
      if (g >= TOPLAM_MS) {
        setGecenMs(TOPLAM_MS);
        setTamamlandi(true);
        clearInterval(id);
        onTamamlandiRef.current?.();
      } else {
        setGecenMs(g);
      }
    }, 100);
    return () => clearInterval(id);
  }, []);

  const asamaIdx = Math.min(3, Math.floor(gecenMs / ASAMA_SURE_MS));
  const asamalar: Asama[] = ["tespit", "bulundu", "gonderiliyor", "gonderildi"];
  const asama: Asama = tamamlandi ? "bekleniyor" : asamalar[asamaIdx]!;
  const ilerleme = tamamlandi
    ? 100
    : Math.min(100, (gecenMs / TOPLAM_MS) * 100);

  const n = Math.max(operatorSayisi, 0);
  const metin = ASAMA_METIN[asama](n);
  const Truck = AcbIcons.towing;

  return (
    <div className="w-full max-w-sm space-y-5">
      <div className="relative mx-auto size-28">
        {!tamamlandi && (
          <>
            <div className="absolute inset-0 rounded-full border-4 border-[color-mix(in_srgb,var(--acb-green)_25%,white)] animate-ping opacity-40" />
            <div className="absolute inset-3 rounded-full border-4 border-[color-mix(in_srgb,var(--acb-green)_40%,white)] animate-pulse" />
          </>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <AsamaIkon asama={asama} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--acb-border)]">
          <div
            className="h-full rounded-full bg-[var(--acb-green)] transition-all duration-300 ease-out"
            style={{ width: `${ilerleme}%` }}
          />
        </div>
        <p className="flex min-h-[2.5rem] items-center justify-center px-2 text-center text-sm font-semibold text-[var(--acb-dark)]">
          {metin}
          {asama === "gonderiliyor" && (
            <span className="ml-1 inline-flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="size-1 animate-bounce rounded-full bg-[var(--acb-green)]"
                  style={{ animationDelay: `${i * 0.12}s` }}
                />
              ))}
            </span>
          )}
        </p>
      </div>

      {asama === "bulundu" && n > 0 && (
        <div className="flex flex-wrap justify-center gap-1.5">
          {Array.from({ length: Math.min(n, 8) }).map((_, i) => (
            <span
              key={i}
              className="flex size-8 items-center justify-center rounded-full border border-[var(--acb-border)] bg-[var(--acb-soft)] text-[var(--acb-dark)]"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <Truck className="size-4" strokeWidth={ACB_ICON_STROKE} aria-hidden />
            </span>
          ))}
          {n > 8 && (
            <span className="self-center text-xs text-[var(--acb-muted)]">
              +{n - 8}
            </span>
          )}
        </div>
      )}

      {tamamlandi && (
        <div className="flex justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-2 animate-bounce rounded-full bg-[var(--acb-orange)]"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
