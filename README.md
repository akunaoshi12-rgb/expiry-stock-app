# Expiry Stock App

Aplikasi web internal untuk mencatat tanggal kedaluwarsa dan sisa stok produk berdasarkan master data produk yang sudah tersedia.

## Tujuan

Aplikasi membantu staf:

- Mencari produk menggunakan nama atau barcode.
- Mencatat tanggal kedaluwarsa untuk setiap batch produk.
- Mencatat dan memperbarui sisa stok pada batch tersebut.
- Melihat produk yang sudah expired atau mendekati expired.
- Memprioritaskan penanganan produk berdasarkan tanggal terdekat.
- Mengurangi pencatatan manual dan risiko produk terlewat.

## Stack

| Bagian | Teknologi |
|---|---|
| Frontend | Next.js + TypeScript |
| UI | Tailwind CSS |
| Backend API | Python + FastAPI |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| Repository | GitHub |
| Hosting | Railway |
| Struktur | Monorepo |

## Struktur Repository

```text
expiry-stock-app/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── types/
│   ├── package.json
│   └── next.config.ts
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
├── supabase/
│   └── migrations/
├── docs/
├── .env.example
├── .gitignore
├── AGENTS.md
├── PRD.md
└── README.md
```

## Fitur MVP

1. Login pengguna.
2. Pencarian produk berdasarkan nama atau barcode.
3. Pemilihan produk dari master data.
4. Input tanggal expired dan sisa stok.
5. Dukungan beberapa tanggal expired untuk produk yang sama.
6. Daftar batch expired.
7. Edit dan hapus data batch.
8. Filter berdasarkan status expired dan kategori.
9. Dashboard ringkasan.
10. Tampilan responsif untuk desktop dan ponsel.

## Alur Utama

```text
Login
→ Buka form pencatatan
→ Cari nama produk atau barcode
→ Pilih produk
→ Isi tanggal expired dan sisa stok
→ Simpan
→ Lihat hasil pada dashboard
```

## Status Expired

| Kondisi | Status |
|---|---|
| Tanggal telah lewat | Expired |
| 0–2 hari | Kritis |
| 3–13 hari | Waspada |
| 14 hari atau lebih | Aman |

Batas status harus disimpan sebagai konfigurasi terpusat agar tidak ditulis ulang pada banyak file.

## Prinsip Pengembangan

- Kerjakan fitur secara bertahap.
- Gunakan perubahan minimal.
- Jangan menulis ulang file besar tanpa alasan.
- Jangan menambah dependency tanpa kebutuhan jelas.
- Jalankan lint, type-check, test, dan build sebelum menandai tugas selesai.
- Jangan menyimpan secret di repository.
- Jangan membuat fitur di luar scope tanpa instruksi.

## Dokumentasi Terkait

- [PRD.md](./PRD.md)
- [AGENTS.md](./AGENTS.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [DATABASE.md](./DATABASE.md)
- [API.md](./API.md)
- [DESIGN.md](./DESIGN.md)
- [SECURITY.md](./SECURITY.md)
- [TESTING.md](./TESTING.md)
- [ROADMAP.md](./ROADMAP.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [CHANGE_REQUEST_TEMPLATE.md](./CHANGE_REQUEST_TEMPLATE.md)
