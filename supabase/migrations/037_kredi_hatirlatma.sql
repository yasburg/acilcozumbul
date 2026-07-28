-- Kredi hatırlatma SMS (kredisi yetmeyen uygun çekiciler)

create table if not exists public.kredi_hatirlatma_gonderim (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  cekici_id text not null,
  telefon text not null,
  talep_id text,
  kaynak text not null default 'otomatik'
    check (kaynak in ('otomatik', 'manuel')),
  olusturulma timestamptz not null default now(),
  sms_basarili boolean not null default false,
  ilk_tiklama timestamptz,
  tiklama_sayisi int not null default 0,
  kredi_yukleme_at timestamptz,
  constraint kredi_hatirlatma_token_chk check (token ~ '^[0-9A-Za-z]{8}$')
);

create index if not exists kredi_hatirlatma_cekici_olusturulma_idx
  on public.kredi_hatirlatma_gonderim (cekici_id, olusturulma desc);

create index if not exists kredi_hatirlatma_token_idx
  on public.kredi_hatirlatma_gonderim (token);

create index if not exists kredi_hatirlatma_yukleme_idx
  on public.kredi_hatirlatma_gonderim (cekici_id)
  where kredi_yukleme_at is null and sms_basarili = true;

alter table public.kredi_hatirlatma_gonderim enable row level security;
grant all on table public.kredi_hatirlatma_gonderim to postgres, service_role;

comment on table public.kredi_hatirlatma_gonderim is
  'Kredisi yetmeyen çekicilere hatırlatma SMS + /kr/{token} tıklama takibi';
