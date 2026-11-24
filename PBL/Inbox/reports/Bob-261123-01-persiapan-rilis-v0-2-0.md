---
type: report
task: Bob-261123-01
from: backend
outcome: succeeded
branch: null
commits: []
updated: 2026-11-23
summary: "Audit read-only kandidat v0.2.0 dari origin/develop a3be6bc dan draf rilis."
---

# Persiapan rilis stabil v0.2.0 backend

**Verdict: BELUM SIAP** Simulasi merge bersih dan seluruh suite lulus. Kandidat belum memenuhi syarat higiene karena diff mengubah `.env.example`, yang termasuk larangan `.env*` pada tugas. Pint penuh juga masih melaporkan enam file dengan pelanggaran format dari baseline.

## Berubah

- Pemeriksaan read-only dan penyusunan draf rilis. Tidak ada commit, push, merge, perubahan file terlacak, branch, atau tag baru.
- Checkout utama saat mulai: `C:\Project\lostfound-backend`, branch `fix/chat/unread-count-n-plus-one`, HEAD `9feb665c57fdf6cc57a75f067181fd1c0060944f`, status ` M README.md` (perubahan yang sudah ada). Pemeriksaan kandidat dilakukan pada worktree detached.

## Verifikasi

| Pemeriksaan | Hasil |
| --- | --- |
| `git fetch origin --tags` | Berhasil. `origin/develop` = `a3be6bca67705df688c2078bffd22d2be183922c`, `origin/main` = `72c7de1af1739d9764b94f1d44286162b0790980`. |
| Tag | `v0.1` menunjuk ke commit `72c7de1` di tip `main`. `v0.2.0` belum ada pada `git tag -l` maupun `git ls-remote --tags origin`. |
| Hubungan branch | `merge-base --is-ancestor` exit 0. `rev-list --left-right --count` = `0 48`. `merge-tree --write-tree` exit 0 tanpa konflik. Tree hasil `3507f8a65875d82e0133886c0c6adfb4cf5f27bb` identik dengan tree `develop`. |
| Isi rilis | `git log --oneline --no-merges v0.1..origin/develop`: 40 commit non-merge. `git diff --stat`: 84 file, +8.679/−477 baris. Rangkuman per scope ada pada draf PR. |
| Composer / PHPUnit | `composer install` exit 0. `php artisan test` exit 0, **412 lulus, 1.879 assertion**, 142 detik. `phpunit.xml` menetapkan PostgreSQL `lostfound_testing`. Worktree tidak memiliki `.env`, `.env.testing`, atau config cache sebelum tes. Koneksi diverifikasi ke cluster PostgreSQL sementara di `127.0.0.1`, port terpisah. Konfigurasi checkout utama tidak disalin. |
| Route dan Pint | `php artisan route:list --json` exit 0, **72 route total, 37 berawalan `api/`**. `php vendor/bin/pint --test` exit 1, **6 file**. `git diff --quiet v0.1..HEAD` untuk keenam path mengonfirmasi isi file tidak berubah sejak `v0.1`. |
| Kesehatan produksi | `GET /up` HTTP 200 pada 23 Nov. Commit produksi dan penerapan migrasi saat ini belum diverifikasi. Catatan deploy terakhir menunjukkan `6f8b43d` pada 8 Nov, sebelum auto-deploy dimatikan. |
| Pembersihan | PostgreSQL sementara dihentikan, direktori DB dan worktree detached dihapus. Branch, HEAD `9feb665c57fdf6cc57a75f067181fd1c0060944f`, dan status ` M README.md` checkout utama sama dengan awal. Ref remote dicek ulang dan tetap sama. |

## Temuan dan hal yang masih terbuka

- **Higiene:** `.env.example` (modified) cocok pola larangan literal `.env*`. Itu nama template konfigurasi yang sudah terlacak. Isi nilainya tidak diperiksa atau dicetak. Tidak ada kecocokan nama lain pada pola kredensial, direktori tooling tersembunyi, dump SQL, atau `storage/logs` yang diminta. `AGENTS.md` berubah sebagai panduan repo yang sudah terlacak. `test_fcm.php` dihapus.
- **Pint penuh:** `app/Filament/Resources/ClaimResource/Pages/ListClaims.php`, `app/Filament/Resources/UserResource/Pages/EditUser.php`, `app/Filament/Resources/UserResource/Pages/ListUsers.php`, `app/Http/Middleware/AdminMiddleware.php`, `app/Services/GoogleTokenVerifier.php`, dan `bootstrap/providers.php`.
- `git diff --check v0.1..origin/develop` exit 2 karena empat baris trailing whitespace pada `CONTRIBUTING.md` (42, 44, 56, 60).
- Bukti deploy #33/#34, uji manual dua akun/dua HP, Client Events Pusher, dan scheduler Dokploy belum diverifikasi. Read receipt `e95826c` masih di branch terpisah. Fitur itu berada di luar kandidat rilis ini.

### Migrasi baru sejak v0.1

1. `2026_10_18_071626_add_conversation_indexes.php`
2. `2026_10_23_000001_make_claim_reports_nullable.php`
3. `2026_11_01_103035_add_archive_delete_columns_to_conversations.php`

Ketiganya mengubah skema. Migrasi **1** menambah dua partial unique index untuk percakapan dan satu composite index untuk pesan. Migrasi **2** membuat dua FK laporan pada claim nullable, menambah CHECK minimal salah satu laporan terisi, serta menambah `accepted_at`, `closed_reason`, dan `closed_by`. Migrasi **3** menambah empat timestamp nullable arsip/hapus per peserta. Tidak ada tabel baru. Perubahan ini cocok dengan ERD dan `schema.dbml` vault. Partial unique dan CHECK direpresentasikan melalui catatan DBML. Cek migrasi yang masih pending di Dokploy. Untuk database yang belum menerapkannya, jalankan migrasi melalui entrypoint yang sudah memanggil `php artisan migrate --force`. Ambil backup dan periksa duplikasi percakapan atau claim tanpa target pada database lama sebelum migrasi.

## Butuh keputusan user

Putuskan apakah perubahan template `.env.example` boleh mendapat pengecualian eksplisit dari aturan nama file. Jika tidak, kandidat perlu revisi terpisah sesuai alur proyek. Setelah pemeriksaan rilis tuntas, lakukan merge commit `develop → main` di Gitea sesuai prosedur milestone no-ff di CONTRIBUTING.md, lalu buat tag anotasi `v0.2.0` pada commit hasil merge. Untuk rollback, rujuk tag stabil sebelumnya `v0.1` dan cek kompatibilitas schema/data sebelum kembali ke versi lama. Tidak ada perubahan versi Composer atau README yang dibutuhkan untuk membuat tag Git.

## Draf PR

**Judul:** `release: develop -> main (v0.2.0)`

Rilis ini membawa perubahan backend sejak `v0.1`.

- **Claim dan laporan:** claim langsung ke laporan target, percakapan per claim, accept/reject oleh penerima, withdraw oleh pengaju, dan serah terima dengan guard transaksi, bukti foto, serta penanganan kegagalan FCM. Validasi UUID dan pagination diperketat. Route PATCH claim lama yang tidak mengubah data dihapus.
- **Chat:** API dan broadcast pesan realtime, konteks barang, arsip dan hapus per pengguna, percakapan muncul kembali saat ada pesan baru, query unread lebih efisien, dan guard read-only. Aplikasi menerima `can_send`, `readonly_reason`, dan alasan penolakan HTTP 422.
- **Notifikasi:** push claim/chat best-effort, pemindahan dan pelepasan token perangkat, serta pembatasan data pada log FCM.
- **Profil dan privasi:** API update WhatsApp/visibilitas, validasi dari body, penyaringan kontak dari respons umum, dan `counterpart_whatsapp` pada detail claim bila pihak lawan mengizinkan.
- **Filament:** dashboard dan halaman awal, proteksi penghapusan laporan ber-claim, penyesuaian aksi claim, serta URL HTTPS.
- **Repo dan pengujian:** panduan GitFlow-Lite, pengujian regresi API, claim, chat, FCM, privasi, dan Filament, serta penyesuaian dependensi broadcast. Perubahan template konfigurasi perlu keputusan higiene sebelum merge.
- **Database, storage, dan deploy:** tiga migrasi untuk indeks chat, constraint/kolom claim, dan timestamp arsip/hapus. Docker/entrypoint menyiapkan storage link dan menjalankan migrasi. Cek backup, volume storage, status migrasi, dan konfigurasi layanan di Dokploy sebelum deploy.
- **Verifikasi:** PHPUnit: 412 tes lulus dan 1.879 assertion pada PostgreSQL testing terisolasi. Route list: 72 total, 37 API. Pint penuh melaporkan enam file yang tidak berubah sejak `v0.1`. Uji manual dua HP, Client Events Pusher, dan commit yang sedang berjalan di backend produksi belum diverifikasi. `/up` merespons HTTP 200.

## Draf pesan tag anotasi

Rilis backend Lost&Found v0.2.0 menambahkan alur claim langsung dan serah terima, chat realtime dengan konteks barang, arsip dan hapus per pengguna serta guard read-only, push FCM, kontrol privasi WhatsApp, dan pembaruan Filament serta Docker. Rilis ini menyertakan tiga migrasi PostgreSQL untuk indeks chat, aturan target claim, dan timestamp arsip/hapus.

## Referensi

- [Kandidat develop](https://git.informatikapolines.id/Daniel_Geovani/lostfound-backend/commit/a3be6bca67705df688c2078bffd22d2be183922c) · [WhatsApp #33](https://git.informatikapolines.id/Daniel_Geovani/lostfound-backend/pulls/33) · [Guard read-only #34](https://git.informatikapolines.id/Daniel_Geovani/lostfound-backend/pulls/34)
- Vault: DailyChanges 8, 12, dan 13 Nov, TechnicalReference §13, §16, §17, ERD, dan schema.dbml.
