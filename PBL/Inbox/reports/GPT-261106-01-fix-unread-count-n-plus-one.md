---
type: report
task: GPT-261106-01
from: backend
outcome: succeeded
branch: fix/chat/unread-count-n-plus-one
commits: "9feb665c57fdf6cc57a75f067181fd1c0060944f fix(chat): restore deleted conversations and batch message summaries"
updated: 2026-11-06
summary: Chat muncul lagi setelah ada pesan melewati batas hapus, dan jumlah query daftar tetap 4 untuk 2 maupun 10 percakapan pada fixture tes.
---

## Penyebab

Baseline dari `develop` (`6f45cbf`) menghasilkan 21 tes lulus dan 1 gagal di `ConversationArchiveTest`. `test_unread_count_filtered_by_deleted_at` gagal pada `assertNotNull($data)` karena `scopeVisibleTo()` mewajibkan kolom hapus pada slot pengguna bernilai null. Percakapan dengan pesan baru sudah terbuang sebelum controller menghitung pesan yang belum dibaca. Untuk percakapan yang lolos, controller mengambil pesan terakhir dan menghitung pesan belum dibaca lewat dua query terpisah per baris.

## Berubah

- `app/Models/Conversation.php` memilih batas hapus dari slot pemanggil dan mengecek keberadaan pesan dengan `created_at > deleted_at`. Scope ringkasan menghitung `unread_count` dan memilih ID pesan terakhir di query daftar. Eloquent memuat semua pesan terakhir terpilih dengan satu query tambahan. Pesan terakhir diurutkan menurut `created_at DESC, id DESC`. Subquery hitung bebas pengurutan.
- `app/Http/Controllers/ConversationController.php` membaca ringkasan dari hasil query dan mengirim `unread_count` sebagai integer. Bentuk JSON, urutan `updated_at DESC`, dan status arsip per slot dipertahankan.
- `tests/Feature/ConversationArchiveTest.php` menambah tes hapus pada slot `user2` lewat API, pesan tepat di batas hapus, chat muncul kembali setelah lawan bicara mengirim, pemilihan pesan saat timestamp sama, pengecualian pesan sendiri atau sudah dibaca, dan perbandingan jumlah query. Assertion tes baseline dipertahankan.

## Jumlah query

Jumlah SQL diukur selama permintaan `GET /api/conversations` dengan pengguna yang sudah diautentikasi dan fixture chat langsung berisi pesan.

| Percakapan | Sebelum | Sesudah |
| --- | ---: | ---: |
| 2 | 7 | 4 |
| 10 | 23 | 4 |

Baseline memakai tiga query untuk daftar dan kedua relasi pengguna, ditambah dua query per percakapan. Sesudah perubahan, satu query daftar sudah memuat subquery visibilitas dan ringkasan, dua query memuat relasi pengguna, dan satu query memuat pesan terakhir. Relasi laporan atau klaim dapat menambah query tetap sesuai data yang hadir.

## Verifikasi

| Perintah | Hasil akhir |
| --- | --- |
| `php artisan test --filter=ConversationArchiveTest` | 25 lulus, 82 assertion |
| `php artisan test --filter=Conversation` | 72 lulus, 348 assertion |
| `php artisan test` | 365 lulus, 1.341 assertion |
| `./vendor/bin/pint --dirty` dan `./vendor/bin/pint --dirty --format agent` | Lulus |
| `git diff --check` dan `git diff --cached --check` | Lulus. Git memberi pemberitahuan CRLF pada `README.md`, yang sudah berstatus perubahan lokal sebelum tugas. |

PHPUnit awalnya gagal membuka bootstrap dalam sandbox. Eksekusi dengan akses yang diperlukan berhasil memakai PostgreSQL 18.2 sementara. Percobaan SQLite berhenti di migration bawaan yang memakai `pg_constraint`. Run pertama suite percakapan dan suite penuh masing-masing menemukan satu kegagalan pada `ConversationTest::test_list_includes_found_target_instead_of_claimants_own_lost_report`. Tes itu mengharapkan URL foto berhost `localhost`, sementara konfigurasi lokal menyediakan host berbeda. Seluruh verifikasi akhir memakai `APP_URL=http://localhost` pada proses tes. Cluster tes sementara sudah dibersihkan.

## Temuan dan pekerjaan terbuka

- `docs/documents/TechnicalReference.md` §16 mendeskripsikan filter daftar lama yang menyembunyikan chat setelah dihapus. `docs/planning/Arsip dan Hapus Chat - Lost&Found.md` §3.4 dan `docs/DailyChanges/2026-11-01.md` mencatat chat dapat muncul kembali. Implementasi mengikuti perilaku yang diminta di GPT-261106-01.
- Jumlah query aplikasi tetap untuk fixture 2 dan 10 percakapan. Biaya subquery di database masih dipengaruhi volume riwayat pesan. Pengukuran latensi dengan data produksi di luar verifikasi ini.
- Branch sudah tersedia di `origin`. PR dan merge menjadi langkah pengguna. [Buka formulir PR](https://git.informatikapolines.id/Daniel_Geovani/lostfound-backend/pulls/new/fix/chat/unread-count-n-plus-one)

Referensi API Laravel yang diperiksa saat Boost `search-docs` mengalami kegagalan DNS. [Subquery Eloquent Laravel 13](https://laravel.com/docs/13.x/eloquent#advanced-subqueries), [eager loading Laravel 13](https://laravel.com/docs/13.x/eloquent-relationships#eager-loading).
