-- Outbound SMS kampanya kodu: kayıt olunca 50 kredi
insert into public.kampanya_kodlari (
  kod,
  yeni_uye_kredi,
  kanal,
  aciklama,
  aktif,
  kullanim_sayisi
)
values (
  'SMS50',
  50,
  'sms',
  'İstanbul çekici outbound SMS (kısa link sms50a–sms50z)',
  true,
  0
)
on conflict (kod) do update set
  yeni_uye_kredi = excluded.yeni_uye_kredi,
  kanal = excluded.kanal,
  aciklama = excluded.aciklama,
  aktif = true;
