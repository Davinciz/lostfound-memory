---
type: report
task: Dominic-261031-04
from: docs
outcome: succeeded
branch:
commits:
updated: 2026-10-31
summary: 3 frame UI v3 (Beranda, Detail, Login) dibuat di FigCraft, token/variabel terikat penuh, Detail ditambah Kategori/Peta/Akun.
---
- Berkas: `D:\PBL\Lost&Found - UI v3 (A+B).figcraft` (28.088 byte), halaman `UI v3` + `Komponen`.
- Frame (390x844, gap 80): `01 · Beranda` (id 421), `02 · Detail Barang` (468), `03 · Login` (490). Ekspor: `D:\PBL\_wf3\final_{beranda,detail,login}.png`, revisi terbaru `D:\PBL\_wf5\` dan `D:\PBL\_wf7\detail.png`.
- Revisi Detail Barang (permintaan user): tambah `Kategori` (baris label+nilai, "Dompet"), `Peta` (kartu r24 berisi pin accent + chip lokasi putih center), `Dilaporkan oleh` (avatar inisial ink + nama akun). Blok `Konten` dibangun ulang: gap 18 px, chip lokasi center terhadap pin, konten berakhir y=734 (bar aksi y=760, tidak bertabrakan). Node baru `Konten` id 527 (id lama 506 diganti).
- Komponen master: `Tombol`, `Badge`, `Kartu Hitam`, `Kartu Putih`, `Bottom Nav`. Variabel `Warna`: 9 (8 token + `text-on-ink #CFCABF` untuk meta di kartu hitam — token tambahan, bukan dari spesifikasi; mohon dikonfirmasi masuk Design.md atau diganti `text-secondary`).
- Verifikasi: semua teks `Plus Jakarta Sans`, ukuran 12–40 px (tidak ada <12), 0 fill lepas — semua warna terikat variabel (cek rekursif akhir: `loose []`). Tidak ada teks terpotong/tumpang tindih; deskripsi Detail sempat terpotong (`h=23`) lalu diperbaiki `342x72`.
- Perapian (revisi user "tempatnya masih acak-acakan"): 3 frame disejajarkan ke y=0 (sebelumnya 968) dengan gap 80; Bottom Nav dijadikan 5 slot sama lebar `65,2 px` (total 350 px, padding 12) dengan tiap ikon center di slotnya — sebelumnya slot menumpuk di kiri dan menyisakan blob aktif terpotong di tepi kanan; kartu putih Beranda diseragamkan tinggi 190; ritme Login dirapikan (H1 y196, kalimat y320, Masuk y496, penjelasan y536). Ekspor terbaru: `D:\PBL\_wf5\{beranda,detail,login}.png`.
- Keterbatasan FigCraft: (1) font tidak terpasang, TTF dimuat manual dari `C:\Project`; (2) `ellipse` tidak bisa jadi parent anak → semua lingkaran dibuat frame radius 999; (3) `sizingH/V: hug` hanya sah pada auto layout, `fill` hanya pada parent auto layout; (4) tidak ada perintah `ellipse.arc`/masking, jadi foto memakai placeholder warna sesuai spesifikasi.
- Deviasi: bottom nav = 68 px di y=756 (spesifikasi "bawah 20"), aman dari gesture bar; ikon panah kartu hitam dibuat horizontal (spesifikasi tidak menyebut arah); tidak ada tombol/label teks di nav (sesuai spesifikasi, hanya ikon).
- Kualitas masih perlu dipoles sebelum dokumen Design.md direvisi: (a) padding kiri/kanan beranda 24 px vs lebar kartu grid 164 px sudah pas, tapi jarak antar elemen dalam kartu putih (12 px) lebih kecil dari gap antar bagian (22 px) — sesuai aturan, mohon dicek mata; (b) tidak ada safe-area bottom (34 px) di layar Detail karena tombol aksi y=760; (c) contoh teks masih placeholder.
- Belum: komponen master dibuat sebagai frame, belum dijadikan instance/component set (variants tidak diminta). Auto Layout dipakai pada semua grup konten.
- Butuh keputusan user: setujui `text-on-ink` sebagai token resmi, dan apakah nav butuh varian aktif/nonaktif sebelum dokumen Design.md direvisi (tugas terpisah).