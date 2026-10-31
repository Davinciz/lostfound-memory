---
type: report
task: Bob-261029-07
from: backend
outcome: succeeded
branch: feature/filament/admin-landing
commits:
  - 80c30db revert(filament): restore migration to develop state
  - f0a8a5c fix(filament): fix topBuildings query with UNION ALL approach
updated: 2026-10-29
summary: Fix topBuildings PostgreSQL GROUP BY error dengan UNION ALL, timezone WIB, font path, test suite 265 lulus
---
## Berubah
- app/Services/LandingStats.php: topBuildings() UNION ALL lost+found reports lalu COUNT, fix PostgreSQL strict GROUP BY
- resources/views/landing.blade.php: @font-face URL match nama file woff2
- tests/Feature/LandingPageTest.php: syntax fix (extra brace baris 186), asersi WIB, topBuildings, tren
- public/fonts/: 4 file plus-jakarta-sans-latin-{400|500|600|700}-normal.woff2 (hapus nested dir)
- database/migrations/2026_10_01_100001_add_missing_user_foreign_keys.php: revert ke develop (commit 80c30db)

## Verifikasi
- php artisan test --filter=LandingPageTest: 11 tests lulus, 46 assertions
- php artisan test --compact: 265 tests lulus, 723 assertions (baseline 235 + 30 landing)
- vendor/bin/pint --test app/Services/LandingStats.php tests/Feature/LandingPageTest.php: lulus
- git diff develop --stat: 6 file berubah (controller, service, view, test, fonts), +971 -3
- php artisan serve: DB remote timeout (production .env), cache 5 menit. Test suite pakai .env.testing lokal sudah lulus, verifikasi curl bukan scope (data sensitif di remote).

## Temuan
- PostgreSQL strict mode: subquery column tidak bisa di HAVING/SELECT setelah GROUP BY outer query. Fix: UNION ALL building_id dari lost+found, lalu COUNT.
- Timezone WIB: batas hari dan pengelompokan tren pakai DateTimeImmutable Asia/Jakarta, konversi ke storage timezone untuk query, kelompok di PHP → tidak bergantung DB driver.
- Font path bersarang: download bunny.net ke public/fonts/ langsung (bukan nested public/fonts/public/).
- Test syntax error: extra `{` baris 186 setelah multiple patch → hapus manual.

## Open Items
- .gitignore modified (tambah .env.testing baris 36) → tidak di-commit (bukan scope landing page).
- php artisan serve pakai .env production (remote 114.12.14.131) → cache clear gagal timeout. Test suite dengan .env.testing lokal sudah memverifikasi query dan privasi.
