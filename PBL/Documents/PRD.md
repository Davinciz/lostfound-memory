---
type: prd
project: lost-found
status: active
updated: 2026-10-13
summary: Kebutuhan Campus Lost&Found untuk pelaporan barang, pencarian, claim, dan autentikasi Google SSO
---

## 1. Product Overview
### 1.1 Latar Belakang
Layanan *lost and found* di kampus saat ini umumnya berjalan secara manual: mahasiswa menitipkan barang ke kantor keamanan / lingkar atau memposting di grup WhatsApp mahasiswa. Proses ini rapuh karena laporan tersebar di banyak saluran, tidak ada mekanisme *claim* terstruktur, tidak ada dokumentasi foto atau lokasi, dan mahasiswa yang mencari barang tidak memiliki cara sistematis untuk memfilter.
### 1.2 Visi
Menyediakan satu platform terpusat yang memungkinkan mahasiswa melaporkan barang hilang/ditemukan, sistem memfasilitasi pencarian, mahasiswa mengajukan claim dengan verifikasi via chat, dan admin kampus mengelola seluruh siklus dari satu dashboard.
### 1.3 Tujuan Utama
<table header-row="true">
<tr>
<td>No</td>
<td>Tujuan</td>
</tr>
<tr>
<td>1</td>
<td>Membuat sistem Lost & Found terpusat untuk lingkungan kampus</td>
</tr>
<tr>
<td>2</td>
<td>Mempermudah mahasiswa melaporkan barang hilang atau ditemukan</td>
</tr>
<tr>
<td>3</td>
<td>Mempermudah mahasiswa mencari barang</td>
</tr>
<tr>
<td>4</td>
<td>Menyediakan sistem claim untuk proses pengembalian barang</td>
</tr>
<tr>
<td>5</td>
<td>Menyediakan dashboard administrator</td>
</tr>
<tr>
<td>6</td>
<td>Memanfaatkan kamera, GPS, dan push notification pada perangkat mobile</td>
</tr>
<tr>
<td>7</td>
<td>Menerapkan arsitektur aplikasi mobile + REST API</td>
</tr>
</table>
---
## 2. User Personas
### 2.1 Mahasiswa Pemilik Barang Hilang (Lost Reporter)
- **Profil:** Mahasiswa aktif yang kehilangan barang di kampus
- **Kebutuhan:** Membuat laporan cepat, mencari barang di feed, mengajukan claim dengan verifikasi via chat
### 2.2 Mahasiswa Penemu Barang (Found Reporter)
- **Profil:** Mahasiswa yang menemukan barang orang lain
- **Kebutuhan:** Laporkan temuan dengan foto, lokasi, deskripsi; tahu cara mengembalikan
### 2.3 Dosen / Karyawan Kampus
- **Profil:** Dosen atau karyawan dengan akun Google pada domain Polines yang diizinkan.
- **Kebutuhan:** Menggunakan fitur laporan, pencarian, claim, chat, dan profil seperti pengguna mahasiswa.

### 2.4 Administrator Kampus
- **Profil:** Petugas keamanan / staf yang mengelola lost & found
- **Kebutuhan:** Dashboard terpusat — lihat semua laporan, verifikasi claim, update status, export data
---
## 3. Feature List
### A. Manajemen Laporan Hilang
- **Membuat laporan hilang** — judul, deskripsi, kategori, tanggal hilang, lokasi (pin di peta), foto (min 1, maks 3). Status: `pending` → `claimed` → `returned`/`closed`
- **Feed laporan hilang** — kartu/list dengan foto, judul, lokasi, waktu, badge status
### B. Manajemen Laporan Temuan
- **Membuat laporan ditemukan** — sama seperti hilang, dengan waktu ditemukan. Status: `pending` → `claimed` → `returned`/`closed`
### C. Pencarian & Filter
- Search kata kunci, filter: jenis, kategori, lokasi/area, rentang waktu, status
- Halaman detail laporan lengkap dengan foto, deskripsi, lokasi di peta, riwayat status
### D. Sistem Claim
- **Ajukan claim** — pemilik barang wajib punya laporan hilang, pilih laporan hilangnya, isi alasan claim. Sistem otomatis buat conversation antara pengklaim dan penemu untuk verifikasi kepemilikan via chat. Notifikasi ke penemu: "Ada claim baru, chat untuk verifikasi."
- **Verifikasi kepemilikan** — dilakukan via real-time chat antara penemu dan pengklaim. Penemu tanya detail yang tidak terlihat di foto. Admin tidak membaca chat.
- **Proses claim (admin)** — admin lihat foto, alasan claim, metadata. Admin trust bahwa penemu sudah verifikasi via chat. Aksi: terima (→ `accepted` + laporan jadi `claimed`), tolak (→ `rejected` + alasan). Notifikasi ke pemilik + penemu. Setelah admin terima, serah terima fisik → upload foto bukti → status `returned`.
### E. Integrasi WhatsApp
- **Chat via WhatsApp dari detail laporan** — tombol "Chat via WhatsApp" jika nomor WhatsApp reporter tersedia dan diizinkan, deep-link ke WhatsApp dengan pra-isi pesan
- **Visibilitas WhatsApp** — user bisa pilih "Tampilkan" / "Sembunyikan" nomor WhatsApp (default: sembunyikan)
- **Notifikasi via WhatsApp (opsional)** — notifikasi event penting (claim, dll.) via WhatsApp Business API sebagai complement FCM
### F. GPS
- Pilih lokasi lewat titik (pin) di peta, saran gedung terdekat sebagai daftar (maks 3, radius ~75m), detail lokasi opsional. Tombol "Lokasi saya" hanya menggeser peta ke posisi GPS, tidak menetapkan lokasi.
### F2. Kamera & Galeri
- Kamera (1 foto per tap) atau galeri (multi-pilih); total min 1, maks 3 foto; preview sebelum kirim; upload ke Laravel Storage saat submit
### G. Push Notifications (FCM)
- Notifikasi saat: claim diajukan, claim diproses (terima/tolak), barang diserahkan, pesan chat baru, update pada laporan milik user
- FCM token disimpan di DB saat login pertama; server-triggered via Firebase Admin SDK
### H. Autentikasi & Profil
- **Login:** Google SSO saja untuk user mobile; Flutter mengirim ID token ke `POST /api/auth/google`. Backend memverifikasi token, audience, `email_verified`, dan allowlist domain persis: `mhs.polines.ac.id`, `dsn.polines.ac.id`, `polines.ac.id` (lowercase + trim; subdomain ditolak).
- **User:** role `user` untuk mahasiswa, dosen, karyawan; role `admin` khusus admin. User baru dibuat otomatis, blocked ditolak 403 + `blocked_reason`, Sanctum token berlaku 7 hari. Admin Filament tetap memakai password.
- **Profil:** nama, NIM opsional (otomatis dari email mahasiswa bila pola cocok; sembunyikan jika kosong), email, foto, kontak WhatsApp opsional, riwayat laporan
### I. Dashboard Admin
- Ringkasan metrik (laporan hari ini, claim pending, trend 7 hari)
- List laporan + filter, detail laporan, foto, serta claims terkait; list claim pending dan detail claim (foto laporan hilang dan temuan sisi-by-sisi, metadata conversation tanpa isi chat, alasan)
- Kelola master data gedung dan user; admin dapat memblokir/membuka blokir user, tetapi tidak dapat memblokir admin atau dirinya sendiri
- Aksi claim: terima hanya claim `pending` bila laporan temuan belum `claimed`/`returned`/`closed`; tolak claim; serahkan barang setelah claim diterima
- Status laporan tidak berubah saat claim diajukan; setelah admin menerima claim, claim menjadi `accepted` dan laporan terkait menjadi `claimed`. Setelah serah terima, claim dan laporan menjadi `returned`
- Admin tidak membaca isi chat; verifikasi kepemilikan berlangsung antara pengklaim dan penemu.
---
## 4. User Flow
### 4.1 Melaporkan Barang Hilang
```javascript
Splash → Login → Home Feed → "Lapor Hilang" → Kamera/Foto → Detail Form → Validasi → Preview & Kirim → Upload Foto → POST API → Berhasil + Notifikasi
```
### 4.2 Mengajukan Claim
```javascript
Search → Cari Laporan → Lihat Detail → "Ajukan Claim" → Pilih Laporan Hilang + Alasan → Submit → Notifikasi ke Penemu → Admin Review → Admin Terima → Status claimed (laporan) + accepted (claim) → Serah Terima → Upload Foto Bukti → Status returned
```
### 4.3 Admin Proses Claim
```javascript
Web Admin → Dashboard → List Claim pending → Detail Claim → Review → Terima/Tolak → Update Status + FCM → Notifikasi ke Pemilik + Penemu
```
---
## 5. Data Model
```yaml
User: id(UUID), nim(unique, nullable), email(unique), name, whatsapp(nullable), wa_visible(boolean, default:false), blocked(boolean, default:false), blocked_reason(nullable), role[user|admin], password(nullable untuk user SSO; admin tetap memakai), fcm_token(nullable), email_verified_at(nullable), profile_image_url(nullable), created_at, updated_at

Building: id(UUID), name, code, type[gedung|lab|bengkel|parkiran|fasilitas], latitude(decimal 10,8), longitude(decimal 11,8), description(nullable), created_at, updated_at

LostReport: id(UUID), reporter_id→User, code(unique, LST-YYMMDD-XXXX), title, description, category[buku|elektronik|jaket_kemeja|dompet|aksesoris|alat_tulis|lainnya], lost_date(date), building_id→Building(nullable), latitude(decimal 10,8), longitude(decimal 11,8), location_name(nullable), photo_urls(json), status[pending|claimed|returned|closed], created_at, updated_at

FoundReport: id(UUID), reporter_id→User, code(unique, FND-YYMMDD-XXXX), title, description, category[same as LostReport], found_date(timestamp), building_id→Building(nullable), latitude(decimal 10,8), longitude(decimal 11,8), location_name(nullable), photo_urls(json), status[pending|claimed|returned|closed], created_at, updated_at

Claim: id(UUID), lost_report_id→LostReport(NOT NULL), found_report_id→FoundReport, claimant_id→User, status[pending|accepted|returned|rejected|withdrawn], reason(text), admin_note(nullable), proof_of_transfer_photo_url(nullable), transferred_at(nullable), transferred_by→User(nullable), created_at, updated_at

Conversation: id(UUID), user1_id→User, user2_id→User, lost_report_id→LostReport(nullable), found_report_id→FoundReport(nullable), claim_id→Claim(nullable), created_at, updated_at

Message: id(UUID), conversation_id→Conversation, sender_id→User, message(text), read_at(nullable), created_at, updated_at
```
**Catatan:** 
- 7 tabel utama: users, buildings, lost_reports, found_reports, claims, conversations, messages
- Role hanya `user` (mahasiswa, dosen, karyawan) dan `admin`; admin via seeder/Filament.
- NIM opsional + unique; mahasiswa dapat mengisinya otomatis dari pola email bila cocok. Panjang NIM masih perlu dikonfirmasi; login tidak bergantung pada NIM.
- User mobile masuk melalui Google SSO; email Google terverifikasi. Password nullable untuk user SSO, tetap diperlukan admin Filament.
- Status disimpan lowercase di database; label UI boleh kapital
- `claims.lost_report_id` NOT NULL — pemilik wajib punya laporan hilang sebelum bisa claim
- Verifikasi kepemilikan via chat (bukan pertanyaan keamanan); admin tidak membaca isi chat
- `withdrawn` disediakan di enum; belum ada aksi yang memakainya. Opsi masa depan: pengklaim membatalkan claim sendiri (butuh plan terpisah, belum disetujui)
---
## 6. REST API Design
Base URL: `https://api.kampus-lostfound.id/v1` (rencana domain; belum ada deployment)
<table header-row="true">
<tr>
<td>Method</td>
<td>Path</td>
<td>Auth</td>
</tr>
<tr>
<td>POST `/auth/google`</td>
<td>Verifikasi Google ID token dan terbitkan Sanctum token</td>
<td>-</td>
</tr>
<tr>
<td>GET `/users/me`</td>
<td>Profil user</td>
<td>Sanctum (Bearer token)</td>
</tr>
<tr>
<td>PUT `/users/me/fcm-token`</td>
<td>Update FCM token</td>
<td>Sanctum (Bearer token)</td>
</tr>
<tr>
<td>POST `/lost-reports`</td>
<td>Buat laporan hilang</td>
<td>Sanctum (Bearer token)</td>
</tr>
<tr>
<td>GET `/lost-reports`</td>
<td>List + filter</td>
<td>Sanctum (Bearer token)</td>
</tr>
<tr>
<td>GET `/lost-reports/:id`</td>
<td>Detail</td>
<td>Sanctum (Bearer token)</td>
</tr>
<tr>
<td>POST `/found-reports`</td>
<td>Buat laporan ditemukan</td>
<td>Sanctum (Bearer token)</td>
</tr>
<tr>
<td>GET `/found-reports`</td>
<td>List + filter</td>
<td>Sanctum (Bearer token)</td>
</tr>
<tr>
<td>GET `/found-reports/:id`</td>
<td>Detail</td>
<td>Sanctum (Bearer token)</td>
</tr>
<tr>
<td>GET `/search`</td>
<td>Search lintas laporan</td>
<td>Sanctum (Bearer token)</td>
</tr>
<tr>
<td>POST `/claims`</td>
<td>Ajukan claim</td>
<td>Sanctum (Bearer token)</td>
</tr>
<tr>
<td>GET `/claims`</td>
<td>List claim</td>
<td>Sanctum (Bearer token)</td>
</tr>
<tr>
<td>GET `/claims/:id`</td>
<td>Detail claim</td>
<td>Sanctum (Bearer token)</td>
</tr>
<tr>
<td>PATCH `/claims/:id`</td>
<td>Update (admin only) *(verifikasi ke routes aktual; kemungkinan tidak sinkron)*</td>
<td>Sanctum admin</td>
</tr>
<tr>
<td>GET `/admin/dashboard`</td>
<td>Metrik</td>
<td>Sanctum admin</td>
</tr>
<tr>
<td>GET `/admin/reports`</td>
<td>List laporan admin</td>
<td>Sanctum admin</td>
</tr>
<tr>
<td>GET `/admin/claims`</td>
<td>List claim admin</td>
<td>Sanctum admin</td>
</tr>
<tr>
<td>POST `/admin/claims/:id/accept`</td>
<td>Terima claim</td>
<td>Sanctum admin</td>
</tr>
<tr>
<td>POST `/admin/claims/:id/reject`</td>
<td>Tolak claim</td>
<td>Sanctum admin</td>
</tr>
<tr>
<td>GET `/buildings`</td>
<td>Daftar master gedung (marker peta + saran gedung)</td>
<td>Sanctum (Bearer token)</td>
</tr>
<tr>
<td>POST `/photos/upload`</td>
<td>Upload foto (jpg/jpeg/png/webp, maks 2 MB)</td>
<td>Sanctum (Bearer token)</td>
</tr>
<tr>
<td>POST `/photos/delete`</td>
<td>Hapus foto</td>
<td>Sanctum (Bearer token)</td>
</tr>
<tr>
<td>PATCH `/claims/:id/mark-transferred`</td>
<td>Tandai barang diserahkan (admin atau penemu)</td>
<td>Sanctum (Bearer token)</td>
</tr>
</table>
---
## 7. UI/UX Guidelines
**Mobile App — Bottom Navigation (5 tab):** Beranda, Cari, +Lapor (FAB tengah), Chat, Profil
**Warna:** Palet hitam-kuning — Primary hitam (#111111), aksen kuning (#F5C400); status: hijau untuk returned, oranye untuk pending, abu untuk closed.
**Screen List:** Splash, Login (Google SSO), Home Feed, Laporan Detail (Hilang/Ditemukan), Buat Laporan (2), Search & Filter, Chat, Profil, Dashboard Admin (web), Claim Detail Admin.
---
## 17. Glossary
<table header-row="true">
<tr>
<td>Istilah</td>
<td>Definisi</td>
</tr>
<tr>
<td>Lost Report</td>
<td>Laporan barang hilang oleh pemilik</td>
</tr>
<tr>
<td>Found Report</td>
<td>Laporan barang ditemukan oleh penemu</td>
</tr>
<tr>
<td>Claim</td>
<td>Permintaan pemilik barang untuk mengklaim barang ditemukan</td>
</tr>
<tr>
<td>WhatsApp Integration</td>
<td>Fitur yang memungkinkan pengguna terhubung via WhatsApp melalui deep-link dari aplikasi. Termasuk: tombol chat via WhatsApp di detail laporan, dan opsional: notifikasi via WhatsApp Business API.</td>
</tr>
<tr>
<td>FCM</td>
<td>Firebase Cloud Messaging — push notification Google</td>
</tr>
<tr>
<td>Admin</td>
<td>Peran yang bisa memproses claim & mengelola dashboard</td>
</tr>
</table>
---
## 18. Dokumentasi Terkait (Notion)
- Halaman ini: **Lost&Found — PRD**
- **Task Tracker** (akan dibuat): Notion Database untuk task tracking
- **API Documentation**: Swagger/OpenAPI
- **Design System / Wireframe**: Figma atau gambar desain
- **Release Notes**: Changelog tiap versi
---
*Dokumen ini akan diperbarui seiring perkembangan project.*