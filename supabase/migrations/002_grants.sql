-- "permission denied for table" hatası için (001'i zaten çalıştırdıysanız bunu çalıştırın)

grant usage on schema public to postgres, anon, authenticated, service_role;

grant all on table public.cekiciler to postgres, service_role;
grant all on table public.talepler to postgres, service_role;
grant all on table public.telefon_otp to postgres, service_role;
grant all on table public.sms_log to postgres, service_role;
grant all on table public.odeme_bekleyen to postgres, service_role;
