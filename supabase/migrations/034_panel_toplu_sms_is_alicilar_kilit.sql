-- Alıcı kilit durumu: aynı anda çift gönderimi önler

alter table public.panel_toplu_sms_is_alicilar
  drop constraint if exists panel_toplu_sms_is_alicilar_durum_check;

alter table public.panel_toplu_sms_is_alicilar
  add constraint panel_toplu_sms_is_alicilar_durum_check
  check (durum in ('beklemede', 'gonderiliyor', 'gonderildi', 'basarisiz'));
