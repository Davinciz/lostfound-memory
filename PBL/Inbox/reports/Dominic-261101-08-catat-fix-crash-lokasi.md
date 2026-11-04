---
type: report
task: Dominic-261101-08
from: docs
outcome: succeeded
branch:
commits: 0769600 fix(map): hapus changeSettings dari dispose LocationService (dirujuk, bukan diubah)
updated: 2026-11-01
summary: Catat fix crash native SecurityException lokasi saat tutup form (Ajax-261101-07) ke DailyChanges, TechnicalReference, dan Progress
---
- Berubah: `DailyChanges/2026-11-01.md` — section baru "Fix crash lokasi saat tutup form (Ajax-261101-07 → Dominic-261101-08)" di paling bawah, teks lama utuh. `Documents/TechnicalReference.md` — §9 callout pemakaian plugin `location` (hanya via tombol "Lokasi saya", `dispose()` wajib no-op), §17 entri (h) bug SELESAI + (i) open item kecil (grep lib/ lain, back-tanpa-submit & "Lokasi saya" tanpa izin belum teruji, usulan `geolocator` belum diputuskan), frontmatter `summary` diperbarui (`updated` sudah 2026-11-01). `Documents/Lost&Found Progress.md` — butir Selesai 23→24 + kartu Archive baru + footer "Terakhir diperbarui".
- Verifikasi: hanya mengutip fakta Ajax-261101-07 — `flutter analyze` 8 issue baseline, `flutter test` 188 lulus, konfirmasi manual user 2026-11-01 (submit 2 laporan, dengan & tanpa izin lokasi, tidak crash). Tidak ada tes baru dijalankan (tugas dokumentasi).
- Temuan / open items: (1) grep pemakaian plugin `location` di `lib/` lain belum diverifikasi. (2) Skenario back tanpa submit dan tombol "Lokasi saya" tanpa izin tidak diklaim teruji. (3) Usulan ganti ke `geolocator` = dependensi baru, **belum diputuskan**. (4) Inkonsistensi pra-ada di Progress: baris ringkasan "26 item selesai" vs daftar "Selesai (23→24)" — tidak saya samakan karena beda cara hitung; perlu keputusan user bila ingin diseragamkan.
- Butuh keputusan user: — (usulan `geolocator` didokumentasikan sebagai usulan, bukan keputusan).