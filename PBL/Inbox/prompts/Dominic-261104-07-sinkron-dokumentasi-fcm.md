# Prompt Dominic-261104-07 — Sinkronisasi dokumentasi FCM dan hasil uji manual

Kerjakan tugas **dokumentasi saja** di vault `D:\ObsidianVault\PBL`. Jangan mengimplementasikan fitur, menjalankan operasi produksi, mengirim notifikasi, atau mengubah kode backend/Flutter.

## Tujuan

Perbarui dokumentasi setelah implementasi backend dan Flutter GPT-261104-02 sampai GPT-261104-06 selesai, beberapa merge diverifikasi, dan user melakukan pengujian perangkat nyata.

Catat status sebagai **implementasi MVP Opsi A selesai, diterima untuk sementara oleh user; uji manual sebagian besar berhasil, rincian hasil per skenario belum lengkap**. Pisahkan status implementasi/penerimaan sementara tersebut dari cakupan verifikasi dan pekerjaan lanjutan. Jangan menyatakan semua test hijau, seluruh checklist manual lulus, atau seluruh risiko privasi selesai.

## Fakta baru dari user — sumber primer percakapan

Tanggal konteks: **2026-11-04**.

1. Setelah mengirim pesan tes melalui Firebase Console ke token perangkat, user mengonfirmasi: **“Oke notifikasi sudah muncul di HP ku”**. Ini bukti penerimaan Firebase → HP, bukan bukti seluruh pemicu backend dan deep link sudah diuji.
2. Kemudian user sudah dapat melakukan pengujian dengan teman menggunakan **dua akun berbeda pada dua HP**. PM memberikan checklist claim/chat, foreground/background/aplikasi tertutup, tujuan ketuk notifikasi, suppression chat aktif, dan logout/login.
3. Sesudah pengujian tersebut, user menyatakan: **“Hasilnya sebagian besar sudah berhasil, untuk sekarang sudah aman”**, lalu meminta dokumentasi diperbarui.
4. **Tidak ada rincian hasil per kasus, daftar kasus yang belum berhasil, model HP, versi Android, waktu penerimaan, atau rekaman hasil lengkap.** Jangan mengarang rincian tersebut, jangan mencentang seluruh matriks pengujian, dan jangan menyebut “tidak ada bug”. Tulis bahwa rincian skenario yang belum berhasil/belum diuji belum disampaikan. Ini tidak boleh menghalangi penyelesaian tugas dokumentasi.
5. User sudah mendapat penjelasan dan menerima bahwa **history/daftar notifikasi di aplikasi memang belum dibuat**, sesuai Opsi A. Opsi B tetap ditunda; belum ada persetujuan membuat history, badge angka, atau tabel baru.

Ucapan “aman” adalah penerimaan user untuk penggunaan/pengujian saat ini, **bukan hasil audit keamanan menyeluruh atau bukti jaminan isolasi token di semua kondisi**.

## Sumber yang harus dibaca

Baca aturan vault yang berlaku, lalu sumber berikut. Gunakan struktur folder aktual, bukan lokasi dokumen lama di root vault.

- `Inbox\reports\Dominic-261104-01-catat-keputusan-push-opsi-a.md`
- `Inbox\reports\GPT-261104-02-push-claim-chat.md`
- `Inbox\reports\GPT-261104-03-fcm-handler-deeplink.md`
- `Inbox\reports\GPT-261104-04-push-hardening.md`
- `Inbox\reports\GPT-261104-05-fcm-token-release-backend.md` — termasuk pembaruan PR #27 di bagian akhir.
- `Inbox\reports\GPT-261104-06-fcm-logout-flutter.md`
- `Plan\Push Notification - Lost&Found.md`
- Bagian relevan `Documents\TechnicalReference.md`, `Documents\Design.md`, `Documents\Lost&Found Progress.md`, dan `DailyChanges\2026-11-04.md`.

Laporan implementasi adalah rekaman saat tugas tersebut selesai. Keterangan “belum push/merge” dalam laporan lama telah sebagian digantikan oleh verifikasi Git berikut. Jangan mengubah laporan historis agar terlihat sejak awal sudah merge; catat pembaruannya pada dokumen status dan log harian.

## Bukti merge dan review yang sudah tersedia di sesi PM

Ini merupakan hasil pemeriksaan repo/server Git oleh PM, bukan nomor PR dugaan:

| Repo | Perubahan | Bukti merge ke develop |
|---|---|---|
| Backend | Push claim baru/chat + payload serah terima, GPT-261104-02 | PR #24, `fdd9952` |
| Backend | Hardening log dan pemindahan kepemilikan token, GPT-261104-04 | PR #25, `459f969` |
| Backend | Conditional DELETE token, GPT-261104-05 | PR #27, `6f45cbf` |
| Flutter | Handler sesi, banner, deep link, GPT-261104-03 | PR #21, `50ce102` |
| Flutter | Pelepasan token saat logout, GPT-261104-06 | PR #22, `6fe1330` |

Catatan asal commit: GPT-261104-03 = `a83021d`; GPT-261104-05 = `5e5428b`, disusul penyelesaian konflik branch `345802f`; GPT-261104-06 = `2c40862`. Bedakan commit implementasi/branch dengan commit merge di atas.

PM juga memeriksa endpoint server aplikasi lewat request GET tanpa autentikasi: `/api/users/me/fcm-token` membalas **405** dengan header **`Allow: PUT, DELETE`**. Ini bukti metode route sudah terekspos di server, **bukan bukti identitas commit deployment, keberhasilan DELETE terautentikasi, atau konfigurasi FCM backend seluruhnya benar**. Uji perangkat user tetap dicatat pada level konfirmasi umum sebagaimana di atas; jangan menyimpulkan commit deploy tertentu.

Jika akses read-only kode diperlukan untuk memastikan detail, gunakan `C:\Project\lostfound-backend` dan `C:\Project\lostfound-mobile`. Tidak perlu menjalankan ulang suite/build, fetch, checkout, deploy, atau pengujian perangkat untuk menyelesaikan dokumentasi ini. Jika menemukan bukti yang lebih baru, jelaskan sumber dan bedanya.

## Isi teknis yang perlu diselaraskan

### Backend

- `PushNotificationService` menjadi jalur pengiriman terpusat, sinkron dan best-effort; kegagalan FCM tidak menggagalkan aksi bisnis. Catat ini sebagai **perilaku implementasi aktual**, bukan keputusan user baru tentang sinkron-vs-queue.
- Keenam `type`: `claim_new`, `claim_accepted`, `claim_rejected`, `claim_withdrawn`, `claim_returned`, dan `chat`. Semua nilai `data` string. Claim membawa `claim_id`; chat membawa `conversation_id`.
- Claim baru → penerima claim; accepted/rejected → pengaju; withdrawn → penerima claim; returned → lawan pihak yang melakukan serah terima; chat → lawan bicara. Jalur admin/Filament tetap tidak termasuk pengiriman push yang diminta.
- PUT `/api/users/me/fcm-token` membersihkan token sama pada user lain lalu menyimpan pada user saat ini dalam transaksi. Ini memperbaiki perpindahan akun berurutan, **belum menjamin keunikan pada request paralel**.
- DELETE `/api/users/me/fcm-token`: Sanctum; body JSON `fcm_token` wajib string nonkosong; satu conditional update berdasarkan ID user terautentikasi dan token yang cocok; menjadi null; 204/body kosong untuk cocok, null, atau mismatch; 401 tanpa auth; 422 input invalid. Tidak revoke token Sanctum. PUT tetap tidak menerima null sebagai cara penghapusan.
- Log FCM memuat kelas error dan pesan teredaksi maksimal 200 karakter beserta konteks yang diizinkan. Token, judul, dan isi yang dikenali diredaksi; jangan mengubahnya menjadi klaim absolut bahwa setiap kemungkinan format data sensitif sudah tercakup.
- Tetap satu slot `users.fcm_token` per user; bukan dukungan penuh banyak perangkat.

### Flutter

- Satu FcmService sepanjang aplikasi, initialize idempotent, guard per sesi, izin sekali per sesi, token refresh, dan cold-start tap menunggu autentikasi serta kesiapan layar.
- Keenam type ditangani; type/ID invalid diabaikan. Claim membuka detail; chat dicari lewat daftar percakapan agar nama/konteks tersedia; jika tidak ditemukan, fallback ke tab Chat. Foreground berupa banner OverlayEntry, hilang sekitar 4 detik, tidak berpindah layar otomatis, dan tidak ditampilkan ketika percakapan yang sama sedang terlihat.
- Logout biasa/Google memakai satu alur yang dideduplikasi: hentikan guard/banner/navigasi lama sejak awal, ambil snapshot auth/token, tunggu PUT berjalan dalam budget, lakukan conditional DELETE menggunakan kredensial sesi lama sebelum auth lokal dibuang. Budget fase FCM maksimal **5 detik**, bukan jaminan batas waktu seluruh SDK Google/storage.
- Kegagalan jaringan/cleanup/Google sign-out tidak menggagalkan penyelesaian logout lokal. Tidak ada retry persisten. Respons lama tidak memakai kredensial akun berikutnya; DELETE 401 tidak memicu loop logout. Pembatalan request client tidak membuktikan operasi server yang sudah diterima ikut batal.
- Tidak memanggil Firebase deleteToken atau mengubah auto-init; tidak ada dependency baru untuk banner/logout.

### Lingkup produk

- Opsi A tetap **push FCM tanpa riwayat/daftar notifikasi tersimpan**; layar lonceng tetap empty state. Badge jumlah dan toggle push belum dibuat. Opsi B ditunda, bukan dibatalkan.
- Koreksi frasa lama “tanpa endpoint notifikasi” agar jelas berarti **tanpa API inbox/riwayat notifikasi**, bukan melarang endpoint pengelolaan token PUT/DELETE yang sekarang ada.
- Tidak ada perubahan skema untuk tugas FCM ini; tetap tujuh tabel inti sesuai keputusan proyek. Jangan mengklaim jumlah seluruh tabel fisik database produksi sudah dihitung.

## Hasil verifikasi yang boleh dicatat

- GPT-261104-03: 26 test baru; 219 lulus/4 skipped; analyze 8 issue lama; APK debug berhasil.
- GPT-261104-04: 332 lulus/1 gagal. Outcome laporan `failed` terkait target nol kegagalan yang belum tercapai; jangan diubah menjadi “semua pekerjaan hardening gagal”, dan jangan disembunyikan.
- GPT-261104-05 awal: 17 kasus baru; 44 test terfokus lulus; suite 349 lulus/1 gagal. **Pembaruan setelah integrasi develop/Filament** di laporan yang sama: 56 terfokus lulus, suite **361 lulus/1 gagal**. Bedakan waktu/cakupannya, jangan menjumlahkan hasil ini.
- GPT-261104-06: 28 kasus baru; 54 terfokus lulus; suite **247 lulus/4 skipped**, analyze tetap 8 issue baseline dan 0 pada file berubah; APK debug berhasil menggunakan konfigurasi contoh/placeholder, bukan bukti build itu dipakai untuk seluruh tes perangkat user.
- PM menjalankan ulang 54 test terfokus Flutter notifikasi/logout: semuanya lulus. PM tidak mengulang suite penuh/analyze/build pada review tersebut. Pemeriksaan route/sintaks backend lulus; suite database backend tidak diulang oleh PM.
- Hasil perangkat nyata: catat dua konfirmasi user di atas, jangan mengubah test otomatis/mock menjadi pengujian perangkat.

## Pekerjaan lanjutan yang wajib tetap terbuka

1. Rincian checklist dua akun/dua HP yang belum berhasil/belum diuji belum tersedia. Jangan anggap semua kombinasi foreground/background/terminated, semua penerima, atau regresi logout sudah lulus satu per satu.
2. Race PUT paralel token yang sama: transaksi existing tanpa penguncian per token/constraint unik belum menjamin pemilik tunggal di bawah konkurensi.
3. Logout offline, timeout, auth expired, token belum diketahui, atau hasil PUT in-flight tidak pasti: token server dapat tetap ada. Pelepasan best-effort bukan jaminan privasi mutlak. Push yang sudah terkirim/tampil tidak ditarik oleh DELETE.
4. Satu slot token per user, iOS dan dukungan multi-perangkat penuh belum diverifikasi dalam rangkaian ini.
5. `ConversationArchiveTest::test_unread_count_filtered_by_deleted_at` tetap gagal. Diagnosis terbaru: `visibleTo` mengecualikan percakapan dengan deleted_at slot user terisi; assertion data percakapan mendapat null. Jangan terus menulis diagnosis lama hanya “expected 1, actual 2” sebagai kondisi terbaru, dan jangan menutupnya berdasarkan konfirmasi umum pengujian notifikasi.
6. Scheduler Dokploy tetap ditunda; pengingat/kedaluwarsa claim dan arsip otomatis tidak dianggap selesai. N+1 daftar percakapan tetap terbuka.
7. History/Opsi B, badge, toggle, ikon/channel khusus, push admin, dan event di luar enam type tidak otomatis menjadi scope selesai. Status push claim dibekukan/aktif kembali tetap belum diverifikasi, bukan diasumsikan sudah ada.

## Dokumen yang diperbarui

1. **`Plan\Push Notification - Lost&Found.md`**: status implementasi/penerimaan MVP Opsi A, tabel event dan payload aktual, lifecycle token/logout, bagian verifikasi manual, batasan dan pekerjaan lanjutan. Ganti klaim aktif “belum dibuat/dijadwalkan” yang sudah basi; konteks historis cukup ditandai tanggal. Jangan mengubah usulan menjadi keputusan user tanpa bukti.
2. **`Documents\TechnicalReference.md`**: §8.3/§11, daftar endpoint di §16 bila relevan, open items §17, serta frontmatter/summary yang masih menyatakan implementasi belum ada. Selaraskan kontrak API dan hasil verifikasi.
3. **`Documents\Design.md`**: bagian alur push/banner/ketuk/logout dan halaman Notifikasi. Pisahkan perilaku yang sudah ada dari history/badge/toggle yang ditunda.
4. **`Documents\Lost&Found Progress.md`**: perbarui kartu Push Notification. Implementasi MVP Opsi A boleh dicatat **selesai/diterima sementara oleh user**, dengan anotasi jelas “uji manual sebagian besar berhasil; rincian skenario belum lengkap”. Pisahkan checklist/regresi dan risiko tersisa sebagai tindak lanjut terbuka. Jangan membuat kartu tersebut berarti semua pengujian/risiko sudah ditutup. Selaraskan referensi silang chat/claim yang masih menyebut handler FCM belum dibuat, hanya pada bagian yang langsung terkait.
5. **`DailyChanges\2026-11-04.md`**: tambahkan perkembangan implementasi, merge, review, dan konfirmasi manual terbaru. Bagian pagi yang mengatakan “implementasi belum ada” dipertahankan sebagai riwayat bertanggal/bertahap dan ditandai telah digantikan perkembangan berikutnya. Jangan menghapus konfirmasi lama atau menggandakan catatan yang sama.
6. **`Documents\PRD.md`**: periksa bagian notifikasi; ubah hanya jika benar-benar bertentangan dengan lingkup Opsi A. Jika tidak perlu diubah, catat alasannya pada laporan.

**Jangan mengubah** `Documents\ERD.md`, `Documents\schema.dbml`, kode aplikasi, migration/dependency, konfigurasi/kredensial, laporan implementasi historis, atau snapshot `docs/` di repo backend/mobile. Tidak menyalin vault ke repo, tidak commit/push/merge, tidak mengirim pesan atau mengubah tracker eksternal.

## Verifikasi dan hasil akhir

- Cari ulang klaim lama terkait FCM pada dokumen yang disentuh: “belum ada push claim/chat”, “belum getInitialMessage”, “logout hanya lokal”, “FCM belum pernah diuji”, “tanpa endpoint”, dan “belum merge”. Koreksi status aktif atau tandai jelas sebagai riwayat; jangan menghapus frasa historis secara membabi buta.
- Periksa konsistensi keenam type, kontrak PUT/DELETE, penerima push, bukti merge, angka test beserta sumbernya, dan batas konfirmasi manual. Pastikan wikilink, frontmatter, format kanban, dan bagian unrelated tidak rusak.
- Jangan mencetak token perangkat, auth token, service account, atau isi chat pribadi. Tugas dokumentasi tidak memerlukan akses ke nilai-nilai tersebut.
- Tulis laporan **`Inbox\reports\Dominic-261104-07-sinkron-dokumentasi-fcm.md`** mengikuti format laporan Dominic yang ada: Berubah; Verifikasi; Temuan/open items; Butuh keputusan user. Sebutkan file/bagian yang diubah dan yang sengaja tidak diubah, sumber bukti, status implementasi/penerimaan sementara, serta keterbatasan rincian uji manual.
- Tidak perlu meminta user mengulang seluruh tes atau merinci kasus yang belum berhasil untuk menyelesaikan sinkronisasi ini. Catat ketidakpastiannya dan selesaikan dokumentasi dengan informasi yang tersedia.
