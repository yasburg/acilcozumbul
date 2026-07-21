-- Çekici hesap silme SMS doğrulama kodu

create table if not exists public.cekici_hesap_sil_otp (
  telefon text primary key,
  kod text not null,
  olusturulma timestamptz not null,
  son_gonderim timestamptz not null,
  deneme int not null default 0,
  dogrulandi boolean not null default false
);

alter table public.cekici_hesap_sil_otp enable row level security;

grant all on table public.cekici_hesap_sil_otp to postgres, service_role;

comment on table public.cekici_hesap_sil_otp is
  'Çekici hesap silme onay kodu (XML/toplu SMS ile gönderilir)';
