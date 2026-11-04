# GPT-261104-06 — Lepas token FCM ketika logout di Flutter

Jalankan tugas ini di `C:\Project\lostfound-mobile`, setelah implementasi dan laporan GPT-261104-05 tersedia. Jangan membuat backend dalam sesi ini.

## Tujuan

Hubungkan logout Flutter ke pelepasan token FCM server dengan best-effort yang dibatasi waktu. Logout lokal tetap selesai jika server tidak dapat dijangkau. Tutup kemungkinan token sesi lama disinkronkan ulang sesudah dilepas, tanpa merusak lifecycle FCM dan deep link dari GPT-261104-03.

Prompt backend sebelumnya memilih route baru. Pastikan kontrak aktual dari laporan backend sama sebelum mengimplementasikan client; jangan menebak endpoint atau mengirim PUT null sebagai fallback.

## Konteks dan persiapan

1. Tampilkan working directory, branch, dan status; baca aturan repo yang berlaku dan plan push relevan. Jaga perubahan user.
2. Baca:
   - `D:\ObsidianVault\PBL\Inbox\reports\GPT-261104-03-fcm-handler-deeplink.md`
   - `D:\ObsidianVault\PBL\Inbox\reports\GPT-261104-04-push-hardening.md`
   - `D:\ObsidianVault\PBL\Inbox\reports\GPT-261104-05-fcm-token-release-backend.md`
3. Periksa `lib/services/fcm_service.dart`, `lib/services/notification_router.dart`, `lib/screens/auth/auth_provider.dart`, `lib/api/api_client.dart`, wiring provider di main, logout di profil, serta test notifikasi dan auth existing.
4. Saat prompt disusun, handler berada di branch `feature/notification/fcm-handler-deeplink`, commit `a83021d`. Branch sudah memiliki tracking origin secara lokal; status remote/merge perlu diverifikasi, jangan menyalin klaim lama bahwa belum push sebagai fakta terkini.
5. Buat branch `fix/notification/fcm-logout`. Mulai dari develop terbaru bila memuat handler; jika belum, turunkan dari branch handler dan catat dependency. Jangan menghilangkan perubahan handler, reset, atau mengubah branch asal. Tidak push, PR, merge, atau deploy.

## Kontrak backend yang diharapkan

`DELETE /api/users/me/fcm-token`, dengan bearer auth sesi yang sedang logout dan body JSON `{ "fcm_token": "<token yang dilepas>" }`.

Sukses 204 tanpa body; idempotent, termasuk ketika token berbeda/sudah kosong. Server hanya mengosongkan kolom user terautentikasi jika nilai token cocok. PUT existing tetap untuk pendaftaran token non-null. Tidak ada migration/tabel/dependency baru. Baca laporan backend untuk memastikan implementasi ini benar-benar ada; bila belum ada, laporkan dependency yang belum terpenuhi sebelum membuat asumsi kontrak lain.

## Perilaku wajib

1. Tambahkan method ApiClient untuk DELETE sesuai kontrak. Jangan melakukan pembersihan setelah kredensial lokal dihapus atau memakai kredensial akun yang login berikutnya. Hindari mengubah Dio default/global hanya untuk request cleanup ini.
2. Sejak logout dimulai, tandai sesi FCM sebagai berakhir: hentikan penerimaan pekerjaan sinkronisasi token baru, batalkan pending deep link/banner, dan abaikan hasil getToken/refresh/initial-message sesi itu. Jangan menunggu DELETE selesai baru mematikan guard sesi.
3. Koordinasikan antrean PUT token dan DELETE. PUT yang sudah berjalan/antre tidak boleh menyimpan token lagi setelah cleanup dinyatakan berhasil. Tangani token refresh yang berlomba dengan logout; snapshot token yang relevan sebelum state sesi dibuang. Jangan mengandalkan hanya `getToken()` terakhir jika token yang pernah dikirim ke server berbeda. Pilih implementasi minimal sesuai struktur existing dan jelaskan urutannya.
4. Lakukan cleanup server sebelum menghapus auth lokal, dengan batas waktu total yang singkat dan eksplisit (target maksimal 5 detik untuk cleanup FCM). Bila tidak ada token yang dapat diketahui dengan aman, logout tetap selesai; laporkan batasan ini. Jangan menunggu antrean jaringan tanpa batas.
5. Timeout/offline/401/403/404/5xx tidak menggagalkan logout lokal dan tidak memunculkan dialog retry. Tidak ada background retry yang dapat memakai kredensial akun berikutnya. Jangan menganggap Future.timeout membatalkan request server; gunakan cancellation/guard yang sesuai dan nyatakan ketidakpastian request in-flight bila relevan.
6. `logout()` dan `logoutWithGoogle()` memakai satu alur cleanup. Sign-out Google yang gagal tidak boleh mencegah pelepasan FCM dan logout lokal. Pastikan pemanggilan logout bersamaan idempotent dan tidak menggandakan cleanup.
7. Jalur sesi kedaluwarsa/401 tetap membersihkan state lokal dan menonaktifkan sesi FCM tanpa loop request. DELETE cleanup yang menerima 401 tidak boleh memicu rekursi logout atau deadlock. Saat kredensial sudah tidak valid, jangan menjanjikan bahwa server dapat membersihkan token tersebut.
8. Login berikutnya tetap meminta izin sesuai kontrak sesi, mendapatkan/mengirim token, menangani refresh, dan mempunyai satu listener per stream sepanjang aplikasi. Hasil request lama tidak boleh menghapus state, token, atau navigasi sesi baru. Jangan membuat circular dependency AuthProvider/FcmService; pilih wiring sederhana yang dapat diuji.
9. Jangan log token FCM, bearer auth, request body, atau exception yang memuat token. Pertahankan UI logout yang ada. Tidak mengubah riwayat notifikasi, badge, toggle push, channel/ikon, route fallback chat, atau penanganan enam type.

Lingkup ini adalah pelepasan token server dan koordinasi sesi. Tidak menambahkan Firebase deleteToken/auto-init, penyimpanan retry persisten, atau perubahan skema multi-perangkat secara diam-diam; jika dianggap perlu, jelaskan sebagai usulan terpisah beserta alasan.

## Test yang membuktikan perilaku

Gunakan fake Messaging/API dan kontrol Future/Completer bila diperlukan. Uji objek produksi dan efek sebenarnya; jangan hanya menyalin logika guard ke dalam test.

- Logout normal mengirim DELETE berisi token benar ketika auth masih tersedia, lalu membersihkan storage/state lokal.
- DELETE timeout/offline/401/5xx dan Google signOut gagal: logout lokal tetap selesai, tidak rekursi/exception tak tertangani.
- Dua pemanggilan logout bersamaan: cleanup sekali dan state konsisten.
- Token PUT yang masih berjalan, refresh, dan hasil getToken terlambat saat logout: tidak mendaftarkan ulang token setelah urutan cleanup sukses. Sertakan kasus token lama dan token baru berbeda.
- Tap/banner dan pending navigasi dibuang sejak logout dimulai, termasuk saat cleanup belum selesai.
- Logout A lalu login B: request lama tidak memakai auth B, tidak membersihkan state B, dan hanya sesi B yang dapat menyinkronkan token/navigasi berikutnya.
- Logout tanpa token atau tanpa sesi valid tetap selesai; sesi FCM berhenti.
- Siklus login/logout/login menjaga satu listener, token tersinkron kembali, dan cold start/deep link existing tetap benar.
- Verifikasi method DELETE/body/status 204 melalui adapter HTTP fake atau pola test API existing, selain test service/provider.

Jalankan test terfokus, kemudian seluruh `flutter test`, `flutter analyze`, build APK debug dengan konfigurasi verifikasi proyek, formatter dan diff check. Baseline laporan GPT-261104-03 adalah 219 lulus/4 skipped dan 8 issue analyze lama; periksa kondisi aktual, jangan menjadikan angka lama hasil sesi ini. Jangan memperbaiki lint unrelated. Jika build/test terhambat, laporkan apa yang benar-benar dijalankan.

## Hasil dan batas klaim

- Commit file relevan dengan staging spesifik; jangan commit APK, kredensial, google-services.json, atau tooling agent. Jangan edit dokumen proyek lain.
- Tulis laporan `D:\ObsidianVault\PBL\Inbox\reports\GPT-261104-06-fcm-logout-flutter.md`: branch/base/commit, urutan logout dan proteksi race, batas timeout, hasil test/analyze/build aktual, serta sisa risiko.
- Best-effort bukan jaminan penghentian push ketika offline, auth kedaluwarsa, request in-flight tidak pasti, atau cleanup gagal. Push yang sudah dikirim/ditampilkan juga tidak ditarik oleh endpoint. Jangan menyebut risiko privasi sepenuhnya hilang.
- Jangan mengklaim merge, deployment, atau FCM nyata sudah teruji. Untuk integrasi, backend harus lebih dahulu memuat hardening kepemilikan token dan endpoint DELETE serta benar-benar ter-deploy.
- Sertakan checklist manual belum diuji: dua HP untuk claim/chat foreground/background/terminated; dan satu HP bergantian akun khusus regresi privasi (A logout online → event untuk A tidak lagi dikirim ke token HP itu; login B → hanya push B). Tambahkan skenario offline dengan hasil dicatat sebagai keterbatasan, bukan sukses otomatis. User melakukan push/PR/merge/deploy dan uji perangkat.
