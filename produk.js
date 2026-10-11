// ============================================
// CRUD PRODUK
// ============================================

async function loadProduk() {
  const { data, error } = await supabaseClient
    .from('produk')
    .select(`
      id, nama_produk, harga, satuan,
      kategori:kategori_id (id, nama_kategori),
      supplier:supplier_id (id, nama_supplier)
    `)
    .order('id', { ascending: true });

  const tbody = document.getElementById('tbody-produk');
  const empty = document.getElementById('empty-produk');

  if (error) {
    showToast('Gagal memuat produk: ' + error.message, 'error');
    return;
  }

  if (!data.length) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  tbody.innerHTML = data.map((p, i) => `
    <tr>
      <td style="color:var(--ink-500)">${String(i + 1).padStart(2, '0')}</td>
      <td><strong>${p.nama_produk}</strong></td>
      <td>${p.kategori?.nama_kategori
            ? `<span class="badge badge-neutral">${p.kategori.nama_kategori}</span>`
            : '-'}</td>
      <td>${p.supplier?.nama_supplier ?? '-'}</td>
      <td><strong>${formatRupiah(p.harga)}</strong></td>
      <td>${p.satuan ?? '-'}</td>
      <td class="text-right">
        <button class="btn-icon" onclick='editProduk(${JSON.stringify({
          id: p.id, nama_produk: p.nama_produk,
          kategori_id: p.kategori?.id ?? '',
          supplier_id: p.supplier?.id ?? '',
          harga: p.harga, satuan: p.satuan ?? ''
        })})' title="Edit">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="btn-icon danger" onclick="hapusProduk(${p.id})" title="Hapus">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg>
        </button>
      </td>
    </tr>
  `).join('');
}

async function openModalProduk() {
  resetForm('produk');
  await isiDropdown();
  document.getElementById('modal-produk-title').textContent = 'Tambah Produk';
  openModal('modal-produk');
}

function editProduk(p) {
  document.getElementById('produk-id').value = p.id;
  document.getElementById('produk-nama').value = p.nama_produk;
  document.getElementById('produk-kategori').value = p.kategori_id;
  document.getElementById('produk-supplier').value = p.supplier_id;
  document.getElementById('produk-harga').value = p.harga;
  document.getElementById('produk-satuan').value = p.satuan;
  document.getElementById('modal-produk-title').textContent = 'Edit Produk';
  openModal('modal-produk');
}

async function simpanProduk() {
  const id = document.getElementById('produk-id').value;
  const nama_produk = document.getElementById('produk-nama').value.trim();
  const kategori_id = document.getElementById('produk-kategori').value || null;
  const supplier_id = document.getElementById('produk-supplier').value || null;
  const harga       = parseFloat(document.getElementById('produk-harga').value) || 0;
  const satuan      = document.getElementById('produk-satuan').value.trim();

  if (!nama_produk) {
    showToast('Nama produk wajib diisi', 'error');
    return;
  }

  const payload = { nama_produk, kategori_id, supplier_id, harga, satuan };

  const { error } = id
    ? await supabaseClient.from('produk').update(payload).eq('id', id)
    : await supabaseClient.from('produk').insert(payload);

  if (error) {
    showToast('Gagal menyimpan: ' + error.message, 'error');
    return;
  }

  showToast(id ? 'Produk diperbarui' : 'Produk ditambahkan');
  closeModal('modal-produk');
  await loadProduk();
  await isiDropdown();
  await loadDashboard();
}

function hapusProduk(id) {
  confirmDelete('Produk & stok terkait akan dihapus permanen.', async () => {
    const { error } = await supabaseClient.from('produk').delete().eq('id', id);
    if (error) {
      showToast('Gagal menghapus: ' + error.message, 'error');
      return;
    }
    showToast('Produk dihapus');
    await loadProduk();
    await isiDropdown();
    await loadDashboard();
  });
}