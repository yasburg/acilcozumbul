-- Çekici puan özeti cache + backfill

create table if not exists public.cekici_puan_ozet (
  cekici_id text primary key references public.cekiciler (id) on delete cascade,
  toplam_teklif int not null default 0,
  kazanilan int not null default 0,
  anlasilan int not null default 0,
  fiyat_degistiren int not null default 0,
  guncelleme timestamptz not null default now()
);

alter table public.cekici_puan_ozet enable row level security;
grant all on table public.cekici_puan_ozet to postgres, service_role;

insert into public.cekici_puan_ozet (
  cekici_id,
  toplam_teklif,
  kazanilan,
  fiyat_degistiren,
  anlasilan,
  guncelleme
)
select
  c.id,
  coalesce(agg.toplam, 0),
  coalesce(agg.kazanilan, 0),
  coalesce(agg.fiyat_degistiren, 0),
  coalesce(an.anlasilan, 0),
  now()
from public.cekiciler c
left join lateral (
  select
    count(*)::int as toplam,
    count(*) filter (where t.durum = 'kazandi')::int as kazanilan,
    count(*) filter (
      where t.fiyat_degisti = true
         or (t.ilk_fiyat is not null and t.fiyat is distinct from t.ilk_fiyat)
    )::int as fiyat_degistiren
  from public.teklifler t
  where t.cekici_id = c.id
) agg on true
left join lateral (
  select count(*)::int as anlasilan
  from public.talepler tp
  where tp.kazanan_cekici_id = c.id
    and tp.durum = 'anlaşıldı'
) an on true
where coalesce(agg.toplam, 0) > 0
   or coalesce(an.anlasilan, 0) > 0
on conflict (cekici_id) do update set
  toplam_teklif = excluded.toplam_teklif,
  kazanilan = excluded.kazanilan,
  anlasilan = excluded.anlasilan,
  fiyat_degistiren = excluded.fiyat_degistiren,
  guncelleme = now();
