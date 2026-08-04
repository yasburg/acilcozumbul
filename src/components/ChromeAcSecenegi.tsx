"use client";

import { useMemo, useState } from "react";
import { chromeAc, chromeAcUrl } from "@/lib/konum-client";
import { Btn } from "@/components/ui";

interface ChromeAcSecenegiProps {
  /** Vurgulu (izin reddedildi / konum başarısız) */
  vurgulu?: boolean;
  className?: string;
}

/**
 * Konum alınamayınca gösterilir — başka tarayıcı / Chrome önerisi.
 * Proaktif olarak her zaman gösterilmez.
 */
export function ChromeAcSecenegi({
  vurgulu = false,
  className = "",
}: ChromeAcSecenegiProps) {
  const linkVar = useMemo(() => chromeAcUrl() !== null, []);
  const [tiklandi, setTiklandi] = useState(false);

  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-sm text-slate-600 leading-snug text-center">
        Konum alınamadı. Başka bir tarayıcıda (ör. Chrome veya Safari) tekrar
        deneyin; olmazsa şehri ve ilçeyi seçerek devam edebilirsiniz.
      </p>
      {linkVar ? (
        vurgulu ? (
          <Btn
            type="button"
            variant="secondary"
            className="!py-3 text-sm"
            onClick={() => {
              setTiklandi(true);
              chromeAc();
            }}
          >
            Chrome’da aç
          </Btn>
        ) : (
          <button
            type="button"
            onClick={() => {
              setTiklandi(true);
              chromeAc();
            }}
            className="w-full text-sm text-amber-700 font-medium underline py-1"
          >
            Chrome’da dene
          </button>
        )
      ) : null}
      {tiklandi && (
        <p className="text-xs text-slate-500 leading-relaxed text-center">
          Chrome yüklü değilse veya açılmazsa sorun değil — aşağıdan şehrinizi ve
          ilçenizi seçerek forma devam edebilirsiniz.
        </p>
      )}
    </div>
  );
}
