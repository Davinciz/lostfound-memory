---
type: report
task: GPT-261104-06
from: flutter
outcome: succeeded
branch: fix/notification/fcm-logout
commits:
  - "2c40862 fix(notification): release FCM token before local logout"
updated: 2026-11-04
summary: Logout Flutter melepas token server sebelum auth lokal dibuang dengan budget FCM 5 detik dan proteksi race; 247 test lulus/4 skipped, analyze tetap 8 issue lama, APK debug berhasil.
---

- Berubah:
  - Repo `C:\Project\lostfound-mobile`. Working directory/branch/status diperiksa sebelum mulai dan sebelum commit. Working tree awal bersih pada branch handler `feature/notification/fcm-handler-deeplink`. Setelah fetch, develop terbaru `50ce102` sudah memuat handler melalui PR #21 dan isinya sama dengan branch handler; branch `fix/notification/fcm-logout` dibuat langsung dari origin/develop tersebut. Tidak mengubah branch asal atau membuat ulang handler.
  - Kontrak backend diperiksa dari laporan GPT-261104-05: DELETE `/api/users/me/fcm-token`, JSON field fcm_token wajib string nonkosong, bearer Sanctum sesi yang logout, sukses 204/body kosong termasuk mismatch/already-null. PUT non-null tetap untuk pendaftaran. Tidak memakai PUT null sebagai fallback.
  - `lib/api/api_client.dart`: method releaseFcmToken melakukan DELETE dengan body yang benar. FcmAuth menyimpan snapshot autentikasi hanya di memori; request FCM memakai header snapshot dan CancelToken per sesi/request, tanpa mengubah default/global Dio. AuthInterceptor tidak mengganti snapshot dengan kredensial akun berikutnya.
  - DELETE cleanup yang menerima 401 tidak menjalankan interceptor auto-logout lagi. Respons 401 lama yang bearer-nya berbeda dari kredensial lokal sekarang juga tidak menghapus sesi baru. Request 401 biasa dari sesi aktif tetap menghapus storage dan memanggil forceLogout seperti jalur existing.
  - Request FCM ditandai sensitif; logger tidak mencetak request, body, response, bearer, atau exception request FCM. Request lain mempertahankan pola logger existing.
  - `lib/screens/auth/auth_provider.dart`: logout dan logoutWithGoogle memakai satu alur serta Future bersama untuk deduplikasi pemanggilan bersamaan. Memulai lifecycle shutdown FCM secara sinkron sebelum await pertama. Sign-out Google yang melempar exception tidak mencegah cleanup/local logout. Login berikutnya menunggu alur logout lama selesai. Revision guard melindungi perubahan state dari hasil operasi lama.
  - AuthSessionLifecycle didefinisikan sebagai kontrak kecil di modul auth; AuthProvider tidak mengimpor FcmService. `lib/main.dart` memasang implementasi FcmService ke AuthProvider. Tidak membuat circular dependency.
  - `lib/services/fcm_service.dart`: menghentikan pekerjaan baru, deep link, initial-message lama dan banner sejak awal logout; menjaga snapshot token yang pernah dicoba PUT beserta token perangkat terakhir yang diketahui. Antrean PUT berhenti memulai pekerjaan baru setelah sesi ditutup; PUT yang sudah berjalan ditunggu sebelum DELETE.
  - Satu budget FCM **maksimal 5 detik** mencakup menunggu PUT, snapshot auth, dan DELETE atas kandidat token. Jika PUT belum terkonfirmasi selesai sampai deadline, request dibatalkan dan DELETE tidak dianggap berhasil. Jika DELETE lambat/gagal, request dibatalkan ketika deadline dan logout lokal tetap diteruskan. Tidak ada background retry/persistensi retry.
  - Ketika token refresh terjadi selama inisialisasi, getToken awal tidak boleh menimpa refresh yang lebih baru. Revision token kini diambil sebelum await izin/configuration; race tersebut ditemukan dan diperbaiki lewat test.
  - `lib/services/notification_router.dart`: cancelPending menonaktifkan fetch navigasi/banner sesi lama secara logis. Hasil fetch A diabaikan dan tidak mengunci navigasi baru B. Tidak mengubah pemetaan enam type atau fallback chat.
  - `lib/screens/profil/profil_screen.dart`: konfirmasi/UI logout tetap sama. Shutdown auth/FCM dimulai sebelum menunggu disconnect Pusher; kegagalan pembuatan service Google memakai logout biasa. Navigasi akhir tidak menimpa akun baru yang sudah terautentikasi.
  - `test/fcm_logout_test.dart`, `test/fcm_api_test.dart` (baru), serta pembaruan fixture/test di `test/notification_test.dart` dan `test/notification_router_test.dart`: total **28 kasus baru** dengan objek AuthProvider/FcmService/ApiClient produksi, fake Messaging/API, Completer, secure-storage channel fake, dan adapter HTTP Dio. Tidak sekadar menyalin logika guard.
  - Tidak mengubah backend, dependensi, Firebase deleteToken/auto-init, skema multi-perangkat, notification history/badge/toggle/channel/ikon, atau dokumen proyek lain. File API/profil juga dinormalisasi oleh dart format tanpa mengubah semantik fitur unrelated. Vault hanya ditulisi laporan ini.
  - Commit hanya 10 file implementasi/test yang relevan dengan staging spesifik. APK, dart_defines, google-services.json, kredensial, dan tooling tidak di-commit. Working tree akhir bersih. **Belum push, PR, merge, atau deploy dalam tugas ini.**

- Verifikasi (hasil asli):
  - Baseline analyze sebelum perubahan: `flutter analyze --no-pub` → **8 issue**, exit 1. Skill/AGENTS lokal tambahan tidak ditemukan pada repo Flutter; pola test existing digunakan.
  - Test terfokus akhir: `flutter test --no-pub test/fcm_api_test.dart test/fcm_logout_test.dart test/notification_test.dart test/notification_router_test.dart --reporter expanded` → **54 lulus**, exit 0. Mencakup 26 test lama dan 28 kasus baru.
  - Test membuktikan DELETE/body/204 dan bearer snapshot; CancelToken sebelum dispatch dan saat request sudah berjalan; log sensitif kosong; 401 cleanup tanpa rekursi; 401 biasa membersihkan state/storage; respons 401 A terlambat tidak menghapus B.
  - Test provider/service membuktikan DELETE sebelum storage/auth lokal dibuang; offline/401/403/404/500/timeout tetap logout lokal; signOut Google gagal; dua logout memakai Future yang sama; PUT in-flight/queued/refresh; token lama dan baru berbeda; getToken/cold tap terlambat; banner/pending fetch dibuang sejak awal; login B terlindungi; no token/no bearer/no valid session; dan listener tetap satu per stream setelah login/logout/login.
  - Saat implementasi sempat ada kegagalan regresi cold-message akibat fixture belum memasang lifecycle seperti wiring produksi; fixture diperbarui. Satu test race kemudian menunjukkan getToken awal menimpa refresh selama inisialisasi; implementasi revision diperbaiki. Seluruh kasus tersebut lulus pada hasil akhir.
  - Suite penuh akhir: `flutter test --no-pub --reporter expanded` → **247 lulus, 4 skipped**, exit 0, sekitar 8 detik. Angka 219/4 adalah baseline laporan sebelumnya, bukan run awal sesi ini. Hasil akhir nyata bertambah 28 kasus baru tanpa kegagalan.
  - `flutter analyze --no-pub` akhir → **8 issue baseline yang sama**, exit 1; **0 issue pada seluruh file yang diubah/ditambahkan**. Issue lama tidak diperbaiki: api_client_mine_test.dart:21/31/42, google_sign_in_error_test.dart:26, home_screen_test.dart:27/28, wa_visibility_persist_test.dart:2/5.
  - `flutter build apk --debug --no-pub --dart-define-from-file=dart_defines.example.json` → **berhasil**, exit 0; assembleDebug 35.7 detik. Artefak `C:\Project\lostfound-mobile\build\app\outputs\flutter-apk\app-debug.apk` (198.320.117 byte). Menggunakan konfigurasi contoh proyek dengan placeholder untuk verifikasi kompilasi, bukan konfigurasi layanan perangkat nyata; tidak membuktikan login Google/Pusher/FCM end-to-end. Untuk uji manual, bangun dengan konfigurasi proyek yang valid.
  - Build masih memberi peringatan existing `location` dan `pusher_channels_flutter` memakai Kotlin Gradle Plugin yang perlu migrasi untuk Flutter mendatang. Build tetap berhasil; dependensi tidak diubah.
  - `dart format --output=none --set-exit-if-changed` pada 10 file → **0 changed**, exit 0. `git diff --check` dan staged diff check lulus. Peringatan Git hanya normalisasi LF/CRLF.
  - **Tidak melakukan uji FCM/perangkat nyata atau iOS. Tidak memverifikasi deployment backend.**

- Temuan / open items:
  - Urutan logout: hentikan guard sesi FCM → ambil snapshot kandidat token/auth/antrean → tunggu PUT berjalan sampai selesai dalam budget → conditional DELETE memakai bearer lama → sign-out Google bila diminta → hapus auth_token/user lokal → kosongkan state auth. Logout bersamaan berbagi alur yang sama. Pusher teardown berjalan bersamaan setelah guard FCM ditutup.
  - Budget 5 detik khusus fase cleanup FCM, bukan batas waktu SDK Google atau secure storage. Semua await FCM memakai sisa budget yang sama; tidak menunggu jaringan tanpa batas. Pengujian timeout memakai budget pendek agar test cepat, dan default produksi 5 detik juga diperiksa.
  - Saat 401/forceLogout, sesi FCM langsung dinonaktifkan dan request dibatalkan; tidak mencoba DELETE ulang dengan kredensial yang sudah invalid. Server mungkin tetap menyimpan token lama.
  - Bila logout terjadi sebelum token perangkat diketahui atau tidak ada bearer snapshot yang aman, client melewatkan DELETE dan tetap menyelesaikan logout lokal. Tidak mengambil token akun lain atau menebak dari slot server yang bisa mewakili perangkat lain.
  - Cancellation membatalkan pekerjaan client; **tidak menjamin operasi yang sudah diterima server dibatalkan**. PUT yang timeout bisa memiliki hasil server yang tidak diketahui. Karena itu alur tersebut tidak diklaim berhasil melepas token. Tidak menjanjikan bahwa risiko privasi sepenuhnya hilang ketika offline, auth expired, timeout, atau server gagal.
  - Token masih satu slot per user. Kandidat token lama dan baru dihapus secara bersyarat agar token perangkat lain yang menggantikan slot tidak ikut terhapus. Risiko PUT paralel backend yang sudah dicatat GPT-261104-05 tidak diperbaiki di Flutter ini.
  - Endpoint tidak menarik push yang sudah dikirim atau notifikasi sistem yang sudah tampil. Tidak memanggil Firebase deleteToken atau mengubah auto-init.
  - Integrasi nyata memerlukan backend yang memuat hardening kepemilikan dan DELETE **sudah ter-deploy**, bukan sekadar merge repo. Merge/deployment dan FCM nyata tidak diklaim dari hasil test/build ini.
  - Rujukan mekanisme: [Future.timeout tetap mengizinkan source Future selesai belakangan](https://api.dart.dev/dart-async/Future/timeout.html), sehingga implementasi juga memakai [CancelToken Dio dan konfigurasi per request](https://pub.dev/packages/dio), guard sesi, serta bearer snapshot.

- Butuh keputusan user:
  - Tidak ada keputusan tambahan untuk implementasi scope ini. User menangani push/PR/merge/deploy dan uji perangkat.
  - Penanganan multi-perangkat penuh, jaminan keunikan PUT paralel, retry persisten, dan perubahan lifecycle token Firebase memerlukan tugas/desain terpisah bila diperlukan. Tidak ditambahkan diam-diam.

## Checklist manual — belum diuji

Persiapan: backend hardening+DELETE benar-benar ter-deploy, dua HP/akun berbeda, notifikasi diizinkan, dan build dengan konfigurasi login/Pusher/API proyek yang valid. Artefak build verifikasi di atas memakai konfigurasi contoh.

| Dua HP | Foreground | Background | Terminated dengan sesi tersimpan |
|---|---|---|---|
| Claim baru dan perubahan accepted/rejected/withdrawn/returned | [ ] Banner dan tujuan detail benar | [ ] Tap notifikasi menuju detail benar | [ ] Cold tap menunggu autentikasi lalu membuka detail |
| Chat baru | [ ] Chat aktif sama tanpa banner; chat lain dengan banner | [ ] Tap membuka lawan bicara/konteks benar | [ ] Cold tap membuka chat setelah autentikasi |

- [ ] Satu HP, akun A logout online: verifikasi DELETE 204 sebelum auth lokal dibuang, tanpa mencatat token/bearer/body ke laporan/log. Kirim event untuk A dari HP lain: server tidak lagi mengirim ke token HP ini.
- [ ] Login B pada HP yang sama: B menerima push miliknya; event A tidak tampil sebagai push baru ke HP tersebut. Notifikasi A yang sudah tampil sebelum logout bukan bukti request cleanup baru gagal.
- [ ] Ulangi logout/login beberapa kali; satu event tidak memunculkan banner/navigasi ganda. Token refresh kembali tersinkron pada sesi B.
- [ ] Logout A saat chat/deep link masih memuat; hasil lama tidak membuka layar A di atas sesi B.
- [ ] Logout saat jaringan offline atau DELETE gagal/timeout: logout lokal tetap selesai, lalu catat bahwa pelepasan server **tidak terkonfirmasi**, bukan sukses otomatis. Periksa apakah push A masih dapat sampai ketika koneksi kembali.
- [ ] Logout dengan sesi server expired/401: state lokal bersih tanpa loop request/dialog retry; jangan mengklaim token server sudah terhapus.
- [ ] Jika PUT sedang berjalan saat logout, catat hasil ketika sukses sebelum DELETE versus timeout/hasil server tidak diketahui. Uji ini tidak membuktikan jaminan konkurensi server.
- [ ] Gagalkan sign-out Google: pelepasan FCM dan logout lokal tetap diproses. iOS tetap belum diuji.
