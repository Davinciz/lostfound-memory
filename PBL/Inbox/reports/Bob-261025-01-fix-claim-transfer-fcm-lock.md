---
type: report
task: Bob-261025-01
from: backend
outcome: succeeded
branch: fix/claim/transfer-fcm-and-lock (lokal; push belum berhasil)
commits: a0226b4 fix(claim): pakai API FCM v8 dan guard status transfer dalam transaction; 8d24d2c fix(notification): log kegagalan kirim FCM alih-alih menelan exception
updated: 2026-10-25
summary: Bug FCM serah terima (API usang) diperbaiki dan guard status transfer dipindah ke dalam transaction dengan lockForUpdate.
---
- Bukti vendor: kreait/firebase-php 8.5.0; `grep -rn withTarget vendor/kreait/firebase-php/src` = 0 hasil; CloudMessage hanya punya `new()`/`fromArray()` + `withToken` (src/Messaging/CloudMessage.php:77,238). Bug A nyata.
- Berubah (5): app/Services/ClaimTransferService.php (API v8, Log::warning, guard lockForUpdate di dalam DB::transaction, lock claim->lost->found, foto disimpan setelah guard lolos + hapus di disk 'public' bila exception), app/Services/ClaimNotificationService.php (catch -> Log::warning dengan claim_id/type), app/Exceptions/ClaimNotPendingException.php (factory transfer()), app/Http/Controllers/ClaimController.php (catch -> 422 pesan sama), tests/Feature/ClaimTransferTest.php (+5 test).
- Verifikasi asli: `php artisan test --compact` = 235 lulus / 638 assertions (baseline 230); ClaimTransferTest 11 lulus; `php artisan route:list --path=claims` = 15 route; `vendor/bin/pint --dirty` = passed; git status bersih setelah 2 commit.
- Keputusan: pilih simpan foto setelah guard lolos (bukan hapus terpisah) + tetap hapus di catch sebagai jaring kedua; instance claim hasil lock dipakai untuk update; pesan 422 guard dipertahankan identik.
- Temuan/risiko: push ke origin GITEA GAGAL — "remote: Failed to authenticate user / fatal: Authentication failed https://git.informatikapolines.id/..."; tidak dicoba workaround. Branch lokal sudah punya 2 commit, tinggal push manual.
- Butuh keputusan user: (1) kredensial Gitea untuk push branch, (2) catat temuan di luar scope yang TIDAK disentuh: FCM jalur admin/Filament, UserResource, PATCH /claims/{id} yang mengembalikan 200 tanpa perubahan, non-UUID -> 500.