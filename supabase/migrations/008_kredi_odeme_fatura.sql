-- Kredi satın alma: e-posta doğrulama, fatura alanları, tamamlanan ödemeler

alter table public.cekiciler
  add column if not exists fatura_eposta text,
  add column if not exists fatura_eposta_dogrulandi timestamptz;

create table if not exists public.cekici_email_otp (
  cekici_id text not null references public.cekiciler (id) on delete cascade,
  email text not null,
  kod text not null,
  olusturulma timestamptz not null,
  son_gonderim timestamptz not null,
  deneme int not null default 0,
  dogrulandi boolean not null default false,
  primary key (cekici_id, email)
);

alter table public.odeme_bekleyen
  add column if not exists paket_tl numeric,
  add column if not exists fatura_eposta text,
  add column if not exists fatura_adres text,
  add column if not exists fatura_tc_kimlik text,
  add column if not exists kurumsal boolean not null default false,
  add column if not exists sirket_unvan text,
  add column if not exists vergi_no text;

create table if not exists public.kredi_odemeler (
  id text primary key,
  cekici_id text not null references public.cekiciler (id) on delete restrict,
  cekici_ad text not null,
  cekici_telefon text not null,
  miktar numeric not null,
  tutar numeric not null,
  liste_fiyati numeric,
  paket_tl numeric not null,
  fatura_eposta text not null,
  fatura_adres text,
  fatura_tc_kimlik text,
  kurumsal boolean not null default false,
  sirket_unvan text,
  vergi_no text,
  odeme_referans text,
  garanti_resp_code text,
  demo_odeme boolean not null default false,
  olusturulma timestamptz not null default now()
);

create index if not exists kredi_odemeler_olusturulma_idx
  on public.kredi_odemeler (olusturulma desc);

alter table public.cekici_email_otp enable row level security;
alter table public.kredi_odemeler enable row level security;

grant all on table public.cekici_email_otp to postgres, service_role;
grant all on table public.kredi_odemeler to postgres, service_role;
