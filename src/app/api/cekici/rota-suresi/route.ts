import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import {
  surusSuresiCokNokta,
  googleMapsYapilandirildi,
} from "@/lib/google-maps";
import { koordinatGecerli, type LatLng } from "@/lib/koordinat";
import { yerelOrtamMi } from "@/lib/yerel-ortam";

function noktaOku(v: unknown): LatLng | null {
  if (!v || typeof v !== "object") return null;
  const o = v as { lat?: unknown; lng?: unknown };
  const lat = Number(o.lat);
  const lng = Number(o.lng);
  const n = { lat, lng };
  return koordinatGecerli(n) ? n : null;
}

function ayniNokta(a: LatLng, b: LatLng, eps = 1e-4): boolean {
  return Math.abs(a.lat - b.lat) < eps && Math.abs(a.lng - b.lng) < eps;
}

export async function POST(request: NextRequest) {
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const cekiciKonum = noktaOku((body as { cekiciKonum?: unknown }).cekiciKonum);
  const musteriKonum = noktaOku((body as { musteriKonum?: unknown }).musteriKonum);
  const hedefHam = noktaOku((body as { hedefKonum?: unknown }).hedefKonum);

  if (!cekiciKonum || !musteriKonum) {
    return NextResponse.json(
      { error: "Çekici ve müşteri konumu gerekli." },
      { status: 400 }
    );
  }

  /* Hedef müşteri ile aynıysa çekme bacağı yok */
  const hedefKonum =
    hedefHam && !ayniNokta(hedefHam, musteriKonum) ? hedefHam : null;

  /* Sıra: çekici → hizmet alan (arıza) → hedef */
  const noktalar: LatLng[] = hedefKonum
    ? [cekiciKonum, musteriKonum, hedefKonum]
    : [cekiciKonum, musteriKonum];

  const sonuc = await surusSuresiCokNokta(noktalar);

  if (sonuc.dk == null) {
    const detay = sonuc.hata ?? "Bilinmeyen hata";
    return NextResponse.json(
      {
        error: `Rota süresi hesaplanamadı: ${detay}`,
        googleHata: sonuc.googleHata ?? detay,
      },
      { status: 422 }
    );
  }

  const bacaklar = sonuc.bacaklarDk;
  let sizeMusteriDk: number;
  let musteriHedefDk: number | null = null;

  if (hedefKonum) {
    if (!bacaklar || bacaklar.length < 2) {
      return NextResponse.json(
        {
          error: "Müşteri → hedef süresi hesaplanamadı (bacaklar eksik).",
          googleHata: sonuc.googleHata,
          kaynak: sonuc.kaynak,
        },
        { status: 422 }
      );
    }
    sizeMusteriDk = bacaklar[0]!;
    musteriHedefDk = bacaklar[1]!;
  } else {
    sizeMusteriDk = bacaklar?.[0] ?? sonuc.dk;
  }

  const toplamDk =
    musteriHedefDk != null ? sizeMusteriDk + musteriHedefDk : sizeMusteriDk;

  return NextResponse.json({
    yapilandirildi: googleMapsYapilandirildi(),
    sizeMusteriDk,
    musteriHedefDk,
    toplamDk,
    hedefVar: !!hedefKonum,
    siralama: hedefKonum
      ? ["cekici", "hizmet_alan", "hedef"]
      : ["cekici", "hizmet_alan"],
    kaynak: sonuc.kaynak,
    googleUyari:
      yerelOrtamMi(request.headers.get("host")) &&
      sonuc.kaynak === "osrm" &&
      sonuc.googleHata
        ? "Google Routes henüz projede kapalı; süre tahmini OSRM ile hesaplandı. Harita yine Google Embed kullanır."
        : undefined,
  });
}
