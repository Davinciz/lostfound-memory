---
type: report
task: GPT-261116-01
from: backend
outcome: succeeded
branch: feature/chat/readonly-guard
commits:
  - "d240e0674d docs(chat): clarify claim_closed priority over user_blocked in sendStateFor"
  - "c3ca918604 test(chat): assert constant 7-query budget on conversation list with claims"
  - "5965502a7b test(chat): expand read-only guard tests for participant direction and side effects"
updated: 2026-11-16
summary: Cakupan regresi guard terverifikasi dan keenam mutasi terdeteksi. Catatan developer dan uji manual dua akun masih perlu ditutup.
---

# Review ulang Tugas 1 — Guard chat read-only

**Verdict — APPROVE DENGAN CATATAN.** Revisi layak di-merge setelah uji manual dua akun oleh Daniel. Seluruh temuan mayor teknis tertutup. Catatan developer tentang token yang sudah diterbitkan belum terverifikasi.

## Lingkup dan riwayat

- Checkout awal berada di `C:\Project\lostfound-backend`, branch `fix/chat/unread-count-n-plus-one`, dengan perubahan ` M README.md` yang sudah ada. Fetch ditolak pada `.git/FETCH_HEAD`. Saya memakai clone sementara dari origin, menjalankan `git switch develop` dan `git pull --ff-only` untuk baseline, lalu meninjau branch pada detached HEAD.
- Ujung `origin/develop` dan merge-base sama di `da0c104b62dd328660b6554c1540ef586046f357`. Hash ini sama dengan baseline review sebelumnya. `git merge-base --is-ancestor 4cb2dff5cd origin/feature/chat/readonly-guard` keluar dengan kode 0.
- Daftar lengkap di atas `4cb2dff5cd`, urut dari yang paling lama, adalah `d240e0674d`, `c3ca918604`, dan `5965502a7b`. Ujung branch penuh `5965502a7be3e2ec06f81ab3a77a2f2d99e50eed`. Tiga hash dan pesan commit tercantum di frontmatter.
- Diff tiga titik terhadap `origin/develop` berisi empat file, 296 penambahan dan 3 penghapusan. Filenya `app/Http/Controllers/ConversationController.php`, `app/Models/Conversation.php`, `tests/Feature/ConversationArchiveTest.php`, dan `tests/Feature/ConversationTest.php`. Diff untuk migration, `composer.json`, `composer.lock`, tooling, dan `.idea` kosong. `git diff --check` lulus.
- Diff revisi `4cb2dff5cd..5965502a7b` di `app/` hanya menambah komentar prioritas di `app/Models/Conversation.php:74`. Perilaku produksi sama dengan versi review sebelumnya.

## Status temuan lama

| Temuan | Status | Bukti |
| --- | --- | --- |
| Mayor 1 — arah peserta | Tertutup | `tests/Feature/ConversationTest.php:408` memakai satu akun terblokir dan satu akun aktif untuk `pending`, `accepted`, `returned`, dan tanpa claim. Tes memeriksa GET daftar, POST percakapan, dan POST pesan untuk kedua akun. Mutasi (d) menguji GET dan POST percakapan secara terpisah. |
| Mayor 2 — insert, broadcast, dan push | Tertutup | `tests/Feature/ConversationTest.php:380` dan `:452` memakai `Event::fake([MessageSent::class])` dan `Event::assertNotDispatched`, mock `PushNotificationService::send` dengan `shouldNotReceive`, serta memeriksa ketiadaan baris pesan. Lihat hasil (c) dan (f). |
| Mayor 3 — anggaran query | Tertutup | `tests/Feature/ConversationArchiveTest.php:273` mempertahankan tes tanpa claim dan `:290` menambah 2 vs 10 chat dengan claim unik, lost report, dan found report per chat (fixture di `:320`). Kontrak PM adalah jumlah konstan terhadap jumlah chat untuk bentuk relasi yang sama. Lihat hasil (e). |
| Minor — kedua peserta pada claim tertutup | Tertutup | `tests/Feature/ConversationTest.php:359` menjalankan kelima status dari kedua slot, termasuk `user2` untuk `rejected` dan `withdrawn`. |
| Minor — prioritas alasan | Tertutup | Komentar `app/Models/Conversation.php:74` sesuai urutan kondisi. Tes di `tests/Feature/ConversationTest.php:470` memeriksa `claim_closed` untuk pengirim terblokir pada claim `withdrawn`. |
| Minor dokumentasi brief — status pengerjaan | Belum, di luar lingkup branch | Catatan bertanggal 13 November di brief §6 (baris 234) masih berbunyi bahwa belum ada tugas chat yang dikerjakan. Branch ini memuat implementasi dan tes Tugas 1. |
| Dokumentasi developer tentang bearer token lama | Belum | `tests/Feature/ConversationTest.php:380` membuat token sebelum memblokir akun di `:388–389` dan memeriksa respons guard 422 di `:401–403`. Riwayat commit branch dan laporan di vault yang ditemukan tidak memuat catatan developer tersebut. Bukti perilakunya berasal dari tes. |

## Perilaku yang diperiksa

- `app/Models/Conversation.php:72` menutup pengiriman untuk kedua peserta saat claim `rejected` atau `withdrawn`. Chat `pending`, `accepted`, `returned`, dan tanpa claim terbuka bagi pengirim aktif. Flag blokir lawan bicara tidak diperiksa oleh guard pengiriman.
- `app/Http/Controllers/ConversationController.php:291` menjalankan guard setelah pemeriksaan partisipan dan validasi isi. Penolakan berisi `message` statis berbahasa Indonesia dan `reason` pada HTTP 422. Guard ada sebelum insert (`:304`), broadcast (`:321`), dan push (`:326`).
- POST dan GET percakapan menghitung `can_send` dan `readonly_reason` dari peminta di `app/Http/Controllers/ConversationController.php:129` dan `:163`. Kedua field itu merupakan seluruh penambahan payload. Diff mempertahankan bentuk resource pengguna, payload event, sort `updated_at DESC`, filter arsip, dan perhitungan `unread_count`.
- `tests/Feature/ConversationTest.php:502` mencakup riwayat pesan, mark-read, archive, unarchive, dan hapus untuk saya pada claim `rejected`.

## Baseline vs branch

PostgreSQL sementara berjalan di loopback. Konfigurasi uji diberikan melalui environment proses dengan `APP_URL=http://localhost`. Dependensi disalin dari checkout lokal. File `.env` tidak ditulis atau disalin. Pint dijalankan dalam mode `--test` pada keempat file yang sama. Pemanggilan awal suite baseline dengan `--no-interaction` ditolak oleh runner PHPUnit. Baseline diulang dengan `--compact`, opsi yang juga dipakai pada branch.

| Pemeriksaan | Baseline `develop` (`da0c104`) | Branch review (`5965502`) |
| --- | --- | --- |
| `php artisan test --compact` | 404 lulus, 0 gagal, 1.768 assertion | 412 lulus, 0 gagal, 1.879 assertion |
| `php vendor/bin/pint --test <empat file>` | Lulus | Lulus |
| Query GET daftar untuk 2 dan 10 chat tanpa claim/konteks | 4 dan 4 pada uji tambahan review GPT-261114-03 untuk hash baseline yang sama | 4 dan 4, tes branch lulus |
| Query GET daftar untuk 2 dan 10 chat dengan claim dan laporan | 7 dan 7 pada uji tambahan review GPT-261114-03 untuk hash baseline yang sama | 7 dan 7, tes branch lulus |

## Uji mutasi

| Mutasi | Tes yang dijalankan | Hasil |
| --- | --- | --- |
| (a) Hapus guard `sendMessage` | Lima status dan bearer akun terblokir | **2 gagal.** Tes status menerima 201 saat mengharapkan 422. Tes bearer mendeteksi `MessageSent` yang semestinya tidak ter-dispatch. PHPUnit juga menandai satu tes risky pada mutasi ini. |
| (b) Masukkan `returned` ke status tertutup | Lima status | **1 gagal.** Pengiriman pada `returned` menerima 422 saat mengharapkan 201. |
| (c) Pindahkan guard setelah insert | Penolakan tanpa efek samping untuk `claim_closed` dan `user_blocked` | **2 gagal.** Kedua tes menemukan baris pesan untuk permintaan yang ditolak. |
| (d) Pakai lawan bicara untuk `can_send` | Tes arah peserta, dengan GET dan POST percakapan dimutasi dalam dua percobaan terpisah | **1 gagal pada tiap percobaan.** `can_send` terlihat `true` untuk viewer terblokir. Kegagalan ada di `tests/Feature/ConversationTest.php:431` (GET) dan `:436` (POST). |
| (e) Tambahkan `messages()->count()` per baris di index | Kedua tes jumlah query | **2 gagal.** Untuk 2 chat, tes tanpa claim mencatat 6 query, ekspektasi 4. Tes dengan claim mencatat 9 query, ekspektasi 7. Keduanya berhenti pada assertion pertama. |
| (f) Pindahkan guard setelah broadcast sebelum push, lalu uji urutan kebalikannya | Penolakan tanpa efek samping untuk kedua reason, pada masing-masing percobaan | **Broadcast dulu:** 2 gagal pada `assertNotDispatched`. **Push dulu:** 2 gagal pada pemeriksaan baris pesan dan keduanya ditandai risky. Uji isolasi yang hanya memanggil `send` sebelum guard, sambil mempertahankan guard sebelum insert dan broadcast, menghasilkan **2 error Mockery** karena `send` dipanggil saat ekspektasinya nol. Kedua alasan penolakan terdeteksi. |

Tes terarah sebelum mutasi lulus (7 tes, 103 assertion). Setiap percobaan lulus `php -l` sebelum pengujian, dipulihkan dengan `git restore -- <file>`, dan diikuti `git status --porcelain` kosong. Checkout utama tetap membawa perubahan `README.md` yang sudah ada. Tidak ada commit, push, merge, rebase, reset, atau branch fitur baru.

Salinan review berakhir bersih pada detached HEAD `5965502a7b`. PostgreSQL sementara sudah dihentikan.

## Temuan baru

- **Blocker / mayor.** Tidak ada temuan baru.
- **Minor — jejak dokumentasi developer belum terverifikasi** (`tests/Feature/ConversationTest.php:388`). Tes bearer membuktikan bahwa token yang dibuat sebelum pemblokiran tetap mencapai guard. Pesan commit dan vault yang diperiksa belum memuat pernyataan developer tersebut, dan daftar PR origin Gitea yang dapat diakses tidak menampilkan branch review. Catat hasil ini di deskripsi PR atau laporan developer.

## Syarat merge yang tersisa

1. Daniel menjalankan uji manual dua akun lewat Postman pada backend yang menjalankan revisi `5965502a7b`. Untuk claim `rejected` dan `withdrawn`, coba kirim dari kedua akun dan periksa 422 `claim_closed`. Verifikasi riwayat, mark-read, archive, unarchive, dan hapus untuk saya. Uji pengiriman pada `returned` dan chat tanpa claim.
2. Pada chat terbuka, login kedua akun lalu blokir satu akun. Dengan token awal, periksa GET dan POST percakapan serta POST pesan dari kedua akun. Akun terblokir harus mendapat `false / user_blocked` dan 422. Akun aktif harus mendapat `true / null` dan 201 saat mengirim ke akun terblokir.
3. Uji Postman, Pusher dan FCM live, serta deployment masih belum diverifikasi.
