---
type: plan
project: lost-found
status: active
priority: high
updated: 2026-10-24
summary: Claim langsung ke laporan target, laporan sendiri opsional, conversation per claim_id. 2026-10-23: Phase 1a & 1b-i SELESAI + merge develop (PR #6 d1ef1eb 155 test, PR #7 cdae742 179 test); reject hanya untuk claim pending (T-261023-05, merge develop); sisa endpoint user accept/reject/withdraw (kini plan Fase 1.2: [[Claim Fase 1.2 - Accept Reject Withdraw oleh Pengguna - Lost&Found]])
---

# Claim Langsung ke Laporan Target - Lost&Found

**Tanggal:** 2026-10-19
**Project:** [[PBL]] Lost&Found
**Status:** In Progress
**Priority:** High

---

## Tujuan

Menjadi **sumber tunggal** untuk dua keputusan:

- **A1 — Claim langsung ke laporan target:** pengaju tidak wajib punya laporan sendiri; `claims.lost_report_id` dan `claims.found_report_id` menjadi nullable (minimal satu terisi).
- **A2 — Conversation per `claim_id`:** memperbaiki dugaan bug "tidak bisa claim ke akun yang sama meski beda laporan" yang disebabkan percakapan dicari per pasangan user.

Plan ini juga menutup tiga celah yang ditemukan saat review: kontrak request `POST /api/claims` yang tidak ambigu, `ConversationController` yang tidak tahan sisi `NULL`, dan daftar teks lama yang harus digantikan sebelum implementasi.

> **Status keputusan:** A1 dan A2 **disetujui user 2026-10-19** dan **DILAKSANAKAN 2026-10-23**: migration + kode sudah ada dan **merge ke `develop`** — Phase 1a PR #6 (`d1ef1eb`, 155 test), Phase 1b-i PR #7 (`cdae742`, 179 test). Teks lama di bawah ini menyebut "belum diimplementasi" — **sudah tidak berlaku**.
>
> Isi A1/A2 dipindahkan dari [[Claim Dua Arah dan Serah Terima oleh Pengguna - Lost&Found]] §Revisi 2026-10-19. Plan lama tetap berlaku untuk bagian lain (chat verifikasi, serah terima, kedaluwarsa, pembekuan claim, Filament) dan **hanya** digantikan pada 7 lokasi di §Teks Lama yang Digantikan.

---

## A1. Claim Langsung ke Laporan Target

### Keputusan (membalik keputusan lama)

- Keputusan lama: pemilik wajib punya laporan hilang; `claims.lost_report_id` NOT NULL; claim tanpa `lost_report_id` ditolak API.
- Keputusan baru (**disetujui 2026-10-19**): claim diajukan **langsung ke laporan target**, tanpa wajib punya laporan sendiri.
  - Target laporan temuan → pengaju = pemilik barang (tidak perlu laporan hilang).
  - Target laporan hilang → pengaju = penemu (tidak perlu laporan temuan).
  - Laporan milik sendiri **OPSIONAL** (boleh ditautkan bila ada), bukan syarat.

### Peran pengaju/penerima

Dihitung dari laporan target, tidak disimpan di kolom. Tidak ada kolom `claimant_role`.

| Target | Pengaju | Penerima (yang memverifikasi) |
|---|---|---|
| Laporan temuan (`found_report_id`) | pemilik barang | `found_report.reporter_id` (penemu) |
| Laporan hilang (`lost_report_id`) | penemu | `lost_report.reporter_id` (pemilik) |

Helper **as-built (2026-10-23)**: penerima dihitung di `Claim::receiverId()` (pelapor laporan yang terisi, bukan `claimant_id`; sisi NULL dilewati) dan `Claim::isReceiver($user)`; dipakai `ClaimPolicy` (`view`, `update`, `markTransferred`). Rencana semula menyebut helper `ClaimPolicy::isPenerima()` — **tidak diimplementasi dengan nama itu**; logikanya pindah ke model.

### Perubahan status laporan

Hanya berlaku untuk laporan yang **terisi**. Sisi NULL dilewati.

- `accept` → laporan target (dan laporan milik pengaju bila ditautkan) jadi `claimed`.
- `markTransferred` → laporan yang terisi jadi `returned`. **DISETUJUI user 2026-10-23:** `markTransferred` boleh dilakukan **admin ATAU pelapor laporan target** (`ClaimPolicy::markTransferred`), bukan hanya admin — dokumen lama menyebut "admin atau penemu".
- `withdraw`/`expire` setelah accepted → laporan yang terisi kembali `pending`.

### Dampak Flutter

- Tombol **"Aku Menemukan Barang Ini"** di detail laporan hilang **tidak lagi** redirect ke form Lapor Temuan; langsung buka form claim.
- Dropdown "laporan sendiri" jadi **opsional** (boleh kosong / "Tidak ada").
- **E-3** di [[Backlog UI Redesign - Lost&Found]] menyesuaikan: dropdown `mine=1&status=pending` hanya muncul bila user memilih menautkan laporan sendiri.
- Perbaikan IDOR open item **(xiv)** di [[Backlog Perbaikan Lanjutan - Lost&Found]] memakai aturan baru: otorisasi berbasis **penerima laporan target**, bukan `lost_report_id` milik pengguna.

---

## A2. Bug Chat per Pasangan User (DUGAAN)

> **Status:** **DUGAAN** dari pembacaan kode, **belum direproduksi**. Perlu user memverifikasi.

**Gejala:** user tidak bisa claim ke akun yang sama meski beda laporan — langsung masuk ke chat lama.

**Dugaan penyebab:**

- `ClaimController::store()` hanya memblokir claim ganda per `found_report_id` (per laporan), bukan per pasangan user. Jadi claim ke laporan kedua **dibuat**.
- `ConversationController::store()` jalur `other_user_id` mencari percakapan per **PASANGAN USER** (partial unique index `conversations_user_pair_unique`, `claim_id IS NULL`). Akibatnya tombol Chat ke penemu yang sama membuka percakapan lama dengan konteks laporan pertama — terlihat seolah claim kedua gagal.

**Perbaikan:**

1. Conversation dari claim dibuat **per `claim_id`** (unique index per `claim_id` sudah ada), bukan per pasangan.
2. Chat **sebelum** claim tetap per pasangan user (tidak berubah).
3. Daftar chat wajib menampilkan konteks laporan (kartu konteks — [[Real-Time Chat - Lost&Found]] §Kartu Konteks).
4. Test: dua claim dari satu akun ke dua laporan berbeda milik penemu yang sama → **dua conversation** berbeda.

---

## Kontrak Request `POST /api/claims`

Field **tetap** `lost_report_id` dan `found_report_id`, **keduanya nullable**. Tidak ada field baru.

**Aturan:**

1. **Tepat satu** dari dua laporan adalah laporan **TARGET** — laporan yang `reporter_id`-nya **BUKAN** `claimant_id`, dan statusnya `pending`.
2. Laporan satunya **OPSIONAL**; bila dikirim, wajib **milik pengaju**.
3. `lost_report_id` = target → pengaju = penemu; `found_report_id` = target → pengaju = pemilik.
4. Kedua id **kosong** → 422.
5. Kedua id **milik orang lain** (tidak ada yang bisa diidentifikasi sebagai target tunggal) → 422.
6. Kedua id **milik pengaju** (tidak ada target) → 422.
7. Target bukan `pending` → 422. Id tidak ada / bukan UUID valid → 422.
8. Sudah ada claim aktif per (`claimant_id`, target) → 422. Target sudah punya 5 claim pending aktif → 422 (aturan §3 plan lama tidak berubah).
9. Bila laporan sendiri ditautkan, selain wajib **milik pengaju** statusnya juga wajib **`pending`**; bila tidak → 422. (Laporan sendiri yang sudah `claimed`/`returned`/`closed` tidak boleh ditautkan.)

> Kalimat lama **"id yang dikirim harus milik claimant"** **DIGANTI** oleh aturan di atas — kalimat itu bertabrakan dengan target yang justru milik orang lain.

### Tabel Kasus Uji

| # | `lost_report_id` | `found_report_id` | Kondisi | Hasil |
|---|---|---|---|---|
| 1 | null | null | tidak ada laporan | **422** |
| 2 | milik pengaju | milik pengaju | dua laporan sendiri, tidak ada target | **422** |
| 3 | milik orang lain | milik orang lain | dua-duanya bukan milik pengaju (target ambigu) | **422** |
| 4 | null | target milik orang lain, `pending` | klaim laporan temuan tanpa laporan sendiri | **201**, penerima = penemu |
| 5 | target milik orang lain, `pending` | null | klaim laporan hilang tanpa laporan sendiri | **201**, penerima = pemilik |
| 6 | milik pengaju | target milik orang lain, `pending` | target + laporan sendiri ditautkan | **201**, saat accept laporan pengaju ikut `claimed` |
| 7 | target milik orang lain, `pending` | milik pengaju | target + laporan sendiri ditautkan | **201**, saat accept laporan pengaju ikut `claimed` |
| 8 | null | target milik orang lain, `claimed` | target bukan `pending` | **422** |
| 9 | target = laporan pengaju sendiri | null | `reporter_id` target = `claimant_id` | **422** |
| 10 | target milik orang lain | milik pengaju, tapi id tidak ada | id fiktif / bukan UUID | **422** |
| 11 | milik pengaju, `returned` | target milik orang lain, `pending` | laporan sendiri ditautkan tapi bukan `pending` (aturan 9) | **422** |

> Kasus 1–3 adalah tiga larangan eksplisit: keduanya kosong, keduanya milik orang lain, keduanya milik pengaju. Kasus 8 menguji aturan 7 (target bukan `pending`), bukan aturan 5.


---

## `ConversationController` Cabang `claim_id` — Tahan NULL

### Aturan peserta

- **Peserta** = `claimant_id` + **pelapor laporan target**. **Bukan** dibaca langsung dari `lostReport->reporter_id` dan `foundReport->reporter_id` (keduanya bisa NULL).
- Penentuan `user1_id`/`user2_id`, cek peserta (**403**), dan guard **"reporter sama"** memakai dua peserta tersebut.
  - **DISETUJUI user 2026-10-23** (bukan lagi rekomendasi): `user1_id = claimant_id`, `user2_id` = pelapor target — deterministik dan tidak bergantung sisi laporan mana yang terisi.
- `conversations.lost_report_id`/`found_report_id` **ikut mengikuti claim** — boleh NULL salah satu.
- Guard "reporter sama" (dua peserta identik) → 422, sama seperti aturan `POST /api/conversations` yang sudah berjalan.
  - Catatan: guard ini **redundan untuk cabang `claim_id`** karena aturan 1 kontrak request (target wajib bukan milik pengaju) sudah menjamin dua peserta berbeda. Tetap dipasang sebagai pengaman, **tidak perlu test khusus**.

### Auto-create

- Auto-create conversation di `ClaimController::store()` **per `claim_id`** (keputusan 2026-10-18, [[Real-Time Chat - Lost&Found]] §Backend API-as-built).
- Jalur chat **sebelum** claim tetap per pasangan user (`other_user_id`), tidak berubah.

### Satu jalur pembuatan conversation (keputusan)

- Logika pembuatan conversation dipindah ke **satu service/action** — usulan nama `ClaimConversationService::forClaim(Claim): Conversation` — yang dipakai **keduanya**: `ConversationController::store()` (cabang `claim_id`) dan `ClaimController::store()`. Tidak ada duplikasi `firstOrCreate` di dua tempat.
- `ClaimController::store()` membungkus `Claim::create()` + pembuatan conversation dalam **satu `DB::transaction`**: claim **tidak boleh** tersisa tanpa conversation. Bila pembuatan conversation gagal → rollback penuh, klien dapat 422/500, bukan claim setengah jadi.
- Kegagalan validasi di service dilempar sebagai **exception domain** (mis. `InvalidClaimParticipantException`) dan diterjemahkan controller menjadi **422** — service tidak memanggil `abort_if`/tidak tahu HTTP.

### Contoh (ilustratif, bukan kode final)

```php
// --- ClaimConversationService (dipakai dua controller) ---
public function forClaim(Claim $claim): Conversation
{
    $target = $claim->found_report_id ? $claim->foundReport : $claim->lostReport;
    $receiverId = $target?->reporter_id;

    if (! $receiverId || $claim->claimant_id === $receiverId) {
        throw new InvalidClaimParticipantException(); // → 422 di controller
    }

    return Conversation::firstOrCreate(
        ['claim_id' => $claim->id],
        [
            'user1_id' => $claim->claimant_id,
            'user2_id' => $receiverId,
            'lost_report_id' => $claim->lost_report_id,   // boleh NULL
            'found_report_id' => $claim->found_report_id, // boleh NULL
        ]
    );
}

// --- ClaimController::store() ---
$claim = DB::transaction(function () use ($validated, $user) {
    $claim = Claim::create([...]);                              // status pending
    app(ClaimConversationService::class)->forClaim($claim);     // gagal → rollback
    return $claim;
});

// Cek peserta (403) dan daftar percakapan memakai $conversation->user1_id / user2_id,
// bukan lostReport->reporter_id / foundReport->reporter_id.
```

### Race Condition `accept` (pengganti contoh di plan lama Edge Case #4)

Kunci **baris claim** dan cek `claim.status` **di dalam** transaction, lalu kunci laporan yang **terisi**; sisi NULL dilewati. Semua kegagalan → **422**.

```php
DB::transaction(function () use ($claimId) {
    $claim = Claim::lockForUpdate()->findOrFail($claimId); // kunci baris claim dulu

    if ($claim->status !== 'pending') {
        throw new ClaimNotPendingException(); // → 422 (request kedua kalah)
    }

    $reports = array_filter([
        $claim->lost_report_id  ? LostReport::lockForUpdate()->find($claim->lost_report_id)  : null,
        $claim->found_report_id ? FoundReport::lockForUpdate()->find($claim->found_report_id) : null,
    ]);

    foreach ($reports as $report) {
        if ($report->status !== 'pending') {
            throw new ClaimNotPendingException('Laporan sudah diklaim claim lain'); // → 422
        }
    }

    // Update claim → accepted; laporan yang terisi → claimed; sisi NULL dilewati.
});
```

### Test wajib

- [ ] Claim tanpa laporan sendiri ke **laporan temuan** → jalur conversation tidak error.
- [ ] Claim tanpa laporan sendiri ke **laporan hilang** → jalur conversation tidak error.
- [ ] Dua claim dari satu akun ke dua laporan penemu yang sama → **dua conversation berbeda**.
- [ ] Non-peserta membuka conversation → **403**.
- [ ] `accept`/`withdraw`/`markTransferred` tidak error saat salah satu sisi laporan NULL.
- [ ] `conversations.lost_report_id`/`found_report_id` mengikuti claim (NULL bila claim NULL).
- [ ] **Rollback:** pembuatan conversation gagal → claim **tidak** tersisa (tidak ada baris `claims` tanpa `conversations`).
- [ ] **Accept bersamaan:** dua request `accept` pada claim yang sama → satu sukses, satu **422**, laporan tidak berubah dua kali.


---

## Teks Lama yang Digantikan

Sebelum implementasi, baca tabel ini. Teks lama **tidak dihapus** (riwayat) tetapi **tidak berlaku**.

| # | Lokasi di [[Claim Dua Arah dan Serah Terima oleh Pengguna - Lost&Found]] | Teks lama (ringkas) | Pengganti di plan ini |
|---|---|---|---|
| 1 | Alur Baru §1.B | "Sistem cek: penemu wajib punya laporan temuan" + redirect ke form Lapor dengan `returnTo` | §A1 Dampak Flutter — langsung buka form claim, tanpa cek laporan lawan |
| 2 | §1 Constraint | `lost_report_id` dan `found_report_id` sama-sama **NOT NULL**; claimant harus pelapor salah satu laporan | §Perubahan Skema + §Kontrak Request |
| 3 | Edge Case #1 — "Penemu Tidak Punya Laporan Temuan" | redirect ke form Lapor + deep link kembali ke claim | Tidak ada lagi sebagai edge case; laporan sendiri opsional (§A1) |
| 4 | Dampak Backend #1 (`ClaimController::store()`) | "claimant harus pelapor `lost_report_id` ATAU `found_report_id`" | §Kontrak Request (aturan 1–9) + §A1 validasi |
| 5 | Flutter §1 dan §2 | Cek "sudah punya laporan lawan?" + redirect; dropdown "Pilih Laporan [Hilang/Temuan] Kamu" **wajib** | §A1 Dampak Flutter — dropdown opsional, tanpa redirect |
| 6 | Phase 2.1 dan Phase 2.6 | Redirect ke form Lapor; deep link `?returnTo=claim&lostReportId=xxx` | §Next Steps Phase 2 — tombol langsung ke form claim, tanpa deep link |
| 7 | Edge Case #4 (race condition) | Contoh kode `lockForUpdate()` pada **kedua** laporan tanpa cek NULL | §Race Condition `accept` di atas — hanya laporan yang terisi |
| — | Perubahan Skema | — | **Hanya** `lost_report_id`/`found_report_id` nullable + CHECK minimal satu terisi. `closed_reason`, `closed_by`, `accepted_at` tetap sesuai plan lama. |

---

## Perubahan Skema (DILURUSKAN 2026-10-23)

### Tabel `claims`

```php
// Migration (Phase 1a)
$table->uuid('lost_report_id')->nullable()->change();
$table->uuid('found_report_id')->nullable()->change();

// CHECK minimal salah satu terisi (PostgreSQL)
DB::statement('ALTER TABLE claims ADD CONSTRAINT claims_target_report_check
    CHECK (lost_report_id IS NOT NULL OR found_report_id IS NOT NULL)');
```

- Tetap: `claimant_id` NOT NULL, `status` default `pending`, tanpa kolom `claimant_role`, tanpa kolom `code` claim.
- Tetap dari plan lama: `accepted_at` (timestamp, index), `closed_reason` (text), `closed_by` (uuid FK users, on delete set null).
- **ERD.md dan `schema.dbml` sudah diperbarui 2026-10-23** (migration sudah ada dan merge `develop`).

---

## Next Steps

Urutan: migration nullable + CHECK → `store()` + transaction + service conversation → conversation NULL-safe → Flutter → test. **Phase 1a selesai (merge `develop` PR #6 `d1ef1eb`); Phase 1b sebagian (1b-i merge PR #7 `cdae742`). Terbuka: endpoint user accept/reject/withdraw, Flutter, test sisa.**

### Phase 1a — Backend (fondasi claim)

- [x] Migration: `lost_report_id` & `found_report_id` nullable + CHECK minimal satu terisi; `accepted_at`, `closed_reason`, `closed_by` (dari plan lama). ✅ 2026-10-23 — `2026_10_23_000001_make_claim_reports_nullable`, merge `develop` PR #6 `d1ef1eb`.
- [x] `ClaimController::store()`: terapkan §Kontrak Request (aturan 1–9); syarat "wajib punya lost_report" dihapus; `Claim::create()` + conversation dalam satu `DB::transaction`. ✅ 2026-10-23 (merge PR #6).
- [x] `ClaimConversationService` (satu jalur pembuatan conversation) dipakai `ClaimController::store()` dan `ConversationController::store()` cabang `claim_id`; exception domain → 422. ✅ 2026-10-23 (merge PR #6).
- [x] `ConversationController::store()` cabang `claim_id`: peserta = claimant + pelapor target, NULL-safe, 403. ✅ 2026-10-23 (merge PR #6).
- [x] `markTransferred` NULL-safe (laporan yang terisi saja). ✅ 2026-10-23 (merge PR #6).
- [x] Test kontrak request (tabel kasus uji) + test conversation NULL-safe + test rollback. ✅ 2026-10-23 — 155 test lulus (`php artisan test`), merge PR #6 `d1ef1eb`.

### Phase 1b — Backend (accept/reject/withdraw, menyusul Phase 1.2 plan lama)

- [ ] `accept`/`reject`/`withdraw`: belum ada endpoint — dikerjakan di **Phase 1.2 plan lama** dengan aturan NULL-safe dari plan ini (kunci baris claim + cek `status` di dalam transaction, lockForUpdate hanya laporan terisi, kegagalan → 422). **Anotasi 2026-10-23 (as-built):** `PATCH /api/claims/{id}` (admin) hanya memuat + otorisasi `ClaimPolicy::update` lalu return; terima/tolak admin lewat `AdminController` → `ClaimDecisionService` + aksi Filament.
  - **Anotasi 2026-10-24:** accept/reject oleh **penerima** + withdraw oleh **pengaju** dipindah ke sumber tunggal [[Claim Fase 1.2 - Accept Reject Withdraw oleh Pengguna - Lost&Found]] (urutan 1.2a → 1.2b → 1.2c); checkbox ini **tidak** dicentang.
- [x] `ClaimTransferService` NULL-safe, termasuk `notifyClaimant` (FCM). ✅ 2026-10-23 (sudah masuk Phase 1a, merge PR #6).
- [x] `AdminController::acceptClaim`/`rejectClaim` NULL-safe (laporan sisi NULL tidak dibaca buta). ✅ 2026-10-23 — lewat `ClaimDecisionService`, merge PR #7 `cdae742` (179 test).
- [x] Aksi `ClaimResource` Filament yang membaca `lostReport`/`foundReport` diberi guard NULL. ✅ 2026-10-23 (merge PR #7). **Catatan:** aksi Filament belum punya test otomatis sendiri (lihat Open Items).
- [x] Penerima dari pelapor laporan target. ✅ 2026-10-23 (merge PR #7) — **as-built:** `Claim::receiverId()` + `Claim::isReceiver()` + `ClaimPolicy` (`view`/`update`/`markTransferred`), bukan helper `ClaimPolicy::isPenerima()`.
- [ ] Test dua `accept` bersamaan pada claim yang sama → satu sukses, satu 422.

### Phase 2 — Flutter

- [ ] Hapus redirect "Aku Menemukan Barang Ini" ke form Lapor; langsung form claim.
- [ ] Dropdown laporan sendiri opsional (E-3: `mine=1&status=pending` hanya bila menautkan).
- [ ] Model `Claim` Flutter: `lostReport`/`foundReport` menjadi **nullable**; sesuaikan layar daftar & detail claim yang saat ini menganggap keduanya selalu ada (hindari null crash).
- [ ] Sesuaikan pesan error 422 dengan aturan kontrak request.
- [ ] Kartu konteks laporan di daftar/ruang chat ([[Real-Time Chat - Lost&Found]] §Kartu Konteks — masih USULAN).


### Phase 3 — Filament

- [ ] Detail claim tahan `lost_report_id`/`found_report_id` NULL (panel kiri/kanan bisa kosong).

### Phase 4 — Test

- [ ] Dua claim satu akun ke dua laporan penemu sama → dua conversation.
- [ ] Claim tanpa laporan sendiri ke laporan hilang & temuan → tidak error di jalur conversation.
- [ ] Accept/transfer/withdraw dengan salah satu sisi NULL.
- [ ] Manual: dua akun, dua laporan penemu sama, cek isi chat tidak tercampur.

---

## Ketergantungan

- [[Claim Dua Arah dan Serah Terima oleh Pengguna - Lost&Found]] — alur claim, verifikasi, serah terima, pembekuan, kedaluwarsa (tetap berlaku selain 7 teks yang digantikan).
- [[Real-Time Chat - Lost&Found]] — auto-create conversation, kartu konteks, read-only per status claim.
- [[Verifikasi via Chat - Lost&Found]] — banner tips & alur verifikasi (isi lama soal `lost_report_id` wajib sudah tidak berlaku).
- [[Backlog UI Redesign - Lost&Found]] — **E-3** (dropdown claim & filter Claim Saya) menyesuaikan dropdown opsional.
- [[Backlog Perbaikan Lanjutan - Lost&Found]] — **item (xiv)** IDOR `ClaimController` memakai otorisasi penerima laporan target.

---

## Related Files

- **Backend:** `C:\Project\lostfound-backend` — Gitea kampus `git.informatikapolines.id/Daniel_Geovani/lostfound-backend` (Private, HTTPS)
- **Flutter mobile:** `C:\Project\lostfound-mobile` — Gitea kampus `git.informatikapolines.id/Daniel_Geovani/lostfound-mobile` (Private, HTTPS)
- **Plan asal keputusan:** [[Claim Dua Arah dan Serah Terima oleh Pengguna - Lost&Found]]
- **PRD:** [[PRD]] — §3.D, §4.2, §5, Glossary Claim & definisi tabel Claim sudah diselaraskan 2026-10-23 (nullable BERLAKU, keputusan lama dibalik)
- **Technical Reference:** [[TechnicalReference]] — §12, §16
- **ERD / schema:** [[ERD]], `schema.dbml` — sudah diperbarui 2026-10-23 (nullable + CHECK `claims_target_report_check` + kolom `accepted_at`/`closed_reason`/`closed_by`) + laporan R-261023-04

---

## Open Items

- **Bug A2 masih dugaan, belum direproduksi user.** Perbaikan conversation per `claim_id` tetap dikerjakan karena benar secara desain, tetapi gejala "tidak bisa claim ke akun sama" perlu dipastikan ulang setelah fix.
- **USULAN, BELUM DISETUJUI:** batas claim pending aktif per pengguna / throttle endpoint claim. Tidak jadi keputusan; aturan yang berlaku sekarang hanya maks 5 claim pending per laporan. Phase 1a sudah selesai (2026-10-23) — usulan ini **tetap ditunda** sampai user memutuskan.
- **DISETUJUI user 2026-10-23:** urutan `user1_id`/`user2_id` cabang `claim_id` (claimant dulu, pelapor target kedua) — disetujui user 2026-10-23, bukan lagi "menunggu persetujuan". Agar UI `other_user` stabil.
- **Sudah tidak berlaku:** "Migration belum dibuat; menunggu Coding Agent (Phase 1a)" — migration `2026_10_23_000001_make_claim_reports_nullable` ada dan merge `develop` PR #6 (`d1ef1eb`) 2026-10-23.
- **DISETUJUI user 2026-10-23:** `markTransferred` oleh **admin ATAU pelapor laporan target** (`ClaimPolicy::markTransferred` → `Claim::receiverId()`); wajib status `accepted`, `proof_photo` wajib.
- **Terbuka (Phase 1b):** endpoint user `accept`/`reject`/`withdraw` belum ada; test dua `accept` bersamaan pada claim yang sama belum ada (R-261023-03 tidak menyebutkannya).
- **DISETUJUI user 2026-10-23, implementasi T-261023-05 (commit `a262255`, 182 test lulus, sudah merge `develop`):** `ClaimDecisionService::reject()` hanya untuk claim `pending` (selain itu **422** via `ClaimNotPendingException::reject()`) dan **tidak mengubah status laporan sama sekali**; memakai `lockForUpdate` + cek `pending`; `AdminController::rejectClaim` dan aksi Tolak Filament menangkap exception → 422 / notifikasi warning. **Teks lama (tidak dihapus):** "`ClaimDecisionService::reject()` tidak memeriksa status claim (menerima status apa pun dan menyetel laporan kembali `pending`); usul `reject` hanya untuk claim `pending` dan tidak mengubah status laporan" — **sudah tidak berlaku**.
- **DISETUJUI user 2026-10-23:** respons claim (`ClaimController` relasi `claimant`/`transferredBy`) masih mengembalikan model `User` mentah → `nim`, `whatsapp`, `email`, `blocked_reason` ikut terkirim. Diperbaiki **sekarang lewat tugas backend terpisah** (`UserResource`), setelah Ajax cek model `Claim` Flutter — **bukan** menunggu [[Nomor WhatsApp Pengguna - Lost&Found]].
- **USULAN (belum disetujui):** cek "5 claim pending" dan "claim ganda" di `ClaimController::store()` berada **di luar** `DB::transaction` (risiko rendah) — usul dipindah ke dalam transaction dengan `lockForUpdate`.
- **Catatan:** aksi Filament `ClaimResource` belum punya test otomatis (diuji lewat test `ClaimDecisionService`).
- Sinkronisasi `docs/` repo backend belum dilakukan (di luar lingkup dokumen vault ini).
- **Risiko (2026-10-23):** admin **tidak bisa lagi menolak claim `accepted`** lewat endpoint/Filament Tolak (422). Alur batal/tutup setelah `accepted` (`withdraw`, `closed_reason`, `closed_by`) menunggu **Phase 1.2 plan lama** — claim `accepted` yang macet belum punya jalan keluar rapi selain form **Edit Filament** (yang tidak mengembalikan status laporan).
- **Open item baru (belum dikerjakan):** form **Edit Filament `ClaimResource`** membiarkan admin mengubah `status`, `lost_report_id`, `found_report_id` secara bebas, melewati aturan status (Phase 3 Filament).
- **Open item baru (belum dikerjakan, low):** aksi **Tolak Filament** mewajibkan `admin_note` (`->required()`) sedangkan API `admin_note` **nullable**.

---

#plan #lost-and-found #claim #nullable #conversation #chat #high
