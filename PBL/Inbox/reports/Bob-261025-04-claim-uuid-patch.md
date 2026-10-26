---
type: report
task: Bob-261025-04
from: backend
outcome: succeeded
branch: fix/claim/uuid-route-and-patch
commits: b1059d5 fix(claim): constraint UUID pada route claim dan hapus PATCH /claims/{id}
updated: 2026-10-25
summary: Route claim diberi constraint UUID (non-UUID -> 404) dan PATCH /claims/{id} dihapus.
---
- Berubah: routes/api.php (whereUuid pada claims/{id} show/accept/reject/withdraw, claims/{claim}/mark-transferred, admin/claims/{id}/accept|reject), ClaimController::update dihapus, ClaimAccessTest (2 tes PATCH lama diganti 3 tes baru: show & accept non-UUID 404, PATCH UUID valid 405).
- Verifikasi (hasil asli): `php artisan test` sebelum 238 lulus / sesudah 239 lulus, 646 assertions. `php artisan route:list --path=claims` -> PATCH api/claims/{id} hilang, PATCH api/claims/{claim}/mark-transferred tetap. `vendor/bin/pint --test` pada 3 file yang diubah: passed.
- Temuan / open items: (1) `vendor/bin/pint --test` seluruh repo FAIL di 7 file pre-existing, tidak tersentuh tugas ini: ListClaims.php, EditUser.php, ListUsers.php, AdminMiddleware.php, GoogleTokenVerifier.php, bootstrap/providers.php, test_fcm.php. (2) ClaimPolicy::update TETAP dipertahankan karena dipakai Filament ClaimResource (EditAction baris 221). (3) Route lain dengan masalah ID non-UUID sama, sengaja tidak diubah: lost-reports/{id}, found-reports/{id}, conversations/{id}/messages, messages/{id}/read.
- Butuh keputusan user: apakah 7 file pint di atas dirapikan di tugas terpisah, dan apakah constraint UUID untuk route non-claim dikerjakan sekarang.