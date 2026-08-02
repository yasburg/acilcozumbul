-- Ödeme makbuzu PDF: private Storage + tahmin edilemez deep-link token

create table if not exists public.fatura_link (
  id text primary key,
  token text not null unique,
  cekici_id text not null references public.cekiciler (id) on delete restrict,
  kredi_odeme_id text references public.kredi_odemeler (id) on delete restrict,
  storage_path text not null,
  belge_no text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  son_erisim_at timestamptz
);

create unique index if not exists fatura_link_kredi_odeme_id_uidx
  on public.fatura_link (kredi_odeme_id);

create index if not exists fatura_link_cekici_id_created_idx
  on public.fatura_link (cekici_id, created_at desc);

create index if not exists fatura_link_token_idx
  on public.fatura_link (token);

alter table public.fatura_link enable row level security;

grant all on table public.fatura_link to postgres, service_role;

-- Private bucket: public URL yok; erişim yalnızca service_role (sunucu)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'faturalar',
  'faturalar',
  false,
  5242880,
  array['application/pdf']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
