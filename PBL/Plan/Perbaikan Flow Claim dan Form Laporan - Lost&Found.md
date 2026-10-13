---
type: plan
project: lost-found
status: active
priority: high
updated: 2026-10-11
summary: Perbaiki status claim, pemilihan foto, dan pemilihan lokasi di peta dengan saran gedung pada form laporan
---

# Perbaikan Flow Claim dan Form Laporan - Lost&Found

**Tanggal:** 2026-10-06  
**Updated:** 2026-10-11 (semua bug selesai & ter-merge ke main; usulan plan done menunggu konfirmasi user)  
**Project:** [[PBL]] Lost&Found  
**Status:** In Progress  
**Priority:** High

---

## Goal

Memperbaiki tiga ketidaksesuaian yang ditemukan saat tes manual di HP fisik, agar flow claim dapat diverifikasi admin dan form laporan sesuai kebutuhan pengguna. Prioritas High karena Bug 3 memblokir alur claim (pending → accepted → returned).

Urutan pengerjaan: **Bug 3 → Bug 1 → Bug 2**.

---

## Bug 3 — Status Laporan Langsung `claimed` Saat Claim Dibuat (Blocker)

**Status (2026-10-11): ✅ Selesai dan ter-merge ke `main`.** Kode selesai (32 test lulus), query perbaikan data dijalankan, tes manual Filament dilakukan, branch `fix/claim-status-flow` di-merge. **Celah lanjutan** (blokir Terima bila laporan hilang bukan `pending`) **juga selesai** (DailyChanges 2026-10-09: "Bug 3 + celah acceptClaim | Selesai (dikonfirmasi user)"; commit `20d8164`, merge `b1e5556`). Lihat catatan hasil di bawah.

### Masalah
User mengajukan claim ke laporan temuan, claim berstatus `pending`, tetapi status laporan (di Filament) langsung `claimed`. Admin lalu tidak bisa memverifikasi claim dengan benar.

### Flow yang benar
1. Claim dibuat: claim `pending`, **laporan hilang dan temuan tetap `pending`**.
2. Admin Terima: claim `accepted`, laporan hilang dan temuan jadi `claimed`.
3. Serah terima (markTransferred / "Serahkan Barang"): claim `returned`, kedua laporan `returned`.

### Dugaan penyebab (perlu dikonfirmasi agent dari kode)
`ClaimController::store()` (di `app/Http/Controllers/ClaimController.php`), sebuah Model Observer, atau event pada `Claim` mengubah status laporan saat claim dibuat.

### Langkah
1. Cari semua tempat yang mengubah `status` laporan menjadi `claimed`: `grep` pada `ClaimController`, `app/Observers`, boot model `Claim`, dan Filament action.
2. Hapus perubahan status laporan dari `store()`. Status laporan hanya boleh berubah di aksi admin Terima (Filament dan endpoint admin accept) dan serah terima.
3. Tambahkan validasi di `store()`: laporan temuan harus berstatus `pending` (tolak bila `claimed`/`returned`/`closed`), penemu tidak boleh mengklaim temuannya sendiri, dan user tidak boleh membuat claim ganda ke temuan yang sama.
4. Perbaiki data yang sudah salah (lokal): laporan berstatus `claimed` yang tidak punya claim `accepted` dikembalikan ke `pending`. Cek dulu dengan SELECT sebelum UPDATE.
5. Feature test: buat claim → status laporan tetap `pending`; admin accept → `claimed`; claim ganda ditolak; self-claim ditolak.

### Hasil Implementasi (2026-10-06)
- Penyebab: dua baris update status di `ClaimController::store()`.
- Perubahan: `ClaimController`, `AdminController::acceptClaim`, `ClaimResource` (aksi Terima), dan `tests/Feature/ClaimStatusFlowTest.php`.
- Validasi `store()` kini mencakup: penemu tidak boleh klaim sendiri, temuan dan laporan hilang harus `pending`, tidak boleh claim ganda.
- Data korban bug: 1 laporan hilang dan 1 temuan; query UPDATE spesifik (per ID) dijalankan manual oleh user.

### Celah Lanjutan

**Status:** ✅ Selesai (DailyChanges 2026-10-09: "Bug 3 + celah acceptClaim | Selesai (dikonfirmasi user)"; commit `20d8164`, merge `b1e5556`)

**Masalah:**
`acceptClaim` belum memeriksa status laporan hilang. Satu laporan hilang yang diklaim ke dua temuan berbeda bisa diterima dua kali.

**Target:**
Blokir aksi Terima (endpoint 422 dan Filament disabled) bila `lostReport.status` bukan `pending`, plus test.

### Keputusan (2026-10-06)
- Saat satu claim diterima, claim lain yang masih `pending` pada temuan yang sama **dibiarkan**; admin yang memutuskan (terima/tolak) satu per satu. Tidak ada auto-reject.
- Konsekuensi: setelah satu claim `accepted` dan temuan berstatus `claimed`, claim `pending` lain tetap tampil di Filament sampai admin memprosesnya. Aksi Terima pada claim lain untuk temuan yang sudah `claimed` perlu diblokir atau diberi peringatan jelas di Filament.

---

## Bug 1 — Tombol "Ambil Foto" Memotret 3 Kali

### Masalah
Satu kali tap "Ambil Foto" langsung menghasilkan 3 foto. Seharusnya user memotret sendiri satu per satu, dan bisa memilih foto dari perangkat.

### Target perilaku
- Satu tap = satu foto.
- Tap tombol menampilkan pilihan **Kamera** atau **Galeri**.
- Dari galeri bisa memilih lebih dari satu foto sampai sisa slot (maksimal 3 foto total, minimal 1).
- Foto bisa dihapus satu per satu (tombol X yang sudah ada) dan slot terisi ulang.
- Kompresi dan upload tetap lewat `UploadService` (resize 1920px, JPEG 85, maksimal 2MB).

### Langkah (Flutter)
1. Telusuri kode tombol "Ambil Foto" di form Lost dan Found (kemungkinan `create_report_base.dart`) dan temukan penyebab pengambilan berulang (misalnya perulangan sampai slot penuh).
2. Ganti dengan bottom sheet "Kamera / Galeri". Cek paket yang sudah ada di `pubspec.yaml` (`image_picker` atau `camera`). **Bila perlu paket baru, minta persetujuan dulu.**
3. Pastikan izin Android/iOS (kamera) sudah sesuai. Photo Picker Android 13+ tidak butuh izin storage.
4. Test pada HP fisik: ambil 1 foto, ambil 3 foto bertahap, pilih 2 dari galeri, hapus satu lalu tambah lagi.

### Dampak dokumen
PRD 3.F (Kamera) dan Technical Reference bagian 10 saat ini hanya menyebut kamera; tambahkan opsi galeri.

---

## Bug 2 — Pilih Lokasi di Peta + Saran Gedung

### Masalah
Memilih lokasi langsung mengambil lokasi saat ini. User tidak bisa memilih lokasi lain, padahal tempat kehilangan/penemuan sering berbeda dengan posisi saat melapor. Saat GPS gagal, laporan tersimpan dengan koordinat 0,0.

### Keputusan flow baru (2026-10-11)
- User memilih lokasi dengan menaruh **titik (pin) di peta** (`flutter_map` + OpenStreetMap), bukan GPS otomatis.
- Peta terbuka di tengah kampus tanpa pin. Form baru valid setelah user menaruh pin. Koordinat kosong atau 0,0 ditolak (klien dan backend).
- Tombol **"Lokasi saya"** hanya menggeser peta ke posisi GPS, **tidak menetapkan lokasi**.
- Marker gedung dari `GET /api/buildings` tampil di peta; tap marker memilih gedung tersebut.
- Setelah pin ditaruh, muncul **daftar saran gedung**: maksimal 3 gedung terdekat dalam radius sekitar 75 m, urut jarak, tiap item menampilkan nama gedung dan jarak dari titik. User yang mengklik untuk memilih; **tidak ada pilihan otomatis**. Daftar diperbarui saat pin digeser.
- Perhitungan jarak (Haversine) dilakukan di **Flutter** dari daftar gedung yang sudah dimuat (opsi B). Endpoint `POST /location/suggest` dan `LocationService` backend **dicoret** dari plan Master Buildings.
- **Koordinat laporan = titik yang dipilih user.** Aturan lama "gedung menang atas GPS" **dibalik**: gedung hanya mengisi `building_id` dan `location_name`, tidak menimpa koordinat.
- **Detail lokasi opsional.** Aturan `location_name`:
  - Gedung + detail → `"Nama Gedung, detail"`
  - Gedung saja → `"Nama Gedung"`
  - Tanpa gedung + detail diisi → `detail`
  - Tanpa gedung + detail kosong → `"Titik di peta (area luar gedung)"`
- `building_id` tetap nullable. Backend tetap memvalidasi `building_id` (uuid, exists) dan menolak koordinat kosong atau 0,0.
- Label form menyesuaikan jenis laporan: Lost → "Lokasi Kehilangan", Found → "Lokasi Penemuan".

### Tahap
- **2a (tanpa paket peta):** ~~opsi GPS manual, dropdown gedung, detail teks, validasi bukan 0,0.~~ **Selesai (2026-10-09)** — `GET /buildings` di backend, `building_id` pada validasi store Lost/Found, `location_picker_section.dart`, kedua form laporan. Lihat DailyChanges 2026-10-09.
- **2b — pilih lokasi di peta + saran gedung:** ✅ **Selesai (2026-10-11)** — `flutter_map` + OpenStreetMap, pin draggable, marker gedung, daftar saran dengan jarak, tombol "Lokasi saya" hanya menggeser kamera, validasi pin kosong. Dites di HP fisik. Lihat DailyChanges 2026-10-11.

### Langkah Flutter (tahap 2b)
1. Ganti `location_picker_section.dart` lama (dropdown + GPS button) dengan widget peta `flutter_map`:
   - Peta terbuka di tengah kampus (koordinat kampus) tanpa pin.
   - Tap di peta menaruh pin; pin bisa digeser (drag).
   - Tombol "Lokasi saya" → ambil GPS, geser peta ke posisi GPS, **tidak menetapkan pin**.
   - Marker gedung dari `GET /api/buildings` tampil di peta; tap marker = pilih gedung + taruh pin di koordinat gedung.
2. Implementasi Haversine lokal (`lib/utils/haversine.dart`):
   - Hitung jarak dari koordinat pin ke tiap gedung.
   - Ambil maks 3 gedung dalam radius 75 m, urut jarak.
3. Tampilkan daftar saran sebagai **list** (bukan chip/dropdown otomatis):
   - Tiap item: nama gedung + jarak (mis. "Gedung Sekolah A · 45 m").
   - User klik item untuk memilih → `building_id` terisi, `location_name` = nama gedung, **koordinat tetap = titik pin**.
   - Tidak ada pilihan otomatis.
   - Daftar diperbarui saat pin digeser.
4. Detail lokasi opsional (TextField). Update `location_name` sesuai aturan di atas.
5. Validasi klien: form tidak bisa submit tanpa pin (koordinat kosong/0,0).
6. Label form: Lost → "Lokasi Kehilangan", Found → "Lokasi Penemuan".

### Verifikasi
- Pin kosong (belum ditaruh) → form ditolak, tidak bisa submit.
- Saran gedung muncul sebagai **daftar** (maks 3, radius 75m), bukan chip otomatis.
- Pin di luar gedung (tidak ada saran dalam radius) → `location_name` default "Titik di peta (area luar gedung)" bila detail kosong.
- Koordinat yang tersimpan = titik pin yang dipilih user (bukan koordinat gedung).
- Pilih gedung dari daftar → `building_id` terisi, koordinat tetap = pin.
- Tap marker gedung → gedung terpilih, pin ditaruh di gedung.
- Tombol "Lokasi saya" → peta menggeser ke GPS, pin belum ditaruh.
- Label form sesuai jenis laporan.

### Dampak dokumen
- PRD 3.F (GPS): ganti menjadi "pilih lokasi lewat titik di peta, saran gedung terdekat sebagai daftar, detail lokasi opsional".
- Design.md §4 "GPS & Gedung Kampus" dan §5.8 bagian lokasi sesuai flow baru.
- TechnicalReference §9 (GPS → pilih titik di peta), §15.7 (aturan location_name baru, koordinat = titik pilihan user), §15.1/§16 (flutter_map + latlong2 untuk peta).
- Plan Master Buildings: `LocationService` dan `POST /location/suggest` dicoret.

---

## Backlog Terkait (Belum Dikerjakan)

| Item | Prioritas usulan | Catatan |
|------|------------------|---------|
| Pembedaan halaman View Lost vs Found di Filament | Medium | Prompt sudah dikirim, hasil belum dikonfirmasi |
| Pastikan file tooling agent tidak ada di `main` (`.agents/`, `.claude/`, `.mcp.json`, `opencode.json`, `boost.json`, perubahan `composer.*`) | High sebelum push | Ikut ter-merge lewat `git add -A`; gunakan `git add <file>` dan `.gitignore` |
| Endpoint "laporan saya" (mis. `?mine=1`) untuk dropdown claim | Medium | Saat ini difilter di Flutter dari 20 item pertama |
| URL foto relatif (simpan path, bangun URL saat response) | Medium | Hindari ubah DB tiap ganti jaringan; sebelum demo |
| Riwayat laporan saya di tab Profil | Low | `onTap` masih kosong |
| Bersihkan history git dari `firebase-service-account.json` | High sebelum repo Public | `git filter-repo` |
| Chat real-time, Security Hardening, Master Buildings | Sesuai plan masing-masing | Lihat plan terkait |

---

## Verifikasi

- Bug 3: claim dibuat → laporan tetap `pending`; admin Terima → `claimed`; Serahkan Barang → `returned`; claim ganda dan self-claim ditolak.
- Bug 1: foto bisa diambil satu per satu dan dipilih dari galeri; total maksimal 3.
- Bug 2: pin kosong ditolak; saran gedung muncul sebagai daftar; pin di luar gedung memberi label otomatis; koordinat tersimpan = titik pin; label sesuai jenis laporan.
- Test Flutter dan Laravel lulus; tes manual di HP fisik dengan dua akun.

---

## Next Steps

> **Usulan Hermes:** Semua bug (1, 2a, 2b, 3) selesai dan ter-merge ke `main`. Usulan: tandai plan `done` dan pindahkan backlog ke plan baru. **Menunggu konfirmasi user.**

1. ✅ Bug 3: kode selesai (32 test lulus), ter-merge ke `main` (2026-10-11)
2. ✅ Bug 1: foto — selesai, merge ke `main` lokal (2026-10-09)
3. ✅ Bug 2 tahap 2a: backend `GET /buildings` + Flutter `location_picker_section.dart` + kedua form — selesai (2026-10-09)
4. ✅ Bug 2 tahap 2b: pilih lokasi di peta (`flutter_map` + OSM) + saran gedung sebagai daftar (Haversine lokal, opsi B) + fallback `location_name` backend — selesai, dites di HP fisik (2026-10-11)
5. ✅ ~~Update PRD 3.F, Technical Reference 9, 10, 15.3, 15.8~~ — dokumen diperbarui 2026-10-11 (PRD 3.F, Design §4/§5.8, TechnicalReference §9/§15.7/§15.1/§16)
6. ✅ Merge `feature/location-fallback` (backend) dan `feature/map-location-picker` (Flutter) ke `main` — dikonfirmasi user (2026-10-11)

Catatan: crash saat membuat laporan hilang dari alur claim diabaikan (diduga masalah internal HP MIUI, bukan Flutter). Buka kembali bila terulang di perangkat lain.

---

## Related Files

- **Laravel:** `D:\PBL\lostfound`
- **Flutter:** `C:\Project\mobile-lostfound`
- **PRD:** [[PRD]]
- **Technical Reference:** [[TechnicalReference]]
- **Verifikasi via Chat:** [[Verifikasi via Chat - Lost&Found]]
- **Foto Bukti Transfer:** [[Foto Bukti Transfer - Lost&Found]]
- **Master Buildings:** [[Master Buildings + Auto Location - Lost&Found]]

---

#plan #lost-and-found #bugfix #claim #location #photo
