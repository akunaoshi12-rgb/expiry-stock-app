# Architecture

## 1. Ringkasan Arsitektur

```text
Browser
  ↓
Next.js Frontend
  ↓ Authorization: Bearer <JWT>
FastAPI Backend
  ↓
Supabase PostgreSQL
```

Authentication dilakukan melalui Supabase Auth. Backend memverifikasi token sebelum mengakses data terlindungi.

## 2. Pembagian Tanggung Jawab

### Next.js

- Menampilkan halaman.
- Menangani interaksi pengguna.
- Mengelola form state.
- Mengambil session Supabase.
- Mengirim request ke FastAPI.
- Menampilkan loading, success, empty, dan error state.

### FastAPI

- Menyediakan REST API.
- Memverifikasi JWT.
- Memeriksa role.
- Memvalidasi request.
- Menjalankan logika bisnis.
- Membaca dan mengubah data database.
- Menghasilkan response konsisten.
- Menulis audit log jika diperlukan.

### Supabase

- PostgreSQL database.
- Authentication.
- User identity.
- Row Level Security jika database diakses melalui Supabase API.
- Migration dan pengelolaan schema.

### Railway

- Menjalankan service frontend.
- Menjalankan service backend.
- Menyimpan environment variables untuk masing-masing service.
- Menghubungkan deployment dengan GitHub.

## 3. Service

### Frontend Service

Root directory:

```text
/frontend
```

Environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_API_BASE_URL=
```

### Backend Service

Root directory:

```text
/backend
```

Environment variables:

```env
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
FRONTEND_URL=
ENVIRONMENT=
```

Gunakan secret key hanya bila benar-benar diperlukan dan hanya di backend.

## 4. Modul Backend

```text
backend/app/
├── api/
│   ├── dependencies.py
│   ├── products.py
│   ├── expiry_batches.py
│   └── dashboard.py
├── core/
│   ├── config.py
│   ├── auth.py
│   └── errors.py
├── repositories/
│   ├── products.py
│   └── expiry_batches.py
├── schemas/
│   ├── products.py
│   ├── expiry_batches.py
│   └── common.py
├── services/
│   ├── product_search.py
│   ├── expiry.py
│   └── dashboard.py
└── main.py
```

### Route

Menerima request dan mengembalikan response.

### Service

Menjalankan logika bisnis.

### Repository

Berkomunikasi dengan database.

### Schema

Mendefinisikan request dan response menggunakan Pydantic.

## 5. Modul Frontend

```text
frontend/
├── app/
│   ├── login/
│   ├── dashboard/
│   ├── expiry/
│   │   ├── page.tsx
│   │   └── new/
│   └── products/
├── components/
│   ├── product-search/
│   ├── expiry-form/
│   ├── expiry-table/
│   └── ui/
├── lib/
│   ├── api-client.ts
│   ├── supabase/
│   └── validators/
└── types/
```

## 6. Alur Authentication

```text
User login di frontend
→ Supabase Auth mengembalikan session
→ Frontend mengambil access token
→ Frontend mengirim token ke FastAPI
→ FastAPI memverifikasi token
→ FastAPI memperoleh user ID dan role
→ Endpoint dijalankan jika izin sesuai
```

## 7. Alur Pencarian Produk

```text
User mengetik nama atau barcode
→ Frontend menunggu debounce
→ GET /api/products/search?q=...
→ Backend validasi query
→ Repository mencari exact barcode atau partial name
→ Maksimal 10 hasil
→ Frontend menampilkan autocomplete
```

## 8. Alur Input Expired

```text
User memilih produk
→ User mengisi tanggal dan stok
→ Frontend melakukan validasi dasar
→ POST /api/expiry-batches
→ Backend memverifikasi user
→ Backend memvalidasi product_id
→ Backend menyimpan batch
→ Frontend memperbarui tampilan
```

## 9. Prinsip Arsitektur

- Satu sumber logika bisnis.
- Perubahan database melalui migration.
- API contract terdokumentasi.
- Dependency minimal.
- Komponen dan modul fokus.
- Logging tanpa informasi sensitif.
- Error response konsisten.
- Tidak mengambil seluruh master data ke frontend.
