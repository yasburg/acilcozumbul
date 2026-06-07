-- Video demo oturumu (production talepler/cekiciler verisine yazmaz)

create table if not exists public.demo_oturum (
  id uuid primary key default gen_random_uuid(),
  cekici_id text not null,
  bitis timestamptz not null,
  durum jsonb not null default '{}'::jsonb,
  olusturan text,
  olusturulma timestamptz not null default now()
);

create index if not exists demo_oturum_cekici_idx on public.demo_oturum (cekici_id);
create index if not exists demo_oturum_bitis_idx on public.demo_oturum (bitis);

alter table public.demo_oturum enable row level security;

grant all on table public.demo_oturum to postgres, service_role;
