---
type: report
task: T-261024-05
from: docs
outcome: succeeded
branch: - (docs only)
commits: -
updated: 2026-10-24
summary: Fase 1.2 claim dicatat selesai di plan, TechnicalReference, Progress, DailyChanges; 1.2c menunggu PR.
---
- Berubah: `PBL/Plan/Claim Fase 1.2 - ...md`, `PBL/Documents/TechnicalReference.md` (frontmatter + §16 + §17), `PBL/Documents/Lost&Found Progress.md`, `PBL/DailyChanges/2026-10-24.md`, laporan ini.
- Verifikasi: docs only — tidak ada eksekusi kode; semua angka dari laporan Bob-261024-02/03/04 (182 → 199 → 215 → 230 test; `route:list --path=claims` 12 → 14 → 15 → 15; `vendor/bin/pint --dirty` passed).
- Koreksi plan: teks test balapan "accept dua kali → kedua 422" keliru → "request pertama 200, request kedua 422"; checkbox 1.2a/1.2b/1.2c tercentang (tidak ada butir FCM admin di plan); status plan `active` + header `In Progress` (bukan `done` — 1.2c belum merge).
- Progress: Archive +3 kartu (1.2a `2bafdb5`, 1.2b `9faee99`, 1.2c `23d0be6` "kode selesai, menunggu PR"), Selesai 23 → 26; anotasi di kartu fokus & Rencana Fitur (teks lama tidak dihapus).
- Open items dicatat: `ClaimTransferService::notifyClaimant` pakai `CloudMessage::withTarget('token', ...)` yang dihapus di firebase-php 8.5.0 (sekarang `CloudMessage::new()->withToken()`) → exception ditelan try/catch, notifikasi serah terima tidak pernah terkirim — BELUM diperbaiki, perlu keputusan user; FCM jalur admin/Filament belum ada; respons claim masih `User` mentah (`UserResource` terpisah).
- Dilewati: sinkronisasi docs → `C:\Project\lostfound-backend\docs\` tidak dilakukan (repo di luar lingkup Dominic); nama laporan pakai format baru `Dominic-261024-05-...` per `PBL/Inbox/README.md` (format `R-` sudah tidak dipakai).
- Konflik: tidak ada kontradiksi antar dokumen/laporan. Catatan kecil: hitungan kartu Archive vs ringkasan Progress sudah berbeda 1 sejak kartu `GOOGLE_DEV_EMAILS` (pra-tugas), tidak saya ubah.
- Butuh keputusan user: ya — (1) perbaiki `ClaimTransferService::notifyClaimant` (satu baris, di luar lingkup 1.2c); (2) apakah jalur admin/Filament perlu FCM; (3) buat PR 1.2c.
