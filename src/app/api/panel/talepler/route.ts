import { NextRequest, NextResponse } from "next/server";
import {
  getPanelTalepHaritaNoktalari,
  getPanelTalepOzet,
  getTaleplerSayfali,
} from "@/lib/db";
import { PANEL_TALEP_MIN_OLUSTURULMA } from "@/lib/panel-talep";
import { ensureSeedData } from "@/lib/seed";
import { simulasyonTalepIdSet } from "@/lib/simulasyon-ihale-db";

export async function GET(request: NextRequest) {
  await ensureSeedData();
  const { searchParams } = request.nextUrl;
  const since = PANEL_TALEP_MIN_OLUSTURULMA;

  if (searchParams.get("ozet") === "1") {
    const [ozet, noktalar] = await Promise.all([
      getPanelTalepOzet(since),
      getPanelTalepHaritaNoktalari(since),
    ]);
    return NextResponse.json({ ozet, noktalar, since });
  }

  const limit = Number(searchParams.get("limit") ?? "50");
  const offset = Number(searchParams.get("offset") ?? "0");
  const simHam = searchParams.get("sim") ?? "";
  const simulasyon =
    simHam === "sadece" || simHam === "haric" ? simHam : "";
  const { talepler, total } = await getTaleplerSayfali({
    limit: Number.isFinite(limit) ? limit : 50,
    offset: Number.isFinite(offset) ? offset : 0,
    sinceIso: since,
    simulasyon,
  });

  const simIds = await simulasyonTalepIdSet(talepler.map((t) => t.id));
  const taleplerPanel = talepler.map((t) => ({
    ...t,
    simulasyon: simIds.has(t.id),
  }));

  return NextResponse.json({
    talepler: taleplerPanel,
    total,
    since,
    limit: Math.min(Math.max(Number.isFinite(limit) ? limit : 50, 1), 200),
    offset: Math.max(Number.isFinite(offset) ? offset : 0, 0),
  });
}
