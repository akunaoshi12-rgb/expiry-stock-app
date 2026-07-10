# Security Guidelines

## 1. Authentication

- Gunakan Supabase Auth.
- Endpoint privat wajib memverifikasi access token.
- Session frontend tidak cukup sebagai bukti authorization.
- Backend mengambil user ID dari token.
- Pengguna nonaktif harus ditolak.

## 2. Authorization

Role awal:

```text
staff
admin
```

### Staff

- Membaca produk.
- Menambah batch expired.
- Membaca daftar batch.
- Memperbarui batch sesuai kebijakan.

### Admin

- Seluruh akses staff.
- Menghapus batch.
- Mengelola master produk.
- Mengelola role.
- Mengakses audit lebih lengkap.

Authorization final dilakukan di backend.

## 3. Environment Variables

### Frontend

Boleh terekspos:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_API_BASE_URL=
```

### Backend

Rahasia:

```env
SUPABASE_SECRET_KEY=
DATABASE_URL=
```

Aturan:

- Jangan commit `.env`.
- Sediakan `.env.example` tanpa nilai rahasia.
- Simpan production secret di Railway Variables.
- Rotasi key jika pernah terpublikasi.
- Jangan menampilkan secret di screenshot atau log.

## 4. Input Validation

Frontend dan backend harus memvalidasi:

- UUID.
- Barcode.
- Query search.
- Tanggal.
- Bilangan stok.
- Panjang catatan.
- Nilai enum.
- Pagination.

Backend menjadi sumber kebenaran terakhir.

## 5. Database

- Gunakan constraint.
- Gunakan foreign key.
- Gunakan parameterized query atau client resmi.
- Jangan membangun query SQL dengan interpolasi string.
- Batasi hak key database.
- Gunakan migration.
- Aktifkan RLS jika data diakses melalui Supabase API.

## 6. API

- Gunakan HTTPS pada production.
- Batasi CORS ke domain frontend.
- Jangan gunakan wildcard CORS pada production.
- Jangan mengirim internal exception ke client.
- Terapkan rate limit jika endpoint disalahgunakan.
- Validasi content type.
- Batasi ukuran payload.

## 7. Logging

Boleh dicatat:

- Endpoint.
- Status.
- Durasi.
- Request ID.
- User ID bila memang diperlukan dan aman.
- Error code.

Jangan dicatat:

- Access token.
- Password.
- Secret key.
- Seluruh body yang mengandung informasi sensitif.
- Connection string.

## 8. Frontend Security

- Jangan memasukkan HTML tidak tepercaya.
- Hindari `dangerouslySetInnerHTML`.
- Jangan menyimpan secret di localStorage.
- Jangan menganggap menyembunyikan tombol sebagai authorization.
- Tangani session expiry.
- Gunakan dependency yang diperlukan saja.

## 9. Dependency

- Kunci versi dependency melalui lock file.
- Jangan menghapus lock file tanpa alasan.
- Tinjau dependency baru.
- Jalankan audit dependency secara berkala.
- Hindari package yang tidak terawat jika ada alternatif resmi.

## 10. Incident Dasar

Jika secret bocor:

1. Cabut atau rotasi secret.
2. Hapus dari Git history jika diperlukan.
3. Periksa log akses.
4. Redeploy service.
5. Dokumentasikan kejadian.
6. Jangan hanya menghapus baris dari commit terbaru karena history masih menyimpannya.
