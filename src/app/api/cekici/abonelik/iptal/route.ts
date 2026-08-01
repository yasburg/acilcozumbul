import { NextResponse } from "next/server";
import {
  getAktifAbonelik,
  guncelleAbonelik,
  kaydetAbonelikIslem,
} from "@/lib/abonelik-db";
import { cekiciAbonelikKredisiniYak } from "@/lib/abonelik-yenileme";
import { getCurrentCekici } from "@/lib/auth";
import { tlTutarKurus } from "@/lib/kredi-fiyat";
import { garantiRecurringIptalDene } from "@/lib/garanti/recurring-iptal";
import { ensureSeedData } from "@/lib/seed";

export async function POST() {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const abonelik = await getAktifAbonelik(cekici.id);
  if (!abonelik) {
    return NextResponse.json(
      { error: "Aktif abonelik bulunamadı." },
      { status: 404 }
    );
  }

  let garantiSonuc: Awaited<ReturnType<typeof garantiRecurringIptalDene>> | null =
    null;
  if (abonelik.garantiOrderId) {
    garantiSonuc = await garantiRecurringIptalDene({
      orderId: abonelik.garantiOrderId,
      originalRetrefNum: abonelik.garantiOriginalRetrefNum,
      amountKurus: tlTutarKurus(abonelik.paketTl),
      clientIp: abonelik.garantiClientIp,
    });
    if (!garantiSonuc.basarili) {
      console.warn("[abonelik-iptal] Garanti stop başarısız/atlanmış", {
        abonelikId: abonelik.id,
        ...garantiSonuc,
      });
    }
  }

  const endsAt = new Date().toISOString();
  // renews_at korunur: dönem sonuna kadar abonelik kredisi kullanılabilir
  await guncelleAbonelik(abonelik.id, {
    status: "cancelled",
    endsAt,
    nextRetryAt: null,
  });

  await kaydetAbonelikIslem({
    abonelikId: abonelik.id,
    cekiciId: cekici.id,
    tip: "cancelled",
    tutarTl: 0,
    kredi: 0,
    garantiOrderId: abonelik.garantiOrderId,
    eventId: `cancelled_${abonelik.id}_${Date.now()}`,
  });

  const donemBitti =
    !abonelik.renewsAt || new Date(abonelik.renewsAt).getTime() <= Date.now();
  let abonelikKrediYakildi = false;
  if (donemBitti) {
    const r = await cekiciAbonelikKredisiniYak(
      { ...abonelik, status: "cancelled", endsAt },
      `period_end_${abonelik.id}`
    );
    abonelikKrediYakildi = r === "ok";
  }

  return NextResponse.json({
    success: true,
    status: "cancelled",
    endsAt,
    renewsAt: abonelik.renewsAt ?? null,
    abonelikKrediYakildi,
    mesaj: abonelikKrediYakildi
      ? "Abonelik iptal edildi. Kullanılmayan abonelik kredisi sıfırlandı; satın alınan krediler duruyor."
      : abonelik.renewsAt
        ? `Abonelik iptal edildi. Abonelik krediniz ${new Date(abonelik.renewsAt).toLocaleDateString("tr-TR")} tarihine kadar kullanılabilir; sonrasında sıfırlanır. Satın alınan krediler kalır.`
        : "Abonelik iptal edildi.",
    garantiIptal: garantiSonuc,
  });
}
