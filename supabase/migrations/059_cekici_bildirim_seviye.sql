-- Bildirim paketi: 1=standart SMS, 2=hızlı SMS, 3=sesli+hızlı SMS (varsayılan)
alter table public.cekiciler
  add column if not exists bildirim_seviye smallint not null default 3;

alter table public.cekiciler
  drop constraint if exists cekiciler_bildirim_seviye_check;

alter table public.cekiciler
  add constraint cekiciler_bildirim_seviye_check
  check (bildirim_seviye in (1, 2, 3));

comment on column public.cekiciler.bildirim_seviye is
  '1=standart SMS (dakikalar), 2=hızlı OTP SMS (~3 sn), 3=sesli arama + hızlı SMS';

-- Tüm hizmet verenler varsayılan: sesli + hızlı SMS
update public.cekiciler set bildirim_seviye = 3;

-- Eski boolean ile uyum: seviye>=2 → premium açık
update public.cekiciler
set premium_sms_aktif = (bildirim_seviye >= 2);
