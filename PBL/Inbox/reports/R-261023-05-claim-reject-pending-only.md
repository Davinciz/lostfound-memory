---
type: report
task: T-261023-05
from: backend
outcome: succeeded
branch: fix/claim/reject-pending-only
commits: a262255 fix(claim): reject hanya untuk claim pending, tidak ubah status laporan
updated: 2026-10-23
summary: Reject claim kini hanya untuk pending, tidak lagi mengubah status laporan, 182 test lulus.
---
- Berubah: `ClaimDecisionService::reject` (lockForUpdate + cek status pending, lempar `ClaimNotPendingException::reject()`, blok reset laporan ke 'pending' dihapus); `ClaimNotPendingException::reject()` factory baru; `AdminController::rejectClaim` tangkap exception -> 422; Filament aksi Tolak tangkap exception -> notifikasi warning; `tests/Feature/ClaimNullSafeAdminTest.php` (1 test karakterisasi diubah + 3 test baru).
- Verifikasi: baseline 179 test; setelah perubahan `php artisan test --compact` = 182 lulus / 486 assertions. `php artisan route:list --path=claims` tetap 12 route, tidak berubah. `vendor/bin/pint --dirty` passed. `git push` berhasil ke origin.
- Test lama diubah: `test_reject_accepted_claim_does_not_check_status` -> `test_reject_accepted_claim_returns_422` (sekarang 422, claim tetap accepted, laporan tetap claimed). Tidak ada test lain yang mengasumsikan reject mereset laporan.
- Temuan/risiko: admin tidak bisa lagi menolak claim accepted lewat endpoint ini (sesuai keputusan; alur batal setelah accepted ditunda ke Phase 1.2 withdraw/closed_reason). Filament aksi Tolak tetap `->required()` untuk admin_note sedangkan API nullable, tidak diubah (di luar lingkup).
- Butuh keputusan user: tidak ada; PR + merge dikerjakan user.