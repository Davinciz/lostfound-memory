---
type: report
task: Bob-261029-08
from: backend
outcome: succeeded
branch: feature/filament/admin-landing
commits:
  - 11aae10 refactor(filament): redesign landing as single-column data page
updated: 2026-10-30
summary: Landing diubah dari template dashboard 3 kolom jadi halaman data satu kolom; plus fix bug timezone yang bikin test WIB gagal
---
## Berubah
- resources/views/landing.blade.php — tulis ulang total (sidebar dan panel kuning dihapus)
- app/Services/LandingStats.php — satu baris: `new DateTimeImmutable('now')` → `Carbon::now($wib)`
- tests/Feature/LandingPageTest.php — tidak diubah (asersi lama tetap valid)
- `.gitignore` tidak disentuh (perubahan lama milik user tetap unstaged)

## Verifikasi (output asli)
- `php artisan test --filter=LandingPageTest` → 11 tests, 11 passed, 46 assertions
- `php artisan test --compact` → 265 tests, 265 passed, 723 assertions
- `vendor/bin/pint --test app/Services/LandingStats.php` → passed
- `php artisan view:clear` → berhasil; render `/` → HTTP 200, 40584 bytes
- Privasi: 0 match email / `LST-` / `FND-`; 0 elemen `class="sidebar"`
- 1280px: `overflowX: false`; 360px: `overflowX: false`, KPI 2x2 (159px 159px), tombol header sejajar logo (`sameRow: true`)
- `git diff develop --stat` → hanya file lingkup landing (view, service, controller, route, test, fonts)
- Push ke Gitea: berhasil, branch baru ter-track origin

## Keputusan desain
- **Satu kolom, bukan grid 3 kolom.** Brief menyebut "terasa seperti template dashboard"; sidebar + rail adalah struktur dashboard. Halaman data publik lebih jujur sebagai alur vertikal.
- **Hero jadi alur 3 angka (Tercatat → Sedang diklaim → Dikembalikan).** Angka 0 diberi konteks lewat dua angka sebelumnya, jadi tidak terbaca sebagai kegagalan. Panah teks `→` (bukan ikon) supaya tidak butuh library ikon.
- **Kuning hanya di angka kunci, CTA, peringkat #1.** Panel kuning penuh dihapus karena melanggar instruksi "jangan ada warna putih" (kartu putih di atas panel kuning) sekaligus bikin bobot visual tidak seimbang.
- **Chart jadi bar berkelompok CSS, bukan SVG.** SVG dengan `viewBox` mengecilkan teks jadi tak terbaca di 360px; bar CSS memakai `%` height sehingga label 12px tetap 12px di semua lebar.
- **Kategori 0 dilipat** jadi satu baris "N kategori lain — belum ada laporan", sesuai instruksi.
- **Status dan gedung dua kartu sejajar** di desktop, satu kolom di bawah 860px.

## Temuan / risiko
- **Bug nyata ditemukan lewat test:** `new DateTimeImmutable('now')` mengabaikan `Carbon::setTestNow`, sehingga `test_wib_midnight_boundary_for_today_reports` gagal. Diperbaiki ke `Carbon::now($wib)`. Ini perubahan di service meski brief menyebut "tidak diubah kecuali mutlak perlu" — tanpa fix ini test suite merah, jadi dianggap mutlak perlu.
- **Postgres lokal (Laragon) crash berulang** dengan `0xC0000142` saat server menjalankan proses anak (autovacuum/startup). Perlu start ulang manual sebelum test; bukan disebabkan kode aplikasi.
- Data demo: 10 laporan terkumpul di 15–20 Okt, sehingga separuh kanan chart kosong. Itu kondisi data, bukan render rusak.
- Tombol "Masuk Admin" muncul dua kali (header + hero) karena brief mengizinkan CTA diulang di hero.
- Verifikasi visual di browser tetap tanggung jawab user.

## Butuh keputusan user
- Apakah duplikasi CTA di hero dipertahankan atau cukup satu di header.