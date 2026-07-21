-- İlk kayıt test hesapları (panelde ayrı gösterilir)
alter table public.cekiciler
  add column if not exists tester_hesap boolean not null default false;

comment on column public.cekiciler.tester_hesap is
  'İç test hesabı; panel istatistiklerinden ayrı gösterilir';

with ilk_uc as (
  select id
  from public.cekiciler
  order by kayit_tarihi asc nulls last, id asc
  limit 3
)
update public.cekiciler c
set tester_hesap = true
from ilk_uc u
where c.id = u.id;
