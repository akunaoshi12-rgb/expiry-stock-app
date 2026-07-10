# Import Master Produk

Dokumen ini menjelaskan cara menyiapkan schema Supabase PostgreSQL dan mengimport master produk yang sudah dibersihkan.

## Tabel Yang Dibuat

Migration membuat tiga tabel:

- `public.categories`: master kategori produk.
- `public.products`: master produk production yang dipakai aplikasi.
- `public.products_import`: staging untuk CSV bersih sebelum data masuk production.

Kolom staging `products_import` mengikuti CSV bersih:

```text
source_row, source_code, barcode, internal_code, name, category, barcode_type, import_status
```

`barcode` memakai tipe `text` agar leading zero tidak hilang.

`products_import.source_row` wajib unik. Untuk MVP satu dataset, aturan ini mencegah CSV yang sama masuk dua kali tanpa membersihkan staging lebih dulu.

## Urutan Migration

1. Buka Supabase SQL Editor pada database development.
2. Tampilkan dan review isi migration:

   ```text
   supabase/migrations/20260711000100_create_product_master_import.sql
   ```

3. Jalankan migration tersebut.
4. Pastikan tabel, constraint, dan index berhasil dibuat.

Migration mengaktifkan extension:

- `pgcrypto` untuk `gen_random_uuid()`.
- `pg_trgm` untuk trigram index pencarian nama produk.

Migration juga mengaktifkan Row Level Security pada:

- `public.categories`
- `public.products`
- `public.products_import`

Tidak ada policy publik yang dibuat. Jalur akses aplikasi tetap melalui FastAPI backend, bukan akses langsung dari frontend ke tabel Supabase.

## Cara Import CSV Ke `products_import`

Jangan commit file CSV internal ke Git.

Opsi Supabase Dashboard:

1. Buka table editor.
2. Pilih tabel `products_import`.
3. Import CSV bersih.
4. Pastikan kolom CSV cocok dengan kolom staging.
5. Pastikan `barcode` dan `internal_code` diperlakukan sebagai text, bukan angka.

Opsi `psql` dari mesin lokal:

```sql
\copy public.products_import (
  source_row,
  source_code,
  barcode,
  internal_code,
  name,
  category,
  barcode_type,
  import_status
) from '/path/ke/file-clean.csv' with (format csv, header true);
```

Target hasil import staging:

```text
products_import total rows: 17856
import_status = ok: 17655
import_status = review: 201
```

Jika perlu import ulang CSV yang sama, bersihkan staging terlebih dahulu:

```sql
truncate table public.products_import;
```

Tanpa langkah ini, import CSV yang sama akan gagal karena `source_row` sudah ada.

## Preflight Staging

File `supabase/import_products.sql` memiliki blok `DO` PL/pgSQL yang otomatis menghentikan transaksi dengan `RAISE EXCEPTION` jika:

- total staging bukan `17856`;
- row `ok` bukan `17655`;
- row `review` bukan `201`;
- ada duplicate barcode non-null pada row `import_status = 'ok'`.

Query diagnostics berikut tetap tersedia untuk melihat isi staging, tetapi pengaman utama ada pada preflight otomatis:

```sql
select count(*) as products_import_rows
from public.products_import;

select import_status, count(*) as rows
from public.products_import
group by import_status
order by import_status;

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

Jika preflight gagal, transaksi berhenti sebelum kategori atau produk production berubah.

## Memindahkan Data `ok` Ke `products`

Gunakan file:

```text
supabase/import_products.sql
```

Flow di dalam file:

1. Mulai transaksi.
2. Jalankan preflight count dan duplicate barcode.
3. Insert distinct kategori dari row `import_status = 'ok'` saja.
4. Insert hanya baris `import_status = 'ok'` ke `products`.
5. Biarkan baris `import_status = 'review'` tetap di `products_import`.
6. Commit jika semua langkah berhasil.

Transformasi saat insert production:

- `barcode` kosong menjadi `null`.
- `internal_code` kosong menjadi `null`.
- `name` di-`trim`.
- `category` dicocokkan ke `categories.name`.
- `is_active` memakai default `true`.

## Memeriksa 201 Row Review

Baris `review` tidak boleh masuk production.

```sql
select *
from public.products_import
where import_status = 'review'
order by source_row;
```

Validasi jumlah review:

```sql
select count(*) as review_rows
from public.products_import
where import_status = 'review';
```

Nilai yang diharapkan:

```text
review_rows = 201
```

## Query Validasi Setelah Import

```sql
select count(*) as products_import_rows
from public.products_import;

select count(*) as ok_rows
from public.products_import
where import_status = 'ok';

select count(*) as review_rows
from public.products_import
where import_status = 'review';

select count(*) as products_rows
from public.products;

select count(*) as categories_rows
from public.categories;

select count(*) as products_barcode_null_rows
from public.products
where barcode is null;

select
  nullif(btrim(barcode), '') as barcode,
  count(*) as rows
from public.products_import
where nullif(btrim(barcode), '') is not null
group by nullif(btrim(barcode), '')
having count(*) > 1
order by rows desc, barcode;

select count(*) as review_rows_not_in_production
from public.products_import pi
where pi.import_status = 'review'
  and not exists (
    select 1
    from public.products p
    where (
      nullif(btrim(pi.barcode), '') is not null
      and p.barcode = nullif(btrim(pi.barcode), '')
    )
    or (
      nullif(btrim(pi.barcode), '') is null
      and nullif(btrim(pi.internal_code), '') is not null
      and p.internal_code = nullif(btrim(pi.internal_code), '')
      and lower(p.name) = lower(btrim(pi.name))
    )
  );
```

Nilai yang diharapkan:

```text
products_import_rows = 17856
ok_rows = 17655
review_rows = 201
products_rows = 17655
review_rows_not_in_production = 201
```

Catatan: jika ada produk lama di tabel `products`, jumlah `products_rows` bisa lebih besar dari `17655`.

## Validasi Search

Leading zero:

```sql
select barcode
from public.products
where barcode like '0%'
limit 10;
```

Exact barcode:

```sql
select p.id, p.barcode, p.internal_code, p.name, c.name as category
from public.products p
left join public.categories c on c.id = p.category_id
where p.is_active = true
  and p.barcode = 'ISI_BARCODE_VALID_DI_SINI'
limit 1;
```

Partial name:

```sql
select p.id, p.barcode, p.internal_code, p.name, c.name as category
from public.products p
left join public.categories c on c.id = p.category_id
where p.is_active = true
  and p.name ilike '%' || 'ISI_NAMA_PRODUK_DI_SINI' || '%'
order by p.name
limit 10;
```

Internal code:

```sql
select p.id, p.barcode, p.internal_code, p.name, c.name as category
from public.products p
left join public.categories c on c.id = p.category_id
where p.is_active = true
  and p.internal_code = 'ISI_INTERNAL_CODE_VALID_DI_SINI'
limit 10;
```

## Rollback Plan

Jika import belum benar dan belum dipakai aplikasi:

```sql
truncate table public.products restart identity cascade;
truncate table public.categories restart identity cascade;
truncate table public.products_import restart identity;
```

Jika hanya perlu mengulang staging:

```sql
truncate table public.products_import;
```

Ini wajib dilakukan sebelum import ulang CSV yang sama karena `source_row` unik. Aturan ini cocok untuk satu dataset master produk yang sedang dipakai sekarang. Jika nanti ada banyak file import berbeda dengan `source_row` yang sama-sama mulai dari 1, schema staging perlu ditambah identitas batch import, misalnya `import_batch_id`.

Jika sudah ada data production yang dipakai aplikasi, jangan truncate manual. Buat backup dulu, catat penyebab, lalu lakukan rollback terarah pada database development sebelum production.

## Risiko Barcode Duplikat

`products.barcode` boleh `null`, tetapi barcode yang tidak `null` harus unik melalui partial unique index.

Risiko utama:

- CSV `ok` memiliki barcode duplikat.
- Barcode terlihat angka oleh spreadsheet sehingga leading zero hilang sebelum import.
- Produk tanpa barcode bisa masuk lebih dari sekali jika import production diulang tanpa review.
- `source_row` unik hanya aman untuk satu dataset. Banyak dataset import perlu kolom batch import.

Mitigasi:

- Gunakan preflight `supabase/import_products.sql`; transaksi akan gagal jika count atau duplicate barcode tidak aman.
- Pastikan barcode diimport sebagai `text`.
- Simpan CSV internal di luar repository.
- Review hasil validasi sebelum frontend/backend memakai data production.

## RLS Dan Akses Aplikasi

RLS aktif pada `categories`, `products`, dan `products_import`.

Tidak ada policy publik. Frontend tidak boleh membaca tabel Supabase langsung. Aplikasi harus mengakses data melalui FastAPI backend, lalu backend menggunakan koneksi database atau kredensial server-side yang disimpan sebagai environment variable di server.

## Larangan

- Jangan import baris `review` langsung ke `products`.
- Jangan commit CSV internal atau hasil cleaning CSV.
- Jangan menaruh credential Supabase di SQL, dokumentasi, atau source code.
- Jangan menjalankan migration ke production sebelum SQL direview dan berhasil di development.
