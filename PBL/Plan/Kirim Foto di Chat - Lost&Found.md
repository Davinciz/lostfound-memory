---
type: plan
project: lost-found
status: active
priority: medium
updated: 2026-11-27
summary: Pengguna dapat mengirim satu foto dengan caption opsional di ruang chat untuk verifikasi kepemilikan.
---

# Kirim Foto di Chat - Lost&Found

**Tanggal:** 2026-11-27
**Project:** [[PBL]] Lost&Found
**Status:** Planning
**Priority:** Medium
**Plan induk:** [[Real-Time Chat - Lost&Found]]

---

> [!note] Sumber tunggal kontrak fitur
> Dokumen ini mencatat keputusan fitur **Kirim Foto di Chat** yang disetujui Daniel pada **2026-11-27**, sebelum implementasi kode dimulai oleh Bob/Ajax. Dokumen kondisi kode saat ini (`ERD.md`, `schema.dbml`, `TechnicalReference.md`) sengaja belum diubah sampai backend di-merge ke `develop`.

## a. Tujuan

Pengguna dapat mengirim **satu foto** (dengan caption teks opsional) di ruang chat untuk membantu proses verifikasi kepemilikan barang secara lebih jelas.

---

## b. Keputusan

1. **Skema database (tetap 7 tabel):**
   - Tidak ada tabel baru.
   - Perubahan kolom pada tabel `messages` dalam **satu migration**:
     - Tambah `image_path` (`string`, `nullable`).
     - Ubah kolom `message` menjadi `nullable`.
2. **Aturan berkas & kompresi:**
   - Maksimal **1 foto per pesan**.
   - Format yang diizinkan: `jpg`, `jpeg`, `png`, `webp`.
   - Ukuran maksimal: **2048 KB** (sama dengan foto laporan).
   - Flutter mengompres gambar sebelum mengirim; backend tetap melakukan validasi ukuran dan format.
3. **Endpoint upload:**
   - Upload `multipart/form-data` langsung di `POST /api/conversations/{id}/messages` (field `image` dan `message`, minimal salah satu wajib diisi).
   - Tidak ada endpoint upload terpisah.
4. **Penyimpanan & akses privat (PENGECUALIAN):**
   - **Pengecualian dari keputusan "foto memakai disk `public`":** foto chat disimpan di disk **PRIVATE (`local`)** pada path `chat/{conversation_id}/{uuid}.{ext}`.
   - Dilayani melalui endpoint `GET /api/messages/{id}/image` (`auth:sanctum`, hanya peserta chat, menghormati batas `*_deleted_at` milik pemanggil).
   - **Alasan:** isi chat bersifat privat dan admin tidak membaca isi chat. Foto laporan dan foto bukti serah terima claim tetap memakai disk `public`.
5. **Payload & preview:**
   - Field `image_url` (berisi URL endpoint `GET /api/messages/{id}/image`, **bukan** path storage) ditambahkan ke event `MessageSent`, respons `GET /api/conversations/{id}/messages`, dan respons `POST /api/conversations/{id}/messages`.
   - Field `last_message.has_image` (`boolean`) ditambahkan di `GET /api/conversations`.
   - `image_path` **TIDAK pernah** dikirim ke klien.
   - Teks notifikasi FCM untuk pesan foto tanpa teks: `"Mengirim foto"`.
   - Preview di daftar chat untuk pesan foto tanpa teks: `"Foto"`.
6. **Guard read-only:**
   - Guard read-only (`claim_closed` / `user_blocked`) berlaku sama untuk pesan berfoto: ditolak dengan **HTTP 422** sebelum file disimpan ke disk.
7. **Implementasi Flutter:**
   - Memuat gambar dengan header `Authorization` (`cached_network_image` menggunakan `httpHeaders`), **tanpa** menaruh token di URL.
   - Tanpa dependensi baru (`image_picker`, `image`, `cached_network_image` sudah tersedia di proyek).

---

## c. Urutan Tugas

1. **`Dominic-261127-01`** — Penyusunan plan ini dan penyelarasan dokumen terkait (**sekarang**).
2. **`Bob-261127-01`** (backend, branch `feature/chat/image-message-api`) — Migration `messages`, validasi & upload multipart, penyimpanan disk `local`, endpoint `GET /api/messages/{id}/image`, payload `image_url` & `last_message.has_image`, preview/FCM, guard 422 sebelum simpan file, serta tes fitur.
3. **`Ajax-261127-01`** (mobile, branch `feature/chat/image-message-ui`, mulai **setelah Bob merge ke `develop`**) — Pemilih foto & kompresi lokal, kirim multipart di chat, render gambar dengan `httpHeaders`, preview `"Foto"` di daftar chat, serta widget/unit test.
4. **Dominic berikutnya** (setelah Bob & Ajax selesai/merge) — Sinkronisasi `ERD.md`, `schema.dbml`, `TechnicalReference.md` §16/§17, dan `Lost&Found Progress.md`.

---

## d. Di Luar Lingkup

- Mengirim banyak foto dalam satu pesan.
- Mengirim file non-gambar (PDF, dokumen, video, audio).
- Hapus atau edit foto per pesan.
- Pembuatan thumbnail di sisi server (*server-side thumbnail*).
- Kompresi gambar di sisi server.
- Pembersihan file gambar secara otomatis.

---

## e. Risiko & Catatan

1. **Volume persisten Dokploy:** Volume `storage` di Dokploy **HARUS** persisten (mencakup penyimpanan `local` tempat foto chat disimpan); jika tidak persisten, seluruh foto chat akan hilang setiap kali redeploy.
2. **Soft delete chat ("hapus untuk saya"):** Mekanisme `*_deleted_at` bersifat *soft delete* per peserta, sehingga file gambar di disk tidak ikut terhapus saat chat dihapus untuk saya (masuk backlog pembersihan file).
3. **Metode merge Git:** PR mobile sebelumnya di-merge dengan *Merge Commit* untuk menjaga riwayat kontribusi tim; untuk tugas fitur ini kembali memakai **Squash** sesuai aturan GitFlow-lite, kecuali Daniel menyatakan lain.

---

## f. Status Checklist

- [ ] `Dominic-261127-01`: Plan & penyelarasan dokumen awal (menunggu konfirmasi selesai).
- [ ] `Bob-261127-01`: Backend `feature/chat/image-message-api` + merge ke `develop`.
- [ ] `Ajax-261127-01`: Mobile `feature/chat/image-message-ui` + merge ke `develop`.
- [ ] Sinkronisasi dokumentasi kode (`ERD.md`, `schema.dbml`, `TechnicalReference.md` §16/§17, `Lost&Found Progress.md`).

---

## Dokumen Terkait

- [[Brief Pengembangan Real-Time Chat - Lost&Found]]
- [[Real-Time Chat - Lost&Found]]
- [[Verifikasi via Chat - Lost&Found]]
