import { after, NextRequest, NextResponse } from "next/server";
import {
  demoCookieOturumId,
  demoOtomatikKabulIsleIfDue,
  demoSimuleOlay,
  demoTeklifKabulGecikmeSn,
  getAktifDemoOturum,
  type DemoSimuleOlay,
} from "@/lib/demo-oturum";
import { smsBaseUrl } from "@/lib/sms-base-url";

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
    return NextResponse.json(
      { error: "Aktif demo oturumu yok." },
      { status: 404 }
    );
  }

  try {
    const guncel = await demoSimuleOlay(oturum.id, olay);
    if (olay === "benim_teklifim" && guncel.durum.otomatikKabul) {
      const gecikmeSn = demoTeklifKabulGecikmeSn();
      const baseUrl = smsBaseUrl(
        `${request.nextUrl.protocol}//${request.nextUrl.host}`
      );
      const oturumId = guncel.id;
      after(() => {
        void (async () => {
          await new Promise((r) => setTimeout(r, gecikmeSn * 1000));
          const o = await getAktifDemoOturum(oturumId);
          if (o) await demoOtomatikKabulIsleIfDue(o, baseUrl);
        })().catch((e) => console.error("[demo] simule otomatik kabul", e));
      });
    }
    return NextResponse.json({
      mesaj:
        olay === "benim_teklifim"
          ? `Simülasyon uygulandı. ~${demoTeklifKabulGecikmeSn()} sn sonra teklif kabul edilecek.`
          : "Simülasyon uygulandı.",
      olay,
      anaTalepId: guncel.durum.anaTalepId,
      sms: guncel.durum.sms.slice(0, 5),
      otomatikKabulSn:
        olay === "benim_teklifim" ? demoTeklifKabulGecikmeSn() : undefined,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Simülasyon başarısız." },
      { status: 400 }
    );
  }
}
