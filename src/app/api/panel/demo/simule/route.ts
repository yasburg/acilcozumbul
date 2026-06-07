import { NextRequest, NextResponse } from "next/server";
import {
  demoCookieOturumId,
  demoSimuleOlay,
  getAktifDemoOturum,
  type DemoSimuleOlay,
} from "@/lib/demo-oturum";

const GECERLI: DemoSimuleOlay[] = [
  "yeni_ihale_gizli",
  "ihaleyi_ac",
  "rakip_teklif",
  "benim_teklifim",
  "musteri_secti",
  "musteri_yeni_teklif_sms",
];

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const olay = body.olay as DemoSimuleOlay;

  if (!GECERLI.includes(olay)) {
    return NextResponse.json({ error: "Geçersiz olay." }, { status: 400 });
  }

  const id = await demoCookieOturumId();
  const oturum = await getAktifDemoOturum(id);
  if (!oturum) {
    return NextResponse.json({ error: "Aktif demo oturumu yok." }, { status: 404 });
  }

  try {
    const guncel = await demoSimuleOlay(oturum.id, olay);
    return NextResponse.json({
      mesaj: "Simülasyon uygulandı.",
      olay,
      anaTalepId: guncel.durum.anaTalepId,
      sms: guncel.durum.sms.slice(0, 5),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Simülasyon başarısız." },
      { status: 400 }
    );
  }
}
