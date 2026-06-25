# Rencana Proyek Web Minyak Wangi

## Keputusan Utama

Untuk fase awal, jangan bangun server fisik sendiri. Itu kelihatan hemat, tapi untuk bisnis UMKM yang baru validasi pasar, risikonya lebih besar: listrik, internet, IP publik, keamanan, backup, monitoring, SSL, maintenance, dan downtime jadi tanggung jawab sendiri.

Rekomendasi stack awal:

- Frontend + backend: Next.js
- Database, auth, storage ringan: Supabase
- Hosting aplikasi: Vercel
- Upload gambar parfum/referensi: Supabase Storage atau Cloudinary
- AI: Gemini API atau OpenAI API, dipakai lewat backend sendiri
- Pembayaran fase awal: checkout manual/WhatsApp dulu, payment gateway nanti

Target fase awal bukan bikin sistem sempurna, tapi bikin MVP yang bisa dipakai jualan, bisa diuji customer, dan bisa di-upgrade tanpa bongkar total.

## Scope Produk

## Referensi Dari Proyek Lama

Referensi lokal:

`C:\Users\Abu Bakar Al Adny\OneDrive\Dokumen\KULIAH\Polsri\SMT 2\Praktek Pemrograman Berbasis Web 1\UAS\UAS_Abu\htdocs\ayelectronic_store`

Proyek lama bisa dijadikan acuan alur ecommerce, terutama:

- Homepage dengan slider/hero.
- Kategori unggulan.
- Brand/merk unggulan.
- Katalog produk.
- Detail produk.
- Varian produk.
- Cart.
- Checkout/order.
- Customer login/profile/order history.
- Admin dashboard.
- CRUD produk, kategori, brand.
- CRUD voucher/discount.
- Kelola order.
- Laporan penjualan dan grafik.
- Contact message dan FAQ.

Yang tidak disarankan dibawa mentah-mentah:

- Struktur PHP per file untuk production cloud modern.
- Path aset hardcoded seperti `/ayelectronic_store/...`.
- Query dan logic campur langsung di file view.
- Upload/download gambar memakai pola lama.
- Tema visual biru futuristik untuk customer, karena parfum lebih cocok dibuat premium, bersih, sensual, dan elegan.
- Admin palette lama yang terlalu kontras dan kurang professional untuk dashboard bisnis serius.

Mapping ke web parfum:

- `products` menjadi `perfumes`.
- `product_variants` menjadi ukuran botol/konsentrasi, misalnya 10ml, 30ml, 50ml, 100ml, EDT, EDP, extrait.
- `categories` menjadi keluarga aroma, misalnya fresh, sweet, floral, woody, musky, aquatic, spicy.
- `brands` menjadi referensi brand/designer perfume atau koleksi toko.
- `orders` dan `order_details` tetap dipakai sebagai konsep order.
- `reviews` bisa dipakai lagi untuk testimoni.
- `discounts` bisa dipakai lagi untuk voucher promo.
- `sales_report` menjadi dashboard statistik internal.
- Tambahan baru: `custom_requests`, `reference_uploads`, `ai_sessions`, `ai_messages`, `scent_notes`, `blend_rules`.

Kesimpulan teknis:

Proyek lama bagus sebagai cetak biru fitur, bukan fondasi kode utama. Fondasi baru tetap disarankan pakai Next.js + Supabase supaya lebih siap deploy, lebih rapi, dan lebih mudah di-upgrade.

### Customer

- Lihat katalog parfum.
- Filter parfum berdasarkan karakter aroma: manis, fresh, woody, floral, aquatic, spicy, musky, powdery, citrus, gourmand.
- Pilih ukuran botol dan konsentrasi.
- Request racikan custom lewat form teks.
- Upload gambar/parfum referensi.
- Tanya AI untuk rekomendasi parfum.
- Simpan order/request lalu diarahkan ke WhatsApp atau checkout.

### Admin/Internal

- Login admin.
- Kelola data parfum.
- Kelola kategori aroma.
- Kelola stok dan harga.
- Lihat request customer.
- Lihat order.
- Lihat statistik dasar: jumlah order, request populer, aroma populer, parfum paling sering dilihat/dipesan.
- Lihat riwayat chat AI/request AI untuk evaluasi kualitas jawaban.

### AI

AI jangan dibiarkan bebas jawab dari internet doang. AI harus dibatasi pakai data parfum toko.

Peran AI fase awal:

- Menjelaskan karakter parfum dari database.
- Merekomendasikan parfum berdasarkan preferensi user.
- Menilai kombinasi aroma sederhana: cocok, kurang cocok, atau perlu alternatif.
- Mengubah request user menjadi ringkasan racikan untuk admin.
- Membaca gambar/referensi brand sebagai input, lalu mencocokkan ke data toko semampunya.

AI tidak boleh menjanjikan "90% mirip" kecuali memang toko punya data formula internal yang terukur. Pakai bahasa seperti "arah aromanya mendekati" atau "rekomendasi racikan awal".

## Tahapan Pengerjaan

### Fase 0 - Discovery

Output:

- Daftar parfum/bibit yang dijual.
- Data karakter tiap parfum.
- Ukuran botol, harga, konsentrasi, stok.
- Alur order yang sekarang dipakai.
- Role internal: owner, admin, peracik, kasir.
- Contoh 20 request customer nyata.

Durasi realistis: 2-5 hari.

### Fase 1 - MVP Jualan

Fitur:

- Homepage/tampilan katalog.
- Detail parfum.
- Filter aroma.
- Form custom request.
- Upload gambar referensi.
- Submit order ke dashboard admin.
- Tombol lanjut WhatsApp.
- Admin login.
- CRUD parfum, stok, harga, kategori.

Durasi realistis solo: 2-4 minggu.

### Fase 2 - AI Assistant

Fitur:

- Chat AI khusus parfum.
- AI memakai data parfum dari database.
- AI kasih rekomendasi dengan batasan jelas.
- AI menyimpan log pertanyaan dan jawaban.
- Admin bisa review jawaban AI.
- Limit chat per user/session supaya biaya terkendali.

Durasi realistis solo: 1-3 minggu setelah data rapi.

### Fase 3 - Dashboard Statistik

Fitur:

- Order harian/bulanan.
- Parfum terpopuler.
- Aroma terpopuler.
- Request custom terpopuler.
- Rasio user chat AI ke order.
- Data customer sederhana.

Durasi realistis solo: 1-2 minggu.

### Fase 4 - Payment dan Operasional

Fitur:

- Payment gateway.
- Status pembayaran.
- Invoice.
- Notifikasi admin.
- Pengiriman/kurir.
- Export data.

Durasi realistis solo: 2-4 minggu.

## Struktur Data Awal

Tabel utama:

- products
- fragrance_notes
- product_notes
- categories
- inventory
- orders
- order_items
- custom_requests
- ai_sessions
- ai_messages
- admins

Kolom penting product:

- name
- brand_reference
- description
- scent_family
- top_notes
- middle_notes
- base_notes
- intensity
- longevity
- gender_positioning
- recommended_use
- price
- stock
- is_active

## Estimasi Tim

Bisa lu kerjain sendiri kalau scope-nya MVP dulu. Tapi jangan janji semua fitur enterprise langsung.

Komposisi ideal kecil:

- 1 full-stack developer: lu
- 1 UI/UX part-time atau template/design system
- 1 orang dari toko sebagai domain expert parfum
- 1 admin tester dari pihak toko

Kalau mereka minta payment gateway, AI matang, dashboard lengkap, dan operasional serius dalam waktu cepat, minimal butuh 2-3 orang.

## Estimasi Biaya Operasional Awal

Perkiraan awal:

- Domain: bayar tahunan.
- Hosting web: bisa mulai gratis atau murah, naik saat traffic naik.
- Database: bisa mulai free tier, production lebih aman pakai plan berbayar.
- AI API: bisa ada free tier, tapi untuk bisnis harus dianggap biaya variabel.
- Storage gambar: kecil di awal, naik kalau gambar banyak.

Jangan jual ke client dengan asumsi "AI gratis selamanya". Lebih aman tulis di proposal: biaya AI mengikuti pemakaian dan akan diberi limit bulanan.

## Rekomendasi Proposal

Bagi harga project menjadi:

- Biaya development sekali bayar.
- Biaya maintenance bulanan.
- Biaya operasional pihak ketiga: domain, hosting, database, AI, storage, payment gateway.

Jangan campur semua jadi satu harga tanpa batas. Itu bisa bikin rugi kalau AI dan traffic naik.

## Prinsip Build

- Mulai dari data parfum dulu, bukan dari AI dulu.
- AI hanya bagus kalau database parfumnya bagus.
- Dashboard statistik ambil dari event/order nyata, bukan asumsi.
- Self-host server fisik ditunda sampai bisnis benar-benar butuh dan ada orang yang siap mengurus infrastruktur.
- Rilis pertama harus bisa jualan walaupun AI belum sempurna.
