# Deployment Guide

## 1. Target

- Repository: GitHub.
- Hosting frontend: Railway.
- Hosting backend: Railway.
- Database dan Auth: Supabase.
- Struktur: satu repository, dua Railway services.

## 2. GitHub

Buat repository:

```text
expiry-stock-app
```

Command awal:

```bash
git init
git add .
git commit -m "chore: initialize expiry stock app"
git branch -M main
git remote add origin https://github.com/USERNAME/expiry-stock-app.git
git push -u origin main
```

Jangan commit:

```text
.env
.env.local
node_modules
.next
__pycache__
.pytest_cache
.venv
```

## 3. Railway Frontend Service

- Hubungkan GitHub repository.
- Root directory: `/frontend`.
- Build command: `npm run build`.
- Start command: `npm run start`.

`next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
```

Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_API_BASE_URL=
```

## 4. Railway Backend Service

- Gunakan repository yang sama.
- Root directory: `/backend`.

Start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Variables:

```env
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
FRONTEND_URL=
ENVIRONMENT=production
```

## 5. CORS

Backend production hanya mengizinkan domain frontend Railway atau custom domain.

Jangan menggunakan:

```text
allow_origins=["*"]
```

pada production dengan credentials aktif.

## 6. Deployment Order

1. Deploy backend.
2. Ambil URL backend.
3. Isi `NEXT_PUBLIC_API_BASE_URL` pada frontend.
4. Deploy frontend.
5. Ambil URL frontend.
6. Isi `FRONTEND_URL` pada backend.
7. Redeploy backend.
8. Konfigurasi redirect URL Supabase Auth.
9. Uji login dan API.

## 7. Pre-Deployment Checklist

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

### Database

- Migration sudah diterapkan.
- Constraint tersedia.
- Index tersedia.
- Data master tersedia.
- Role pengguna tersedia.

### Security

- `.env` tidak ter-commit.
- CORS benar.
- Secret hanya di backend.
- Redirect URL Supabase benar.
- Error production tidak menampilkan stack trace.

## 8. Deployment Verification

Uji:

- `/health`.
- Login.
- Logout.
- Search nama.
- Search barcode.
- Tambah batch.
- Edit stok.
- Filter.
- Dashboard.
- Mobile layout.
- Refresh halaman.
- Token expired.

## 9. Rollback

Sebelum release besar:

```bash
git add .
git commit -m "chore: checkpoint before release"
git push
```

Jika deployment bermasalah:

- Gunakan deployment Railway sebelumnya.
- Revert commit bermasalah.
- Jangan memperbaiki production secara manual tanpa mencatat perubahan.
- Periksa log frontend dan backend.
