-- Panel toplu SMS geçmişi: liste (parti) + genel telefon defteri

create table if not exists public.panel_toplu_sms_listeler (
  id uuid primary key default gen_random_uuid(),
  olusturulma timestamptz not null default now(),
  gonderen_eposta text,
  mesaj text not null,
  alici_sayisi int not null,
  basarili int not null default 0,
  basarisiz int not null default 0,
  mesaj_parca int,
  mesaj_birim int
);

create index if not exists panel_toplu_sms_listeler_olusturulma_idx
  on public.panel_toplu_sms_listeler (olusturulma desc);

create table if not exists public.panel_toplu_sms_liste_alicilar (
  id uuid primary key default gen_random_uuid(),
  liste_id uuid not null references public.panel_toplu_sms_listeler (id) on delete cascade,
  telefon text not null,
  ad text,
  basarili boolean not null default false,
  hata text,
  constraint panel_toplu_sms_liste_alicilar_unique unique (liste_id, telefon)
);

create index if not exists panel_toplu_sms_liste_alicilar_liste_idx
  on public.panel_toplu_sms_liste_alicilar (liste_id);

create index if not exists panel_toplu_sms_liste_alicilar_telefon_idx
  on public.panel_toplu_sms_liste_alicilar (telefon);

-- Genel defter: daha önce toplu SMS gönderilen numaralar
create table if not exists public.panel_toplu_sms_telefonlar (
  telefon text primary key,
  ad text,
  ilk_gonderim timestamptz not null default now(),
  son_gonderim timestamptz not null default now(),
  gonderim_sayisi int not null default 1,
  basarili_sayisi int not null default 0,
  son_liste_id uuid references public.panel_toplu_sms_listeler (id) on delete set null
);

create index if not exists panel_toplu_sms_telefonlar_son_idx
  on public.panel_toplu_sms_telefonlar (son_gonderim desc);

alter table public.panel_toplu_sms_listeler enable row level security;
alter table public.panel_toplu_sms_liste_alicilar enable row level security;
alter table public.panel_toplu_sms_telefonlar enable row level security;

grant all on table public.panel_toplu_sms_listeler to postgres, service_role;
grant all on table public.panel_toplu_sms_liste_alicilar to postgres, service_role;
grant all on table public.panel_toplu_sms_telefonlar to postgres, service_role;

comment on table public.panel_toplu_sms_listeler is
  'Panel toplu SMS gönderim partileri (liste bazlı geçmiş)';
comment on table public.panel_toplu_sms_telefonlar is
  'Panel toplu SMS genel telefon defteri (daha önce gönderilenler)';
