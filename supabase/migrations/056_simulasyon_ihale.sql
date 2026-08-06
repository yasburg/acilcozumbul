-- Simülasyon ihale planları + gizlilik side-table (talepler satırında flag yok)
-- Hayalet kazanan çekici (aktif=false, tester)

insert into public.cekiciler (
  id,
  ad,
  telefon,
  token,
  sifre,
  kredi,
  sehir,
  hizmet_ilceleri,
  aktif,
  kayit_tarihi,
  tester_hesap,
  kurulum_tamam
)
values (
  'cekici-simulasyon-ghost',
  'Can Yıldız',
  '05990000001',
  'simulasyon-ghost-token-do-not-use',
  '',
  0,
  'İstanbul',
  '{}',
  false,
  now(),
  true,
  true
)
on conflict (id) do nothing;

create table if not exists public.simulasyon_plan (
  id text primary key,
  hedef_gun date not null,
  il text not null,
  kaynak_ilce text not null,
  hedef_ilce text,
  sorun_tipi text not null,
  planlanan_acilis_at timestamptz not null,
  ihale_bitis_at timestamptz not null,
  planlanan_kapanis_at timestamptz,
  durum text not null default 'planli',
  talep_id text references public.talepler (id) on delete set null,
  adet_snapshot int,
  cekici_sayisi_snapshot int not null default 0,
  olusturma_kaynagi text not null default 'cron',
  hata_mesaj text,
  olusturulma timestamptz not null default now(),
  guncelleme timestamptz not null default now(),
  constraint simulasyon_plan_durum_check check (
    durum in ('planli', 'iptal', 'acildi', 'kapandi', 'hata')
  ),
  constraint simulasyon_plan_sorun_check check (
    sorun_tipi in ('cekici', 'ariza', 'diger')
  )
);

create index if not exists simulasyon_plan_hedef_gun_idx
  on public.simulasyon_plan (hedef_gun, durum);

create index if not exists simulasyon_plan_acilis_idx
  on public.simulasyon_plan (planlanan_acilis_at)
  where durum = 'planli';

create table if not exists public.simulasyon_talep (
  talep_id text primary key references public.talepler (id) on delete cascade,
  plan_id text not null references public.simulasyon_plan (id) on delete cascade,
  planlanan_kapanis_at timestamptz,
  kapanis_at timestamptz,
  olusturulma timestamptz not null default now()
);

create index if not exists simulasyon_talep_kapanis_idx
  on public.simulasyon_talep (planlanan_kapanis_at)
  where kapanis_at is null;

alter table public.simulasyon_plan enable row level security;
alter table public.simulasyon_talep enable row level security;

grant all on table public.simulasyon_plan to postgres, service_role;
grant all on table public.simulasyon_talep to postgres, service_role;

comment on table public.simulasyon_plan is
  'Ertesi gün simülasyon ihale planları — yalnızca panel/cron';
comment on table public.simulasyon_talep is
  'Simülasyon talep işaretleri — çekici/müşteri API join etmez';
