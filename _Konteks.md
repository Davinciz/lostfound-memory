---
type: context
status: active
updated: 2026-10-31
summary: Konteks umum Daniel programmer dengan project Lost&Found ongoing
---

# _Konteks.md

> Catatan ini berisi ringkasan tentang saya dan proyek yang sedang saya kerjakan.
> Lengkapi bagian yang relevan — biarkan kosong jika belum ada.

---

## Tentang Saya

- **Nama:*Daniel* 

---

## Project yang Sedang Dikerjakan (Selalu cek Vault DailyChanges setiap tugas yang berkaitan dengan project)

### Proyek 1
- **Nama:*Lost&Found* 
- **Status:*On Going* 
- **Path / Directory: *C:\Project*
- **Documentation:* D:\ObsidianVault\PBL\Documents*
- **Workspace Notion : *https://app.notion.com/p/Campus-Lost-Found-3e53e759df1080e584c1cf571b5f176d?source=copy_link* 

## Catatan & Pengingat Penting

- RPP.md adalah dokumen akademik awal (menyebut MySQL, Gitea, Lupa Password) dan tidak diperbarui; stack aktual mengikuti TechnicalReference.md.
- Repo ada di Gitea kampus: `git.informatikapolines.id/Daniel_Geovani/lostfound-backend` (Laravel) dan `git.informatikapolines.id/Daniel_Geovani/lostfound-mobile` (Flutter), Private, origin HTTPS. GitHub (`Davinciz/...`) tidak dipakai lagi (remote `github` dihapus 2026-10-17).
- Notion belum disinkronkan dengan vault/repo.

---

## Struktur Vault

ObsidianVault/
├── _Base/              # Dataview config (Index.base dengan 3 view)
├── _Konteks.md         # File ini
├── IDEA.md             # Ide & catatan lepas
└── PBL/                # Project yang sedang dikerjakan
	├── Attachments/        # Gambar, diagram, file pendukung
	├── Documents/          # Dokumentasi Project 
	├── DailyChanges/       # Log harian (YYYY-MM-DD.md)
	├── Plan/               # Planning & proposal fitur
	│   └── Archive/           # Plan berstatus done yang sudah diarsipkan
	└── Inbox/              # Laporan antar-agent (alur tugas via prompt chat)
	    ├── tasks/           # TIDAK DIPAKAI (alur lama)
	    ├── reports/         # Laporan aktif: <Agent>-YYMMDD-NN-<slug>.md (format lama: R-YYMMDD-NN-<slug>.md — tetap valid sebagai riwayat)
	    ├── Archive/         # Arsip administratif (laporan lama di Archive/reports/YYMM/; aturan di Inbox/README.md)
	    ├── pm-handoff.md   # Log serah terima Claudia (Asisten PM); ditulis Claudia, dibaca Claude
	    └── _Templates/      # laporan.md (template laporan)

## Arti Tiap Type

| Type | Deskripsi | Contoh |
|------|-----------|--------|
| `daily` | Log aktivitas harian | 2026-09-28.md |
| `prd` | Product Requirements Document | PRD.md |
| `design` | Spesifikasi desain UI/UX | Design.md |
| `technical` | Dokumentasi teknis (ERD, API, arsitektur) | TechnicalReference.md, ERD.md |
| `plan` | Planning & proposal fitur | Master Buildings + Auto Location - Lost&Found.md |
| `context` | Konteks meta (tentang vault/project) | _Konteks.md |
| `task` | TIDAK DIPAKAI (alur lama, tidak dipakai lagi) | PBL/Inbox/tasks/ |
| `report` | Laporan hasil tugas antar-agent | PBL/Inbox/reports/ |

## Aturan Kerja

- Sebelum mengerjakan tugas, baca catatan ini, lalu Index.base, lalu cek PBL dan DailyChanges terbaru.
- Buka hanya catatan yang relevan berdasarkan `summary`; jangan membaca seluruh vault.
- Setiap selesai tugas, tulis ringkasan ke D:\ObsidianVault\PBL\DailyChanges\<tanggal>.md.
- Perbarui `status` dan `updated` di catatan yang diubah.
- Jangan menghapus atau menimpa catatan tanpa konfirmasi.
- Tugas diberikan user langsung lewat prompt di chat (header `ID: <Agent>-YYMMDD-NN | target: <docs|backend|flutter> | branch: ... | base: develop`); Prompt ditulis Claude (PM utama) atau Claudia (Asisten PM, saat Claude tidak tersedia); laporan hasil tugas ditulis ke PBL/Inbox/reports/ dan mengikuti PBL/Inbox/README.md
- Bahasa catatan: Indonesia.
- Jika diminta membuat Plan, tulis Plan ke PBL/Plan
- Plan berstatus `done` dipindah ke `PBL/Plan/Archive/` **setelah konfirmasi user**; plan baru tetap dibuat di `PBL/Plan/`. Wikilink berbasis nama file tetap aman setelah dipindah.
- Sinkronkan docs ke repo: setelah perubahan dokumen di vault, salin **DailyChanges, documents, dan planning** ke `C:\Project\lostfound-backend\docs\` — **kecuali** `Lost&Found Progress.md` (sumber tunggal di vault, jangan disalin). Rujukan: DailyChanges 2026-10-14 entri 18:44 poin 6 (salinan `Lost&Found Progress.md` di `docs/documents` sudah dihapus user).


## Aturan Pembuatan Plan 

File ini adalah aturan wajib. Sebelum membuat atau mengubah plan apa pun, baca file ini dulu.

## 1. Lokasi & Penamaan

- Semua plan disimpan di folder `PBL/Plan/`.
- Nama file = judul plan, contoh: `Verifikasi via Chat - Lost&Found.md`.
- Format judul: `<Nama Fitur> - <Nama Project>`.
- Sebelum membuat plan baru, cek apakah plan serupa sudah ada. Jika ada, update plan tersebut, jangan buat duplikat.

## 2. Header Wajib (Properties / Frontmatter)

Setiap plan HARUS diawali frontmatter berikut, tanpa terkecuali:

```yaml
---
type: plan
project: lost-found
status: active
priority: medium
updated: 2026-09-30
summary: <ringkasan satu kalimat tentang isi plan>
---
```

### Aturan tiap properti

| Properti | Nilai | Keterangan |
| --- | --- | --- |
| `type` | selalu `plan` | Tidak boleh diganti |
| `project` | slug huruf kecil, mis. `lost-found` | Sama dengan nama project, pakai tanda hubung |
| `status` | `active` / `pending` / `done` / `cancelled` | Plan baru default `active` |
| `priority` | `high` / `medium` / `low` | Lihat panduan prioritas di bawah |
| `updated` | format `YYYY-MM-DD` | Wajib diperbarui setiap plan diedit |
| `summary` | 1 kalimat, maksimal ±15 kata | Menjelaskan tujuan plan secara singkat |

### Panduan prioritas

- `high`: fitur inti/MVP (P0), blocker bagi fitur lain, atau punya deadline dekat.
- `medium`: fitur utama yang penting tapi tidak memblokir (P1).
- `low`: peningkatan, nice-to-have, atau pengembangan masa depan (P2/P3).

Jika prioritas tidak jelas dari permintaan, tanyakan ke user sebelum menulis plan. Jangan menebak.

## 3. Header Isi (Setelah Frontmatter)

Tepat setelah frontmatter, plan harus diawali dengan blok berikut:

```markdown
# <Judul Plan>

**Tanggal:** YYYY-MM-DD
**Project:** [[PBL]] <Nama Project>
**Status:** <Planning / In Progress / Done>
**Priority:** <High / Medium / Low>

---
```

- `Tanggal` = tanggal plan dibuat.
- `Project` = link ke note `[[PBL]]` diikuti nama project.
- `Status` dan `Priority` di isi harus konsisten dengan nilai di frontmatter (dalam bentuk kapital di awal kata).
- Setelah garis `---`, baru tulis isi plan (tujuan, alur, langkah, dan lain-lain).

## 4. Template Lengkap

```markdown
---
type: plan
project: lost-found
status: active
priority: high
updated: 2026-09-30
summary: Verifikasi kepemilikan lewat chat in-app antara pengklaim dan penemu
---

# Verifikasi via Chat - Lost&Found

**Tanggal:** 2026-09-30
**Project:** [[PBL]] Lost&Found
**Status:** Planning
**Priority:** High

---

## Tujuan
...

## Alur
...

## Langkah Implementasi
...
```

## 5. Checklist Sebelum Menyimpan

- [ ] Frontmatter lengkap: `type`, `project`, `status`, `priority`, `updated`, `summary`
- [ ] Header isi (Tanggal, Project, Status, Priority) ada dan sama dengan frontmatter
- [ ] `updated` berisi tanggal hari ini
- [ ] File tersimpan di `PBL/Plan/`
- [ ] Tidak ada plan duplikat dengan topik yang sama

## 6. Saat Mengedit Plan Lama

- Perbarui `updated` ke tanggal hari ini.
- Jika plan lama belum punya `priority`, tambahkan (tanyakan ke user jika tidak jelas).
- Jangan menghapus properti yang sudah ada.


## Proyek aktif
- lost-found: Campus Lost&Found (mobile Flutter + admin Laravel Filament)
- <tambahkan proyek/mata kuliah lain di sini>

*Last updated: 2026-10-31*
