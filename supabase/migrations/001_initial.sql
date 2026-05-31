-- acilcozumbul — Supabase Postgres şeması
-- SQL Editor'da çalıştırın veya: supabase db push

create extension if not exists "pgcrypto";

create table if not exists public.cekiciler (
  id text primary key,
  ad text not null,
  telefon text not null,
  token text not null,
  sifre text not null,
  kredi numeric not null default 0,
  sehir text not null,
  hizmet_ilceleri text[] not null default '{}',
  aktif boolean not null default true,
  kayit_tarihi timestamptz not null default now(),
  constraint cekiciler_telefon_unique unique (telefon),
  constraint cekiciler_token_unique unique (token)
);

create table if not exists public.talepler (
  id text primary key,
  ad text not null,
  soyad text not null,
  telefon text not null,
  konum jsonb not null,
  konum_il text,
  konum_ilce text,
  hedef_konum jsonb,
  sorun text not null,
  sorun_tipi text,
  sorun_detay text,
  durum text not null,
  olusturulma timestamptz not null,
  ihale_bitis timestamptz not null,
  kazanan_cekici_id text references public.cekiciler (id) on delete set null,
  kazanan_teklif_id text,
  bildirilen_cekici_ids jsonb not null default '[]'::jsonb,
  anlasma_durumu text,
  haric_tutulan_cekici_ids jsonb not null default '[]'::jsonb,
  teklifler jsonb not null default '[]'::jsonb
);

create index if not exists talepler_olusturulma_idx on public.talepler (olusturulma desc);
create index if not exists talepler_telefon_idx on public.talepler (telefon);

create table if not exists public.telefon_otp (
  telefon text primary key,
  kod text not null,
  olusturulma timestamptz not null,
  son_gonderim timestamptz not null,
  deneme int not null default 0,
  dogrulandi boolean not null default false
);

create table if not exists public.sms_log (
  id text primary key,
  cekici_id text not null,
  cekici_telefon text not null,
  mesaj text not null,
  link text not null default '',
  talep_id text not null default '',
  gonderim timestamptz not null default now(),
  alici_tipi text,
  gonderildi boolean not null default false,
  saglayici text
);

create index if not exists sms_log_gonderim_idx on public.sms_log (gonderim desc);

create table if not exists public.odeme_bekleyen (
  id text primary key,
  cekici_id text not null references public.cekiciler (id) on delete cascade,
  miktar numeric not null,
  tutar numeric not null,
  olusturulma timestamptz not null default now(),
  durum text not null default 'bekliyor'
);

-- Sunucu service_role ile erişir; anon kullanıcılar doğrudan okuyamaz
alter table public.cekiciler enable row level security;
alter table public.talepler enable row level security;
alter table public.telefon_otp enable row level security;
alter table public.sms_log enable row level security;
alter table public.odeme_bekleyen enable row level security;

-- SQL Editor ile oluşturulan tablolarda PostgREST için zorunlu
grant usage on schema public to postgres, anon, authenticated, service_role;

grant all on table public.cekiciler to postgres, service_role;
grant all on table public.talepler to postgres, service_role;
grant all on table public.telefon_otp to postgres, service_role;
grant all on table public.sms_log to postgres, service_role;
grant all on table public.odeme_bekleyen to postgres, service_role;
