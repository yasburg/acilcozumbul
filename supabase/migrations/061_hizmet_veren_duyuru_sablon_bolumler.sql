-- Duyuru şablonlarında SMS bölüm kesimleri (Netgsm 150 birim)

alter table public.panel_hizmet_veren_duyuru_sablonlar
  add column if not exists bolumler jsonb;

comment on column public.panel_hizmet_veren_duyuru_sablonlar.bolumler is
  'Opsiyonel SMS parçaları ({{AYARLAR_URL}} ham); null = tek gövde';
