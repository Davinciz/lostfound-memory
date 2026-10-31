---
type: report
task: Bob-261029-06
from: backend
outcome: blocked
branch: feature/filament/admin-landing
commits: -
updated: 2026-10-29
summary: Test tidak aman dijalankan, DB_HOST mengarah ke server remote yang sama dengan produksi
---
- Berubah: -

- Verifikasi: Tidak dijalankan (LANGKAH 0 gagal)

- Temuan / open items:
  - KEAMANAN: phpunit.xml tidak override DB_HOST, mengambil dari .env yang berisi DB_HOST=114.12.14.131 (server remote)
  - Test memakai RefreshDatabase yang akan DROP semua tabel di database lostfound_testing pada host tersebut
  - Tidak aman menjalankan test tanpa konfirmasi bahwa 114.12.14.131:5432/lostfound_testing adalah DB testing terpisah yang aman dihapus
  - Timeout sebelumnya (laporan Bob-261029-04) menunjukkan koneksi ke 114.12.14.131:5758 gagal; port berbeda (5432 vs 5758) perlu dicek
  - Solusi: buat .env.testing dengan DB_HOST=127.0.0.1 (PostgreSQL lokal) atau DB_CONNECTION=sqlite dengan DB_DATABASE=:memory:
  - Migration 2026_10_01_100002_lowercase_status_defaults_and_constraints.php pakai raw SQL PostgreSQL-specific (DROP CONSTRAINT, ALTER COLUMN) yang tidak support SQLite

- Butuh keputusan user:
  - Konfirmasi 114.12.14.131:5432/lostfound_testing aman untuk RefreshDatabase, ATAU
  - Buat .env.testing dengan DB lokal (PostgreSQL 127.0.0.1 atau SQLite :memory:), ATAU
  - Skip test untuk tugas ini dan lanjut fix lainnya (top_buildings query, timezone WIB, font path, revert migration)
