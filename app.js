function formatRupiah(n) { return 'Rp ' + (Number(n)||0).toLocaleString('id-ID'); }
function escapeHtml(str) { return String(str||'').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function toast(msg) { const el=document.getElementById('toast'); if(!el) return; el.textContent=msg; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'), 3000); }
function openModal() { document.getElementById('modal').classList.add('open'); }
function closeModal() { document.getElementById('modal').classList.remove('open'); }

// --- ROUTING ---
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', async () => {
    const page = btn.dataset.page;
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + page).classList.add('active');
    document.getElementById('page-title').textContent = page.charAt(0).toUpperCase() + page.slice(1);
    
    if (page === 'dashboard') loadDashboard();
    if (page === 'products') loadProducts();
    if (page === 'suppliers') loadSuppliers();
    if (page === 'transactions') loadTransactions();
  });
});

// --- LOAD DASHBOARD ---
async function loadDashboard() {
  const { data: trx } = await db.from('transactions').select('*, products(name)').order('id', {ascending:false}).limit(5);
  const { data: low } = await db.from('products').select('*').lt('stock', 10).limit(5);
  
  const tbody = document.getElementById('dashboard-recent');
  if(trx && trx.length) {
    tbody.innerHTML = trx.map(t => `<tr><td>${escapeHtml(t.products?.name)}</td><td>${t.qty}</td><td><span class="badge badge-${t.type}">${t.type}</span></td><td>${t.date}</td></tr>`).join('');
  } else { tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Belum ada data</td></tr>`; }

  const lowTbody = document.getElementById('low-stock-table');
  if(low && low.length) {
    lowTbody.innerHTML = low.map(p => `<tr><td>${escapeHtml(p.name)}</td><td>${p.unit}</td><td><span class="badge badge-out">${p.stock}</span></td></tr>`).join('');
  } else { lowTbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">Stok aman</td></tr>`; }
}

// --- LOAD PRODUK ---
async function loadProducts() {
  const { data } = await db.from('products').select('*').order('id', {ascending:false});
  const tbody = document.getElementById('products-table');
  if(data && data.length) {
    tbody.innerHTML = data.map(p => `<tr><td>${escapeHtml(p.name)}</td><td>${p.unit}</td><td>${formatRupiah(p.price)}</td><td>${p.stock}</td><td><button class="btn btn-primary" style="padding:6px 12px;font-size:12px">Edit</button></td></tr>`).join('');
  } else { tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Belum ada produk</td></tr>`; }
}

// --- LOAD SUPPLIER ---
async function loadSuppliers() {
  const { data } = await db.from('suppliers').select('*').order('id', {ascending:false});
  const tbody = document.getElementById('suppliers-table');
  if(data && data.length) {
    tbody.innerHTML = data.map(s => `<tr><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.phone)}</td><td>${escapeHtml(s.address)}</td><td><button class="btn btn-primary" style="padding:6px 12px;font-size:12px">Edit</button></td></tr>`).join('');
  } else { tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Belum ada supplier</td></tr>`; }
}

// --- LOAD TRANSAKSI ---
async function loadTransactions() {
  const { data } = await db.from('transactions').select('*, products(name)').order('id', {ascending:false});
  const tbody = document.getElementById('transactions-table');
  if(data && data.length) {
    tbody.innerHTML = data.map(t => `<tr><td>${t.date}</td><td>${escapeHtml(t.products?.name)}</td><td><span class="badge badge-${t.type}">${t.type}</span></td><td>${t.qty}</td><td>${formatRupiah(t.total)}</td></tr>`).join('');
  } else { tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Belum ada transaksi</td></tr>`; }
}

// --- MODAL FUNCTIONS ---
function openProductModal() {
  document.getElementById('modal-title').textContent = 'Tambah Produk';
  document.getElementById('modal-form').innerHTML = `
    <div class="form-group"><label>Nama Produk</label><input type="text" id="p-name" required></div>
    <div class="form-group"><label>Satuan (kg/pcs)</label><input type="text" id="p-unit" value="kg" required></div>
    <div class="form-group"><label>Harga</label><input type="number" id="p-price" required></div>
    <div class="form-group"><label>Stok Awal</label><input type="number" id="p-stock" value="0" required></div>
    <div class="form-actions"><button type="button" class="btn" onclick="closeModal()" style="background:#eee;flex:1">Batal</button><button type="submit" class="btn btn-primary" style="flex:1">Simpan</button></div>
  `;
  document.getElementById('modal-form').onsubmit = async (e) => {
    e.preventDefault();
    await db.from('products').insert({ name: document.getElementById('p-name').value, unit: document.getElementById('p-unit').value, price: document.getElementById('p-price').value, stock: document.getElementById('p-stock').value });
    closeModal(); toast('Produk disimpan'); loadProducts();
  };
  openModal();
}

function openSupplierModal() {
  document.getElementById('modal-title').textContent = 'Tambah Supplier';
  document.getElementById('modal-form').innerHTML = `
    <div class="form-group"><label>Nama Supplier</label><input type="text" id="s-name" required></div>
    <div class="form-group"><label>Telepon</label><input type="text" id="s-phone"></div>
    <div class="form-group"><label>Alamat</label><input type="text" id="s-address"></div>
    <div class="form-actions"><button type="button" class="btn" onclick="closeModal()" style="background:#eee;flex:1">Batal</button><button type="submit" class="btn btn-primary" style="flex:1">Simpan</button></div>
  `;
  document.getElementById('modal-form').onsubmit = async (e) => {
    e.preventDefault();
    await db.from('suppliers').insert({ name: document.getElementById('s-name').value, phone: document.getElementById('s-phone').value, address: document.getElementById('s-address').value });
    closeModal(); toast('Supplier disimpan'); loadSuppliers();
  };
  openModal();
}

// --- INIT ---
loadDashboard();
