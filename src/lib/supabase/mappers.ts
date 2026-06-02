import type {
  BekleyenOdeme,
  Cekici,
  HizmetBolgeleri,
  HizmetBolgeModu,
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
  olusturulma: string;
  durum: string;
};

export function odemeFromRow(r: OdemeRow): BekleyenOdeme {
  return {
    id: r.id,
    cekiciId: r.cekici_id,
    miktar: Number(r.miktar),
    tutar: Number(r.tutar),
    olusturulma: r.olusturulma,
    durum: r.durum as BekleyenOdeme["durum"],
  };
}

export function odemeToRow(o: BekleyenOdeme): OdemeRow {
  return {
    id: o.id,
    cekici_id: o.cekiciId,
    miktar: o.miktar,
    tutar: o.tutar,
    olusturulma: o.olusturulma,
    durum: o.durum,
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
