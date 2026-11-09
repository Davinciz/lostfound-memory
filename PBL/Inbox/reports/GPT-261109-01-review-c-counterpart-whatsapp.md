---
type: report
task: GPT-261109-01
from: backend
outcome: succeeded
branch: feature/claim/counterpart-whatsapp
commits:
  - "31153ab8cb3cef2c69d823845b25e85586ff9704 fix(claim): normalize counterpart WhatsApp responses"
updated: 2026-11-09
summary: "Revisi C memenuhi kontrak pada PostgreSQL lokal dan seluruh mutasi wajib terdeteksi. Tes admin perlu memastikan fixture terisi."
---

# Review revisi C · Counterpart WhatsApp

**Verdict — APPROVE DENGAN CATATAN**

Basis review `17a5ab9a7b`. Fetch menghasilkan satu commit revisi, `31153ab`, pada branch fitur. Merge base terhadap `origin/develop` adalah `6f8b43d`. Commit revisi tidak terkandung di ref lokal maupun remote-tracking `develop` atau `main` yang diperiksa.

## Berubah

- `git diff --stat` menunjukkan 4 file, 87 penambahan dan 14 penghapusan. File yang berubah adalah `AuthController.php`, `Claim.php`, `WhatsAppNumber.php`, dan `ClaimCounterpartWhatsAppTest.php`. Pesan commit sesuai permintaan. Diff tidak memuat tooling, kredensial, migrasi, perubahan skema, policy, Filament, rute, atau controller admin.
- `app/Support/WhatsAppNumber.php:7` dipakai bersama oleh profil dan claim. Helper menghapus pemisah, menangani awalan `08`, `+62`, dan `62`, lalu mengembalikan nomor hanya jika cocok dengan `/^628\d{8,11}$/D`. Nilai kosong atau tidak valid menjadi `null` di claim. Profil tetap menolak input non-null yang tidak valid dengan error validasi yang sama. Tes profil lama identik dengan basis.
- `app/Models/Claim.php:109` mempertahankan syarat `accepted`, pengecualian admin, pemeriksaan peserta, arah pengambilan nomor lawan dan syarat `wa_visible` lawan dari basis. Perubahan hasil akses terbatas pada nilai nomor lama yang kini dinormalisasi atau menjadi `null` jika tidak valid. `receiverId()` melewati relasi laporan yang kosong pada claim target-only. Normalisasi saat serialisasi tidak menyimpan ulang nomor pengguna.
- `app/Http/Controllers/ClaimController.php:255` menetapkan field untuk enam respons sukses claim tunggal. Tes memastikan keberadaan kunci lewat `assertJsonStructure` sebelum memeriksa nilai, termasuk ketika nilainya `null`. Index dan rute admin memakai jalur serialisasi lain. Tes privasi meliputi lima field `whatsapp`, `nim`, `email`, `blocked`, dan `blocked_reason` pada objek bersarang `claimant`, `transferred_by`, dan `reporter`.

## Temuan / open items

- **Blocker** — Nihil.
- **Mayor** — Nihil. Semua mutasi wajib a–e terdeteksi.
- **Minor — `tests/Feature/ClaimCounterpartWhatsAppTest.php:175` dan `:180`.** Assertion dashboard memeriksa `pending_claims_list.0` setelah claim yang dibuat telah di-accept. Daftar pending kosong saat itu. Assertion untuk `lost_reports.data.0` juga berjalan tanpa fixture lost report. Tes bawaan tetap lulus ketika field `counterpart_whatsapp` sengaja disisipkan pada setiap item pending dashboard (1 tes, 19 assertion). Dengan fixture pending dan lost report serta assertion ID item, respons asli lulus (1 tes, 21 assertion) dan mutasi dashboard gagal (1 tes, 11 assertion). Tambahkan fixture dan cek ID item sebelum mengecek bahwa field absen. Celah coverage ini sudah ada pada basis.

## Verifikasi

| Pemeriksaan | Hasil aktual |
| --- | --- |
| PostgreSQL testing | Laravel dan server sama-sama mengonfirmasi `lostfound_testing` pada `127.0.0.1:55491`, instance baru khusus review. Konfigurasi efektif diperiksa sebelum tes. |
| Tes WhatsApp dan `UserContactPrivacyTest` | 39 lulus, 427 assertion. |
| `php artisan test --compact` | 404 lulus, 1.768 assertion. Selisih dari acuan 403 / 1.736 adalah +1 tes dan +32 assertion. Seluruh selisih cocok dengan pengukuran kelas `ClaimCounterpartWhatsAppTest` dari 8 tes / 64 assertion pada basis menjadi 9 / 96 pada tip, yaitu tes normalisasi baru dan tambahan assertion kontrak. |
| `php artisan route:list --path=api` | 37 rute pada basis dan 37 pada tip. Output identik. |
| `vendor/bin/pint --test` | Lulus pada keempat file diff, exit 0. File di luar diff tidak dipindai. |
| `git diff --check` dan status | Diff basis–tip dan diff lokal lolos, exit 0. Semua file percobaan dikembalikan dengan `git checkout -- <file>`. PostgreSQL dihentikan dan worktree dihapus. Status akhir checkout utama tetap di `fix/chat/unread-count-n-plus-one` dengan ` M README.md`. |

### Query respons

Instrumentasi lokal mencatat `DB::getQueryLog()` hanya selama pengisian `counterpart_whatsapp`, setelah relasi respons dimuat. Tes berinstrumen lulus 9 tes dengan 96 assertion dan mencatat 21 respons.

| Respons | Query tambahan |
| --- | ---: |
| GET detail `accepted` | 1 pada 11 respons peserta, 0 pada 1 respons admin |
| GET detail `pending`, `rejected`, `withdrawn`, `returned` | 0 pada masing-masing respons |
| POST create | 0 |
| POST accept | 1 |
| POST reject | 0 |
| POST withdraw | 0 |
| PATCH mark-transferred | 0 |

Query tambahan maksimum 1. Index tidak memanggil pengisi field per item, sehingga tidak menambah N+1 untuk fitur ini.

### Bukti mutasi

| Mutasi | Hasil |
| --- | --- |
| a. Hapus kunci dari POST create yang seharusnya mengembalikan `null` | Gagal, exit 1. Assertion struktur menemukan kunci hilang (`ClaimCounterpartWhatsAppTest.php:158,270`). |
| b. Lepas syarat `accepted` | Gagal, exit 1. Nomor lawan muncul saat tes mengharapkan `null` untuk status non-accepted (`:126`). |
| c. Lepas syarat `wa_visible` lawan | Gagal, exit 1. Nomor lawan tampil saat visibilitas dimatikan (`:97`). |
| d. Ambil nomor penampil sendiri | Gagal, exit 1. Nomor claimant muncul saat tes mengharapkan nomor receiver (`:27`). |
| e. Kembalikan nomor mentah | Gagal, exit 1, pada input `+62` berformat (`:46`). Varian yang membiarkan hanya awalan mentah `08` juga gagal, exit 1, pada assertion arah sebaliknya (`:52`). |

## Hal yang tidak terverifikasi

- Suite penuh pada basis tidak dijalankan ulang. Angka basis 403 / 1.736 berasal dari acuan tugas. Kelas tes yang berubah diukur langsung pada kedua commit.
- Enam temuan Pint lama di luar diff tidak diperiksa ulang. Perilaku pada server produksi tidak diverifikasi.

## Butuh keputusan user

Tidak ada.
