---
type: technical
project: lost-found
status: active
updated: 2026-11-12
summary: Referensi teknis lengkap Lost&Found; endpoint, autentikasi, storage, skema, Filament, chat realtime, baseUrl dart-define & kebijakan logging mobile. Backend claim langsung: Phase 1a PR #6 d1ef1eb, Phase 1b-i PR #7 cdae742, Fase 1.2 PR #11 18c85d4. Flutter claim langsung Phase 2: PR #12 cdc223e (Ajax-261030-03) — redirect dihapus, dropdown opsional, model nullable, error 422 Indonesia, 139 test lulus. Logo baru: PR #11 f800d75 mobile (Ajax-261030-02), varian gelap & backend belum. Bug chat realtime: Ajax-261030-04 fa0af4d+427b6e7 (setState arrow → block). Lainnya: fix transfer FCM v8, auto-logout 401, whereUuid 404, forceScheme https. 2026-11-01 (GPT-261101-05, f3b730d): HTTP 500 claim = resolusi Messaging Firebase di constructor → best-effort; markTransferred = admin/claimant/penerima; FCM dua arah; §11.3 multipart POST+_method=PATCH (mobile PR #16 a8b951d). 2026-11-01 (Ajax-261101-07, 0769600 / PR #17 f67e7617c6): crash native SecurityException ACCESS_FINE_LOCATION saat tutup form (user tanpa izin lokasi) — LocationService.dispose() jadi no-op, plugin location hanya via tombol "Lokasi saya" (§9, §17 (h)). 2026-11-01 (Dominic-261101-11): fitur Arsip & Hapus Chat — §15.7 conversations +4 kolom timestamp nullable (2026_11_01_103035), §16 endpoint archive/unarchive/delete + filter archived/is_archived + 409 claim aktif + penyaring deleted_at, §17 (j)/(k); backend adcd1ee & Flutter 6528324 sudah merge (fitur belum penuh). 2026-11-04 (Dominic-261104-07): push notification MVP Opsi A selesai & diterima sementara — backend PR #24/25/27, Flutter PR #21/22 merge develop; keenam type payload (claim_new/accepted/rejected/withdrawn/returned/chat); PushNotificationService terpusat sinkron best-effort; FcmService guard per sesi, foreground banner, logout deduplikasi PUT+DELETE; uji manual "sebagian besar berhasil", rincian belum lengkap; PUT/DELETE /api/users/me/fcm-token; layar Notifikasi empty state; §11 §16 §17 (l)/(m)/(n). 2026-11-06 (Dominic-261106-02): fix `9feb665` merge `develop` — §16 daftar chat: chat terhapus MUNCUL KEMBALI bila ada pesan `created_at > deleted_at` (scope `visibleTo` lama tidak lagi mengecualikan kolom hapus terisi); N+1 `GET /api/conversations` diperbaiki lewat subquery (7→4 dan 23→4, tetap 4); `unread_count` integer; ConversationArchiveTest 25 lulus, suite penuh 365 lulus, tanpa perubahan skema; §17 (m) test gagal & N+1 ditandai SELESAI + (m.1) risiko subquery/lingkungan PostgreSQL. 2026-11-07 (Dominic-261107-04): catat merge tiga PR (backend AGENTS.md `chore/repo/agents-md-context` `61d6bda`; mobile AGENTS.md `chore/repo/agents-md-context` `ceb86b6`; mobile `fix/ui/settings-wa-visibility-test` `030138a`+`852ca61`) — hash branch, bukan squash `develop`; AGENTS.md kini ada di kedua repo (backend: konteks di luar blok Boost; mobile: baru, docs/ di-ignore) §15.3; §11.2 koreksi ApiClient: 9 layar/widget Provider, tersisa 4 implementasi `ApiClient()` langsung; regresi test Pengaturan SELESAI (penyebab redesign UI v3, fixer/label usang, bukan bug fitur) + baseline mobile baru analyze 6 issue / test 247 lulus 0 gagal; §17 (o.1)–(o.4) sisa warn/info test, uji HP Pengaturan belum, RPP.md sebut MySQL. 2026-11-08 (Dominic-261108-01): fitur WhatsApp — backend merge develop PR #30 squash c760ef2 (saring 5 field user di 19 endpoint via Controller::hideUserContactFields), PR #31 merge commit df5e22ed17 (PUT /api/users/me/whatsapp + PUT /api/users/me/wa-visibility), PR #32 merge commit 6f8b43d4b5 (validasi body-only, respons = GET /users/me, 422 Indonesia, tes regresi query string); review mobile feat/profile/whatsapp bc8f2add8b BELUM SIAP; Dokploy auto-deploy develop (PR #30/#31/#32 live, commit terakhir 6f8b43d4b5), auto-deploy dimatikan user 2026-11-08; keputusan final nomor hanya ke lawan claim setelah accepted + wa_visible; uji HP belum; baseline backend 395 lulus/1.672 assertion, mobile 247/4/0; §16 endpoint WA + penyaringan PR #30, §17 (p.1)–(p.11).; 2026-11-12 (Dominic-261112-01): §16 koreksi — kartu `report_context` mobile SUDAH merge `develop` (hash/PR tidak diketahui), pesan baru langsung masuk tanpa refresh terkonfirmasi; §17 (q.0)–(q.8): read-only chat + user terblokir belum, read receipt/mark-read massal, typing indicator (butuh client events Pusher), status kirim, badge unread disetujui backlog belum dikerjakan, quick reply ditunda, throttle chat usulan, banner tips dibatalkan; 2026-11-12 (Dominic-261112-02): dikoreksi — chat read-only + user terblokir KINI DIJADWALKAN (Tugas 1 backend 422+reason+can_send/readonly_reason, Tugas 2 Flutter), quick reply DIKERJAKAN (Tugas 6); 8 tugas brief [[Brief Pengembangan Real-Time Chat - Lost&Found]] dijadwalkan & belum dikerjakan (tim user), prasyarat: 4 asumsi §10 brief menunggu konfirmasi user + Client Events Pusher belum aktif (§17 q.9–q.11); **2026-11-12 (Dominic-261112-03): 4 asumsi §10 brief TERKONFIRMASI user — chat tanpa claim tetap terbuka, read-only HANYA claim `rejected`/`withdrawn`, `returned` TETAP TERBUKA, penolakan 422 + `reason` (`claim_closed`|`user_blocked`), hanya pengirim terblokir dibatasi; Tugas 1 boleh dimulai (belum dikerjakan). ~~Masih terbuka: Client Events Pusher belum aktif (Tugas 7) + urutan brief vs WhatsApp (§17 q.10).~~ **2026-11-12 (Dominic-261112-05): urutan DIPUTUSKAN — Tugas 1/3/8 boleh mulai, Tugas 2/4/5/6/7 menunggu WhatsApp D merge; Client Events Pusher diputuskan diaktifkan, belum dilakukan (§17 q.11/q.12).**
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
> Chat real-time: Pusher (MVP) → Soketi — **Fase 1 backend SELESAI** (API + broadcasting + index, merge `develop` 2026-10-18); UI Flutter & integrasi claim belum.
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
<td>**Camera & Galeri**</td>
<td>`image_picker` (kamera + galeri)</td>
<td>Kamera 1 foto per tap + galeri multi-pilih. Package `camera` kemungkinan tidak terpakai, jangan dihapus tanpa pengecekan.</td>
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
<td>**Chat real-time**</td>
<td>Pusher (MVP) → Soketi</td>
<td>RENCANA, belum diimplementasi</td>
</tr>
<tr>
<td>**Deployment**</td>
<td>Backend: Dokploy (VPS) via Cloudflare Tunnel; Mobile: Flutter build (APK/IPA)</td>
<td>Backend ter-deploy 2026-10-27 di `https://lostandfound.nandasaptra.my.id`</td>
</tr>
</table>
### 8.3 Flow Notifikasi (FCM)
```javascript
1. Pengguna login pertama → Flutter app minta FCM token → dikirim ke /api/users/me/fcm-token (Laravel)
2. Laravel backend menyimpan FCM token di tabel users (kolom fcm_token)
3. Event trigger di Laravel (pesan chat baru, claim diterima/ditolak, barang diserahkan):
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
- **Pemakaian plugin `location` (2026-11-01, Ajax-261101-07):** plugin `location` **hanya** disentuh saat user menekan tombol **"Lokasi saya"** (`getCurrentLocation`, yang cek izin dulu). **`dispose()` harus no-op** — jangan memanggil `Location.changeSettings()`/API plugin di `dispose()`. `LocationService.dispose()` dulu memanggil `Location.changeSettings()`; plugin memicu `startRequestingLocation` async yang mendaftarkan NMEA listener **tanpa cek izin** → `SecurityException` **native** yang tidak tertangkap `try/catch` Dart, crash tepat setelah form laporan ditutup (user tanpa izin lokasi). Diperbaiki `lib/services/location_service.dart` (branch `fix/map/location-dispose-crash`, commit `0769600`, merge `develop` PR #17 `f67e7617c6`). Lihat §17.
---
## 10. Fitur Kamera — Detail Teknis
- **Permissions:** iOS `NSCameraUsageDescription` + `NSPhotoLibraryUsageDescription` \| Android `CAMERA`. Android 13+ memakai Photo Picker, jadi tidak perlu izin storage.
- **Flow:** bottom sheet pilihan **Kamera / Galeri** → kamera: 1 foto per tap; galeri: multi-pilih sampai sisa slot (total maks 3, min 1) → preview → kompres (resize 1920px, JPEG kualitas 85) → upload ke `POST /api/photos/upload` (jpg/jpeg/png/webp, maks 2 MB) sebelum create report.
---
## 11. Fitur Push Notification — Detail Teknis
- **Setup:** Firebase project → daftarkan iOS+Android → `google-services.json` / `GoogleService-Info.plist` → server: `kreait/laravel-firebase` + service account key
- **Notifikasi:** judul pendek + body deskriptif
- **Deep link:** ke halaman detail laporan/claim
- **Sejak 2026-11-01 (fix HTTP 500 claim, `f3b730d`):** resolusi `Messaging` best-effort (lihat §11) — kegagalan konfigurasi Firebase tidak lagi menggagalkan request claim. **Konfirmasi manual user 2026-11-01:** aksi claim sudah berhasil setelah konfigurasi Dokploy/Firebase ditindaklanjuti; upload foto serah terima Flutter di-merge ke `develop` (PR #16, `a8b951d`) dan dinyatakan berhasil diuji user. Uji FCM nyata per perangkat tetap belum dilakukan. Lihat §11.3.
- **Status implementasi (2026-10-18, diverifikasi ulang 2026-10-25):** token disimpan via `PUT /users/me/fcm-token`; pengiriman FCM ada di `ClaimTransferService::notifyClaimant` (barang diserahkan) dan `ClaimNotificationService` (accept/reject oleh penerima → pengaju; withdraw oleh pengaju → penerima). **Sejak 2026-10-25:** keduanya memakai API v8 `kreait/firebase-php 8.5.0` (`CloudMessage::new()->withToken()`; `withTarget` sudah dihapus) dan kegagalan kirim **dicatat `Log::warning`** (dulu ditelan tanpa log) — **token FCM diredaksi** dari pesan exception sebelum masuk log (audit Bob-03: tidak ada API FCM usang di `app/`; `routes/`, `database/`, `config/firebase.php` bersih; Filament `ClaimResource`/`UserResource` memakai `Notification::make()` milik Filament, bukan FCM; `AdminController` tidak mengirim FCM). **Sejak 2026-10-25 (Bob-05):** helper `app/Services/DeadFcmTokenCleaner.php` dipakai kedua jalur — `NotFound`/`SenderIdMismatch` (token permanen mati) → `users.fcm_token` di-NULL **hanya bila token di DB masih sama** dengan token yang gagal (token yang baru di-refresh aman); `ServerUnavailable`/error lain → token tetap, tetap `Log::warning`, request tetap 2xx. **Retry/backoff untuk `ServerUnavailable` SENGAJA tidak dibuat** (keputusan 2026-10-25). **Belum ada:** push claim diajukan, push pesan chat + deep link, daftar notifikasi (tidak ada endpoint/tabel). Rencana & opsi A/B ada di [[Push Notification - Lost&Found]].
- **Sejak 2026-11-01 (fix HTTP 500 claim, commit `f3b730d`, branch `fix/claim/withdraw-500-transfer-policy`; **sudah merge `develop`, dikonfirmasi user 2026-11-01**):** pembuatan client Messaging dipindah dari **constructor** ke **dalam try/catch pengiriman** (`ClaimNotificationService` untuk accept/reject/withdraw; `ClaimTransferService` untuk serah terima) — kegagalan resolusi client (mis. konfigurasi Firebase salah) kini **best-effort** seperti kegagalan `send`, tidak lagi menggagalkan request sebelum action/transaksi berjalan (dulu → HTTP 500). 284 test lulus (filter Claim 159). **Konfigurasi:** `config/firebase.php` `default => env('FIREBASE_PROJECT', 'app')` — `FIREBASE_PROJECT` adalah **pemilih key konfigurasi Laravel**, bukan Firebase `project_id`; backend butuh **Firebase Admin SDK Service Account** (file di-mount, lihat §13.2), **bukan** `google-services.json` Android.
- **2026-11-04 — implementasi MVP Opsi A selesai & diterima sementara:** user memutuskan **Opsi A** (FCM saja, tanpa tabel/endpoint notifikasi) di [[Push Notification - Lost&Found]] — tetap **7 tabel**, tidak ada perubahan skema. **Backend GPT-261104-02/04/05 (PR #24 `fdd9952`, #25 `459f969`, #27 `6f45cbf`)** dan **Flutter GPT-261104-03/06 (PR #21 `50ce102`, #22 `6fe1330`)** — **sudah merge develop**. **Keenam type payload:** `claim_new`, `claim_accepted`, `claim_rejected`, `claim_withdrawn`, `claim_returned`, `chat`; `claim_*` membawa `claim_id`, `chat` membawa `conversation_id` (semua string). **Backend:** `PushNotificationService` terpusat sinkron best-effort; claim baru → penerima, accepted/rejected → pengaju, withdrawn → penerima, returned → lawan pihak transfer, chat → lawan bicara. **Flutter:** `FcmService` lifecycle guard per sesi, izin sekali, token refresh, keenam type handled; claim → detail, chat dicari daftar lalu fallback tab; foreground banner ~4s tanpa navigasi otomatis, suppress chat aktif; logout dideduplikasi: PUT lalu conditional DELETE kredensial lama, budget 5s, kegagalan tidak gagalkan logout lokal. **Verifikasi:** 219+247 test Flutter lulus, 349+361 test backend lulus (1 gagal baseline chat), PM review 54 Flutter+route backend lulus. **Uji manual user 2026-11-04:** Firebase Console → HP berhasil; 2 akun/2 HP **"sebagian besar sudah berhasil, untuk sekarang sudah aman"**; **rincian skenario belum lengkap** (tidak ada daftar gagal/belum diuji). **Diterima sementara untuk penggunaan/pengujian saat ini, bukan audit keamanan menyeluruh**. Endpoint token: `PUT /api/users/me/fcm-token` (transaksi hapus token user lain), `DELETE /api/users/me/fcm-token` (conditional, body `fcm_token` wajib string, 204 untuk cocok/null/mismatch). Layar Notifikasi tetap empty state (sesuai Opsi A). **Terbuka:** rincian checklist manual, race PUT paralel, logout offline/timeout, iOS/multi-device, test `ConversationArchiveTest` gagal, scheduler Dokploy ditunda, #6 status belum diverifikasi.
---

## 11.1 Fitur Riwayat Laporan (MyReportsScreen) — Detail Teknis

Ditulis untuk **Backlog Item 5 (Riwayat Laporan Saya di Tab Profil)**, selesai 2026-10-16 (Flutter; branch `feature/my-reports-history`, **merge ke `main` sudah**).

- **ApiClient:** `ApiClient.getLostReports()` & `getFoundReports()` menerima parameter opsional `mine` (default `false`); bila `mine=true` mengirim `mine=1`. Perilaku tanpa `mine` tidak berubah. Menggunakan endpoint backend Item 3 (sudah selesai).
- **Layarku:** `lib/screens/profil/my_reports_screen.dart` — dua tab (**Hilang** | **Temuan**), pagination (`load more`), pull-to-refresh, kartu berisi foto + judul + kode + tanggal + badge status; tap kartu membuka layar detail yang sudah ada; state kosong "Belum ada laporan" dan state error.
- **profilScreen.dart:** tile "Riwayat Laporan" kini membuka `MyReportsScreen`.
- **Bug perbaikan saat tes HP:**
  1. Crash `LocaleDataException` (DateFormat locale `'id_ID'` belum diinisialisasi) → `await initializeDateFormatting('id_ID')` di `main.dart` sebelum `runApp`.
  2. Kartu menampilkan UUID, bukan kode laporan → model `LostReport` & `FoundReport` kini punya field `code` (nullable, di-parse dari `json['code']`, **tidak ikut `toJson`** karena kode dibuat backend) +4 test parsing code.
  3. Tanggal bisa mundur sehari (API mengirim UTC) → `.toLocal()` pada tanggal di kartu.
  4. Layar detail tampil **bar bawah** (Chat WhatsApp / "Ini laporan Anda" yang terpotong) untuk pemilik laporan → untuk pemilik, **bar bawah** disembunyikan di `lost_report_detail_screen.dart` & `found_report_detail_screen.dart`, diganti chip kecil "Laporan Anda" di samping `StatusBadge`. Bukan pemilik: perilaku tidak berubah.
- **Status:** ✅ Selesai (2026-10-16). Lihat [[Backlog Perbaikan Lanjutan - Lost&Found]] Item 5, DailyChanges 2026-10-16, Progres.

### 11.2 Konfigurasi ApiClient Mobile — `baseUrl` & Logging (2026-10-19)

Sumber: E-2 ([[Backlog UI Redesign - Lost&Found]]), PR #4 branch `chore/repo/client-config-hardening`, **merge `develop`** repo `lostfound-mobile` 2026-10-19 (squash).

- **`baseUrl` via `--dart-define`:** `flutter run --dart-define=API_BASE_URL=http://<host>:8000/api`. Nilai default lama tetap dipakai sebagai **fallback** bila `--dart-define` tidak diberikan, sehingga build dev tanpa flag tidak berubah perilaku. Tidak ada file konfigurasi/secret baru.
- **Kebijakan logging `LogInterceptor`:**
  - Aktif **hanya** di `kDebugMode`; build release/profile tidak mencetak apa pun.
  - Header request/respons **tidak** dicetak (termasuk `Authorization`).
  - Body request/respons **tidak** dicetak (`requestBody = false`, `responseBody = false` — diverifikasi).
  - Ini menutup Backlog open item (xiii) dan catatan keamanan [[Security Hardening - Lost&Found]] §5.2.
- **`print` → `debugPrint`:** diterapkan di `main.dart`, `fcm_service.dart`, `upload_service.dart` (Backlog (vii)).
- **`baseUrl` default = URL produksi (2026-10-27, merge `develop` PR #9 squash `b1e8823`):** `lib/api/api_client.dart` default `https://lostandfound.nandasaptra.my.id/api`; `dart_defines.json` masuk `.gitignore`; `dart_defines.example.json` berisi placeholder. Sumber: [[R-261027-02-default-api-base-url]].
- **Auto-logout saat 401 (2026-10-27, merge `develop` PR #10 squash `0a2af4c`):** `AuthInterceptor` menangkap 401 non-login → hapus sesi → navigasi ke `AuthScreen` sekali (guard `_isHandling401` static, direset di `googleLogin`). File: `api_client.dart`, `main.dart` (`navigatorKey` + `_handleSessionExpired` + SnackBar), `auth_provider.dart` (`forceLogout`), `test/auth_interceptor_401_test.dart` (6 test). Sumber: [[R-261027-03-handle-401-logout]]. Uji manual di HP **belum**.
- **Catatan:** `ApiClient` diambil via Provider baru di `settings_screen` dan `edit_profile_screen` (E-1). **Diperbarui 2026-11-07 (sisa E-1 mengecil):** kini **9 layar/widget memakai Provider** — `HomeScreen`, `SearchScreen`, `ChatScreen`, `ConversationListScreen`, `ClaimScreen`, `ClaimDetailScreen`, `MyClaimsScreen`, `EditProfileScreen`, `SettingsScreen`; `LocationPickerSection` juga membaca Provider (widget, dihitung terpisah). **Tinggal 4 implementasi** yang masih membuat `ApiClient()` langsung: `MainTabScreen`, `MyReportsScreen`, `ReportFormScreen`, `ReportDetailView`. Form dan detail lost/found memakai implementasi bersama. Sumber: laporan [[GPT-261107-02-agents-md-mobile]]. **Teks lama (tidak berlaku, sebagai riwayat):** ~~Di **11 layar lain** masih `ApiClient()` per layar — sisa pekerjaan, belum ada Plan.~~

### 11.3 Upload Foto Serah Terima — Multipart Method Override (2026-11-01)

Sumber: laporan [[GPT-261101-05-fix-upload-foto-serah-terima]]; branch `fix/claim/transfer-photo-upload` (commit `5849cb9`), **merge `develop` PR #16 squash `a8b951d`**.

- **Masalah:** `ApiClient::markTransferred` mengirim multipart lewat **PATCH langsung**; pada stack PHP 8.3 (Dockerfile backend) Symfony `HttpFoundation` tidak mem-parsing multipart PATCH menjadi file → `proof_photo` tidak terbaca → server balas **422**. Reproduksi HTTP nyata: multipart PATCH → `has_proof_photo=false`; multipart POST + `_method=PATCH` → `has_proof_photo=true`.
- **Perbaikan (Flutter):** `markTransferred` mengirim **POST multipart** ke URL yang sama dengan field teks **`_method=PATCH`** dan **tepat satu** file `proof_photo`. **Metode efektif/route Laravel tetap `PATCH`** — bukan route POST baru.
- **Pesan validasi foto dibedakan** di `lib/utils/api_error.dart`: foto belum diterima (`required`), upload gagal, gambar/format tidak didukung, ukuran maksimal 5 MB (sebelumnya semua 422 foto dilabeli format/ukuran).
- **Test:** transport HTTP loopback nyata (`test/claim_transfer_http_test.dart`) + kontrak `test/claim_user_actions_test.dart`; suite mobile **188 lulus, 4 skipped**; `dart analyze` file berubah bersih (8 temuan lama di test lain tetap ada).
- **Konfirmasi manual user 2026-11-01:** uji upload serah terima dinyatakan berhasil setelah merge; agen tidak membangun/memasang APK, jadi hasil manual dicatat dari pernyataan user (bukan semua kombinasi galeri/kamera/peran diuji).

---
## 12. Dashboard Admin — Rincian

> [!warning] Akan berubah
> Peran admin berubah di [[Claim Dua Arah dan Serah Terima oleh Pengguna - Lost&Found]]: dari gerbang wajib menjadi pemantau & penengah. Penemu verifikasi lewat tombol "Cocok" di chat, user sendiri yang serah terima dengan foto bukti.
>
> **Revisi 2026-10-19 — BERLAKU sejak 2026-10-23:** claim tidak lagi wajib punya laporan sendiri; detail claim admin tahan `lost_report_id`/`found_report_id` NULL (as-built: `AdminController` NULL-safe, aksi Filament `ClaimResource` NULL-safe, otorisasi `ClaimPolicy` berbasis penerima laporan target). Sumber tunggal: [[Claim Langsung ke Laporan Target - Lost&Found]].

- **Overview:** kartu metrik, tabel laporan terbaru, tabel claim pending
- **Laporan Admin:** filter status/kategori/tanggal/lokasi; kolom ID, pembuat, judul, kategori, lokasi, tanggal, status, aksi
- **Claim Admin:** filter status; tabel ID, pemilik, barang hilang, barang ditemukan, tanggal, status, aksi; detail view foto side-by-side + peta + alasan + catatan admin
- **Aksi:** Terima (→ `accepted` + laporan **terisi** jadi `claimed` + notifikasi), Tolak (→ `rejected` + alasan + notifikasi) — logika terpusat di `ClaimDecisionService` (dipakai `AdminController` dan aksi Filament `ClaimResource`). Setelah admin terima, serah terima fisik → upload foto bukti via `markTransferred` → `returned`. Sisi laporan yang NULL dilewati.
- **Sejak 2026-10-25 (fix transfer claim, sudah merge `develop`):** `markTransferred` menjalankan guard status `accepted` **di dalam** `DB::transaction` dengan `lockForUpdate` (urutan lock claim → laporan hilang → laporan temuan), menyimpan foto bukti **setelah** guard lolos, dan notifikasi serah terima memakai API FCM v8 (`CloudMessage::new()->withToken()`); kegagalan kirim dicatat `Log::warning`.
- **Sejak 2026-11-01 (`f3b730d`):** `ClaimPolicy::markTransferred` kini **admin ATAU claimant (pengaju) ATAU penerima** (sebelumnya admin + penerima saja — selaras dengan plan [[Claim Dua Arah dan Serah Terima oleh Pengguna - Lost&Found]] §4/§8). FCM serah terima dua arah: **claimant menekan → penerima**, **penerima menekan → claimant**, **admin tetap ke claimant**; resolusi Messaging best-effort (lihat §11). Foto `proof_photo` tetap wajib, status harus `accepted`. Tidak ada perubahan skema/status.
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

> **Catatan (2026-10-14):** DB menyimpan **path relatif** (`reports/uuid-1.jpg`), bukan URL absolut. URL di atas dibangun di response API dari `APP_URL` + `/storage/` + path (lewat accessor model). Ganti IP/domain cukup ubah `APP_URL`, tanpa migrasi data.

### 13.2 Deployment Aktual (2026-10-27)

**Platform:** Dokploy (VPS teman), diakses via Cloudflare Tunnel di `https://lostandfound.nandasaptra.my.id`.

**Container:** php:8.3-fpm-alpine + nginx + supervisor, satu container, port 80, HEALTHCHECK `/up`.

**Database:** PostgreSQL internal Dokploy (diimpor dari dump 2026-10-26).

**Storage:** Volume persisten `lostfound-storage` di `/var/www/html/storage/app/public`. `entrypoint.sh` menjalankan `storage:link --force` dan `chown -R www-data:www-data storage` tiap startup.

**Firebase:** Service account di-mount sebagai file Dokploy di `/etc/lostfound/firebase-service-account.json`; env `FIREBASE_CREDENTIALS` menunjuk ke path itu. **Klarifikasi 2026-11-01:** yang wajib adalah **file Service Account Firebase Admin SDK** (bukan `google-services.json` Android). `FIREBASE_PROJECT` (default `app` di `config/firebase.php`) adalah **pemilih key konfigurasi Laravel**, bukan `project_id` Firebase — jangan disamakan dengan nama Firebase project.

**`APP_URL`:** Wajib `https://lostandfound.nandasaptra.my.id` (menentukan URL foto). `trustProxies('*')` aktif untuk Cloudflare. **Sejak 2026-10-27 (merge `develop` PR #18 squash `afd5cd2`):** `AppServiceProvider::boot()` memaksa `URL::forceScheme('https')` bila `config('app.url')` berawalan `https://` — memperbaiki aset/URL Filament yang masih `http`. Test: `tests/Unit/ForceHttpsSchemeTest.php`. Sumber: [[R-261027-05-force-https-urls]].

**Branch:** `chore/repo/dockerize` merge `develop` (squash). Dockerfile: [[Bob-261026-01-dockerize-backend]], [[Bob-261026-02-fix-dockerfile-libpq]].

**Flutter:** Butuh `--dart-define API_BASE_URL=https://lostandfound.nandasaptra.my.id/api` dan `GOOGLE_SERVER_CLIENT_ID` (nilai tidak dicatat). Token lama dari server lokal → 401 sampai data app dihapus dan login ulang.

**Foto lama:** Tidak dimigrasi; laporan testing dihapus via Filament.
---
## 14. Milestone & Roadmap
**Phase 1: MVP (4-6 minggu)** — Google SSO mobile + admin Filament ✓, CRUD laporan ✓ (kamera/galeri + pin peta), feed ✓, search dasar ✓, FCM setup ✓, dashboard admin dasar ✓, Laravel Storage ✓
**Phase 2: Claim System (3-4 minggu)** — Fitur claim ✓ (partial), chat verifikasi (in progress), dashboard claim admin ✓, notifikasi event claim (in progress)
**Phase 3: Polish (2-3 minggu)** — Peta detail, notifikasi smart (deep link), offline cache, export CSV, testing

**Status terkini (2026-10-12):**
- ✅ Google SSO backend dan Flutter selesai, merge ke `main`; login mahasiswa teruji di HP fisik. Open items: consent screen In production, konfirmasi pola email/panjang NIM, serta verifikasi domain lain bila belum.
- ✅ Database schema finalized (7 tabel, status lowercase, FK constraints)
- ✅ Status `returned` ditambahkan ke claims enum; alur: accepted → returned via markTransferred
- ✅ Laravel Storage photo upload (disk public, symlink, tested)
- ✅ Flutter mobile app: auth, create report (lost/found), upload 3 photos
- ✅ Backend API: LostReport, FoundReport, Claim CRUD; markTransferred endpoint
- ✅ Filament admin: LostReportResource, FoundReportResource, ClaimResource (View, Actions Terima/Tolak/Serahkan Barang), BuildingResource, UserResource
- ✅ Testing: backend 67 test lulus, Flutter `geo_utils` 46 test (laporan agent, log 2026-10-11)
- ✅ Buildings master data selesai: tabel + seeder, `GET /api/buildings`, Filament, flow peta ter-merge 2026-10-11. Sisa: pembersihan data buildings via Filament.
- 🔄 Real-time chat: tabel `conversations`/`messages` sudah ada di DB; Model, API, Pusher, UI belum.
- ✅ Repo dipindah ke Gitea kampus: `git.informatikapolines.id/Daniel_Geovani/lostfound-backend` dan `lostfound-mobile` (HTTPS). GitHub remote "github" masih ada lokal, akan dihapus. Key Firebase dirotasi 2026-10-12 (tanpa detail key).
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
<td>`laravel/framework`, `laravel/sanctum`, `phpseclib/phpseclib 3.0.57`, `pusher/pusher-php-server`</td>
<td>REST API yang sama dengan yang dipakai Filament; phpseclib 3.x diperlukan Google token verification. `google/apiclient v2.20.1` dilaporkan terpasang user, tetapi tidak tercantum di composer.json/composer.lock yang diperiksa. `pusher/pusher-php-server` ditambahkan untuk broadcasting chat (Real-Time Chat Fase 1, 2026-10-18).</td>
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

**Versi terpasang (dilaporkan user, 2026-10-13):** Laravel **v13.32.0**, Filament **3.3.55**. Kompatibilitas keduanya diverifikasi di Open Items (§17).

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

FIREBASE_CREDENTIALS=... (path ke service account key JSON, atau JSON string; sesuai `config/firebase.php`)
GOOGLE_CLIENT_ID=... (OAuth Web client ID; simpan hanya di environment, jangan di dokumen nilai aktual)
GOOGLE_DEV_EMAILS=... (daftar email dev dipisah koma; HANYA nama variabel — jangan tulis nilainya di dokumen)

APP_URL=https://api.domain.com
	```

Catatan: Throttle `POST /api/auth/google` — 30 permintaan/menit per IP.

**Catatan `APP_URL` (2026-10-14):** `APP_URL` menentukan URL foto lengkap di response API. DB menyimpan path relatif; accessor model membentuk `APP_URL` + `/storage/` + path. Jadi pindah IP/domain cukup ubah `APP_URL`, tanpa mengubah isi DB.

**Catatan `GOOGLE_DEV_EMAILS` (2026-10-14, diluruskan 2026-10-15):** hanya **nama variabel**; nilainya tidak ditulis di dokumen. Dibaca `AuthController` untuk melonggarkan cek **domain** bila `app()->environment('production')` bernilai false. Verifikasi token, audience, `email_verified`, blocked, dan throttle tetap berlaku. **Normalisasi daftar (trim, lowercase, buang entri kosong) ternyata sudah ada sejak awal** di `config/services.php` dan `AuthController`; sesi 2026-10-15 hanya menambah 4 test. Pembatasan ke `local`/`testing` masih ditunda — lihat Open Items §17.

**Catatan Cache `photo-owner` (2026-10-15):** kepemilikan foto ([[Backlog Perbaikan Lanjutan - Lost&Found]] Item 9) disimpan di Cache, **bukan** kolom/tabel DB. Key `photo-owner:{path}` → `user_id`, TTL 24 jam; `CACHE_STORE` harus `database` (bukan `array`/`file` yang hilang antar-proses) agar cek kepemilikan saat delete konsisten. Implikasi: setelah TTL lewat, foto lama tidak lagi dikenali sebagai milik user → delete mengembalikan `403` (lihat Open Items §17: usulan job pembersih foto yatim).
### 15.3 Struktur Repository & Alur Git
Project memakai dua repository terpisah, bukan monorepo:

- **Flutter mobile:** `C:\Project\lostfound-mobile` (Gitea: `git.informatikapolines.id/Daniel_Geovani/lostfound-mobile`, Private, HTTPS). Remote lokal `github` sudah dihapus 2026-10-17; origin wajib HTTPS.
- **Laravel API + Filament admin:** `C:\Project\lostfound-backend` (Gitea: `git.informatikapolines.id/Daniel_Geovani/lostfound-backend`, Private, HTTPS). Remote lokal `github` sudah dihapus 2026-10-17; origin wajib HTTPS.
- Dokumentasi proyek disimpan di vault Obsidian, `PBL/Documents/`.

Struktur direktori internal mengikuti struktur standar Flutter dan Laravel masing-masing repository.

#### Alur Git: GitFlow-lite
- **main** = stabil, hanya menerima merge dari `develop` saat milestone, lalu diberi tag versi (v0.1, v0.2, ... v1.0). Tag disamakan di kedua repo.
- **develop** = branch integrasi; semua feature/fix dibuat dari develop.
- **Branch sementara:** `<tipe>/<scope>/<deskripsi-kebab-case>`
  - tipe: feature | fix | chore | docs | test | refactor
  - scope backend: api, auth, filament, db, storage, claim, chat, notification, repo
  - scope mobile: ui, auth, map, report, claim, chat, notification, repo
  - contoh: `feature/filament/report-detail`, `fix/claim/accept-report-guard`
  - scope tidak boleh jadi nama branch sendiri (bentrok ref Git)
- **Merge:** feature/fix ke develop lewat Pull Request, squash merge.
- **Tanpa release/* dan hotfix/***; darurat pakai `fix/<scope>/...` dari main lalu merge balik ke develop.
- **Pesan commit:** Conventional Commits dengan scope yang sama, mis. `feat(filament): tambah halaman detail laporan`.
- **Rollback:** `git revert` (atau `revert -m 1` untuk merge commit) atau checkout tag. Branch belum ter-merge diberi tag `archive/<nama>` sebelum dihapus. Hanya branch yang sudah ter-merge yang boleh dihapus.
- **Pengaturan Gitea:** default branch `develop` dan proteksi `main` + `develop` (wajib PR) — keduanya **sudah dikonfirmasi user 2026-10-17**.
- **CONTRIBUTING.md:** ada di branch `chore/gitflow-docs` **sudah di-merge ke `develop`** (backend & mobile).
- **Status branch backend:** `fix/photo-delete-ownership` & `refactor/laravel-storage` **dihapus** (2026-10-17), karena sudah ter-merge ke `main` & `develop` (SHA ujung: `367ed2738ea5b9ba93a463e3cbb459edba87e15f` dan `8ed0348261e96bd750ce7ff6be43479823f2c6dc`).
- **Real-Time Chat Fase 1 backend:** branch `feature/chat/realtime-api` (3 commit: `2367926`, `669466b`, `8141719`) → **merge ke `develop` via PR #4 (squash), commit develop `fb256f9`** (2026-10-18). `php artisan test` di develop: **132 lulus** (sebelumnya 108).
- **Backlog UI Redesign E-1…E-6 (mobile, 2026-10-19):** lima PR squash ke `develop` repo `lostfound-mobile`, semuanya 2026-10-19 — **#4** `chore/repo/client-config-hardening` (E-2, **selesai**), **#5** `chore/ui/bundle-font` (E-5, **selesai di kode**), **#6** `fix/ui/wa-visibility-inert-controls` (E-1, **sebagian**), **#7** `fix/claim/claim-form-lost-report-list` (E-3, **sebagian**), **#8** `chore/ui/polish-low` (E-6, **selesai**). E-4 **dibatalkan** (pin peta sudah berfungsi; tidak ada branch/kode). **Status final dikonfirmasi user 2026-10-19.** Hash branch **bukan** hash `develop` — hash `develop` tidak dicatat. Detail: [[Backlog UI Redesign - Lost&Found]] §Hasil Pengerjaan 2026-10-19.
- **Tag baseline:** v0.1 **sudah dibuat** di kedua repo (sinkron): backend `72c7de1` (ujung `main`), mobile `69ed4c4`.
- **AGENTS.md (panduan agent coding) — 2026-11-07:** kedua repo kini punya `AGENTS.md`. **Backend:** konteks proyek dipindah **keluar** dari blok `<laravel-boost-guidelines>` (tag penutup di baris 157, judul konteks di baris 161) agar tidak tertimpa `boost:update`; isi usang diganti (klaim auto-detect gedung 100 m dan nama agen lama dihapus). **Mobile:** `AGENTS.md` baru (98 baris) — folder `docs/` di repo mobile bersifat **lokal dan di-ignore Git**, sehingga panduan menunjuk lokasi dokumen di vault Obsidian. Isi panduan tidak disalin ke dokumen ini. Sumber: [[GPT-261107-01-agents-md-backend]] · [[GPT-261107-02-agents-md-mobile]].
### 15.4 Filament Admin — Screen & Fitur
Filament akan digunakan untuk dashboard admin dengan fitur:
- **Dashboard Page** — ringkasan metrik (total laporan hari ini, claim pending, chart tren 7 hari)
- **LostReportResource** — CRUD laporan hilang dengan tabel, filter, status update
- **FoundReportResource** — CRUD laporan ditemukan dengan tabel, filter, status update
- **ClaimResource** — tabel claim pending dengan aksi terima/tolak (menggunakan Filament Actions)
- **UserResource** — manage user (admin only)
- **BuildingResource** — master data gedung kampus (detail aksi lihat §15.8)
**Filament Tabel Kolom yang Disarankan:**
*LostReportResource:*
- ID, Judul, Kategori, Lokasi, Lat/Long, Status, Pembuat (relation ke User), Foto (preview), Tanggal dibuat, Aksi (lihat detail)
*ClaimResource:*
- ID, Pemilik (User), Barang Hilang (LostReport relation), Barang Temuan (FoundReport relation), Alasan Claim, Status, Tanggal Claim, Aksi (Terima/Tolak)
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
**Index:** `nim` (unique), `role`, `fcm_token` *(index `fcm_token` tidak ada di `ERD.md`/`schema.dbml` — verifikasi ke migration aktual)*
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
<td>Array **path relatif** foto (mis. `reports/uuid.jpg`, min 1, maks 3). URL lengkap dibangun di response API dari `APP_URL` (2026-10-14).</td>
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
<td>Array **path relatif** foto (mis. `reports/uuid.jpg`, min 1, maks 3). URL lengkap dibangun di response API dari `APP_URL` (2026-10-14).</td>
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
<td>**Nullable** sejak 2026-10-23 (migration `2026_10_23_000001`; CHECK `claims_target_report_check`: `lost_report_id IS NOT NULL OR found_report_id IS NOT NULL`). Claim langsung ke laporan target, laporan sendiri opsional. Teks lama menyebut NOT NULL + "rencana" — sudah tidak berlaku.</td>
</tr>
<tr>
<td>`found_report_id`</td>
<td>UUID (FK → found_[reports.id](http://reports.id))</td>
<td>Laporan barang ditemukan yang diklaim — **nullable** sejak 2026-10-23; sisi NULL dilewati semua query/otorisasi</td>
</tr>
<tr>
<td>`claimant_id`</td>
<td>UUID (FK → [users.id](http://users.id))</td>
<td>User yang mengajukan claim (pengaju: pemilik **atau** penemu — dihitung dari laporan target, bukan kolom)</td>
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
<td>`accepted_at`</td>
<td>Timestamp (nullable)</td>
<td>Waktu konfirmasi diterima oleh penerima — untuk hitung kedaluwarsa 7 hari (ada sejak migration 2026-10-23)</td>
</tr>
<tr>
<td>`closed_reason`</td>
<td>Text (nullable)</td>
<td>Alasan penutupan (rejected/withdrawn/expired) (ada sejak migration 2026-10-23)</td>
</tr>
<tr>
<td>`closed_by`</td>
<td>UUID (FK → users.id, nullable)</td>
<td>User yang menutup (pengaju/penerima/admin), NULL = sistem (ada sejak migration 2026-10-23; FK `users.id` on delete set null)</td>
</tr>
<tr>
<td>`proof_of_transfer_photo_url`</td>
<td>String (nullable)</td>
<td>**Path relatif** foto bukti serah terima (mis. `claims/proof/uuid.jpg`); URL lengkap dibangun di response API dari `APP_URL` (2026-10-14).</td>
</tr>
<tr>
<td>`transferred_at`</td>
<td>Timestamp (nullable)</td>
<td>Waktu barang diserahkan</td>
</tr>
<tr>
<td>`transferred_by`</td>
<td>UUID (FK → users.id, nullable)</td>
<td>Admin **atau pelapor laporan target** yang menyerahkan barang (2026-10-23)</td>
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
**Index:** `lost_report_id`, `found_report_id`, `claimant_id`, `status`, `accepted_at` (INDEX BARU 2026-10-14)

**Catatan:** Verifikasi kepemilikan dilakukan via real-time chat antara penemu dan pengklaim (conversation auto-created saat claim dibuat), bukan pertanyaan keamanan. Admin tidak membaca isi chat.
---
#### 5. `buildings`

Master data gedung kampus untuk fitur pilih lokasi di peta dan saran gedung terdekat.

**Kolom:** id (UUID PK), name, code, type (default gedung), latitude (decimal 10,8), longitude (decimal 11,8), description (text nullable), timestamps

**Index:** type, composite (latitude, longitude)

---
#### 6. `conversations`

Ruang chat antara dua user, terkait claim atau laporan.

**Kolom:** id (UUID PK), user1_id, user2_id (FK users), lost_report_id (nullable FK), found_report_id (nullable FK), claim_id (nullable FK), `user1_archived_at`, `user2_archived_at`, `user1_deleted_at`, `user2_deleted_at` (4 timestamp nullable, sejak 2026-11-01), timestamps

**Index:** claim_id, user1_id, user2_id

> [!info] Tidak ada perubahan skema untuk `report_context` (2026-11-01)
> Kontrak `report_context` direspons `GET`/`POST /api/conversations` dihitung dari relasi yang sudah ada (`claim_id` → `claims`, `lost_report_id`, `found_report_id`) — **tanpa tabel, migration, kolom, atau endpoint baru**.

> [!info] Kolom arsip & hapus per slot user — **DITERAPKAN** (2026-11-01, migration `2026_11_01_103035_add_archive_delete_columns_to_conversations`)
> Fitur **Arsip & Hapus Chat** ([[Arsip dan Hapus Chat - Lost&Found]], disetujui user 2026-11-01 Paket A). **4 kolom timestamp nullable** di `conversations`: `user1_archived_at`, `user2_archived_at` (arsip manual atau otomatis 14 hari, per slot pengguna), `user1_deleted_at`, `user2_deleted_at` ("hapus untuk saya" — batas riwayat pesan yang tampil untuk pengguna itu). **Tanpa tabel baru** (keputusan 7 tabel tetap), tanpa index baru. Kolom per **slot** (`user1_*` milik `user1_id`, `user2_*` milik `user2_id`) mengikuti `user1_id`/`user2_id` — pada cabang claim `user1_id` = claimant/pengaju (bukan otomatis pelapor laporan hilang) dan `user2_id` = penerima (pelapor laporan target). Status: **backend + Flutter sudah merge** (lihat §16 Endpoint Chat), tetapi fitur **belum selesai penuh** (Phase 3 uji manual + Phase 0 scheduler masih terbuka). [[ERD]] & `schema.dbml` sudah disinkronkan 2026-11-01.
>
> **Visibilitas `*_deleted_at` (diselaraskan §16, 2026-11-06):** chat yang dihapus-untuk-saya muncul kembali bila ada pesan `created_at > {slot}_deleted_at`; tanpa pesan baru tetap tersembunyi. Fix `9feb665` (merge `develop`, konfirmasi user) — tidak ada perubahan skema (4 kolom ini tetap).

---
#### 7. `messages`

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
> **Catatan:** Ilustrasi skema awal, tidak identik dengan migration aktual (kolom `code`, `building_id`, tabel `buildings`/`conversations`/`messages` ada di migration lain). Sumber kebenaran: `ERD.md` dan `schema.dbml`.
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

> [!warning] Akan berubah
> Aksi Filament berubah di [[Claim Dua Arah dan Serah Terima oleh Pengguna - Lost&Found]]: aksi Terima jadi override (bukan jalur utama), tambah aksi Cabut/Tolak manual, detail view tambah timestamp accepted_at & closed_reason.

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

> [!note] Struktur Filament Pages & field `photo_urls` di form (2026-10-16)
> - **1 file 1 class:** sebelumnya semua Page class (View/Create/Edit) Lost & Found menumpuk di `ListLostReports.php`/`ListFoundReports.php`. Kini dipisah jadi **6 file** — `ViewLostReport`, `CreateLostReport`, `EditLostReport`, `ViewFoundReport`, `CreateFoundReport`, `EditFoundReport` — satu file satu class; `List*.php` hanya berisi class List.
> - **Infolist Lost vs Found sudah dibedakan:** View Lost menampilkan `lost_date` (Date, tanpa jam) + label "Pelapor"; View Found menampilkan `found_date` (Timestamp, dengan jam) + label "Penemu (Pelapor)".
> - **Field `photo_urls` di form:** memakai `->url()` + label "URL Foto". Accessor `photo_urls` mengembalikan **URL lengkap** (`APP_URL` + `/storage/` + path), mutator menormalkan input kembali ke **path relatif** saat save. Sempat dihapus `->url()` + diganti "Path Foto", lalu dikembalikan; hasil akhir: tidak ada perubahan perilaku form foto.
> - Lihat [[Backlog Perbaikan Lanjutan - Lost&Found]] Item 6.

### 15.9 Setup Lokal Backend (Clone Baru)

Checklist saat menyiapkan clone baru (mis. `C:\Project\lostfound-backend`):

1. **`.env`** — siapkan variabel yang dibutuhkan (lihat §15.2). Jangan commit `.env`; jangan tulis nilai rahasia di dokumen.
2. **`php artisan storage:link`** — buat symlink `public/storage` → `storage/app/public` (butuh PowerShell Administrator atau Windows Developer Mode).
3. **Salin foto lama** — isi `storage/app/public` (mis. `reports/`, `claims/proof/`) **tidak ikut Git**; salin dari folder lama (mis. `robocopy`) saat clone ulang.
4. **`php artisan config:clear`** — bersihkan cache config setelah mengubah `.env`.
5. **`GOOGLE_DEV_EMAILS`** — hanya **nama variabel**; nilai (daftar email dev) diisi di `.env` lokal, tidak ditulis di dokumen. Dipakai melonggarkan cek domain di luar `production`.

> Pelajaran (2026-10-14): foto tidak tampil di HP pada clone baru karena `public/storage` belum ada dan file lama masih di folder lama; solusinya `storage:link` + salin `storage/app/public`.
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
3. Mahasiswa A lihat laporan temuan → ajukan claim **langsung ke laporan target** (laporan sendiri opsional, `POST /api/claims` aturan 1–9) → chat otomatis **per `claim_id`** dengan pelapor target → pelapor target verifikasi kepemilikan via chat — **as-built 2026-10-30 (Flutter):** tombol claim di detail laporan hilang/temuan langsung buka form, dropdown laporan sendiri opsional (switch default OFF), model `Claim` nullable
4. Admin di Filament dashboard lihat claim pending → review foto + lokasi → terima/tolak claim → notifikasi ke kedua pihak (FCM) — **as-built 2026-10-24:** notifikasi FCM hanya lewat endpoint user (`accept`/`reject`/`withdraw`); jalur admin/Filament **tidak** mengirim FCM. **Keputusan 2026-10-25 (audit Bob-03): FCM jalur admin tidak diperlukan** — `AdminController` tidak mengirim FCM dan `Notification::make()` di Filament bukan FCM.
5. Setelah admin terima, koordinasi serah terima → upload foto bukti → status jadi `returned`
**Tech Stack Final:**
- **Mobile:** Flutter (Dart) — `google_sign_in ^7.2.0`, `image_picker` (kamera + galeri), `camera` (kemungkinan tidak terpakai), `location`, `flutter_map` + `latlong2` (peta OSM), `firebase_messaging`, `dio`/`http`, `url_launcher` (untuk WhatsApp deep-link)
- **Backend + Admin:** Laravel (PHP) — REST API (`api.php`) + Filament admin (`web.php`)
- **Database:** PostgreSQL
- **Push Notification:** FCM via `kreait/laravel-firebase` (backend) + `firebase_messaging` (Flutter)
- **WhatsApp Integration:** Deep-link via `url_launcher` (Flutter); opsional: Meta WhatsApp Business API (opsional, belum direncanakan).
- **Storage:** Laravel Storage (disk public)
**Model Data Utama:**
- `User` — role `user` untuk mahasiswa/dosen/karyawan, `admin` untuk administrator. Mobile login Google SSO pada domain `mhs.polines.ac.id`, `dsn.polines.ac.id`, `polines.ac.id`; NIM opsional; password nullable untuk user SSO dan tetap dipakai admin; punya `fcm_token`, `email_verified_at`, `blocked`
- `LostReport` — laporan barang hilang (dibuat pemilik) — status: pending → claimed → returned/closed
- `FoundReport` — laporan barang ditemukan (dibuat penemu) — status: pending → claimed → returned/closed
- `Claim` — pengajuan **langsung ke laporan target** (temuan → pemilik, hilang → penemu); `lost_report_id`/`found_report_id` nullable, CHECK minimal satu terisi — status: pending → accepted → returned / rejected / withdrawn
**Endpoint API Penting:**
- `POST /api/auth/google` — verifikasi Google ID token, audience, email_verified, dan allowlist domain di backend; tolak blocked (403 + blocked_reason); terbitkan Sanctum token 7 hari
- `POST /api/lost-reports` — buat laporan hilang (file upload foto + GPS data)
- `POST /api/found-reports` — buat laporan ditemukan
- `GET /api/lost-reports` & `GET /api/found-reports` — daftar laporan (paginasi). Sejak 2026-10-15 ([[Backlog Perbaikan Lanjutan - Lost&Found]] Item 3) index mendukung **`?mine=1`**: hanya mengembalikan laporan milik user login (`auth()->id()` dari Sanctum); format respons & pagination **sama** seperti index biasa, urutan terbaru dulu; **tanpa `mine` / `mine=0` perilaku lama tidak berubah**; kombinasi `mine=1&status=pending` bekerja; `mine=1` tanpa token → `401`. Sejak 2026-10-18 index juga menerima **`per_page`**: integer, **default 20**, di-clamp ke rentang **1–50**; nilai kosong/invalid → default 20 **tanpa `422`**. Semua filter **`search`** dibungkus satu grup `where()`, sehingga filter lain (`status`, `mine`) tetap berlaku. Bug `orWhere` di `SearchController` diperbaiki — sebelumnya permintaan `status=pending` masih bisa memunculkan laporan berstatus lain. Format respons tidak berubah.
- `POST /api/claims` — ajukan claim (as-built backend 2026-10-23, merge `develop` PR #6 `d1ef1eb`, **155 test lulus**; Flutter 2026-10-30 Ajax-261030-03, **139 test lulus**). Field `lost_report_id` & `found_report_id` **keduanya nullable**, `reason` wajib. Aturan 1–9: (1) tepat satu laporan **TARGET** = milik orang lain dan `pending`; (2) laporan satunya opsional, bila ada wajib milik pengaju; (3) `lost_report_id` target → pengaju penemu; `found_report_id` target → pengaju pemilik; (4) keduanya kosong → **422**; (5) keduanya milik orang lain → **422**; (6) keduanya milik pengaju → **422**; (7) target bukan `pending`, id tidak ada / bukan UUID → **422**; (8) sudah ada claim aktif per (`claimant_id`, target) → **422**, dan target sudah punya 5 claim `pending` → **422**; (9) laporan sendiri ditautkan wajib milik pengaju **dan** `pending`, selain itu **422**. Sukses → **201**; `Claim::create()` + pembuatan `Conversation` per `claim_id` dalam satu `DB::transaction` (gagal → rollback penuh, klien **422**). Status laporan **tetap `pending`** saat claim dibuat. Flutter: `ClaimScreen` dua konstruktor (`.forFoundReport`/`.forLostReport`), dropdown opsional (switch default OFF, lazy load `mine=true&status=pending`), model nullable, error 422 ekstrak Laravel `errors`.
- `PATCH /api/claims/{id}` — **DIHAPUS 2026-10-25 (Bob-04, commit `b1059d5`)**: `ClaimController::update` dihapus, route kini **405**; sebelumnya no-op dan tidak dipakai Flutter. **`ClaimPolicy::update` TETAP dipertahankan** karena dipakai aksi Filament `ClaimResource` (EditAction). **Teks lama (tidak dihapus):** ~~hanya memuat + otorisasi `ClaimPolicy::update` (**admin saja**) lalu mengembalikan claim~~. Terima/tolak admin lewat `AdminController::acceptClaim`/`rejectClaim` (satu logika di `ClaimDecisionService`). **Reject as-built 2026-10-23 (T-261023-05, commit `a262255`, 182 test lulus, merge `develop`):** hanya claim `pending` (selain itu **422**), **tidak mengubah status laporan**; `lockForUpdate` + `ClaimNotPendingException::reject()`; `AdminController::rejectClaim` dan aksi Tolak Filament menangkap exception.
- `POST /api/claims/{id}/accept` — terima claim (as-built 2026-10-24; 1.2a commit `0f41270`, merge `develop` squash `2bafdb5`, 199 test lulus). Hanya **admin ATAU penerima** (`ClaimPolicy::accept`); wajib claim `pending` dan laporan target `pending` (selain itu **422**); bukan admin/penerima → **403**; id tidak ada → **404**. Efek: status `accepted`, `accepted_at = now()` (via `ClaimDecisionService::accept()`), laporan terisi → `claimed`.
- `POST /api/claims/{id}/reject` — tolak claim oleh **admin ATAU penerima** (`ClaimPolicy::reject`); body `reason` wajib string → **422** bila kosong; claim non-`pending` → **422**; bukan admin/penerima → **403**. Efek: status `rejected`, `closed_reason` = alasan, `closed_by` = id penerima; **status laporan tidak diubah**. Jalur admin lama (`AdminController::rejectClaim`) tetap menulis `admin_note`, **tidak** mengisi `closed_reason`/`closed_by`.
- `POST /api/claims/{id}/withdraw` — cabut claim oleh **pengaju saja** (`ClaimPolicy::withdraw`; admin/penerima/outsider → **403**; body `reason` wajib → **422** bila kosong; status hanya `pending`/`accepted`, selain itu **422**). Efek: status `withdrawn`, `closed_reason`, `closed_by` = claimant; bila sebelumnya `accepted`, laporan terisi yang masih `claimed` → `pending` (sisi NULL dilewati); bila `pending`, laporan tidak diubah; `accepted_at` dibiarkan sebagai jejak.
- **Constraint UUID route (2026-10-25, Bob-04 + Bob-06):** semua route API ber-param ID kini `->whereUuid('id')` — `GET /api/claims/{id}`, `accept`/`reject`/`withdraw`, `PATCH /api/claims/{claim}/mark-transferred`, `POST /api/admin/claims/{id}/accept|reject`, `GET /api/lost-reports/{id}`, `GET /api/found-reports/{id}`, `GET|POST /api/conversations/{id}/messages`, `PATCH /api/messages/{id}/read`. **ID non-UUID → `404`, bukan `500`** (sebelumnya `SQLSTATE[22P02] invalid input syntax for type uuid`). Route Filament `{record}` bukan bagian `routes/api.php` — tidak diubah. 252 test lulus / 675 assertion.
- Service claim (as-built 2026-10-24; notifikasi FCM diselaraskan 2026-10-25): `ClaimDecisionService` (`accept()` mengisi `accepted_at`; `reject()` punya parameter opsional `closedReason`/`closedBy` — jalur admin tidak berubah, tetap `admin_note`), `ClaimWithdrawService` (**baru**; transaction + `lockForUpdate`), `ClaimNotificationService` (**baru**; FCM best-effort ke pengaju saat accepted/rejected dan ke penerima saat withdrawn; payload `type` + `claim_id`; gagal kirim **tidak** menggagalkan request dan dicatat `Log::warning` dengan `claim_id`/`type`). Tidak ada notifikasi di jalur admin/Filament.
- `GET /api/claims` — daftar claim, **ter-scope per peserta** (as-built 2026-10-23): admin melihat semua; non-admin hanya claim yang ia ajukan (`claimant_id`) **atau** laporan yang ia laporkan (`lostReport.reporter_id` / `foundReport.reporter_id`). Filter `status` opsional; `paginate(20)` tanpa `per_page` (lihat §17).
- `GET /api/buildings` — daftar master gedung untuk marker peta + saran gedung
- `POST /api/photos/upload` — upload foto (jpg/jpeg/png/webp, maks 2 MB); mengembalikan `{url, path}` (201) — `path` = path relatif yang disimpan (2026-10-14). Sejak 2026-10-15 upload **mencatat kepemilikan**: Cache `photo-owner:{path}` → `user_id`, **TTL 24 jam** (`CACHE_STORE=database`).
- `POST /api/photos/delete` — hapus foto; menerima URL lengkap atau path relatif, dinormalisasi, wajib berawalan `reports/` atau `claims/proof/`. Sejak 2026-10-15 ([[Backlog Perbaikan Lanjutan - Lost&Found]] Item 9, Opsi C) menerapkan cek kepemilikan + rujukan: **`403`** bila foto tidak tercatat sebagai milik peminta (termasuk foto lama pra-fitur), **`409`** bila foto masih dirujuk (`lost_reports.photo_urls`, `found_reports.photo_urls`, `claims.proof_of_transfer_photo_url`), **`422`** bila domain asing/path traversal.
- `PATCH /api/claims/{claim}/mark-transferred` — tandai barang diserahkan. **Diperbarui 2026-11-01 (commit `f3b730d`, sudah merge `develop`, dikonfirmasi user):** boleh oleh **admin ATAU claimant (pengaju) ATAU penerima** (`ClaimPolicy::markTransferred`); wajib status `accepted` (selain itu **422**), `proof_photo` wajib (image jpg/jpeg/png/webp, maks 5 MB). **Route tidak berubah (`PATCH`)** — sisi Flutter mengirimnya sebagai **POST multipart dengan field `_method=PATCH`** ke URL yang sama (metode efektif tetap PATCH; lihat §11.3). Sisi laporan yang NULL dilewati. **Sejak 2026-10-25 (fix transfer claim, sudah merge `develop`):** guard `accepted` dijalankan **di dalam** `DB::transaction` dengan `lockForUpdate` (urutan lock claim → laporan hilang → laporan temuan); foto bukti disimpan **setelah** guard lolos dan dihapus dari disk `public` bila terjadi exception; notifikasi serah terima (`ClaimTransferService::notifyClaimant`) memakai API FCM v8 `CloudMessage::new()->withToken()` (`withTarget` sudah tidak ada di `kreait/firebase-php 8.5.0`) dengan kegagalan dicatat `Log::warning`. 235 test lulus.
- `GET /api/admin/*` — endpoint admin
- **Endpoint profil WhatsApp (baru, merge `develop` 2026-11-07/2026-11-08):**
  - `PUT /api/users/me/whatsapp` — isi/ganti/kosongkan nomor WhatsApp **hanya** dari body (query string diabaikan). Kunci `whatsapp` wajib hadir (`present|nullable`); `null`/`""` → simpan `null` + `wa_visible` otomatis `false`; `true` tanpa nomor → **422**. Format diterima `08`/`+62`/`62` (pemisah spasi/`-`/`.`/kurung dibuang), hasil disimpan `62...` wajib cocok **`^628\d{8,11}$`**, selain itu **422** berpesan Indonesia **tanpa input mentah**. `name`/`email`/`nim` **tidak bisa diubah** user. Respons **sama persis** dengan `GET /api/users/me` (lewat helper `userProfileResponse()`; PR #32 `6f8b43d4b5`). Transaksi + `lockForUpdate`. Nomor **tidak unik**, **tidak dienkripsi**.
  - `PUT /api/users/me/wa-visibility` — toggle visibilitas (**endpoint terpisah**). Respons `{"message":"WhatsApp visibility updated"}`. `wa_visible=true` tanpa nomor → **422**.
  - **Sumber:** PR #31 (merge commit `df5e22ed17`, tip branch `e200ec3c5c`) + PR #32 (merge commit `6f8b43d4b5`, branch `fix/api/whatsapp-profile-validation`). Nomor hanya tampil ke luar `/users/me` via alur claim (belum dikerjakan). Lihat §17 open item WA.
- **Penyaringan field user relasi (PR #30, 2026-11-07, squash `c760ef2`):** lima field (`whatsapp`, `nim`, `email`, `blocked`, `blocked_reason`) disaring dari relasi `reporter`/`claimant`/`transferred_by` di **19 endpoint** lewat helper `Controller::hideUserContactFields`; `$hidden` model `User` **tidak** diubah. Baseline backend saat itu **378 test / 1.602 assertion**.
**Endpoint Chat (Real-Time Chat Fase 1, merge `develop` 2026-10-18)** — semua `auth:sanctum`; admin tidak berakses isi chat:
- `POST /api/conversations` — body `claim_id` **ATAU** (`other_user_id` + tepat satu dari `lost_report_id`/`found_report_id`; `other_user_id` harus pelapor laporan itu; tidak boleh diri sendiri). Find-or-create: **201** baru, **200** sudah ada. Respons menyertakan `report_context` (lihat callout di bawah).

> [!info] Kontrak `report_context` (2026-11-01, backend `feature/chat/report-context` commit `293a4ec` — **merged `develop`, belum deploy**)
> Hadir di respons **`GET /api/conversations` dan `POST /api/conversations`** (list maupun item). Bentuk:
> ```json
> "report_context": {
>   "id": "uuid", "type": "lost|found", "title": "Jaket Hitam",
>   "code": "LST-261001-A3F9", "location_name": "Gedung Sekolah A",
>   "photo_url": "https://…/reports/uuid.jpg"
> }
> ```
> - Field: `id, type, title, code, location_name, photo_url` (kode dihitung dari `type` + tanggal + suffix, sama seperti kode laporan di mobile).
> - **`null` bila hubungan barang tidak tersedia** (mis. conversation dibuat hanya dari `claim_id` yang kedua sisinya NULL, atau tanpa laporan) — klien wajib menangani `null`.
> - **Tanpa tabel, migration, kolom, atau endpoint baru** — dihitung dari relasi yang sudah ada.
> - **Aturan pemilihan target claim dua arah:** target = laporan yang **bukan** milik pengaju (`claimant_id`); bila `found_report_id` terisi → konteks = laporan temuan; bila hanya `lost_report_id` terisi → konteks = laporan hilang. Cocok dengan [[Claim Langsung ke Laporan Target - Lost&Found]] (kedua kolom nullable, minimal salah satu terisi).
> - **Sisi mobile:** model `ConversationReport` + parsing `report_context` di `lib/models/conversation.dart`; widget kartu `chat_report_reference.dart`; `app_logo.dart` (SVG via `flutter_svg`, sudah menjadi dependency); aset logo di `assets/images/logo/`. **Status mobile: SUDAH MERGE `develop`** — dikoreksi 2026-11-12 atas konfirmasi user; hash commit/nomor PR **tidak diketahui**, jangan dikarang. **Teks lama (tidak berlaku):** ~~"Status mobile: belum merge (branch `feature/ui/apply-figma-v3`, commit `0779f77` dkk)".~~
- `GET /api/conversations` — daftar milik user: `id`, `claim_id`, `lost_report_id`, `found_report_id`, `other_user`, `last_message`, `unread_count`, `is_archived`, `report_context`, `created_at`, `updated_at`. **Sejak 2026-11-01:** param `?archived=1` = daftar chat yang **terarsip untuk pemanggil** (tanpa param = chat tidak terarsip); `last_message` dan `unread_count` menyaring pesan `created_at > {slot}_deleted_at` (batas riwayat setelah "hapus untuk saya"); `is_archived` per slot pemanggil. **Dikoreksi 2026-11-06 (fix `9feb665`, merge `develop` — konfirmasi user):** chat yang di-`*_deleted_at` oleh pemanggil **MUNCUL KEMBALI** di daftarnya bila ada pesan dengan `created_at > {slot}_deleted_at`; **tanpa pesan baru tetap tersembunyi**. `last_message`/`unread_count` hanya menghitung pesan setelah batas hapus; `unread_count` kini **integer**. **Teks lama (tidak berlaku, sebagai riwayat):** "chat yang di-`*_deleted_at` oleh pemanggil disaring keluar (`scopeVisibleTo`)" — scope lama mewajibkan kolom hapus slot pemanggil bernilai null, sehingga chat terhapus tidak pernah muncul lagi walau ada pesan baru.

> [!info] N+1 daftar percakapan — **DIPERBAIKI (2026-11-06, fix `9feb665`, merge `develop`)**
> `last_message` dan `unread_count` kini dihitung lewat **subquery di query daftar** (bukan dua query per baris); pesan terakhir diambil dengan satu query tambahan (`created_at DESC, id DESC`). Jumlah query `GET /api/conversations` pada fixture tes: **7 → 4** (2 percakapan) dan **23 → 4** (10 percakapan) — tetap **4** berapa pun jumlah chat. **Bentuk JSON, urutan `updated_at DESC`, filter `archived`, dan `is_archived` tidak berubah.** Verifikasi: `ConversationArchiveTest` 25 lulus, filter `Conversation` 72 lulus, suite penuh **365 lulus (1.341 assertion)**; `pint` + `git diff --check` lulus. **Tidak ada migration/perubahan skema** (tetap 7 tabel). **Catatan lingkungan tes:** suite hanya berjalan di **PostgreSQL** (SQLite gagal di migration bawaan yang memakai `pg_constraint`); satu test (`ConversationTest::test_list_includes_found_target_instead_of_claimants_own_lost_report`) bergantung `APP_URL=http://localhost`. **Risiko terbuka:** biaya subquery ke tabel `messages` belum diukur dengan data produksi.
- `GET /api/conversations/{id}/messages` — `limit` (default 50, maks 100), `before_id` (kursor `created_at` + `id` karena id UUID tidak berurutan); urutan terbaru dulu. **Sejak 2026-11-01:** bila pemanggil punya `{slot}_deleted_at`, hanya pesan dengan `created_at > deleted_at` yang dikembalikan.
- `POST /api/conversations/{id}/messages` — body `message` (required, string, maks 2000); memicu broadcast event. **Sejak 2026-11-01:** pesan baru mengosongkan **kolom arsip kedua pihak** (`user1_archived_at` + `user2_archived_at` = null → keluar dari arsip otomatis untuk kedua pihak); `*_deleted_at` **tidak** diubah (tetap batas riwayat).
- `PATCH /api/conversations/{id}/archive` — **baru 2026-11-01.** Arsip manual oleh pemanggil: `{slot}_archived_at = now()`, idempoten. Respons `{id, is_archived: true}`. Non-peserta → **403**; id non-UUID → **404**.
- `PATCH /api/conversations/{id}/unarchive` — **baru 2026-11-01.** Buka arsip (manual/otomatis) oleh pemanggil: `{slot}_archived_at = null`. Respons `{id, is_archived: false}`. Non-peserta → **403**.
- `DELETE /api/conversations/{id}` — **baru 2026-11-01.** "Hapus untuk saya": menulis `{slot}_deleted_at = now()` (**bukan** menghapus baris `conversations`/`messages`). Respons `{id, deleted: true}`. **409** bila claim terkait berstatus `pending`/`accepted` — `{message: 'Cannot delete conversation while the related claim is active (pending or accepted)'}`, chat **tetap dipertahankan** saat 409. Claim terminal (`rejected`/`withdrawn`/`returned`) dan chat tanpa claim boleh dihapus. Non-peserta → **403**.
- **Command terjadwal `conversations:archive-inactive --days=14`** — arsip otomatis: `updated_at < now()-14d`, melewati claim `pending`/`accepted`, mengisi kolom arsip **kedua** pihak bila masih null. Didaftarkan di `routes/console.php` `Schedule::command(...)->dailyAt('02:00')->withoutOverlapping()`.
- **Timestamp tidak berubah** untuk archive/unarchive/delete/command — `$conversation->timestamps = false` sebelum `save()` pada keempat jalur itu.
- `PATCH /api/messages/{id}/read` — hanya penerima pesan
- `POST /api/broadcasting/auth` — `auth:sanctum` Bearer token; body `socket_id` + `channel_name`. Non-peserta → **403**
- Broadcasting: event `MessageSent` (nama siaran `"MessageSent"`), channel `private-conversation.{conversation_id}`, `implements ShouldBroadcastNow` (tanpa queue worker — chat harus instan, MVP lebih sederhana; bisa dipindah ke queue bila traffic besar). Pengirim **juga** menerima event (tanpa `toOthers`) → klien dedup via `id` pesan. Payload: `id`, `conversation_id`, `sender_id`, `message`, `read_at`, `created_at`, `updated_at`, `sender{id,name,email}` (`UserResource` — `whatsapp`, `nim`, `role`, `blocked` tidak dikirim)
- **Hasil tes manual chat (2026-10-18, laporan user):** diuji di **1 HP dengan 2 akun berbeda**; UI Flutter (list percakapan + kirim/terima) sudah dipakai. Berhasil: **kirim/terima pesan realtime antar dua user**; belum menemukan bug. Belum diuji: dedup pengirim, mark-read, penolakan non-peserta (`403`), reconnect saat app dibuka kembali, dan tes dua perangkat fisik. Belum dikonfirmasi apakah broadcast benar-benar lewat **Pusher asli** (key/app Pusher sudah disiapkan user).
**Point Penting yang Perlu Diingat:**
- Auth mobile: Google SSO, domain persis `mhs.polines.ac.id`, `dsn.polines.ac.id`, `polines.ac.id` setelah lowercase + trim; subdomain ditolak. Validasi backend wajib. Role `user | admin`; NIM opsional, password nullable untuk user SSO; Sanctum token 7 hari. Admin Filament tetap memakai password.
- GPS: pilih lokasi lewat titik (pin) di peta (`flutter_map` + OSM), saran gedung terdekat sebagai daftar (Haversine lokal Flutter), tombol "Lokasi saya" hanya menggeser peta ke posisi GPS
- Kamera: min 1 foto, maks 3 foto; opsi kamera (1 foto/tap) atau galeri (multi-pilih); kompresi maks 2 MB per foto, lalu upload ke `POST /api/photos/upload` sebelum create report
- FCM: token harus disimpan di database saat login pertama, bukan saat install app. **Sejak 2026-11-04 (GPT-261104-02/03/04/05/06, merge develop):** `PUT /api/users/me/fcm-token` (transaksi hapus token user lain lalu simpan ke user saat ini; body `fcm_token` wajib string), `DELETE /api/users/me/fcm-token` (conditional update ID user + token cocok, body `fcm_token` wajib string, 204 untuk cocok/null/mismatch, 401 tanpa auth, 422 input invalid). Keenam type payload: `claim_new`, `claim_accepted`, `claim_rejected`, `claim_withdrawn`, `claim_returned`, `chat` + `claim_id`/`conversation_id`. Backend `PushNotificationService` sinkron best-effort; Flutter `FcmService` guard per sesi, keenam type handled, foreground banner ~4s, logout dideduplikasi PUT+conditional DELETE. **Uji manual 2026-11-04:** "sebagian besar berhasil", rincian skenario belum lengkap. Opsi A (FCM tanpa tabel history) — layar Notifikasi tetap empty state.
- WhatsApp: nomor WhatsApp hanya ditampilkan jika user mengizinkan (wa_visible=true). **Diperbarui 2026-11-08:** nomor **tidak pernah** muncul di respons laporan/pencarian; hanya ke **lawan claim setelah claim `accepted`** (bila `wa_visible` aktif + nomor tidak null); admin tidak menerima nomor lewat API claim. Endpoint pengisian `PUT /api/users/me/whatsapp` + toggle `PUT /api/users/me/wa-visibility` **sudah merge `develop`** (PR #31/#32); nomor **tidak unik**, **belum dienkripsi** (ditunda). Deep link `wa.me` saja. Tombol WhatsApp di detail laporan **dihapus** sampai dipindah ke alur claim (belum dikerjakan). Lihat §16 & §17.
- Admin: hanya role `admin` yang bisa akses endpoint admin dan Filament dashboard; admin tidak baca isi chat
- Filament: digunakan khusus untuk admin dashboard web, bukan replacement untuk mobile app
- Google OAuth client Web digunakan sebagai audience ID token; client Android memerlukan SHA-1 tiap mesin developer. Jangan simpan credential di dokumen.
- Chat (2026-10-18): env broadcasting memakai `BROADCAST_CONNECTION` (di `.env.example` default `log`; dev memakai `pusher`, cluster `ap1`) — nilai `PUSHER_*` tidak ditulis di dokumen. Chat langsung wajib menyertakan laporan (tepat satu `lost_report_id`/`found_report_id`); cabang claim `user1_id` = `claimant_id`, `user2_id` = **pelapor laporan target** (**DISETUJUI user 2026-10-23**; teks lama menyebut `user1_id` = pelapor laporan hilang — sudah tidak berlaku), **422** bila keduanya sama.
---

## 17. Open Items

- **Verifikasi kompatibilitas Filament 3.3.x dengan Laravel 13** — cek `composer.json` dan `composer.lock` (belum dikerjakan; jangan simpulkan hasil sebelum diperiksa).
- **✅ Kepemilikan foto pada `POST /api/photos/delete` — SELESAI (2026-10-15)** — [[Backlog Perbaikan Lanjutan - Lost&Found]] Item 9 (Opsi C) diterapkan: branch `fix/photo-delete-ownership`, commit `b2ab837`, 101 test lulus. Upload mencatat Cache `photo-owner:{path}` → `user_id` (TTL 24 jam); delete mengembalikan `403` (bukan pemilik/tidak tercatat), `409` (masih dirujuk), `422` (domain asing/traversal). Tidak ada tabel/kolom baru.
- **✅ Endpoint "laporan saya" `?mine=1` — SELESAI (2026-10-15)** — [[Backlog Perbaikan Lanjutan - Lost&Found]] Item 3: branch `feature/mine-filter`, commit `371fad5`, 7/7 test pass (`tests/Feature/MineFilterTest.php`). `GET /api/lost-reports?mine=1` & `GET /api/found-reports?mine=1` memfilter milik user login via Sanctum `auth()->id()`; format/pagination sama, backward compatible (tanpa `mine`/`mine=0` perilaku lama), `mine=1&status=pending` bekerja, `mine=1` tanpa token → `401`. Tanpa tabel/kolom/dependensi baru.
- **✅ Pembedaan halaman View Lost vs Found di Filament — SELESAI (2026-10-16)** — [[Backlog Perbaikan Lanjutan - Lost&Found]] Item 6: branch `fix/filament-report-pages`, 108/108 test lulus. Page class (View/Create/Edit) yang sebelumnya menumpuk di `ListLostReports.php`/`ListFoundReports.php` dipisah jadi **6 file** (`ViewLostReport`, `CreateLostReport`, `EditLostReport`, `ViewFoundReport`, `CreateFoundReport`, `EditFoundReport`) — satu file satu class; `List*.php` hanya berisi class List. Infolist Lost vs Found sudah dibedakan: View Lost menampilkan `lost_date` (Date, tanpa jam) + "Pelapor"; View Found menampilkan `found_date` (Timestamp, dengan jam) + "Penemu (Pelapor)". Tes manual `/admin` berhasil. Merge ke `main`: sudah. Field `photo_urls` di form Filament memakai `->url()` + label "URL Foto": accessor mengembalikan URL lengkap, mutator menormalkan ke path relatif saat save — tidak ada perubahan perilaku form foto.
- **✅ Backlog Item 5 — Riwayat laporan saya di tab Profil — SELESAI (2026-10-16)** — [[Backlog Perbaikan Lanjutan - Lost&Found]] Item 5: repo Flutter `C:\Project\lostfound-mobile`, branch `feature/my-reports-history`, 3 commit (`69ed4c4` HEAD→main; `a9f13f8` fix locale/code/timezone; `83c40cd` fitur profil). `flutter analyze`: 0 error. `flutter test`: 55/55 lulus (sebelumnya 47). `flutter build apk --debug`: sukses. Merge ke `main`: **Sudah**. See [[Backlog Perbaikan Lanjutan - Lost&Found]] Item 5, DailyChanges 2026-10-16, Progress, TechnicalReference §11.1.
- **Dev email `GOOGLE_DEV_EMAILS` (2026-10-14, diluruskan 2026-10-15)** — **normalisasi daftar ternyata sudah ada sejak awal** di `config/services.php` + `AuthController`; sesi 2026-10-15 hanya menambah 4 test. **Sisa open item:** aktif di semua environment non-production (termasuk staging). **Keputusan 2026-10-15: pembatasan ke `local`/`testing` TETAP DITUNDA** — ini syarat sebelum staging, digarap saat menyiapkan staging, bukan sekarang.
- **Wajib `php artisan storage:link` di setiap setup/clone baru (2026-10-14)** — symlink `public/storage` dan isi `storage/app/public` tidak ikut Git.
- **Job pembersih foto yatim terjadwal — KEPUTUSAN 2026-10-15: DITUNDA** — foto yatim lama (tanpa catatan owner di Cache; pra-fitur Item 9) selalu `403` saat delete oleh user dan tidak dirujuk laporan. Dampaknya hanya ruang disk, dan sejak Item 1 foto yatim baru tidak muncul lagi (rollback berjalan). Cukup dibuat plan **hanya bila penyimpanan mulai jadi masalah**; tidak ada plan sekarang.
- **Audit rollback foto bukti serah terima (`claims/proof`) — KEPUTUSAN 2026-10-15: dikerjakan bersama [[Claim Dua Arah dan Serah Terima oleh Pengguna - Lost&Found]]** — foto bukti serah terima wajib di plan tersebut, jadi alur upload-nya akan disentuh lagi; mengaudit sekarang = mengaudit dua kali.
- **Chat — open items (USULAN, belum diputuskan, 2026-10-18):** (a) route ganda `/broadcasting/auth` (otomatis `withRouting(channels:)` + manual `Broadcast::routes` di `api.php`) — usul rapikan via `withBroadcasting(prefix: 'api', middleware: ['api','auth:sanctum'])`, prioritas low; (b) `index()` conversations N+1 query — usul optimasi eager-load; (c) endpoint mark-read massal; (d) chat read-only berdasar status claim + user terblokir masih bisa kirim pesan — usul di plan Claim Dua Arah / Fase 3; (e) FCM notifikasi pesan baru + deep link belum ada — usul Fase 3. (f) **`GET /api/search` belum punya `limit`/pagination** — usul tambahkan limit/pagination, prioritas low; (g) **`ConversationController::index` memakai `orWhere` tanpa group** — usul dibungkus satu grup `where()` (digabung dengan usulan (b) N+1 eager-load), prioritas low; (h) **dropdown "Laporan hilang kamu" di mobile hanya memuat 20 laporan pertama** (default `per_page`) — usul kirim `status=pending` (+ opsi `mine=1`/pagination), lihat [[Backlog Perbaikan Lanjutan - Lost&Found]] item (ix). Rincian di [[Real-Time Chat - Lost&Found]]. **Pembaruan 2026-10-19:** mobile kini mengirim `mine: true&status=pending&per_page=50` + loop halaman sampai `lastPage` (E-3, PR #7) — batas 20 laporan di dropdown **teratasi di sisi mobile**; `per_page` backend untuk claim (`ClaimController::index`) masih hardcode `paginate(20)`.

- **✅ Pagination & search laporan dibatasi + filter search diperbaiki (2026-10-18)** — branch `fix/api/report-pagination`, commit `36c32a7` ("fix(api): bound report pagination and scope search filters"), merge ke `develop` lewat PR squash. `LostReportController` & `FoundReportController`: `per_page` int default 20, clamp 1–50, nilai invalid → default (tanpa `422`); `search` dibungkus grup `where()`. `SearchController`: bug `orWhere` diperbaiki sehingga `status=pending` berlaku benar. Test baru `tests/Feature/ReportPaginationSearchTest.php` (6 test); `php artisan test`: **138 lulus** (sebelumnya 132). Tanpa kolom/tabel/dependensi baru; format respons tidak berubah.

- **Chat — hasil tes manual (2026-10-18, laporan user):** chat diuji di **1 HP dengan 2 akun berbeda**; UI Flutter (list percakapan + kirim/terima) sudah dipakai; skenario **kirim/terima pesan realtime antar dua user berhasil**, belum menemukan bug. **Belum diuji:** dedup pengirim, mark-read (`PATCH /api/messages/{id}/read`), penolakan non-peserta (`403`), reconnect saat app dibuka kembali, dan tes dua perangkat. **Belum dikonfirmasi:** apakah broadcast benar-benar lewat **Pusher asli** — user sudah menyiapkan key/app Pusher tetapi belum yakin driver yang dipakai saat tes.

- **✅ Bug chat realtime — SELESAI (2026-10-30, Ajax-261030-04):** pesan baru tidak muncul langsung di `ChatScreen` page terbuka (harus keluar page dulu). Root cause: `setState(() => _store.merge([message]))` arrow function return bool dari `merge()`, Flutter butuh side-effect execution. Fix: ganti jadi block `setState(() { _store.merge([message]); })` di `chat_screen.dart` `_handleIncomingMessage`. Branch `fix/chat/fix-message-realtime`, commits `fa0af4d` (debug log) + `427b6e7` (fix + hapus log). Verifikasi: **139 test lulus**, 8 issue baseline, uji manual 2 HP pesan muncul realtime ✓ + dedup diri sendiri ✓.

- **Ketergantungan backend dari E-3 (2026-10-19):** `ClaimController::index` di `develop` masih `paginate(20)` **tanpa scope `claimant_id`** → `per_page=50` dari mobile tidak berpengaruh dan filter sisi klien di `my_claims_screen.dart` **harus tetap ada**. Branch `fix/claim/scope-claims-access` dan `fix/api/report-pagination` **tidak ada** di repo `lostfound-backend` → perlu dijadwalkan sebelum filter klien dihapus. Terkait Backlog (ix) & (xiv) dan [[Backlog UI Redesign - Lost&Found]] E-3/B-1.
- **DIPERBARUI 2026-10-23 (anotasi, teks lama di atas tidak dihapus):** `ClaimController::index` di `develop` (`cdae742`) **sudah** ter-scope per peserta — admin = semua; non-admin hanya `claimant_id` **atau** reporter laporan hilang **atau** reporter laporan ditemukan (lihat §16). Jadi filter sisi klien di `my_claims_screen.dart` bisa dihapus; sisa E-3 hanya `per_page` claim (masih `paginate(20)`). 

- **Open item aset & build mobile (2026-10-19, temuan E-5):**
  - (a) ✅ **SELESAI (2026-10-30, Ajax-261030-02):** `assets/images/logo/` ter-track di repo (PR #11 `f800d75` merge `develop`); logo baru (`lostfound-logo-simple.png` 130 KB + `lostfound-icon.png` 66 KB) plus SVG sumber di `src/` subfolder. Font E-5 di `assets/images/fonts/` tetap di-commit.
  - (b) Pernah terjadi **drift `pubspec.lock`** (entri `google_fonts` hilang saat build lokal); **belum terbukti** di git.
  - (c) **Warning KGP** dari plugin `location` dan `pusher_channels_flutter` → perlu upgrade plugin. **Diperbarui 2026-10-30:** warning tetap muncul di Ajax-261030-02 (pre-existing, bukan dari perubahan logo).
  - (d) Stash lokal `client-config-hardening` dan worktree `lostfound-mobile-claim` sudah tidak diperlukan (info saja).

- **✅ Logo baru — SELESAI (2026-10-30, Ajax-261030-02 + Dominic-261030-01):** wordmark terang/gelap + ikon persegi dicatat di [[Design]] §2.7; implementasi Flutter merge `develop` PR #11 (`f800d75`). Aset: `assets/images/logo/lostfound-logo-simple.png` (wordmark, 130 KB) + `lostfound-icon.png` (ikon persegi, 66 KB) + SVG sumber di `src/`. Dependensi dev baru: `flutter_launcher_icons ^0.14.3`, `flutter_native_splash ^2.4.6`. Terapkan di: login (wordmark 260px), header Beranda (ikon 32px), launcher icon Android/iOS (adaptive, bg `#FFFBF0`), splash (latar putih + ikon). Verifikasi: `flutter pub get` OK (9 dependensi berubah), `flutter analyze` 8 issues baseline (tidak berubah), `flutter test` 125 lulus, `flutter build apk --debug` sukses (36.6s). **Belum:** varian gelap (PNG perlu cek ulang tepi bergerigi), logo backend/Filament (§6.1 Design.md — usulan terpisah butuh persetujuan user).

- **Plan baru 2026-10-18 (USULAN/PLANNING, belum ada kode):**
	- **Push Notification — [[Push Notification - Lost&Found]] (priority `high`):** melengkapi push di luar serah terima (claim diajukan, claim diterima/ditolak, chat baru + deep link, status laporan, pembekuan/kedaluwarsa claim). Daftar peristiwa ada di plan. Keputusan **Opsi A (FCM saja, tanpa tabel) vs Opsi B (tabel notifikasi ke-8, bertentangan dengan keputusan 7 tabel → perlu update [[ERD]]/`schema.dbml`/[[PRD]]/[[Design]])** masih menunggu user. Kegagalan FCM yang sekarang ditelan tanpa log diusulkan dicatat sebagai warning.
	- **Nomor WhatsApp Pengguna — [[Nomor WhatsApp Pengguna - Lost&Found]] (priority `medium`):** tidak ada endpoint untuk **mengisi** `users.whatsapp`; yang ada hanya `PUT /users/me/wa-visibility` dan `PUT /users/me/fcm-token` (keduanya **belum terdaftar di §16**). Usul `PUT /users/me` khusus field `whatsapp` (+ normalisasi `62...`, boleh kosong) dan field di Edit Profil. **Wajib diverifikasi:** `LostReportController`/`FoundReportController` mengembalikan model mentah — cek relasi pelapor tidak membocorkan `whatsapp`/`nim`/`fcm_token`; nomor hanya boleh tampil bila `wa_visible = true` (pola di [[Security Hardening - Lost&Found]] §2, belum diterapkan).
	- **Kartu konteks chat — usulan masuk [[Real-Time Chat - Lost&Found]] Fase 2/3 (bukan plan terpisah):** tambah field `context` (`claim {id,status}` + laporan terkait `{id,nama,foto,kode,status}`) di respons `GET /api/conversations` (**bukan skema DB**); kartu pinned di `ChatScreen`, tahap 1 read-only; tombol aksi menunggu endpoint [[Claim Dua Arah dan Serah Terima oleh Pengguna - Lost&Found]]; alasan claim tidak ditampilkan.

- **✅ Kontrak `report_context` — SELESAI backend (2026-11-01, GPT-261101-01):** field dinamai **`report_context`** (bukan `context`), hadir di `GET` **dan** `POST /api/conversations`; field `id, type, title, code, location_name, photo_url`; **`null`** bila hubungan barang tidak tersedia. Branch `feature/chat/report-context` commit `293a4ec` — **merge `develop`: sudah, deploy: belum**. Sisi mobile (kartu `chat_report_reference.dart` + `ConversationReport`) **belum merge** (`feature/ui/apply-figma-v3`, `0779f77` dkk). **Teks usulan lama (tidak dihapus):** field `context` di atas — sudah tidak berlaku (nama & cakupan endpoint diperluas).

- **✅ Claim Langsung ke Laporan Target — Phase 1a SELESAI (2026-10-23, dikonfirmasi user)** — PR #6 squash ke `develop` (`d1ef1eb`), branch `feature/claim/direct-target-claim`; **155 test lulus**. Migration `2026_10_23_000001_make_claim_reports_nullable` (`lost_report_id`/`found_report_id` nullable + CHECK `claims_target_report_check`; `accepted_at`, `closed_reason`, `closed_by` dengan guard `hasColumn`), `ClaimController::store()` kontrak aturan 1–9 + `DB::transaction`, `ClaimConversationService::forClaim()` (conversation per `claim_id`, NULL-safe, exception → 422), `ClaimTransferService` NULL-safe. Lihat [[Claim Langsung ke Laporan Target - Lost&Found]].
- **✅ Claim Langsung — Phase 1b-i SELESAI (2026-10-23, dikonfirmasi user)** — PR #7 squash ke `develop` (`cdae742`), branch `fix/claim/null-safe-claim-access` (`2897503`); **179 test lulus**. `ClaimPolicy` (`view`/`update`/`markTransferred` berbasis `Claim::receiverId()` + `Claim::isReceiver()`), `ClaimDecisionService` (accept/reject, `lockForUpdate`, hanya laporan terisi), `AdminController::acceptClaim`/`rejectClaim` NULL-safe, aksi Filament `ClaimResource` NULL-safe. **Sisa Phase 1b:** endpoint user accept/reject/withdraw + test dua `accept` bersamaan.
- **✅ Claim Langsung — Phase 2 Flutter SELESAI (2026-10-30, Ajax-261030-03)** — PR #12 squash ke `develop` (`cdc223e`), branch `feature/claim/direct-claim-flow` (commits `289cedc` + `40f1433`); **139 test lulus**. `ReportDetailView._openClaim` hapus redirect dialog "Buat laporan hilang dulu", `ClaimScreen` dropdown laporan sendiri opsional (switch OFF default, lazy load hanya bila ON), model `Claim` `lostReportId`/`foundReportId` nullable + `toJson()` kirim non-null saja (tidak kirim `claimantId`/`status`), `api_error.dart` ekstrak `errors` dulu lalu `message` + fallback koneksi Indonesia, teks tombol kirim tanpa sebutan admin. **Belum:** kartu konteks chat ~~(terblokir: GET `/api/conversations` belum field `context`, usulan F-2 butuh Bob dulu)~~ → **DIPERBARUI 2026-11-01:** backend sudah menyediakan `report_context` (merged `develop`, belum deploy); sisi mobile kartu `chat_report_reference.dart` sudah ditulis di branch `feature/ui/apply-figma-v3` (**belum merge**).
- **✅ Semantik `reject` — SELESAI 2026-10-23 (dikonfirmasi user; T-261023-05, commit `a262255`, 182 test lulus, sudah merge `develop`)** — `reject` hanya untuk claim `pending` (selain itu **422**) dan **tidak mengubah status laporan**; `ClaimDecisionService::reject` memakai `lockForUpdate` + `ClaimNotPendingException::reject()`; `AdminController::rejectClaim` dan aksi Tolak Filament menangkap exception. **Teks lama (tidak dihapus):** "`ClaimDecisionService::reject()` menerima claim dalam status apa pun dan menyetel laporan terkait kembali `pending`; berbeda dari `accept()` yang melempar `ClaimNotPendingException` (→ 422). USULAN: `reject` hanya untuk claim `pending` dan tidak mengubah status laporan." — **sudah tidak berlaku**.
- **⚠ Respons claim membocorkan model `User` mentah** — `ClaimController::index`/`show`/`update` memuat relasi `claimant` (dan `transferredBy`) tanpa `UserResource` → ikut mengirim `nim`, `whatsapp`, `email`, `blocked_reason`. Terkait plan [[Nomor WhatsApp Pengguna - Lost&Found]] dan aturan [[Security Hardening - Lost&Found]] §2 (belum diterapkan); tercatat di [[Backlog Perbaikan Lanjutan - Lost&Found]] item (xiv). **Keputusan user 2026-10-23:** diperbaiki **sekarang** lewat tugas backend terpisah (`UserResource`), setelah Ajax cek model `Claim` Flutter — bukan menunggu plan [[Nomor WhatsApp Pengguna - Lost&Found]].
- **⚠ Batas 5 pending & cek claim ganda di luar `DB::transaction`** — `ClaimController::store()` menghitung `$pendingCount` dan `$alreadyClaimed` **sebelum** transaction, sehingga dua request bersamaan bisa sama-sama lolos (risiko rendah). Usul: pindahkan ke dalam transaction dengan `lockForUpdate`.
- **⚠ Filament `ClaimResource` belum punya test otomatis** — aksi Terima/Tolak di Filament diuji lewat `ClaimDecisionService` (test service), bukan test fitur Filament.
- **⚠ Admin tidak bisa menolak claim `accepted` (2026-10-23):** setelah T-261023-05, `reject` hanya untuk `pending` (422 selain itu) dan tidak mengubah status laporan. Alur batal/tutup setelah `accepted` (`withdraw`, `closed_reason`, `closed_by`) menunggu Phase 1.2 plan lama; claim `accepted` yang macet hanya bisa dibuka lewat form **Edit Filament** (tidak mengembalikan status laporan). **Diperbarui 2026-10-24:** pengaju kini bisa `withdraw` claim `accepted` (1.2b); admin tetap tidak bisa menolak `accepted` dan hanya bisa lewat **Edit Filament**.
- **⚠ Form Edit Filament `ClaimResource` membiarkan admin mengubah `status`, `lost_report_id`, `found_report_id` bebas** (melewati aturan status) — belum dibatasi (Phase 3 Filament).
- **⚠ Aksi Tolak Filament mewajibkan `admin_note` sedangkan API `admin_note` nullable** — prioritas low.
- **✅ Fase 1.2 — accept/reject oleh penerima + withdraw oleh pengaju — SELESAI (kode), 2026-10-24** — plan [[Claim Fase 1.2 - Accept Reject Withdraw oleh Pengguna - Lost&Found]] `High`. 1.2a (commit `0f41270`, merge `develop` squash `2bafdb5`; 182 → 199 test lulus): `Claim::#[Fillable]` + cast `accepted_at` => `datetime`; `ClaimDecisionService::accept()` mengisi `accepted_at`; `ClaimPolicy::accept`/`reject` (admin ATAU `Claim::receiverId()`); endpoint `POST /api/claims/{id}/accept` & `/reject` (body `reason` wajib). 1.2b (commit `97d49c7`, merge `develop` squash `9faee99`; 199 → 215 test lulus): `ClaimPolicy::withdraw` (hanya claimant), `POST /api/claims/{id}/withdraw`, `ClaimWithdrawService` baru (`lockForUpdate`; `accepted` → laporan `claimed` kembali `pending`, `pending` → laporan tidak diubah; `accepted_at` dibiarkan sebagai jejak). 1.2c (commit `23d0be6`; **✅ merge `develop` PR #11 squash `18c85d4` (2026-10-24)**; 215 → 230 test lulus): `ClaimNotificationService` baru (FCM best-effort ke pengaju saat accepted/rejected, ke penerima saat withdrawn; payload `type` + `claim_id`) + `ClaimConcurrencyTest`. `route:list --path=claims` 12 → 14 → 15 → 15. **Tidak ada migration baru.** Jalur admin/Filament tidak diubah. Lihat [[Bob-261024-02-claim-user-accept-reject]], [[Bob-261024-03-claim-user-withdraw]], [[Bob-261024-04-claim-fcm-concurrency]].

- **✅ BUG firebase-php 8.5.0 — notifikasi serah terima tidak pernah terkirim — SELESAI (2026-10-25, sudah merge `develop`):** `ClaimTransferService::notifyClaimant` memakai API v8 `CloudMessage::new()->withToken()` (commit `a0226b4`), guard status `accepted` masuk `DB::transaction` + `lockForUpdate`, foto disimpan setelah guard lolos; 235 test lulus. **Teks lama (tidak dihapus):** ~~`ClaimTransferService::notifyClaimant` masih memakai `CloudMessage::withTarget('token', ...)`; method itu **dihapus** di firebase-php 8.5.0 (sekarang `CloudMessage::new()->withToken()`). Exception ditelan try/catch kosong → notifikasi FCM serah terima **diam-diam gagal**. Ditemukan saat 1.2c (Bob-261024-04); `ClaimNotificationService` baru memakai API v8 yang benar; `ClaimTransferService` sengaja tidak diubah (di luar lingkup 1.2c).~~
- **✅ Fase 1.2c — sudah merge `develop` (dikoreksi 2026-10-29):** branch `feature/notification/claim-decision-fcm` (`23d0be6`) **merge lewat PR #11**, squash commit `18c85d4` (2026-10-24). Verifikasi: `git fetch --all --prune` lalu `git ls-tree -r --name-only origin/develop` → `app/Services/ClaimNotificationService.php`, `tests/Feature/ClaimConcurrencyTest.php`, `tests/Feature/ClaimNotificationTest.php` ada; isi `ClaimNotificationService.php` di `develop` lebih baru dari branch (mendapat `Log::warning` token diredaksi + `DeadFcmTokenCleaner` dari Bob-261025-03/05). **Teks lama (tidak dihapus):** ~~⏳ Fase 1.2c menunggu PR: branch `feature/notification/claim-decision-fcm` (`23d0be6`) sudah push, PR belum dibuat/merge ke `develop`.~~
- **✅ FCM jalur admin/Filament — audit Bob-03 (2026-10-25):** audit membuktikan **tidak ada FCM di jalur admin** — `AdminController` tidak mengirim FCM; `Notification::make()` di Filament `ClaimResource`/`UserResource` adalah notifikasi **Filament**, bukan FCM; `ConversationController` juga tanpa FCM. Audit FCM v8 **bersih** (tidak ada API usang di `app/`). **Keputusan user 2026-10-25: FCM admin tidak diperlukan sekarang** (notifikasi admin tetap lewat Filament).

- **✅ Open items transfer claim — SELESAI 2026-10-25 (Bob-03/04/06):**
  - (a) ~~**FCM jalur admin/Filament belum diaudit**~~ → **selesai**: tidak ada FCM di jalur admin (lihat di atas).
  - (b) ~~**`UserResource` belum ditinjau**~~ → **selesai (ditinjau Bob-03)**: `UserResource` hanya memakai `Notification::make()` Filament, bukan FCM. Sisa masalah `User` mentah di respons claim tetap open (item (xiv)).
  - (c) ~~**`PATCH /api/claims/{id}` mengembalikan `200` tanpa perubahan**~~ → **selesai (Bob-04)**: route dihapus, kini **405**; `ClaimPolicy::update` tetap untuk Filament.
  - (d) ~~**ID non-UUID menghasilkan `500`**~~ → **selesai (Bob-04 + Bob-06)**: `whereUuid` di semua route API ber-param ID → **404**.

- **⚠ Open items baru (2026-11-01):**
  - **(a) Scheduler container Dokploy belum terverifikasi berjalan** — jadwal command **sudah didaftarkan** di `routes/console.php` (`Schedule::command('conversations:archive-inactive')->dailyAt('02:00')->withoutOverlapping()`, 2026-11-01), tetapi **container belum terbukti menjalankan scheduler** (`Dockerfile` runtime tidak memasang cron/`schedule:work`; supervisor hanya nginx + php-fpm). Ini memblokir **dua** hal: command `conversations:archive-inactive` ([[Arsip dan Hapus Chat - Lost&Found]] Phase 0) dan command `claims:expire`. Verifikasi + perbaikan = Phase 0 plan arsip; prioritas naik bila arsip otomatis/kedaluwarsa claim ingin dipakai.
  - **(b) `POST /api/claims/{id}/withdraw` HTTP 500 di server deploy** — **SELESAI/diperbaiki 2026-11-01** (laporan [[GPT-261101-05-fix-withdraw-500-transfer-policy]]): penyebab terkonfirmasi dari log container — resolusi dependency `Messaging` Firebase gagal (`Firebase project [lostfound-mobile] not configured`; lalu file kredensial tidak cocok format Service Account) **sebelum** action/transaksi berjalan → HTTP 500. Patch `f3b730d` memindahkan pembuatan client ke dalam try/catch best-effort; user menindaklanjuti konfigurasi Dokploy/Firebase dan **mengonfirmasi aksi claim berhasil**. Perubahan `/api/claims/{id}/withdraw` sendiri (endpoint/policy/status) **tidak berubah**. Lihat §11.
  - **(c) `ClaimPolicy::markTransferred` hanya admin + penerima** — **SELESAI/diperbaiki 2026-11-01** (`f3b730d`): kini **admin ATAU claimant (pengaju) ATAU penerima**, selaras dengan plan [[Claim Dua Arah dan Serah Terima oleh Pengguna - Lost&Found]] §4/§8. FCM serah terima dua arah (claimant→penerima, penerima→claimant, admin→claimant). Foto tetap wajib, status harus `accepted`. Commit `f3b730d` **sudah di-push dan sudah merge `develop`** (konfirmasi user 2026-11-01).
  - **(d) Notifikasi FCM claim di Flutter belum ada** — `lib/services/fcm_service.dart` hanya menangani `data['type'] == 'chat'` (dibaca 2026-11-01); backend sudah mengirim `claim_accepted`/`claim_rejected`/`claim_withdrawn` dan payload `type: chat` untuk pesan. Deep link + notifikasi daftar tetap terbuka (lihat [[Push Notification - Lost&Found]]). **Belum berubah 2026-11-01** — di luar scope patch claim; handler Flutter untuk tipe claim tetap belum dibuat.
  - **(e) Penutupan otomatis claim `pending` lain saat transfer** — **BELUM tersedia** pada base yang diperiksa (`ClaimTransferService` hanya mengubah claim terpilih + laporan terisi). **Keputusan user 2026-11-01: pertahankan scope patch** → fitur ini tetap **backlog**, jangan ditandai selesai.
  - **(f) EntryPoint deploy menjalankan `migrate --force`** sebelum cache/startup — **bukan bukti** pemeriksaan langsung skema DB deploy; item (a) scheduler + verifikasi skema live masih terbuka.
  - **(g) Scheduler container** — pemeriksaan read-only konfigurasi container (2026-11-01) tidak menemukan scheduler; supervisor hanya nginx + PHP-FPM. **Tidak ada perubahan scheduler**; cron/worker **eksternal** server **belum** diperiksa.
  - **(h) ✅ Crash native `SecurityException ACCESS_FINE_LOCATION` saat tutup form — SELESAI (2026-11-01, Ajax-261101-07 → Dominic-261101-08):** app Android crash `FATAL EXCEPTION` **native** tepat setelah submit/tutup form laporan untuk user **tanpa izin lokasi**; sudah lama terjadi, **bukan** akibat UI v3. Penyebab (logcat user): `LocationPickerSectionState.dispose()` → `LocationService.dispose()` → `Location.changeSettings()`; plugin `location` memicu `startRequestingLocation` async yang mendaftarkan NMEA listener tanpa cek izin → `SecurityException` native tidak tertangkap `try/catch` Dart. Perbaikan: `LocationService.dispose()` jadi **no-op**; plugin hanya disentuh saat tombol "Lokasi saya" ditekan. File `lib/services/location_service.dart`, branch `fix/map/location-dispose-crash`, commit `0769600`, merge `develop` PR #17 squash `f67e7617c6`. Verifikasi: `flutter analyze` 8 issue baseline (tidak bertambah), `flutter test` 188 lulus. **Konfirmasi manual user 2026-11-01:** submit 2 laporan (dengan izin lokasi & tanpa izin lokasi) tidak crash. **Belum diklaim teruji:** back tanpa submit; tombol "Lokasi saya" tanpa izin. Lihat §9.
  - **(i) Open item kecil dari perbaikan (h) — BELUM diverifikasi:** grep pemakaian plugin `location` di bagian `lib/` lain tidak dilaporkan Ajax. **Usulan (BELUM diputuskan, butuh persetujuan user — bukan keputusan):** plugin `location` sudah tua (warning KGP, open item (c) di atas); opsi ganti ke `geolocator` = **dependensi baru**.
  - **(j) Arsip & Hapus Chat — backend + Flutter sudah merge, fitur BELUM selesai penuh (2026-11-01):** backend `adcd1ee` (branch `feature/chat/archive-delete`): migration 4 kolom + endpoint archive/unarchive/delete + command `conversations:archive-inactive`. Flutter `6528324` (branch `feature/chat/archive-delete-ui`): tab Chat/Arsip, aksi arsip/keluar arsip, hapus dengan konfirmasi, penanganan 409. **Merge dikonfirmasi user — jangan klaim deploy, migration produksi, atau nomor PR tanpa bukti.** Terbuka: **(i)** Phase 3 uji manual dua akun **belum** dijalankan; **(ii)** Phase 0 verifikasi scheduler container Dokploy **belum** (jadwal command sudah didaftarkan `dailyAt('02:00')` di `routes/console.php`, tetapi container belum terbukti menjalankan scheduler) — blokir bersama `claims:expire`; **(iii)** 23 test case backend ditulis **belum berhasil dijalankan** (DB testing lokal belum ada); **(iv)** `flutter test` 193 lulus/4 skip, `analyze` 8 issue lama (0 dari file berubah); **(v)** **N+1 query di `index()` conversations** + `unread_count` per baris masih ada; **(vi)** realtime memicu reload kedua daftar tiap event `MessageSent` — berpotensi boros, perlu debounce bila terasa di perangkat; **(vii) purge (hapus fisik) tetap di luar lingkup** (tahap 2, belum diputuskan).
  - **(k) Peringatan claim aktif (2026-11-01, teks UI):** "Chat ini masih terkait claim aktif. Selesaikan atau batalkan claim terlebih dahulu sebelum menghapus chat." Hapus **diblokir (409)** dan chat dipertahankan saat 409. Frontend memakai **HTTP 409** sebagai satu-satunya penanda claim aktif — `claim_id` **bukan** penanda status aktif.

- **⚠ Open items push notification (2026-11-04):**
  - **(l) Implementasi MVP Opsi A selesai & diterima sementara (2026-11-04):** backend GPT-261104-02/04/05 (PR #24 `fdd9952`, #25 `459f969`, #27 `6f45cbf`) + Flutter GPT-261104-03/06 (PR #21 `50ce102`, #22 `6fe1330`) — **sudah merge develop**. Keenam type payload (`claim_new`, `claim_accepted`, `claim_rejected`, `claim_withdrawn`, `claim_returned`, `chat`); backend `PushNotificationService` terpusat sinkron best-effort; Flutter `FcmService` lifecycle guard per sesi, keenam type handled, foreground banner ~4s suppress chat aktif, logout PUT+conditional DELETE (budget 5s). Endpoint `PUT /api/users/me/fcm-token` (transaksi hapus token user lain), `DELETE /api/users/me/fcm-token` (conditional, body `fcm_token` wajib string, 204 cocok/null/mismatch). Verifikasi: 219+247 test Flutter, 349+361 test backend (1 gagal baseline chat), PM review 54 Flutter+route backend lulus. **Uji manual user 2026-11-04:** Firebase Console → HP berhasil; 2 akun/2 HP **"sebagian besar sudah berhasil, untuk sekarang sudah aman"**; **rincian skenario belum lengkap** (tidak ada daftar gagal/belum diuji, model HP, versi Android, atau rekaman). **Diterima sementara untuk penggunaan/pengujian saat ini, bukan audit keamanan menyeluruh**. Layar Notifikasi tetap empty state (Opsi A).
  - **(l.1) Terbuka — rincian checklist manual:** foreground/background/terminated per penerima, regresi logout belum diverifikasi satu per satu. Race PUT paralel token sama: transaksi tanpa lock per token/constraint unik belum jamin pemilik tunggal konkurensi. Logout offline/timeout/auth expired/token in-flight tidak pasti; pelepasan best-effort bukan jaminan privasi mutlak, push terkirim tidak ditarik DELETE. iOS & multi-device penuh belum diverifikasi.
  - **(l.2) #6 (claim dibekukan/aktif kembali):** status implementasi belum diverifikasi (di luar GPT-261104-02).
  - **(l.3) #7 (kedaluwarsa + pengingat):** ditunda (butuh scheduler Dokploy, lihat (m)).
  - **(l.4) #8 (status laporan diubah admin):** tidak dikerjakan (selaras keputusan 2026-10-25 FCM admin tidak diperlukan).
  - **(l.5) History/Opsi B, badge, toggle, ikon/channel khusus, push admin, event di luar 6 type:** tidak otomatis selesai.
  - **(m) Scheduler Dokploy ditunda; test gagal & N+1 SELESAI (diperbarui 2026-11-06):** **scheduler Dokploy ditunda atas keputusan user 2026-11-04 (belum prioritas)** — tetap memblokir arsip otomatis (`conversations:archive-inactive`) dan `claims:expire`. **✅ Test `ConversationArchiveTest` ... sudah diperbarui: fix `9feb665` (merge `develop`, konfirmasi user 2026-11-06) — `ConversationArchiveTest` 25 lulus, filter `Conversation` 72 lulus, suite penuh 365 lulus (1.341 assertion); chat terhapus muncul kembali bila ada pesan baru, scope `visibleTo` lama tidak lagi mengecualikan kolom hapus terisi.** **Teks lama (tidak berlaku, sebagai riwayat):** ~~Test `ConversationArchiveTest::test_unread_count_filtered_by_deleted_at` masih GAGAL (expected 1, actual 2; dari laporan GPT-261101-12, belum ditindak).~~ **✅ N+1 query `index()` conversations — SELESAI (fix `9feb665`):** `last_message`/`unread_count` lewat subquery di query daftar; jumlah query tetap **4** untuk 2 maupun 10 percakapan (sebelumnya 7 dan 23). Lihat (j)(v) dan §16.
  - **(m.1) Risiko performa subquery & catatan lingkungan tes (baru 2026-11-06):** biaya subquery ke tabel `messages` **belum diukur dengan data produksi** — pantau bila riwayat pesan membesar. Suite backend **hanya berjalan di PostgreSQL** (SQLite gagal di migration bawaan yang memakai `pg_constraint`); satu test (`ConversationTest::test_list_includes_found_target_instead_of_claimants_own_lost_report`) bergantung `APP_URL=http://localhost`.
  - **(n) Konfirmasi manual user 2026-11-04 (tanpa rincian skenario):** (1) **GPT-261101-12** (branch `fix/filament/block-delete-report-with-claims`) **sudah di-merge ke `develop`**; (2) uji manual **Arsip & Hapus Chat** (dua akun) serta **claim `accepted` → `returned` dengan foto** dinyatakan "aman dan berhasil". **FCM nyata ke perangkat BELUM diuji.** Jangan klaim rincian per peran/skenario.

- **⚠ Open items baru (2026-10-25, prioritas rendah, BELUM diputuskan):**
  - (a) **Chore Pint:** `vendor/bin/pint --test` gagal di **6 file lama** (`ListClaims.php`, `EditUser.php`, `ListUsers.php`, `AdminMiddleware.php`, `GoogleTokenVerifier.php`, `bootstrap/providers.php`) — sudah begitu di `develop`, tidak disentuh Bob-04/06 (`test_fcm.php` sudah dihapus Bob-05). Dikerjakan di branch terpisah `chore/pint-cleanup`, prioritas **rendah**.
  - (b) **Keputusan sengaja dilewati: retry/backoff untuk `ServerUnavailable`** — tidak dibuat (keputusan 2026-10-25); kegagalan tetap `Log::warning` dan request tetap 2xx.

- **⚠ Open items baru (2026-11-07):**
  - **(o.1) Regresi test pengaturan mobile — SELESAI (2026-11-07, GPT-261107-03):** test `SettingsScreen: nilai bertahan saat dibuka ulang` (`test/wa_visibility_persist_test.dart`) **sudah gagal di `develop`** sebelum perbaikan. **Penyebab menurut laporan:** redesign UI v3 (diff `3039eae`, masuk `develop` lewat `0d031d4`) mengganti `SwitchListTile` dengan `ListTile` berisi `Switch` dan mengubah label menjadi `Tampilkan Nomor WhatsApp`; finder test usang. **Bukan bug perilaku fitur WhatsApp.** Perubahan `settings_screen.dart` (branch `fix/ui/settings-wa-visibility-test`, commit `030138a`, `852ca61`): `Material` transparan dalam kartu (menyelesaikan enam assertion `ListTile`/`DecoratedBox`), `activeColor` → `activeThumbColor`, field `_pushEnabled` tak terpakai dihapus, nilai awal WhatsApp diambil dari provider di `initState`; alur `PUT /users/me/wa-visibility`, cache user, dan `AuthProvider.updateUser` dipertahankan. **Baseline mobile baru (Flutter 3.47.2, Dart 3.13.2):** `flutter analyze` **11 → 6 issue**, `flutter test` **246 lulus/4 dilewati/1 gagal → 247 lulus/4 dilewati/0 gagal**. Sumber: [[GPT-261107-03-fix-settings-wa-visibility-test]]. **Merge tiga PR pada 2026-11-07 dikonfirmasi user** (backend `chore/repo/agents-md-context` `61d6bda`; mobile `chore/repo/agents-md-context` `ceb86b6`; mobile `fix/ui/settings-wa-visibility-test` `030138a`+`852ca61`) — hash di atas adalah hash **branch**, bukan hash squash `develop`; nomor PR tidak dicatat.
  - **(o.2) Sisa temuan analyzer file test mobile (prioritas rendah):** **4 warning + 2 info** tetap ada di `test/api_client_mine_test.dart`, `test/google_sign_in_error_test.dart`, `test/home_screen_test.dart` (dead code, `unnecessary_null_comparison`, private type di public API). Bukan regresi; belum diperbaiki.
  - **(o.3) Uji perangkat nyata layar Pengaturan — BELUM dilakukan:** perbaikan (o.1) diverifikasi **hanya lewat test otomatis** (`flutter test`). Tampilan/warna layar Pengaturan **belum** diperiksa di HP; build APK dan uji manual tidak dilakukan.
  - **(o.4) RPP.md menyebut MySQL (temuan, butuh keputusan user):** lihat [[RPP]] — dokumen akademik awal, di luar lingkup perubahan; MySQL di sana bertentangan dengan PostgreSQL di dokumen ini dan `schema.dbml`. Belum diubah/dipindahkan.

- **⚠ Open items baru (2026-11-08, fitur WhatsApp — sumber [[Dominic-261108-01-catat-whatsapp-pr30-32-dan-deploy]]):**
  - **(p.1) Fitur WhatsApp backend sudah merge `develop`, tapi tombol/alur claim BELUM:** `PUT /api/users/me/whatsapp` + `PUT /api/users/me/wa-visibility` sudah merge (PR #31 `df5e22ed17`, PR #32 `6f8b43d4b5`). Nomor **belum pernah** ditampilkan ke lawan claim — alur claim (`counterpart_whatsapp`) belum dikerjakan. Tombol WhatsApp di detail laporan sudah dihapus (efek disengaja) sampai dipindah ke alur claim.
  - **(p.2) Mobile BELUM SIAP:** branch lama `feat/profile/whatsapp` (`bc8f2add8b`, tertinggal 7 commit) diulas [[GPT-261107-07-review-wa-mobile]] → **BELUM SIAP**. Temuan "rute menyimpang" di review itu **usang** (rute final terpisah). Rencana ulang branch `feature/ui/edit-profile-whatsapp` (TsaqifSatria). Rencana lanjut: (C) backend `feature/claim/counterpart-whatsapp` (field `counterpart_whatsapp` hanya di respons claim tunggal, tidak di index/`/api/admin/*`); (D) mobile tombol WhatsApp di detail claim.
  - **(p.3) Enkripsi nomor ditunda:** keputusan user 2026-11-07 — nomor **tidak dienkripsi sekarang**, ditunda ke plan terpisah. Nomor juga **tidak unik**.
  - **(p.4) UserResource chat memuat email lawan chat (butuh keputusan user):** `MessageSent` payload `sender{id,name,email}` — perlu cek apakah Flutter menampilkannya; usul hapus `email` dari `UserResource`. Lihat (b) di laporan Dominic-261108-01.
  - **(p.5) Filament `UserResource` bisa menyimpan nomor tak ternormalisasi (non-blocking):** admin bisa mengedit `whatsapp` lewat Filament tanpa normalisasi `62...` seperti endpoint API. Prioritas rendah.
  - **(p.6) Enam temuan Pint di luar diff:** `vendor/bin/pint --test` masih gagal di 6 file lama (lihat (a) di open item 2026-10-25); bukan regresi fitur WA.
  - **(p.7) Deploy otomatis Dokploy + entrypoint `migrate --force`:** Dockerfile entrypoint menjalankan `php artisan migrate --force` setiap start; PR #30/#31/#32 sudah auto-deploy dari `develop` (commit terakhir live `6f8b43d4b5`). User **mematikan auto-deploy 2026-11-08**. Strategi deploy (auto-deploy dari `develop` vs lacak `main`) **belum diputuskan** (butuh keputusan user). **Uji HP terhadap server live untuk fitur ini BELUM dilakukan.**
  - **(p.8) Baseline test (2026-11-07/2026-11-08):** backend `develop` **395 lulus / 1.672 assertion** (di branch sebelum merge #32); mobile `develop` `analyze` **6 issue** (4 warning + 2 info di file test), test **247 lulus / 4 dilewati / 0 gagal**.
  - **(p.9) Catatan merge style:** PR #31 dan #32 memakai **merge commit** (bukan squash); PR #30 **squash**. Konvensi tim tetap **Squash and merge** — #31/#32 menyimpang.
  - **(p.10) Kebersihan branch (butuh keputusan user):** backend checkout masih di `fix/chat/unread-count-n-plus-one`; branch lama `feature/api/profile-whatsapp`, `fix/api/hide-user-contact-fields`, `fix/api/whatsapp-profile-validation`, `feat/profile/whatsapp` (backend+mobile) belum dihapus. Hapus hanya bila user setuju.
  - **(p.11) Sinkronisasi docs ke repo backend BELUM:** penyalinan dokumen ke `C:\Project\lostfound-backend\docs\` ditahan (checkout di branch lain dengan perubahan lokal `README.md` milik user).
- **⚠ Open items baru (2026-11-12, chat — sumber: konfirmasi user 2026-11-12 / Dominic-261112-01):**
  - **(q.0) Kartu konteks barang di chat — SELESAI:** `report_context` + kartu Flutter **sudah merge `develop` (mobile)**, dikonfirmasi user. Hash/PR tidak diketahui. Koreksi §16 di atas. Pesan baru **langsung masuk tanpa refresh** juga dikonfirmasi user; reconnect saat app di-resume/background dan uji dua HP fisik **tidak** termasuk klaim ini.
  - **(q.1) Chat read-only + user terblokir — DIJADWALKAN, BELUM dikerjakan (dikoreksi 2026-11-12):** ditetapkan sebagai **Tugas 1** (backend, branch `feature/chat/readonly-guard`: guard di `sendMessage` → **HTTP 422** + `reason` `claim_closed|user_blocked`, field `can_send`/`readonly_reason` di `GET`/`POST /api/conversations`) dan **Tugas 2** (Flutter, `feature/chat/readonly-ui`) di [[Brief Pengembangan Real-Time Chat - Lost&Found]]. **Teks lama (tidak berlaku):** ~~"BELUM diterapkan (backlog, belum dijadwalkan)"~~. **Prasyarat:** ~~4 asumsi §10 brief belum dikonfirmasi user~~ → **SUDAH dikonfirmasi user 2026-11-12** (lihat (q.10)); **Tugas 1 boleh dimulai, belum dikerjakan**. **Read-only hanya untuk `rejected`/`withdrawn`; `returned` TETAP TERBUKA.**
  - **(q.2) Read receipt + mark-read massal — DISETUJUI sebagai backlog, BELUM dikerjakan:** event broadcast `MessageRead` + satu endpoint mark-read massal. Kolom `messages.read_at` dan `PATCH /api/messages/{id}/read` per pesan sudah ada; **tidak perlu tabel/kolom baru**.
  - **(q.3) Typing indicator — DISETUJUI backlog, BELUM dikerjakan:** memakai client event Pusher/Soketi; **butuh client events diaktifkan di app Pusher (tugas manual user)**.
  - **(q.4) Status kirim pesan (mengirim/gagal/coba lagi) + optimistic UI — DISETUJUI backlog, BELUM dikerjakan:** murni sisi Flutter.
  - **(q.5) Badge total unread di tab Chat — DISETUJUI backlog, BELUM dikerjakan:** memakai `unread_count` yang sudah ada di `GET /api/conversations`.
  - **(q.6) Quick reply verifikasi — DIKERJAKAN sekarang, BELUM selesai (dikoreksi 2026-11-12):** **Tugas 6** (Flutter, `feature/chat/quick-reply`) di [[Brief Pengembangan Real-Time Chat - Lost&Found]]. Alur mengikuti rekomendasi PM di brief (kini keputusan user): chip di atas kolom input, tap **mengisi** kolom input (tidak auto-kirim), hanya untuk penerima claim saat claim `pending` dan `canSend` true; template konstanta Dart, tanpa perubahan backend. **Teks lama (tidak berlaku):** ~~"DITUNDA (akan dikerjakan tim); alur usulan, bukan keputusan final"~~.
  - **(q.7) Throttle kirim pesan — USULAN, tidak dikerjakan:** `throttle:30,1` pada `POST /api/conversations/{id}/messages`; lihat [[Security Hardening - Lost&Found]].
  - **(q.8) Banner tips verifikasi untuk penemu — DIBATALKAN (keputusan user 2026-11-12):** tidak dikerjakan; teks lama di plan dipertahankan sebagai riwayat. **Tidak berubah.**
  - **(q.9) Delapan tugas chat — DIJADWALKAN, BELUM dikerjakan (2026-11-12):** Tugas 3 (read receipt backend: event `MessageRead` + `PATCH /api/conversations/{id}/read`), 4 (read receipt Flutter), 5 (status kirim + optimistic UI), 7 (typing indicator via client event), 8 (badge total unread) melengkapi (q.2)–(q.5). **Dikerjakan oleh tim user, bukan lewat bot Bob/Ajax.** Sumber tunggal: [[Brief Pengembangan Real-Time Chat - Lost&Found]]. **Tanpa tabel/kolom/dependensi baru — tetap 7 tabel.**
  - **(q.10) Asumsi PM di §10 brief — SUDAH DIKONFIRMASI USER 2026-11-12 (Tugas 1 boleh dimulai, belum dikerjakan):** (1) chat tanpa claim tetap terbuka, hanya chat dengan claim berakhir yang read-only — **disetujui**; (2) **read-only hanya `rejected` dan `withdrawn`; `returned` TETAP TERBUKA** — keputusan user, menggantikan usulan awal PM; (3) penolakan kirim HTTP 422 + field `reason` (`claim_closed`/`user_blocked`) — **disetujui**; (4) hanya pengirim yang diblokir yang dibatasi — **disetujui**. **Teks lama (tidak berlaku):** ~~"MENUNGGU KONFIRMASI USER… (2) claim `returned` ikut membuat chat read-only … Tugas 1 jangan dimulai sebelum ini dikonfirmasi."~~
  - **(q.11) Client Events Pusher — DIPUTUSKAN DIAKTIFKAN, BELUM dilakukan (2026-11-12):** keputusan user (lewat saran PM) — **akan diaktifkan** sebagai tugas manual user di pengaturan app Pusher (nanti Soketi: `SOKETI_DEFAULT_APP_ENABLE_CLIENT_MESSAGES=true`), prasyarat **Tugas 7 (typing indicator)**. **Status: belum dilakukan sampai user mengonfirmasi aktif.** **Teks lama:** ~~"BELUM AKTIF … Belum dikonfirmasi aktif oleh user."~~
  - **(q.12) Urutan brief chat vs pekerjaan WhatsApp — DIPUTUSKAN 2026-11-12:** chat dan WhatsApp dikerjakan **orang berbeda, paralel**. **Tugas WhatsApp D** (mobile, `feature/claim/whatsapp-contact-button`) **merge dulu** sebelum Tugas chat Flutter yang menyentuh `chat_screen.dart`. **Boleh mulai sekarang:** Tugas **1**, **3** (backend) dan **8** (badge unread). **Menunggu D merge:** Tugas **2, 4, 5, 6, 7**. Alasan: perbaikan review D kemungkinan menyentuh `chat_screen.dart` + `claim_actions.dart`; `lib/models/claim.dart` dan `api_client.dart` dipakai kedua pihak. Jangan selesaikan konflik dengan rebase. **Status review WhatsApp (dari laporan saja):** C [[GPT-261109-01]] **APPROVE DENGAN CATATAN**; D [[GPT-261110-02]] **REQUEST CHANGES**; **status merge C/D tidak diketahui**. Lihat [[Brief Pengembangan Real-Time Chat - Lost&Found]] §6 dan [[Nomor WhatsApp Pengguna - Lost&Found]].
