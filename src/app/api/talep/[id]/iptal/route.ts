import { NextRequest, NextResponse } from "next/server";
import { getTalepById, updateTalep } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import { getDogrulanmisTelefon } from "@/lib/musteri-auth";
import { telefonNormalize } from "@/lib/telefon";
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
      await demoMusteriTalepIptal(id, request);
      return NextResponse.json({ ok: true, durum: "iptal" });
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

  const dogrulanmis = await getDogrulanmisTelefon();
  if (!dogrulanmis || dogrulanmis !== telefonNormalize(talep.telefon)) {
    return NextResponse.json(
      { error: "Bu talebi iptal etmek için telefon doğrulaması gerekli." },
      { status: 403 }
    );
  }

  if (talep.durum === "iptal") {
    return NextResponse.json({ ok: true, durum: "iptal" });
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
  await updateTalep(talep);

  return NextResponse.json({ ok: true, durum: "iptal" });
}
