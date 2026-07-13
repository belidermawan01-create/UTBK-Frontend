# Agent Notes — Fase 1

## Tujuan fase 1

Stabilisasi alur inti aplikasi agar auth, role access, dan error handling lebih konsisten sebelum menambahkan fitur baru.

## Yang sudah dikerjakan

- Membuat helper auth terpusat di src/utils/auth.js untuk:
  - mengambil role user dari berbagai sumber payload,
  - mengecek apakah user adalah admin,
  - menormalisasi pesan error dari API,
  - mengelola token auth secara konsisten.
- Menambahkan uji sederhana untuk helper auth di src/utils/auth.test.js.
- Mengubah AuthContext agar token dan user state dikelola lewat helper yang sama.
- Mengubah ProtectedRoute dan Navbar agar memakai logika role yang sama.
- Mengubah halaman Login dan Register agar memakai helper error message yang lebih konsisten.

## Flow kode hasil refactor

1. User membuka aplikasi.
2. AuthContext membaca token dari storage melalui helper auth.
3. Jika token ada, frontend memanggil GET /auth/me untuk memastikan sesi valid.
4. Role user diambil dari payload backend dengan urutan prioritas yang konsisten.
5. ProtectedRoute memakai hasil role tersebut untuk mengizinkan akses ke halaman admin atau user.
6. Saat login/register terjadi error, UI menampilkan pesan dari backend lewat helper yang sama.
7. Logout dan token removal juga dipusatkan ke helper auth agar tidak tersebar.

## Hasil verifikasi

- Build berhasil melalui npm run build.
- Unit test helper auth berhasil melalui node --test src/utils/auth.test.js.

## Next step yang disarankan

Setelah fase 1 stabil, fokus ke fase 2: integrasi modul tryout dan perluasan admin sesuai backend.

---

# Agent Notes — Fase 2

## Tujuan fase 2

Mengintegrasikan modul tryout sesuai dokumentasi backend agar frontend dapat mengakses alur admin dan siswa untuk tryout.

## Yang sudah dikerjakan

- Menambahkan endpoint tryout ke wrapper API di src/api/api.js:
  - createTryout
  - updateTryoutStatus
  - addTryoutSubtes
  - deleteTryout
  - getTryoutList
  - getTryoutById
  - startTryoutSession
  - submitTryoutSubtes
  - finishTryout
  - getTryoutResult
  - getTryoutHistory
- Membuat helper util tryout di src/utils/tryout.js untuk label status, styling, dan format tanggal.
- Membuat halaman admin Tryout Manager di src/pages/TryoutManager.jsx untuk:
  - membuat tryout,
  - mengubah status tryout,
  - menghapus tryout,
  - melihat ringkasan status draft/published/ongoing.
- Menambahkan route baru untuk admin: /admin/tryout.
- Menambahkan halaman siswa Tryout Page di src/pages/TryoutPage.jsx untuk menampilkan daftar tryout yang tersedia.
- Menambahkan route siswa: /tryout.
- Menambahkan navigasi tryout di navbar dan dashboard siswa.

## Flow kode hasil implementasi

1. Admin membuka halaman Kelola Tryout.
2. Form tryout dikirim ke endpoint POST /tryout.
3. Setelah tryout dibuat, UI memanggil GET /tryout untuk menampilkan daftar tryout.
4. Admin dapat mengubah status tryout lewat PATCH /tryout/:id/status.
5. Siswa membuka halaman Tryout dari navbar atau dashboard.
6. Halaman siswa memanggil GET /tryout dan menampilkan tryout yang statusnya PUBLISHED atau ONGOING.
7. Fitur ini siap dikembangkan lebih lanjut untuk alur mulai tryout, submit subtes, dan hasil tryout.

## Hasil verifikasi

- Build berhasil melalui npm run build.

## Next step yang disarankan

Setelah fitur tryout ini stabil, fokus ke integrasi PTN & Jurusan serta perbaikan alur admin yang lebih lengkap.

---

# Agent Notes — Fase 2.1 (Sinkronisasi Tryout dengan API Backend)

## Perubahan dari backend yang disesuaikan

Berdasarkan dokumentasi backend yang terbaru, beberapa detail tryout berbeda dari implementasi awal frontend:

- GET /tryout sekarang bisa dipakai oleh role SISWA maupun ADMIN.
- Untuk siswa, hanya tryout berstatus PUBLISHED dan ONGOING yang ditampilkan.
- Untuk admin, endpoint ini menampilkan tryout publik serta tryout milik admin yang sedang login, termasuk draft.
- Admin dapat melihat tryout miliknya tanpa memandang status.
- Endpoint POST /tryout, PATCH /tryout/:id/status, DELETE /tryout/:id, dan GET /tryout/:id sudah harus diperlakukan sesuai role ADMIN dan akses milik admin.

## Yang sudah disesuaikan di frontend

- Halaman Tryout Manager admin sekarang memanggil GET /tryout untuk mengambil daftar tryout yang sesuai dengan hak akses admin.
- Setelah create, publish, dan delete, halaman refresh daftar tryout dari backend agar selalu sinkron dengan server.
- Label dan pesan UI admin diperbarui agar mencerminkan bahwa admin dapat melihat draft, published, dan ongoing tryout miliknya.
- Alur admin tidak lagi mengandalkan fallback lokal yang tidak sesuai dengan kontrak backend.

## Flow kode hasil sinkronisasi

1. Admin membuka halaman tryout manager.
2. Frontend memanggil GET /tryout dengan token admin.
3. Backend mengembalikan tryout publik dan tryout milik admin tersebut, termasuk draft.
4. Admin dapat membuat tryout baru, mengubah status, dan menghapus tryout sesuai hak akses backend.
5. Setelah aksi berhasil, frontend mengambil ulang data dari backend untuk menjaga konsistensi state.

## Hasil verifikasi

- Build berhasil melalui npm run build.

---

# Agent Notes — Fase 2.2 (Penyempurnaan Admin Tryout)

## Tujuan fase 2.2

Menyempurnakan alur admin tryout agar status lifecycle dan pembatasan tindakan sesuai kontrak backend, serta meningkatkan kejelasan UI untuk status publish dan delete.

## Yang sudah dikerjakan

- Menambahkan helper util tryout di src/utils/tryout.js untuk:
  - menghitung jumlah soal TPS dan TKA per tryout,
  - memeriksa apakah tryout dapat dipublish,
  - memeriksa apakah tryout dapat dihapus.
- Memperbarui src/pages/TryoutManager.jsx agar:
  - tombol `Hapus` hanya muncul dan bekerja untuk tryout dengan status `DRAFT`,
  - tombol `Publish` hanya muncul untuk tryout `DRAFT`,
  - action delete mengecek status target tryout sebelum memanggil API,
  - publish memeriksa minimal 1 soal TPS dan 1 soal TKA sebelum mengirim request,
  - ditambahkan panel detail inline untuk tryout yang dipilih, menampilkan status, jadwal, dan ringkasan jumlah soal TPS/TKA.
- Menambahkan state pemilihan tryout dan pemanggilan detail tryout agar admin dapat melihat kesiapan publish tanpa berpindah halaman.

## Flow kode hasil penyempurnaan

1. Admin membuka halaman Kelola Tryout.
2. Admin memilih baris tryout untuk melihat detail ringkas di panel.
3. Jika tryout berstatus DRAFT, tombol `Publish` dan `Hapus` tersedia;
   jika tidak, kedua tombol ini tidak ditampilkan.
4. Saat Publish dipilih, frontend memanggil GET /tryout/:id dan memvalidasi bahwa tryout memiliki setidaknya 1 soal TPS dan 1 soal TKA.
5. Jika valid, frontend memanggil PATCH /tryout/:id/status dengan status `PUBLISHED` dan me-refresh daftar.
6. Saat Hapus dipilih, frontend memvalidasi status DRAFT lagi sebelum memanggil DELETE /tryout/:id.
7. Setelah tindakan berhasil, data tryout direfresh untuk menjaga konsistensi.

## Hasil verifikasi

- Build berhasil melalui npm run build.

## Next step yang disarankan

- Refactor lebih lanjut `SoalManager.jsx` agar penautan subtes TPS/TKA lebih terpusat ke detail tryout.
- Tambahkan tampilan detail tryout yang memuat daftar subtes dan soal, bukan hanya ringkasan jumlah.
- Kembangkan alur lifecycle `ONGOING` dan `ENDED` untuk admin jika backend mendukung kontrol status lanjutan.

---

# Agent Notes — Fase 3 (Implementasi PTN & Jurusan)

## Tujuan fase 3

Menambahkan modul admin untuk mengelola data PTN dan jurusan sesuai kontrak backend.

## Yang sudah dikerjakan

- Menambahkan halaman admin `src/pages/PtnManager.jsx` untuk:
  - melihat daftar PTN,
  - mencari PTN,
  - membuat, mengedit, dan menghapus PTN,
  - melihat detail PTN beserta daftar jurusannya,
  - membuat, mengedit, dan menghapus jurusan.
- Menambahkan route admin baru `/admin/ptn` di `src/App.jsx`.
- Menambahkan menu admin `Kelola PTN` di `src/components/AdminLayout.jsx`.
- Menambahkan endpoint PTN/jurusan di `src/api/api.js`:
  - `getPtnList`, `getPtnById`, `createPtn`, `updatePtn`, `deletePtn`,
  - `createJurusan`, `updateJurusan`, `deleteJurusan`.

## Flow kode hasil implementasi

1. Admin membuka halaman Kelola PTN & Jurusan.
2. Frontend memanggil `GET /api/v1/ptn` untuk menampilkan daftar PTN.
3. Admin dapat memilih PTN untuk melihat detail dan daftar jurusan.
4. Admin dapat membuat PTN baru atau mengedit PTN yang sudah ada.
5. Admin dapat menambahkan jurusan di bawah PTN yang dipilih dan mengedit/hapus jurusan.
6. Semua aksi mutasi memanggil endpoint API yang sesuai dan menyegarkan detail PTN.

## Hasil verifikasi

- Fitur PTN/Jurusan sudah terintegrasi di admin panel.
- Route dan menu admin sudah tersedia.
