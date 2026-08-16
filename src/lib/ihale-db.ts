import type { Talep } from "./types";
import { updateTalep } from "./db";
import { setKaybedenTeklifler, updateTeklifDurum } from "./teklif-db";
import { refreshCekiciPuanOzet } from "./puan-ozet-db";

export async function kaybedenTeklifleriIsaretle(
  talep: Talep,
  kazananTeklifId: string
): Promise<void> {
  for (const teklif of talep.teklifler) {
    if (teklif.id !== kazananTeklifId && teklif.durum === "aktif") {
      teklif.durum = "kaybetti";
    }
  }
  await updateTalep(talep);
  try {
    await updateTeklifDurum(kazananTeklifId, "kazandi");
    await setKaybedenTeklifler(talep.id, kazananTeklifId);
    const kazanan = talep.teklifler.find((t) => t.id === kazananTeklifId);
    if (kazanan) await refreshCekiciPuanOzet(kazanan.cekiciId);
    for (const t of talep.teklifler) {
      if (t.id !== kazananTeklifId && t.cekiciId !== kazanan?.cekiciId) {
        await refreshCekiciPuanOzet(t.cekiciId).catch(() => {});
      }
    }
  } catch (e) {
    const code = e && typeof e === "object" && "code" in e ? String(e.code) : "";
    if (code !== "42P01" && code !== "PGRST205") throw e;
  }
}
