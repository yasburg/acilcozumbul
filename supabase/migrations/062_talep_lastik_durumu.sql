-- Lastik durumu (yama / değişim) — hizmet veren ihale özetinde
alter table public.talepler
  add column if not exists lastik_durumu text;
