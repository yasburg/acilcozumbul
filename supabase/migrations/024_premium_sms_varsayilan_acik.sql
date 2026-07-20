-- Premium SMS varsayılan açık (anlık OTP SMS, 2 kredi).
alter table public.cekiciler
  alter column premium_sms_aktif set default true;

update public.cekiciler
set premium_sms_aktif = true
where premium_sms_aktif is distinct from true;

comment on column public.cekiciler.premium_sms_aktif is
  'true (varsayılan): talep bildirimi anlık OTP SMS (2 kredi); false: toplu XML SMS (1 kredi)';
