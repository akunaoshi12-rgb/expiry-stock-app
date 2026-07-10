# Supabase Setup Checklist

Dokumen ini adalah checklist aman untuk menjalankan migration dan import master produk pada Supabase development.

Jangan gunakan production project untuk percobaan pertama.

## Persiapan Supabase Development

- Gunakan project Supabase development, bukan production.
- Jangan menaruh project URL, anon key, service-role key, password database, atau access token di repository.
- Buka file migration dan review SQL sebelum dijalankan:

  ```text
  supabase/migrations/20260711000100_create_product_master_import.sql
  ```

- Buka file import production dan review SQL sebelum dipakai:

  ```text
  supabase/import_products.sql
  ```

- Pastikan CSV internal tetap berada di luar repository:

  ```text
  /media/ade/Data/My Project/growell-stock-analyzer/output/masterdata_clean.csv
  ```

## Checklist Migration Development

1. Buka Supabase Dashboard untuk project development.
2. Buka SQL Editor.
3. Salin seluruh isi migration:

   ```text
   supabase/migrations/20260711000100_create_product_master_import.sql
   ```

4. Jalankan migration schema.
5. Jalankan query verifikasi schema di bawah.
6. Jangan import CSV ke `products`.
7. Import CSV hanya ke `products_import`.
8. Jalankan preflight staging.
9. Jalankan `supabase/import_products.sql` hanya jika semua angka preflight sesuai.

## Query Verifikasi Extension

```sql
select extname
from pg_extension
where extname in ('pgcrypto', 'pg_trgm')
order by extname;
```

Hasil wajib:

```text
pg_trgm
pgcrypto
```

## Query Verifikasi Tabel

```sql
select table_schema, table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('categories', 'products', 'products_import')
order by table_name;
```

Hasil wajib:

```text
categories
products
products_import
```

## Query Verifikasi Kolom

```sql
select
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in ('categories', 'products', 'products_import')
order by table_name, ordinal_position;
```

Periksa khusus:

- `products.barcode` bertipe `text` dan nullable.
- `products.internal_code` bertipe `text` dan nullable.
- `products.name` `not null`.
- `products_import.source_row` `not null`.
- `products_import.import_status` `not null`.

## Query Verifikasi Constraint

```sql
select
  conrelid::regclass as table_name,
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid in (
  'public.categories'::regclass,
  'public.products'::regclass,
  'public.products_import'::regclass
)
order by table_name::text, constraint_name;
```

Periksa wajib:

- Primary key pada `categories` dan `products`.
- Unique pada `categories.name`.
- Unique pada `products_import.source_row`.
- Check `products_import.import_status in ('ok', 'review')`.
- Check nama produk/kategori tidak kosong.
- Foreign key `products.category_id` ke `categories.id`.

## Query Verifikasi Index

```sql
select
  schemaname,
  tablename,
  indexname,
  indexdef
from pg_indexes
where schemaname = 'public'
  and tablename in ('categories', 'products', 'products_import')
order by tablename, indexname;
```

Periksa wajib:

- `products_barcode_unique_idx` adalah unique partial index dengan `where barcode is not null`.
- `products_internal_code_idx`.
- `products_lower_name_idx`.
- `products_category_id_idx`.
- `products_name_trgm_idx` memakai `gin` dan `gin_trgm_ops`.
- Index staging untuk `products_import.import_status`, `barcode`, `internal_code`, dan `category`.
- Tidak perlu ada `products_barcode_idx` biasa karena redundan.
- Tidak perlu ada `products_is_active_idx` untuk MVP karena mayoritas produk aktif.

## Query Verifikasi RLS

```sql
select
  schemaname,
  tablename,
  rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('categories', 'products', 'products_import')
order by tablename;
```

Hasil wajib:

```text
categories       rowsecurity = true
products         rowsecurity = true
products_import  rowsecurity = true
```

## Query Verifikasi Tidak Ada Policy Publik

```sql
select
  schemaname,
  tablename,
  policyname,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('categories', 'products', 'products_import')
order by tablename, policyname;
```

Hasil wajib pada tahap ini:

```text
0 rows
```

Akses aplikasi akan dilakukan melalui FastAPI backend. Frontend tidak boleh membaca tabel Supabase langsung.

## Import CSV Ke Staging

Gunakan Supabase Dashboard:

1. Buka Table Editor.
2. Pilih tabel `products_import`.
3. Klik import CSV.
4. Pilih file:

   ```text
   /media/ade/Data/My Project/growell-stock-analyzer/output/masterdata_clean.csv
   ```

5. Cocokkan header CSV:

   ```text
   source_row, source_code, barcode, internal_code, name, category, barcode_type, import_status
   ```

6. Pastikan `source_code`, `barcode`, dan `internal_code` diperlakukan sebagai text.
7. Jangan mengubah file sumber.
8. Jangan import CSV ke `products` secara langsung.
9. Jangan import row `review` ke production.

## Query Preflight Staging

Jalankan query ini setelah CSV masuk ke `products_import`, sebelum menjalankan `supabase/import_products.sql`.

```sql
select count(*) as total_rows
from public.products_import;
```

Wajib:

```text
17856
```

```sql
select count(*) as ok_rows
from public.products_import
where import_status = 'ok';
```

Wajib:

```text
17655
```

```sql
select count(*) as review_rows
from public.products_import
where import_status = 'review';
```

Wajib:

```text
201
```

```sql
select
  nullif(btrim(barcode), '') as barcode,
  count(*) as rows
from public.products_import
where import_status = 'ok'
  and nullif(btrim(barcode), '') is not null
group by nullif(btrim(barcode), '')
having count(*) > 1
order by rows desc, barcode;
```

Wajib:

```text
0 rows
```

```sql
select count(*) as empty_source_row_rows
from public.products_import
where source_row is null;
```

Wajib:

```text
0
```

```sql
select source_row, count(*) as rows
from public.products_import
group by source_row
having count(*) > 1
order by rows desc, source_row;
```

Wajib:

```text
0 rows
```

## Syarat Sebelum Menjalankan `import_products.sql`

Jangan jalankan insert kategori dan `products` sebelum semua kondisi ini benar:

- `total_rows = 17856`
- `ok_rows = 17655`
- `review_rows = 201`
- duplicate barcode pada row `ok` = `0 rows`
- `empty_source_row_rows = 0`
- duplicate `source_row` = `0 rows`
- RLS aktif pada tiga tabel.
- Tidak ada policy publik.

Jika kondisi sudah benar, buka SQL Editor dan jalankan:

```text
supabase/import_products.sql
```

File tersebut memakai transaction. Preflight di dalamnya akan menggagalkan transaksi jika count staging atau duplicate barcode tidak sesuai.

## Reset Staging

Jika import CSV salah atau perlu mengulang CSV yang sama:

```sql
truncate table public.products_import;
```

Setelah reset, ulangi import CSV ke `products_import` dan jalankan preflight lagi.

## Rollback Dasar

Jika import belum dipakai aplikasi dan masih di development:

```sql
truncate table public.products restart identity cascade;
truncate table public.categories restart identity cascade;
truncate table public.products_import restart identity;
```

Jika hanya staging yang salah:

```sql
truncate table public.products_import;
```

Jangan melakukan truncate manual pada production. Untuk production, buat backup, catat penyebab, dan uji rollback di development dulu.

## Larangan

- Jangan menjalankan migration pertama kali di production.
- Jangan menaruh credential Supabase di repository.
- Jangan commit CSV internal.
- Jangan import CSV ke `products` langsung.
- Jangan menjalankan `supabase/import_products.sql` sebelum preflight staging sesuai.
- Jangan membuat policy publik untuk `categories`, `products`, atau `products_import` pada tahap ini.
