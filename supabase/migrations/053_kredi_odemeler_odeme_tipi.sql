-- Satın alma tipi: kredi paketi vs abonelik (ilk ödeme)

alter table public.kredi_odemeler
  add column if not exists odeme_tipi text not null default 'kredi';

alter table public.kredi_odemeler
  drop constraint if exists kredi_odemeler_odeme_tipi_check;

alter table public.kredi_odemeler
  add constraint kredi_odemeler_odeme_tipi_check
  check (odeme_tipi in ('kredi', 'abonelik'));

-- Mevcut abonelik ilk ödemelerini işaretle (garanti_order_id eşleşmesi)
update public.kredi_odemeler k
set odeme_tipi = 'abonelik'
where k.odeme_tipi = 'kredi'
  and exists (
    select 1
    from public.abonelik_islem a
    where a.tip = 'created'
      and a.garanti_order_id is not null
      and (
        a.garanti_order_id = k.id
        or a.garanti_order_id = regexp_replace(k.id, '[^a-zA-Z0-9]', '', 'g')
      )
  );
