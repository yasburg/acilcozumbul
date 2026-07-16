"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { Btn, Card } from "@/components/ui";
import { sehirKullanimAcikMi } from "@/lib/cekici-sehir-acilis";

const YONLENDIRME_SN = 5;

function OnayIcerik() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sehir = (searchParams.get("sehir") ?? "").trim();
  const kullanimAcik = !sehir || sehirKullanimAcikMi(sehir);
  const [kalanSn, setKalanSn] = useState(YONLENDIRME_SN);

  useEffect(() => {
    const tick = window.setInterval(() => {
      setKalanSn((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    if (kalanSn > 0) return;
    router.replace("/cekici/panel");
  }, [kalanSn, router]);

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
            kullanimAcik
              ? "border-emerald-200 bg-emerald-50"
              : "border-amber-300 bg-amber-50"
          }
        >
          {kullanimAcik ? (
            <p className="text-sm text-emerald-950 leading-relaxed">
              Erken fazda İstanbul kontenjanındasınız. Panele geçerek bölgenizdeki
              talepleri görebilir, teklif verebilirsiniz.
            </p>
          ) : (
            <p className="text-sm text-amber-950 leading-relaxed">
              Kaydınız alındı. <strong>{sehir}</strong> kullanıma açılana kadar
              paneli kullanamazsınız; sizi bekleme listesinde önde tutacağız.
              Şehriniz açılınca bilgilendirileceksiniz.
            </p>
          )}
        </Card>

        <p className="text-center text-sm text-slate-500" role="status">
          {kalanSn > 0
            ? `${kalanSn} sn içinde çekici paneline yönlendirileceksiniz…`
            : "Yönlendiriliyor…"}
        </p>

        <Btn type="button" onClick={() => router.replace("/cekici/panel")}>
          Panele git
        </Btn>
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
