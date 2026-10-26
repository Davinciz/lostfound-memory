---
type: report
task: Bob-261025-03
from: backend
outcome: succeeded
branch: fix/notification/fcm-api-audit
commits: 3b65f5d fix(notification): redaksi token FCM dari log kegagalan kirim
updated: 2026-10-25
summary: Audit FCM v8 bersih; tidak ada API usang, hanya kebocoran token di log yang diperbaiki.
---
- Berubah: app/Services/ClaimNotificationService.php:74-80 + ClaimTransferService.php:89-95 redaksi token di pesan exception sebelum Log::warning; 3 test baru (2 ClaimNotificationTest, 1 ClaimTransferTest).
- Audit file+baris: ClaimNotificationService.php:9-11,66-73 (CloudMessage::new()->withToken()->withNotification()->withData(), Messaging::send — valid v8) | ClaimTransferService.php:13-15,82-88 (sama) | routes/, database/, config/firebase.php: tidak ada pemakaian API FCM | Filament ClaimResource/UserResource: Notification::make() milik Filament, bukan FCM | ConversationController: tidak ada notifikasi FCM | tests: hanya mock Messaging, tanpa CloudMessage usang.
- API v8 terverifikasi di vendor/kreait/firebase-php (8.5.0): CloudMessage::new(), withToken(), withNotification(), withData(), Notification::create() semua ada; withTarget() memang tidak ada dan sudah tidak dipakai.
- Verifikasi (hasil asli): php artisan test 235 -> 238 lulus, 645 assertion. vendor/bin/pint --test: gagal pada 7 file lama yang tidak disentuh (test_fcm.php, GoogleTokenVerifier.php, dll) — sudah begitu di develop; `pint --dirty` lulus.
- Temuan / open items: (1) test_fcm.php tracked di root repo memakai CloudMessage::withTarget (v8 tidak ada) dan hardcode service account path — usul hapus/dikeluarkan dari repo. (2) NotFound/SenderIdMismatch = token permanen mati; usul null-kan users.fcm_token saat exception itu, belum diimplementasikan. (3) Belum ada retry/backoff untuk ServerUnavailable.
- Butuh keputusan user: setujui hapus test_fcm.php dan penanganan token kedaluwarsa (usulan 1 & 2)?