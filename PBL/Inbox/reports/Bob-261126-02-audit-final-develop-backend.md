---
type: report
task: Bob-261126-02
from: backend
outcome: succeeded
branch: "Audit read-only origin/develop dan origin/main; pengujian pada detached HEAD"
commits: "7a1f31e — merge PR #35 ke develop; ff29af2 — tip main dan target v0.2.0"
updated: 2026-11-26
summary: "PR #35 sudah masuk develop. Tugas 1 berfungsi sesuai aturan utama. Tugas 3 lulus pengujian berurutan, dengan masalah atomisitas pada request paralel."
---

# Bob-261126-02 — Audit final backend pasca-merge

- **Berubah:** `git fetch origin --prune --tags` memajukan `origin/develop` dari `8dea995` ke `7a1f31e`. PR #35 ter-merge ke develop. `origin/main` tetap di `ff29af2`.
- **Verifikasi:** Suite penuh exit 0 dengan 425 kasus tercatat dan 0 defect PHPUnit. Route list lulus (73 route, 38 API), Pint lulus pada 4 file, dan `git diff --check` lulus.
- **Temuan / open items:** Prioritaskan atomisitas kedua endpoint mark-read. Broadcast sinkron sesudah update dan paparan email dalam kontrak chat lama juga perlu ditindaklanjuti.
- **Butuh keputusan user:** Audit selesai tanpa keputusan tambahan.

## Checkout utama dan posisi remote

| Pemeriksaan | Hasil |
| --- | --- |
| `pwd` | `C:\Project\lostfound-backend` |
| Branch aktif | `fix/chat/unread-count-n-plus-one` |
| `HEAD` | `9feb665c57fdf6cc57a75f067181fd1c0060944f` |
| `git status --short` | ` M README.md` |
| Hash konten `README.md` | `d401dc08d44f8e72d63867d7f559096fdca6c5f0` |

| Ref | Baseline | Hasil sesudah fetch |
| --- | --- | --- |
| `origin/develop` | `8dea9957cfa907ae20f009d537903a4308da4c71` | `7a1f31ea185db541ca35515dca8dd6928d9ec5a1` |
| `origin/main` | `ff29af207ab8a5e067c8ac486e1cc8cbb3da74a2` | `ff29af207ab8a5e067c8ac486e1cc8cbb3da74a2` |
| Tag anotasi `v0.2.0` | `16fcae8535b960601496de0f0331523950f8376c` | Objek tag sama, menunjuk `ff29af207ab8a5e067c8ac486e1cc8cbb3da74a2` |

`git rev-parse HEAD origin/develop origin/main v0.2.0` memberi nilai di atas. `git ls-remote origin` mengonfirmasi tip kedua branch, objek tag, target tag, dan ref `refs/pull/35/head` di Gitea. Commit `7a1f31e` memiliki parent `8dea995` dan tip PR `e95826c`. `git merge-base --is-ancestor e95826c origin/develop` lulus (exit 0), sedangkan pemeriksaan ke `origin/main` memberi exit 1. [PR #35 di Gitea](https://git.informatikapolines.id/Daniel_Geovani/lostfound-backend/pulls/35)

`git log --oneline --decorate --graph v0.2.0..origin/develop` memuat lima commit berikut. Rentang ke main kosong. Baseline develop `8dea995` punya tree identik dengan commit tag, sehingga delta file ke develop terbaru sama untuk kedua pembanding.

```text
* 7a1f31e (origin/develop) Merge PR #35 into develop
* e95826c (origin/feature/chat/read-receipt) test(chat): cover read receipt endpoint and MessageRead event
* bedbb8f feat(chat): register PATCH /conversations/{id}/read route
* 9109bd4 feat(chat): add bulk read endpoint and broadcast on single read
* 0f50e1a feat(chat): add MessageRead broadcast event
```

```text
git diff --stat v0.2.0..origin/develop
 app/Events/MessageRead.php                      |  50 ++++
 app/Http/Controllers/ConversationController.php |  50 ++++
 routes/api.php                                  |   1 +
 tests/Feature/ConversationReadReceiptTest.php   | 364 ++++++++++++++++++++++++
 4 files changed, 465 insertions(+)
```

## Verifikasi pada detached HEAD `7a1f31e`

Pengujian memakai PHP 8.3.33, PostgreSQL 18.2 pada cluster sementara yang terverifikasi di loopback dengan database tersendiri, dan broadcaster `null`. Composer lockfile sama dengan baseline dan dependensi disalin ke worktree sementara. Konfigurasi pengujian diberikan melalui environment proses.

| Perintah | Hasil |
| --- | --- |
| `php artisan test --compact --no-ansi` | Exit 0. Cache hasil PHPUnit untuk run ini mencatat **425 kasus** dan **0 defect**. Ringkasan stdout tersaring, jadi jumlah assertion tidak dicatat. |
| `php artisan route:list --json` | Exit 0. **73 route** dan **38 API**. `PATCH /api/conversations/{id}/read` dan `PATCH /api/messages/{id}/read` sama-sama memakai Sanctum. Kedua route memakai `whereUuid('id')` di `routes/api.php`. |
| `php vendor/bin/pint --test <4 file dari diff>` | Exit 0, `passed` untuk keempat file yang tercantum di atas. |
| `git diff --check v0.2.0..origin/develop` | Exit 0. |

Pengujian otomatis memakai event fake atau broadcaster null. Konkurensi di bawah diidentifikasi lewat pembacaan kode. Pusher live dengan dua perangkat dan status deployment produksi belum diverifikasi.

## Kelengkapan terhadap brief

- **Tugas 1 — guard chat read-only sudah masuk sejak PR #34 (`a3be6bc`).** `Conversation::sendStateFor()` dipakai oleh daftar dan buka percakapan serta pengiriman. Untuk pengirim yang tidak diblokir, `pending`, `accepted`, `returned`, dan chat tanpa claim tetap terbuka. `rejected` dan `withdrawn` menghasilkan HTTP 422 dengan `claim_closed`. Akun diblokir dengan token aktif mendapat `user_blocked` bila claim tidak ditutup. Riwayat, mark-read, arsip, unarchive, dan hapus untuk saya tetap dapat digunakan sesuai aturan masing-masing endpoint. Tes query mengunci 4 query untuk 2 maupun 10 percakapan tanpa claim serta 7 query untuk 2 maupun 10 percakapan dengan claim yang di-eager-load. Angka dengan claim melampaui angka literal 4 pada brief, dan tetap konstan saat jumlah percakapan bertambah.
- **Tugas 3 — implementasi sudah terintegrasi melalui PR #35.** Bulk mark-read memakai Sanctum, UUID, cek peserta (403), dan batas hapus pemanggil. Endpoint hanya memilih pesan masuk yang belum dibaca dan dapat digunakan pada chat read-only. Panggilan berurutan idempoten dengan `marked: 0` dan `read_at: null` saat tidak ada perubahan. `MessageRead` dikirim ke channel privat percakapan dengan otorisasi peserta dan empat field brief saja. Batas 100 ID per event serta kompatibilitas respons endpoint lama tercakup tes. PR menambah 13 tes fitur dan memakai kolom `messages.read_at` yang sudah ada. Syarat event hanya untuk baris yang benar-benar berubah masih belum terjamin pada request paralel.

## Usulan branch fix pasca-merge

1. **Prioritas utama — ubah kedua jalur mark-read secara atomik.** Bulk memilih ID dengan `whereNull('read_at')` lalu meng-update daftar ID tanpa kondisi itu (controller baris 372–385). Endpoint lama membaca `read_at` dan menyimpan pada langkah terpisah (baris 407–422). Request yang beririsan dapat menimpa timestamp pertama, menghitung baris yang sama, dan mengirim event ganda. Gunakan update bersyarat PostgreSQL yang mengembalikan ID dan timestamp baris yang benar-benar berubah, misalnya `UPDATE … WHERE read_at IS NULL RETURNING …`. Bentuk `marked` dan event dari baris hasil update. Pertahankan respons endpoint lama dan nilai timestamp yang sudah tersimpan pada no-op. Tambahkan uji PostgreSQL untuk bulk vs bulk, bulk vs per pesan, dan dua request per pesan yang beririsan.
2. **Cegah kegagalan delivery setelah update.** `ShouldBroadcastNow` dijalankan sesudah penyimpanan. Bila Pusher gagal, permintaan bisa gagal saat data sudah berubah dan retry mark-read bisa menjadi no-op. Tentukan mekanisme pengiriman sesudah commit dengan retry, lalu uji kegagalan broadcaster dan pemulihan. Untuk pesan lama, pertahankan kompatibilitas API.
3. **Batasi field pada kontrak chat lama.** `MessageSent.php:43` dan `UserResource.php:15` masih memasukkan email. `MessageRead` sendiri memakai empat field brief. Gunakan serializer khusus chat bila diperlukan dan cek konsumsi Flutter sebelum menghapus email dari respons riwayat, buka/daftar percakapan, serta payload `MessageSent`.

## Penutupan

Worktree detached, salinan dependensi, dan cluster PostgreSQL sementara sudah dibersihkan. Daftar worktree kembali sama persis dengan daftar awal. Branch, HEAD, status, serta hash konten `README.md` checkout utama cocok dengan catatan awal. Audit hanya menyegarkan ref pelacak melalui fetch, menggunakan file sementara untuk pengujian, dan menyimpan laporan ini.

Referensi vault: [[Brief Pengembangan Real-Time Chat - Lost&Found]], [[Bob-261126-01-cek-update-repo-backend]], dan [[DailyChanges/2026-11-23]].
