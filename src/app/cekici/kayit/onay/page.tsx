"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { Btn, Card } from "@/components/ui";
import {
  KULLANIMA_ACIK_ILLER,
  sehirKullanimAcikMi,
} from "@/lib/cekici-sehir-acilis";
import { gtagCekiciKayitOnayGoruntule } from "@/lib/gtag";
import {
  metaKayitUserOku,
  metaPixelCompleteRegistration,
} from "@/lib/meta-pixel";
import {
  tiktokPixelHesapOlustur,
  tiktokPixelKayitOl,
} from "@/lib/tiktok-pixel";
import { posthogOlayYakala } from "@/lib/posthog-client";

const YONLENDIRME_SN = 5;
/** Kayıt formunda da set edilir — Meta çift tetiklenmesin */
const META_COMPLETE_REG_KEY = "acil_meta_complete_reg";

function OnayIcerik() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sehir = (searchParams.get("sehir") ?? "").trim();
  const [acikIller, setAcikIller] = useState<readonly string[]>([
    ...KULLANIMA_ACIK_ILLER,
  ]);
  const [illerYuklendi, setIllerYuklendi] = useState(false);
  const kullanimAcik =
    illerYuklendi && Boolean(sehir) && sehirKullanimAcikMi(sehir, acikIller);
  const [kalanSn, setKalanSn] = useState(YONLENDIRME_SN);

  useEffect(() => {
    let iptal = false;
    void fetch("/api/sehir-acilis")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (iptal) return;
        if (d?.acikIller && Array.isArray(d.acikIller)) {
          setAcikIller(d.acikIller.map(String));
        }
        setIllerYuklendi(true);
      })
      .catch(() => {
        if (!iptal) setIllerYuklendi(true);
      });
    return () => {
      iptal = true;
    };
  }, []);

  useEffect(() => {
    /* BirKez: formda gtag hazır olmadan gidildiyse burada tamamlanır */
    gtagCekiciKayitOnayGoruntule(sehir || undefined);
    let metaDonusum = true;
    try {
      if (sessionStorage.getItem(META_COMPLETE_REG_KEY) === "1") {
        metaDonusum = false;
      } else {
        sessionStorage.setItem(META_COMPLETE_REG_KEY, "1");
      }
    } catch {
      /* private mode — yine de dene */
    }
    if (metaDonusum) {
      const kayitUser = metaKayitUserOku();
      void metaPixelCompleteRegistration({
        content_name: "cekici_kayit",
        phone: kayitUser?.phone,
        firstName: kayitUser?.firstName,
        lastName: kayitUser?.lastName,
        externalId: kayitUser?.externalId,
      });
    }
    /* Funnel A yedek: formda kaçtıysa kayıt + hesap burada */
    void (async () => {
      await tiktokPixelKayitOl({ content_name: "cekici_kayit_a" });
      await tiktokPixelHesapOlustur({ content_name: "cekici_hesap_a" });
    })();
    posthogOlayYakala("cekici_kayit_onay", {
      rol: "cekici",
      ...(sehir ? { sehir } : {}),
    });
  }, [sehir]);

  useEffect(() => {
    if (!kullanimAcik) return;
    const tick = window.setInterval(() => {
      setKalanSn((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(tick);
  }, [kullanimAcik]);

  useEffect(() => {
    if (!kullanimAcik || kalanSn > 0) return;
    router.replace("/cekici/kredi");
  }, [kullanimAcik, kalanSn, router]);

  return (
    <MobileShell subtitle="Kayıt onayı">
      <div className="py-6 space-y-4">
        <div className="text-center">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl"
            aria-hidden
          >
            ✓
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Kayıt başarıyla tamamlandı
          </h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Acil Çözüm Bul’a hoş geldiniz
            {sehir ? (
              <>
                {" "}
                · <strong>{sehir}</strong>
              </>
            ) : null}
            .
          </p>
        </div>

        <Card
          className={
            !illerYuklendi
              ? "border-slate-200 bg-slate-50"
              : kullanimAcik
                ? "border-emerald-200 bg-emerald-50"
                : "border-amber-300 bg-amber-50"
          }
        >
          {!illerYuklendi ? (
            <p className="text-sm text-slate-600 leading-relaxed">
              Şehir durumu kontrol ediliyor…
            </p>
          ) : kullanimAcik ? (
            <p className="text-sm text-emerald-950 leading-relaxed">
              Şehriniz kullanıma açık. Kredi / abonelik paketini seçerek hemen
              başlayabilirsiniz.
            </p>
          ) : (
            <p className="text-sm text-amber-950 leading-relaxed">
              Kaydınız alındı. <strong>{sehir || "Şehriniz"}</strong> kullanıma
              açılana kadar paneli kullanamazsınız; sizi bekleme listesinde önde
              tutacağız. Şehriniz açılınca bilgilendirileceksiniz.
            </p>
          )}
        </Card>

        {kullanimAcik ? (
          <>
            <p className="text-center text-sm text-slate-500" role="status">
              {kalanSn > 0
                ? `${kalanSn} sn içinde kredi sayfasına yönlendirileceksiniz…`
                : "Yönlendiriliyor…"}
            </p>
            <Btn type="button" onClick={() => router.replace("/cekici/kredi")}>
              Kredi paketlerine git
            </Btn>
          </>
        ) : (
          <Btn type="button" variant="secondary" onClick={() => router.replace("/")}>
            Ana sayfaya dön
          </Btn>
        )}
      </div>
    </MobileShell>
  );
}

export default function KayitOnayPage() {
  return (
    <Suspense
      fallback={
        <MobileShell subtitle="Kayıt onayı">
          <p className="text-center text-slate-500 py-12">Yükleniyor…</p>
        </MobileShell>
      }
    >
      <OnayIcerik />
    </Suspense>
  );
}
