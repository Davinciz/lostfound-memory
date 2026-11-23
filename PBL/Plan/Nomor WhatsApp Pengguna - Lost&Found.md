---
type: plan
project: lost-found
status: active
priority: medium
updated: 2026-11-23
summary: Plan isi & tampilkan nomor WhatsApp user SSO; diterima sementara 2026-11-23 usai uji HP 1 akun; Bob-261123-02 (PR #36, 8dea995) & Ajax-261123-03 (PR #28, 92225ec) sudah merge develop dan masuk rilis v0.2.0; uji 2 akun & deploy backend belum
---

# Nomor WhatsApp Pengguna - Lost&Found

**Tanggal:** 2026-10-18
**Project:** [[PBL]] Lost&Found
**Status:** Done (diterima sementara — pengisian nomor di HP berhasil; perbaikan merge develop & masuk tag v0.2.0; uji 2 akun detail claim & konfirmasi deploy Dokploy belum)
**Priority:** Medium

> [!info] Status 2026-11-23 — Done (diterima sementara) & rilis v0.2.0
> **Keputusan pemilik (Daniel, 2026-11-23):** pengisian nomor WhatsApp di HP berhasil diuji pada **1 akun**, dan fitur diterima sebagai **`Done (diterima sementara)`** tanpa menjalankan uji manual 2 akun terlebih dahulu.
> **Merge `develop` & rilis `v0.2.0` (2026-11-23):** [[Bob-261123-02-fix-test-admin-counterpart-whatsapp]] (`test/claim/counterpart-whatsapp-admin-fixture`, `f4096cd`) **SUDAH MERGE ke `develop` sebagai PR #36** (squash `8dea9957cf`) dan [[Ajax-261123-03-fix-whatsapp-mounted-guard]] (`test/claim/whatsapp-mounted-guard`, `02fc358`) **SUDAH MERGE ke `develop` sebagai PR #28** (squash `92225ecd63`). Keduanya sudah ikut rilis ke `main` pada tag **`v0.2.0`** (backend PR #37 `ff29af2` tag `16fcae8`, [[Bob-261123-03-tag-rilis-v0-2-0]]; mobile PR #29 `fdb025d` tag `1fa053b`, [[Ajax-261123-04-tag-rilis-v0-2-0]]).
> **Belum dilakukan / belum diklaim:** uji manual 2 akun di HP (`ClaimDetailScreen` tombol WhatsApp saat `accepted`) dan deploy ulang backend Dokploy ke `v0.2.0` / verifikasi migrasi database produksi. Plan tetap berstatus frontmatter `active` (tidak diarsipkan) sampai penutupan akhir dikonfirmasi pemilik.

> [!info] Status 2026-11-13 — merge selesai, belum live (riwayat)
> **Tugas B, C, dan D SUDAH MERGE ke `develop`** (sumber: konfirmasi Daniel 2026-11-13 + laporan review). Rincian per tugas ada di §"Status Merge B/C/D (2026-11-13)".
> **Status fitur tetap BELUM selesai / belum live:** uji manual di HP **belum** dilakukan dan backend **belum di-deploy** (auto-deploy Dokploy dimatikan sejak 2026-11-08). Plan **tidak ditandai selesai**.

> [!info] Status 2026-11-08 (riwayat)
> Keputusan final fitur ditetapkan user 2026-11-07. Endpoint `PUT /api/users/me/whatsapp` + `PUT /api/users/me/wa-visibility` **sudah merge `develop`** (PR #31, `df5e22ed17`) dan perbaikan validasi (PR #32, `6f8b43d4b5`). ~~Sisi mobile BELUM SIAP...~~ **Tidak berlaku — lihat blok 2026-11-13.**

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
- [x] ~~**Sisa pekerjaan (belum selesai):** (B) mobile `feature/ui/edit-profile-whatsapp`; (C) backend `feature/claim/counterpart-whatsapp` (field `counterpart_whatsapp` di respons claim tunggal); (D) mobile `feature/claim/whatsapp-contact-button`. Uji HP terhadap server live untuk fitur ini **belum dilakukan**. Sinkronisasi docs ke repo backend **belum dilakukan** (checkout sedang di branch lain dengan perubahan lokal README.md user).~~ → **B/C/D SUDAH MERGE `develop` 2026-11-13** (lihat §Status Merge). Sisa: **uji HP** dan **deploy backend** — keduanya **belum**. Sinkronisasi docs ke repo backend **belum dilakukan**.

---

## Status Merge B/C/D (2026-11-13)

> Sumber: konfirmasi Daniel 2026-11-13 + laporan review [[GPT-261109-01-review-c-counterpart-whatsapp]], [[GPT-261110-01-review-b-revisi-2]], [[GPT-261110-03-review-b-revisi-3]], [[GPT-261110-02-review-d-whatsapp-button]], [[GPT-261113-01-review-d-revisi]], [[Ajax-261113-02-review-d-revisi-2]], [[Ajax-261113-03-assert-status-aksi-chat]]. **Tidak ada fakta di luar sumber ini.** Status fitur: **merge selesai, BELUM live** (uji HP + deploy backend belum).

### C — backend `feature/claim/counterpart-whatsapp` — MERGE `develop` (oleh Daniel)

- Komit branch: `17a5ab9a7b` dan `31153ab8cb`. **Nomor PR: tidak diketahui** (tidak diisi Daniel — jangan dikarang).
- Review [[GPT-261109-01]]: **APPROVE DENGAN CATATAN**; 404 tes lulus / 1.768 assertion; `route:list` identik (37); Pint bersih; 5 mutasi gagal sesuai harapan; maks 1 query tambahan.
- **Catatan Minor (backlog kecil, BELUM diperbaiki):** `ClaimCounterpartWhatsAppTest.php` sekitar baris 175 dan 180 — assertion dashboard admin berjalan tanpa fixture, sehingga bukti "kunci absen dari admin" lemah.

### B — mobile `feature/ui/edit-profile-whatsapp` — MERGE `develop` sebagai **PR #26**

- Merge commit `ccabb1d173` (**merge commit, bukan squash**).
- Review: [[GPT-261110-01]] (revisi 2) **REQUEST CHANGES** — hanya tes; [[GPT-261110-03]] (revisi 3) **APPROVE**.
- Angka akhir: **259 lulus, 4 dilewati, 0 gagal**; `analyze` 4 warning + 2 info lama di file test.

### D — mobile `feature/claim/whatsapp-contact-button` — MERGE `develop` (oleh Daniel, 2026-11-13)

- Tombol WhatsApp **pindah dari Detail Laporan ke `ClaimDetailScreen`**, memakai `counterpart_whatsapp` dari `getClaim(id)` ulang (objek claim dari `index` tidak membawa nomor).
- Rangkaian review: [[GPT-261110-02]] **REQUEST CHANGES** (4 Mayor + 1 Minor); [[GPT-261113-01]] **REQUEST CHANGES** (2 Mayor, hanya tes); [[Ajax-261113-02]] **REQUEST CHANGES** (Mayor 1 assertion status belum ada; Mayor 2 mutasi guard `mounted` jalur sukses lolos); [[Ajax-261113-03]] menutup Mayor 1 (komit `043180dedf`, 4 assertion badge "Diterima", mutasi bypass-versi membuat 3 tes gagal).
- Angka akhir tip D: **273 lulus, 4 dilewati, 0 gagal**; `analyze` selisih 0 terhadap `develop`.
- **Nomor PR: tidak diketahui**; **metode merge: tidak diketahui** (squash / merge commit tidak diisi Daniel).
- **Batasan yang diketahui (Mayor 2 — DITERIMA Daniel, bukan "teruji"):** menghapus guard `mounted` **di jalur sukses saja** tidak mengubah perilaku yang teramati, karena error `setState` setelah dispose ditelan `catch` yang masih berguard; dinilai **tidak bisa dibedakan oleh tes**. Dicatat apa adanya.

### Catatan jujur

- Setelah [[Ajax-261113-03]] **TIDAK ada review independen lagi**; Daniel merge berdasarkan laporan itu + pengecekan PR di Gitea.

### Belum dilakukan / tidak diklaim

- **Uji manual 2 akun di HP** (buat claim antara 2 akun berbeda sampai `accepted`, lalu cek dan tap tombol "Hubungi via WhatsApp" di `ClaimDetailScreen` kedua akun, serta cek daftar/detail laporan, pencarian, Claim Saya, chat, toggle Pengaturan) — **belum dilakukan**.
- **Deploy backend ke Dokploy (`v0.2.0`) & verifikasi migrasi database produksi** — auto-deploy dimatikan sejak 2026-11-08, konfirmasi deploy ulang backend ke `v0.2.0` setelah 2026-11-08 belum ada; strategi manual vs lacak `main` **belum diputuskan**.
- **Pembersihan branch** — belum ada branch yang dihapus.

### Pembaruan 2026-11-23 — PR #33 & #27, Merge PR #36/#28 (`Bob-02`/`Ajax-03`), & Rilis `v0.2.0`

- **(a) Identifikasi nomor PR dari riwayat Git `origin/develop`** (sumber: [[Bob-261123-01-persiapan-rilis-v0-2-0]] & [[Ajax-261123-02-persiapan-rilis-v0-2-0]]):
  - Tugas C (`feature/claim/counterpart-whatsapp`) tercatat di riwayat Gitea sebagai **PR #33**.
  - Tugas D (`feature/claim/whatsapp-contact-button`) tercatat di riwayat Git `origin/develop` sebagai **PR #27** (`d17637c4821ac44beedbde2097f0ee33015aabde`).
- **(b) Penutupan catatan Minor Tugas C (`Bob-261123-02`) — SUDAH MERGE ke `develop` (PR #36):** laporan [[Bob-261123-02-fix-test-admin-counterpart-whatsapp]], branch `test/claim/counterpart-whatsapp-admin-fixture` (commit branch `f4096cd9301b4ca57a59de43a8c8c19b3bb89c55`). `tests/Feature/ClaimCounterpartWhatsAppTest.php` menyertakan fixture claim `pending` & `LostReport` (WhatsApp valid & `wa_visible=true`), meng-assert ID fixture di `pending_claims_list.0`, `lost_reports.data.0`, serta daftar claim admin (`accepted` & `pending`) sebelum memeriksa absennya `counterpart_whatsapp` dan 5 field kontak; mutasi `AdminController::dashboard` & `AdminController::reports` gagal sesuai harapan (exit 1, baris 184 & 193); `ClaimCounterpartWhatsAppTest` **9 tes / 157 assertion** (lulus); suite penuh **412 lulus / 1.940 assertion**; Pint & `git diff --check` bersih. **SUDAH MERGE ke `develop` sebagai PR #36** (squash `8dea9957cfa907ae20f009d537903a4308da4c71`, parent `a3be6bca67`) dan ikut masuk rilis `main` pada tag **`v0.2.0`** (PR #37 `ff29af207ab8a5e067c8ac486e1cc8cbb3da74a2`, objek tag `16fcae8535b960601496de0f0331523950f8376c`, [[Bob-261123-03-tag-rilis-v0-2-0]]).
- **(c) Penutupan batasan Mayor 2 Tugas D (`Ajax-261123-03`) — SUDAH MERGE ke `develop` (PR #28):** laporan [[Ajax-261123-03-fix-whatsapp-mounted-guard]], branch `test/claim/whatsapp-mounted-guard` (commit branch `02fc358662e4bded5da5a7ddc1aedd12512711b9`). `lib/screens/claim/claim_detail_screen.dart` membatasi blok `try` hanya pada `await _apiClient.getClaim(claim.id)`, sedangkan guard `mounted` + `_claimRequestVersion` dan `setState` jalur sukses dijalankan di luar `try/catch`; `test/claim_whatsapp_test.dart` diperkuat untuk skenario dispose saat GET tertahan lalu respons sukses dilepas. Mutasi sempit Mayor 2 gagal (`setState() called after dispose()`, exit 1, 11 lulus / 1 gagal); 6 mutasi lain tetap gagal; `claim_whatsapp_test.dart` **12 lulus**; suite penuh **273 lulus / 4 skip / 0 gagal**; `flutter analyze --no-pub` **0 error**, 4 warning + 2 info lama (selisih 0). **SUDAH MERGE ke `develop` sebagai PR #28** (squash `92225ecd633aaeaf1cfd65d34ce0a15f73628d52`, parent `d17637c482`) dan ikut masuk rilis `main` pada tag **`v0.2.0`** (PR #29 `fdb025d30fabfa51193bcefb1f74f700d698f6df`, objek tag `1fa053b70c4f128bcbf53d94bdac49872a18ec91`, [[Ajax-261123-04-tag-rilis-v0-2-0]]).
- **(d) Uji HP & keputusan penerimaan sementara (Daniel, 2026-11-23):** Daniel sudah melakukan build aplikasi ke HP dan mengonfirmasi **pengisian nomor WhatsApp di HP sudah berhasil (1 akun)**, lalu memilih menerima fitur Nomor WhatsApp Pengguna sebagai **`Done (diterima sementara)`** tanpa menjalankan uji manual 2 akun terlebih dahulu.

---

## Koordinasi dengan Brief Chat (2026-11-12)

> Keputusan user 2026-11-12 (Dominic-261112-05). Status tugas B/C/D diperbarui 2026-11-13 (lihat §Status Merge).

- Chat dan WhatsApp dikerjakan oleh **orang berbeda, paralel**.
- **Urutan:** **Tugas D** (`feature/claim/whatsapp-contact-button`) diselesaikan **dan di-merge dulu** sebelum Tugas chat Flutter yang menyentuh `chat_screen.dart`. **D SUDAH MERGE 2026-11-13 → prasyarat terpenuhi.**
- **Alasan:** perbaikan review D kemungkinan menyentuh `chat_screen.dart` dan `claim_actions.dart`; `lib/models/claim.dart` dan `api_client.dart` dipakai kedua pihak.
- Detail urutan tugas chat: [[Brief Pengembangan Real-Time Chat - Lost&Found]] §6 (paragraf koordinasi) dan [[Real-Time Chat - Lost&Found]] §Open Items — Status 2026-11-12.
- ~~**Status review dari laporan saja:** (C) [[GPT-261109-01]] **APPROVE DENGAN CATATAN**; (D) [[GPT-261110-02]] **REQUEST CHANGES**. **Status merge C/D tidak diketahui — jangan diklaim.**~~ **Tidak berlaku sejak 2026-11-13: C dan D sudah merge `develop`; D juga lolos review lanjutan ([[Ajax-261113-03]]) dengan sisa batasan Mayor 2.**

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
