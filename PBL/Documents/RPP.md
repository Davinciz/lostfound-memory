|                           |     |                                                |
| ------------------------- | --- | ---------------------------------------------- |
| **Ringkasan Proyek**      |     |                                                |
| Nomor ID                  | :   | PBL-202601-10                                  |
| Pengusul dan Klien Proyek | :   | D3 Teknik Informatika                          |
| Dosen Pendamping          | :   | *AMRAN YOBIOKTABERA , S. Kom., M.Kom.*         |
| Judul Proyek              | :   | Penerapan Aplikasi Mobile "Lost & Found (CLF)" |
| Luaran                    | :   | Aplikasi Berbasis *Mobile*                     |
| Sponsor                   | :   | *-*                                            |
| Waktu                     | :   | *1 Semester*                                   |

## 1. Latar Belakang Masalah

## Di lingkungan kampus, kehilangan dan penemuan barang merupakan kejadian yang cukup sering terjadi, mulai dari dompet, kunci, kartu identitas, hingga perangkat elektronik. Proses pelaporan dan pencarian barang yang hilang maupun ditemukan berdampak langsung pada kenyamanan dan produktivitas mahasiswa, karena barang-barang tersebut umumnya memiliki nilai penting maupun nilai sentimental bagi pemiliknya.

## Saat ini, proses pelaporan barang hilang atau ditemukan di lingkungan kampus masih dilakukan secara tidak terstruktur, misalnya melalui grup WhatsApp, grup Telegram, media sosial, pengumuman manual, maupun bertanya langsung kepada mahasiswa atau petugas. Cara-cara tersebut membuat informasi sulit dicari kembali, cepat tertimbun oleh pesan lain, dan tidak memiliki sistem pengelolaan laporan yang terpusat sehingga proses pencocokan antara barang hilang dan barang ditemukan menjadi tidak efisien.

## Menghadapi tantangan tersebut, dibutuhkan sebuah platform digital yang dapat menyatukan proses pelaporan, pencarian, dan pengembalian barang hilang maupun ditemukan di lingkungan kampus. Aplikasi mobile “Campus Lost & Found (CLF)” dirancang sebagai jawaban atas kebutuhan ini.

## Penerapan aplikasi CLF diharapkan membawa sejumlah manfaat, di antaranya mempermudah mahasiswa dalam membuat laporan barang hilang maupun ditemukan lengkap dengan foto dan lokasi GPS, mempermudah proses pencarian dan pemfilteran laporan, menyediakan sistem pengajuan dan verifikasi claim untuk proses pengembalian barang, memberikan notifikasi kepada pengguna, membantu menemukan kemungkinan kecocokan antara laporan barang hilang dan ditemukan, serta menyediakan dashboard admin untuk mengelola seluruh data secara terpusat.

## 2. Desain Umum dan Kontruksi Produk

## Sistem dikembangkan sebagai aplikasi mobile menggunakan Flutter, dengan Laravel sebagai REST API backend yang diautentikasi menggunakan Laravel Sanctum, basis data MySQL, dan Filament sebagai admin panel untuk pengelolaan data oleh admin. Flutter tidak terhubung langsung ke Filament, melainkan berkomunikasi dengan Laravel melalui REST API.

## 3. Kebutuhan Peralatan/Perangkat dan Bahan/Komponen

| **Fase/Proses** | **Peralatan/Perangkat (Software dan Hardware)** |  |  | **Bahan** |
| --- | --- | --- | --- | --- |
|  | **Nama** | **Jumlah** | **Catatan** |  |
| **Conceive** | Gitea | 1 |  | a. Laravel 11<br>b. MySQL Server<br>c. PHP 8.3.33<br>d. Flutter |
|  | Word Processing App | n | sesuai jumlah anggota |  |
| **Design** | Gitlab | 1 |  |  |
|  | Figma | n | sesuai jumlah anggota |  |
|  | Web Server | n | sesuai jumlah anggota |  |
|  | Database Server | n | sesuai jumlah anggota |  |
| **Implement** | Gitea | 1 |  |  |
|  | Visual Studio Code | n | sesuai jumlah anggota |  |
|  | Web Server | n | sesuai jumlah anggota |  |
|  | Database Server | n | sesuai jumlah anggota |  |
| **Operate** | Gitea | 1 |  |  |
|  | Database Server | n | sesuai jumlah anggota |  |
|  | Web Server | n | sesuai jumlah anggota |  |

## 4. Estimasi Waktu dan Pengerjaan

| **Tahap** | **Fase/Proses** | **Uraian Pekerjaan** | **Estimasi Waktu** |
| --- | --- | --- | --- |
| **C** | Identifikasi permasalahan | Mendeskripsikan masalah yang dihadapi oleh *client* | 4 minggu |
|  | Identifikasi kebutuhan aplikasi | Menentukan *functional* dan *non-functional requirements* |  |
| **D** | Perancangan UI/UX Aplikasi | Merancang tampilan antarmuka aplikasi | 2 minggu |
|  | Perancangan Basis Data | Merancang basis data |  |
| **I** | Pengembangan Modul Login dan Home | Pengembangan modul login dan home | 2 minggu |
|  | **UTS (Progress Report)** | Presentasi Progress Report di Hadapan Dosen Pengampu dan Manajer Proyek | 1 minggu (minggu ke-7) |
|  | Evaluasi Usulan | Mengevaluasi setiap usulan dari dosen | 1 minggu |
|  | Pengembangan Modul Home dan Lupa Password | Pengembangan modul buat laporan lost dan found oleh pengusul | 2 minggu |
|  | Pengembangan Modul Upload Foto, GPS, dan Claim | Pengembangan modul upload foto, GPS, dan pengajuan claim | 2 minggu |
|  | Penyusunan Rencana Pengujian | Menyusun skenario pengujian | 1 minggu |
|  | Pengujian Aplikasi | Melakukan pengujian aplikasi sesuai dengan skenario yang telah dibuat | 1 minggu |
| **O** | Perbaikan Aplikasi | Melakukan perbaikan pada bug yang telah ditemukan | 1 minggu |
|  | **UAS (Demo Aplikasi)** | Presentasi Hasil di Hadapan Dosen Pengampu | 1 minggu<br>(minggu ke-16) |

## 5. Tim Proyek

| **No** | **Nama** | **NIP/NIM** | **Peran/Role** |
| --- | --- | --- | --- |
| 1 | *AMRAN YOBIOKTABERA , S. Kom., M.Kom.* | 198810142019031007 | Dosen Pendamping |
| 2 | Anisa Aulia | 3.34.25.1.04 | Developer, Database, UI/UX Programmer |
| 3 | Daniel Arvin Geovani | 3.34.25.1.05 | Developer, Database, UI/UX Programmer |
| 4 | Muhammad Tsaqif Satria Firmansyah | 3.34.25.1.18 | Developer, Database, UI/UX Programmer |
| 5 | Steven Hermawan | 3.34.25.1.25 | Developer, Database, UI/UX Programmer |

## 6. Ruang Kerja (*Workspace*)/Laboratorium/*Workshop*

| **No** | **Proses** | **Lokasi** |
| --- | --- | --- |
| 1 | Conceive | Laboratorium, Ruang Kelas GKT, Co-working Space MST Lt. 2, Remote |
| 2 | Design | Laboratorium, Ruang Kelas GKT, Co-working Space MST Lt. 2, Remote |
| 3 | Implement | Laboratorium, Ruang Kelas GKT, Co-working Space MST Lt. 2, Remote |
| 4 | Operate | Laboratorium, Ruang Kelas GKT, Co-working Space MST Lt. 2, Remote |

## 7. Monitoring dan Evaluasi

## Monitoring dan Evaluasi dilakukan menggunakan fitur Milestone dan Issue pada Platform Gitea. Selain itu, platform Gitea juga digunakan untuk *repository code* pada proyek ini.

## 8. Persetujuan

Semarang,……………………

Ketua Program Studi Dosen Pengampu,

D3 Teknik Informatika,

Idhawati Hestiningsih, S.Kom, M.Kom. Amran Yobioktabera, S. Kom., M.Kom.

NIP. 197711192008012013 NIP. 198810142019031007
