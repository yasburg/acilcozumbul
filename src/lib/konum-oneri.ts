export interface KonumOneri {
  ad: string;
  adres: string;
  lat: number;
  lng: number;
  mesafeKm?: number;
}

const SORUN_ARAMALARI: Record<string, string[]> = {
  ariza: ["oto sanayi", "oto servis", "yetkili servis"],
  lastik: ["lastikçi", "oto lastik", "mobil lastik"],
  aku: ["akü servisi", "oto elektrik", "oto sanayi"],
  yakit: ["benzin istasyonu", "oto sanayi"],
  kaza: ["oto sanayi", "oto kurtarma", "ekspertiz"],
  kilit: ["oto anahtar", "anahtarcı", "oto sanayi"],
  cekici: ["oto sanayi", "oto kurtarma", "çekici park"],
  diger: ["oto sanayi", "oto servis", "oto kurtarma"],
};

/** Sorun tipine göre araç çekilecek yer önerileri */
export async function hedefKonumOnerileri(
  lat: number,
  lng: number,
  sorunTipi = "diger"
): Promise<KonumOneri[]> {
  const oneriler: KonumOneri[] = [];
  const aramalar = SORUN_ARAMALARI[sorunTipi] ?? SORUN_ARAMALARI.diger;

  for (const q of aramalar) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=2&viewbox=${lng - 0.15},${lat + 0.15},${lng + 0.15},${lat - 0.15}&bounded=1&accept-language=tr`;
      const res = await fetch(url, {
        headers: { "User-Agent": "acilcozumbul.com/1.0" },
      });
      const data = await res.json();
      if (!Array.isArray(data)) continue;

      for (const item of data) {
        const itemLat = parseFloat(item.lat);
        const itemLng = parseFloat(item.lon);
        if (Number.isNaN(itemLat)) continue;

        const mesafeKm = haversineKm(lat, lng, itemLat, itemLng);
        oneriler.push({
          ad: item.name?.split(",")[0] ?? q,
          adres: item.display_name,
          lat: itemLat,
          lng: itemLng,
          mesafeKm: Math.round(mesafeKm * 10) / 10,
        });
      }
    } catch {
      /* atla */
    }
  }

  const benzersiz = new Map<string, KonumOneri>();
  for (const o of oneriler.sort((a, b) => (a.mesafeKm ?? 99) - (b.mesafeKm ?? 99))) {
    if (!benzersiz.has(o.adres)) benzersiz.set(o.adres, o);
  }

  return Array.from(benzersiz.values()).slice(0, 5);
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
