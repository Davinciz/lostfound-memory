---
type: plan
project: lost-found
status: active
priority: high
created: 2026-09-29
updated: 2026-10-13
summary: Master buildings + pilih lokasi di peta dengan saran gedung terdekat (Haversine lokal Flutter); jumlah gedung dinetralkan (plan 22 nama vs DB 23 entri, menunggu konfirmasi)
---

# Master Buildings + Auto Location Detection - Lost&Found

**Created:** 2026-09-29  
**Project:** [[PBL]] Lost&Found  
**Updated:** 2026-10-13 (merge ke main dikonfirmasi user; sisa: data buildings via Filament)  
**Status:** Active  
**Priority:** High

---

## Goal

Implementasi master buildings dengan fitur pilih lokasi di peta:
1. **Master gedung** — tabel buildings untuk daftar gedung kampus (jumlah: lihat catatan di §Data Source), endpoint GET /api/buildings
2. **Peta interaktif** — flutter_map + OpenStreetMap; user taruh pin di peta untuk pilih lokasi
3. **Saran gedung terdekat** — maks 3 gedung dalam radius ~75m dari pin, dihitung Haversine di Flutter (opsi B), tampil sebagai daftar; user klik untuk pilih
4. **Detail lokasi opsional** — user bisa tambah detail manual

---

## Data Source: Daftar Gedung Kampus

> **Catatan jumlah gedung (2026-10-13):** daftar di plan ini berisi **22 nama** (sama pada daftar §Data Source dan array `BuildingSeeder`). Data DB dev dilaporkan **23 entri** (DailyChanges 2026-10-01: `buildings=23`); DailyChanges 2026-10-09 mencatat ada entri DB di luar daftar plan. Sumber data gedung resmi menunggu konfirmasi user. Daftar di bawah tidak diubah.

```
Gedung Sekolah A: -7.054278685864139, 110.43470307655164
Gedung Sekolah B: -7.05395868572728, 110.43441016752642
Gedung Sekolah C: -7.052702919617952, 110.43530678216563
Gedung Kuliah Terpadu: -7.051568504243241, 110.43369652904673
Gedung Magister Terapan: -7.05317610397622, 110.43487469829248
Gedung Serba Guna: -7.051208511749683, 110.43371254647518
Gedung Kerja Sama Direktorat: -7.05243572952789, 110.43498376434334
Gedung Sekolah Satu: -7.052089425546585, 110.43550263355039
Gedung Sekolah Dua: -7.0521956179416705, 110.43352358905771
Laboratorium Teknik Mesin: -7.051833059006264, 110.43323900809807
Bengkel Teknik Mesin: -7.053759756652214, 110.43525340781531
Laboratorium Perawatan dan Perbaikan: -7.053477637192861, 110.43525071746126
Laboratorium Telekomunikasi Barat: -7.052981951593107, 110.43494274538513
Bengkel Sipil: -7.0523438064990485, 110.43473764538228
Laboratorium Akuntansi: -7.052224092479573, 110.43304883052105
Bengkel Listrik: -7.053381819323626, 110.43396861861828
Gedung AD lama: -7.054627611749015, 110.43495004162753
Parkiran Lapangan Hitam: -7.053995732921513, 110.43518029257518
Laboratorium Telekomunikasi Timur: -7.053716629013611, 110.43468763262024
Masjid MDH: -7.0527987493883275, 110.4355459194552
Gedung PKM: -7.052471999344638, 110.43571959248996
Parkiran Elektro: -7.0539649637885695, 110.43404496005253
```

---

## Database Design

### Table: `buildings`

```sql
CREATE TABLE buildings (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NULLABLE,  -- GSA, GKT, LTM
    type ENUM('gedung', 'lab', 'bengkel', 'parkiran', 'fasilitas') DEFAULT 'gedung',
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    description TEXT NULLABLE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_buildings_type (type),
    INDEX idx_buildings_coords (latitude, longitude)  -- untuk Haversine query
);
```

### Update Existing Tables: `lost_reports` & `found_reports`

```sql
ALTER TABLE lost_reports 
    ADD COLUMN building_id UUID NULLABLE,
    ADD FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE SET NULL;

ALTER TABLE found_reports 
    ADD COLUMN building_id UUID NULLABLE,
    ADD FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE SET NULL;
```

**Field hierarchy (2026-10-11):**
1. `latitude`, `longitude` → **titik yang dipilih user di peta** (sumber kebenaran)
2. `building_id` (FK, optional) → user klik dari daftar saran gedung terdekat
3. `location_name` → aturan baru (lihat §Aturan location_name di bawah)

**Aturan location_name (2026-10-11):**
- Gedung + detail → `"Nama Gedung, detail"`
- Gedung saja → `"Nama Gedung"`
- Tanpa gedung + detail diisi → `detail`
- Tanpa gedung + detail kosong → `"Titik di peta (area luar gedung)"`

**Aturan koordinat (2026-10-11):** Gedung hanya mengisi `building_id` dan `location_name`, **tidak menimpa koordinat**. Koordinat = titik pin yang dipilih user.

---

## Implementation Steps

### Phase 1: Backend (Laravel)

#### 1.1 Migration ✅ SELESAI (2026-10-09)

```bash
php artisan make:migration create_buildings_table
php artisan make:migration add_building_id_to_reports_tables
php artisan migrate
```

**File:** `2026_10_01_create_buildings_table.php`
**File:** `2026_10_01_add_building_id_to_reports_tables.php`

#### 1.2 Model ✅ SELESAI (2026-10-09)

> Model `Building` sudah dibuat di `app/Models/Building.php`. Lihat DailyChanges 2026-10-09.

```php
// app/Models/Building.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Building extends Model
{
    protected $fillable = ['name', 'code', 'type', 'latitude', 'longitude', 'description'];
    protected $keyType = 'string';
    public $incrementing = false;
    
    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];
    
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }
}
```

#### 1.3 Seeder ✅ SELESAI (2026-10-09)

```php
// database/seeders/BuildingSeeder.php
namespace Database\Seeders;

use App\Models\Building;
use Illuminate\Database\Seeder;

class BuildingSeeder extends Seeder
{
    public function run()
    {
        $buildings = [
            ['name' => 'Gedung Sekolah A', 'code' => 'GSA', 'type' => 'gedung', 'latitude' => -7.054278685864139, 'longitude' => 110.43470307655164],
            ['name' => 'Gedung Sekolah B', 'code' => 'GSB', 'type' => 'gedung', 'latitude' => -7.05395868572728, 'longitude' => 110.43441016752642],
            ['name' => 'Gedung Sekolah C', 'code' => 'GSC', 'type' => 'gedung', 'latitude' => -7.052702919617952, 'longitude' => 110.43530678216563],
            ['name' => 'Gedung Kuliah Terpadu', 'code' => 'GKT', 'type' => 'gedung', 'latitude' => -7.051568504243241, 'longitude' => 110.43369652904673],
            ['name' => 'Gedung Magister Terapan', 'code' => 'GMT', 'type' => 'gedung', 'latitude' => -7.05317610397622, 'longitude' => 110.43487469829248],
            ['name' => 'Gedung Serba Guna', 'code' => 'GSG', 'type' => 'gedung', 'latitude' => -7.051208511749683, 'longitude' => 110.43371254647518],
            ['name' => 'Gedung Kerja Sama Direktorat', 'code' => 'GKSD', 'type' => 'gedung', 'latitude' => -7.05243572952789, 'longitude' => 110.43498376434334],
            ['name' => 'Gedung Sekolah Satu', 'code' => 'GS1', 'type' => 'gedung', 'latitude' => -7.052089425546585, 'longitude' => 110.43550263355039],
            ['name' => 'Gedung Sekolah Dua', 'code' => 'GS2', 'type' => 'gedung', 'latitude' => -7.0521956179416705, 'longitude' => 110.43352358905771],
            ['name' => 'Laboratorium Teknik Mesin', 'code' => 'LTM', 'type' => 'lab', 'latitude' => -7.051833059006264, 'longitude' => 110.43323900809807],
            ['name' => 'Bengkel Teknik Mesin', 'code' => 'BTM', 'type' => 'bengkel', 'latitude' => -7.053759756652214, 'longitude' => 110.43525340781531],
            ['name' => 'Laboratorium Perawatan dan Perbaikan', 'code' => 'LPP', 'type' => 'lab', 'latitude' => -7.053477637192861, 'longitude' => 110.43525071746126],
            ['name' => 'Laboratorium Telekomunikasi Barat', 'code' => 'LTLB', 'type' => 'lab', 'latitude' => -7.052981951593107, 'longitude' => 110.43494274538513],
            ['name' => 'Bengkel Sipil', 'code' => 'BS', 'type' => 'bengkel', 'latitude' => -7.0523438064990485, 'longitude' => 110.43473764538228],
            ['name' => 'Laboratorium Akuntansi', 'code' => 'LA', 'type' => 'lab', 'latitude' => -7.052224092479573, 'longitude' => 110.43304883052105],
            ['name' => 'Bengkel Listrik', 'code' => 'BL', 'type' => 'bengkel', 'latitude' => -7.053381819323626, 'longitude' => 110.43396861861828],
            ['name' => 'Gedung AD lama', 'code' => 'GAD', 'type' => 'gedung', 'latitude' => -7.054627611749015, 'longitude' => 110.43495004162753],
            ['name' => 'Parkiran Lapangan Hitam', 'code' => 'PLH', 'type' => 'parkiran', 'latitude' => -7.053995732921513, 'longitude' => 110.43518029257518],
            ['name' => 'Laboratorium Telekomunikasi Timur', 'code' => 'LTLT', 'type' => 'lab', 'latitude' => -7.053716629013611, 'longitude' => 110.43468763262024],
            ['name' => 'Masjid MDH', 'code' => 'MDH', 'type' => 'fasilitas', 'latitude' => -7.0527987493883275, 'longitude' => 110.4355459194552],
            ['name' => 'Gedung PKM', 'code' => 'PKM', 'type' => 'gedung', 'latitude' => -7.052471999344638, 'longitude' => 110.43571959248996],
            ['name' => 'Parkiran Elektro', 'code' => 'PE', 'type' => 'parkiran', 'latitude' => -7.0539649637885695, 'longitude' => 110.43404496005253],
        ];
        
        foreach ($buildings as $building) {
            Building::create($building);
        }
    }
}
```

#### 1.4 ~~Location Service (Haversine)~~ — **DICORET (2026-10-11)**

> **Keputusan:** Perhitungan Haversine dilakukan di Flutter (opsi B), bukan di backend. LocationService backend tidak diperlukan.

~~LocationService backend dengan method `haversineDistance`, `findNearestBuilding`, dan `findBuildingsInRadius` tidak jadi dibuat.~~

**Alasan:** Flutter menerima seluruh daftar gedung via GET /api/buildings, lalu menghitung jarak lokal dari koordinat pin yang dipilih user. Lebih responsif dan tidak perlu round-trip ke server tiap pin digeser.

#### 1.5 API Endpoints

```php
// routes/api.php
Route::get('/buildings', [BuildingController::class, 'index']);
// POST /location/suggest DICORET — tidak diperlukan (2026-10-11)

// app/Http/Controllers/BuildingController.php
// (Tanpa subfolder Api, konsisten dengan ClaimController)
namespace App\Http\Controllers;

use App\Models\Building;

class BuildingController extends Controller
{
    public function index()
    {
        return Building::orderBy('name')->get();
    }
}
```

**Status:** ✅ `BuildingController` sudah dibuat di `app/Http/Controllers/BuildingController.php` (bukan `Api\`), route GET /api/buildings sudah ada dan diuji (DailyChanges 2026-10-09).

#### 1.6 Update Report Controllers

```php
// app/Http/Controllers/LostReportController.php
// app/Http/Controllers/FoundReportController.php

// Validation rule
'building_id' => 'nullable|uuid|exists:buildings,id',
'latitude' => 'required|numeric|between:-90,90',
'longitude' => 'required|numeric|between:-180,180',
// Tolak koordinat kosong atau 0,0
```

**Koordinat wajib:** Backend harus menolak koordinat kosong atau (0, 0) dengan response 422.

**Aturan baru (2026-10-11):** Koordinat laporan = titik yang dipilih user di peta. Gedung (jika dipilih) hanya mengisi `building_id` dan `location_name`, **tidak menimpa koordinat**. Aturan lama "gedung menang atas GPS" dibalik.

---

### Phase 2: Frontend (Flutter)

> **Keputusan (2026-10-11):** Peta memakai `flutter_map` + OpenStreetMap (sudah disetujui). Patuhi atribusi "© OpenStreetMap contributors" dan `userAgentPackageName` diisi.

#### 2.1 Models

```dart
// lib/models/building.dart
class Building {
  final String id;
  final String name;
  final String? code;
  final String type;
  final double latitude;
  final double longitude;

  Building({
    required this.id,
    required this.name,
    this.code,
    required this.type,
    required this.latitude,
    required this.longitude,
  });

  factory Building.fromJson(Map<String, dynamic> json) {
    return Building(
      id: json['id'],
      name: json['name'],
      code: json['code'],
      type: json['type'],
      latitude: double.parse(json['latitude'].toString()),
      longitude: double.parse(json['longitude'].toString()),
    );
  }
}
```

> ~~`LocationSuggestion` dan `BuildingDistance` model~~ — **DICORET.** Saran gedung dihitung lokal di Flutter dari daftar `Building`, tidak perlu model terpisah dari response API.

#### 2.2 Services

```dart
// lib/services/building_service.dart
class BuildingService {
  final ApiClient apiClient;

  BuildingService(this.apiClient);

  Future<List<Building>> getBuildings() async {
    final response = await apiClient.dio.get('/buildings');
    return (response.data as List)
        .map((json) => Building.fromJson(json))
        .toList();
  }

  // ~~suggestLocation via POST /location/suggest~~ — DICORET (2026-10-11)
  // Haversine dihitung lokal di Flutter (opsi B)
}
```

#### 2.3 Haversine Lokal (opsi B) ✅ SELESAI (2026-10-11)

> Implementasi: `lib/utils/geo_utils.dart` — Haversine, 3 gedung terdekat radius 75 m, builder `location_name`. Test: `test/geo_utils_test.dart` (46 test lulus). Dites di HP fisik. Lihat DailyChanges 2026-10-11.

```dart
// lib/utils/geo_utils.dart
double haversineDistance(double lat1, double lon1, double lat2, double lon2) {
  const earthRadius = 6371000; // meter
  final dLat = _toRad(lat2 - lat1);
  final dLon = _toRad(lon2 - lon1);
  final a = _sin2(dLat / 2) +
      _cos(_toRad(lat1)) * _cos(_toRad(lat2)) * _sin2(dLon / 2);
  final c = 2 * atan2(sqrt(a), sqrt(1 - a));
  return earthRadius * c;
}

double _toRad(double deg) => deg * (pi / 180);
double _sin2(double x) => sin(x) * sin(x);
double _cos(double x) => cos(x);

/// Maks 3 gedung terdekat dalam radius 75m, urut jarak.
List<Map<String, dynamic>> suggestBuildings(
  double pinLat,
  double pinLng,
  List<Building> buildings, {
  double radius = 75,
  int maxResults = 3,
}) {
  final results = buildings.map((b) {
    final dist = haversineDistance(pinLat, pinLng, b.latitude, b.longitude);
    return {'building': b, 'distance': dist};
  }).where((e) => e['distance'] as double <= radius).toList()
    ..sort((a, b) => (a['distance'] as double).compareTo(b['distance'] as double));
  return results.take(maxResults).toList();
}
```

#### 2.4 UI: Peta + Pin + Daftar Saran ✅ SELESAI (2026-10-11)

> Implementasi: `lib/widgets/location_picker_section.dart` — `flutter_map` + OSM, marker gedung, pin draggable, daftar saran dengan jarak, tombol "Lokasi saya" hanya menggeser kamera, validasi pin kosong. Dites di HP fisik. Lihat DailyChanges 2026-10-11.

```dart
// lib/widgets/location_picker_section.dart
// Ringkasan perilaku (2026-10-11):
// - Peta flutter_map terbuka di tengah kampus tanpa pin
// - User menaruh pin (tap di peta); pin bisa digeser
// - Tombol "Lokasi saya" hanya menggeser peta ke posisi GPS, TIDAK menetapkan pin
// - Marker gedung dari GET /api/buildings tampil di peta; tap marker = pilih gedung
// - Setelah pin ditaruh, muncul DAFTAR saran gedung (maks 3, radius 75m, urut jarak)
//   tiap item: nama gedung + jarak; user klik untuk memilih; tidak ada pilihan otomatis
// - Daftar diperbarui saat pin digeser
// - Form baru valid setelah pin ditaruh; koordinat kosong/0,0 ditolak
// - Detail lokasi opsional
// - Label form: Lost → "Lokasi Kehilangan", Found → "Lokasi Penemuan"
```

**~~UI "Deteksi Lokasi GPS"~~ — DICORET (2026-10-11).** Tombol auto-detect GPS yang langsung mengambil lokasi dan mengirim ke `/location/suggest` tidak lagi digunakan. Ganti dengan peta + pin manual. Tombol "Lokasi saya" hanya menggeser peta ke posisi GPS, tidak menetapkan lokasi.

---

### Phase 3: Admin Panel (Filament)

```php
// app/Filament/Resources/BuildingResource.php
namespace App\Filament\Resources;

use App\Models\Building;
use Filament\Resources\Resource;
use Filament\Forms;
use Filament\Tables;

class BuildingResource extends Resource
{
    protected static ?string $model = Building::class;
    protected static ?string $navigationIcon = 'heroicon-o-building-office-2';
    protected static ?string $navigationLabel = 'Buildings';
    protected static ?string $navigationGroup = 'Master Data';
    
    public static function form(Forms\Form $form): Forms\Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('name')->required(),
            Forms\Components\TextInput::make('code'),
            Forms\Components\Select::make('type')
                ->options([
                    'gedung' => 'Gedung',
                    'lab' => 'Laboratorium',
                    'bengkel' => 'Bengkel',
                    'parkiran' => 'Parkiran',
                    'fasilitas' => 'Fasilitas',
                ])
                ->required(),
            Forms\Components\TextInput::make('latitude')->numeric()->required(),
            Forms\Components\TextInput::make('longitude')->numeric()->required(),
            Forms\Components\Textarea::make('description')->rows(3),
        ]);
    }
    
    public static function table(Tables\Table $table): Tables\Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('code')->searchable(),
                Tables\Columns\BadgeColumn::make('type'),
                Tables\Columns\TextColumn::make('latitude'),
                Tables\Columns\TextColumn::make('longitude'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->options([
                        'gedung' => 'Gedung',
                        'lab' => 'Laboratorium',
                        'bengkel' => 'Bengkel',
                        'parkiran' => 'Parkiran',
                        'fasilitas' => 'Fasilitas',
                    ]),
            ]);
    }
}
```

---

## User Flow

### Scenario 1: Pilih lokasi di peta + saran gedung
1. User buka form laporan (Lost/Found)
2. Peta terbuka di tengah kampus tanpa pin
3. User menaruh pin (tap di peta) di lokasi kehilangan/penemuan
4. Muncul daftar saran gedung: maks 3 terdekat dalam radius ~75m, urut jarak, tiap item nama + jarak
5. User klik salah satu saran → `building_id` dan `location_name` terisi (koordinat tetap = titik pin)
6. (Opsional) User isi detail lokasi: "lantai 2, ruang 201" → `location_name` = "Nama Gedung, lantai 2, ruang 201"
7. Submit → koordinat = titik pin, building_id = gedung pilihan

### Scenario 2: Pilih lokasi di peta tanpa gedung
1. User taruh pin di area luar gedung (tidak ada saran dalam radius 75m)
2. Daftar saran kosong
3. User isi detail opsional: "Parkiran motor selatan"
4. Submit → `building_id = NULL`, `location_name = "Parkiran motor selatan"`, koordinat = titik pin
5. Jika detail kosong → `location_name = "Titik di peta (area luar gedung)"`

### Scenario 3: Tap marker gedung di peta
1. Marker gedung dari GET /api/buildings tampil di peta
2. User tap marker → gedung terpilih (`building_id` terisi), pin ditaruh di koordinat gedung
3. Daftar saran muncul (gedung itu sendiri akan jadi item #1, jarak ~0m)
4. User bisa geser pin jika perlu
5. Submit

### Scenario 4: "Lokasi saya" untuk menggeser peta
1. User tekan tombol "Lokasi saya"
2. Peta menggeser ke posisi GPS device user
3. Pin belum ditaruh — user masih harus tap untuk menaruh pin
4. Lanjut ke Scenario 1 atau 2

---

## Testing Checklist

**Backend:**
- [x] Migration create buildings + FK (selesai 2026-10-09)
- [x] Model Building (selesai 2026-10-09)
- [x] Seeder insert 22+ gedung (selesai 2026-10-09)
- [x] GET `/api/buildings` return daftar gedung (selesai 2026-10-09)
- [x] POST report dengan building_id valid → sukses (selesai 2026-10-09)
- [x] POST report dengan building_id NULL → sukses (selesai 2026-10-09)
- [x] POST report dengan building_id invalid → 422 error (selesai 2026-10-09)
- [x] POST report dengan koordinat 0,0 → ditolak 422 (selesai 2026-10-09)
- [ ] ~~POST `/location/suggest`~~ — DICORET, tidak diimplementasi
- [ ] ~~Haversine backend~~ — DICORET, dihitung di Flutter

**Frontend (Flutter):**
- [x] Peta flutter_map terbuka di tengah kampus tanpa pin (selesai 2026-10-11)
- [x] User bisa menaruh pin dengan tap di peta (selesai 2026-10-11)
- [x] Pin bisa digeser (selesai 2026-10-11)
- [x] Tombol "Lokasi saya" menggeser peta ke GPS, tidak menetapkan pin (selesai 2026-10-11)
- [x] Marker gedung tampil di peta; tap marker memilih gedung (selesai 2026-10-11)
- [x] Daftar saran gedung muncul setelah pin ditaruh (maks 3, radius 75m) (selesai 2026-10-11)
- [x] Daftar saran urut berdasarkan jarak, tiap item nama + jarak (selesai 2026-10-11)
- [x] Daftar diperbarui saat pin digeser (selesai 2026-10-11)
- [x] Klik saran → building_id dan location_name terisi, koordinat tetap = pin (selesai 2026-10-11)
- [x] Pin di luar gedung → daftar kosong, location_name default (selesai 2026-10-11)
- [x] Form menolak submit tanpa pin (koordinat kosong/0,0) (selesai 2026-10-11)
- [x] Detail lokasi opsional (selesai 2026-10-11)
- [x] Label form: Lost → "Lokasi Kehilangan", Found → "Lokasi Penemuan" (selesai 2026-10-11)
- [x] Fallback location_name backend (gedung → nama gedung; tanpa gedung → "Titik di peta (area luar gedung)"; terisi → tidak ditimpa) (selesai 2026-10-11)

**Admin:**
- [x] BuildingResource CRUD works (selesai 2026-10-09)
- [x] Filter by type works (selesai 2026-10-09)
- [x] Search by name/code works (selesai 2026-10-09)

---

## Benefits

### For Users
- ✅ Pilih lokasi tepat di peta (tidak bergantung akurasi GPS otomatis)
- ✅ Saran gedung terdekat sebagai daftar, user yang memilih
- ✅ Fleksibel: bisa taruh pin di mana saja, termasuk area luar gedung
- ✅ Notifikasi targeted: "Barang ketemu di gedungmu"

### For Admins
- ✅ Dashboard statistik per gedung
- ✅ Heatmap: gedung mana hotspot kehilangan
- ✅ Filter laporan by building
- ✅ CRUD master gedung via Filament

### Technical
- ✅ Backward compatible (nullable FK)
- ✅ No breaking changes
- ✅ Simple (no external deps selain flutter_map/latlong2 yang sudah disetujui)
- ✅ Fast (Haversine O(N) lokal, N=22+ buildings)

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| User salah taruh pin | Lokasi tidak akurat | Pin bisa digeser; saran gedung membantu konfirmasi |
| Data gedung di DB belum rapi | Saran tidak akurat | Open item: user bereskan data buildings via Filament (ada entri berkoordinat sekitar -6.97, 110.42 yang salah) |
| Outdoor location (taman, jalan) | Tidak ada saran gedung | location_name default "Titik di peta (area luar gedung)"; detail bisa diisi manual |
| Data maintenance (gedung baru) | Outdated master | Admin panel CRUD via Filament |

---

## Timeline Estimate

- **Backend (migration, model, seeder, GET /buildings):** ✅ selesai (2026-10-09)
- ~~**LocationService + POST /location/suggest:**~~ DICORET (2026-10-11)
- **Frontend (peta, pin, saran lokal, UI):** ~3 jam
- **Admin panel (Filament resource):** ✅ selesai (2026-10-09)
- **Testing end-to-end:** ~2 jam

---

## Related Files

- **ERD DBML:** `D:\ObsidianVault\PBL\Documents\schema.dbml`
- **ERD Markdown:** `D:\ObsidianVault\PBL\Documents\ERD.md`
- **Laravel project:** `C:\Project\lostfound-backend` (GitHub: `Davinciz/lostfound-backend`, Private)
- **Flutter project:** `C:\Project\lostfound-mobile` (GitHub: `Davinciz/lostfound-mobile`, Private)
- **Koordinat PDF:** `C:\Users\ADVAN\AppData\Local\hermes\cache\documents\doc_9eb77469e200_Koordinat_Gedung_-_Sheet1.pdf`

---

## Next Steps

1. ✅ Plan merged (2026-10-01)
2. ✅ ERD updated (DBML + HTML visual)
3. ✅ Backend: migration, model, seeder, GET /api/buildings (selesai 2026-10-09)
4. ✅ Admin panel: BuildingResource (selesai 2026-10-09)
5. ✅ Frontend: peta flutter_map + pin + saran gedung lokal (opsi B) (selesai 2026-10-11)
6. ✅ Fallback location_name backend (selesai 2026-10-11)
7. ✅ Testing end-to-end di HP fisik (selesai 2026-10-11)
8. ⬜ ~~LocationService backend~~ — DICORET (2026-10-11)
9. ⬜ ~~POST /location/suggest~~ — DICORET (2026-10-11)
10. ✅ Merge `feature/location-fallback` (backend) dan `feature/map-location-picker` (Flutter) ke `main` — dikonfirmasi user (2026-10-11)
11. ⬜ Data tabel buildings dibereskan user lewat Filament (entri berkoordinat salah) — belum dikonfirmasi selesai

---

## Open Items

1. **Data buildings di DB belum rapi.** Ada entri berkoordinat sekitar -6.97, 110.42 yang salah (tidak cocok dengan koordinat kampus sekitar -7.05, 110.43). User akan bereskan lewat Filament. Daftar gedung di dokumen ini tidak diubah.
2. **Jumlah gedung (22 vs 23).** Hasil hitung: daftar di plan = **22 nama**; array `BuildingSeeder` = **22 entri**; data DB dev dilaporkan **23 entri** (DailyChanges 2026-10-01) dan ada entri di luar daftar plan (DailyChanges 2026-10-09). Sumber data resmi **menunggu konfirmasi user**; daftar gedung tidak diubah.

---

#plan #lost-and-found #location #gps #haversine #master-data #backend #frontend