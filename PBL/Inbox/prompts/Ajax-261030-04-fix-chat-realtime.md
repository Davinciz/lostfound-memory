# Prompt Ajax-261030-04 — Fix Bug Chat Realtime

**ID:** Ajax-261030-04  
**Target:** flutter  
**Branch:** feature/chat/fix-message-realtime  
**Base:** develop  

---

## TUJUAN

Fix bug: pesan baru tidak muncul langsung di `ChatScreen` (halaman chat terbuka). User harus keluar dari page chat baru pesan muncul.

**Konteks:** Tes manual 2026-10-18 (1 HP 2 akun) realtime **berhasil**. Bug baru ketahuan sekarang setelah Ajax uji ulang. Kemungkinan: (1) bug sudah ada tapi tidak ketahuan waktu tes (hanya kirim dari page lain, tidak buka page saat pesan masuk), atau (2) ada perubahan kode setelah 2026-10-18 yang break listener.

---

## BACA DULU (read-only)

- **Plan:** `PBL\Plan\Real-Time Chat - Lost&Found.md` — §Backend API-as-built (event `MessageSent`, channel `private-conversation.{id}`, payload)
- **Kode chat:**
  - `lib/services/chat_service.dart` — Pusher init, subscribe channel, `_onEvent` handler parse `MessageSent` → `_messageController` stream
  - `lib/screens/chat/chat_screen.dart` — `_initialize()` subscribe + listen `messageStream` → `_handleIncomingMessage` → `setState(() => _store.merge([message]))`
  - `lib/services/message_store.dart` — dedup by id, sorted list
  - `lib/models/chat_message.dart` — model

---

## ANALISIS KODE SEKARANG

### ChatService (chat_service.dart)

- **Line 123-131:** `_onEvent(PusherEvent event)` — filter `eventName == 'MessageSent'`, parse JSON → `ChatMessage.fromJson(data)` → `_messageController.add(message)` ✓
- **Line 66-78:** `subscribe(conversationId)` — channel name `'private-conversation.$conversationId'` ✓
- **Stream:** `messageStream` expose `_messageController.stream` (broadcast) ✓

### ChatScreen (chat_screen.dart)

- **Line 63:** `await _chatService!.subscribe(widget.conversationId)` ✓
- **Line 64-68:** `_messageSubscription = _chatService!.messageStream.listen((message) { ... })` ✓
- **Line 65:** Filter `if (message.conversationId == widget.conversationId)` → hanya proses pesan untuk conversation ini
- **Line 114-121:** `_handleIncomingMessage(ChatMessage message)`:
  - Dedup: `if (_store.contains(message.id)) return;`
  - **Line 116:** `setState(() => _store.merge([message]));` — merge ke store + rebuild
  - `_scrollToBottom()`
  - Mark read bila bukan pengirim

**Kode sepertinya sudah benar.** Tapi bug tetap ada.

---

## KEMUNGKINAN PENYEBAB

1. **Event `MessageSent` tidak diterima client** — Pusher connection drop, channel tidak ter-subscribe, atau backend tidak broadcast
2. **Event diterima tapi filter gagal** — `message.conversationId != widget.conversationId` (format UUID berbeda? string vs UUID object?)
3. **`setState()` tidak trigger rebuild ListView** — `_store.merge()` return tapi widget tidak rebuild (mungkin reference `_store.sorted` tidak berubah?)
4. **Subscription hilang** — `ChatScreen` di-dispose/recreate saat pesan masuk (navigation state issue)
5. **Dedup terlalu agresif** — `_store.contains(message.id)` return true untuk pesan baru (mungkin id dari backend vs lokal berbeda?)

---

## DEBUG PLAN

### 1. Tambahkan log Pusher event

Di `chat_service.dart` `_onEvent`:

```dart
void _onEvent(PusherEvent event) {
  debugPrint('🔔 Pusher event: ${event.eventName}, channel: ${event.channelName}, data: ${event.data}');
  if (event.eventName != _newMessageEvent) return;
  try {
    final data = jsonDecode(event.data) as Map<String, dynamic>;
    final message = ChatMessage.fromJson(data);
    debugPrint('✅ Parsed message: id=${message.id}, conversationId=${message.conversationId}');
    _messageController.add(message);
  } catch (e) {
    debugPrint('❌ Parse MessageSent error: $e');
  }
}
```

### 2. Log di `ChatScreen._handleIncomingMessage`

Di `chat_screen.dart`:

```dart
void _handleIncomingMessage(ChatMessage message) {
  debugPrint('📥 Incoming message: id=${message.id}, conversationId=${message.conversationId}, myConversation=${widget.conversationId}');
  
  if (message.conversationId != widget.conversationId) {
    debugPrint('⚠️ Filtered out: conversation mismatch');
    return;
  }
  
  if (_store.contains(message.id)) {
    debugPrint('⚠️ Dedup: message already in store');
    return;
  }
  
  debugPrint('✅ Adding message to store + setState');
  setState(() => _store.merge([message]));
  _scrollToBottom();
  if (message.senderId != _currentUserId) {
    _markMessageAsRead(message.id);
  }
}
```

### 3. Log subscription di `ChatScreen._initialize`

Di `chat_screen.dart` `_initialize`:

```dart
await _chatService!.subscribe(widget.conversationId);
debugPrint('✅ Subscribed to channel: private-conversation.${widget.conversationId}');

_messageSubscription = _chatService!.messageStream.listen((message) {
  debugPrint('📨 messageStream event: id=${message.id}, conversationId=${message.conversationId}');
  if (message.conversationId == widget.conversationId) {
    _handleIncomingMessage(message);
  }
});
```

---

## UJI MANUAL

**Skenario 1: Pesan realtime saat page chat terbuka**

1. HP A login user A, buka `ChatScreen` conversation A-B (stay di page)
2. HP B login user B, buka conversation A-B, **kirim pesan**
3. **Expected:** Pesan muncul langsung di HP A tanpa keluar page
4. **Actual (bug):** Pesan tidak muncul; harus keluar page dulu baru muncul

**Skenario 2: Pesan realtime dari page lain**

1. HP A di `ConversationListScreen` (list conversation)
2. HP B kirim pesan ke A
3. **Expected:** Unread count bertambah (kalau ada), dan saat A buka conversation pesan sudah ada
4. Cek apakah ini jalan → untuk konfirmasi Pusher connection OK

**Skenario 3: Pesan dari diri sendiri (dedup)**

1. HP A buka `ChatScreen` A-B
2. HP A kirim pesan
3. **Expected:** Pesan muncul **sekali** (dedup via id), tidak dobel
4. Backend broadcast tanpa `toOthers()` → pengirim juga terima event

---

## LOG DEBUG YANG DICARI

Jalankan skenario 1, lalu cek log Flutter (via `flutter run` atau Android Studio logcat):

### ✅ Jika event diterima:

```
🔔 Pusher event: MessageSent, channel: private-conversation.abc-123, data: {...}
✅ Parsed message: id=msg-456, conversationId=abc-123
📨 messageStream event: id=msg-456, conversationId=abc-123
📥 Incoming message: id=msg-456, conversationId=abc-123, myConversation=abc-123
✅ Adding message to store + setState
```

→ Kode benar, tapi `setState()` tidak rebuild widget. **Cek:** apakah `_store.sorted` return reference baru? Atau coba `setState(() { _store.merge([message]); });` tanpa arrow return.

### ❌ Jika event tidak diterima:

Tidak ada log `🔔 Pusher event: MessageSent` → Pusher tidak terima event.

**Cek:**
1. `flutter run` console: ada log `Pusher state: ... -> CONNECTED`?
2. Backend: apakah broadcast jalan? Cek log Laravel (broadcast event `MessageSent`)
3. Channel name match: backend `PrivateChannel('conversation.X')` vs Flutter subscribe `private-conversation.$conversationId` → Pusher auto-prefix `private-` untuk private channel, jadi harusnya match

### ⚠️ Jika event diterima tapi filtered:

```
🔔 Pusher event: MessageSent, channel: private-conversation.abc-123, data: {...}
✅ Parsed message: id=msg-456, conversationId=abc-123
📨 messageStream event: id=msg-456, conversationId=abc-123
📥 Incoming message: id=msg-456, conversationId=XYZ-789, myConversation=abc-123
⚠️ Filtered out: conversation mismatch
```

→ `message.conversationId` berbeda dari `widget.conversationId`. **Cek:** format UUID (string `"abc-123"` vs UUID object?), atau backend mengirim field lain (`conversation_id` vs `conversationId` camelCase).

### ⚠️ Jika dedup false positive:

```
📥 Incoming message: id=msg-456, conversationId=abc-123, myConversation=abc-123
⚠️ Dedup: message already in store
```

→ `_store.contains(message.id)` return true padahal pesan baru. **Cek:** apakah `message.id` dari backend sama dengan yang di-save lokal setelah POST? Atau ada race condition (pesan dari POST API masuk store, lalu event Pusher datang dengan id sama → dedup).

---

## FIX KANDIDAT (setelah log debug)

### Fix 1: Force rebuild dengan key baru

Kalau `setState()` tidak rebuild, coba ganti `ListView.builder` pakai `key: ValueKey(_store.length)`:

```dart
ListView.builder(
  key: ValueKey(_store.length), // force rebuild saat length berubah
  reverse: true,
  itemCount: _store.length,
  ...
)
```

### Fix 2: Subscription per-channel (bukan global stream)

Kemungkinan kecil, tapi kalau `messageStream` broadcast global tidak trigger listener, coba subscribe langsung via `PusherChannel.bind`:

Di `chat_service.dart`, return `PusherChannel` dari `subscribe()`:

```dart
Future<PusherChannel?> subscribe(String conversationId) async {
  if (_subscribedIds.contains(conversationId)) return null;
  _subscribedIds.add(conversationId);

  if (!_initialized) return null;

  try {
    final channel = await _pusher.subscribe(
      channelName: 'private-conversation.$conversationId',
    );
    return channel;
  } catch (e) {
    debugPrint('Subscribe error: $e');
    return null;
  }
}
```

Lalu di `chat_screen.dart`, bind event langsung:

```dart
final channel = await _chatService!.subscribe(widget.conversationId);
if (channel != null) {
  await channel.bind(
    eventName: 'MessageSent',
    onEvent: (event) {
      final data = jsonDecode(event.data) as Map<String, dynamic>;
      final message = ChatMessage.fromJson(data);
      _handleIncomingMessage(message);
    },
  );
}
```

### Fix 3: Pastikan `_store.sorted` return list baru

Di `message_store.dart` `sorted`:

```dart
List<ChatMessage> get sorted {
  final list = _byId.values.toList(growable: false) // force new list
    ..sort((a, b) => a.createdAt.compareTo(b.createdAt));
  return list;
}
```

---

## VERIFIKASI FINAL

Setelah fix:

1. **flutter analyze** → 0 issues
2. **flutter test** → semua lulus (terutama `test/services/chat_service_test.dart` kalau ada)
3. **Uji manual skenario 1–3** (2 HP atau 1 HP 2 akun via emulator):
   - Pesan realtime muncul langsung di page chat terbuka ✓
   - Pesan dari diri sendiri tidak dobel ✓
   - Unread count update (kalau ada fitur) ✓
4. **Cek log:** tidak ada warning/error Pusher

---

## LAPORAN

Buat laporan `Ajax-261030-04-fix-chat-realtime.md` dengan:

- **Berubah:** file yang diubah + alasan
- **Verifikasi:** flutter analyze, test, uji manual 2 HP
- **Temuan:** root cause dari log debug (event tidak diterima? filter salah? setState tidak rebuild?)
- **Commit:** hash + pesan

Push branch + buat PR ke `develop`.

---

## CATATAN DOMINIC

Setelah PR merge, aku update:
- TechnicalReference §17 (bug realtime fixed)
- Progress board (kartu Real-Time Chat Fase 1 → open item resolved)
- Plan Real-Time Chat (status bug)
- DailyChanges 2026-10-30

---

**Prioritas:** High (blocker UX chat)  
**Estimasi:** 30-60 menit (debug log + fix)
