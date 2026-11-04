---
type: report
task: Ajax-261101-07
from: flutter
outcome: succeeded
branch: fix/map/location-dispose-crash
commits: 0769600 fix(map): hapus changeSettings dari dispose LocationService
updated: 2026-11-01
summary: Hapus changeSettings dari LocationService.dispose() untuk hindari crash native saat izin lokasi ditolak
---
- **Berubah:** `lib/services/location_service.dart` — `dispose()` jadi no-op, tidak sentuh plugin location
- **Verifikasi:** `flutter analyze` (8 issue baseline lama, tidak bertambah), `flutter test` (188 lulus)
- **Temuan:** Uji perangkat Android (5 skenario a-e dari prompt) belum dilakukan — tidak ada akses adb/perangkat. Widget test lulus, tapi bug ini native (`SecurityException`), butuh konfirmasi manual: submit/tutup form dengan izin ditolak, tekan "Lokasi saya" dengan/tanpa izin
- **Butuh keputusan:** —
