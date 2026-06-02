-- Çoklu il/ilçe, konum menzili, canlı GPS

alter table public.cekiciler
  add column if not exists hizmet_bolgeleri jsonb not null default '{}'::jsonb,
  add column if not exists hizmet_modu text not null default 'il_ilce',
  add column if not exists konum_lat double precision,
  add column if not exists konum_lng double precision,
  add column if not exists konum_guncelleme timestamptz,
  add column if not exists menzil_km int not null default 30;

-- Eski tek-il ilçe listesini jsonb haritaya taşı
update public.cekiciler
set hizmet_bolgeleri = jsonb_build_object(sehir, hizmet_ilceleri)
where hizmet_bolgeleri = '{}'::jsonb
  and cardinality(hizmet_ilceleri) > 0;
