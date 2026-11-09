---
type: report
task: GPT-261107-09
from: backend
outcome: succeeded
branch: feature/api/profile-whatsapp
commits: '731d19ab42 feat(profile): allow WhatsApp number updates | e200ec3c5c feat(api): validate WhatsApp profile updates'
updated: 2026-11-07
summary: Review ulang menemukan bahwa parameter URL dapat menghapus nomor meski body tidak memuat whatsapp.
---

# GPT-261107-09 · Review ulang WhatsApp backend

**Vonis · SIAP MERGE SETELAH PERBAIKAN KECIL.** Perbaiki validasi sumber input agar pengosongan nomor hanya terjadi jika body secara eksplisit memuat `whatsapp`. Kedua endpoint API sudah menutup kondisi balapan antara mengaktifkan visibilitas dan menghapus nomor.

- **Berubah** — laporan ini. Checkout awal `C:\Project\lostfound-backend` pada branch `fix/chat/unread-count-n-plus-one` dengan perubahan lokal `README.md`. Fetch memperbarui referensi remote.
- **Revisi** — `731d19ab4292befada8e6b6462484e6b81c58dce` (`feat(profile): allow WhatsApp number updates`) dan `e200ec3c5cb6587e48f0c74cd0abbe75d766b435` (`feat(api): validate WhatsApp profile updates`), keduanya oleh TsaqifSatria. Merge-base dan tip `origin/develop` sama, yaitu `c760ef238146f4e1d96a51a471dba5fb20182edb`. Branch tertinggal 0 dan unggul 2 commit. Pemeriksaan ancestry GPT-05 (`c760ef2`, #30) berhasil.
- **Rujukan** — [[GPT-261107-06-review-wa-backend]], [[Nomor WhatsApp Pengguna - Lost&Found]], dokumen arsitektur backend, dan `AGENTS.md`. Plan Oktober dan TechnicalReference §17 masih memuat usulan rute gabungan dan tampilan nomor di detail laporan. Security Hardening §2 juga memuat usulan enkripsi. Checklist mengikuti keputusan final pada permintaan review ini.
- **Butuh keputusan user** — tidak ada.

## Temuan menurut tingkat keparahan

1. **Mayor · Query string dapat menghapus nomor saat body tidak memuat `whatsapp`.** `PUT /api/users/me/whatsapp?whatsapp=` dengan body JSON kosong memenuhi `present`, menyimpan `null`, dan mematikan visibilitas. `$request->validate()` memakai `$request->all()`, yang menggabungkan body dengan query string. Validasi hanya data body JSON atau form, sesuai format yang didukung. Tambahkan regresi agar request tersebut menghasilkan 422 dan nomor serta visibilitas tetap tersimpan. Bukti: `AuthController.php:144–155,173–179`, `vendor/laravel/framework/src/Illuminate/Foundation/Providers/FoundationServiceProvider.php:150–151`, dan `vendor/laravel/framework/src/Illuminate/Http/Concerns/InteractsWithInput.php:87–91,113–117`.
2. **Minor · Respons tulis dan baca memakai bentuk profil berbeda.** PUT memakai delapan field yang semuanya cocok dengan bagian profil sendiri di GET. GET juga mengirim `created_at`, `updated_at`, `blocked`, dan `blocked_reason`. PUT toggle lama juga mengganti respons `{"message":"WhatsApp visibility updated"}` dengan objek profil. Pemanggil Flutter di `lib/api/api_client.dart:82–84` mengabaikan body. Pertahankan bentuk sukses toggle lama untuk kompatibilitas dan pakai bentuk profil yang disepakati secara konsisten pada PUT nomor dan GET, dengan tes struktur. Bukti: `AuthController.php:84–87,119–141,187–198`, `UserContactPrivacyTest.php:193–203`, dan `c760ef2:AuthController.php` pada handler toggle.
3. **Minor · Pesan validasi tipe toggle masih memakai bahasa bawaan.** Aktivasi tanpa nomor punya pesan Indonesia, sedangkan `required|boolean` untuk payload kosong atau tipe salah belum memiliki pesan Indonesia. Tambahkan pesan untuk kedua aturan jika kontrak bahasa berlaku pada seluruh 422 kedua endpoint. Bukti: `AuthController.php:119–132` dan `config/app.php:81–83`.
4. **Minor · Cakupan tes perlu menegaskan kontrak di batas input.** Perluas tes regresi untuk query string, tipe non-string, batas panjang, spasi saja, semua field ekstra, respons GET/PUT, dan toggle false tanpa nomor. Skenario tambahan diperiksa terpisah dalam review. Uji bersamaan dengan dua koneksi PostgreSQL dapat menjaga perilaku penguncian bila kedua handler berubah kelak.

Tidak ada blocker privasi GPT-05 pada revisi ini. Filament tetap menjadi catatan terpisah.

## Checklist

Nomor baris di bawah merujuk ke `e200ec3`. Nama file controller dan tes disingkat jika sudah disebut.

| Butir | Status | Bukti |
| --- | --- | --- |
| a. Rute, auth, throttle | **SESUAI** | `routes/api.php:30–36` mendaftarkan PUT WhatsApp dan PUT toggle di grup Sanctum bersama rute profil sejenis. Tidak ada throttle khusus pada rute profil. Daftar rute runtime mencantumkan grup `api` dan `auth:sanctum`. |
| b. Kehadiran kunci dan tipe | **TIDAK SESUAI** | `AuthController.php:144–155` memakai `present, nullable, string, max:50` dan regex. Body kosong tanpa query menghasilkan 422 dan mempertahankan nomor (`UserWhatsAppProfileTest.php:78–91`). Array, angka, boolean, dan string nonblank di atas 50 karakter ditolak. Query string mengisi kunci yang absen di body. |
| c. Normalisasi | **SESUAI** | `AuthController.php:147,155–169`. Menerima digit ASCII, plus, spasi regex, titik, strip, dan kurung. Menghapus spasi regex dan pemisah, membuang plus hanya pada awalan `+62`, serta mengganti nol awal hanya pada `08`. Hasil wajib cocok dengan `^628\d{8,11}$` dengan modifier `D`. Detail kasus di bawah. |
| d. Pesan 422 | **SESUAI** untuk WhatsApp, **TIDAK SESUAI** jika mencakup semua validasi toggle | `AuthController.php:149–152,166–168` memakai pesan Indonesia tetap tanpa input mentah. Aktivasi tanpa nomor juga memakai pesan Indonesia tetap (:129–132). Payload toggle kosong atau bertipe salah memakai pesan standar (:121–123). |
| e. Pengosongan atomik | **SESUAI** | `AuthController.php:173–182` menyimpan kedua field dengan satu `save()` dalam transaksi. Middleware trim dan konversi empty string berlaku, sehingga `null`, `""` dan spasi saja menyimpan null dan false. Tes null di `UserWhatsAppProfileTest.php:58–76`. |
| f. Aturan toggle | **SESUAI** | `AuthController.php:119–139` menolak true bila nomor `blank()`. False lolos dengan atau tanpa nomor. Kasus true tanpa nomor diuji pada `UserWhatsAppProfileTest.php:111–124`. |
| g. Persaingan dua request | **SESUAI** | `AuthController.php:124–139,172–182` mengunci baris `users` dengan primary key milik akun terautentikasi pada kedua transaksi. Analisis urutan di bawah. |
| h. Respons profil | **TIDAK SESUAI** untuk kesamaan struktur. **SESUAI** untuk privasi | `AuthController.php:84–87,124–141,172–198` mengembalikan data akun pemanggil saja. Daftar field eksplisit mengecualikan password, FCM token, remember token dan relasi. GET memakai model dengan hidden fields (`User.php:22`) dan struktur yang lebih luas (`UserContactPrivacyTest.php:193–203`). |
| i. Field ekstra | **SESUAI** | `AuthController.php:155,175–179` menetapkan field satu per satu. `name`, `email`, `nim`, `role`, `blocked`, dan `wa_visible` dari payload PUT nomor diabaikan. Toggle hanya mengambil `wa_visible` yang divalidasi (:121–135). |
| j. Tipe dan log | **SESUAI** | `AuthController.php:119,144,187` menggunakan tipe `JsonResponse`. Kedua closure transaksi memakai `User`. Handler baru tidak menulis log nomor (:119–198). |
| k. Cakupan diff | **SESUAI** | Hanya tiga file di daftar bawah. Skema tetap string nullable dan boolean default false (`database/migrations/0001_01_01_000000_create_users_table.php:24–25`). Tidak ada unique index, enkripsi, cast WhatsApp baru, perubahan Composer, atau perubahan Filament. |
| l. Tes | **TIDAK SESUAI** untuk cakupan lengkap | Sembilan tes fitur baru mencakup 401, nomor sama untuk dua akun, format campuran, nomor asing, payload absen tanpa query, nama ekstra, null dengan auto-reset, penolakan toggle true tanpa nomor, dan input invalid tanpa echo. Belum menguji seluruh variasi checklist. Hasil suite dan nama tes di bawah. |
| m. Konvensi | **SESUAI** | Nama branch memakai `feature/api/`. Commit pertama masih scope `profile`, bisa dirapikan saat squash. Hasil Pint di bawah. |
| n. Interaksi GPT-05 | **SESUAI** | GPT-05 sudah menjadi ancestor dan kedua commit fitur tidak mengubah penyaringan lima field pada relasi `reporter`, `claimant`, dan `transferred_by` (`Controller.php:13–23`, `UserContactPrivacyTest.php:30–190`). Kedua PUT profil memakai primary key akun dari request dan respons tanpa relasi (`AuthController.php:124–141,172–198`). Pengungkapan nomor ke lawan claim tetap pekerjaan terpisah. |
| o. Filament | **TIDAK SESUAI**, non-blocking | `app/Filament/Resources/UserResource.php:46–51` masih memiliki input teks nullable tanpa normalisasi dan toggle terpisah. Filament dapat menyimpan nomor dengan format lain dan berada di luar perlindungan dua handler API. |

### Kasus normalisasi

- `0812-3456-7890`, `+62 812 3456 7890`, `(0812) 3456.7890`, dan `6281234567890` menghasilkan `6281234567890`. `08123456789` menghasilkan `628123456789`.
- `+1…`, `+60…`, `062812…`, huruf, dan hasil yang terlalu pendek atau panjang menghasilkan 422. Nomor hasil normalisasi terdiri dari 11–14 digit. Input nonblank dibatasi 50 karakter setelah trim.
- `null`, string kosong, dan string berisi spasi saja mengosongkan nomor serta mematikan visibilitas. String yang berisi pemisah saja seperti `()-.` menghasilkan 422 setelah normalisasi.
- Middleware trim Laravel juga membuang karakter tepi tertentu seperti NUL dan karakter tak terlihat sebelum validasi. Jika kontrak input mentah harus membatasi pengosongan ke whitespace saja, kecualikan field dari trim bawaan dan tangani whitespace secara eksplisit. Rujukan: `TrimStrings.php:69`, `Str.php:1693–1699`, dan `ConvertEmptyStringsToNull.php:43` di framework terpasang.

### Urutan penguncian

Jika toggle memegang lock lebih dulu, nomor yang masih terisi memungkinkan visibilitas aktif. Request pengosongan menunggu, kemudian menyimpan nomor null dan visibilitas false bersama-sama. Jika pengosongan memegang lock lebih dulu, toggle menunggu lalu membaca baris yang sudah diperbarui dan mengembalikan 422 untuk true. Kedua urutan menjaga keadaan akhir database. Kesimpulan berasal dari inspeksi transaksi PostgreSQL dan tes perilaku sekuensial. `refresh()` di luar transaksi dapat menampilkan perubahan lain yang sudah ter-commit sebelum respons dikirim.

### File yang berubah dan tes baru

- `app/Http/Controllers/AuthController.php` (+77, −4)
- `routes/api.php` (+1)
- `tests/Feature/UserWhatsAppProfileTest.php` (+147)

Nama metode dalam `UserWhatsAppProfileTest.php`:

- Baris 13 · `test_mixed_indonesian_number_formats_are_normalized`
- Baris 34 · `test_invalid_number_is_rejected_without_echoing_the_input`
- Baris 48 · `test_foreign_number_is_rejected`
- Baris 58 · `test_null_clears_the_number_and_disables_visibility`
- Baris 78 · `test_payload_without_whatsapp_does_not_clear_the_number`
- Baris 93 · `test_extra_payload_fields_are_ignored`
- Baris 111 · `test_enabling_visibility_without_a_number_is_rejected`
- Baris 126 · `test_endpoint_requires_authentication`
- Baris 132 · `test_different_users_can_use_the_same_number`

## Verifikasi

- `php artisan test --compact` pada PostgreSQL sementara `lostfound_testing`, dengan `APP_URL=http://localhost` dan dependensi dari lockfile yang sama.
  - Branch WhatsApp `e200ec3` · **387 lulus, 0 gagal, 1.636 assertion**.
  - Baseline `origin/develop` `c760ef2` · **378 lulus, 0 gagal, 1.602 assertion**. Selisih 9 tes dan 34 assertion.
- `php artisan route:list --path=api -v` · kedua PUT profil terdaftar, dengan middleware `api` dan `auth:sanctum`.
- `php vendor/bin/pint --test` · lulus untuk ketiga file perubahan. `git diff --check` bersih.
- Tiga tes HTTP sementara di luar worktree · **3 lulus, 91 assertion**. Memeriksa format dan tipe, field tersembunyi, pesan validasi, pengosongan eksplisit, field ekstra, toggle false, serta pengosongan dari query string. Tes query mengunci ekspektasi pada perilaku aktual untuk mereproduksi temuan, yaitu 200 dan nomor terhapus. Percobaan awal pembanding field ekstra gagal karena instance factory belum membaca default DB untuk `role` dan `blocked`. Pengulangan memakai snapshot dari baris tersimpan dan lulus.
- Simulasi merge tidak diperlukan karena tip `develop` sudah menjadi ancestor. Percobaan awal `git merge-tree --write-tree` ditolak oleh izin tulis objek Git. Pemeriksaan ancestry yang read-only berhasil.
- Kedua worktree detached, tes HTTP sementara, dan cluster PostgreSQL telah dibersihkan. Pemeriksaan akhir menunjukkan checkout utama masih di `fix/chat/unread-count-n-plus-one` dengan satu perubahan lokal `README.md`.

