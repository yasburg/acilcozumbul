export type TalepDurumu =
  | "ihalede"
  | "kazanan_belli"
  | "anlaşıldı"
  | "yeniden_ihalede"
  | "iptal";

export type AnlasmaDurumu = "bekliyor" | "anlaşıldı" | "anlaşılamadı";

export type TeklifDurumu = "aktif" | "kazandi" | "kaybetti";

export type ListeDurumu =
  | "acik"
  | "teklif_verdim"
  | "kazandim"
  | "kaybettim"
  | "tercih_edilmedi"
  | "anlasildi";

export interface Konum {
  lat: number;
  lng: number;
  adres: string;
}

export interface Teklif {
  id: string;
  cekiciId: string;
  cekiciAd: string;
  fiyat: number;
  /** İlk verilen fiyat — değişiklik takibi */
  ilkFiyat?: number;
  fiyatDegisti?: boolean;
  fiyatGuncellemeTarihi?: string;
  tahminiSureDk: number;
  mesaj?: string;
  tarih: string;
  durum: TeklifDurumu;
}

export interface Cekici {
  id: string;
  ad: string;
  telefon: string;
  token: string;
  sifre: string;
  kredi: number;
  sehir: string;
  /** Hizmet verilen ilçeler (boş = bildirim alınmaz) */
  hizmetIlceleri?: string[];
  aktif: boolean;
  kayitTarihi: string;
}

export interface Talep {
  id: string;
  ad: string;
  soyad: string;
  telefon: string;
  konum: Konum;
  konumIl?: string;
  konumIlce?: string;
  hedefKonum?: Konum;
  sorun: string;
  sorunTipi?: string;
  sorunDetay?: string;
  durum: TalepDurumu;
  olusturulma: string;
  ihaleBitis: string;
  kazananCekiciId?: string;
  kazananTeklifId?: string;
  bildirilenCekiciIds: string[];
  anlasmaDurumu?: AnlasmaDurumu;
  teklifler: Teklif[];
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
  teklifSayisi?: number;
  enDusukTeklif?: number;
  benimTeklifim?: boolean;
  kazandim?: boolean;
  telefon?: string;
  listeDurumu?: ListeDurumu;
}
