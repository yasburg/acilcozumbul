-- JSON gömülü teklif / bildirim dizilerini kaldır (normalize tablolar kaynak)

-- Önkoşul: uygulama teklifler + talep_bildirimleri + talep_haric okuyor/yazıyor

alter table public.talepler
  drop column if exists teklifler,
  drop column if exists bildirilen_cekici_ids,
  drop column if exists haric_tutulan_cekici_ids;
