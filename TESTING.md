# Testing Strategy

## 1. Tujuan

Testing memastikan:

- Pencarian produk benar.
- Perhitungan status expired konsisten.
- Stok tidak negatif.
- Authentication dan authorization bekerja.
- Perubahan baru tidak merusak fitur lama.
- Aplikasi dapat dibangun dan di-deploy.

## 2. Backend Unit Tests

Prioritas fungsi:

### Perhitungan Status

Test:

- Tanggal kemarin → expired.
- Hari ini → critical.
- 7 hari → critical.
- 8 hari → urgent.
- 14 hari → urgent.
- 15 hari → warning.
- 30 hari → warning.
- 31 hari → safe.

### Validasi Stok

Test:

- 0 diterima.
- Bilangan positif diterima.
- Bilangan negatif ditolak.
- Nilai desimal ditolak jika unit wajib integer.

### Product Search

Test:

- Exact barcode berada di urutan pertama.
- Partial name menghasilkan produk yang sesuai.
- Produk nonaktif tidak muncul.
- Hasil maksimal 10.
- Query terlalu pendek ditolak atau tidak dieksekusi.

## 3. Backend Integration Tests

Test endpoint:

- Request tanpa token → 401.
- Token invalid → 401.
- Staff mengakses endpoint staff → berhasil.
- Staff mengakses endpoint admin → 403.
- Membuat batch dengan product ID valid → 201.
- Product ID tidak ada → 404.
- Stok negatif → 400/422.
- Edit batch → data berubah.
- Hapus batch sesuai role → berhasil atau 403.

## 4. Frontend Component Tests

Prioritas:

- Product search dropdown.
- Expiry form validation.
- Status badge.
- Filter.
- Empty state.
- Error state.
- Loading button.

## 5. End-to-End Tests

### Skenario 1: Login dan Input

1. Login.
2. Buka form tambah.
3. Cari produk.
4. Pilih produk.
5. Isi tanggal.
6. Isi stok.
7. Simpan.
8. Data muncul di daftar.

### Skenario 2: Barcode

1. Fokus pada input.
2. Masukkan barcode.
3. Produk ditemukan.
4. Pilih produk.
5. Simpan batch.

### Skenario 3: Edit Stok

1. Buka batch.
2. Ubah stok.
3. Simpan.
4. Nilai baru muncul.
5. Stok tidak boleh negatif.

### Skenario 4: Filter

1. Buka daftar.
2. Pilih status critical.
3. Hanya batch critical tampil.
4. Search tetap bekerja ketika filter aktif.

## 6. Manual Testing Checklist

### Desktop

- Login.
- Logout.
- Search nama.
- Search barcode.
- Keyboard navigation autocomplete.
- Tambah data.
- Edit data.
- Hapus data.
- Filter.
- Sorting.
- Pagination.
- Refresh halaman.
- Session expiry.

### Mobile

- Form nyaman dipakai.
- Keyboard tidak menutup field penting.
- Tombol dapat disentuh.
- Card tidak terpotong.
- Dropdown tidak keluar layar.
- Loading dan toast terlihat.
- Navigasi mudah.

### Kondisi Error

- Internet terputus.
- Backend tidak tersedia.
- Token expired.
- Produk tidak ditemukan.
- Database gagal.
- Submit dua kali.
- Query cepat berubah.

## 7. Command Validasi

### Frontend

```bash
cd frontend
npm run lint
npm run type-check
npm test
npm run build
```

### Backend

```bash
cd backend
python -m compileall app
pytest
```

## 8. Definition of Done Testing

Fitur tidak dianggap selesai jika:

- Test utama gagal.
- Build gagal.
- Error state tidak tersedia.
- Acceptance criteria belum diuji.
- Perubahan merusak alur yang sudah ada.
