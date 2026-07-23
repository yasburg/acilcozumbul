-- Kayıt funnel A/B: cekiciler alanları + olay tablosu + giriş OTP

alter table public.cekiciler
  add column if not exists kayit_funnel text,
  add column if not exists kurulum_tamam boolean not null default true;

comment on column public.cekiciler.kayit_funnel is
  'Kayıt landing harfi (a–z); /kayit/{harf}';
comment on column public.cekiciler.kurulum_tamam is
  'false = hızlı kayıt sonrası kurulum eksik; mevcut üyeler true';

create table if not exists public.kayit_funnel_olay (
  id bigserial primary key,
  funnel char(1) not null,
  olay text not null,
  session_id text,
  cekici_id text,
  olusturulma timestamptz not null default now(),
  constraint kayit_funnel_olay_funnel_chk check (funnel ~ '^[a-z]$'),
  constraint kayit_funnel_olay_olay_chk check (
    olay in (
      'goruldu',
      'telefon_focus',
      'otp_gonder',
      'otp_ok',
      'hesap',
      'kurulum_1',
      'kurulum_2',
      'kurulum_3',
      'panel_hazir'
    )
  )
);

create index if not exists kayit_funnel_olay_funnel_olay_idx
  on public.kayit_funnel_olay (funnel, olay);

create index if not exists kayit_funnel_olay_olusturulma_idx
  on public.kayit_funnel_olay (olusturulma desc);

alter table public.kayit_funnel_olay enable row level security;
grant all on table public.kayit_funnel_olay to postgres, service_role;
grant usage, select on sequence public.kayit_funnel_olay_id_seq to postgres, service_role;

create table if not exists public.cekici_giris_otp (
  telefon text primary key,
  kod text not null,
  olusturulma timestamptz not null default now(),
  son_gonderim timestamptz not null default now(),
  deneme int not null default 0,
  dogrulandi boolean not null default false
);

alter table public.cekici_giris_otp enable row level security;
grant all on table public.cekici_giris_otp to postgres, service_role;
