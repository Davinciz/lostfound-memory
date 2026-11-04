# Lost & Found — Catatan presenter

Tanggal status: 1 November 2026. Total alokasi: 555 detik (9 menit 15 detik).

## 1. Judul proyek (25 detik)

Perkenalkan proyek PBL kami, Campus Lost & Found atau CLF. Aplikasi ini membantu warga kampus melaporkan, mencari, dan mengembalikan barang. Presentasi ini menjelaskan fungsi aplikasi dan progres yang tercatat sampai 1 November 2026.

Sumber (tidak dibacakan):
- D:\ObsidianVault\PBL\Documents\RPP.md
- D:\ObsidianVault\PBL\Documents\PRD.md

## 2. Anggota kelompok (35 detik)

Tim terdiri atas empat mahasiswa D3 Teknik Informatika. Seluruh anggota tercatat memiliki peran pengembangan, basis data, serta pemrograman UI/UX. Dosen pendamping kami adalah Bapak Amran Yobioktabera. Sebutkan nama anggota secara bergantian bila diperlukan.

Sumber (tidak dibacakan):
- D:\ObsidianVault\PBL\Documents\RPP.md

## 3. Deskripsi proyek (40 detik)

CLF adalah aplikasi mobile untuk mahasiswa, dosen, dan karyawan kampus. Pengguna melaporkan barang hilang maupun temuan, lalu mencari laporan yang sesuai. Claim berarti pengajuan terkait barang pada laporan target. Kedua pihak memverifikasi kepemilikan melalui chat dan mencatat serah terima dengan foto. Admin membantu mengelola data.

Sumber (tidak dibacakan):
- D:\ObsidianVault\PBL\Documents\PRD.md
- D:\ObsidianVault\PBL\Documents\TechnicalReference.md

## 4. Latar belakang (40 detik)

Informasi kehilangan di kampus biasanya tersebar di grup pesan, media sosial, atau pengumuman manual. Pesan mudah tertimbun sehingga orang sulit mencari kembali informasi yang dibutuhkan. Foto dan lokasi juga belum tercatat dengan seragam. Karena itu, proyek ini memusatkan laporan dan menyediakan alur komunikasi serta pengembalian yang lebih jelas.

Sumber (tidak dibacakan):
- D:\ObsidianVault\PBL\Documents\RPP.md
- D:\ObsidianVault\PBL\Documents\PRD.md

## 5. Tujuan dan manfaat (40 detik)

Tujuannya adalah memudahkan pelaporan, pencarian, verifikasi, dan pencatatan pengembalian barang. Bagi pengguna, foto dan titik lokasi membantu menilai apakah barang yang ditemukan sesuai. Chat membantu kedua pihak memeriksa ciri khusus barang. Bagi admin, data yang terkumpul memudahkan pengelolaan laporan dan claim.

Sumber (tidak dibacakan):
- D:\ObsidianVault\PBL\Documents\RPP.md
- D:\ObsidianVault\PBL\Documents\PRD.md

## 6. Modul pelaporan dan pencarian (55 detik)

Empat modul pertama mendukung pelaporan dan pencarian. Pengguna masuk dengan akun Google kampus dan melihat profil serta riwayat laporan. Laporan memuat identitas barang, foto, tanggal, dan lokasi. Kamera, galeri, pin peta, serta saran gedung membantu melengkapi laporan. Pencarian kemudian membantu pengguna menemukan laporan yang relevan.

Sumber (tidak dibacakan):
- D:\ObsidianVault\PBL\Documents\PRD.md
- D:\ObsidianVault\PBL\Documents\TechnicalReference.md
- D:\ObsidianVault\PBL\DailyChanges\2026-11-01.md

## 7. Modul pengembalian dan pengelolaan (55 detik)

Setelah menemukan laporan yang sesuai, pengguna dapat mengajukan claim langsung tanpa wajib membuat laporan sendiri. Chat dipakai untuk membahas ciri kepemilikan dan mengatur pertemuan. Foto serah terima mencatat penyelesaian. Admin mengelola data dan membantu pemantauan. Modul notifikasi bertujuan memberi kabar perubahan proses, tetapi integrasinya masih sebagian.

Sumber (tidak dibacakan):
- D:\ObsidianVault\PBL\Documents\PRD.md
- D:\ObsidianVault\PBL\Documents\TechnicalReference.md
- D:\ObsidianVault\PBL\DailyChanges\2026-11-01.md

## 8. Progres akun, laporan, dan pencarian (50 detik)

Modul inti sudah tersedia. Login mahasiswa pernah diuji pada HP fisik. Pelaporan, foto, dan lokasi sudah digunakan. Perbaikan terbaru memastikan submit laporan tidak membuat aplikasi crash, baik dengan maupun tanpa izin lokasi. Perbaikan pencarian dan pembagian halaman memiliki bukti pengujian backend. Namun, pemeriksaan semua layar dan seluruh jenis akun tetap perlu dilanjutkan.

Sumber (tidak dibacakan):
- D:\ObsidianVault\PBL\Documents\TechnicalReference.md §14
- D:\ObsidianVault\PBL\Documents\Lost&Found Progress.md: Archive dan UI v3
- D:\ObsidianVault\PBL\Inbox\reports\Ajax-261101-07-fix-location-dispose-crash.md
- D:\ObsidianVault\PBL\Inbox\reports\Dominic-261101-08-catat-fix-crash-lokasi.md

## 9. Progres claim dan serah terima (60 detik)

Claim langsung, keputusan penerima, pencabutan oleh pengaju, dan serah terima dengan foto sudah tersedia. Perbaikan HTTP 500 dan transport unggah foto sudah memiliki bukti uji otomatis serta konfirmasi manual pengguna. Angka pengujian berasal dari patch tersebut, bukan bukti semua kombinasi sudah diuji. Pengujian seluruh peran, kamera dan galeri masih perlu dilengkapi. Penutupan otomatis claim pending lain belum tersedia.

Sumber (tidak dibacakan):
- D:\ObsidianVault\PBL\Inbox\reports\GPT-261101-05-fix-withdraw-500-transfer-policy.md: Konfirmasi akhir user
- D:\ObsidianVault\PBL\Inbox\reports\GPT-261101-05-fix-upload-foto-serah-terima.md: Konfirmasi akhir user
- D:\ObsidianVault\PBL\DailyChanges\2026-11-01.md

## 10. Progres chat dan arsip (65 detik)

Chat real time sudah teruji pada dua HP, dan kartu konteks barang sudah dikonfirmasi berhasil. Fitur arsip serta hapus untuk saya merupakan tambahan terbaru. Kode backend dan Flutter sudah digabung, tetapi hal itu belum membuktikan penerapannya di server. Lima pengujian Flutter baru lulus dalam suite terbaru. Dua puluh tiga kasus backend belum bisa dijalankan. Uji manual dua akun, migrasi produksi, dan scheduler masih perlu diverifikasi.

Sumber (tidak dibacakan):
- D:\ObsidianVault\PBL\Documents\Lost&Found Progress.md: Real-Time Chat
- D:\ObsidianVault\PBL\DailyChanges\2026-11-01.md: status merge report_context
- D:\ObsidianVault\PBL\Inbox\reports\Bob-261101-09-arsip-hapus-chat-backend.md
- D:\ObsidianVault\PBL\Inbox\reports\Ajax-261101-10-arsip-hapus-chat-ui.md
- D:\ObsidianVault\PBL\Inbox\reports\Dominic-261101-11-sinkron-arsip-hapus-chat.md

## 11. Progres admin dan fitur pendukung (50 detik)

Admin sudah memiliki pengelolaan laporan, claim, gedung, dan pengguna. Pengujian manual sebelumnya memastikan halaman daftar, detail, tambah, serta ubah laporan bekerja. Aksi claim di Filament belum memiliki pengujian otomatis khusus. Pengiriman notifikasi claim tersedia sebagian pada backend, tetapi penanganan claim di Flutter dan uji notifikasi perangkat belum selesai. WhatsApp masih memerlukan fasilitas pengisian nomor.

Sumber (tidak dibacakan):
- D:\ObsidianVault\PBL\Documents\TechnicalReference.md §11, §17
- D:\ObsidianVault\PBL\Documents\Lost&Found Progress.md: Archive, Push Notification, Nomor WhatsApp
- D:\ObsidianVault\PBL\DailyChanges\2026-11-01.md

## 12. Progres keseluruhan proyek (40 detik)

Secara keseluruhan, alur utama sudah tersedia dan sebagian sudah diuji pada perangkat. Kami belum menyatakan seluruh proyek selesai. Fokus berikutnya adalah menguji arsip dan hapus chat pada dua akun, memastikan penjadwal otomatis bekerja di server, melengkapi notifikasi claim, serta memeriksa seluruh layar. Kami menggunakan status berbasis bukti karena dokumentasi tidak menetapkan persentase progres resmi. Terima kasih.

Sumber (tidak dibacakan):
- D:\ObsidianVault\PBL\DailyChanges\2026-11-01.md
- D:\ObsidianVault\PBL\Inbox\reports\Dominic-261101-11-sinkron-arsip-hapus-chat.md
- D:\ObsidianVault\PBL\Documents\TechnicalReference.md §17
