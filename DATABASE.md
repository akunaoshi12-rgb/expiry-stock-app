# Database Design

## 1. Prinsip

- Master produk terpisah dari data expired.
- Satu produk dapat memiliki banyak batch expired.
- Stok tidak boleh negatif.
- Barcode harus unik jika tersedia.
- Relasi menggunakan UUID.
- Semua perubahan schema melalui migration.

## 2. Tabel `categories`

```sql
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);
```

## 3. Tabel `products`

```sql
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  barcode text unique,
  name text not null,
  category_id uuid references public.categories(id) on delete set null,
  unit text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Index pencarian:

```sql
create index if not exists products_name_idx
  on public.products using btree (lower(name));

create index if not exists products_barcode_idx
  on public.products (barcode);

create index if not exists products_category_id_idx
  on public.products (category_id);
```

Untuk pencarian nama yang lebih fleksibel, pertimbangkan `pg_trgm` setelah MVP dan setelah kebutuhan performa terbukti.

## 4. Tabel `expiry_batches`

```sql
create table if not exists public.expiry_batches (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  expiry_date date not null,
  remaining_stock integer not null check (remaining_stock >= 0),
  batch_number text,
  location text,
  notes text,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Index:

```sql
create index if not exists expiry_batches_product_id_idx
  on public.expiry_batches (product_id);

create index if not exists expiry_batches_expiry_date_idx
  on public.expiry_batches (expiry_date);

create index if not exists expiry_batches_remaining_stock_idx
  on public.expiry_batches (remaining_stock);
```

## 5. Tabel `profiles`

Digunakan untuk role aplikasi.

```sql
create table if not exists public.profiles (
  id uuid primary key,
  full_name text,
  role text not null default 'staff'
    check (role in ('staff', 'admin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

`profiles.id` harus sesuai dengan user ID Supabase Auth.

## 6. Tabel `stock_movements`

Tabel ini direkomendasikan setelah MVP stabil.

```sql
create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  expiry_batch_id uuid not null
    references public.expiry_batches(id) on delete cascade,
  movement_type text not null
    check (movement_type in ('set', 'increase', 'decrease')),
  quantity integer not null,
  stock_before integer not null check (stock_before >= 0),
  stock_after integer not null check (stock_after >= 0),
  reason text,
  created_by uuid not null,
  created_at timestamptz not null default now()
);
```

## 7. Relasi

```text
categories 1 ─── n products
products   1 ─── n expiry_batches
expiry_batches 1 ─── n stock_movements
profiles   1 ─── n expiry_batches
profiles   1 ─── n stock_movements
```

## 8. Status Expired

Status tidak perlu disimpan sebagai kolom tetap karena berubah setiap hari.

Status dihitung dari `expiry_date`:

```text
expiry_date < today          → expired
0 sampai 7 hari              → critical
8 sampai 14 hari             → urgent
15 sampai 30 hari            → warning
lebih dari 30 hari           → safe
```

Perhitungan dilakukan di backend agar hasil konsisten.

## 9. Aturan Data

- `product_id` wajib valid.
- `remaining_stock` minimal 0.
- `expiry_date` wajib.
- `created_by` diperoleh dari JWT, bukan request body.
- Batch dengan stok 0 boleh tetap disimpan untuk riwayat.
- Produk nonaktif tidak boleh dipilih untuk batch baru.
- Penghapusan produk dibatasi jika masih memiliki batch.

## 10. Query Pencarian Contoh

Exact barcode:

```sql
select
  p.id,
  p.barcode,
  p.name,
  c.name as category
from public.products p
left join public.categories c on c.id = p.category_id
where p.is_active = true
  and p.barcode = :barcode
limit 1;
```

Partial name:

```sql
select
  p.id,
  p.barcode,
  p.name,
  c.name as category
from public.products p
left join public.categories c on c.id = p.category_id
where p.is_active = true
  and lower(p.name) like lower(:query)
order by p.name
limit 10;
```

## 11. Migration

Setiap perubahan schema:

1. Buat file migration baru.
2. Jangan mengedit migration lama yang sudah digunakan production.
3. Sertakan rollback plan untuk perubahan berisiko.
4. Uji migration pada database development.
5. Jangan menghapus data secara otomatis.
