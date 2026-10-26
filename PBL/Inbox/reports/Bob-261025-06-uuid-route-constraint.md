---
type: report
task: Bob-261025-06
from: backend
outcome: succeeded
branch: fix/api/uuid-route-constraint
commits: 9283804 fix(api): constraint UUID pada route non-claim
updated: 2026-10-25
summary: whereUuid('id') dipasang di 4 route non-claim (lost/found show, conversations messages GET+POST, messages read); non-UUID kini 404 bukan 500.
---
- Berubah: routes/api.php (4 route + constraint), tests/Feature/UuidRouteConstraintTest.php (5 tes baru). Tidak ada controller/policy/service/model disentuh.
- Verifikasi: PK keempat tabel uuid (cek migrations) — lolos. Pra-fix: 5/5 tes gagal 500 `SQLSTATE[22P02] invalid input syntax for type uuid`. Pasca-fix: `php artisan test` 252 lulus / 675 assertion (baseline 247 + 5). route:list keempat path utuh. `pint --dirty` hanya merapikan file tes baru.
- Temuan: seluruh route api lain ber-param ID sudah ter-constraint (claims & admin/claims). Sisa `{record}` adalah route Filament panel, bukan routes/api.php — tidak diubah.
- Butuh keputusan user: tidak ada.