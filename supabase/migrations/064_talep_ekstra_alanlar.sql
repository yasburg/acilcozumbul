-- Yakıt / kilit / araç tipi / araç durumu — hizmet veren ihale özetinde
alter table public.talepler
  add column if not exists yakit_tipi text,
  add column if not exists kilit_durumu text,
  add column if not exists arac_tipi text,
  add column if not exists arac_durumu text;
