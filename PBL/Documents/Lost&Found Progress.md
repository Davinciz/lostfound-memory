---

kanban-plugin: board

---

## 📊 Progres Project

- [ ] 🎯 **Core MVP selesai** — claim flow, foto bukti serah terima, master buildings + auto location
	Ringkasan: **12 item selesai · 5 backlog pending · 3 fitur besar masih rencana**.
- [ ] ✅ **Selesai (12):** Bug 1, 2a, 2b, 3 + celah lanjutan · Foto Bukti Transfer · Master Buildings (Backend/Flutter/Filament) · Backlog Item 7 & 8 · Migrasi repo Gitea→GitHub
- [ ] 🚧 **Fokus berikutnya:** Backlog Item 1–5 (validasi foto, error register, endpoint "laporan saya", URL foto relatif, riwayat profil)
- [ ] 🧭 **Rencana besar:** Real-Time Chat · Verifikasi via Chat · Security Hardening
- [ ] 📅 **Terakhir diperbarui:** 2026-10-13


## 📋 To Do List

- [ ] **Item 1 — Validasi field wajib sebelum upload foto + rollback foto yatim** `Medium`
	Foto di-upload ke Storage sebelum validasi selesai → foto yatim bila validasi gagal. Validasi field wajib (judul, deskripsi, koordinat, kategori) di Flutter **sebelum** upload + rollback foto via `POST /api/photos/delete`.
- [ ] **Item 2 — Error `register_screen.dart:43`** `Medium`
	Cek apakah sisa `RegisterScreen` lama dari migrasi SSO. Perbarui agar sesuai flow SSO (Google sign-in + fallback form), atau catat penyebab sebenarnya.
- [ ] **Item 3 — Endpoint "Laporan Saya" (`?mine=1`)** `Medium`
	Tambah `GET /api/lost-reports?mine=1` & `GET /api/found-reports?mine=1` (Sanctum `auth()->id()`). Saat ini dropdown claim difilter di Flutter dari 20 item pertama.
- [ ] **Item 4 — URL foto relatif** `High · sebelum demo`
	Simpan path relatif di DB (mis. `reports/uuid.jpg`), bangun URL lengkap saat response API (`APP_URL . '/storage/' . $photo_path`). Hindari URL patah saat ganti jaringan/domain.
- [ ] **Item 5 — Riwayat laporan saya di tab Profil** `Low`
	`onTap` masih kosong. Implementasi navigasi ke daftar laporan milik user (pakai endpoint Item 3).


## 🔍 Menunggu Konfirmasi

- [ ] **Item 6 — Pembedaan halaman View Lost vs Found di Filament** `Medium`
	Prompt sudah dikirim, hasil belum dikonfirmasi. View Lost Report & View Found Report kemungkinan belum dibedakan.
- [x] **Design.md §8 — "Repository & monitoring: Gitea" → GitHub**
	Baris 332 sudah diperbarui 2026-10-13: "Repository: GitHub (Private). Issue/Milestone Gitea tidak ikut dimigrasi; monitoring: belum ditentukan." 
- [ ] **Sinkronisasi Notion**
	Belum dilakukan, menunggu perintah user.
- [ ] **Konfirmasi status plan**
	Plan "Perbaikan Flow Claim" tetap **In Progress** dan "Backlog Perbaikan Lanjutan" tetap **active** (belum di-set `done`).


## 🧭 Rencana Fitur

- [ ] **Real-Time Chat (Pusher MVP → Soketi)** `Planning`
	Plan selesai. Belum: setup Pusher account, backend (migration/API/broadcasting), Flutter chat UI, test multi-device, integrasi ke claim flow.
- [ ] **Verifikasi via Chat** `Planning`
	Plan selesai. Selesai: hapus 3 kolom verifikasi (migration), validasi `lost_report_id` + cek kepemilikan (403), dropdown "Pilih Laporan Hilang Anda" di ClaimScreen. Sisa: banner tips, auto-create conversation, redirect ke chat, test end-to-end.
- [ ] **Security Hardening** `Planning`
	Plan selesai. Sudah: rate limit `POST /api/auth/google` 30/menit. Belum: rate limiting global + security headers, CAPTCHA, image moderation, monitoring.


***

## Archive

- [x] **Bug 1 — Tombol "Ambil Foto" memotret 3 kali** — selesai 2026-10-09
- [x] **Bug 2a — Pilih lokasi tanpa paket peta** (GPS manual, dropdown gedung, validasi 0,0) — selesai 2026-10-09
- [x] **Bug 2b — Pilih lokasi di peta + saran gedung** (`flutter_map`, pin draggable, marker gedung, saran radius 75m) — selesai 2026-10-11
- [x] **Bug 3 — Status laporan langsung `claimed` saat claim dibuat** — selesai & merge 2026-10-11 (32 test lulus)
- [x] **Celah lanjutan Bug 3 — Blokir Terima bila laporan hilang bukan `pending`** — selesai 2026-10-09 (commit `20d8164`, merge `b1e5556`)
- [x] **Foto Bukti Transfer** — endpoint `mark-transferred`, ClaimTransferService, aksi Filament, model Flutter — selesai 2026-10-05 (21/21 test)
- [x] **Master Buildings — Phase 1 Backend** (migration, model, seeder 23 gedung, `GET /api/buildings`) — selesai 2026-10-09
- [x] **Master Buildings — Phase 2 Flutter** (Haversine lokal, peta + pin + saran gedung) — selesai 2026-10-11
- [x] **Master Buildings — Phase 3 Filament** (`BuildingResource` CRUD, filter, search) — selesai 2026-10-09
- [x] **Backlog Item 7 — Pembersihan file tooling agent di `main` Laravel** — selesai 2026-10-12
- [x] **Backlog Item 8 — Rotasi key Firebase + `git filter-repo`** — selesai 2026-10-12
- [x] **Migrasi repo Gitea → GitHub (Private)** + rewrite history backend — selesai 2026-10-12

%% kanban:settings
```
{"kanban-plugin":"board","list-collapse":[false,false,false,false],"full-list-lane-width":true,"move-tags":false,"tag-colors":[]}
```
%%