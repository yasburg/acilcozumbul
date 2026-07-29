-- İl bazlı kullanım aç/kapa (SMS bildirimi + çekici panel)

create table if not exists public.sehir_acilis (
  il text primary key,
  acik boolean not null default false,
  guncelleme timestamptz not null default now()
);

alter table public.sehir_acilis enable row level security;
grant all on table public.sehir_acilis to postgres, service_role;

comment on table public.sehir_acilis is
  'Kullanıma açık iller — kapalı ilde talep SMS / çekici panel kapalı';

-- Erken faz varsayılanı: yalnızca İstanbul açık
insert into public.sehir_acilis (il, acik)
values ('İstanbul', true)
on conflict (il) do nothing;
