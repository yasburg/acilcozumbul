"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { Btn, Card } from "@/components/ui";
import { formatKredi } from "@/lib/talep-utils";
import {
  odemeOnaySessionKey,
  type OdemeOnayKayit,
} from "@/lib/odeme-onay";
import { posthogOlayYakala } from "@/lib/posthog-client";

const YONLENDIRME_SN = 6;

export default function OdemeOnayPage() {
  const params = useParams();
  const router = useRouter();
  const odemeId = params.id as string;
  const [kalanSn, setKalanSn] = useState(YONLENDIRME_SN);
  const [kayit, setKayit] = useState<OdemeOnayKayit | null>(null);
  const [hazir, setHazir] = useState(false);

  useEffect(() => {
    let veri: OdemeOnayKayit | null = null;
    try {
      const raw = sessionStorage.getItem(odemeOnaySessionKey(odemeId));
      if (raw) {
        veri = JSON.parse(raw) as OdemeOnayKayit;
        sessionStorage.removeItem(odemeOnaySessionKey(odemeId));
      }
    } catch {
      /* ignore */
    }

    if (!veri) {
      router.replace("/cekici/panel?tab=hesabim");
      return;
    }

    setKayit(veri);
    setHazir(true);

    posthogOlayYakala("cekici_odeme_onay", {
      rol: "cekici",
      odeme_id: odemeId,
      odeme_tipi: veri.odemeTipi,
      odeme_durumu: "basarili",
      eklenen_kredi: veri.eklenenKredi,
    });
  }, [odemeId, router]);

  useEffect(() => {
    if (!hazir) return;
    const tick = window.setInterval(() => {
      setKalanSn((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(tick);
  }, [hazir]);

  useEffect(() => {
    if (!hazir || kalanSn > 0) return;
    router.replace("/cekici/panel?tab=hesabim");
  }, [kalanSn, hazir, router]);

  if (!hazir || !kayit) {
    return (
      <MobileShell subtitle="Ödeme onayı">
        <p className="text-center text-slate-500 py-12">Yükleniyor…</p>
      </MobileShell>
    );
  }

  const rozet = kayit.odemeTipi === "rozet";
  const abonelik = kayit.odemeTipi === "abonelik";

  return (
    <MobileShell subtitle="Ödeme onayı" showBrand={false}>
      <div className="py-6 space-y-4">
        <div className="text-center">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl"
            aria-hidden
          >
            ✓
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Ödeme başarıyla tamamlandı
          </h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            {rozet
              ? "Onaylı çekici rozetiniz aktifleştirildi."
              : abonelik
                ? "Aboneliğiniz aktif. Krediler hesabınıza yüklendi; her ay otomatik yenilenir."
                : "Kredileriniz hesabınıza yüklendi."}
          </p>
        </div>

        <Card className="border-emerald-200 bg-emerald-50">
          {rozet ? (
            <p className="text-sm text-emerald-950 leading-relaxed">
              Teklifleriniz müşteri listesinde öncelikli sıralanır. Panele
              dönerek taleplere devam edebilirsiniz.
            </p>
          ) : (
            <div className="space-y-2 text-sm text-emerald-950">
              {kayit.eklenenKredi != null && (
                <p>
                  Eklenen kredi:{" "}
                  <strong>{formatKredi(kayit.eklenenKredi)}</strong>
                </p>
              )}
              {kayit.toplamKredi != null && (
                <p>
                  Güncel bakiye:{" "}
                  <strong>{formatKredi(kayit.toplamKredi)}</strong>
                </p>
              )}
              {kayit.tutar != null && kayit.tutar > 0 && (
                <p className="text-emerald-800/80">Ödenen: {kayit.tutar} ₺</p>
              )}
            </div>
          )}
        </Card>

        <p className="text-center text-sm text-slate-500" role="status">
          {kalanSn > 0
            ? `${kalanSn} sn içinde panele yönlendirileceksiniz…`
            : "Yönlendiriliyor…"}
        </p>

        <Btn
          type="button"
          onClick={() => router.replace("/cekici/panel?tab=hesabim")}
        >
          Panele git
        </Btn>
      </div>
    </MobileShell>
  );
}
