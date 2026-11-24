---
type: report
task: Ajax-261123-02
from: flutter
outcome: succeeded
branch: origin/develop
commits: "d17637c4821ac44beedbde2097f0ee33015aabde feat(claim):whatsapp contact button (#27)"
updated: 2026-11-23
summary: Audit kandidat v0.2.0 lolos tes dan simulasi merge dengan catatan versi, cakupan chat, dan validasi perangkat.
---

# Persiapan rilis stabil Flutter v0.2.0

**Verdict — SIAP DENGAN CATATAN.** Kandidat dapat diajukan untuk review rilis dengan cakupan pada commit yang diaudit. Simulasi merge bersih dan tes sama dengan baseline. Sebelum memberi tag stabil, putuskan versi aplikasi serta build number dan validasi APK serta alur utama dengan konfigurasi rilis. Jika milestone mensyaratkan lima tugas chat yang diperiksa, kandidat saat ini belum memenuhi cakupan tersebut.

## Berubah

- Deliverable berupa laporan vault ini. Kandidat diuji pada worktree Git detached terpisah. Tidak ada file source, branch, tag baru, staging, commit, push, deploy, atau PR.
- Konteks audit mencakup `_Konteks.md`, DailyChanges 2026-11-13, 2026-11-12, dan 2026-11-08, TechnicalReference, Lost&Found Progress, CONTRIBUTING, AGENTS, dan template laporan. DailyChanges 2026-11-13 mencatat WhatsApp D telah masuk `develop` tanpa nomor PR. Riwayat Git mengidentifikasinya sebagai PR #27 di `d17637c`. Status backend live tidak diperiksa.

## Verifikasi Git

| Pemeriksaan | Hasil aktual |
| --- | --- |
| Checkout utama pada awal audit | `pwd` = `C:\Project\lostfound-mobile`; `git branch --show-current` kosong (detached); HEAD `31a8a80feae0b6c8ba0d69d976a14ec92151861c`; `git status --porcelain=v1` kosong |
| `git fetch origin --tags` | Exit 0. `origin/develop` = `d17637c4821ac44beedbde2097f0ee33015aabde`, `origin/main` = `69ed4c4b8b3ecd13b829300a4cafefb1cc649875` |
| `git tag -l` dan `git ls-remote --tags origin` | Remote exit 0. `v0.2.0` tidak ada di lokal dan remote. `v0.1` adalah tag anotasi `7466869a54bd3023cd5de656c4bc4113f299bd3b` di kedua sisi, menunjuk persis ke tip `origin/main` |
| `git merge-base --is-ancestor origin/main origin/develop` | Exit 0. `origin/main` leluhur kandidat |
| `git rev-list --left-right --count origin/main...origin/develop` | Exit 0. Kiri 0, kanan 41 |
| `git merge-tree --write-tree origin/main origin/develop` | Exit 0, tanpa konflik. Tree `e88ef4c22f3454a9a45397ad2deb2fe06c7b6e86` sama dengan tree kandidat |
| `git log --oneline --no-merges v0.1..origin/develop` dan `git diff --stat v0.1..origin/develop` | 35 commit non-merge dan 6 commit merge. 154 file, 14.381 baris masuk, 3.247 baris keluar |

## Temuan dari kandidat

### Cakupan fitur chat

Ref di bawah diverifikasi lewat cabang remote. Untuk empat ref yang tersedia, uji ancestry ke tip kandidat keluar 1 dan `git cherry` hanya memberi `+` pada commit branch yang diuji. Pemeriksaan kode dan riwayat membantu menilai kemungkinan squash, karena hasil ancestry sendiri hanya memeriksa hubungan antarcommit.

| Tugas | Ref dan bukti | Status pada kandidat |
| --- | --- | --- |
| Typing indicator | `origin/feature/chat/typing-indicator` `9247fae`. Diff efektif branch menambah `typing_controller.dart` dan tesnya. Tiga revert pada branch itu membatalkan wiring/tes quick reply | Belum masuk. Kandidat tidak memiliki controller, event client typing, atau UI typing. Perbandingan tidak menyentuh worktree review typing |
| Quick reply | `origin/feature/chat/quick-reply` `cbbc13f` membawa widget dan tes. Wiring yang sempat dibuat di branch typing direvert pada branch typing | Belum masuk. Widget dan wiring pada `ChatScreen` tidak terlihat di kandidat |
| Send status | Ref bernama send-status tidak tersedia pada ref lokal/remote yang diperiksa. Pencarian judul commit untuk send status/optimistic tidak menghasilkan kandidat | Implementasi yang dimaksud tidak terlihat. `_isSending` membatasi pengiriman saat request aktif, gelembung baru muncul setelah respons, dan kegagalan tampil lewat snackbar. Status per pesan, optimistic UI, dan tombol coba lagi belum terlihat |
| Read-only UI | `origin/feature/chat/readonly-ui` `720414d` mencakup implementasi `06e3e82` dan tes transisi claim | Belum masuk. `Conversation` belum membaca `can_send`/`readonly_reason` dan input tidak digembok berdasarkan metadata tersebut |
| Unread badge | `origin/feature/chat/unread-badge` `c098a8c`. Diff branch mencakup `UnreadBadgeNotifier` dan wiring. Kandidat sudah menghitung `unread_count` di daftar dan tab Chat, dengan badge tab dari rangkaian UI `439c1b3`/`fc7ada5` | Badge dasar masuk. Implementasi Tugas 8 dengan notifier dan penanganan refresh per sesi belum masuk |

Read receipt massal juga tidak terlihat di kandidat. Kode yang diperiksa memanggil `PATCH /api/messages/{messageId}/read` per pesan. PR rilis di bawah tidak memasukkan fitur-fitur cabang tersebut.

### Higiene dan versi

- Pemeriksaan nama file pada diff akhir, riwayat rentang dan tree kandidat tidak menemukan `dart_defines.json`, `google-services.json`, `*.jks`, `*.keystore`, `key.properties`, `.opencode/`, `.agents/`, `.claude/`, `.mcp.json`, `opencode.json`, atau `docs/`. File tooling/referensi pada diff adalah `.gitignore`, `AGENTS.md`, `CONTRIBUTING.md`, dan `dart_defines.example.json`. Isi file kredensial tidak dibaca.
- `pubspec.yaml` pada `v0.1` dan kandidat sama-sama `version: 1.0.0+1`. Jika nomor aplikasi harus mengikuti tag, usulan ubah ke `0.2.0+<build>` lewat pekerjaan terpisah sebelum tag dan gunakan build number di atas distribusi terakhir. Pakai `+2` hanya jika build tertinggi yang sudah didistribusikan memang `1`. Bila versi aplikasi dan tag memang terpisah, dokumentasikan `1.0.0+1` sebagai metadata kandidat dan konfirmasi build number untuk distribusi.
- Dependensi langsung baru sejak `v0.1` untuk runtime adalah `pusher_channels_flutter ^2.2.1` dan `google_fonts ^8.2.1`. Dependensi langsung baru untuk dev adalah `flutter_launcher_icons ^0.14.3` dan `flutter_native_splash ^2.4.6`. Rentang dependensi langsung yang sudah ada tidak berubah.

### Konvensi AGENTS.md §3

- Model `lost_report.dart` dan `found_report.dart` memakai `pending`, `claimed`, `returned`, `closed`. Model `claim.dart` memakai `pending`, `accepted`, `returned`, `rejected`, `withdrawn`. Label layar terpisah dari nilai wire. Tidak ditemukan nilai wire status huruf besar pada jalur yang ditinjau.
- `notification_router.dart` menangani `chat` dengan `conversation_id`, serta `claim_new`, `claim_accepted`, `claim_rejected`, `claim_withdrawn`, `claim_returned` dengan `claim_id`. ID diterima sebagai string yang tidak kosong. `fcm_service.dart` menjaga sesi dan menunggu PUT yang sedang berjalan sebelum conditional DELETE. `ApiClient` memakai PUT dan DELETE `/api/users/me/fcm-token`.
- Endpoint yang ditinjau sesuai pola API Flutter: `GET /api/buildings` untuk referensi gedung, `POST /api/photos/upload`, `POST /api/auth/google` dengan guard 401 untuk endpoint lain, POST aksi `accept`/`reject`/`withdraw` pada claim, dan POST multipart `/api/claims/{id}/mark-transferred` dengan `_method=PATCH` dan satu `proof_photo`. Profil WhatsApp menggunakan PUT `/api/users/me/whatsapp` dan `/api/users/me/wa-visibility`.
- Chat memakai GET/POST `/api/conversations`, GET/POST `/api/conversations/{id}/messages`, PATCH `archive`/`unarchive`, serta DELETE `/api/conversations/{id}` dengan penanganan khusus HTTP 409. `report_context` nullable dan kartu hanya dirender saat data tersedia. Pemeriksaan ini berbasis kode Flutter dan tidak menetapkan perilaku backend live.

## Verifikasi Flutter

Worktree `C:\Project\lostfound-release-Ajax-261123-02-90c4e759`, detached pada kandidat. Flutter 3.47.2 stable dan Dart 3.13.2.

| Perintah | Exit | Hasil aktual |
| --- | ---: | --- |
| `flutter pub get` | 0 | Dependensi berhasil di-resolve. Tidak ada perubahan tracked setelah verifikasi |
| `flutter analyze --no-pub` | 1 | 6 issue, yaitu 4 warning dan 2 info lama di tes. Warning `dead_code` dua lokasi serta `unnecessary_null_comparison` satu lokasi di `test/api_client_mine_test.dart`, dan `unnecessary_null_comparison` di `test/google_sign_in_error_test.dart`. Dua info `library_private_types_in_public_api` di `test/home_screen_test.dart`. Selisih baseline 0, tidak ada issue di `lib/` |
| `flutter test --no-pub --reporter expanded` | 0 | 273 lulus, 4 skip, 0 gagal. Selisih terhadap baseline tugas 0 untuk semua kategori |
| Build APK debug | Tidak dijalankan | `android/app/google-services.json` dan `dart_defines.json` tidak tersedia di detached worktree, diverifikasi lewat keberadaan path. Gradle mengaktifkan plugin Google Services. APK dengan konfigurasi proyek tidak dapat diverifikasi di worktree tersebut tanpa memasukkan atau menggunakan file konfigurasi yang dikecualikan dari tugas |

Belum ada uji dua akun di HP, reconnect Pusher, konfirmasi Client Events Pusher, FCM dan Google SSO di perangkat nyata, atau uji backend live. Client Events adalah prasyarat uji typing pada kandidat yang nanti memuat fitur tersebut. Untuk kandidat saat ini, cakupan uji manual meliputi alur laporan/lokasi, klaim dan foto serah terima, kontak WhatsApp pihak lawan, serta chat kirim/terima, arsip, dan hapus.

## Butuh keputusan user

- Tetapkan apakah v0.2.0 mencakup kandidat saat ini atau menunggu tugas chat lanjutan. Putuskan pemetaan tag ke versi aplikasi dan siapkan verifikasi APK/HP sebelum tag stabil. Kontak WhatsApp di detail klaim bergantung pada backend yang mengirim `counterpart_whatsapp`.

## Draf PR

**Judul** `release: develop -> main (v0.2.0)`

**Isi**

Rilis stabil Flutter dari `develop` ke `main`, berdasarkan kandidat `d17637c` dibandingkan dengan baseline `v0.1` (`69ed4c4`). Simulasi merge bersih dengan `main` sebagai leluhur kandidat.

- **UI** — Redesign Figma v3, logo dan splash baru, Plus Jakarta Sans lokal, intro, perapian Beranda/Cari/Profil/Pengaturan, serta pengaturan nomor dan visibilitas WhatsApp.
- **Auth** — Auto-logout pada 401 non-login dan guard agar respons WhatsApp lama tidak mengubah state akun yang sedang aktif.
- **Map** — Perbaikan crash saat menutup form tanpa izin lokasi dan penyesuaian komponen pemilih lokasi.
- **Report** — Form dan detail bersama untuk laporan hilang/temuan, penyempurnaan filter dan Riwayat Laporan, serta penyesuaian alur foto dan detail.
- **Claim** — Klaim langsung dengan laporan sendiri opsional, aksi accept/reject/withdraw, foto serah terima multipart, dan kontak WhatsApp di detail klaim.
- **Chat** — Percakapan realtime via Pusher, deduplikasi pesan, kartu konteks laporan, arsip dan hapus-untuk-saya, serta badge unread dasar. Typing, quick reply, status kirim per pesan, read-only UI, dan notifier unread Tugas 8 berada di luar kandidat.
- **Notification** — FCM dengan guard sesi, banner foreground, deep link ke chat/klaim, dan pembersihan token saat logout.
- **Repo** — Konfigurasi lewat `dart-define`, pembatasan log Dio pada mode debug tanpa header/body, contoh konfigurasi, dan dokumentasi GitFlow-lite.

`flutter pub get` berhasil. `flutter analyze --no-pub` menghasilkan 4 warning dan 2 info lama di tes (exit 1, selisih 0). `flutter test --no-pub --reporter expanded` menghasilkan 273 lulus, 4 skip, 0 gagal (exit 0). APK debug serta uji manual HP, Client Events Pusher, FCM dan Google SSO di perangkat nyata masih perlu divalidasi sesuai cakupan. Konfirmasi versi aplikasi/build sebelum memberi tag.

### Draf pesan tag anotasi `v0.2.0`

> Rilis stabil v0.2.0 Campus Lost&Found Mobile mencakup pembaruan antarmuka dan identitas aplikasi, perbaikan pemilih lokasi, klaim langsung dan foto serah terima, kontak WhatsApp di detail klaim, chat realtime dengan kartu konteks, arsip dan hapus-untuk-saya, serta notifikasi FCM dengan pengelolaan sesi.

## Cleanup

`git worktree remove --force` pada path detached terverifikasi keluar 0. Path sudah hilang dari disk dan daftar worktree. Log verifikasi dan artefak lokal yang dihasilkan Flutter ikut terhapus bersama worktree. Checkout utama masih detached pada `31a8a80feae0b6c8ba0d69d976a14ec92151861c`, keluaran `git branch --show-current` dan `git status --porcelain=v1` tetap kosong seperti awal. Workspace Orca yang diberikan dan worktree worker lain tidak disentuh.
