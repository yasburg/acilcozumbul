import {
  googleAcikHedefOnerileri,
  googleServisGrupOnerileri,
} from "./google-places";
import {
  mesafeKmHaversine,
  otoTamirAramaSorgusu,
  SERVIS_ONERI_GRUPLARI,
  SORUN_ARAMALARI,
  type HedefOneriSecenekleri,
  type KonumOneri,
} from "./hedef-oneri-data";

export type { HedefOneriSecenekleri, KonumOneri } from "./hedef-oneri-data";
export {
  SORUN_ARAMALARI,
  SERVIS_ONERI_GRUPLARI,
  otoTamirAramaSorgusu,
} from "./hedef-oneri-data";

export type HedefOneriKaynak = "google" | "nominatim" | "maps_scrape";

export interface HedefOneriSonuc {
  oneriler: KonumOneri[];
  kaynak: HedefOneriKaynak;
  /** Google Places openNow ile filtrelendi */
  acikFiltrelendi: boolean;
  /** Oto Tamir aramasında kullanılan semt / ilçe */
  semt?: string | null;
  hata?: string;
}

/** Nominatim (OpenStreetMap) — açık/kapalı bilgisi yok */
async function nominatimHedefOnerileri(
  lat: number,
  lng: number,
  sorunTipi: string,
  opts: HedefOneriSecenekleri = {}
): Promise<KonumOneri[]> {
  const limit = opts.limit ?? 3;
  const exclude = new Set(opts.excludeAdres ?? []);
  const aramalarBase = SORUN_ARAMALARI[sorunTipi] ?? SORUN_ARAMALARI.diger;
  const off =
    aramalarBase.length > 0
      ? ((opts.queryOffset ?? 0) % aramalarBase.length)
      : 0;
  const aramalar = [
    ...aramalarBase.slice(off),
    ...aramalarBase.slice(0, off),
  ];

  const oneriler: KonumOneri[] = [];
  const nominatimLimit = (opts.queryOffset ?? 0) > 0 ? 4 : 3;

  for (const q of aramalar) {
    if (oneriler.length >= limit + exclude.size) break;
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=${nominatimLimit}&viewbox=${lng - 0.15},${lat + 0.15},${lng + 0.15},${lat - 0.15}&bounded=1&accept-language=tr`;
      const res = await fetch(url, {
        headers: { "User-Agent": "acilcozumbul.com/1.0" },
      });
      const data = await res.json();
      if (!Array.isArray(data)) continue;

      for (const item of data) {
        const itemLat = parseFloat(item.lat);
        const itemLng = parseFloat(item.lon);
        if (Number.isNaN(itemLat)) continue;

        const adres = item.display_name as string;
        if (exclude.has(adres)) continue;

        oneriler.push({
          ad: item.name?.split(",")[0] ?? q,
          adres,
          lat: itemLat,
          lng: itemLng,
          mesafeKm:
            Math.round(mesafeKmHaversine(lat, lng, itemLat, itemLng) * 10) / 10,
        });
      }
    } catch {
      /* atla */
    }
  }

  const benzersiz = new Map<string, KonumOneri>();
  for (const o of oneriler.sort(
    (a, b) => (a.mesafeKm ?? 99) - (b.mesafeKm ?? 99)
  )) {
    if (!benzersiz.has(o.adres)) benzersiz.set(o.adres, o);
  }

  return Array.from(benzersiz.values()).slice(0, limit);
}

/** Nominatim: semt+şehir metin sorgusu çoğu zaman 0 döner; yedek sorgularla doldur */
function nominatimOtoTamirSorgulari(opts: {
  semt?: string;
  il?: string;
}): string[] {
  const birincil = otoTamirAramaSorgusu(opts);
  const liste = [birincil];
  if (opts.semt?.trim()) {
    liste.push(`Oto Tamir ${opts.semt.trim()}`);
    liste.push(`oto servis ${opts.semt.trim()}`);
  }
  liste.push("Oto Tamir", "oto servis");
  const gorulen = new Set<string>();
  return liste.filter((q) => {
    const k = q.toLocaleLowerCase("tr-TR");
    if (gorulen.has(k)) return false;
    gorulen.add(k);
    return true;
  });
}

async function nominatimServisGrupOnerileri(
  lat: number,
  lng: number,
  opts: { semt?: string; il?: string } = {}
): Promise<KonumOneri[]> {
  const kullanilan = new Set<string>();
  const sonuc: KonumOneri[] = [];

  for (const grup of SERVIS_ONERI_GRUPLARI) {
    try {
      const yaricap = grup.kategori === "oto_tamir" ? 0.12 : 0.1;
      const sorgular =
        grup.kategori === "oto_tamir"
          ? nominatimOtoTamirSorgulari(opts)
          : [grup.sorgu];
      const adaylar: KonumOneri[] = [];

      for (const sorgu of sorgular) {
        if (adaylar.length >= grup.limit * 2) break;
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(sorgu)}&format=json&limit=10&viewbox=${lng - yaricap},${lat + yaricap},${lng + yaricap},${lat - yaricap}&bounded=1&accept-language=tr`;
        const res = await fetch(url, {
          headers: { "User-Agent": "acilcozumbul.com/1.0" },
        });
        const data = await res.json();
        if (!Array.isArray(data)) continue;
        for (const item of data) {
          const itemLat = parseFloat(item.lat);
          const itemLng = parseFloat(item.lon);
          if (Number.isNaN(itemLat)) continue;
          const tip = typeof item.type === "string" ? item.type : "";
          if (
            grup.kategori === "oto_tamir" &&
            (tip === "car_wash" || tip === "fuel" || tip === "parking")
          ) {
            continue;
          }
          const adres = item.display_name as string;
          if (kullanilan.has(adres) || adaylar.some((a) => a.adres === adres)) {
            continue;
          }
          const hamAd =
            typeof item.name === "string" ? item.name.trim() : "";
          const ad =
            hamAd &&
            !/^(oto sanayi|oto tamir|oto servis)$/i.test(hamAd)
              ? hamAd
              : typeof item.display_name === "string"
                ? item.display_name.split(",")[0].trim()
                : grup.sorgu;
          adaylar.push({
            ad,
            adres,
            lat: itemLat,
            lng: itemLng,
            mesafeKm:
              Math.round(mesafeKmHaversine(lat, lng, itemLat, itemLng) * 10) /
              10,
            kategori: grup.kategori,
          });
        }
      }

      adaylar.sort((a, b) => (a.mesafeKm ?? 99) - (b.mesafeKm ?? 99));
      let no = 0;
      for (const o of adaylar) {
        if (no >= grup.limit) break;
        kullanilan.add(o.adres);
        no += 1;
        sonuc.push({ ...o, etiketNo: no });
      }
    } catch {
      /* atla */
    }
  }

  return sonuc;
}

/** Önce Google (şu an açık), yoksa Nominatim yedek */
export async function hedefKonumOnerileri(
  lat: number,
  lng: number,
  sorunTipi = "diger",
  opts: HedefOneriSecenekleri = {}
): Promise<HedefOneriSonuc> {
  const google = await googleAcikHedefOnerileri(lat, lng, sorunTipi, opts);

  if (google.oneriler.length > 0) {
    return {
      oneriler: google.oneriler,
      kaynak: "google",
      acikFiltrelendi: true,
    };
  }

  const nominatim = await nominatimHedefOnerileri(lat, lng, sorunTipi, opts);
  return {
    oneriler: nominatim,
    kaynak: "nominatim",
    acikFiltrelendi: false,
  };
}

/** 5 Oto Tamir (semt+şehir) + 3 oto sanayi */
export async function hedefServisGrupOnerileri(
  lat: number,
  lng: number,
  opts: HedefOneriSecenekleri = {}
): Promise<HedefOneriSonuc> {
  const semt = opts.semt?.trim() || null;
  const il = opts.il?.trim() || null;
  const google = await googleServisGrupOnerileri(lat, lng, opts);

  const googleTamir = google.oneriler.filter((o) => o.kategori === "oto_tamir");
  const googleSanayi = google.oneriler.filter(
    (o) => o.kategori === "oto_sanayi"
  );
  if (google.oneriler.length > 0 && googleTamir.length > 0) {
    let oneriler = google.oneriler;
    if (googleSanayi.length === 0) {
      const nominatim = await nominatimServisGrupOnerileri(lat, lng, {
        semt: semt ?? undefined,
        il: il ?? undefined,
      });
      const ekSanayi = nominatim
        .filter((o) => o.kategori === "oto_sanayi")
        .slice(0, 3);
      if (ekSanayi.length) oneriler = [...google.oneriler, ...ekSanayi];
    }
    return {
      oneriler,
      kaynak:
        google.kaynakDetay === "maps_scrape" ? "maps_scrape" : "google",
      acikFiltrelendi: google.kaynakDetay !== "maps_scrape",
      semt: google.semt ?? semt,
      hata: google.hata,
    };
  }

  /* Google yalnız sanayi döndüyse oto tamir için Nominatim ile tamamla */
  if (google.oneriler.length > 0 && googleTamir.length === 0) {
    const nominatim = await nominatimServisGrupOnerileri(lat, lng, {
      semt: semt ?? undefined,
      il: il ?? undefined,
    });
    const tamir = nominatim.filter((o) => o.kategori === "oto_tamir");
    const kullanilan = new Set(
      google.oneriler.map((o) => o.placeId ?? o.adres)
    );
    const eklenen: KonumOneri[] = [];
    for (const o of tamir) {
      if (eklenen.length >= 5) break;
      const anahtar = o.placeId ?? o.adres;
      if (kullanilan.has(anahtar)) continue;
      kullanilan.add(anahtar);
      eklenen.push(o);
    }
    return {
      oneriler: [...eklenen, ...google.oneriler],
      kaynak: eklenen.length ? "nominatim" : "google",
      acikFiltrelendi: eklenen.length === 0,
      semt: google.semt ?? semt,
      hata: google.hata,
    };
  }

  const nominatim = await nominatimServisGrupOnerileri(lat, lng, {
    semt: semt ?? undefined,
    il: il ?? undefined,
  });
  return {
    oneriler: nominatim,
    kaynak: "nominatim",
    acikFiltrelendi: false,
    semt,
    hata: google.hata,
  };
}
