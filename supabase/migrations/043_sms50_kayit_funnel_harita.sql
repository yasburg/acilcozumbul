-- SMS kısa link (/sms50a–z) → kayıt funnel haritası (panelden düzenlenebilir)

create table if not exists public.sms50_kayit_funnel_harita (
  varyant text primary key
    check (varyant ~ '^[a-z]$'),
  kayit_funnel text not null
    check (kayit_funnel ~ '^[a-z]$'),
  guncelleme timestamptz not null default now()
);

alter table public.sms50_kayit_funnel_harita enable row level security;
grant all on table public.sms50_kayit_funnel_harita to postgres, service_role;

comment on table public.sms50_kayit_funnel_harita is
  'SMS50 kısa link varyant → /kayit/{funnel} hedefi';

-- Kod varsayılanları: c→b, diğerleri→a (KAYIT_FUNNEL_VARSAYILAN)
insert into public.sms50_kayit_funnel_harita (varyant, kayit_funnel)
select v, case when v = 'c' then 'b' else 'a' end
from unnest(string_to_array('a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z', ',')) as v
on conflict (varyant) do nothing;
