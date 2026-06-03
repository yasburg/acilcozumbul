-- Talep fotoğrafı + araç modeli
alter table public.talepler
  add column if not exists arac_modeli text,
  add column if not exists fotograf_urls text[] not null default '{}';

-- Supabase Storage: talep fotoğrafları (sunucu service role ile yükler, herkese okuma)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'talep-fotograflari',
  'talep-fotograflari',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "talep_fotograf_public_read" on storage.objects;
create policy "talep_fotograf_public_read"
  on storage.objects for select
  using (bucket_id = 'talep-fotograflari');
