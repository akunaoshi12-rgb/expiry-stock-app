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

