# Product Requirements Document

## 1. Nama Produk

**Expiry Stock App**

## 2. Ringkasan

Expiry Stock App adalah aplikasi internal untuk mencatat tanggal kedaluwarsa dan sisa stok produk. Master data produk sudah tersedia dan mencakup barcode, nama produk, serta kategori.

Pengguna tidak perlu mengetik ulang informasi produk. Pengguna cukup mencari nama produk atau memasukkan barcode, memilih produk yang sesuai, lalu mengisi tanggal expired dan jumlah stok.

## 3. Masalah yang Diselesaikan

Pencatatan tanggal expired secara manual memiliki beberapa risiko:

- Produk mendekati expired tidak terpantau.
- Informasi tersebar pada kertas atau file terpisah.
- Sulit mengetahui jumlah stok yang harus segera ditangani.
- Produk yang sama dapat memiliki beberapa tanggal expired.
- Pemeriksaan membutuhkan waktu lebih lama.
- Riwayat perubahan stok sulit ditelusuri.

## 4. Tujuan

- Mempercepat pencatatan tanggal expired.
- Menampilkan produk berdasarkan tingkat urgensi.
- Menyediakan informasi sisa stok per tanggal expired.
- Memanfaatkan master data produk yang sudah tersedia.
- Membuat pencarian produk cepat dan akurat.
- Menyediakan dasar untuk pengembangan notifikasi dan laporan.

## 5. Pengguna

### Staff

Dapat:

- Login.
- Mencari produk.
- Menambah data expired.
- Melihat daftar expired.
- Memperbarui sisa stok.
- Melihat dashboard.

### Admin

Memiliki seluruh akses staff, ditambah:

- Menghapus data.
- Mengelola master produk.
- Mengelola kategori.
- Melihat riwayat perubahan.
- Mengelola role pengguna.

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

- Authentication email dan password.
- Pencarian berdasarkan nama produk.
- Pencarian berdasarkan barcode.
- Autocomplete maksimal 10 hasil.
- Input tanggal expired.
- Input sisa stok.
- Input nomor batch opsional.
- Input catatan opsional.
- Daftar data expired.
- Edit data.
- Hapus data dengan konfirmasi.
- Filter status.
- Filter kategori.
- Sorting tanggal terdekat.
- Dashboard ringkas.
- Responsive desktop dan mobile.

### Tidak Termasuk

- Notifikasi WhatsApp.
- Prediksi penjualan.
- Integrasi POS.
- Multi-cabang.
- Approval berjenjang.
- Upload massal Excel atau PDF.
- Kamera barcode.
- Offline mode.
- AI recommendation.
- Perhitungan nilai kerugian.

Fitur di luar scope hanya dikerjakan melalui perubahan requirement yang jelas.

## 8. Functional Requirements

### FR-01 Login

- Pengguna dapat login dengan email dan password.
- Pengguna yang belum login tidak dapat mengakses dashboard.
- Pengguna dapat logout.

### FR-02 Pencarian Produk

- Kolom menerima nama produk atau barcode.
- Pencarian nama bersifat sebagian dan tidak peka huruf besar-kecil.
- Barcode penuh memprioritaskan kecocokan tepat.
- Request menggunakan debounce sekitar 300 ms.
- Hasil dibatasi maksimal 10 produk.
- Produk tidak aktif tidak ditampilkan.

### FR-03 Input Expired

Field wajib:

- Produk.
- Tanggal expired.
- Sisa stok.

Field opsional:

- Nomor batch.
- Lokasi.
- Catatan.

Validasi:

- Produk harus berasal dari master data.
- Sisa stok harus bilangan bulat dan tidak negatif.
- Tanggal harus valid.
- Tombol simpan dinonaktifkan saat request berlangsung.

### FR-04 Daftar Batch

Daftar menampilkan:

- Nama produk.
- Barcode.
- Kategori.
- Tanggal expired.
- Sisa stok.
- Status.
- Nomor batch.
- Waktu pembaruan.

### FR-05 Dashboard

Dashboard menampilkan:

- Jumlah batch expired.
- Jumlah batch expired dalam 7 hari.
- Jumlah batch expired dalam 14 hari.
- Jumlah batch expired dalam 30 hari.
- Total sisa stok berisiko.
- Daftar produk dengan tanggal terdekat.

### FR-06 Edit dan Hapus

- Pengguna dapat memperbarui tanggal expired, stok, lokasi, batch, dan catatan.
- Penghapusan harus memakai dialog konfirmasi.
- Aksi sensitif harus mengikuti role pengguna.

## 9. Non-Functional Requirements

- Tampilan mobile-first.
- Waktu respons pencarian normal ditargetkan di bawah 1 detik.
- Tidak melakukan full page reload saat submit form.
- Memiliki loading, empty, success, dan error state.
- API menggunakan JSON.
- Semua input divalidasi di frontend dan backend.
- Secret hanya disimpan sebagai environment variable.
- Aplikasi harus lolos build sebelum deployment.
- Kode harus mudah dipelihara dan tidak duplikatif.

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
