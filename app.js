// ============================================
// APP CORE — Navigasi, Modal, Toast
// ============================================

const VIEW_META = {
  dashboard: { title: 'Dashboard',      sub: 'Ringkasan persediaan toko' },
  kategori:  { title: 'Kategori',       sub: 'Kelola kategori produk' },
  supplier:  { title: 'Supplier',       sub: 'Kelola data pemasok' },
  produk:    { title: 'Katalog Produk', sub: 'Daftar semua produk' },
  stok:      { title: 'Transaksi Stok', sub: 'Riwayat masuk & keluar' }
};

// ---------- Navigasi ----------
function switchView(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  document.getElementById('view-' + view)?.classList.add('active');
  document.querySelector(`.nav-item[data-view="${view}"]`)?.classList.add('active');

  const meta = VIEW_META[view] || VIEW_META.dashboard;
  document.getElementById('breadcrumb-page').textContent = meta.title;
}

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => switchView(item.dataset.view));
});

// ---------- Modal ----------
function openModal(id) {
  document.getElementById(id)?.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id)?.classList.remove('show');
  document.body.style.overflow = '';
}

// Klik overlay untuk close
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

// ESC untuk close semua modal
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.show').forEach(m => closeModal(m.id));
  }
});

// ---------- Confirm Hapus ----------
let confirmCallback = null;

function confirmDelete(message, onConfirm) {
  document.getElementById('confirm-text').textContent = message;
  confirmCallback = onConfirm;
  openModal('modal-confirm');
}

document.getElementById('confirm-btn').addEventListener('click', async () => {
  if (typeof confirmCallback === 'function') {
    await confirmCallback();
  }
  closeModal('modal-confirm');
  confirmCallback = null;
});

// ---------- Toast ----------
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  toast.innerHTML = `<strong style="font-size:15px">${icons[type] || '✓'}</strong><span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// ---------- Format helpers ----------
function formatRupiah(angka) {
  return 'Rp ' + Number(angka || 0).toLocaleString('id-ID');
}

function formatTanggal(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

function formatTanggalLengkap(iso) {
  const d = iso ? new Date(iso) : new Date();
  const hari  = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'][d.getDay()];
  const bulan = ['Januari','Februari','Maret','April','Mei','Juni',
                 'Juli','Agustus','September','Oktober','November','Desember'][d.getMonth()];
  return `${hari.toUpperCase()}, ${d.getDate()} ${bulan.toUpperCase()} ${d.getFullYear()}`;
}

// ---------- Modal helper: buka form tambah ----------
function resetForm(prefix) {
  document.getElementById(prefix + '-id').value = '';
  const fields = {
    kategori: ['nama', 'deskripsi'],
    supplier: ['nama', 'kontak', 'alamat'],
    produk:   ['nama', 'kategori', 'supplier', 'harga', 'satuan']
  };

  (fields[prefix] || []).forEach(f => {
    const el = document.getElementById(`${prefix}-${f}`);
    if (el) el.value = '';
  });
}

// ---------- Status Koneksi ----------
async function checkConnection() {
  const dot  = document.getElementById('status-dot');
  const text = document.getElementById('status-text');
  const controller = new AbortController();
  let timeoutId;

  text.textContent = 'Mengecek koneksi...';
  dot.className = 'status-dot';

  try {
    const request = supabaseClient
      .from('kategori')
      .select('id')
      .limit(1)
      .abortSignal(controller.signal);
    const timeout = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        controller.abort();
        reject(new Error('Supabase connection check timed out'));
      }, 10000);
    });
    const { error } = await Promise.race([request, timeout]);
    if (error) throw error;

    dot.className = 'status-dot online';
    text.textContent = 'PostgreSQL aktif';
  } catch (err) {
    dot.className = 'status-dot offline';
    text.textContent = err instanceof Error && err.message === 'Supabase connection check timed out'
      ? 'Koneksi timeout'
      : 'Koneksi gagal';
    console.error('Supabase connection check failed:', err);
  } finally {
    clearTimeout(timeoutId);
  }
}

// ---------- Refresh All ----------
async function refreshAll() {
  await Promise.all([
    loadKategori(),
    loadSupplier(),
    loadProduk(),
    loadStok(),
    isiDropdown(),
    loadDashboard()
  ]);
  showToast('Data dimuat ulang', 'info');
}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('year').textContent = new Date().getFullYear();
  document.getElementById('today-label').textContent = formatTanggalLengkap();
  document.getElementById('hero-date').textContent  = formatTanggalLengkap();

  await checkConnection();
  await refreshAll();
});
