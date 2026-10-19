---
type: plan
project: lost-found
status: active
priority: high
updated: 2026-10-19
summary: Fase A–D redesign UI (sudah merge ke develop) + perbaikan UI terbuka E-1…E-6, QA HP, dan prasyarat B-1/F-1…F-6
---

# Backlog UI Redesign - Lost&Found

**Tanggal:** 2026-10-18
**Project:** [[PBL]] Lost&Found
**Status:** Planning
**Priority:** High

> **Aturan centang:** item di bawah **belum selesai** kecuali yang ditandai `[x]` **beserta keterangan sumbernya** (klarifikasi user / commit / hasil tes). Jangan menandai `[x]` tanpa konfirmasi eksplisit user atau bukti tercatat.

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

**Semua item belum dikerjakan, kecuali E-4** (sudah berfungsi, dikonfirmasi user 2026-10-18). Prioritas mengikuti permintaan user 2026-10-18.

| ID | Prioritas | Ringkasan | Status | Rujukan |
|---|---|---|---|---|
| E-1 | Tinggi | Toggle WhatsApp stale; sembunyikan toggle push; ApiClient lewat Provider; sembunyikan ikon Share | Terbuka | [[Design]] §5.9, §5.18, §5.19 |
| E-2 | Tinggi | `baseUrl` via `--dart-define`; LogInterceptor tanpa header `Authorization` & hanya debug; `print` → `debugPrint` | Terbuka | Backlog (xiii), (vii) |
| E-3 | Sedang | Dropdown claim pakai `mine=1&status=pending`; hapus filter klien di Claim Saya setelah backend claim diperbaiki | Terbuka (blok B-1) | Backlog (ix) |
| E-4 | Sedang | Pin peta bisa digeser | **Sudah berfungsi** (klarifikasi user) | [[Design]] §5.8 |
| E-5 | Sedang | Bundel font Plus Jakarta Sans | Terbuka (baru masuk implementasi sekarang) | [[Design]] §2.2 |
| E-6 | Rendah | Pull-to-refresh `MyReportsScreen`; format tanggal konsisten | Terbuka | Backlog (xi), (xii) |
| QA | — | Tes manual di HP untuk semua layar | Terbuka | — |

### E-1 (Tinggi) — Toggle WhatsApp, toggle push, ApiClient Provider, ikon Share

- [ ] **Toggle WhatsApp (nilai stale)** — toggle "Tampilkan nomor WhatsApp ke pengguna lain" menampilkan nilai basi (state tidak ikut berubah/refresh). **Ketidakpastian:** klarifikasi user 2026-10-18 menyebut WhatsApp "sepertinya belum masuk implementasi / masih plan", sedangkan bug toggle ini dilaporkan ada. Perlu cek kode dulu untuk memastikan apakah toggle/field WA sudah ada di app; kalau **belum** ada, bagian ini melebur ke F-3 dan bukan perbaikan bug. Terkait [[Nomor WhatsApp Pengguna - Lost&Found]] — jangan menambah dependensi ke plan itu.
- [ ] **Sembunyikan toggle push** — toggle notifikasi push di Pengaturan disembunyikan sampai push benar-benar bisa dimatikan ([[Push Notification - Lost&Found]]). [[Design]] §5.19 menandai "ditunda" tetapi masih menggambarkan toggle hadir. Catatan user: **push notification belum pernah diuji langsung** di HP.
- [ ] **ApiClient lewat Provider** — ApiClient diambil lewat Provider (bukan instansiasi langsung/global), supaya base URL & token satu sumber.
- [ ] **Sembunyikan ikon Share** — ikon share di header detail barang disembunyikan (fungsinya belum ada). **Klarifikasi user 2026-10-18: masuk ke plan dulu, tidak dikerjakan sekarang.** [[Design]] §5.9 masih menuliskan "ikon share".

### E-2 (Tinggi) — Konfigurasi & log ApiClient

- [ ] `baseUrl` tidak hardcode: pakai `--dart-define` (mis. `API_BASE_URL`), dengan default yang aman untuk dev.
- [ ] `LogInterceptor` (Dio): **jangan** cetak header `Authorization`; aktif **hanya** di build debug.
- [ ] Ganti `print` → `debugPrint` (sisa ±8 info `avoid_print`; sumber: [[Backlog Perbaikan Lanjutan - Lost&Found]] open item (vii)).
- Terkait catatan keamanan di [[Security Hardening - Lost&Found]] §5.2 (API response filtering) dan Backlog (xiii). **Isi token tidak boleh dicatat di vault.**

### E-3 (Sedang) — Dropdown claim & filter Claim Saya

> [!warning] Akan berubah (revisi 2026-10-19, disetujui, belum diimplementasi)
> Claim tidak lagi wajib punya laporan sendiri. Dropdown "Laporan hilang kamu" jadi **opsional** dan hanya muncul bila user memilih menautkan laporan sendiri. Tombol "Aku Menemukan Barang Ini" tidak redirect ke form Lapor. Lihat [[Claim Dua Arah dan Serah Terima oleh Pengguna - Lost&Found]] §Revisi 2026-10-19.

- [ ] Dropdown "Laporan hilang kamu" di `claim_screen.dart` memakai **`mine=1&status=pending`** (endpoint Item 3 [[Backlog Perbaikan Lanjutan - Lost&Found]], sudah selesai) — menggantikan `GET /lost-reports?status=pending` dan filter klien. **Opsional** setelah revisi 2026-10-19: hanya dipanggil bila user memilih menautkan laporan sendiri.
- [ ] Hapus filter sisi klien di layar Claim Saya **setelah** backend claim diperbaiki. Prasyarat: lihat **B-1** di bawah.
- Sumber: Backlog open item (ix); [[TechnicalReference]] §17 item (h); [[Real-Time Chat - Lost&Found]] open item 8.

### E-4 (Sedang) — Pin peta bisa digeser — SUDAH BERFUNGSI

- [x] Pin di peta form laporan bisa digeser. **Klarifikasi user 2026-10-18: "pin emang sudah bisa digeser dan tidak ada masalah".** Tidak ada pekerjaan; item ditutup.
- [[Design]] §5.8 sudah sesuai kenyataan → **bukan konflik** (sebelumnya salah dicatat sebagai dokumen mendahului kode).

### E-5 (Sedang) — Bundel font Plus Jakarta Sans

- [ ] Bundel font Plus Jakarta Sans di `pubspec.yaml` + `assets/fonts`, jangan bergantung font sistem/`google_fonts` runtime.
- [[Design]] §2.2 menetapkan Plus Jakarta Sans sebagai satu-satunya font (semua layar + admin Filament). **Klarifikasi user 2026-10-18: font baru masuk implementasi sekarang** — Fase A–D belum membundel font, jadi ini pekerjaan baru, bukan regresi.

### E-6 (Rendah) — Laporan Saya & format tanggal

- [ ] `MyReportsScreen`: pull-to-refresh benar (spinner di dalam daftar, bukan mengganti daftar), `setState` dicek `mounted`, `_lastPage` diperbarui saat load more (Backlog xi).
- [ ] Format tanggal konsisten: layar detail memakai `DateFormat('dd MMMM yyyy')` tanpa locale eksplisit & tanpa `.toLocal()`; `MyReportsScreen` memakai `'dd MMM yyyy'` + `id_ID` + `.toLocal()` — samakan (Backlog xii). Ikuti keputusan locale/`initializeDateFormatting('id_ID')` yang sudah ada ([[Backlog Perbaikan Lanjutan - Lost&Found]] Item 5).

---

## QA — Tes Manual di HP

- [ ] Tes manual **semua layar** di HP (Fase A–D sudah merge ke `develop`; jalankan setelah E-1…E-6 dikerjakan).
- Cakupan minimal: Beranda, Cari & Filter, Form Lapor (Hilang & Ditemukan), Detail Barang, Form & Detail Claim, Laporan Saya, Claim Saya, Daftar Chat, Ruang Chat, Profil, Edit Profil, Pengaturan, Splash/Login.
- **Push notification belum pernah diuji langsung** (klarifikasi user 2026-10-18) — jadikan langkah tes eksplisit kalau FCM diaktifkan.
- Hasil tes dicatat di PBL/DailyChanges. Tanpa laporan tes, tidak ada item di plan ini yang boleh dicentang.

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

1. **[[Design]] §5.9 vs E-1** — Design menampilkan "ikon share" di header detail; keputusan user: ikon disembunyikan (baru masuk plan, belum dikerjakan) → §5.9 perlu diperbarui saat E-1 dikerjakan.
2. **[[Design]] §5.19 vs E-1** — Design mencantumkan toggle "Notifikasi push" sebagai elemen Pengaturan; [[Push Notification - Lost&Found]] menunda toggle itu → toggle harus disembunyikan sampai push bisa dimatikan. Ditambah: push **belum pernah diuji langsung**.
3. **[[Design]] §5.16 vs F-4** — Design menggambarkan layar Notifikasi berisi daftar + badge angka; belum ada sumber data notifikasi; bentuk final bergantung keputusan Opsi A/B. User mengonfirmasi layar ini masih tahap plan.
4. **[[Design]] §5.18 & §5.9 vs backend** — field No. WhatsApp & tombol WA digambarkan berjalan; user menyatakan WA belum masuk implementasi & belum ada jalur penyimpanan nomor ([[Nomor WhatsApp Pengguna - Lost&Found]]).
5. **Fase A–D UI tidak ada di dokumen mana pun** — tidak di [[Design]], [[TechnicalReference]], [[Lost&Found Progress]], maupun DailyChanges sebelum entri 2026-10-18; commit `fa6dfcb`, `8537490`, `905de94` dan status merge ke `develop` hanya diketahui dari keterangan user.
6. **B-1 (IDOR `ClaimController`) belum ada di vault** — tidak ditemukan di [[Security Hardening - Lost&Found]] (Layer 5 "Authorization" hanya memuat foto-delete Item 9) maupun [[Backlog Perbaikan Lanjutan - Lost&Found]]. Keputusan user 2026-10-18: masuk Backlog → ditambahkan sebagai item (xiv).
7. **Sumber repo** — pengaturan project Hermes Desktop menyebut GitHub `Davinciz/...` sebagai remote utama; `_Konteks.md` dan seluruh plan memakai **Gitea kampus**. **User mengonfirmasi 2026-10-18: pakai Gitea.** Konflik ada di sisi pengaturan Hermes, bukan di vault.
8. **Font Plus Jakarta Sans** — keputusan Design sejak lama (§2.2), tetapi baru masuk implementasi sekarang (E-5); tidak ada dokumen yang menyatakan font sudah dibundel.

**Sudah selesai (jangan ditulis lagi sebagai konflik):**

9. ~~[[Design]] §5.8 vs implementasi (pin draggable)~~ — diklarifikasi user 2026-10-18: pin sudah bisa digeser, tidak ada masalah. Design §5.8 sesuai kenyataan.

**Ketidakpastian yang belum jadi konflik (perlu verifikasi kode):**

10. Status implementasi WhatsApp: klarifikasi user ("sepertinya belum masuk implementasi") vs laporan bug toggle WA stale (E-1). Salah satu bisa keliru — cek dulu sebelum dikerjakan.

---

## Perlu Verifikasi Sebelum Dikerjakan

1. **Apakah toggle/field WhatsApp sudah ada di app** — menentukan apakah E-1 butir pertama itu perbaikan bug (toggle ada, nilai stale) atau melebur ke F-3 (belum ada sama sekali). Jawaban user masih "sepertinya belum masuk implementasi".
2. **Hasil `flutter analyze` / `flutter test`** setelah merge Fase A–D ke `develop`.
3. **Nasib branch `feature/ui/design-system`** setelah merge (dihapus atau disimpan) — belum diputuskan.

---

## Urutan Pengerjaan (usulan, belum disetujui)

1. Verifikasi dulu: apakah toggle WA ada di kode; jalankan `flutter analyze`/`flutter test` setelah merge Fase A–D.
2. E-1 + E-2 (Tinggi) — butir WA pada E-1 menunggu hasil verifikasi nomor 1.
3. E-3 (menunggu B-1 selesai di backend) dan E-5.
4. E-6 (Rendah) + QA penuh di HP (termasuk tes push kalau FCM diaktifkan).
5. Item F-* hanya setelah prasyaratnya selesai.

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