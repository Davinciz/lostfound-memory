---
type: plan
project: lost-found
status: active
priority: medium
created: 2026-10-11
updated: 2026-10-14
summary: Backlog perbaikan lanjutan — item 4, 7, 8 selesai; item 9 (kepemilikan photos/delete) prioritas final medium, dikerjakan bersama item 1; sisa item 1–3, 5, 6 + open items (dev email, Pint, folder lama)
---

# Backlog Perbaikan Lanjutan - Lost&Found

**Created:** 2026-10-11  
**Updated:** 2026-10-14  
**Project:** [[PBL]] Lost&Found  
**Status:** Active  
**Priority:** Medium  
**Sumber:** [[Perbaikan Flow Claim dan Form Laporan - Lost&Found]] (semua bug selesai 2026-10-11, backlog dipindah ke sini)

---

## Goal

Menyelesaikan backlog yang tersisa setelah semua bug utama (1, 2a, 2b, 3) selesai dan ter-merge ke `main`.

---

## Item Prioritization

**Prioritas final (ditetapkan user 2026-10-13, diperbarui 2026-10-14):**

| Item | Prioritas final | Alasan |
|------|------------------|--------|
| Pembersihan file tooling agent di `main` Laravel | ✅ Selesai (2026-10-12) | File `.agents/`, `.claude/`, `.mcp.json`, `opencode.json`, `boost.json`, perubahan `composer.*` ikut ter-merge lewat `git add -A` |
| Rotasi key `firebase-service-account.json` + `git filter-repo` | ✅ Selesai (2026-10-12) | Key terekspos di history git |
| Item 1 — Validasi field wajib sebelum upload foto + rollback foto yatim | **Medium** | Foto yatim muncul saat validasi gagal setelah upload |
| Item 2 — Error `register_screen.dart:43` | **Medium** | Dilaporkan agent sebagai "pre-existing", perlu dicek |
| Item 3 — Endpoint "laporan saya" (`?mine=1`) | **Medium** | Dropdown claim saat ini difilter di Flutter dari 20 item pertama |
| Item 4 — URL foto relatif | ✅ Selesai (2026-10-14) | Path relatif di DB, URL dibangun di response; teruji di HP |
| Item 5 — Riwayat laporan saya di tab Profil | **Low** | `onTap` masih kosong |
| Item 6 — Pembedaan halaman View Lost vs Found di Filament | **Medium** | Prompt sudah dikirim, hasil belum dikonfirmasi |
| Item 9 — Kepemilikan foto pada `POST /api/photos/delete` | **Medium** (final, 2026-10-14) | Dikerjakan bersama Item 1; user terautentikasi mana pun bisa hapus foto milik user lain |

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

**Status:** ⬜ Belum dikerjakan  
**Prioritas:** Medium  
**Sumber:** DailyChanges 2026-10-09 temuan 1

### Masalah
Foto di-upload ke Laravel Storage sebelum validasi field wajib selesai. Bila validasi gagal setelah upload, foto tetap tersimpan di storage (foto yatim).

### Target
- Validasi field wajib (judul, deskripsi, koordinat, kategori) di Flutter **sebelum** memanggil endpoint upload foto.
- Bila upload foto gagal di tengah proses atau validasi create report gagal setelah upload, rollback: hapus foto yang sudah ter-upload di sesi tersebut (via `POST /api/photos/delete` atau endpoint serupa).

---

## Item 2 — Error `register_screen.dart:43`

**Status:** ⬜ Belum dikerjakan  
**Prioritas:** Medium  
**Sumber:** Laporan Coding Agent (dilabeli "pre-existing")

### Masalah
Error analyze di `register_screen.dart` baris 43. Dilaporkan agent sebagai "pre-existing". Perlu dicek apakah sisa `RegisterScreen` dari migrasi SSO (DailyChanges 2026-10-10).

### Target
- Cek apakah error berasal dari kode `RegisterScreen` lama yang tidak ikut diperbarui saat migrasi SSO.
- Bila ya, perbarui agar sesuai dengan flow SSO (Google sign-in + fallback form).
- Bila bukan, catat penyebab sebenarnya dan buka issue terpisah bila perlu.

---

## Item 3 — Endpoint "Laporan Saya" (`?mine=1`)

**Status:** ⬜ Belum dikerjakan  
**Prioritas:** Medium  
**Sumber:** Tabel Backlog Terkait plan Perbaikan Flow Claim

### Masalah
Dropdown claim saat ini difilter di Flutter dari 20 item pertama. Tidak efisien bila laporan banyak.

### Target
Tambahkan endpoint `GET /api/lost-reports?mine=1` dan `GET /api/found-reports?mine=1` yang hanya mengembalikan laporan milik user yang sedang login (via Sanctum `auth()->id()`).

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

**Status:** ⬜ Belum dikerjakan  
**Prioritas:** Low  
**Sumber:** Tabel Backlog Terkait plan Perbaikan Flow Claim

### Masalah
`onTap` riwayat laporan di tab Profil masih kosong.

### Target
Implementasi navigasi ke daftar laporan milik user (pakai endpoint Item 3 bila sudah ada).

---

## Item 6 — Pembedaan Halaman View Lost vs Found di Filament

**Status:** ⬜ Belum dikerjakan (prompt sudah dikirim, hasil belum dikonfirmasi)  
**Prioritas:** Medium  
**Sumber:** Tabel Backlog Terkait plan Perbaikan Flow Claim

### Masalah
Halaman View Lost Report dan View Found Report di Filament kemungkinan belum dibedakan (tampilan sama atau belum ada customization khusus).

### Target
Prompt sudah dikirim. Tunggu konfirmasi hasil dari user atau Coding Agent.

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

**Status:** ⬜ Belum dikerjakan (dikerjakan bersama Item 1 di sesi berikutnya)  
**Prioritas final:** Medium (ditetapkan user 2026-10-14)  
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

---

## Open Items (2026-10-14)

**Catatan (belum dikerjakan; menunggu keputusan user):**

- **(i) Dev email (`GOOGLE_DEV_EMAILS`)** — keputusan 2026-10-14: **normalisasi daftar email akan dikerjakan** (trim, lowercase, buang entri kosong) — perubahan kecil. **Pembatasan ke `local`/`testing` DITUNDA** sampai ada staging bersama; dicatat sebagai **syarat sebelum deploy/staging**. (Latar: `explode(',', env(...))` mengembalikan `['']` saat kosong dan tidak di-trim/lowercase; pelonggaran cek domain berlaku di semua env selain `production`.)
- **(ii) Wajib `php artisan storage:link` di setiap setup/clone baru** — symlink `public/storage` dan isi `storage/app/public` **tidak ikut Git**; wajib dibuat dan foto lama disalin di tiap clone baru.
- **(iii) 11 file Pint lama + `test_fcm.php`** — keputusan 2026-10-14: prioritas **low**, dikerjakan nanti di **branch terpisah `chore/pint-cleanup`**; `test_fcm.php` dihapus bila ter-track git. **Belum dikerjakan.** (Daftar: ListClaims, EditUser, ListUsers, AdminController, ClaimController, SearchController, AdminMiddleware, GoogleTokenVerifier, `bootstrap/app.php`, `providers.php`, dan `test_fcm.php` di root repo.)
- **(iv) Folder lama `D:\PBL\lostfound`** — ✅ **Inventaris SELESAI (2026-10-14):** tidak ada branch belum ter-merge, `git status` bersih, 72 file foto di `storage/app/public` sudah identik dengan folder baru (3 file hanya ada di folder baru). Folder lama **boleh dihapus setelah user zip cadangan**; **BELUM dihapus**.

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
- **DailyChanges:** [[2026-10-09]], [[2026-10-10]], [[2026-10-11]], [[2026-10-12]]

---

#plan #lost-and-found #backlog #claim #photo #register #endpoint #security
