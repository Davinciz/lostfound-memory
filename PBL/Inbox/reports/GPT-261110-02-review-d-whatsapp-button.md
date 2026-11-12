---
type: report
task: GPT-261110-02
from: flutter
outcome: succeeded
branch: feature/claim/whatsapp-contact-button
commits:
  - '30992758b484392992b907bd3e397234e1c29f20 feat(claim): show counterpart WhatsApp button in claim detail'
  - '0389a36ec7c0c9094b208e3ae6f76966b7d6e843 refactor(ui): remove WhatsApp button from report detail'
  - '8c33f971f70645dfa0cd88430db8d229fb6f6dc1 test(claim): cover counterpart WhatsApp button'
updated: 2026-11-10
summary: 'REQUEST CHANGES. Refresh gagal dapat mempertahankan nomor lama, respons aksi dan chat masih bisa bertabrakan, serta dua tes tetap lulus setelah proteksinya dicabut.'
---

# Review Tugas D · tombol WhatsApp di Detail Claim

**Verdict: REQUEST CHANGES.** Status `succeeded` pada metadata berarti review selesai.

## Berubah

- Laporan ini dibuat di vault. Review memakai dua worktree sementara dengan detached HEAD. Kode branch tidak disunting permanen. Tidak ada branch baru, commit, push, PR, atau deploy. Percobaan merge dibatalkan.
- Direktori awal `D:\ObsidianVault\PBL`. Repo utama `C:\Project\lostfound-mobile` berada di branch lokal `develop` dengan ` M README.md` yang sudah ada sebelum review.
- `git fetch origin` di worktree mengambil ref D dan B. Merge-base `origin/develop` dan D adalah `2513c0804c6a0ec5e505a1562210032f5d053c1e`, sama dengan tip `origin/develop` saat review. `git log --oneline origin/develop..origin/feature/claim/whatsapp-contact-button` berisi tepat tiga commit sesuai metadata di atas. Tip D hanya ditemukan di ref branch D, dan ketiga commit berada di luar riwayat `origin/develop` dan `origin/main`.
- `git diff --stat` dan diff tiga titik terhadap `origin/develop` menunjukkan 10 file, 537 penambahan, 90 penghapusan. File produksi hanya model Claim, Detail Claim, Detail Laporan, dan layanan WhatsApp. Enam file lain adalah tes dan adapter tes. Tidak ada perubahan tooling, kredensial, model User, Edit Profil, Pengaturan, AuthProvider, atau endpoint.

## Temuan / open items

### Blocker

Tidak ada.

### Mayor

1. **Refresh gagal masih menyisakan akses ke nomor yang tersimpan.** `lib/screens/claim/claim_detail_screen.dart:27`, `:44–53`, `:205`. Layar memakai objek awal untuk merender tombol dan mempertahankannya jika GET gagal. Ini aman untuk objek index tanpa nomor, tetapi chat dapat mengirim hasil GET terdahulu (`lib/screens/chat/chat_screen.dart:105,377`) dan notifikasi juga mengirim objek dari GET tunggal (`lib/services/notification_router.dart:108–109`). Setelah masuk dengan nomor dari cache chat, percobaan dengan GET gagal mempertahankan judul dan kode seperti diharapkan, tetapi tombol tetap ada (`test/claim_whatsapp_test.dart:115` gagal dengan satu tombol ditemukan). Mekanisme yang sama mempertahankan tombol jika refresh setelah kembali dari chat gagal, walaupun akses mungkin sudah dicabut di server. **Saran** — pertahankan data tampilan, pisahkan ketersediaan tombol dari snapshot lama, dan tampilkan lagi hanya setelah respons yang masih berlaku memberi nomor.
2. **GET dari aksi dapat menimpa GET yang lebih baru setelah kembali dari chat.** `lib/screens/claim/claim_detail_screen.dart:39–49,89,199,215` dan `lib/widgets/claim_actions.dart:32–41`. GET pembukaan dan GET setelah chat memakai versi sejak request dimulai. Callback aksi menaikkan versi saat hasil tiba dan langsung menerima hasilnya. Contoh dari alur kode: aksi menerapkan respons POST dan memulai GET follow-up, pengguna membuka lalu kembali dari chat, GET dari chat yang lebih baru mengembalikan null, lalu GET follow-up aksi yang lama tiba dengan nomor. Callback dapat menampilkan nomor lama kembali. Jika callback lama tiba saat GET dari chat masih menunggu, callback juga dapat membuat GET yang lebih baru diabaikan. **Saran** — pakai satu mekanisme pengurutan yang mencakup sumber aksi dan chat, serta uji respons yang selesai dalam urutan terbalik.
3. **Tes balapan tidak benar-benar menahan GET awal.** `test/claim_whatsapp_test.dart:119,135–139,158–165` dan `test/support/fake_http_client_adapter.dart:34–40`. Callback menyimpan handler lalu langsung kembali. Adapter melihat respons masih null dan melempar `StateError`. Resolusi berikutnya hanya mengubah handler yang sudah tidak dipakai. Tes asli tetap lulus 1/1 saat guard versi dihapus. **Saran** — tahan callback async dengan `Completer`, selesaikan GET lama setelah aksi, lalu pastikan mutasi guard membuat tes gagal.
4. **Tes launcher tidak mendeteksi hilangnya mode eksternal.** `test/claim_whatsapp_test.dart:168–180`, `:229–260` dan `lib/services/whatsapp_service.dart:15–18`. Mock method channel menangkap URL, tetapi tidak memeriksa mode. Mengganti `externalApplication` dengan `platformDefault` membuat tes URL tetap lulus 1/1. Implementasi saat ini memang memakai mode yang diminta. **Saran** — gunakan fake platform launcher yang menangkap opsi mode dan tegaskan mode eksternal.

### Minor

1. **Tes lama di luar WhatsApp Detail Laporan ikut diubah.** `test/claim_detail_null_test.dart:14,35,62`, `test/claim_user_actions_test.dart:47,154,204,287`, `test/models_test.dart:82`. Tidak ada tes lama yang dihapus. Dua tes Detail Claim dengan laporan null mendapat fake API dan `pumpAndSettle`. Keduanya kini berakhir pada payload GET identik dengan ID `refreshed` yang berbeda dari ID navigasi, sehingga assertion akhir tidak membedakan kedua fixture. Tes aksi menyesuaikan adapter, urutan GET pembuka → POST → GET, duplikasi tap, serta pemisahan GET index/detail pada tes kembali ke Claim Saya. Assertion kontrak aksi tetap ada. `models_test.dart` menambah grup parsing dan menghapus satu baris kosong di akhir. Tidak ditemukan tes lama khusus tombol WhatsApp Detail Laporan di base. Tes `report detail hides WhatsApp even when reporter shares number` adalah tes baru. **Saran** — gunakan respons yang sesuai dengan ID dan bentuk data tiap tes, serta periksa keadaan awal dan sesudah refresh untuk kedua variasi null.

## Verifikasi

| Perintah | `origin/develop` | D | Selisih |
|---|---:|---:|---:|
| `flutter analyze --no-pub` | 4 warning, 2 info, exit 1 | 4 warning, 2 info, exit 1 | 0 |
| `flutter test --no-pub --reporter expanded` | 247 lulus, 4 dilewati, 0 gagal | 256 lulus, 4 dilewati, 0 gagal | +9 lulus, 0 lainnya |

- Dependensi dipulihkan dengan `flutter pub get --offline`. Keenam temuan analyzer sama, yaitu tiga warning di `test/api_client_mine_test.dart:21,31,42`, satu warning di `test/google_sign_in_error_test.dart:26`, dan dua info di `test/home_screen_test.dart:27,28`. Tidak ada temuan di file yang diubah D.
- Tambahan sembilan tes berasal dari tujuh widget test WhatsApp Claim/launcher, satu tes parsing model, dan satu tes penghapusan tombol pada Detail Laporan. Empat tes dilewati tetap berasal dari `figcraft_layout_test.dart`.
- **Model.** `lib/models/claim.dart:103–108` memeriksa tipe sebelum cast dan regex `^628\d{8,11}$`. Kunci absen, null, kosong, non-string, atau string di luar pola menghasilkan null. `Claim.toJson()` tidak berubah.
- **Detail Claim.** `lib/screens/claim/my_claims_screen.dart:107` meneruskan objek index. `lib/screens/claim/claim_detail_screen.dart:34–53` memulai GET saat buka, memakai data awal selama menunggu, dan mengecek `mounted` sebelum menerapkan hasil. Tombol berada di dekat **Buka Chat** dan mengikuti field dari backend tanpa menghitung ulang status, peran atau visibilitas. Kegagalan GET pada objek index terbukti mempertahankan judul dan kode tanpa tombol. Pesan memakai judul dan kode laporan target jika tersedia (`:59–65,103–104`), sesuai kode barang yang ditampilkan di layar.
- **URL dan privasi.** `lib/services/whatsapp_service.dart:12–25` membentuk `https://wa.me/62...?text=<encoded>` dengan `Uri.encodeComponent` dan mempertahankan nomor apa adanya. Mode eksternal diverifikasi dari kode. Baik `false` maupun exception memunculkan snackbar generik dengan pemeriksaan `context.mounted`. Nomor tidak dimasukkan ke log atau snackbar oleh alur baru. Log respons Dio dinonaktifkan di `lib/api/api_client.dart:55–65`. Pencarian referensi hanya menemukan satu fungsi launcher yang dipakai. Placeholder dan dua pembuat tautan lama telah dihapus.
- **Detail Laporan dan navigasi.** `lib/screens/laporan/report_detail_screen.dart:303–306,449–490` menghapus tombol, handler, flag dan argumen khusus WhatsApp. Data `reporter` masih dipakai untuk identitas pelapor. Tes baru memeriksa **Chat** dan **Ajukan Claim** tetap tersedia. Model `User.whatsapp` dan `User.waVisible` tetap ada. Alur MyClaims dan notifikasi/deeplink tercakup suite. Alur chat ke Detail Claim dan refresh setelah kembali diperiksa dari kode. Tidak ditemukan perubahan pada caller, dengan catatan risiko snapshot lama di atas.
- **Git.** `git diff --check origin/develop...HEAD` dan `git diff --check` bersih. `git status --short --untracked-files=no` kosong di kedua worktree setelah restorasi. File tak terlacak hanya log verifikasi. Kedua worktree sementara sudah dihapus. Status repo utama tetap ` M README.md` dengan HEAD lokal `abc2a79`.

### Bukti mutasi wajib

Setiap mutasi dijalankan pada tes target di worktree dan file dikembalikan dengan `git checkout -- <file>` setelah percobaan. Keempat kegagalan di bawah berasal dari assertion.

| Mutasi | Hasil |
|---|---|
| a. Hilangkan GET pembuka di Detail Claim | **Gagal sesuai harapan** (exit 1, 0 lulus / 1 gagal). `index claim refresh adds WhatsApp when response has number` mengharapkan satu GET dan mendapat nol (`test/claim_whatsapp_test.dart:82`). |
| b. Hilangkan regex tetapi pertahankan pemeriksaan tipe | **Gagal sesuai harapan** (exit 1, 0 lulus / 1 gagal). Tes parsing mendapat string kosong alih-alih null (`test/models_test.dart:96`). |
| c. Tampilkan tombol tanpa cek null | **Gagal sesuai harapan** (exit 1, 0 lulus / 1 gagal). Tombol ditemukan saat respons accepted membawa null (`test/claim_whatsapp_test.dart:98`). |
| d. Hilangkan penanganan gagal launcher | **Gagal sesuai harapan** (exit 1, 0 lulus / 1 gagal). Snackbar hilang pada cabang `false` (`test/claim_whatsapp_test.dart:220`). Uji tambahan menghapus snackbar khusus cabang exception sambil mempertahankan cabang `false`, dan kembali gagal di assertion yang sama. |

Mutasi tambahan melepas guard versi GET dan mengganti mode launcher. Masing-masing menghasilkan **1 lulus, 0 gagal** pada tes target asli. Percobaan fixture dengan nomor dari objek detail dan refresh gagal menghasilkan **0 lulus, 1 gagal** karena tombol tetap tampil. Setelah fixture balapan ditahan dengan `Completer`, tes lulus 1/1 dengan guard dan gagal 0/1 tanpa guard pada assertion akhir. Tes penghapusan tombol Detail Laporan juga gagal 0/1 pada assertion `:48` saat empat file produksi dikembalikan sementara ke base, karena tombol lama ditemukan.

### Kompatibilitas dengan Tugas B

- Worktree kedua mulai dari tip D dan menjalankan `git merge --no-commit --no-ff origin/feature/ui/edit-profile-whatsapp` pada tip B `6a90d1dc7a093c82f3e18f056010e65b2189f9a4`. Merge otomatis berhasil (exit 0), tanpa file unmerged. Lima file B diterapkan, yaitu ApiClient, AuthProvider, Edit Profil, Pengaturan, dan tes persist visibilitas.
- `git merge --abort` berhasil (exit 0), dan status setelah abort kosong. Verifikasi gabungan sebatas kompatibilitas merge Git.

### Tidak terverifikasi

- Uji di perangkat nyata, pembukaan aplikasi WhatsApp secara native, dan perilaku end-to-end terhadap server live **tidak terverifikasi**. Sesuai brief, server live belum membawa Tugas C.
- Kontrak C dipakai sebagai acuan review klien. Respons server untuk semua aksi, index, dan admin, serta penyaringan akses backend tidak diuji ulang pada review ini.
- Balapan GET aksi versus GET setelah kembali dari chat dianalisis dari kode. Urutan lengkap lintas dua layar belum direproduksi sebagai tes.

## Butuh keputusan user

Tidak ada keputusan yang diperlukan untuk menutup review. Verdict meminta revisi temuan Mayor sebelum penggabungan.
