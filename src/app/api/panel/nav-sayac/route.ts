import { NextResponse } from "next/server";
import {
  countCekiciler,
  countCekicilerBelgeDurum,
  countCekicilerProfilFotoDurum,
  countTalepler,
} from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";

/** Sol nav başlıkları yanındaki sayaçlar */
export async function GET() {
  await ensureSeedData();
  const [cekiciSayisi, talepSayisi, rozetTalepSayisi, profilFotoTalepSayisi] =
    await Promise.all([
      countCekiciler(),
      countTalepler(),
      countCekicilerBelgeDurum("beklemede"),
      countCekicilerProfilFotoDurum("beklemede"),
    ]);

  return NextResponse.json({
    cekiciSayisi,
    talepSayisi,
    rozetTalepSayisi,
    profilFotoTalepSayisi,
  });
}
