---
type: plan
project: lost-found
status: active
priority: high
updated: 2026-10-29
summary: Sumber tunggal Fase 1.2 claim: accept/reject penerima, withdraw pengaju, concurrency test + FCM (1.2a, 1.2b, 1.2c). 2026-10-25: PATCH /claims/{id} dihapus, constraint UUID route (405/404), audit FCM v8 bersih, token mati dibersihkan — open items baru (chore Pint, retry/backoff dilewati). 2026-10-29: koreksi — 1.2c sudah merge develop (PR #11 squash `18c85d4`).
---

# Claim Fase 1.2 - Accept Reject Withdraw oleh Pengguna - Lost&Found

**Tanggal:** 2026-10-24
**Project:** [[PBL]] Lost&Found
**Status:** In Progress
**Priority:** High

---

## Tujuan

Menjadi **sumber tunggal** Fase 1.2 backend claim — 1.2a (accept & reject oleh penerima), 1.2b (withdraw oleh pengaju), 1.2c (test concurrency, notifikasi FCM, selaraskan docs). Tidak ada migration baru; jalur admin yang ada **tidak diubah**.

---

## Fakta as-built (dibaca kode read-only 2026-10-24, cocokkan ulang baris per baris)

| Hal | Kondisi sekarang |
|---|---|
| `Claim::#[Fillable]` | belum memuat `accepted_at`, `closed_reason`, `closed_by` (isi: `lost_report_id`, `found_report_id`, `claimant_id`, `status`, `reason`, `admin_note`, `proof_of_transfer_photo_url`, `transferred_at`, `transferred_by`). Casts hanya `transferred_at` => `datetime` |
| `ClaimDecisionService::accept()` | hanya `$claim->update(['status' => 'accepted'])`; `accepted_at` **belum** diisi (padahal jadi dasar kedaluwarsa 7 hari) |
| Route user | `accept`/`reject`/`withdraw` **sudah ada** (1.2a/1.2b). **2026-10-25 (Bob-04):** `PATCH /api/claims/{id}` **dihapus**; route claims: `POST /api/claims`, `GET /api/claims`, `GET /api/claims/{id}`, `POST /api/claims/{id}/accept|reject|withdraw`, `PATCH /api/claims/{claim}/mark-transferred` — semua `whereUuid` |
| Jalur admin | `POST /api/admin/claims/{id}/accept` dan `/reject` tetap ada, **tidak diubah** |
| `ClaimPolicy` | hanya `view`, `update` (admin saja), `markTransferred` (admin \|\| `Claim::receiverId()`) |
| `ClaimDecisionService::reject()` | hanya untuk claim `pending`; menulis `admin_note`; **tidak** mengubah status laporan (T-261023-05) |
| Kolom & constraint | `accepted_at`, `closed_reason`, `closed_by` sudah ada sejak migration `2026_10_23_000001_make_claim_reports_nullable` (guard `hasColumn`); FK `closed_by` → `users.id` `onDelete set null` |
| Constraint status | `claims_status_check` mengizinkan `pending, accepted, returned, rejected, withdrawn` (migration `2026_10_05_123423_sync_erd_constraints_and_drop_verification_columns`) |
| Respons claim | masih mengembalikan model `User` mentah (relasi `claimant`/`transferredBy`) — open item terpisah `UserResource`, **di luar** cakupan 1.2 |
| `PATCH /api/claims/{id}` | **DIHAPUS 2026-10-25 (Bob-04, commit `b1059d5`)** — route kini **405**; sebelumnya authorize-only (memuat + `authorize('update')` lalu return; `ClaimPolicy::update` = admin saja). `ClaimPolicy::update` **TETAP** karena dipakai Filament `ClaimResource` |
| Exception domain | `ClaimNotPendingException` (factory `claim()`/`report()`/`reject()`), `InvalidClaimParticipantException` |
| Notifikasi FCM | best-effort; **2026-10-25:** token diredaksi dari `Log::warning` (Bob-03) + `DeadFcmTokenCleaner` mengosongkan token mati `NotFound`/`SenderIdMismatch` bila token di DB masih sama (Bob-05) |

**Selesai 2026-10-24 (as-built):** endpoint user `accept`/`reject`/`withdraw` ada; `Claim::#[Fillable]` + cast `accepted_at` terisi; `ClaimDecisionService::accept()` mengisi `accepted_at`; `ClaimWithdrawService` + `ClaimNotificationService` baru; test balapan + FCM best-effort ada. Merge `develop`: 1.2a `2bafdb5`, 1.2b `9faee99`, **1.2c `23d0be6` → PR #11 squash `18c85d4` (dikoreksi 2026-10-29)**.

---

## Keputusan final (DISETUJUI user 2026-10-24)

- **Reject oleh PENERIMA** mengikuti plan lama: body `reason` wajib; disimpan ke `closed_reason`; `closed_by` = id penerima; claim → `rejected`; status laporan **TIDAK** diubah.
- **Reject oleh admin** tetap lewat jalur admin yang ada (`admin_note`), tidak diubah.
- **Tidak ada migration baru** untuk Fase 1.2: kolom `accepted_at`, `closed_reason`, `closed_by` sudah ada dan constraint `claims_status_check` sudah mengizinkan `returned` & `withdrawn`.

---

## Ruang lingkup

**Backend (Laravel)** — `Claim` (fillable/casts), `ClaimDecisionService`, `ClaimPolicy`, `ClaimController`, route `api.php`, service withdraw (baru), FCM. **Tanpa** migration, tanpa menyentuh kode Flutter, Filament, dan jalur admin. **Di luar lingkup:** FCM di luar 1.2c (jalur admin/Filament, FCM chat), withdraw otomatis/kedaluwarsa, Filament, Flutter, perbaikan `User` mentah.

---

## 1.2a — Accept & Reject oleh penerima (branch `feature/claim/user-accept-reject`)

**SELESAI 2026-10-24** — commit `0f41270`, squash-merge ke `develop` sebagai `2bafdb5`; 182 → 199 test lulus; `route:list --path=claims` 12 → 14.

- [x] `Claim` fillable: tambah `accepted_at`, `closed_reason`, `closed_by` (+ cast `accepted_at` => `datetime`).
- [x] `ClaimDecisionService::accept()`: set `accepted_at = now()` (berlaku untuk jalur admin juga). `reject()` mendukung parameter alasan penerima → `closed_reason` + `closed_by`, tanpa mengubah perilaku jalur admin.
- [x] `ClaimPolicy`: tambah `accept` dan `reject` = admin **ATAU** penerima (`Claim::receiverId()`); pengaju (claimant) dan outsider ditolak.
- [x] Endpoint: `POST /api/claims/{id}/accept` dan `POST /api/claims/{id}/reject` (body reject: `reason` wajib string). Controller tipis, memakai `ClaimDecisionService`; `ClaimNotPendingException` → 422; tidak berwenang → 403.
- [x] Respons: claim dengan relasi seperti `show` (tanpa menambah perbaikan `User` mentah).
- [x] Test: penerima accept (target temuan dan target hilang, tanpa laporan sendiri / NULL-safe); admin boleh; pengaju 403; outsider 403; accept non-pending 422; laporan target tidak pending 422; `accepted_at` terisi; reject tanpa reason 422; reject mengisi `closed_reason` + `closed_by` dan laporan tetap; reject non-pending 422; `route:list` claims bertambah tepat 2.

**Di luar lingkup 1.2a:** FCM, withdraw, Flutter, perbaikan Filament.

---

## 1.2b — Withdraw oleh pengaju (branch `feature/claim/user-withdraw`)

**SELESAI 2026-10-24** — commit `97d49c7`, squash-merge ke `develop` sebagai `9faee99`; 199 → 215 test lulus; `route:list --path=claims` 14 → 15.

- [x] `ClaimPolicy::withdraw` = hanya claimant (admin **TIDAK** lewat endpoint ini; "Cabut Claim" admin = Phase 3 Filament).
- [x] Endpoint: `POST /api/claims/{id}/withdraw` (body `reason` wajib).
- [x] Service baru (usulan nama: `ClaimWithdrawService`) atau method di service yang ada: transaction, `lockForUpdate` baris claim, status hanya `pending` atau `accepted` (selain itu 422 via exception domain).
- [x] Jika sebelumnya `accepted`: laporan yang TERISI dan masih berstatus `claimed` kembali `pending` (sisi NULL dilewati). Jika sebelumnya `pending`: laporan tidak diubah.
- [x] Isi `status = withdrawn`, `closed_reason`, `closed_by = claimant`. Status "beku" claim lain TIDAK disimpan (dihitung dari kondisi), tidak ada kolom baru.
- [x] Test: withdraw pending; withdraw accepted → laporan kembali `pending` (kedua arah target, termasuk laporan sendiri yang ditautkan); sisi NULL aman; bukan claimant 403 (termasuk penerima dan admin); reason kosong 422; status `rejected`/`returned`/`withdrawn` 422.

Menutup risiko yang dicatat Bob di R-261023-05: claim `accepted` yang macet kini punya jalan keluar.

---

## 1.2c — Concurrency, notifikasi, penutup (branch aktual `feature/notification/claim-decision-fcm`, bukan usulan `test/claim/concurrent-accept-notification`)

**KODE SELESAI 2026-10-24, PR BELUM DIBUAT/MERGE** — commit `23d0be6` sudah push; 215 → 230 test lulus; `route:list --path=claims` tetap 15.

- [x] Test balapan: (1) accept dua kali pada claim yang sama → request pertama 200, request kedua 422; (2) dua claim berbeda pada laporan target yang sama, accept A lalu B → B 422 dan laporan tidak berubah dua kali; (3) withdraw lalu accept pada claim yang sama → 422. Catat bahwa PHPUnit tidak benar-benar paralel, jadi test memverifikasi guard status di dalam transaction.
- [x] FCM best-effort (try/catch, pola `ClaimTransferService::notifyClaimant`, Firebase hanya untuk FCM): accept/reject oleh penerima → notif ke pengaju; withdraw oleh pengaju → notif ke penerima. Gagal kirim tidak boleh menggagalkan request. Test dengan mock `Messaging`.
- [x] Selaraskan docs backend; jalankan seluruh test suite dan Pint.

---

## Di luar Fase 1.2 (tahap berikutnya, jangan dikerjakan di sini)

- `claims:expire` + scheduler + notifikasi pengingat H-1 (Phase 1.6/1.7 plan lama); penutupan otomatis claim lain saat `returned`; `isFreezed`/chat read-only per status (Real-Time Chat Fase 3); aksi override admin "Cabut Claim" dan perbaikan Edit Filament (Phase 3); Flutter (Phase 2, termasuk cek model `Claim` nullable oleh Ajax); tugas `UserResource` (respons claim tanpa `User` mentah); usulan memindahkan cek 5-pending/claim ganda ke dalam transaction.

---

## Kontrak endpoint baru (ringkas)

| Method + path | Yang boleh | Body | 200 | 403 | 404 | 422 | Efek claim | Efek laporan |
|---|---|---|---|---|---|---|---|---|
| `POST /api/claims/{id}/accept` | admin **atau** penerima | — | claim | pengaju / outsider | id tidak ada | claim non-`pending`; laporan target tidak `pending` | `accepted` + `accepted_at = now()` | laporan terisi → `claimed` |
| `POST /api/claims/{id}/reject` | admin **atau** penerima | `reason` wajib string | claim | pengaju / outsider | id tidak ada | `reason` kosong; claim non-`pending` | `rejected` + `closed_reason` + `closed_by` = penerima | **tidak diubah** |
| `POST /api/claims/{id}/withdraw` | **hanya** pengaju | `reason` wajib string | claim | penerima / admin / outsider | id tidak ada | `reason` kosong; status bukan `pending`/`accepted` | `withdrawn` + `closed_reason` + `closed_by` = pengaju | bila sebelumnya `accepted`: laporan terisi yang masih `claimed` → `pending`; bila `pending`: tidak diubah |

> Reject admin tetap lewat `POST /api/admin/claims/{id}/reject` (`admin_note`) — **tidak** mengisi `closed_reason`/`closed_by`.

---

## Tabel transisi status claim (as-built Fase 1.2 — hanya transisi yang tercakup)

| Dari | Aksi | Ke | Aktor | Side effect |
|---|---|---|---|---|
| — | claim dibuat | `pending` | pengaju | conversation dibuat (sudah ada) |
| `pending` | accept | `accepted` | penerima (atau admin) | laporan terisi → `claimed`; `accepted_at` terisi |
| `pending` | reject | `rejected` | penerima (atau admin) | `closed_reason` + `closed_by` = penerima; laporan tidak diubah |
| `pending` | withdraw | `withdrawn` | pengaju | `closed_reason` + `closed_by` = pengaju; laporan tidak diubah |
| `accepted` | withdraw | `withdrawn` | pengaju | laporan terisi yang masih `claimed` → `pending` |
| `accepted` | markTransferred | `returned` | pengaju/penerima/admin | laporan → `returned` (sudah ada) |

---

## Urutan eksekusi & dependensi

**1.2a → 1.2b → 1.2c** (1.2b dan 1.2c memakai policy/service dari 1.2a). Tugas `UserResource` boleh sebelum/sesudah, bebas urutan.

---

## Open Items

- **DISETUJUI user 2026-10-24:** reject penerima → `closed_reason` + `closed_by` = id penerima; laporan tidak diubah.
- **DISETUJUI user 2026-10-24:** tidak ada migration baru untuk Fase 1.2.
- **DISETUJUI user 2026-10-24:** prioritas plan ini `High` (mengikuti plan induk).
- **USULAN (belum diputuskan):** admin reject juga mengisi `closed_by` — sekarang admin tetap menulis `admin_note` saja.
- **✅ SELESAI 2026-10-25 (Bob-04):** `PATCH /api/claims/{id}` **dihapus** — `ClaimController::update` dibuang, route kini **405**; alasan: endpoint no-op (authorize-only) dan tidak dipakai Flutter. `ClaimPolicy::update` **tetap ada** karena dipakai aksi Filament `ClaimResource` (EditAction). Teks lama: ~~dirapikan atau dihapus~~.
- **Catatan:** respons claim masih mengembalikan `User` mentah — dikerjakan lewat tugas `UserResource` terpisah (di luar cakupan 1.2).
- **✅ SELESAI 2026-10-25 (fix transfer claim, sudah merge `develop`):** `ClaimTransferService::notifyClaimant` kini memakai API v8 `CloudMessage::new()->withToken()` (`withTarget` sudah dihapus di firebase-php 8.5.0) + guard status `accepted` di dalam `DB::transaction` dengan `lockForUpdate`; 235 test lulus. Lihat [[Bob-261025-01-fix-claim-transfer-fcm-lock]]. **Teks lama:** ~~`ClaimTransferService::notifyClaimant` masih memakai `CloudMessage::withTarget('token', ...)` — method itu dihapus di firebase-php 8.5.0. Exception ditelan try/catch → notifikasi serah terima saat itu tidak pernah terkirim.~~
- **✅ SELESAI 2026-10-25 (audit FCM v8, [[Bob-261025-03-fcm-api-audit]]):** audit **bersih — tidak ada API FCM usang di `app/`** (`CloudMessage::new()->withToken()->withNotification()->withData()` + `Messaging::send`, valid di firebase-php 8.5.0); `routes/`, `database/`, `config/firebase.php` tidak memakai API FCM. **Tidak ada FCM di jalur admin:** `AdminController` tidak mengirim FCM, `Notification::make()` di Filament `ClaimResource`/`UserResource` adalah notifikasi Filament (bukan FCM), `ConversationController` tanpa FCM. **Keputusan user 2026-10-25: FCM admin tidak diperlukan sekarang** (celah konsistensi di atas ditutup dengan keputusan ini). Commit `3b65f5d` juga meredaksi token FCM dari log kegagalan (`ClaimNotificationService`, `ClaimTransferService`).
- **✅ SELESAI 2026-10-25 (Bob-05):** `test_fcm.php` dihapus; helper `DeadFcmTokenCleaner` mengosongkan `users.fcm_token` untuk `NotFound`/`SenderIdMismatch` **hanya bila token di DB masih sama** dengan token gagal (refresh token aman). 239 → 247 test lulus.
- **✅ SELESAI 2026-10-25 (Bob-06):** `whereUuid('id')` di `lost-reports/{id}`, `found-reports/{id}`, `conversations/{id}/messages` (GET+POST), `messages/{id}/read` — **non-UUID → 404, bukan 500**. 247 → 252 test lulus (675 assertion).
- **✅ SELESAI 2026-10-29 (koreksi status PR):** PR 1.2c (`feature/notification/claim-decision-fcm`, `23d0be6`) **SUDAH merge `develop`** lewat **PR #11**, squash commit `18c85d4` (2026-10-24). Diverifikasi dengan `git fetch --all --prune` + `git ls-tree -r --name-only origin/develop` (file `ClaimNotificationService.php`, `ClaimConcurrencyTest.php`, `ClaimNotificationTest.php` ada di `develop`). Kesalahan sebelumnya berasal dari ref lokal basi (`git branch --contains` tanpa fetch). **Teks lama:** ~~⏳ MENUNGGU: PR 1.2c (`feature/notification/claim-decision-fcm`, `23d0be6`) belum dibuat/merge ke `develop` — status PR tidak diubah tanpa konfirmasi user.~~
- **🆕 OPEN (2026-10-25, prioritas rendah, BELUM diputuskan):**
  - (a) **Chore Pint:** `vendor/bin/pint --test` gagal di **6 file lama** (`ListClaims.php`, `EditUser.php`, `ListUsers.php`, `AdminMiddleware.php`, `GoogleTokenVerifier.php`, `bootstrap/providers.php`) — sudah gagal di `develop`, tidak disentuh Bob-04/06 (`test_fcm.php` sudah dihapus Bob-05). Branch terpisah `chore/repo/pint-cleanup`.
  - (b) **Keputusan sengaja dilewati: retry/backoff untuk `ServerUnavailable`** — tidak dibuat (2026-10-25); kegagalan tetap `Log::warning` dan request tetap 2xx.

## Tindak lanjut (2026-10-25) — catatan Dominic

Status plan **tidak diubah** (`In Progress`); tidak ada item ditandai selesai tanpa konfirmasi user.

- **Fakta yang sudah tercatat:** fix transfer claim `fix/claim/transfer-fcm-and-lock` (commit `a0226b4`, `8d24d2c`) sudah merge ke `develop` — FCM pakai API v8, guard `accepted` di dalam `DB::transaction` + `lockForUpdate`, foto disimpan setelah guard lolos, kegagalan FCM di-log `Log::warning`; 235 test lulus. Detail: [[Bob-261025-01-fix-claim-transfer-fcm-lock]], [[TechnicalReference]] §11/§12/§16/§17.

### Open items — temuan di luar scope (BELUM diputuskan)

| # | Temuan | Kondisi 2026-10-25 (setelah Bob-03…06) | Status |
|---|--------|---------|--------------------|
| 1 | FCM jalur admin/Filament | **Tidak ada FCM di jalur admin** — audit Bob-03 bersih; `AdminController` tidak mengirim FCM, `Notification::make()` Filament bukan FCM | ✅ **Selesai/putus**: keputusan user 2026-10-25 — FCM admin tidak diperlukan sekarang |
| 2 | `UserResource` belum ditinjau | Ditinjau Bob-03: hanya `Notification::make()` Filament, bukan FCM | ✅ **Selesai** (sisanya `User` mentah di respons claim = item (xiv) Backlog) |
| 3 | `PATCH /api/claims/{id}` mengembalikan `200` tanpa perubahan | Route dihapus Bob-04 (`b1059d5`), kini **405**; `ClaimPolicy::update` tetap untuk Filament | ✅ **Selesai** |
| 4 | ID non-UUID menghasilkan `500` | `whereUuid` Bob-04 (claim/admin) + Bob-06 (lost/found/chat/messages) → **404** | ✅ **Selesai** |

### Open items baru (2026-10-25, prioritas rendah, BELUM diputuskan)

| # | Temuan | Kondisi | Usul |
|---|--------|---------|------|
| 5 | Chore Pint: 6 file lama gagal `vendor/bin/pint --test` | `ListClaims.php`, `EditUser.php`, `ListUsers.php`, `AdminMiddleware.php`, `GoogleTokenVerifier.php`, `bootstrap/providers.php` — sudah gagal di `develop`, tidak disentuh Bob-04/06 | branch `chore/repo/pint-cleanup`, prioritas **rendah** |
| 6 | Retry/backoff `ServerUnavailable` | **Sengaja tidak dibuat** (keputusan 2026-10-25) | tidak ada aksi — kegagalan tetap `Log::warning`, request tetap 2xx |

---

## Konflik dengan dokumen lain

- [[Claim Langsung ke Laporan Target - Lost&Found]] §Phase 1b — item accept/reject/withdraw **dianotasi** menunjuk plan ini (checkbox tidak dicentang; pengerjaan di plan ini).
- [[Claim Dua Arah dan Serah Terima oleh Pengguna - Lost&Found]] §Phase 1.2 — anotasi menunjuk plan ini (§1.2–1.8 lain tetap berlaku untuk tahap berikutnya).
- [[TechnicalReference]] §11/§12/§16/§17 — diperbarui 2026-10-24 mengikuti as-built Fase 1.2, diselaraskan lagi 2026-10-25 (Bob-03…06).
- **Laporan 2026-10-25:** [[Bob-261025-03-fcm-api-audit]] · [[Bob-261025-04-claim-uuid-patch]] · [[Bob-261025-05-fcm-token-cleanup]] · [[Bob-261025-06-uuid-route-constraint]] · catatan Dominic [[Dominic-261025-07-catat-bob03-06]].
- [[ERD]], `schema.dbml`, [[PRD]] — tidak diubah (tidak ada perubahan skema/kebutuhan).

---

## Related Files

- **Backend:** `C:\Project\lostfound-backend` — Gitea kampus `git.informatikapolines.id/Daniel_Geovani/lostfound-backend` (Private, HTTPS)
- **Plan induk:** [[Claim Langsung ke Laporan Target - Lost&Found]]
- **Plan asal alur:** [[Claim Dua Arah dan Serah Terima oleh Pengguna - Lost&Found]]
- **Dokumen:** [[TechnicalReference]] §12/§16/§17 · [[ERD]] · [[Lost&Found Progress]]
- **Laporan pelaksana Fase 1.2:** [[Bob-261024-02-claim-user-accept-reject]] · [[Bob-261024-03-claim-user-withdraw]] · [[Bob-261024-04-claim-fcm-concurrency]]
- **Laporan terkait:** [[R-261023-03-claim-null-safe-access]] · [[R-261023-05-claim-reject-pending-only]]

---

#plan #lost-and-found #claim #accept #reject #withdraw #high
