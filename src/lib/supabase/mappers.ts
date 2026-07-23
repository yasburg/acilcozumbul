import type {
  BekleyenOdeme,
  Cekici,
  HizmetBolgeleri,
  HizmetBolgeModu,
  KrediOdeme,
  Konum,
  SmsKaydi,
  Talep,
  Teklif,
} from "../types";
import {
  hizmetBolgeleriFlatten,
  normalizeHizmetBolgeleri,
} from "../cekici-hizmet-bolge";

export type CekiciRow = {
  id: string;
  ad: string;
  telefon: string;
  token: string;
  sifre: string | null;
  auth_user_id?: string | null;
  kredi: number;
  sehir: string;
  hizmet_ilceleri: string[];
  hizmet_bolgeleri?: HizmetBolgeleri | null;
  hizmet_modu?: string | null;
  konum_lat?: number | null;
  konum_lng?: number | null;
  konum_guncelleme?: string | null;
  menzil_km?: number | null;
  hizmet_sorun_tipleri: string[];
  aktif: boolean;
  kayit_tarihi: string;
  dogum_tarihi?: string | null;
  fatura_eposta?: string | null;
  fatura_eposta_dogrulandi?: string | null;
  belge_ruhsat_url?: string | null;
  belge_cekici_url?: string | null;
  belge_durum?: string | null;
  belge_red_nedeni?: string | null;
  belge_gonderim?: string | null;
  rozet_aktif?: boolean | null;
  rozet_odeme_tarihi?: string | null;
  musaitlik_aktif?: boolean | null;
  musaitlik_baslangic?: string | null;
  musaitlik_bitis?: string | null;
  musaitlik_gunler?: number[] | null;
  premium_sms_aktif?: boolean | null;
  davet_kodu?: string | null;
  davet_eden_id?: string | null;
  tester_hesap?: boolean | null;
  kayit_funnel?: string | null;
  kurulum_tamam?: boolean | null;
};

export type TalepRow = {
  id: string;
  ad: string;
  soyad: string;
  telefon: string;
  konum: Konum;
  konum_il: string | null;
  konum_ilce: string | null;
  hedef_konum: Konum | null;
  sorun: string;
  sorun_tipi: string | null;
  sorun_detay: string | null;
  arac_modeli: string | null;
  fotograf_urls: string[];
  durum: string;
  olusturulma: string;
  ihale_bitis: string;
  kazanan_cekici_id: string | null;
  kazanan_teklif_id: string | null;
  /** @deprecated normalize: talep_bildirimleri — migration öncesi fallback */
  bildirilen_cekici_ids?: string[] | null;
  anlasma_durumu: string | null;
  anlasildi_at: string | null;
  memnuniyet_sms_gonderildi: boolean;
  /** @deprecated normalize: talep_haric — migration öncesi fallback */
  haric_tutulan_cekici_ids?: string[] | null;
  /** @deprecated normalize: teklifler tablosu — migration öncesi fallback */
  teklifler?: Teklif[] | null;
};

export function cekiciFromRow(r: CekiciRow): Cekici {
  const hizmetBolgeleri = normalizeHizmetBolgeleri(
    (r.hizmet_bolgeleri as HizmetBolgeleri | undefined) ?? undefined,
    r.sehir,
    r.hizmet_ilceleri ?? []
  );
  const mod: HizmetBolgeModu =
    r.hizmet_modu === "konum" ? "konum" : "il_ilce";

  return {
    id: r.id,
    ad: r.ad,
    telefon: r.telefon,
    token: r.token,
    sifre: r.sifre ?? "",
    authUserId: r.auth_user_id ?? undefined,
    kredi: Number(r.kredi),
    sehir: r.sehir,
    hizmetIlceleri: hizmetBolgeleriFlatten(hizmetBolgeleri),
    hizmetBolgeleri,
    hizmetModu: mod,
    konumLat: r.konum_lat ?? undefined,
    konumLng: r.konum_lng ?? undefined,
    konumGuncelleme: r.konum_guncelleme ?? undefined,
    menzilKm: r.menzil_km != null ? Number(r.menzil_km) : 30,
    hizmetSorunTipleri: r.hizmet_sorun_tipleri ?? [],
    aktif: r.aktif,
    kayitTarihi: r.kayit_tarihi,
    dogumTarihi: r.dogum_tarihi ?? undefined,
    faturaEposta: r.fatura_eposta ?? undefined,
    faturaEpostaDogrulandi: r.fatura_eposta_dogrulandi ?? undefined,
    belgeRuhsatUrl: r.belge_ruhsat_url ?? undefined,
    belgeCekiciUrl: r.belge_cekici_url ?? undefined,
    belgeDurum: (r.belge_durum as Cekici["belgeDurum"]) ?? "yok",
    belgeRedNedeni: r.belge_red_nedeni ?? undefined,
    belgeGonderim: r.belge_gonderim ?? undefined,
    rozetAktif: Boolean(r.rozet_aktif),
    rozetOdemeTarihi: r.rozet_odeme_tarihi ?? undefined,
    musaitlikAktif: Boolean(r.musaitlik_aktif),
    musaitlikBaslangic: r.musaitlik_baslangic ?? undefined,
    musaitlikBitis: r.musaitlik_bitis ?? undefined,
    musaitlikGunler: r.musaitlik_gunler ?? undefined,
    premiumSmsAktif: r.premium_sms_aktif !== false,
    davetKodu: r.davet_kodu ?? undefined,
    davetEdenId: r.davet_eden_id ?? undefined,
    testerHesap: Boolean(r.tester_hesap),
    kayitFunnel: r.kayit_funnel ?? undefined,
    kurulumTamam: r.kurulum_tamam !== false,
  };
}

export function cekiciToRow(
  c: Cekici,
  opts?: { migrationsOnly?: boolean }
): CekiciRow {
  const bolgeler = normalizeHizmetBolgeleri(
    c.hizmetBolgeleri,
    c.sehir,
    c.hizmetIlceleri
  );
  const row: CekiciRow = {
    id: c.id,
    ad: c.ad,
    telefon: c.telefon,
    token: c.token,
    sifre: c.sifre || null,
    auth_user_id: c.authUserId ?? null,
    kredi: c.kredi,
    sehir: c.sehir,
    hizmet_ilceleri: hizmetBolgeleriFlatten(bolgeler),
    hizmet_bolgeleri: bolgeler,
    hizmet_modu: c.hizmetModu ?? "il_ilce",
    konum_lat: c.konumLat ?? null,
    konum_lng: c.konumLng ?? null,
    konum_guncelleme: c.konumGuncelleme ?? null,
    menzil_km: c.menzilKm ?? 30,
    hizmet_sorun_tipleri: c.hizmetSorunTipleri ?? [],
    aktif: c.aktif,
    kayit_tarihi: c.kayitTarihi,
    dogum_tarihi: c.dogumTarihi ?? null,
    fatura_eposta: c.faturaEposta ?? null,
    fatura_eposta_dogrulandi: c.faturaEpostaDogrulandi ?? null,
    belge_ruhsat_url: c.belgeRuhsatUrl ?? null,
    belge_cekici_url: c.belgeCekiciUrl ?? null,
    belge_durum: c.belgeDurum ?? "yok",
    belge_red_nedeni: c.belgeRedNedeni ?? null,
    belge_gonderim: c.belgeGonderim ?? null,
    rozet_aktif: c.rozetAktif ?? false,
    rozet_odeme_tarihi: c.rozetOdemeTarihi ?? null,
    musaitlik_aktif: c.musaitlikAktif ?? false,
    musaitlik_baslangic: c.musaitlikBaslangic ?? null,
    musaitlik_bitis: c.musaitlikBitis ?? null,
    musaitlik_gunler: c.musaitlikGunler ?? null,
    premium_sms_aktif: c.premiumSmsAktif !== false,
    tester_hesap: c.testerHesap ?? false,
    kayit_funnel: c.kayitFunnel ?? null,
    kurulum_tamam: c.kurulumTamam !== false,
  };
  if (!opts?.migrationsOnly) {
    row.davet_kodu = c.davetKodu ?? null;
    row.davet_eden_id = c.davetEdenId ?? null;
  }
  return row;
}

export function talepFromRow(r: TalepRow): Talep {
  return {
    id: r.id,
    ad: r.ad,
    soyad: r.soyad,
    telefon: r.telefon,
    konum: r.konum,
    konumIl: r.konum_il ?? undefined,
    konumIlce: r.konum_ilce ?? undefined,
    hedefKonum: r.hedef_konum ?? undefined,
    sorun: r.sorun,
    sorunTipi: r.sorun_tipi ?? undefined,
    sorunDetay: r.sorun_detay ?? undefined,
    aracModeli: r.arac_modeli ?? undefined,
    fotografUrls: r.fotograf_urls?.length ? r.fotograf_urls : undefined,
    durum: r.durum as Talep["durum"],
    olusturulma: r.olusturulma,
    ihaleBitis: r.ihale_bitis,
    kazananCekiciId: r.kazanan_cekici_id ?? undefined,
    kazananTeklifId: r.kazanan_teklif_id ?? undefined,
    bildirilenCekiciIds: r.bildirilen_cekici_ids ?? [],
    anlasmaDurumu: (r.anlasma_durumu as Talep["anlasmaDurumu"]) ?? undefined,
    anlasildiAt: r.anlasildi_at ?? undefined,
    memnuniyetSmsGonderildi: r.memnuniyet_sms_gonderildi ?? false,
    haricTutulanCekiciIds: r.haric_tutulan_cekici_ids ?? [],
    teklifler: r.teklifler ?? [],
  };
}

/** Talep satırı — ilişkili diziler ayrı tablolarda; JSON kolonları yazılmaz. */
export function talepToRow(t: Talep): Record<string, unknown> {
  return {
    id: t.id,
    ad: t.ad,
    soyad: t.soyad,
    telefon: t.telefon,
    konum: t.konum,
    konum_il: t.konumIl ?? null,
    konum_ilce: t.konumIlce ?? null,
    hedef_konum: t.hedefKonum ?? null,
    sorun: t.sorun,
    sorun_tipi: t.sorunTipi ?? null,
    sorun_detay: t.sorunDetay ?? null,
    arac_modeli: t.aracModeli ?? null,
    fotograf_urls: t.fotografUrls ?? [],
    durum: t.durum,
    olusturulma: t.olusturulma,
    ihale_bitis: t.ihaleBitis,
    kazanan_cekici_id: t.kazananCekiciId ?? null,
    kazanan_teklif_id: t.kazananTeklifId ?? null,
    anlasma_durumu: t.anlasmaDurumu ?? null,
    anlasildi_at: t.anlasildiAt ?? null,
    memnuniyet_sms_gonderildi: t.memnuniyetSmsGonderildi ?? false,
  };
}

export type SmsLogRow = {
  id: string;
  cekici_id: string;
  cekici_telefon: string;
  mesaj: string;
  link: string;
  talep_id: string;
  gonderim: string;
  alici_tipi: string | null;
  gonderildi: boolean;
  saglayici: string | null;
  hata: string | null;
};

export function smsFromRow(r: SmsLogRow): SmsKaydi {
  return {
    id: r.id,
    cekiciId: r.cekici_id,
    cekiciTelefon: r.cekici_telefon,
    mesaj: r.mesaj,
    link: r.link,
    talepId: r.talep_id,
    gonderim: r.gonderim,
    aliciTipi: (r.alici_tipi as SmsKaydi["aliciTipi"]) ?? undefined,
    gonderildi: r.gonderildi,
    saglayici: r.saglayici ?? undefined,
    hata: r.hata ?? undefined,
  };
}

export function smsToRow(s: SmsKaydi): SmsLogRow {
  return {
    id: s.id,
    cekici_id: s.cekiciId,
    cekici_telefon: s.cekiciTelefon,
    mesaj: s.mesaj,
    link: s.link,
    talep_id: s.talepId,
    gonderim: s.gonderim,
    alici_tipi: s.aliciTipi ?? null,
    gonderildi: s.gonderildi ?? false,
    saglayici: s.saglayici ?? null,
    hata: s.hata ?? null,
  };
}

export type OdemeRow = {
  id: string;
  cekici_id: string;
  miktar: number;
  tutar: number;
  paket_tl?: number | null;
  olusturulma: string;
  durum: string;
  fatura_eposta?: string | null;
  fatura_adres?: string | null;
  fatura_tc_kimlik?: string | null;
  kurumsal?: boolean | null;
  sirket_unvan?: string | null;
  vergi_no?: string | null;
  odeme_tipi?: string | null;
  liste_fiyati?: number | null;
};

export function odemeFromRow(r: OdemeRow): BekleyenOdeme {
  return {
    id: r.id,
    cekiciId: r.cekici_id,
    miktar: Number(r.miktar),
    tutar: Number(r.tutar),
    paketTl: r.paket_tl != null ? Number(r.paket_tl) : undefined,
    listeFiyati:
      r.liste_fiyati != null
        ? Number(r.liste_fiyati)
        : r.paket_tl != null
          ? Number(r.paket_tl)
          : undefined,
    odemeTipi: (r.odeme_tipi === "rozet" ? "rozet" : "kredi") as BekleyenOdeme["odemeTipi"],
    olusturulma: r.olusturulma,
    durum: r.durum as BekleyenOdeme["durum"],
    faturaEposta: r.fatura_eposta ?? undefined,
    faturaAdres: r.fatura_adres ?? undefined,
    faturaTcKimlik: r.fatura_tc_kimlik ?? undefined,
    kurumsal: r.kurumsal ?? false,
    sirketUnvan: r.sirket_unvan ?? undefined,
    vergiNo: r.vergi_no ?? undefined,
  };
}

export function odemeToRow(o: BekleyenOdeme): OdemeRow {
  return {
    id: o.id,
    cekici_id: o.cekiciId,
    miktar: o.miktar,
    tutar: o.tutar,
    paket_tl: o.paketTl ?? null,
    liste_fiyati: o.listeFiyati ?? null,
    odeme_tipi: o.odemeTipi ?? "kredi",
    olusturulma: o.olusturulma,
    durum: o.durum,
    fatura_eposta: o.faturaEposta ?? null,
    fatura_adres: o.faturaAdres ?? null,
    fatura_tc_kimlik: o.faturaTcKimlik ?? null,
    kurumsal: o.kurumsal ?? false,
    sirket_unvan: o.sirketUnvan ?? null,
    vergi_no: o.vergiNo ?? null,
  };
}

export type KrediOdemeRow = {
  id: string;
  cekici_id: string;
  cekici_ad: string;
  cekici_telefon: string;
  miktar: number;
  tutar: number;
  liste_fiyati: number | null;
  paket_tl: number;
  fatura_eposta: string;
  fatura_adres: string | null;
  fatura_tc_kimlik: string | null;
  kurumsal: boolean;
  sirket_unvan: string | null;
  vergi_no: string | null;
  odeme_referans: string | null;
  garanti_resp_code: string | null;
  demo_odeme: boolean;
  olusturulma: string;
};

export function krediOdemeFromRow(r: KrediOdemeRow): KrediOdeme {
  return {
    id: r.id,
    cekiciId: r.cekici_id,
    cekiciAd: r.cekici_ad,
    cekiciTelefon: r.cekici_telefon,
    miktar: Number(r.miktar),
    tutar: Number(r.tutar),
    listeFiyati: r.liste_fiyati != null ? Number(r.liste_fiyati) : undefined,
    paketTl: Number(r.paket_tl),
    faturaEposta: r.fatura_eposta,
    faturaAdres: r.fatura_adres ?? undefined,
    faturaTcKimlik: r.fatura_tc_kimlik ?? undefined,
    kurumsal: r.kurumsal,
    sirketUnvan: r.sirket_unvan ?? undefined,
    vergiNo: r.vergi_no ?? undefined,
    odemeReferans: r.odeme_referans ?? undefined,
    garantiRespCode: r.garanti_resp_code ?? undefined,
    demoOdeme: r.demo_odeme,
    olusturulma: r.olusturulma,
  };
}

export function krediOdemeToRow(k: KrediOdeme): KrediOdemeRow {
  return {
    id: k.id,
    cekici_id: k.cekiciId,
    cekici_ad: k.cekiciAd,
    cekici_telefon: k.cekiciTelefon,
    miktar: k.miktar,
    tutar: k.tutar,
    liste_fiyati: k.listeFiyati ?? null,
    paket_tl: k.paketTl,
    fatura_eposta: k.faturaEposta,
    fatura_adres: k.faturaAdres ?? null,
    fatura_tc_kimlik: k.faturaTcKimlik ?? null,
    kurumsal: k.kurumsal,
    sirket_unvan: k.sirketUnvan ?? null,
    vergi_no: k.vergiNo ?? null,
    odeme_referans: k.odemeReferans ?? null,
    garanti_resp_code: k.garantiRespCode ?? null,
    demo_odeme: k.demoOdeme,
    olusturulma: k.olusturulma,
  };
}

export type OtpRow = {
  telefon: string;
  kod: string;
  olusturulma: string;
  son_gonderim: string;
  deneme: number;
  dogrulandi: boolean;
};
