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
  sifre: string;
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
  fatura_eposta?: string | null;
  fatura_eposta_dogrulandi?: string | null;
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
  durum: string;
  olusturulma: string;
  ihale_bitis: string;
  kazanan_cekici_id: string | null;
  kazanan_teklif_id: string | null;
  bildirilen_cekici_ids: string[];
  anlasma_durumu: string | null;
  anlasildi_at: string | null;
  memnuniyet_sms_gonderildi: boolean;
  haric_tutulan_cekici_ids: string[];
  teklifler: Teklif[];
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
    sifre: r.sifre,
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
    faturaEposta: r.fatura_eposta ?? undefined,
    faturaEpostaDogrulandi: r.fatura_eposta_dogrulandi ?? undefined,
  };
}

export function cekiciToRow(c: Cekici): CekiciRow {
  const bolgeler = normalizeHizmetBolgeleri(
    c.hizmetBolgeleri,
    c.sehir,
    c.hizmetIlceleri
  );
  return {
    id: c.id,
    ad: c.ad,
    telefon: c.telefon,
    token: c.token,
    sifre: c.sifre,
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
    fatura_eposta: c.faturaEposta ?? null,
    fatura_eposta_dogrulandi: c.faturaEpostaDogrulandi ?? null,
  };
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

export function talepToRow(t: Talep): TalepRow {
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
    durum: t.durum,
    olusturulma: t.olusturulma,
    ihale_bitis: t.ihaleBitis,
    kazanan_cekici_id: t.kazananCekiciId ?? null,
    kazanan_teklif_id: t.kazananTeklifId ?? null,
    bildirilen_cekici_ids: t.bildirilenCekiciIds ?? [],
    anlasma_durumu: t.anlasmaDurumu ?? null,
    anlasildi_at: t.anlasildiAt ?? null,
    memnuniyet_sms_gonderildi: t.memnuniyetSmsGonderildi ?? false,
    haric_tutulan_cekici_ids: t.haricTutulanCekiciIds ?? [],
    teklifler: t.teklifler ?? [],
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
};

export function odemeFromRow(r: OdemeRow): BekleyenOdeme {
  return {
    id: r.id,
    cekiciId: r.cekici_id,
    miktar: Number(r.miktar),
    tutar: Number(r.tutar),
    paketTl: r.paket_tl != null ? Number(r.paket_tl) : undefined,
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
