// Central script for Pastel Bookstore pages
(function(){
  // helper to safely parse currency like "Rp 180.000" -> number 180000
  function parseCurrency(str){
    return parseInt((str||'').replace(/\D/g,'')) || 0;
  }
  function formatCurrencyNum(n){
    return 'Rp ' + n.toLocaleString('id-ID');
  }

  /* LOGIN PAGE */
  if(document.getElementById('loginForm')){
    document.getElementById('loginForm').addEventListener('submit', function(e){
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const pass = document.getElementById('password').value.trim();
      const user = dataPengguna.find(u => u.email === email && u.password === pass);
      if(!user){
        alert("email/password yang anda masukkan salah");
        return;
      }
      sessionStorage.setItem('user', JSON.stringify(user));
      window.location.href = 'dashboard.html';
    });

    document.getElementById('registerForm').addEventListener('submit', function(e){
      e.preventDefault();
      const nama = document.getElementById('regNama').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const pass = document.getElementById('regPass').value.trim();
      if(!nama || !email || !pass) return;
      const newUser = { id: Date.now(), nama, email, password: pass, role: "User" };
      dataPengguna.push(newUser);
      alert('Registrasi sukses (simulasi). Silakan login.');
      var regModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
      regModal.hide();
    });

    document.getElementById('forgotForm').addEventListener('submit', function(e){
      e.preventDefault();
      const email = document.getElementById('forgotEmail').value.trim();
      const user = dataPengguna.find(u => u.email === email);
      if(!user){
        alert('Email tidak terdaftar.');
      } else {
        alert('Instruksi reset password telah dikirim (simulasi).');
        var fModal = bootstrap.Modal.getInstance(document.getElementById('forgotModal'));
        fModal.hide();
      }
    });
  }

  /* DASHBOARD PAGE */
  if(document.getElementById('greeting')){
    const user = JSON.parse(sessionStorage.getItem('user') || 'null');
    if(!user) window.location.href = 'login.html';
    document.getElementById('greeting').innerText = getGreeting() + ", " + user.nama + "!";
    document.getElementById('userInfo').innerText = "Role: " + user.role;
    document.getElementById('logoutBtn').addEventListener('click', function(e){
      e.preventDefault();
      sessionStorage.removeItem('user');
      window.location.href = 'login.html';
    });
  }

  /* STOK/KATALOG PAGE */
  if(document.getElementById('katalogList')){
    function renderKatalog(){
      const container = document.getElementById('katalogList');
      container.innerHTML = '';
      dataKatalogBuku.forEach((b, idx) => {
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-4';
        col.innerHTML = `
          <div class="card h-100 card-animate">
            <img src="${b.cover}" onerror="this.src='img/placeholder.png'" class="card-img-top cover-img">
            <div class="card-body">
              <h5 class="card-title">${b.namaBarang}</h5>
              <p class="card-text small">${b.jenisBarang} — Edisi ${b.edisi}</p>
              <p><strong>${b.harga}</strong></p>
              <p>Stok: <span id="stok-${idx}">${b.stok}</span></p>
              <a href="checkout.html?kode=${b.kodeBarang}" class="btn btn-pink btn-sm">Pesan</a>
              <button class="btn btn-outline-secondary btn-sm ms-2" onclick="increaseStock(${idx})">+ Stok</button>
            </div>
          </div>`;
        container.appendChild(col);
      });
    }
    window.increaseStock = function(idx){
      const inc = prompt('Masukkan jumlah penambahan stok (angka):', '1');
      const n = parseInt(inc);
      if(!isNaN(n) && n>0){
        dataKatalogBuku[idx].stok += n;
        const el = document.getElementById('stok-'+idx);
        if(el) el.innerText = dataKatalogBuku[idx].stok;
      } else alert('Masukkan angka yang valid');
    };
    document.getElementById('addRowBtn').addEventListener('click', function(){
      const kode = prompt('Kode Barang:','BOOK' + Date.now());
      if(!kode) return;
      const nama = prompt('Nama Buku:','Judul Baru');
      const harga = prompt('Harga (format Rp ...):','Rp 0');
      const stok = parseInt(prompt('Stok awal:', '10')) || 0;
      const cover = prompt('Path cover (contoh img/namafile.jpg) or leave blank','img/placeholder.png') || 'img/placeholder.png';
      const newItem = { kodeBarang: kode, namaBarang: nama, jenisBarang:'Buku', edisi:'1', stok: stok, harga: harga, cover: cover};
      dataKatalogBuku.push(newItem);
      renderKatalog();
    });
    renderKatalog();
  }

  /* CHECKOUT PAGE */
  if(document.getElementById('cartList')){
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    function renderCart(){
      const el = document.getElementById('cartList');
      el.innerHTML = '';
      let total = 0;
      if(cart.length===0) el.innerHTML = '<p class="text-muted">Keranjang kosong</p>';
      cart.forEach((c, idx) => {
        const div = document.createElement('div');
        div.className = 'd-flex justify-content-between align-items-center mb-2';
        div.innerHTML = `<div><strong>${c.namaBarang}</strong> <div class="small text-muted">${c.qty} x ${c.harga}</div></div>
        <div><button class="btn btn-sm btn-danger" onclick="removeFromCart(${idx})">Hapus</button></div>`;
        el.appendChild(div);
        const num = parseCurrency(c.harga);
        total += num * c.qty;
      });
      document.getElementById('totalAmount').innerText = formatCurrencyNum(total);
      localStorage.setItem('cart', JSON.stringify(cart));
    }
    window.removeFromCart = function(i){ cart.splice(i,1); renderCart(); };

    function renderBooksToAdd(){
      const el = document.getElementById('booksList');
      el.innerHTML = '';
      dataKatalogBuku.forEach(b => {
        const div = document.createElement('div');
        div.className = 'mb-2 p-2 border rounded';
        div.innerHTML = `<div><strong>${b.namaBarang}</strong></div><div class="small text-muted">${b.harga} - Stok: ${b.stok}</div>
          <div class="mt-1"><input type="number" id="q-${b.kodeBarang}" value="1" min="1" style="width:80px"> <button class="btn btn-pink btn-sm" onclick="addToCart('${b.kodeBarang}')">Tambah</button></div>`;
        el.appendChild(div);
      });
    }
    window.addToCart = function(kode){
      const book = dataKatalogBuku.find(b => b.kodeBarang === kode);
      if(!book){ alert('Buku tidak ditemukan'); return; }
      const q = parseInt(document.getElementById('q-'+kode).value) || 1;
      const existing = cart.find(c => c.kodeBarang === kode);
      if(existing) existing.qty += q;
      else cart.push({ kodeBarang: book.kodeBarang, namaBarang: book.namaBarang, harga: book.harga, qty: q });
      renderCart();
    };

    document.getElementById('orderForm').addEventListener('submit', function(e){
      e.preventDefault();
      if(cart.length===0){ alert('Keranjang kosong'); return; }
      const name = document.getElementById('custName').value.trim();
      const addr = document.getElementById('custAddress').value.trim();
      if(!name || !addr){ alert('Lengkapi data pemesan'); return; }
      const nomorDO = 'DO' + Date.now();
      const total = document.getElementById('totalAmount').innerText;
      alert('Pesanan berhasil! Nomor DO: ' + nomorDO + '\\nTotal: ' + total + '\\n(simulasi)');
      localStorage.removeItem('cart'); cart = []; renderCart();
    });

    renderBooksToAdd();
    renderCart();

    // prefill from query param kode
    const params = new URLSearchParams(window.location.search);
    if(params.has('kode')){
      const kodeParam = params.get('kode');
      const b = dataKatalogBuku.find(x => x.kodeBarang===kodeParam);
      if(b){ cart.push({ kodeBarang: b.kodeBarang, namaBarang: b.namaBarang, harga: b.harga, qty: 1}); renderCart(); }
    }
  }

  /* TRACKING PAGE */
  if(document.getElementById('cariBtn')){
    document.getElementById('cariBtn').addEventListener('click', function(){
      const no = document.getElementById('noDO').value.trim();
      if(!no){ alert('Masukkan nomor DO'); return; }
      const info = dataTracking[no];
      const area = document.getElementById('resultArea');
      area.innerHTML = '';
      if(!info){ area.innerHTML = '<div class="alert alert-warning">Nomor DO tidak ditemukan (simulasi).</div>'; return; }
      let html = `<div class="card p-3 mb-3"><h5>${info.nama}</h5><p>Status: <strong>${info.status}</strong></p>
        <p>Ekspedisi: ${info.ekspedisi} | Paket: ${info.paket} | Tanggal Kirim: ${info.tanggalKirim}</p>
        <p>Total: <strong>${info.total}</strong></p></div>`;
      html += '<div class="card p-3"><h6>Riwayat Perjalanan</h6><ul class="list-group">';
      info.perjalanan.forEach(p => {
        html += `<li class="list-group-item"><small>${p.waktu}</small><div>${p.keterangan}</div></li>`;
      });
      html += '</ul></div>';
      area.innerHTML = html;
    });
  }

})();