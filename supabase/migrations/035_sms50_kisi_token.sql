-- SMS50 kişiye özel kısa link token’ları + iş bayrağı

create table if not exists public.sms_kampanya_link_token (
  token text primary key,
  varyant char(1) not null,
  kampanya_kodu text not null default 'SMS50',
  telefon text not null,
  is_id uuid references public.panel_toplu_sms_isler (id) on delete set null,
  liste_id uuid references public.panel_toplu_sms_listeler (id) on delete set null,
  olusturulma timestamptz not null default now(),
  ilk_tiklama timestamptz,
  tiklama_sayisi int not null default 0,
  kayit_at timestamptz,
  kayit_cekici_id text,
  constraint sms_kampanya_link_token_varyant_chk check (varyant ~ '^[a-z]$'),
  constraint sms_kampanya_link_token_token_chk check (token ~ '^[0-9A-Za-z]{8}$')
);

create index if not exists sms_kampanya_link_token_telefon_idx
  on public.sms_kampanya_link_token (telefon);

create index if not exists sms_kampanya_link_token_kampanya_varyant_idx
  on public.sms_kampanya_link_token (kampanya_kodu, varyant);

create index if not exists sms_kampanya_link_token_is_idx
  on public.sms_kampanya_link_token (is_id)
  where is_id is not null;

alter table public.sms_kampanya_link_token enable row level security;
grant all on table public.sms_kampanya_link_token to postgres, service_role;

comment on table public.sms_kampanya_link_token is
  'SMS50 kişiye özel kısa link token’ları (/sms50{v}/{token})';

alter table public.panel_toplu_sms_isler
  add column if not exists kisi_bazli_takip boolean not null default false;

comment on column public.panel_toplu_sms_isler.kisi_bazli_takip is
  'true ise her alıcıya özel link; parti boyutu 1';
