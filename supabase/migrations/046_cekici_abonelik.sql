-- Aylık abonelik (Garanti recurring) + işlem geçmişi

create table if not exists public.cekici_abonelik (
  id text primary key,
  cekici_id text not null references public.cekiciler (id) on delete cascade,
  paket_tl numeric not null,
  status text not null default 'active'
    check (status in ('active', 'past_due', 'cancelled', 'expired', 'payment_failed')),
  garanti_order_id text,
  garanti_original_retref_num text,
  garanti_client_ip text,
  renews_at timestamptz,
  ends_at timestamptz,
  subscribed_at timestamptz not null default now(),
  retry_count int not null default 0,
  next_retry_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists cekici_abonelik_aktif_cekici_uidx
  on public.cekici_abonelik (cekici_id)
  where status in ('active', 'past_due');

create index if not exists cekici_abonelik_garanti_order_idx
  on public.cekici_abonelik (garanti_order_id)
  where garanti_order_id is not null;

create index if not exists cekici_abonelik_renews_at_idx
  on public.cekici_abonelik (renews_at)
  where status in ('active', 'past_due');

create table if not exists public.abonelik_islem (
  id text primary key,
  abonelik_id text not null references public.cekici_abonelik (id) on delete cascade,
  cekici_id text not null references public.cekiciler (id) on delete cascade,
  tip text not null
    check (tip in ('created', 'renewal', 'cancelled', 'payment_failed', 'expired', 'retry')),
  tutar_tl numeric not null default 0,
  kredi int not null default 0,
  garanti_order_id text,
  event_id text not null,
  created_at timestamptz not null default now(),
  unique (event_id)
);

create index if not exists abonelik_islem_abonelik_idx
  on public.abonelik_islem (abonelik_id, created_at desc);

alter table public.cekici_abonelik enable row level security;
alter table public.abonelik_islem enable row level security;

grant all on table public.cekici_abonelik to postgres, service_role;
grant all on table public.abonelik_islem to postgres, service_role;
