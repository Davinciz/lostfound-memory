---
type: report
task: GPT-261107-01
from: backend
outcome: succeeded
branch: chore/repo/agents-md-context
commits:
  - "61d6bda docs(repo): perbarui konteks proyek di AGENTS.md dan pindahkan keluar blok Boost"
updated: 2026-11-07
summary: Konteks backend diperbarui dan dipindah ke luar blok Laravel Boost.
---
- Berubah: hanya `AGENTS.md` dalam commit backend. Konteks lama diganti dan tag penutup dipindah tepat setelah aturan PHPUnit. Teks pedoman Boost dipertahankan.
- Verifikasi: `git check-ignore -v AGENTS.md` tidak menemukan aturan ignore dan `git ls-files AGENTS.md` menampilkan file tersebut. `git diff --check` dan `git diff --staged --check` lulus. Diff dan commit hanya memuat `AGENTS.md`. Tag pembuka ada sekali di baris 1, tag penutup ada sekali di baris 157, dan judul konteks ada di baris 161. Pencarian istilah lama tidak menemukan hasil. Perbandingan teks Boost terhadap baseline lulus.
- Verifikasi kode: `routes/api.php` memetakan PUT dan DELETE `/api/users/me/fcm-token` ke metode yang tersedia di `AuthController`. Kedua service FCM dan `config/firebase.php` tersedia. Pencarian di `app/` dan `routes/` tidak menemukan `LocationService` atau `POST /location/suggest`.
- Temuan / open items: aturan UUID disesuaikan dengan `routes/api.php`. Route serah terima memakai `whereUuid('claim')`, sedangkan parameter `{id}` memakai `whereUuid('id')`. Di snapshot dokumen, `docs/documents/RPP.md` masih menyebut MySQL, berbeda dari `docs/documents/TechnicalReference.md` dan `docs/documents/schema.dbml` yang menyebut PostgreSQL. Konteks lama tentang deteksi gedung otomatis juga bertentangan dengan keputusan 2026-10-11 di `docs/documents/ERD.md`.
- Git: folder utama berada di branch `fix/chat/unread-count-n-plus-one` dengan perubahan lokal pada `README.md`. Pekerjaan dilakukan di salinan kerja terpisah dari `develop` setelah fast-forward ke `4e57c2f`. Push berhasil dan status branch tugas bersih.
- Di luar lingkup: suite Laravel dilewati sesuai instruksi untuk perubahan Markdown. PR diserahkan kepada user.
- Butuh keputusan user: tidak ada.
