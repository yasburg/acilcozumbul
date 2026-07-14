-- Premium SMS: anlık talep SMS’i (2 kredi). Kapalıyken yalnızca panel bildirimi (1 kredi).
alter table public.cekiciler
  add column if not exists premium_sms_aktif boolean not null default false;

comment on column public.cekiciler.premium_sms_aktif is
  'true ise talep bildirimi SMS ile gider (2 kredi); false ise yalnızca panel (1 kredi)';
