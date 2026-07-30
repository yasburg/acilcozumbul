"use client";

import { useMemo, useState } from "react";
import { chromeAc, chromeAcUrl } from "@/lib/konum-client";
import { Btn } from "@/components/ui";

interface ChromeAcSecenegiProps {
  /** Vurgulu (izin reddedildi) veya sade yardımcı satır */
  vurgulu?: boolean;
  className?: string;
}

export function ChromeAcSecenegi({
  vurgulu = false,
  className = "",
}: ChromeAcSecenegiProps) {
  const linkVar = useMemo(() => chromeAcUrl() !== null, []);
  const [tiklandi, setTiklandi] = useState(false);

  if (!linkVar) return null;

  return (
    <div className={className}>
      {vurgulu ? (
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
          className="w-full text-sm text-slate-600 font-medium underline py-1"
        >
          Konum çalışmıyorsa Chrome’da aç
        </button>
      )}
      {tiklandi && (
        <p className="text-xs text-slate-500 mt-2 leading-relaxed text-center">
          Chrome açılmazsa App Store / Play Store’dan Chrome’u yükleyip bu
          sayfayı orada açın. Adresi elle yazarak da devam edebilirsiniz.
        </p>
      )}
    </div>
  );
}
