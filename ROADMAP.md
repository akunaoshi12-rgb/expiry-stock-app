# Development Roadmap

## Fase 0: Persiapan

- Buat repository GitHub.
- Buat struktur monorepo.
- Siapkan frontend Next.js.
- Siapkan backend FastAPI.
- Hubungkan Supabase project.
- Buat `.env.example`.
- Siapkan Railway project.
- Tambahkan dokumentasi dasar.

Hasil:

- Frontend berjalan lokal.
- Backend `/health` berjalan.
- Repository dapat di-push.
- Secret tidak masuk Git.

## Fase 1: Authentication

- Login email dan password.
- Session handling.
- Route protection.
- Logout.
- Verifikasi JWT di FastAPI.

Acceptance:

- User tidak login diarahkan ke login.
- Endpoint privat menolak request tanpa token.
- Login berhasil membuka dashboard.

## Fase 2: Master Product Search

- Endpoint search.
- Search nama.
- Exact barcode.
- Autocomplete.
- Debounce.
- Loading, empty, dan error state.

Acceptance:

- Produk ditemukan melalui nama.
- Produk ditemukan melalui barcode.
- Maksimal 10 hasil.
- Produk nonaktif tidak muncul.

## Fase 3: Expiry Batch CRUD

- Migration `expiry_batches`.
- Form tambah.
- Daftar data.
- Detail.
- Edit.
- Hapus.
- Validasi stok.

Acceptance:

- Produk yang sama dapat memiliki beberapa batch.
- Stok tidak negatif.
- Data tetap tersedia setelah refresh.

## Fase 4: Dashboard

- Summary cards.
- Status expired.
- Total stok berisiko.
- Daftar tanggal terdekat.
- Filter status.
- Filter kategori.
- Sorting.

Acceptance:

- Angka ringkasan sesuai data.
- Filter dapat digunakan bersama search.
- Status berubah sesuai tanggal saat ini.

## Fase 5: UX dan Stabilitas

- Mobile layout.
- Skeleton.
- Toast.
- Keyboard autocomplete.
- Error handling.
- Pagination.
- Performance query.

Acceptance:

- Alur utama nyaman pada ponsel.
- Tidak ada full-page reload saat submit.
- Tidak ada request search berlebihan.

## Fase 6: Audit Stok

- Tabel `stock_movements`.
- Update stok berbasis adjustment.
- Alasan perubahan.
- Riwayat.
- Admin view.

Fase ini bukan bagian MVP awal.

## Fase 7: Fitur Lanjutan

Pilihan setelah kebutuhan terbukti:

- Scanner kamera.
- Import CSV.
- Export laporan.
- Notifikasi.
- Multi-lokasi.
- Role lebih detail.
- Integrasi sistem lain.

Jangan mengerjakan fase lanjut sebelum MVP stabil dan dipakai.
