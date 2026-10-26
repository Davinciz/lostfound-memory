---
type: report
task: T-261023-03
from: backend
outcome: succeeded
branch: fix/claim/null-safe-claim-access
commits: 2897503 fix(claim): null-safe admin accept/reject, ClaimPolicy penerima, otorisasi IDOR
updated: 2026-10-23
summary: Phase 1b-i selesai; admin accept/reject NULL-safe, ClaimPolicy penerima, IDOR B-1 teratasi, 179 test lulus.
---
- Berubah: Claim::receiverId() + isReceiver() di model, ClaimPolicy (view/update/markTransferred), ClaimDecisionService (accept lockForUpdate + transaction, reject NULL-safe), AdminController pakai service, ClaimController index scope non-admin + authorize show/update, Filament ClaimResource aksi Terima/Tolak pakai service + infolist/form NULL-safe (required conditional, visible conditional, placeholder), ClaimConversationService delegasi ke model, test baru ClaimAccessTest (16) + ClaimNullSafeAdminTest (8).
- Verifikasi: baseline 155 test; setelah perubahan `php artisan test` 179 lulus / 473 assertions. `php artisan route:list --path=claims` 12 route tidak berubah. `git push` berhasil ke origin.
- Temuan: `ClaimDecisionService::reject` tidak cek status claim sebelumnya (semantik lama dipertahankan; test karakterisasi `test_reject_accepted_claim_does_not_check_status` lulus). Bila ada claim lain accepted pada laporan yang sama, menolak claim pending lain mengembalikan laporan ke pending (side effect tidak diubah, sudah dicatat). Filament Livewire test tidak dibuat (sulit mock Filament action + keluar lingkup MVP).
- Butuh keputusan user: apakah semantik reject (tidak cek status claim) perlu diperbaiki atau tetap seperti sekarang.