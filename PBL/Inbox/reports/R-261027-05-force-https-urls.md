---
type: report
task: Bob-261027-05
from: backend
outcome: succeeded
branch: fix/filament/force-https-urls
commits: da1edd8 fix(filament): force HTTPS scheme when APP_URL uses https
updated: 2026-10-27
summary: AppServiceProvider paksa skema https bila APP_URL berawalan https://
---
- Berubah: app/Providers/AppServiceProvider.php boot() tambah URL::forceScheme('https') bila config app.url awalan https://. Test baru tests/Unit/ForceHttpsSchemeTest.php.
- Verifikasi: php artisan test --filter=ForceHttpsSchemeTest: 2 passed 2 assertions. vendor/bin/pint --dirty: fixed whitespace. php artisan route:list: normal.
- Temuan: bootstrap/app.php trustProxies sudah '*' (trust all). 4 hardcoded http:// di app/ cuma validasi str_starts_with, bukan URL generation, aman.
- Butuh keputusan user: -
