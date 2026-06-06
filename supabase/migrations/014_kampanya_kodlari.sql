-- Kampanya / promosyon kodları (sosyal medya, reklam vb.)

create table if not exists public.kampanya_kodlari (
  kod text primary key,
  yeni_uye_kredi numeric not null,
  kanal text,
  aciklama text,
  baslangic timestamptz,
  bitis timestamptz,
  max_kullanim int,
  kullanim_sayisi int not null default 0,
  aktif boolean not null default true,
  olusturulma timestamptz not null default now()
);

create index if not exists kampanya_kodlari_aktif_idx
  on public.kampanya_kodlari (aktif)
  where aktif = true;

create table if not exists public.kampanya_kullanimlari (
  id uuid primary key default gen_random_uuid(),
  kampanya_kodu text not null references public.kampanya_kodlari (kod),
  yeni_cekici_id text not null references public.cekiciler (id) on delete cascade,
  verilen_kredi numeric not null,
  olusturulma timestamptz not null default now(),
  constraint kampanya_kullanimlari_yeni_cekici_unique unique (yeni_cekici_id)
);

create index if not exists kampanya_kullanimlari_kod_idx
  on public.kampanya_kullanimlari (kampanya_kodu);

alter table public.kampanya_kodlari enable row level security;
alter table public.kampanya_kullanimlari enable row level security;

grant all on table public.kampanya_kodlari to postgres, service_role;
grant all on table public.kampanya_kullanimlari to postgres, service_role;
