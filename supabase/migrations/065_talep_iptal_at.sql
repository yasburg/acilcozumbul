-- Müşteri iptal ettiğinde zaman damgası (oluşturma → iptal süresi için)
alter table public.talepler
  add column if not exists iptal_at timestamptz;
