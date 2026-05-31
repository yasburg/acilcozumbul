-- Memnuniyet: çok boyutlu puan + SMS hatırlatma bayrağı

alter table public.talepler
  add column if not exists memnuniyet_sms_gonderildi boolean not null default false;

alter table public.musteri_degerlendirmeler
  add column if not exists puan_genel int check (puan_genel >= 1 and puan_genel <= 5),
  add column if not exists puan_fiyat int check (puan_fiyat >= 1 and puan_fiyat <= 5),
  add column if not exists puan_sure int check (puan_sure >= 1 and puan_sure <= 5);

update public.musteri_degerlendirmeler
set
  puan_genel = puan,
  puan_fiyat = puan,
  puan_sure = puan
where puan_genel is null and puan is not null;
