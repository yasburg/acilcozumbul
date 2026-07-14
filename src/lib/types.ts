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
  | "gizli"
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

export type HizmetBolgeModu = "il_ilce" | "konum";

/** Ruhsat / çekici belgesi admin onay akışı */
export type BelgeDurum = "yok" | "beklemede" | "onaylandi" | "reddedildi";

export type OdemeTipi = "kredi" | "rozet";

/** İl adı → seçili ilçe listesi */
export type HizmetBolgeleri = Record<string, string[]>;

export interface Cekici {
  id: string;
  ad: string;
  telefon: string;
  token: string;
  sifre: string;
  kredi: number;
  sehir: string;
  /** @deprecated hizmetBolgeleri kullanın */
  hizmetIlceleri?: string[];
  /** Çoklu il / ilçe seçimi */
  hizmetBolgeleri?: HizmetBolgeleri;
  hizmetModu?: HizmetBolgeModu;
  konumLat?: number;
  konumLng?: number;
  konumGuncelleme?: string;
  /** Konum modunda menzil (0–100 km) */
  menzilKm?: number;
  /** SMS alınacak sorun tipleri (boş = hiçbir tür için bildirim alınmaz) */
  hizmetSorunTipleri?: string[];
  aktif: boolean;
  kayitTarihi: string;
  faturaEposta?: string;
  faturaEpostaDogrulandi?: string;
  belgeRuhsatUrl?: string;
  belgeCekiciUrl?: string;
  belgeDurum?: BelgeDurum;
  belgeRedNedeni?: string;
  belgeGonderim?: string;
  rozetAktif?: boolean;
  rozetOdemeTarihi?: string;
  /** true ise yalnızca belirtilen saat/günlerde bildirim alır */
  musaitlikAktif?: boolean;
  musaitlikBaslangic?: string;
  musaitlikBitis?: string;
  /** 1=Pzt … 7=Paz; boş = her gün */
  musaitlikGunler?: number[];
  /**
   * true: talep gelince anlık SMS (2 kredi).
   * false: yalnızca panelde görünür (1 kredi, SMS yok).
   */
  premiumSmsAktif?: boolean;
  /** Paylaşılabilir davet / kupon kodu */
  davetKodu?: string;
  /** Kayıtta kullanılan davet kodunun sahibi */
  davetEdenId?: string;
}

export type OdemeFatura = {
  faturaEposta: string;
  faturaAdres?: string;
  faturaTcKimlik?: string;
  kurumsal: boolean;
  sirketUnvan?: string;
  vergiNo?: string;
};

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
  /** Örn. Audi A3 sedan — çekici taleplerinde */
  aracModeli?: string;
  /** Arıza / lastik / kaza fotoğraf URL'leri */
  fotografUrls?: string[];
  durum: TalepDurumu;
  olusturulma: string;
  ihaleBitis: string;
  kazananCekiciId?: string;
  kazananTeklifId?: string;
  bildirilenCekiciIds: string[];
  anlasmaDurumu?: AnlasmaDurumu;
  /** Anlaşma tamamlandığında (memnuniyet süresi başlangıcı) */
  anlasildiAt?: string;
  memnuniyetSmsGonderildi?: boolean;
  teklifler: Teklif[];
  haricTutulanCekiciIds?: string[];
}

export interface MusteriDegerlendirme {
  id: string;
  talepId: string;
  cekiciId: string;
  /** Genel ortalama (1–5) */
  puan: number;
  puanGenel: number;
  puanFiyat: number;
  puanSure: number;
  yorum?: string;
  olusturulma: string;
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
  hata?: string;
}

export interface BekleyenOdeme {
  id: string;
  cekiciId: string;
  miktar: number;
  tutar: number;
  paketTl?: number;
  listeFiyati?: number;
  odemeTipi?: OdemeTipi;
  olusturulma: string;
  durum: "bekliyor" | "tamamlandi";
  faturaEposta?: string;
  faturaAdres?: string;
  faturaTcKimlik?: string;
  kurumsal?: boolean;
  sirketUnvan?: string;
  vergiNo?: string;
}

export interface KrediOdeme {
  id: string;
  cekiciId: string;
  cekiciAd: string;
  cekiciTelefon: string;
  miktar: number;
  tutar: number;
  listeFiyati?: number;
  paketTl: number;
  faturaEposta: string;
  faturaAdres?: string;
  faturaTcKimlik?: string;
  kurumsal: boolean;
  sirketUnvan?: string;
  vergiNo?: string;
  odemeReferans?: string;
  garantiRespCode?: string;
  demoOdeme: boolean;
  olusturulma: string;
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
  /** SMS/katılım yok — panelde bulanık */
  gizli?: boolean;
}
