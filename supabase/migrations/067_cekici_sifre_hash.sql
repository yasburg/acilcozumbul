-- Çekici şifreleri scrypt hash olarak saklanır; sifre sütunu yalnızca legacy plaintext
alter table public.cekiciler
  add column if not exists sifre_hash text;

comment on column public.cekiciler.sifre_hash is
  'scrypt$N$r$p$salt$hash — düz metin sifre doldurulmaz';
comment on column public.cekiciler.sifre is
  'DEPRECATED plaintext; hash yazılınca null';
