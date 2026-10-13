---
type: plan
project: lost-found
status: active
priority: medium
updated: 2026-10-13
summary: Upload foto bukti serah terima setelah admin terima claim untuk dokumentasi dan mencegah dispute
---

# Foto Bukti Transfer - Lost&Found

**Tanggal:** 2026-09-30  
**Project:** [[PBL]] Lost&Found  
**Status:** In Progress  
**Priority:** Medium  

---

## Implementation Status (2026-10-05)

✅ **Backend:** Endpoint `PATCH /api/claims/{id}/mark-transferred`, ClaimTransferService, ClaimPolicy  
✅ **Filament:** Action "Serahkan Barang", ImageEntry foto bukti, ViewClaim page  
✅ **Flutter:** Model claim dengan field `proofOfTransferPhotoUrl`, `transferredAt`, `transferredBy`  
✅ **Testing:** 21/21 test lulus (6 test ClaimTransferTest)  

**Sisa pekerjaan (In Progress, 2026-10-13):** 1) UI detail claim di Flutter untuk menampilkan foto bukti (display only). 2) Upload foto bukti oleh penemu — `ClaimPolicy` sudah mengizinkan finder, tetapi UI Flutter belum ada (lihat Next Steps 5).

---

## Goal

Menyediakan bukti visual bahwa barang sudah diserahkan ke pemilik yang sah, protect dari dispute "Barang tidak pernah saya terima".

---

## Problem Statement

**Current flow:**
- Admin approve claim → status `accepted`
- Tapi tidak ada bukti fisik penyerahan barang
- Dispute bisa muncul: "Saya tidak pernah terima barang"

**Risk:**
- Admin/penemu disalahkan
- Lack of accountability
- No audit trail untuk penyerahan fisik

---

## Konsep

### Saat Barang Diserahkan
Admin atau penemu upload **foto bukti serah terima** yang menunjukkan:
- Barang yang dikembalikan
- Penerima barang (optional: wajah/tangan terima barang)
- Timestamp otomatis (dari metadata foto)

**Stored in:**
- `claims` table, kolom `proof_of_transfer_photo_url`, `transferred_at`, `transferred_by` (sudah ada di batch 8)
- Laravel Storage disk `public`, folder `claims/proof`

**Visibility:**
- Owner (claimant) bisa lihat foto bukti
- Admin bisa lihat di dashboard
- Penemu bisa lihat (opsional)

---

## Architecture

### Data Model

**Kolom di `claims` (sudah ada dari migration batch 8):**
- `proof_of_transfer_photo_url` VARCHAR(500) nullable
- `transferred_at` TIMESTAMP nullable
- `transferred_by` UUID nullable, FK → users.id

**Relasi:**
```php
// Claim model
public function transferredBy()
{
    return $this->belongsTo(User::class, 'transferred_by');
}
```

### API Changes

**PATCH `/api/claims/:id/mark-transferred` (admin + finder)**
- Body:
```json
{
  "proof_photo": "multipart file upload"
}
```
- Side effect:
  - Upload foto ke Laravel Storage (disk `public`, folder `claims/proof`)
  - Update `proof_of_transfer_photo_url`, `transferred_at`, `transferred_by`
  - Update status → `returned`
  - Update related reports: `lost_reports.status = returned`, `found_reports.status = returned`
  - Broadcast FCM notification ke claimant: "Barang sudah diserahkan! Lihat foto bukti"

**GET `/api/claims/:id`**
- Response tambahan:
```json
{
  "proof_of_transfer_photo_url": "http://api.domain.com/storage/claims/proof/uuid.jpg",
  "transferred_at": "2026-10-05T10:30:00Z",
  "transferred_by": {
    "id": "...",
    "name": "Admin Kampus"
  }
}
```

---

## Implementation Tasks

### 1. Backend API

**ClaimController::markTransferred()**

```php
public function markTransferred(Request $request, Claim $claim)
{
    // Authorization: admin atau finder (via Policy)
    $this->authorize('markTransferred', $claim);
    
    $validated = $request->validate([
        'proof_photo' => 'required|image|max:5120', // max 5MB
    ]);
    
    // Upload foto ke Laravel Storage
    $file = $request->file('proof_photo');
    $filename = Str::uuid() . '.' . $file->extension();
    $path = $file->storeAs('claims/proof', $filename, 'public');
    $url = asset('storage/' . $path);
    
    // Update claim
    $claim->update([
        'proof_of_transfer_photo_url' => $url,
        'transferred_at' => now(),
        'transferred_by' => auth()->id(),
        'status' => 'returned',
    ]);
    
    // Update related reports
    $claim->lostReport->update(['status' => 'returned']);
    $claim->foundReport->update(['status' => 'returned']);
    
    // FCM notification ke claimant
    $this->sendNotification(
        $claim->claimant,
        'Barang Sudah Diserahkan!',
        'Lihat foto bukti serah terima di detail claim.'
    );
    
    return response()->json($claim->fresh());
}
```

**Route:**
```php
Route::patch('/claims/{claim}/mark-transferred', [ClaimController::class, 'markTransferred'])
    ->middleware('auth:sanctum');
```

**Authorization (ClaimPolicy):**
```php
public function markTransferred(User $user, Claim $claim)
{
    // Admin atau finder boleh
    return $user->role === 'admin' 
        || $claim->foundReport->reporter_id === $user->id;
}
```

---

### 2. Filament Admin Dashboard

**ClaimResource Actions:**

Tambah action button "Serahkan Barang":

```php
use Filament\Forms\Components\FileUpload;

Actions\Action::make('mark_transferred')
    ->label('Serahkan Barang')
    ->icon('heroicon-o-check-circle')
    ->color('success')
    ->visible(fn (Claim $record) => $record->status === 'accepted')
    ->form([
        FileUpload::make('proof_photo')
            ->label('Foto Bukti Serah Terima')
            ->image()
            ->maxSize(5120)
            ->disk('public')
            ->directory('claims/proof')
            ->required()
            ->helperText('Upload foto barang saat diserahkan ke pemilik'),
    ])
    ->action(function (Claim $record, array $data) {
        // File sudah tersimpan via FileUpload disk config
        $path = $data['proof_photo'];
        $url = asset('storage/' . $path);
        
        // Update claim
        $record->update([
            'proof_of_transfer_photo_url' => $url,
            'transferred_at' => now(),
            'transferred_by' => auth()->id(),
            'status' => 'returned',
        ]);
        
        // Update reports
        $record->lostReport->update(['status' => 'returned']);
        $record->foundReport->update(['status' => 'returned']);
        
        // Send notification (via service)
        app(NotificationService::class)->claimTransferred($record);
        
        Notification::make()
            ->title('Barang berhasil diserahkan')
            ->success()
            ->send();
    });
```

**Detail View:**

Tampilkan foto bukti setelah transferred:

```php
ImageEntry::make('proof_of_transfer_photo_url')
    ->label('Foto Bukti Serah Terima')
    ->visible(fn ($record) => $record->status === 'returned' && $record->proof_of_transfer_photo_url)
    ->size(300),

TextEntry::make('transferred_at')
    ->label('Diserahkan Pada')
    ->dateTime('d M Y, H:i')
    ->visible(fn ($record) => $record->transferred_at),

TextEntry::make('transferredBy.name')
    ->label('Diserahkan Oleh')
    ->visible(fn ($record) => $record->transferred_by),
```

---

### 3. Flutter Mobile (Optional: Penemu Upload)

**Scenario:** Penemu bisa upload foto bukti setelah serahkan barang langsung (tanpa lewat admin).

**ClaimDetailScreen:**

Jika user adalah penemu (`foundReport.reporter_id == currentUser.id`) dan claim status `accepted`:

```dart
if (claim.status == 'accepted' && isFinderUser) {
  ElevatedButton(
    onPressed: () => _uploadProofOfTransfer(),
    child: Text('Upload Foto Serah Terima'),
  ),
}

Future<void> _uploadProofOfTransfer() async {
  final picker = ImagePicker();
  final XFile? photo = await picker.pickImage(source: ImageSource.camera);
  
  if (photo != null) {
    final formData = FormData.fromMap({
      'proof_photo': await MultipartFile.fromFile(photo.path, filename: 'proof.jpg'),
    });
    
    final response = await ApiClient.dio.patch(
      '/claims/${claim.id}/mark-transferred',
      data: formData,
    );
    
    if (response.statusCode == 200) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Bukti serah terima berhasil diupload')),
      );
      // Refresh claim detail
    }
  }
}
```

**ClaimDetailScreen (View Proof):**

Jika `proof_of_transfer_photo_url` ada, tampilkan:

```dart
if (claim.proofOfTransferPhotoUrl != null) {
  Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text('Bukti Serah Terima', style: titleStyle),
      SizedBox(height: 8),
      Image.network(claim.proofOfTransferPhotoUrl),
      SizedBox(height: 8),
      Text(
        'Diserahkan pada ${formatDate(claim.transferredAt)}',
        style: captionStyle,
      ),
      Text(
        'Oleh: ${claim.transferredBy?.name ?? "Admin"}',
        style: captionStyle,
      ),
    ],
  ),
}
```

---

## Flow Lengkap

### Admin-Driven (Primary)

1. Claimant ajukan claim → status `pending`
2. Admin review → approve → status `accepted`, lost & found reports jadi `claimed`
3. Pemilik & penemu koordinasi serah terima (via chat/WhatsApp)
4. **Setelah serah terima fisik:**
   - Admin buka Filament dashboard → detail claim
   - Klik "Serahkan Barang"
   - Upload foto bukti (barang + penerima)
   - Submit
5. System update:
   - Claim → `returned`
   - Lost report → `returned`
   - Found report → `returned`
   - FCM notification ke claimant: "Barang sudah diserahkan, lihat foto bukti"
6. Claimant buka app → lihat foto bukti di detail claim

### Finder-Driven (Optional)

1-3. Same as admin-driven
4. **Penemu langsung serahkan + upload:**
   - Penemu (finder) serahkan barang ke pemilik
   - Penemu buka app → detail claim → "Upload Foto Serah Terima"
   - Ambil foto → submit
5. System update (same as admin-driven)

---

## Edge Cases & Handling

### 1. Admin Lupa Upload Foto

**Solusi:**
- Status tetap `accepted`, belum `returned`
- Reminder notification ke admin H+1 setelah approve: "Jangan lupa upload foto bukti serah terima"

### 2. Foto Blur/Tidak Jelas

**Solusi:**
- Admin bisa re-upload (replace foto existing via edit claim)
- Validation: min resolution 800x600 (basic quality check)

### 3. Dispute Tetap Muncul Meski Ada Foto

**Solusi:**
- Admin escalate ke pihak kampus
- Foto bukti jadi evidence di investigasi manual

### 4. Privacy: Wajah Penerima di Foto

**Solusi:**
- UI guideline: "Foto barang + tangan penerima, wajah optional"
- Blur wajah otomatis (future: image processing)

---

## Security & Privacy

### 1. Photo Storage
- Upload ke Laravel Storage disk `public`, folder `claims/proof`
- URL: `http://api.domain.com/storage/claims/proof/uuid.jpg`
- Akses: foto disimpan di disk `public`, jadi URL foto bisa dibuka siapa pun yang tahu URL (UUID sulit ditebak, tapi ini **bukan** kontrol akses). Klaim "accessible by claimant, finder, admin" hanya berlaku lewat authorization check di API, bukan proteksi file.
- URL foto absolut akan terdampak **Backlog Item 4** (URL foto relatif) — lihat [[Backlog Perbaikan Lanjutan - Lost&Found]].

### 2. Authorization
- Endpoint `/mark-transferred` hanya admin atau finder (verified via Policy: `foundReport.reporter_id == auth()->id()`)
- Claimant read-only

### 3. Photo Metadata
- Strip EXIF GPS data sebelum upload (prevent location leak) — future enhancement
- Keep timestamp only

---

## Testing Strategy

**Unit Test:**
- `Claim::transferredBy()` relation
- Photo upload service (mocked Laravel Storage)

**Feature Test:**
- PATCH `/claims/:id/mark-transferred` dengan foto → success, status → `returned`
- PATCH tanpa foto → validation error
- PATCH oleh non-admin non-finder → 403 Forbidden
- GET `/claims/:id` → include `proof_of_transfer_photo_url`

**Integration Test:**
- Create claim → admin approve → admin upload proof → claimant receive notification → claimant lihat foto

**Manual Test:**
- Upload foto dari Filament admin → verify di storage/claims/proof → verify URL accessible
- Upload foto dari Flutter app (finder) → same verification

---

## UI/UX Copy

**Admin button tooltip:**
```
Serahkan Barang
Upload foto bukti serah terima setelah barang diserahkan ke pemilik
```

**Flutter button:**
```
📸 Upload Foto Serah Terima
```

**Notification ke claimant:**
```
Judul: Barang Sudah Diserahkan! 🎉
Body: Lihat foto bukti serah terima di detail claim Anda.
```

**Foto caption (di detail view):**
```
Bukti Serah Terima
Diserahkan pada 05 Okt 2026, 10:30
Oleh: Admin Kampus
```

---

## Metrics & Success Criteria

**KPI:**
- % claims dengan foto bukti (target: >95%)
- Dispute rate setelah fitur ini (should decrease)
- Avg time between approve → upload proof (target: <24 jam)

**Dashboard metrics (admin):**
- Total claims dengan/tanpa foto bukti
- List pending proof upload (status `accepted` tapi belum ada foto)

---

## Estimasi Waktu

- Backend API endpoint: **20 menit**
- Filament admin action + view: **25 menit**
- Flutter UI (optional finder upload): **30 menit**
- Testing (unit + feature + integration): **20 menit**

**Total:** ~1 jam (tanpa Flutter), ~1.5 jam (dengan Flutter)

---

## Next Steps

1. ✅ Plan selesai
2. ✅ Decision: admin + penemu boleh upload — terimplementasi di ClaimPolicy (lihat "Implementation Status" 2026-10-05)
3. ✅ Implement backend API `/mark-transferred` (2026-10-05)
4. ✅ Implement Filament admin action "Serahkan Barang" (2026-10-05)
5. ⬜ (Optional) Implement Flutter finder upload
6. ⬜ UI detail claim di Flutter untuk menampilkan foto bukti (display only)
7. ⬜ Test end-to-end dengan real photo
8. ⬜ Monitor upload rate + dispute rate

---

## Related Files

- **Project root:** `C:\Project\lostfound-backend` (GitHub: `Davinciz/lostfound-backend`, Private)
- **PRD:** [[PRD]]
- **Technical Reference:** [[TechnicalReference]]
- **Verifikasi via Chat:** [[Verifikasi via Chat - Lost&Found]]

---

#plan #lost-and-found #accountability #proof #photo
