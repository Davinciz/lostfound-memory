---
type: report
task: GPT-261122-01
from: flutter
outcome: succeeded
branch: feature/chat/unread-badge
commits:
  - "dc18e62 fix(chat): abaikan penutupan popup pada observer rute badge"
  - "c098a8c test(chat): tambah tes GET badge pada popup aksi gagal dan sukses"
updated: 2026-11-22
summary: "APPROVE DENGAN CATATAN. M1 dan cakupan swipe 409 tertutup. Uji manual dua akun masih menjadi syarat merge."
---

# Review ulang ke-3 Tugas 8 · Badge unread tab Chat

**APPROVE DENGAN CATATAN** untuk `c098a8c3bcdc019d9870809640f601a910a47053`. Seluruh temuan kode dan tes dari GPT-261116-02 tertutup. Penutupan popup menghasilkan **0 GET badge** pada aksi gagal. Keempat jalur sukses menghasilkan **0 saat API masih tertunda dan tepat 1 setelah API berhasil**. Syarat merge yang masih terbuka adalah uji manual dua akun sesuai §7 brief.

## Perubahan yang direview

- Checkout awal di `C:\Project\lostfound-mobile`. Perintah `git branch --show-current` menghasilkan keluaran kosong karena HEAD detached di `31a8a80`. Working tree bersih. Setelah `git fetch origin`, baseline dan review dijalankan berturut-turut di satu worktree detached terpisah. Baseline `origin/develop` dan merge-base sama-sama `d17637c4821ac44beedbde2097f0ee33015aabde`.
- `git rev-list --count origin/develop..HEAD` menghasilkan **13 commit**, termasuk dua commit di frontmatter sesudah review ke-2. Dua commit tersebut mengubah `lib/main.dart`, `lib/screens/home/main_tab_screen.dart`, dan menambahkan `test/main_tab_popup_observer_test.dart`.
- `git diff --stat origin/develop...HEAD` mencatat **15 file, +1.560/−47**. Sembilan file produksi mencakup wiring aplikasi, sesi auth/FCM, notifier, navigasi utama, daftar percakapan, detail klaim/laporan, dan komponen badge. Enam file tes mencakup observer popup, arsip, notifier, wiring, notifikasi, dan fixture WhatsApp yang kini menyediakan notifier bagi detail klaim. Diff akhir sesuai Tugas 8. `pubspec.yaml`, `pubspec.lock`, tooling, `.idea`, kredensial, dan ketiga file tes di luar lingkup yang dilaporkan pada review lama tidak masuk diff. `git diff --check origin/develop...HEAD` exit 0.

## Temuan lama dan bukti penutupan

Nomor baris mengacu pada HEAD review. Tes popup menghitung pemanggilan loader oleh notifier nyata di atas API tiruan (`test/main_tab_popup_observer_test.dart:102–108`). Hitungan ini memisahkan GET badge dari pemuatan ulang daftar aktif dan arsip yang memang dilakukan layar (`lib/screens/chat/conversation_list_screen.dart:78–90,206–208`).

| Temuan lama | Hasil pada revisi ini | Bukti file dan baris |
|---|---|---|
| M1 · Pop bottom sheet dan dialog | **Tertutup.** Observer badge mengabaikan `PopupRoute`. Halaman biasa yang ditutup tetap memicu satu refresh ketika kembali ke layar utama. Observer notifikasi tetap terpasang. | `lib/main.dart:130`, `lib/screens/home/main_tab_screen.dart:23–36,75–100`, `test/main_tab_popup_observer_test.dart:362–375` |
| Arsip dan buka arsip | **Tertutup.** Keduanya menunggu API sukses sebelum menjalankan hook. Tes pada tab Chat mengukur 0 GET ketika gagal atau masih berjalan dan 1 setelah sukses. | `lib/screens/chat/conversation_list_screen.dart:190–210`, `test/main_tab_popup_observer_test.dart:199–234,276–314` |
| DELETE dari menu dan swipe | **Tertutup.** Menu diuji dengan HTTP 500 dan swipe dengan HTTP 409. Item bertahan dan kenaikan GET badge 0. Konfirmasi serta dialog 409 ditutup dalam tes swipe. Sukses menu dan swipe masing-masing menghasilkan satu GET. Tes arsip terpisah juga memeriksa empty state sesudah swipe sukses. | `lib/screens/chat/conversation_list_screen.dart:248–265,367–369`, `test/main_tab_popup_observer_test.dart:236–274,316–360`, `test/chat_archive_test.dart:213–230,251–271` |
| Cakupan dengan observer aplikasi | **Tertutup.** Fixture memasang kedua instance observer produksi dan `MainTabScreen(initialIndex: 2)`. Respons sukses ditahan dengan `Completer` agar GET prematur tetap terlihat. | `test/main_tab_popup_observer_test.dart:131–151,276–292` |
| Logout dan pergantian sesi | **Tetap tertutup.** Factory memeriksa autentikasi dan logout. FCM menutup sesi badge sebelum cleanup. Tes menahan cleanup, menjalankan resume dan kembali dari chat ke detail klaim, serta memeriksa badge lama setelah berganti akun. | `lib/main.dart:24–31`, `lib/services/fcm_service.dart:102–108,119–135,256–283`, `test/unread_badge_wiring_test.dart:273–381,383–464` |
| Refresh susulan dan hasil terlambat | **Tetap tertutup.** Dua rangkaian event saat GET berjalan menghasilkan tepat tiga GET dan nilai akhir 6. Akhir sesi membatalkan susulan dan respons lama tidak menimpa nilai sesi baru. | `lib/services/unread_badge_notifier.dart:42–61,81–132`, `test/unread_badge_notifier_test.dart:112–189` |
| Sumber, total dan tampilan | **Tetap tertutup.** Factory meminta `archived: false`. Jumlah memakai `unreadCount` setiap percakapan. Nol disembunyikan, 99 tampil utuh, 100 tampil sebagai `99+`. | `lib/main.dart:24–31`, `lib/services/unread_badge_notifier.dart:7–16`, `lib/widgets/figcraft_components.dart:241–249`, `test/unread_badge_notifier_test.dart:19–32`, `test/unread_badge_wiring_test.dart:201–217` |

Layar utama menyegarkan badge saat dibuka dan saat resume (`lib/screens/home/main_tab_screen.dart:64–73,94–100`). Untuk chat yang dibuka lewat detail klaim/laporan, hook dipanggil setelah kembali (`lib/screens/claim/claim_detail_screen.dart:129–138`, `lib/screens/laporan/report_detail_screen.dart:118–127`). Saat sesi pengguna masih aktif, notifikasi FCM foreground bertipe `chat` memicu refresh (`lib/services/fcm_service.dart:235–240`). Tes resume dan event FCM simulasi ada di `test/unread_badge_wiring_test.dart:220–270` dan `test/notification_test.dart:295–305`.

## Verifikasi Flutter

| Perintah | Baseline develop `d17637c` | Branch badge `c098a8c` |
|---|---|---|
| `flutter pub get` | Exit 0 | Exit 0 |
| `flutter analyze --no-pub` | Exit 1, 4 warning dan 2 info | Exit 1, 4 warning dan 2 info pada file dan baris yang sama |
| `flutter test --no-pub --reporter expanded` | Exit 0 · 273 lulus, 4 dilewati, 0 gagal | Exit 0 · 305 lulus, 4 dilewati, 0 gagal |

Enam diagnostik baseline berasal dari `test/api_client_mine_test.dart:21,31,42`, `test/google_sign_in_error_test.dart:26` dan `test/home_screen_test.dart:27–28`.

## Mutation check

Perintah untuk tiap mutasi adalah `flutter test --no-pub --reporter expanded test/main_tab_popup_observer_test.dart`. Setiap percobaan hanya menonaktifkan satu baris produksi.

| Mutasi sementara | Hasil aktual | Assertion yang menangkap regresi |
|---|---|---|
| Hilangkan filter `PopupRoute` dari `didPop` di `lib/screens/home/main_tab_screen.dart:28` | Exit 1 · 1 lulus, 8 gagal | Aksi gagal memberi +1 GET untuk arsip, +1 untuk buka arsip, +2 untuk hapus menu, +2 untuk swipe 409. Empat tes sukses juga mendeteksi GET sebelum API selesai. Tes pop halaman biasa tetap lulus. |
| Hilangkan hook arsip/buka arsip di `lib/screens/chat/conversation_list_screen.dart:201` | Exit 1 · 7 lulus, 2 gagal | Kedua tes sukses mendapat 0 GET selesai, ekspektasi 1. |
| Hilangkan hook DELETE di `lib/screens/chat/conversation_list_screen.dart:255` | Exit 1 · 7 lulus, 2 gagal | Tes sukses menu dan swipe mendapat 0 GET selesai, ekspektasi 1. |

Sesudah **setiap** mutasi, `git restore -- <file>` berhasil dan `git status --porcelain` kosong. Seusai pemulihan terakhir, `flutter test --no-pub --reporter expanded test/main_tab_popup_observer_test.dart test/chat_archive_test.dart` mencatat **19 lulus, 0 dilewati, 0 gagal** (exit 0).

## Dry-run integrasi

`git merge-tree --write-tree origin/feature/chat/<fitur> origin/feature/chat/unread-badge` dijalankan terpisah untuk setiap pasangan. Ketiganya selesai tanpa konflik tekstual. Suite Flutter di atas berjalan pada baseline dan branch badge. Tree gabungan belum diuji saat runtime.

| Ref pasangan | HEAD | Exit | Tree hasil |
|---|---|---:|---|
| `readonly-ui` | `720414d` | 0 | `6807ac2846af5417a6c4be2de7e8270489b14203` |
| `quick-reply` | `cbbc13f` | 0 | `8068e3c04a2fdf9cda316c6128d533f658a6a106` |
| `typing-indicator` | `d199e89` | 0 | `d212fbfb31200128e6cd98872820df12e0a4db30` |

## Syarat merge dan status akhir

**Daniel perlu menjalankan uji dua akun sebelum merge**, idealnya dengan dua HP. Kirim pesan A → B, cek badge B saat FCM foreground, setelah kembali dari chat, dan saat resume. Coba arsip/buka arsip, hapus lewat menu dan swipe, termasuk penolakan 409 dan empty state. Logout B dengan refresh tertunda lalu login A dan periksa angka B tidak terbawa. Dalam review ini, perangkat fisik, FCM langsung, dan API server dengan dua akun belum diuji.

Pemeriksaan akhir di worktree review menghasilkan `git diff --check origin/develop...HEAD` exit 0 dan `git status --porcelain` kosong. Worktree sementara sudah dilepas. Checkout utama tetap detached di `31a8a80` dengan `git status --porcelain` kosong. Satu-satunya berkas hasil review adalah laporan ini di vault.
