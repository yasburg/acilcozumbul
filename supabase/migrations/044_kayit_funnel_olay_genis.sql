-- Kayıt funnel olayları: esnek allowlist (uygulama tarafı) + meta + index

alter table public.kayit_funnel_olay
  drop constraint if exists kayit_funnel_olay_olay_chk;

alter table public.kayit_funnel_olay
  add column if not exists meta jsonb;

comment on column public.kayit_funnel_olay.meta is
  'PII içermeyen ek bilgi (alan adı, kaynak=sms50 vb.)';

create index if not exists kayit_funnel_olay_funnel_zaman_idx
  on public.kayit_funnel_olay (funnel, olusturulma desc);

create index if not exists kayit_funnel_olay_session_olay_idx
  on public.kayit_funnel_olay (session_id, olay)
  where session_id is not null;
