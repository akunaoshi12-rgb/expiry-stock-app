create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now(),
  constraint categories_name_not_blank check (length(btrim(name)) > 0)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  barcode text,
  internal_code text,
  name text not null,
  category_id uuid references public.categories(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_name_not_blank check (length(btrim(name)) > 0)
);

create table if not exists public.products_import (
  source_row integer not null,
  source_code text,
  barcode text,
  internal_code text,
  name text,
  category text,
  barcode_type text,
  import_status text not null,
  constraint products_import_status_check check (import_status in ('ok', 'review'))
);

alter table public.products_import
  alter column source_row set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_import_source_row_key'
      and conrelid = 'public.products_import'::regclass
  ) then
    alter table public.products_import
      add constraint products_import_source_row_key unique (source_row);
  end if;
end;
$$;

drop index if exists public.products_barcode_idx;
drop index if exists public.products_is_active_idx;

create unique index if not exists products_barcode_unique_idx
  on public.products (barcode)
  where barcode is not null;

create index if not exists products_internal_code_idx
  on public.products (internal_code);

create index if not exists products_lower_name_idx
  on public.products (lower(name));

create index if not exists products_category_id_idx
  on public.products (category_id);

create index if not exists products_name_trgm_idx
  on public.products using gin (name gin_trgm_ops);

create index if not exists products_import_status_idx
  on public.products_import (import_status);

create index if not exists products_import_barcode_idx
  on public.products_import (barcode);

create index if not exists products_import_internal_code_idx
  on public.products_import (internal_code);

create index if not exists products_import_category_idx
  on public.products_import (category);

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.products_import enable row level security;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;

create trigger products_set_updated_at
before update on public.products
for each row
execute function public.set_updated_at();
