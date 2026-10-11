// ============================================
// CRUD STOK + DROPDOWN HELPER
// ============================================

async function loadStok() {
  const { data, error } = await supabaseClient
    .from('stok')
    .select(`
      id, jumlah, jenis, keterangan, tanggal_update,
      produk:produk_id (id, nama_produk, satuan)
    `)
    .order('tanggal_update', { ascending: false });

  const tbody = document.getElementById('tbody-stok');
  const empty = document.getElementById('empty-stok');

  if (error) {
    showToast('Gagal memuat stok: ' + error.message, 'error');
    return;
  }

  if (!data.length) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  tbody.innerHTML = data.map((s, i) => `
    <tr>
      <td style="color:var(--ink-500)">${String(i + 1).padStart(2, '0')}</td>
      <td><strong>${s.produk?.nama_produk ?? '-'}</strong></td>
      <td>${s.jumlah} ${s.produk?.satuan ?? ''}</td>
      <td><span class="badge badge-${s.jenis}">${s.jenis}</span></td>
      <td style="color:var(--ink-500)">${s.keterangan ?? '-'}</td>
      <td style="font-size:12.5px;color:var(--ink-500)">${formatTanggal(s.tanggal_update)}</td>
    </tr>
  `).join('');
}

async function openModalStok() {
  await isiDropdown();
  document.getElementById('stok-produk').value = '';
  document.getElementById('stok-jumlah').value = '';
  document.getElementById('stok-jenis').value = 'masuk';
  document.getElementById('stok-keterangan').value = '';
  openModal('modal-stok');
}

async function simpanStok() {
  const produk_id = document.getElementById('stok-produk').value;
  const jumlah    = parseInt(document.getElementById('stok-jumlah').value);
  const jenis     = document.getElementById('stok-jenis').value;
  const keterangan = document.getElementById('stok-keterangan').value.trim();

  if (!produk_id) { showToast('Pilih produk terlebih dahulu', 'error'); return; }
  if (!jumlah || jumlah <= 0) { showToast('Jumlah harus lebih dari 0', 'error'); return; }

  const { error } = await supabaseClient
    .from('stok')
    .insert({ produk_id, jumlah, jenis, keterangan });

  if (error) {
    showToast('Gagal menyimpan: ' + error.message, 'error');
    return;
  }

  showToast('Transaksi stok tercatat');
  closeModal('modal-stok');
  await loadStok();
  await loadDashboard();
}

// ---------- Dropdown Helper ----------
async function isiDropdown() {
  // Kategori
  const { data: kategori } = await supabaseClient
    .from('kategori').select('id, nama_kategori').order('id');

  const elKat = document.getElementById('produk-kategori');
  if (elKat) {
    elKat.innerHTML = '<option value="">-- Pilih Kategori --</option>' +
      (kategori ?? []).map(k =>
        `<option value="${k.id}">${k.nama_kategori}</option>`).join('');
  }

  // Supplier
  const { data: supplier } = await supabaseClient
    .from('supplier').select('id, nama_supplier').order('id');

  const elSup = document.getElementById('produk-supplier');
  if (elSup) {
    elSup.innerHTML = '<option value="">-- Pilih Supplier --</option>' +
      (supplier ?? []).map(s =>
        `<option value="${s.id}">${s.nama_supplier}</option>`).join('');
  }

  // Produk (untuk stok)
  const { data: produk } = await supabaseClient
    .from('produk').select('id, nama_produk').order('id');

  const elProd = document.getElementById('stok-produk');
  if (elProd) {
    elProd.innerHTML = '<option value="">-- Pilih Produk --</option>' +
      (produk ?? []).map(p =>
        `<option value="${p.id}">${p.nama_produk}</option>`).join('');
  }
}