---
type: report
task: Bob-261024-03
from: backend
outcome: succeeded
branch: feature/claim/user-withdraw
commits: 97d49c7 feat(claim): endpoint withdraw claim oleh pengaju
updated: 2026-10-24
summary: Endpoint withdraw claim oleh pengaju sudah live; claim accepted mengembalikan laporan claimed ke pending, accepted_at tetap sebagai jejak. Push berhasil.
---
- Berubah: `app/Services/ClaimWithdrawService.php` (baru), `app/Exceptions/ClaimNotPendingException.php` (factory `withdraw()`), `app/Policies/ClaimPolicy.php` (withdraw = hanya claimant), `app/Http/Controllers/ClaimController.php` (method `withdraw`), `routes/api.php` (+1 route), `tests/Feature/ClaimUserWithdrawTest.php` (baru, 16 test).
- Verifikasi (hasil asli): `php artisan test --compact` baseline **199** → **215 passed, 574 assertions** (16 test baru). `route:list --path=claims` = **15 route** (14 → 15, tepat +1). `vendor/bin/pint --dirty` passed.
- Keputusan desain: (1) service terpisah `ClaimWithdrawService` — logika restore laporan berbeda dari accept/reject, jadi tidak menumpuk di `ClaimDecisionService`; (2) `accepted_at` tidak di-null-kan saat withdraw (jejak riwayat sesuai prompt); (3) validasi `reason` pakai `required|string|min:1`; (4) id non-UUID tidak ditangani khusus (di luar lingkup) — Postgres akan error 500 jika diformat salah, sama seperti endpoint claim lain.
- Temuan / risiko: respons claim masih `User` mentah (tugas `UserResource` terpisah). Race accept-vs-withdraw belum diuji (1.2c). FCM belum ada (1.2c). Push sukses; PR ke develop belum dibuat.
- Butuh keputusan user: tidak ada (tinggal buat PR squash-merge ke develop: https://git.informatikapolines.id/Daniel_Geovani/lostfound-backend/pulls/new/feature/claim/user-withdraw).