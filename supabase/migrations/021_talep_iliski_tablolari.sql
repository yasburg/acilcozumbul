-- Bildirim / hariç junction tabloları + JSON backfill

create table if not exists public.talep_bildirimleri (
  talep_id text not null references public.talepler (id) on delete cascade,
  cekici_id text not null references public.cekiciler (id) on delete cascade,
  olusturulma timestamptz not null default now(),
  primary key (talep_id, cekici_id)
);

create index if not exists talep_bildirimleri_cekici_idx
  on public.talep_bildirimleri (cekici_id);

create table if not exists public.talep_haric (
  talep_id text not null references public.talepler (id) on delete cascade,
  cekici_id text not null references public.cekiciler (id) on delete cascade,
  olusturulma timestamptz not null default now(),
  primary key (talep_id, cekici_id)
);

create index if not exists talep_haric_cekici_idx
  on public.talep_haric (cekici_id);

alter table public.talep_bildirimleri enable row level security;
alter table public.talep_haric enable row level security;

grant all on table public.talep_bildirimleri to postgres, service_role;
grant all on table public.talep_haric to postgres, service_role;

insert into public.talep_bildirimleri (talep_id, cekici_id, olusturulma)
select
  t.id,
  elem,
  t.olusturulma
from public.talepler t
cross join lateral jsonb_array_elements_text(
  case
    when jsonb_typeof(t.bildirilen_cekici_ids) = 'array' then t.bildirilen_cekici_ids
    else '[]'::jsonb
  end
) as elem
where coalesce(elem, '') <> ''
  and exists (select 1 from public.cekiciler c where c.id = elem)
on conflict do nothing;

insert into public.talep_haric (talep_id, cekici_id, olusturulma)
select
  t.id,
  elem,
  coalesce(t.anlasildi_at, t.olusturulma)
from public.talepler t
cross join lateral jsonb_array_elements_text(
  case
    when jsonb_typeof(t.haric_tutulan_cekici_ids) = 'array' then t.haric_tutulan_cekici_ids
    else '[]'::jsonb
  end
) as elem
where coalesce(elem, '') <> ''
  and exists (select 1 from public.cekiciler c where c.id = elem)
on conflict do nothing;
