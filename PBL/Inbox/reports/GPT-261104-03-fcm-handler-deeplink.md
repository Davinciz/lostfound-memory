---
type: report
task: GPT-261104-03
from: flutter
outcome: succeeded
branch: feature/notification/fcm-handler-deeplink
commits:
  - "a83021d feat(notification): handle FCM sessions banners and deep links"
updated: 2026-11-04
summary: Handler FCM, izin, sinkronisasi token, deep link claim/chat dan banner foreground selesai; 219 test lulus, 4 skipped, analyze tetap 8 issue baseline, APK debug berhasil.
---

- Berubah:
  - Repository `C:\Project\lostfound-mobile`. Working directory dan branch ditampilkan sebelum mulai dan sebelum commit. Awal sesi `develop`, working tree bersih. `git checkout develop` + `git pull` fast-forward `8b01838` ke `abc2a79`, lalu membuat `feature/notification/fcm-handler-deeplink`.
  - `lib/services/fcm_service.dart`: service sepanjang lifecycle aplikasi, initialize idempotent, satu subscription per stream foreground/opened/token-refresh. Logout menonaktifkan sesi dan membuang tujuan tertunda; login berikutnya tidak menambah listener. Subscription dibatalkan saat service dispose.
  - Izin diminta sekali per sesi login, bukan setiap MainTabScreen dibangun. Error izin/token tidak menggagalkan login. Token awal dan onTokenRefresh dikirim lewat ApiClient bersama; pengiriman berurutan dan hasil getToken lama tidak menimpa token refresh yang lebih baru. Token/error berisi token tidak dicetak.
  - getInitialMessage dibaca sekali; tap cold start ditahan sampai autentikasi selesai dan MainTabScreen melewati frame pertama. Tap saat hasil autentikasi menunjukkan belum login dibuang, termasuk hasil initial-message yang terlambat sesudahnya. onMessageOpenedApp menggunakan jalur navigasi yang sama. Pergantian sesi membatalkan hasil navigasi tertunda.
  - `lib/services/notification_router.dart` (baru): fungsi murni notificationTarget memetakan keenam type final; unknown type, ID hilang/kosong/whitespace/bukan string diabaikan. Semua claim_* menuju detail claim melalui getClaim; chat dicocokkan lewat getConversations agar otherUser, reportContext dan claimId tersedia. Chat tidak ditemukan membuka MainTabScreen dengan tab Chat aktif.
  - Kegagalan jaringan/403 memakai apiErrorMessage dan AppSnackBar; 404 diberi pesan `Notifikasi ini sudah tidak tersedia.`. Tidak melakukan navigasi bila logout/pergantian sesi terjadi saat fetch berlangsung.
  - Banner foreground berbasis OverlayEntry, tanpa dependensi baru: title + body, ketuk membuka tujuan, hilang otomatis setelah 4 detik; warna hanya AppColors existing. Foreground tidak langsung membuka layar tujuan. Payload chat untuk percakapan yang sedang terlihat tidak menampilkan banner.
  - `lib/main.dart`: Provider FcmService sepanjang aplikasi, Navigator observer untuk status layar chat, background handler tetap hanya menginisialisasi Firebase tanpa log isi notifikasi. Firebase menangani notifikasi sistem background/terminated; tidak membuat notifikasi lokal duplikat.
  - `lib/screens/home/main_tab_screen.dart`: tidak membuat FcmService/listener baru, memberi sinyal bahwa layar setelah autentikasi siap, dan mendukung initialIndex untuk fallback tab Chat. Lifecycle Pusher existing tetap terpisah.
  - `lib/screens/chat/chat_screen.dart`: hanya pelacak layar aktif melalui RouteAware; ditandai aktif saat tampil/kembali, dibersihkan ketika tertutup route lain/pop/dispose. Tidak mengubah logika pesan atau aksi claim.
  - `android/app/src/main/AndroidManifest.xml`: menambahkan POST_NOTIFICATIONS secara eksplisit.
  - `test/notification_test.dart` dan `test/notification_router_test.dart` (baru): 26 test payload, suppression, lifecycle login/logout, token/izin/error, cold start, race token/initial-message, navigasi claim/chat, error jaringan/403/404, pergantian sesi, tracking route, tampilan/banner auto-dismiss dan tap banner.
  - Tidak mengubah notification_screen.dart, badge lonceng, toggle push Pengaturan, backend, dependensi, google-services.json, atau kredensial. Vault hanya ditulisi laporan yang diminta ini. Working tree akhir bersih; belum push/merge.

- Verifikasi (hasil asli):
  - `flutter analyze` sebelum perubahan → **8 issue baseline**, exit 1. Setelah perubahan, `flutter analyze --no-pub` → **8 issue yang sama**, exit 1, **0 issue dari seluruh file yang diubah/ditambahkan**. Satu lint baru saat implementasi telah diperbaiki sebelum hasil akhir.
  - Baseline analyze yang tetap: dead_code `test/api_client_mine_test.dart:21,31`; unnecessary_null_comparison `test/api_client_mine_test.dart:42` dan `test/google_sign_in_error_test.dart:26`; library_private_types_in_public_api `test/home_screen_test.dart:27,28`; unnecessary_import `test/wa_visibility_persist_test.dart:2,5`. Tidak diperbaiki sesuai batasan tugas.
  - `flutter test --no-pub test/notification_test.dart test/notification_router_test.dart --reporter expanded` → **26 lulus**, exit 0.
  - `flutter test --no-pub --reporter expanded` akhir → **219 lulus, 4 skipped**, exit 0, sekitar 8 detik. Baseline yang diberikan 193 lulus/4 skipped bertambah 26 test baru; tidak ada kegagalan. Output beberapa test existing masih memuat peringatan request tile peta pada lingkungan widget test; suite tetap lulus.
  - `flutter build apk --debug --no-pub` → **berhasil**, exit 0. APK: `C:\Project\lostfound-mobile\build\app\outputs\flutter-apk\app-debug.apk` (198.318.454 byte). Tidak ada dart-define tambahan pada build verifikasi ini; untuk uji login Google/Pusher, gunakan parameter build proyek yang biasa dipakai. Keberhasilan build tidak membuktikan login, realtime, atau push perangkat nyata.
  - Build memberi peringatan plugin `location` dan `pusher_channels_flutter` masih memakai Kotlin Gradle Plugin yang akan perlu migrasi pada Flutter mendatang; tidak menggagalkan build, tidak ada dependensi yang diubah.
  - Dart format dilakukan pada seluruh file Dart dalam perubahan. `git diff --check` dan `git diff --cached --check` lulus. Git hanya memberi peringatan normalisasi LF/CRLF pada file baru.
  - Manifest Android hasil merge build juga memuat POST_NOTIFICATIONS dan ikon aplikasi existing. Tidak ada konfigurasi default_notification_icon/default_notification_channel_id khusus.
  - Semua pengujian notifikasi menggunakan fake stream/API dan widget test. **FCM nyata ke dua perangkat belum diuji; iOS tidak diuji.** Tidak memverifikasi deployment backend dalam tugas Flutter ini; uji perangkat menunggu backend ter-deploy.

- Temuan / open items:
  - **Logout tidak menghapus fcm_token di server.** Pembacaan read-only `AuthProvider.logout`, `logoutWithGoogle` dan `ApiClient.logout` menunjukkan logout hanya sign-out Google bila dipanggil dan menghapus auth_token/user di secure storage. Tidak ada panggilan penghapusan token FCM server. Token yang sama dapat tetap tercatat pada akun sebelumnya setelah perangkat login ke akun lain; push akun lama dapat tetap sampai ke perangkat. Guard sesi/navigasi client tidak menyelesaikan kepemilikan token server. Temuan ini hanya dilaporkan, tidak diperbaiki sesuai instruksi.
  - **Ikon/channel Android tetap default.** Tidak ada metadata FCM khusus pada manifest sumber maupun manifest hasil merge; aplikasi memakai `@mipmap/ic_launcher` dan fallback/default Firebase untuk notifikasi. Tidak menambahkan ikon notifikasi khusus atau channel sendiri. Tampilan ikon/label channel perlu dilihat di perangkat.
  - Opsi A dipertahankan: tidak ada layar riwayat notifikasi, badge angka lonceng, atau perubahan toggle push.
  - Sinkronisasi token bersifat best-effort saat inisialisasi sesi dan event refresh; kegagalan jaringan tidak membuat aplikasi crash. Tidak ada mekanisme retry tambahan dalam perubahan ini.
  - Deep link chat memakai daftar normal yang disediakan API. Bila percakapan tidak ada dalam daftar, termasuk tidak lagi terlihat/terarsip, fallback adalah tab Chat sesuai kontrak tugas.
  - Listener FCM dihentikan saat aplikasi dispose dan sesi dinonaktifkan saat logout; tampilan notifikasi sistem yang sudah ada tetap dikelola Android.

- Butuh keputusan user:
  - Tidak ada keputusan tambahan untuk menyelesaikan lingkup ini. Jika ingin menutup risiko token antar-akun, buat tugas terpisah untuk pelepasan token di server saat logout/pergantian akun.
  - Ikon/channel khusus dapat menjadi tugas terpisah bila tampilan default tidak sesuai setelah uji perangkat. Tidak diperlukan dependensi baru untuk implementasi saat ini.
  - User melakukan push dan PR squash ke develop di Gitea; agent tidak push/merge dalam tugas ini.

## Checklist uji manual dua HP — belum dijalankan

Persiapan: gunakan dua akun berbeda pada HP A/B, backend yang sudah memuat GPT-261104-02 dan ter-deploy, serta build dengan konfigurasi login/Pusher proyek. Ulangi setiap skenario dengan data claim baru bila status sebelumnya sudah berubah. Setiap kolom berikut **belum dicentang** dan harus diuji user.

| Peristiwa | Penerima yang diharapkan | App terbuka | Background | Tertutup |
|---|---|---|---|---|
| Claim diajukan | Penerima claim, bukan pengaju | [ ] Banner → detail claim | [ ] Notifikasi sistem → detail claim | [ ] Tap → autentikasi selesai → detail claim |
| Claim disetujui | Pengaju | [ ] Banner → detail claim | [ ] Notifikasi sistem → detail claim | [ ] Tap → detail claim |
| Claim ditolak | Pengaju | [ ] Banner → detail claim | [ ] Notifikasi sistem → detail claim | [ ] Tap → detail claim |
| Claim ditarik/withdraw | Penerima claim | [ ] Banner → detail claim | [ ] Notifikasi sistem → detail claim | [ ] Tap → detail claim |
| Serah terima | Lawan pihak yang melakukan serah terima | [ ] Banner → detail claim | [ ] Notifikasi sistem → detail claim | [ ] Tap → detail claim |
| Pesan chat baru | Lawan bicara, bukan pengirim | [ ] Banner → chat dengan nama/konteks benar | [ ] Notifikasi sistem → chat | [ ] Tap → autentikasi selesai → chat |

- [ ] Android 13+: login pertama meminta izin; tolak izin, aplikasi tetap berjalan dan tidak mengulang dialog karena berpindah tab/membangun MainTabScreen lagi dalam sesi yang sama.
- [ ] Izinkan notifikasi, logout-login beberapa kali, lalu kirim satu peristiwa: tidak ada banner/navigasi ganda karena listener bertambah.
- [ ] Token perangkat berubah: server menerima pembaruan tanpa perlu mencetak/menyalin token ke laporan atau log.
- [ ] Chat yang sama sedang tampil: pesan Pusher realtime masuk, tanpa banner FCM. Chat lain tetap menampilkan banner. Bila chat tertutup layar detail/dialog, banner kembali boleh tampil.
- [ ] Banner menampilkan judul/isi, hilang sekitar 4 detik, dan ketuk banner membuka tujuan.
- [ ] Claim/conversation dihapus/tidak dapat diakses, atau jaringan putus: pesan ramah, tidak crash. ID chat tidak ditemukan dalam daftar → tab Chat.
- [ ] Tap notifikasi saat sesi sudah logout: abaikan tujuan; tidak crash dan tidak memutar ulang tujuan lama setelah login lain.
- [ ] Lihat ikon/label channel Android default; catat bila perlu tugas tampilan khusus.

Untuk kolom tertutup, uji proses aplikasi yang sudah tidak berjalan dengan sesi login tersimpan; bedakan dari **Force stop** melalui Settings Android. Setelah Force stop, aplikasi perlu dibuka lagi sebelum menerima pesan. Rujukan perilaku lifecycle dan API yang dipakai: [dokumentasi resmi Firebase](https://firebase.google.com/docs/cloud-messaging/flutter/receive-messages).
