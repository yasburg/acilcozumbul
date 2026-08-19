import {
  noktaIlIlce,
  type CekiciAracTipiId,
  type CekiciDurumId,
  type LatLngNokta,
} from "./cekici-fiyat-hesaplama";
import type { MusteriFormTaslak } from "./musteri-form-taslak";

export function fiyatAracTipiMusteriye(id: CekiciAracTipiId): string {
  switch (id) {
    case "otomobil":
      return "sedan";
    case "suv":
      return "suv";
    case "hafif_ticari":
      return "minivan";
    case "motosiklet":
      return "motosiklet";
    default:
      return "diger";
  }
}

export function fiyatDurumMusteriye(id: CekiciDurumId): string {
  if (id === "standart") return "calisiyor";
  return "calismiyor_bosa_alinamiyor";
}

function noktaVeyaIlIlce(
  il: string,
  ilce: string,
  koordinat?: LatLngNokta | null
): LatLngNokta | null {
  if (
    koordinat &&
    Number.isFinite(koordinat.lat) &&
    Number.isFinite(koordinat.lng) &&
    (koordinat.lat !== 0 || koordinat.lng !== 0)
  ) {
    return koordinat;
  }
  return noktaIlIlce(il, ilce);
}

function adresMetni(il: string, ilce: string): string {
  return ilce ? `${ilce}, ${il}, Türkiye` : `${il}, Türkiye`;
}

/** Fiyat hesabı → araç nakliye talep taslağı (telefon OTP adımı). */
export function fiyatHesaplamaTalepTaslagi(opts: {
  cikisIl: string;
  cikisIlce: string;
  varisIl: string;
  varisIlce: string;
  cikisKoordinat?: LatLngNokta | null;
  varisKoordinat?: LatLngNokta | null;
  aracTipi: CekiciAracTipiId;
  durum: CekiciDurumId;
}): MusteriFormTaslak | null {
  const cikis = noktaVeyaIlIlce(
    opts.cikisIl,
    opts.cikisIlce,
    opts.cikisKoordinat
  );
  const varis = noktaVeyaIlIlce(
    opts.varisIl,
    opts.varisIlce,
    opts.varisKoordinat
  );
  if (!cikis || !varis) return null;

  return {
    v: 1,
    step: "telefon",
    form: {
      ad: "",
      soyad: "",
      telefon: "",
      lat: cikis.lat,
      lng: cikis.lng,
      adres: adresMetni(opts.cikisIl, opts.cikisIlce),
      konumKaynak: "manuel",
      hedefLat: varis.lat,
      hedefLng: varis.lng,
      hedefAdres: adresMetni(opts.varisIl, opts.varisIlce),
      sorunTipi: "arac-tasima",
      sorunDetay: "",
      aracTipi: fiyatAracTipiMusteriye(opts.aracTipi),
      aracModeli: "",
      aracDurumu: fiyatDurumMusteriye(opts.durum),
      lastikDurumu: "",
      yakitTipi: "",
      kilitDurumu: "",
    },
    yasalOnay: false,
    fotografOnizleme: [],
    fotografData: [],
    ihaleSureTipi: "acil",
  };
}
