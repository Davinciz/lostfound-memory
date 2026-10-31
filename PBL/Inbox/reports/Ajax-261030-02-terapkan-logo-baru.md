---
type: report
task: Ajax-261030-02
from: flutter
outcome: succeeded
branch: feature/ui/brand-logo
commits: 2dd76ae feat(ui): terapkan logo baru di login dan header Beranda; fbce66e feat(ui): tambah launcher icon dan splash logo baru; 9ce39e4 fix(ui): pakai wordmark di header Beranda, hapus teks Campus L&F
updated: 2026-10-30
summary: Logo baru terpasang di login, header Beranda, launcher icon Android/iOS, dan splash terang
---
- Berubah: `pubspec.yaml` (+`assets/images/logo/`, dev-dep `flutter_launcher_icons ^0.14.3` + `flutter_native_splash ^2.4.6` beserta konfigurasi), `auth_screen.dart` (wordmark 260px ganti Icon search + Text judul), `home_screen.dart` (header: wordmark PNG 32px tinggi, teks `Campus L&F` dihapus), aset `lostfound-logo-simple.png` (130 KB) + `lostfound-icon.png` (66 KB), sumber SVG + `lostfound-icon-adaptive-foreground.png` di `assets/images/logo/src/` (tidak didaftarkan di pubspec). Generated: `android/app/src/main/res/**` (mipmap, drawable, values, mipmap-anydpi-v26, values-v31) + `ios/Runner/Assets.xcassets` + `LaunchScreen.storyboard` + `Info.plist`. Varian gelap tidak dimasukkan.
- Konfig: adaptive icon bg `#FFFBF0` (diambil dari `lostfound-icon-light-bg.png`), foreground zona aman 45% kanvas (bbox 462/1024, batas 66%). Splash latar putih `#FFFFFF` + ikon persegi; Android 12 pakai `adaptive-foreground`. iOS `remove_alpha_ios: true`. `ios/Runner.xcodeproj/project.pbxproj` di-revert (perubahan tool tidak relevan).
- Verifikasi: `flutter pub get` OK (9 dependensi berubah); `flutter analyze` 8 issues — identik baseline sebelum perubahan (semua di `test/`); `flutter test` 125 lulus; `flutter build apk --debug` sukses (36.6s); push branch OK.
- Temuan: PNG asli hanya ada di `C:\Users\ADVAN\Downloads\lostfound-logo.zip`, tidak di `PBL\Attachments`. Build memunculkan warning KGP dari plugin `location` + `pusher_channels_flutter` (pre-existing, bukan dari perubahan ini). `values-night` masih parent `Theme.Black` bawaan Flutter — splash night jadi hitam; sesuai prompt (tema gelap belum ada) tidak diubah.
- Butuh keputusan user: cek manual di HP — (1) login lebar 360 dp tidak overflow, wordmark tampil; (2) header Beranda ikon 32px, lonceng/avatar/search bar tidak bergeser; (3) ikon launcher di home screen HP (adaptive, bg krem); (4) splash putih + ikon persegi saat cold start. PR dibuat user.