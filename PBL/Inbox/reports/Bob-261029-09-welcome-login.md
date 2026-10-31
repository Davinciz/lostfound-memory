---
type: report
task: Bob-261029-09
from: backend
outcome: succeeded
branch: feature/filament/admin-landing
commits:
  - 72c25e8 feat(filament): replace landing stats page with admin login welcome page
updated: 2026-10-30
summary: Landing agregat diganti total jadi welcome page berisi form login admin di /
---
## Berubah
- Tambah `app/Http/Controllers/WelcomeController.php` — `show()` redirect ke `/admin` bila sudah login, `login()` pakai `Auth::attempt` guard web + cek `canAccessPanel`
- Tambah `resources/views/welcome-login.blade.php` — kartu login tema gelap CLF
- Ubah `routes/web.php` — `GET /` (name `welcome`), `POST /` throttle 10/menit (name `welcome.login`), `GET /login` redirect ke `/admin` (name `login`)
- Tambah `tests/Feature/WelcomeLoginTest.php` — 8 test
- Hapus `LandingController`, `LandingStats`, `landing.blade.php`, `LandingPageTest`
- `.gitignore` tidak disentuh (perubahan lama user tetap unstaged)

## Verifikasi (output asli)
- `php artisan test --filter=WelcomeLoginTest` → 8 tests, 8 passed, 32 assertions
- `php artisan test --compact` → 262 tests, 262 passed, 709 assertions
- `vendor/bin/pint --test` (3 file PHP) → passed
- `php artisan route:list --path=/ --except-vendor` → `GET|HEAD / welcome`, `POST / welcome.login`
- Render `GET /` → HTTP 200, 8728 bytes; form memuat `_token`, `email`, `password`, `remember`
- Privasi: 0 match `LST-`/`FND-`
- 1280px: kartu 581px di viewport 900px, terpusat penuh (top 159, bottom 741)
- 360px: `overflowX: false`
- Kontras terukur: placeholder 5.77:1, brand-sub 7.32:1, teks 15.96:1, tombol 11.49:1, border input 3.61:1 (semua ≥ AA; border ≥ 3:1)
- Push ke Gitea: berhasil

## Keputusan desain
- **Form ditangani controller sendiri, bukan POST ke Filament.** Filament 4 memakai Livewire; `/admin/login` hanya GET. Form manual memberi label Indonesia, error inline, dan kontrol penuh atas throttle tanpa menyentuh AdminPanelProvider.
- **Cek `canAccessPanel` sebelum redirect.** Tanpa ini user non-admin bisa "login sukses" lalu dilempar balik Filament dengan halaman error. Sekarang pesan jelas dan session dibatalkan.
- **Rate limit 5/menit per email+IP** di controller, ditambah `throttle:10,1` di route. Dua lapis karena route throttle bisa dilewati bila IP berganti.
- **`GET /` tidak pakai middleware `guest`.** `guest` me-redirect ke `/` sehingga terjadi loop; pengecekan `Auth::check()` dipindah ke controller.
- **Halaman gelap penuh tanpa panel terang** supaya konsisten dengan tema mobile dan tidak butuh aset gambar.
- **Tanpa link "lupa kata sandi"** — akun admin dikelola manual, belum ada alur reset; tidak saya karang.

## Temuan / risiko
- User non-admin yang mencoba login mendapat pesan "Akun ini tidak punya akses ke panel admin" dan langsung di-logout. Perlu dipastikan pesan ini memang diinginkan.
- `/admin/login` milik Filament masih aktif dan bisa diakses langsung; dua jalur login hidup bersamaan. Bisa dimatikan dengan `->login()` dihapus dari AdminPanelProvider bila mau satu pintu.
- Postgres lokal (Laragon) masih rentan crash `0xC0000142` setelah idle; perlu start manual sebelum test.
- Verifikasi visual di browser tetap tanggung jawab user.

## Butuh keputusan user
- Matikan `/admin/login` Filament supaya hanya `/` jadi satu-satunya pintu masuk?
- Perlu alur reset kata sandi admin?