export type TalepDurumu =
  | "beklemede"
  | "satın_alındı"
  | "anlaşıldı"
  | "yeniden_aranıyor";

export type AnlasmaDurumu = "bekliyor" | "anlaşıldı" | "anlaşılamadı";

export type ListeDurumu =
  | "acik"
  | "benim"
  | "baskasi_aldi"
  | "tercih_edilmedi"
  | "anlasildi";

export interface Konum {
  lat: number;
  lng: number;
  adres: string;
}

export interface SatinAlmaGecmisi {
  cekiciId: string;
  tarih: string;
  tercihEdilmedi?: boolean;
}

export interface Cekici {
  id: string;
  ad: string;
  telefon: string;
  token: string;
  sifre: string;
  kredi: number;
  sehir: string;
  aktif: boolean;
  kayitTarihi: string;
}

export interface Talep {
  id: string;
  ad: string;
  soyad: string;
  telefon: string;
  konum: Konum;
  sorun: string;
  sorunTipi?: string;
  sorunDetay?: string;
  durum: TalepDurumu;
  olusturulma: string;
  satinAlanCekiciId?: string;
  satinAlmaTarihi?: string;
  bildirilenCekiciIds: string[];
  anlasmaDurumu?: AnlasmaDurumu;
  satinAlmaGecmisi?: SatinAlmaGecmisi[];
  haricTutulanCekiciIds?: string[];
}

export interface SmsKaydi {
  id: string;
  cekiciId: string;
  cekiciTelefon: string;
  mesaj: string;
  link: string;
  talepId: string;
  gonderim: string;
  aliciTipi?: "cekici" | "musteri";
  gonderildi?: boolean;
  saglayici?: string;
}

export interface BekleyenOdeme {
  id: string;
  cekiciId: string;
  miktar: number;
  tutar: number;
  olusturulma: string;
  durum: "bekliyor" | "tamamlandi";
}

export interface TalepOzet {
  id: string;
  ad: string;
  soyad: string;
  bolge: string;
  sorunOzet: string;
  durum: TalepDurumu;
  olusturulma: string;
  satinAlindi?: boolean;
  benimMusterim?: boolean;
  anlasmaDurumu?: AnlasmaDurumu;
  telefon?: string;
  listeDurumu?: ListeDurumu;
}
