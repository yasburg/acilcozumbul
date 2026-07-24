"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Ana sayfa HTML’ini DB’ye bağlamadan boyar.
 * Varsa çekici oturumunu /api/cekici/me ile doğrular (httpOnly çerez).
 */
export function CekiciOturumYonlendir() {
  const router = useRouter();

  useEffect(() => {
    let iptal = false;
    const t = window.setTimeout(() => {
      void fetch("/api/cekici/me", { credentials: "include" })
        .then((r) => {
          if (!iptal && r.ok) router.replace("/cekici/panel");
        })
        .catch(() => {
          /* yok say */
        });
    }, 0);
    return () => {
      iptal = true;
      window.clearTimeout(t);
    };
  }, [router]);

  return null;
}
