-- Çekici profil fotoğrafı onayı

alter table public.cekiciler
  add column if not exists profil_foto_url text,
  add column if not exists profil_foto_durum text not null default 'yok',
  add column if not exists profil_foto_red_nedeni text,
  add column if not exists profil_foto_gonderim timestamptz;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cekici-profil-fotograflari',
  'cekici-profil-fotograflari',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "cekici_profil_foto_public_read" on storage.objects;
create policy "cekici_profil_foto_public_read"
  on storage.objects for select
  using (bucket_id = 'cekici-profil-fotograflari');

grant all on table public.cekiciler to postgres, service_role;
