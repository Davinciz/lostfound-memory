---
type: report
task: Bob-261126-03
from: backend
outcome: succeeded
branch: fix/chat/atomic-mark-read
commits: "b7f50cbb892ce7f9851f363b1e21f1989135e5b8 — fix(chat): make mark-read updates atomic and guard receipt broadcast"
updated: 2026-11-26
summary: "Mark-read bulk dan tunggal kini atomik, dengan penanganan kegagalan broadcast sinkron. Branch sudah dipush."
---

# Bob-261126-03 — Mark-read atomik dan broadcast tahan gagal

- **Berubah** — Kedua endpoint hanya mengubah `read_at` yang masih `NULL`. Timestamp pertama bertahan, dan hanya request yang berhasil mengubah baris yang mengirim `MessageRead`.
- **Verifikasi** — Seluruh suite PostgreSQL lulus 429 tes dengan 2.057 assertion. Tes read receipt lulus 17 skenario dengan 117 assertion. Pint, diff check, status Git, dan hash remote terverifikasi.
- **Risiko tersisa** — Pengiriman sinkron bersifat best-effort. Jika Pusher gagal, DB tetap menyimpan status baca dan klien tidak menerima receipt dari pengiriman yang gagal. Pusher live, uji dua perangkat, balapan pada dua koneksi PostgreSQL independen, dan deployment produksi belum diuji.
- **Butuh keputusan user** — Tidak ada untuk lingkup branch dan push ini.

## Implementasi

- Bulk `PATCH /api/conversations/{id}/read` memakai PostgreSQL `UPDATE … RETURNING`. Filter tetap mencakup percakapan terkait, pesan dari lawan bicara, batas hapus milik pembaca, dan `read_at IS NULL`. Hasil update menjadi sumber `marked` dan ID event. Jika tidak ada perubahan, responsnya `{"marked":0,"read_at":null}` tanpa event. Maksimal 100 ID dikirim per event.
- Single `PATCH /api/messages/{id}/read` memakai update bersyarat. Jika request lain lebih dulu mengisi `read_at`, respons `MessageResource` memakai nilai yang tersimpan dan event tidak dikirim ulang.
- Exception broadcast sinkron dicatat dengan `Log::warning` yang berisi `conversation_id` dan `message_count`. Respons tetap HTTP 200 sesudah update, dan percobaan pengiriman berlanjut ke chunk berikutnya. Tes memakai `Event::fake()` untuk memeriksa dispatch serta broadcaster yang sengaja gagal untuk memeriksa respons, state, dan log.
- Perubahan terbatas pada `app/Http/Controllers/ConversationController.php` dan `tests/Feature/ConversationReadReceiptTest.php`.

## Verifikasi

Pengujian memakai PHP 8.3.33 dan PostgreSQL 18.2 pada cluster sementara di loopback. Dua tes interleaving gagal pada kode lama sesuai temuan audit. Keempat tes tambahan mencakup interleaving dan kegagalan broadcast.

| Pemeriksaan | Hasil |
| --- | --- |
| `php artisan test --compact` | 429 lulus, 2.057 assertion, 0 gagal. |
| `php artisan test --filter=ConversationReadReceiptTest` | 17 lulus, 117 assertion, termasuk 13 skenario lama. |
| `php vendor/bin/pint --test app/Http/Controllers/ConversationController.php tests/Feature/ConversationReadReceiptTest.php` | Kedua file lulus. |
| `php artisan route:list --path=api` | 38 route API. Kedua endpoint PATCH memakai Sanctum. |
| `git diff --check origin/develop...HEAD` | Bersih. |
| `git status --short` di worktree setelah commit dan push | Bersih. |
| `git ls-remote --exit-code origin refs/heads/fix/chat/atomic-mark-read` | Hash remote sama dengan commit lokal `b7f50cbb892ce7f9851f363b1e21f1989135e5b8`. |

## Git dan penutupan

- Base sesudah `git fetch origin --prune --tags` sekaligus parent commit adalah `7a1f31ea185db541ca35515dca8dd6928d9ec5a1` dari `origin/develop`. [Branch di Gitea](https://git.informatikapolines.id/Daniel_Geovani/lostfound-backend/src/branch/fix/chat/atomic-mark-read)
- Worktree terpisah berada di `C:\Users\ADVAN\orca\workspaces\lostfound-backend\bob-261126-03-atomic-mark-read`. Cluster, salinan dependensi, dan artefak uji dibersihkan. Orca menghapus worktree sementara dan branch lokal tetap menunjuk commit yang dipush.
- Checkout utama `C:\Project\lostfound-backend` sebelum dan sesudah tetap pada `fix/chat/unread-count-n-plus-one` dengan HEAD `9feb665c57fdf6cc57a75f067181fd1c0060944f`. `git status --short` tetap ` M README.md` dengan hash konten Git `d401dc08d44f8e72d63867d7f559096fdca6c5f0`.

Referensi vault: [[Brief Pengembangan Real-Time Chat - Lost&Found]] (Tugas 3 dan §9) dan [[Bob-261126-02-audit-final-develop-backend]].

