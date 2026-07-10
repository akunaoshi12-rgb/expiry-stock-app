create table if not exists public.product_batches (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  batch_number text,
  quantity integer not null,
  received_date date,
  expiry_date date not null,
  storage_location text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_batches_quantity_positive check (quantity > 0),
  constraint product_batches_expiry_date_reasonable check (
    expiry_date >= date '2000-01-01'
    and expiry_date <= date '2100-12-31'
  ),
  constraint product_batches_expiry_not_before_received check (
    received_date is null or expiry_date >= received_date
  ),
  constraint product_batches_batch_number_length check (
    batch_number is null or length(batch_number) <= 100
  ),
  constraint product_batches_storage_location_length check (
    storage_location is null or length(storage_location) <= 150
  ),
  constraint product_batches_notes_length check (
    notes is null or length(notes) <= 1000
  )
);

create index if not exists product_batches_product_id_idx
  on public.product_batches (product_id);

create index if not exists product_batches_expiry_date_idx
  on public.product_batches (expiry_date);

create index if not exists product_batches_is_active_idx
  on public.product_batches (is_active);

create index if not exists product_batches_is_active_expiry_date_idx
  on public.product_batches (is_active, expiry_date);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.normalize_product_batch_fields()
returns trigger
language plpgsql
as $$
begin
  new.batch_number = nullif(btrim(new.batch_number), '');
  new.storage_location = nullif(btrim(new.storage_location), '');
  new.notes = nullif(btrim(new.notes), '');
  return new;
end;
$$;

drop trigger if exists product_batches_normalize_fields on public.product_batches;

create trigger product_batches_normalize_fields
before insert or update on public.product_batches
for each row
execute function public.normalize_product_batch_fields();

drop trigger if exists product_batches_set_updated_at on public.product_batches;

create trigger product_batches_set_updated_at
before update on public.product_batches
for each row
execute function public.set_updated_at();

alter table public.product_batches enable row level security;
