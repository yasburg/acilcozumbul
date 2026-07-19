-- Teklifler normalize tablosu + JSON backfill (JSON kolon henüz drop edilmez)

create table if not exists public.teklifler (
  id text primary key,
  talep_id text not null references public.talepler (id) on delete cascade,
  cekici_id text not null references public.cekiciler (id) on delete restrict,
  cekici_ad text not null,
  fiyat numeric not null,
  ilk_fiyat numeric,
  fiyat_degisti boolean not null default false,
  fiyat_guncelleme_tarihi timestamptz,
  tahmini_sure_dk int not null,
  mesaj text,
  tarih timestamptz not null,
  durum text not null check (durum in ('aktif', 'kazandi', 'kaybetti')),
  constraint teklifler_talep_cekici_unique unique (talep_id, cekici_id)
);

create index if not exists teklifler_talep_id_idx on public.teklifler (talep_id);
create index if not exists teklifler_cekici_id_idx on public.teklifler (cekici_id);
create index if not exists teklifler_cekici_durum_idx on public.teklifler (cekici_id, durum);

alter table public.teklifler enable row level security;

grant all on table public.teklifler to postgres, service_role;

-- Backfill: talepler.teklifler JSONB → satırlar
insert into public.teklifler (
  id,
  talep_id,
  cekici_id,
  cekici_ad,
  fiyat,
  ilk_fiyat,
  fiyat_degisti,
  fiyat_guncelleme_tarihi,
  tahmini_sure_dk,
  mesaj,
  tarih,
  durum
)
select
  coalesce(elem->>'id', gen_random_uuid()::text),
  t.id,
  elem->>'cekiciId',
  coalesce(elem->>'cekiciAd', ''),
  coalesce((elem->>'fiyat')::numeric, 0),
  nullif(elem->>'ilkFiyat', '')::numeric,
  coalesce((elem->>'fiyatDegisti')::boolean, false),
  nullif(elem->>'fiyatGuncellemeTarihi', '')::timestamptz,
  coalesce((elem->>'tahminiSureDk')::int, 30),
  nullif(elem->>'mesaj', ''),
  coalesce(nullif(elem->>'tarih', '')::timestamptz, t.olusturulma),
  case
    when elem->>'durum' in ('aktif', 'kazandi', 'kaybetti') then elem->>'durum'
    else 'aktif'
  end
from public.talepler t
cross join lateral jsonb_array_elements(
  case
    when jsonb_typeof(t.teklifler) = 'array' then t.teklifler
    else '[]'::jsonb
  end
) as elem
where coalesce(elem->>'cekiciId', '') <> ''
  and exists (
    select 1 from public.cekiciler c where c.id = elem->>'cekiciId'
  )
on conflict do nothing;
