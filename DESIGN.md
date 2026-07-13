# UI and UX Guidelines

## 1. Tujuan Desain

Aplikasi digunakan untuk pekerjaan operasional. Desain harus:

- Cepat dipahami.
- Nyaman digunakan pada ponsel.
- Meminimalkan jumlah input.
- Menonjolkan tingkat urgensi.
- Memberikan feedback yang jelas.
- Tidak memakai animasi berlebihan.

## 2. Prinsip

- Mobile-first.
- Satu aksi utama per halaman.
- Informasi penting terlihat tanpa banyak klik.
- Gunakan label yang jelas.
- Jangan bergantung pada placeholder sebagai label.
- Status harus memakai warna, teks, dan ikon jika tersedia.
- Area tombol minimal nyaman disentuh.
- Hindari tabel lebar pada mobile.

## 3. Halaman

### Login

- Email.
- Password.
- Tombol login.
- Pesan error.
- Loading state.

### Dashboard

- Header ringkas.
- Tombol tambah pencatatan.
- Kartu statistik.
- Daftar tanggal terdekat.
- Filter status.
- Navigasi bawah pada mobile jika diperlukan.

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

- Tabel.
- Search.
- Filter.
- Sorting.
- Pagination.

Mobile:

- Card list.
- Status jelas.
- Produk, tanggal, dan stok terlihat.
- Aksi edit pada menu atau tombol terpisah.

## 4. Komponen Pencarian Produk

State:

- Idle.
- Mengetik.
- Loading.
- Hasil ditemukan.
- Hasil kosong.
- Error.
- Produk terpilih.

Perilaku:

- Debounce sekitar 300 ms.
- Maksimal 10 hasil.
- Highlight bagian nama yang cocok jika mudah dilakukan.
- Exact barcode langsung berada di posisi pertama.
- Keyboard:
  - Arrow Down/Up untuk navigasi.
  - Enter untuk memilih.
  - Escape untuk menutup.
- Klik di luar menutup dropdown.
- Produk terpilih ditampilkan sebagai card kecil.

## 5. Status

| Status | Label | Penjelasan |
|---|---|---|
| expired | Expired | Tanggal sudah lewat |
| critical | Kritis | 0–2 hari |
| warning | Waspada | 3–13 hari |
| safe | Aman | 14 hari atau lebih |

Warna harus mengikuti palette aplikasi, tetapi tetap memiliki kontras yang memadai.

## 6. Interaction

- Transisi 150–250 ms.
- Hindari scale besar.
- Tombol memiliki hover, active, focus, dan disabled state.
- Submit tidak memuat ulang halaman.
- Submit ganda dicegah.
- Setelah berhasil:
  - tampilkan toast;
  - reset form atau arahkan ke detail sesuai alur.
- Setelah gagal:
  - pertahankan input pengguna;
  - tampilkan pesan yang relevan.

## 7. Loading

Gunakan:

- Spinner kecil pada tombol submit.
- Skeleton untuk kartu dashboard.
- Loading indicator pada dropdown pencarian.
- Jangan menutup seluruh halaman jika hanya satu bagian yang memuat data.

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

- Satu kolom.
- Tombol utama full width.
- Form menggunakan padding yang cukup.
- Filter dapat menggunakan drawer atau horizontal scroll.
- Data list menggunakan card.

### Desktop

- Content width terkontrol.
- Dashboard cards dalam grid.
- Form dan ringkasan dapat berdampingan.
- Data menggunakan tabel.

## 11. Accessibility

- Setiap input memiliki label.
- Focus ring terlihat.
- Button menggunakan elemen `button`.
- Status tidak hanya mengandalkan warna.
- Dropdown autocomplete memiliki semantic dan keyboard support.
- Gunakan teks dengan kontras cukup.
- Jangan memakai ukuran teks terlalu kecil.

## 12. Larangan Desain

- Animasi dekoratif berat.
- Background video.
- Glassmorphism berlebihan.
- Terlalu banyak warna status.
- Modal untuk setiap aksi kecil.
- Form panjang tanpa pengelompokan.
- Ikon tanpa label untuk aksi penting.
