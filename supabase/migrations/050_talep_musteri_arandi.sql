-- Çekici «Müşteriye ara» tıkladığında ilk arama zamanı
alter table public.talepler
  add column if not exists musteri_arandi_at timestamptz;
