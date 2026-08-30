-- Marketplace dispatch is deliberately durable: request creation and notification
-- delivery are no longer coupled to one HTTP request or to an in-memory queue.

alter table public.cekiciler
  add column if not exists availability_status text not null default 'auto'
  check (availability_status in ('auto', 'online', 'busy', 'offline'));

create table if not exists public.marketplace_events (
  id uuid primary key default gen_random_uuid(),
  event_key text not null unique,
  event_type text not null,
  talep_id text references public.talepler (id) on delete cascade,
  cekici_id text references public.cekiciler (id) on delete set null,
  dispatch_id uuid,
  properties jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists marketplace_events_talep_type_idx
  on public.marketplace_events (talep_id, event_type, occurred_at desc);
create index if not exists marketplace_events_cekici_type_idx
  on public.marketplace_events (cekici_id, event_type, occurred_at desc);

create table if not exists public.talep_dispatches (
  id uuid primary key default gen_random_uuid(),
  talep_id text not null references public.talepler (id) on delete cascade,
  batch smallint not null check (batch between 1 and 5),
  reason text not null check (reason in ('initial', 'zero_offer_recovery', 'manual_retry')),
  status text not null default 'scheduled'
    check (status in ('scheduled', 'processing', 'completed', 'failed', 'skipped')),
  scheduled_at timestamptz not null,
  started_at timestamptz,
  completed_at timestamptz,
  candidate_count int not null default 0,
  notified_count int not null default 0,
  error_message text,
  created_at timestamptz not null default now(),
  unique (talep_id, batch, reason)
);

create index if not exists talep_dispatches_due_idx
  on public.talep_dispatches (scheduled_at)
  where status = 'scheduled';

create table if not exists public.talep_dispatch_candidates (
  dispatch_id uuid not null references public.talep_dispatches (id) on delete cascade,
  cekici_id text not null references public.cekiciler (id) on delete cascade,
  rank smallint not null,
  score numeric(8,2) not null,
  distance_km numeric(8,2),
  notified boolean not null default false,
  notification_status text not null default 'pending'
    check (notification_status in ('pending', 'provider_accepted', 'failed', 'skipped')),
  created_at timestamptz not null default now(),
  primary key (dispatch_id, cekici_id)
);

create table if not exists public.talep_notification_attempts (
  id uuid primary key default gen_random_uuid(),
  talep_id text not null references public.talepler (id) on delete cascade,
  cekici_id text not null references public.cekiciler (id) on delete cascade,
  dispatch_id uuid references public.talep_dispatches (id) on delete set null,
  channel text not null check (channel in ('sms', 'voice', 'push', 'whatsapp')),
  status text not null check (status in ('attempted', 'provider_accepted', 'failed')),
  credit_charged numeric(8,2) not null default 0,
  provider_reference text,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists talep_notification_attempts_talep_cekici_idx
  on public.talep_notification_attempts (talep_id, cekici_id, created_at desc);

alter table public.marketplace_events enable row level security;
alter table public.talep_dispatches enable row level security;
alter table public.talep_dispatch_candidates enable row level security;
alter table public.talep_notification_attempts enable row level security;

grant all on table public.marketplace_events to postgres, service_role;
grant all on table public.talep_dispatches to postgres, service_role;
grant all on table public.talep_dispatch_candidates to postgres, service_role;
grant all on table public.talep_notification_attempts to postgres, service_role;

comment on table public.marketplace_events is
  'PII içermeyen request-to-job marketplace funnel olayları; event_key idempotency sağlar.';
comment on table public.talep_dispatches is
  'Kalıcı, tekrar çalıştırılabilir progressive request dispatch kuyruğu.';
