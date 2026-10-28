---
type: report
task: Ajax-261027-03
from: flutter
outcome: succeeded
branch: fix/auth/handle-401-logout
commits:
  - "44f5e56 fix(auth): auto-logout and redirect to login on 401 response"
updated: 2026-10-27
summary: AuthInterceptor kini menangkap 401 non-login, hapus sesi, navigasi ke AuthScreen sekali
---
- Berubah: `lib/api/api_client.dart` (AuthInterceptor + onError 401 guard, ApiClient+onSessionExpired), `lib/main.dart` (navigatorKey global, _handleSessionExpired + SnackBar), `lib/screens/auth/auth_provider.dart` (forceLogout), `test/auth_interceptor_401_test.dart` (6 test baru)
- Verifikasi (hasil asli): `flutter analyze` — 0 error baru (8 warning pre-existing); `flutter test` — 125/125 passed
- Temuan / open items: `_isHandling401` static flag — reset otomatis di `googleLogin`; jika app cold-start tanpa login baru, flag sudah false dari awal (aman)
- Uji manual: tidak diuji (butuh device + token palsu di secure storage)
- Butuh keputusan user: –
