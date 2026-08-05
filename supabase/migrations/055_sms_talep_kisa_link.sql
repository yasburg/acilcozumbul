-- Çekici talep SMS kısa linkleri (/t/{token} → /cekici/talep/…?t=…)

create table if not exists public.sms_talep_kisa_link (
  token text primary key,
  talep_id text not null,
  cekici_id text not null,
  cekici_token text not null,
  olusturulma timestamptz not null default now(),
  ilk_tiklama timestamptz,
  tiklama_sayisi int not null default 0,
  constraint sms_talep_kisa_link_token_chk check (token ~ '^[0-9A-Za-z]{8}$')
);

create unique index if not exists sms_talep_kisa_link_talep_cekici_uidx
  on public.sms_talep_kisa_link (talep_id, cekici_id);

create index if not exists sms_talep_kisa_link_cekici_idx
  on public.sms_talep_kisa_link (cekici_id);

alter table public.sms_talep_kisa_link enable row level security;
grant all on table public.sms_talep_kisa_link to postgres, service_role;

comment on table public.sms_talep_kisa_link is
  'Çekici talep SMS kısa linkleri (/t/{token})';
