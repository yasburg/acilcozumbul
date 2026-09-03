-- Rozet satın almaları da kredi_odemeler’de tutulsun (fatura / panel listesi)
alter table public.kredi_odemeler
  drop constraint if exists kredi_odemeler_odeme_tipi_check;

alter table public.kredi_odemeler
  add constraint kredi_odemeler_odeme_tipi_check
  check (odeme_tipi in ('kredi', 'abonelik', 'rozet'));
