"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  musteriAktifTalepOku,
  musteriAktifTalepSil,
  musteriTalepDevamEdilir,
} from "@/lib/musteri-aktif-talep";

/**
 * Aynı cihazda devam eden talep varsa ana sayfadan /bekle/[id]’ye alır
 * (ihale, kazanan belli, anlaşıldı). `?yeni=1` ile kayıt silinir.
 * MusteriAnaSayfa / MusteriDonusumSayfa içinde (Suspense + useSearchParams) çağırın.
 */
export function useMusteriAktifTalepYonlendir(): void {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    let iptal = false;

    if (searchParams.get("yeni") === "1") {
      musteriAktifTalepSil();
      router.replace(pathname || "/");
      return;
    }

    const id = musteriAktifTalepOku();
    if (!id) return;

    const t = window.setTimeout(() => {
      void fetch(`/api/talep/${encodeURIComponent(id)}`)
        .then(async (r) => {
          if (iptal) return;
          if (!r.ok) {
            musteriAktifTalepSil();
            return;
          }
          const data = (await r.json()) as {
            durum?: string;
            iptal?: boolean;
          };
          if (data.iptal || !musteriTalepDevamEdilir(data.durum)) {
            musteriAktifTalepSil();
            return;
          }
          router.replace(`/bekle/${id}`);
        })
        .catch(() => {
          if (!iptal) musteriAktifTalepSil();
        });
    }, 0);

    return () => {
      iptal = true;
      window.clearTimeout(t);
    };
  }, [router, pathname, searchParams]);
}
