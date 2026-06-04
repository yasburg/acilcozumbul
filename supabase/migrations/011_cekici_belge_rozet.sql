-- Çekici belge onayı ve onaylı çekici rozeti

alter table public.cekiciler
  add column if not exists belge_ruhsat_url text,
  add column if not exists belge_cekici_url text,
  add column if not exists belge_durum text not null default 'yok',
  add column if not exists belge_red_nedeni text,
  add column if not exists belge_gonderim timestamptz,
  add column if not exists rozet_aktif boolean not null default false,
  add column if not exists rozet_odeme_tarihi timestamptz;

alter table public.odeme_bekleyen
  add column if not exists odeme_tipi text not null default 'kredi',
  add column if not exists liste_fiyati numeric;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cekici-belgeler',
  'cekici-belgeler',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "cekici_belge_public_read" on storage.objects;
create policy "cekici_belge_public_read"
  on storage.objects for select
  using (bucket_id = 'cekici-belgeler');

grant all on table public.cekiciler to postgres, service_role;
