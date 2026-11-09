---
type: report
task: GPT-261108-02
from: backend
outcome: succeeded
branch: fix/api/whatsapp-profile-validation
commits:
  - "bfc9feb155e1a9c720eca9c63003a8c5d778642a test(api): cover WhatsApp query string regressions"
updated: 2026-11-08
summary: Regresi query string dan perlindungan field profil dilengkapi dalam satu commit yang sudah di-push dan terverifikasi di origin.
---

# GPT-261108-02 · Tes regresi query string WhatsApp

## Berubah

- Commit `bfc9feb155e1a9c720eca9c63003a8c5d778642a` langsung di atas `33f8fa1078a7166ee0a99a2409a428874fa0bf16`, tip awal milik TsaqifSatria. Push fast-forward ke `origin/fix/api/whatsapp-profile-validation`. Tip remote diverifikasi setelah push.
- Diff commit hanya berisi `tests/Feature/UserWhatsAppProfileTest.php`. Kedua dataset `?whatsapp=` dan `?whatsapp=081234567890` memakai body JSON `[]`, nomor awal `628123456789`, dan visibilitas aktif. Tes memeriksa 422, error `whatsapp`, serta nomor dan visibilitas yang tetap tersimpan.
- Tes `?wa_visible=true` memakai body JSON `[]` dan pengguna dengan nomor valid serta visibilitas nonaktif. Tes memeriksa 422, pesan wajib isi di `errors.wa_visible.0`, dan visibilitas yang tetap nonaktif.
- Tes field ekstra mengirim `name`, `email`, dan `nim` yang berbeda dari data awal. Tes memeriksa ketiga nilai awal tetap tersimpan dan nomor WhatsApp dinormalisasi ke `628123456789`. Model `User` mendukung `nim` dan factory mengisinya secara eksplisit dalam tes ini.

## Verifikasi

Uji mutasi di worktree mengganti sementara isi `requestBody()` menjadi `return $request->all();`. PHPUnit menjalankan tiga kasus dengan hasil **3 gagal, 0 lulus, 4 assertion**, exit 1.

| Kasus | Hasil dengan mutasi |
| --- | --- |
| `?whatsapp=` | Mendapat 200, ekspektasi 422. |
| `?whatsapp=081234567890` | Mendapat 200, ekspektasi 422. |
| `?wa_visible=true` | Mendapat 422, tetapi pesan aktual berbunyi “Status tampilkan WhatsApp harus berupa benar atau salah.” Ekspektasinya “Status tampilkan WhatsApp wajib diisi.” |

String `true` dari URL memicu aturan boolean ketika query ikut dibaca. Assertion pesan membedakan kondisi itu dari field yang absen pada body. Controller dipulihkan byte demi byte dan hash file sebelum serta sesudah mutasi sama.

- `php artisan test --compact tests/Feature/UserWhatsAppProfileTest.php` lulus dengan **17 tes dan 70 assertion**.
- `php artisan test` dengan controller asli lulus dengan **395 tes, 0 gagal, 1.672 assertion**, exit 0. Baseline review GPT-261108-01 di `33f8fa1078` mencatat 393 tes dan 1.665 assertion. Selisihnya **+2 tes dan +7 assertion**.
- `php vendor/bin/pint --test tests/Feature/UserWhatsAppProfileTest.php` dan `git diff --check` lulus. Status sebelum commit menunjukkan hanya file tes tersebut. Status worktree bersih setelah commit dan push.
- PostgreSQL sementara di port `55482` dihentikan. Port sudah tidak merespons dan direktori data klaster sudah dihapus. Tes memakai konfigurasi khusus proses di worktree tanpa file dotenv.
- Worktree `C:\Project\_wt-wa-tests` sudah dihapus dan branch lokal tetap tersedia. Checkout utama terverifikasi di `fix/chat/unread-count-n-plus-one` dengan `README.md` sebagai satu-satunya perubahan lokal. Hash `README.md` sama dengan pemeriksaan awal.

## Temuan dan keputusan

Tidak ada temuan baru pada controller. Tidak ada keputusan yang diperlukan dari user.
