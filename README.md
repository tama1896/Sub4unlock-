# Subs4Unlock — Supabase + Cloudflare Pages

Paket ini mempertahankan desain `index.html` dan `unlock.html`, tetapi mengganti Base64 di URL dengan ID pendek yang menunjuk ke data di Supabase.

## Isi
- `index.html` — halaman generator, menyimpan payload melalui `/api/create`
- `unlock.html` — halaman unlock yang memuat data lewat `/api/link/:id`
- `functions/api/create.js` — endpoint untuk membuat dan menyimpan link
- `functions/api/link/[id].js` — endpoint untuk membaca payload link
- `functions/u/[id].js` — URL pendek `/u/:id`
- `supabase.sql` — skema tabel dan pengaturan akses

## A. Buat database Supabase
1. Buat akun/proyek di https://supabase.com/
2. Buka **SQL Editor**.
3. Jalankan seluruh isi `supabase.sql`.
4. Buka **Project Settings / API Keys** (atau Connect) dan salin Project URL serta **secret key** backend. Jangan pakai secret key di HTML.

## B. Deploy ke Cloudflare Pages
1. Buat akun https://cloudflare.com/ dan repository GitHub.
2. Upload semua file dalam folder paket ini ke root repository. Pastikan `index.html`, `unlock.html`, `functions/`, dan `supabase.sql` ada di root.
3. Di Cloudflare Dashboard, buka **Workers & Pages → Create → Pages → Connect to Git** lalu pilih repository.
4. Untuk HTML biasa, set build command `exit 0` dan build output directory `.` jika dashboard menerima root sebagai output. Jika root tidak diterima oleh konfigurasi proyek, ikuti petunjuk Pages untuk static HTML.
5. Deploy. Cloudflare akan memberi alamat `https://nama-proyek.pages.dev`.

## C. Tambahkan secrets
Di Cloudflare Pages project → **Settings → Variables and Secrets**, tambahkan sebagai secrets:
- `SUPABASE_URL` = Project URL Supabase, contoh format `https://PROJECT_REF.supabase.co`
- `SUPABASE_SECRET_KEY` = secret key Supabase (atau service_role key lama jika itu yang tersedia)

Simpan lalu lakukan redeploy. Jangan pernah menaruh key rahasia di `index.html` atau `unlock.html`.

## D. Uji
1. Buka alamat Pages kamu.
2. Isi Link Tujuan dan URL verifikasi yang diperlukan.
3. Tekan Generate. Link hasil harus berbentuk `https://nama-proyek.pages.dev/u/0123abcdef`.
4. Buka link di tab privat/perangkat lain untuk menguji bahwa data dibaca dari database.

## Catatan keamanan dan perilaku
- Tombol verifikasi hanya mencatat bahwa pengunjung mengklik tombol. Kode statis ini tidak dapat membuktikan bahwa seseorang benar-benar subscribe/follow/like. Untuk bukti nyata, perlu integrasi API resmi platform dan autentikasi yang sesuai.
- Jangan menambahkan kebijakan RLS yang memberi akses publik ke tabel `links`; backend menggunakan secret key.
- Pertimbangkan pembatasan request/rate limit sebelum membagikan layanan ke publik.
- URL tujuan hanya menerima HTTP/HTTPS. Jangan gunakan untuk mengarahkan ke konten yang melanggar hukum atau menipu pengguna.
