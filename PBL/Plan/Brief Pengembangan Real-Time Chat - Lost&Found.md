---
type: plan
project: lost-found
status: active
priority: high
updated: 2026-11-12
summary: Brief PM berisi delapan tugas pengembangan chat untuk tim; tanpa tabel/dependensi baru
---

# Brief Pengembangan Real-Time Chat - Lost&Found

**Tanggal:** 2026-11-12
**Project:** [[PBL]] Lost&Found
**Status:** Planning
**Priority:** High
**Plan induk:** [[Real-Time Chat - Lost&Found]]

---

> [!info] Cara membaca
> **Revisi 2026-11-12:** §1 butir 1, Tugas 1 (tujuan, aturan perilaku, langkah tes), Tugas 2 (banner, lapisan kedua), dan §10 diselaraskan dengan keputusan Daniel 2026-11-12 — claim `returned` **tetap terbuka**.
>
> Isi badan brief di bawah **dipakai tim apa adanya** — hanya frontmatter + header ini yang ditambahkan dokumentasi (Dominic-261112-02). Sumber tunggal isi Tugas 1–8: file ini; plan induk hanya menautkan.

Disusun oleh PM (Claude) untuk tim Daniel Geovani, 12 November 2026. Brief ini dibuat agar bisa dibaca sendiri oleh developer atau AI coding tim tanpa dokumen lain. Isinya dibaca dari kode lokal pada 12 November 2026, yang bisa saja belum sama dengan `develop` terbaru. Setiap klaim tentang kondisi kode di bawah wajib diverifikasi dulu sebelum mulai mengerjakan.

## 1. Tujuan

Chat di Lost&Found dipakai pemilik dan penemu barang untuk memverifikasi kepemilikan sebelum serah terima. Chat dasar (kirim/terima realtime, daftar chat, arsip, hapus untuk saya, push FCM, kartu konteks barang, sinkron saat reconnect) sudah berjalan. Brief ini menambah delapan pekerjaan agar chat lebih aman dan nyaman:

1. Chat read-only bila claim ditolak/dicabut, dan user yang diblokir tidak bisa kirim pesan (backend).
2. Tampilan read-only di aplikasi (Flutter).
3. Read receipt realtime: event siaran dan endpoint mark-read massal (backend).
4. Read receipt realtime di aplikasi (Flutter).
5. Status kirim pesan: mengirim, terkirim, gagal, coba lagi (Flutter).
6. Quick reply untuk pertanyaan verifikasi (Flutter).
7. Typing indicator (Flutter).
8. Badge total pesan belum dibaca di tab Chat (Flutter).

Keputusan produk sudah final (disetujui Daniel). Jangan menambah fitur di luar daftar ini.

## 2. Konteks proyek

- Aplikasi: platform lapor, cari, dan klaim barang hilang/ditemukan di kampus Polines.
- Mobile: Flutter. Backend dan admin: Laravel 13 + Filament 3 (PostgreSQL, Sanctum). Login user: Google SSO. Foto: Laravel Storage. Firebase hanya untuk FCM.
- Chat realtime: Pusher (nanti pindah ke Soketi). Channel `private-conversation.{conversation_id}`, otorisasi lewat `POST /api/broadcasting/auth` dengan Bearer token Sanctum.
- Repo (Gitea kampus, HTTPS, private): `git.informatikapolines.id/Daniel_Geovani/lostfound-backend` dan `.../lostfound-mobile`. GitHub tidak dipakai.
- Desain: palet hitam-kuning (primary `#111111`, aksen `#F5C400`). Pakai `AppColors` yang sudah ada, jangan hardcode warna.
- Database tetap 7 tabel: `users`, `buildings`, `lost_reports`, `found_reports`, `claims`, `conversations`, `messages`. Status disimpan huruf kecil. Status claim: `pending`, `accepted`, `returned`, `rejected`, `withdrawn`.
- Admin tidak boleh membaca isi chat. Alasan (reason) claim tidak boleh ditampilkan di chat.

## 3. Kondisi chat sekarang (verifikasi sebelum mulai)

**Backend** (`app/Http/Controllers/ConversationController.php`, `app/Events/MessageSent.php`, `app/Models/Conversation.php`, `routes/api.php`):

- Endpoint: `POST|GET /api/conversations`, `GET|POST /api/conversations/{id}/messages`, `PATCH /api/messages/{id}/read` (satu pesan per panggilan), `PATCH .../archive`, `PATCH .../unarchive`, `DELETE /api/conversations/{id}`. Semua route ber-parameter ID memakai `whereUuid`.
- `sendMessage` hanya mengecek peserta dan validasi `message` (maks 2000). Tidak ada pengecekan status claim maupun user diblokir.
- `MessageSent` memakai `ShouldBroadcastNow` (sinkron, tanpa queue). Pengirim juga menerima event sendiri, jadi klien dedup berdasarkan `id` pesan. Tidak ada event untuk pesan yang dibaca.
- `GET /api/conversations` sudah di-optimasi lewat subquery: jumlah query tetap 4 berapa pun jumlah chat. Jangan merusak ini.
- Respons chat memuat `report_context` (kartu barang) dan data user lewat `UserResource`.

**Flutter** (`lib/screens/chat/chat_screen.dart`, `lib/screens/chat/conversation_list_screen.dart`, `lib/services/chat_service.dart`, `lib/services/message_store.dart`, `lib/models/conversation.dart`, `lib/models/chat_message.dart`, `lib/models/claim.dart`):

- `ChatService` adalah satu instance Pusher per sesi. Ia hanya menangani event `MessageSent`, sudah melakukan sinkron saat reconnect dan saat app resume.
- `ChatScreen` sudah memuat claim (`_claim`) bila `claimId` ada, memakai `ClaimActions`, dan menampilkan kartu konteks barang.
- Label `· terbaca` sudah tampil di gelembung pesan sendiri bila `readAt != null`, tetapi `readAt` pesan milik kita baru berubah setelah pesan dimuat ulang (belum realtime).
- Mark-read dikirim satu per satu lewat `PATCH /api/messages/{id}/read`.
- Kirim pesan memakai `_isSending` (ikon jam pasir), tidak optimistic.
- Layar chat dibuka dari beberapa tempat (daftar chat, alur claim, deep link FCM). Cari semua pemakaian `ChatScreen(` sebelum mengubah konstruktornya.

## 4. Aturan wajib

**Data dan arsitektur**

- Tidak ada migration, tabel, kolom, atau dependensi baru. Bila menurutmu mutlak perlu, berhenti dan laporkan ke Daniel; jangan dikerjakan sendiri.
- Jangan menambah data sensitif ke payload chat (`whatsapp`, `nim`, `role`, `blocked`, `blocked_reason` tidak boleh bocor). Jangan menambah field user baru di payload event.
- Pesan error baru berbahasa Indonesia dan tidak memuat input mentah.
- Backend: ikuti gaya kode yang ada (Laravel, Pint). Flutter: ikuti `provider` dan struktur yang ada. `ApiClient` diambil lewat Provider di layar chat.

**Git (GitFlow-lite)**

- Satu tugas = satu branch = satu PR. Mulai dari `develop` terbaru. Jangan commit langsung ke `main` atau `develop`.
- Nama branch: `<tipe>/<scope>/<deskripsi-kebab-case>`. Scope untuk semua tugas di brief ini adalah `chat`. Nama branch sudah ditentukan di setiap tugas.
- Commit: Conventional Commits, mis. `feat(chat): tambah guard chat read-only`.
- Merge ke `develop` lewat PR dengan Squash and merge.
- Dilarang: force push, rebase, `reset --hard`. Gunakan `git add <file spesifik>`, bukan `git add -A`. Jangan commit file tooling, `.env`, atau kredensial apa pun.
- Awal setiap sesi tampilkan `pwd` dan branch aktif.
- Tugas yang menyentuh file yang sama dikerjakan berurutan (lihat bagian 6) agar tidak konflik. Jangan menyelesaikan konflik dengan rebase.

## 5. Daftar tugas

### Tugas 1 - Backend: guard chat read-only

Branch: `feature/chat/readonly-guard` (repo backend)

Tujuan: pesan baru tidak boleh dikirim ke chat yang claim-nya ditolak atau dicabut, dan user yang diblokir tidak boleh mengirim pesan.

Aturan perilaku:

- Chat dengan claim berstatus `pending` atau `accepted`: terbuka.
- Chat dengan claim berstatus `rejected` atau `withdrawn`: read-only untuk kedua pihak. Status `returned` tetap terbuka (keputusan Daniel, 12 November 2026).
- Chat tanpa claim (`claim_id` kosong, mis. dibuka dari detail laporan): tetap terbuka.
- Pengirim dengan `blocked = true`: tidak boleh mengirim. Cek dulu apakah user diblokir sudah ditolak oleh middleware/auth untuk token yang masih hidup. Bila sudah, cukup tambahkan tes yang membuktikannya; bila belum, tambahkan guard di `sendMessage`.
- Read-only hanya menutup pengiriman. Membaca riwayat, mark-read, arsip, unarchive, dan hapus untuk saya tetap berfungsi.

Langkah:

1. Tambah method di model `Conversation` (mis. `sendStateFor(User $viewer)`) yang mengembalikan `can_send` dan `readonly_reason` (`null`, `claim_closed`, atau `user_blocked`). Satu sumber logika dipakai di semua tempat.
2. Di `sendMessage`, tolak dengan HTTP 422 dan body `{"message": "...", "reason": "claim_closed|user_blocked"}` sebelum `Message::create`. Pesan berbahasa Indonesia. Pakai 422 agar sejalan dengan guard status pada endpoint claim.
3. Tambah `can_send` (boolean) dan `readonly_reason` (nullable string) ke respons `GET /api/conversations` dan `POST /api/conversations`. Relasi `claim` sudah di-eager-load di `index`; jangan menambah query per baris.
4. Tulis tes fitur: tiap status claim (lima status; returned harus tetap bisa kirim), chat tanpa claim, user diblokir, payload `index` dan `store` memuat dua field baru, mark-read dan arsip tetap bisa pada chat read-only, dan jumlah query `GET /api/conversations` tetap 4 untuk 2 maupun 10 chat.

Verifikasi: `php artisan test` (suite hanya jalan di PostgreSQL; satu tes bergantung `APP_URL=http://localhost`), `vendor/bin/pint --test <file yang diubah>`.

Batasan: jangan ubah bentuk respons lain, urutan `updated_at DESC`, filter `archived`, atau perilaku `unread_count`.

### Tugas 2 - Flutter: tampilan chat read-only

Branch: `feature/chat/readonly-ui` (repo mobile). Mulai setelah Tugas 1 ter-merge ke `develop`.

Tujuan: bila chat read-only, kolom input diganti penjelasan, riwayat tetap terbaca.

Langkah:

1. Tambah `canSend` (default `true`) dan `readonlyReason` (nullable) di `lib/models/conversation.dart`, di-parse dari `can_send` dan `readonly_reason`. Respons lama tanpa field ini harus tetap terbaca (backward compatible).
2. Teruskan nilai ini ke `ChatScreen` dari semua titik masuk (daftar chat, alur claim, deep link FCM). Audit semua pemanggil `ChatScreen(`.
3. Di `ChatScreen`, bila tidak bisa kirim: ganti baris input dengan banner informatif, mis. `Chat ini sudah ditutup karena claim telah ditolak atau dicabut.` (untuk `user_blocked`: `Akunmu sedang dibatasi sehingga tidak bisa mengirim pesan.`). Tombol kirim dan teks input tidak ditampilkan.
4. Lapisan kedua: bila `_claim` sudah dimuat dan statusnya `rejected` atau `withdrawn`, anggap read-only juga (mis. setelah `ClaimActions` memanggil `onReloaded`), tanpa menunggu refresh daftar.
5. Bila pengiriman ditolak 422 dengan `reason`, jangan crash: ubah layar ke mode read-only dan tampilkan banner.
6. Tambah widget test untuk: mode normal, `claim_closed`, `user_blocked`, dan 422 saat kirim.

Verifikasi: `flutter analyze` (jangan menambah issue dari baseline), `flutter test`.

### Tugas 3 - Backend: read receipt (event dan mark-read massal)

Branch: `feature/chat/read-receipt` (repo backend). Mulai setelah Tugas 1 ter-merge.

Tujuan: pengirim tahu secara realtime kapan pesannya dibaca. Kolom `messages.read_at` sudah ada, tidak perlu migration.

Langkah:

1. Event baru `App\Events\MessageRead`, `ShouldBroadcastNow`, channel sama `private-conversation.{conversation_id}`, `broadcastAs` = `MessageRead`. Payload hanya: `conversation_id`, `reader_id`, `message_ids` (array UUID), `read_at`. Tanpa data user lain.
2. Endpoint baru `PATCH /api/conversations/{id}/read` (`whereUuid`, `auth:sanctum`): menandai semua pesan lawan bicara yang belum dibaca di chat itu, hanya pesan setelah batas `*_deleted_at` milik pemanggil. Respons `{"marked": <jumlah>, "read_at": <waktu atau null>}`. Idempoten (panggilan kedua mengembalikan `marked: 0`). Non-peserta 403. Tetap berfungsi pada chat read-only.
3. Siarkan `MessageRead` hanya bila ada pesan yang benar-benar berubah. Batasi 100 id per event (batas payload Pusher 10 KB); bila lebih, pecah menjadi beberapa event.
4. Endpoint lama `PATCH /api/messages/{id}/read` tetap ada dan ikut menyiarkan `MessageRead` (satu id) saat membaca pertama kali. Perilaku responsnya tidak boleh berubah.
5. Tes: massal (jumlah benar, idempoten, 403, batas `deleted_at`), event ter-dispatch hanya saat ada perubahan (`Event::fake`), event tidak ter-dispatch pada panggilan kedua, payload tidak memuat data sensitif.

Verifikasi: `php artisan test`, `vendor/bin/pint --test <file yang diubah>`.

### Tugas 4 - Flutter: read receipt realtime

Branch: `feature/chat/read-receipt-ui` (repo mobile). Mulai setelah Tugas 2 dan Tugas 3 ter-merge.

Langkah:

1. `ChatService`: tangani event `MessageRead` (sekarang `_onEvent` membuang semua event selain `MessageSent`). Tambah stream baru dan parse payload di atas. Periksa `event.channelName` bila perlu.
2. `ApiClient`: tambah `markConversationRead(conversationId)` untuk `PATCH /api/conversations/{id}/read`.
3. `ChatScreen`: saat event `MessageRead` datang dan `reader_id` bukan kita, panggil `_store.updateReadAt` untuk id yang ada di payload. Abaikan event dari diri sendiri.
4. Ganti mark-read satu-satu: saat layar dibuka, saat app resume, dan saat pesan masuk, panggil endpoint massal (debounce \~500 ms, hindari panggilan beruntun). Hapus tracking `_readSent` per pesan bila tidak diperlukan lagi.
5. Tampilan: pertahankan label `· terbaca` yang sudah ada. Jangan mengubah desain gelembung.
6. Tes: store memperbarui `readAt` dari event, event milik diri sendiri diabaikan, parse payload.

### Tugas 5 - Flutter: status kirim pesan

Branch: `feature/chat/send-status` (repo mobile). Mulai setelah Tugas 4 ter-merge (file `chat_screen.dart` yang sama).

Tujuan: pesan langsung muncul saat ditekan kirim (optimistic) dengan status jelas.

Aturan:

- Saat kirim: tampilkan pesan lokal dengan id sementara (mis. `local-<uuid>`) berstatus mengirim (opasitas lebih rendah atau ikon jam kecil). Kolom input langsung dikosongkan.
- Sukses: ganti pesan lokal dengan pesan dari server. Hati-hati duplikat: event `MessageSent` dari server bisa datang sebelum respons HTTP. Aturan rekonsiliasi: bila ada pesan lokal berstatus mengirim dengan teks identik dan event `MessageSent` dari diri sendiri tiba, anggap itu pasangannya dan hapus pesan lokal tertua yang cocok. Dedup tetap berdasarkan `id` server.
- Gagal: tampilkan ikon error dan aksi `Coba lagi` serta `Hapus`. Teks tidak boleh hilang. Bila gagal karena 422 read-only, jangan tampilkan coba lagi; ikuti perilaku Tugas 2.
- Batasan yang diketahui: bila permintaan sampai ke server tetapi respons hilang (timeout), coba lagi bisa menghasilkan pesan ganda. Mitigasi sederhana: sebelum mencoba ulang, muat pesan terbaru dan cek apakah pesan identik dari kita sudah ada dalam 1 menit terakhir.
- Urutan: pesan lokal selalu di posisi terbaru.
- Tanpa perubahan backend (tidak ada `client_id`; itu butuh kolom baru dan di luar lingkup).
- Tes: sukses, gagal lalu coba lagi, event datang sebelum respons HTTP (tidak boleh ganda), hapus pesan gagal.

### Tugas 6 - Flutter: quick reply verifikasi

Branch: `feature/chat/quick-reply` (repo mobile). Mulai setelah Tugas 5 ter-merge.

Tujuan: membantu pihak yang memverifikasi mengajukan pertanyaan yang tepat dengan cepat.

Aturan:

- Chip pertanyaan tampil horizontal (scroll) tepat di atas kolom input.
- Tap chip mengisi kolom input, tidak langsung mengirim. Bila kolom kosong, isi dengan teks template; bila sudah ada teks, tambahkan di baris baru. Fokus ke kolom input dan kursor di akhir. User bisa menyunting lalu menekan kirim sendiri.
- Hanya tampil untuk pihak penerima claim (peserta chat yang bukan pengaju/`claimant`), saat claim berstatus `pending`, dan `canSend` bernilai `true`. Pastikan peran ditentukan dari data `Claim` yang sudah dimuat, bukan dari tebakan.
- Template berupa konstanta Dart berbahasa Indonesia (maks 6), contoh: `Barang ini warna dan mereknya apa?`, `Ada ciri khusus yang hanya pemiliknya tahu?`, `Isi atau kelengkapan barangnya apa saja?`, `Kapan dan di mana terakhir kali kamu memakainya?`, `Kondisi barangnya bagaimana (lecet, stiker, gantungan)?`.
- Jangan menyebut atau menampilkan alasan claim. Chat belum mendukung kirim foto, jadi jangan ada template yang meminta foto.
- Tanpa perubahan backend.
- Tes widget: chip tampil untuk penerima claim pending, tidak tampil untuk pengaju, tidak tampil bila read-only atau claim bukan pending, tap mengisi input dan tidak mengirim.

### Tugas 7 - Flutter: typing indicator

Branch: `feature/chat/typing-indicator` (repo mobile). Mulai setelah Tugas 6 ter-merge.

Prasyarat manual (dikerjakan Daniel, bukan tim): aktifkan Client Events di pengaturan app Pusher (nanti di Soketi: `SOKETI_DEFAULT_APP_ENABLE_CLIENT_MESSAGES=true`). Jangan mulai sebelum Daniel mengonfirmasi ini aktif.

Aturan:

- Memakai client event Pusher langsung antar klien, tanpa backend. Nama event `client-typing` pada channel `private-conversation.{id}` yang sudah di-subscribe. Payload `{"user_id": "...", "is_typing": true|false}` saja.
- Pengirim: kirim `is_typing: true` maksimal sekali per 3 detik saat user mengetik; kirim `is_typing: false` saat pesan terkirim, input dikosongkan, atau tidak ada ketikan selama 4 detik.
- Penerima: tampilkan teks `mengetik...` di bawah nama lawan bicara pada AppBar. Hilangkan otomatis bila 5 detik tidak ada pembaruan. Abaikan event dari diri sendiri dan dari channel conversation lain.
- Tidak tampil dan tidak dikirim bila chat read-only.
- Jika client events belum aktif atau pengiriman gagal, tangkap error dan diamkan (fitur boleh tidak berfungsi, aplikasi tidak boleh error atau memunculkan SnackBar).
- Tambah penanganan di `ChatService._onEvent` tanpa mengganggu penanganan `MessageSent` dan `MessageRead`.
- Tes: throttle pengirim, timeout penerima, event diri sendiri diabaikan, tidak ada kebocoran saat layar ditutup (timer dibatalkan di `dispose`).

### Tugas 8 - Flutter: badge total unread di tab Chat

Branch: `feature/chat/unread-badge` (repo mobile). Independen, boleh dikerjakan kapan saja karena menyentuh layar utama dan bukan `chat_screen.dart`.

Aturan:

- Badge pada ikon tab Chat menampilkan jumlah total `unread_count` dari `GET /api/conversations` (daftar tidak terarsip). Sembunyikan bila 0, tampilkan `99+` bila lebih dari 99.
- Tanpa endpoint baru. Segarkan angka saat: login, app resume, kembali dari `ChatScreen`, setelah arsip/hapus/buka arsip, dan saat notifikasi FCM bertipe `chat` diterima di foreground.
- Catatan: Pusher hanya subscribe ke chat yang sedang terbuka, jadi badge tidak realtime untuk chat lain. Itu sudah diterima. Bila ternyata terasa berat atau kurang akurat, laporkan ke Daniel; jangan menambah channel atau endpoint sendiri.
- Tes: penjumlahan, batas 99+, sembunyi saat 0, refresh setelah event.

## 6. Urutan pengerjaan

1. Tugas 1 (backend). Setelah merge:
2. Tugas 2 (Flutter) dan Tugas 3 (backend) boleh berjalan paralel karena beda repo.
3. Tugas 4 setelah Tugas 2 dan Tugas 3 ter-merge.
4. Tugas 5, lalu Tugas 6, lalu Tugas 7, berurutan (semuanya menyentuh `chat_screen.dart`).
5. Tugas 8 kapan saja.

Setiap tugas dibuat PR kecil sendiri. Sebelum mulai tugas berikutnya, tugas sebelumnya harus sudah merge dan di-review Daniel.

## 7. Definisi selesai (setiap tugas)

- Semua langkah dan tes pada tugas itu selesai, suite penuh tidak menurun dari baseline. Catat baseline sendiri sebelum mulai: `php artisan test` di backend dan `flutter test` serta `flutter analyze` di mobile. Sebagai gambaran dari catatan 8 November 2026: backend sekitar 395 tes lulus, mobile 247 lulus/4 dilewati/0 gagal dan analyze 6 issue lama di file test. Angka ini bisa sudah berubah.
- `vendor/bin/pint --test` hanya pada file yang kamu ubah (6 file lama gagal Pint dan bukan tanggung jawab tugas ini). Jangan ubah file lain hanya untuk memperbaiki format.
- Uji manual dengan dua akun (dua HP bila ada). Skenario minimal per tugas ditulis di laporan; jangan menyatakan skenario berhasil bila tidak benar-benar diuji.
- Tidak ada file tooling, `.env`, atau kredensial di commit. `git status` bersih setelah commit.

## 8. Laporan per tugas

Setelah selesai, kirim laporan ke Daniel yang berisi: nama branch dan hash commit, daftar file yang diubah, ringkasan perubahan perilaku, perintah verifikasi beserta hasilnya (jumlah tes lulus/gagal), skenario manual yang diuji dan yang belum, temuan atau risiko, dan asumsi yang kamu ambil. Tuliskan terus terang apa yang tidak diverifikasi.

## 9. Di luar lingkup (jangan dikerjakan)

- Kirim foto atau lampiran di chat, presence/status online, edit atau hapus satu pesan, pesan sistem otomatis, lapor/blokir user dari chat.
- Banner tips verifikasi (dibatalkan).
- Throttle kirim pesan (dicatat di dokumen keamanan, dikerjakan nanti).
- Migrasi Pusher ke Soketi, perubahan skema, tabel atau dependensi baru.
- Menghapus `email` dari payload `sender` (menunggu keputusan terpisah); cukup jangan menambah data baru.

## 10. Keputusan Daniel atas asumsi PM (sudah dikonfirmasi)

- Chat tanpa claim tetap terbuka; hanya chat yang claim-nya berakhir yang menjadi read-only (disetujui).
- Read-only hanya untuk claim `rejected` dan `withdrawn`. Claim `returned` tetap terbuka, jadi pengguna masih bisa mengirim pesan setelah serah terima (keputusan Daniel, menggantikan usulan awal PM).
- Pengiriman yang ditolak memakai HTTP 422 plus field `reason` (`claim_closed` atau `user_blocked`) (disetujui).
- Yang dibatasi adalah pengirim yang diblokir; lawan bicara yang diblokir tidak otomatis menutup chat (disetujui).

> **Revisi 2026-11-12:** bagian ini semula berisi asumsi PM yang menunggu konfirmasi Daniel ("Chat tanpa claim tetap terbuka", "Claim `returned` ikut membuat chat read-only", "Pengiriman ditolak dengan HTTP 422 plus field `reason`", "Yang dibatasi adalah pengirim yang diblokir"). Keempatnya kini **terkonfirmasi**, dengan satu perubahan: `returned` **tidak** lagi read-only. Tugas 1 boleh dimulai.

## 11. Risiko yang perlu diwaspadai

- `MessageSent` dan `MessageRead` memakai `ShouldBroadcastNow`, jadi request menunggu respons Pusher. Jangan menambah pekerjaan berat di jalur kirim pesan.
- Free tier Pusher 100 koneksi bersamaan. Typing dan read receipt menambah event; pantau pemakaian.
- Biaya subquery `unread_count` pada data produksi besar belum diukur.
- Tugas 5 dan Tugas 7 menyentuh logika event realtime; pastikan dedup berdasarkan `id` tidak rusak.
