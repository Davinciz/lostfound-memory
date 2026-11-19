---
type: report
task: GPT-261116-02
from: flutter
outcome: failed
branch: feature/chat/unread-badge
commits:
  - "0c071281cf chore(test): kembalikan perubahan tes di luar lingkup Tugas 8"
  - "d87fae13d6 fix(chat): hentikan refresh badge saat logout atau tanpa sesi aktif"
  - "32d555197d fix(chat): pertahankan penghapusan item saat swipe dan refresh badge setelah DELETE sukses"
  - "1963975c01 fix(chat): refresh badge setelah arsip dan buka arsip berhasil"
  - "cfab81088f fix(chat): jadwalkan refresh susulan agar event saat GET berjalan tidak terbuang"
  - "31a8a80fea test(chat): tambah tes arsip dan hapus dengan notifier nyata"
updated: 2026-11-16
summary: "REQUEST CHANGES. Jalur aksi gagal masih memicu GET badge melalui observer navigasi."
---

# Review ulang kedua Tugas 8 · Badge unread tab Chat

**Verdict — REQUEST CHANGES pada `31a8a80feae0b6c8ba0d69d976a14ec92151861c`.**

## Riwayat dan lingkup

- Mulai dari `C:\Project\lostfound-mobile`, detached HEAD di `144490c2d0`, dengan working tree bersih. Fetch awal ditolak pada `.git/FETCH_HEAD`. Fetch dengan eskalasi berhasil dan memajukan ref Tugas 8 secara fast-forward. `git switch develop` dan `git pull --ff-only` berhasil. Develop tetap di `d17637c4821ac44beedbde2097f0ee33015aabde`, juga merge-base dengan branch review. Checkout review memakai detached HEAD dari ref remote yang ada.
- `git merge-base --is-ancestor 144490c2d0 origin/feature/chat/unread-badge` exit 0. Enam commit sesudah ujung review lama tercantum di frontmatter dalam urutan tertua ke terbaru. **`0c071281cfbface3fcc7a0ba1abc8a9540a4166c`** adalah commit tambahan yang belum tercantum di prompt. Commit tersebut mengembalikan tiga file tes di luar lingkup.
- Diff tiga titik terhadap `origin/develop` mencakup 14 file, 1.167 penambahan dan 46 penghapusan. `git diff --check` exit 0. Diff kedua pubspec kosong. Daftar file tidak memuat tooling, `.idea`, file kredensial, atau file milik rekan B yang dilindungi. Diff `conversation_list_screen.dart` terhadap develop hanya menambah import dan dua hook pascasukses. Pemulihan swipe mengembalikan callback dari develop.

## Status temuan lama

| Temuan | Status | Bukti |
|---|---|---|
| Blocker · Refresh saat logout dan sesi tidak aktif | **Tertutup** | Factory memeriksa autentikasi dan `isLoggingOut` (`lib/main.dart:23–30`). FCM menutup sesi badge sebelum cleanup, dan guard foreground memeriksa sesi (`lib/services/fcm_service.dart:102–106,235–243,256–279`). Tes widget menahan cleanup dan menguji resume serta pop dari ChatScreen ke detail klaim (`test/unread_badge_wiring_test.dart:273–381`). Unit test mencakup guard tanpa sesi aktif. |
| Mayor · Swipe dan DELETE | **Belum tertutup sepenuhnya** | DELETE sukses dari menu membuang item lokal, sementara swipe menghapusnya lewat `onDismissed`. Tes swipe sukses membuktikan empty state (`test/chat_archive_test.dart:213–230`). Probe swipe 409 memeriksa bahwa item tetap ada. Hook pasca-DELETE sendiri hanya berjalan pada sukses, tetapi observer tetap menyebabkan GET badge pada alur gagal. Lihat M1. |
| Mayor · Arsip dan buka arsip | **Belum tertutup sepenuhnya** | Kedua aksi memanggil hook setelah API sukses di `lib/screens/chat/conversation_list_screen.dart:190–208`. Tes widget standalone memeriksa perubahan jumlah dan kegagalan API. Observer pada layar utama memicu GET tambahan saat menu aksi ditutup. Lihat M1. |
| Mayor · Refresh susulan dan hasil lama | **Tertutup** | `lib/services/unread_badge_notifier.dart:36–61,81–140` mengosongkan `_inFlight` dan penanda saat invalidasi, memberi satu susulan untuk setiap GET yang menerima event baru, dan menjaga generasi hasil. Tes `test/unread_badge_notifier_test.dart:112–189` membuktikan dua burst menghasilkan tepat tiga GET, hasil akhir 6, antrean sesi lama dibatalkan, dan hasil lama tidak menimpa sesi baru. |
| Mayor · Tes aksi dengan notifier nyata | **Belum tertutup** | Fixture menyediakan notifier asli dan memeriksa sukses menu/swipe, 409 menu, sukses/gagal arsip dan buka arsip, serta empty state. Branch tidak memiliki tes gagal lewat swipe. Fixture `test/chat_archive_test.dart:124–152` juga tidak memasang `MainTabScreen` dan observer aplikasi, sehingga GET dari pop menu/dialog luput dari tes. |
| Minor · Tiga file tes di luar lingkup | **Tertutup** | Diff `test/api_client_mine_test.dart`, `test/google_sign_in_error_test.dart`, dan `test/home_screen_test.dart` kosong. Analyzer melaporkan 6 isu yang sama pada file dan baris yang sama. |

## Temuan review

- **Blocker baru** — tidak ditemukan pada pemeriksaan ini.
- **M1 · Mayor — Pop menu/dialog memulai GET badge saat aksi gagal.** `lib/main.dart:129` memasang `RouteObserver<ModalRoute<dynamic>>` (`lib/services/notification_router.dart:75`). `lib/screens/home/main_tab_screen.dart:61–69,85` berlangganan pada rute sendiri dan menyegarkan badge tanpa membedakan rute yang ditutup. Penutupan bottom sheet di `lib/screens/chat/conversation_list_screen.dart:156–186` serta dialog konfirmasi di baris 225–250 terjadi sebelum hasil API aksi. Akibatnya, jalur gagal tetap dapat mengirim GET badge dan jalur sukses dapat mengirim GET tambahan sebelum mutasi data selesai. Dua probe widget sementara memasang `MainTabScreen` dan observer asli, lalu membuat API aksi gagal. Item tetap tampil, tetapi probe mencatat **1 GET tambahan pada Arsipkan** dan **2 GET tambahan pada Hapus dari menu**, dengan ekspektasi 0 pada keduanya. Suite probe menghasilkan 5 lulus dan 2 gagal pada assertion jumlah GET. Buka arsip memakai bottom sheet yang sama dan diperiksa dari kode.
- **Minor · Cakupan gagal swipe.** `test/chat_archive_test.dart:213–249` menjalankan swipe hanya untuk kasus sukses. Kasus DELETE 409 memakai menu long-press. Jalur kode swipe dan menu berbagi DELETE, tetapi hanya swipe melewati siklus `Dismissible`. Probe sementara mengubah skenario gagal menjadi swipe 409 dan membuktikan item tetap tampil serta hook badge tidak berjalan pada fixture standalone. Semua 10 tes file tersebut lulus saat probe aktif.

## Perilaku inti Tugas 8

- Factory mengambil daftar aktif dengan `archived: false` dan notifier menjumlahkan `unreadCount` (`lib/main.dart:23–30`, `lib/services/unread_badge_notifier.dart:7–16`). Tes unit/widget mencakup penjumlahan, nol tersembunyi, 99, dan 99+. Badge memakai `AppColors.accentYellow` serta `AppColors.primary` (`lib/widgets/figcraft_components.dart:241–249`).
- Initial load saat masuk layar utama, resume, dan pop ke layar utama terhubung di `lib/screens/home/main_tab_screen.dart:49–57,80–94`. Jalur kembali dari chat yang dibuka lewat detail klaim atau laporan memanggil refresh di `lib/screens/claim/claim_detail_screen.dart:129–138` dan `lib/screens/laporan/report_detail_screen.dart:118–127`. Pemeriksaan login dan jalur laporan berdasarkan kode, sedangkan resume memakai tes widget.
- Tes foreground FCM chat dengan event palsu lulus (`test/notification_test.dart:295`). Tidak ada diff API client, channel Pusher, atau dependensi. Tiga tes regresi WhatsApp claim lulus pada suite branch, yaitu `failed refresh after returning from chat hides stale number`, `chat GET wins when older action GET completes last`, dan `later action GET wins over an older chat GET completing last`.

## Baseline vs branch

| Perintah | Develop `d17637c` | Review `31a8a80` |
|---|---|---|
| `flutter pub get` | Exit 0 | Exit 0 |
| `flutter analyze --no-pub` | Exit 1, 6 isu lama (4 warning, 2 info) | Exit 1, 6 isu yang sama |
| `flutter test --no-pub --reporter expanded` | Exit 0, 273 lulus, 4 dilewati, 0 gagal | Exit 0, 296 lulus, 4 dilewati, 0 gagal |

## Mutation check

Setiap mutasi dijalankan sendiri. Setelah percobaan, file dipulihkan dengan `git restore -- <file>` dan `git status --porcelain` mengembalikan output kosong. Semua mutasi terdeteksi oleh assertion tes, sehingga tidak ada mutasi yang perlu diulang pada suite penuh.

| Mutasi sementara | Tes fokus | Hasil |
|---|---|---|
| (a) Ganti sumber di `main.dart` menjadi `archived: true` | `unread_badge_wiring_test.dart` | Exit 1, 2 lulus, 3 gagal. Factory menerima `true`, dan assertion resume serta pergantian akun ikut gagal. |
| (b) Hilangkan refresh resume di `main_tab_screen.dart` | `unread_badge_wiring_test.dart` | Exit 1, 4 lulus, 1 gagal. Tes resume kehilangan GET yang diharapkan. |
| (c) Hilangkan penutupan sesi/reset badge khusus logout manual di `fcm_service.dart` | `unread_badge_wiring_test.dart`, `notification_test.dart`, `fcm_logout_test.dart`, `fcm_api_test.dart` | Exit 1, 50 lulus, 1 gagal. Badge masih 7 saat cleanup dan seharusnya kosong. Jalur invalidasi 401/pergantian akun dipertahankan. |
| (d) Hilangkan hook setelah DELETE | `chat_archive_test.dart` | Exit 1, 8 lulus, 2 gagal. Tes menu dan swipe kehilangan GET badge. |
| (e) Hilangkan format overflow `99+` | `unread_badge_notifier_test.dart`, `unread_badge_wiring_test.dart` | Exit 1, 14 lulus, 3 gagal. Formatter menghasilkan `100` dan dua tes widget kehilangan `99+`. |
| (f) Hilangkan hook setelah arsip/buka arsip | `chat_archive_test.dart` | Exit 1, 8 lulus, 2 gagal. Kedua tes sukses kehilangan GET badge. |
| (g) Hilangkan penanda refresh susulan | `unread_badge_notifier_test.dart`, `unread_badge_wiring_test.dart` | Exit 1, 16 lulus, 1 gagal. Hanya satu request tercatat saat tes mengharapkan GET kedua. |
| (h) Pertahankan `removeOnSuccess: false` dan kosongkan `onDismissed` | `chat_archive_test.dart` | Exit 1, 9 lulus, 1 gagal. Empty state setelah swipe tidak tampil. |

## Dry-run konflik dengan Tugas 2

Perintah `git merge-tree --write-tree origin/feature/chat/readonly-ui origin/feature/chat/unread-badge` exit 0 dengan tree `836ef6018b489ff14a2aa79ba2b5823910008559`. Tugas 2 berada di `720414d5b2eed9716b3dbf8dcf066f7fd53aa67b`. Kedua ujung branch berada di luar riwayat `origin/develop` saat fetch, dengan merge-base bersama `d17637c`.

| File bersama | Area yang terverifikasi dalam tree simulasi |
|---|---|
| `claim_detail_screen.dart` | Argumen `canSend` dan `readonlyReason` berdampingan dengan hook badge setelah kembali dari chat dan reload klaim di sekitarnya. |
| `report_detail_screen.dart` | Argumen read-only saat membuka chat dan hook badge setelah kembali ada di tree. |
| `conversation_list_screen.dart` | Argumen read-only saat membuka chat, hook arsip dan DELETE, serta penghapusan lokal lewat `onDismissed` ada di tree. |

Dry-run bebas konflik tekstual. Tree gabungan diperiksa lewat Git dan belum dijalankan dengan suite Flutter.

## Syarat merge

1. Batasi pemicu kembali dari chat agar penutupan menu/dialog aksi tidak memulai GET. Pertahankan refresh sesudah API aksi sukses dan tambah tes dengan observer aplikasi untuk aksi gagal. Lengkapi tes permanen DELETE gagal lewat swipe.
2. Jalankan ulang verifikasi cabang dan uji manual dua akun oleh Daniel, idealnya memakai dua HP. Kirim pesan dari akun A ke B dan cek badge B saat FCM foreground, kembali dari chat, dan resume. Cek arsip, buka arsip, hapus dari menu/swipe, kegagalan DELETE serta empty state. Logout B ketika refresh tertunda, lalu login A dan pastikan angka B tidak muncul. Uji perangkat dan server langsung belum dijalankan dalam review ini.

Delapan mutasi dan kedua probe dipulihkan. Tiga tes WhatsApp dijalankan lagi secara terfokus setelah pemulihan dan ketiganya lulus. Status akhir `git status --porcelain` kosong pada detached HEAD `31a8a80`, dan `git diff --check origin/develop...HEAD` exit 0. Tidak ada perubahan kode atau tes yang tersisa, branch baru, commit, push, rebase, reset keras, atau merge sungguhan.
