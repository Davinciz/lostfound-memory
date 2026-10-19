---
type: plan
project: lost-found
status: done
priority: high
updated: 2026-10-19
summary: GitFlow-lite & migrasi Gitea selesai (2026-10-17): remote github dihapus, origin HTTPS, tag v0.1 ada, proteksi main+develop terpasang, branch lama bersih
---

# Adopsi GitFlow-lite & Migrasi ke Gitea - Lost&Found

**Tanggal:** 2026-10-17
**Project:** [[PBL]] Lost&Found
**Status:** Done
**Priority:** High

> [!success] Diarsipkan 2026-10-19
> Semua pekerjaan terimplementasi dan merge; sisa open item dipindah ke [[Backlog Perbaikan Lanjutan - Lost&Found]].

---

## Latar Belakang

Repo wajib di Gitea kampus: `git.informatikapolines.id/Daniel_Geovani/lostfound-backend` dan `lostfound-mobile` (HTTPS). GitHub tidak dipakai lagi; remote lokal `github` sudah dihapus 2026-10-17, origin wajib `https://git.informatikapolines.id/Daniel_Geovani/<repo>.git`.

Alur Git: GitFlow-lite.
- `main` = stabil, hanya menerima merge dari `develop` saat milestone, lalu diberi tag versi (v0.1, v0.2, ... v1.0). Tag disamakan di kedua repo.
- `develop` = branch integrasi; semua feature/fix dibuat dari develop.
- Branch sementara: `<tipe>/<scope>/<deskripsi-kebab-case>`
  - tipe: feature | fix | chore | docs | test | refactor
  - scope backend: api, auth, filament, db, storage, claim, chat, notification, repo
  - scope mobile: ui, auth, map, report, claim, chat, notification, repo
  - contoh: `feature/filament/report-detail`, `fix/claim/accept-report-guard`
  - scope tidak boleh jadi nama branch sendiri (bentrok ref Git)
- Merge feature/fix ke develop lewat Pull Request, squash merge.
- Tanpa release/* dan hotfix/*; darurat pakai `fix/<scope>/...` dari main lalu merge balik ke develop.
- Pesan commit: Conventional Commits dengan scope yang sama, mis. `feat(filament): tambah halaman detail laporan`.
- Rollback: `git revert` (atau `revert -m 1` untuk merge commit) atau checkout tag. Branch belum ter-merge diberi tag `archive/<nama>` sebelum dihapus. Hanya branch yang sudah ter-merge yang boleh dihapus.

Pembersihan selesai (2026-10-17): `develop` dibuat di kedua repo; `CONTRIBUTING.md` ada di branch `chore/gitflow-docs` dan **sudah di-merge ke `develop`** via PR (kedua repo), lalu branch itu dihapus. Branch lama yang ter-merge sudah dihapus, termasuk backend `fix/photo-delete-ownership` dan `refactor/laravel-storage` (kedua-duanya sudah ter-merge), serta branch lokal mobile `feature/google-sso-flutter`. Tag baseline `v0.1` **sudah ada** di kedua repo (backend `72c7de1` = ujung `main`, mobile `69ed4c4`).

- **Pengaturan Gitea:** default branch `develop` **dan** proteksi `main` + `develop` (wajib PR) — keduanya **sudah dikonfirmasi user 2026-10-17**.

---

## Tugas

### Sudah Selesai
- [x] Branch `develop` dibuat di kedua repo (backend & mobile)
- [x] `CONTRIBUTING.md` dibuat di branch `chore/gitflow-docs`, sudah di-merge ke `develop` (kedua repo) — **2026-10-17**
- [x] Branch lama yang sudah ter-merge dihapus di kedua repo
- [x] Update TechnicalReference.md — repo Gitea + bagian "Struktur Repository & Alur Git"
- [x] Update Design.md — repository ke Gitea
- [x] Update Lost&Found Progress.md — koreksi migrasi GitHub→Gitea (3 tempat)
- [x] Update RPP.md — sudah benar (Gitea), tidak perlu ubah
- [x] Merge `chore/gitflow-docs` ke `develop` via PR di kedua repo (backend & mobile) — **2026-10-17**
- [x] Set default branch ke `develop` di Gitea (kedua repo) — **2026-10-17**
- [x] Tag baseline `v0.1` di kedua repo (sinkron): backend `72c7de1`, mobile `69ed4c4` — **2026-10-17**
- [x] Nasib branch backend `fix/photo-delete-ownership` & `refactor/laravel-storage`: dihapus (sudah ter-merge) — **2026-10-17**
- [x] Hapus remote `github` di kedua repo lokal — **2026-10-17**
- [x] Hapus branch lokal `feature/google-sso-flutter` di mobile — **2026-10-17**
- [x] Proteksi branch `main` + `develop` di Gitea (kedua repo) — **2026-10-17** (dikonfirmasi user)
- [x] develop lokal di kedua repo sudah di-pull — **2026-10-17** (dikonfirmasi user)
- [x] Branch `chore/gitflow-docs` sudah dihapus di Gitea (kedua repo) — **2026-10-17** (dikonfirmasi user)
- [x] Jejak pemulihan branch yang dihapus 2026-10-17 (SHA ujung: backend `fix/photo-delete-ownership` = `367ed2738ea5b9ba93a463e3cbb459edba87e15f`, `refactor/laravel-storage` = `8ed0348261e96bd750ce7ff6be43479823f2c6dc`; mobile `feature/google-sso-flutter` = lokal, SHA tidak dicatat)

> [!note] Semua item di atas sudah dikonfirmasi user 2026-10-17 (lihat DailyChanges 2026-10-17, bagian E). Tidak ada item terbuka yang menunggu konfirmasi; verifikasi `v0.1` mobile = ujung `origin/main` juga sudah terbukti (DailyChanges 2026-10-17, bagian G).

> [!success] Plan ditutup `done` 2026-10-17 atas konfirmasi user. Verifikasi teknis `v0.1` mobile = ujung `origin/main` **sudah terbukti kembar** (lihat DailyChanges 2026-10-17 bagian G). Tidak ada item terbuka.

---

## Audit Dokumen Vault (Ditemukan Sebelum Perubahan)

| Dokumen | Baris | Konten GitHub/Gitea Lama | Aksi |
|---------|-------|---------------------------|------|
| TechnicalReference.md | 195 | "✅ Repo dipindah ke GitHub Private (Davinciz/lostfound-backend, Davinciz/lostfound-mobile)..." | Update ke Gitea |
| TechnicalReference.md | 299-300 | Structur Repository: GitHub URLs | Update ke Gitea |
| PRD.md | - | Tidak ada sebutan GitHub/Gitea eksplisit | Tidak perlu ubah |
| Lost&Found Progress.md | 11 | "Migrasi repo Gitea→GitHub" | Koreksi ke GitHub→Gitea |
| Lost&Found Progress.md | 27-28 | "Design.md §8 — Repository & monitoring: Gitea → GitHub" | Koreksi |
| Lost&Found Progress.md | 66 | "Migrasi repo Gitea → GitHub (Private)" | Koreksi |
| Design.md | 344 | "Repository: GitHub (Private). Issue/Milestone Gitea tidak ikut dimigrasi..." | Update ke Gitea |
| RPP.md | - | Sudah menggunakan Gitea (baris 39, 45, 49, 92) | **Tidak diubah** |

---

## Konflik Ditemukan (Sudah Dibersihkan)
- **Lost&Found Progress.md baris 11, 27, 66**: Menyebut "Gitea→GitHub" — **dikoreksi ke "GitHub→Gitea"**.
- **Design.md baris 344**: Menyebut "Repository: GitHub (Private)" — **diupdate ke Gitea**.
- **TechnicalReference.md baris 195, 299-300**: Menyebut GitHub sebagai repo utama — **diupdate ke Gitea**.

---

## Next Steps (Sudah Dilakukan)
1. Update TechnicalReference.md — **selesai**: repo Gitea + bagian "Struktur Repository & Alur Git"
2. Update Lost&Found Progress.md — **selesai**: koreksi sebutan migrasi (3 tempat)
3. Update Design.md — **selesai**: koreksi repository ke Gitea
4. Update RPP.md — **sudah benar (Gitea), tidak diubah**
5. Buat entri DailyChanges hari ini — **selesai**
6. Verifikasi ERD.md & schema.dbml — **tidak terdampak, tidak diubah**

---

## Jejak Rollback (Branch yang Sudah Dihapus & Hash)

Branch yang sudah dihapus (merged ke `main` lalu dihapus) — hash tersedia untuk pemulihan jika perlu:

### Backend
- `chore/untrack-docs` — `0fa2daf`
- `feature/buildings-api` — `08efb93`
- `feature/filament-detail` — `449f4ad`
- `feature/google-dev-emails` — `c52883e`
- `feature/location-fallback` — `a327820`
- `feature/mine-filter` — `371fad5`
- `feature/relative-photo-url` — `de291ab`
- `fix/accept-lost-report-guard` — `240f026`
- `fix/claim-status-flow` — `1134e3b`

### Mobile
- `chore/analyze-cleanup` — `3e20c5f`
- `feature/auth-sso` — `b7c5c9e`
- `feature/claim-flow-fix` — `0e6d450`
- `feature/location-picker` — `2224460`
- `feature/map-location-picker` — `6332a27`
- `fix/claim-status-flow` — `0e6d450`
- `fix/photo-picker` — `8554fd3`
- `fix/report-validation-photo-rollback` — `acec23d`

### Cara Pulihkan
```bash
git branch <nama-branch> <hash>
# Contoh: git branch feature/filament-detail 449f4ad
```

## Jejak Pemulihan — Branch 2026-10-17 (SHA ujung)

Branch yang dihapus 2026-10-17 (sudah ter-merge ke `main` & `develop`, tanpa tag `archive`). SHA ujung dicatat sebagai catatan pemulihan:

- Backend: `fix/photo-delete-ownership` — ujung `367ed2738ea5b9ba93a463e3cbb459edba87e15f` (lokal+remote)
- Backend: `refactor/laravel-storage` — ujung `8ed0348261e96bd750ce7ff6be43479823f2c6dc` (remote)
- Mobile: `feature/google-sso-flutter` — lokal; SHA ujung tidak dicatat dalam laporan Coding Agent 2026-10-17.

Cara pulih: `git branch <nama> <hash>` (contoh: `git branch fix/photo-delete-ownership 367ed2738ea5b9ba93a463e3cbb459edba87e15f`).

## Catatan
- Jangan menandai tugas selesai tanpa konfirmasi user.
- Tidak menyentuh kode, database, repo, Notion.
- Tidak menulis kredensial/token/key.