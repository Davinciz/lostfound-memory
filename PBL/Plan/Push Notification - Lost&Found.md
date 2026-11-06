---
type: plan
project: lost-found
status: active
priority: high
updated: 2026-11-04
summary: Plan push notification FCM (claim, serah terima, chat). 2026-11-04: user memilih Opsi A (FCM saja, tanpa tabel notifikasi) — tetap 7 tabel; Opsi B ditunda. Implementasi MVP Opsi A selesai dan diterima sementara user; uji manual sebagian besar berhasil, rincian skenario belum lengkap.
---

# Push Notification - Lost&Found

**Tanggal:** 2026-10-18
**Project:** [[PBL]] Lost&Found
**Status:** Active
**Priority:** High

---

> [!info] 2026-11-04 — implementasi MVP Opsi A selesai & diterima sementara
> User memutuskan **Opsi A: FCM saja, tanpa tabel/endpoint notifikasi** — database tetap **7 tabel**. **Opsi B (tabel notifikasi ke-8) ditunda, bukan dibatalkan**. Kontrak payload FCM ditetapkan (§USULAN #2).
> 
> **Implementasi MVP Opsi A:** backend GPT-261104-02 (PR #24 `fdd9952`), GPT-261104-04 (PR #25 `459f969`), GPT-261104-05 (PR #27 `6f45cbf`) — **sudah merge develop**. Flutter GPT-261104-03 (PR #21 `50ce102`), GPT-261104-06 (PR #22 `6fe1330`) — **sudah merge develop**. Pelaksana: ChatGPT. Dokumentasi: Dominic.
> 
> **Verifikasi:** 6 type payload aktual; 219+247 test Flutter lulus, 349+361 test backend lulus (1 gagal baseline chat); PM review 54 test Flutter + route backend lulus. **Uji manual user 2026-11-04:** notifikasi Firebase Console → HP berhasil; uji 2 akun/2 HP dinyatakan **"sebagian besar sudah berhasil, untuk sekarang sudah aman"**. **Rincian hasil per skenario belum lengkap** — tidak ada daftar kasus gagal/belum diuji, model HP, atau rekaman lengkap. **Diterima sementara untuk penggunaan/pengujian saat ini, bukan audit keamanan menyeluruh.**
> 
> Detail status peristiwa & lifecycle token/logout lihat tabel di bawah. Batasan & pekerjaan lanjutan tetap terbuka (§Open Items). Sumber: DailyChanges [[2026-11-04]].

## Tujuan

Melengkapi push notification FCM yang saat ini hanya dipakai untuk satu peristiwa (serah terima), agar seluruh alur claim, chat, dan status laporan memberi kabar ke user tanpa membuka aplikasi.

---

## Fakta saat ini (dibaca dari kode, dikonfirmasi user 2026-10-18)

Semua fakta di bawah hasil pembacaan kode read-only; tabel diperbarui **2026-10-25** mengikuti laporan Bob-03…06 ([[Bob-261025-03-fcm-api-audit]], [[Bob-261025-04-claim-uuid-patch]], [[Bob-261025-05-fcm-token-cleanup]], [[Bob-261025-06-uuid-route-constraint]]); `routes/api.php` dikonfirmasi langsung, service/test hanya dari laporan — belum diverifikasi ulang penuh ke repo.

| Hal | Kondisi sekarang |
|---|---|
| Token perangkat | Sudah ada: `PUT /users/me/fcm-token` menyimpan token ke `users.fcm_token` ([[ERD]], [[TechnicalReference]] §8.3) |
| Pengiriman | **Sejak 2026-10-25:** dua tempat — `ClaimTransferService::notifyClaimant` (barang diserahkan) dan `ClaimNotificationService` (accepted/rejected → pengaju; withdrawn → penerima). Keduanya API v8 `CloudMessage::new()->withToken()`; **audit Bob-03 (2026-10-25): tidak ada API FCM usang di `app/`** |
| Ketahanan kirim | **Sejak 2026-10-25:** kegagalan kirim dicatat `Log::warning` dengan **token FCM diredaksi** dari pesan exception; tidak menggagalkan request. **Bob-05:** `DeadFcmTokenCleaner` mengosongkan `users.fcm_token` untuk `NotFound`/`SenderIdMismatch` **hanya bila token di DB masih sama**; `ServerUnavailable`/error lain → token tetap. **Retry/backoff untuk `ServerUnavailable` sengaja tidak dibuat** (keputusan 2026-10-25) |
| Claim diajukan | **Belum ada** push ke penerima claim |
| Claim diterima/ditolak | Push **sudah ada di endpoint user** (`ClaimNotificationService`; 1.2c `23d0be6` — **sudah merge `develop` PR #11 squash `18c85d4`**, koreksi 2026-10-29); menunggu handler Flutter; **tidak ada FCM di jalur admin/Filament** (audit Bob-03) — keputusan user 2026-10-25: FCM admin tidak diperlukan sekarang |
| Pesan chat baru | **Belum ada** push + deep link (open item Fase 3 [[Real-Time Chat - Lost&Found]]); penjadwalan di GPT-261104-02 |
| Daftar notifikasi di app | **Belum ada** — tidak ada tabel, tidak ada endpoint. **Keputusan user 2026-11-04: Opsi A → layar Notifikasi tetap empty state, lonceng tanpa badge; tidak akan ada sumber data daftar notifikasi.** Layar ([[Design]] §5.16) & badge lonceng (§5.6) |
| Paket | `kreait/laravel-firebase` terpasang ([[TechnicalReference]] §15.1); Flutter `firebase_messaging` terpasang |

**Implementasi aktual (2026-11-04, backend PR #24/25/27 + Flutter PR #21/22 merge develop):** Backend `PushNotificationService` terpusat sinkron best-effort; keenam `type` (`claim_new`, `claim_accepted`, `claim_rejected`, `claim_withdrawn`, `claim_returned`, `chat`) + payload `claim_id`/`conversation_id` (semua string); claim baru → penerima, accepted/rejected → pengaju, withdrawn → penerima, returned → lawan pihak transfer, chat → lawan bicara. Flutter `FcmService` lifecycle guard per sesi, izin sekali, token refresh, keenam type handled; claim → detail, chat dicari lewat daftar lalu fallback tab Chat; foreground banner OverlayEntry ~4 detik tanpa navigasi otomatis, suppress chat aktif. Logout dideduplikasi: shutdown guard, snapshot auth/token, tunggu PUT, conditional DELETE kredensial lama sebelum auth lokal dibuang, budget FCM 5 detik. Kegagalan jaringan/cleanup tidak gagalkan logout lokal. Tidak memanggil Firebase deleteToken atau ubah auto-init.

---

## Peristiwa yang perlu notifikasi

Daftar ini disusun dari [[Design]] §4, [[Claim Dua Arah dan Serah Terima oleh Pengguna - Lost&Found]] §2/§6, dan [[Real-Time Chat - Lost&Found]] Fase 3.

|| # | Peristiwa | Penerima | Catatan | Status 2026-11-04 |
|---|---|---|---|---|
| 1 | Claim diajukan | Pihak **penerima** claim (bukan pengaju) | Buka chat verifikasi | **Selesai** backend+Flutter (merge develop PR #24/#21) |
| 2 | Claim diterima ("Cocok") | Pengaju | Deep link ke detail claim | **Selesai** backend+Flutter (merge develop PR #25/#21) |
| 3 | Claim ditolak (alasan wajib) | Pengaju | Sertakan alasan | **Selesai** backend+Flutter (merge develop PR #25/#21) |
| 4 | Barang sudah diserahkan (`returned`) | Lawan pihak transfer | Sudah ada, ditambah payload | **Selesai** backend+Flutter (merge develop PR #24/#21) |
| 5 | Pesan chat baru | Lawan bicara | Deep link ke `ChatScreen` | **Selesai** backend+Flutter (merge develop PR #24/#21) |
| 6 | Claim dibekukan / aktif kembali (claim lain pada laporan sama) | Pengklaim yang dibekukan | Plan Claim Dua Arah §3 | **Di luar tugas ini** — status implementasi belum diverifikasi (open item) |
| 7 | Claim kedaluwarsa otomatis (7 hari) + pengingat H-1/H-2 | Pengklaim | Plan Claim Dua Arah §6 | **Ditunda** — butuh scheduler Dokploy |
| 8 | Status laporan milik user diubah admin | Pelapor | Mis. `closed` | **Tidak dikerjakan** — selaras keputusan 2026-10-25 (FCM admin tidak diperlukan) |

---

## USULAN — dua opsi

> [!info] 2026-11-04 — Opsi A **DIPUTUSKAN** oleh user
> **Opsi A dikutip:** database tetap **7 tabel**, tidak ada tabel/endpoint notifikasi. **Opsi B DITUNDA, bukan dibatalkan** — bisa diangkat lagi di tahap berikutnya (bila diangkat, perlu update [[ERD]]/`schema.dbml`/[[PRD]]/[[Design]] dulu). Teks usulan di bawah dipertahankan sebagai riwayat.

### Opsi A — FCM saja, tanpa tabel notifikasi ✅ DIPUTUSKAN 2026-11-04

- Backend mengirim FCM langsung di tiap peristiwa; tidak ada riwayat.
- Tidak ada endpoint daftar notifikasi, tidak ada badge angka yang benar-benar terhitung.
- Layar Notifikasi ([[Design]] §5.16) **disembunyikan** atau hanya berisi empty state; ikon lonceng di Beranda tanpa badge.
- Kelebihan: tidak menambah tabel (tetap 7 tabel), pekerjaan paling kecil.
- Kekurangan: notifikasi hilang begitu dibaca/di-swipe; user yang menutup izin notifikasi tidak punya cara melihat kabar di app.

### Opsi B — Tambah tabel notifikasi (tabel ke-8) ⏸ DITUNDA 2026-11-04

- Tabel `notifications` (mis. `id`, `user_id`, `type`, `title`, `body`, `data` JSON, `read_at`, `created_at`) + endpoint `GET /api/notifications`, `PATCH /api/notifications/{id}/read`, `PATCH /api/notifications/read-all`.
- Layar Notifikasi & badge lonceng bisa berjalan sesuai [[Design]] §5.16.
- **Bertentangan dengan keputusan "database 7 tabel"** → wajib update [[ERD]], `schema.dbml`, [[PRD]], [[Design]], [[TechnicalReference]] sebelum implementasi.
- Laravel sudah punya tabel `notifications` bawaan (database notifications) sebagai alternatif bentuk — perlu diputuskan apakah memakai tabel framework ini atau tabel sendiri. **Usulan, belum diputuskan.**

**Status: ✅ DIPUTUSKAN user 2026-11-04 — Opsi A.** Opsi B ditunda (bisa diangkat lagi nanti). Karena Opsi A, skema DB **tidak berubah** ([[ERD]]/`schema.dbml` tetap 7 tabel, tidak perlu diperbarui).

---

## USULAN — hal teknis lain (belum diputuskan)

1. **Log kegagalan FCM** — **sudah ada sejak 2026-10-25** (`Log::warning` di `ClaimTransferService` + `ClaimNotificationService`), tanpa mengubah perilaku user. **Bob-03:** token FCM **diredaksi** dari pesan exception sebelum masuk log. API FCM yang dipakai sudah v8 (`withToken`), jadi usulan lama "ganti `withTarget`" sekaligus terpenuhi.
2. **Payload & deep link standar** — **KONTRAK DITETAPKAN PM 2026-11-04 (belum diimplementasi):** payload `data` FCM berisi `type` ∈ `claim_new` | `claim_accepted` | `claim_rejected` | `claim_withdrawn` | `claim_returned` | `chat`. `claim_*` membawa `claim_id`; `chat` membawa `conversation_id`; **semua nilai string** (bukan angka). Kontrak ini **menggantikan** usulan lama `type` ∈ `claim | chat | report` — tipe spesifik sudah dipakai kode (`ClaimNotificationService` mengirim `claim_accepted`/`claim_rejected`/`claim_withdrawn` + `claim_id`). Flutter memetakan `type` → layar tujuan. **Teks lama (tidak dihapus):** usul format tetap `data: { type, id, ... }` dengan `type` ∈ `claim | chat | report` — sudah tidak berlaku.
3. **Judul/isi notifikasi** — ambil dari [[Design]] §5.16 (jenis notifikasi) agar konsisten.
4. **Toggle push di Pengaturan ([[Design]] §5.19)** — **ditunda** sampai push benar-benar bisa dimatikan. Mematikan push butuh keputusan: hapus `fcm_token` perangkat, atau tambah kolom preferensi di `users`. Belum diputuskan.
5. **Kirim ke token mati** — **DISETUJUI & DIPUTUSKAN 2026-10-25 (Bob-05):** `app/Services/DeadFcmTokenCleaner.php` mengosongkan `users.fcm_token` untuk `NotFound`/`SenderIdMismatch` **hanya bila token di DB masih sama** dengan token yang gagal (token yang baru di-refresh aman); `ServerUnavailable`/error lain → token tetap. `test_fcm.php` (file debug lama) **dihapus**.
6. **Antrian** — kirim FCM langsung (sinkron, seperti sekarang) atau lewat queue. **Status 2026-11-04: BELUM diputuskan eksplisit oleh user** → tetap **usulan: sinkron untuk MVP**; ubah bila traffic besar.
7. **Retry/backoff untuk `ServerUnavailable`** — **DITOLAK / sengaja tidak dibuat (keputusan 2026-10-25):** kegagalan tetap `Log::warning`, request tetap 2xx. Bila nanti perlu, kegagalan transien bisa dikirim ulang oleh worker, bukan menahan request user.

---

## Ruang lingkup pekerjaan (garis besar, detail menyusul setelah keputusan A/B)

**Backend (Laravel)** — satu service pengirim terpusat (mis. `NotificationService`) agar tidak ada pemanggilan FCM tersebar; panggil dari titik peristiwa (claim dibuat, claim diterima/ditolak, serah terima, pesan chat, status laporan). Semua titik integrasi milik plan lain → **jangan dikerjakan sebelum plan [[Claim Dua Arah dan Serah Terima oleh Pengguna - Lost&Found]] dan Fase 3 [[Real-Time Chat - Lost&Found]] jalan**, agar tidak menyentuh alur yang sama dua kali.

**Flutter** — handler notifikasi latar depan/belakang, deep link sesuai `type`, izin notifikasi, dan (bila Opsi B) layar Notifikasi + badge.

> [!info] 2026-11-04 — rencana lingkup Flutter (Opsi A; GPT, tugas menyusul)
> Karena Opsi A, **tidak ada** layar Notifikasi berisi data/badge angka — tetap empty state. Lingkup Flutter yang direncanakan:
> - **Izin notifikasi Android 13+** (`POST_NOTIFICATIONS`) — minta runtime permission.
> - **Tampilan saat app terbuka (foreground)** — tampilkan notifikasi tanpa ganda bila `chat` yang sama sedang dibuka (suppress bila `conversation_id` == chat aktif).
> - **Deep link** — `claim_*` → detail claim (`claim_id`); `chat` → `ChatScreen` (`conversation_id`).
> - **`getInitialMessage`** — tangani notifikasi saat app **tertutup** (cold start) untuk deep link yang sama.
> - Background handler saat ini hanya `debugPrint`; perlu penanganan nyata bila deep link dari background dibutuhkan.

**Filament** — tidak ada perubahan yang diminta. Aksi admin yang memicu notifikasi (terima/tolak) tetap di plan Claim Dua Arah.

---

## Testing Strategy (usulan)

- Unit/feature test: tiap peristiwa memanggil pengirim notifikasi tepat sekali, penerima benar (pengaju vs penerima claim tidak tertukar).
- Kegagalan FCM tidak menggagalkan transaksi utama (mis. claim tetap `accepted` walau kirim gagal) — tapi **tercatat** di log.
- Manual: dua perangkat — claim diajukan, chat baru, serah terima; cek deep link saat app tertutup dan saat app terbuka.

---

## Open Items

- [x] **Keputusan user: Opsi A (FCM saja, tanpa tabel notifikasi)** — diputuskan user 2026-11-04; database tetap 7 tabel, [[ERD]]/`schema.dbml` tidak berubah. Opsi B ditunda (bisa diangkat lagi).
- [x] **Implementasi MVP Opsi A selesai & diterima sementara** (2026-11-04) — backend+Flutter merge develop; uji manual 2 HP "sebagian besar berhasil"; **rincian checklist belum lengkap**. Lihat batasan & pekerjaan lanjutan di bawah.
- [ ] Keputusan bentuk tabel notifikasi (tabel sendiri vs tabel `notifications` bawaan Laravel) — **hanya relevan bila Opsi B diangkat lagi** (saat ini Opsi A, tidak relevan).
- [ ] Keputusan cara mematikan push (toggle Pengaturan) — **ditunda** (user belum memutuskan).
- [ ] **Keputusan pengiriman sinkron vs queue** — **belum diputuskan eksplisit**; implementasi aktual sinkron best-effort.
- [ ] **Open item verifikasi manual:** rincian checklist dua akun/dua HP (foreground/background/terminated, semua penerima, regresi logout) **belum lengkap** — user menyatakan "sebagian besar berhasil", tanpa daftar kasus gagal/belum diuji. Jangan klaim semua kombinasi sudah lulus.
- [ ] **Race PUT paralel token sama:** transaksi existing tanpa lock per token/constraint unik belum jamin pemilik tunggal di bawah konkurensi.
- [ ] **Logout offline/timeout/auth expired/token tidak pasti:** token server dapat tetap ada; pelepasan best-effort bukan jaminan privasi mutlak. Push yang sudah terkirim/tampil tidak ditarik DELETE.
- [ ] **Satu slot token per user; iOS & multi-perangkat penuh** belum diverifikasi rangkaian ini.
- [ ] **Test `ConversationArchiveTest::test_unread_count_filtered_by_deleted_at` tetap gagal** (diagnosis: `visibleTo` kecualikan deleted_at terisi; assertion data null).
- [ ] **Scheduler Dokploy ditunda** (keputusan user 2026-11-04 belum prioritas) — blokir pengingat/kedaluwarsa claim + arsip otomatis. N+1 daftar percakapan terbuka.
- [ ] **Open item (verifikasi kode 2026-11-04):** #6 (claim dibekukan/aktif kembali) status implementasi belum diverifikasi; #7 (kedaluwarsa + pengingat) ditunda scheduler; #8 (status laporan diubah admin) tidak dikerjakan. History/Opsi B, badge, toggle, ikon/channel khusus, push admin, event di luar 6 type tidak otomatis selesai.
- [x] Prioritas plan ini `high` (ditetapkan user 2026-10-18).
- [x] **Retry/backoff `ServerUnavailable` — TIDAK dibuat** (keputusan 2026-10-25); kegagalan tetap `Log::warning`, request tetap 2xx.
- [x] **FCM jalur admin/Filament — tidak diperlukan sekarang** (keputusan 2026-10-25; audit Bob-03: tidak ada FCM di jalur admin, `Notification::make()` Filament bukan FCM).
- [x] **Token mati dibersihkan** (2026-10-25, Bob-05: `DeadFcmTokenCleaner`; `test_fcm.php` dihapus) — 247 test lulus.

---

## Konflik dengan dokumen lain (ditemukan 2026-10-18)

- [[Design]] §4 dan §5.16 menjanjikan badge lonceng + daftar notifikasi ber-jenis, sementara backend belum punya sumber data apa pun. **Resolusi 2026-11-04: Opsi A dipilih → [[Design]] §5.6 & §5.16 disesuaikan** (layar Notifikasi tetap empty state, lonceng tanpa badge angka).
- [[TechnicalReference]] §11 hanya menyebut setup Firebase + deep link tanpa daftar peristiwa; daftar peristiwa di plan ini lebih rinci → §11 diselaraskan sebagian (lihat perubahan 2026-10-18).
- Tidak ada klaim selesai untuk fitur ini: tidak ada tabel, endpoint, atau tangkapan tes yang menunjukkan push berjalan untuk claim/chat.

---

## Related Files

- **Backend:** `C:\Project\lostfound-backend` (Gitea kampus: `git.informatikapolines.id/Daniel_Geovani/lostfound-backend`, Private, HTTPS)
- **Flutter:** `C:\Project\lostfound-mobile` (Gitea kampus: `git.informatikapolines.id/Daniel_Geovani/lostfound-mobile`, Private, HTTPS)
- **Plan terkait:** [[Claim Dua Arah dan Serah Terima oleh Pengguna - Lost&Found]], [[Real-Time Chat - Lost&Found]], [[Security Hardening - Lost&Found]]
- **Dokumen:** [[Design]] §4, §5.6, §5.16, §5.19 · [[TechnicalReference]] §8.3, §11, §17 · [[ERD]]
- **Catatan:** [[Backlog Perbaikan Lanjutan - Lost&Found]] open item (x) menutup stub tombol WhatsApp — bukan bagian plan ini.

---

#plan #lost-and-found #push-notification #fcm #claim #chat
