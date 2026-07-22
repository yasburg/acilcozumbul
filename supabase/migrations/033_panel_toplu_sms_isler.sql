-- Panel toplu SMS arka plan kuyruğu (sekme açık kalmadan gönderim)

create table if not exists public.panel_toplu_sms_isler (
  id uuid primary key default gen_random_uuid(),
  olusturulma timestamptz not null default now(),
  guncelleme timestamptz not null default now(),
  gonderen_eposta text,
  mesaj text not null,
  mesaj_parca int,
  mesaj_birim int,
  kampanya_kodu text,
  varyant text,
  durum text not null default 'beklemede'
    check (durum in ('beklemede', 'suruyor', 'bitti', 'iptal', 'hata')),
  parti_boyutu int not null,
  bekleme_sn int not null default 0,
  jitter_oran real not null default 0,
  parti_index int not null default 0,
  parti_toplam int not null,
  basarili int not null default 0,
  basarisiz int not null default 0,
  onceki_atlandi int not null default 0,
  sonraki_parti_at timestamptz,
  liste_id uuid references public.panel_toplu_sms_listeler (id) on delete set null,
  hata text
);

create index if not exists panel_toplu_sms_isler_durum_sonraki_idx
  on public.panel_toplu_sms_isler (durum, sonraki_parti_at);

create index if not exists panel_toplu_sms_isler_olusturulma_idx
  on public.panel_toplu_sms_isler (olusturulma desc);

create table if not exists public.panel_toplu_sms_is_alicilar (
  id uuid primary key default gen_random_uuid(),
  is_id uuid not null references public.panel_toplu_sms_isler (id) on delete cascade,
  sira int not null,
  telefon text not null,
  ad text,
  durum text not null default 'beklemede'
    check (durum in ('beklemede', 'gonderiliyor', 'gonderildi', 'basarisiz')),
  hata text,
  constraint panel_toplu_sms_is_alicilar_unique unique (is_id, telefon)
);

create index if not exists panel_toplu_sms_is_alicilar_is_sira_idx
  on public.panel_toplu_sms_is_alicilar (is_id, sira);

create index if not exists panel_toplu_sms_is_alicilar_is_durum_idx
  on public.panel_toplu_sms_is_alicilar (is_id, durum);

alter table public.panel_toplu_sms_isler enable row level security;
alter table public.panel_toplu_sms_is_alicilar enable row level security;

grant all on table public.panel_toplu_sms_isler to postgres, service_role;
grant all on table public.panel_toplu_sms_is_alicilar to postgres, service_role;

comment on table public.panel_toplu_sms_isler is
  'Panel toplu SMS arka plan işleri (tempo ile parçalı gönderim)';
comment on table public.panel_toplu_sms_is_alicilar is
  'Toplu SMS iş kuyruğu alıcıları';
