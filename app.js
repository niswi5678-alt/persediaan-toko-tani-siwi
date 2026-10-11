// ============================================
// back-end/app.js
// Layer abstraksi API ke Supabase
// ============================================

const API = {
  // ---------- KATEGORI ----------
  kategori: {
    list:   ()        => supabaseClient.from('kategori').select('*').order('id'),
    create: (payload) => supabaseClient.from('kategori').insert(payload),
    update: (id, p)   => supabaseClient.from('kategori').update(p).eq('id', id),
    remove: (id)      => supabaseClient.from('kategori').delete().eq('id', id),
    count:  ()        => supabaseClient.from('kategori').select('id', { count: 'exact', head: true })
  },

  // ---------- SUPPLIER ----------
  supplier: {
    list:   ()        => supabaseClient.from('supplier').select('*').order('id'),
    create: (payload) => supabaseClient.from('supplier').insert(payload),
    update: (id, p)   => supabaseClient.from('supplier').update(p).eq('id', id),
    remove: (id)      => supabaseClient.from('supplier').delete().eq('id', id),
    count:  ()        => supabaseClient.from('supplier').select('id', { count: 'exact', head: true })
  },

  // ---------- PRODUK ----------
  produk: {
    list: () => supabaseClient.from('produk').select(`
      id, nama_produk, harga, satuan,
      kategori:kategori_id (id, nama_kategori),
      supplier:supplier_id (id, nama_supplier)
    `).order('id'),
    create: (payload) => supabaseClient.from('produk').insert(payload),
    update: (id, p)   => supabaseClient.from('produk').update(p).eq('id', id),
    remove: (id)      => supabaseClient.from('produk').delete().eq('id', id),
    count:  ()        => supabaseClient.from('produk').select('id', { count: 'exact', head: true })
  },

  // ---------- STOK ----------
  stok: {
    list: () => supabaseClient.from('stok').select(`
      id, jumlah, jenis, keterangan, tanggal_update,
      produk:produk_id (id, nama_produk, satuan)
    `).order('tanggal_update', { ascending: false }),
    create: (payload) => supabaseClient.from('stok').insert(payload),
    remove: (id)      => supabaseClient.from('stok').delete().eq('id', id),
    count:  ()        => supabaseClient.from('stok').select('id', { count: 'exact', head: true })
  }
};

// ============================================
// CATATAN:
// File ini opsional. Bila ingin memakainya,
// cukup ganti pemanggilan `supabaseClient.from(...)`
// di file JS lain menjadi `API.xxx.yyy()`.
//
// Contoh:
//   const { data } = await API.kategori.list();
// ============================================