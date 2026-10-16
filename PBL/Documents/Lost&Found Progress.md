---

kanban-plugin: board

---

## 📊 Progres Project

- [ ] 🎯 **Core MVP selesai** — claim flow, foto bukti serah terima, master buildings + auto location
	Ringkasan: **19 item selesai · 0 backlog pending · 3 fitur besar masih rencana**.
- [ ] ✅ **Selesai (19):** Bug 1, 2a, 2b, 3 + celah lanjutan · Foto Bukti Transfer · Master Buildings (Backend/Flutter/Filament) · Backlog Item 1, 2, 3, 4, 5, 6, 7, 8 & 9 · Migrasi repo Gitea→GitHub
- [ ] 🚧 **Fokus berikutnya:** Real-Time Chat
- [ ] 🧭 **Rencana besar:** Real-Time Chat · Verifikasi via Chat · Security Hardening
- [ ] 📅 **Terakhir diperbarui:** 2026-10-16


## 📋 To Do List

- [ ] **[DITUNDA] Job pembersih foto yatim terjadwal** `Low`
	Keputusan 2026-10-15: **ditunda** — dampaknya hanya ruang disk; sejak Item 1 foto yatim baru tidak muncul lagi. Plan dibuat hanya bila penyimpanan mulai jadi masalah.
- [ ] **[Plan Claim Dua Arah] Audit rollback foto bukti serah terima (`claims/proof`)** `Medium`
	Keputusan 2026-10-15: dikerjakan **bersama plan [[Claim Dua Arah dan Serah Terima oleh Pengguna - Lost&Found]]** (foto bukti wajib di plan itu, alur upload akan disentuh lagi).


## 🔍 Menunggu Konfirmasi

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
- [x] **Backlog Item 3 — Endpoint "Laporan Saya" (`?mine=1`)** — selesai 2026-10-15 (branch `feature/mine-filter`, commit `371fad5`; filter `mine=1` di `GET /api/lost-reports` & `GET /api/found-reports`, backward compatible, format/pagination sama, `mine=1&status=pending` bekerja; 7/7 test pass; merge + `php artisan test` penuh dikonfirmasi user)
- [x] **Backlog Item 4 — URL foto relatif** — selesai 2026-10-14 (branch `feature/relative-photo-url`, commit `de291ab`, 86 test lulus; merge & push dikonfirmasi user; teruji di HP)
- [x] **Backlog Item 1 — Validasi field wajib sebelum upload + rollback foto yatim** — selesai 2026-10-15 (branch Flutter `fix/report-validation-photo-rollback`, commit `acec23d`, 47 test lulus, build OK, tes manual HP berhasil; merge dikonfirmasi user)
- [x] **Backlog Item 2 — Error `register_screen.dart:43`** — selesai 2026-10-15 (branch `chore/analyze-cleanup`, commit `eae5bad`/`a5735ff`/`3e20c5f`; `register_screen.dart` & `create_report_base.dart` dihapus, 62 auto-fix, analyze 0 error, 47 test lulus; merge + tes HP/FCM berhasil)
- [x] **Backlog Item 9 — Kepemilikan foto pada `POST /api/photos/delete`** — selesai 2026-10-15 (branch `fix/photo-delete-ownership`, commit `b2ab837`, 101 test lulus; Cache owner TTL 24 jam, 403/409/422; merge dikonfirmasi user)
- [x] **Normalisasi `GOOGLE_DEV_EMAILS`** — selesai 2026-10-15 (sudah ada sejak awal di `config/services.php` + `AuthController`; sesi ini menambah 4 test)
- [x] **Backlog Item 7 — Pembersihan file tooling agent di `main` Laravel** — selesai 2026-10-12
- [x] **Backlog Item 8 — Rotasi key Firebase + `git filter-repo`** — selesai 2026-10-12
- [x] **Migrasi repo Gitea → GitHub (Private)** + rewrite history backend — selesai 2026-10-12
- [x] **Backlog Item 6 — Pembedaan halaman View Lost vs Found di Filament** — selesai 2026-10-16 (branch `fix/filament-report-pages`, 108/108 test lulus; Page class dipisah jadi 6 file — ViewLostReport, CreateLostReport, EditLostReport, ViewFoundReport, CreateFoundReport, EditFoundReport — satu file satu class; `List*.php` hanya class List; merge dikonfirmasi user; tes manual `/admin`: list/view/edit/create Lost & Found berhasil, View Lost tampil `lost_date` tanpa jam + "Pelapor", View Found tampil `found_date` dgn jam + "Penemu (Pelapor)"; `->url()` field `photo_urls` dikembalikan — accessor URL + mutator normalisasi path, tanpa perubahan perilaku form foto)
- [x] **Backlog Item 5 — Riwayat laporan saya di tab Profil** — selesai 2026-10-16 (Flutter, branch `feature/my-reports-history`, 3 commit: `69ed4c4` HEAD→main; `a9f13f8` fix locale/code/timezone; `83c40cd` fitur profil; flutter analyze 0 error; flutter test 55/55 lulus; flutter build apk --debug sukses; merge ke main sudah; lihat [[Backlog Perbaikan Lanjutan - Lost&Found]] Item 5, DailyChanges 2026-10-16, TechnicalReference §11.1 + §17)

%% kanban:settings
```
{"kanban-plugin":"board","list-collapse":[false,false,false,false],"full-list-lane-width":true,"move-tags":false,"tag-colors":[]}
```
%%