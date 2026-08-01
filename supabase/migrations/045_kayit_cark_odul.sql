-- Kayıt çarkı SMS ödülü (telefon başına bir kez)
create table if not exists public.kayit_cark_odul (
  id uuid primary key,
  token text not null unique,
  reward_sms integer not null
    check (reward_sms in (10, 20, 50, 100, 200)),
  status text not null default 'pending'
    check (status in ('pending', 'claimed', 'expired', 'rejected')),
  telefon text,
  cekici_id uuid,
  olusturulma timestamptz not null default now(),
  claimed_at timestamptz
);

create index if not exists kayit_cark_odul_telefon_claimed_idx
  on public.kayit_cark_odul (telefon)
  where status = 'claimed' and telefon is not null;

create index if not exists kayit_cark_odul_token_idx
  on public.kayit_cark_odul (token);
