-- ============================================
-- SKEMA DATABASE TANISTOCK
-- Jalankan di SQL Editor Supabase
-- ============================================

-- Tabel KATEGORI
CREATE TABLE IF NOT EXISTS kategori (
  id BIGSERIAL PRIMARY KEY,
  nama_kategori VARCHAR(100) NOT NULL,
  deskripsi TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel SUPPLIER
CREATE TABLE IF NOT EXISTS supplier (
  id BIGSERIAL PRIMARY KEY,
  nama_supplier VARCHAR(150) NOT NULL,
  kontak VARCHAR(50),
  alamat TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel PRODUK
CREATE TABLE IF NOT EXISTS produk (
  id BIGSERIAL PRIMARY KEY,
  nama_produk VARCHAR(150) NOT NULL,
  kategori_id BIGINT REFERENCES kategori(id) ON DELETE SET NULL,
  supplier_id BIGINT REFERENCES supplier(id) ON DELETE SET NULL,
  harga NUMERIC(12,2) NOT NULL DEFAULT 0,
  satuan VARCHAR(20) DEFAULT 'kg',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel STOK
CREATE TABLE IF NOT EXISTS stok (
  id BIGSERIAL PRIMARY KEY,
  produk_id BIGINT REFERENCES produk(id) ON DELETE CASCADE,
  jumlah INT NOT NULL CHECK (jumlah > 0),
  jenis VARCHAR(10) CHECK (jenis IN ('masuk','keluar')) NOT NULL,
  keterangan TEXT,
  tanggal_update TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_produk_kategori ON produk(kategori_id);
CREATE INDEX IF NOT EXISTS idx_produk_supplier ON produk(supplier_id);
CREATE INDEX IF NOT EXISTS idx_stok_produk     ON stok(produk_id);
CREATE INDEX IF NOT EXISTS idx_stok_tanggal    ON stok(tanggal_update DESC);

-- ============================================
-- ROW LEVEL SECURITY (untuk demo: allow all)
-- ============================================
ALTER TABLE kategori ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier ENABLE ROW LEVEL SECURITY;
ALTER TABLE produk   ENABLE ROW LEVEL SECURITY;
ALTER TABLE stok     ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_kategori" ON kategori;
DROP POLICY IF EXISTS "allow_all_supplier" ON supplier;
DROP POLICY IF EXISTS "allow_all_produk"   ON produk;
DROP POLICY IF EXISTS "allow_all_stok"     ON stok;

CREATE POLICY "allow_all_kategori" ON kategori FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_supplier" ON supplier FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_produk"   ON produk   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_stok"     ON stok     FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- SEED DATA
-- ============================================
INSERT INTO kategori (nama_kategori, deskripsi) VALUES
  ('Pupuk',    'Berbagai jenis pupuk tanaman'),
  ('Bibit',    'Bibit tanaman dan sayuran'),
  ('Pestisida','Obat hama dan penyakit tanaman'),
  ('Alat Tani','Peralatan pertanian');

INSERT INTO supplier (nama_supplier, kontak, alamat) VALUES
  ('CV Tani Makmur',      '081234567890', 'Jl. Raya Pertanian No. 1'),
  ('PT Benih Nusantara',  '082198765432', 'Jl. Sawah Indah No. 5'),
  ('UD Sarana Tani',      '085711223344', 'Jl. Pasar Tani No. 12');

INSERT INTO produk (nama_produk, kategori_id, supplier_id, harga, satuan) VALUES
  ('Pupuk Urea 50kg',      1, 1, 150000, 'karung'),
  ('Bibit Cabai Rawit',    2, 2,  25000, 'pak'),
  ('Pestisida Antracol',   3, 1,  45000, 'botol'),
  ('Cangkul Baja',         4, 3,  85000, 'pcs'),
  ('Pupuk Kompos 25kg',    1, 3,  35000, 'karung');

INSERT INTO stok (produk_id, jumlah, jenis, keterangan) VALUES
  (1, 20, 'masuk',  'Stok awal'),
  (2, 50, 'masuk',  'Stok awal'),
  (3, 15, 'masuk',  'Stok awal'),
  (4,  8, 'masuk',  'Stok awal'),
  (5,  5, 'masuk',  'Stok awal'),
  (1,  3, 'keluar', 'Penjualan harian'),
  (2,  2, 'keluar', 'Penjualan harian');