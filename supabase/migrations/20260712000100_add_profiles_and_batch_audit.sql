create table if not exists public.profiles (
  id uuid primary key,
  full_name text,
  role text not null default 'staff',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_role_check check (role in ('staff', 'admin'))
);

alter table public.profiles enable row level security;

alter table public.product_batches
  add column if not exists created_by uuid references public.profiles(id) on delete set null,
  add column if not exists updated_by uuid references public.profiles(id) on delete set null,
  add column if not exists deleted_by uuid references public.profiles(id) on delete set null,
  add column if not exists deleted_at timestamptz;

alter table public.product_batches
  drop constraint if exists product_batches_quantity_positive;

alter table public.product_batches
  add constraint product_batches_quantity_non_negative check (quantity >= 0);

create index if not exists profiles_role_idx
  on public.profiles (role);

create index if not exists profiles_is_active_idx
  on public.profiles (is_active);

create index if not exists product_batches_created_by_idx
  on public.product_batches (created_by);

create index if not exists product_batches_updated_by_idx
  on public.product_batches (updated_by);

create index if not exists product_batches_deleted_by_idx
  on public.product_batches (deleted_by);

drop trigger if exists profiles_set_updated_at on public.profiles;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();
