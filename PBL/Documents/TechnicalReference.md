---
type: technical
project: lost-found
status: active
updated: 2026-10-11
summary: Referensi teknis Flutter-Laravel dengan Google SSO aktif, stack terpasang, skema PostgreSQL, dan Filament.
---

> Dokumentasi teknis: arsitektur, ERD, migration, Filament resources, AI onboarding context.
---## 8. Technical Architecture
### 8.1 Diagram
```javascript
Mobile App (Flutter) ◄──HTTPS──► Laravel API (api.php) ◄──► PostgreSQL + Laravel Storage
     │                                              │
     │ FCM                                          │ FCM via kreait/laravel-firebase
     ▼                                              ▼
Firebase Cloud Messaging                         Firebase Admin SDK (server-side)
```
### 8.2 Komponen & Pemilihan Teknologi (Final)
<table header-row="true">
<tr>
<td>Komponen</td>
<td>Teknologi</td>
<td>Alasan</td>
</tr>
<tr>
<td>**Mobile Framework**</td>
<td>**Flutter** (Dart)</td>
<td>Cross-platform (iOS + Android), single codebase, akses GPS/kamera/push notification via Flutter plugins</td>
</tr>
<tr>
<td>**Map / Lokasi**</td>
<td>`location` / `flutter_location` • `flutter_map` + `latlong2` (OpenStreetMap)</td>
<td>Peta interaktif untuk pilih lokasi (pin), marker gedung, tombol "Lokasi saya" menggeser peta ke GPS</td>
</tr>
<tr>
<td>**Camera**</td>
<td>`camera` package (Flutter)</td>
<td>Akses kamera native dengan preview, didukung iOS & Android</td>
</tr>
<tr>
<td>**Push Notification**</td>
<td>Firebase Cloud Messaging (FCM) via `firebase_messaging`</td>
<td>Cross-platform, gratis, terintegrasi Firebase</td>
</tr>
<tr>
<td>**Backend API**</td>
<td>**Laravel** (PHP)</td>
<td>Ekosistem matang, REST API untuk mobile app</td>
</tr>
<tr>
<td>**Admin Dashboard**</td>
<td>**Laravel Filament**</td>
<td>Admin panel built-in dengan CRUD, tabel, form, filter — langsung dari Eloquent models</td>
</tr>
<tr>
<td>**Database**</td>
<td>**PostgreSQL**</td>
<td>Relasional, support PostGIS untuk spatial query (opsional)</td>
</tr>
<tr>
<td>**File Storage**</td>
<td>Laravel Storage (disk public)</td>
<td>Foto laporan disimpan di storage/app/public, symlink ke public/storage. Deployment: `php artisan storage:link` + folder writable.</td>
</tr>
<tr>
<td>**Auth**</td>
<td>Laravel Sanctum</td>
<td>Token-based API authentication</td>
</tr>
<tr>
<td>**Push SDK (Backend)**</td>
<td>`kreait/laravel-firebase` atau `kreait/firebase-php`</td>
<td>Mengirim notifikasi FCM dari Laravel</td>
</tr>
<tr>
<td>**Deployment**</td>
<td>Backend: Railway/Render/AWS; Mobile: Flutter build (APK/IPA)</td>
<td></td>
</tr>
</table>
### 8.3 Flow Notifikasi (FCM)
```javascript
1. Pengguna login pertama → Flutter app minta FCM token → dikirim ke /api/users/me/fcm-token (Laravel)
2. Laravel backend menyimpan FCM token di tabel users (kolom fcm_token)
3. Event trigger di Laravel (claim baru, matching ditemukan, claim diproses):
   a. Hitung daftar penerima notifikasi
   b. Kirim via Firebase Admin SDK (kreait/firebase-php)
   c. FCM mengirim ke perangkat pengguna
```
**Implementasi:**
- Flutter: `firebase_messaging` package untuk menerima notifikasi
- Laravel: `kreait/laravel-firebase` untuk mengirim notifikasi
- FCM token disimpan di kolom `fcm_token` di tabel `users`
---
## 9. Fitur GPS — Detail Teknis
- **Peta:** `flutter_map` + OpenStreetMap (sudah disetujui). Patuhi atribusi "© OpenStreetMap contributors" dan `userAgentPackageName` diisi. Tidak ada bulk download tile.
- **Permissions:** iOS `NSLocationWhenInUseUsageDescription` | Android `ACCESS_FINE_LOCATION` — hanya untuk tombol "Lokasi saya" yang menggeser peta.
- **Flow (2026-10-11):** peta terbuka di tengah kampus tanpa pin → user menaruh pin (tap di peta) → muncul daftar saran gedung (maks 3, radius ~75m, urut jarak, Haversine lokal di Flutter) → user klik untuk memilih gedung (opsional) → detail lokasi opsional → submit. Koordinat = titik pin yang dipilih user.
- **Tombol "Lokasi saya":** hanya menggeser peta ke posisi GPS device, **tidak menetapkan lokasi/pin**.
- **Marker gedung:** dari `GET /api/buildings`, tampil di peta. Tap marker = pilih gedung + taruh pin di koordinat gedung.
- **Validasi:** koordinat wajib (tidak boleh kosong atau 0,0). Backend menolak 0,0 dengan 422.
- ~~**Flow lama:** request permission → getCurrentPosition → tampilkan peta + pin → allow manual adjust → fallback daftar area kampus jika denied~~ — DICORET (2026-10-11).
---
## 10. Fitur Kamera — Detail Teknis
- **Permissions:** iOS `NSCameraUsageDescription` \| Android `CAMERA` + storage permission
- **Flow:** "Ambil Foto" → camera view → preview → retake/add (maks 3) → compress (max 2MB) → upload saat submit
---
## 11. Fitur Push Notification — Detail Teknis
- **Setup:** Firebase project → daftarkan iOS+Android → `google-services.json` / `GoogleService-Info.plist` → server: `kreait/laravel-firebase` + service account key
- **Notifikasi:** judul pendek + body deskriptif
- **Deep link:** ke halaman detail laporan/claim
---
## 12. Dashboard Admin — Rincian
- **Overview:** kartu metrik, tabel laporan terbaru, tabel claim pending
- **Laporan Admin:** filter status/kategori/tanggal/lokasi; kolom ID, pembuat, judul, kategori, lokasi, tanggal, status, aksi
- **Claim Admin:** filter status; tabel ID, pemilik, barang hilang, barang ditemukan, tanggal, status, aksi; detail view foto side-by-side + peta + alasan + catatan admin
- **Aksi:** Terima (→ `accepted` + laporan jadi `claimed` + notifikasi), Tolak (→ `rejected` + alasan + notifikasi), Batalkan (→ `withdrawn` + notifikasi). Setelah admin terima, serah terima fisik → upload foto bukti via markTransferred → `returned`.
---
## 13. Non-Functional Requirements
- **Performance:** feed \< 2 detik (3G), upload foto max 2MB (compressed), API response \< 500ms
- **Keamanan:** Sanctum token expiry 7 hari, HTTPS wajib, validasi input, rate limit, authorization check semua endpoint
- **Skalabilitas:** index category/status/lokasi, CDN untuk foto (optional), FCM multi-cast
- **Availability:** backend 99.5% uptime, mobile offline-tolerant (cache + queue)
---
## 13.1 Deployment Notes: Laravel Storage
**Setup Production:**
1. `php artisan storage:link` — buat symlink `public/storage` → `storage/app/public`
2. Set permission: `chmod -R 775 storage/`
3. Set `.env`:
   ```
   APP_URL=https://api.domain.com
   FILESYSTEM_DISK=public
   ```
4. Nginx/Apache: pastikan `public/storage` accessible
5. Backup: include folder `storage/app/public/reports/` di backup strategy

**File Structure:**
```
storage/app/public/reports/
  ├─ uuid-1.jpg
  ├─ uuid-2.jpg
  └─ ...
```

**Access URL:**
```
https://api.domain.com/storage/reports/uuid-1.jpg
```
---
## 14. Milestone & Roadmap
**Phase 1: MVP (4-6 minggu)** — Google SSO mobile + admin Filament ✓, CRUD laporan ✓ (kamera+GPS), feed ✓, search dasar ✓, FCM setup ✓, dashboard admin dasar ✓, Laravel Storage ✓
**Phase 2: Claim System (3-4 minggu)** — Fitur claim ✓ (partial), matching sederhana, dashboard claim admin ✓, notifikasi event claim (in progress)
**Phase 3: Polish (2-3 minggu)** — Peta detail, notifikasi smart (deep link), offline cache, export CSV, testing

**Status terkini (2026-10-10):**
- ✅ Google SSO backend dan Flutter selesai, merge ke `main`; login mahasiswa teruji di HP fisik. Open items: consent screen In production, konfirmasi pola email/panjang NIM, serta verifikasi domain lain bila belum.
- ✅ Database schema finalized (7 tabel, status lowercase, FK constraints)
- ✅ Status `returned` ditambahkan ke claims enum; alur: accepted → returned via markTransferred
- ✅ Laravel Storage photo upload (disk public, symlink, tested)
- ✅ Flutter mobile app: auth, create report (lost/found), upload 3 photos
- ✅ Backend API: LostReport, FoundReport, Claim CRUD; markTransferred endpoint
- ✅ Filament admin: LostReportResource, FoundReportResource, ClaimResource (View, Actions Terima/Tolak/Serahkan Barang), BuildingResource, UserResource
- ✅ Testing: 21/21 test passed (PHPUnit + Feature tests)
- 🔄 In progress: Real-time chat, buildings master data (tabel + gedung + GET /api/buildings sudah selesai; flow lokasi diubah ke peta + saran gedung lokal Flutter 2026-10-11, LocationService + POST /location/suggest dicoret)
---
## 15. Dependencies & Prasyarat
### 15.1 Stack Teknologi (Final)
<table header-row="true">
<tr>
<td>Komponen</td>
<td>Technology</td>
<td>Package/Tool</td>
<td>Notes</td>
</tr>
<tr>
<td>**Mobile App**</td>
<td>Flutter (Dart)</td>
<td>`flutter`, `google_sign_in ^7.2.0`, `camera`, `location`, `flutter_map` + `latlong2`, `firebase_messaging`, `http`/`dio`</td>
<td>Single codebase iOS + Android</td>
</tr>
<tr>
<td>**Admin Dashboard**</td>
<td>Laravel + Filament</td>
<td>`laravel/framework`, `filament/filament`</td>
<td>Admin panel built-in, CRUD otomatis dari Eloquent models</td>
</tr>
<tr>
<td>**Backend API**</td>
<td>Laravel (PHP)</td>
<td>`laravel/framework`, `laravel/sanctum`, `phpseclib/phpseclib 3.0.57`</td>
<td>REST API yang sama dengan yang dipakai Filament; phpseclib 3.x diperlukan Google token verification. `google/apiclient v2.20.1` dilaporkan terpasang user, tetapi tidak tercantum di composer.json/composer.lock yang diperiksa.</td>
</tr>
<tr>
<td>**Database**</td>
<td>PostgreSQL</td>
<td>`pgsql` extension, PostGIS (optional)</td>
<td>Relasional + support spatial query jika perlu</td>
</tr>
<tr>
<td>**Push Notification**</td>
<td>Firebase Cloud Messaging</td>
<td>`kreait/laravel-firebase` (PHP), `firebase_messaging` (Flutter)</td>
<td>Cross-platform</td>
</tr>
<tr>
<td>**File Storage**</td>
<td>Laravel Storage (disk public)</td>
<td>`league/flysystem` (Laravel)</td>
<td>Foto laporan: storage/app/public/reports/. Production: symlink + writable permission.</td>
</tr>
<tr>
<td>**Authentication**</td>
<td>Laravel Sanctum</td>
<td>`laravel/sanctum`</td>
<td>Token-based API auth</td>
</tr>
<tr>
<td>**Testing**</td>
<td>PHPUnit / Flutter Test</td>
<td>`phpunit/phpunit`, `flutter_test`</td>
<td>Unit test backend + widget test mobile</td>
</tr>
</table>
### 15.2 Akun & Layanan yang Dibutuhkan
- [x] **Firebase project** — untuk FCM push notification + konfigurasi mobile app
	- Download `google-services.json` (Android) dan `GoogleService-Info.plist` (iOS)
	- Aktifkan Firebase Cloud Messaging
	- **Status:** Project `lostfound-mobile` aktif, FCM configured
- [x] **PostgreSQL database** — instance yang bisa diakses dari Laravel app
	- Local: Docker postgres atau install native
	- Production: Railway, Render, AWS RDS, atau Supabase
	- **Status:** Database dev + testing (`lostfound_testing`) running
- [x] **Storage** — untuk foto laporan
	- Development: storage lokal (`storage/app/public`)
	- Production: Laravel Storage (disk public, symlink `php artisan storage:link` + writable permission)
	- **Status:** Laravel Storage (disk public) active, symlink created
- [ ] **Domain / Hosting** — untuk Laravel API (dan Filament admin)
	- Pilihan: Railway, Render, Heroku, VPS, atau cloud provider lain
	- Butuh HTTPS untuk production
- [ ] **Environment variables** (Laravel `.env`):
	```javascript
DB_CONNECTION=pgsql
DB_HOST=...
DB_DATABASE=...
DB_USERNAME=...
DB_PASSWORD=...

FCM_CREDENTIALS=... (path ke service account key JSON, atau JSON string)
GOOGLE_CLIENT_ID=... (OAuth Web client ID; simpan hanya di environment, jangan di dokumen nilai aktual)

APP_URL=https://api.domain.com

Throttle POST /api/auth/google: 30 permintaan/menit per IP.
	```
### 15.3 Struktur Repository
Project memakai dua repository terpisah, bukan monorepo:

- **Flutter mobile:** `C:\Project\mobile-lostfound`
- **Laravel API + Filament admin:** `D:\PBL\lostfound`
- Dokumentasi proyek disimpan di vault Obsidian, `PBL/Documents/`.

Struktur direktori internal mengikuti struktur standar Flutter dan Laravel masing-masing repository.
### 15.4 Filament Admin — Screen & Fitur
Filament akan digunakan untuk dashboard admin dengan fitur:
- **Dashboard Page** — ringkasan metrik (total laporan hari ini, claim pending, chart tren 7 hari)
- **LostReportResource** — CRUD laporan hilang dengan tabel, filter, status update
- **FoundReportResource** — CRUD laporan ditemukan dengan tabel, filter, status update
- **ClaimResource** — tabel claim pending dengan aksi terima/tolak/batalkan (menggunakan Filament Actions)
- **UserResource** — manage user (admin only)
**Filament Tabel Kolom yang Disarankan:**
*LostReportResource:*
- ID, Judul, Kategori, Lokasi, Lat/Long, Status, Pembuat (relation ke User), Foto (preview), Tanggal dibuat, Aksi (lihat detail)
*ClaimResource:*
- ID, Pemilik (User), Barang Hilang (LostReport relation), Barang Temuan (FoundReport relation), Alasan Claim, Status, Tanggal Claim, Aksi (Terima/Tolak/Batalkan)
### 15.5 Integrasi Kampus (optional, future)
- [x] Google SSO kampus diterapkan 2026-10-10; detail implementasi tercatat di DailyChanges 2026-10-10.
- [ ] API data kampus (nama area/faculty, jadwal kelas untuk konteks lokasi)
### 15.6 Tim & Resource
- [x] 1 Flutter developer (mobile app)
- [x] 1 Laravel developer (backend API + Filament admin)
- [ ] 1 UI/UX designer (atau menggunakan template/design system)
- [ ] 1 admin/koordinator kampus sebagai stakeholder & tester
---
## 15.7 ERD (Entity Relationship Diagram)

### Diagram Hubungan Antar Tabel

Lihat [[ERD]] atau `PBL/Documents/ERD.md` untuk detail lengkap.

### Detail Tabel

Sistem menggunakan 7 tabel utama: `users`, `buildings`, `lost_reports`, `found_reports`, `claims`, `conversations`, `messages`.

#### 1. `users`
<table header-row="true">
<tr>
<td>Kolom</td>
<td>Tipe</td>
<td>Keterangan</td>
</tr>
<tr>
<td>`id`</td>
<td>UUID (PK)</td>
<td>Primary key, di-generate otomatis</td>
</tr>
<tr>
<td>`email`</td>
<td>String (unique)</td>
<td>Email Google pada domain `mhs.polines.ac.id`, `dsn.polines.ac.id`, atau `polines.ac.id` — digunakan untuk login</td>
</tr>
<tr>
<td>`nim`</td>
<td>String (unique, nullable)</td>
<td>Opsional + unique; otomatis dari pola email mahasiswa bila cocok; jika kosong tetap dapat login</td>
</tr>
<tr>
<td>`role`</td>
<td>Enum (`user`, `admin`)</td>
<td>Default: `user` (mahasiswa/dosen/karyawan); admin via seeder/Filament</td>
</tr>
<tr>
<td>`password`</td>
<td>String (nullable)</td>
<td>Null untuk user SSO; password tetap dipakai admin Filament</td>
</tr>
<tr>
<td>`whatsapp`</td>
<td>String (nullable)</td>
<td>Nomor WhatsApp user</td>
</tr>
<tr>
<td>`wa_visible`</td>
<td>Boolean</td>
<td>Default false; kontrol visibilitas WhatsApp</td>
</tr>
<tr>
<td>`blocked`</td>
<td>Boolean</td>
<td>Default false; akun diblokir (Security Hardening)</td>
</tr>
<tr>
<td>`blocked_reason`</td>
<td>String (nullable)</td>
<td>Alasan blokir</td>
</tr>
<tr>
<td>`fcm_token`</td>
<td>String (nullable)</td>
<td>Firebase Cloud Messaging token, di-update saat login</td>
</tr>
<tr>
<td>`email_verified_at`</td>
<td>Timestamp (nullable)</td>
<td>Waktu email terverifikasi (Google SSO); nilai nullable</td>
</tr>
<tr>
<td>`profile_image_url`</td>
<td>String (nullable)</td>
<td>URL foto profil</td>
</tr>
<tr>
<td>`created_at`</td>
<td>Timestamp</td>
<td>Waktu dibuat</td>
</tr>
<tr>
<td>`updated_at`</td>
<td>Timestamp</td>
<td>Waktu diperbarui</td>
</tr>
</table>
**Index:** `nim` (unique), `role`, `fcm_token`
---
#### 2. `lost_reports`
<table header-row="true">
<tr>
<td>Kolom</td>
<td>Tipe</td>
<td>Keterangan</td>
</tr>
<tr>
<td>`id`</td>
<td>UUID (PK)</td>
<td>Primary key</td>
</tr>
<tr>
<td>`reporter_id`</td>
<td>UUID (FK → [users.id](http://users.id))</td>
<td>User yang melaporkan barang hilang</td>
</tr>
<tr>
<td>`title`</td>
<td>String</td>
<td>Judul laporan</td>
</tr>
<tr>
<td>`description`</td>
<td>Text</td>
<td>Deskripsi detail barang</td>
</tr>
<tr>
<td>`category`</td>
<td>Enum</td>
<td>Kategori: buku, elektronik, jaket_kemeja, dompet, aksesoris, alat_tulis, lainnya</td>
</tr>
<tr>
<td>`lost_date`</td>
<td>Date</td>
<td>Tanggal barang hilang</td>
</tr>
<tr>
<td>`latitude`</td>
<td>Decimal(10,8)</td>
<td>Koordinat titik yang dipilih user di peta (bukan GPS otomatis, bukan koordinat gedung)</td>
</tr>
<tr>
<td>`longitude`</td>
<td>Decimal(11,8)</td>
<td>Koordinat titik yang dipilih user di peta</td>
</tr>
<tr>
<td>`location_name`</td>
<td>String (nullable)</td>
<td>Aturan (2026-10-11): gedung + detail → "Nama Gedung, detail"; gedung saja → "Nama Gedung"; tanpa gedung + detail → detail; tanpa gedung + detail kosong → "Titik di peta (area luar gedung)"</td>
</tr>
<tr>
<td>`photo_urls`</td>
<td>JSON</td>
<td>Array URL foto (min 1, maks 3)</td>
</tr>
<tr>
<td>`status`</td>
<td>Enum</td>
<td>pending, claimed, returned, closed</td>
</tr>
<tr>
<td>`code`</td>
<td>String (unique)</td>
<td>Kode laporan mudah dibaca, format LST-YYMMDD-XXXX</td>
</tr>
<tr>
<td>`building_id`</td>
<td>UUID (FK → buildings.id, nullable)</td>
<td>Gedung dipilih user dari daftar saran (bukan auto-detect). Hanya mengisi building_id dan location_name, tidak menimpa koordinat.</td>
</tr>
<tr>
<td>`created_at`</td>
<td>Timestamp</td>
<td>Waktu dibuat</td>
</tr>
<tr>
<td>`updated_at`</td>
<td>Timestamp</td>
<td>Waktu diperbarui</td>
</tr>
</table>
**Index:** `reporter_id`, `category`, `status`, `building_id`
---
#### 3. `found_reports`
<table header-row="true">
<tr>
<td>Kolom</td>
<td>Tipe</td>
<td>Keterangan</td>
</tr>
<tr>
<td>`id`</td>
<td>UUID (PK)</td>
<td>Primary key</td>
</tr>
<tr>
<td>`reporter_id`</td>
<td>UUID (FK → [users.id](http://users.id))</td>
<td>User yang melaporkan barang ditemukan</td>
</tr>
<tr>
<td>`title`</td>
<td>String</td>
<td>Judul laporan</td>
</tr>
<tr>
<td>`description`</td>
<td>Text</td>
<td>Deskripsi detail barang</td>
</tr>
<tr>
<td>`category`</td>
<td>Enum</td>
<td>Kategori (sama seperti lost_reports)</td>
</tr>
<tr>
<td>`found_date`</td>
<td>Timestamp</td>
<td>Waktu/date barang ditemukan</td>
</tr>
<tr>
<td>`latitude`</td>
<td>Decimal(10,8)</td>
<td>Koordinat titik yang dipilih user di peta (bukan GPS otomatis, bukan koordinat gedung)</td>
</tr>
<tr>
<td>`longitude`</td>
<td>Decimal(11,8)</td>
<td>Koordinat titik yang dipilih user di peta</td>
</tr>
<tr>
<td>`location_name`</td>
<td>String (nullable)</td>
<td>Aturan (2026-10-11): gedung + detail → "Nama Gedung, detail"; gedung saja → "Nama Gedung"; tanpa gedung + detail → detail; tanpa gedung + detail kosong → "Titik di peta (area luar gedung)"</td>
</tr>
<tr>
<td>`photo_urls`</td>
<td>JSON</td>
<td>Array URL foto (min 1, maks 3)</td>
</tr>
<tr>
<td>`status`</td>
<td>Enum</td>
<td>pending, claimed, returned, closed</td>
</tr>
<tr>
<td>`code`</td>
<td>String (unique)</td>
<td>Kode laporan mudah dibaca, format FND-YYMMDD-XXXX</td>
</tr>
<tr>
<td>`building_id`</td>
<td>UUID (FK → buildings.id, nullable)</td>
<td>Gedung dipilih user dari daftar saran (bukan auto-detect). Hanya mengisi building_id dan location_name, tidak menimpa koordinat.</td>
</tr>
<tr>
<td>`created_at`</td>
<td>Timestamp</td>
<td>Waktu dibuat</td>
</tr>
<tr>
<td>`updated_at`</td>
<td>Timestamp</td>
<td>Waktu diperbarui</td>
</tr>
</table>
**Index:** `reporter_id`, `category`, `status`, `building_id`
---
#### 4. `claims`
<table header-row="true">
<tr>
<td>Kolom</td>
<td>Tipe</td>
<td>Keterangan</td>
</tr>
<tr>
<td>`id`</td>
<td>UUID (PK)</td>
<td>Primary key</td>
</tr>
<tr>
<td>`lost_report_id`</td>
<td>UUID (FK → lost_[reports.id](http://reports.id))</td>
<td>Laporan barang hilang yang diklaim (NOT NULL, claimant wajib punya laporan hilang)</td>
</tr>
<tr>
<td>`found_report_id`</td>
<td>UUID (FK → found_[reports.id](http://reports.id))</td>
<td>Laporan barang ditemukan yang diklaim</td>
</tr>
<tr>
<td>`claimant_id`</td>
<td>UUID (FK → [users.id](http://users.id))</td>
<td>User yang mengajukan claim (pemilik barang)</td>
</tr>
<tr>
<td>`status`</td>
<td>Enum</td>
<td>pending, accepted, returned, rejected, withdrawn</td>
</tr>
<tr>
<td>`reason`</td>
<td>Text</td>
<td>Alasan mengapa claimant mengklaim barang ini</td>
</tr>
<tr>
<td>`admin_note`</td>
<td>Text (nullable)</td>
<td>Catatan admin saat memproses claim</td>
</tr>
<tr>
<td>`proof_of_transfer_photo_url`</td>
<td>String (nullable)</td>
<td>Foto bukti serah terima</td>
</tr>
<tr>
<td>`transferred_at`</td>
<td>Timestamp (nullable)</td>
<td>Waktu barang diserahkan</td>
</tr>
<tr>
<td>`transferred_by`</td>
<td>UUID (FK → users.id, nullable)</td>
<td>Admin/penemu yang menyerahkan barang</td>
</tr>
<tr>
<td>`created_at`</td>
<td>Timestamp</td>
<td>Waktu dibuat</td>
</tr>
<tr>
<td>`updated_at`</td>
<td>Timestamp</td>
<td>Waktu diperbarui</td>
</tr>
</table>
**Index:** `lost_report_id`, `found_report_id`, `claimant_id`, `status`

**Catatan:** Verifikasi kepemilikan dilakukan via real-time chat antara penemu dan pengklaim (conversation auto-created saat claim dibuat), bukan pertanyaan keamanan. Admin tidak membaca isi chat.
---
#### 2. `buildings`

Master data gedung kampus untuk fitur pilih lokasi di peta dan saran gedung terdekat.

**Kolom:** id (UUID PK), name, code, type (default gedung), latitude (decimal 10,8), longitude (decimal 11,8), description (text nullable), timestamps

**Index:** type, composite (latitude, longitude)

---
#### 3. `conversations`

Ruang chat antara dua user, terkait claim atau laporan.

**Kolom:** id (UUID PK), user1_id, user2_id (FK users), lost_report_id (nullable FK), found_report_id (nullable FK), claim_id (nullable FK), timestamps

**Index:** claim_id, user1_id, user2_id

---
#### 4. `messages`

Pesan individual dalam conversation.

**Kolom:** id (UUID PK), conversation_id (FK), sender_id (FK users), message (text), read_at (nullable timestamp), timestamps

**Index:** conversation_id, created_at, sender_id

---
### Relasi & Constraint
```javascript
users 1 ──── N lost_reports  (satu user bisa membuat banyak laporan hilang)
users 1 ──── N found_reports (satu user bisa membuat banyak laporan ditemukan)
users 1 ──── N claims        (satu user bisa mengajukan banyak claim)

lost_reports 1 ──── N claims    (satu laporan hilang bisa diklaim lebih dari 1 kali)
found_reports 1 ──── N claims   (satu laporan ditemukan bisa diklaim lebih dari 1 kali)
```
**Business Rules:**
1. `lost_reports.status`: pending → claimed → returned / closed
2. `found_reports.status`: pending → claimed → returned / closed
3. `claims.status`: pending → accepted → returned / rejected / withdrawn
4. Claim `accepted`: admin setujui → laporan lost & found jadi `claimed`
5. Claim `returned`: barang diserahkan via markTransferred → laporan jadi `returned`
---
### Migration Skrip (Laravel)
```php
// Migration Google SSO diterapkan 2026-10-10: password nullable; role student -> user, default user, check constraint role disesuaikan bila ada; NIM tetap nullable + unique.
// Implementasi role user menggantikan student dilaporkan selesai dan merge ke main.
// users table
Schema::create('users', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('email')->unique(); // Email Google pada domain `mhs.polines.ac.id`, `dsn.polines.ac.id`, atau `polines.ac.id`
    $table->string('nim')->unique()->nullable(); // Opsional + unique; otomatis dari email mahasiswa jika pola cocok
    $table->string('name');
    $table->string('whatsapp')->nullable();
    $table->boolean('wa_visible')->default(false);
    $table->boolean('blocked')->default(false);
    $table->string('blocked_reason')->nullable();
    $table->enum('role', ['user', 'admin'])->default('user'); // user = mahasiswa, dosen, karyawan
    $table->string('password')->nullable(); // nullable untuk user SSO; admin tetap memakai password
    $table->string('fcm_token')->nullable();
    $table->timestamp('email_verified_at')->nullable(); // Google SSO; email_verified_at dapat diisi setelah token Google diverifikasi
    $table->string('profile_image_url')->nullable();
    $table->timestamps();
    $table->index('nim');
    $table->index('role');
    $table->index('email_verified_at');
});

// lost_reports table
Schema::create('lost_reports', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('reporter_id');
    $table->string('title');
    $table->text('description');
    $table->enum('category', ['buku', 'elektronik', 'jaket_kemeja', 'dompet', 'aksesoris', 'alat_tulis', 'lainnya']);
    $table->date('lost_date');
    $table->decimal('latitude', 10, 8);
    $table->decimal('longitude', 11, 8);
    $table->string('location_name')->nullable();
    $table->json('photo_urls');
    $table->enum('status', ['pending', 'claimed', 'returned', 'closed'])->default('pending');
    $table->timestamps();
    $table->foreign('reporter_id')->references('id')->on('users')->onDelete('cascade');
    $table->index('category');
    $table->index('status');
});

// found_reports table
Schema::create('found_reports', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('reporter_id');
    $table->string('title');
    $table->text('description');
    $table->enum('category', ['buku', 'elektronik', 'jaket_kemeja', 'dompet', 'aksesoris', 'alat_tulis', 'lainnya']);
    $table->timestamp('found_date');
    $table->decimal('latitude', 10, 8);
    $table->decimal('longitude', 11, 8);
    $table->string('location_name')->nullable();
    $table->json('photo_urls');
    $table->enum('status', ['pending', 'claimed', 'returned', 'closed'])->default('pending');
    $table->timestamps();
    $table->foreign('reporter_id')->references('id')->on('users')->onDelete('cascade');
    $table->index('category');
    $table->index('status');
});

// claims table
Schema::create('claims', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('lost_report_id'); // NOT NULL - claimant wajib punya laporan hilang
    $table->uuid('found_report_id');
    $table->uuid('claimant_id');
    $table->enum('status', ['pending', 'accepted', 'returned', 'rejected', 'withdrawn'])->default('pending');
    $table->text('reason');
    $table->text('admin_note')->nullable();
    $table->string('proof_of_transfer_photo_url', 500)->nullable();
    $table->timestamp('transferred_at')->nullable();
    $table->uuid('transferred_by')->nullable();
    $table->timestamps();
    $table->foreign('lost_report_id')->references('id')->on('lost_reports')->onDelete('cascade');
    $table->foreign('found_report_id')->references('id')->on('found_reports')->onDelete('cascade');
    $table->foreign('claimant_id')->references('id')->on('users')->onDelete('cascade');
    $table->foreign('transferred_by')->references('id')->on('users')->onDelete('set null');
    $table->index('status');
});

// matching_recommendations table - DEPRECATED, tidak lagi digunakan
// Sistem matching otomatis diganti dengan alur claim manual + chat verifikasi
```
---
## 15.8 Filament Resources — Mapping ke ERD
### LostReportResource
- Tabel laporan memuat kode, judul, kategori, lokasi, status, pelapor, thumbnail foto, dan tanggal; filter gedung/tanggal tersedia.
- Halaman View menampilkan detail laporan dan foto; RelationManager menampilkan claims terkait.
- Aksi admin tidak mengubah status saat claim diajukan. Laporan hanya berubah menjadi `claimed` setelah claim diterima admin.
### FoundReportResource
- Tabel laporan memuat kode, judul, kategori, lokasi, status, pelapor, thumbnail foto, dan tanggal; filter gedung/tanggal tersedia.
- Halaman View menampilkan detail laporan dan foto; RelationManager menampilkan claims terkait.
- Status disimpan lowercase: `pending`, `claimed`, `returned`, `closed`.
### ClaimResource
- Detail menampilkan foto laporan hilang dan temuan berdampingan, metadata conversation tanpa isi chat, serta bukti serah terima saat status `returned`.
- **Terima:** hanya untuk claim `pending`; claim menjadi `accepted` dan laporan terkait menjadi `claimed`. Aksi diblokir jika laporan temuan sudah `claimed`, `returned`, atau `closed`.
- **Tolak:** claim menjadi `rejected`, dengan catatan admin bila diberikan.
- **Serahkan Barang:** untuk claim `accepted`; setelah serah terima, claim dan laporan menjadi `returned`.
- Admin tidak membaca isi chat; verifikasi kepemilikan berlangsung antara pengklaim dan penemu.
### BuildingResource
- Resource master data gedung untuk mengelola daftar gedung kampus.
### UserResource
- Resource pengelolaan user; admin dapat memblokir dan membuka blokir akun.
- Admin tidak dapat memblokir akun admin atau akunnya sendiri.
---
## 16. AI / Developer Onboarding Context
*(Bagian ini khusus agar AI atau developer baru dapat langsung paham konteks project saat membaca PRD ini)*
### Ringkasan Eksekutif
**Apa yang dibangun?**
Lost & Found adalah aplikasi mobile (Flutter) + web dashboard admin (Laravel Filament) untuk memudahkan mahasiswa melaporkan, mencari, dan mengembalikan barang hilang/ditemukan di lingkungan kampus.
**Siapa yang menggunakan?**
1. **User** (mahasiswa, dosen, karyawan) — melaporkan barang hilang/ditemukan, mencari barang, mengajukan claim; login Google SSO dengan domain Polines yang diizinkan
2. **Admin kampus** — memproses claim (terima/tolak), mengelola seluruh data dari dashboard Filament
**Alur Utama:**
1. User A kehilangan jaket → masuk dengan Google SSO → buka Flutter app → "Lapor Hilang" → foto + GPS + deskripsi → kirim ke Laravel API
2. User B menemukan jaket → masuk dengan Google SSO → buka Flutter app → "Lapor Temuan" → foto + GPS + deskripsi → kirim
3. Mahasiswa A lihat laporan temuan → ajukan claim (wajib pilih laporan hilangnya) → chat otomatis dengan penemu → penemu verifikasi kepemilikan via chat
4. Admin di Filament dashboard lihat claim pending → review foto + lokasi → terima/tolak claim → notifikasi ke kedua pihak (FCM)
5. Setelah admin terima, koordinasi serah terima → upload foto bukti → status jadi `returned`
**Tech Stack Final:**
- **Mobile:** Flutter (Dart) — `google_sign_in ^7.2.0`, `camera`, `location`, `flutter_map` + `latlong2` (peta OSM), `firebase_messaging`, `dio`/`http`, `url_launcher` (untuk WhatsApp deep-link)
- **Backend + Admin:** Laravel (PHP) — REST API (`api.php`) + Filament admin (`web.php`)
- **Database:** PostgreSQL
- **Push Notification:** FCM via `kreait/laravel-firebase` (backend) + `firebase_messaging` (Flutter)
- **WhatsApp Integration:** Deep-link via `url_launcher` (Flutter), opsional: WhatsApp Business API via `kreait/laravel-firebase` atau Meta API
- **Storage:** Laravel Storage (disk public)
**Model Data Utama:**
- `User` — role `user` untuk mahasiswa/dosen/karyawan, `admin` untuk administrator. Mobile login Google SSO pada domain `mhs.polines.ac.id`, `dsn.polines.ac.id`, `polines.ac.id`; NIM opsional; password nullable untuk user SSO dan tetap dipakai admin; punya `fcm_token`, `email_verified_at`, `blocked`
- `LostReport` — laporan barang hilang (dibuat pemilik) — status: pending → claimed → returned/closed
- `FoundReport` — laporan barang ditemukan (dibuat penemu) — status: pending → claimed → returned/closed
- `Claim` — pengajuan pemilik ke barang ditemukan — status: pending → accepted → returned / rejected / withdrawn
**Endpoint API Penting:**
- `POST /api/auth/google` — verifikasi Google ID token, audience, email_verified, dan allowlist domain di backend; tolak blocked (403 + blocked_reason); terbitkan Sanctum token 7 hari
- `POST /api/lost-reports` — buat laporan hilang (file upload foto + GPS data)
- `POST /api/found-reports` — buat laporan ditemukan
- `POST /api/claims` — ajukan claim (dengan alasan)
- `PATCH /api/claims/{id}` — admin proses claim (terima/tolak) — perlu admin role
- `GET /api/admin/*` — endpoint admin
**Point Penting yang Perlu Diingat:**
- Auth mobile: Google SSO, domain persis `mhs.polines.ac.id`, `dsn.polines.ac.id`, `polines.ac.id` setelah lowercase + trim; subdomain ditolak. Validasi backend wajib. Role `user | admin`; NIM opsional, password nullable untuk user SSO; Sanctum token 7 hari. Admin Filament tetap memakai password.
- GPS: pilih lokasi lewat titik (pin) di peta (`flutter_map` + OSM), saran gedung terdekat sebagai daftar (Haversine lokal Flutter), tombol "Lokasi saya" hanya menggeser peta ke posisi GPS
- Kamera: min 1 foto, maks 3 foto, kompresi max 2MB per foto sebelum upload
- FCM: token harus disimpan di database saat login pertama, bukan saat install app
- WhatsApp: nomor WhatsApp hanya ditampilkan jika user mengizinkan (wa_visible=true). Deep-link WhatsApp digunakan untuk chat langsung.
- Admin: hanya role `admin` yang bisa akses endpoint admin dan Filament dashboard; admin tidak baca isi chat
- Filament: digunakan khusus untuk admin dashboard web, bukan replacement untuk mobile app
- Google OAuth client Web digunakan sebagai audience ID token; client Android memerlukan SHA-1 tiap mesin developer. Jangan simpan credential di dokumen.
---