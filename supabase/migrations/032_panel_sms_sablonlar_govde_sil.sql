-- Seed edilen varsayılan Gövde 1 / Gövde 2 şablonlarını kaldır
delete from public.panel_sms_sablonlar
where etiket in (
  'Gövde 1 — doğrudan fayda',
  'Gövde 2 — sistem anlatımı'
);
