---
type: plan
project: lost-found
status: active
priority: medium
created: 2026-10-11
updated: 2026-10-16
summary: Backlog perbaikan lanjutan — item 1, 2, 3, 4, 5, 6, 7, 8, 9 selesai; dev email dinormalisasi; sisa open items (job pembersih foto yatim DITUNDA, audit claims/proof ke plan Claim Dua Arah, batasi dev email ditunda, Pint) + usulan (ix) sampai (xiii)
---

# Backlog Perbaikan Lanjutan - Lost&Found

**Created:** 2026-10-11  
**Updated:** 2026-10-16  
**Project:** [[PBL]] Lost&Found  
**Status:** Active  
**Priority:** Medium  
**Sumber:** [[Perbaikan Flow Claim dan Form Laporan - Lost&Found]] (semua bug selesai 2026-10-11, backlog dipindah ke sini)

---

## Goal

Menyelesaikan backlog yang tersisa setelah semua bug utama (1, 2a, 2b, 3) selesai dan ter-merge ke `main`.

---

## Item Prioritization

**Prioritas final (ditetapkan user 2026-10-13, diperbarui 2026-10-15):**

| Item | Prioritas final | Alasan |
|------|------------------|--------|
| Pembersihan file tooling agent di `main` Laravel | ✅ Selesai (2026-10-12) | File `.agents/`, `.claude/`, `.mcp.json`, `opencode.json`, `boost.json`, perubahan `composer.*` ikut ter-merge lewat `git add -A` |
| Rotasi key `firebase-service-account.json` + `git filter-repo` | ✅ Selesai (2026-10-12) | Key terekspos di history git |
| Item 1 — Validasi field wajib sebelum upload foto + rollback foto yatim | ✅ Selesai (2026-10-15) | Foto yatim muncul saat validasi gagal setelah upload; validasi & rollback diterapkan di Flutter |
| Item 2 — Error `register_screen.dart:43` | ✅ Selesai (2026-10-15) | File usang dihapus + `dart fix` + log rollback upload; analyze 0 error |
| Item 3 — Endpoint "laporan saya" (`?mine=1`) | ✅ Selesai (2026-10-15) | Filter `mine=1` di index lost/found reports; backward compatible; 7 test pass |
| Item 4 — URL foto relatif | ✅ Selesai (2026-10-14) | Path relatif di DB, URL dibangun di response; teruji di HP |
| Item 5 — Riwayat laporan saya di tab Profil | ✅ Selesai (2026-10-16) | branch `feature/my-reports-history`; flutter analyze 0 error; flutter test 55/55 lulus; merge ke main sudah; lihat [[Backlog Perbaikan Lanjutan - Lost&Found]] Item 5 |
| Item 6 — Pembedaan halaman View Lost vs Found di Filament | ✅ Selesai (2026-10-16) | 6 file Page dipisah (1 file 1 class); merge + 108 test lulus |
| Item 9 — Kepemilikan foto pada `POST /api/photos/delete` | ✅ Selesai (2026-10-15) | Opsi C diterapkan; Cache owner + kode 403/409/422 |

---

## Sudah Selesai

### Celah Lanjutan Bug 3: Blokir Terima bila Laporan Hilang Bukan `pending`

**Status:** ✅ Selesai (DailyChanges 2026-10-09: "Bug 3 + celah acceptClaim | Selesai (dikonfirmasi user)"; commit `20d8164`, merge `b1e5556`)

**Masalah awal:**
`acceptClaim` belum memeriksa status laporan hilang. Satu laporan hilang yang diklaim ke dua temuan berbeda bisa diterima dua kali.

**Target:**
Blokir aksi Terima (endpoint 422 dan Filament disabled) bila `lostReport.status` bukan `pending`, plus test.

**Keputusan (2026-10-06, tetap berlaku):**
- Saat satu claim diterima, claim lain yang masih `pending` pada temuan yang sama **dibiarkan**; admin yang memutuskan (terima/tolak) satu per satu. Tidak ada auto-reject.
- Setelah satu claim `accepted` dan temuan berstatus `claimed`, claim `pending` lain tetap tampil di Filament sampai admin memprosesnya. Aksi Terima pada claim lain untuk temuan yang sudah `claimed` perlu diblokir atau diberi peringatan jelas di Filament.

---

## Item 1 — Validasi Field Wajib Sebelum Upload Foto + Rollback Foto Yatim

**Status:** ✅ Selesai (2026-10-15)  
**Prioritas:** ~~Medium~~ — selesai  
**Sumber:** DailyChanges 2026-10-09 temuan 1

### Masalah
Foto di-upload ke Laravel Storage sebelum validasi field wajib selesai. Bila validasi gagal setelah upload, foto tetap tersimpan di storage (foto yatim).

### Target
- Validasi field wajib (judul, deskripsi, koordinat, kategori) di Flutter **sebelum** memanggil endpoint upload foto.
- Bila upload foto gagal di tengah proses atau validasi create report gagal setelah upload, rollback: hapus foto yang sudah ter-upload di sesi tersebut (via `POST /api/photos/delete` atau endpoint serupa).

### Hasil (2026-10-15)
- Branch Flutter `fix/report-validation-photo-rollback`, commit `acec23d`; **47 test lulus**; **build debug OK**; **tes manual di HP: semua berhasil** (dikonfirmasi user).
- Validasi field wajib dijalankan **sebelum** upload foto; foto di-rollback bila upload/create report gagal; guard double-submit ditambahkan di form laporan hilang **dan** form laporan temuan.
- Merge ke `main`: **sudah** (dikonfirmasi user).
- Catatan: alur rollback kini mencatat kegagalan `403`/`409` dari `photos/delete` sebagai log (bukan error fatal) — lihat juga Item 2.

---

## Item 2 — Error `register_screen.dart:43`

**Status:** ✅ Selesai (2026-10-15)  
**Prioritas:** ~~Medium~~ — selesai  
**Sumber:** Laporan Coding Agent (dilabeli "pre-existing")

### Masalah
Error analyze di `register_screen.dart` baris 43. Dilaporkan agent sebagai "pre-existing". Perlu dicek apakah sisa `RegisterScreen` dari migrasi SSO (DailyChanges 2026-10-10).

### Target
- Cek apakah error berasal dari kode `RegisterScreen` lama yang tidak ikut diperbarui saat migrasi SSO.
- Bila ya, perbarui agar sesuai dengan flow SSO (Google sign-in + fallback form).
- Bila bukan, catat penyebab sebenarnya dan buka issue terpisah bila perlu.

### Hasil (2026-10-15)
- Branch `chore/analyze-cleanup`, commit `eae5bad`, `a5735ff`, `3e20c5f`; **47 test lulus**; **build OK**.
- `register_screen.dart` dan `create_report_base.dart` **dihapus** (tidak lagi direferensikan); **62 auto-fix** `dart fix` diterapkan; log rollback upload diperbaiki (kegagalan `403`/`409` diabaikan, tidak menggagalkan alur).
- `flutter analyze`: **0 error**; sisa ±13 info (`avoid_print` 8, `use_build_context_synchronously` 1, test 4).
- Merge ke `main`: **sudah**. Tes manual HP + verifikasi FCM token: **berhasil** (dikonfirmasi user).
- Temuan lanjutan (low, usulan): ganti `print` → `debugPrint` (info `avoid_print`).

---

## Item 3 — Endpoint "Laporan Saya" (`?mine=1`)

**Status:** ✅ Selesai (2026-10-15)  
**Prioritas:** Medium  
**Sumber:** Tabel Backlog Terkait plan Perbaikan Flow Claim

### Masalah
Dropdown claim saat ini difilter di Flutter dari 20 item pertama. Tidak efisien bila laporan banyak.

### Target
Tambahkan endpoint `GET /api/lost-reports?mine=1` dan `GET /api/found-reports?mine=1` yang hanya mengembalikan laporan milik user yang sedang login (via Sanctum `auth()->id()`).

### Hasil (2026-10-15)
- Branch `feature/mine-filter`, commit `371fad5`; **7/7 test pass** (`tests/Feature/MineFilterTest.php`, 22 assertions).
- `GET /api/lost-reports?mine=1` dan `GET /api/found-reports?mine=1` hanya mengembalikan laporan milik user login (Sanctum `auth()->id()`); **format respons & pagination sama** seperti index biasa; **tanpa `mine` (atau `mine=0`) perilaku lama tidak berubah** (backward compatible). Urutan terbaru dulu. `mine=1` tanpa token → `401` (middleware yang ada).
- Kombinasi `mine=1&status=pending` **bekerja** (index sudah mendukung filter status — tidak ada filter baru).
- File diubah: `app/Http/Controllers/LostReportController.php`, `app/Http/Controllers/FoundReportController.php`, `tests/Feature/MineFilterTest.php`, `routes/api.php`. Tidak ada tabel/kolom/dependensi baru.
- Merge ke `main`: **sudah**. `php artisan test` penuh: **lulus** (dikonfirmasi user).
- Risiko: tidak ada (backward compatible).

---

## Item 4 — URL Foto Relatif

**Status:** ✅ Selesai (2026-10-14)  
**Prioritas:** ~~High (sebelum demo)~~ — selesai  
**Sumber:** Tabel Backlog Terkait plan Perbaikan Flow Claim

### Masalah
URL foto absolut tersimpan di DB. Bila ganti jaringan/domain, URL patah.

### Target
Simpan path relatif di DB (mis. `reports/uuid.jpg`). Bangun URL lengkap saat response API (`APP_URL . '/storage/' . $photo_path`).

### Hasil (2026-10-14)
- Branch `feature/relative-photo-url`, commit `de291ab`; 86 test lulus. Sudah di-merge ke `main` dan di-push (dikonfirmasi user). APK dibuild ulang; teruji di HP: foto tampil.
- DB menyimpan **path relatif** (`reports/uuid.jpg`, `claims/proof/uuid.jpg`). Response API membangun URL lengkap lewat accessor model (`APP_URL` + `/storage/` + path), jadi ganti IP/domain cukup ubah `APP_URL`. Struktur kolom **tidak berubah**.
- Berlaku untuk `lost_reports.photo_urls`, `found_reports.photo_urls`, `claims.proof_of_transfer_photo_url`.
- `POST /api/photos/upload` mengembalikan `{url, path}` (201). `POST /api/photos/delete` menerima URL lengkap atau path relatif, dinormalisasi, wajib berawalan `reports/` atau `claims/proof/`, path traversal ditolak.
- Create report menerima URL lengkap ATAU path relatif (dinormalisasi ke relatif); domain asing ditolak 422.
- Migration `2026_10_14_094758_normalize_photo_urls_to_relative_paths`: 2 baris `lost_reports` + 1 `found_reports` dimigrasi, `claims` 0; idempoten; `down()` no-op (rollback = restore backup JSON).
- Temuan keamanan terkait (kepemilikan foto saat delete) dicatat sebagai **Item 9** di bawah.

---

## Item 5 — Riwayat Laporan Saya di Tab Profil

**Status:** ✅ Selesai (2026-10-16)  
**Prioritas:** ~~Low~~ — selesai  
**Sumber:** Tabel Backlog Terkait plan Perbaikan Flow Claim

### Masalah
`onTap` riwayat laporan di tab Profil masih kosong.

### Target
Implementasi navigasi ke daftar laporan milik user (pakai endpoint Item 3, ✅ selesai 2026-10-15).

### Hasil (2026-10-16)
- Repo Flutter `C:\Project\lostfound-mobile`, branch `feature/my-reports-history`, 3 commit: `69ed4c4` fix: sembunyikan bar bawah untuk pemilik laporan + tambah chip "Laporan Anda"; `a9f13f8` fix: locale init, parsing field code, timezone handling; `83c40cd` fitur riwayat laporan di profil dengan tab Hilang/Temuan.
- Merge ke `main`: **Sudah**. `flutter analyze`: 0 error. `flutter test`: 55/55 lulus (sebelumnya 47). `flutter build apk --debug`: sukses. **Tes manual di HP: berhasil** (dikonfirmasi user).
- **Yang dibangun:** ApiClient.getLostReports() & getFoundReports() — parameter opsional `mine` (default `false`; bila true kirim `mine=1`); memakai endpoint backend Item 3 (sudah selesai). Layar baru `lib/screens/profil/my_reports_screen.dart` — dua tab (**Hilang** \| **Temuan**), pagination (load more), pull-to-refresh, kartu berisi foto + judul + kode + tanggal + badge status, tap membuka layar detail yang sudah ada, state kosong "Belum ada laporan" & state error. `profil_screen.dart`: tile "Riwayat Laporan" kini membuka MyReportsScreen.
- **Bug perbaikan saat tes HP:** (1) crash `LocaleDataException` (DateFormat `'id_ID'` belum diinisialisasi) → `await initializeDateFormatting('id_ID')` di `main.dart` sebelum `runApp`; (2) kartu tampil UUID, bukan kode laporan → model `LostReport` & `FoundReport` punya field `code` (nullable, di-parse dari `json['code']`, **tidak ikut `toJson`** karena kode dibuat backend) +4 test parsing code; (3) tanggal bisa mundur sehari (API mengirim UTC) → `.toLocal()` pada tanggal di kartu; (4) layar detail tampil bar bawah (Chat WhatsApp / "Ini laporan Anda" terpotong) untuk pemilik → bar bawah disembunyikan di `lost_report_detail_screen.dart` & `found_report_detail_screen.dart`, diganti chip kecil "Laporan Anda" di samping `StatusBadge`; bukan pemilik: perilaku tidak berubah.

---

## Item 6 — Pembedaan Halaman View Lost vs Found di Filament

**Status:** ✅ Selesai (2026-10-16)  
**Prioritas:** ~~Medium~~ — selesai  
**Sumber:** Tabel Backlog Terkait plan Perbaikan Flow Claim

### Masalah
Halaman View Lost Report dan View Found Report di Filament kemungkinan belum dibedakan (tampilan sama atau belum ada customization khusus).

### Target
Prompt sudah dikirim. Tunggu konfirmasi hasil dari user atau Coding Agent.

### Hasil (2026-10-16)
- Branch backend `fix/filament-report-pages`, commit `5f0acd9` + `72c7de1`; **`php artisan test`: 108/108 lulus**. **Merge ke `main`: sudah** (dikonfirmasi user 2026-10-16).
- **Temuan:** infolist Lost vs Found **SUDAH dibedakan sebelumnya**; masalah sebenarnya adalah semua Page class (View/Create/Edit) **menumpuk** di `ListLostReports.php` dan `ListFoundReports.php`. Kini dipisah jadi **6 file** — `ViewLostReport`, `CreateLostReport`, `EditLostReport`, `ViewFoundReport`, `CreateFoundReport`, `EditFoundReport` — **satu file satu class**; `List*.php` hanya berisi class List.
- **Tes manual di browser `/admin` berhasil** (dikonfirmasi user): list/view/edit/create Lost & Found; **View Lost** menampilkan `lost_date` tanpa jam + label "Pelapor"; **View Found** menampilkan `found_date` dengan jam + label "Penemu (Pelapor)"; edit record berfoto tersimpan tanpa error.
- **Catatan teknis `->url()` pada field `photo_urls`:** sempat dihapus dan label diganti "Path Foto", lalu **DIKEMBALIKAN** (`->url()` + "URL Foto") karena accessor `photo_urls` mengembalikan URL lengkap dan mutator menormalkan ke path relatif saat save. **Hasil akhir: tidak ada perubahan perilaku form foto.**
- Catatan (usulan, belum diputuskan): halaman List Lost/Found tidak punya header action (tombol "New").

---

## Item 7 — Pembersihan File Tooling Agent di `main` Laravel

**Status:** ✅ Selesai (2026-10-12, dikonfirmasi user)  
**Prioritas usulan:** ~~High (sebelum push)~~ — selesai  
**Sumber:** Tabel Backlog Terkait plan Perbaikan Flow Claim

### Masalah
File tooling agent (`.agents/`, `.claude/`, `.mcp.json`, `opencode.json`, `boost.json`) dan perubahan `composer.*` yang tidak perlu ikut ter-merge ke `main` lewat `git add -A`.

### Hasil (2026-10-12)
- Folder `.agents/` dan `.claude/` dibuang dari history backend lewat `git filter-repo` (bersamaan dengan Item 8).
- `AGENTS.md` dan `CLAUDE.md` dikonfirmasi user **sengaja ter-track** — tidak dihapus, aman.
- Repo backend dipindah ke GitHub (`Davinciz/lostfound-backend`, Private). Folder backend lama (`D:\PBL\lostfound`) tidak dipakai lagi; diganti clone baru di `C:\Project\lostfound-backend`.
- Lihat DailyChanges 2026-10-12 untuk detail migrasi.

---

## Item 8 — Rotasi Key `firebase-service-account.json` + `git filter-repo`

**Status:** ✅ Selesai (2026-10-12, dikonfirmasi user)  
**Prioritas usulan:** ~~High (sebelum repo Public)~~ — selesai  
**Sumber:** Tabel Backlog Terkait plan Perbaikan Flow Claim

### Masalah
Key `firebase-service-account.json` terekspos di history git.

### Hasil (2026-10-12)
- Key service account Firebase dirotasi: key lama (dibuat 2026-09-28) dihapus di Google Cloud; key baru dibuat 2026-10-12.
- `git filter-repo` dijalankan untuk membuang `storage/firebase-service-account.json` dari history backend. Hash commit berubah.
- Repo backend dipindah ke GitHub (`Davinciz/lostfound-backend`, Private). Folder backend lama tidak dipakai lagi; diganti clone baru.
- Lihat DailyChanges 2026-10-12 untuk detail migrasi.

### Catatan
- Repo GitHub tetap **Private**.
- Aman dijadikan Public hanya setelah dicek ulang bersih (pastikan tidak ada key/secret lain tersisa di history).

---

## Item 9 — Kepemilikan Foto pada `POST /api/photos/delete`

**Status:** ✅ Selesai (2026-10-15)  
**Prioritas:** ~~Medium (ditetapkan user 2026-10-14)~~ — selesai  
**Sumber:** Temuan sesi Item 4 (2026-10-14)

### Masalah
`POST /api/photos/delete` tidak mengecek kepemilikan foto. User terautentikasi mana pun bisa menghapus file `reports/` atau `claims/proof/` milik user lain bila tahu path-nya.

### Dampak Keamanan
- Penghapusan foto milik orang lain (tidak ada otorisasi per-baris).
- Nama file berbasis UUID sulit ditebak, tetapi itu **bukan** kontrol akses; kebocoran URL (mis. dibagikan) membuka penghapusan.

### Target
Hanya pemilik/pengunggah foto yang boleh menghapus, **atau** penghapusan hanya lewat alur edit/hapus laporan.

### Keputusan Desain (2026-10-14): **Opsi C**
- **✅ Opsi C (DIPILIH):** Gabungan — endpoint delete tetap ada, tetapi hanya untuk foto yang belum dirujuk dan milik user.
- ~~Opsi A:~~ Cek kepemilikan lewat referensi di DB — foto hanya boleh dihapus bila dirujuk oleh laporan/claim milik user yang meminta. *(tidak dipilih)*
- ~~Opsi B:~~ Hilangkan endpoint delete bebas; hapus foto hanya lewat alur edit/hapus laporan. *(tidak dipilih)*
- Tidak mengusulkan tabel/kolom baru sebagai keputusan.

### Hasil (2026-10-15)
- Branch backend `fix/photo-delete-ownership`, commit `b2ab837` (Item 9); **101 test lulus** (sebelumnya 86). Merge ke `main`: **sudah** (dikonfirmasi user).
- **Upload** mencatat kepemilikan: Cache `photo-owner:{path}` → `user_id`, TTL 24 jam (`CACHE_STORE=database`). Tidak ada tabel/kolom baru.
- **Delete** menerapkan kepemilikan & rujukan:
	- `403` — foto tidak tercatat sebagai milik peminta (atau bukan miliknya).
	- `409` — foto masih dirujuk (`lost_reports.photo_urls`, `found_reports.photo_urls`, `claims.proof_of_transfer_photo_url`).
	- `422` — domain asing / path traversal.
- Foto lama (pra-fitur, tidak punya catatan owner) **selalu `403`** — sengaja, karena sudah dirujuk oleh laporan (lihat open item foto yatim & job pembersih).

---

## Open Items (2026-10-16)

**Catatan (belum dikerjakan; menunggu keputusan user):**

- **(i) Dev email (`GOOGLE_DEV_EMAILS`)** — ✅ **Dinormalisasi (2026-10-15):** ternyata normalisasi daftar (trim, lowercase, buang entri kosong) **sudah ada sejak awal** di `config/services.php` dan `AuthController`; sesi 2026-10-15 hanya menambah **4 test**. Catatan lama "belum dikerjakan" di DailyChanges 2026-10-14 **diluruskan di log 2026-10-15** (log lama tidak diubah). **Pembatasan ke `local`/`testing` → KEPUTUSAN 2026-10-15: TETAP DITUNDA.** Ini **syarat sebelum staging**, bukan pekerjaan sekarang; digarap saat menyiapkan staging.
- **(ii) Wajib `php artisan storage:link` di setiap setup/clone baru** — symlink `public/storage` dan isi `storage/app/public` **tidak ikut Git**; wajib dibuat dan foto lama disalin di tiap clone baru.
- **(iii) 11 file Pint lama + `test_fcm.php`** — keputusan 2026-10-14: prioritas **low**, dikerjakan nanti di **branch terpisah `chore/pint-cleanup`**; `test_fcm.php` dihapus bila ter-track git. **Belum dikerjakan.** (Daftar: ListClaims, EditUser, ListUsers, AdminController, ClaimController, SearchController, AdminMiddleware, GoogleTokenVerifier, `bootstrap/app.php`, `providers.php`, dan `test_fcm.php` di root repo.)
- **(iv) Folder lama `D:\PBL\lostfound`** — ✅ **Inventaris SELESAI (2026-10-14):** tidak ada branch belum ter-merge, `git status` bersih, 72 file foto di `storage/app/public` sudah identik dengan folder baru (3 file hanya ada di folder baru). Folder lama **boleh dihapus setelah user zip cadangan**; **BELUM dihapus**.
- **(v) Job pembersih foto yatim terjadwal** — **KEPUTUSAN 2026-10-15: DITUNDA.** Dampaknya hanya ruang disk, dan sejak Item 1 foto yatim baru tidak muncul lagi (rollback berjalan). Cukup dibuat plan **hanya bila penyimpanan mulai jadi masalah**. Tidak ada plan sekarang.
- **(vi) Audit rollback foto bukti serah terima (`claims/proof`)** — **KEPUTUSAN 2026-10-15: dikerjakan bersama [[Claim Dua Arah dan Serah Terima oleh Pengguna - Lost&Found]].** Foto bukti serah terima wajib di plan tersebut, jadi alur upload-nya akan disentuh lagi; mengaudit sekarang = mengaudit dua kali. Tidak dikerjakan terpisah.
- **(vii) [Low] Ganti `print` → `debugPrint` (info `avoid_print`)** — sisa 8 info `avoid_print` di analisis Flutter. Usulan prioritas low.
- **(viii) [Low, usulan] Header action "New" di halaman List Lost/Found Filament** — halaman List Lost/Found saat ini tidak punya header action (tombol "New"). Usulan, belum diputuskan.
- **(ix) [Low, usulan] claim_screen.dart masih mengambil GET /lost-reports?status=pending** — alihkan ke mine=true (menggunakan endpoint Item 3); bisa dikerjakan terpisah atau bersama plan Claim Dua Arah; belum diputuskan.
- **(x) [Low, usulan] Tombol "Chat WhatsApp" di layar detail (non-pemilik) adalah stub** — WhatsAppService.generateChatLink() dipanggil tapi hasilnya dibuang, url_launcher tidak dipanggil; terkait plan Real-Time Chat; belum diputuskan.
- **(xi) [Low, usulan] MyReportsScreen: pull-to-refresh** — spinner penuh menggantikan daftar, setState tanpa cek `mounted`, `_lastPage` tidak diperbarui saat load more. Usulan perapian kecil.
- **(xii) [Low, usulan] Format tanggal tidak konsisten** — layar detail memakai DateFormat('dd MMMM yyyy') tanpa locale eksplisit & tanpa .toLocal(); MyReportsScreen memakai 'dd MMM yyyy' + id_ID + .toLocal(). Usulan menyamakan.
- **(xiii) [Low, usulan] ApiClient memakai LogInterceptor mencetak header Authorization** — token Sanctum terbaca di log. Usulan: matikan log header di build non-debug (catatan keamanan/Security Hardening; isi token tidak dicatat di vault)

---

## Open items dari DailyChanges 2026-10-10

**Catatan (belum dikerjakan; bukan item bernomor):**

- **Consent screen Google OAuth masih berstatus Testing** — ubah ke **In production** sebelum dipakai umum.
- **Konfirmasi pola email dan panjang NIM mahasiswa** — 8 digit masih asumsi.
- **Uji login akun dosen/karyawan/Gmail** — pastikan ditolak bila belum (verifikasi allowlist domain).

---

## Related Files

- **Plan asal:** [[Perbaikan Flow Claim dan Form Laporan - Lost&Found]]
- **Laravel:** `C:\Project\lostfound-backend` (GitHub: `Davinciz/lostfound-backend`, Private)
- **Flutter:** `C:\Project\lostfound-mobile` (GitHub: `Davinciz/lostfound-mobile`, Private)
- **DailyChanges:** [[2026-10-09]], [[2026-10-10]], [[2026-10-11]], [[2026-10-12]], [[2026-10-14]], [[2026-10-15]], [[2026-10-16]]

---

#plan #lost-and-found #backlog #claim #photo #register #endpoint #security
