import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { surusSuresiDk, googleMapsYapilandirildi } from "@/lib/google-maps";
import { koordinatGecerli, type LatLng } from "@/lib/koordinat";

function noktaOku(v: unknown): LatLng | null {
  if (!v || typeof v !== "object") return null;
  const o = v as { lat?: unknown; lng?: unknown };
  const lat = Number(o.lat);
  const lng = Number(o.lng);
  const n = { lat, lng };
  return koordinatGecerli(n) ? n : null;
}

export async function POST(request: NextRequest) {
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const cekiciKonum = noktaOku((body as { cekiciKonum?: unknown }).cekiciKonum);
  const musteriKonum = noktaOku((body as { musteriKonum?: unknown }).musteriKonum);
  const hedefKonum = noktaOku((body as { hedefKonum?: unknown }).hedefKonum);

  if (!cekiciKonum || !musteriKonum) {
    return NextResponse.json(
      { error: "Çekici ve müşteri konumu gerekli." },
      { status: 400 }
    );
  }

  const leg1 = await surusSuresiDk(cekiciKonum, musteriKonum);
  let musteriHedefDk: number | null = null;
  let leg2: Awaited<ReturnType<typeof surusSuresiDk>> | null = null;

  if (hedefKonum) {
    leg2 = await surusSuresiDk(musteriKonum, hedefKonum);
    musteriHedefDk = leg2.dk;
  }

  if (leg1.dk == null) {
    const detay = leg1.hata ?? "Bilinmeyen hata";
    return NextResponse.json(
      {
        error: `Rota süresi hesaplanamadı: ${detay}`,
        googleHata: leg1.googleHata ?? detay,
      },
      { status: 422 }
    );
  }

  const sizeMusteriDk = leg1.dk;

  if (hedefKonum && musteriHedefDk == null) {
    return NextResponse.json(
      {
        error: `Müşteri → hedef süresi hesaplanamadı: ${leg2?.hata ?? "bilinmeyen"}.`,
        googleHata: leg2?.googleHata,
        sizeMusteriDk,
        kaynak: leg1.kaynak,
      },
      { status: 422 }
    );
  }

  const toplamDk =
    sizeMusteriDk + (musteriHedefDk != null ? musteriHedefDk : 0);

  const kaynak =
    leg1.kaynak === "osrm" || leg2?.kaynak === "osrm" ? "osrm" : "google";

  return NextResponse.json({
    yapilandirildi: googleMapsYapilandirildi(),
    sizeMusteriDk,
    musteriHedefDk,
    toplamDk,
    hedefVar: !!hedefKonum,
    kaynak,
    googleUyari:
      kaynak === "osrm" && leg1.googleHata
        ? "Google Routes henüz projede kapalı; süre tahmini OSRM ile hesaplandı. Harita yine Google Embed kullanır."
        : undefined,
  });
}
