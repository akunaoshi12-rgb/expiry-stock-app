# Expiry Stock App

Aplikasi web internal untuk mencatat tanggal kedaluwarsa dan sisa stok produk berdasarkan master data produk yang sudah tersedia.

## Tujuan

Aplikasi membantu staf:

* Mencari produk menggunakan nama atau barcode.
* Mencatat tanggal kedaluwarsa untuk setiap batch produk.
* Mencatat dan memperbarui sisa stok pada batch tersebut.
* Melihat produk yang sudah expired atau mendekati expired.
* Memprioritaskan penanganan produk berdasarkan tanggal terdekat.
* Mengurangi pencatatan manual dan risiko produk terlewat.

## Stack| Bagian | Teknologi |
| --- | --- |
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

## Status Expired| Kondisi | Status |
| --- | --- |
| Tanggal telah lewat | Expired |
| 0–7 hari | Kritis |
| 8–14 hari | Segera ditangani |
| 15–30 hari | Perlu diperhatikan |
| Lebih dari 30 hari | Aman |

Batas status harus disimpan sebagai konfigurasi terpusat agar tidak ditulis ulang pada banyak file.

## Prinsip Pengembangan

* Kerjakan fitur secara bertahap.
* Gunakan perubahan minimal.
* Jangan menulis ulang file besar tanpa alasan.
* Jangan menambah dependency tanpa kebutuhan jelas.
* Jalankan lint, type-check, test, dan build sebelum menandai tugas selesai.
* Jangan menyimpan secret di repository.
* Jangan membuat fitur di luar scope tanpa instruksi.

## Dokumentasi Terkait

* [PRD.md](./PRD.md)
* [AGENTS.md](./AGENTS.md)
* [ARCHITECTURE.md](./ARCHITECTURE.md)
* [DATABASE.md](./DATABASE.md)
* [API.md](./API.md)
* [DESIGN.md](./DESIGN.md)
* [SECURITY.md](./SECURITY.md)
* [TESTING.md](./TESTING.md)
* [ROADMAP.md](./ROADMAP.md)
* [DEPLOYMENT.md](./DEPLOYMENT.md)
* [CHANGE_REQUEST_TEMPLATE.md](./CHANGE_REQUEST_TEMPLATE.md)

# Product Requirements Document

## 1. Nama Produk

**Expiry Stock App**

## 2. Ringkasan

Expiry Stock App adalah aplikasi internal untuk mencatat tanggal kedaluwarsa dan sisa stok produk. Master data produk sudah tersedia dan mencakup barcode, nama produk, serta kategori.

Pengguna tidak perlu mengetik ulang informasi produk. Pengguna cukup mencari nama produk atau memasukkan barcode, memilih produk yang sesuai, lalu mengisi tanggal expired dan jumlah stok.

## 3. Masalah yang Diselesaikan

Pencatatan tanggal expired secara manual memiliki beberapa risiko:

* Produk mendekati expired tidak terpantau.
* Informasi tersebar pada kertas atau file terpisah.
* Sulit mengetahui jumlah stok yang harus segera ditangani.
* Produk yang sama dapat memiliki beberapa tanggal expired.
* Pemeriksaan membutuhkan waktu lebih lama.
* Riwayat perubahan stok sulit ditelusuri.

## 4. Tujuan

* Mempercepat pencatatan tanggal expired.
* Menampilkan produk berdasarkan tingkat urgensi.
* Menyediakan informasi sisa stok per tanggal expired.
* Memanfaatkan master data produk yang sudah tersedia.
* Membuat pencarian produk cepat dan akurat.
* Menyediakan dasar untuk pengembangan notifikasi dan laporan.

## 5. Pengguna

### Staff

Dapat:

* Login.
* Mencari produk.
* Menambah data expired.
* Melihat daftar expired.
* Memperbarui sisa stok.
* Melihat dashboard.

### Admin

Memiliki seluruh akses staff, ditambah:

* Menghapus data.
* Mengelola master produk.
* Mengelola kategori.
* Melihat riwayat perubahan.
* Mengelola role pengguna.

Role admin dapat ditambahkan setelah fitur inti stabil.

## 6. User Stories

### Pencarian Produk

Sebagai staff, saya ingin mencari produk menggunakan nama atau barcode agar saya tidak perlu mengetik data produk secara manual.

### Pencatatan Expired

Sebagai staff, saya ingin mencatat tanggal expired dan sisa stok agar produk dapat ditangani sebelum terlambat.

### Beberapa Batch

Sebagai staff, saya ingin mencatat beberapa tanggal expired untuk produk yang sama agar stok dari pengiriman berbeda tetap terpisah.

### Dashboard

Sebagai staff, saya ingin melihat produk berdasarkan tingkat urgensi agar dapat menentukan prioritas pengecekan dan penanganan.

### Pembaruan Stok

Sebagai staff, saya ingin memperbarui sisa stok agar data sesuai dengan kondisi rak.

## 7. Scope MVP

### Termasuk

* Authentication email dan password.
* Pencarian berdasarkan nama produk.
* Pencarian berdasarkan barcode.
* Autocomplete maksimal 10 hasil.
* Input tanggal expired.
* Input sisa stok.
* Input nomor batch opsional.
* Input catatan opsional.
* Daftar data expired.
* Edit data.
* Hapus data dengan konfirmasi.
* Filter status.
* Filter kategori.
* Sorting tanggal terdekat.
* Dashboard ringkas.
* Responsive desktop dan mobile.

### Tidak Termasuk

* Notifikasi WhatsApp.
* Prediksi penjualan.
* Integrasi POS.
* Multi-cabang.
* Approval berjenjang.
* Upload massal Excel atau PDF.
* Kamera barcode.
* Offline mode.
* AI recommendation.
* Perhitungan nilai kerugian.

Fitur di luar scope hanya dikerjakan melalui perubahan requirement yang jelas.

## 8. Functional Requirements

### FR-01 Login

* Pengguna dapat login dengan email dan password.
* Pengguna yang belum login tidak dapat mengakses dashboard.
* Pengguna dapat logout.

### FR-02 Pencarian Produk

* Kolom menerima nama produk atau barcode.
* Pencarian nama bersifat sebagian dan tidak peka huruf besar-kecil.
* Barcode penuh memprioritaskan kecocokan tepat.
* Request menggunakan debounce sekitar 300 ms.
* Hasil dibatasi maksimal 10 produk.
* Produk tidak aktif tidak ditampilkan.

### FR-03 Input Expired

Field wajib:

* Produk.
* Tanggal expired.
* Sisa stok.

Field opsional:

* Nomor batch.
* Lokasi.
* Catatan.

Validasi:

* Produk harus berasal dari master data.
* Sisa stok harus bilangan bulat dan tidak negatif.
* Tanggal harus valid.
* Tombol simpan dinonaktifkan saat request berlangsung.

### FR-04 Daftar Batch

Daftar menampilkan:

* Nama produk.
* Barcode.
* Kategori.
* Tanggal expired.
* Sisa stok.
* Status.
* Nomor batch.
* Waktu pembaruan.

### FR-05 Dashboard

Dashboard menampilkan:

* Jumlah batch expired.
* Jumlah batch expired dalam 7 hari.
* Jumlah batch expired dalam 14 hari.
* Jumlah batch expired dalam 30 hari.
* Total sisa stok berisiko.
* Daftar produk dengan tanggal terdekat.

### FR-06 Edit dan Hapus

* Pengguna dapat memperbarui tanggal expired, stok, lokasi, batch, dan catatan.
* Penghapusan harus memakai dialog konfirmasi.
* Aksi sensitif harus mengikuti role pengguna.

## 9. Non-Functional Requirements

* Tampilan mobile-first.
* Waktu respons pencarian normal ditargetkan di bawah 1 detik.
* Tidak melakukan full page reload saat submit form.
* Memiliki loading, empty, success, dan error state.
* API menggunakan JSON.
* Semua input divalidasi di frontend dan backend.
* Secret hanya disimpan sebagai environment variable.
* Aplikasi harus lolos build sebelum deployment.
* Kode harus mudah dipelihara dan tidak duplikatif.

## 10. Acceptance Criteria MVP

MVP dianggap selesai jika:

 1. Pengguna dapat login dan logout.
 2. Produk dapat ditemukan melalui nama atau barcode.
 3. Produk yang dipilih mengisi nama, barcode, dan kategori secara otomatis.
 4. Data tanggal expired dan stok dapat disimpan.
 5. Produk yang sama dapat memiliki beberapa batch.
 6. Data dapat diedit.
 7. Data dapat dihapus sesuai izin.
 8. Dashboard menampilkan ringkasan yang benar.
 9. Filter dan sorting bekerja bersama.
10. Tidak ada error build pada frontend dan backend.
11. Tampilan dapat digunakan pada ponsel.
12. Secret tidak masuk ke GitHub.

# AI Coding Agent Instructions

Dokumen ini menjadi aturan utama untuk AI coding agent yang mengerjakan repository.

## 1. Tujuan Proyek

Bangun aplikasi internal untuk pencatatan tanggal expired dan sisa stok produk.

Master data produk sudah tersedia dan berisi:

* Barcode.
* Nama produk.
* Kategori.
* Status aktif.

Pengguna mencari produk dari master data lalu mencatat batch expired dan stoknya.

## 2. Stack Wajib

* Frontend: Next.js + TypeScript.
* UI: Tailwind CSS.
* Backend: Python + FastAPI.
* Database: Supabase PostgreSQL.
* Authentication: Supabase Auth.
* Hosting: Railway.
* Repository: GitHub.
* Struktur: monorepo.

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

* UI.
* State tampilan.
* Form.
* Loading dan error state.
* Pemanggilan API.
* Session pengguna pada browser/server Next.js.

Frontend tidak boleh:

* Menyimpan secret.
* Mengakses service-role key.
* Menjalankan logika otorisasi final.
* Mengubah stok hanya melalui manipulasi state lokal.

### Backend

Backend menangani:

* Validasi input.
* Verifikasi token.
* Authorization.
* Query database.
* Perhitungan status expired.
* Error response.
* Audit perubahan stok.

Jangan menduplikasi logika bisnis di frontend dan backend.

## 5. Aturan TypeScript

* Hindari `any`.
* Gunakan type atau interface yang jelas.
* Tangani nilai `null` dan `undefined`.
* Jangan mengabaikan error TypeScript.
* Gunakan komponen kecil yang fokus.
* Hindari state global jika state lokal cukup.
* Jangan memakai library state tambahan tanpa alasan.

## 6. Aturan Python

* Gunakan type hints.
* Gunakan Pydantic untuk schema request dan response.
* Pisahkan route, service, repository, dan schema.
* Jangan menaruh semua kode di `main.py`.
* Jangan menggunakan mutable default argument.
* Tangani exception secara spesifik.
* Jangan mengekspos stack trace ke client.
* Gunakan format dan lint yang konsisten.

## 7. Database

* Perubahan schema harus melalui migration.
* Jangan menghapus kolom atau tabel tanpa instruksi.
* Jangan mengubah master data saat mengerjakan fitur expired.
* Gunakan foreign key.
* Tambahkan constraint untuk mencegah stok negatif.
* Jangan menyimpan nama produk berulang di tabel batch jika bisa diperoleh melalui relasi.
* Hindari query N+1.

## 8. Authentication dan Security

* Verifikasi Supabase JWT pada endpoint terlindungi.
* Jangan percaya `user_id` dari body request.
* Ambil identitas dari token.
* Jangan menaruh secret di frontend.
* Jangan mencetak token ke log.
* Jangan mengirim detail internal database pada error.
* Terapkan prinsip least privilege.

## 9. UI dan UX

* Mobile-first.
* Form harus singkat.
* Autocomplete harus dapat digunakan dengan keyboard.
* Tampilkan loading state.
* Tampilkan empty state.
* Tampilkan pesan error yang dapat dipahami.
* Gunakan animasi ringan 150–250 ms.
* Jangan menggunakan animasi dekoratif berlebihan.
* Pastikan focus state terlihat.
* Jangan bergantung pada warna saja untuk menyampaikan status.

## 10. Pencarian Produk

* Gunakan debounce sekitar 300 ms.
* Minimal 2 karakter untuk pencarian nama.
* Barcode penuh boleh dicari langsung.
* Maksimal 10 hasil.
* Prioritaskan exact barcode match.
* Jangan mengambil seluruh tabel produk ke browser.
* Tangani hasil kosong.
* Batalkan atau abaikan request lama jika query berubah.

## 11. Definition of Done

Sebuah tugas selesai jika:

* Requirement terpenuhi.
* Acceptance criteria terpenuhi.
* Tidak ada perubahan di luar scope.
* Frontend lint berhasil.
* Frontend type-check berhasil.
* Frontend build berhasil.
* Backend test berhasil.
* Backend dapat dijalankan.
* Error state tersedia.
* Dokumentasi diperbarui jika perlu.
* Daftar file yang diubah dilaporkan.

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

* Jangan mengubah stack.
* Jangan menambahkan dependency tanpa alasan.
* Jangan menulis ulang seluruh aplikasi.
* Jangan membuat fitur di luar scope.
* Jangan menyimpan `.env`.
* Jangan menonaktifkan lint atau type-check untuk menyembunyikan error.
* Jangan menggunakan data dummy pada production path.
* Jangan menghapus test yang gagal hanya agar pipeline hijau.
* Jangan mengklaim tugas selesai tanpa pengujian.

## 14. Format Ringkasan Setelah Perubahan

Gunakan format:

> ````
> ```text
> Ringkasan:
> - ...
> 
> File diubah:
> - ...
> 
> Validasi:
> - lint: berhasil/gagal
> - type-check: berhasil/gagal
> - test: berhasil/gagal
> - build: berhasil/gagal
> 
> Catatan:
> - ...
> ```
> ````

# UI and UX Guidelines

## 1. Tujuan Desain

Aplikasi digunakan untuk pekerjaan operasional. Desain harus:

* Cepat dipahami.
* Nyaman digunakan pada ponsel.
* Meminimalkan jumlah input.
* Menonjolkan tingkat urgensi.
* Memberikan feedback yang jelas.
* Tidak memakai animasi berlebihan.

## 2. Prinsip

* Mobile-first.
* Satu aksi utama per halaman.
* Informasi penting terlihat tanpa banyak klik.
* Gunakan label yang jelas.
* Jangan bergantung pada placeholder sebagai label.
* Status harus memakai warna, teks, dan ikon jika tersedia.
* Area tombol minimal nyaman disentuh.
* Hindari tabel lebar pada mobile.

## 3. Halaman

### Login

* Email.
* Password.
* Tombol login.
* Pesan error.
* Loading state.

### Dashboard

* Header ringkas.
* Tombol tambah pencatatan.
* Kartu statistik.
* Daftar tanggal terdekat.
* Filter status.
* Navigasi bawah pada mobile jika diperlukan.

### Form Tambah Expired

Urutan field:

1. Cari nama produk atau barcode.
2. Produk terpilih.
3. Tanggal expired.
4. Sisa stok.
5. Nomor batch opsional.
6. Lokasi opsional.
7. Catatan opsional.
8. Tombol simpan.

### Daftar Expired

Desktop:

* Tabel.
* Search.
* Filter.
* Sorting.
* Pagination.

Mobile:

* Card list.
* Status jelas.
* Produk, tanggal, dan stok terlihat.
* Aksi edit pada menu atau tombol terpisah.

## 4. Komponen Pencarian Produk

State:

* Idle.
* Mengetik.
* Loading.
* Hasil ditemukan.
* Hasil kosong.
* Error.
* Produk terpilih.

Perilaku:

* Debounce sekitar 300 ms.
* Maksimal 10 hasil.
* Highlight bagian nama yang cocok jika mudah dilakukan.
* Exact barcode langsung berada di posisi pertama.
* Keyboard:
  * Arrow Down/Up untuk navigasi.
  * Enter untuk memilih.
  * Escape untuk menutup.
* Klik di luar menutup dropdown.
* Produk terpilih ditampilkan sebagai card kecil.

## 5. Status| Status | Label | Penjelasan |
| --- | --- | --- |
| expired | Expired | Tanggal sudah lewat |
| critical | ≤ 7 hari | Harus segera ditangani |
| urgent | 8–14 hari | Prioritas tinggi |
| warning | 15–30 hari | Perlu diperhatikan |
| safe | Aman | Lebih dari 30 hari |

Warna harus mengikuti palette aplikasi, tetapi tetap memiliki kontras yang memadai.

## 6. Interaction

* Transisi 150–250 ms.
* Hindari scale besar.
* Tombol memiliki hover, active, focus, dan disabled state.
* Submit tidak memuat ulang halaman.
* Submit ganda dicegah.
* Setelah berhasil:
  * tampilkan toast;
  * reset form atau arahkan ke detail sesuai alur.
* Setelah gagal:
  * pertahankan input pengguna;
  * tampilkan pesan yang relevan.

## 7. Loading

Gunakan:

* Spinner kecil pada tombol submit.
* Skeleton untuk kartu dashboard.
* Loading indicator pada dropdown pencarian.
* Jangan menutup seluruh halaman jika hanya satu bagian yang memuat data.

## 8. Empty State

Contoh:

```text
Belum ada data expired.
Tambahkan pencatatan pertama untuk mulai memantau stok.
```

Empty state harus memiliki aksi yang jelas.

## 9. Error Message

Buruk:

```text
Request failed.
```

Lebih baik:

```text
Data belum dapat disimpan. Periksa koneksi lalu coba lagi.
```

Validasi field:

```text
Sisa stok tidak boleh kurang dari 0.
```

## 10. Responsive Layout

### Mobile

* Satu kolom.
* Tombol utama full width.
* Form menggunakan padding yang cukup.
* Filter dapat menggunakan drawer atau horizontal scroll.
* Data list menggunakan card.

### Desktop

* Content width terkontrol.
* Dashboard cards dalam grid.
* Form dan ringkasan dapat berdampingan.
* Data menggunakan tabel.

## 11. Accessibility

* Setiap input memiliki label.
* Focus ring terlihat.
* Button menggunakan elemen `button`.
* Status tidak hanya mengandalkan warna.
* Dropdown autocomplete memiliki semantic dan keyboard support.
* Gunakan teks dengan kontras cukup.
* Jangan memakai ukuran teks terlalu kecil.

## 12. Larangan Desain

* Animasi dekoratif berat.
* Background video.
* Glassmorphism berlebihan.
* Terlalu banyak warna status.
* Modal untuk setiap aksi kecil.
* Form panjang tanpa pengelompokan.
* Ikon tanpa label untuk aksi penting.