---
type: report
task: GPT-261107-06
from: backend
outcome: succeeded
branch: feat/profile/whatsapp
commits: '96d8b38521 feat(profile): allow WhatsApp number updates'
updated: 2026-11-07
summary: Review selesai dengan vonis BELUM SIAP karena kontrak API, privasi nomor, validasi, dan aturan visibilitas.
---

# GPT-261107-06 · Review WhatsApp backend

**Vonis: BELUM SIAP.**

- **Berubah** — laporan ini. Review dimulai di `C:\Project\lostfound-backend`, branch `fix/chat/unread-count-n-plus-one` dengan perubahan lokal `README.md` milik pengguna. Fetch memperbarui referensi remote.
- **Commit yang direview** — `96d8b38521dbcdbef6771e06af958cf45424efcf`, TsaqifSatria, `feat(profile): allow WhatsApp number updates`. Satu commit unik di atas merge-base `afd5cd2d3f51d426c420e7e2935ca9b5e847bd2c`. Dibanding `origin/develop` di `a66a4b693c3e7c9ba1b4a932674fb79d292e76bf`, branch tertinggal 22 commit dan unggul 1 commit.
- **Rujukan** — [[Nomor WhatsApp Pengguna - Lost&Found]], [[TechnicalReference]] §16–17 dan `AGENTS.md` backend. Plan Oktober masih berisi usulan yang berbeda tentang penggabungan toggle, keunikan, dan tampilan di laporan. Review mengikuti keputusan 7 November dalam permintaan tugas. Tangkapan layar menjadi rujukan identitas commit.
- **Butuh keputusan user** — tidak ada.

## Temuan dan perbaikan

1. **Blocker · Nomor yang baru diisi dapat terbaca lewat jalur lama.** List/detail laporan memuat dan menyerialisasi `reporter`, sedangkan respons claim memuat model `claimant` dan beberapa jalur juga memuat `transferredBy`. Nomor dapat ikut terkirim saat visibilitas mati atau sebelum claim diterima. Endpoint baru sendiri mengembalikan profil pemanggil. Dampaknya berasal dari nomor yang kini bisa diisi sendiri lalu terbaca melalui serialisasi lama. Gabungkan GPT-261107-05 terlebih dahulu dan uji respons laporan, pencarian, serta claim dengan dua akun. Pengungkapan ke lawan claim setelah `accepted` dan hanya bila `wa_visible` aktif tetap menjadi tugas tersendiri.
2. **Blocker · Rute berbeda dari kontrak.** Pindahkan handler ke `PUT /api/users/me` di grup Sanctum. Pertahankan rute visibilitas tersendiri dan tambahkan tes yang memanggil URI yang disepakati.
3. **Mayor · Validasi menerima nomor asing dan menolak titik.** Validasi sintaks input, normalisasi awalan `08`, `+628`, dan `628`, lalu validasi prefiks seluler Indonesia dan panjang hasil normalisasi. Sertakan spasi, strip, titik, dan kurung dalam format yang diterima serta pesan 422 berbahasa Indonesia tanpa menyisipkan input mentah.
4. **Mayor · Status visibilitas bisa aktif tanpa nomor.** Simpan `whatsapp=null` dan `wa_visible=false` dalam satu pembaruan. Tolak aktivasi visibilitas dengan 422 saat nomor kosong. Serialisasikan kedua jalur tulis pada baris pengguna yang sama atau gunakan pembaruan bersyarat agar permintaan bersamaan tetap menjaga aturan ini.
5. **Mayor · Payload yang tidak membawa `whatsapp` dapat menghapus nomor.** Gunakan `present|nullable` agar hanya pengosongan eksplisit yang menghapus nomor. Tambahkan tes payload kosong dan payload berisi field profil lain saja.
6. **Mayor · Tes regresi fitur belum ada.** Tambahkan tes untuk variasi format, 422 dan pesan Indonesia, nilai kosong dan efeknya ke visibilitas, payload ekstra, 401, kecocokan respons GET/PUT, serta nomor yang boleh dipakai oleh dua akun.
7. **Minor · Konvensi dan jalur admin.** Nama branch memakai `feat/profile/...` alih-alih pola `feature/api/...`. Handler baru tidak mendeklarasikan tipe respons sesuai pedoman PHP di `AGENTS.md`. Form admin sudah dapat menyimpan nomor tanpa normalisasi. Temuan Filament dicatat untuk konteks.

## Checklist

Nomor baris merujuk ke `96d8b38` kecuali bila disebutkan lain.

| Butir | Status | Bukti |
| --- | --- | --- |
| a. Rute, Sanctum, dan field yang boleh ditulis | **TIDAK SESUAI** | `routes/api.php:30–35` menempatkan `PUT /users/me/whatsapp` di dalam `auth:sanctum`. `AuthController.php:107–124` hanya menulis `whatsapp` ke user dari request. `User.php:16` memang mengizinkan mass assignment untuk `name`, `email`, `nim`, `role`, `blocked`, dan `wa_visible`, tetapi payload tidak diteruskan ke model. |
| b. Normalisasi dan 422 | **TIDAK SESUAI** | `AuthController.php:109–118` memakai `nullable`, `string`, `max:30` dan regex yang mengizinkan 8–15 digit ASCII sebelum normalisasi, dengan `+`, kurung, strip, dan whitespace di posisi bebas. Titik, huruf, dan tipe angka JSON ditolak. Semua non-digit dibuang dan satu awalan `0` diganti `62`. `08…`, `+62…`, dan `62…` dapat menghasilkan bentuk yang sama, tetapi nomor asing atau angka tanpa prefiks Indonesia lolos. Input 15 digit berawalan `0` dapat menjadi 16 digit. Tidak ada pesan kustom, locale/fallback bawaan `en` di `config/app.php:81–83`. |
| c. Pengosongan nomor | **SESUAI** | `AuthController.php:109–122` menyimpan `null` untuk input `null` atau string kosong yang dikonversi middleware Laravel. Ekspresi `?? null` juga menghapus nomor bila field absen. |
| d. Aturan `wa_visible` | **TIDAK SESUAI** | `AuthController.php:96–104` hanya memvalidasi boolean lalu menyimpan nilainya tanpa mengecek nomor. Baris 121–122 hanya menyimpan nomor ketika dihapus. |
| e. Respons profil sendiri | **SESUAI** | `AuthController.php:80–82,121–124` menyerialisasi user pemanggil pada GET dan PUT. `User.php:22` menyembunyikan `password`, `fcm_token`, `remember_token`, dan `email_verified_at`. |
| f. Skema, keunikan, dan enkripsi | **SESUAI** | `database/migrations/0001_01_01_000000_create_users_table.php:24–25` mendefinisikan string nullable dan boolean default false. Tidak ada unique index/aturan `unique` WhatsApp, migration baru, atau cast baru pada diff. |
| g. Logging dan pesan error | **SESUAI** | `AuthController.php:107–124` tidak menambah logging dan tidak menyisipkan input ke pesan validasi. Kesimpulan mencakup kode fitur dan respons validasi normal. |
| h. Cakupan diff | **SESUAI** | Hanya `app/Http/Controllers/AuthController.php` (+20, baris 107–126) dan `routes/api.php` (+1, baris 35). Composer, Filament, dan controller laporan/claim tidak diubah oleh commit ini. |
| i. Cakupan tes fitur | **TIDAK ADA** | Diff tidak memuat tes. Pencarian WhatsApp dalam `tests/` menemukan tes privasi chat di `tests/Feature/ConversationTest.php:448–480`, tanpa tes rute baru untuk variasi format, invalid, kosong, auto-reset visibilitas, payload ekstra, atau 401. Hasil suite dicatat di bawah. |
| j. Konvensi dan format | **TIDAK SESUAI** | Pint lulus untuk dua file yang diubah dan `git diff --check` bersih. Pesan commit mengikuti pola `feat(profile): …`. Nama branch menyimpang dari konvensi dan `AuthController.php:107` tidak mendeklarasikan tipe hasil. |
| k. Privasi dan integrasi GPT-261107-05 | **TIDAK SESUAI** untuk privasi pada snapshot ini. **TIDAK DIKETAHUI** untuk konflik dengan branch perbaikan | `User.php:22` tidak menyembunyikan nomor. `LostReportController.php:13,35,95–97` dan `FoundReportController.php:13,35,95–97` menyerialisasi pelapor. `ClaimController.php:28–42,136–144,165` menyerialisasi relasi user. `SearchController.php:19,27,35` pada `develop` juga memuat pelapor. |
| l. Konsistensi Filament | **TIDAK SESUAI** | `app/Filament/Resources/UserResource.php:46–51` menyediakan input teks nullable tanpa normalisasi dan toggle tersendiri. `User.php:16,35–40` mengizinkan pengisian kedua field tanpa cast normalisasi WhatsApp. |

## Urutan merge

1. Gabungkan GPT-261107-05 lebih dahulu dan pastikan regresi privasi mencakup jalur baca yang relevan. Branch `fix/api/hide-user-contact-fields` tidak ditemukan di referensi lokal maupun hasil `git ls-remote --heads origin` untuk nama tersebut, sehingga diff-nya belum dapat dibandingkan langsung.
2. Setelah itu integrasikan perbaikan WhatsApp di atas `develop` terbaru. Periksa `AuthController.php` dan `routes/api.php` karena keduanya juga berubah di `develop` untuk FCM, serta `User.php` karena perubahan serialisasi di pekerjaan privasi bisa memengaruhi GET/PUT profil sendiri. `User.php` tidak disentuh commit WhatsApp. Simulasi tiga arah read-only terhadap `a66a4b6` memperlihatkan perubahan pada dua file bersama tanpa penanda konflik. Cek ulang pada basis sesudah GPT-261107-05.
3. Jalankan tes fitur dan suite penuh pada hasil integrasi sebelum merge, termasuk regresi FCM dan privasi. Pertahankan akses nomor milik sendiri pada GET/PUT profil saat menyaring relasi user untuk pihak lain.

## Verifikasi

- Pint pada dua file perubahan lulus. `git diff --check origin/develop...origin/feat/profile/whatsapp` bersih.
- `php artisan route:list --path=api/users/me -v` mengonfirmasi rute `PUT /api/users/me/whatsapp` memakai Sanctum dan `PUT /api/users/me` tidak terdaftar.
- `php artisan test --compact` dijalankan pada PostgreSQL lokal sementara, database `lostfound_testing`, dengan `APP_URL=http://localhost` dan dependensi dari lockfile yang sama. Percobaan awal dengan opsi `--no-interaction` berhenti sebelum tes karena opsi diteruskan ke PHPUnit. Angka di sini berasal dari pengulangan dengan opsi yang didukung.
- `origin/develop` `a66a4b6`: **365 lulus, 0 gagal, 1.341 assertion**. Angka aktual sama dengan baseline 6 November.
- Branch WhatsApp `96d8b38`: **203 lulus, 51 gagal, 254 total**. Contoh kegagalan `ClaimAccessTest` dan `RelativePhotoUrlTest` menghasilkan 500 karena SDK Firebase pada snapshot lama tidak dapat menentukan project ID di lingkungan tes tanpa kredensial. `app/Services/ClaimTransferService.php:19` pada snapshot ini masih meminta `Messaging` di constructor. Pada `develop`, resolusi ada di jalur pengiriman `app/Services/PushNotificationService.php:30`. Hasil suite belum mengisolasi seluruh 51 kegagalan terhadap merge-base.
- Dua pengujian HTTP sementara di luar worktree **lulus (41 assertion)**. Ekspektasi mengikuti perilaku aktual untuk mereproduksi penyimpangan. Rute aktual tanpa token menghasilkan 401, sedangkan PUT ke URI yang disepakati menghasilkan 405. Pengujian juga mencakup format campuran, respons GET dan PUT, field tersembunyi, format yang ditolak, nomor asing yang diterima, penyimpanan null, dan visibilitas yang tetap aktif tanpa nomor. Payload berisi keenam field ekstra dikirim. Kesimpulan bahwa hanya WhatsApp dapat ditulis ditopang oleh daftar field eksplisit pada `AuthController.php:122`.
- Kedua worktree, pengujian HTTP sementara, dan cluster PostgreSQL sudah dihapus. Pemeriksaan akhir menunjukkan checkout utama tetap di `fix/chat/unread-count-n-plus-one` dengan `README.md` masih tercatat sebagai satu-satunya perubahan lokal.
