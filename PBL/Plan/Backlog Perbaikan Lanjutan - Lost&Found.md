---
type: plan
project: lost-found
status: active
priority: medium (sementara, menunggu user)
created: 2026-10-11
updated: 2026-10-12
summary: Backlog perbaikan lanjutan dari plan Perbaikan Flow Claim — validasi foto, error register screen, endpoint laporan saya, URL foto relatif, riwayat profil, pembedaan View Filament, pembersihan tooling, rotasi key Firebase
---

# Backlog Perbaikan Lanjutan - Lost&Found

**Created:** 2026-10-11  
**Updated:** 2026-10-12  
**Project:** [[PBL]] Lost&Found  
**Status:** Active  
**Priority:** Medium (sementara, menunggu user)  
**Sumber:** [[Perbaikan Flow Claim dan Form Laporan - Lost&Found]] (semua bug selesai 2026-10-11, backlog dipindah ke sini)

---

## Goal

Menyelesaikan backlog yang tersisa setelah semua bug utama (1, 2a, 2b, 3) selesai dan ter-merge ke `main`.

---

## Item Prioritization

**Usulan prioritas dari plan asal; menunggu konfirmasi user:**

| Item | Prioritas usulan | Alasan |
|------|------------------|--------|
| Pembersihan file tooling agent di `main` Laravel | **High** (sebelum push) | File `.agents/`, `.claude/`, `.mcp.json`, `opencode.json`, `boost.json`, perubahan `composer.*` ikut ter-merge lewat `git add -A` |
| Rotasi key `firebase-service-account.json` + `git filter-repo` | **High** (sebelum repo Public) | Key terekspos di history git |
| Validasi field wajib sebelum upload foto + rollback foto yatim | **Medium** | Foto yatim muncul saat validasi gagal setelah upload |
| Error `register_screen.dart:43` | **Medium** | Dilaporkan agent sebagai "pre-existing", perlu dicek |
| Endpoint "laporan saya" (`?mine=1`) | **Medium** | Dropdown claim saat ini difilter di Flutter dari 20 item pertama |
| URL foto relatif | **Medium** (sebelum demo) | Hindari ubah DB tiap ganti jaringan |
| Pembedaan halaman View Lost vs Found di Filament | **Medium** | Prompt sudah dikirim, hasil belum dikonfirmasi |
| Riwayat laporan saya di tab Profil | **Low** | `onTap` masih kosong |

**Pertanyaan ke user:** Apakah prioritas di atas disetujui, atau ada yang perlu diubah? Apakah plan ini secara keseluruhan **High**, **Medium**, atau **Low**?

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
**Prioritas usulan:** Medium  
**Sumber:** DailyChanges 2026-10-09 temuan 1

### Masalah
Foto di-upload ke Laravel Storage sebelum validasi field wajib selesai. Bila validasi gagal setelah upload, foto tetap tersimpan di storage (foto yatim).

### Target
- Validasi field wajib (judul, deskripsi, koordinat, kategori) di Flutter **sebelum** memanggil endpoint upload foto.
- Bila upload foto gagal di tengah proses atau validasi create report gagal setelah upload, rollback: hapus foto yang sudah ter-upload di sesi tersebut (via `POST /api/photos/delete` atau endpoint serupa).

---

## Item 2 — Error `register_screen.dart:43`

**Status:** ⬜ Belum dikerjakan  
**Prioritas usulan:** Medium  
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
**Prioritas usulan:** Medium  
**Sumber:** Tabel Backlog Terkait plan Perbaikan Flow Claim

### Masalah
Dropdown claim saat ini difilter di Flutter dari 20 item pertama. Tidak efisien bila laporan banyak.

### Target
Tambahkan endpoint `GET /api/lost-reports?mine=1` dan `GET /api/found-reports?mine=1` yang hanya mengembalikan laporan milik user yang sedang login (via Sanctum `auth()->id()`).

---

## Item 4 — URL Foto Relatif

**Status:** ⬜ Belum dikerjakan  
**Prioritas usulan:** Medium (sebelum demo)  
**Sumber:** Tabel Backlog Terkait plan Perbaikan Flow Claim

### Masalah
URL foto absolut tersimpan di DB. Bila ganti jaringan/domain, URL patah.

### Target
Simpan path relatif di DB (mis. `reports/uuid.jpg`). Bangun URL lengkap saat response API (`APP_URL . '/storage/' . $photo_path`).

---

## Item 5 — Riwayat Laporan Saya di Tab Profil

**Status:** ⬜ Belum dikerjakan  
**Prioritas usulan:** Low  
**Sumber:** Tabel Backlog Terkait plan Perbaikan Flow Claim

### Masalah
`onTap` riwayat laporan di tab Profil masih kosong.

### Target
Implementasi navigasi ke daftar laporan milik user (pakai endpoint Item 3 bila sudah ada).

---

## Item 6 — Pembedaan Halaman View Lost vs Found di Filament

**Status:** ⬜ Belum dikerjakan (prompt sudah dikirim, hasil belum dikonfirmasi)  
**Prioritas usulan:** Medium  
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

## Related Files

- **Plan asal:** [[Perbaikan Flow Claim dan Form Laporan - Lost&Found]]
- **Laravel:** `D:\PBL\lostfound`
- **Flutter:** `C:\Project\mobile-lostfound`
- **DailyChanges:** [[DailyChanges 2026-10-09]], [[DailyChanges 2026-10-10]], [[DailyChanges 2026-10-11]]

---

#plan #lost-and-found #backlog #claim #photo #register #endpoint #security
