---
type: report
task: GPT-261107-05
from: backend
outcome: succeeded
branch: fix/api/hide-user-contact-fields
commits:
  - "e193e69930ade0db7e74e58f9c1a9d2e2d596bee fix(api): sembunyikan field kontak dan identitas user dari respons laporan dan claim"
updated: 2026-11-07
summary: Respons API laporan, pencarian, dan claim menyaring lima field privat pada relasi pengguna, termasuk di API admin.
---

# GPT-261107-05 · Penyaringan field kontak dan identitas

## Berubah

- Berangkat dari `origin/develop` `a66a4b6` setelah fetch. Checkout utama `C:\Project\lostfound-backend` berada di `fix/chat/unread-count-n-plus-one` dengan edit lokal di `README.md`. Pekerjaan dilakukan di worktree terpisah.
- `Controller::hideUserContactFields()` memakai satu konstanta untuk menyaring `whatsapp`, `nim`, `email`, `blocked`, dan `blocked_reason` pada instance relasi `User` yang sudah dimuat. Controller memanggilnya menjelang serialisasi, setelah otorisasi dan notifikasi. Koleksi dan paginator tetap memakai format bawaan. Field utama laporan dan claim, termasuk `reporter_id` dan `claimant_id`, tetap tersedia.
- Laporan milik pemanggil memakai penyaringan yang sama. Kontrak profil sendiri tetap mengikuti `AuthController`. Model `User`, Filament, rute, dan skema tetap memakai kode yang ada.

## Inventaris dan kunci JSON

Audit `rg -n 'reporter|claimant|transferredBy' app/Http/Controllers` dilanjutkan dengan penelusuran eager load, `load()`, koleksi, paginator, dan pemanggilan `response()->json()`. Daftar di bawah mencakup seluruh aksi yang menyerialisasi relasi dalam lingkup.

- **A** (12 kunci) = `id`, `name`, `role`, `profile_image_url`, `wa_visible`, `created_at`, `updated_at`, `whatsapp`, `nim`, `email`, `blocked`, `blocked_reason`.
- **B** (7 kunci) = `id`, `name`, `role`, `profile_image_url`, `wa_visible`, `created_at`, `updated_at`.

| Endpoint | Controller dan aksi | Lokasi relasi di JSON | Sebelum → sesudah |
| --- | --- | --- | --- |
| `GET /api/lost-reports` | `LostReportController::index` | `data[].reporter` | A → B |
| `GET /api/lost-reports/{id}` | `LostReportController::show` | `reporter` | A → B |
| `POST /api/lost-reports` | `LostReportController::store` | `reporter` | A → B |
| `GET /api/found-reports` | `FoundReportController::index` | `data[].reporter` | A → B |
| `GET /api/found-reports/{id}` | `FoundReportController::show` | `reporter` | A → B |
| `POST /api/found-reports` | `FoundReportController::store` | `reporter` | A → B |
| `GET /api/search` | `SearchController::search` | `lost_reports[].reporter`, `found_reports[].reporter` | A → B |
| `GET /api/claims` | `ClaimController::index` | `data[].claimant` | A → B |
| `GET /api/claims/{id}` | `ClaimController::show` | `claimant`, `transferred_by` bila ada objek user | A → B |
| `POST /api/claims` | `ClaimController::store` | `claimant` | A → B |
| `POST /api/claims/{id}/accept` | `ClaimController::accept` | `claimant` | A → B |
| `POST /api/claims/{id}/reject` | `ClaimController::reject` | `claimant` | A → B |
| `POST /api/claims/{id}/withdraw` | `ClaimController::withdraw` | `claimant` | A → B |
| `PATCH /api/claims/{claim}/mark-transferred` | `ClaimController::markTransferred` | `claimant`, `transferred_by` | A → B |
| `GET /api/admin/dashboard` | `AdminController::dashboard` | `recent_reports[].reporter`, `pending_claims_list[].claimant` | A → B |
| `GET /api/admin/reports` | `AdminController::reports` | `lost_reports.data[].reporter`, `found_reports.data[].reporter` | A → B |
| `GET /api/admin/claims` | `AdminController::claims` | `data[].claimant` | A → B |
| `POST /api/admin/claims/{id}/accept` | `AdminController::acceptClaim` | `claimant` | A → B |
| `POST /api/admin/claims/{id}/reject` | `AdminController::rejectClaim` | `claimant` | A → B |

- `transferredBy` menjadi `transferred_by` dalam JSON dan memakai kunci yang sama dengan kolom FK. Detail dan respons keputusan pengguna memuat relasinya sebagai `null` bila belum ada penyerah. Daftar claim pengguna dan admin memuat kolom FK skalar. Laporan yang disertakan di respons claim memuat `reporter_id` tanpa objek `reporter`. Bentuk ini dipertahankan.
- `GET /api/users/me` memakai set **A**. `POST /api/auth/google` untuk akun yang sudah ada memakai `token` dan `user` dengan set **B** ditambah `email`, `nim`, dan `whatsapp`. Kedua set kunci diuji sebelum dan sesudah. Jalur daftar akun baru tetap ditangani oleh kode dan tes SSO yang sudah ada.
- `ConversationController` memakai `UserResource` untuk `user1`, `user2`, `other_user`, dan `sender`. Resource tersebut memuat `id`, `name`, dan `email`. Temuan ini berada di jalur chat yang terpisah dari relasi laporan dan claim di atas.

## Verifikasi

| Pemeriksaan | Hasil |
| --- | --- |
| Baseline `a66a4b6` di PostgreSQL `lostfound_testing` | 365 lulus, 0 gagal, 1.341 assertion |
| Tes regresi sebelum implementasi | 11 gagal karena lima kunci masih muncul. Dua tes kontrak profil sendiri lulus. |
| `php artisan test --compact tests/Feature/UserContactPrivacyTest.php` | 13 lulus, 0 gagal, 261 assertion |
| `php artisan test` | 378 lulus, 0 gagal, 1.602 assertion, exit 0 |
| `php artisan route:list --path=api` | 36 rute, output identik dengan baseline |
| `vendor/bin/pint --dirty --format agent` dan `git diff --check` | Lulus. Diff mencakup 6 controller dan 1 file tes. |
| Push | SHA remote cocok dengan commit lokal pada `origin/fix/api/hide-user-contact-fields`. |

- Tes meliputi pelapor dengan nomor terisi dan visibilitas aktif, pembaca lain dan pemilik, claimant, pihak yang menyerahkan barang, serta akun terblokir dalam data API admin. Suite berjalan pada PostgreSQL lokal sementara dengan `APP_URL=http://localhost`. Tes lama tetap digunakan tanpa perubahan. Pemeriksaan runner menemukan argumen berlebih di data provider baru dan peringatan dotenv dari worktree kosong. Pengulangan final memakai data provider yang diperbaiki dan fixture dotenv lokal kosong. `search-docs` Laravel Boost dan dokumentasi HTTP Laravel 13 digunakan karena skill `testing-best-practices` tidak ditemukan di checkout atau paket terpasang.

## Temuan dan tindak lanjut

- Dari pembacaan kode Flutter, `User.fromJson` membaca `email`, `nim`, dan `whatsapp` dengan `as String?`, sehingga kunci yang absen menjadi `null`. Parser tidak membaca `blocked` atau `blocked_reason`. `LostReport.fromJson`, `FoundReport.fromJson`, dan `Claim.fromJson` memakai parser `User` tersebut untuk objek terkait. Kelima field aman dihapus berdasarkan kode yang dibaca.
- `report_detail_screen.dart` mensyaratkan `reporter.whatsapp` terisi dan `wa_visible` aktif untuk menampilkan tombol WhatsApp. Tombol di detail laporan akan hilang sesuai keputusan produk. Pengisian nomor dan pengungkapan ke lawan claim setelah `accepted` ditangani terpisah.
- [[Nomor WhatsApp Pengguna - Lost&Found]] §4 dan [[Security Hardening - Lost&Found]] §2 masih mengusulkan pengiriman nomor berdasarkan `wa_visible` saja. PRD bagian E juga menggambarkan tombol di detail laporan. Implementasi mengikuti keputusan 7 November 2026 di tugas ini. Inventaris berangkat dari [[GPT-261107-06-review-wa-backend]] dan butir kebocoran claim di [[TechnicalReference]], lalu dikonfirmasi lewat kode dan tes.
- **Sebaiknya tunggu konfirmasi toleransi versi mobile yang dipakai pengguna sebelum deploy backend ke produksi.** Verifikasi mobile tugas ini berupa inspeksi parser dan kondisi tombol. Verifikasi backend dilakukan secara lokal.

## Butuh keputusan user

Konfirmasi toleransi build mobile yang akan memakai API produksi sebelum menjadwalkan deploy.
