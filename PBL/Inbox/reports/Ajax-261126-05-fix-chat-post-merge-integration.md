---
type: report
task: Ajax-261126-05
from: flutter
outcome: succeeded
branch: fix/chat/post-merge-integration
commits:
  - "e04e3f199a41e2ee4d2a67448ae3224708acb989 fix(chat): integrate post-merge conversation features"
updated: 2026-11-26
summary: "Quick reply dan typing terhubung, read receipt bertahan, retry mengikuti read-only, dan badge disegarkan setelah mark-read."
---

# Ajax-261126-05 · Integrasi Flutter chat pasca-merge

- **Berubah.** Quick reply dan typing aktif dalam alur chat. Rekonsiliasi mempertahankan `read_at`, retry mengikuti izin kirim efektif, dan mark-read menyegarkan badge setelah PATCH sukses.
- **Verifikasi.** Suite penuh 380 lulus, 4 skip, 0 gagal. WhatsApp 12 lulus. Analyzer melaporkan 0 error, 4 warning, dan 2 info baseline. Diff check lulus dan hash remote sama dengan HEAD lokal.
- **Temuan / open items.** Status Client Events pada app Pusher tujuan dan pertukaran event antara dua perangkat masih perlu dibuktikan. Verifikasi Laravel menggunakan kode checkout lokal `origin/develop`, sehingga status deployment aplikasi belum diketahui.
- **Butuh keputusan user.** Implementasi dan push selesai. Konfirmasi Client Events dan uji dua akun tetap menjadi tahap verifikasi lingkungan tujuan.

## Git dan worktree

| Pemeriksaan | Hasil |
| --- | --- |
| `pwd` awal | `C:\Users\ADVAN\orca\workspaces\lostfound-mobile\ajax-261126-05-post-merge-chat` |
| Branch awal / kondisi | `Davinciz/ajax-261126-05-post-merge-chat`, bersih |
| Base setelah `git fetch origin --prune --tags` | `origin/develop` persis `972a6a4c2dabb6f17df26b4a256ff4daea17a937` dan merupakan parent tunggal commit tugas |
| Branch implementasi | `fix/chat/post-merge-integration` |
| Commit lokal dan `git ls-remote --exit-code --heads origin refs/heads/fix/chat/post-merge-integration` | `e04e3f199a41e2ee4d2a67448ae3224708acb989` |
| `git diff --check origin/develop...HEAD` | Exit 0 |
| `git status --short` setelah commit dan push | Kosong, dengan upstream `origin/fix/chat/post-merge-integration` |
| Checkout utama `C:\Project\lostfound-mobile` | Detached HEAD `31a8a80feae0b6c8ba0d69d976a14ec92151861c`, bersih pada awal dan akhir |
| Selector Orca | `--environment local --worktree identity:wt2:local:5a993080-784a-464b-9acc-c970214daec9` |

Push `git push -u origin fix/chat/post-merge-integration` sukses. Branch siap untuk pemeriksaan. Worktree sementara bersih sebelum dihapus melalui Orca. Setelah penghapusan, path sudah tidak ada dan tidak terdaftar di `git worktree list --porcelain`. Checkout utama tetap bersih pada HEAD `31a8a80` dan branch lokal tetap menunjuk ke `e04e3f1`. [Branch Gitea](https://git.informatikapolines.id/Daniel_Geovani/lostfound-mobile/src/branch/fix/chat/post-merge-integration)

## Implementasi dan berkas

- `lib/screens/chat/chat_screen.dart` memasang chip horizontal tepat di atas composer setelah `Claim` pending dimuat dan pengguna cocok dengan penerima Claim serta lawan chat cocok dengan `claimantId`. Chip tetap muncul saat draf terisi. Tap mengisi atau menambah template di baris baru, memfokuskan input, dan memindahkan kursor ke akhir. Pengiriman hanya terjadi lewat aksi kirim.
- Layar memproses `client-typing` milik lawan di conversation aktif. `TypingController` membatasi `true` ke sekali per 3 detik, mengirim `false` pada kirim, kosong, atau idle 4 detik, dan menghapus indikator lawan setelah 5 detik. Read-only menonaktifkan timer pengirim dan menyembunyikan indikator. `dispose` membuang listener dan timer.
- `lib/services/chat_service.dart` berbagi subscription per conversation dengan token kepemilikan per layar. Layar tertutup melepaskan haknya, termasuk saat subscribe native masih tertahan. Setelah `await subscribe`, layar memeriksa `mounted` sebelum memasang listener dan memuat pesan. Pelepasan terakhir mempertimbangkan pemilik baru yang masuk selama subscribe.
- `lib/services/message_store.dart` menjaga marker baca saat echo, respons POST, halaman, dan snapshot resync datang dengan `read_at` kosong. Receipt yang mendahului pesan ditampung dan diterapkan hanya pada pesan pengguna sendiri. Resync juga memperbarui status baca pada ID yang sudah ada.
- Chat menyembunyikan `Coba lagi` ketika read-only. Handler memeriksa izin saat dipanggil dan setelah GET duplikat, sebelum POST. Gelembung yang gagal masih dapat dihapus. Heuristik pencocokan teks yang identik dalam satu menit tetap mengikuti perilaku sebelumnya.
- PATCH mark-read tetap memakai debounce 500 ms. Saat layar ditutup, pekerjaan yang tertunda dilepas dari siklus hidup layar dan berjalan setelah PATCH yang masih berlangsung. `finally` hanya menjadwalkan debounce ulang selama layar masih terpasang. Badge di-refresh setelah setiap PATCH sukses.
- `test/chat_post_merge_integration_test.dart` mencakup 15 kasus widget dengan `ChatScreen`, `ChatService`, method channel Pusher mock, dan notifier badge nyata. `test/chat_test.dart` menambah dua tes unit. `test/chat_send_status_test.dart` dan `test/notification_router_test.dart` menyesuaikan override subscription. `test/ui_followup_test.dart` membiarkan fixture Dio menyelesaikan flush PATCH saat menutup layar.

## Kontrak API dan Pusher

- Bagian pemetaan data dan Dio dari skill `flutter-laravel-integration` digunakan untuk mencocokkan Flutter dengan rute dan controller Laravel pada ref lokal backend `origin/develop` `7a1f31ea185db541ca35515dca8dd6928d9ec5a1`. `GET /api/claims/{id}` memuat relasi lost/found yang dipakai `Claim.isReceiver`. Metadata `can_send` dan `readonly_reason` tetap mengikuti percakapan dan respons 422.
- Pengiriman tetap `POST /api/conversations/{id}/messages` dengan `message`. Mark-read tetap `PATCH /api/conversations/{id}/read`. Laravel menandai pesan peserta lawan dan mempublikasikan `MessageRead` dengan `conversation_id`, `reader_id`, `message_ids`, dan `read_at`. Badge memakai `unread_count` dari `GET /api/conversations`. Otorisasi channel tetap memakai keanggotaan percakapan Laravel.
- `pusher_channels_flutter` 2.4.0 pada lockfile dan cache lokal menyediakan `trigger(PusherEvent)` dan callback `onSubscriptionSucceeded`. SDK Android meneruskan JSON string ke private-channel `trigger` dan menggunakan `bindGlobal` untuk menerima event. Transport menunggu pengakuan subscribe sebelum trigger dan menangani kegagalan tanpa SnackBar. `MessageSent` serta `MessageRead` tetap diproses oleh alur sebelumnya.
- `client-typing` membawa JSON `{"user_id":"…","is_typing":true|false}` di `private-conversation.{id}`. Client Events perlu aktif pada app tujuan. Implementasi Swift 2.4.0 meneruskan trigger ke Pusher tanpa menyelesaikan callback Flutter `result`, sehingga pengiriman dari layar bersifat asinkron tanpa menunggu hasilnya. Pengantaran Android dan iOS serta konfigurasi tujuan belum diuji pada perangkat. [Dokumentasi Pusher Client Events](https://pusher.com/docs/channels/using_channels/events/#triggering-client-events)

## Bukti verifikasi

| Pemeriksaan | Hasil |
| --- | --- |
| Toolchain / setup | Flutter 3.47.2, Dart 3.13.2, `flutter pub get --offline --enforce-lockfile` untuk cache worktree |
| `flutter analyze --no-pub` | Exit 1 karena diagnostik lama. 0 error, 4 warning di `test/api_client_mine_test.dart` dan `test/google_sign_in_error_test.dart`, serta 2 info di `test/home_screen_test.dart`. Tidak ada diagnostik pada berkas perubahan |
| `flutter test --no-pub test/claim_whatsapp_test.dart` | Exit 0, 12 lulus termasuk kedua skenario dispose sebelum GET selesai. PR #28 (`92225ec`) merupakan ancestor HEAD. Diff terhadap base untuk `claim_detail_screen.dart` dan `claim_whatsapp_test.dart` kosong |
| `flutter test --no-pub --reporter expanded` | Exit 0, 380 lulus, 4 skip, 0 gagal. Empat variasi tes layout login di `figcraft_layout_test.dart` di-skip karena test dijalankan tanpa `GOOGLE_SERVER_CLIENT_ID` |

- Bukti quick reply mencakup claim yang masih dimuat, penerima pending, pengaju, outsider, counterpart yang salah, status accepted/rejected, read-only, fokus, kursor, tambah baris saat draf terisi, dan tidak ada POST.
- Bukti transport mencakup pengakuan subscribe, payload trigger, throttle, clear saat idle/kosong/kirim, kedaluwarsa indikator yang diperbarui, filter channel/pengirim, payload salah, trigger gagal, dan pembatalan timer saat dispose.
- Bukti race mencakup dispose sebelum subscribe selesai dengan pemilik baru di channel sama, receipt sebelum echo dan HTTP lalu snapshot lama, resync untuk ID yang sudah dikenal, retry yang tertahan di GET saat 422 mengubah izin, serta pop cepat dan antrean PATCH yang menunggu PATCH pendahulu gagal. Tes badge memeriksa jumlah sebelum dan sesudah PATCH sukses.
- Run awal menemukan timer internal Dio dari flush PATCH pada fixture kartu laporan yang otomatis di-unmount oleh test runner. Fixture kini menutup widget dan menunggu request selesai dalam badan tes. Dua info konstruksi field sempat terdeteksi dan dibersihkan sebelum hasil final.

## Batas pekerjaan

Perubahan hanya pada Flutter dan laporan vault ini. PR, merge, perubahan backend atau deployment, APK, Pusher/FCM nyata, dan uji dua akun pada perangkat berada di luar bukti tugas ini.
