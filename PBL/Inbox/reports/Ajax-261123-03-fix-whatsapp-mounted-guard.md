---
type: report
task: Ajax-261123-03
from: flutter
outcome: succeeded
branch: test/claim/whatsapp-mounted-guard
commits:
  - '02fc358662e4bded5da5a7ddc1aedd12512711b9 fix(claim): isolate reload success mounted guard from network catch'
updated: 2026-11-23
summary: Tes dispose respons sukses mendeteksi penghapusan guard mounted pada jalur sukses _reloadClaim setelah penerapan respons dipisahkan dari catch jaringan.
---

## Berubah

- `lib/screens/claim/claim_detail_screen.dart` membatasi `try` ke `await _apiClient.getClaim(claim.id)`. Guard `mounted` dan versi permintaan (`_claimRequestVersion` pada tip aktual) serta `setState` sukses berjalan setelah `try/catch`. Jalur gagal tetap hanya membersihkan nomor WhatsApp bila layar masih mounted dan permintaan masih yang terbaru, lalu keluar. Kontrak API dan perilaku UI tetap sama.
- `test/claim_whatsapp_test.dart` mengassert `GET /claims/claim-wa` sudah masuk fake adapter dan respons masih tertahan saat State mounted. Tes mengganti widget, mengassert State telah dispose, melepas respons sukses, menunggu fake adapter menyelesaikannya, lalu memeriksa ketiadaan exception.

## Verifikasi

| Perintah | Exit | Hasil aktual |
| --- | ---: | --- |
| `flutter pub get` | 0 | Berhasil. Tidak ada perubahan terlacak pada `pubspec.yaml` atau `pubspec.lock`. |
| `flutter analyze --no-pub` sebelum edit, pada HEAD `d17637c4821ac44beedbde2097f0ee33015aabde` | 1 | 0 error, 4 warning, 2 info. |
| `flutter analyze --no-pub` setelah mutasi dipulihkan | 1 | Pesan, file, baris, kolom, dan kode diagnostik identik. 0 temuan baru, 0 temuan di `lib/` dan `test/claim_whatsapp_test.dart`. |
| `flutter test test/claim_whatsapp_test.dart --no-pub --reporter expanded` | 0 | 12 lulus, 0 gagal, 0 skip. |
| `flutter test --no-pub` | 0 | 273 lulus, 0 gagal, 4 skip. |
| `git diff --check` | 0 | Bersih setelah semua mutasi dipulihkan. |
| `git add lib/screens/claim/claim_detail_screen.dart test/claim_whatsapp_test.dart` | 0 | Status dan `git diff --staged` ditinjau sebelum commit. Hanya dua file tersebut masuk staging. |
| `git diff --staged --check` | 0 | Bersih. |

Empat warning lama berada di `test/api_client_mine_test.dart` pada 21:17 dan 31:17 (`dead_code`) serta 42:18 (`unnecessary_null_comparison`), dan `test/google_sign_in_error_test.dart` pada 26:27 (`unnecessary_null_comparison`). Dua info lama berada di `test/home_screen_test.dart` pada 27:6 dan 28:5 (`library_private_types_in_public_api`). Baseline aktual sama dengan prompt.

### Mutasi sebelum staging

Satu mutasi aktif per percobaan. Perintah untuk mutasi sempit persis `flutter test test/claim_whatsapp_test.dart --no-pub`. Enam mutasi lain menambahkan `--reporter expanded`. File produksi dipulihkan byte demi byte dari salinan sebelum setiap mutasi melalui `finally`. Hasil masing-masing berasal dari kegagalan tes yang teridentifikasi oleh Flutter. Diff siap staging hanya memuat dua file yang diizinkan.

| Mutasi sementara | Exit | Lulus/gagal/skip | Tes gagal dan sebab |
| --- | ---: | ---: | --- |
| Sempit — hapus hanya `!mounted` dari guard sukses `_reloadClaim`. Guard versi sukses, guard catch, dan kedua callback aksi tetap aktif. | 1 | 11/1/0 | `late successful claim refresh does not update a disposed screen` — Flutter test framework menangkap `setState() called after dispose()` dengan `_ClaimDetailScreenState` defunct. Stack menunjuk `_reloadClaim` di `claim_detail_screen.dart:93:5`. Tes dispose dengan respons GET gagal tetap lulus. |
| a — hapus pengecekan mounted dari kedua callback aksi serta jalur sukses dan catch `_reloadClaim`. | 1 | 10/2/0 | `late successful claim refresh does not update a disposed screen` dan `late failed claim refresh does not update a disposed screen` — keduanya `setState() called after dispose()`. |
| b — bypass perbandingan versi hanya di `_applyActionRefresh`. | 1 | 11/1/0 | `chat GET wins when older action GET completes last` — badge `Diterima` hilang setelah GET aksi lama diterapkan. |
| c — bypass perbandingan versi hanya di jalur sukses `_reloadClaim`, termasuk GET awal. | 1 | 10/2/0 | `accept refresh from ClaimActions updates WhatsApp button` — tombol WhatsApp hilang. `later action GET wins over an older chat GET completing last` — badge `Diterima` hilang. |
| d1 — bypass perbandingan versi di kedua callback aksi serta jalur sukses dan catch `_reloadClaim`, dengan guard mounted tetap aktif. | 1 | 9/3/0 | `accept refresh from ClaimActions updates WhatsApp button` — tombol WhatsApp hilang. `chat GET wins when older action GET completes last` dan `later action GET wins over an older chat GET completing last` — badge `Diterima` hilang pada keduanya. |
| d2 — catch `_reloadClaim` memakai `claim.counterpartWhatsapp` dari snapshot saat GET gagal. | 1 | 10/2/0 | `failed initial refresh hides number from a stale snapshot` dan `failed refresh after returning from chat hides stale number` — tombol WhatsApp muncul saat semestinya tersembunyi. |
| d3 — mutasi satu baris di `lib/services/whatsapp_service.dart`, dari `LaunchMode.externalApplication` menjadi `LaunchMode.platformDefault`. File service dipulihkan dan `git diff --exit-code -- lib/services/whatsapp_service.dart pubspec.yaml pubspec.lock` exit 0. | 1 | 11/1/0 | `WhatsApp URL uses normalized phone and encoded claim context` — launcher menerima `PreferredLaunchMode.platformDefault`, sedangkan assertion mengharapkan `PreferredLaunchMode.externalApplication`. |

## Git dan worktree

- `pwd` worker `C:/Users/ADVAN/orca/workspaces/lostfound-mobile/ajax-261123-03-claim-mounted`. Branch worker awal `Davinciz/ajax-261123-03-claim-mounted`, porcelain kosong. HEAD awal dan `origin/develop` sama-sama `d17637c4821ac44beedbde2097f0ee33015aabde` setelah fetch koordinator. Branch tugas dibuat dari hash tersebut. Branch default Orca masih mereferensikan base.
- Checkout utama `C:/Project/lostfound-mobile` pada awal dan akhir memiliki `git branch --show-current` kosong (detached HEAD `31a8a80feae0b6c8ba0d69d976a14ec92151861c`) serta `git status --porcelain=v1` kosong. Pemeriksaan baca-saja.
- Commit exit 0 dengan parent `d17637c4821ac44beedbde2097f0ee33015aabde`. `git push -u origin test/claim/whatsapp-mounted-guard` exit 0. `git ls-remote --exit-code --heads origin refs/heads/test/claim/whatsapp-mounted-guard` exit 0 dan mengembalikan tip `02fc358662e4bded5da5a7ddc1aedd12512711b9`, identik dengan HEAD lokal.
- Worktree worker mengarah ke `test/claim/whatsapp-mounted-guard` dan melacak upstream dengan porcelain kosong. Koordinator menghapus worktree dengan `orca worktree rm` (exit 0), lalu memverifikasi path dan registrasi Git sudah hilang serta branch tugas dan branch bawaan Orca masih ada. Checkout utama diverifikasi kembali, detached di hash yang sama dan bersih. Sebelum worktree dihapus, artefak Flutter yang di-ignore terdeteksi di `.dart_tool/`, `.flutter-plugins-dependencies`, `android/app/src/main/java/io/flutter/plugins/GeneratedPluginRegistrant.java`, `android/local.properties`, `build/`, `ios/Flutter/Generated.xcconfig`, `ios/Flutter/ephemeral/`, `ios/Flutter/flutter_export_environment.sh`, `ios/Runner/GeneratedPluginRegistrant.h`, dan `ios/Runner/GeneratedPluginRegistrant.m`.

## Temuan dan tindak lanjut

- Mayor 2 tertutup untuk skenario GET awal yang berhasil setelah layar dispose. Mayor 1 tetap terjaga oleh kegagalan assertion `Diterima` pada mutasi urutan respons.
- Verifikasi memakai fake HTTP dan fake launcher. Uji perangkat, pembukaan WhatsApp eksternal, build APK, server produksi, dan deploy berada di luar verifikasi ini. PR dan merge belum dilakukan.
- Butuh keputusan user — tidak ada untuk pekerjaan ini.
