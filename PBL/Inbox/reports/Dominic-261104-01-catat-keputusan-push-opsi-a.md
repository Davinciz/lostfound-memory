---
type: report
task: Dominic-261104-01
from: docs
outcome: succeeded
branch:
commits:
updated: 2026-11-04
summary: Dicatat keputusan Opsi A push notification + kontrak payload FCM + kondisi kode & status proyek 2026-11-04 (dokumentasi saja; implementasi belum ada).
---
- Berubah: `Plan\Push Notification - Lost&Found.md` (frontmatter+summary, Status Planning→Active, callout Opsi A, USULAN, kontrak payload #2, tabel peristiwa+status, lingkup Flutter, Open Items); `Documents\Design.md` (§4 badge dicoret, §5.6 callout, §5.16 empty state, §5.19 toggle ditunda, frontmatter); `Documents\TechnicalReference.md` (§11 kontrak payload + kondisi kode, §17 (l)/(m)/(n), frontmatter+summary); `Documents\Lost&Found Progress.md` (kartu Push → In Progress + anotasi, kartu Arsip dianotasi, footer); `DailyChanges\2026-11-04.md` (baru).
- Verifikasi: ERD.md & schema.dbml **tidak diubah** — mtime tetap 2026-11-01, tidak ada perubahan skema. PRD.md **tidak diubah** (bagian §G tidak bertentangan dengan Opsi A).
- Temuan / open items: konflik payload lama plan (`type ∈ claim|chat|report`) vs kontrak baru (tipe spesifik `claim_*`) — teks lama dipertahankan + callout, kontrak baru jadi sumber tunggal; Design §4/§5.16 badge+daftar notifikasi disesuaikan Opsi A. Open: test `ConversationArchiveTest::test_unread_count_filtered_by_deleted_at` masih gagal (expected 1, actual 2); scheduler Dokploy ditunda (blokir arsip otomatis + `claims:expire`); N+1 `index()` conversations; #6 push claim dibekukan belum diverifikasi.
- Butuh keputusan user: konfirmasi tugas ini selesai; keputusan sinkron-vs-queue & toggle push Pengaturan (masih ditunda); kapan Opsi B diangkat lagi.
