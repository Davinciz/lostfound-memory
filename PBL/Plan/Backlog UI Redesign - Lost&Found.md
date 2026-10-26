---
type: plan
project: lost-found
status: active
priority: high
updated: 2026-10-19
summary: Fase A–D merge develop; E-2/E-6 selesai, E-5 selesai di kode, E-1/E-3 sebagian, E-4 dibatalkan, QA HP belum
---

# Backlog UI Redesign - Lost&Found

**Tanggal:** 2026-10-18 (diperbarui 2026-10-19)
**Project:** [[PBL]] Lost&Found
**Status:** Active
**Priority:** High

> **Aturan centang:** item di bawah **belum selesai** kecuali yang ditandai `[x]` **beserta keterangan sumbernya** (klarifikasi user / commit / hasil tes). Jangan menandai `[x]` tanpa konfirmasi eksplisit user atau bukti tercatat.
>
> **Status E-1…E-6 dikonfirmasi user 2026-10-19** (hasil PR #4–#8 squash ke `develop`, repo `lostfound-mobile`).

---

## Tujuan

Mencatat satu tempat untuk pekerjaan UI Flutter Campus Lost&Found: apa yang **sudah** dikerjakan (Fase A–D redesign UI + design system, **sudah merge ke `develop`**) dan apa yang **masih** terbuka (E-1…E-6, QA HP, dan item yang menunggu prasyarat backend/plan lain). Plan ini menggantikan penyebaran catatan UI di [[Backlog Perbaikan Lanjutan - Lost&Found]] open item (vii), (ix), (xi), (xii), (xiii) — item asal di sana tetap jadi rujukan, tidak dihapus.

---

## Status Saat Ini — Fase A–D UI Redesign (selesai, sudah merge)

**Fakta dari user (klarifikasi 2026-10-18):**

| Fase | Isi | Commit | Status |
|---|---|---|---|
| A–D | Redesign UI + design system Flutter | `fa6dfcb`, `8537490`, `905de94` | **Selesai, sudah merge ke `develop`** |

- Branch asal: **`feature/ui/design-system`** (repo Flutter `C:\Project\lostfound-mobile`). Remote: **Gitea kampus** (dikonfirmasi user 2026-10-18).
- Belum ada laporan `flutter analyze` / `flutter test` maupun tes HP **semua layar** untuk hasil merge ini — itu isi QA di bawah.
- Konvensi Git: lihat [[TechnicalReference]] §15.3 dan [[Adopsi GitFlow-lite & Migrasi ke Gitea - Lost&Found]] (mulai dari `develop`, scope commit, PR squash). **Catatan:** scope commit pekerjaan UI belum tertulis di dokumen mana pun; belum ditetapkan apakah perlu dicatat.
- Design.md ([[Design]]) **tidak** diubah isinya oleh pekerjaan Fase A–D; belum ada audit visual hasil Fase A–D terhadap spec [[Design]] — jika menyimpang, spec yang menyesuaikan.

---

## Perbaikan UI Terbuka (E-1 … E-6)

**Status per 2026-10-19 (dikonfirmasi user):** E-2, E-6 **selesai**; E-5 **selesai di kode** (uji mode pesawat di HP tetap QA terbuka); E-1, E-3 **sebagian**; E-4 **dibatalkan** (pin peta sudah berfungsi). QA HP semua layar **belum**.

> [!info] Status final dikonfirmasi user 2026-10-19
> Kolom Status dan checkbox di bawah **sudah diperbarui**. Sisa pekerjaan E-1 (11 layar `ApiClient()`) dan E-3 (backend `scope-claims-access`/`report-pagination`) tetap tercatat sebagai **open items** di §Open Items & Temuan Teknis — **belum** dibuatkan Plan baru; menunggu keputusan user.

| ID | Prioritas | Ringkasan | Status | Rujukan |
|---|---|---|---|---|
| E-1 | Tinggi | Toggle WhatsApp stale; sembunyikan toggle push; ApiClient lewat Provider; sembunyikan ikon Share | **Sebagian** (PR #6) — sisa: `ApiClient()` di 11 layar | [[Design]] §5.9, §5.18, §5.19 |
| E-2 | Tinggi | `baseUrl` via `--dart-define`; LogInterceptor tanpa header `Authorization` & hanya debug; `print` → `debugPrint` | **Selesai** (PR #4) | Backlog (xiii), (vii) |
| E-3 | Sedang | Dropdown claim pakai `mine=1&status=pending`; hapus filter klien di Claim Saya setelah backend claim diperbaiki | **Sebagian** (PR #7) — sisa: backend, blok B-1 | Backlog (ix) |
| E-4 | Sedang | Pin peta bisa digeser | **Dibatalkan** — pin sudah berfungsi, tidak ada kode dibuat | [[Design]] §5.8 |
| E-5 | Sedang | Bundel font Plus Jakarta Sans | **Selesai di kode** (PR #5); uji mode pesawat di HP = QA terbuka | [[Design]] §2.2 |
| E-6 | Rendah | Pull-to-refresh `MyReportsScreen`; format tanggal konsisten | **Selesai** (PR #8) | Backlog (xi), (xii) |
| QA | — | Tes manual di HP untuk semua layar | **Belum** | — |

### Hasil Pengerjaan 2026-10-19 (PR #4–#8, repo `lostfound-mobile`)

Semua PR di bawah **sudah merge ke `develop`** lewat **squash merge** pada 2026-10-19. Hash branch **bukan** hash `develop`, jadi hash `develop` tidak dicatat di sini.

| ID | PR | Branch asal | Status (dikonfirmasi user 2026-10-19) | Ringkas hasil |
|---|---|---|---|---|
| E-2 | #4 | `chore/repo/client-config-hardening` | **Selesai** | `baseUrl` via `--dart-define`; LogInterceptor hanya debug & tanpa header/body; `print` → `debugPrint` |
| E-5 | #5 | `chore/ui/bundle-font` | **Selesai di kode** (uji mode pesawat di HP belum) | 4 TTF Plus Jakarta Sans dibundel; runtime fetching dimatikan |
| E-1 | #6 | `fix/ui/wa-visibility-inert-controls` | **Sebagian** | WA persisten, toggle push disembunyikan, ikon Share dihapus, ApiClient via Provider di 2 layar; 11 layar sisanya masih instansiasi langsung |
| E-3 | #7 | `fix/claim/claim-form-lost-report-list` | **Sebagian** | Dropdown claim pakai `mine: true` + paginasi penuh; filter klien Claim Saya **masih perlu** karena backend `paginate(20)` tanpa scope claimant |
| E-6 | #8 | `chore/ui/polish-low` | **Selesai** | Pull-to-refresh + paginasi `MyReportsScreen`; format tanggal diseragamkan |
| E-4 | — | — | **Dibatalkan** | Pin peta sudah berfungsi selama pengujian; perilaku tap tetap dipakai; tidak ada branch/kode |

**QA:** tes manual di HP untuk semua layar **belum dilakukan**.

### E-1 (Tinggi) — Toggle WhatsApp, toggle push, ApiClient Provider, ikon Share

- [x] **Toggle WhatsApp (nilai stale)** — toggle "Tampilkan nomor WhatsApp ke pengguna lain" menampilkan nilai basi (state tidak ikut berubah/refresh). **SELESAI 2026-10-19 (PR #6):** `User.copyWith` + `ApiClient.saveCachedUser`; penyebab: cache user hanya ditulis saat `googleLogin`. Toggle/field WA **terbukti ada** di kode. Test `wa_visibility_persist_test.dart`. Endpoint pengisian nomor tetap belum ada ([[Nomor WhatsApp Pengguna - Lost&Found]]) — bukan bagian item ini.
- [x] **Sembunyikan toggle push** — **SELESAI 2026-10-19 (PR #6):** disembunyikan lewat `_showPushToggle = false`, bertanda `TODO(ui-gap)`, dipulihkan saat FCM bisa unsubscribe. Catatan user tetap berlaku: **push notification belum pernah diuji langsung** di HP.
- [ ] **ApiClient lewat Provider** — ApiClient diambil lewat Provider (bukan instansiasi langsung/global), supaya base URL & token satu sumber. **SEBAGIAN 2026-10-19 (PR #6):** Provider hanya dipakai di `settings_screen` dan `edit_profile_screen`; **11 layar** masih `ApiClient()` langsung. Sisa pekerjaan = open item #1, belum ada Plan.
- [x] **Sembunyikan ikon Share** — **SELESAI 2026-10-19 (PR #6):** ikon share dihapus dari header `report_detail_screen`. [[Design]] §5.9 sudah diberi callout + coretan.

> [!info] Hasil 2026-10-19 — **SEBAGIAN** (PR #6, branch `fix/ui/wa-visibility-inert-controls`, merge `develop`)
> - **Selesai:** toggle WhatsApp kini persisten — `User.copyWith` + `ApiClient.saveCachedUser`; penyebab nilai stale: cache user hanya ditulis saat `googleLogin`. Toggle push disembunyikan lewat flag `_showPushToggle = false` (bertanda `TODO(ui-gap)`, dipulihkan saat FCM bisa unsubscribe). Ikon Share di `report_detail_screen` dihapus. Teks "Tema gelap belum tersedia." dihapus. `ApiClient` diambil via Provider **hanya** di `settings_screen` dan `edit_profile_screen`. Test baru `wa_visibility_persist_test.dart`.
> - **Belum:** `ApiClient()` per layar masih dipakai di **11 layar** — my_claims, claim_detail, claim, chat, conversation_list, my_reports, home, main_tab, search, report_form, report_detail. Sisa pekerjaan ini butuh izin/Plan lanjutan (belum dibuat).

### E-2 (Tinggi) — Konfigurasi & log ApiClient

- [x] `baseUrl` tidak hardcode: pakai `--dart-define` (mis. `API_BASE_URL`), dengan default yang aman untuk dev. **SELESAI 2026-10-19 (PR #4).**
- [x] `LogInterceptor` (Dio): **jangan** cetak header `Authorization`; aktif **hanya** di build debug. **SELESAI 2026-10-19 (PR #4)** — header & body tidak dicetak.
- [x] Ganti `print` → `debugPrint` (sisa ±8 info `avoid_print`). **SELESAI 2026-10-19 (PR #4).**
- Terkait catatan keamanan di [[Security Hardening - Lost&Found]] §5.2 (API response filtering) dan Backlog (xiii). **Isi token tidak boleh dicatat di vault.**

> [!success] Hasil 2026-10-19 — **SELESAI** (PR #4, branch `chore/repo/client-config-hardening`, merge `develop`)
> - `baseUrl` lewat `--dart-define=API_BASE_URL`; nilai default lama tetap dipertahankan sebagai fallback.
> - `LogInterceptor` hanya aktif di `kDebugMode`; header request/respons **dan** body request/respons tidak dicetak (diverifikasi `responseBody = false`).
> - `print` → `debugPrint` di `main.dart`, `fcm_service.dart`, `upload_service.dart`. Backlog (xiii) tertutup.
> - Cara pakai: `flutter run --dart-define=API_BASE_URL=http://<host>:8000/api`.

### E-3 (Sedang) — Dropdown claim & filter Claim Saya

> [!warning] Akan berubah (revisi 2026-10-19, disetujui, belum diimplementasi)
> Claim tidak lagi wajib punya laporan sendiri. Dropdown "Laporan hilang kamu" jadi **opsional** dan hanya muncul bila user memilih menautkan laporan sendiri. Tombol "Aku Menemukan Barang Ini" tidak redirect ke form Lapor. Lihat [[Claim Dua Arah dan Serah Terima oleh Pengguna - Lost&Found]] §Revisi 2026-10-19.

- [x] Dropdown "Laporan hilang kamu" di `claim_screen.dart` memakai **`mine=1&status=pending`** — **SELESAI 2026-10-19 (PR #7):** `getLostReports(mine: true, status: 'pending', perPage: 50)` + loop halaman sampai `lastPage`; filter `reporterId` di klien dihapus. **Opsional** setelah revisi 2026-10-19: hanya dipanggil bila user memilih menautkan laporan sendiri.
- [ ] Hapus filter sisi klien di layar Claim Saya **setelah** backend claim diperbaiki. Prasyarat: lihat **B-1** di bawah. **BELUM 2026-10-19** — `ClaimController::index` masih `paginate(20)` tanpa scope `claimant_id`; branch backend tidak ada. Open item #2 & #3.
- Sumber: Backlog open item (ix); [[TechnicalReference]] §17 item (h); [[Real-Time Chat - Lost&Found]] open item 8.

> [!info] Hasil 2026-10-19 — **SEBAGIAN** (PR #7, branch `fix/claim/claim-form-lost-report-list`, merge `develop`)
> - **Selesai (mobile):** dropdown laporan hilang di form claim memakai `getLostReports(mine: true, status: 'pending', perPage: 50)` dengan loop halaman sampai `lastPage`; filter `reporterId` di klien `claim_screen` dihapus; test baru di `claim_screen_test.dart`.
> - **Belum:** filter klien di `my_claims_screen.dart` **harus tetap** karena `ClaimController::index` (develop) masih `paginate(20)` tanpa scope `claimant_id`. `per_page=50` belum berpengaruh karena backend hardcode `paginate(20)`.
> - **Ketergantungan backend:** branch `fix/claim/scope-claims-access` dan `fix/api/report-pagination` **tidak ada** di `lostfound-backend` → perlu dijadwalkan. Backlog (ix) sebagian tertangani.

### E-4 (Sedang) — Pin peta bisa digeser — DIBATALKAN

- [x] Pin di peta form laporan bisa digeser. **Klarifikasi user 2026-10-18: "pin emang sudah bisa digeser dan tidak ada masalah".** Tidak ada pekerjaan; item ditutup.
- [[Design]] §5.8 sudah sesuai kenyataan → **bukan konflik** (sebelumnya salah dicatat sebagai dokumen mendahului kode).

> [!note] Status final 2026-10-19 — **DIBATALKAN** (dikonfirmasi user)
> **Alasan:** pin peta sudah berfungsi tanpa masalah selama pengujian, perilaku tap tetap dipakai, sehingga tidak ada yang perlu diperbaiki. **Tidak ada branch maupun kode yang dibuat.** Item tetap dipertahankan di tabel dan daftar ini sebagai catatan keputusan, tidak dihapus.

### E-5 (Sedang) — Bundel font Plus Jakarta Sans

- [x] Bundel font Plus Jakarta Sans di `pubspec.yaml` + `assets/fonts`, jangan bergantung font sistem/`google_fonts` runtime. **SELESAI 2026-10-19 (PR #5)** — 4 TTF dibundel di `assets/images/google_fonts/` (bukan `assets/fonts`; lihat open item #4), `allowRuntimeFetching = false`.
- [ ] **Uji mode pesawat di HP** — memastikan font tampil tanpa jaringan. **BELUM** — tetap QA terbuka, jangan dicentang.
- [[Design]] §2.2 menetapkan Plus Jakarta Sans sebagai satu-satunya font (semua layar + admin Filament). **Klarifikasi user 2026-10-18: font baru masuk implementasi sekarang** — Fase A–D belum membundel font, jadi ini pekerjaan baru, bukan regresi.

> [!success] Hasil 2026-10-19 — **SELESAI di kode** (PR #5, branch `chore/ui/bundle-font`, merge `develop`)
> - 4 TTF Plus Jakarta Sans (Regular/Medium/SemiBold/Bold) di `assets/images/google_fonts/`, terdaftar di `pubspec.yaml`; `GoogleFonts.config.allowRuntimeFetching = false` di `app_theme.dart` (gagal keras bila asset hilang).
> - **Belum:** verifikasi uji mode pesawat di HP (manual).
> - Catatan path: folder `assets/images/` di-gitignore sementara `pubspec.yaml` mendeklarasikannya; font di-commit di dalam folder itu, aset lain belum ter-track → lihat open item di [[TechnicalReference]] §17.

### E-6 (Rendah) — Laporan Saya & format tanggal

- [x] `MyReportsScreen`: pull-to-refresh benar (spinner di dalam daftar, bukan mengganti daftar), `setState` dicek `mounted`, `_lastPage` diperbarui saat load more (Backlog xi). **SELESAI 2026-10-19 (PR #8).**
- [x] Format tanggal konsisten: layar detail memakai `DateFormat('dd MMMM yyyy')` tanpa locale eksplisit & tanpa `.toLocal()`; `MyReportsScreen` memakai `'dd MMM yyyy'` + `id_ID` + `.toLocal()` — samakan (Backlog xii). **SELESAI 2026-10-19 (PR #8)** — `formatDate` (`dd MMM yyyy`, `id_ID`, `toLocal`) di `ReportCard` dan detail laporan.

> [!success] Hasil 2026-10-19 — **SELESAI** (PR #8, branch `chore/ui/polish-low`, merge `develop`)
> - Pull-to-refresh `MyReportsScreen` dengan paginasi dan load-more (Backlog xi).
> - Format tanggal konsisten lewat `formatDate` (`dd MMM yyyy`, `id_ID`, `toLocal`) di `ReportCard` dan detail laporan (Backlog xii).
> - **Belum:** widget test khusus `my_reports_screen` belum ada.

---

## QA — Tes Manual di HP

- [ ] Tes manual **semua layar** di HP (Fase A–D sudah merge ke `develop`; jalankan setelah E-1…E-6 dikerjakan). **Status 2026-10-19: BELUM.**
- [ ] **Uji mode pesawat** untuk font bundel (E-5) — memastikan Plus Jakarta Sans tampil tanpa jaringan. **BELUM.**
- Cakupan minimal: Beranda, Cari & Filter, Form Lapor (Hilang & Ditemukan), Detail Barang, Form & Detail Claim, Laporan Saya, Claim Saya, Daftar Chat, Ruang Chat, Profil, Edit Profil, Pengaturan, Splash/Login.
- **Push notification belum pernah diuji langsung** (klarifikasi user 2026-10-18) — jadikan langkah tes eksplisit kalau FCM diaktifkan.
- Hasil tes dicatat di PBL/DailyChanges. Tanpa laporan tes, tidak ada item di plan ini yang boleh dicentang.

> [!warning] 2026-10-19 — **belum dilakukan**
> Tes manual di HP **semua layar** masih terbuka. Uji mode pesawat untuk font (E-5) **juga belum**. Tes push belum pernah dilakukan (toggle FCM disembunyikan). Karena itu E-5 hanya dicatat **selesai di kode**, bukan selesai penuh.

---

## Menunggu Prasyarat (jangan dikerjakan dulu)

| ID | Item | Prasyarat / penghambat |
|---|---|---|
| B-1 | Perbaikan backend **IDOR `ClaimController`** (repo backend) | Menghambat E-3 (hapus filter klien Claim Saya). **Keputusan user 2026-10-18: dicatat di [[Backlog Perbaikan Lanjutan - Lost&Found]] open item (xiv)**, bukan di Security Hardening. |
| F-1 | Restyle Daftar Chat & Ruang Chat | Menunggu **[[Real-Time Chat - Lost&Found]] Fase 2 merge** (branch `feature/chat/chat-ui` belum dilaporkan). |
| F-2 | Kartu konteks chat | Butuh field `context` di respons `GET /api/conversations`; usulan di [[Real-Time Chat - Lost&Found]] §Kartu Konteks di Ruang Chat — **belum diputuskan**. |
| F-3 | Field WhatsApp + tombol "Chat WhatsApp" | Butuh `PUT /users/me` + verifikasi tidak ada kebocoran nomor di respons laporan → [[Nomor WhatsApp Pengguna - Lost&Found]] (masih `Planning`). **Klarifikasi user 2026-10-18: WhatsApp belum masuk implementasi — masih tahap plan.** |
| F-4 | Layar Notifikasi | Butuh keputusan user **Opsi A / Opsi B** di [[Push Notification - Lost&Found]]. **Klarifikasi user 2026-10-18: layar Notifikasi memang masih di tahap plan** (belum ada implementasi). |
| F-5 | Tombol serah terima / batal claim | Menunggu endpoint [[Claim Dua Arah dan Serah Terima oleh Pengguna - Lost&Found]]. |
| F-6 | Waktu per langkah timeline | Butuh riwayat status di backend (belum ada endpoint). |

---

## Catatan Tambahan

- [ ] **Kebijakan Privasi & S&K** — teks hasil agent perlu **review manusia** sebelum dipakai (isi dan bahasa hukum belum diverifikasi siapa pun).
- [ ] **Versi aplikasi** di Pengaturan masih hardcode `1.0.0`. Usul memakai `package_info_plus` **menunggu persetujuan user** (penambahan dependensi tidak dilakukan tanpa izin).
- [[Design]] §5.19 grup "Lainnya" menyebut keduanya; keputusan di atas menentukan apakah perlu update dokumen.

---

## Konflik Antar Dokumen

**Masih berlaku:**

1. **[[Design]] §5.9 vs E-1** — Design menampilkan "ikon share" di header detail; keputusan user: ikon disembunyikan. **Selesai 2026-10-19 (PR #6):** ikon share sudah dihapus dari kode; [[Design]] §5.9 sudah diberi callout.
2. **[[Design]] §5.19 vs E-1** — Design mencantumkan toggle "Notifikasi push" sebagai elemen Pengaturan; [[Push Notification - Lost&Found]] menunda toggle itu. **Selesai 2026-10-19 (PR #6):** toggle disembunyikan lewat `_showPushToggle = false` (`TODO(ui-gap)`); [[Design]] §5.19 sudah diberi callout. Push **masih belum pernah diuji langsung**.
3. **[[Design]] §5.16 vs F-4** — Design menggambarkan layar Notifikasi berisi daftar + badge angka; belum ada sumber data notifikasi; bentuk final bergantung keputusan Opsi A/B. User mengonfirmasi layar ini masih tahap plan.
4. **[[Design]] §5.18 & §5.9 vs backend** — field No. WhatsApp & tombol WA digambarkan berjalan; user menyatakan WA belum masuk implementasi & belum ada jalur penyimpanan nomor ([[Nomor WhatsApp Pengguna - Lost&Found]]).
5. **Fase A–D UI tidak ada di dokumen mana pun** — tidak di [[Design]], [[TechnicalReference]], [[Lost&Found Progress]], maupun DailyChanges sebelum entri 2026-10-18; commit `fa6dfcb`, `8537490`, `905de94` dan status merge ke `develop` hanya diketahui dari keterangan user.
6. **B-1 (IDOR `ClaimController`) belum ada di vault** — tidak ditemukan di [[Security Hardening - Lost&Found]] (Layer 5 "Authorization" hanya memuat foto-delete Item 9) maupun [[Backlog Perbaikan Lanjutan - Lost&Found]]. Keputusan user 2026-10-18: masuk Backlog → ditambahkan sebagai item (xiv).
7. **Sumber repo** — pengaturan project Hermes Desktop menyebut GitHub `Davinciz/...` sebagai remote utama; `_Konteks.md` dan seluruh plan memakai **Gitea kampus**. **User mengonfirmasi 2026-10-18: pakai Gitea.** Konflik ada di sisi pengaturan Hermes, bukan di vault.
8. **Font Plus Jakarta Sans** — keputusan Design sejak lama (§2.2), baru masuk implementasi 2026-10-19. **Selesai di kode (PR #5, E-5):** 4 TTF dibundel, `allowRuntimeFetching = false`. Catatan: file diletakkan di `assets/images/google_fonts/`, bukan `assets/fonts` seperti tertulis di E-5; folder `assets/images/` di-gitignore → lihat Open Items #4.

**Sudah selesai (jangan ditulis lagi sebagai konflik):**

9. ~~[[Design]] §5.8 vs implementasi (pin draggable)~~ — diklarifikasi user 2026-10-18: pin sudah bisa digeser, tidak ada masalah. Design §5.8 sesuai kenyataan.

**Ketidakpastian yang belum jadi konflik (perlu verifikasi kode):**

10. Status implementasi WhatsApp: klarifikasi user ("sepertinya belum masuk implementasi") vs laporan bug toggle WA stale (E-1). Salah satu bisa keliru — cek dulu sebelum dikerjakan. **SELESAI 2026-10-19:** toggle/field WA ada di kode; bug stale sudah diperbaiki (PR #6). Yang belum ada hanya jalur pengisian nomor (F-3).

---

## Perlu Verifikasi Sebelum Dikerjakan

1. **Apakah toggle/field WhatsApp sudah ada di app** — menentukan apakah E-1 butir pertama itu perbaikan bug (toggle ada, nilai stale) atau melebur ke F-3 (belum ada sama sekali). Jawaban user masih "sepertinya belum masuk implementasi". **Terjawab 2026-10-19:** toggle/field WA **ada** di app; nilainya stale karena cache user hanya ditulis saat `googleLogin` — sudah diperbaiki lewat PR #6 (`User.copyWith` + `ApiClient.saveCachedUser`). F-3 (endpoint pengisian nomor) tetap terpisah dan belum dikerjakan.
2. **Hasil `flutter analyze` / `flutter test`** setelah merge Fase A–D ke `develop`.
3. **Nasib branch `feature/ui/design-system`** setelah merge (dihapus atau disimpan) — belum diputuskan.

---

## Urutan Pengerjaan (usulan, belum disetujui)

> [!note] 2026-10-19 — langkah 2–4 sebagian sudah jalan lewat PR #4–#8 (E-2/E-6 selesai, E-1/E-3 sebagian, E-5 selesai di kode, E-4 dibatalkan). Sisa: 11 layar Provider (E-1), backend claim scope + pagination (E-3), QA HP semua layar. Urutan di bawah tidak diubah, hanya sebagai riwayat usulan.

1. Verifikasi dulu: apakah toggle WA ada di kode; jalankan `flutter analyze`/`flutter test` setelah merge Fase A–D.
2. E-1 + E-2 (Tinggi) — butir WA pada E-1 menunggu hasil verifikasi nomor 1.
3. E-3 (menunggu B-1 selesai di backend) dan E-5.
4. E-6 (Rendah) + QA penuh di HP (termasuk tes push kalau FCM diaktifkan).
5. Item F-* hanya setelah prasyaratnya selesai.

---

## Open Items & Temuan Teknis (2026-10-19)

Bukan tugas baru — hanya catatan. Plan lanjutan **belum dibuat** dan butuh persetujuan user. Sisa pekerjaan E-1 & E-3 hidup di sini sampai user memutuskan.

| # | Item | Status |
|---|---|---|
| 1 | **Sisa E-1:** `ApiClient()` per layar di 11 layar (my_claims, claim_detail, claim, chat, conversation_list, my_reports, home, main_tab, search, report_form, report_detail) → pindah ke Provider | **Open** — menunggu keputusan user |
| 2 | **Sisa E-3:** filter klien `my_claims_screen.dart` hanya bisa dihapus setelah backend `ClaimController::index` memberi scope `claimant_id` + pagination | **Open** — menunggu jadwal backend |
| 3 | **Backend:** branch `fix/claim/scope-claims-access` dan `fix/api/report-pagination` **tidak ada** di `lostfound-backend` | **Open** — menunggu keputusan user |
| 4 | **`assets/images/` di-gitignore** sementara `pubspec.yaml` mendeklarasikannya; font E-5 di-commit di folder itu, aset lain belum ter-track | **Open** — perlu keputusan: track aset atau pindah font ke `assets/fonts/` |
| 5 | **Drift `pubspec.lock`** — entri `google_fonts` pernah hilang saat build lokal; belum terbukti di git | Pantau |
| 6 | **Warning KGP** dari plugin `location` dan `pusher_channels_flutter` | Perlu upgrade plugin |
| 7 | Stash lokal `client-config-hardening` dan worktree `lostfound-mobile-claim` sudah tidak diperlukan | Info saja |
| 8 | **Widget test `my_reports_screen`** belum ada (E-6) | Nice-to-have |
| 9 | **Uji mode pesawat** untuk verifikasi font bundel (E-5) belum | **Open** — QA manual |

---

## Related Files

- **Flutter mobile:** `C:\Project\lostfound-mobile` (Gitea kampus: `git.informatikapolines.id/Daniel_Geovani/lostfound-mobile`, Private, HTTPS) — `develop` sudah memuat Fase A–D redesign UI
- **Backend:** `C:\Project\lostfound-backend` (Gitea kampus, Private, HTTPS) — B-1 (IDOR `ClaimController`) ada di sini
- **Design spec:** [[Design]] — §2.2, §5.8, §5.9, §5.14, §5.15, §5.16, §5.18, §5.19
- **Backlog asal:** [[Backlog Perbaikan Lanjutan - Lost&Found]] — item (vii), (ix), (xi), (xii), (xiii), plus (xiv) baru
- **Prasyarat:** [[Real-Time Chat - Lost&Found]] · [[Nomor WhatsApp Pengguna - Lost&Found]] · [[Push Notification - Lost&Found]] · [[Claim Dua Arah dan Serah Terima oleh Pengguna - Lost&Found]] · [[Security Hardening - Lost&Found]]
- **Progres:** [[Lost&Found Progress]]

---

#plan #lost-and-found #ui #design-system #flutter #backlog