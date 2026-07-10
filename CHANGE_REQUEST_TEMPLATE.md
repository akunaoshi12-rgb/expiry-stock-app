# Change Request Prompt Template

Gunakan template ini saat meminta AI mengubah project.

```text
Konteks project:
Expiry Stock App menggunakan:
- Frontend: Next.js + TypeScript
- UI: Tailwind CSS
- Backend: Python + FastAPI
- Database: Supabase PostgreSQL
- Authentication: Supabase Auth
- Hosting: Railway
- Repository: GitHub monorepo

Dokumen yang wajib dibaca:
- README.md
- PRD.md
- AGENTS.md
- [tambahkan dokumen terkait]

Tugas:
[Jelaskan satu perubahan secara spesifik.]

Masalah saat ini:
[Jelaskan kondisi atau error yang terjadi.]

Hasil yang diharapkan:
[Jelaskan perilaku setelah perubahan.]

Scope:
- [Pekerjaan yang termasuk.]
- [Pekerjaan yang termasuk.]

Di luar scope:
- [Hal yang tidak boleh dikerjakan.]
- [Fitur yang belum perlu.]

Requirement:
1. ...
2. ...
3. ...

Acceptance criteria:
1. ...
2. ...
3. ...

Constraint:
- Jangan mengganti stack.
- Jangan mengubah schema database kecuali diminta.
- Jangan menambah dependency tanpa alasan.
- Jangan menulis ulang file yang tidak terkait.
- Pertahankan fitur yang sudah berfungsi.
- Jangan menyimpan secret.
- Lakukan perubahan minimal.

Proses:
1. Baca file terkait.
2. Jelaskan root cause jika ada bug.
3. Buat rencana singkat.
4. Lakukan perubahan.
5. Jalankan lint, type-check, test, dan build.
6. Tampilkan ringkasan dan daftar file yang berubah.

Format laporan:
- Ringkasan
- File yang diubah
- Hasil test
- Risiko atau catatan
```

## Contoh: Menambahkan Search Barcode

```text
Tugas:
Tambahkan pencarian produk berdasarkan barcode pada form input expired.

Hasil yang diharapkan:
Ketika barcode lengkap dimasukkan, produk dengan barcode yang sama tampil di urutan pertama dan dapat langsung dipilih.

Scope:
- Endpoint product search FastAPI.
- Komponen autocomplete frontend.
- Test exact barcode match.

Di luar scope:
- Scanner kamera.
- Perubahan master data.
- Import produk.

Acceptance criteria:
1. Exact barcode ditemukan.
2. Produk nonaktif tidak muncul.
3. Hasil maksimal 10.
4. Loading dan empty state tersedia.
5. Build berhasil.

Constraint:
- Gunakan endpoint search yang sudah ada.
- Jangan mengambil seluruh produk ke browser.
- Gunakan debounce sekitar 300 ms.
```

## Contoh: Memperbaiki Bug

```text
Masalah:
Setelah stok diubah menjadi 0, data hilang dari daftar semua produk.

Hasil yang diharapkan:
Batch dengan stok 0 tetap tersimpan dan terlihat pada filter Semua, tetapi tidak dihitung sebagai stok berisiko aktif jika aturan dashboard memang mengecualikannya.

Tugas:
Temukan root cause dan perbaiki dengan perubahan minimal.

Acceptance criteria:
1. Batch stok 0 tetap tersedia.
2. Filter status tetap bekerja.
3. Dashboard mengikuti aturan PRD.
4. Test regression ditambahkan.
```
