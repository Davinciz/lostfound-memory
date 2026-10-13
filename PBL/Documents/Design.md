---
type: design
project: lost-found
status: active
updated: 2026-10-13
summary: Spesifikasi UI mobile dan admin dengan autentikasi Google SSO dan profil NIM opsional.
---

# Campus Lost & Found (CLF) — Design Specification
**Untuk handoff ke Google Stitch**
Versi 2.1 · Disesuaikan dengan PRD, ERD (7 tabel), Technical Reference, dan Plan fitur terbaru · Mobile app Flutter + Dashboard admin web (Filament)

## 1. Ringkasan Proyek
CLF adalah aplikasi mobile yang membantu mahasiswa dan dosen melaporkan, mencari, dan mengembalikan barang hilang maupun ditemukan di lingkungan kampus, lengkap dengan foto dan peta interaktif untuk memilih lokasi (dengan saran gedung terdekat sebagai daftar), chat in-app antara pemilik dan penemu (penemu memverifikasi kepemilikan lewat chat), serta dashboard admin terpusat untuk menyetujui klaim.

**Tech stack:** Flutter (mobile) · Laravel + Sanctum (REST API & auth) · PostgreSQL · Filament (admin panel, terhubung ke Laravel — bukan langsung ke Flutter) · Laravel Storage untuk foto · FCM untuk push notification · Pusher (rencana migrasi ke Soketi) untuk chat real-time.

**Tim:** Anisa Aulia, Daniel Arvin Geovani, Muhammad Tsaqif Satria Firmansyah, Steven Hermawan · Dosen Pendamping: Amran Yobioktabera, S.Kom., M.Kom. · Referensi akademik: RPP PBL-202601-10 (Kelompok 4, IK-2B)

---

## 2. Design Tokens

### 2.1 Warna
Palet brand: **hitam-kuning**. Warna status (Pending/Returned/Rejected/Closed) tetap dipertahankan sebagai warna semantik terpisah dari brand, supaya tiap status laporan tetap mudah dibedakan.

| Token | Hex (Light) | Hex (Dark) | Kegunaan |
| --- | --- | --- | --- |
| `primary` | `#111111` | `#F5C400` | Aksi utama (tombol, FAB), tab aktif, tautan, ikon aktif |
| `primary-dark` | `#000000` | `#D9A600` | Hover/pressed state dari primary |
| `primary-soft` | `#FFF3B0` | `#3A2C05` | Background lembut ber-aksen primary (badge Claimed, chip aktif, info GPS) |
| `accent-yellow` | `#F5C400` | `#F5C400` | Aksen kuning eksplisit — border tipis, highlight, dot indikator, dekorasi |
| `success` | `#15803D` | `#15803D` | Status *Returned* / *Accepted* |
| `success-soft` | `#EAF7EE` | `#12271C` | Background badge success |
| `warning` | `#C2560A` | `#C2560A` | Status *Pending*, label "Kehilangan" |
| `warning-soft` | `#FFF1E6` | `#2A1E11` | Background badge warning |
| `danger` | `#DC2626` | `#DC2626` | Status *Rejected*, error, aksi destruktif (Keluar, Tolak, Blokir) |
| `danger-soft` | `#FDECEC` | `#2A161A` | Background badge/alert danger |
| `neutral` | `#475467` | `#9AA3B8` | Status netral: *Closed*, *Withdrawn* |
| `neutral-soft` | `#EEF0F3` | `#232838` | Background badge neutral |
| `bg` | `#FAFAFA` | `#0A0A0A` | Background layar/canvas |
| `surface` | `#FFFFFF` | `#141414` | Background kartu, input, panel, bottom nav |
| `text` | `#0D0D0D` | `#F5F5F5` | Teks utama |
| `text-secondary` | `#5C5C5C` | `#A3A3A3` | Teks sekunder, label, caption, placeholder |
| `border` | `#E5E5E5` | `#262626` | Border kartu, input, divider |

> **Aturan kontras:** di light mode `primary` hitam → teks di atasnya **putih**. Di dark mode `primary` berganti kuning terang → teks di atasnya **hitam** (bukan putih), supaya tetap terbaca. Label "Menemukan" pakai `success` (hijau), label "Kehilangan" pakai `warning` (oranye) — bukan kuning, supaya tidak tertukar dengan badge Claimed.

### 2.2 Tipografi
Font: **Plus Jakarta Sans**.

| Style | Ukuran | Weight |
| --- | --- | --- |
| H1 (judul layar) | 26px | Bold |
| H2 (judul section) | 20px | SemiBold |
| H3 (judul kartu) | 16px | SemiBold |
| Body | 14px | Regular |
| Caption/Label | 12px | Medium |
| Button text | 14px | SemiBold |

### 2.3 Spacing & Radius
- Base spacing unit: 4px (gunakan kelipatan: 4, 8, 12, 16, 24, 32).
- `radius-sm`: 8px (input, button kecil)
- `radius-md`: 12px (card)
- `radius-lg`: 16px (bottom sheet, modal)
- `radius-full`: 999px (badge, chip, avatar)

### 2.4 Status Badge (mapping warna)
Nilai status disimpan **huruf kecil** di database/API; tampilan UI memakai huruf kapital di awal (mis. `pending` → "Pending").

**Status laporan (hilang & temuan):**

| Status | Warna teks | Warna background |
| --- | --- | --- |
| Pending | `warning` | `warning-soft` |
| Claimed | `primary` | `primary-soft` |
| Returned | `success` | `success-soft` |
| Closed | `neutral` | `neutral-soft` |

**Status claim:**

| Status (DB) | Label UI | Warna teks | Warna background |
| --- | --- | --- | --- |
| pending | Menunggu | `warning` | `warning-soft` |
| accepted | Diterima | `success` | `success-soft` |
| returned | Diserahkan | `success` | `success-soft` |
| rejected | Ditolak | `danger` | `danger-soft` |
| withdrawn | Dibatalkan | `neutral` | `neutral-soft` |

### 2.5 Kategori Barang
Daftar kategori **tetap** (sesuai ERD): Buku, Elektronik, Jaket/Kemeja, Dompet, Aksesoris, Alat Tulis, Lainnya. Dipakai di chip filter, dropdown form, dan filter admin.

### 2.6 Komponen & State
| Komponen | Spesifikasi |
| --- | --- |
| Button primary | bg `primary`, teks putih (light) / hitam (dark), radius `radius-sm`, padding 12×18px, hover→`primary-dark`, disabled→abu `#D9D9D9` |
| Button outline | border 1.5px `primary`, teks `primary`, bg transparan |
| Button destructive | bg `danger`, teks putih |
| Input default | border 1px `border`, bg `surface`, radius `radius-sm`, padding 10×12px |
| Input focus | border 1.5px `primary` |
| Input error | border 1.5px `danger`, teks pesan error warna `danger` 12px di bawah field |
| Disabled | Button → bg `#D9D9D9` teks putih, cursor not-allowed; input tidak bisa diketik, opacity 0.6 |
| Toggle switch (on) | bg `primary`, thumb putih |
| Toggle switch (off) | bg `#D9D9D9`, thumb putih |
| Bottom navigation | bg `surface`, ikon aktif `primary` + label `primary`, ikon nonaktif `text-secondary` |
| Bubble chat | Pesan sendiri: bg `primary`, teks kontras (lihat aturan kontras). Pesan lawan bicara: bg `surface` + border `border`, teks `text` |

---

## 3. Role Pengguna
| Role | Akses |
| --- | --- |
| **User** (mahasiswa, dosen, karyawan) | Login dengan Google SSO; hanya email `@mhs.polines.ac.id`, `@dsn.polines.ac.id`, `@polines.ac.id` (domain harus cocok persis). Melaporkan barang hilang/ditemukan (foto, deskripsi, lokasi lewat pin di peta + saran gedung), mencari & memfilter laporan, mengajukan claim (wajib punya laporan hilang), chat dengan penemu/pemilik, menerima notifikasi. |
| **Administrator** | Dashboard web (Filament): melihat semua laporan, memverifikasi claim (terima/tolak/batalkan), mencatat serah terima barang dengan foto bukti, memperbarui status, memblokir/membuka blokir pengguna, mengelola master data gedung. |

## 4. Fitur Utama
| Fitur | Perilaku UI |
| --- | --- |
| **Kamera** | Ambil foto langsung dari kamera perangkat (bukan hanya galeri). Minimal 1, maksimal 3 foto, dikompres otomatis (maks 2 MB per foto). Preview thumbnail sebelum submit, bisa dihapus/diganti. |
| **GPS & Gedung Kampus** | Lokasi dipilih lewat titik (pin) di peta (`flutter_map` + OpenStreetMap). Peta terbuka di tengah kampus tanpa pin; user menaruh pin di lokasi kehilangan/penemuan. Tombol "Lokasi saya" hanya menggeser peta ke posisi GPS, tidak menetapkan lokasi. Marker gedung dari `GET /api/buildings` tampil di peta; tap marker memilih gedung. Setelah pin ditaruh, muncul daftar saran gedung: maksimal 3 terdekat dalam radius ~75 m, urut jarak, tiap item menampilkan nama gedung dan jarak. User mengklik untuk memilih; tidak ada pilihan otomatis. Detail lokasi opsional. |
| **Claim & Verifikasi via Chat** | Pemilik wajib membuat laporan hilang dulu, lalu mengajukan claim ke laporan temuan. Ruang chat dengan penemu terbuka otomatis; penemu memverifikasi kepemilikan lewat chat. Admin hanya menyetujui/menolak claim (admin tidak membaca isi chat). |
| **Chat In-App** | Chat real-time antara pemilik dan penemu, dibuka otomatis saat claim diajukan atau lewat tombol "Chat dengan Pelapor" di detail laporan. |
| **WhatsApp** | Tombol "Hubungi via WhatsApp" hanya muncul jika pelapor mengizinkan nomornya ditampilkan (default: disembunyikan). |
| **Push Notification** | Notifikasi FCM: claim diajukan, claim diproses (diterima/ditolak), barang sudah diserahkan, pesan chat baru, update pada laporan milik user. Badge counter angka di ikon lonceng. Tap notifikasi → deep link ke detail laporan/claim/chat. |

---

## 5. SPESIFIKASI LAYAR — APLIKASI MOBILE (USER)

### 5.1 Splash Screen
**Elemen:** logo/nama "Campus Lost & Found" di tengah, background `primary` (hitam), loading indicator kecil kuning (`accent-yellow`) di bawah.

**Stitch prompt:** Buatkan splash screen mobile app, background hitam penuh `#111111`, logo teks "Campus Lost & Found" putih di tengah layar dengan subjudul kecil "CLF" warna kuning `#F5C400`, loading spinner tipis warna kuning di bagian bawah. Font Plus Jakarta Sans, sangat minimalis.

### 5.2 Onboarding (2–3 slide)
**Elemen:** ilustrasi/ikon besar per slide, judul + 1 kalimat deskripsi, dot indicator, tombol "Lewati" (kanan atas) dan "Lanjut/Mulai" (bawah, full-width hitam).
Isi slide: (1) "Lapor barang hilang atau temuan dengan cepat", (2) "Cari barangmu dan terima notifikasi saat ada kabar", (3) "Ajukan claim, verifikasi kepemilikan, dan chat langsung dengan penemu".

**Stitch prompt:** Buatkan 3 slide onboarding mobile app, tiap slide: ilustrasi line-art sederhana warna hitam dengan aksen kuning di tengah atas, judul bold 20px di bawah ilustrasi, deskripsi 14px abu-abu, dot indicator kuning untuk slide aktif, tombol "Mulai" hitam penuh di slide terakhir. Font Plus Jakarta Sans, background putih.

### 5.3 Login
**Elemen:** logo, penjelasan singkat akun Google Polines yang didukung, tombol **"Masuk dengan Google"**. Tidak ada input password, tautan daftar, atau lupa password. Pesan error jika akun/domain tidak memenuhi syarat.

**Stitch prompt:** Buatkan layar login mobile minimalis untuk Campus Lost & Found. Logo di atas, teks "Masuk menggunakan akun Google Polines", satu tombol lebar "Masuk dengan Google" dengan ikon Google, state loading dan pesan error yang jelas. Tidak ada field email/password, tautan daftar, atau lupa password. Gaya flat, whitespace luas, palet hitam-kuning, font Plus Jakarta Sans.

### 5.4 Register — Dihapus
Dihapus karena akun user dibuat otomatis setelah Google SSO tervalidasi; tidak ada register manual. Nomor subbagian dipertahankan agar referensi historis tidak bergeser.

### 5.5 Lupa Password — Dihapus
Dihapus karena autentikasi user mobile memakai Google SSO; pemulihan akun dilakukan melalui Google. Password admin Filament dikelola terpisah.

### 5.6 Beranda (Home)
**Elemen:**
- Header: logo kecil kiri, avatar bulat kanan (background gradasi hitam→kuning, berisi inisial), ikon lonceng notifikasi dengan badge angka merah (tap → layar Notifikasi).
- Search bar singkat (tap → ke layar Cari).
- Chip filter horizontal: Semua (aktif, bg hitam, teks putih), Hilang, Ditemukan, + kategori (Buku, Elektronik, Jaket/Kemeja, Dompet, Aksesoris, Alat Tulis, Lainnya).
- List kartu laporan vertikal: foto thumbnail, nama barang, label "Kehilangan" (oranye)/"Menemukan" (hijau), lokasi (nama gedung) + waktu relatif, badge status (Pending/Claimed/Returned).
- Pull-to-refresh, empty state ("Belum ada laporan" + tombol buat laporan).
- Bottom navigation 5 ikon: Beranda, Cari, **+ Lapor** (FAB tengah menonjol, bg hitam, ikon plus putih), Chat (badge jumlah pesan belum dibaca), Profil.

**Stitch prompt:** Buatkan home feed mobile app untuk aplikasi lost & found kampus. Header dengan avatar bulat kanan (gradasi hitam ke kuning keemasan) dan ikon bell dengan badge notifikasi. Search bar di bawah header. Baris chip filter horizontal-scroll (Semua aktif bg hitam teks putih, lainnya outline). List kartu vertikal — tiap kartu: foto kiri, nama barang, label "Kehilangan" warna oranye atau "Menemukan" warna hijau (bold, uppercase kecil), nama gedung & waktu relatif abu-abu kecil, badge status warna (oranye=Pending, kuning=Claimed, hijau=Returned). Bottom navigation 5 ikon (home, search, tombol plus mengambang di tengah berwarna hitam dengan ikon plus putih, chat bubble dengan badge kecil, user/profil), yang otomatis hilang saat scroll ke bawah dan muncul lagi saat scroll ke atas. Font Plus Jakarta Sans, palet hitam-kuning: primary hitam `#111111`, aksen kuning `#F5C400`, sangat minimalis, tanpa shadow berlebihan.

### 5.7 Cari & Filter
**Elemen:**
- Search bar auto-focus, tombol batal kanan.
- Tombol "Filter" membuka bottom-sheet: jenis (Hilang/Ditemukan), kategori (chip multi-select), status, **gedung** (dropdown dari master gedung), rentang tanggal, tombol "Terapkan Filter" (hitam penuh) & "Reset" (outline).
- Hasil pencarian: list kartu (format sama seperti Beranda).
- Riwayat pencarian terakhir (chip) saat search bar kosong.
- Empty state: "Tidak ditemukan hasil untuk pencarian ini".

**Stitch prompt:** Buatkan layar pencarian mobile app, search bar besar di atas dengan auto-focus, di bawahnya chip "Pencarian Terakhir" (3-4 chip abu-abu), tombol filter di kanan search bar membuka bottom sheet berisi: jenis (Hilang/Ditemukan), kategori (chip multi-select, aktif bg kuning muda teks hitam), status (radio button), dropdown gedung, date range picker, tombol "Terapkan Filter" hitam penuh dan "Reset" outline hitam. Hasil pencarian tampil sebagai list card sama seperti home feed. Font Plus Jakarta Sans, palet hitam-kuning.

### 5.8 Form Lapor Barang (Hilang/Ditemukan)
**Elemen:**
- Header: back + judul "Lapor Barang".
- Toggle 2 opsi: "Hilang" | "Ditemukan" (aktif = bg hitam, teks putih).
- Upload foto: 3 kotak 64px — kotak terisi (bg kuning muda `primary-soft`, ikon kamera hitam), kotak kosong bergaris putus-putus + ikon plus. Tombol "Ambil dari kamera" & "Pilih dari galeri". Info kecil: "Foto dikompres otomatis".
- Input Nama Barang, dropdown Kategori (7 kategori tetap), textarea Deskripsi.
- Section lokasi: peta `flutter_map` terbuka di tengah kampus tanpa pin. User menaruh pin dengan tap di peta; pin bisa digeser. Tombol "Lokasi saya" menggeser peta ke posisi GPS (tidak menetapkan pin). Marker gedung tampil di peta; tap marker memilih gedung. Setelah pin ditaruh, muncul **daftar saran gedung** (maks 3, radius 75 m, urut jarak; tiap item: nama gedung + jarak, mis. "Gedung Sekolah A · 45 m"). User klik item untuk memilih (tidak otomatis). Input "Detail Lokasi (opsional)" ("lantai 2, ruang 201"). Label section: Lost → "Lokasi Kehilangan", Found → "Lokasi Penemuan".
- Input tanggal: **Hilang** = tanggal hilang (tanggal saja); **Ditemukan** = tanggal & jam ditemukan (default: sekarang).
- Tombol "Kirim Laporan" hitam penuh, sticky di bawah.
- Validasi inline: field wajib bertanda *, pesan error merah di bawah field.

**Stitch prompt:** Buatkan form "Lapor Barang" mobile app. Di atas: toggle 2 opsi "Hilang"/"Ditemukan" (yang aktif bg hitam teks putih, yang tidak aktif outline). Bagian upload foto: 3 kotak 64px, kotak pertama sudah terisi foto (background kuning muda, ikon kamera hitam), dua kotak sisanya kosong bergaris putus-putus dengan ikon plus. Form fields: nama barang, kategori (dropdown), tanggal, deskripsi (textarea). Section lokasi: peta interaktif yang menempati sebagian layar (border gelap, rounded corners) dengan pin di tengah kampus, tombol kecil "Lokasi saya" (ikon my-location) di pojok kanan atas peta yang hanya menggeser view ke posisi GPS. Marker kecil gedung tampil di peta. Di bawah peta, daftar saran gedung vertikal — tiap item card putih dengan nama gedung dan jarak ("Gedung Sekolah A · 45 m"), item terpilih berlatar kuning muda. Input "Detail lokasi (opsional)" di bawah daftar. Tombol "Kirim laporan" hitam penuh (teks putih) menempel di bawah layar. Gaya minimalis, banyak whitespace, radius kecil 8px di semua elemen form, font Plus Jakarta Sans.

### 5.9 Detail Barang
**Elemen:**
- Header: back + ikon share.
- Galeri foto carousel (dot indicator).
- Badge status di atas judul, nama barang (H1), kode laporan kecil (mis. LST-261001-A3F9 / FND-261001-B7K2), lokasi (gedung + detail) + waktu laporan.
- Peta kecil pin lokasi.
- Section "Deskripsi" teks lengkap.
- Section "Dilaporkan oleh" (nama/inisial, bukan kontak langsung).
- Riwayat status timeline vertikal sederhana.
- Tombol "Chat dengan Pelapor" (outline, ikon chat) — selalu tersedia selama status masih aktif.
- Tombol "Hubungi via WhatsApp" (outline, ikon WA) — **hanya tampil jika pelapor mengaktifkan tampilan nomor WhatsApp**.
- Tombol "Ajukan Claim" hitam penuh sticky bawah (hanya pada laporan **ditemukan** yang statusnya masih Pending; jika sudah Claimed/Returned, tombol diganti label status non-aktif). Jika user belum punya laporan hilang, menekan tombol ini menampilkan dialog "Buat laporan hilang dulu" yang mengarah ke form Lapor Barang.

**Stitch prompt:** Buatkan layar detail barang mobile app. Galeri foto carousel di atas dengan dot indicator, badge status oranye "Pending" menempel di pojok foto, judul nama barang bold 20px di bawah foto dengan kode laporan kecil abu-abu, info lokasi (nama gedung) dan waktu dengan ikon pin abu-abu, section deskripsi paragraf, peta kecil dengan pin lokasi, dan riwayat status berbentuk timeline vertikal sederhana. Di bawah layar: tombol "Ajukan claim" hitam penuh (teks putih), di atasnya dua tombol outline berdampingan "Chat dengan Pelapor" dan "WhatsApp". Font Plus Jakarta Sans, palet hitam-kuning.

### 5.10 Form Pengajuan Claim
**Elemen:**
- Header back + judul "Ajukan Claim".
- Ringkasan barang temuan (foto kecil + nama + kode, non-editable).
- Dropdown "Laporan hilang kamu" (pilih laporan hilang milik sendiri yang dikaitkan dengan claim ini) + tautan "Belum lapor? Buat laporan hilang dulu".
- Textarea "Jelaskan ciri khusus/alasan klaim".
- Tombol "Kirim Pengajuan Claim" hitam penuh.
- Catatan kecil: "Setelah diajukan, ruang chat dengan penemu otomatis terbuka. Penemu akan menanyakan ciri barangmu untuk memastikan ini milikmu. Admin menyetujui claim setelahnya."

**Stitch prompt:** Buatkan form pengajuan claim mobile app. Card ringkasan barang di atas (foto kecil kiri, nama barang dan kode kanan, abu-abu non-editable). Dropdown "Laporan hilang kamu" dengan tautan kecil di bawahnya "Belum lapor? Buat laporan hilang dulu". Textarea besar "Jelaskan ciri khusus/alasan klaim". Tombol "Kirim Pengajuan Claim" hitam penuh di bawah, catatan kecil abu-abu di bawah tombol. Font Plus Jakarta Sans, palet hitam-kuning.

### 5.11 Laporan Saya
**Elemen:** judul "Laporan Saya", tab "Semua/Aktif/Selesai", list kartu (format Beranda) dengan kode laporan dan badge status, empty state.

**Stitch prompt:** Buatkan layar "Laporan Saya" mobile app. Tab horizontal "Semua / Aktif / Selesai" di atas (tab aktif underline hitam). List kartu laporan sama seperti home feed, ditambah kode laporan kecil abu-abu di tiap kartu. Font Plus Jakarta Sans, palet hitam-kuning.

### 5.12 Claim Saya
**Elemen:** judul "Claim Saya", list kartu claim (foto, nama barang, tanggal pengajuan, badge status claim), tap → Detail Claim, empty state.

**Stitch prompt:** Buatkan layar "Claim Saya" mobile app, list kartu claim — tiap kartu: foto barang kiri, nama barang dan tanggal pengajuan di tengah, badge status claim (oranye=Menunggu, hijau=Diterima, merah=Ditolak, abu=Dibatalkan) di kanan. Font Plus Jakarta Sans, palet hitam-kuning.

### 5.13 Detail Claim (User)
**Elemen:** ringkasan barang, badge status claim, tanggal pengajuan, catatan admin (tampil jika claim ditolak), tombol "Buka Chat". Jika barang sudah diserahkan: section "Bukti Serah Terima" berisi foto bukti, "Diserahkan pada [tanggal, jam]", "Oleh: [nama]".

**Stitch prompt:** Buatkan layar detail claim mobile app. Atas: kartu ringkasan barang (foto kecil, nama, kode) dengan badge status hijau "Diterima". Di bawahnya info tanggal pengajuan, lalu tombol outline "Buka Chat". Di bagian bawah section "Bukti Serah Terima": foto besar berradius 12px, caption abu-abu "Diserahkan pada 30 Sep 2026, 10:30 · Oleh: Admin Kampus". Font Plus Jakarta Sans, palet hitam-kuning.

### 5.14 Daftar Chat
**Elemen:** judul "Chat", list percakapan (avatar inisial, nama lawan bicara, preview pesan terakhir 1 baris, waktu, badge angka belum dibaca, nama/kode barang terkait kecil), pull-to-refresh, empty state ("Belum ada percakapan").

**Stitch prompt:** Buatkan layar daftar chat mobile app. Judul "Chat" di atas. List percakapan: avatar bulat inisial (gradasi hitam ke kuning) kiri, nama lawan bicara bold, preview pesan terakhir 1 baris abu-abu, label kecil nama barang terkait, waktu di kanan atas, badge bulat kuning dengan angka untuk pesan belum dibaca. Bottom navigation dengan tab Chat aktif. Font Plus Jakarta Sans, palet hitam-kuning.

### 5.15 Ruang Chat
**Elemen:** header (back, avatar + nama lawan bicara, kartu mini barang terkait yang bisa di-tap → detail barang), banner tips di atas pesan untuk **penemu** pada chat terkait claim ("Tanyakan ciri yang tidak terlihat di foto dan jangan sebut ciri barangnya lebih dulu"; bisa ditutup), daftar pesan (terbaru di bawah, pemisah tanggal), input pesan + tombol kirim (kuning/hitam), indikator "mengirim…"/gagal kirim dengan opsi coba lagi.

**Stitch prompt:** Buatkan layar ruang chat mobile app. Header: tombol back, avatar inisial, nama lawan bicara, dan di bawahnya kartu mini barang terkait (foto kecil + nama barang). Banner kecil berlatar kuning muda berisi tips verifikasi untuk penemu dengan tombol tutup. Area pesan: bubble pesan sendiri di kanan berlatar hitam teks putih, bubble lawan bicara di kiri berlatar putih dengan border tipis, waktu kecil di bawah tiap bubble, pemisah tanggal "Hari Ini". Bawah: input teks bulat dengan tombol kirim bulat berwarna kuning dan ikon hitam. Font Plus Jakarta Sans, palet hitam-kuning.

### 5.16 Notifikasi
**Elemen:** judul "Notifikasi" + "Tandai semua dibaca", list notifikasi (ikon jenis, judul, deskripsi 1 baris, waktu relatif, titik kuning jika belum dibaca), grouping "Hari Ini/Kemarin/Lebih Awal", empty state. Jenis: claim baru, claim diterima/ditolak, barang diserahkan, pesan chat baru, update laporan. Diakses lewat ikon lonceng di header Beranda.

**Stitch prompt:** Buatkan layar notifikasi mobile app, header dengan tombol back, judul "Notifikasi" dan tombol kecil "Tandai semua dibaca" di kanan. List notifikasi dikelompokkan dengan label section "Hari Ini" dan "Kemarin". Tiap item: ikon bulat kecil (bg kuning muda, ikon hitam) kiri, judul bold 14px dan deskripsi 1 baris abu-abu, waktu relatif kanan atas, dot kuning kecil di kiri item yang belum dibaca. Font Plus Jakarta Sans, palet hitam-kuning.

### 5.17 Profil
**Elemen:** avatar besar + nama + email Google + NIM (bila tersedia), tombol "Edit Profil", menu list (Laporan Saya, Claim Saya, Pengaturan, Bantuan/FAQ, Tentang Aplikasi), tombol "Keluar" (merah) di paling bawah.

**Stitch prompt:** Buatkan layar profil mobile app. Avatar bulat besar di tengah atas (background gradasi hitam ke kuning, inisial putih), nama lengkap bold di bawahnya, email abu-abu kecil, NIM hanya jika tersedia. Tombol outline "Edit Profil" di bawah. List menu vertikal dengan ikon kiri, label tengah, chevron kanan untuk tiap item (Laporan Saya, Claim Saya, Pengaturan, Bantuan, Tentang Aplikasi). Tombol "Keluar" teks merah di paling bawah tanpa background. Bottom navigation dengan tab Profil aktif. Font Plus Jakarta Sans, palet hitam-kuning.

### 5.18 Edit Profil
**Elemen:** back + judul, avatar dengan tombol ubah foto, input Nama Lengkap, NIM hanya-baca (sembunyikan bila kosong), No. WhatsApp, toggle "Tampilkan nomor WhatsApp ke pengguna lain" (default mati, dengan keterangan privasi), Email (hanya-baca, terikat Google SSO), tombol "Simpan Perubahan" hitam penuh.

**Stitch prompt:** Buatkan layar edit profil mobile app, avatar bulat di atas dengan ikon kamera kecil overlay di pojok kanan bawah avatar (bg kuning, ikon hitam) untuk ganti foto, field Nama Lengkap/NIM hanya-baca (sembunyikan bila kosong)/No. WhatsApp tersusun vertikal, di bawahnya toggle switch hitam "Tampilkan nomor WhatsApp ke pengguna lain" dengan teks bantuan abu-abu, field Email (hanya-baca, terikat Google SSO) berstatus disabled (abu-abu), tombol "Simpan Perubahan" hitam penuh di bawah. Font Plus Jakarta Sans, palet hitam-kuning.

### 5.19 Pengaturan (Settings)
**Elemen:**
- Grup "Tampilan": Tema aplikasi (Sistem/Terang/Gelap).
- Grup "Notifikasi & Privasi": Notifikasi push (toggle), Izin lokasi (toggle), Tampilkan nomor WhatsApp (toggle, default mati).
- Grup "Lainnya": Kebijakan privasi, Syarat & ketentuan, Versi aplikasi.

**Stitch prompt:** Buatkan layar pengaturan mobile app dengan grup-grup section: grup "Tampilan" (tema aplikasi dengan value+chevron kanan), grup "Notifikasi & privasi" (notifikasi push, izin lokasi, tampilkan nomor WhatsApp — masing-masing dengan toggle switch hitam), grup "Lainnya" (kebijakan privasi, syarat & ketentuan, versi aplikasi). Tiap grup berupa card putih dengan radius 12px di atas background abu muda. Font Plus Jakarta Sans, palet hitam-kuning.

---

## 6. SPESIFIKASI LAYAR — DASHBOARD ADMIN (WEB)
> Dashboard dibangun dengan **Filament**. Desain di bawah dipakai sebagai referensi tampilan dan tema (warna `primary` hitam/kuning, font Plus Jakarta Sans), bukan sebagai aplikasi web terpisah.

### 6.1 Login Admin
**Elemen:** card login di tengah layar (background hitam gradasi di sekelilingnya), logo, input Email & Password, tombol "Masuk sebagai Admin" hitam penuh.

**Stitch prompt:** Buatkan layar login admin web, background penuh hitam `#111111` dengan aksen bentuk geometris kuning tipis di sudut, card login putih di tengah (radius 16px, shadow lembut) berisi logo, field email, field password, tombol "Masuk sebagai Admin" hitam penuh. Font Plus Jakarta Sans.

### 6.2 Dashboard (Ringkasan)
**Elemen:**
- Sidebar kiri: menu (Dashboard, Laporan Hilang, Laporan Temuan, Claim, Pengguna, grup "Master Data" → Gedung), item aktif bg kuning muda + teks hitam bold.
- Topbar: judul halaman + avatar admin kanan.
- Grid 4 kartu statistik: Total Laporan Hari Ini, Laporan Pending, Claim Menunggu Verifikasi, Barang Telah Dikembalikan.
- Grafik tren laporan 7 hari terakhir (line/bar chart, warna hitam/kuning).
- Tabel "Laporan Terbaru" (5 baris) + tabel "Claim Menunggu" + link "Lihat semua".

**Stitch prompt:** Buatkan dashboard admin web untuk aplikasi lost & found kampus. Sidebar kiri gelap (hitam `#111111`) dengan menu Dashboard/Laporan Hilang/Laporan Temuan/Claim/Pengguna dan grup "Master Data" berisi Gedung, item aktif berbentuk pill background kuning `#F5C400` teks hitam. Area konten: topbar dengan judul "Dashboard" dan avatar admin kanan, grid 4 kartu statistik (angka besar + label), grafik bar/line tren 7 hari warna hitam dengan aksen kuning, tabel "Laporan Terbaru" dan tabel "Claim Menunggu" di bawahnya dengan kolom foto/nama/status/tanggal. Gaya bersih, flat, border tipis, tanpa shadow berat, palet hitam-kuning: primary hitam `#111111`, aksen kuning `#F5C400`, font Plus Jakarta Sans.

### 6.3 Daftar Laporan (Hilang & Temuan)
**Elemen:** tab "Hilang | Temuan"; search bar + filter (status, kategori, gedung, tanggal) di atas tabel; tabel kolom Foto/Kode/Nama Barang/Kategori/Gedung/Status (badge)/Pelapor/Tanggal/Aksi; aksi: Lihat Detail, Ubah Status, Hapus; pagination.

**Stitch prompt:** Buatkan halaman "Daftar Laporan" admin web, sidebar sama seperti dashboard, konten: tab "Hilang | Temuan" di atas, search bar dan filter dropdown (status, kategori, gedung, tanggal), tabel dengan kolom thumbnail foto, kode laporan, nama barang, kategori, gedung, badge status warna, nama pelapor, tanggal, dan kolom aksi berisi ikon mata (detail), ikon edit status, ikon hapus. Pagination di bawah tabel. Font Plus Jakarta Sans, palet hitam-kuning.

### 6.4 Detail Laporan (Admin)
**Elemen:** galeri foto, data lengkap (kode, nama, kategori, deskripsi, gedung + detail lokasi + peta, tanggal, data pelapor), badge status, tombol aksi: Ubah Status (dropdown), Hapus.

**Stitch prompt:** Buatkan halaman detail laporan admin web, dua kolom: kiri galeri foto besar, kanan data laporan (kode, nama barang, kategori, deskripsi, data pelapor, gedung dan peta kecil lokasi) dan badge status di atas. Di bawah, panel aksi dengan dropdown "Ubah Status" dan tombol teks "Hapus Laporan" warna merah. Font Plus Jakarta Sans, palet hitam-kuning.

### 6.5 Daftar Claim
**Elemen:** search + filter status claim; tabel kolom Foto Barang/Nama Barang/Nama Pengklaim/Tanggal Pengajuan/Status/Aksi (Lihat Detail, Terima, Tolak).

**Stitch prompt:** Buatkan halaman "Daftar Claim" admin web, tabel dengan kolom foto barang, nama barang, nama pengklaim, tanggal pengajuan, badge status (oranye=Menunggu, hijau=Diterima, merah=Ditolak), dan kolom aksi dengan tombol kecil "Terima" (hitam) dan "Tolak" (outline merah). Search bar dan filter status di atas tabel. Font Plus Jakarta Sans, palet hitam-kuning.

### 6.6 Detail Claim (Admin)
**Elemen:** dua panel berdampingan untuk perbandingan: kiri = laporan temuan (foto, deskripsi, gedung, tanggal, penemu); kanan = laporan hilang milik pengklaim (foto, deskripsi, gedung, tanggal) + data pengklaim (nama, email, NIM) dan alasan claim. Tombol: Terima Claim (hijau), Tolak Claim (merah, wajib catatan admin). Setelah claim diterima: tombol "Serahkan Barang" dengan upload foto bukti serah terima; setelah selesai tampil foto bukti, waktu serah terima, dan nama petugas. Admin tidak melihat isi chat.

**Stitch prompt:** Buatkan halaman detail claim admin web. Dua panel berdampingan: kiri "Laporan Temuan" (foto, deskripsi, gedung, tanggal, nama penemu), kanan "Laporan Hilang Pengklaim" (foto, deskripsi, gedung, tanggal) dengan di bawahnya data pengklaim (nama, email, NIM) dan alasan claim. Di bawah, tombol "Terima Claim" hijau penuh dan "Tolak Claim" outline merah (membuka field catatan admin wajib diisi). Tambahkan panel "Serah Terima" dengan area upload foto bukti dan tombol "Serahkan Barang". Font Plus Jakarta Sans, palet hitam-kuning, layout dua kolom agar admin mudah membandingkan kedua laporan.

### 6.7 Kelola Pengguna
**Elemen:** search + filter status akun; tabel kolom Nama/NIM/Email/Jumlah Laporan/Status Akun (Aktif/Diblokir)/Aksi (Blokir dengan alasan / Buka Blokir, Lihat Detail Aktivitas).

**Stitch prompt:** Buatkan halaman "Kelola Pengguna" admin web, tabel dengan kolom nama, NIM, email, jumlah laporan, badge status akun (hijau=Aktif, merah=Diblokir), dan tombol aksi "Blokir"/"Buka Blokir" serta ikon "Lihat Detail". Tombol "Blokir" membuka dialog dengan textarea alasan. Search bar dan filter status di atas tabel. Font Plus Jakarta Sans, palet hitam-kuning.

### 6.8 Master Gedung
**Elemen:** tabel gedung (Nama, Kode, Tipe [gedung/lab/bengkel/parkiran/fasilitas], Latitude, Longitude), search nama/kode, filter tipe, tombol "Tambah Gedung", ikon edit/hapus per baris; form tambah/edit: nama, kode, tipe, latitude, longitude, deskripsi, tombol "Simpan".

**Stitch prompt:** Buatkan halaman "Master Gedung" admin web, sidebar sama seperti dashboard dengan item Gedung aktif. Konten: search bar, filter dropdown tipe (Gedung/Lab/Bengkel/Parkiran/Fasilitas), tombol hitam "Tambah Gedung" di kanan atas, tabel dengan kolom nama, kode, badge tipe, latitude, longitude, dan ikon edit/hapus. Form tambah gedung tampil sebagai modal dengan field nama, kode, tipe (dropdown), latitude, longitude, deskripsi, dan tombol "Simpan" hitam penuh. Font Plus Jakarta Sans, palet hitam-kuning.

---

## 7. Referensi Modul (dari RPP)
1. Pengembangan Modul Login & Home
2. Pengembangan Modul Home
3. Pengembangan Modul Upload Foto, GPS, dan Claim
4. Laporan Hilang / Laporan Temuan
5. Pencarian & Filter
6. Sistem Claim
7. GPS
8. Kamera
9. Push Notifications (FCM)
10. Dashboard Admin

## 8. Catatan Teknis
- Frontend mobile: Flutter
- Backend: Laravel (REST API) + Laravel Sanctum
- Database: PostgreSQL (7 tabel: users, buildings, lost_reports, found_reports, claims, conversations, messages)
- Admin panel: Filament (terhubung ke Laravel, bukan langsung ke Flutter)
- Penyimpanan foto: Laravel Storage (disk public)
- Push notification: FCM (`firebase_messaging` + `kreait/laravel-firebase`)
- Chat real-time: Pusher (MVP) → Soketi
- Repository: GitHub (Private). Issue/Milestone Gitea tidak ikut dimigrasi; monitoring: belum ditentukan.

---
*Dokumen ini siap dipakai sebagai brief untuk generate di Google Stitch. Generate satu layar (atau beberapa layar sejenis) per prompt, pakai teks "Stitch prompt" di tiap section secara langsung, supaya hasilnya tidak terpotong dan konsisten antar layar.*
