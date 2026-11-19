---
type: report
task: GPT-261114-02
from: flutter
outcome: failed
branch: feature/chat/unread-badge
commits: "522e87325e4fdfe842f2a47d2362ecba3814df08 feat(chat): tambah badge unread di tab Chat"
updated: 2026-11-14
summary: "REQUEST CHANGES — tiga regresi tes claim, badge tidak dibersihkan saat logout, dan hapus chat belum memperbarui badge."
---

# Review Tugas 8 — unread badge tab Chat

**Verdict: REQUEST CHANGES.** Tahan merge sampai suite kembali hijau, badge terisolasi per sesi, dan penghapusan serta refresh beruntun memenuhi brief.

## Temuan

### Blocker

1. **Badge dapat menampilkan angka akun sebelumnya.** `lib/main.dart:84–87` memasang notifier selama umur aplikasi. Logout manual dan kedaluwarsa sesi melewati `lib/screens/auth/auth_provider.dart:104–151` serta `lib/services/fcm_service.dart:254–277` tanpa membersihkan count atau membatalkan hasil refresh lama. `lib/screens/home/main_tab_screen.dart:62,117` memulai refresh dan langsung membaca count sebelumnya. Dari alur kode, akun B bisa melihat angka akun A sampai GET berhasil. Bila GET gagal, notifier mempertahankan nilai lama (`lib/services/unread_badge_notifier.dart:36–44`). Reset count pada batas sesi dan tolak hasil request maupun callback daftar yang berasal dari sesi lama.
2. **Tiga regresi pada suite WhatsApp claim.** `lib/screens/claim/claim_detail_screen.dart:131–135` membaca provider badge sebelum `_reloadClaim()`. Fixture `test/claim_whatsapp_test.dart:68–77` tidak menyediakan provider itu. Lookup gagal sinkron dan masuk ke catch sehingga GET claim tidak dijalankan. Tes yang gagal ada di baris 198, 239, dan 357. Sebagai kontrol, hanya lookup badge dilewati sementara. Seluruh 12 tes di file tersebut lulus. Pisahkan keberhasilan reload claim dari penyegaran badge dan perbarui fixture integrasi untuk konteks provider baru tanpa melemahkan assertion lama.

### Mayor

1. **Penghapusan chat meninggalkan badge lama.** `lib/screens/chat/conversation_list_screen.dart:250–253,272–277,366` hanya menghapus item lokal, baik melalui menu maupun swipe. Dialog konfirmasi sudah ditutup sebelum DELETE sehingga `didPopNext()` di `lib/screens/home/main_tab_screen.dart:90` dapat memicu GET sebelum penghapusan berhasil. Sesudah respons sukses tidak ada panggilan balik untuk memperbarui total aktif. Temuan ini memakai alur file yang sudah ada. Koordinasikan titik integrasi dengan pemilik layar bila perubahan file lindung diperlukan.
2. **Refresh beruntun menumpuk GET aktif dan hasil daftar dapat menimpa hasil badge.** `lib/services/unread_badge_notifier.dart:28–44` langsung memulai satu GET per refresh. Nomor request hanya menyaring hasil di notifier setelah GET berjalan. Daftar chat juga memuat daftar aktif sendiri melalui `lib/screens/chat/conversation_list_screen.dart:49,68–100,147`. Saat masuk tab Chat, misalnya, `lib/screens/home/main_tab_screen.dart:108–110` memicu kedua jalur. Callback daftar di baris 46–47 juga memanggil `updateCount` tanpa identitas request. Respons daftar yang dimulai lebih awal bisa menimpa hasil yang lebih baru atau menginvalidasi GET badge yang masih berjalan. Satukan sumber hasil daftar aktif dan gabungkan refresh yang berdekatan dengan pemuatan susulan bila ada event baru saat GET berjalan.
3. **Tes melewatkan pengkabelan badge di aplikasi.** `test/unread_badge_notifier_test.dart:16–63` menguji helper dan loader injeksi. Tes berjudul `zero hides the badge` menguji nilai null dari formatter. `test/notification_test.dart:293–304` membuktikan event FCM palsu memanggil loader, tanpa menguji angka yang dirender. Kedua file tetap hijau setelah sumber API diarahkan ke arsip atau refresh saat resume dihapus. Tambahkan pengujian yang memasang badge nyata, memeriksa request daftar aktif dan tampilan nol/99+, serta mencakup event UI, pergantian akun dan permintaan tertunda.

### Minor

1. **Tiga file tes di luar Tugas 8.** `test/api_client_mine_test.dart:1` mengganti tes simulasi dengan adapter HTTP, `test/google_sign_in_error_test.dart:24` menyederhanakan assertion, dan `test/home_screen_test.dart:27` memprivatkan helper. Pemisahan perubahan tersebut akan menjaga diff Tugas 8 tetap fokus.

## Berubah dan pemeriksaan Git

- Awal sesi berada di `C:\Project\lostfound-mobile`, branch `develop`, status bersih. `git fetch origin` berhasil setelah eskalasi untuk akses metadata Git. `git switch develop` dan `git pull --ff-only` mengonfirmasi `develop` sudah sama dengan `origin/develop`.
- Checkout utama dipindahkan oleh pekerjaan lain saat baseline. Hasil percobaan di checkout itu tidak dipakai dalam tabel. Baseline diulang pada worktree terpisah, lalu `git switch --detach origin/feature/chat/unread-badge` digunakan karena ref review tersedia di remote-tracking dan user melarang branch baru. Checkout utama tidak dipindahkan kembali.
- `origin/develop` dan `git merge-base origin/develop HEAD` identik di `d17637c4821ac44beedbde2097f0ee33015aabde`. Branch tidak tertinggal pada saat fetch. `git log --oneline origin/develop..HEAD` hanya memuat `522e873 feat(chat): tambah badge unread di tab Chat`, sesuai Conventional Commits. Nama author di metadata Git adalah `1hermawansteven`. Hash dan subjek cocok dengan permintaan.
- `git diff --stat origin/develop...HEAD` mencatat 12 file, 281 insertions, 63 deletions. File produksi ialah `lib/main.dart`, `lib/screens/claim/claim_detail_screen.dart`, `lib/screens/home/main_tab_screen.dart`, `lib/screens/laporan/report_detail_screen.dart`, `lib/services/fcm_service.dart`, `lib/services/unread_badge_notifier.dart`, dan `lib/widgets/figcraft_components.dart`. File tes ialah `test/api_client_mine_test.dart`, `test/google_sign_in_error_test.dart`, `test/home_screen_test.dart`, `test/notification_test.dart`, dan `test/unread_badge_notifier_test.dart`.
- File lindung, tooling dan `.idea` tidak muncul di diff. `git diff --name-only origin/develop...HEAD -- pubspec.yaml pubspec.lock` kosong. `git diff --check` bersih. Diff tidak menambah endpoint, channel Pusher atau dependensi.

## Pemeriksaan perilaku

| Syarat | Bukti dari kode atau tes |
|---|---|
| Total daftar aktif | `lib/main.dart:86` memakai `getConversations()`. `lib/api/api_client.dart:301–308` default `archived: false` tanpa query arsip dan `lib/models/conversation.dart:75` memetakan `unread_count`. Penjumlahan di `lib/services/unread_badge_notifier.dart:5–9`. |
| Nol, 99+, warna | `lib/widgets/figcraft_components.dart:241–250` hanya menampilkan label di indeks Chat saat formatter memberi nilai. Formatter `lib/services/unread_badge_notifier.dart:11–14` menghasilkan null untuk nol, 99 untuk 99, dan 99+ untuk lebih dari 99. Warna badge memakai `AppColors.accentYellow` dan `AppColors.primary`. |
| Login dan resume | Inisialisasi `MainTabScreen` memicu refresh di `lib/screens/home/main_tab_screen.dart:54–63`, resume di baris 85–87. Kode terpasang, pengujian alur UI belum ada. |
| Kembali dari ChatScreen | `MainTabScreen.didPopNext` di baris 90, callback daftar di `lib/screens/chat/conversation_list_screen.dart:133–148`, serta refresh setelah push di `lib/screens/claim/claim_detail_screen.dart:119–133` dan `lib/screens/laporan/report_detail_screen.dart:111–122`. Jalur langsung dari notifikasi memakai Navigator dengan route observer, sesuai `lib/services/notification_router.dart:111–139` dan `lib/main.dart:118`. Ada regresi tes jalur claim dan GET ganda di jalur daftar. |
| Arsip dan buka arsip | `lib/screens/chat/conversation_list_screen.dart:190–206` memuat ulang kedua daftar setelah PATCH sukses dan mengirim total aktif di baris 96–100. Hapus tidak memiliki pembaruan sesudah sukses. |
| FCM chat foreground | `lib/services/fcm_service.dart:233–241` memanggil refresh setelah guard sesi dan navigasi, sebelum pengecekan banner. Tes event palsu ada di `test/notification_test.dart:293`. |
| Logout dan burst | Tidak memenuhi. Lihat temuan di atas. |

Brief §6 menyatakan belum ada tugas chat yang dikerjakan pada pembaruan 13 November. Ref yang diperiksa sudah berisi implementasi Tugas 8. §5 Tugas 8 mensyaratkan refresh sesudah hapus, sementara kode hanya menghapus item lokal. Penilaian mengikuti kode pada commit review.

## Verifikasi baseline vs branch

| Perintah | Baseline `d17637c` | Branch `522e873` |
|---|---|---|
| `flutter pub get` | Exit 0 | Memakai resolusi paket yang sama di worktree. Diff kedua pubspec kosong. |
| `flutter analyze --no-pub` | Exit 1, 6 isu (4 warning, 2 info di tiga file tes) | Exit 0, 0 isu |
| `flutter test --no-pub --reporter expanded` | Exit 0, 273 lulus, 4 dilewati, 0 gagal | Exit 1, 276 lulus, 4 dilewati, **3 gagal** |

Tiga kegagalan berada di `test/claim_whatsapp_test.dart`.

- `failed refresh after returning from chat hides stale number`
- `chat GET wins when older action GET completes last`
- `later action GET wins over an older chat GET completing last`

Satu percobaan baseline di checkout utama mengalami crash Flutter karena `NativeAssetsManifest.json` sudah ada. Pengujian yang dihitung memakai worktree terpisah. Sebelum tes yang berulang di worktree itu, hanya manifest build terbangkitkan tersebut yang dibersihkan.

## Mutation check

Setiap mutasi dijalankan sendiri dengan `flutter test --no-pub --reporter expanded test/unread_badge_notifier_test.dart test/notification_test.dart`.

| Mutasi sementara | Hasil |
|---|---|
| Hilangkan batas 99+ di `lib/services/unread_badge_notifier.dart:13` | Exit 1, 23 lulus, 1 gagal. `formats the maximum count and overflow label` mendeteksi 100 alih-alih 99+. |
| Pindahkan loader badge ke `getConversations(archived: true)` di `lib/main.dart:86` | Exit 0, **24 lulus**. Seluruh tes notifier dan notifikasi tetap hijau. |
| Hilangkan refresh resume di `lib/screens/home/main_tab_screen.dart:86` | Exit 0, **24 lulus**. Seluruh tes notifier dan notifikasi tetap hijau. |

Masing-masing mutasi dan kontrol regresi claim dipulihkan dengan `git restore -- <file>`. Status Git worktree review dan checkout utama bersih setelah kontrol terakhir. HEAD worktree review tetap `522e87325e4fdfe842f2a47d2362ecba3814df08`. Tidak ada commit, push, rebase, reset, atau branch baru.

## Temuan terbuka dan keputusan

- **Tahan merge** sampai temuan blocker dan mayor ditangani serta suite lulus kembali. Ulangi review pada commit revisi.
- Render badge, perilaku FCM/Pusher di perangkat fisik, pergantian akun nyata, dan respons server produksi belum diuji. Temuan sesi dan request berasal dari penelusuran alur kode.
