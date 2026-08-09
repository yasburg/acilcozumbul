-- Sesli mesaj gönderim + Netgsm durum/DTMF webhook kayıtları
create table if not exists public.sesli_mesaj_log (
  id text primary key,
  olay_tipi text not null check (olay_tipi in ('gonderim', 'rapor')),
  sablon_id text,
  telefon text,
  bulkid text,
  relationid text,
  cekici_id text,
  talep_id text,
  basarili boolean,
  hata text,
  audio_id text,
  -- Netgsm state: 1 cevaplanan, 2 cevaplanmayan, 3 ulaşılamayan, 7 meşgul
  state smallint,
  push_button text,
  answer_time text,
  bilsec numeric,
  raw jsonb,
  olusturulma timestamptz not null default now()
);

create index if not exists sesli_mesaj_log_olusturulma_idx
  on public.sesli_mesaj_log (olusturulma desc);

create index if not exists sesli_mesaj_log_olay_idx
  on public.sesli_mesaj_log (olay_tipi, olusturulma desc);

alter table public.sesli_mesaj_log enable row level security;

grant all on table public.sesli_mesaj_log to postgres, service_role;
