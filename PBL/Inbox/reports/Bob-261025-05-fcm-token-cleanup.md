---
type: report
task: Bob-261025-05
from: backend
outcome: succeeded
branch: fix/notification/fcm-token-cleanup
commits: 2b24626 chore(notification): hapus test_fcm.php usang | 80d00c4 fix(notification): kosongkan fcm_token yang sudah mati
updated: 2026-10-25
summary: Hapus test_fcm.php usang dan bersihkan fcm_token permanen mati (NotFound/SenderIdMismatch) di dua jalur FCM claim.
---
- Berubah: `git rm test_fcm.php` (hanya ref dokumen di docs/, tidak ada di composer.json/phpunit.xml); helper baru `app/Services/DeadFcmTokenCleaner.php` dipakai `ClaimNotificationService::sendTo` dan `ClaimTransferService::notifyClaimant`.
- Verifikasi: `php artisan test` 239 → 247 lulus (646 → 670 assertions); `vendor/bin/pint --dirty` bersih (hanya merapikan file baru); `git status` bersih di akhir.
- Temuan: `git log --all -S"private_key" -- test_fcm.php` → tidak ada; satu commit riwayat memuat file itu: 8ed0348. Service account JSON: hanya `storage/firebase-service-account.json` di .gitignore, tidak tracked (`git ls-files` tidak menemukannya).
- Detail perilaku: NotFound/SenderIdMismatch → token di-NULL hanya jika masih sama dengan token gagal (refresh token aman); ServerUnavailable/error lain → token tetap, tetap `Log::warning`, redaksi token tetap, request tetap 2xx. Kelas diverifikasi di vendor kreait/firebase-php 8.5.0.
- Butuh keputusan user: riwayat 8ed0348 pernah memuat test_fcm.php (tanpa private_key) — rotasi key jika file itu pernah berisi credential. PR belum dibuat (user).