-- Davet / referans kupon kodu (hizmet veren kaydı)
-- cekiciler.id text olduğu için FK sütunları da text

alter table public.cekiciler
  add column if not exists davet_kodu text,
  add column if not exists davet_eden_id text references public.cekiciler (id);

create unique index if not exists cekiciler_davet_kodu_unique_idx
  on public.cekiciler (davet_kodu)
  where davet_kodu is not null;

create index if not exists cekiciler_davet_eden_id_idx
  on public.cekiciler (davet_eden_id);

create table if not exists public.davet_kullanimlari (
  id uuid primary key default gen_random_uuid(),
  davet_kodu text not null,
  davet_eden_id text not null references public.cekiciler (id),
  yeni_cekici_id text not null references public.cekiciler (id),
  davetli_kredi numeric not null,
  davet_eden_kredi numeric not null,
  olusturulma timestamptz not null default now(),
  constraint davet_kullanimlari_yeni_cekici_unique unique (yeni_cekici_id)
);

alter table public.davet_kullanimlari enable row level security;

grant all on table public.davet_kullanimlari to postgres, service_role;
