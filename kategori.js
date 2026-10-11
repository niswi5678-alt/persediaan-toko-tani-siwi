// ============================================
// CRUD KATEGORI
// ============================================

async function loadKategori() {
  const { data, error } = await supabaseClient
    .from('kategori')
    .select('*')
    .order('id', { ascending: true });

  const tbody = document.getElementById('tbody-kategori');
  const empty = document.getElementById('empty-kategori');

  if (error) {
    showToast('Gagal memuat kategori: ' + error.message, 'error');
    return;
  }

  if (!data.length) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  tbody.innerHTML = data.map((k, i) => `
    <tr>
      <td style="color:var(--ink-500)">${String(i + 1).padStart(2, '0')}</td>
      <td><strong>${k.nama_kategori}</strong></td>
      <td style="color:var(--ink-500)">${k.deskripsi ?? '-'}</td>
      <td class="text-right">
        <button class="btn-icon" onclick='editKategori(${JSON.stringify(k)})' title="Edit">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="btn-icon danger" onclick="hapusKategori(${k.id})" title="Hapus">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg>
        </button>
      </td>
    </tr>
  `).join('');
}

function openModalKategori() {
  resetForm('kategori');
  document.getElementById('modal-kategori-title').textContent = 'Tambah Kategori';
  openModal('modal-kategori');
}

function editKategori(k) {
  document.getElementById('kategori-id').value = k.id;
  document.getElementById('kategori-nama').value = k.nama_kategori;
  document.getElementById('kategori-deskripsi').value = k.deskripsi ?? '';
  document.getElementById('modal-kategori-title').textContent = 'Edit Kategori';
  openModal('modal-kategori');
}

async function simpanKategori() {
  const id = document.getElementById('kategori-id').value;
  const nama_kategori = document.getElementById('kategori-nama').value.trim();
  const deskripsi = document.getElementById('kategori-deskripsi').value.trim();

  if (!nama_kategori) {
    showToast('Nama kategori wajib diisi', 'error');
    return;
  }

  const payload = { nama_kategori, deskripsi };

  const { error } = id
    ? await supabaseClient.from('kategori').update(payload).eq('id', id)
    : await supabaseClient.from('kategori').insert(payload);

  if (error) {
    showToast('Gagal menyimpan: ' + error.message, 'error');
    return;
  }

  showToast(id ? 'Kategori diperbarui' : 'Kategori ditambahkan');
  closeModal('modal-kategori');
  await loadKategori();
  await isiDropdown();
  await loadDashboard();
}

function hapusKategori(id) {
  confirmDelete('Kategori yang dihapus tidak bisa dikembalikan.', async () => {
    const { error } = await supabaseClient.from('kategori').delete().eq('id', id);
    if (error) {
      showToast('Gagal menghapus: ' + error.message, 'error');
      return;
    }
    showToast('Kategori dihapus');
    await loadKategori();
    await isiDropdown();
    await loadDashboard();
  });
}