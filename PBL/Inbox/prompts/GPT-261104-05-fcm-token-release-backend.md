# GPT-261104-05 — Pelepasan token FCM di backend

Jalankan tugas ini di `C:\Project\lostfound-backend`.

## Tujuan dan pilihan desain

Implementasikan pelepasan token FCM saat logout. Prompt ini memilih endpoint baru `DELETE /api/users/me/fcm-token`, dengan penghapusan bersyarat berdasarkan token yang dikirim perangkat. Menjalankan prompt ini berarti memilih desain tersebut untuk tugas ini; ini merupakan usulan lanjutan PM, bukan keputusan user yang sudah tercatat di log lama.

Pertahankan Opsi A: FCM saja, tidak ada tabel/riwayat notifikasi, tetap skema sekarang. Route pengelolaan token ini bukan endpoint daftar notifikasi. Tidak ada migration, kolom, tabel, dependency, queue, atau perubahan payload keenam type.

## Baca dan periksa dahulu

1. Tampilkan working directory, branch, dan status; baca AGENTS.md serta aturan repo yang berlaku. Ikuti urutan pembacaan konteks yang diwajibkan repo. Jangan menampilkan kredensial atau isi `.env`.
2. Baca laporan vault berikut dan plan push yang relevan:
   - `D:\ObsidianVault\PBL\Inbox\reports\GPT-261104-02-push-claim-chat.md`
   - `D:\ObsidianVault\PBL\Inbox\reports\GPT-261104-04-push-hardening.md`
   - `D:\ObsidianVault\PBL\Plan\Push Notification - Lost&Found.md`
3. Periksa `AuthController::updateFcmToken`, route Sanctum, `FcmTokenOwnershipTest`, dan pola respons/test yang ada.
4. Saat prompt disusun, branch lokal `fix/notification/push-hardening` berada pada `5f98c8a`, dengan commit sebelumnya `bb001bd` dan `5731a7d`. Pemindahan token dari user lain sudah dibuat di sana. Periksa kondisi aktual; jangan mengimplementasikannya dua kali.
5. Buat branch `fix/notification/fcm-token-release`. Gunakan develop terbaru bila sudah memuat hardening. Jika belum, buat branch turunan dari `fix/notification/push-hardening` dan jelaskan bahwa PR ini bergantung pada branch itu. Jangan mengubah branch asal, cherry-pick berulang, reset, atau menimpa pekerjaan lain. Tidak push, PR, merge, atau deploy.

## Kontrak API yang harus diterapkan

- Method/path: `DELETE /api/users/me/fcm-token`, dilindungi `auth:sanctum` seperti PUT existing.
- Body JSON: `{ "fcm_token": "<token perangkat yang dilepas>" }`.
- Validasi: field wajib berupa string tidak kosong; gunakan pola validasi token existing. Missing/null/array/empty menghasilkan 422.
- Lakukan satu conditional update: hanya baris dengan `id` user terautentikasi DAN `fcm_token` sama dengan token request yang diubah menjadi null. Jangan mengambil user dari request body, jangan menghapus token semua user, dan jangan mengandalkan model snapshot lalu save tanpa kondisi token.
- Hasil sukses selalu 204 tanpa body: baik token cocok, sudah null, maupun berbeda. Operasi idempotent dan tidak mengungkap pemilik token.
- Tanpa autentikasi: 401, database tidak berubah.
- Jangan revoke Sanctum token atau mengubah kontrak logout/auth lainnya. Ini pelepasan FCM, bukan endpoint logout penuh.
- PUT tetap menerima token wajib non-null dan tetap mempertahankan pemindahan kepemilikan dari GPT-261104-04.

Alasan kondisi token: akun yang sama masih memiliki satu slot `users.fcm_token`. Logout dari perangkat lama tidak boleh mengosongkan token perangkat lain yang sudah menggantikan slot itu. Begitu pula request A yang terlambat tidak boleh menghapus token yang kini terdaftar pada B.

## Pengujian bermakna

Gunakan PHPUnit dan database test PostgreSQL yang terisolasi, bukan database produksi. Jangan mengganti database ke SQLite untuk menyembunyikan masalah. Tambahkan test yang membuktikan:

1. User A melepas token miliknya: 204, kolom menjadi null, user lain tidak berubah.
2. Request yang sama diulang dan token yang sudah null: tetap 204.
3. Request membawa token lama sementara A sudah menyimpan token baru: token baru tetap ada.
4. A mengirim token yang sekarang milik B: token B tidak berubah, respons tetap 204.
5. Tanpa autentikasi dan input invalid: 401/422 tanpa mutasi.
6. Integrasi transfer berurutan: A mendaftarkan T, B mendaftarkan T melalui PUT sehingga A dibersihkan, DELETE terlambat dari A tidak menghapus T pada B. DELETE B selanjutnya melepas T.
7. Sesudah pelepasan, jalur push existing tidak mencoba mengirim ke user dengan token null; gunakan mock Messaging, jangan FCM/perangkat nyata.

Jalankan test terfokus endpoint/ownership/push, formatter yang diwajibkan repo, lalu suite penuh `php artisan test` dan pemeriksaan diff. Catat hasil aktual. Test berurutan tidak membuktikan keunikan token di bawah request paralel; jangan mengklaim itu. Jika menemukan risiko konkurensi pada PUT existing, laporkan terpisah tanpa perubahan skema atau perluasan tugas.

## Batasan kegagalan lama

Laporan GPT-261104-04 mencatat suite 332 lulus / 1 gagal pada `ConversationArchiveTest::test_unread_count_filtered_by_deleted_at`: `visibleTo` mengecualikan percakapan yang deleted_at-nya terisi. Ini belum diputuskan PM/user. Reproduksi baseline seperlunya dan bandingkan hasil akhir; jangan mengubah semantik arsip, controller/model chat, menghapus/skip test, mengosongkan deleted_at, atau melonggarkan assertion agar suite terlihat hijau. Bila masih gagal, laporkan terpisah dari hasil endpoint baru dan jangan menyebut seluruh backend lolos atau siap merge. Jika DB test tidak tersedia, laporkan kendalanya secara jujur; jangan menyatakan test lulus.

## Hasil akhir

- Commit hanya file implementasi dan test yang relevan, dengan staging file spesifik; periksa status/diff sebelum commit. Jangan commit tooling, kredensial, atau laporan vault ke repo backend.
- Jangan edit `docs/` snapshot repo atau dokumen proyek lain dalam tugas ini.
- Tulis laporan `D:\ObsidianVault\PBL\Inbox\reports\GPT-261104-05-fcm-token-release-backend.md`, mencantumkan base/dependency branch, commit, kontrak request/response final, test aktual, kegagalan baseline, dan batasan satu token per user.
- Tegaskan bahwa Flutter belum memanggil endpoint sampai tugas berikutnya, perubahan belum berarti ter-deploy, dan FCM perangkat nyata belum diuji.
- Hasil endpoint dan laporan kontraknya harus tersedia untuk sesi Flutter GPT-261104-06. User yang melakukan push/PR/merge/deploy.
