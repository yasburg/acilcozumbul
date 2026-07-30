-- Hedef henüz bilinmiyorsa teklif sürelerine +30 dk uygulanır
alter table public.talepler
  add column if not exists hedef_bilinmiyor boolean not null default false;
