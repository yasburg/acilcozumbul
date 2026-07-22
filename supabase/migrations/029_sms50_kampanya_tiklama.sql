-- SMS50 kısa link tıklamaları (sms50a–sms50z)
-- Toplu SMS listelerine kampanya / varyant etiketleri

create table if not exists public.sms_kampanya_tiklama (
  id uuid primary key default gen_random_uuid(),
  varyant char(1) not null,
  kampanya_kodu text not null default 'SMS50',
  olusturulma timestamptz not null default now(),
  user_agent text,
  ip_hash text,
  constraint sms_kampanya_tiklama_varyant_chk check (varyant ~ '^[a-z]$')
);

create index if not exists sms_kampanya_tiklama_kampanya_varyant_idx
  on public.sms_kampanya_tiklama (kampanya_kodu, varyant, olusturulma desc);

alter table public.sms_kampanya_tiklama enable row level security;
grant all on table public.sms_kampanya_tiklama to postgres, service_role;

alter table public.panel_toplu_sms_listeler
  add column if not exists kampanya_kodu text,
  add column if not exists varyant char(1);

create index if not exists panel_toplu_sms_listeler_kampanya_varyant_idx
  on public.panel_toplu_sms_listeler (kampanya_kodu, varyant)
  where kampanya_kodu is not null;

comment on table public.sms_kampanya_tiklama is
  'Outbound SMS kısa link tıklamaları (/sms50a–/sms50z)';
