// ============================================
// DASHBOARD — Statistik & Aktivitas
// ============================================

async function loadDashboard() {
  try {
    // Hitung total per entitas
    const [kat, sup, prod, stok] = await Promise.all([
      supabaseClient.from('kategori').select('id', { count: 'exact', head: true }),
      supabaseClient.from('supplier').select('id', { count: 'exact', head: true }),
      supabaseClient.from('produk').select('id',   { count: 'exact', head: true }),
      supabaseClient.from('stok').select('id',     { count: 'exact', head: true })
    ]);

    document.getElementById('stat-kategori').textContent = kat.count  ?? 0;
    document.getElementById('stat-supplier').textContent = sup.count  ?? 0;
    document.getElementById('stat-produk').textContent   = prod.count ?? 0;
    document.getElementById('stat-stok').textContent     = stok.count ?? 0;

    await loadStokTerbaru();
    await loadStokRendah();

  } catch (err) {
    console.error('Dashboard error:', err);
  }
}

async function loadStokTerbaru() {
  const { data, error } = await supabaseClient
    .from('stok')
    .select(`
      id, jumlah, jenis, tanggal_update,
      produk:produk_id (nama_produk)
    `)
    .order('tanggal_update', { ascending: false })
    .limit(5);

  const tbody = document.getElementById('dash-stok-terbaru');

  if (error || !data || !data.length) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:30px;color:var(--ink-500)">
      Belum ada aktivitas stok
    </td></tr>`;
    return;
  }

  tbody.innerHTML = data.map(s => `
    <tr>
      <td><strong>${s.produk?.nama_produk ?? '-'}</strong></td>
      <td>${s.jumlah}</td>
      <td><span class="badge badge-${s.jenis}">${s.jenis}</span></td>
      <td style="font-size:12px;color:var(--ink-500)">${formatTanggal(s.tanggal_update)}</td>
    </tr>
  `).join('');
}

async function loadStokRendah() {
  // Hitung total stok per produk dari tabel stok
  const { data, error } = await supabaseClient
    .from('stok')
    .select(`
      jumlah, jenis,
      produk:produk_id (id, nama_produk, kategori:kategori_id (nama_kategori))
    `);

  const tbody = document.getElementById('dash-stok-rendah');
  const countEl = document.getElementById('low-stock-count');

  if (error || !data) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:30px;color:var(--ink-500)">Gagal memuat data</td></tr>`;
    countEl.textContent = '0';
    return;
  }

  // Agregasi per produk
  const map = {};
  data.forEach(row => {
    const pid = row.produk?.id;
    if (!pid) return;
    if (!map[pid]) {
      map[pid] = {
        nama: row.produk.nama_produk,
        kategori: row.produk.kategori?.nama_kategori ?? '-',
        total: 0
      };
    }
    map[pid].total += (row.jenis === 'masuk' ? row.jumlah : -row.jumlah);
  });

  const rendah = Object.values(map)
    .filter(p => p.total < 10)
    .sort((a, b) => a.total - b.total)
    .slice(0, 5);

  countEl.textContent = rendah.length;

  if (!rendah.length) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:30px;color:var(--ink-500)">
      Semua stok aman 👍
    </td></tr>`;
    return;
  }

  tbody.innerHTML = rendah.map(p => `
    <tr>
      <td><strong>${p.nama}</strong></td>
      <td>${p.kategori}</td>
      <td><span class="badge badge-pink">${p.total}</span></td>
    </tr>
  `).join('');
}