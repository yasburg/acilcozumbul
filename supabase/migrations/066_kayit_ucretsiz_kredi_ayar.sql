-- Kodsuz (kampanyasız / davetsiz) yeni kayıtlara ücretsiz başlangıç kredisi
create table if not exists public.kayit_ucretsiz_kredi_ayar (
  id text primary key default 'default',
  aktif boolean not null default true,
  kredi_miktar int not null default 9,
  guncelleme timestamptz not null default now(),
  constraint kayit_ucretsiz_kredi_ayar_id_check check (id = 'default'),
  constraint kayit_ucretsiz_kredi_ayar_miktar_check check (
    kredi_miktar >= 0 and kredi_miktar <= 50000
  )
);

alter table public.kayit_ucretsiz_kredi_ayar enable row level security;
grant all on table public.kayit_ucretsiz_kredi_ayar to postgres, service_role;

insert into public.kayit_ucretsiz_kredi_ayar (id, aktif, kredi_miktar)
values ('default', true, 9)
on conflict (id) do nothing;

comment on table public.kayit_ucretsiz_kredi_ayar is
  'Kampanya/davet kodu olmadan kayıt olanlara verilen ücretsiz başlangıç kredisi';
