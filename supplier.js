// ============================================
// CRUD SUPPLIER
// ============================================

async function loadSupplier() {
  const { data, error } = await supabaseClient
    .from('supplier')
    .select('*')
    .order('id', { ascending: true });

  const tbody = document.getElementById('tbody-supplier');
  const empty = document.getElementById('empty-supplier');

  if (error) {
    showToast('Gagal memuat supplier: ' + error.message, 'error');
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
      <td><strong>${s.nama_supplier}</strong></td>
      <td>${s.kontak ?? '-'}</td>
      <td style="color:var(--ink-500)">${s.alamat ?? '-'}</td>
      <td class="text-right">
        <button class="btn-icon" onclick='editSupplier(${JSON.stringify(s)})' title="Edit">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="btn-icon danger" onclick="hapusSupplier(${s.id})" title="Hapus">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg>
        </button>
      </td>
    </tr>
  `).join('');
}

function openModalSupplier() {
  resetForm('supplier');
  document.getElementById('modal-supplier-title').textContent = 'Tambah Supplier';
  openModal('modal-supplier');
}

function editSupplier(s) {
  document.getElementById('supplier-id').value = s.id;
  document.getElementById('supplier-nama').value = s.nama_supplier;
  document.getElementById('supplier-kontak').value = s.kontak ?? '';
  document.getElementById('supplier-alamat').value = s.alamat ?? '';
  document.getElementById('modal-supplier-title').textContent = 'Edit Supplier';
  openModal('modal-supplier');
}

async function simpanSupplier() {
  const id = document.getElementById('supplier-id').value;
  const nama_supplier = document.getElementById('supplier-nama').value.trim();
  const kontak = document.getElementById('supplier-kontak').value.trim();
  const alamat = document.getElementById('supplier-alamat').value.trim();

  if (!nama_supplier) {
    showToast('Nama supplier wajib diisi', 'error');
    return;
  }

  const payload = { nama_supplier, kontak, alamat };

  const { error } = id
    ? await supabaseClient.from('supplier').update(payload).eq('id', id)
    : await supabaseClient.from('supplier').insert(payload);

  if (error) {
    showToast('Gagal menyimpan: ' + error.message, 'error');
    return;
  }

  showToast(id ? 'Supplier diperbarui' : 'Supplier ditambahkan');
  closeModal('modal-supplier');
  await loadSupplier();
  await isiDropdown();
  await loadDashboard();
}

function hapusSupplier(id) {
  confirmDelete('Supplier yang dihapus tidak bisa dikembalikan.', async () => {
    const { error } = await supabaseClient.from('supplier').delete().eq('id', id);
    if (error) {
      showToast('Gagal menghapus: ' + error.message, 'error');
      return;
    }
    showToast('Supplier dihapus');
    await loadSupplier();
    await isiDropdown();
    await loadDashboard();
  });
}