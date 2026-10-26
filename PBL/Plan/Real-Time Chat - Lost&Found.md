---
type: plan
project: lost-found
status: active
priority: high
updated: 2026-10-19
summary: Real-time chat Pusher (MVP) → Soketi; Fase 1 backend merge, UI chat teruji 1 HP 2 akun; usulan kartu konteks chat
---

# Real-Time Chat - Lost&Found

**Tanggal:** 2026-09-30  
**Project:** [[PBL]] Lost&Found  
**Status:** Planning  
**Priority:** High  

> **Status implementasi (2026-10-18):**
> - **Sudah ada:** tabel `conversations` & `messages` di DB; model `Conversation` & `Message` di `app/Models`. `Conversation` berelasi ke `user1`, `user2`, `claim`, `lostReport`, `foundReport` dan `hasMany` messages; `Message` berelasi ke conversation & sender.
> - **Fase 1 backend SELESAI & merge (2026-10-18):** merge ke `develop` via PR #4 (squash), commit develop `fb256f9`; branch asal `feature/chat/realtime-api` (3 commit: `2367926`, `669466b`, `8141719`). `php artisan test` di develop: **132 lulus** (sebelumnya 108). Migration index ter-apply di DB dev. Paket baru `pusher/pusher-php-server`; factory baru `Claim`, `Conversation`, `FoundReport`, `LostReport`, `Message`. Rincian kontrak ada di §Backend API-as-built di bawah.
> - **Tes manual 2026-10-18 (laporan user):** chat diuji di **1 HP dengan 2 akun berbeda**; UI Flutter (list percakapan + kirim/terima pesan) sudah dipakai; **kirim/terima pesan realtime antar dua user berhasil**; belum menemukan bug. Belum diuji: dedup pengirim, mark-read, penolakan non-peserta (403), reconnect saat app dibuka kembali, dan tes dua perangkat fisik.
> - **Belum ada:** integrasi claim/FCM (Fase 3), evaluasi Pusher (Fase 4), dan kepastian broadcast lewat **Pusher asli** (key/app Pusher sudah disiapkan user, tetapi user belum yakin driver yang dipakai saat tes). Branch/commit/merge untuk UI Flutter belum dilaporkan.

> [!warning] Akan berubah (revisi 2026-10-19, disetujui, belum diimplementasi)
> Conversation dari claim harus dibuat **per `claim_id`**, bukan per pasangan user. Saat ini `ConversationController::store()` jalur `other_user_id` mencari per pasangan user (partial unique index `conversations_user_pair_unique`), sehingga chat ke penemu yang sama membuka percakapan lama dengan konteks laporan pertama — dugaan bug "tidak bisa claim ke akun yang sama meski beda laporan". Chat sebelum claim tetap per pasangan. Daftar chat wajib menampilkan kartu konteks laporan. Lihat [[Claim Dua Arah dan Serah Terima oleh Pengguna - Lost&Found]] §Revisi 2026-10-19 bagian B. **Sumber tunggal aturan ini:** [[Claim Langsung ke Laporan Target - Lost&Found]] (§`ConversationController` cabang `claim_id` — tahan NULL).

> [!note] Contoh kode ilustratif
> Contoh kode di plan ini (mis. `Kernel.php`, `RouteServiceProvider`, `BROADCAST_DRIVER`) mengikuti struktur Laravel lama. Versi terpasang: **Laravel v13.32.0** dan **Filament 3.3.55**; contoh Filament harus memakai sintaks **Filament 3.x**. Verifikasi kompatibilitas via `composer.json`/`composer.lock`.
>
> Di Laravel 11+ nama env yang dipakai adalah **`BROADCAST_CONNECTION`** (bukan `BROADCAST_DRIVER`). **Terkonfirmasi 2026-10-18:** implementasi Fase 1 memakai `BROADCAST_CONNECTION`; `.env.example` default `log`, dev memakai `pusher`; `PUSHER_APP_CLUSTER=ap1`. Nilai key/secret tidak ditulis di dokumen ini.
>
> Otorisasi channel dari Flutter memakai Bearer token Sanctum, jadi endpoint `/broadcasting/auth` harus dilindungi middleware **`auth:sanctum`**.

---

## Goal

Implement real-time chat in-app antara pelapor hilang & penemu barang untuk koordinasi pengembalian tanpa keluar ke WhatsApp.

---

## Konsep

User A (pemilik barang hilang) dan User B (penemu) bisa chat langsung dalam app setelah claim dibuat atau dari detail laporan. Message real-time via WebSocket dengan fallback polling.

---

## Tech Stack Decision

### Phase 1: Pusher (MVP)
**Why:** Zero infra setup, free tier cukup untuk testing/MVP, Laravel + Flutter SDK matang.

**Limits:**
- Free tier: 200k messages/day, 100 concurrent connections
- Cukup untuk ~500 users aktif/hari

### Phase 2: Soketi (Self-Hosted Migration)
**Why:** Pusher-compatible drop-in replacement, self-host, zero recurring cost.

**Migration:** Tinggal ganti `.env`, no code change (Pusher API compatible).

**Alternatives yang ditolak:**
- Firebase RTDB/Firestore: butuh duplicate data dari PostgreSQL, NoSQL learning curve
- WebSocket native: overkill untuk MVP, perlu manage server lifecycle

---

## Architecture

### 1. Chat Scope

**Conversations terbatas ke:**
- Antara pelapor barang hilang (`LostReport.reporter_id`) dan penemu (`FoundReport.reporter_id`) setelah claim dibuat
- Atau dari detail report (button "Chat dengan Pelapor")

**Tidak ada:**
- Group chat
- Chat dengan admin (admin pakai Filament dashboard, bukan mobile)

### 2. Data Model

> **Sudah ada** — tabel `conversations` & `messages` beserta model `Conversation` & `Message` sudah terpasang di DB/`app/Models` (lihat [[ERD]] / `schema.dbml`; diverifikasi user 2026-10-18). Skema di bawah adalah dokumentasi, **JANGAN diubah** di plan ini.

**Tabel `conversations`:**
```sql
id UUID PK
lost_report_id UUID FK -> lost_reports.id (nullable)
found_report_id UUID FK -> found_reports.id (nullable)
claim_id UUID FK -> claims.id (nullable)
user1_id UUID FK -> users.id
user2_id UUID FK -> users.id
created_at, updated_at
```

**Tabel `messages`:**
```sql
id UUID PK
conversation_id UUID FK -> conversations.id
sender_id UUID FK -> users.id
message TEXT NOT NULL
read_at TIMESTAMP (nullable)
created_at, updated_at
```

**Index:** `conversation_id`, `sender_id`, `created_at`

### 3. Chat Entry Points

**A. Dari Claim (primary flow):**
1. User A (pemilik) ajukan claim ke found_report (wajib pilih laporan hilangnya sendiri, sesuai [[Verifikasi via Chat - Lost&Found]])
2. System auto-create `conversation` dengan `user1_id = A`, `user2_id = penemu`, `claim_id = X`
3. Notifikasi FCM ke penemu: "Ada claim baru, chat untuk verifikasi kepemilikan"
4. Chat digunakan untuk verifikasi kepemilikan — penemu tanya detail, pemilik jawab. Banner tips muncul untuk penemu.
5. Admin tidak punya akses chat (read-only chat tidak dibuat)

**B. Dari Detail Report (direct):**
1. User A buka detail `FoundReport` (atau `LostReport`)
2. Klik "Chat dengan Pelapor"
3. System cari atau create `conversation` antara A dan reporter
4. Mulai chat

### 4. Real-Time Flow

**Backend (Laravel):**
```php
// Kirim message
$message = Message::create([...]);
broadcast(new MessageSent($message))->toOthers();
```

**Broadcasting config:**
```env
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=xxx
PUSHER_APP_KEY=xxx
PUSHER_APP_SECRET=xxx
PUSHER_APP_CLUSTER=ap1
```

**Frontend (Flutter):**
```dart
// Subscribe ke channel
final pusher = PusherChannelsFlutter.getInstance();
final channel = await pusher.subscribe(
  channelName: 'private-conversation.${conversationId}'
);
channel.bind('MessageSent', (event) {
  // Update UI dengan message baru
});
```

---

## Implementation Tasks

### 1. Database Layer

> **Sudah selesai (2026-10-18):** migrasi `conversations` & `messages` dan model `Conversation`/`Message` beserta relasinya sudah ada. Yang belum: route, controller, event, channel auth, integrasi Pusher, UI Flutter.

**Migrations (sudah ada):**
- `create_conversations_table`
- `create_messages_table`

**Models (sudah ada):**
- `Conversation` — hasMany messages, belongsTo users (user1, user2), belongsTo claim/reports
- `Message` — belongsTo conversation, belongsTo sender (User)

**Relations:**
```php
// Conversation
public function messages() { return $this->hasMany(Message::class); }
public function user1() { return $this->belongsTo(User::class, 'user1_id'); }
public function user2() { return $this->belongsTo(User::class, 'user2_id'); }

// Message
public function conversation() { return $this->belongsTo(Conversation::class); }
public function sender() { return $this->belongsTo(User::class, 'sender_id'); }
```

---

### 2. Backend API

**POST `/api/conversations`** — create atau get existing conversation
- Body: `{"other_user_id": "uuid"}` atau `{"claim_id": "uuid"}`
- Return: conversation object dengan participants

**GET `/api/conversations`** — list user's conversations
- Return: array conversation dengan last_message, unread_count, other_user info

**GET `/api/conversations/{id}/messages`** — fetch message history
- Query: `?limit=50&before_id=xxx` (pagination)
- Return: array messages, sorted by created_at desc

**POST `/api/conversations/{id}/messages`** — send message
- Body: `{"message": "text"}`
- Side effect: broadcast ke Pusher channel `private-conversation.{id}`
- Return: message object

**PATCH `/api/messages/{id}/read`** — mark message as read
- Update `read_at` timestamp
- Broadcast read receipt (optional)

---

### 3. Pusher Setup (Backend)

**Install:**
```bash
composer require pusher/pusher-php-server
```

**Config `config/broadcasting.php`:**
```php
'pusher' => [
    'driver' => 'pusher',
    'key' => env('PUSHER_APP_KEY'),
    'secret' => env('PUSHER_APP_SECRET'),
    'app_id' => env('PUSHER_APP_ID'),
    'options' => [
        'cluster' => env('PUSHER_APP_CLUSTER'),
        'encrypted' => true,
    ],
],
```

**Event:** `app/Events/MessageSent.php`
```php
class MessageSent implements ShouldBroadcast
{
    public function __construct(public Message $message) {}
    
    public function broadcastOn()
    {
        return new PrivateChannel('conversation.' . $this->message->conversation_id);
    }
}
```

**Auth channel:** `routes/channels.php`
```php
Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    $conversation = Conversation::find($conversationId);
    return $conversation && (
        $conversation->user1_id === $user->id || 
        $conversation->user2_id === $user->id
    );
});
```

---

### 4. Flutter Integration

**Install:**
```yaml
dependencies:
  pusher_channels_flutter: ^2.2.1
```

**Init Pusher:**
```dart
final pusher = PusherChannelsFlutter.getInstance();
await pusher.init(
  apiKey: PUSHER_APP_KEY,
  cluster: PUSHER_APP_CLUSTER,
  onAuthorizer: (channelName, socketId, options) async {
    final response = await http.post(
      '$API_BASE/broadcasting/auth',
      headers: {'Authorization': 'Bearer $token'},
      body: {'socket_id': socketId, 'channel_name': channelName},
    );
    return response.body;
  },
);
await pusher.connect();
```

**Subscribe & Listen:**
```dart
final channel = await pusher.subscribe(
  channelName: 'private-conversation.$conversationId',
  onEvent: (event) {
    if (event.eventName == 'MessageSent') {
      final message = Message.fromJson(jsonDecode(event.data));
      // Update UI
    }
  },
);
```

**Send Message:**
```dart
final response = await http.post(
  '$API_BASE/conversations/$conversationId/messages',
  headers: {'Authorization': 'Bearer $token'},
  body: {'message': messageText},
);
// Pusher broadcast otomatis dari backend
```

---

### 5. UI/UX Flow (Flutter)

**ConversationListScreen:**
- List conversations dengan avatar, nama, last message preview, unread badge
- Pull-to-refresh
- Tap → buka ChatScreen

**ChatScreen:**
- Message list (reverse scroll, bottom = newest)
- Input box + send button
- Real-time append message saat event `MessageSent` datang
- Typing indicator (optional, phase 2)
- Read receipts (optional, phase 2)

**Entry Points:**
- Bottom nav "Chats" tab
- Detail LostReport/FoundReport → button "Chat dengan Pelapor"
- Notification FCM → deep link ke ChatScreen

---

### 6. Integration dengan Existing Features

**A. Auto-create conversation saat claim dibuat:**
```php
// ClaimController::store()
$claim = Claim::create([...]);

$conversation = Conversation::firstOrCreate([
    'claim_id' => $claim->id,
    'user1_id' => $claim->claimant_id,
    'user2_id' => $foundReport->reporter_id,
]);

// Kirim FCM notifikasi ke penemu
```

**B. FCM notification dengan deep link:**
```php
$notification = [
    'title' => 'Pesan baru dari ' . $sender->name,
    'body' => Str::limit($message->message, 50),
    'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
    'data' => [
        'type' => 'chat',
        'conversation_id' => $conversationId,
    ],
];
```

**Flutter handle deep link:**
```dart
FirebaseMessaging.onMessageOpenedApp.listen((message) {
  if (message.data['type'] == 'chat') {
    navigateToChatScreen(message.data['conversation_id']);
  }
});
```

---

## Migration Path: Pusher → Soketi

**Kapan migrasi:**
- Saat hit Pusher free tier limit (100 concurrent connections / 200k msg/day)
- Atau saat production deploy & mau cut recurring cost

**Steps:**
1. Setup Soketi server (Docker/VPS):
   ```bash
   docker run -p 6001:6001 -p 9601:9601 \
     -e SOKETI_DEFAULT_APP_ID=app-id \
     -e SOKETI_DEFAULT_APP_KEY=app-key \
     -e SOKETI_DEFAULT_APP_SECRET=app-secret \
     quay.io/soketi/soketi:latest-16-alpine
   ```

2. Update Laravel `.env`:
   ```env
   PUSHER_HOST=soketi.yourdomain.com
   PUSHER_PORT=6001
   PUSHER_SCHEME=https
   ```

3. Update Flutter Pusher config:
   ```dart
   await pusher.init(
     apiKey: PUSHER_APP_KEY,
     cluster: '', // kosongkan
     host: 'soketi.yourdomain.com',
     wsPort: 6001,
     wssPort: 6001,
   );
   ```

4. Test, deploy. **Zero code change.**

---

## Risks & Tradeoffs

### Risks
1. **Pusher free tier limit** — 100 concurrent users cukup untuk testing, tapi perlu monitor usage
2. **Mobile background connection** — WebSocket disconnect saat app background, perlu reconnect logic + FCM fallback
3. **Message history storage** — PostgreSQL bisa jadi bottleneck kalau chat volume tinggi (mitigasi: index, pagination ketat)

### Tradeoffs
- **Pusher vs Self-Host:** Pusher = zero effort setup, Soketi = zero cost tapi perlu manage server
- **Real-time vs Polling:** WebSocket efficient tapi perlu handle reconnect, polling simple tapi battery drain

---

## Open Questions

1. **Attachment support?** — Kirim foto dalam chat? (Phase 2, need file upload flow)
2. **Online status?** — Presence channel untuk "User sedang online"? (Phase 2, Pusher presence channel)
3. **Delete message?** — Soft delete atau hard delete? (Phase 2)
4. **Chat history retention?** — Hapus message older than 30 hari? (Discuss dengan stakeholder)

---

## Open Items — USULAN (belum diputuskan, 2026-10-18)

> Semua di bawah ini usulan, **belum diputuskan**. Tidak ada yang dikerjakan tanpa persetujuan user.

1. **Route ganda `/broadcasting/auth`** — otomatis dari `withRouting(channels:)` + manual `Broadcast::routes` di `api.php`. Usul: rapikan dengan `withBroadcasting(prefix: 'api', middleware: ['api', 'auth:sanctum'])`. **Prioritas low.**
2. **`index()` conversations N+1 query** — usul optimasi eager-load/agregat.
3. **Endpoint mark-read massal** — sekarang satu panggilan per percakapan; usul satu endpoint massal.
4. **Chat read-only berdasar status claim + user terblokir masih bisa kirim pesan** — usul dikerjakan di [[Claim Dua Arah dan Serah Terima oleh Pengguna - Lost&Found]] / Fase 3.
5. **FCM notifikasi pesan baru + deep link** — belum ada; usul Fase 3.
6. **`GET /api/search` belum punya `limit`/pagination** — usul tambahkan limit/pagination. **Prioritas low.**
7. **`ConversationController::index` memakai `orWhere` tanpa group** — usul dibungkus satu grup `where()`; digabung dengan usulan (2) optimasi N+1. **Prioritas low.**
8. **Dropdown "Laporan hilang kamu" di mobile hanya memuat 20 laporan pertama** (`GET /lost-reports` default `per_page`) — sebagian laporan hilang user tidak muncul di pilihan; usul kirim `status=pending` (+ opsi `mine=1`/pagination). **Prioritas low.** Lihat [[Backlog Perbaikan Lanjutan - Lost&Found]] item (ix).
9. **Tes manual lanjutan** — dedup pengirim, mark-read, penolakan non-peserta (403), reconnect saat app dibuka kembali, dan tes dua perangkat fisik (baru 1 HP 2 akun).
10. **Kartu konteks di ruang chat** — usul menambah field `context` di respons `GET /api/conversations` dan kartu pinned di `ChatScreen` (lihat §Kartu Konteks di Ruang Chat). Bukan plan terpisah; masuk Fase 2/3 plan ini. **Belum diputuskan.**

---

## Testing Strategy

**Unit Test:**
- ConversationController: create/get conversation, authorization
- MessageController: send/read message, pagination
- Broadcasting: event dispatch ke Pusher

**Integration Test:**
- Create claim → auto-create conversation
- Send message → broadcast event → Flutter receive
- Reconnect setelah disconnect

**Manual Test:**
- Multi-device: User A (device 1) kirim, User B (device 2) terima real-time
- Background/foreground: app background → message masuk → FCM notification → open app → sync message

**Sudah dilakukan (2026-10-18):** 1 HP dengan 2 akun berbeda — pesan realtime antar dua user berhasil, belum ada bug. **Sisa:** dua perangkat fisik, background/foreground + FCM, dedup pengirim, mark-read, non-peserta (403).

---

## Estimasi Waktu

- Database layer (migrations, models, relations): **15 menit**
- API endpoints (CRUD + auth): **30 menit**
- Pusher setup (Laravel broadcast + event): **20 menit**
- Flutter integration (init Pusher, subscribe, UI): **1 jam**
- Integration dengan claim flow: **15 menit**
- Testing (unit + integration + manual): **30 menit**

**Total:** ~2.5-3 jam (solo developer, belum UI polish)

---

## Next Steps

> Fase dikerjakan berurutan. Centang HANYA yang sudah terbukti selesai (commit/merge/hasil tes yang dilaporkan). Saat ini yang terbukti: plan, tabel, dan model.

- [x] Plan + tabel `conversations`/`messages` + model `Conversation`/`Message` (diverifikasi user 2026-10-18).
- [x] **Fase 0 — [Manual user] Setup Pusher:** user menyatakan **sudah menyiapkan key Pusher** (disimpan di `.env`/config lokal — nilai tidak ditulis di vault, cluster `ap1`). **Sisa:** memastikan tes benar-benar berjalan lewat **Pusher asli** (user belum yakin driver yang dipakai) dan tes dengan **dua HP** — tes 2026-10-18 hanya 1 HP dengan 2 akun.
- [x] **Fase 1 — Backend SELESAI & merge (2026-10-18)** (branch `feature/chat/realtime-api` → merge ke `develop` via PR #4 squash, commit develop `fb256f9`; `php artisan test` di develop **132 lulus**, sebelumnya 108; migration index ter-apply di DB dev). Rincian kontrak ada di **§Backend API-as-built** di bawah.
- [ ] **Fase 2 — Flutter** (branch `feature/chat/chat-ui`): `pusher_channels_flutter`; `ConversationListScreen`, `ChatScreen`; tab **Chats**; tombol "Chat dengan Pelapor"; reconnect + sinkron pesan saat app dibuka kembali.
	- [x] **Teruji manual (user, 2026-10-18):** UI chat (list percakapan + kirim/terima pesan) berjalan; pesan realtime antar dua user berhasil di **1 HP, 2 akun berbeda**; belum ada bug.
	- [ ] Belum dilaporkan: branch/commit/merge Flutter, tab **Chats**, tombol "Chat dengan Pelapor", reconnect + sinkron pesan saat app dibuka kembali.
- [ ] **Fase 3 — Integrasi:** auto-create conversation by `claim_id` di `ClaimController::store()`; redirect ke chat setelah claim; FCM deep link → ChatScreen; banner tips verifikasi; test dua HP.
	- [ ] **USULAN — Kartu konteks di ruang chat** (belum diputuskan): lihat §Kartu Konteks di Ruang Chat di bawah. Backend hanya menambah field `context` di respons `GET /api/conversations` (**bukan skema DB**); Flutter menampilkan kartu pinned. **Tahap 1 read-only**; tombol aksi menunggu endpoint [[Claim Dua Arah dan Serah Terima oleh Pengguna - Lost&Found]].
- [ ] **Fase 4 — Evaluasi:** pantau usage Pusher free tier → tentukan timing migrasi Soketi.

> [!note] Usulan alur integrasi (disetujui user 2026-10-18)
> Auto-create conversation di `ClaimController::store()` cukup mendukung `claim_id` dulu; penyesuaian peran pengaju/penerima (claim dua arah) dikerjakan di [[Claim Dua Arah dan Serah Terima oleh Pengguna - Lost&Found]].

---

## Backend API-as-built (Fase 1, merge 2026-10-18)

> Fakta terkonfirmasi user. Semua endpoint **`auth:sanctum`**. Admin tidak punya akses isi chat.

**Endpoint:**
- `POST /api/conversations` — body: `claim_id` **ATAU** (`other_user_id` + tepat satu dari `lost_report_id`/`found_report_id`; `other_user_id` harus pelapor laporan itu; tidak boleh diri sendiri). Find-or-create: **201** baru, **200** sudah ada.
- `GET /api/conversations` — daftar milik user: `id`, `other_user`, `last_message`, `unread_count`, `created_at`, `updated_at`.
- `GET /api/conversations/{id}/messages` — `limit` (default 50, maks 100), `before_id`. Kursor = `created_at` pesan acuan + `id` pembeda (id UUID tidak berurutan). Urutan terbaru dulu.
- `POST /api/conversations/{id}/messages` — body `message` (required, string, maks 2000); broadcast event.
- `PATCH /api/messages/{id}/read` — hanya penerima pesan.
- Non-peserta → **403**.
- `POST /api/broadcasting/auth` — `auth:sanctum` Bearer token; body `socket_id` + `channel_name`.

**Broadcasting:**
- Event `MessageSent`, nama siaran `"MessageSent"`, channel `private-conversation.{conversation_id}`.
- `implements ShouldBroadcastNow` — tanpa queue worker. Alasan: chat harus instan, MVP lebih sederhana; bisa diganti queue bila traffic besar.
- Pengirim **juga** menerima event (tanpa `toOthers`) → klien dedup berdasarkan `id` pesan.
- Payload: `id`, `conversation_id`, `sender_id`, `message`, `read_at`, `created_at`, `updated_at`, `sender{id,name,email}`.

**Keputusan:**
- Data user di response chat memakai **`UserResource`**: hanya `id`, `name`, `email` (`whatsapp`, `nim`, `role`, `blocked` tidak dikirim).
- Cabang claim: `user1_id` = pelapor laporan hilang, `user2_id` = pelapor laporan temuan; **422** bila keduanya sama.
- Chat langsung wajib menyertakan laporan (tepat satu `lost_report_id`/`found_report_id`).

**Migration & dependensi:**
- Migration baru `2026_10_18_071626_add_conversation_indexes` — partial unique index `conversations(claim_id) WHERE claim_id IS NOT NULL`; partial unique index `conversations(user1_id, user2_id) WHERE claim_id IS NULL` (pasangan user dinormalisasi min/max untuk chat langsung); index `messages(conversation_id, created_at)`. **Tidak ada kolom/tabel baru.**
- Paket baru: `pusher/pusher-php-server`. Factory baru: `Claim`, `Conversation`, `FoundReport`, `LostReport`, `Message`.

---

## Kartu Konteks di Ruang Chat — USULAN (belum diputuskan, 2026-10-18)

> Gaya "kartu konteks" seperti ruang chat Marketplace Facebook. **Usulan user, belum diputuskan**; belum ada kode, endpoint, atau skema yang dibuat.

**Kenapa:** `GET /api/conversations` sekarang hanya mengembalikan `id`, `other_user`, `last_message`, `unread_count`, `created_at`, `updated_at`. User yang membuka chat tidak tahu ini percakapan soal barang apa dan sudah sejauh mana claim-nya.

**Usulan backend (field respons, BUKAN skema DB):**

Tambahkan objek `context` di respons `GET /api/conversations` (dan konsisten untuk `GET /api/conversations/{id}/messages` bila perlu):

- `claim`: `{ id, status }` — `status` salah satu `pending | accepted | returned | rejected | withdrawn`
- `laporan terkait`: `{ id, nama barang, foto, kode, status }` — kode `LST-YYMMDD-XXXX` / `FND-YYMMDD-XXXX`, `status` salah satu `pending | claimed | returned | closed`

Tidak ada kolom/tabel baru; cukup eager-load relasi yang sudah ada (`claim`, `lostReport`, `foundReport`). Ini juga menghapus sebagian kebutuhan N+1 (open item 2).

**Usulan Flutter:**

- Kartu **pinned** di atas daftar pesan `ChatScreen`: foto kecil, nama barang, kode, badge status claim; tap → layar detail laporan/claim yang sudah ada.
- Menimpa/memperluas "kartu mini barang terkait" di [[Design]] §5.15.

**Batasan yang disepakati (untuk ditulis sebagai usulan):**

- **Tahap 1 read-only** — kartu hanya menampilkan informasi; tahap 1 bisa masuk Fase 2 begitu `ChatScreen` stabil.
- Tombol aksi (**"Barang Sudah Diserahkan"**, **"Batalkan Claim"**) **menunggu endpoint** di [[Claim Dua Arah dan Serah Terima oleh Pengguna - Lost&Found]] (Fase 3) — jangan dikerjakan di sini.
- **Jangan tampilkan `reason`/alasan claim** di kartu (isi chat dianggap area privat antara dua pihak; admin pun tidak membacanya).

**Belum diputuskan:** bentuk final payload `context`, siapa yang boleh melihat kartu (kedua pihak? penemu saja?), perilaku kartu saat claim `rejected`/`withdrawn`/dibekukan ([[Claim Dua Arah dan Serah Terima oleh Pengguna - Lost&Found]] §3).

---

## Konvensi Git untuk Pengerjaan

Merujuk [[TechnicalReference]] §15.3:

- Mulai dari branch `develop` (bukan `main`).
- Scope commit: `chat`.
- Format commit: `feat(chat): ...` (perubahan backend & Flutter).
- Merge ke `develop` lewat **PR squash**; branch fitur dihapus setelah merge.
- Repo wajib di Gitea kampus (HTTPS, Private) — lihat [[Adopsi GitFlow-lite & Migrasi ke Gitea - Lost&Found]].

---

## Related Files

- **Project root:** `C:\Project\lostfound-backend` (Gitea kampus: `git.informatikapolines.id/Daniel_Geovani/lostfound-backend`, Private, HTTPS)
- **Flutter mobile:** `C:\Project\lostfound-mobile` (Gitea kampus: `git.informatikapolines.id/Daniel_Geovani/lostfound-mobile`, Private, HTTPS)
- **PRD:** [[PRD]]
- **Technical Reference:** [[TechnicalReference]] — §15.3
- **Claim Dua Arah:** [[Claim Dua Arah dan Serah Terima oleh Pengguna - Lost&Found]] (dependency)
- **Push Notification:** [[Push Notification - Lost&Found]] (FCM pesan baru + deep link)
- **Nomor WhatsApp Pengguna:** [[Nomor WhatsApp Pengguna - Lost&Found]]
- **Verifikasi via Chat:** [[Verifikasi via Chat - Lost&Found]]
- **Master Buildings Plan:** [[Master Buildings + Auto Location - Lost&Found]]

---

#plan #lost-and-found #chat #real-time #pusher #soketi
