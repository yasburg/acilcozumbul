-- Panel: hizmet veren duyuru SMS şablonları

create table if not exists public.panel_hizmet_veren_duyuru_sablonlar (
  id uuid primary key default gen_random_uuid(),
  etiket text not null,
  aciklama text not null default '',
  govde text not null,
  aktif boolean not null default true,
  sira int not null default 0,
  olusturulma timestamptz not null default now(),
  guncelleme timestamptz not null default now()
);

create index if not exists panel_hv_duyuru_sablonlar_aktif_sira_idx
  on public.panel_hizmet_veren_duyuru_sablonlar (aktif, sira, olusturulma);

alter table public.panel_hizmet_veren_duyuru_sablonlar enable row level security;
grant all on table public.panel_hizmet_veren_duyuru_sablonlar to postgres, service_role;

comment on table public.panel_hizmet_veren_duyuru_sablonlar is
  'Hizmet veren duyuru SMS şablonları; {{AYARLAR_URL}} yer tutucusu';

-- Varsayılan bildirim paketi duyurusu (yoksa)
insert into public.panel_hizmet_veren_duyuru_sablonlar (etiket, aciklama, govde, aktif, sira)
select
  'Bildirim paketi (1 / 2 / 3 kredi)',
  'Yeni sesli arama + hızlı SMS paketini tüm hizmet verenlere duyurur.',
  E'acilcozumbul.com: Bildirim paketiniz guncellendi.\n1 kredi: Birkac dk icinde SMS\n2 kredi: 3 sn icinde hizli SMS\n3 kredi: Sesli arama + hizli SMS (onerilen, varsayilan)\nDegistirmek icin: {{AYARLAR_URL}}',
  true,
  0
where not exists (
  select 1 from public.panel_hizmet_veren_duyuru_sablonlar
  where etiket = 'Bildirim paketi (1 / 2 / 3 kredi)'
);
