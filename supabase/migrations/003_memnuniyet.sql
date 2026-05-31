-- Müşteri memnuniyet değerlendirmesi (anlaşmadan 2 saat sonra)

alter table public.talepler
  add column if not exists anlasildi_at timestamptz;

create table if not exists public.musteri_degerlendirmeler (
  id text primary key,
  talep_id text not null,
  cekici_id text not null references public.cekiciler (id) on delete cascade,
  puan int not null check (puan >= 1 and puan <= 5),
  yorum text,
  olusturulma timestamptz not null default now(),
  constraint musteri_degerlendirmeler_talep_unique unique (talep_id),
  constraint musteri_degerlendirmeler_talep_fk foreign key (talep_id) references public.talepler (id) on delete cascade
);

create index if not exists musteri_degerlendirmeler_cekici_idx
  on public.musteri_degerlendirmeler (cekici_id);

create index if not exists musteri_degerlendirmeler_olusturulma_idx
  on public.musteri_degerlendirmeler (olusturulma desc);

alter table public.musteri_degerlendirmeler enable row level security;

grant all on table public.musteri_degerlendirmeler to postgres, service_role;
