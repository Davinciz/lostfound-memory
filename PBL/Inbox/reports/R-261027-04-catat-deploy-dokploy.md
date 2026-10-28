---
type: report
task: Dominic-261027-04
from: docs
outcome: succeeded
branch: 
commits: 
updated: 2026-10-27
summary: Catat hasil deploy backend ke Dokploy di DailyChanges, TechnicalReference, dan Progress; open items dicatat
---
- Berubah: `DailyChanges/2026-10-27.md` (baru), `TechnicalReference.md` (§8.2 Deployment + §13.2 baru), `Lost&Found Progress.md` (ringkasan deploy + anotasi 2026-10-27).
- Fakta tercatat:
  - Backend Laravel ter-deploy di VPS teman lewat Dokploy, diakses `https://lostandfound.nandasaptra.my.id` via Cloudflare Tunnel.
  - Database Postgres internal Dokploy (diimpor dari dump 2026-10-26).
  - Dockerfile: php-fpm-alpine + nginx + supervisor, port 80, HEALTHCHECK `/up`, `trustProxies('*')`.
  - Volume persisten `lostfound-storage` di `/var/www/html/storage/app/public`; `entrypoint.sh` menjalankan `storage:link --force` + `chown storage` tiap startup.
  - Firebase credentials di-mount sebagai file Dokploy di `/etc/lostfound/firebase-service-account.json`.
  - `APP_URL` wajib `https://lostandfound.nandasaptra.my.id` (menentukan URL foto).
  - Branch `chore/repo/dockerize` merge `develop` (squash).
  - Flutter butuh `--dart-define API_BASE_URL` + `GOOGLE_SERVER_CLIENT_ID`.
  - Token lama dari server lokal → 401 sampai data app dihapus dan login ulang.
  - Foto laporan lama tidak dimigrasi; laporan testing dihapus via Filament.
- Open items tercatat: (a) bulk delete Filament belum muncul di server, (b) Ajax-261027-02 & Ajax-261027-03 belum selesai, (c) uji claim/chat/FCM end-to-end belum dilakukan.
- Tidak ada nilai env, password, key, token, client ID, atau isi kredensial ditulis ke dokumen.
