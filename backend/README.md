# Backend API

Backend FastAPI untuk Expiry Stock App.

## Environment Variable

Buat file `.env` lokal di folder `backend/` jika menjalankan backend dari folder ini. Jangan commit file `.env`.

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
FRONTEND_URL=http://127.0.0.1:3000
```

`SUPABASE_SERVICE_ROLE_KEY` hanya boleh ada di backend server-side. Jangan gunakan prefix `NEXT_PUBLIC_` untuk secret backend.

## Cara Menjalankan

```bash
cd backend
python -m pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Cara Menguji

```bash
cd backend
python -m compileall app
pytest
```

## Contoh Curl

```bash
curl "http://127.0.0.1:8000/health"
curl "http://127.0.0.1:8000/api/dashboard/summary"
curl "http://127.0.0.1:8000/api/products/search?q=almond&limit=10"
curl "http://127.0.0.1:8000/api/products/search?q=089686123456"
```

## Product Search

Endpoint:

```text
GET /api/products/search?q={query}&limit={limit}
```

Aturan:

- Exact barcode diprioritaskan.
- Exact internal code diprioritaskan setelah barcode.
- Nama produk dicari case-insensitive.
- Hanya produk aktif yang dikembalikan.
- Hasil maksimal 10.
- Empty result mengembalikan `data: []`.

## Product Batch Create

Sebelum memakai endpoint ini di Supabase development, jalankan migration:

```text
supabase/migrations/20260711000200_create_product_batches.sql
```

Endpoint:

```text
POST /api/product-batches
```

Contoh curl:

```bash
curl -X POST "http://127.0.0.1:8000/api/product-batches" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "UUID_PRODUK_VALID",
    "batch_number": "BATCH-001",
    "quantity": 12,
    "received_date": "2026-07-11",
    "expiry_date": "2026-10-31",
    "storage_location": "Gudang A",
    "notes": "Rak pendingin"
  }'
```

Contoh response sukses:

```json
{
  "data": {
    "id": "uuid",
    "product_id": "uuid",
    "batch_number": "BATCH-001",
    "quantity": 12,
    "received_date": "2026-07-11",
    "expiry_date": "2026-10-31",
    "storage_location": "Gudang A",
    "notes": "Rak pendingin",
    "is_active": true,
    "created_at": "2026-07-11T08:00:00+00:00",
    "updated_at": "2026-07-11T08:00:00+00:00"
  },
  "error": null
}
```

Verifikasi data di Supabase SQL Editor:

```sql
select
  pb.id,
  pb.product_id,
  p.name as product_name,
  pb.batch_number,
  pb.quantity,
  pb.received_date,
  pb.expiry_date,
  pb.storage_location,
  pb.notes,
  pb.created_at
from public.product_batches pb
join public.products p on p.id = pb.product_id
order by pb.created_at desc
limit 20;
```

Catatan keamanan:

- Frontend tidak boleh memakai credential Supabase.
- Endpoint ini memakai `SUPABASE_SERVICE_ROLE_KEY` hanya di backend.
- RLS aktif di tabel `product_batches`, dan tidak ada policy publik.
