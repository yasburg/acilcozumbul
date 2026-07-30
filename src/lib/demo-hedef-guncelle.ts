import type { NextRequest } from "next/server";
import {
  demoHedefKonumYaz,
  demoTalepGetir,
  isDemoTalepId,
} from "@/lib/demo-oturum";
import type { Konum } from "@/lib/types";

/** Demo oturumunda hedef konumu bir kez güncelle */
export async function demoHedefKonumGuncelle(
  talepId: string,
  hedef: Konum,
  request?: NextRequest
): Promise<{
  ok: true;
  hedefKonum: Konum;
  hedefKonumDegistirildi: true;
}> {
  if (!isDemoTalepId(talepId)) {
    throw new Error("Geçersiz demo talep.");
  }
  const ctx = await demoTalepGetir(talepId, request);
  if (!ctx) {
    throw new Error("Demo oturumu bulunamadı.");
  }
  if (ctx.talep.hedefKonumDegistirildi) {
    throw new Error(
      "Hedef adres yalnızca bir kez değiştirilebilir. Daha önce değiştirilmiş."
    );
  }
  if (ctx.talep.kazananCekiciId) {
    throw new Error("İhale kapandıktan sonra hedef değiştirilemez.");
  }

  await demoHedefKonumYaz(ctx.oturum, talepId, hedef);

  return {
    ok: true,
    hedefKonum: hedef,
    hedefKonumDegistirildi: true,
  };
}
