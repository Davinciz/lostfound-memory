---
type: plan
project: lost-found
status: active
updated: 2026-10-13
summary: Hardening keamanan aplikasi termasuk throttle Google SSO, perlindungan data, dan mitigasi penyalahgunaan
priority: medium
---

# Security Hardening - Lost&Found

**Tanggal:** 2026-09-30  
**Project:** [[PBL]] Lost&Found  
**Status:** Planning  
**Priority:** Medium  

> [!note] Contoh kode ilustratif
> Contoh kode di plan ini (mis. `Kernel.php`, `RouteServiceProvider`, `BROADCAST_DRIVER`) mengikuti struktur Laravel lama. Versi terpasang: **Laravel v13.32.0** dan **Filament 3.3.55**; contoh Filament harus memakai sintaks **Filament 3.x**. Verifikasi kompatibilitas via `composer.json`/`composer.lock`.

---

## Goal

Harden security layer untuk protect dari spam report, abuse, data breach, dan attack vectors umum.

---

## Security Threats

### 1. **Spam Report**
User jahat flood system dengan fake lost/found reports.

### 2. **Brute Force Login**
Attacker coba guess password dengan automated login attempts.

### 3. **Inappropriate Image Upload**
User upload foto pornografi/kekerasan di report.

### 4. **Data Scraping**
Bot scrape semua data report via API tanpa rate limit.

### 5. **Privacy Breach**
User data (email, phone, FCM token) exposed via API bug.

### 6. **Account Takeover**
Attacker guess/steal token, access user account.

---

## Security Layers

## Layer 1: Rate Limiting

### API Rate Limits

**Laravel Middleware:** `throttle` built-in

**Limits:**
```php
// routes/api.php
Route::middleware('throttle:60,1')->group(function () {
    // Guest endpoints: 60 req/min per IP
    Route::post('/auth/google', ...); // Google SSO; backend validates token and exact domain allowlist. Aktual: 30 permintaan/menit per IP (2026-10-10).
});

Route::middleware('auth:sanctum', 'throttle:120,1')->group(function () {
    // Authenticated endpoints: 120 req/min per user
    Route::get('/lost-reports', ...);
    Route::get('/found-reports', ...);
    Route::get('/search', ...);
});

Route::middleware('auth:sanctum', 'throttle:10,1')->group(function () {
    // Write operations: 10 req/min per user
    Route::post('/lost-reports', ...);
    Route::post('/found-reports', ...);
    Route::post('/claims', ...);
});
```

**Custom Rate Limiter (per-user per-action):**

```php
// app/Providers/RouteServiceProvider.php
RateLimiter::for('report-create', function (Request $request) {
    return Limit::perMinute(3)->by($request->user()->id); // Max 3 reports/min
});

RateLimiter::for('claim-create', function (Request $request) {
    return Limit::perMinute(5)->by($request->user()->id); // Max 5 claims/min
});
```

**Apply:**
```php
Route::post('/lost-reports', [LostReportController::class, 'store'])
    ->middleware('throttle:report-create');

Route::post('/claims', [ClaimController::class, 'store'])
    ->middleware('throttle:claim-create');
```

**Response saat rate limit exceeded:**
```json
{
  "message": "Too many requests. Please wait a moment.",
  "retry_after": 60
}
```

---

## Layer 2: CAPTCHA (Registration & Sensitive Actions) — Tidak Relevan untuk SSO

> Catatan: CAPTCHA registrasi dan CAPTCHA setelah login gagal berulang tidak relevan untuk login user berbasis Google SSO. Konten lama dipertahankan sebagai riwayat; jangan implementasikan untuk alur auth aktif.

### Google reCAPTCHA v3

**Use case:**
- Registration (prevent bot accounts)
- Login after 3 failed attempts
- Report creation after suspicious activity detected

**Backend Validation:**

```php
// app/Services/CaptchaService.php
class CaptchaService
{
    public function verify(string $token): bool
    {
        $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
            'secret' => config('services.recaptcha.secret'),
            'response' => $token,
        ]);
        
        $result = $response->json();
        
        return $result['success'] && $result['score'] >= 0.5; // Min score 0.5
    }
}
```

**Controller:**
```php
public function register(Request $request, CaptchaService $captcha)
{
    $validated = $request->validate([
        'captcha_token' => 'required|string',
        // ... other fields
    ]);
    
    if (!$captcha->verify($validated['captcha_token'])) {
        return response()->json(['error' => 'CAPTCHA verification failed'], 422);
    }
    
    // Proceed registration
}
```

**Flutter Integration:**
```yaml
dependencies:
  flutter_recaptcha_v3: ^0.2.0
```

```dart
final recaptcha = FlutterRecaptchaV3(siteKey: RECAPTCHA_SITE_KEY);
final token = await recaptcha.execute('register');

final response = await http.post(
  Uri.parse('$API_BASE/auth/register'),
  body: {
    'captcha_token': token,
    // ... other fields
  },
);
```

---

## Layer 3: Image Moderation

**Goal:** Detect inappropriate content sebelum foto di-publish.

> **Catatan (2026-10-12):** Foto diupload via `POST /api/photos/upload` (`PhotoController`, maks 2 MB, disk `public` folder `reports/`), bukan di `store()`. Hook moderasi harus di `PhotoController::upload`; contoh `photos.*` `max:5120` di `store()` tidak berlaku.

### Antrean Review Manual (Pendekatan Terpilih — keputusan user 2026-10-13)

- Foto upload → status `pending_review`.
- Admin review di Filament dashboard → approve/reject.
- Auto-approve setelah 24 jam jika tidak di-review.
- Dipilih karena tidak butuh kartu kredit internasional (batasan project).
- **Catatan desain data:** kolom/status moderasi diputuskan saat implementasi; belum ada kolom/tabel baru di ERD/schema.

### Alternatif (tidak dipakai): AWS Rekognition / Google Cloud Vision

> Tidak dipakai: butuh akun AWS berkartu kredit internasional. Kode di bawah hanya referensi.

**Implementation (contoh ilustratif):**

```php
// app/Services/ImageModerationService.php
use Aws\Rekognition\RekognitionClient;

class ImageModerationService
{
    protected $client;
    
    public function __construct()
    {
        $this->client = new RekognitionClient([
            'version' => 'latest',
            'region' => config('services.aws.region'),
            'credentials' => [
                'key' => config('services.aws.key'),
                'secret' => config('services.aws.secret'),
            ],
        ]);
    }
    
    public function isSafe(string $imageUrl): bool
    {
        $result = $this->client->detectModerationLabels([
            'Image' => ['Bytes' => file_get_contents($imageUrl)],
            'MinConfidence' => 75, // 75% confidence threshold
        ]);
        
        $labels = $result['ModerationLabels'];
        
        // Block if any of these labels detected
        $blockedCategories = ['Explicit Nudity', 'Violence', 'Hate Symbols'];
        
        foreach ($labels as $label) {
            if (in_array($label['ParentName'], $blockedCategories)) {
                return false;
            }
        }
        
        return true;
    }
}
```

**Integration di Controller:**

```php
public function store(Request $request, ImageModerationService $moderator)
{
    $validated = $request->validate([
        'photos' => 'required|array|min:1|max:3',
        'photos.*' => 'image|max:5120',
    ]);
    
    // Upload to temp storage
    $tempUrls = [];
    foreach ($request->file('photos') as $photo) {
        $path = $photo->store('temp', 'public');
        $tempUrls[] = asset('storage/' . $path);
    }
    
    // Moderation check
    foreach ($tempUrls as $url) {
        if (!$moderator->isSafe($url)) {
            // Delete temp files
            foreach ($tempUrls as $tempUrl) {
                $relativePath = str_replace(asset('storage/'), '', $tempUrl);
                Storage::disk('public')->delete($relativePath);
            }
            
            return response()->json([
                'error' => 'Image contains inappropriate content and was rejected.'
            ], 422);
        }
    }
    
    // Move from temp to permanent storage
    // ... create report
}
```

> **Keputusan user (2026-10-13):** antrean review manual dipilih sebagai pendekatan utama (lihat di atas); AWS Rekognition tidak dipakai.

---

## Layer 4: Input Validation & Sanitization

### SQL Injection Protection

**Already handled by Eloquent ORM**, but ensure:
- Never use raw SQL dengan user input tanpa binding
- Always validate input

```php
// ❌ NEVER DO THIS
DB::select("SELECT * FROM users WHERE nim = '{$request->nim}'");

// ✅ CORRECT
DB::select("SELECT * FROM users WHERE nim = ?", [$request->nim]);
// Or better: User::where('nim', $request->nim)->first();
```

### XSS Protection

**Laravel auto-escape Blade templates**, tapi untuk API response:

```php
// Sanitize output
public function show(LostReport $report)
{
    return response()->json([
        'title' => htmlspecialchars($report->title, ENT_QUOTES, 'UTF-8'),
        'description' => htmlspecialchars($report->description, ENT_QUOTES, 'UTF-8'),
        // ...
    ]);
}
```

**Flutter side:** Tidak render HTML dari API

### CSRF Protection

**Already handled by Laravel Sanctum** untuk SPA, tapi ensure:
- Mobile app pakai `Authorization: Bearer {token}`, bukan cookies
- Sanctum token expired setelah 7 hari (configurable)

---

## Layer 5: Privacy & Data Protection

### 1. Sensitive Data Encryption

**Encrypt FCM token, phone number:**

```php
// migration
Schema::table('users', function (Blueprint $table) {
    // Change to encrypted cast
});

// Model
protected $casts = [
    'fcm_token' => 'encrypted',
    'whatsapp' => 'encrypted',
];
```

### 2. API Response Filtering

**Never expose:**
- Password hash
- FCM token (kecuali untuk update)
- Email/phone jika `wa_visible = false`

**API Resource:**

```php
// app/Http/Resources/UserResource.php
public function toArray($request)
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'nim' => $this->nim,
        'profile_image_url' => $this->profile_image_url,
        'whatsapp' => $this->wa_visible ? $this->whatsapp : null, // Conditional
        // NEVER include: password, fcm_token
    ];
}
```

### 3. GDPR-Compliant Account Deletion

**Endpoint:** `DELETE /api/users/me`

```php
public function destroy(Request $request)
{
    $user = $request->user();
    
    // Soft delete atau hard delete
    $user->delete(); // Soft delete (if using SoftDeletes trait)
    
    // Or anonymize data
    $user->update([
        'name' => 'Deleted User',
        'email' => null,
        'whatsapp' => null,
        'fcm_token' => null,
    ]);
    
    // Keep reports for audit trail tapi anonymize owner
    
    return response()->json(['message' => 'Account deleted successfully']);
}
```

---

## Layer 6: Authentication Security

### 1. Token Expiry

**Sanctum config:**

```php
// config/sanctum.php
'expiration' => 60 * 24 * 7, // 7 days
```

**Force re-login setelah 7 hari.**

### 2. Logout (Revoke Token)

```php
public function logout(Request $request)
{
    $request->user()->currentAccessToken()->delete();
    
    return response()->json(['message' => 'Logged out successfully']);
}
```

### 3. Suspicious Activity Detection

**Flag suspicious behavior:**

```php
// app/Services/SecurityService.php
class SecurityService
{
    public function detectSuspiciousActivity(User $user): bool
    {
        // Multiple failed login attempts — tidak relevan untuk SSO (user tidak login password; admin Filament tetap password)
        $failedLogins = Cache::get("failed_login:{$user->id}", 0);
        if ($failedLogins >= 5) {
            return true;
        }
        
        // Rapid report creation (>10 reports in 1 hour)
        $recentReports = LostReport::where('reporter_id', $user->id)
            ->where('created_at', '>', now()->subHour())
            ->count();
        if ($recentReports > 10) {
            return true;
        }
        
        return false;
    }
    
    public function blockUser(User $user, string $reason)
    {
        $user->update(['blocked' => true, 'blocked_reason' => $reason]);
        
        // Notify admin
    }
}
```

**Middleware:**

```php
// app/Http/Middleware/CheckBlockedUser.php
public function handle($request, Closure $next)
{
    if ($request->user()->blocked) {
        return response()->json([
            'error' => 'Your account has been blocked. Contact admin.',
        ], 403);
    }
    
    return $next($request);
}
```

---

## Layer 7: Infrastructure Security

### 1. HTTPS Only

**Force HTTPS di production:**

```php
// app/Providers/AppServiceProvider.php
public function boot()
{
    if ($this->app->environment('production')) {
        URL::forceScheme('https');
    }
}
```

### 2. CORS Configuration

```php
// config/cors.php
return [
    'paths' => ['api/*'],
    'allowed_origins' => [
        'https://lostfound.kampus.id', // Flutter web
        'https://admin.lostfound.kampus.id', // Filament admin
    ],
    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    'allowed_headers' => ['Content-Type', 'Authorization'],
    'max_age' => 86400,
];
```

### 3. Security Headers

**Middleware:**

```php
// app/Http/Middleware/SecurityHeaders.php
public function handle($request, Closure $next)
{
    $response = $next($request);
    
    $response->headers->set('X-Frame-Options', 'DENY');
    $response->headers->set('X-Content-Type-Options', 'nosniff');
    $response->headers->set('X-XSS-Protection', '1; mode=block');
    $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    return $response;
}
```

**Register di Kernel:**

```php
protected $middleware = [
    // ...
    \App\Http\Middleware\SecurityHeaders::class,
];
```

---

## Implementation Checklist

### Phase 1: Critical (Week 1)
- [ ] Rate limiting (API throttle)
- [x] Input validation (already done via Laravel)
- [ ] HTTPS force
- [ ] CORS config
- [ ] Security headers
- Throttle endpoint auth `POST /auth/google`: sudah 30 permintaan/menit per IP (WiFi kampus berbagi IP). Verifikasi token Google gagal dicatat di log server tanpa token atau email. Login user memakai Google SSO; admin Filament tetap memakai password.

Per DailyChanges 2026-10-06, rate limiting, HTTPS force, CORS, dan security headers belum dikerjakan.

### Phase 2: High Priority (Week 2)
- ~~[ ] CAPTCHA (registration + suspicious login)~~ — tidak relevan untuk SSO
- [ ] Sensitive data encryption (FCM token, phone)
- [ ] API response filtering (UserResource) — anotasi: `$hidden` `fcm_token`/`email_verified_at` sudah diterapkan (2026-10-06)
- [ ] Account deletion endpoint

### Phase 3: Medium Priority (Week 3-4)
- [ ] Image moderation (antrean review manual; AWS Rekognition tidak dipakai)
- [ ] Suspicious activity detection
- [ ] User blocking mechanism — anotasi: Filament Blokir/Buka Blokir (2026-10-06) + login SSO tolak blocked 403 (2026-10-10); status middleware `CheckBlockedUser` untuk token aktif: belum diketahui
- [ ] Token expiry enforcement — anotasi: Sanctum 7 hari sudah diterapkan (2026-10-10)

### Phase 4: Monitoring (Ongoing)
- [ ] Log failed login attempts
- [ ] Alert on rate limit violations
- [ ] Monitor image moderation rejections
- [ ] Audit trail for admin actions

---

## Testing Strategy

**Security Test Cases:**

1. **Rate Limiting:**
   - Spam 100 requests → expect 429 Too Many Requests after limit

2. **CAPTCHA:**
   - Register dengan invalid CAPTCHA token → expect 422
   - Register dengan valid token → success

3. **Image Moderation:**
   - Upload inappropriate image → expect rejection
   - Upload clean image → success

4. **Authorization:**
   - Access admin endpoint tanpa admin role → expect 403
   - Delete user lain → expect 403

5. **Privacy:**
   - GET user dengan `wa_visible=false` → whatsapp field null
   - GET user dengan `wa_visible=true` → whatsapp field visible

---

## Monitoring & Alerting

**Metrics to track:**

1. **Rate limit violations per day** (dashboard metric)
2. **Failed login attempts** (alert if >100/hour)
3. **Image moderation rejections** (review for false positives)
4. **Blocked users count** (manual review queue)
5. **Suspicious activity flags** (admin notification)

**Tools:**
- Laravel Telescope (dev): monitor requests, queries, exceptions
- Sentry (production): error tracking, performance monitoring
- CloudWatch (AWS): infrastructure metrics, logs

---

## Estimasi Waktu

### Phase 1 (Critical):
- Rate limiting pada `POST /api/auth/google`: **30 permintaan/menit per IP** (diterapkan); rate limiting global tetap belum dikerjakan.
- HTTPS + CORS + Security headers: **20 menit**

### Phase 2 (High Priority):
- ~~CAPTCHA backend + Flutter: 1 jam~~ — dicoret (SSO, tidak relevan)
- Encryption + API filtering: **45 menit**
- Account deletion: **20 menit**

### Phase 3 (Medium Priority):
- Image moderation: **1 jam** (antrean review manual)
- Suspicious activity detection: **1 jam**

**Total Critical Path:** ~2.5 jam  
**Total Full Implementation:** ~6-7 jam

---

## Next Steps

1. ✅ Plan selesai
2. ⬜ Phase 1: Implement rate limiting + security headers
3. ~~⬜ Phase 2: Setup CAPTCHA (reCAPTCHA account)~~ — dicoret: login memakai Google SSO, CAPTCHA tidak relevan untuk alur auth aktif
4. ⬜ Phase 3: Implementasi moderasi gambar via antrean review manual (keputusan user 2026-10-13; AWS Rekognition tidak dipakai)
5. ⬜ Setup monitoring (Sentry account, CloudWatch alarms)
6. ⬜ Penetration testing (hire security auditor atau self-test via OWASP checklist)

---

## Related Files

- **Project root:** `C:\Project\lostfound-backend` (GitHub: `Davinciz/lostfound-backend`, Private)
- **PRD:** [[PRD]]
- **Technical Reference:** [[TechnicalReference]]
- **Verifikasi via Chat:** [[Verifikasi via Chat - Lost&Found]]

---

#plan #lost-and-found #security #rate-limiting #privacy #captcha
