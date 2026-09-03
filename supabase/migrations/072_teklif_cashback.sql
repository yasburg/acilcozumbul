-- Teklif cashback kampanyası: panelden aktif + süre; teklifte bildirim kredisi iadesi
create table if not exists public.teklif_cashback_ayar (
  id text primary key default 'default',
  aktif boolean not null default false,
  baslangic timestamptz,
  bitis timestamptz,
  guncelleme timestamptz not null default now(),
  constraint teklif_cashback_ayar_id_check check (id = 'default')
);

alter table public.teklif_cashback_ayar enable row level security;
grant all on table public.teklif_cashback_ayar to postgres, service_role;

insert into public.teklif_cashback_ayar (id, aktif)
values ('default', false)
on conflict (id) do nothing;

comment on table public.teklif_cashback_ayar is
  'Teklif verince bildirim paketi kredisi iadesi kampanyası (aktif + süre aralığı)';

create table if not exists public.talep_kredi_iade (
  cekici_id text not null references public.cekiciler (id) on delete cascade,
  talep_id text not null references public.talepler (id) on delete cascade,
  miktar int not null,
  bildirim_seviye int not null,
  iade_edildi_at timestamptz not null default now(),
  primary key (cekici_id, talep_id),
  constraint talep_kredi_iade_miktar_check check (miktar >= 1 and miktar <= 10),
  constraint talep_kredi_iade_seviye_check check (bildirim_seviye in (1, 2, 3))
);

create index if not exists talep_kredi_iade_talep_idx
  on public.talep_kredi_iade (talep_id);

alter table public.talep_kredi_iade enable row level security;
grant all on table public.talep_kredi_iade to postgres, service_role;

comment on table public.talep_kredi_iade is
  'Teklif cashback: (çekici, talep) başına tek iade kaydı';
