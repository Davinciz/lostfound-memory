---
type: plan
project: lost-found
status: active
priority: medium
updated: 2026-11-01
summary: Arsip otomatis 14 hari + arsip/hapus manual chat "hapus untuk saya", tanpa penghapusan permanen otomatis
---

# Arsip dan Hapus Chat - Lost&Found

**Tanggal:** 2026-11-01
**Project:** [[PBL]] Lost&Found
**Status:** Implementasi berjalan — backend (`adcd1ee`, branch `feature/chat/archive-delete`) & Flutter (`6528324`, branch `feature/chat/archive-delete-ui`) **sudah merge**; fitur **belum selesai penuh** (Phase 3 uji manual + Phase 0 scheduler terbuka)
**Priority:** Medium

> **Fitur baru — disetujui user 2026-11-01 (Paket A).** Fitur ini **belum ada di [[PRD]]**; ditandai di PRD sebagai fitur baru yang disetujui. Kerangka chat tempat fitur ini menempel: [[Real-Time Chat - Lost&Found]] (Fase 1 backend sudah merge & deploy 2026-11-01).
>
> **Status skema & API di dokumen ini = SUDAH DITERAPKAN (2026-11-01).** Migration `2026_11_01_103035_add_archive_delete_columns_to_conversations`, endpoint archive/unarchive/delete, command `conversations:archive-inactive`, dan UI Flutter sudah ada. **Merge dikonfirmasi user** — jangan klaim deploy, migration produksi, atau nomor PR tanpa bukti. [[ERD]] dan `schema.dbml` **sudah disinkronkan** 2026-11-01.

---

## 1. Tujuan

Memberi pengguna cara merapikan daftar chat tanpa menghapus data pihak lain: chat lama yang tidak lagi aktif masuk arsip otomatis, sedangkan arsip/hapus manual dikendalikan per pengguna ("hapus untuk saya"). Tidak ada penghapusan permanen otomatis.

---

## 2. Keputusan User (Paket A, 2026-11-01) — ditulis apa adanya

1. **Arsip otomatis setelah 14 hari tanpa pesan baru.** Tidak ada penghapusan permanen otomatis.
2. **Chat yang terkait claim berstatus `pending` atau `accepted` DIKECUALIKAN dari arsip otomatis.**
3. **Pesan baru pada chat terarsip otomatis mengeluarkannya dari arsip untuk kedua pihak.**
4. **Arsip manual per pengguna:** arsipkan dan buka arsip dari daftar chat.
5. **Hapus manual = "hapus untuk saya":** chat hilang dari daftar pengguna itu dan pesan sebelum waktu hapus tidak tampil lagi untuknya; lawan bicara tidak terpengaruh. Jika lawan bicara mengirim pesan baru, chat muncul kembali hanya dengan pesan setelah waktu hapus. **Hapus DIBLOKIR saat claim terkait `pending` atau `accepted`** (chat dibutuhkan untuk verifikasi dan serah terima).
6. **Penghapusan fisik (purge) = tahap 2, di luar plan ini.** Dicatat sebagai open item (mis. dijalankan setelah kedua sisi menghapus).

---

## 3. Alur & Aturan Edge Case

### 3.1 Arsip otomatis (harian)

- **Ambang:** `updated_at` conversation > 14 hari **dan** tidak ada pesan baru. `ConversationController::sendMessage()` sudah memanggil `$conversation->touch()` (diverifikasi di kode 2026-11-01), jadi `updated_at` tetap indikator "aktivitas terakhir" selama pemakaian normal.
- **Chat tanpa pesan sama sekali:** memakai `created_at` conversation sebagai acuan, karena `updated_at` masih sama dengan `created_at` saat conversation belum pernah dipakai.
- **Pengecualian wajib (keputusan 2):** `claim_id` tidak null **dan** `claims.status` ∈ {`pending`, `accepted`} → dilewati. Claim terminal (`rejected`, `withdrawn`, `returned`) **ikut** aturan 14 hari.
- **Chat tanpa claim** (`claim_id` null, chat dari detail laporan) → ikut aturan 14 hari; tidak ada claim yang perlu dicek.
- **Yang diubah:** kolom arsip otomatis diisi untuk **kedua** pihak (arsip otomatis bersifat global per conversation), berbeda dari arsip manual yang per pengguna.
- **Tidak ada hapus otomatis** — tidak ada purge di command terjadwal ini (keputusan 1).

### 3.2 Unarchive otomatis (keputusan 3)

- Pengiriman pesan baru (`POST /api/conversations/{id}/messages`) mengosongkan **kolom arsip kedua pihak** pada conversation itu, sehingga chat kembali ke daftar normal milik pengirim dan lawan bicara.
- Ini **tidak** membatalkan `*_deleted_at` (keputusan 5 tetap berlaku: pesan sebelum waktu hapus tetap tidak tampil untuk pihak yang menghapus).

### 3.3 Arsip manual (keputusan 4)

- Per pengguna; hanya mengubah kolom arsip milik pengguna yang memanggil. Daftar chat dengan `?archived=1` menampilkan chat yang diarsipkan **oleh pengguna itu** (baik arsip manual maupun arsip otomatis).
- Default `GET /api/conversations` (tanpa `archived`) = chat yang **tidak** terarsip untuk pengguna itu.
- Unarchive manual mengosongkan kolom arsip milik pengguna pemanggil.

### 3.4 Hapus untuk saya (keputusan 5)

- `DELETE /api/conversations/{id}` **tidak menghapus baris** `conversations` maupun `messages`; hanya menulis `{slot}_deleted_at = now()` milik pemanggil.
- Chat hilang dari daftar pengguna itu; permintaan pesan (`GET /api/conversations/{id}/messages`) menyaring pesan dengan `created_at <= {slot}_deleted_at` untuk pengguna itu (pesan lawan bicara tetap utuh di DB).
- **Diblokir saat claim terkait `pending` atau `accepted`** → **409** (hubungan barang masih hidup, chat dibutuhkan untuk verifikasi dan serah terima).
- Pesan baru dari lawan bicara → chat muncul kembali di daftar pengguna itu **hanya** dengan pesan setelah waktu hapus (`created_at > deleted_at`).
- Ketika pengguna yang menghapus ikut mengirim pesan baru, kolom `*_deleted_at` miliknya **dibiarkan sebagai batas riwayat** (tidak dikosongkan) — perilaku **sudah dikonfirmasi user 2026-11-01**: chat muncul lagi hanya dengan pesan setelah `deleted_at`.

### 3.5 Penghapusan fisik (tahap 2, di luar plan)

- Purge baris `conversations`+`messages` (mis. setelah kedua sisi menghapus, atau setelah batas retensi) = **open item**, bukan bagian plan ini. Lihat §8.

---

## 4. Skema (DITERAPKAN 2026-11-01 — migration `2026_11_01_103035_add_archive_delete_columns_to_conversations`)

Tambahan **4 kolom timestamp nullable** di tabel `conversations`. **Tanpa tabel baru** (keputusan "7 tabel" tetap: `users`, `buildings`, `lost_reports`, `found_reports`, `claims`, `conversations`, `messages`).

```sql
conversations
  user1_archived_at TIMESTAMP NULL   -- arsip per slot user1 (manual atau otomatis)
  user2_archived_at TIMESTAMP NULL   -- arsip per slot user2
  user1_deleted_at  TIMESTAMP NULL   -- "hapus untuk saya" oleh slot user1
  user2_deleted_at  TIMESTAMP NULL   -- "hapus untuk saya" oleh slot user2
```

- Aturan kolom: `user1_*` selalu milik `conversations.user1_id`, `user2_*` milik `user2_id` (urutan min/max untuk chat langsung). **Pada conversation cabang claim: `user1_id` = claimant/pengaju dan `user2_id` = penerima — bukan otomatis pelapor laporan hilang/temuan** (koreksi 2026-11-01; laporan target bisa hilang atau temuan). **Nama kolom per slot, bukan per user id** — dipilih agar tidak perlu kolom `user_id` + baris pivot.
- **Alasan 4 kolom nullable dan bukan tabel pivot:** maksimal 2 peserta per conversation sudah dijamin skema sekarang (hanya `user1_id`/`user2_id`); tabel pivot per-(conversation,user) hanya berisi 2 baris dan menambah tabel ke-8, bertentangan dengan keputusan 7 tabel.
- **Index:** tidak ada index baru (usulan index parsial `updated_at` belum ditambahkan; hanya bila query command pas terbukti berat). Filter `archived` per pengguna belum butuh index di skala kampus.
- Dampak [[ERD]] + `schema.dbml` + [[TechnicalReference]] §15.7: **sudah disinkronkan 2026-11-01**.

---

## 5. API (DITERAPKAN 2026-11-01 — respons nyata di [[TechnicalReference]] §16)

> Rute chat yang sudah ada (diverifikasi di `routes/api.php`, 2026-11-01): `POST /api/conversations`, `GET /api/conversations`, `GET|POST /api/conversations/{id}/messages`, `PATCH /api/messages/{id}/read`. Semua `auth:sanctum`; param ID pakai `->whereUuid('id')`.

- `PATCH /api/conversations/{id}/archive` — arsip manual oleh pemanggil (`{slot}_archived_at = now()`), idempoten. Respons `{id, is_archived: true}`.
- `PATCH /api/conversations/{id}/unarchive` — buka arsip manual/otomatis oleh pemanggil (`{slot}_archived_at = null`). Respons `{id, is_archived: false}`.
- `DELETE /api/conversations/{id}` — **hapus untuk saya** (`{slot}_deleted_at = now()`); **409** bila claim terkait `pending`/`accepted` (`{message: 'Cannot delete conversation while the related claim is active (pending or accepted)'}`); **bukan** penghapusan baris.
- `GET /api/conversations?archived=1` — daftar chat yang terarsip untuk pemanggil; tanpa param = daftar normal. Respons menyertakan `is_archived` + `report_context`.
- **Command terjadwal harian `conversations:archive-inactive --days=14`** — isi kolom arsip otomatis untuk conversation yang memenuhi §3.1 (melewati claim `pending`/`accepted`). Didaftarkan di `routes/console.php` (`Schedule::command(...)->dailyAt('02:00')->withoutOverlapping()`); **container belum terbukti menjalankan scheduler** (Phase 0).
- Non-peserta → **403**; id tidak ada/bukan UUID → **404** (`whereUuid`).
- **Archive/unarchive/delete/command tidak mengubah `updated_at`** (`$conversation->timestamps = false`).

**Catatan implementasi (selesai):**
- `ConversationController` kini punya method archive/unarchive/destroy — rute baru terpasang.
- Penyaring `archived`/`deleted_at` di `index()` dibungkus grup `where()` (menghindari bocor `orWhere` lama). ⚠ **N+1 query di `index()` + `unread_count` per baris masih open item** — eager-load belum dikerjakan.
- `index()` menyaring `{slot}_deleted_at`; `messages()` menyaring pesan `created_at <= {slot}_deleted_at`; `unread_count`/`last_message` juga menyaring batas riwayat.

---

## 6. Dampak Flutter

- **Daftar chat (`Design.md` §5.14):** tambah tab/segmen **Arsip** (atau entri "Chat diarsipkan" di menu) yang memanggil `?archived=1`; item chat dapat di-*swipe*/long-press → **Arsipkan** dan **Hapus**.
- **Konfirmasi hapus:** dialog tegas karena efeknya per pengguna ("Chat ini dihapus dari daftar kamu. Lawan bicara tidak terpengaruh."), dengan pesan khusus bila server membalas **409** ("Chat masih dipakai untuk claim yang berjalan").
- **Chat terarsip:** badge/label kecil "Diarsipkan" di daftar; tidak perlu mengubah `ChatScreen` (pesan lama yang tersaring datang dari server).
- **Bukan bagian plan ini:** purge, retensi, halaman pengaturan retensi.

---

## 7. Fase Implementasi

| Fase | Isi | Catatan |
|---|---|---|
| **Phase 0** | Verifikasi scheduler di container deploy (Dokploy) | **Belum terkonfirmasi berjalan.** Jadwal command `conversations:archive-inactive` **sudah didaftarkan** di `routes/console.php` (`dailyAt('02:00')->withoutOverlapping()`); `Dockerfile` runtime tidak memasang cron/`schedule:work` (supervisor hanya nginx + php-fpm) → container belum terbukti menjalankan scheduler. Command `claims:expire` juga bergantung ini → **blokir bersama**. |
| **Phase 1** | Backend: migration 4 kolom + endpoint archive/unarchive/hapus + command `conversations:archive-inactive` + test | ✅ **Merge** (branch `feature/chat/archive-delete`, `adcd1ee`). ⚠ 23 test case ditulis **belum berhasil dijalankan** (DB testing lokal belum ada). Bagian terjadwal menunggu Phase 0. |
| **Phase 2** | Flutter: tab Arsip, menu aksi, dialog konfirmasi, penanganan 409 | ✅ **Merge** (branch `feature/chat/archive-delete-ui`, `6528324`). `flutter test` 193 lulus/4 skip; `analyze` 8 issue lama (0 dari file berubah). `Design.md` §5.14 diperbarui. |
| **Phase 3** | Test & uji manual dua akun (arsip manual, unarchive otomatis, hapus untuk saya, blokir claim aktif, arsip otomatis 14 hari) | ⏳ **Belum dijalankan.** Arsip otomatis 14 hari perlu manipulasi data/tanggal di DB uji. |
| **Phase 4** | Sinkronisasi dokumen: [[ERD]], `schema.dbml`, [[TechnicalReference]], [[PRD]], [[Design]], [[Lost&Found Progress]] | ✅ **Selesai 2026-11-01** (dokumen vault; `Lost&Found Progress.md` tetap hanya di vault). |

---

## 8. Ketergantungan & Open Items

- **Phase 0 (scheduler container Dokploy) belum terverifikasi** — memblokir arsip otomatis dan command `claims:expire`. Prioritas naik bila arsip otomatis ingin dipakai lebih dulu.
- **Purge (penghapusan fisik) = tahap 2**, di luar plan: aturan kapan aman dihapus benar-benar (kedua sisi hapus? retensi N bulan?) belum diputuskan.
- **Perilaku `*_deleted_at` saat pihak yang menghapus mengirim pesan baru** — ✅ **dikonfirmasi user 2026-11-01**: tetap sebagai batas riwayat (§3.4).
- **Index** — belum ditambahkan; tambah hanya bila query plan command/pencarian menunjukkan perlu (§4).
- **⚠ N+1 query di `index()` + `unread_count` per baris — masih open item** (§5): penyaring `archived`/`deleted_at` sudah dibungkus grup `where()`, tetapi eager-load belum dikerjakan.
- **Realtime reload berlebih:** event `MessageSent` memicu reload kedua daftar — berpotensi boros; tambah debounce bila terasa di perangkat.
- **Phase 3 uji manual dua akun** (arsip manual, unarchive otomatis, hapus untuk saya, blokir claim aktif, arsip otomatis 14 hari) — belum dijalankan.
- **Purge vs `messages.read_at`:** pesan yang di-"hapus untuk saya" tetap ada; `unread_count` pengguna yang menghapus sudah menyaring pesan sebelum waktu hapus (diterapkan 2026-11-01).

---

## 9. Checklist Konvensi Git

- Mulai dari `develop`; scope commit `chat`.
- Format commit: `feat(chat): ...`.
- Merge ke `develop` lewat **PR squash**; branch fitur dihapus setelah merge.
- Repo: Gitea kampus (HTTPS, Private) — lihat [[Adopsi GitFlow-lite & Migrasi ke Gitea - Lost&Found]].

---

## 10. Dampak Dokumen

| Dokumen | Aksi |
|---|---|
| [[PRD]] §3 Feature List | ✅ diperbarui 2026-11-01 — entri fitur "Arsip & Hapus Chat" |
| [[Design]] §5.14 Daftar Chat | ✅ diperbarui 2026-11-01 — tab Chat/Arsip, badge Diarsipkan, long-press/swipe, konfirmasi hapus, pesan 409 |
| [[TechnicalReference]] §15.7 `conversations` + §16 API + §17 | ✅ diperbarui 2026-11-01 — 4 kolom diterapkan + endpoint archive/unarchive/delete + filter archived/deleted_at + open items |
| [[ERD]], `schema.dbml` | ✅ diperbarui 2026-11-01 — 4 kolom timestamp nullable, tetap 7 tabel |
| [[Lost&Found Progress]] | ✅ diperbarui 2026-11-01 — kartu "Arsip dan Hapus Chat" (implementasi berjalan, belum selesai penuh); tetap hanya di vault |
| [[Real-Time Chat - Lost&Found]] | tetap sumber kerangka chat; fitur ini tidak mengubah kontrak Fase 1 |

---

## Related Files

- [[Real-Time Chat - Lost&Found]] — kerangka chat, kontrak Fase 1 (backend merge & deploy)
- [[Claim Dua Arah dan Serah Terima oleh Pengguna - Lost&Found]] — status claim yang jadi pengecualian arsip/hapus
- [[Claim Langsung ke Laporan Target - Lost&Found]] — conversation per `claim_id`
- [[Push Notification - Lost&Found]] — notifikasi FCM (tidak diubah plan ini)
- [[TechnicalReference]] §15.7 & §16
- [[Design]] §5.14
- [[PRD]] §3

---

#plan #lost-and-found #chat #archive #delete
