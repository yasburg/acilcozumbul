-- Hesap kurulum hatırlatma SMS (kayıt olup kurulum bitirmeyenler)

create table if not exists public.kurulum_hatirlatma_gonderim (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  cekici_id text not null,
  telefon text not null,
  kaynak text not null default 'manuel'
    check (kaynak in ('manuel')),
  mesaj_index int not null default 0
    check (mesaj_index >= 0 and mesaj_index <= 3),
  olusturulma timestamptz not null default now(),
  sms_basarili boolean not null default false,
  ilk_tiklama timestamptz,
  tiklama_sayisi int not null default 0,
  kurulum_tamam_at timestamptz,
  constraint kurulum_hatirlatma_token_chk check (token ~ '^[0-9A-Za-z]{8}$')
);

create index if not exists kurulum_hatirlatma_cekici_olusturulma_idx
  on public.kurulum_hatirlatma_gonderim (cekici_id, olusturulma desc);

create index if not exists kurulum_hatirlatma_token_idx
  on public.kurulum_hatirlatma_gonderim (token);

create index if not exists kurulum_hatirlatma_acik_idx
  on public.kurulum_hatirlatma_gonderim (cekici_id)
  where kurulum_tamam_at is null and sms_basarili = true;

alter table public.kurulum_hatirlatma_gonderim enable row level security;
grant all on table public.kurulum_hatirlatma_gonderim to postgres, service_role;

comment on table public.kurulum_hatirlatma_gonderim is
  'Kurulum eksik çekicilere haftalık hatırlatma SMS + /ku/{token} tıklama takibi';
