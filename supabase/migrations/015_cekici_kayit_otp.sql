-- Hizmet veren kayıt telefon doğrulama OTP (şifre sıfırlama tablosundan ayrı)

create table if not exists public.cekici_kayit_otp (
  telefon text primary key,
  kod text not null,
  olusturulma timestamptz not null,
  son_gonderim timestamptz not null,
  deneme int not null default 0,
  dogrulandi boolean not null default false
);

alter table public.cekici_kayit_otp enable row level security;

grant all on table public.cekici_kayit_otp to postgres, service_role;
