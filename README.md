# RIDE

RIDE adalah MVP publik aplikasi mobilitas / super-app dengan UX mobile-first untuk transportasi, pengiriman, makanan, belanja harian, wallet demo, dan riwayat pesanan.

## Live Public

https://copytolive.github.io/ride/

## Fitur aktif

- RIDE Motor, RIDE Car, dan RIDE Send
- Peta interaktif OpenStreetMap + Leaflet
- Geolokasi browser dan pemilihan tujuan dari peta
- Estimasi jarak, waktu, tarif, serta tier Hemat / Prioritas / Comfort
- Simulasi pencarian dan pencocokan driver
- RIDE Food: katalog merchant, item, keranjang, dan checkout demo
- RIDE Mart: katalog kebutuhan harian, keranjang, dan checkout demo
- RIDE Wallet demo: saldo lokal, top-up simulasi, dan histori transaksi
- Riwayat gabungan perjalanan serta order Food/Mart
- Profil, notifikasi, promo, dan semua layanan
- Responsive desktop + mobile
- Installable PWA + service worker app shell
- Deployment otomatis ke GitHub Pages pada setiap push ke `main`

## Status produksi

Frontend public MVP aktif. Data demo disimpan lokal pada browser. Untuk layanan komersial nyata masih diperlukan backend produksi untuk akun/OTP/KYC, database, dispatch driver, GPS real-time, merchant, chat, payment gateway, settlement, fraud/safety, admin/ops, serta aplikasi driver/merchant.

## Source

Static web app tanpa build step: `index.html`, `styles.css`, `features.css`, `app.js`, `features.js`, `manifest.webmanifest`, dan `sw.js`.
