---
type: report
task: Bob-261024-04
from: backend
outcome: succeeded
branch: feature/notification/claim-decision-fcm
commits: 23d0be6 feat(notification): FCM untuk accept, reject, withdraw claim oleh pengguna
updated: 2026-10-24
summary: Fase 1.2c selesai — FCM best-effort accept/reject/withdraw lewat endpoint user, 15 test baru (balapan + notifikasi), suite hijau. Push berhasil.
---
- Berubah: `app/Services/ClaimNotificationService.php` (baru: accepted/rejected/withdrawn, satu helper `sendTo`), `app/Http/Controllers/ClaimController.php` (+4 baris: inject service, panggil setelah service sukses), `tests/Feature/ClaimConcurrencyTest.php` (baru, 6 test), `tests/Feature/ClaimNotificationTest.php` (baru, 9 test). Tidak ada route/file lain berubah.
- Verifikasi (hasil asli): baseline **215 passed** → **230 passed, 620 assertions** (15 test baru). `route:list --path=claims` tetap **15 route**. `vendor/bin/pint --dirty` passed. `ClaimNotificationTest` 9 passed, `ClaimConcurrencyTest` 6 passed.
- Keputusan desain: (1) satu service `ClaimNotificationService` dengan 3 method publik + helper privat `sendTo`, meniru `ClaimTransferService` (lewati tanpa token, try/catch `\Throwable` kosong); (2) withdraw mengambil penerima lewat `Claim::receiverId()` lalu `User::find`, null aman; (3) konteks user diambil ulang dari DB (`User::find`) alih-alih lewat relasi agar tidak terikat cache model; (4) teks & payload sesuai prompt (`type`, `claim_id`); (5) notifikasi dipanggil setelah transaction service selesai, hanya pada sukses.
- Temuan / risiko: **BUG FOUND & FIXED** — `ClaimTransferService::notifyClaimant` masih memakai `CloudMessage::withTarget('token', ...)` yang SUDAH TIDAK ADA di firebase-php 8.5.0 (method dihapus; sekarang `CloudMessage::new()->withToken()`). Efeknya exception ditelan try/catch → notifikasi serah terima saat ini diam-diam tidak pernah terkirim. Service baru memakai API v8 yang benar; `ClaimTransferService` TIDAK saya ubah (di luar lingkup) tapi perlu diperbaiki. Saran lain: jalur admin (`/api/admin/claims/{id}/accept|reject`) dan aksi Filament belum mengirim notifikasi ke pengaju — celah konsistensi, di luar lingkup.
- Butuh keputusan user: ya — (1) izinkan perbaikan satu baris di `ClaimTransferService` (`withTarget` → `new()->withToken`) karena notifikasi serah terima mati; (2) putuskan apakah jalur admin perlu notifikasi juga. Push sukses, PR: https://git.informatikapolines.id/Daniel_Geovani/lostfound-backend/pulls/new/feature/notification/claim-decision-fcm