---
type: plan
project: lost-found
status: active
priority: low
updated: 2026-10-29
summary: Landing page publik `/` dengan statistik agregat (barang dikembalikan, tren, top gedung) untuk transparansi kampus
---

# Landing Page Admin Publik - Lost&Found

**Tanggal:** 2026-10-29  
**Project:** [[PBL]] Lost&Found  
**Status:** In Progress  
**Priority:** Low  

> [!info] Disetujui user 2026-10-29
> Plan ini **disetujui user 2026-10-29** (status `active`). Fitur masih **belum ada di PRD** — PRD/Design/TechnicalReference baru diperbarui setelah fitur selesai dan ter-merge ke `develop`. Implementasi dikerjakan oleh **Bob-261029-04**. Lihat [[#Koreksi Implementasi (hasil review 2026-10-29)]] — koreksi di sana **mengalahkan** snippet kode ilustrasi di plan ini.

---

## Goal

Buat landing page publik di route `/` yang menampilkan **statistik agregat saja** (tidak ada data individual) untuk transparansi kampus. Guest boleh akses tanpa login.

---

## Latar Belakang

### Kondisi sekarang
- Route `/` masih view `welcome` bawaan Laravel (resources/views/welcome.blade.php)
- Dashboard Filament (`/admin`) masih widget default (`Widgets\AccountWidget`, `Widgets\FilamentInfoWidget`)
- Primary panel Filament masih `Color::Amber`, belum `#F5C400` (app/Providers/Filament/AdminPanelProvider.php baris 29)

### Keputusan user
Landing page publik menampilkan **angka agregat saja** — tidak boleh ada nama user, email, foto, kode laporan, atau daftar laporan/claim individual. Satu-satunya nama yang boleh tampil: **nama gedung** (top 5 peringkat).

---

## Aturan Privasi (Wajib)

Landing page publik **tidak boleh** menampilkan:
- ❌ Nama user, email, NIM, nomor WhatsApp
- ❌ Foto laporan atau foto profil
- ❌ Kode laporan (LST-/FND-YYMMDD-XXXX)
- ❌ Daftar laporan atau claim individual (tidak ada tabel/list item)
- ❌ Deskripsi barang atau detail lokasi

Yang **boleh** ditampilkan:
- ✅ Angka agregat (total, rata-rata, jumlah per status/kategori)
- ✅ Nama gedung (top 5 berdasarkan jumlah laporan)
- ✅ Tren waktu (grafik 30 hari tanpa identitas barang)

---

## Perilaku Teknis

### Route
```php
// routes/web.php
Route::get('/', [PublicLandingController::class, 'index'])
    ->middleware('throttle:60,1') // 60 req/min per IP
    ->name('landing');
```

- **Guest boleh akses** (tidak perlu login)
- **Throttle:** 60 permintaan/menit per IP
- **Cache:** hasil query di-cache 5 menit (avoid hit DB tiap request)
- **Zona waktu:** batas "hari ini" dan pengelompokan tren harian dihitung dalam **WIB (Asia/Jakarta)**; lihat [[#Koreksi Implementasi (hasil review 2026-10-29)]] — batas WIB **wajib dikonversi** ke zona penyimpanan `created_at` sebelum masuk query.

### Respons
Blade view dengan data agregat. **Tidak boleh** JSON API (agar tidak di-scrape untuk data individual).

### Tombol akses admin
Satu link statis ke `/admin` — Filament otomatis mengarahkan guest ke halaman login. Cabang `@auth('web')` **tidak diperlukan** (lihat [[#Koreksi Implementasi (hasil review 2026-10-29)]]).

---

## Isi Halaman

### 1. Hero Section (gelap)
Background hitam (#111111), teks kuning (#F5C400).

**Angka headline besar:**
```
[ANGKA]
barang berhasil dikembalikan
```

Angka = jumlah claims dengan status `returned` (satu-satunya metrik sukses yang terlihat publik).

**Subjudul kecil:** "Sistem Lost & Found Polines"

### 2. Strip KPI (4 kartu)
Grid 4 kolom, kartu putih (light) / #141414 (dark), radius 12px.

| KPI | Query |
|-----|-------|
| **Laporan Hari Ini** | `lost_reports` + `found_reports` `created_at` >= today 00:00 WIB |
| **Laporan Pending** | `status = 'pending'` (hilang + temuan) |
| **Claim Pending** | `claims.status = 'pending'` |
| **Total Laporan** | count semua `lost_reports` + `found_reports` |

### 3. Tren 30 Hari (line chart)
Grafik dua garis: Hilang (oranye #C2560A) vs Ditemukan (hijau #15803D).

- X-axis: tanggal (30 hari terakhir)
- Y-axis: jumlah laporan per hari
- **Chart:** SVG/CSS server-side (tanpa Chart.js atau dependensi baru)

### 4. Komposisi Kategori & Distribusi Status
Dua chart berdampingan:

**A. Komposisi Kategori (bar horizontal)**
7 kategori tetap (Buku, Elektronik, Jaket/Kemeja, Dompet, Aksesoris, Alat Tulis, Lainnya), jumlah laporan per kategori (hilang + temuan).

**B. Distribusi Status Laporan (donut chart)**
4 status: Pending (oranye), Claimed (kuning), Returned (hijau), Closed (abu).

### 5. Top 5 Gedung
Tabel/list sederhana: nama gedung + jumlah laporan (hilang + temuan).

**Contoh:**
```
1. Gedung Teknik Sipil       87 laporan
2. Gedung Administrasi Niaga  64 laporan
3. Perpustakaan               52 laporan
4. Lab Komputer Terpadu       41 laporan
5. Gedung Teknik Mesin        38 laporan
```

Boleh tampil nama gedung karena **bukan data personal**.

### 6. Footer
- Nama tim: Anisa Aulia, Daniel Arvin Geovani, Muhammad Tsaqif Satria Firmansyah, Steven Hermawan
- Versi: `1.0.0` (hardcode dulu; `package_info_plus` belum disetujui)
- Link: "Masuk Admin"

---

## Desain

### Token & Warna
Ikuti [[Design]] §2 Design Tokens:
- Primary: `#111111` (light) / `#F5C400` (dark)
- Warna status: `success` #15803D, `warning` #C2560A, `danger` #DC2626, `neutral` #475467
- Background: `#FAFAFA` (light) / `#0A0A0A` (dark)
- Surface: `#FFFFFF` (light) / `#141414` (dark)

### Font
**Plus Jakarta Sans** self-hosted (4 TTF: Regular/Medium/SemiBold/Bold), **tanpa CDN**. Asset font sudah dibundel di mobile (E-5, PR #5); backend perlu bundel sendiri di `public/fonts/` atau pakai system font fallback.

### Responsif & Aksesibilitas
- Mobile-first (breakpoint 768px)
- Light/dark mode (deteksi `prefers-color-scheme`)
- Hormati `prefers-reduced-motion` (disable animasi chart bila user set reduced motion)

### Chart
**Tanpa dependensi baru** — Chart.js/ApexCharts tidak boleh ditambah. Render chart sebagai:
- SVG inline (server-side generate)
- CSS bar chart (width % untuk bar horizontal)
- Blade component reusable

---

## Di Luar Lingkup (Usulan Terpisah)

Fitur berikut **tidak masuk plan ini**; catat sebagai usulan tugas terpisah bila user setuju:

1. **Widget Dashboard Filament** ([[Design]] §6.2) — dashboard admin `/admin` masih widget default. Usulan: widget custom (KPI, tren, claim pending) sebagai pengganti `FilamentInfoWidget`.

2. **Warna Primary Panel Filament** — `AdminPanelProvider` masih `Color::Amber`, belum `#F5C400`. Usulan: selaraskan warna Filament dengan brand (baris 29 `AdminPanelProvider.php`).

**Alasan:** landing publik dan dashboard admin independen. Widget admin perlu design/requirement terpisah (aksi cepat, drill-down, notifikasi).

---

## Koreksi Implementasi (hasil review 2026-10-29)

> Bagian ini adalah **hasil review 2026-10-29**. Snippet kode di bawah hanya ilustrasi; bila bertentangan dengan koreksi ini, **koreksi yang berlaku**.

### 1. Bentuk grafik & aksesibilitas
- **Tren 30 hari = line chart SVG** (server-side). Hilang oranye `#C2560A`, Ditemukan hijau `#15803D` ([[Design]] §2.1).
- **Distribusi status = donut SVG.**
- **Komposisi kategori = bar horizontal CSS** (width %).
- Setiap grafik **wajib punya legenda/label teks** — jangan membedakan data hanya dengan warna (buta warna & mode cetak).

### 2. Zona waktu & query
- Batas "hari ini" dan pengelompokan tren per hari dihitung dalam **WIB (Asia/Jakarta)**.
- Query ke DB **wajib memakai batas yang sudah dikonversi** ke zona penyimpanan `created_at`. Carbon ber-timezone Jakarta **tidak boleh** langsung diikat ke query — Laravel mengikatnya sebagai string di zona instance-nya, **tanpa konversi**, sehingga batas hari bergeser.
- **Tren selalu 30 titik**; hari tanpa laporan = **0** (bukan hilang dari seri).
- Cek `config('app.timezone')` sebelum menulis query (nilai aktual menentukan arah konversi).

### 3. Test
- **Jangan** `assertSee('5')` untuk angka headline — angka tunggal mudah cocok dengan teks lain. Cek nilai spesifik lewat `assertViewHas` (mis. `stats.returned_count`).
- Tambah test **hari kosong = 0** pada seri tren (30 titik tetap utuh).
- Tambah test **batas "hari ini" di sekitar tengah malam WIB** (mis. laporan 23:59 vs 00:01 WIB).
- Pastikan state factory yang dipakai **benar-benar ada** (mis. state `returned()` pada `ClaimFactory`) sebelum menulis test bergantung padanya.

### 4. Tombol admin
Cukup **satu link statis ke `/admin`** — Filament mengarahkan guest ke login. Cabang `@auth('web')` di snippet **tidak diperlukan**, hapus.

---

## Implementation Tasks

### Backend (Laravel)

**1. Controller**
```php
// app/Http/Controllers/PublicLandingController.php
class PublicLandingController extends Controller
{
    public function index()
    {
        $stats = Cache::remember('landing_stats', 300, function () {
            return [
                'returned_count' => Claim::where('status', 'returned')->count(),
                'today_reports' => $this->getTodayReports(),
                'pending_reports' => $this->getPendingReports(),
                'pending_claims' => Claim::where('status', 'pending')->count(),
                'total_reports' => LostReport::count() + FoundReport::count(),
                'trend_30d' => $this->getTrend30Days(),
                'category_counts' => $this->getCategoryCounts(),
                'status_distribution' => $this->getStatusDistribution(),
                'top_buildings' => $this->getTopBuildings(),
            ];
        });
        
        return view('landing', compact('stats'));
    }
    
    private function getTodayReports(): int
    {
        // Koreksi Implementasi §2: batas dihitung WIB, lalu WAJIB dikonversi ke zona created_at
        // (config('app.timezone')) sebelum masuk query — Carbon Jakarta tidak boleh langsung diikat.
        [$start, $end] = $this->wibDayBounds(now());
        return LostReport::whereBetween('created_at', [$start, $end])->count()
             + FoundReport::whereBetween('created_at', [$start, $end])->count();
    }
    
    // ... helper methods

    /**
     * Batas hari dalam WIB, dikembalikan dalam zona penyimpanan created_at.
     * Tren 30 hari memakai pola sama per hari; hari tanpa laporan = 0.
     */
    private function wibDayBounds(CarbonInterface $day): array
    {
        $tzDb = config('app.timezone');

        return [
            $day->copy()->setTimezone('Asia/Jakarta')->startOfDay()->setTimezone($tzDb),
            $day->copy()->setTimezone('Asia/Jakarta')->endOfDay()->setTimezone($tzDb),
        ];
    }
}
```

**2. View**
```blade
{{-- resources/views/landing.blade.php --}}
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Campus Lost & Found - Polines</title>
    {{-- Bundel Plus Jakarta Sans atau fallback system --}}
    <link rel="stylesheet" href="{{ asset('css/landing.css') }}">
</head>
<body>
    {{-- Hero section --}}
    <section class="hero">
        <h1>{{ $stats['returned_count'] }}</h1>
        <p>barang berhasil dikembalikan</p>
        <span>Sistem Lost & Found Polines</span>
    </section>
    
    {{-- KPI strip --}}
    <section class="kpi">
        <div class="card">
            <span>{{ $stats['today_reports'] }}</span>
            <label>Laporan Hari Ini</label>
        </div>
        {{-- ... 3 kartu lainnya --}}
    </section>
    
    {{-- Tren 30 hari --}}
    <section class="trend">
        <h2>Tren 30 Hari Terakhir</h2>
        <x-line-chart :data="$stats['trend_30d']" />
    </section>
    
    {{-- Kategori & Status --}}
    <section class="composition">
        <div class="chart">
            <h3>Komposisi Kategori</h3>
            <x-bar-chart :data="$stats['category_counts']" />
        </div>
        <div class="chart">
            <h3>Distribusi Status</h3>
            <x-donut-chart :data="$stats['status_distribution']" />
        </div>
    </section>
    
    {{-- Top 5 gedung --}}
    <section class="top-buildings">
        <h2>Top 5 Gedung</h2>
        <ol>
            @foreach($stats['top_buildings'] as $building)
                <li>{{ $building->name }} <span>{{ $building->report_count }} laporan</span></li>
            @endforeach
        </ol>
    </section>
    
    {{-- Footer --}}
    <footer>
        <p>Tim: Anisa Aulia, Daniel Arvin Geovani, Muhammad Tsaqif Satria Firmansyah, Steven Hermawan</p>
        <p>Versi 1.0.0</p>
        {{-- Koreksi Implementasi §4: satu link statis, Filament urus redirect guest --}}
        <a href="/admin">Masuk Admin</a>
    </footer>
</body>
</html>
```

**3. Blade Components (Chart SVG)**
```blade
{{-- resources/views/components/line-chart.blade.php --}}
<svg viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg">
    {{-- Generate polyline dari $data --}}
    {{-- Warna: hilang #C2560A, ditemukan #15803D --}}
</svg>
```

Komponen chart pakai SVG inline, data di-transform server-side (tidak butuh JS Chart.js).

**4. CSS**
```css
/* public/css/landing.css */
@media (prefers-color-scheme: dark) {
    :root {
        --primary: #F5C400;
        --bg: #0A0A0A;
        --surface: #141414;
        --text: #F5F5F5;
    }
}

@media (prefers-color-scheme: light) {
    :root {
        --primary: #111111;
        --bg: #FAFAFA;
        --surface: #FFFFFF;
        --text: #0D0D0D;
    }
}

@media (prefers-reduced-motion: reduce) {
    * {
        animation: none !important;
        transition: none !important;
    }
}

/* ... layout, hero, kpi, chart, footer */
```

**5. Route**
Ganti isi `routes/web.php` baris 5-7:
```php
Route::get('/', [PublicLandingController::class, 'index'])
    ->middleware('throttle:60,1')
    ->name('landing');
```

---

### Verifikasi

**Feature Test:**
```php
// tests/Feature/PublicLandingTest.php
class PublicLandingTest extends TestCase
{
    public function test_guest_can_access_landing_page()
    {
        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertSee('barang berhasil dikembalikan');
    }
    
    public function test_landing_does_not_leak_personal_data()
    {
        User::factory()->create(['email' => 'secret@mhs.polines.ac.id']);
        LostReport::factory()->create(['code' => 'LST-261029-A1B2']);
        
        $response = $this->get('/');
        
        // Tidak boleh bocor email atau kode laporan
        $response->assertDontSee('secret@mhs.polines.ac.id');
        $response->assertDontSee('LST-261029-A1B2');
    }
    
    public function test_stats_match_seed_data()
    {
        Claim::factory()->returned()->count(5)->create();

        $response = $this->get('/');
        $response->assertSee('5'); // ❌ JANGAN — lihat Koreksi Implementasi §3: pakai assertViewHas('stats.returned_count', 5)
    }
}
```

**Manual QA:**
- Buka `/` tanpa login → 200, tidak crash
- Cek source HTML → tidak ada email/kode laporan
- Test light/dark mode (DevTools "Emulate CSS media feature")
- Test `prefers-reduced-motion: reduce` → animasi mati
- Test mobile (375px) → responsif, tidak horizontal scroll

---

## Branch & Workflow

**Branch untuk Bob:** `feature/filament/admin-landing`

**Merge ke `develop` hanya setelah:**
1. ✅ User menyetujui plan ini (2026-10-29, status `draft` → `active`)
2. Feature test lulus (200 guest, tidak bocor data, nilai angka spesifik, hari kosong = 0, batas tengah malam WIB)
3. Manual QA selesai (light/dark, motion, responsif)

---

## Estimasi

- Controller + query helper: **30 menit**
- View Blade + layout: **45 menit**
- CSS (light/dark/responsif): **30 menit**
- Blade component chart SVG: **1 jam** (3 chart: line, bar, donut)
- Feature test: **20 menit**
- Manual QA: **15 menit**

**Total:** ~3 jam

---

## Next Steps

1. ✅ **Disetujui user 2026-10-29** — status plan `active`
2. ⬜ Buat branch `feature/filament/admin-landing`
3. ⬜ Implementasi controller + view (ikuti [[#Koreksi Implementasi (hasil review 2026-10-29)]] — implementasi oleh **Bob-261029-04**)
4. ⬜ Feature test (nilai spesifik `assertViewHas`, hari kosong = 0, batas tengah malam WIB)
5. ⬜ Manual QA (light/dark, motion, mobile)
6. ⬜ PR ke `develop`

---

## Related

- **PRD:** [[PRD]] — landing page publik **belum ada di PRD**
- **Design:** [[Design]] §2 (token warna), §6.1 (login admin)
- **Technical Reference:** [[TechnicalReference]] §4 (route web), §13 (Filament panel)
- **Progress:** [[Lost&Found Progress]]

---

#plan #lost-and-found #landing-page #public #transparency #low-priority
