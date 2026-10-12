# 🌱 TaniStock — Sistem Persediaan Toko Pertanian

Dashboard berbasis web untuk mencatat persediaan dan memantau stok barang toko pertanian. Repository ini memisahkan frontend dan backend agar bisa dicoba secara lokal, sementara versi frontend statis dapat dibuka melalui GitHub Pages.

🌐 **Demo website:** https://niswi5678-alt.github.io/persediaan-toko-tani-siwi/

## Fitur

- Ringkasan kategori, supplier, produk, dan total transaksi stok.
- Aktivitas stok terbaru (masuk/keluar) dalam 30 hari terakhir.
- Peringatan otomatis untuk produk dengan stok menipis (< 10 unit).
- Pencatatan transaksi stok masuk dan keluar.
- Manajemen kategori, supplier, dan katalog produk.
- Pencarian dan filter data.
- Penyimpanan data menggunakan Supabase (PostgreSQL).

## Struktur repository

```
.
├── back-end/
│   ├── app.js
│   └── sql/
│       └── schema.sql
├── front-end/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── supabase-config.js
│       ├── app.js
│       ├── dashboard.js
│       ├── kategori.js
│       ├── supplier.js
│       ├── produk.js
│       └── stok.js
├── docs/
│   └── skema-persediaan-tani.md
├── .gitignore
├── index.html
└── README.md
```

Frontend adalah halaman aplikasi statis (HTML/CSS/JavaScript). Backend berisi file `schema.sql` untuk database dan `app.js` sebagai referensi layer API. Database dikelola oleh Supabase (PostgreSQL) dan diakses langsung dari frontend menggunakan Supabase JS v2 via CDN.

## Menjalankan aplikasi lokal

### Persiapan Supabase

1. Buat atau pilih project Supabase.
2. Buka **SQL Editor**, lalu jalankan seluruh isi `back-end/sql/schema.sql` untuk membuat tabel, policy akses, indeks, dan data awal.
3. Buka **Project Settings → API**, lalu salin:
   - **Project URL**
   - **anon/public key**

### Konfigurasi frontend

1. Buka file `front-end/js/supabase-config.js`.
2. Isi dengan URL dan anon key dari Supabase:

   ```javascript
   const SUPABASE_URL = 'https://PROJECT_REF.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6...';
