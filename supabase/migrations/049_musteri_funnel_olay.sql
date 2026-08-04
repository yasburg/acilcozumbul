-- Müşteri anasayfa A/B funnel olayları (session hunisi)

create table if not exists public.musteri_funnel_olay (
  id bigserial primary key,
  funnel char(1) not null,
  olay text not null,
  session_id text,
  telefon text,
  talep_id text,
  meta jsonb,
  olusturulma timestamptz not null default now(),
  constraint musteri_funnel_olay_funnel_chk check (funnel ~ '^[a-z]$')
);

create index if not exists musteri_funnel_olay_funnel_olay_idx
  on public.musteri_funnel_olay (funnel, olay);

create index if not exists musteri_funnel_olay_olusturulma_idx
  on public.musteri_funnel_olay (olusturulma desc);

create index if not exists musteri_funnel_olay_session_idx
  on public.musteri_funnel_olay (session_id);

alter table public.musteri_funnel_olay enable row level security;
grant all on table public.musteri_funnel_olay to postgres, service_role;
grant usage, select on sequence public.musteri_funnel_olay_id_seq to postgres, service_role;
