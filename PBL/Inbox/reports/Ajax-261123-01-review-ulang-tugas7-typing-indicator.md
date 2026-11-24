---
type: report
task: Ajax-261123-01
from: flutter
outcome: succeeded
branch: feature/chat/typing-indicator
commits: '9247fae8aa873d96d63a307ef5a1bd90e3358b28 Revert "feat(chat): pasang quick reply di atas input ChatScreen"'
updated: 2026-11-23
summary: 'REQUEST CHANGES. Throttle clear/send sudah diperbaiki. Indikator masih belum terhubung ke chat.'
---

# Review ulang Tugas 7 — Typing indicator

**Verdict — REQUEST CHANGES.** P1 dari [[GPT-261122-03-review-tugas7-typing-indicator]] masih terbuka. P2 untuk clear dan send ditutup pada level controller. Prasyarat Tugas 6 belum terpenuhi di `origin/develop`.

## Temuan / open items

### P1 · Controller belum dipasang di chat

Semua nomor baris berikut merujuk pada tip `9247fae`. `git grep -n -E 'TypingController|client-typing' HEAD -- lib` menemukan deklarasi dan konstruktor controller di `lib/services/typing_controller.dart:5,10`. `git diff --exit-code d17637c..9247fae -- lib/screens/chat/chat_screen.dart lib/services/chat_service.dart` keluar 0.

| Butir | Status dan bukti |
| --- | --- |
| Trigger `client-typing` | **Belum.** `lib/screens/chat/chat_screen.dart:523` hanya memperbarui state saat input berubah. Jalur send di baris 276–299 mengosongkan input setelah respons API tanpa memanggil controller. `lib/services/typing_controller.dart:45–85,130–139` sudah mengelola callback bool dan meredam error callback. |
| Handler `client-typing` | **Belum.** `lib/services/chat_service.dart:123–132` hanya meneruskan `MessageSent` dan mengabaikan nama event lain. Controller menyaring ID sendiri dan mengatur kedaluwarsa indikator peer di `lib/services/typing_controller.dart:87–108`. |
| Channel `private-conversation.$id` | **Subscribe sudah, filter event typing belum.** `lib/screens/chat/chat_screen.dart:152` menyubscribe percakapan layar. `lib/services/chat_service.dart:66–92` membentuk nama channel saat subscribe/unsubscribe. Handler baris 123–132 tidak memeriksa `event.channelName` untuk typing. Filter percakapan pada stream pesan ada di `lib/screens/chat/chat_screen.dart:154`. |
| Payload hanya `user_id` string dan `is_typing` bool | **Belum.** Konstruktor dan callback di `lib/services/typing_controller.dart:10–17,134–139` belum punya serializer Pusher. Handler service baris 123–132 belum memvalidasi dua field tersebut. |
| Teks `mengetik...` di AppBar | **Belum.** `lib/screens/chat/chat_screen.dart:384–409` merender avatar dan nama. Layar belum mendengarkan `peerTyping`. |
| Disposal | **Sudah di controller, belum di layar.** `lib/services/typing_controller.dart:111–127` membatalkan tiga timer dan membuang notifier. `lib/screens/chat/chat_screen.dart:552–560` melepas langganan dan controller input/scroll. Disposal typing saat menutup chat belum diuji di layar. |
| Suppression read-only atau pengguna dilarang kirim | **Sudah ada sakelar di controller, belum terhubung.** `lib/services/typing_controller.dart:31–48,71–74,87–93` membersihkan status dan menahan event saat disabled. `lib/screens/chat/chat_screen.dart:364–365,523–539` hanya mengecek panjang pesan dan request aktif, tanpa izin efektif percakapan. `origin/feature/chat/readonly-ui` juga belum menjadi leluhur tip review (`git merge-base --is-ancestor` keluar 1). |

Jalur `MessageSent` dan dedup tetap sama dengan baseline. `MessageRead` belum memiliki handler Pusher pada snapshot ini. `ChatScreen:238` memanggil API mark-read, sehingga koeksistensi dua event realtime dengan typing belum bisa diuji.

### P2 · Throttle clear dan send terverifikasi

`c05039d` mempertahankan timer tiga detik saat input kosong atau pesan terkirim. `lib/services/typing_controller.dart:6,53–61,64–85` memulai timer pada `true` pertama dan membiarkannya berakhir setelah tiga detik. Clear dan send tetap mengirim `false` segera jika sebelumnya ada `true`. Tes 15a (baris 477–494) dan 15c (527–544) menahan `true` kedua pada detik ke-2. Tes 15b (502–519) mengizinkan `true` lagi saat ketikan terjadi tepat tiga detik sejak `true` sebelumnya. Tes 15d (551–568) memeriksa clear tidak disusul `false` ganda.

Untuk setiap mutasi, `git restore --source=d199e89 --worktree -- lib/services/typing_controller.dart` memasang blob lama dan `git hash-object` mengonfirmasi kecocokannya. File tes tetap versi tip. Controller asli dipulihkan byte demi byte setelah masing-masing percobaan. Kedua pemeriksaan `git status --porcelain` sesudah pemulihan menghasilkan 0 entri.

| Skenario | Perintah tes (setelah `flutter test --no-pub --reporter expanded`) | Hasil logika lama |
| --- | --- | --- |
| Ketik → clear → ketik cepat | `test/typing_controller_test.dart --plain-name 15a.` | Keluar 1, 0 lulus / 1 gagal. Baris 494 menerima `[true, false, true]` ketika mengharapkan `[true, false]`. |
| Ketik → send → ketik cepat | `test/typing_controller_test.dart --plain-name 15c.` | Keluar 1, 0 lulus / 1 gagal. Baris 544 menerima `[true, false, true]` ketika mengharapkan `[true, false]`. |

Sesudah pemulihan, `flutter test --no-pub --reporter expanded test/typing_controller_test.dart test/ajax_261123_01_throttle_probe_test.dart` keluar 0 dengan **21 lulus** (19 tes branch dan 2 probe sementara). Kedua probe memverifikasi tidak ada `true` kedua pada 2.999 ms, lalu menerima `true` pada ketikan baru di 3.000 ms sejak `true` pertama. File probe dihapus dan status kembali kosong.

### Minor · Cakupan batas waktu send

Tes permanen 15c berhenti sebelum batas tiga detik. Tes 15b menegaskan batas tersebut untuk clear. Keduanya memakai jalur `_stopLocalTyping()` yang sama. Probe sementara memverifikasi batas send tanpa menambah file ke branch.

## Berubah

Review read-only. Diff bersih tip terhadap `develop` hanya menambah `lib/services/typing_controller.dart` (+141) dan `test/typing_controller_test.dart` (+573), total 714 baris. Inventory di luar kedua file itu kosong pada diff final.

### Snapshot setelah fetch

`git fetch origin` keluar 0 dan memajukan ref typing dari `d199e89` ke `9247fae`.

| Ref | Hash |
| --- | --- |
| `origin/develop` | `d17637c4821ac44beedbde2097f0ee33015aabde` |
| `origin/feature/chat/typing-indicator` | `9247fae8aa873d96d63a307ef5a1bd90e3358b28` |
| `origin/feature/chat/quick-reply` | `cbbc13f3059ec79b4e2cc7385844ae9a3a8b9625` |
| `origin/feature/chat/unread-badge` | `c098a8c3bcdc019d9870809640f601a910a47053` |

### Riwayat `git log --reverse --format='%H %an %s' origin/develop..HEAD`

| Commit | Subjek | Author Git |
| --- | --- | --- |
| `d199e89e8e4214d3cd464427f7325f0f1d46663b` | feat(chat): tambah logika typing indicator | 1hermawansteven |
| `6bca8ac9bc3cff99e6b817d4333b9a1e6093f728` | feat(chat): pasang quick reply di atas input ChatScreen | 1hermawansteven |
| `2999bba2eef85e486a9fd3c541db01f37d9490fa` | test(chat): tes quick reply pada ChatScreen sungguhan | 1hermawansteven |
| `4cbb5e3b056c70bec9f123e85d6b32dcc118d9cc` | refactor(chat): jadikan syarat read-only eksplisit pada quick reply | 1hermawansteven |
| `c05039da5a6b856cc206536ad9341020c79af435` | fix(chat): pertahankan throttle typing melintasi clear dan send | 1hermawansteven |
| `68cb2a5039eb49994f63811bb656e10207a7c7e7` | Revert "refactor(chat): jadikan syarat read-only eksplisit pada quick reply" | 1hermawansteven |
| `7a8553a41b5fa641ce09c53ac32dc408c6de5185` | Revert "test(chat): tes quick reply pada ChatScreen sungguhan" | 1hermawansteven |
| `9247fae8aa873d96d63a307ef5a1bd90e3358b28` | Revert "feat(chat): pasang quick reply di atas input ChatScreen" | 1hermawansteven |

- `git rev-list --count d199e89..HEAD` = **7**. Jumlah itu cocok dengan kenaikan terhadap tip review lama. `git rev-list --count origin/develop..HEAD` = **8**, termasuk `d199e89`. Merge-base adalah `d17637c` dan `git rev-list --left-right --count` memberi `0 8`.
- Dua perubahan yang tersamar oleh ringkasan “quick reply lalu revert” adalah `2999bba`, yang menambah 268 baris tes layar, dan `4cbb5e3`, yang mengekstrak syarat penerima/pending/read-only ke getter `_showQuickReplies` dan memindahkan lokasi render chip. Kedua perubahan itu punya revert tersendiri, `7a8553a` dan `68cb2a5`. Pasangan integrasi awal adalah `6bca8ac` dan `9247fae`. Pesan ketiga commit revert menyebut hash asal lengkap. Hanya fix throttle dari tujuh commit baru yang bertahan pada diff terhadap `d199e89`.
- Nama author dan committer Git sama untuk kedelapan commit. Nama akun Gitea `StevHermawan` berasal dari laporan sebelumnya. Kepemilikan akun, pemetaan nama, dan identitas pusher Gitea belum diverifikasi.

### Bukti revert

- `git diff --stat origin/develop...HEAD` keluar 0 dengan dua file typing. `git grep -n -E 'QuickReply|quick_reply' HEAD -- lib test` keluar 1 tanpa kecocokan. Pencarian nama file via `git ls-tree -r --name-only HEAD -- lib test` juga kosong untuk quick reply.
- `git diff --exit-code d199e89..9247fae -- lib/screens/chat/chat_screen.dart lib/services/chat_service.dart lib/widgets/quick_reply_chips.dart test/screens/chat/chat_screen_quick_reply_test.dart` keluar 0 tanpa output. Pembandingan path yang sama dengan `d17637c` juga keluar 0. Blob `ChatScreen` identik di ketiga snapshot (`1fc8cd83eb3586cac7095d3cb418b082724fef97`). Riwayat mencatat file widget dan tes layar ditambah lalu dihapus. Import dan pemanggilan chip ikut hilang.

## Verifikasi

| Perintah | Baseline `d17637c` | Typing `9247fae` |
| --- | --- | --- |
| `flutter pub get` | Keluar 0 | Keluar 0 |
| `flutter analyze --no-pub` | Keluar 1, 4 warning dan 2 info | Keluar 1, enam issue yang sama, 0 di kedua file typing |
| `flutter test --no-pub --reporter expanded` | Keluar 0, 273 lulus / 4 dilewati / 0 gagal | Keluar 0, 292 lulus / 4 dilewati / 0 gagal |
| `git diff --check origin/develop...HEAD` | — | Keluar 0, output kosong |
| `flutter build bundle --no-pub` | — | Keluar 0, `build/flutter_assets/kernel_blob.bin` terbuat. Build bundle Flutter mencakup kompilasi Dart dan aset. APK belum diuji. |

Baseline hash sama dengan review lama dan diukur ulang di worktree terpisah. Issue analyzer ada di `test/api_client_mine_test.dart:21,31,42`, `test/google_sign_in_error_test.dart:26`, dan `test/home_screen_test.dart:27,28`. Suite tip menambah 19 tes controller terhadap baseline dan 4 tes regresi terhadap tip lama `d199e89`.

### Prasyarat dan dry-run

- **Tugas 5 send-status belum ditemukan di develop.** `git ls-remote --heads origin refs/heads/feature/chat/send-status` keluar 0 tanpa baris dan `git branch -a --list '*send-status*'` kosong, sehingga tidak ada ref pembanding. Pencarian subjek `git log origin/develop --regexp-ignore-case --grep='send.status\|status kirim\|optimistic\|quick.reply' --oneline` kosong. Kode develop `lib/screens/chat/chat_screen.dart:276–299,535` masih menunggu HTTP sebelum memasukkan pesan ke store dan mengosongkan draf. Belum ada pesan lokal optimistis dan aksi ulang/hapus pesan gagal sebagaimana brief baris 165–177.
- **Tugas 6 quick-reply belum masuk develop.** `git merge-base --is-ancestor origin/feature/chat/quick-reply origin/develop` keluar 1. File widget dan tes dari `cbbc13f` juga absen pada develop. Pemeriksaan ancestor terhadap tip typing keluar 1. Seri quick reply yang pernah masuk riwayat typing memiliki hash berbeda dan dibatalkan oleh tiga revert. Brief baris 181,197,222–230 menetapkan urutan Tugas 5 → 6 → 7.
- Brief yang dirujuk tersedia di `PBL/Plan/Brief Pengembangan Real-Time Chat - Lost&Found.md`. Baris 199 mensyaratkan konfirmasi Daniel atas Client Events Pusher. Status pengaturan dan deployment belum diverifikasi.

| Target `git merge-tree --write-tree HEAD <target>` | Kode keluar | Tree hasil | Konflik teks |
| --- | --- | --- | --- |
| `origin/develop` | 0 | `b560da5c0a435f8b0832c8862ed9909c540f281f` | Tidak ada |
| `origin/feature/chat/quick-reply` | 0 | `a02c7d49d4465b251082242cafd2dcdeec8eb531` | Tidak ada |
| `origin/feature/chat/unread-badge` | 0 | `aba25685b3d624273c9c1f74a892def58854554c` | Tidak ada |

Dry-run mencakup konflik teks di tip yang dipin. Perubahan integrasi P1 berikutnya masih perlu diperiksa saat menyentuh layar dan service.

### Cleanup

- Checkout utama dicatat sebelum fetch dan sesudah cleanup. `pwd` = `C:\Project\lostfound-mobile`, `git branch --show-current` kosong (detached), `git status --porcelain` kosong, dan `HEAD` = `31a8a80feae0b6c8ba0d69d976a14ec92151861c`. Status akhir **identik** dengan awal. Keempat hash ref yang dipin juga terkonfirmasi tetap sama saat pemeriksaan akhir.
- Worktree `Ajax-261123-01-detached` (tip) dan `Ajax-261123-01-baseline` (develop) masing-masing memiliki 0 entri pada `git status --porcelain --untracked-files=all` sebelum dihapus. Kedua `git worktree remove` keluar 0 dan direktori maupun entri registrasinya sudah hilang. Workspace Orca `review-typing-indicator` tetap terdaftar.
- Mutasi hanya dijalankan di worktree review dan sudah dipulihkan. File probe dan hasil build sementara ikut dibersihkan. Laporan ini satu-satunya file permanen yang ditulis. Tidak ada perubahan produk, checkout utama, commit, push, merge, rebase, reset, atau PR.

## Butuh keputusan user

- Pertahankan urutan merge menurut brief. Review ulang integrasi Tugas 7 setelah Tugas 6 mencapai `develop` dan sesudah Daniel mengonfirmasi Client Events aktif.
- Uji dua akun pada dua HP masih terbuka. Cakup typing mulai/berhenti, clear/send lalu ketik cepat, idle dan expiry, ganti channel, tutup layar, read-only, dan kegagalan event tanpa mengganggu kirim pesan. Pengujian di laporan ini menggunakan kode lokal dan callback tes.
