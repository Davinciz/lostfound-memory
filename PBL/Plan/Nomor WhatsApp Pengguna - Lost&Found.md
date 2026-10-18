---
type: plan
project: lost-found
status: active
priority: medium
updated: 2026-10-18
summary: Plan isi & tampilkan nomor WhatsApp user SSO lewat endpoint terbatas dan field Edit Profil
---

# Nomor WhatsApp Pengguna - Lost&Found

**Tanggal:** 2026-10-18
**Project:** [[PBL]] Lost&Found
**Status:** Planning
**Priority:** Medium

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

## USULAN (belum diputuskan user)

### 1. Endpoint — `PUT /api/users/me`

- Menerima **hanya** field `whatsapp` (dan tetap menerima `wa_visible` bila dipertahankan; boleh digabung ke satu endpoint).
- `name` dan `email` tetap **read-only** karena bersumber dari Google SSO; `nim` belum diputuskan (usul: tetap read-only, diatur admin).
- Normalisasi nomor ke format `62...` (buang spasi/tanda hubung; `08xx` → `628xx`; tolak selain digit dan `+`).
- **Boleh dikosongkan** (`null`/`""` → simpan `null`) untuk membatalkan nomor.
- Validasi: panjang wajar nomor Indonesia; nomor tidak valid → `422`. Keputusan apakah nomor wajib unik per user: **belum diputuskan**.

### 2. Mobile — Edit Profil ([[Design]] §5.18)

- Field "No. WhatsApp" bisa diisi (keyboard telepon), dengan prefix `+62` sebagai acuan tampilan.
- Toggle "Tampilkan nomor WhatsApp ke pengguna lain" **aktif hanya bila nomor terisi**; bila nomor kosong → toggle non-aktif dan `wa_visible` dipaksa `false`.
- Tombol "Simpan Perubahan" mengirim hanya field yang boleh diubah.

### 3. Mobile — tombol WhatsApp di detail laporan ([[Design]] §5.9)

- Tombol baru **dirender** bila pelapor punya nomor **dan** `wa_visible = true`.
- Aksi: buka `https://wa.me/<62...>` lewat `url_launcher` (deep link; fallback ke browser bila app WA tidak ada).
- Ini sekaligus menutup open item (x) [[Backlog Perbaikan Lanjutan - Lost&Found]].

### 4. WAJIB diverifikasi sebelum dianggap aman (bocor tidaknya nomor)

- `LostReportController` / `FoundReportController` **mengembalikan model mentah** — perlu dicek apakah relasi `reporter` ikut mengirim `whatsapp`, `nim`, `fcm_token`, atau data lain yang seharusnya tertutup.
- Perilaku yang benar: nomor hanya muncul di luar `/users/me` bila `wa_visible = true`. [[Security Hardening - Lost&Found]] §2 sudah menulis pola ini (`'whatsapp' => $this->wa_visible ? $this->whatsapp : null`) — belum diterapkan.
- Keputusan Fase 1 chat sudah mengecualikan `whatsapp` dari `UserResource` ([[Real-Time Chat - Lost&Found]] §Backend API-as-built). Endpoint laporan **belum** punya aturan setara → usul `UserResource` yang sama (atau resource publik) dipakai untuk data pelapor.
- Endpoint `GET /users/me` (bila ada) harus mengembalikan nomor milik sendiri apa pun nilai `wa_visible`.

---

## Belum diputuskan / open items

- [ ] Apakah `PUT /users/me` menangani `whatsapp` + `wa_visible` sekaligus, atau tetap terpisah seperti sekarang?
- [ ] Nomor WA unik per user atau tidak?
- [ ] Field NIM boleh diubah user atau tetap read-only?
- [ ] Apakah nomor disimpan terenkripsi? [[Security Hardening - Lost&Found]] §2 mengusulkan cast `encrypted` untuk `whatsapp` dan `fcm_token`; bila dipakai, nomor tidak bisa difilter/di-`LIKE` di DB (perlu keputusan sebelum implementasi, jangan dikerjakan di dua plan sekaligus).
- [ ] Apakah toggle di [[Design]] §5.19 Pengaturan dipertahankan berdampingan dengan toggle di Edit Profil (dua tempat untuk satu setting)?
- [ ] Perilaku untuk user yang belum pernah mengisi nomor: tombol WA disembunyikan (default) dan tidak ada info tambahan — konfirmasi.
- [ ] Prioritas plan ini `medium` (ditetapkan user 2026-10-18).

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
