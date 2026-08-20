-- Trendyol ETTN: iptal durumu sorgusu ve yeniden oluşturma için
alter table public.fatura_link
  add column if not exists trendyol_invoice_uuid text;

create index if not exists fatura_link_trendyol_invoice_uuid_idx
  on public.fatura_link (trendyol_invoice_uuid)
  where trendyol_invoice_uuid is not null;
