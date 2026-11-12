---
type: report
task: GPT-261110-03
from: flutter
outcome: succeeded
branch: feature/ui/edit-profile-whatsapp
commits:
  - '8976c0f6efd8b41f43f1d485cc680f29881d6dca test(auth): assert new-account visibility in stale toggle tests'
updated: 2026-11-10
summary: 'APPROVE. Kedua temuan Revisi 2 tertutup dan semua mutasi memicu kegagalan assertion yang ditargetkan.'
---

# Review Revisi 3 Tugas B · WhatsApp Edit Profil dan Pengaturan

**Verdict — APPROVE**

## Berubah

- `pwd` menunjukkan `D:\ObsidianVault\PBL`. Review dilakukan pada worktree sementara di luar repo dengan detached HEAD. Setelah `git fetch origin`, log `6a90d1dc7a..origin/feature/ui/edit-profile-whatsapp` berisi tepat satu commit dari TsaqifSatria sesuai metadata.
- Diff revisi menambah **60 baris di satu file**, `test/wa_visibility_persist_test.dart`. Diff `lib/` kosong. Tes lama tetap ada tanpa penghapusan assertion atau penambahan skip. Tes 422 lewat tombol Simpan tetap dipertahankan.
- Merge-base dengan `origin/develop` adalah `2513c0804c6a0ec5e505a1562210032f5d053c1e`. Diff seluruh branch mencakup lima file relevan di API client, AuthProvider, Edit Profil, Pengaturan, dan tes. Diff revisi dan daftar file seluruh branch tidak memuat file tooling atau kredensial. Commit yang direview tidak berada dalam riwayat `origin/develop` maupun `origin/main` setelah fetch.

## Temuan / open items

- **Blocker** — Tidak ada.
- **Mayor** — Tidak ada.
- **Minor** — Tidak ada.

### Penutupan temuan GPT-261110-01

- **Mayor tertutup.** `test/wa_visibility_persist_test.dart:443–476` memulai `u1` dengan `false`, menekan switch untuk meminta `true`, lalu login sebagai `u2` yang bernilai `false` sebelum menyelesaikan respons sukses lama. Assertion tetap memeriksa ID `u2` di sesi, provider, dan cache. Assertion baru memastikan visibilitas provider dan cache tetap `false` serta snackbar sukses tidak muncul. Mutasi A membuktikan respons lama bisa menimpa nilai provider meski ID masih `u2`.
- **Minor tertutup.** `test/wa_visibility_persist_test.dart:551–590` memakai `tester.tap` pada `SwitchListTile` produksi dan menunggu adapter HTTP palsu menerima request sebelum login ke `u2` lewat `AuthProvider.googleLogin`. Penulisan langsung ke provider dan cache digunakan untuk seed `u1`. `Completer` menahan respons 422 sampai sesi baru terbentuk. Switch awal `u1` bernilai `true`, switch sesaat sebelum respons bernilai `false`, dan rollback yang salah akan mengembalikannya ke `true`. Tes memeriksa bahwa switch tetap `false`, snackbar tidak muncul, dan ID serta visibilitas provider dan cache tetap sesuai `u2`.

## Verifikasi

| Pemeriksaan | Hasil aktual |
|---|---|
| `flutter analyze` | 4 warning, 2 info, 0 error, exit 1. Selisih 0 dari Revisi 2. |
| `flutter test --reporter expanded` | **259 lulus, 4 dilewati, 0 gagal**, exit 0. Tambahan satu kelulusan berasal dari tes 422 lewat toggle. |
| `git diff --check` | Exit 0 untuk rentang revisi, diff tiga titik terhadap `origin/develop`, dan working tree. |
| `git status --short --branch` | Worktree bersih dengan detached HEAD sebelum mutasi dan setelah seluruh restorasi. |

Empat warning berasal dari `test/api_client_mine_test.dart:21,31,42` dan `test/google_sign_in_error_test.dart:26`. Dua info berasal dari `test/home_screen_test.dart:27,28`.

### Bukti mutasi

Setiap percobaan menjalankan satu tes yang dipilih berdasarkan nama. File produksi yang dimutasi dikembalikan dengan `git checkout -- <file>` setelah masing-masing percobaan.

| Mutasi | Hasil aktual |
|---|---|
| A. Kembalikan hanya `lib/screens/profil/edit_profile_screen.dart` ke `d71d5629aa` | **0 lulus, 1 gagal**, exit 1. Pada tes switch Edit Profil setelah ganti akun, provider berisi `true` padahal diharapkan `false` (`test/wa_visibility_persist_test.dart:468`). |
| B. Hilangkan pemeriksaan sesi pada blok `catch` toggle Edit Profil, dengan pemeriksaan `mounted` tetap aktif | **0 lulus, 1 gagal**, exit 1. Tes 422 menemukan satu snackbar (`:582`). |
| B tambahan. Izinkan rollback tetapi pertahankan pemeriksaan sesi khusus pada snackbar | **0 lulus, 1 gagal**, exit 1. Assertion snackbar lolos, lalu assertion switch menemukan `true` padahal diharapkan `false` (`:583`). |
| C. Kembalikan hanya `lib/screens/profil/settings_screen.dart` ke `d71d5629aa` | **0 lulus, 1 gagal**, exit 1. Tes Pengaturan yang sudah ada mendeteksi provider berubah menjadi `true` setelah login ulang dengan ID yang sama (`:507`). |

### Status akhir

Worktree sementara sudah dihapus. Checkout utama tetap di `develop` pada `abc2a79` dengan perubahan lokal `README.md` yang sudah ada. Laporan ini adalah satu-satunya artefak yang ditulis permanen. Tidak ada branch baru, commit, push, PR, merge, atau deploy.

### Tidak terverifikasi

Google Sign-In native, perilaku perangkat nyata, respons server live, dan secure storage native tidak terverifikasi. Tes yang ditinjau menggunakan adapter HTTP dan penyimpanan palsu.

## Butuh keputusan user

Tidak ada.

