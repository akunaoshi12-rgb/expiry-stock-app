# REST API Contract

Base path:

```text
/api
```

Semua endpoint terlindungi harus menerima:

```http
Authorization: Bearer <supabase_access_token>
```

## 1. Format Response

### Berhasil

```json
{
  "data": {},
  "error": null
}
```

### Gagal

```json
{
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Data yang dikirim tidak valid.",
    "details": {}
  }
}
```

Jangan mengirim stack trace atau detail internal database.

## 2. Health Check

### `GET /health`

Response:

```json
{
  "status": "ok"
}
```

## 3. Product Search

### `GET /api/products/search?q={query}&limit=10`

Aturan:

- Query wajib.
- Nama minimal 2 karakter.
- Exact barcode diprioritaskan.
- Maksimal 10 hasil.
- Hanya produk aktif.

Response:

```json
{
  "data": [
    {
      "id": "uuid",
      "barcode": "8991234567890",
      "name": "Organic Almond Milk 1L",
      "category": {
        "id": "uuid",
        "name": "Plant-Based Milk"
      },
      "unit": "pcs"
    }
  ],
  "error": null
}
```

### `GET /api/products/{product_id}`

Mengambil detail satu produk.

## 4. Expiry Batches

### `GET /api/expiry-batches`

Query parameters:

```text
search=
category_id=
status=
date_from=
date_to=
sort=expiry_date
order=asc
page=1
page_size=20
```

Response item:

```json
{
  "id": "uuid",
  "product": {
    "id": "uuid",
    "barcode": "8991234567890",
    "name": "Organic Almond Milk 1L",
    "category": "Plant-Based Milk"
  },
  "expiry_date": "2026-07-20",
  "remaining_stock": 8,
  "batch_number": "BATCH-0726",
  "location": "Rak pendingin",
  "notes": null,
  "status": "urgent",
  "days_remaining": 10,
  "created_at": "2026-07-10T10:00:00Z",
  "updated_at": "2026-07-10T10:00:00Z"
}
```

### `POST /api/expiry-batches`

Request:

```json
{
  "product_id": "uuid",
  "expiry_date": "2026-07-20",
  "remaining_stock": 8,
  "batch_number": "BATCH-0726",
  "location": "Rak pendingin",
  "notes": "Display depan"
}
```

Validasi:

- `product_id` harus ada dan aktif.
- `expiry_date` harus valid.
- `remaining_stock` integer minimal 0.
- `created_by` diambil dari token.

### `GET /api/expiry-batches/{batch_id}`

Mengambil detail satu batch.

### `PATCH /api/expiry-batches/{batch_id}`

Request parsial:

```json
{
  "expiry_date": "2026-07-22",
  "remaining_stock": 5,
  "location": "Rak belakang",
  "notes": "Dipindahkan"
}
```

### `DELETE /api/expiry-batches/{batch_id}`

- Memerlukan konfirmasi di frontend.
- Dapat dibatasi hanya untuk admin.
- Return status 204 atau response sukses konsisten.

## 5. Stock Update

Setelah tabel movement tersedia:

### `POST /api/expiry-batches/{batch_id}/stock-adjustments`

Request:

```json
{
  "type": "decrease",
  "quantity": 3,
  "reason": "Terjual"
}
```

Backend harus memastikan stok akhir tidak negatif.

## 6. Dashboard

### `GET /api/dashboard/summary`

Response:

```json
{
  "data": {
    "expired_batches": 5,
    "critical_batches": 12,
    "urgent_batches": 18,
    "warning_batches": 31,
    "at_risk_stock": 126
  },
  "error": null
}
```

### `GET /api/dashboard/upcoming?limit=10`

Mengembalikan batch aktif dengan tanggal terdekat.

## 7. Error Codes

| Code | Makna |
|---|---|
| `UNAUTHORIZED` | Token tidak tersedia atau tidak valid |
| `FORBIDDEN` | Pengguna tidak memiliki izin |
| `NOT_FOUND` | Data tidak ditemukan |
| `VALIDATION_ERROR` | Input tidak valid |
| `PRODUCT_INACTIVE` | Produk tidak aktif |
| `NEGATIVE_STOCK` | Perubahan menghasilkan stok negatif |
| `CONFLICT` | Data bertentangan dengan aturan |
| `INTERNAL_ERROR` | Error internal tanpa detail sensitif |

## 8. HTTP Status

| Status | Penggunaan |
|---|---|
| 200 | Request berhasil |
| 201 | Data berhasil dibuat |
| 204 | Hapus berhasil tanpa body |
| 400 | Input atau business rule salah |
| 401 | Belum terautentikasi |
| 403 | Tidak memiliki izin |
| 404 | Data tidak ditemukan |
| 409 | Konflik data |
| 422 | Validasi schema |
| 500 | Error internal |

## 9. Pagination

Gunakan pagination untuk daftar batch.

Response metadata:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "page_size": 20,
    "total": 125,
    "total_pages": 7
  },
  "error": null
}
```
