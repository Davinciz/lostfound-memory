---
type: report
task: GPT-261107-07
from: flutter
outcome: succeeded
branch: feat/profile/whatsapp
commits: 'bc8f2add8b feat(profile): allow WhatsApp number editing'
updated: 2026-11-07
summary: Review selesai dengan vonis BELUM SIAP karena rute API menyimpang, visibilitas dapat aktif tanpa nomor, dan UI belum mengikuti respons server.
---

# GPT-261107-07 · Review WhatsApp Flutter

**Vonis: BELUM SIAP.**

- **Berubah** — laporan ini. Review dimulai di `C:\Project\lostfound-mobile`, branch `develop`, dengan perubahan lokal `README.md`. Fetch memperbarui referensi remote.
- **Commit yang direview** — `bc8f2add8bd162b5e7ef2e2285f24fe39bd5de4f`, TsaqifSatria, `feat(profile): allow WhatsApp number editing`. Merge-base `6fe13308ee5651dd12957e9afc3b6ecd28ca3752`. Dibanding `origin/develop` di `2513c0804c6a0ec5e505a1562210032f5d053c1e`, branch tertinggal **7 commit** dan unggul **1 commit**. Commit yang tertinggal mencakup redesign profil/Pengaturan, panduan repo, dan perbaikan tes persistensi Pengaturan.
- **Rujukan** — [[Nomor WhatsApp Pengguna - Lost&Found]], [[TechnicalReference]] §11 dan §16, [[Design]] §5.18–5.19, `AGENTS.md` dari `origin/develop`, dan [[GPT-261107-06-review-wa-backend]]. `AGENTS.md` belum ada di snapshot branch review atau checkout lokal. Dokumen Oktober masih memuat usulan lama tentang lokasi toggle dan tampilan nomor di laporan. Review mengikuti keputusan 7 November.
- **Butuh keputusan user** — tidak ada.

## Temuan dan perbaikan

1. **Blocker · Rute Flutter dan backend menyimpang dari kontrak.** `lib/api/api_client.dart:133–138` mengirim PUT ke `/users/me/whatsapp`. Backend pasangan menyediakan rute yang sama, tetapi kontrak mengharuskan `PUT /api/users/me`. Uji backend GPT-261107-06 mengonfirmasi URI yang disepakati menghasilkan 405 pada snapshot tersebut. Selaraskan kedua sisi ke URI yang disepakati dan pertahankan rute visibilitas terpisah. Tambahkan tes yang memeriksa metode, URI, body, dan bentuk respons.
2. **Mayor · Kedua toggle bisa aktif tanpa nomor.** `edit_profile_screen.dart:155–157` dan `settings_screen.dart:123–126` hanya menjaga status loading/inisialisasi. Menghapus isi field tidak mematikan toggle. Backend pasangan juga menerima aktivasi tanpa nomor dan mempertahankan visibilitas saat nomor dihapus. Nonaktifkan toggle saat nomor tersimpan kosong atau draft nomor sedang dikosongkan, tampilkan kondisi mati sesuai status yang relevan, dan ambil nilai final dari respons backend setelah simpan. Pertahankan kedua toggle dan guard yang sama saat mengintegrasikan Pengaturan terbaru.
3. **Mayor · UI Edit Profil tidak memakai nilai server setelah simpan.** `edit_profile_screen.dart:31–38,53–60` mengisi controller dan `_waVisible` sekali. Respons tersimpan di cache dan Provider, tetapi controller tetap menampilkan input awal dan toggle tetap memakai nilai sebelumnya. Contohnya input `08…` tetap tampil setelah server mengembalikan `628…`. Jika backend sudah mematikan visibilitas saat pengosongan, layar yang terbuka masih dapat menampilkan toggle aktif. Perbarui controller dan visibilitas dari respons sukses dan sinkronkan kedua layar dengan user terkini di Provider.
4. **Mayor · Detail validasi 422 hilang.** `edit_profile_screen.dart:41–46,61–65` hanya menghitung digit untuk validasi lokal dan menampilkan pesan generik untuk semua kegagalan HTTP. Input dengan huruf tetap dapat dikirim bila hitungan digit lolos. Gunakan `apiErrorMessage(e)` dan pertahankan pesan Indonesia dari backend atau fallback Indonesia. Gunakan validasi lokal ringan yang selaras dengan format yang disepakati.
5. **Mayor · Tidak ada tes regresi penyimpanan nomor.** Tambahkan tes widget/API untuk sukses dengan nomor hasil normalisasi, 422, pengosongan dengan body null, status loading, dan kedua toggle saat nomor kosong. Tes persistensi lama hanya mencakup visibilitas.
6. **Minor · Konvensi dan teks.** Nama branch `feat/profile/...` menyimpang dari `feature/ui/...`. Tiga panggilan `setState` baru pada baris 49, 59, dan 63 memakai arrow assignment. Gunakan block body. Salinan lama di toggle masih menyebut detail laporan. Selaraskan teks privasi dengan aturan claim saat alur pengungkapan tersedia.

## Checklist

Nomor baris Flutter merujuk ke `bc8f2ad` kecuali bila disebutkan lain.

| Butir | Status | Bukti |
| --- | --- | --- |
| a. Edit Profil | **SESUAI** | `lib/screens/profil/edit_profile_screen.dart:41–65,119–147` memberi input yang bisa diedit, keyboard telepon, contoh `08…`, validasi ringan 8–15 digit, tombol simpan, indikator proses, penonaktifan input/tombol, dan pesan sukses/gagal. Nama, NIM, dan email memakai field read-only. |
| b. API dan 422 | **TIDAK SESUAI** | `edit_profile_screen.dart:49–65` memakai `context.read<ApiClient>()`, trim, dan mengirim null bila kosong. `lib/api/api_client.dart:133–138` mengirim hanya `whatsapp` tetapi memakai subrute tambahan. Catch tidak memakai `lib/utils/api_error.dart:4–31`, yang membaca `errors` lalu `message`. |
| c. Respons, cache, dan tampilan | **TIDAK SESUAI** | `api_client.dart:138,370–371` mem-parse respons langsung dan menyimpan user ke secure storage. `edit_profile_screen.dart:53–60` memperbarui cache serta `AuthProvider`, yang memberi notifikasi di `lib/screens/auth/auth_provider.dart:144–148`. Controller dan toggle hanya diisi pertama kali (`edit_profile_screen.dart:31–38`), sedangkan Pengaturan mengambil snapshot visibilitas (`settings_screen.dart:34–43`). Pengaturan menampilkan toggle, tanpa field nomor. |
| d. Toggle saat nomor kosong | **TIDAK SESUAI** | `edit_profile_screen.dart:125–135,155–157` tidak mengaitkan isi field ke switch. `settings_screen.dart:123–126` tidak mengecek nomor. `origin/develop` juga masih memakai guard loading saja pada `settings_screen.dart:156–161`. |
| e. Model User dan serialisasi | **SESUAI** | `lib/models/user.dart:9–10,33–34` menerima `whatsapp` null dan `wa_visible` bool/null dengan default false. `toJson()` menyertakan atribut profil pada baris 38–49 untuk cache (`api_client.dart:370–371`). Request pembaruan memakai map satu field (`api_client.dart:133–138`), sehingga nama/email/NIM/role tidak dikirim ke API. |
| f. Logging dan kredensial | **SESUAI** | Jalur baru di `api_client.dart:133–139` dan `edit_profile_screen.dart:41–65` tidak mencetak nomor atau menambahkan kredensial. Interceptor debug lama di `api_client.dart:55–65` menonaktifkan logging header dan body, dan tetap mengaktifkan logging error. |
| g. Dependensi dan konfigurasi | **SESUAI** | Diff tidak mengubah `pubspec.yaml`, `pubspec.lock`, URL host, `google-services.json`, atau `dart_defines.json`. String rute API adalah satu-satunya path request baru. |
| h. Cakupan perubahan | **SESUAI** | Dua file berubah, total +68/−8. `lib/api/api_client.dart` (+8, baris 133–140) dan `lib/screens/profil/edit_profile_screen.dart` (+60/−8, baris 8–174). Pengaturan, report detail, `WhatsAppService`, dan claim tidak disentuh. Tombol lama di `lib/screens/laporan/report_detail_screen.dart:129–136,177–180` bergantung pada nomor dan `waVisible`, tanpa syarat claim accepted. Pemindahan tombol adalah tugas terpisah. |
| i. Kontrak dengan backend pasangan | **TIDAK SESUAI** terhadap kontrak 7 November | Keduanya cocok pada rute aktual `/users/me/whatsapp`, field tunggal `whatsapp` bertipe string/null, dan objek user langsung, dengan `wa_visible` boolean. Bukti backend `96d8b38`: `routes/api.php:30–35`, `AuthController.php:107–124`, `User.php:39`. Backend tidak memberi reset visibilitas, menerima nomor asing, menolak titik, dan tidak menyediakan pesan WA khusus Indonesia. Klien mengabaikan detail 422. |
| j. Gaya dan null-safety | **TIDAK SESUAI** | `edit_profile_screen.dart:49,59,63` menambah arrow assignment di `setState`. Controller dibuang saat dispose (baris 25–29), akses nomor memakai fallback (baris 35–37), dan UI memakai `AppSnackBar`, `_ReadOnlyField`, serta tema yang sudah ada. `lib/main.dart:112`, `lib/utils/app_theme.dart:18–29,146–155`, dan `lib/utils/app_colors.dart:10–13` menautkan tema Plus Jakarta Sans dan palet yang disepakati. |
| k. Tes fitur penyimpanan | **TIDAK ADA** | Diff tidak mengubah `test/`. `test/wa_visibility_persist_test.dart:116–155` menguji persistensi toggle saat layar dibuka ulang. Tidak mencakup simpan nomor, 422, hapus nomor, atau guard saat kosong. Hasil suite dan analyzer dicatat di bawah. |

## Urutan integrasi

Gabungkan perbaikan privasi backend GPT-261107-05 dan selaraskan endpoint pasangan dengan kontrak sebelum mengaktifkan simpan nomor di Flutter. Integrasikan perubahan Flutter di atas `develop` terbaru dan pertahankan perbaikan Pengaturan dari `2513c08`. Simulasi tiga arah read-only terhadap `2513c08` tidak menampilkan penanda konflik. Verifikasi ulang hasil integrasi dengan tes klien dan backend sebelum merge.

## Verifikasi

- `git diff --check origin/develop...origin/feat/profile/whatsapp` bersih. Flutter **3.47.2**, Dart **3.13.2**.
- `flutter pub get` berhasil pada kedua snapshot. `flutter analyze --no-pub` dan `flutter test --no-pub --reporter expanded` dijalankan sesudahnya.

| Snapshot | `flutter analyze` | `flutter test` |
| --- | --- | --- |
| Branch WhatsApp `bc8f2ad` | **8 issue** (4 warning, 4 info), semuanya di file test | **247 lulus, 4 dilewati, 0 gagal** |
| `origin/develop` `2513c08` | **6 issue** (4 warning, 2 info), semuanya di file test | **247 lulus, 4 dilewati, 0 gagal** |

- Dua info tambahan berasal dari import lama `dart:typed_data` dan `package:flutter/foundation.dart` di `test/wa_visibility_persist_test.dart:2,5`. File itu tidak ada di diff fitur. Snapshot branch tertinggal perbaikan GPT-261107-03. Analyzer tidak melaporkan issue pada dua file perubahan dan hasil aktual `develop` sama dengan baseline yang dilaporkan.
- Suite yang hijau tidak mencakup alur simpan nomor baru atau integrasi end-to-end dengan backend pasangan.
- Pemeriksaan hanya dilakukan dengan kode dan pengujian lokal. Kamera dan layar ini belum diuji pada perangkat nyata.
- Kedua worktree dan log sementara sudah dihapus. Pemeriksaan akhir menunjukkan checkout utama tetap di `develop` dengan `README.md` masih tercatat sebagai satu-satunya perubahan lokal.
