-- Aylık abonelik kredisi (yenilemede sıfırlanır); cekiciler.kredi = satın alınan / kalıcı

alter table public.cekiciler
  add column if not exists abonelik_kredi numeric not null default 0;
