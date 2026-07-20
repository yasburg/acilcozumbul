-- Çekici doğum tarihi (kayıt formu)
alter table public.cekiciler
  add column if not exists dogum_tarihi date;

comment on column public.cekiciler.dogum_tarihi is
  'Doğum tarihi (YYYY-MM-DD); kayıtta zorunlu';
