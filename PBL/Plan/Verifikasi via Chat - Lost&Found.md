---
type: plan
project: lost-found
status: active
priority: medium
updated: 2026-10-14
summary: Verifikasi kepemilikan via real-time chat in-app, bukan pertanyaan keamanan
---

# Verifikasi via Chat - Lost&Found

> [!warning] Akan berubah
> Lihat [[Claim Dua Arah dan Serah Terima oleh Pengguna - Lost&Found]].
> - Chat terbuka **otomatis** saat claim dibuat (status pending), tanpa menunggu admin
> - **Penerima claim** (bukan pengaju) yang menekan tombol konfirmasi:
>   - Pemilik yang claim → Penemu tekan "Cocok" / "Tidak cocok"
>   - Penemu yang claim → Pemilik tekan "Ya, ini barang saya" / "Bukan barang saya"
> - Claim dua arah: pemilik dan penemu sama-sama bisa mengajukan claim

**Tanggal:** 2026-10-02  
**Project:** [[PBL]] Lost&Found  
**Status:** Planning  
**Priority:** Medium  

---

## Goal

Prevent fraud claim dengan verifikasi kepemilikan via chat in-app antara pengklaim dan penemu. Penemu verifikasi kepemilikan lewat percakapan, bukan pertanyaan keamanan otomatis.

---

## Problem Statement

**Masalah fraud claim:**
- User A kehilangan dompet → buat laporan hilang
- User B (fraud) lihat laporan → ajukan claim dengan alasan "Itu dompet saya"
- Admin sulit validasi tanpa bukti kepemilikan

**Pendekatan lama (dibatalkan):**
- Pertanyaan verifikasi (`verification_question`, `verification_answer`) yang dibuat pemilik saat lapor hilang
- Claimant jawab saat ajukan claim
- Admin lihat cocok/tidak

**Keputusan baru:**
Verifikasi kepemilikan dilakukan oleh **penemu lewat chat in-app**. Admin tidak membaca isi chat.

---

## Alur Baru (Final)

### 1. Pemilik Wajib Buat Laporan Hilang Dulu
Sebelum bisa claim, pemilik harus punya laporan hilang (`lost_reports`) yang valid. Claim tanpa `lost_report_id` ditolak API.

### 2. Pemilik Ajukan Claim
- Pemilik buka detail laporan temuan (`found_reports`)
- Klik "Ajukan Claim"
- Form claim:
  - Pilih laporan hilangnya sendiri (dropdown, filter: `reporter_id == currentUser.id`)
  - Isi alasan claim
- Submit → `claims` dibuat dengan status `pending`

**Constraint:**
- `claims.lost_report_id` wajib (NOT NULL)
- Hanya pemilik laporan hilang yang bisa claim

### 3. Chat Otomatis Dibuat
Saat claim dibuat, sistem auto-create `conversation`:
```php
Conversation::firstOrCreate([
    'claim_id' => $claim->id,
    'user1_id' => $claim->claimant_id,      // pemilik
    'user2_id' => $foundReport->reporter_id, // penemu
]);
```

FCM notification ke penemu: "Ada claim baru, chat untuk verifikasi kepemilikan."

### 4. Penemu Verifikasi via Chat
- App menampilkan **banner tips untuk penemu** di chat screen:
  > 💡 **Tips Verifikasi:** Tanyakan detail yang tidak terlihat di foto (warna dalam tas, isi kartu di dompet, password lock HP, dll). Pastikan claimant adalah pemilik asli.

- Penemu dan pemilik chat real-time
- Penemu tanya detail spesifik, pemilik jawab
- Penemu putuskan: yakin ini pemilik asli atau tidak

### 5. Admin Setujui/Tolak Claim
- Admin buka Filament dashboard → list claim pending
- Admin lihat:
  - Foto laporan hilang vs foto laporan temuan
  - Alasan claim dari pemilik
  - Metadata (tanggal, lokasi)
- **Admin TIDAK melihat isi chat** (chat read-only untuk admin tidak dibuat)
- Admin putuskan berdasarkan:
  - Kesesuaian foto/deskripsi
  - Alasan claim masuk akal
  - Trust pada penemu (asumsi: penemu sudah verifikasi via chat)

**Aksi admin:**
- **Terima** → status `accepted`, notifikasi ke pemilik + penemu
- **Tolak** → status `rejected` + alasan, notifikasi ke pemilik

### 6. Serah Terima + Foto Bukti
Sesuai [[Foto Bukti Transfer - Lost&Found]]:
- Setelah admin approve, pemilik + penemu koordinasi serah terima
- Admin/penemu upload foto bukti serah terima
- Status jadi `returned`

---

## Risiko & Mitigasi

### Risiko 1: Penemu Kurang Teliti
**Skenario:** Penemu malas verifikasi, langsung setuju tanpa tanya detail.

**Mitigasi:**
- Banner tips selalu muncul di chat screen untuk penemu
- Guideline admin: tolak claim jika terlihat suspicious (foto tidak cocok, alasan generic)
- Future: rating system untuk penemu (akurasi verifikasi)

### Risiko 2: Admin Memutuskan Tanpa Konteks Chat
**Skenario:** Admin approve/reject tanpa tahu apakah penemu sudah verifikasi.

**Mitigasi:**
- Admin trust pada penemu (asumsi: penemu bertanggung jawab)
- Metadata claim mencatat: waktu chat dibuat, jumlah pesan (future: tampilkan di admin tanpa baca isi)
- Jika dispute, admin bisa escalate ke manual review dengan akses chat (fitur admin read-only chat bisa ditambah nanti)

### Risiko 3: Fraud Claimant Pintar Menjawab
**Skenario:** Fraud tahu detail barang dari ngobrol dengan orang lain.

**Mitigasi:**
- Penemu wajib tanya detail yang **tidak ada di foto dan deskripsi publik**
- Admin lihat foto side-by-side, jika tidak cocok → reject
- Future: require foto selfie claimant + barang saat serah terima

---

## Edge Cases

### 1. Pemilik Tidak Punya Laporan Hilang
**Handling:** API reject claim dengan error "Anda harus membuat laporan hilang terlebih dahulu."

UI hint di form claim: "Pastikan Anda sudah melaporkan barang hilang."

### 2. Penemu Tidak Respond di Chat
**Handling:**
- Pemilik bisa escalate via admin (tombol "Hubungi Admin" di chat)
- Admin manual reach out ke penemu (via FCM / WhatsApp)
- Timeout claim: jika tidak ada response 7 hari, admin bisa auto-reject atau manual review

### 3. Multiple Claim ke Satu Barang Temuan
**Handling:**
- Semua claimant dapat conversation terpisah dengan penemu
- Penemu verifikasi satu per satu
- Admin lihat semua claim, putuskan yang paling valid
- Claim yang tidak diterima dapat status `rejected`

### 4. Chat Berisi Abuse/Spam
**Handling:**
- Button "Laporkan Pesan" di chat (future: flagging system)
- Admin bisa block user jika abuse berulang (`users.blocked = true`)
- Auto-moderate kata kasar (future: filter profanity)

---

## Perubahan dari Konsep Lama

**Dihapus:**
- Kolom `lost_reports.verification_question`, `lost_reports.verification_answer`
- Kolom `claims.verification_answer_attempt`
- Logic auto-match jawaban verifikasi
- Admin view untuk "Jawaban cocok/tidak"

**Ditambah:**
- Constraint `claims.lost_report_id NOT NULL`
- Auto-create conversation saat claim dibuat
- Banner tips verifikasi di chat screen (UI only, no DB change)

**Tetap sama:**
- Admin approve/reject flow
- FCM notification
- Foto bukti transfer (sudah ada di [[Foto Bukti Transfer - Lost&Found]])

---

## Implementation Tasks

### 1. Backend (Laravel)
**ClaimController::store()** — tambah validasi `lost_report_id` required:
```php
$validated = $request->validate([
    'lost_report_id' => 'required|uuid|exists:lost_reports,id',
    'found_report_id' => 'required|uuid|exists:found_reports,id',
    'reason' => 'required|string|min:10|max:1000',
]);

// Pastikan claimant adalah pemilik laporan hilang
$lostReport = LostReport::findOrFail($validated['lost_report_id']);
if ($lostReport->reporter_id !== auth()->id()) {
    return response()->json(['error' => 'Anda bukan pemilik laporan hilang ini'], 403);
}

$claim = Claim::create($validated + ['claimant_id' => auth()->id()]);

// Auto-create conversation
Conversation::firstOrCreate([
    'claim_id' => $claim->id,
    'user1_id' => $claim->claimant_id,
    'user2_id' => $claim->foundReport->reporter_id,
]);

// FCM notification ke penemu
$this->notifyFinder($claim);
```

**Migration:** Hapus kolom verifikasi (nanti dikerjakan Coding Agent, cukup catat di DailyChanges).

### 2. Flutter UI
**ClaimFormScreen:**
- Tambah dropdown "Pilih Laporan Hilang Anda":
```dart
DropdownButtonFormField<String>(
  items: myLostReports.map((r) => DropdownMenuItem(
    value: r.id,
    child: Text('${r.title} (${r.lostDate})'),
  )).toList(),
  onChanged: (value) => setState(() => selectedLostReportId = value),
  validator: (value) => value == null ? 'Pilih laporan hilang' : null,
)
```

- Submit claim → auto redirect ke chat screen:
```dart
final response = await claimService.createClaim(...);
if (response.success) {
  final conversationId = response.data['conversation_id'];
  Navigator.push(context, MaterialPageRoute(
    builder: (_) => ChatScreen(conversationId: conversationId),
  ));
}
```

**ChatScreen (untuk penemu):**
- Banner tips jika user adalah penemu:
```dart
if (currentUserId == conversation.foundReport.reporterId) {
  Container(
    padding: EdgeInsets.all(12),
    color: Colors.orange.shade100,
    child: Row(
      children: [
        Icon(Icons.lightbulb, color: Colors.orange),
        SizedBox(width: 8),
        Expanded(child: Text(
          'Tips Verifikasi: Tanyakan detail yang tidak terlihat di foto (warna dalam, isi kartu, password lock, dll)',
          style: TextStyle(fontSize: 12),
        )),
      ],
    ),
  ),
}
```

### 3. Admin Dashboard (Filament)
Tidak ada perubahan besar. Admin tetap lihat:
- Foto side-by-side (lost vs found)
- Alasan claim
- Metadata (tanggal, lokasi)

**Future enhancement (optional):** Tampilkan metadata chat (waktu dibuat, jumlah pesan) tanpa baca isi:
```php
TextEntry::make('conversation.created_at')
    ->label('Chat Dimulai')
    ->dateTime(),

TextEntry::make('conversation.messages_count')
    ->label('Jumlah Pesan')
    ->getStateUsing(fn ($record) => $record->conversation?->messages()->count() ?? 0),
```

---

## Testing Strategy

**Unit Test:**
- `ClaimController::store()` dengan `lost_report_id` null → validation error
- `ClaimController::store()` dengan `lost_report_id` milik user lain → 403 Forbidden
- Conversation auto-create saat claim dibuat

**Feature Test:**
- POST `/api/claims` dengan `lost_report_id` valid → success, conversation created, FCM sent
- GET `/api/conversations` setelah claim → conversation exists dengan `claim_id` terisi

**Integration Test:**
- User A buat lost_report → User B buat found_report → User A claim → chat otomatis → User A + B chat → admin approve → foto bukti → status `returned`

**Manual Test:**
- Penemu lihat banner tips di chat
- Multiple claimant → masing-masing dapat conversation terpisah

---

## Estimasi Waktu

- Backend validation + auto-create conversation: **15 menit** (logic sudah ada di [[Real-Time Chat - Lost&Found]])
- Flutter dropdown laporan hilang + redirect ke chat: **20 menit**
- Flutter banner tips di chat: **10 menit**
- Testing (unit + feature): **15 menit**

**Total:** ~1 jam (kecil karena chat infra sudah ada)

---

## Next Steps

> Centang ✅ di bawah bersumber dari log DailyChanges yang sudah ada (bukan konfirmasi baru).

1. ✅ Plan selesai
2. ✅ Hapus 3 kolom verifikasi dari database (migration) — tercatat selesai di DailyChanges 2026-10-05
3. ✅ Update backend: validasi `lost_report_id` + cek kepemilikan (403) — tercatat selesai di DailyChanges 2026-10-06
4. ✅ Dropdown "Pilih Laporan Hilang Anda" di ClaimScreen — tercatat selesai di DailyChanges 2026-10-06
5. ✅ Metadata chat di admin (ClaimResource, 2026-10-06; tidak membaca isi chat)
6. ⬜ Banner tips + auto-create conversation + redirect ke chat (menunggu Real-Time Chat)
7. ⬜ Test end-to-end: claim → chat → admin approve → serah terima
8. ⬜ Monitor fraud rate (compare dengan baseline)

---

## Related Files

- **Project root:** `C:\Project\lostfound-backend` (GitHub: `Davinciz/lostfound-backend`, Private)
- **PRD:** [[PRD]]
- **Technical Reference:** [[TechnicalReference]]
- **Real-Time Chat Plan:** [[Real-Time Chat - Lost&Found]]
- **Foto Bukti Transfer Plan:** [[Foto Bukti Transfer - Lost&Found]]

---

#plan #lost-and-found #security #verification #chat #fraud-prevention
