-- Hot-path index'ler (JSON şeması değişmez)

create index if not exists talepler_durum_ihale_bitis_idx
  on public.talepler (durum, ihale_bitis);

create index if not exists talepler_kazanan_cekici_id_idx
  on public.talepler (kazanan_cekici_id)
  where kazanan_cekici_id is not null;

create index if not exists talepler_memnuniyet_sms_idx
  on public.talepler (memnuniyet_sms_gonderildi, durum);

create index if not exists sms_log_cekici_gonderim_idx
  on public.sms_log (cekici_id, gonderim desc);

create index if not exists cekiciler_aktif_kredi_idx
  on public.cekiciler (aktif, kredi);

create index if not exists cekiciler_hizmet_bolgeleri_gin_idx
  on public.cekiciler using gin (hizmet_bolgeleri);
