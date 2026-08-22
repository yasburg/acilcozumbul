"use client";

import { useState } from "react";

type Props = {
  eposta: string;
  subject?: string;
  className?: string;
};

/**
 * mailto: varsayılan posta uygulaması yokken sessizce başarısız olabilir.
 * Gmail web + panoya kopya yedekleri.
 */
export function EpostaGonderCta({
  eposta,
  subject = "İş birliği teklifi — Acil Çözüm Bul",
  className = "",
}: Props) {
  const [kopyalandi, setKopyalandi] = useState(false);
  const mailto = `mailto:${eposta}?subject=${encodeURIComponent(subject)}`;
  const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(eposta)}&su=${encodeURIComponent(subject)}`;

  async function kopyala() {
    try {
      await navigator.clipboard.writeText(eposta);
      setKopyalandi(true);
      window.setTimeout(() => setKopyalandi(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      className={`flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center ${className}`}
    >
      <a
        href={mailto}
        className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--acb-primary,#089b2d)] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-105 sm:w-auto"
      >
        E-posta gönder
      </a>
      <a
        href={gmail}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 sm:w-auto"
      >
        Gmail ile aç
      </a>
      <button
        type="button"
        onClick={() => void kopyala()}
        className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
      >
        {kopyalandi ? "Kopyalandı" : "Adresi kopyala"}
      </button>
    </div>
  );
}
