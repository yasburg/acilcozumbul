-- Simülasyon günlük adet aralıkları (panelden düzenlenir)

create table if not exists public.simulasyon_ayar (
  id text primary key default 'default',
  dusuk_min int not null default 0,
  dusuk_max int not null default 1,
  orta_min int not null default 1,
  orta_max int not null default 2,
  yuksek_min int not null default 2,
  yuksek_max int not null default 4,
  guncelleme timestamptz not null default now(),
  constraint simulasyon_ayar_id_check check (id = 'default'),
  constraint simulasyon_ayar_dusuk_check check (
    dusuk_min >= 0 and dusuk_max >= dusuk_min and dusuk_max <= 20
  ),
  constraint simulasyon_ayar_orta_check check (
    orta_min >= 0 and orta_max >= orta_min and orta_max <= 20
  ),
  constraint simulasyon_ayar_yuksek_check check (
    yuksek_min >= 0 and yuksek_max >= yuksek_min and yuksek_max <= 20
  )
);

alter table public.simulasyon_ayar enable row level security;
grant all on table public.simulasyon_ayar to postgres, service_role;

insert into public.simulasyon_ayar (id)
values ('default')
on conflict (id) do nothing;

comment on table public.simulasyon_ayar is
  'Simülasyon ihale günlük adet aralıkları: 1–5 / 6–20 / 20+ çekici grupları';
