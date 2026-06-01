-- Çekici: hangi sorun tiplerinde SMS / talep bildirimi alacağı

alter table public.cekiciler
  add column if not exists hizmet_sorun_tipleri text[] not null default '{}';

-- Mevcut üyeler: tüm sorun tipleri (önceki davranış)
update public.cekiciler
set hizmet_sorun_tipleri = array[
  'ariza', 'lastik', 'aku', 'yakit', 'kaza', 'kilit', 'cekici', 'diger'
]::text[]
where coalesce(array_length(hizmet_sorun_tipleri, 1), 0) = 0;
