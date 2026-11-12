---
type: report
task: GPT-261110-01
from: flutter
outcome: succeeded
branch: feature/ui/edit-profile-whatsapp
commits:
  - 'c7cc8eec2fcaaf0a2165916e5e6e2763356fe1cd fix(ui): skip WhatsApp toggle request during logout'
  - '6a90d1dc7a093c82f3e18f056010e65b2189f9a4 test(auth): cover stale WhatsApp updates through screens'
updated: 2026-11-10
summary: 'REQUEST CHANGES. Tes switch Edit Profil setelah ganti akun tetap lulus dengan handler lama yang mengubah visibilitas akun baru.'
---

# Review Revisi 2 Tugas B · WhatsApp Edit Profil dan Pengaturan

**Verdict: REQUEST CHANGES.** Status `succeeded` pada metadata berarti review selesai.

## Berubah

- Laporan ini adalah satu-satunya perubahan permanen. Review dilakukan pada worktree sementara di luar repo dengan detached HEAD. Semua percobaan dikembalikan. Tidak ada branch baru, commit, push, PR, merge, atau deploy.
- `pwd` menunjukkan `D:\ObsidianVault\PBL`. Checkout utama `C:\Project\lostfound-mobile` berada pada `develop` dengan ` M README.md` yang sudah ada sebelumnya. Fetch dilakukan dari worktree.
- `git log --oneline 75238a9bea..origin/feature/ui/edit-profile-whatsapp` berisi tepat dua commit sesuai metadata. `git diff --stat 75238a9bea..HEAD` menunjukkan dua file, 288 penambahan dan 91 penghapusan. Perubahan produksi Revisi 2 hanya satu guard pada `settings_screen.dart`. File lainnya `test/wa_visibility_persist_test.dart`.
- Merge-base dengan `origin/develop` adalah `2513c0804c6a0ec5e505a1562210032f5d053c1e`. Diff seluruh branch terhadap base berisi lima file relevan, tanpa file tooling atau kredensial. Kedua commit Revisi 2 berada di luar riwayat `origin/develop` dan `origin/main`. `auth_provider.dart`, Edit Profil, layout, dan endpoint tidak berubah pada rentang Revisi 2. Perubahan AuthProvider pada diff terhadap `develop` berasal dari revisi sebelumnya.

## Temuan / open items

### Blocker

Tidak ada.

### Mayor

1. **Tes switch Edit Profil saat ganti akun tidak mendeteksi perubahan visibilitas akun baru.** `test/wa_visibility_persist_test.dart:441–470`. Tes benar-benar menekan switch produksi, menunggu request lama, dan membuat `u2` lewat `googleLogin`. Setelah respons dilepas, assertion hanya memeriksa ID provider/cache dan kesamaan nilai switch sebelum/sesudah respons. Switch sudah berubah secara optimistis, sehingga handler lama tetap lolos walau menyalin akun baru dengan `waVisible: true` ke provider dan cache. Pada mutasi a, enam tes gagal tetapi skenario ini lulus. Percobaan tambahan menegaskan `waVisible == false` di provider/cache dan ketiadaan snackbar sukses. Tes yang diperketat lulus **1/1** pada Revisi 2 dan gagal **0/1** saat hanya Edit Profil dikembalikan ke `d71d5629aa`. Assertion pertama melihat visibilitas provider `true`, padahal sesi baru mulai `false`. **Saran** — tambahkan pemeriksaan visibilitas akun baru di provider dan cache, serta pastikan respons lama tidak memunculkan snackbar sukses.

### Minor

1. **Tes 422 tertunda membuktikan snackbar diblokir, tetapi assertion controller tidak menguji jalur rollback.** `test/wa_visibility_persist_test.dart:510–540`, `lib/screens/profil/edit_profile_screen.dart:74–79,114–120`. Handler simpan nomor tidak menulis ulang controller ketika gagal. Versi lama pun dapat menjaga teks sambil menampilkan snackbar. Mutasi a memang membuat assertion snackbar gagal. **Saran** — uji 422 tertunda lewat toggle, karena handler toggle punya jalur rollback nilai switch yang bisa dibedakan sebelum dan sesudah respons.

## Verifikasi

| Perintah | Hasil |
|---|---|
| `flutter analyze --no-pub` pada Revisi 2 | 4 warning, 2 info, exit 1, selisih 0 dari acuan |
| `flutter test --no-pub --reporter expanded` pada `75238a9bea` | 254 lulus, 4 dilewati, 0 gagal |
| `flutter test --no-pub --reporter expanded` pada `6a90d1dc7a` | 258 lulus, 4 dilewati, 0 gagal |
| `git diff --check` pada rentang revisi, diff tiga titik terhadap `develop`, dan working tree | Bersih |

- Empat warning berasal dari `test/api_client_mine_test.dart:21,31,42` dan `test/google_sign_in_error_test.dart:26`. Dua info berasal dari `test/home_screen_test.dart:27,28`. Tidak ada temuan baru di file yang direvisi.
- Selisih **+4 tes lulus** berasal dari penggantian tiga tes level API/guard dengan tujuh widget test. Tujuh tes mencakup logout saja saat simpan, akun berbeda saat toggle Edit Profil, login ulang ID sama saat toggle Pengaturan, 422 terlambat, penulisan cache tertahan ketika logout, penulisan cache tertahan ketika login, serta tap toggle saat logout. Empat skip tetap sama. Tes lama simpan sukses, 422 aktif, pengosongan nomor, toggle tanpa nomor, serta persist visibilitas tetap ada dengan assertion yang sama.
- Guard `settings_screen.dart:31–42` membaca revisi dan memeriksa `isSessionActive` sebelum perubahan switch dan sebelum request. Polanya sesuai dengan Edit Profil (`:83–95`). Mutasi e membuktikan guard itulah yang mencegah request saat logout berlangsung.
- Tes respons tertunda menekan kontrol produksi dengan `tester.tap` dan menunggu sinyal bahwa fake adapter menerima request sebelum memindahkan sesi. Sesi pengganti dibuat lewat `AuthProvider.googleLogin`. Data yang ditulis langsung ke provider/cache hanya seed sesi awal. Tes yang memakai ID sama mengawali `u1` dan login lagi sebagai `u1` tanpa logout sebelumnya, sehingga mutasi d mengisolasi kenaikan revisi saat login.
- Tes storage memasang latch pada channel mock `write` key `user` dan menunggu sinyal bahwa write sudah masuk sebelum memulai logout/login (`test/wa_visibility_persist_test.dart:26–55,547–607`). Kedua tes melepas write dan memeriksa keadaan akhir. Cache kosong setelah logout dan menyimpan `u2` beserta nomor dari respons login setelah ganti akun.

### Bukti mutasi

Setiap file percobaan dikembalikan dengan `git checkout -- <file>`. Mutasi menghasilkan kegagalan assertion, bukan kompilasi atau timeout.

| Mutasi | Hasil |
|---|---|
| a. Kembalikan Edit Profil dan Pengaturan ke `d71d5629aa` | **8 lulus, 6 gagal**, exit 1. Tes yang gagal adalah logout saat simpan, login ulang ID sama pada Pengaturan, 422 lama, masing-masing tes antrean logout/login, dan tap Pengaturan saat logout. **Tes switch Edit Profil saat ganti akun tetap lulus**, temuan Mayor. |
| b. Hilangkan guard sebelum tulis di `saveUserForSession` | **13 lulus, 1 gagal**, exit 1. Tes logout saat simpan menemukan user kembali di cache (`:436`). |
| c. Hilangkan penantian antrean pada login | **0 lulus, 1 gagal**, exit 1. Adapter menerima request login sebelum write lama dilepas (`:601`). |
| c. Hilangkan penantian antrean pada logout | **0 lulus, 1 gagal**, exit 1. Logout selesai sebelum write lama dilepas (`:564`). |
| d. Hilangkan kenaikan revisi di `googleLogin` | **0 lulus, 1 gagal**, exit 1. Respons lama mengubah visibilitas provider pada login ulang `u1` (`:501`). |
| e. Hilangkan guard sebelum request pada toggle Pengaturan | **0 lulus, 1 gagal**, exit 1. Satu request dikirim saat logout padahal target nol (`:628`). |

### Status akhir

- `git status --short --untracked-files=no` kosong setelah restorasi. File tak terlacak hanya log verifikasi. Worktree sementara sudah dihapus.
- Checkout utama tetap `develop` di `abc2a79` dengan ` M README.md`.

### Tidak terverifikasi

- Google Sign-In native, perangkat nyata, respons server live, dan perilaku penyimpanan aman native tidak diuji. Tes memakai fake HTTP dan fake storage.
- Cakupan 422 tertunda pada jalur rollback toggle belum terbukti oleh tes branch, sebagaimana temuan Minor.

## Butuh keputusan user

Tidak ada keputusan yang diperlukan untuk menutup review. Verdict meminta penguatan tes switch Edit Profil sebelum penggabungan.
