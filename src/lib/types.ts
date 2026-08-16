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

export type KonumKaynak = "gps" | "manuel";

export interface Konum {
  lat: number;
  lng: number;
  adres: string;
  /** gps: cihaz konumu; manuel: il/ilçe dropdown veya yazılan adres */
  kaynak?: KonumKaynak;
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

/** Profil fotoğrafı inceleme durumu (belge ile aynı değerler) */
export type ProfilFotoDurum = BelgeDurum;

export type OdemeTipi = "kredi" | "rozet" | "abonelik";

export type AbonelikStatus =
  | "active"
  | "past_due"
  | "cancelled"
  | "expired"
  | "payment_failed";

export type AbonelikIslemTip =
  | "created"
  | "renewal"
  | "cancelled"
  | "payment_failed"
  | "expired"
  | "retry"
  | "period_end";

export interface CekiciAbonelik {
  id: string;
  cekiciId: string;
  paketTl: number;
  status: AbonelikStatus;
  garantiOrderId?: string;
  garantiOriginalRetrefNum?: string;
  garantiClientIp?: string;
  renewsAt?: string;
  endsAt?: string;
  subscribedAt: string;
  retryCount: number;
  nextRetryAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** İl adı → seçili ilçe listesi */
export type HizmetBolgeleri = Record<string, string[]>;

export interface Cekici {
  id: string;
  ad: string;
  telefon: string;
  token: string;
  /**
   * @deprecated Düz metin şifre — yalnızca hash yokken bir kez okunur, sonra silinir.
   */
  sifre: string;
  /** scrypt$N$r$p$salt$hash — API yanıtlarında dönülmez */
  sifreHash?: string;
  /** Eski Auth kullanıcı kimliği; artık cekici.id ile aynı olabilir */
  authUserId?: string;
  /** Satın alınan / hediye / kalıcı kredi (ay sonunda sıfırlanmaz) */
  kredi: number;
  /**
   * Aylık abonelik dönemi kredisi.
   * Yenilemede paket tutarına sıfırlanır; kullanılmayan kısım yanar.
   * Satın alınan `kredi` bakiyesine dokunulmaz.
   */
  abonelikKredi?: number;
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
  /** YYYY-MM-DD */
  dogumTarihi?: string;
  faturaEposta?: string;
  faturaEpostaDogrulandi?: string;
  belgeRuhsatUrl?: string;
  belgeCekiciUrl?: string;
  belgeDurum?: BelgeDurum;
  belgeRedNedeni?: string;
  belgeGonderim?: string;
  /** Onaya gönderilen / onaylı profil fotoğrafı URL */
  profilFotoUrl?: string;
  profilFotoDurum?: ProfilFotoDurum;
  profilFotoRedNedeni?: string;
  profilFotoGonderim?: string;
  rozetAktif?: boolean;
  rozetOdemeTarihi?: string;
  /** true ise yalnızca belirtilen saat/günlerde bildirim alır */
  musaitlikAktif?: boolean;
  musaitlikBaslangic?: string;
  musaitlikBitis?: string;
  /** 1=Pzt … 7=Paz; boş = her gün */
  musaitlikGunler?: number[];
  /**
   * @deprecated `bildirimSeviye` kullanın. Geriye uyum: seviye>=2 → true.
   */
  premiumSmsAktif?: boolean;
  /**
   * 1 = standart SMS (~dakika, 1 kredi)
   * 2 = hızlı SMS (~3 sn, 2 kredi)
   * 3 = sesli arama + hızlı SMS (3 kredi, varsayılan / önerilen)
   */
  bildirimSeviye?: 1 | 2 | 3;
  /** Paylaşılabilir davet / kupon kodu */
  davetKodu?: string;
  /** Kayıtta kullanılan davet kodunun sahibi */
  davetEdenId?: string;
  /** İç test hesabı — panel istatistiklerinden ayrı */
  testerHesap?: boolean;
  /** /kayit/{harf} funnel kimliği */
  kayitFunnel?: string;
  /**
   * false = hızlı kayıt sonrası kurulum eksik (soft-lock).
   * undefined/true = hazır (eski kayıtlar).
   */
  kurulumTamam?: boolean;
}

export type OdemeFatura = {
  faturaEposta?: string;
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
  /** Bekleme ekranında hedef bir kez değiştirildiyse true */
  hedefKonumDegistirildi?: boolean;
  /** Müşteri hedefi sonra seçecek — tahmini sürelere +30 dk */
  hedefBilinmiyor?: boolean;
  sorun: string;
  sorunTipi?: string;
  sorunDetay?: string;
  /** Örn. Audi A3 sedan — veya tip + durum birleşik metin */
  aracModeli?: string;
  /** sedan | suv | … */
  aracTipi?: string;
  /** calisiyor | calismiyor_bosa_aliniyor | … */
  aracDurumu?: string;
  /** lastik: yama | degisim */
  lastikDurumu?: string;
  /** yakit: benzin | dizel | lpg | elektrik */
  yakitTipi?: string;
  /** kilit: iceride | kayip | … */
  kilitDurumu?: string;
  /** Arıza / lastik / kaza fotoğraf URL'leri */
  fotografUrls?: string[];
  durum: TalepDurumu;
  olusturulma: string;
  /** Müşteri veya sistem iptal ettiği an */
  iptalAt?: string;
  ihaleBitis: string;
  kazananCekiciId?: string;
  kazananTeklifId?: string;
  bildirilenCekiciIds: string[];
  anlasmaDurumu?: AnlasmaDurumu;
  /** Anlaşma tamamlandığında (memnuniyet süresi başlangıcı) */
  anlasildiAt?: string;
  /** Kazanan çekici müşteri telefonuna ilk tıkladığında */
  musteriArandiAt?: string;
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
  /** İlk abonelik ödemesi veya tek seferlik kredi */
  odemeTipi?: "kredi" | "abonelik";
  faturaEposta?: string;
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
