---
type: report
task: GPT-261114-03
from: backend
outcome: succeeded
branch: feature/chat/readonly-guard
commits:
  - "120a04f9cb feat(chat): add sendStateFor helper to Conversation model"
  - "319324ebca feat(chat): enforce read-only guard and expose status fields"
  - "7346ae1fa1 test(chat): verify 4-query budget on conversation list"
  - "4cb2dff5cd test(chat): cover read-only guard for closed claims and blocked users"
updated: 2026-11-15
summary: Guard sesuai alur utama, tetapi cakupan regresi belum memenuhi kontrak Tugas 1.
---

# Review Tugas 1 — Guard chat read-only

**Verdict — REQUEST CHANGES.** Tahan merge sampai tes membedakan pemanggil dan lawan bicara, membuktikan penolakan tanpa event/push, dan mencatat batas query yang benar untuk percakapan dengan claim.

## Referensi dan lingkup

- `pwd` awal `C:\Project\lostfound-backend`, branch `fix/chat/unread-count-n-plus-one`. `git status --short` menunjukkan ` M README.md` sebelum review. `git fetch origin` di checkout ini ditolak sandbox pada `.git/FETCH_HEAD`. Saya menggunakan clone sementara dari Gitea, memperbarui `develop` dengan `git pull --ff-only`, lalu memeriksa branch review pada detached HEAD. Tidak dibuat branch fitur lokal.
- Gitea mengembalikan `4cb2dff5cd8ec60b08627de42d1a52e814597440` untuk branch Anisa_Aulia, cocok dengan hash acuan. `git merge-base` sama dengan ujung `origin/develop`, `da0c104b62dd328660b6554c1540ef586046f357` (WhatsApp C #33).
- Empat commit mengikuti Conventional Commits. Diff mencakup `app/Http/Controllers/ConversationController.php`, `app/Models/Conversation.php`, `tests/Feature/ConversationArchiveTest.php`, dan `tests/Feature/ConversationTest.php` (134 tambahan, 3 penghapusan). Seluruhnya dalam lingkup. Diff khusus `database/migrations`, `composer.json`, `composer.lock` kosong. Tidak ada file tooling atau `.idea`. `git diff --check` lulus.

## Perilaku yang diperiksa

- `app/Models/Conversation.php:72` menutup claim `rejected` dan `withdrawn` untuk kedua slot. `pending`, `accepted`, `returned`, serta chat tanpa claim bisa mengirim selama pengirim aktif. Untuk pengirim terblokir pada claim tertutup, `claim_closed` mendapat prioritas. Brief tidak menentukan prioritas saat kedua kondisi berlaku.
- `app/Http/Controllers/ConversationController.php:291` mengembalikan 422 dengan `message` statis berbahasa Indonesia dan `reason` sesuai status. Guard berada setelah pemeriksaan partisipan dan validasi isi, sebelum insert (:304), broadcast (:321), dan push (:326). Kesimpulan tentang urutan event dan push berasal dari kode.
- Login baru memeriksa `blocked` di `app/Http/Controllers/AuthController.php:42`. Aksi blokir admin mengubah flag dan alasan di `app/Filament/Resources/UserResource.php:127` tanpa mencabut token. Rute chat memakai `auth:sanctum` (`routes/api.php:30`, :68–74). Guard Sanctum memvalidasi token dan provider tanpa membaca flag blokir. Tes bearer token dibuat sebelum user diblokir, lalu menerima 422 `user_blocked` dari endpoint. Laporan pengembang untuk commit ini tidak ditemukan di vault yang diperiksa.
- `POST /api/conversations` dan `GET /api/conversations` memanggil `sendStateFor` dengan user peminta di `app/Http/Controllers/ConversationController.php:129` dan :163. Status lawan bicara tidak ikut menentukan. Payload baru hanya menambah `can_send` dan `readonly_reason`. `UserResource` dan `MessageSent` tidak berubah, dan diff chat tidak menambahkan `whatsapp`, `nim`, `role`, `blocked`, `blocked_reason`, atau `counterpart_whatsapp`.
- `ConversationTest.php:429` mencakup GET messages, mark-read, archive, unarchive, dan DELETE pada claim `rejected`. Sort `updated_at DESC`, filter arsip, dan subquery `unread_count` tetap memakai jalur yang sama di `ConversationController.php:153–181`.

## Baseline vs branch

Suite dijalankan di PostgreSQL sementara pada loopback, dengan `APP_URL=http://localhost` dan konfigurasi uji melalui environment proses. Tidak ada perubahan atau penyalinan `.env`. Pint dijalankan dalam mode `--test` pada keempat file diff.

| Pemeriksaan | Baseline `develop` (`da0c104`) | Branch review (`4cb2dff`) |
| --- | --- | --- |
| `php artisan test` | 404 lulus, 0 gagal, 1.768 assertion | 408 lulus, 0 gagal, 1.797 assertion |
| `php vendor/bin/pint --test <empat file>` | Lulus | Lulus |
| GET daftar untuk 2 dan 10 chat tanpa claim/konteks | 4 dan 4 (uji tambahan) | 4 dan 4 (tes bawaan) |
| GET daftar untuk 2 dan 10 chat dengan claim unik dan laporan | 7 dan 7 (uji tambahan) | 7 dan 7 (uji tambahan) |


## Temuan

### Blocker

Tidak ada blocker yang ditemukan pada alur pengiriman yang diuji.

### Mayor

1. **Tes tidak membedakan status viewer dan lawan bicara.** `tests/Feature/ConversationTest.php:37–41,407–426`. Tes POST terbuka memakai dua akun aktif. Tes GET/POST tertutup memakai claim `withdrawn`, yang menghasilkan `claim_closed` untuk kedua akun. Mutasi (d) lolos. Tambahkan skenario chat terbuka dengan satu akun terblokir. Uji GET dan POST dari kedua akun, termasuk `false / user_blocked` untuk akun terblokir dan `true / null` untuk akun aktif. Buktikan akun aktif tetap bisa kirim meskipun penerimanya terblokir.
2. **Penolakan belum diuji terhadap broadcast dan FCM.** `tests/Feature/ConversationTest.php:329–354,357–405` dan `app/Http/Controllers/ConversationController.php:291–331`. Tes penolakan memeriksa 422 dan ketiadaan baris pesan. `Event::fake` pada tes lain membuktikan event untuk jalur sukses. Untuk kedua alasan penolakan, gunakan `Event::fake([MessageSent::class])` dan fake/mock pada jalur FCM, lalu tegaskan `MessageSent` tidak di-dispatch dan layanan push tidak dipanggil. Mutasi (c) hanya membuktikan tes mendeteksi insert yang sudah terjadi.
3. **Angka empat query hanya teruji untuk chat tanpa claim/konteks.** `tests/Feature/ConversationArchiveTest.php:271–285`, `database/factories/ConversationFactory.php:16–18`, dan `app/Http/Controllers/ConversationController.php:153,192–200`. Tes bawaan mengukur 4/4 untuk 2/10 chat. Uji tambahan dengan claim unik per chat, masing-masing punya lost/found report, mengukur **7/7** di kedua ref. Ini tetap konstan terhadap jumlah chat. Eager load claim dan kedua laporan sudah ada di `develop`, dan diff tidak menambah query pada jalur itu. Pernyataan brief bahwa daftar selalu empat query terlalu luas. Putuskan apakah kontraknya empat untuk fixture minimal dengan batas konstan per bentuk relasi, atau empat juga untuk daftar berisi claim. Tambahkan tes 2/10 yang mencakup claim sesuai kontrak yang disetujui.

### Minor

- Tes lima status mengirim hanya dari `user1` (`tests/Feature/ConversationTest.php:357–384`). Implementasi menutup kedua slot. Tambahkan pemeriksaan dari `user2` untuk `rejected` dan `withdrawn` agar aturan dua pihak eksplisit.
- Catatan brief §6 bertanggal 13 November menyebut pekerjaan chat belum dimulai. Branch yang diperiksa memuat implementasi dan tes Tugas 1.

## Uji mutasi

| Mutasi | Tes dijalankan | Hasil |
| --- | --- | --- |
| (a) Hapus guard `sendMessage` | Tes lima status dan bearer akun terblokir | **2 gagal.** Keduanya menerima 201 ketika mengharapkan 422. |
| (b) Masukkan `returned` ke status tertutup | Tes lima status dan bearer akun terblokir | **1 gagal, 1 lulus.** `returned` menerima 422 ketika mengharapkan 201. Tes akun terblokir tetap lulus sesuai lingkupnya. |
| (c) Pindahkan guard sesudah `Message::create` | Tes lima status dan bearer akun terblokir | **2 gagal.** Respons tetap 422, tetapi kedua tes menemukan baris pesan. |
| (d) Pakai lawan bicara pada GET dan POST | Semua tes `ConversationTest` dan `ConversationArchiveTest` | **Mutasi lolos.** 30/30 dan 25/25 lulus, termasuk cek payload di kedua endpoint. |
| (e) Tambah satu query `messages()->count()` per baris | Tes jumlah query index | **1 gagal.** Dua chat memakai 6 query, ekspektasi 4. |

Setiap mutasi dipulihkan dengan `git restore -- <file>` dan diikuti `git status --porcelain` kosong. Uji tambahan dengan claim diulang setelah percobaan awal memakai fixture yang mendaur ulang `claim_id` dan tertolak oleh constraint unik. Angka 7/7 berasal dari uji ulang dengan claim berbeda per chat.

## Syarat merge yang tersisa

1. Tutup temuan mayor dan dokumentasikan bahwa bearer token yang masih valid tetap mencapai guard chat sesudah akun diblokir.
2. Ulangi suite, Pint, dan mutasi yang relevan di hash revisi. Tes riwayat/mark-read/arsip/hapus tetap perlu lulus.
3. Uji manual dua akun lewat Postman pada backend revisi. Coba kirim dari kedua akun saat claim ditolak atau dicabut, lalu cek HTTP 422, riwayat, mark-read dan perubahan arsip. Uji `returned` dan chat tanpa claim. Blokir satu akun setelah login, gunakan token lama untuk memastikan `user_blocked`, lalu pastikan akun aktif tetap bisa kirim ke lawan terblokir. Uji Postman, Pusher/FCM live, dan deployment belum dilakukan.

Status akhir salinan review bersih pada detached HEAD `4cb2dff5cd`. Checkout utama tetap pada branch awal dengan perubahan `README.md` yang sudah ada. Tidak ada commit, push, merge, rebase, atau reset.
