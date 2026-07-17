-- Çekici şifreleri Supabase Auth'a taşınır; sifre sütunu yalnızca geçici legacy alan
alter table public.cekiciler
  add column if not exists auth_user_id uuid unique;

alter table public.cekiciler
  alter column sifre drop not null;

comment on column public.cekiciler.auth_user_id is
  'Supabase auth.users.id — şifre burada hash''lenir';
comment on column public.cekiciler.sifre is
  'DEPRECATED plaintext; Auth migrate sonrası boş bırakılır';
