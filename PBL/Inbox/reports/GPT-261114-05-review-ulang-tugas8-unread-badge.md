---
type: report
task: GPT-261114-05
from: flutter
outcome: failed
branch: feature/chat/unread-badge
commits:
  - "522e87325e feat(chat): tambah badge unread di tab Chat"
  - "02835edbe5 feat(chat): tambah badge unread di tab Chat"
  - "c19ef96816 fix(chat): reset badge per sesi dan gabungkan refresh agar hasil lama tidak menimpa"
  - "3048483d87 fix(chat): pisahkan reload claim dari refresh badge dan perbaiki fixture tes"
  - "144490c2d0 test(chat): tambah tes badge nyata dan pastikan mutasi sumber/resume terdeteksi"
updated: 2026-11-15
summary: "REQUEST CHANGES. Suite lulus, tetapi swipe hapus, refresh arsip, dan invalidasi saat refresh beruntun masih perlu diperbaiki."
---

# Review ulang Tugas 8 · Badge unread tab Chat

**Verdict — REQUEST CHANGES.** Tahan merge sampai regresi swipe, refresh setelah mutasi data, batas sesi logout, dan cakupan regresinya ditangani.

## Riwayat dan lingkup

- Mulai di `C:\Project\lostfound-mobile`, detached HEAD `06e3e82`, status bersih. Fetch awal terhalang izin tulis `.git/FETCH_HEAD`. Fetch dengan eskalasi berhasil, lalu `git switch develop` dan `git pull --ff-only` mengonfirmasi baseline yang sudah sinkron.
- `origin/develop` dan merge-base sama di `d17637c4821ac44beedbde2097f0ee33015aabde`. Tidak ada branch lokal dengan nama review, sehingga pengujian memakai detached HEAD dari `origin/feature/chat/unread-badge` di `144490c2d04a6e037d916b7c32061bba9f3b7caf`.
- `git log origin/develop..origin/feature/chat/unread-badge` berisi tepat lima commit di frontmatter, dari yang tertua ke terbaru. Keempat commit yang disebut ada, ditambah **`522e87325e`**. `git cat-file -t 522e87325e` menghasilkan `commit`, pemeriksaan leluhur exit 0, dan `range-diff` menandai `522e873` identik di posisi pertama diikuti empat tambahan. Fetch menampilkan fast-forward `522e873..144490c`. Bukti riwayat yang diperiksa tidak menunjukkan amend, rebase, atau force push terhadap commit review lama.
- `02835ed` adalah anak langsung `522e873` dan membawa 126 penambahan serta 13 penghapusan di sembilan file. Patch ini memperkenalkan reset lintas akun, hook hapus, mengosongkan `onDismissed`, menambah refresh dari detail claim/laporan, dan memperluas notifier serta fixture. `c19ef96` memutus callback daftar dari badge dan menambah penggabungan GET. `3048483` memisahkan reload claim dan memperbarui fixture. `144490c` menambah empat tes wiring.
- Diff kumulatif 16 file, 718 penambahan, 73 penghapusan, `git diff --check` bersih. Diff `pubspec.yaml` dan `pubspec.lock` kosong. File tooling dan `.idea` tidak berubah. `chat_screen.dart`, `chat_service.dart`, `message_store.dart`, model `conversation` dan `chat_message` tidak berubah. Diff `conversation_list_screen.dart` mencakup import dan hook pasca-DELETE serta penggantian callback penghapusan item swipe. Penggantian callback melewati lingkup hook.

## Status temuan Ajax

| Temuan lama | Status | Bukti pada revisi |
|---|---|---|
| **Blocker 1** — angka akun lama dan respons tertunda | **Belum tertutup** | `auth_provider.dart:84–91,115–125,164–188` dan `fcm_service.dart:110–125,255–278` menghubungkan reset ke logout, 401, dan pergantian akun. `unread_badge_notifier.dart:34–41,88–94` menolak hasil yang sudah berjalan sebelum reset. Tes akun A → B mencakup GET B gagal dan respons A tertunda. Selama logout manual berjalan, layar lama masih dapat memulai refresh baru setelah reset. Lihat B1. |
| **Blocker 2** — tiga regresi tes WhatsApp claim | **Tertutup** | Ketiga tes lama lulus. `claim_detail_screen.dart:129–138` menjalankan refresh badge terpisah dan tetap menunggu `_reloadClaim()`. Fixture `test/claim_whatsapp_test.dart:65–87,230–233` menyediakan notifier dan menyimulasikan jaringan badge gagal pada satu tes. Diff mempertahankan assertion lama. |
| **Mayor** — refresh setelah hapus dari menu dan swipe | **Belum tertutup** | Kedua jalur memanggil hook bersama sesudah DELETE sukses di `conversation_list_screen.dart:249–256,366–368`. Observer juga dapat memanggil GET saat sheet/dialog ditutup sebelum DELETE. Swipe kehilangan penghapusan lokal, dan kejadian pasca-DELETE dapat hilang bila follow-up sedang berjalan. Lihat M1 dan M3. |
| **Mayor** — GET beruntun dan hasil daftar lama menimpa badge | **Belum tertutup** | `main_tab_screen.dart:44–48` tidak lagi memasang callback jumlah dari daftar, jadi jalur overwrite lama tertutup. Notifier menggabungkan GET-nya sendiri, tetapi satu event baru dapat terbuang saat follow-up. Daftar dan badge masih memiliki GET aktif terpisah saat masuk tab Chat (`main_tab_screen.dart:102–105`; `conversation_list_screen.dart:69–100`). |
| **Mayor** — tes terputus dari wiring aplikasi | **Belum tertutup** | `test/unread_badge_wiring_test.dart:85–248` menguji factory daftar aktif dan render nol/99+, resume dengan `MainTabScreen` nyata, serta akun berganti dengan GET gagal/tertunda. Tes pergantian akun memakai auth/notifier nyata dengan FCM nonaktif dan memicu GET secara eksplisit. Coverage event logout manual dan hapus dinilai di tabel mutasi. |
| **Minor** — tiga file tes di luar lingkup | **Belum tertutup** | Ketiganya masih ada di diff. Analyzer menunjukkan 0 isu pada branch, sedangkan baseline masih 6 isu di tiga file tersebut. |

## Temuan review ulang

### Blocker

1. **Reset logout tidak menutup refresh selama cleanup.** `lib/screens/auth/auth_provider.dart:115–155` menandai logout, mereset lewat `endSession()`, lalu mempertahankan user hingga cleanup, Google sign-out, dan logout lokal selesai. `lib/screens/profil/profil_screen.dart:40–54` juga menunggu sebelum mengganti route. Selama jeda, resume atau pop dapat memulai GET baru melalui `lib/screens/home/main_tab_screen.dart:80–95` tanpa cek status auth. GET yang dimulai setelah reset memakai generasi baru di `lib/services/unread_badge_notifier.dart:88–94` sehingga jumlah sesi yang sedang ditutup dapat muncul kembali selama cleanup. Jalur ini ditemukan dari kode. Uji akun berganti yang sudah ada hanya mencakup GET yang dimulai sebelum reset dan kegagalan GET sesudah pergantian.

### Mayor

1. **Swipe sukses tidak menghapus item dari state daftar.** `lib/screens/chat/conversation_list_screen.dart:253,366–368` meneruskan `removeOnSuccess: false` lalu mengosongkan `onDismissed`. Probe widget sementara dengan satu chat aktif dan provider badge mengonfirmasi DELETE terpanggil dan tile menghilang, tetapi tampilan `Belum ada percakapan` tidak muncul setelah animasi selesai. Probe exit 1 pada assertion tersebut dan lima tes lama lulus. Tidak ada exception Flutter pada skenario itu.
2. **Arsip/buka arsip sukses tidak memicu refresh badge.** `lib/screens/chat/conversation_list_screen.dart:190–207` hanya memuat ulang daftar setelah API sukses. Callback hitungan daftar tidak dipasang oleh `lib/screens/home/main_tab_screen.dart:44–48`. Observer di baris 85 menangani pop sheet sebelum mutasi selesai. Jika GET badge itu selesai lebih awal, angka tetap lama sampai pemicu lain. Terlihat langsung dari jalur kode.
3. **Event yang datang saat GET susulan berjalan terbuang.** `lib/services/unread_badge_notifier.dart:56–80` menolak menjadwalkan refresh jika `_followUpUsed` sudah true. Bila GET susulan mengambil snapshot sebelum DELETE sukses, hook pasca-DELETE hanya memperoleh future yang sama dan snapshot sebelum hapus dapat menjadi angka terakhir. Reset juga tidak melepaskan `_inFlight` di baris 34–41. Refresh sesi baru yang tiba saat follow-up lama masih berjalan dapat ikut hilang, meski hasil lama sendiri ditolak. `test/unread_badge_notifier_test.dart:108–120` memang mengunci perilaku maksimal dua GET pada skenario event selama follow-up.
4. **Tes GUI hapus dapat lulus meski hook badge gagal.** `test/chat_archive_test.dart:76–88` tidak menyediakan notifier. Jalur menu sudah menghapus item di `lib/screens/chat/conversation_list_screen.dart:253` sebelum lookup provider di baris 254. Lookup yang gagal masuk catch dan jalur mengembalikan false, sementara assertion tes sukses hanya memeriksa panggilan DELETE serta hilangnya item. Tes ini tidak membuktikan badge diperbarui atau alur sukses mencapai snackbar.

### Minor

1. **Perubahan tes di luar lingkup masih ikut.** `test/api_client_mine_test.dart:1`, `test/google_sign_in_error_test.dart:24`, dan `test/home_screen_test.dart:27` masih berbeda dari develop. Pisahkan perubahan agar analyzer kembali ke baseline yang sebanding.

## Perilaku Tugas 8

| Syarat | Hasil |
|---|---|
| Total daftar aktif | Factory `lib/main.dart:22–25` memanggil `getConversations(archived: false)`, lalu notifier menjumlahkan `unreadCount` di `lib/services/unread_badge_notifier.dart:7–11`. Tes factory dan penjumlahan lulus. |
| Nol, 99+, warna | Nol tersembunyi, 99 tetap 99, di atasnya 99+. Widget memakai `AppColors.accentYellow` dan `AppColors.primary` di `lib/widgets/figcraft_components.dart:241–249`. Tes widget memeriksa nol dan 99+. |
| Login, resume | `MainTabScreen.initState` memuat badge saat layar autentikasi diganti ke tab utama. Resume memicu refresh di baris 80–82 dan diuji lewat widget nyata. |
| Kembali dari ChatScreen | Observer `ModalRoute` di `lib/main.dart:121` dan `main_tab_screen.dart:61–85` menangani pop ke layar utama, termasuk dari daftar. Detail claim/laporan memasang hook setelah push selesai (`claim_detail_screen.dart:132–138`, `report_detail_screen.dart:118–127`). Jalur claim memiliki tes regresi untuk reload claim. Refresh badge melalui deep link dan detail laporan diperiksa dari kode. |
| Arsip, hapus, buka arsip | Belum memenuhi. Hook hapus berada sesudah DELETE, namun swipe rusak, event refresh dapat hilang, dan arsip/buka arsip tidak meneruskan perubahan ke badge. |
| FCM chat foreground | `lib/services/fcm_service.dart:234–243` memicu refresh setelah guard sesi dan sebelum keputusan banner. `test/notification_test.dart:293` memakai event foreground palsu dan memeriksa panggilan loader. |
| Lingkup API/Pusher | Tidak ada perubahan pada API client atau channel Pusher dan tidak ada dependensi baru. |

## Baseline vs branch

| Perintah | Develop `d17637c` | Review `144490c` |
|---|---|---|
| `flutter pub get` | Exit 0 | Exit 0 |
| `flutter analyze --no-pub` | Exit 1, 6 isu lama, 4 warning dan 2 info | Exit 0, 0 isu. Tiga file tes di luar lingkup masih berubah. |
| `flutter test --no-pub --reporter expanded` | Exit 0, 273 lulus, 4 dilewati, 0 gagal | Exit 0, 287 lulus, 4 dilewati, 0 gagal |

Tiga skenario claim lama, `failed refresh after returning from chat hides stale number`, `chat GET wins when older action GET completes last` dan `later action GET wins over an older chat GET completing last`, lulus pada suite review. Percobaan awal Flutter dalam sandbox tidak selesai dan dihentikan. Angka tabel berasal dari eksekusi ulang dengan akses cache SDK dan paket.

## Mutation check

Setiap mutasi dijalankan sendiri dari HEAD bersih, lalu file dipulihkan dengan `git restore -- <file>`. Tes fokus dijalankan dengan `flutter test --no-pub --reporter expanded`.

| Mutasi sementara | Tes fokus | Hasil |
|---|---|---|
| **(a)** `lib/main.dart` memakai `getConversations(archived: true)` | `unread_badge_wiring_test.dart` | **Terdeteksi**, exit 1. 1 lulus, 3 gagal pada factory daftar aktif, resume, dan guard respons lama yang juga memeriksa argumen daftar aktif. |
| **(b)** Hilangkan refresh resume dari `main_tab_screen.dart` | `unread_badge_wiring_test.dart` | **Terdeteksi**, exit 1. 3 lulus, tes resume gagal. |
| **(c)** Hilangkan reset pada jalur logout manual di `fcm_service.dart`, dengan reset invalidasi 401/pergantian akun tetap aktif | `unread_badge_wiring_test.dart`, `notification_test.dart`, `fcm_logout_test.dart`, `fcm_api_test.dart` | **Tetap hijau**, exit 0. 50 lulus, 0 gagal. |
| **(d)** Hilangkan hook refresh sesudah DELETE dari `conversation_list_screen.dart` | `chat_archive_test.dart`, `unread_badge_wiring_test.dart`, `unread_badge_notifier_test.dart`, `notification_test.dart` | **Tetap hijau**, exit 0. 37 lulus, 0 gagal. |
| **(e)** Hilangkan batas 99+ dari formatter notifier | `unread_badge_wiring_test.dart`, `unread_badge_notifier_test.dart` | **Terdeteksi**, exit 1. 10 lulus, 3 gagal pada formatter, widget nol/99+, dan widget resume. |

Suite penuh diulang secara terpisah pada mutasi **(c)** dan **(d)**. Keduanya tetap hijau dengan exit 0, masing-masing 287 lulus, 4 dilewati, 0 gagal.

## Dry-run konflik dengan Tugas 2

`git merge-tree --write-tree origin/feature/chat/readonly-ui origin/feature/chat/unread-badge` exit **0**. Tugas 2 di `720414d5b2eed9716b3dbf8dcf066f7fd53aa67b`, tree hasil simulasi `8ef1ef3014814f50e71666a9a0671499394fa71f`. Ketiga file bersama menyatu secara tekstual. Di `claim_detail_screen.dart` dan `report_detail_screen.dart` area bersama adalah argumen konstruksi ChatScreen dan hook setelah navigasi. Di `conversation_list_screen.dart` area menyatu adalah argumen ChatScreen dari Tugas 2 serta import dan hook penghapusan dari Tugas 8. Pemeriksaan tree menunjukkan perubahan swipe tetap terbawa. Tidak ada merge sungguhan atau pengujian suite pada tree gabungan.

## Syarat merge yang tersisa

- Tutup pengisian ulang badge selama sesi ditutup. Uji logout manual, 401, pergantian akun ketika follow-up lama berjalan, dan GET pertama sesi baru gagal.
- Pertahankan penghapusan item swipe. Buktikan badge menyegarkan setelah DELETE sukses dari menu dan swipe, serta tidak berubah karena DELETE gagal. Tambahkan refresh pasca-arsip/buka arsip dan pertahankan event terbaru ketika GET sedang berjalan.
- Pisahkan tiga perubahan tes di luar lingkup dan ulangi analyze, suite, serta kelima mutasi sampai setiap mutasi yang diminta terdeteksi.
- Brief §7 meminta pemeriksaan manual dua akun. Belum ada uji perangkat atau server langsung untuk sesi, FCM/Pusher, dan aksi percakapan.

Semua mutasi dan probe sementara dipulihkan dengan `git restore`. Status final `git status --porcelain=v1 --branch` hanya menampilkan `## HEAD (no branch)`, pada commit review `144490c2d0`. Tidak ada perubahan kode atau tes yang tersisa, branch baru, commit, push, rebase, reset keras, atau merge sungguhan.
