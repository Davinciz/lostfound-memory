---
type: plan
project: lost-found
status: active
priority: medium
updated: 2026-11-12
summary: Plan isi & tampilkan nomor WhatsApp user SSO; keputusan final 2026-11-07, endpoint & validasi sudah merge; 2026-11-12 tambah catatan koordinasi dengan brief chat (tugas D merge dulu)
---

# Nomor WhatsApp Pengguna - Lost&Found

**Tanggal:** 2026-10-18
**Project:** [[PBL]] Lost&Found
**Status:** In Progress
**Priority:** Medium

> [!info] Status 2026-11-08
> Keputusan final fitur ditetapkan user 2026-11-07. Endpoint `PUT /api/users/me/whatsapp` + `PUT /api/users/me/wa-visibility` **sudah merge `develop`** (PR #31, `df5e22ed17`) dan perbaikan validasi (PR #32, `6f8b43d4b5`). Sisi **mobile BELUM SIAP** (review [[GPT-261107-07-review-wa-mobile]]). Tombol WhatsApp di alur claim **belum dikerjakan**. Plan **tidak ditandai selesai**.

---

## Tujuan

Memberi user cara **mengisi** nomor WhatsApp-nya sendiri (sekarang tidak ada sama sekali), sehingga tombol "Hubungi via WhatsApp" di detail laporan bisa benar-benar bekerja untuk pelapor yang mengizinkan nomornya tampil.

---

## Masalah

- Akun user dibuat otomatis dari Google SSO; **tidak ada form registrasi** ([[Design]] §5.4).
- Endpoint profil yang ada hanya `PUT /users/me/wa-visibility` (toggle tampil) dan `PUT /users/me/fcm-token` (token perangkat) — dikonfirmasi user lewat pembacaan kode read-only 2026-10-18.
- **Tidak ada cara mengisi `users.whatsapp`**: kolomnya ada di [[ERD]] ("kolom profil & kontak: whatsapp, wa_visible") tetapi tidak ada jalur tulis dari mobile. Toggle "Tampilkan nomor WhatsApp" karena itu tidak ada gunanya — tidak ada nomor untuk ditampilkan.
- Tombol **"Chat WhatsApp"** di layar detail laporan (non-pemilik) masih stub: `WhatsAppService.generateChatLink()` dipanggil tetapi hasilnya dibuang, `url_launcher` tidak dipanggil ([[Backlog Perbaikan Lanjutan - Lost&Found]] open item x).
- Layar [[Design]] §5.18 Edit Profil sudah menggambar field "No. WhatsApp", jadi UI-nya mendahului backend.

---

## KEPUTUSAN FINAL (user, 2026-11-07)

### 1. Backend — dua endpoint TERPISAH

- **`PUT /api/users/me/whatsapp`** — menerima **hanya** field `whatsapp` (kunci wajib hadir, `present|nullable`). `name`, `email`, `nim` **tidak bisa diubah user** (read-only). Toggle visibilitas **tidak** ditangani di endpoint ini.
- **`PUT /api/users/me/wa-visibility`** — **endpoint terpisah**, respons tetap `{"message":"WhatsApp visibility updated"}`.
- Normalisasi nomor ke format `62...`: terima awalan `08`/`+62`/`62` serta pemisah spasi, `-`, `.`, dan kurung; buang pemisah; hasil wajib cocok **`^628\d{8,11}$`**; selain itu **422** berpesan Indonesia **tanpa menampilkan input mentah**.
- Boleh dikosongkan (`null`/`""` → simpan `null`) dan otomatis mematikan `wa_visible`. `true` tanpa nomor → **422**. Simpan lewat transaksi + `lockForUpdate`.
- Nomor **tidak unik** (dua akun boleh sama). Nomor **tidak dienkripsi sekarang** (ditunda ke plan terpisah — lihat [[Security Hardening - Lost&Found]] §2).
- Deep link **`wa.me` saja** (via `url_launcher`).
- **Efek disengaja:** tombol WhatsApp di detail laporan **hilang** sampai dipindah ke alur claim.

### 2. Mobile — Edit Profil ([[Design]] §5.18) dan Pengaturan ([[Design]] §5.19)

- Field "No. WhatsApp" bisa diisi; toggle visibilitas **aktif hanya bila nomor terisi**.
- **Dua toggle dipertahankan** (di Pengaturan **dan** Edit Profil).
- Status mobile: branch lama `feat/profile/whatsapp` (`bc8f2add8b`) diulas [[GPT-261107-07-review-wa-mobile]] → **BELUM SIAP**. Rencana ulang: branch `feature/ui/edit-profile-whatsapp` (TsaqifSatria).

### 3. Alur claim — tombol WhatsApp (belum dikerjakan)

- Nomor **hanya tampil ke lawan claim setelah claim `accepted`**, bila `wa_visible` aktif **dan** nomor tidak null.
- **Admin tidak menerima nomor lewat API claim**; di respons laporan dan pencarian nomor **tidak pernah muncul**.
- Backend rencana: field datar `counterpart_whatsapp` di respons claim tunggal (`show`, `store`, `accept`, `reject`, `withdraw`, `markTransferred`), **tidak** di index maupun `/api/admin/*`.
- Mobile rencana: tombol pindah dari `report_detail_screen` ke detail claim + rapikan `WhatsAppService`.

### 4. Penyaringan data user — sudah terimplementasi (PR #30)

- Lima field (`whatsapp`, `nim`, `email`, `blocked`, `blocked_reason`) disaring dari relasi `reporter`/`claimant`/`transferred_by` di 19 endpoint lewat `Controller::hideUserContactFields` (PR #30, squash `c760ef2`). `$hidden` model `User` tidak diubah.
- Aturan tampil nomor ke luar `/users/me`: **hanya ke lawan claim setelah `accepted` + `wa_visible` + nomor tidak null** — pola `'whatsapp' => $this->wa_visible ? $this->whatsapp : null` di [[Security Hardening - Lost&Found]] §2 adalah **usulan lama**; keputusan final memakai alur claim terpisah (belum diterapkan).
- `GET /users/me` (profil sendiri) mengembalikan nomor milik sendiri apa pun nilai `wa_visible`.

---

## Belum diputuskan / open items

- [x] ~~Apakah `PUT /users/me` menangani `whatsapp` + `wa_visible` sekaligus, atau tetap terpisah?~~ → **DIPUTUSKAN 2026-11-07: DUA endpoint terpisah.**
- [x] ~~Nomor WA unik per user atau tidak?~~ → **DIPUTUSKAN: tidak unik.**
- [x] ~~Field NIM boleh diubah user atau tetap read-only?~~ → **DIPUTUSKAN: `name`/`email`/NIM read-only, tidak bisa diubah user.**
- [x] ~~Apakah nomor disimpan terenkripsi?~~ → **DIPUTUSKAN: belum dienkripsi sekarang; ditunda ke plan terpisah** ([[Security Hardening - Lost&Found]] §2 tetap usulan lama untuk cast `encrypted`).
- [x] ~~Apakah toggle di Pengaturan dipertahankan berdampingan dengan toggle di Edit Profil?~~ → **DIPUTUSKAN: dua toggle dipertahankan.**
- [x] ~~Perilaku untuk user yang belum pernah mengisi nomor.~~ → **DIPUTUSKAN: tombol disembunyikan (default).**
- [x] ~~Prioritas plan ini `medium`.~~ → tetap `medium`.
- [ ] **Sisa pekerjaan (belum selesai):** (B) mobile `feature/ui/edit-profile-whatsapp`; (C) backend `feature/claim/counterpart-whatsapp` (field `counterpart_whatsapp` di respons claim tunggal); (D) mobile `feature/claim/whatsapp-contact-button`. Uji HP terhadap server live untuk fitur ini **belum dilakukan**. Sinkronisasi docs ke repo backend **belum dilakukan** (checkout sedang di branch lain dengan perubahan lokal README.md user).

---

## Koordinasi dengan Brief Chat (2026-11-12)

> Keputusan user 2026-11-12 (Dominic-261112-05). **Status tugas B/C/D di plan ini TIDAK diubah.**

- Chat dan WhatsApp dikerjakan oleh **orang berbeda, paralel**.
- **Urutan:** **Tugas D** (`feature/claim/whatsapp-contact-button`) diselesaikan **dan di-merge dulu** sebelum Tugas chat Flutter yang menyentuh `chat_screen.dart`.
- **Alasan:** perbaikan review D kemungkinan menyentuh `chat_screen.dart` dan `claim_actions.dart`; `lib/models/claim.dart` dan `api_client.dart` dipakai kedua pihak.
- Detail urutan tugas chat: [[Brief Pengembangan Real-Time Chat - Lost&Found]] §6 (paragraf koordinasi) dan [[Real-Time Chat - Lost&Found]] §Open Items — Status 2026-11-12.
- **Status review dari laporan saja:** (C) [[GPT-261109-01]] **APPROVE DENGAN CATATAN**; (D) [[GPT-261110-02]] **REQUEST CHANGES**. **Status merge C/D tidak diketahui — jangan diklaim.**

---

## Konflik dengan dokumen lain (ditemukan 2026-10-18)

- [[Design]] §4, §5.9, §5.18, §5.19 menggambarkan nomor WhatsApp dan tombolnya sebagai bagian aplikasi yang berjalan, padahal **tidak ada jalur pengisian nomor** di backend. Ditandai di [[Design]] §5.18 (dan §5.9) sebagai bergantung pada plan ini.
- [[Security Hardening - Lost&Found]] sudah mengusulkan penyaringan `wa_visible` + enkripsi, sedangkan endpoint laporan saat ini mengembalikan model mentah → butuh verifikasi bersama.
- [[TechnicalReference]] §16 (endpoint) belum memuat endpoint profil sama sekali meski `PUT /users/me/wa-visibility` dan `PUT /users/me/fcm-token` sudah ada di kode → usul didaftarkan (lihat perubahan [[TechnicalReference]] §17 2026-10-18).

---

## Testing Strategy (usulan)

- Backend: user A isi nomor → `GET /users/me` mengembalikannya; user B melihat nomor A **hanya bila** `wa_visible = true`; nomor kosong → `wa_visible` jadi `false`; format `08xx`/`+62xx`/spasi dinormalisasi; input tidak valid → `422`; `name`/`email` tidak berubah lewat endpoint ini.
- Flutter: field + toggle berperilaku benar (toggle non-aktif tanpa nomor); tombol WhatsApp muncul/hilang sesuai kondisi; tap membuka `wa.me`.
- Regresi: respons `GET /lost-reports` & `GET /found-reports` tidak menambah field sensitif baru.

---

## Related Files

- **Backend:** `C:\Project\lostfound-backend` (Gitea kampus: `git.informatikapolines.id/Daniel_Geovani/lostfound-backend`, Private, HTTPS)
- **Flutter:** `C:\Project\lostfound-mobile` (Gitea kampus: `git.informatikapolines.id/Daniel_Geovani/lostfound-mobile`, Private, HTTPS)
- **Plan terkait:** [[Security Hardening - Lost&Found]] (§2 penyaringan data user), [[Claim Dua Arah dan Serah Terima oleh Pengguna - Lost&Found]] (koordinasi serah terima menyebut WhatsApp), [[Backlog Perbaikan Lanjutan - Lost&Found]] (open item x)
- **Dokumen:** [[Design]] §4, §5.9, §5.16, §5.18, §5.19 · [[ERD]] (kolom `whatsapp`, `wa_visible`) · [[TechnicalReference]] §8.2, §16, §17

---

#plan #lost-and-found #whatsapp #profil #privasi
