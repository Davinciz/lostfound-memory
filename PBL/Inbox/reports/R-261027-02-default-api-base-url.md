---
type: report
task: Ajax-261027-02
from: flutter
outcome: succeeded
branch: chore/repo/default-api-base-url
commits: 7651bfc chore(repo): set deployed URL as default API base, add dart_defines gitignore & example
updated: 2026-10-27
summary: Default API_BASE_URL diganti ke URL deploy; dart_defines.json di-ignore; file example ditambahkan
---
- Berubah: `lib/api/api_client.dart` defaultValue → `https://lostandfound.nandasaptra.my.id/api`; `.gitignore` +`dart_defines.json`; `dart_defines.example.json` baru (placeholder saja, tanpa client ID asli)
- Verifikasi: `flutter analyze` 8 issue (warning/info di test/ semua pre-existing, 0 di lib/); `flutter test` 118 lulus; log test konfirmasi URL deploy ter-resolve; `grep API_BASE_URL lib/` → satu sumber (`api_client.dart:18`)
- Temuan / open items: IP lokal `172.16.161.183` hanya ada di 1 tempat (api_client.dart:19, sudah diganti). Tidak ada referensi lain ke IP/host lokal di `lib/`.
- Butuh keputusan user: —
