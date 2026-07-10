# AI Coding Agent Instructions

Dokumen ini menjadi aturan utama untuk AI coding agent yang mengerjakan repository.

## 1. Tujuan Proyek

Bangun aplikasi internal untuk pencatatan tanggal expired dan sisa stok produk.

Master data produk sudah tersedia dan berisi:

- Barcode.
- Nama produk.
- Kategori.
- Status aktif.

Pengguna mencari produk dari master data lalu mencatat batch expired dan stoknya.

## 2. Stack Wajib

- Frontend: Next.js + TypeScript.
- UI: Tailwind CSS.
- Backend: Python + FastAPI.
- Database: Supabase PostgreSQL.
- Authentication: Supabase Auth.
- Hosting: Railway.
- Repository: GitHub.
- Struktur: monorepo.

Jangan mengganti stack tanpa instruksi eksplisit.

## 3. Sebelum Mengubah Kode

1. Baca `README.md`.
2. Baca `PRD.md`.
3. Baca dokumen yang berhubungan dengan tugas.
4. Periksa struktur repository.
5. Periksa file yang sudah ada.
6. Jelaskan rencana singkat.
7. Identifikasi risiko regression.
8. Lakukan perubahan minimal.

Jangan membuat file baru jika fungsi yang sama sudah tersedia.

## 4. Batas Tanggung Jawab

### Frontend

Frontend menangani:

- UI.
- State tampilan.
- Form.
- Loading dan error state.
- Pemanggilan API.
- Session pengguna pada browser/server Next.js.

Frontend tidak boleh:

- Menyimpan secret.
- Mengakses service-role key.
- Menjalankan logika otorisasi final.
- Mengubah stok hanya melalui manipulasi state lokal.

### Backend

Backend menangani:

- Validasi input.
- Verifikasi token.
- Authorization.
- Query database.
- Perhitungan status expired.
- Error response.
- Audit perubahan stok.

Jangan menduplikasi logika bisnis di frontend dan backend.

## 5. Aturan TypeScript

- Hindari `any`.
- Gunakan type atau interface yang jelas.
- Tangani nilai `null` dan `undefined`.
- Jangan mengabaikan error TypeScript.
- Gunakan komponen kecil yang fokus.
- Hindari state global jika state lokal cukup.
- Jangan memakai library state tambahan tanpa alasan.

## 6. Aturan Python

- Gunakan type hints.
- Gunakan Pydantic untuk schema request dan response.
- Pisahkan route, service, repository, dan schema.
- Jangan menaruh semua kode di `main.py`.
- Jangan menggunakan mutable default argument.
- Tangani exception secara spesifik.
- Jangan mengekspos stack trace ke client.
- Gunakan format dan lint yang konsisten.

## 7. Database

- Perubahan schema harus melalui migration.
- Jangan menghapus kolom atau tabel tanpa instruksi.
- Jangan mengubah master data saat mengerjakan fitur expired.
- Gunakan foreign key.
- Tambahkan constraint untuk mencegah stok negatif.
- Jangan menyimpan nama produk berulang di tabel batch jika bisa diperoleh melalui relasi.
- Hindari query N+1.

## 8. Authentication dan Security

- Verifikasi Supabase JWT pada endpoint terlindungi.
- Jangan percaya `user_id` dari body request.
- Ambil identitas dari token.
- Jangan menaruh secret di frontend.
- Jangan mencetak token ke log.
- Jangan mengirim detail internal database pada error.
- Terapkan prinsip least privilege.

## 9. UI dan UX

- Mobile-first.
- Form harus singkat.
- Autocomplete harus dapat digunakan dengan keyboard.
- Tampilkan loading state.
- Tampilkan empty state.
- Tampilkan pesan error yang dapat dipahami.
- Gunakan animasi ringan 150–250 ms.
- Jangan menggunakan animasi dekoratif berlebihan.
- Pastikan focus state terlihat.
- Jangan bergantung pada warna saja untuk menyampaikan status.

## 10. Pencarian Produk

- Gunakan debounce sekitar 300 ms.
- Minimal 2 karakter untuk pencarian nama.
- Barcode penuh boleh dicari langsung.
- Maksimal 10 hasil.
- Prioritaskan exact barcode match.
- Jangan mengambil seluruh tabel produk ke browser.
- Tangani hasil kosong.
- Batalkan atau abaikan request lama jika query berubah.

## 11. Definition of Done

Sebuah tugas selesai jika:

- Requirement terpenuhi.
- Acceptance criteria terpenuhi.
- Tidak ada perubahan di luar scope.
- Frontend lint berhasil.
- Frontend type-check berhasil.
- Frontend build berhasil.
- Backend test berhasil.
- Backend dapat dijalankan.
- Error state tersedia.
- Dokumentasi diperbarui jika perlu.
- Daftar file yang diubah dilaporkan.

## 12. Command Pemeriksaan

Sesuaikan dengan package manager dan konfigurasi repository.

### Frontend

```bash
cd frontend
npm ci
npm run lint
npm run type-check
npm run build
```

### Backend

```bash
cd backend
python -m pip install -r requirements.txt
python -m compileall app
pytest
```

## 13. Larangan

- Jangan mengubah stack.
- Jangan menambahkan dependency tanpa alasan.
- Jangan menulis ulang seluruh aplikasi.
- Jangan membuat fitur di luar scope.
- Jangan menyimpan `.env`.
- Jangan menonaktifkan lint atau type-check untuk menyembunyikan error.
- Jangan menggunakan data dummy pada production path.
- Jangan menghapus test yang gagal hanya agar pipeline hijau.
- Jangan mengklaim tugas selesai tanpa pengujian.

## 14. Format Ringkasan Setelah Perubahan

Gunakan format:

```text
Ringkasan:
- ...

File diubah:
- ...

Validasi:
- lint: berhasil/gagal
- type-check: berhasil/gagal
- test: berhasil/gagal
- build: berhasil/gagal

Catatan:
- ...
```
