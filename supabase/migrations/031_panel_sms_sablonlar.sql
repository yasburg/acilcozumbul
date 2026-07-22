-- Panel toplu SMS gövde şablonları ({{LINK}} yer tutucusu)

create table if not exists public.panel_sms_sablonlar (
  id uuid primary key default gen_random_uuid(),
  etiket text not null,
  govde text not null,
  aktif boolean not null default true,
  sira int not null default 0,
  olusturulma timestamptz not null default now(),
  guncelleme timestamptz not null default now()
);

create index if not exists panel_sms_sablonlar_aktif_sira_idx
  on public.panel_sms_sablonlar (aktif, sira, olusturulma);

alter table public.panel_sms_sablonlar enable row level security;
grant all on table public.panel_sms_sablonlar to postgres, service_role;

comment on table public.panel_sms_sablonlar is
  'Panel Toplu SMS gövde şablonları; {{LINK}} kısa link yer tutucusu';

-- Varsayılan gövdeler (yalnızca tablo boşsa)
insert into public.panel_sms_sablonlar (etiket, govde, aktif, sira)
select *
from (
  values
    (
      'Gövde 1 — doğrudan fayda',
      'TANITIM | Acil Çözüm Bul: İstanbul çekici kayıtları açıldı. Ücretsiz kaydolun, uygun iş talepleri SMS ve panelden gelsin. İlk 50 kayda 50 kredi: {{LINK}}',
      true,
      1
    ),
    (
      'Gövde 2 — sistem anlatımı',
      'TANITIM | Çekici hizmeti veriyorsanız çalışma bölgenizi seçin, yakınınızdaki taleplere fiyat ve süre teklifi verin. Kayıt ücretsiz: {{LINK}}',
      true,
      2
    )
) as v(etiket, govde, aktif, sira)
where not exists (select 1 from public.panel_sms_sablonlar limit 1);
