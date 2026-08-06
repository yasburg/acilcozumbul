-- Uzun ihale hatırlatma gönderim kaydı (müşteri + teklif vermeyen çekici)
-- Toplu SMS kuyruğunda alıcı başına özel mesaj (kişisel talep linki)

alter table public.panel_toplu_sms_is_alicilar
  add column if not exists mesaj text;

comment on column public.panel_toplu_sms_is_alicilar.mesaj is
  'Doluysa iş mesajı yerine bu metin 1:1 gönderilir (kişisel link)';

create table if not exists public.ihale_hatirlatma (
  id uuid primary key default gen_random_uuid(),
  talep_id text not null references public.talepler (id) on delete cascade,
  adim smallint not null check (adim between 1 and 3),
  hedef text not null check (hedef in ('musteri', 'cekici')),
  gonderildi_at timestamptz not null default now(),
  toplu_sms_is_id uuid references public.panel_toplu_sms_isler (id) on delete set null,
  alici_sayisi int not null default 0,
  constraint ihale_hatirlatma_unique unique (talep_id, adim, hedef)
);

create index if not exists ihale_hatirlatma_talep_idx
  on public.ihale_hatirlatma (talep_id);

alter table public.ihale_hatirlatma enable row level security;

grant all on table public.ihale_hatirlatma to postgres, service_role;

comment on table public.ihale_hatirlatma is
  'Acil olmayan açık ihalelerde 3 hatırlatma SMS dalgası (müşteri + teklif vermeyen çekici)';
