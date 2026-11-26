---
type: report
task: Ajax-261126-04
from: flutter
outcome: succeeded
branch: "origin/develop (audit read-only, detached worktree sementara)"
commits:
  - "972a6a4c2dabb6f17df26b4a256ff4daea17a937 Merge pull request #32"
updated: 2026-11-26
summary: "Enam PR ter-merge, 363 tes lulus, guard WhatsApp utuh, dan quick reply serta typing belum tersedia di alur pengguna. Ada risiko integrasi read receipt, retry, dan unread badge."
---

# Ajax-261126-04 · Audit final develop mobile

- **Berubah.** Laporan audit ini. Fetch memajukan ref tracking `origin/develop` ke `972a6a4` dan memangkas ref tracking `origin/feat/profile/whatsapp`.
- **Verifikasi.** Flutter 3.47.2 / Dart 3.13.2. Suite penuh 363 lulus, 4 skip, 0 gagal. Run terfokus 80 lulus. WhatsApp terpisah 12 lulus. Analyzer exit 1 dengan 4 warning dan 2 info baseline, 0 error. Diff check lulus.
- **Temuan / open items.** Tugas 6 dan 7 belum terhubung. Tugas 4 dapat menjadwalkan timer setelah dispose dan kehilangan receipt di dalam rekonsiliasi Tugas 5. Ada jalur retry saat chat read-only dan race refresh badge setelah mark-read.
- **Butuh keputusan user.** Audit selesai. Untuk aktivasi Tugas 7, prasyarat brief adalah konfirmasi Daniel bahwa Client Events aktif pada app Pusher yang dipakai.

## Checkout dan merge

| Pemeriksaan | Hasil |
| --- | --- |
| `pwd` awal dan akhir | `C:\Project\lostfound-mobile` |
| `git branch --show-current` awal dan akhir | Keluaran kosong (detached HEAD) |
| `git rev-parse HEAD` awal dan akhir | `31a8a80feae0b6c8ba0d69d976a14ec92151861c` |
| `git status --short` awal dan akhir | Kosong |
| `origin/develop` sekaligus HEAD worktree audit | `972a6a4c2dabb6f17df26b4a256ff4daea17a937` |
| `origin/main` | `fdb025d30fabfa51193bcefb1f74f700d698f6df` |
| `v0.2.0` | Objek annotated tag `1fa053b70c4f128bcbf53d94bdac49872a18ec91`; peeled commit `fdb025d30fabfa51193bcefb1f74f700d698f6df` |

`git fetch origin --prune --tags` exit 0. `git log --oneline --decorate --graph v0.2.0..origin/develop` dan pemeriksaan first-parent mengonfirmasi keenam merge berikut, dari paling lama ke terbaru.

| PR | Tugas | Merge commit |
| --- | --- | --- |
| #30 | 2 · Read-only UI | `d214766` |
| #31 | 4 · Read receipt | `95ef89f` |
| #33 | 6 · Quick reply | `9101a15` |
| #34 | 7 · Typing indicator | `610b455` |
| #35 | 8 · Unread badge | `c8999e5` |
| #32 | 5 · Send status | `972a6a4` |

`git diff --stat v0.2.0..origin/develop` menghasilkan **32 file, 4.055 baris ditambah, 144 dihapus**. PR #28 (`92225ec`) adalah ancestor develop dan juga parent kedua commit rilis di main.

## Perilaku terhadap [[Brief Pengembangan Real-Time Chat - Lost&Found]]

| Tugas | Implementasi final dan bukti lokal |
| --- | --- |
| **2 · Read-only UI** | `Conversation` membaca `can_send` dan `readonly_reason`, dengan default `true` dan `null` untuk payload lama. Keempat pemanggil produksi meneruskan keduanya (daftar chat, detail claim, detail laporan, deep link FCM). Banner menggantikan composer dan riwayat tetap tampil. Claim `rejected` / `withdrawn` menutup composer, `returned` tetap terbuka. HTTP 422 dengan alasan `claim_closed` / `user_blocked` beralih ke read-only. Widget test mencakup status dan alasan ini. Lihat temuan retry Tugas 5. |
| **4 · Read receipt** | `ChatService._onEvent` meneruskan `MessageRead`. Layar memfilter conversation lain dan pembaca sendiri, lalu menerapkan receipt di store. `PATCH /api/conversations/{id}/read` dipicu setelah load awal sukses, resume, dan pesan masuk lawan, dengan debounce 500 ms. Label `· terbaca` dipertahankan. Tes URL/PATCH, parsing, update ID, filter diri sendiri di store, dan debounce saat membuka layar lulus. Lihat race lifecycle dan overwrite receipt. |
| **5 · Optimistic send** | Bubble lokal tampil di posisi terbaru, composer langsung kosong, HTTP mengganti ID lokal, echo Pusher mencocokkan kiriman pending tertua dengan teks sama, dan ID server didedup. Pesan gagal tetap tampil dan bisa dihapus. Retry mengecek pesan sendiri dengan teks identik dalam satu menit. 422 read-only menyimpan bubble tanpa retry untuk bubble tersebut, sementara 422 tanpa alasan yang dikenal tetap bisa retry. Widget test mencakup happy path, gagal/retry, dedup echo sebelum HTTP, hapus, dan kedua tipe 422. |
| **6 · Quick reply** | `lib/widgets/quick_reply_chips.dart` punya widget horizontal, template, aturan kelayakan, dan helper untuk isi/tambah draf, fokus, serta kursor. Tes komponen/harness lulus. `git grep QuickReplyChips` hanya menemukan definisi dan tes. PR #34 membawa revert `9247fae`, `7a8553a`, dan `68cb2a5` atas integrasi quick reply dan tes layar dari riwayat branch. Belum ada import, widget di atas composer, gating dari `Claim` yang sudah dimuat + user aktif + izin kirim efektif, atau pengaitan helper ke controller dan FocusNode composer. Sambungkan ke layar dan uji penerima pending, pengaju, read-only, status lain, serta tap tanpa POST. Untuk gating, gunakan izin chat efektif, karena variabel tombol kirim saat ini juga mensyaratkan draf sudah berisi. |
| **7 · Typing indicator** | `lib/services/typing_controller.dart` berisi logika dan tes unit untuk throttle 3 detik, clear/idle pengirim, expiry penerima, filter diri sendiri, dan dispose. `git grep TypingController` hanya menemukan definisi dan tes. `ChatService` hanya menangani `MessageSent` / `MessageRead`; belum ada pengiriman, penerimaan, atau stream `client-typing` dengan filter channel `private-conversation.{id}`. `ChatScreen` belum menghubungkan perubahan/clear draf dan pengiriman, listener status lawan, teks `mengetik...` di AppBar, kondisi read-only, maupun cleanup timer/listener pada route. Tangani kegagalan Client Events secara diam dan uji dua klien setelah konfigurasi dikonfirmasi. |
| **8 · Unread badge** | Notifier menjumlahkan `unreadCount` dari `GET /api/conversations` yang aktif, menyembunyikan nol, menampilkan `99+`, dan mengisolasi hasil per sesi. Refresh terhubung saat main tab dibuka setelah login, resume, kembali melalui route observer, setelah arsip/hapus/buka arsip sukses, dan FCM chat foreground. Jalur detail claim/laporan juga refresh setelah kembali. Tes notifier, wiring, logout/resume, popup gagal/sukses dan FCM mock lulus. Lihat race mark-read vs refresh di bawah. |

## Temuan untuk branch fix

1. **Timer read receipt bisa dibuat kembali setelah layar ditutup.** `chat_screen.dart:315–339,803–814`. Skenario dari kode: PATCH A tertahan, debounce kedua menyetel `_markReadAgain=true`, lalu pengguna menutup chat. `dispose` membatalkan timer yang ada saat itu. Saat PATCH A selesai, `finally` menjadwalkan timer baru tanpa guard `mounted`, sehingga PATCH lanjutan masih bisa berjalan. Uji dengan PATCH yang ditahan, event kedua, pop, lalu selesaikan PATCH. Guard penjadwalan dan penyelesaian, lalu bersihkan flag saat dispose.
2. **Subscribe yang selesai setelah dispose juga bisa membocorkan listener.** `chat_screen.dart:214–247,274–312,803–814`. Dengan Future subscribe yang tertahan, dispose berjalan sebelum tiga subscription dibuat. Saat Future pulih, layar tetap memasang listener dan masuk ke `_loadMessages`, yang mencoba `setState` sebelum guard. Listener berikutnya juga memanggil `setState`. Cek lifecycle sesudah await subscribe dan uji pop saat subscribe belum selesai. Risiko dari inspeksi kode.
3. **Read receipt dapat hilang ketika snapshot yang lebih tua menimpa pesan.** `message_store.dart:36–61,95–112`, `chat_screen.dart:291–301,405–414`. Jika echo Pusher memuat ID server, `MessageRead` mengisi `readAt`, lalu HTTP send dengan `read_at:null` selesai, `merge` menimpa objek yang sudah terbaca. Echo ulang atau snapshot halaman juga dapat menimpa. Receipt untuk ID yang belum dimuat langsung dilewatkan, dan resync hanya mengambil ID baru, jadi status pesan yang sudah ada tidak pulih jika event terlewat. Uji urutan echo → receipt → HTTP lama, receipt sebelum pesan, dan perubahan `readAt` pada ID yang sudah ada saat reconnect.
4. **Retry gagal lama dapat mengirim saat layar sudah read-only.** `chat_screen.dart:434–468,573–593`. Retry bergantung hanya pada status bubble `failed`. Setelah claim ditolak atau kiriman lain mengembalikan 422 read-only, bubble gagal lama masih menawarkan `Coba lagi`, dan callback dapat GET lalu POST. Terapkan izin kirim efektif pada render dan handler, termasuk sesudah await pemeriksaan duplikat. Dengan heuristik teks tanpa `client_id`, pesan identik yang sengaja dikirim berdekatan juga bisa salah dianggap pasangan retry. Batasan ini perlu dipertahankan dalam ekspektasi pengujian.
5. **Badge dapat menampilkan angka yang sudah basi saat kembali dari chat.** `chat_screen.dart:315–339,803–811`, `main_tab_screen.dart:94–110`, `conversation_list_screen.dart:134–151`. Saat pop sebelum 500 ms, PATCH terjadwal dibatalkan. Jika PATCH sudah berjalan, GET badge/daftar setelah pop dapat selesai lebih dulu dan mengambil angka lama. Tidak ada pemicu lain dari sukses PATCH untuk menyegarkan angka. Uji pop cepat dan PATCH tertahan dengan notifier nyata, lalu pastikan daftar dan badge membaca hasil setelah mark-read selesai. FCM chat aktif juga dapat memicu GET sebelum PATCH selesai. Efek ini terpisah dari kebijakan brief bahwa Pusher hanya subscribe chat yang sedang terbuka.
6. **Kontrak runtime dengan backend masih perlu verifikasi lingkungan tujuan.** Flutter final bergantung pada endpoint bulk read dan event `MessageRead`, serta menerima `can_send`/`readonly_reason` bila dikirim API. Tidak ada fallback ke PATCH per pesan bila endpoint massal belum tersedia. Koordinasikan dengan Bob untuk memeriksa deploy yang dipakai build, payload peserta, dan broadcast dengan dua akun. Deep link FCM saat conversation ditemukan meneruskan metadata. Jika ID tidak ada di daftar aktif, router membuka tab Chat sesuai jalur fallback saat ini.

## Guard WhatsApp PR #28

`git merge-base --is-ancestor 92225ec HEAD` exit 0. Diff PR #28 → tip final menunjukkan `_reloadClaim` utuh. Di `claim_detail_screen.dart:82–99`, `try` jalur sukses hanya mencakup GET. Guard `mounted` + `_claimRequestVersion` dan `setState` sukses tetap berada di luar `try/catch`. Perubahan PR #35 memasang refresh badge pada jalur kembali dari chat secara asinkron, terpisah dari reload claim. Di `claim_whatsapp_test.dart`, perubahan pascabaseline menambah import/provider dan teardown notifier pada fixture. Skenario dispose sebelum respons GET sukses dan gagal tetap ada di baris 478 dan 509. Run khusus file mengonfirmasi **12 lulus, 0 gagal**, termasuk dua skenario itu serta tes urutan respons claim.

## Verifikasi dan batas bukti

- `git diff --check v0.2.0..origin/develop` exit 0 pada detached `972a6a4`.
- `flutter pub get --offline --enforce-lockfile` exit 0 untuk menyiapkan worktree baru sebelum menjalankan dua perintah `--no-pub`. File tracked tetap bersih. Artefak build dan cache lokal worktree ikut terhapus saat cleanup.
- `flutter analyze --no-pub` exit 1. Empat warning pada `test/api_client_mine_test.dart:21,31,42` dan `test/google_sign_in_error_test.dart:26`. Dua info pada `test/home_screen_test.dart:27,28`. Ketiga file identik dengan `v0.2.0`, dan jumlah serta tingkat diagnostik cocok dengan baseline tercatat di [[2026-11-23]]. Tidak ada error analyzer.
- `flutter test --no-pub --reporter expanded` exit 0, **363 lulus / 4 skip / 0 gagal**. Run terfokus delapan file chat dan WhatsApp **80 lulus**. Suite memuat output diagnostik fixture, termasuk error request mark-read widget WhatsApp dan tile peta, tanpa test failure.
- Temuan race berasal dari penelusuran kode. Suite saat ini tidak menjalankan skenario race tersebut. APK, uji dua HP/akun, Pusher/FCM nyata, dan konfigurasi deployment tidak diperiksa dalam audit ini.
- Worktree detached sementara sudah hilang dari filesystem dan `git worktree list`. Checkout utama tetap detached pada `31a8a80feae0b6c8ba0d69d976a14ec92151861c` dengan `git status --short` kosong.
