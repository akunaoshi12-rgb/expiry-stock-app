# Frontend Expiry Stock App

Frontend MVP menggunakan Next.js, TypeScript, dan Tailwind CSS.

## Cara Menjalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Environment Variable

Buat `.env.local` dari `.env.example`.

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

## Validasi

```bash
npm run lint
npm run type-check
npm run build
```

## Catatan

- Data produk dan batch diambil dari FastAPI.
- Login memakai Supabase Auth.
- API request mengirim Supabase access token ke backend.
