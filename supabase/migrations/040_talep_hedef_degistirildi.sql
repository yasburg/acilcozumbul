-- Bekleme ekranında hedef servis bir kez değiştirilebilir
alter table public.talepler
  add column if not exists hedef_konum_degistirildi boolean not null default false;
