---
type: report
task: GPT-261107-02
from: flutter
outcome: succeeded
branch: chore/repo/agents-md-context
commits:
  - "ceb86b60421a8621c3bb53751dfe0d4bd2667a49 docs(repo): tambah AGENTS.md konteks proyek untuk agent"
updated: 2026-11-07
summary: Panduan agent Flutter ditambahkan dan branch tugas diverifikasi di origin.
---

- **Berubah**
  - Menambah `AGENTS.md` di root repo. Diff commit berisi satu file baru dengan 98 baris.
  - Panduan mengikuti nama aktual `ChatMessage` dan folder layar `home` serta `claim`. Salinan `docs/` bersifat lokal dan di-ignore Git, sehingga panduan juga menunjukkan lokasi dokumen di vault. Redaksi kompresi foto mengikuti batas lebar di `UploadService`. Redaksi logout FCM menjelaskan bahwa pembersihan menunggu PUT yang sedang berjalan sebelum mencoba DELETE kondisional.
- **Verifikasi**
  - `pwd` dan `git branch --show-current` menunjukkan `C:\Project\lostfound-mobile` pada `develop`. `git status` menunjukkan perubahan lokal di `README.md`. Basis tugas diperbarui lewat `git fetch origin develop`, lalu branch dibuat di worktree bersih dari `origin/develop` pada `0d031d4`. Checkout utama tetap di `develop` dengan perubahan lokalnya.
  - `git check-ignore -v AGENTS.md` tidak menghasilkan kecocokan (exit 1). Pemeriksaan isi mengonfirmasi struktur `lib/`, keberadaan `api_error.dart`, `fcm_service.dart`, dan `location_service.dart`, serta `LocationService.dispose()` yang no-op. `markTransferred` memakai POST multipart dengan `_method=PATCH` dan satu file `proof_photo`.
  - Sembilan layar memakai Provider langsung. Layar tersebut adalah `HomeScreen`, `SearchScreen`, `ChatScreen`, `ConversationListScreen`, `ClaimScreen`, `ClaimDetailScreen`, `MyClaimsScreen`, `EditProfileScreen`, dan `SettingsScreen`. `LocationPickerSection` juga membaca Provider dan dihitung terpisah sebagai widget. Empat implementasi layar membuat `ApiClient()` langsung, yaitu `MainTabScreen`, `MyReportsScreen`, `ReportFormScreen`, dan `ReportDetailView`. Form dan detail lost/found memakai implementasi bersama.
  - `flutter analyze` sebelum dan sesudah perubahan menghasilkan **11 issue** (exit 1), terdiri dari 8 di file test dan 3 di `settings_screen.dart`. Tidak ada temuan pada file yang ditambah.
  - `flutter test --reporter expanded` sebelum dan sesudah perubahan menghasilkan **246 lulus, 4 dilewati, 1 gagal** (exit 1). Tes yang gagal sama, yaitu `SettingsScreen: nilai bertahan saat dibuka ulang` di `test/wa_visibility_persist_test.dart`.
  - `git diff --check`, `git diff --staged --check`, dan `git diff --check HEAD^ HEAD` bersih. `git diff --staged --stat` dan `git diff --stat HEAD^ HEAD` hanya menunjukkan `AGENTS.md`. `git push -u origin chore/repo/agents-md-context` berhasil dan `git ls-remote` mengonfirmasi hash remote cocok dengan commit lokal. Worktree tugas bersih.
- **Temuan / open items**
  - Baseline aktual menggantikan angka 8 issue dan ekspektasi suite hijau pada draf. Tes visibilitas WhatsApp sudah gagal sebelum perubahan. Di antara hasil yang tercatat, tes gagal menemukan `SwitchListTile` untuk label `Tampilkan nomor WhatsApp`.
  - Tugas ini sebatas dokumentasi. Kode, tes, dan konfigurasi tidak diubah. Build APK, uji perangkat nyata, dan PR tidak dilakukan.
- **Butuh keputusan user**
  - Pembuatan PR oleh user.
