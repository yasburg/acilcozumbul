-- Talep fraud izleme, huni metrikleri, çekici müsaitlik saati, SMS hata logu

create table if not exists public.funnel_events (
  id uuid primary key default gen_random_uuid(),
  olay text not null,
  telefon text,
  ip_hash text,
  talep_id text,
  meta jsonb,
  olusturulma timestamptz not null default now()
);

create index if not exists funnel_events_olay_idx
  on public.funnel_events (olay, olusturulma desc);
create index if not exists funnel_events_telefon_idx
  on public.funnel_events (telefon, olusturulma desc);
create index if not exists funnel_events_ip_idx
  on public.funnel_events (ip_hash, olusturulma desc);

create table if not exists public.guvenlik_olaylari (
  id uuid primary key default gen_random_uuid(),
  anahtar text not null,
  olay_tipi text not null,
  ip_hash text,
  telefon text,
  olusturulma timestamptz not null default now()
);

create index if not exists guvenlik_olaylari_anahtar_idx
  on public.guvenlik_olaylari (anahtar, olusturulma desc);

alter table public.cekiciler
  add column if not exists musaitlik_aktif boolean not null default false,
  add column if not exists musaitlik_baslangic text,
  add column if not exists musaitlik_bitis text,
  add column if not exists musaitlik_gunler smallint[];

alter table public.sms_log
  add column if not exists hata text;

alter table public.funnel_events enable row level security;
alter table public.guvenlik_olaylari enable row level security;

grant all on table public.funnel_events to postgres, service_role;
grant all on table public.guvenlik_olaylari to postgres, service_role;
