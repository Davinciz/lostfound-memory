---
type: report
task: Bob-261026-02
from: backend
outcome: succeeded
branch: chore/repo/dockerize
commits:
  - acc2e35 fix(repo): tambah postgresql-dev agar pdo_pgsql bisa dikompilasi di Alpine
updated: 2026-10-26
summary: postgresql-dev ditambah di kedua stage Dockerfile; runtime pakai virtual package agar image lebih kecil
---
- Berubah: Dockerfile (2 lokasi apk add)
- Diff ringkas:
  - Stage build L15: tambah `postgresql-dev` di apk add
  - Stage runtime: pisah runtime libs (`libzip icu-libs libpng libjpeg-turbo freetype postgresql-libs`) dari build-deps; build-deps (`*-dev` + `postgresql-dev`) dipasang sebagai `--virtual .build-deps` lalu `apk del .build-deps` setelah ext-install — image akhir tidak membawa header/toolchain
- Verifikasi:
  - `grep "postgresql" Dockerfile`: baris 15 (build, `postgresql-dev`), 62 (runtime, `postgresql-libs`), 69 (runtime virtual, `postgresql-dev`) ✓
  - `sh -n docker/entrypoint.sh`: syntax OK ✓
  - `file entrypoint.sh`: POSIX shell script, ASCII text executable (LF) ✓
  - Docker build: tidak diuji — Docker tidak tersedia di mesin ini
  - Push ke origin: berhasil (acc2e35 → chore/repo/dockerize)
- Hal lain yang ditemukan (review seluruh Dockerfile):
  - nginx heredoc `<<'EOF'`: valid di busybox sh Alpine ✓
  - `sed www.conf` path `/usr/local/etc/php-fpm.d/www.conf`: benar untuk `php:8.3-fpm-alpine` ✓
  - `COPY --from=build /app .` ke WORKDIR `/var/www/html`: benar ✓
  - `/var/run/nginx.pid`: Alpine `/var/run` → symlink `/run`, `/run/nginx` sudah dibuat ✓
  - `/usr/bin/supervisord`: benar untuk Alpine supervisor package ✓
  - Tidak ada masalah lain yang ditemukan
- Risiko tersisa: build Dokploy masih belum diuji nyata; jika muncul error lain, laporan berikutnya per temuan
