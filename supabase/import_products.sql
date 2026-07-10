-- Import master produk aman.
-- Jalankan setelah migration schema dan setelah CSV bersih di-import ke public.products_import.
-- Preflight akan menggagalkan transaksi jika jumlah staging atau barcode belum aman.

begin;

-- 1. Preflight wajib: hentikan transaksi jika staging tidak sesuai dataset bersih.
do $$
declare
  total_rows integer;
  ok_rows integer;
  review_rows integer;
  duplicate_barcode_rows integer;
begin
  select count(*) into total_rows
  from public.products_import;

  select count(*) into ok_rows
  from public.products_import
  where import_status = 'ok';

  select count(*) into review_rows
  from public.products_import
  where import_status = 'review';

  select count(*) into duplicate_barcode_rows
  from (
    select nullif(btrim(barcode), '') as barcode
    from public.products_import
    where import_status = 'ok'
      and nullif(btrim(barcode), '') is not null
    group by nullif(btrim(barcode), '')
    having count(*) > 1
  ) duplicate_barcodes;

  if total_rows <> 17856 then
    raise exception 'Invalid products_import row count: expected 17856, got %', total_rows;
  end if;

  if ok_rows <> 17655 then
    raise exception 'Invalid products_import ok row count: expected 17655, got %', ok_rows;
  end if;

  if review_rows <> 201 then
    raise exception 'Invalid products_import review row count: expected 201, got %', review_rows;
  end if;

  if duplicate_barcode_rows > 0 then
    raise exception 'Duplicate non-null barcode found in ok staging rows: % duplicate barcode values', duplicate_barcode_rows;
  end if;
end;
$$;

-- 2. Ringkasan staging untuk log manual setelah preflight lolos.
select count(*) as products_import_rows
from public.products_import;

select import_status, count(*) as rows
from public.products_import
group by import_status
order by import_status;

-- 3. Diagnostics: harus kosong karena duplicate barcode sudah dihentikan oleh preflight.
select
  nullif(btrim(barcode), '') as barcode,
  count(*) as rows
from public.products_import
where import_status = 'ok'
  and nullif(btrim(barcode), '') is not null
group by nullif(btrim(barcode), '')
having count(*) > 1
order by rows desc, barcode;

-- 4. Normalisasi kategori dari staging ok saja.
insert into public.categories (name)
select distinct btrim(category) as name
from public.products_import
where import_status = 'ok'
  and category is not null
  and length(btrim(category)) > 0
on conflict (name) do nothing;

-- 5. Pindahkan hanya data import_status = 'ok' ke production.
-- Baris review sengaja tidak ikut.
insert into public.products (
  barcode,
  internal_code,
  name,
  category_id,
  is_active
)
select
  nullif(btrim(pi.barcode), '') as barcode,
  nullif(btrim(pi.internal_code), '') as internal_code,
  btrim(pi.name) as name,
  c.id as category_id,
  true as is_active
from public.products_import pi
left join public.categories c
  on c.name = nullif(btrim(pi.category), '')
where pi.import_status = 'ok'
  and pi.name is not null
  and length(btrim(pi.name)) > 0
  and (
    nullif(btrim(pi.barcode), '') is not null
    or not exists (
      select 1
      from public.products existing
      where existing.barcode is null
        and coalesce(existing.internal_code, '') = coalesce(nullif(btrim(pi.internal_code), ''), '')
        and lower(existing.name) = lower(btrim(pi.name))
    )
  )
on conflict (barcode) where barcode is not null do update
set
  internal_code = excluded.internal_code,
  name = excluded.name,
  category_id = excluded.category_id,
  is_active = true,
  updated_at = now();

commit;

-- 6. Query validasi setelah commit.

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

-- Ganti nilai contoh di bawah dengan barcode yang memang memiliki leading zero.
select barcode as leading_zero_barcode_check
from public.products
where barcode like '0%'
limit 10;

-- Exact barcode lookup. Ganti nilainya dengan barcode valid dari data.
select
  p.id,
  p.barcode,
  p.internal_code,
  p.name,
  c.name as category
from public.products p
left join public.categories c on c.id = p.category_id
where p.is_active = true
  and p.barcode = 'ISI_BARCODE_VALID_DI_SINI'
limit 1;

-- Partial name search. Ganti query sesuai kebutuhan.
select
  p.id,
  p.barcode,
  p.internal_code,
  p.name,
  c.name as category
from public.products p
left join public.categories c on c.id = p.category_id
where p.is_active = true
  and p.name ilike '%' || 'ISI_NAMA_PRODUK_DI_SINI' || '%'
order by p.name
limit 10;

-- Internal code search. Ganti nilainya dengan internal_code valid dari data.
select
  p.id,
  p.barcode,
  p.internal_code,
  p.name,
  c.name as category
from public.products p
left join public.categories c on c.id = p.category_id
where p.is_active = true
  and p.internal_code = 'ISI_INTERNAL_CODE_VALID_DI_SINI'
limit 10;
