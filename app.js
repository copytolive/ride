(() => {
  const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
  const qs = (s, root = document) => root.querySelector(s);
  const qsa = (s, root = document) => [...root.querySelectorAll(s)];
  const state = {
    service: 'ride', tier: 'hemat', multiplier: 1,
    pickup: { lat: -6.2000, lng: 106.8166, label: 'Jakarta Pusat' },
    destination: null, distanceKm: 0, durationMin: 0, baseFare: 0,
    map: null, pickupMarker: null, destinationMarker: null, routeLine: null,
    matchingTimer: null, matchStep: 0
  };

  const serviceConfig = {
    ride: { title: 'RIDE Motor', base: 6000, perKm: 2800, speed: 28 },
    car: { title: 'RIDE Car', base: 11000, perKm: 5200, speed: 24 },
    send: { title: 'RIDE Send', base: 8000, perKm: 3000, speed: 25 }
  };

  function toast(message) {
    const el = qs('#toast');
    el.textContent = message; el.classList.add('show');
    clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('show'), 2400);
  }

  function setGreeting() {
    const hour = new Date().getHours();
    qs('#greeting').textContent = hour < 11 ? 'SELAMAT PAGI' : hour < 15 ? 'SELAMAT SIANG' : hour < 19 ? 'SELAMAT SORE' : 'SELAMAT MALAM';
  }

  function haversine(a, b) {
    const R = 6371, dLat = (b.lat - a.lat) * Math.PI / 180, dLng = (b.lng - a.lng) * Math.PI / 180;
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(x));
  }

  function roundFare(v) { return Math.max(9000, Math.ceil(v / 1000) * 1000); }
  function currentFare() { return roundFare(state.baseFare * state.multiplier); }

  function updateEstimate() {
    const cfg = serviceConfig[state.service] || serviceConfig.ride;
    if (!state.destination) {
      state.distanceKm = 0; state.baseFare = 0;
      qs('#distanceValue').textContent = '—'; qs('#durationValue').textContent = '—'; qs('#fareValue').textContent = '—';
      qsa('[data-price]').forEach(el => el.textContent = '—');
      const btn = qs('#bookButton'); btn.disabled = true; btn.textContent = 'Tentukan tujuan dulu'; return;
    }
    state.distanceKm = Math.max(.6, haversine(state.pickup, state.destination));
    state.durationMin = Math.max(3, Math.round((state.distanceKm / cfg.speed) * 60 + 3));
    state.baseFare = cfg.base + state.distanceKm * cfg.perKm;
    qs('#distanceValue').textContent = `${state.distanceKm.toFixed(1)} km`;
    qs('#durationValue').textContent = `${state.durationMin} mnt`;
    qsa('.ride-option').forEach(btn => {
      const multiplier = Number(btn.dataset.multiplier || 1);
      qs('[data-price]', btn).textContent = rupiah.format(roundFare(state.baseFare * multiplier)).replace(',00', '');
    });
    qs('#fareValue').textContent = rupiah.format(currentFare()).replace(',00', '');
    const btn = qs('#bookButton'); btn.disabled = false; btn.textContent = `Cari driver · ${rupiah.format(currentFare()).replace(',00', '')}`;
  }

  function makeIcon(color) {
    return L.divIcon({ className: '', html: `<div style="width:18px;height:18px;border:4px solid white;border-radius:50%;background:${color};box-shadow:0 5px 18px rgba(0,0,0,.24)"></div>`, iconSize: [18,18], iconAnchor:[9,9] });
  }

  function initMap() {
    if (!window.L) { qs('#map').innerHTML = '<div style="padding:24px">Peta tidak dapat dimuat. Coba periksa koneksi internet.</div>'; return; }
    state.map = L.map('map', { zoomControl: false, attributionControl: true }).setView([state.pickup.lat, state.pickup.lng], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(state.map);
    L.control.zoom({ position: 'bottomright' }).addTo(state.map);
    state.pickupMarker = L.marker([state.pickup.lat, state.pickup.lng], { icon: makeIcon('#12a768') }).addTo(state.map).bindTooltip('Titik jemput');
    state.map.on('click', e => setDestination(e.latlng.lat, e.latlng.lng));
    setTimeout(() => state.map.invalidateSize(), 200);
  }

  function drawRoute() {
    if (!state.map || !state.destination) return;
    if (state.routeLine) state.routeLine.remove();
    state.routeLine = L.polyline([[state.pickup.lat, state.pickup.lng], [state.destination.lat, state.destination.lng]], { color:'#0a7a4b', weight:5, opacity:.68, dashArray:'10 10' }).addTo(state.map);
    state.map.fitBounds(state.routeLine.getBounds(), { padding: [55,55] });
  }

  function setDestination(lat, lng) {
    state.destination = { lat, lng, label: `${lat.toFixed(5)}, ${lng.toFixed(5)}` };
    qs('#destinationInput').value = state.destination.label;
    if (state.map) {
      if (state.destinationMarker) state.destinationMarker.remove();
      state.destinationMarker = L.marker([lat,lng], { icon: makeIcon('#e84f56') }).addTo(state.map).bindTooltip('Tujuan').openTooltip();
      drawRoute();
    }
    updateEstimate();
  }

  function setPickup(lat, lng, label = 'Lokasi saya') {
    state.pickup = { lat, lng, label }; qs('#pickupInput').value = label;
    if (state.map) {
      if (state.pickupMarker) state.pickupMarker.remove();
      state.pickupMarker = L.marker([lat,lng], { icon: makeIcon('#12a768') }).addTo(state.map).bindTooltip('Titik jemput');
      state.map.setView([lat,lng], 15); drawRoute();
    }
    updateEstimate();
  }

  function locateMe() {
    if (!navigator.geolocation) { toast('Geolokasi tidak tersedia di browser ini.'); return; }
    toast('Mendeteksi lokasi Anda…');
    navigator.geolocation.getCurrentPosition(
      pos => { setPickup(pos.coords.latitude, pos.coords.longitude, 'Lokasi saya'); toast('Lokasi jemput diperbarui.'); },
      () => toast('Izin lokasi belum diberikan. Peta memakai Jakarta sebagai titik awal.'),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  }

  function selectService(service, button) {
    if (!serviceConfig[service]) {
      toast(service === 'food' ? 'RIDE Food akan menjadi modul publik berikutnya.' : service === 'mart' ? 'RIDE Mart sedang disiapkan.' : 'Layanan tambahan sedang disiapkan.');
      return;
    }
    state.service = service;
    qsa('.service-card').forEach(el => el.classList.toggle('active', el === button));
    qs('#bookingTitle').textContent = serviceConfig[service].title;
    const labels = service === 'car'
      ? [['Hemat','1–4 penumpang · ETA 4–7 mnt'],['Prioritas','Driver pilihan · ETA 3–5 mnt'],['XL','Hingga 6 penumpang']]
      : service === 'send'
      ? [['Instant','Motor · maksimal 5 kg'],['Prioritas','Penjemputan lebih cepat'],['Protected','Perlindungan tambahan']]
      : [['Hemat','1 penumpang · ETA 3–6 mnt'],['Prioritas','Driver pilihan · ETA 2–4 mnt'],['Comfort','Perjalanan lebih nyaman']];
    qsa('.ride-option').forEach((el, i) => { const [name, sub] = labels[i]; qs('b', el).textContent = name; qs('small', el).textContent = sub; });
    updateEstimate(); toast(`${serviceConfig[service].title} dipilih.`);
  }

  function saveOrder() {
    if (!state.destination) return;
    const order = { id: Date.now(), service: serviceConfig[state.service].title, destination: state.destination.label, fare: currentFare(), createdAt: new Date().toISOString() };
    const orders = JSON.parse(localStorage.getItem('ride_orders') || '[]'); orders.unshift(order);
    localStorage.setItem('ride_orders', JSON.stringify(orders.slice(0, 5))); renderOrders();
  }

  function renderOrders() {
    const root = qs('#recentOrders'), orders = JSON.parse(localStorage.getItem('ride_orders') || '[]');
    if (!orders.length) { root.innerHTML = '<div class="empty-state"><span>↗</span><p>Belum ada perjalanan di perangkat ini.</p></div>'; return; }
    root.innerHTML = orders.slice(0,3).map(o => `<div class="order-row"><span class="order-icon">↗</span><div><b>${o.service}</b><small>${new Date(o.createdAt).toLocaleString('id-ID',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})} · ${o.destination}</small></div><strong>${rupiah.format(o.fare).replace(',00','')}</strong></div>`).join('');
  }

  function openMatching() {
    if (!state.destination) return;
    const backdrop = qs('#modalBackdrop'), progress = qs('#matchProgress'), found = qs('#matchedDriver');
    backdrop.hidden = false; found.hidden = true; qs('#matchTitle').textContent = 'Mencari driver terdekat…';
    qs('#matchText').textContent = 'Kami sedang mencocokkan perjalanan Anda dengan driver di sekitar titik jemput.';
    state.matchStep = 0; progress.style.width = '0%';
    clearInterval(state.matchingTimer);
    state.matchingTimer = setInterval(() => {
      state.matchStep += 1; progress.style.width = `${Math.min(state.matchStep * 20,100)}%`;
      if (state.matchStep >= 5) {
        clearInterval(state.matchingTimer); qs('#matchTitle').textContent = 'Driver ditemukan!';
        qs('#matchText').textContent = 'Ardi sedang menuju titik jemput Anda. Ini simulasi front-end dan tidak mengirim order ke armada nyata.';
        found.hidden = false; qs('#cancelBooking').textContent = 'Selesai'; saveOrder();
      }
    }, 650);
  }

  function closeModal() {
    clearInterval(state.matchingTimer); qs('#modalBackdrop').hidden = true; qs('#cancelBooking').textContent = 'Batalkan';
  }

  function wireEvents() {
    qsa('.service-card').forEach(btn => btn.addEventListener('click', () => selectService(btn.dataset.service, btn)));
    qsa('.ride-option').forEach(btn => btn.addEventListener('click', () => {
      qsa('.ride-option').forEach(x => x.classList.remove('active')); btn.classList.add('active'); state.tier = btn.dataset.tier; state.multiplier = Number(btn.dataset.multiplier || 1); updateEstimate();
    }));
    qs('#locateButton').addEventListener('click', locateMe); qs('#mapLocate').addEventListener('click', locateMe);
    qs('#clearDestination').addEventListener('click', () => { state.destination = null; qs('#destinationInput').value=''; if(state.destinationMarker){state.destinationMarker.remove();state.destinationMarker=null} if(state.routeLine){state.routeLine.remove();state.routeLine=null} updateEstimate(); });
    qs('#destinationInput').addEventListener('change', () => { if (!state.destination && qs('#destinationInput').value.trim()) toast('Klik titik tujuan pada peta agar jarak dan tarif dapat dihitung.'); });
    qs('#pickupInput').addEventListener('change', () => toast('Untuk lokasi jemput presisi, gunakan tombol lokasi atau pilih lewat GPS.'));
    qs('#bookButton').addEventListener('click', openMatching); qs('#modalClose').addEventListener('click', closeModal); qs('#cancelBooking').addEventListener('click', closeModal);
    qs('#modalBackdrop').addEventListener('click', e => { if(e.target === qs('#modalBackdrop')) closeModal(); });
    qs('#copyPromo').addEventListener('click', async () => { try{await navigator.clipboard.writeText('RIDENOW')}catch{} toast('Kode RIDENOW disalin.'); });
    qsa('[data-nav]').forEach(btn => btn.addEventListener('click', () => {
      const target = btn.dataset.nav; qsa('[data-nav]').forEach(x => x.classList.toggle('active', x.dataset.nav === target));
      if(target==='home') window.scrollTo({top:0,behavior:'smooth'}); else if(target==='orders') { qs('.activity-card').scrollIntoView({behavior:'smooth'}); toast('Riwayat pesanan ditampilkan di perangkat ini.'); } else if(target==='wallet') toast('RIDE Wallet demo · saldo Rp125.000'); else toast('Profil demo belum terhubung ke akun pengguna.');
    }));
    qs('#walletButton').addEventListener('click', () => toast('RIDE Wallet demo · saldo Rp125.000'));
    qs('#profileButton').addEventListener('click', () => toast('Profil demo belum terhubung ke akun pengguna.'));
    qs('#notificationButton').addEventListener('click', () => toast('Tidak ada notifikasi baru.'));
    qs('#changePayment').addEventListener('click', () => toast('Metode pembayaran lain akan ditambahkan pada backend produksi.'));
    qs('#viewAllOrders').addEventListener('click', () => toast('Riwayat lokal maksimal 5 pesanan demo.'));
  }

  setGreeting(); initMap(); wireEvents(); renderOrders(); updateEstimate();
  if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
})();
