---
type: report
task: T-261029-01
from: docs
outcome: succeeded
branch: -
commits: -
updated: 2026-10-29
summary: Koreksi status merge 3 PR yang salah tercatat belum merge — semuanya sudah merge develop
---
- Berubah: `Documents/TechnicalReference.md` (baris Fase 1.2c ⏳→✅, §13.2 `APP_URL` + forceScheme, §11.2 + merge PR #9/#10, frontmatter), `Plan/Claim Fase 1.2 - Accept Reject Withdraw oleh Pengguna - Lost&Found.md` (open item PR ⏳→✅, as-built, frontmatter), `Documents/Lost&Found Progress.md` (anotasi 2026-10-29, kartu Archive 1.2c, footer tanggal), `DailyChanges/2026-10-29.md` (baru).
- Verifikasi (asli): `git fetch --all --prune` → backend `a37464f..afd5cd2`, mobile `b1e8823..0a2af4c`; `git ls-tree -r --name-only origin/develop` → `ClaimNotificationService.php`, `ClaimConcurrencyTest.php`, `ClaimNotificationTest.php`, `ForceHttpsSchemeTest.php` ada; hash file mobile identik branch `44f5e56`.
- Merge terkonfirmasi: **PR #11** `18c85d4` (1.2c claim FCM, 2026-10-24), **PR #18** `afd5cd2` (forceScheme https, HEAD develop backend), **PR #10** `0a2af4c` (auto-logout 401, HEAD develop mobile), PR #9 `b1e8823` (baseUrl deploy).
- Temuan: `ClaimNotificationService.php` di `develop` lebih baru dari branch 1.2c (sudah `Log::warning` token diredaksi + `DeadFcmTokenCleaner`, Bob-261025-03/05).
- Penyebab kesalahan lama: `git branch --contains` dipakai tanpa fetch → ref lokal basi.
- Butuh keputusan user: (a) salin docs vault → `lostfound-backend/docs/` (basi sejak 2026-10-17), (b) uji end-to-end production, (c) branch `chore/repo/pint-cleanup` (6 file masih gagal).
