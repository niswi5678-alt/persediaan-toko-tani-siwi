// ============================================================
//  AgriBook / TaniStock - Main Application Controller
// ============================================================

// ------------------------------------------------------------
// 1. GLOBAL STATE
// ------------------------------------------------------------
const AppState = {
  user: null,
  session: null,
  page: 'dashboard',
  ready: false,
};

// ------------------------------------------------------------
// 2. UTILITIES (Fungsi Bantuan)
// ------------------------------------------------------------
function formatRupiah(num) {
  const n = Number(num) || 0;
  return 'Rp ' + n.toLocaleString('id-ID', { maximumFractionDigits: 0 });
}

function formatDate(str) {
  if (!str) return '-';
  const d = new Date(str);
  if (isNaN(d)) return str;
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ------------------------------------------------------------
// 3. TOAST NOTIFICATION (Notifikasi Melayang)
// ------------------------------------------------------------
let toastTimer = null;
function toast(message, type = '') {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.className = 'toast show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.className = 'toast ' + type;
  }, 2600);
}

// ------------------------------------------------------------
// 4. MODAL CONTROLLER
// ------------------------------------------------------------
function openModal() {
  document.getElementById('modal')?.classList.add('open');
}
function closeModal() {
  document.getElementById('modal')?.classList.remove('open');
  const form = document.getElementById('modal-form');
  if (form) form.onsubmit = null;
}
// klik overlay untuk close
document.addEventListener('click', (e) => {
  if (e.target.id === 'modal') closeModal();
});
// ESC untuk close
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ------------------------------------------------------------
// 5. AUTH GUARD (Cek Login)
// ------------------------------------------------------------
async function initAuth() {
  const { data: { session }, error } = await db.auth.getSession();

  if (error || !session) {
    window.location.href = 'login.html';
    return false;
  }

  AppState.session = session;
  AppState.user = session.user;

  // tampilkan email user di sidebar jika ada elemennya
  const emailEl = document.getElementById('user-email');
  if (emailEl) emailEl.textContent = session.user.email || 'Connected';

  // listener logout / perubahan sesi
  db.auth.onAuthStateChange((event, sess) => {
    if (event === 'SIGNED_OUT' || !sess) {
      window.location.href = 'login.html';
    }
  });

  return true;
}

async function handleLogout() {
  const ok = confirm('Yakin ingin keluar?');
  if (!ok) return;
  await db.auth.signOut();
  window.location.href = 'login.html';
}

// ------------------------------------------------------------
// 6. PAGE ROUTER (Navigasi Antar Halaman)
// ------------------------------------------------------------
async function navigateTo(page) {
  AppState.page = page;

  // update nav active state
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === page);
  });

  // update page visibility
  document.querySelectorAll('.page').forEach(sec => {
    sec.classList.toggle('active', sec.id === 'page-' + page);
  });

  // update judul breadcrumb di header
  const pageTitleEl = document.getElementById('page-title');
  if (pageTitleEl) {
    const titles = {
      dashboard: 'Dashboard',
      products: 'Katalog Produk',
      suppliers: 'Supplier',
      transactions: 'Transaksi Stok',
      journal: 'Jurnal Umum'
    };
    pageTitleEl.textContent = titles[page] || page;
  }

  // lazy-load data per halaman
  try {
    switch (page) {
      case 'dashboard':
        await loadDashboard();
        break;
      case 'products':
        await loadProducts();
        break;
      case 'suppliers':
        await loadSuppliers();
        break;
      case 'transactions':
        await loadTransactions();
        break;
      case 'journal':
        await loadJournal();
        break;
    }
  } catch (err) {
    console.error('navigateTo error:', err);
    toast('Gagal memuat halaman: ' + (err.message || err), 'error');
  }
}

// ------------------------------------------------------------
// 7. DASHBOARD LOADER (Statistik, Tabel, & Stok Menipis)
// ------------------------------------------------------------
async function loadDashboard() {
  // ambil data secara paralel
  const [prodRes, supRes, trxRes, lowStockRes] = await Promise.all([
    db.from('products').select('id', { count: 'exact', head: true }),
    db.from('suppliers').select('id', { count: 'exact', head: true }),
    db.from('transactions').select(`
      id, date, type, qty, total,
      products (name),
      suppliers (name)
    `).order('id', { ascending: false }),
    db.from('products').select('name, unit, stock').lt('stock', 10).order('stock', { ascending: true })
  ]);

  const productsCount = prodRes.count || 0;
  const suppliersCount = supRes.count || 0;
  const transactions = trxRes.data || [];
  const lowStockData = lowStockRes.data || [];

  // update stat cards
  const elProd = document.getElementById('stat-products');
  const elSup = document.getElementById('stat-suppliers');
  const elTrx = document.getElementById('stat-transactions');
  const elVal = document.getElementById('stat-value');

  if (elProd) elProd.textContent = productsCount;
  if (elSup) elSup.textContent = suppliersCount;
  if (elTrx) elTrx.textContent = productsCount; // Mengikuti UI baru (Produk)

  const totalValue = transactions.reduce((sum, t) => sum + Number(t.total || 0), 0);
  if (elVal) elVal.textContent = transactions.length; // Mengikuti UI baru (Stok masuk)

  // recent table (5 terbaru)
  const tbody = document.getElementById('dashboard-recent');
  if (tbody) {
    const recent = transactions.slice(0, 5);
    tbody.innerHTML = recent.length
      ? recent.map(t => `
        <tr>
          <td><strong>${escapeHtml(t.products?.name || '-')}</strong></td>
          <td>${t.qty}</td>
          <td><span class="badge badge-${t.type}">${t.type === 'in' ? 'masuk' : 'keluar'}</span></td>
          <td>${formatDate(t.date)}</td>
        </tr>
      `).join('')
      : `<tr><td colspan="4" style="text-align:center;color:#888;padding:32px">Belum ada transaksi</td></tr>`;
  }

  // --- TAMBAHAN UNTUK STOK MENIPIS ---
  const lowStockTbody = document.getElementById('low-stock-table');
  if (lowStockTbody) {
    lowStockTbody.innerHTML = lowStockData.length 
      ? lowStockData.map(p => `
          <tr>
            <td><strong>${escapeHtml(p.name)}</strong></td>
            <td>${escapeHtml(p.unit || '-')}</td>
            <td><span style="background:#fce7f3; color:#d6336c; padding:4px 10px; border-radius:99px; font-weight:600; font-size:12px;">${p.stock}</span></td>
          </tr>
        `).join('')
      : `<tr><td colspan="3" style="text-align:center;color:#888;padding:20px;">Semua stok aman</td></tr>`;
  }

  // render chart (jika ada elemen canvas dan fungsi chart.js)
  if (typeof renderCharts === 'function') {
    renderCharts(transactions);
  }

  // simpan cache untuk invoice
  if (typeof transactionsCache !== 'undefined') {
    transactionsCache = transactions;
  }
}

// ------------------------------------------------------------
// 8. THEME (DARK MODE)
// ------------------------------------------------------------
function initTheme() {
  const saved = localStorage.getItem('tanistock-theme') || 'light';
  if (saved === 'dark') document.body.classList.add('dark');

  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
    btn.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      const isDark = document.body.classList.contains('dark');
      btn.textContent = isDark ? '☀️' : '🌙';
      localStorage.setItem('tanistock-theme', isDark ? 'dark' : 'light');

      // re-render chart agar warna mengikuti tema
      if (AppState.page === 'dashboard') loadDashboard();
    });
  }
}

// ------------------------------------------------------------
// 9. GLOBAL ERROR HANDLER
// ------------------------------------------------------------
window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise:', e.reason);
  toast('Terjadi kesalahan tak terduga', 'error');
});

// ------------------------------------------------------------
// 10. BOOTSTRAP / ENTRY POINT (Jalankan Aplikasi)
// ------------------------------------------------------------
async function bootstrap() {
  // 1. cek login
  const authed = await initAuth();
  if (!authed) return;

  // 2. init theme
  initTheme();

  // 3. bind nav clicks
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.page));
  });

  // 4. bind logout
  document.getElementById('logout-btn')?.addEventListener('click', handleLogout);

  // 5. halaman awal
  await navigateTo('dashboard');

  AppState.ready = true;
  console.log('%c🌾 TaniStock siap digunakan', 'color:#d6336c;font-weight:bold;font-size:14px');
}

// Jalankan saat DOM siap
document.addEventListener('DOMContentLoaded', bootstrap);
