-- Demo sonrası: 1 dk sonra yalnızca o çekiciye açılan takip talebi

alter table public.talepler
  add column if not exists yalniz_cekici_id text;

create index if not exists talepler_yalniz_cekici_id_idx
  on public.talepler (yalniz_cekici_id)
  where yalniz_cekici_id is not null;

create table if not exists public.demo_takip_plan (
  id text primary key,
  cekici_id text not null,
  demo_oturum_id text,
  planlanan_acilis_at timestamptz not null,
  durum text not null default 'planli'
    check (durum in ('planli', 'acildi', 'iptal', 'hata')),
  talep_id text,
  hata_mesaj text,
  olusturulma timestamptz not null default now(),
  guncelleme timestamptz not null default now()
);

create index if not exists demo_takip_plan_planli_acilis_idx
  on public.demo_takip_plan (planlanan_acilis_at)
  where durum = 'planli';

create index if not exists demo_takip_plan_cekici_idx
  on public.demo_takip_plan (cekici_id);

alter table public.demo_takip_plan enable row level security;
grant all on table public.demo_takip_plan to postgres, service_role;

comment on table public.demo_takip_plan is
  'Panel demo başladıktan 1 dk sonra yalnızca o çekiciye SMS+sesli talep';
