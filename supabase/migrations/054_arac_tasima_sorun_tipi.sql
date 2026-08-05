-- Araç taşıma sorun tipi: çekici hizmeti verenlere otomatik ekle
update public.cekiciler
set hizmet_sorun_tipleri = array_append(hizmet_sorun_tipleri, 'arac-tasima')
where 'cekici' = any(hizmet_sorun_tipleri)
  and not ('arac-tasima' = any(hizmet_sorun_tipleri));
