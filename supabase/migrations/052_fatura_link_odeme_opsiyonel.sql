-- Panelden yüklenen faturalarda kredi_odeme zorunlu değil

alter table public.fatura_link
  alter column kredi_odeme_id drop not null;
