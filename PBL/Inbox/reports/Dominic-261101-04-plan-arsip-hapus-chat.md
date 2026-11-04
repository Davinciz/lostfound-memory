---
type: report
task: Dominic-261101-04
from: docs
outcome: succeeded
branch:
commits:
updated: 2026-11-01
summary: Plan "Arsip dan Hapus Chat" dibuat + status merge/open items 2026-11-01 dicatat di 5 dokumen.
---
- Berubah: `Plan/Arsip dan Hapus Chat - Lost&Found.md` (baru, active/medium); `Lost&Found Progress.md` (kartu konteks chat → Selesai, kartu Arsip & Hapus Chat `Planning`); `TechnicalReference.md` (callout usulan 4 kolom `conversations` + 4 open item baru); `PRD.md` (§3 J); `Design.md` (§5.14 callout); `DailyChanges/2026-11-01.md`.
- Verifikasi (hasil asli): baca kode read-only — `routes/console.php` hanya `inspire` (tidak ada `Schedule::`), `Dockerfile` tanpa cron/`schedule:work` (supervisor nginx+php-fpm) → scheduler Dokploy **belum jalan**; `ConversationController` tanpa method archive/destroy; `ClaimPolicy::markTransferred` = admin+penerima; `fcm_service.dart` hanya `type == 'chat'`. Tidak ada test dijalankan (docs only).
- Temuan / open items: (1) scheduler Dokploy memblokir arsip otomatis **dan** `claims:expire`; (2) withdraw HTTP 500 deploy (GPT-261101-05); (3) `markTransferred` vs plan Claim Dua Arah §4 (GPT-261101-05); (4) accept/reject/returned+foto belum teruji perangkat; (5) FCM claim di Flutter belum ada.
- Butuh keputusan user: perilaku `*_deleted_at` bila pihak yang menghapus mengirim pesan baru (usulan: tetap jadi batas riwayat); aturan purge tahap 2; kapan Phase 0 scheduler dikerjakan.
- Tidak diubah sesuai instruksi: `ERD.md`, `schema.dbml`. Frontmatter laporan agen lain tidak disentuh.