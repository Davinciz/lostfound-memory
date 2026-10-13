---
type: plan
project: lost-found
status: active
priority: medium
updated: 2026-10-13
summary: Planning real-time chat in-app dengan Pusher (MVP) → Soketi migration path
---

# Real-Time Chat - Lost&Found

**Tanggal:** 2026-09-30  
**Project:** [[PBL]] Lost&Found  
**Status:** Planning  
**Priority:** Medium  

> **Status implementasi (2026-10-12):** tabel `conversations`/`messages` sudah ada di DB; Model, API, Pusher, UI belum.

> [!note] Contoh kode ilustratif
> Contoh kode di plan ini (mis. `Kernel.php`, `RouteServiceProvider`, `BROADCAST_DRIVER`) mengikuti struktur Laravel lama. Versi terpasang: **Laravel v13.32.0** dan **Filament 3.3.55**; contoh Filament harus memakai sintaks **Filament 3.x**. Verifikasi kompatibilitas via `composer.json`/`composer.lock`.

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

**Migrations:**
- `create_conversations_table`
- `create_messages_table`

**Models:**
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

1. ✅ Plan selesai
2. ⬜ Setup Pusher account (free tier)
3. ⬜ Implement backend (migrations, API, broadcasting)
4. ⬜ Implement Flutter (Pusher SDK, chat UI)
5. ⬜ Test multi-device real-time
6. ⬜ Integrate dengan claim flow
7. ⬜ Monitor Pusher usage → evaluate Soketi migration timing

---

## Related Files

- **Project root:** `C:\Project\lostfound-backend` (GitHub: `Davinciz/lostfound-backend`, Private)
- **PRD:** [[PRD]]
- **Technical Reference:** [[TechnicalReference]]
- **Master Buildings Plan:** [[Master Buildings + Auto Location - Lost&Found]]

---

#plan #lost-and-found #chat #real-time #pusher #soketi
