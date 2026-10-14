---
type: plan
project: lost-found
status: active
priority: high
updated: 2026-10-14
summary: Claim dua arah (pemilik & penemu), verifikasi lewat chat, serah terima oleh pengguna, kedaluwarsa 7 hari
---

# Claim Dua Arah dan Serah Terima oleh Pengguna - Lost&Found

**Tanggal:** 2026-10-14  
**Project:** [[PBL]] Lost&Found  
**Status:** Planning  
**Priority:** High  

---

## Tujuan

Mengubah alur claim dari **admin-centric** menjadi **user-driven**: penemu dan pemilik sama-sama bisa mengajukan claim, verifikasi kepemilikan lewat chat langsung tanpa menunggu admin, dan serah terima dilakukan pengguna sendiri dengan dokumentasi foto. Admin berperan sebagai pemantau dan penengah sengketa, bukan gerbang wajib setiap claim.

---

## Masalah Flow Lama

**Flow saat ini (2026-10-13):**
1. Hanya pemilik (pelapor laporan hilang) yang bisa mengajukan claim ke laporan temuan
2. Claim dibuat → status `pending`, **tetapi chat baru terbuka setelah admin approve**
3. Admin harus mereview dan menekan "Terima" sebelum claim menjadi `accepted` dan laporan jadi `claimed`
4. Serah terima hanya bisa dilakukan admin atau penemu via `markTransferred`
5. Tidak ada mekanisme auto-expire untuk claim yang terbengkalai

**Masalah:**
- **Bottleneck admin:** Setiap claim harus menunggu admin review, padahal penemu yang paling tahu apakah pengklaim adalah pemilik asli
- **Delay verifikasi:** Chat baru terbuka setelah admin approve, padahal verifikasi kepemilikan seharusnya dilakukan **sebelum** admin terlibat
- **Ketergantungan jadwal admin:** Jika admin sibuk/offline, proses claim terhenti
- **Asimetri akses:** Penemu yang menemukan barang tidak bisa proaktif mencari pemilik dengan mengajukan claim ke laporan hilang
- **Tidak ada auto-cleanup:** Claim yang tidak diproses menumpuk di daftar pending

---

## Alur Baru (User-Driven Claim)

### 1. Claim Dua Arah

**A. Pemilik (pelapor laporan hilang) mengajukan claim ke laporan temuan**
- Flow sama seperti sekarang: pemilik buka detail laporan temuan → "Ini Barangku" → pilih laporan hilangnya → isi alasan → submit

**B. Penemu (pelapor laporan temuan) mengajukan claim ke laporan hilang** *(BARU)*
- Penemu buka detail laporan hilang → "Aku Menemukan Barang Ini"
- Sistem cek: penemu wajib punya laporan temuan
  - Jika belum ada → redirect ke form "Lapor Temuan" dengan deep-link kembali ke claim setelah selesai
  - Jika sudah ada → pilih laporan temuannya → isi alasan → submit

**Label tombol:**
- Di detail laporan temuan: **"Ini Barangku"** (untuk pemilik)
- Di detail laporan hilang: **"Aku Menemukan Barang Ini"** (untuk penemu)

**Constraint:**
- `claims.lost_report_id` dan `claims.found_report_id` sama-sama **NOT NULL**
- Claimant harus pelapor salah satu dari dua laporan itu (lost atau found)
- Tidak ada kolom peran baru (`claimant_role`); sistem tahu dari `claimant_id == lostReport.reporter_id` atau `== foundReport.reporter_id`

---

### 2. Chat Otomatis & Verifikasi Kepemilikan

**Saat claim dibuat (status `pending`):**
1. Sistem auto-create `conversation` antara pelapor laporan hilang dan pelapor laporan temuan
2. Chat langsung terbuka, **tanpa menunggu admin**
3. FCM notification ke pihak yang menerima claim (bukan pengaju)

**Aturan konfirmasi (pihak yang TIDAK mengajukan claim):**

**A. Pemilik mengajukan claim ke laporan temuan:**
- **Penemu (pelapor laporan temuan)** yang memverifikasi dan menekan tombol konfirmasi
- Banner tips di chat untuk penemu:
  > 💡 **Tips Verifikasi:** Tanyakan detail yang tidak terlihat di foto (warna dalam tas, isi kartu di dompet, password lock HP, merek/seri tersembunyi). Pastikan ini pemilik asli sebelum menekan "Cocok".
- Tombol untuk penemu:
  - **"Cocok"** → claim jadi `accepted`, kedua laporan jadi `claimed`
  - **"Tidak cocok"** → claim jadi `rejected`, wajib isi alasan, chat read-only

**B. Penemu mengajukan claim ke laporan hilang:**
- **Pemilik (pelapor laporan hilang)** yang memverifikasi dan menekan tombol konfirmasi
- Banner tips di chat untuk pemilik:
  > 💡 **Tips Verifikasi:** Tanyakan detail barang yang ditemukan. Pastikan ini benar barangmu sebelum menekan "Ya, ini barang saya".
- Tombol untuk pemilik:
  - **"Ya, ini barang saya"** → claim jadi `accepted`, kedua laporan jadi `claimed`
  - **"Bukan barang saya"** → claim jadi `rejected`, wajib isi alasan, chat read-only

**Prinsip umum:**
- Pihak pengaju claim **hanya bisa membatalkan** (withdrawn), tidak bisa menekan konfirmasi untuk claim-nya sendiri
- Pihak penerima claim yang memutuskan accept/reject lewat chat
- Jika beberapa penemu mengajukan claim ke satu laporan hilang, pemilik yang memilih satu yang benar

---

### 3. Aturan Pembekuan Chat (Claim Lain pada Laporan yang Sama)

**Skenario:** Laporan temuan X diklaim oleh 3 orang (Claim A, B, C pending). Penemu approve Claim A → laporan jadi `claimed`.

**Aturan:**
- Claim A: `accepted`, chat tetap aktif
- Claim B & C: tetap `pending` **tetapi DIBEKUKAN** (frozen)
  - Chat read-only dengan pesan sistem: *"Barang ini sedang diproses claim lain. Kamu akan diberi tahu kalau claim itu batal."*
  - Badge UI: "Dibekukan" (warna abu)
  - **Status beku TIDAK disimpan di database** — selalu dihitung dari kondisi: `claim.status == 'pending' AND (lostReport.status == 'claimed' OR foundReport.status == 'claimed') oleh claim lain`
  - Alasan: kolom tersimpan bisa tidak sinkron saat claim batal

**Jika Claim A batal/withdrawn:**
- Kedua laporan kembali ke `pending`
- Chat Claim B & C terbuka lagi, notifikasi FCM ke pengklaim: "Claim kamu aktif kembali, lanjutkan verifikasi"

**Maksimal claim pending aktif per laporan:** 5 claim (yang belum dibekukan). Claim ke-6 ditolak API dengan error "Laporan ini sudah memiliki 5 claim pending".

---

### 4. Serah Terima oleh Pengguna

**Setelah claim `accepted`:**
- Pemilik dan penemu koordinasi waktu & tempat serah terima (via chat atau WhatsApp)
- Setelah bertemu, **salah satu dari mereka** (pemilik ATAU penemu) menekan **"Barang sudah diserahkan"** di detail claim
- **Upload foto bukti serah terima WAJIB (1 foto)** — tombol tidak bisa dikirim tanpa foto
  - Alasan: admin tidak membaca chat, jadi foto adalah jejak utama untuk menengahi sengketa
  - Validasi: backend 422 jika foto kosong
- Claim jadi `returned`, kedua laporan jadi `returned`
- Claim lain yang masih `pending` pada laporan itu **ditutup otomatis** → `rejected` dengan alasan sistem "Barang sudah dikembalikan lewat claim lain"

**Endpoint:** `PATCH /api/claims/:id/mark-transferred` (sudah ada, perlu disesuaikan)
- Authorization: `claimant_id == auth()->id() OR foundReport.reporter_id == auth()->id()` (kedua pihak boleh)
- Body: `{ "proof_photo": multipart file }` (wajib)
- Tinjau `ClaimPolicy::markTransferred()` — saat ini hanya admin + finder; tambahkan claimant

---

### 5. Pembatalan Claim (Withdrawn)

**Pengklaim (claimant) membatalkan claim:**
- Tombol "Batalkan Claim" muncul jika claim masih `pending` atau `accepted`
- Wajib isi alasan pembatalan (textarea)
- Claim jadi `withdrawn`, chat read-only
- Jika claim sudah `accepted`:
  - Kedua laporan kembali ke `pending`
  - Claim lain yang dibekukan terbuka lagi

**UI:**
- Detail claim (untuk claimant): tombol merah outline "Batalkan Claim"
- Dialog konfirmasi + textarea alasan

---

### 6. Kedaluwarsa Otomatis (7 Hari)

**A. Claim pending tidak bergerak 7 hari:**
- Sistem cek: `claim.status == 'pending' AND claim.updated_at < now() - 7 days`
- Auto-withdrawn dengan alasan "Kedaluwarsa: tidak ada aktivitas dalam 7 hari"
- FCM notification ke claimant: "Claim kamu dibatalkan otomatis karena kedaluwarsa"
- **Pengingat sebelum kedaluwarsa:** notifikasi FCM 1 hari sebelum (H-1 atau H-2? → tentukan saat implementasi)

**B. Claim accepted tanpa serah terima 7 hari:**
- Sistem cek: `claim.status == 'accepted' AND claim.accepted_at < now() - 7 days AND claim.transferred_at IS NULL`
- Auto-withdrawn dengan alasan "Kedaluwarsa: tidak ada serah terima dalam 7 hari setelah disetujui"
- Kedua laporan kembali ke `pending`
- Claim lain yang dibekukan terbuka lagi
- Notifikasi FCM ke kedua pihak

**Implementasi:** Laravel Scheduler (`routes/console.php` Laravel 11+) job harian atau per jam
```php
$schedule->command('claims:expire')->hourly();
```

---

### 7. Peran Admin (Pemantau & Penengah)

**Admin TIDAK lagi gerbang wajib, tetapi tetap punya akses penuh:**

**A. Filament Dashboard — List & Detail Claim:**
- Admin melihat **semua** claim (pending, accepted, returned, rejected, withdrawn)
- Detail claim menampilkan:
  - Foto laporan hilang dan temuan berdampingan
  - Alasan claim dari claimant
  - Metadata chat (tanggal dibuat, jumlah pesan), **tanpa isi chat**
  - Foto bukti serah terima (jika sudah `returned`)
  - Alasan pembatalan/penolakan (jika `rejected` atau `withdrawn`)
  - Timestamp penting: `created_at`, `accepted_at` (timestamp "Cocok" ditekan), `transferred_at`

**B. Aksi Override Admin:**
- **Tolak claim** (manual) → claim jadi `rejected`, wajib catatan admin, notifikasi ke claimant
- **Cabut claim** (manual) → sama seperti withdrawn, laporan kembali `pending` jika claim sudah accepted
- **Kembalikan laporan ke pending** (override) → buka claim yang dibekukan
- **Blokir user** (fitur yang sudah ada) → untuk spam/fraud

**C. Aksi "Terima Claim" admin (override, bukan jalur utama):**
- Tetap ada, tetapi bukan alur utama
- Jika penemu tidak respond/lupa verifikasi, admin bisa manual approve
- Fungsi: sama seperti tombol "Cocok" penemu

**D. Report & Monitoring:**
- Dashboard metrik: total claim accepted hari ini, rata-rata waktu verifikasi (created → accepted), claim kedaluwarsa minggu ini
- Filter claim: status, kedaluwarsa terdekat (H-1 atau H-2)

---

## Tabel Transisi Status

### Status Claim

| Dari | Aksi | Ke | Aktor | Side Effect |
|------|------|----|----|-------------|
| - | Claim dibuat | `pending` | Pengaju (pemilik atau penemu) | Chat dibuat, notif ke penerima |
| `pending` | Penerima tekan "Cocok" / "Ya, ini barang saya" | `accepted` | Penerima (bukan pengaju) | Laporan → `claimed`, claim lain dibekukan |
| `pending` | Penerima tekan "Tidak cocok" / "Bukan barang saya" | `rejected` | Penerima (bukan pengaju) | Chat read-only, alasan wajib |
| `pending` | Admin tolak | `rejected` | Admin | Catatan admin wajib |
| `pending` | Pengaju batalkan | `withdrawn` | Pengaju | Alasan wajib, chat read-only |
| `pending` | 7 hari tidak bergerak | `withdrawn` | System | Alasan "kedaluwarsa" |
| `accepted` | Serah terima + foto wajib | `returned` | Pemilik atau Penemu | Laporan → `returned`, claim lain ditutup |
| `accepted` | Pengaju batalkan | `withdrawn` | Pengaju | Laporan → `pending`, claim beku terbuka |
| `accepted` | Admin cabut | `withdrawn` | Admin | Laporan → `pending` |
| `accepted` | 7 hari tanpa serah terima | `withdrawn` | System | Laporan → `pending`, claim beku terbuka |

### Status Laporan (Lost & Found)

| Dari | Aksi | Ke | Trigger |
|------|------|----|-------|
| `pending` | Claim diterima (accepted) | `claimed` | Penerima tekan "Cocok" / "Ya, ini barang saya" atau admin approve |
| `claimed` | Claim withdrawn/batal | `pending` | Claim yang accepted dibatalkan |
| `claimed` | Serah terima + foto wajib | `returned` | Salah satu pihak tekan "Barang sudah diserahkan" |
| `pending`/`claimed` | Admin tutup manual | `closed` | Admin (fitur yang sudah ada) |

---

## Edge Cases & Handling

### 1. Penemu Tidak Punya Laporan Temuan
**Skenario:** Penemu mau claim laporan hilang, tetapi belum buat laporan temuan.

**Handling:**
- Tombol "Aku Menemukan Barang Ini" → cek `foundReports` milik user
- Jika kosong: redirect ke form "Lapor Temuan" dengan query param `?returnTo=claim&lostReportId=xxx`
- Setelah laporan temuan dibuat, user di-redirect kembali ke form claim dengan `found_report_id` sudah terisi

### 2. Penemu Tidak Respond di Chat (Claim Terbengkalai)
**Handling:**
- Auto-expire 7 hari (lihat §6.A)
- Pengingat FCM ke penemu 1 hari sebelum expire
- Jika penemu tetap tidak respond, claimant bisa:
  - Batalkan claim dan coba claim lain
  - Laporkan ke admin (lihat **Open Item #3**)

### 3. Penerima Salah Tekan "Cocok"
**Handling:**
- Penerima (yang menekan "Cocok") bisa batalkan claim (withdrawn) dengan alasan "Salah verifikasi"
- Laporan kembali `pending`, claim lain terbuka
- Notifikasi ke pengaju: "Claim kamu dibatalkan: [alasan]"

### 4. Multiple Claim Diterima Bersamaan (Race Condition)
**Skenario:** Penerima approve Claim A dan B dalam 1 detik (tab berbeda / multi-device).

**Handling (backend):**
- Transaction lock pada `lost_reports` dan `found_reports` saat update status
```php
DB::transaction(function () use ($claim) {
    $lostReport = LostReport::lockForUpdate()->find($claim->lost_report_id);
    $foundReport = FoundReport::lockForUpdate()->find($claim->found_report_id);
    
    if ($lostReport->status !== 'pending' || $foundReport->status !== 'pending') {
        throw new \Exception('Laporan sudah diklaim claim lain');
    }
    
    // Update claim → accepted, laporan → claimed
});
```
- Claim kedua gagal dengan error 422: "Laporan sudah diklaim claim lain"

### 5. Dispute: Pengaju Bilang Barang Tidak Sesuai Setelah Accepted
**Handling:**
- Pengaju batalkan claim (withdrawn) dengan alasan "Barang tidak sesuai"
- Atau pengaju laporkan ke admin (fitur sengketa — ditunda, lihat bagian Open Items)
- Admin buka chat (read-only untuk admin), evaluasi, putuskan: cabut claim atau tolak dispute

### 6. Foto Bukti Transfer Tidak Jelas / Tidak Ada
**Handling:**
- Foto bukti **WAJIB** (disetujui user 2026-10-14)
- Endpoint 422 jika foto kosong
- Jika foto tidak jelas setelah upload, admin bisa cabut claim atau minta pengaju/penerima upload ulang via chat manual

---

## Petunjuk di Aplikasi (Agar Pengguna Paham Perannya)

Aplikasi menampilkan petunjuk kontekstual agar pengguna tahu siapa menekan tombol apa dan kapan. Tabel berikut menunjukkan teks petunjuk dan tombol yang tampil berdasarkan peran user dan kondisi claim.

| Peran User | Kondisi Claim | Teks Petunjuk | Tombol yang Tampil | Layar |
|------------|---------------|---------------|-------------------|-------|
| **Pengaju** (pemilik yang claim temuan) | Pending | "Kamu mengajukan claim. Tunggu penemu memverifikasi lewat chat." | "Batalkan Claim" | Detail Claim, Chat |
| **Penerima** (penemu dari claim di atas) | Pending | "Seseorang mengklaim barang ini. Tanyakan ciri yang tidak terlihat di foto, lalu putuskan apakah ini pemilik asli." | "Cocok" (hijau), "Tidak cocok" (merah) | Chat |
| **Pengaju** (penemu yang claim hilang) | Pending | "Kamu mengajukan claim. Tunggu pemilik barang memverifikasi lewat chat." | "Batalkan Claim" | Detail Claim, Chat |
| **Penerima** (pemilik dari claim di atas) | Pending | "Seseorang menemukan barangmu. Tanyakan detail barang yang ditemukan untuk memastikan ini milikmu." | "Ya, ini barang saya" (hijau), "Bukan barang saya" (merah) | Chat |
| **Pengaju** | Accepted | "Claim disetujui. Koordinasikan waktu dan tempat serah terima lewat chat, lalu tekan tombol di bawah setelah bertemu." | "Barang sudah diserahkan" (+ foto wajib), "Batalkan Claim" | Detail Claim |
| **Penerima** | Accepted | "Kamu menyetujui claim ini. Koordinasikan waktu dan tempat serah terima lewat chat, lalu tekan tombol di bawah setelah bertemu." | "Barang sudah diserahkan" (+ foto wajib) | Detail Claim |
| **Pengaju atau Penerima** | Beku (pending + laporan claimed oleh claim lain) | "Barang ini sedang diproses claim lain. Kamu akan diberi tahu kalau claim itu batal." | — | Chat, Detail Claim |
| **Pengaju atau Penerima** | Rejected | "Claim ditolak. Alasan: [alasan]" | — | Detail Claim |
| **Pengaju atau Penerima** | Withdrawn | "Claim dibatalkan. Alasan: [alasan]" | — | Detail Claim |
| **Pengaju atau Penerima** | Returned | "Barang sudah diserahkan. Terima kasih!" | — | Detail Claim |

**Catatan implementasi:**
- Banner tips (§2) muncul di bagian atas chat saat claim pending dan user adalah penerima
- Petunjuk status (tabel di atas) muncul di detail claim dan/atau di bagian atas chat
- Dialog konfirmasi tombol menampilkan warning tambahan:
  - "Cocok" / "Ya, ini barang saya" → "Pastikan ini benar pemilik/barang asli. Laporan akan dikunci dan claim lain dibekukan."
  - "Tidak cocok" / "Bukan barang saya" → "Wajib isi alasan. Chat akan ditutup."
  - "Barang sudah diserahkan" → "Upload foto bukti serah terima. Wajib 1 foto."

---

## Dampak pada Kode yang Ada

### Backend (Laravel)

**1. ClaimController::store()**
- Tambah validasi: claimant harus pelapor `lost_report_id` ATAU `found_report_id` (tidak boleh outsider)
- Tambah check: maksimal 5 claim pending aktif (belum dibekukan) pada laporan target
- Auto-create conversation (sudah sesuai plan Real-Time Chat)

**2. Endpoint Accept Claim (BARU untuk Penerima)**
- Sebelumnya: hanya admin yang bisa approve claim via AdminController atau aksi Terima di ClaimResource Filament
- Sekarang: **penerima claim (bukan pengaju)** juga bisa call endpoint baru untuk accept
  - Jika pemilik yang mengajukan claim ke laporan temuan → penemu (foundReport.reporter_id) yang accept
  - Jika penemu yang mengajukan claim ke laporan hilang → pemilik (lostReport.reporter_id) yang accept
- **Endpoint baru:** `POST /api/claims/:id/accept` (untuk penerima, bukan ClaimController yang lama)
- Authorization: `ClaimPolicy::accept()` → cek apakah user adalah penerima (bukan pengaju) atau admin
- Logic: hitung apakah `auth()->id()` adalah pelapor laporan yang TIDAK diajukan oleh claimant
- Tambah guard Bug 3 (laporan harus `pending`) — sudah ada di log 2026-10-09, verifikasi masih aktif

**3. ClaimController::rejectClaim() — BARU**
- Endpoint: `POST /api/claims/:id/reject`
- Body: `{ "reason": "..." }` (wajib)
- Authorization: penerima claim (bukan pengaju) atau admin
- Side effect: claim → `rejected`, chat read-only (hitung dari status, bukan kolom locked)
- Notifikasi FCM ke pengaju

**4. ClaimController::withdrawClaim() — BARU**
- Endpoint: `POST /api/claims/:id/withdraw`
- Body: `{ "reason": "..." }` (wajib)
- Authorization: pengaju (`claimant_id == auth()->id()`)
- Side effect:
  - Claim → `withdrawn`, chat read-only
  - Jika claim sebelumnya `accepted`: laporan → `pending`, buka claim yang dibekukan
- Notifikasi FCM ke penerima (pihak lawan dari pengaju)

**5. ClaimController::markTransferred()**
- Sebelumnya: admin atau finder
- Sekarang: **pengaju, penerima, atau admin** (ClaimPolicy disesuaikan)
- Body: `{ "proof_photo": multipart file }` wajib — validasi 422 jika kosong
- Tambah side effect: tutup claim lain pada laporan itu → `rejected` dengan alasan sistem

**6. ClaimResource (Filament) — Aksi "Terima"**
- Aksi Terima di ClaimResource Filament tetap ada (AdminController atau action di resource), tetapi bukan jalur utama
- Visible hanya untuk admin
- Label diubah: "Terima Claim (Override)" atau tetap "Terima Claim" tetapi dengan tooltip "Biasanya penerima yang verifikasi; gunakan ini jika penerima tidak respond"

**7. Guard Bug 3 (Celah acceptClaim)**
- Sudah selesai di DailyChanges 2026-10-09 (commit `20d8164`, merge `b1e5556`)
- Verifikasi: aksi Terima diblokir jika `lostReport.status !== 'pending' OR foundReport.status !== 'pending'`

**8. ClaimPolicy::markTransferred()**
- Sebelumnya: `admin OR foundReport.reporter_id`
- Sekarang: `admin OR pengaju OR penerima` (kedua pihak claim boleh)

**9. ClaimPolicy — Tambahan untuk Claim Dua Arah**
- `ClaimPolicy::accept()` — cek user adalah penerima (bukan pengaju) atau admin
- `ClaimPolicy::reject()` — cek user adalah penerima (bukan pengaju) atau admin
- `ClaimPolicy::withdraw()` — cek user adalah pengaju
- Helper: `isPenerima($user, $claim)` → return true jika user adalah pelapor laporan yang TIDAK diajukan oleh claimant

**10. Command: `claims:expire`**
- Query claim pending > 7 hari, update ke `withdrawn`
- Query claim accepted > 7 hari tanpa `transferred_at`, update ke `withdrawn` + laporan → `pending`
- Kirim FCM notification

**11. Chat Read-Only (Tanpa Kolom `locked`)**
- Status beku atau tertutup dihitung dari kondisi claim (`rejected`, `withdrawn`, `returned`) atau laporan (`claimed` oleh claim lain)
- Backend endpoint `/api/conversations/:id/messages` cek kondisi sebelum terima pesan baru
- Flutter chat UI disable input jika kondisi terpenuhi

---

### Flutter Mobile

**1. Tombol Claim di Detail Laporan**
- Detail laporan temuan: "Ini Barangku" (claimant = pemilik)
- Detail laporan hilang: "Aku Menemukan Barang Ini" (claimant = penemu)
- Cek: apakah user sudah punya laporan lawan (lost/found)?
  - Belum ada → redirect ke form Lapor dengan returnTo
  - Sudah ada → form claim dengan dropdown laporan

**2. Form Claim**
- Dropdown "Pilih Laporan [Hilang/Temuan] Kamu" (label sesuai konteks)
- Textarea alasan
- Catatan: "Chat dengan [penerima] akan terbuka setelah kamu kirim. [Penerima] akan memverifikasi kepemilikan."

**3. ChatScreen — Tombol Verifikasi (untuk Penerima)**
- Cek: user adalah penerima (bukan pengaju) + `claim.status == 'pending'`
- Tampilkan 2 tombol di atas input chat:
  - Jika user = penemu: **"Cocok"** (hijau) / **"Tidak cocok"** (merah)
  - Jika user = pemilik: **"Ya, ini barang saya"** (hijau) / **"Bukan barang saya"** (merah)
- Tap tombol → dialog textarea alasan (wajib untuk reject) → call API
- Banner tips muncul sesuai peran

**4. Detail Claim — Tombol Serah Terima**
- Jika `claim.status == 'accepted'` dan user = pengaju ATAU penerima:
  - Tombol "Barang Sudah Diserahkan"
  - Tap → pilih foto (kamera/galeri) wajib → upload → call `PATCH /api/claims/:id/mark-transferred`
  - Validasi: tombol disable jika foto belum dipilih

**5. Detail Claim — Tombol Batalkan**
- Jika `claim.status == 'pending' OR 'accepted'` dan user = pengaju:
  - Tombol merah outline "Batalkan Claim"
  - Dialog konfirmasi + textarea alasan → call `POST /api/claims/:id/withdraw`

**6. Badge Status Claim**
- `pending` → oranye "Menunggu Verifikasi"
- `pending` + laporan `claimed` → abu "Dibekukan"
- `accepted` → hijau "Disetujui"
- `returned` → hijau "Selesai"
- `rejected` → merah "Ditolak"
- `withdrawn` → abu "Dibatalkan"

---

### Filament Admin

**1. ClaimResource — Aksi Terima**
- Tetap ada, visible untuk admin
- Diblokir jika laporan sudah `claimed`/`returned`/`closed`

**2. ClaimResource — Detail View**
- Tambah field:
  - `accepted_at` (timestamp konfirmasi "Cocok" / "Ya, ini barang saya")
  - `closed_reason` (alasan penutupan)
  - `closed_by` (siapa yang tutup: pengaju/penerima/admin/system)
- Metadata chat tanpa isi (sudah ada, lihat DailyChanges 2026-10-06)

**3. ClaimResource — Aksi Override**
- "Cabut Claim" (withdraw manual oleh admin)
- "Tolak Claim" (reject manual oleh admin)

---

## Perubahan Skema (Disetujui User 2026-10-14)

> **Status:** Disetujui. Belum ada migration. Tugas untuk Coding Agent di Phase 1.

### Tabel `claims`

**Kolom baru (disetujui):**
```php
// Migration
$table->text('closed_reason')->nullable()->comment('Alasan penutupan (rejected/withdrawn/expired)');
$table->uuid('closed_by')->nullable()->comment('User yang menutup (pengaju/penerima/admin) atau NULL jika system');
$table->timestamp('accepted_at')->nullable()->comment('Waktu konfirmasi diterima (untuk hitung 7 hari kedaluwarsa)');

$table->foreign('closed_by')->references('id')->on('users')->onDelete('set null');
$table->index('accepted_at'); // untuk query expire
```

**Catatan:** 
- Verdict tetap pakai `status` (accepted/rejected), bukan kolom `verdict` baru
- Chat read-only dihitung dari kondisi claim (`rejected`, `withdrawn`, `returned`) atau laporan (`claimed` oleh claim lain), **BUKAN dari kolom tersimpan**

---

## Langkah Implementasi (untuk Coding Agent)

### Phase 1: Backend Core (Laravel)

**1.1 Migration — Kolom Baru**
- `claims`: `closed_reason`, `closed_by`, `accepted_at` (disetujui user 2026-10-14)

**1.2 Endpoint Baru**
- `POST /api/claims/:id/accept` (penerima claim, bukan pengaju)
- `POST /api/claims/:id/reject` (body: `reason` wajib)
- `POST /api/claims/:id/withdraw` (body: `reason` wajib)

**1.3 Update Endpoint Existing**
- `ClaimController::store()` — validasi pengaju peran + maksimal 5 pending
- `ClaimController::markTransferred()` — authorization pengaju & penerima, body `proof_photo` wajib, side effect tutup claim lain

**1.4 Policy Update**
- `ClaimPolicy::accept()` — penerima (bukan pengaju) atau admin
- `ClaimPolicy::reject()` — penerima (bukan pengaju) atau admin
- `ClaimPolicy::withdraw()` — pengaju
- `ClaimPolicy::markTransferred()` — pengaju, penerima, atau admin
- Helper `isPenerima($user, $claim)` — return true jika user adalah pelapor laporan yang TIDAK diajukan claimant

**1.5 Logic Pembekuan Claim**
- Helper function `Claim::isFreezed()` atau query scope `Claim::scopeActive($query)`
- Return claim yang pending dan laporan targetnya belum `claimed`

**1.6 Scheduler — Kedaluwarsa**
- Command `php artisan make:command ExpireClaimsCommand`
- Logic:
  - Pending > 7 hari → `withdrawn`
  - Accepted > 7 hari tanpa transfer → `withdrawn` + laporan → `pending`
- Register di `routes/console.php` (Laravel 11+): `Schedule::command('claims:expire')->hourly();`

**1.7 Notification Service**
- FCM ke penerima saat claim dibuat (bukan ke penemu fixed, tapi ke pihak yang menerima claim)
- FCM ke pengaju saat claim accepted/rejected/withdrawn oleh penerima
- FCM ke penerima saat claim withdrawn oleh pengaju
- FCM pengingat H-1 sebelum expire

**1.8 Test**
- `ClaimAcceptTest` — penerima tekan "Cocok" / "Ya, ini barang saya"
- `ClaimRejectTest` — penerima tolak + alasan
- `ClaimWithdrawTest` — pengaju batalkan + side effect laporan
- `ClaimExpireTest` — scheduler auto-withdrawn
- `ClaimFreezedTest` — claim lain dibekukan saat laporan `claimed`
- `ClaimRaceConditionTest` — transaction lock
- `ClaimTwoWayTest` — penemu ajukan claim ke laporan hilang, pemilik yang accept

---

### Phase 2: Flutter Mobile

**2.1 UI Tombol Claim Dua Arah**
- Detail laporan temuan: "Ini Barangku"
- Detail laporan hilang: "Aku Menemukan Barang Ini"
- Redirect ke form Lapor jika belum punya laporan lawan

**2.2 ChatScreen — Tombol Verifikasi**
- Cek user = penerima (bukan pengaju) + claim pending
- Tampilkan 2 tombol: 
  - Jika user = penemu (penerima dari pemilik yang claim): "Cocok" / "Tidak cocok"
  - Jika user = pemilik (penerima dari penemu yang claim): "Ya, ini barang saya" / "Bukan barang saya"
- Banner tips sesuai peran (lihat §2)

**2.3 Detail Claim — Tombol Aksi**
- "Barang Sudah Diserahkan" (jika accepted, user = pengaju atau penerima) — wajib upload 1 foto
- "Batalkan Claim" (jika pending/accepted, user = pengaju)

**2.4 Badge Status**
- Tambah badge "Dibekukan" (abu) untuk claim pending + laporan claimed

**2.5 Model & Service**
- `ClaimService.acceptClaim(id)` — penerima accept
- `ClaimService.rejectClaim(id, reason)` — penerima reject
- `ClaimService.withdrawClaim(id, reason)` — pengaju withdraw
- `ClaimService.markTransferred(id, photoFile)` — pengaju atau penerima, foto wajib
- `Claim` model field baru: `acceptedAt`, `closedReason`, `closedBy`

**2.6 Deep Link — Return from Lapor Temuan**
- Query param `?returnTo=claim&lostReportId=xxx`
- Setelah laporan temuan dibuat, redirect ke form claim

---

### Phase 3: Filament Admin

**3.1 ClaimResource — Detail View**
- Tambah field: `accepted_at`, `closed_reason`, `closed_by` (relation TextEntry)
- Metadata chat (sudah ada)

**3.2 ClaimResource — Aksi Override**
- "Terima Claim" tetap ada, tooltip "Override jika penemu tidak respond"
- "Cabut Claim" (withdraw manual)
- "Tolak Claim" (reject manual)

**3.3 Dashboard Metrik**
- Total claim accepted hari ini
- Rata-rata waktu verifikasi (created → accepted)
- Claim kedaluwarsa minggu ini

---

### Phase 4: Testing & Polish

**4.1 Manual Test**
- Dua akun (pemilik & penemu) di HP fisik
- Flow lengkap: claim → chat → verifikasi → serah terima
- Test pembekuan: 3 claim pada 1 temuan, approve 1, cek 2 lainnya beku

**4.2 Edge Case Test**
- Penemu tidak respond (auto-expire)
- Race condition (2 claim approved bersamaan)
- Claimant batalkan setelah accepted

**4.3 Notifikasi FCM**
- Test semua trigger: claim dibuat, accepted, rejected, withdrawn, expire H-1, expire final

---

## Strategi Test

**Unit Test (Laravel):**
- `ClaimPolicy::accept()` — penerima boleh, outsider & pengaju ditolak
- `ClaimPolicy::isPenerima()` — helper logic peran penerima
- `Claim::isFreezed()` — logic pembekuan
- `ExpireClaimsCommand` — query pending/accepted > 7 hari

**Feature Test (Laravel):**
- `POST /api/claims` — validasi peran pengaju, maksimal 5 pending
- `POST /api/claims/:id/accept` — laporan → `claimed`, claim lain → freezed
- `POST /api/claims/:id/reject` — claim → `rejected`, chat read-only
- `POST /api/claims/:id/withdraw` — claim → `withdrawn`, laporan → `pending` jika sebelumnya accepted
- `PATCH /api/claims/:id/mark-transferred` — pengaju & penerima boleh, foto wajib, side effect tutup claim lain

**Integration Test (Flutter + Laravel):**
- Claim dibuat → conversation auto-created → chat terbuka
- Penerima tekan "Cocok" / "Ya, ini barang saya" → claim accepted → laporan claimed → notifikasi FCM
- Serah terima → foto upload wajib → claim returned

**Manual Test:**
- Multi-device: pemilik + penemu di HP berbeda
- Test claim dua arah: penemu ajukan claim ke laporan hilang, pemilik yang verifikasi
- Timeline lengkap: claim → chat → verifikasi → expire (ubah waktu sistem atau kurangi 7 hari jadi 1 menit untuk test)

---

## Ketergantungan

**Bergantung pada:**
- [[Real-Time Chat - Lost&Found]] — conversation auto-create, chat UI, banner tips
- [[Foto Bukti Transfer - Lost&Found]] — upload foto saat serah terima (sudah partial done, lihat status 2026-10-13)
- [[Verifikasi via Chat - Lost&Found]] — flow verifikasi kepemilikan via chat (sudah partial done)

**Urutan implementasi:**
1. Real-Time Chat (Model + API + Pusher + Flutter chat UI) — **harus selesai dulu**
2. Plan ini (claim dua arah + verifikasi + serah terima user)
3. Foto Bukti Transfer sisanya (UI Flutter untuk display foto)

---

## Next Steps

> **Status:** Keputusan user 2026-10-14 sudah dimasukkan ke plan. Skema disetujui. Open items 1, 2, 4 tertutup. Item 3 ditunda.

1. ✅ Open items tertutup (1: foto wajib, 2: penerima yang konfirmasi, 4: skema disetujui)
2. ⬜ Implementasi Real-Time Chat selesai (dependency)
3. ⬜ Backend Phase 1 (migration + endpoint + policy + scheduler)
4. ⬜ Flutter Phase 2 (tombol verifikasi + serah terima + batalkan)
5. ⬜ Filament Phase 3 (detail view + aksi override)
6. ⬜ Test Phase 4 (unit + feature + integration + manual)
7. ⬜ Deploy + monitoring (metrik claim accepted, waktu verifikasi, expire rate)

---

## Ditunda (Fitur Sengketa)

**Item 3 (dari Open Items): Cara Pengguna Melaporkan Sengketa ke Admin**

Fitur pelaporan sengketa ke admin (tombol "Laporkan Masalah" di detail claim, flag `disputed`, dashboard admin) **DITUNDA**. Alasan:
- Perlu plan terpisah untuk fitur dispute resolution
- Belum terbukti perlu di early adoption
- Admin saat ini bisa lihat semua claim dan metadata chat (tanpa isi) untuk monitoring
- Pengaju bisa batalkan claim (withdrawn) jika ada masalah
- Admin bisa override (cabut/tolak claim) tanpa flag khusus

Jika setelah launch terbukti banyak sengketa yang tidak terselesaikan lewat chat, buat plan "Pelaporan Sengketa Claim" terpisah.

---

## Open Items untuk User (TERTUTUP)

> Semua open items sudah dijawab user 2026-10-14. Dicatat di sini sebagai riwayat keputusan.

### 1. Foto Bukti Serah Terima: Wajib atau Opsional? ✅ TERTUTUP

**Keputusan:** WAJIB (1 foto).

- Tombol "Barang sudah diserahkan" tidak bisa dikirim tanpa foto
- Validasi backend 422 jika foto kosong
- Alasan: admin tidak membaca chat, jadi foto adalah jejak utama untuk menengahi sengketa

---

### 2. Verifikasi Pemilik jika Penemu yang Mengajukan Claim ✅ TERTUTUP

**Keputusan:** Pihak yang TIDAK mengajukan claim yang menekan tombol konfirmasi.

- Pemilik mengajukan claim ke laporan temuan → PENEMU yang tekan "Cocok" / "Tidak cocok"
- Penemu mengajukan claim ke laporan hilang → PEMILIK yang tekan "Ya, ini barang saya" / "Bukan barang saya"
- Pengaju hanya bisa membatalkan (withdrawn), tidak bisa konfirmasi claim-nya sendiri

---

### 3. Cara Pengguna Melaporkan Sengketa ke Admin ⏸️ DITUNDA

**Keputusan:** Ditunda. Dibuat plan terpisah bila terbukti perlu setelah launch.

Lihat bagian "Ditunda (Fitur Sengketa)" di atas.

---

### 4. Skema Kolom Baru di `claims` ✅ TERTUTUP

**Keputusan:** Tambah 3 kolom baru (disetujui 2026-10-14).

- `accepted_at` (timestamp): waktu konfirmasi diterima, dasar hitungan 7 hari
- `closed_reason` (text): alasan penolakan/pembatalan/kedaluwarsa/penutupan sistem
- `closed_by` (uuid, FK users, on delete set null): pihak yang menutup; null = sistem

Lihat bagian "Perubahan Skema (Disetujui User 2026-10-14)" untuk detail migration.

---

## Related Files

- **Project root:** `C:\Project\lostfound-backend` (GitHub: `Davinciz/lostfound-backend`, Private)
- **Flutter mobile:** `C:\Project\lostfound-mobile` (GitHub: `Davinciz/lostfound-mobile`, Private)
- **PRD:** [[PRD]] — §3.D, §3.I, §4.2
- **Technical Reference:** [[TechnicalReference]] — §12, §15.8
- **Design:** [[Design]] — §6.5, §6.6
- **Plan Real-Time Chat:** [[Real-Time Chat - Lost&Found]] (dependency)
- **Plan Verifikasi via Chat:** [[Verifikasi via Chat - Lost&Found]] (terdampak)
- **Plan Foto Bukti Transfer:** [[Foto Bukti Transfer - Lost&Found]] (terdampak)
- **Plan Perbaikan Flow Claim:** [[Perbaikan Flow Claim dan Form Laporan - Lost&Found]] (terdampak)

---

#plan #lost-and-found #claim #user-driven #verification #chat #expired #two-way
