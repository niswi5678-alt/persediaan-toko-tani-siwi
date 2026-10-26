// ==========================================
// 1. TANGGAL OTOMATIS
// ==========================================
function updateDate() {
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateStr = now.toLocaleDateString('id-ID', options).toUpperCase();
  if(document.getElementById('current-date')) document.getElementById('current-date').textContent = dateStr;
  if(document.getElementById('hero-date')) document.getElementById('hero-date').textContent = dateStr;
}
updateDate();

// ==========================================
// 2. NAVIGASI
// ==========================================
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = btn.dataset.page;
    document.getElementById('page-' + page).classList.add('active');
    document.getElementById('page-title').textContent = page.toUpperCase();
    
    if (page === 'dashboard') loadDashboard();
    if (page === 'products') loadProducts();
    if (page === 'suppliers') loadSuppliers();
    if (page === 'transactions') loadTransactions();
  });
});

// ==========================================
// 3. FUNGSI LOAD DATA DARI SUPABASE
// ==========================================
async function loadDashboard() {
  const { data: trx, error } = await db.from('transactions').select('*, products(name)').order('id', {ascending:false}).limit(5);
  const tbody = document.getElementById('dashboard-recent');
  
  if(error) {
    tbody.innerHTML = `<tr><td colspan="4" style="color:red; text-align:center;">Error: ${error.message}</td></tr>`;
    return;
  }

  if(trx && trx.length) {
    tbody.innerHTML = trx.map(t => `<tr><td>${t.products?.name||'-'}</td><td>${t.qty}</td><td><span class="badge badge-${t.type}">${t.type}</span></td><td>${t.date}</td></tr>`).join('');
  } else { tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Belum ada data</td></tr>`; }
  
  const { data: low } = await db.from('products').select('*').lt('stock', 10).limit(5);
  const lowTbody = document.getElementById('low-stock-table');
  if(low && low.length) {
    lowTbody.innerHTML = low.map(p => `<tr><td>${p.name}</td><td><span class="badge badge-out">${p.stock}</span></td></tr>`).join('');
  } else { lowTbody.innerHTML = `<tr><td colspan="2" style="text-align:center;">Stok aman</td></tr>`; }
}

async function loadProducts() {
  const { data, error } = await db.from('products').select('*');
  const tbody = document.getElementById('products-table');
  if(error) { tbody.innerHTML = `<tr><td colspan="4" style="color:red; text-align:center;">Error: ${error.message}</td></tr>`; return; }
  
  if(data && data.length) {
    tbody.innerHTML = data.map(p => `<tr><td>${p.name}</td><td>${p.unit}</td><td>Rp ${p.price}</td><td>${p.stock}</td></tr>`).join('');
  } else { tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Belum ada produk</td></tr>`; }
}

async function loadSuppliers() {
  const { data, error } = await db.from('suppliers').select('*');
  const tbody = document.getElementById('suppliers-table');
  if(error) { tbody.innerHTML = `<tr><td colspan="3" style="color:red; text-align:center;">Error: ${error.message}</td></tr>`; return; }
  
  if(data && data.length) {
    tbody.innerHTML = data.map(s => `<tr><td>${s.name}</td><td>${s.phone||'-'}</td><td>${s.address||'-'}</td></tr>`).join('');
  } else { tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">Belum ada supplier</td></tr>`; }
}

async function loadTransactions() {
  const { data, error } = await db.from('transactions').select('*, products(name)');
  const tbody = document.getElementById('transactions-table');
  if(error) { tbody.innerHTML = `<tr><td colspan="4" style="color:red; text-align:center;">Error: ${error.message}</td></tr>`; return; }
  
  if(data && data.length) {
    tbody.innerHTML = data.map(t => `<tr><td>${t.date}</td><td>${t.products?.name||'-'}</td><td><span class="badge badge-${t.type}">${t.type}</span></td><td>${t.qty}</td></tr>`).join('');
  } else { tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Belum ada transaksi</td></tr>`; }
}

// ==========================================
// 4. FUNGSI MODAL TAMBAH
// ==========================================
function openProductModal() {
  document.getElementById('modal-title').textContent = 'Tambah Produk';
  document.getElementById('modal-form').innerHTML = `
    <div class="form-group"><input type="text" id="p-name" placeholder="Nama Produk" required></div>
    <div class="form-group"><input type="text" id="p-unit" placeholder="Satuan (kg/pcs)" value="kg" required></div>
    <div class="form-group"><input type="number" id="p-price" placeholder="Harga" required></div>
    <div class="form-group"><input type="number" id="p-stock" placeholder="Stok Awal" value="0" required></div>
    <button type="submit" class="btn-primary" style="width:100%">Simpan</button>
  `;
  document.getElementById('modal-form').onsubmit = async (e) => {
    e.preventDefault();
    await db.from('products').insert({ name: document.getElementById('p-name').value, unit: document.getElementById('p-unit').value, price: document.getElementById('p-price').value, stock: document.getElementById('p-stock').value });
    document.getElementById('modal').classList.remove('open'); loadProducts();
  };
  document.getElementById('modal').classList.add('open');
}

function openSupplierModal() {
  document.getElementById('modal-title').textContent = 'Tambah Supplier';
  document.getElementById('modal-form').innerHTML = `
    <div class="form-group"><input type="text" id="s-name" placeholder="Nama Supplier" required></div>
    <div class="form-group"><input type="text" id="s-phone" placeholder="Telepon"></div>
    <div class="form-group"><input type="text" id="s-address" placeholder="Alamat"></div>
    <button type="submit" class="btn-primary" style="width:100%">Simpan</button>
  `;
  document.getElementById('modal-form').onsubmit = async (e) => {
    e.preventDefault();
    await db.from('suppliers').insert({ name: document.getElementById('s-name').value, phone: document.getElementById('s-phone').value, address: document.getElementById('s-address').value });
    document.getElementById('modal').classList.remove('open'); loadSuppliers();
  };
  document.getElementById('modal').classList.add('open');
}

// Panggil data pertama kali
loadDashboard();
