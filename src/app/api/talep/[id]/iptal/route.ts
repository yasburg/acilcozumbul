import { NextRequest, NextResponse } from "next/server";
import { getTalepById, updateTalep } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import {
  demoMusteriTalepIptal,
  isDemoTalepId,
} from "@/lib/demo-oturum";

const IPTAL_EDILEBILIR: ReadonlySet<string> = new Set([
  "ihalede",
  "yeniden_ihalede",
]);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSeedData();
  const { id } = await params;

  if (isDemoTalepId(id)) {
    try {
      const t = await demoMusteriTalepIptal(id, request);
      return NextResponse.json({
        ok: true,
        durum: "iptal",
        iptalAt: t.iptalAt,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "İptal edilemedi.";
      const status = msg.includes("bulunamadı") ? 404 : 400;
      return NextResponse.json({ error: msg }, { status });
    }
  }

  const talep = await getTalepById(id);
  if (!talep) {
    return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  }

  if (talep.durum === "iptal") {
    return NextResponse.json({
      ok: true,
      durum: "iptal",
      iptalAt: talep.iptalAt,
    });
  }

  if (!IPTAL_EDILEBILIR.has(talep.durum)) {
    return NextResponse.json(
      {
        error:
          "Bu talep artık iptal edilemez. Çekici seçildiyse veya iş tamamlandıysa iptal kapalıdır.",
      },
      { status: 409 }
    );
  }

  talep.durum = "iptal";
  talep.iptalAt = talep.iptalAt ?? new Date().toISOString();
  await updateTalep(talep);

  return NextResponse.json({ ok: true, durum: "iptal", iptalAt: talep.iptalAt });
}
