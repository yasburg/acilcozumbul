-- Müşteri WhatsApp konum paylaşımı + değerlendirme yapmadan «hizmeti aldım» onayı
alter table public.talepler
  add column if not exists musteri_whatsapp_at timestamptz,
  add column if not exists musteri_hizmet_alindi_at timestamptz;
