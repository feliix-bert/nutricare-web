# Evaluasi Fatal: Error & Performa pada Web Desktop (Next.js / Tailwind CSS)

Dokumen ini mencatat pembelajaran (RCA - Root Cause Analysis) mengenai error kritis dan jebakan *performance/layouting* yang dialami selama migrasi/porting kode dari React Native (Mobile) menuju ekosistem React Web (Next.js).

---

## 1. Studi Kasus 1: Hydration Mismatch pada `zustand` persist

- **Kronologi**: Setelah mem-porting store autentikasi (yang menggunakan `persist` dari zustand dengan custom storage `localStorage`), layar memunculkan error *Hydration Mismatch* pada saat _first paint_. Next.js mengeluh bahwa UI yang di-render di server tidak sama dengan UI yang di-render di client.
- **Root Cause**: Server rendering (SSR) Node.js tidak memiliki objek `window` atau `localStorage`. Ketika komponen merender berdasarkan state auth yang diinisialisasi secara sinkron dengan status dari `localStorage` (di client), server akan membaca default state (misalnya `user: null`), sedangkan client bisa jadi sudah `user: { ... }`. Perbedaan output inilah yang membuat pohon DOM React bentrok.
- **Tindakan Perbaikan**: Menunda perenderan UI yang bergantung pada storage client sampai proses hidrasi (hydration) selesai. Menggunakan state lokal (`isInitialized`) yang di-set ke `true` di dalam `useEffect`. Pada root `layout.tsx`, render aplikasi di-block sementara dengan layar loading hingga `isInitialized === true`.
- **Pelajaran**: Di ekosistem Next.js, segala pembacaan data langsung dari `window` atau API lokal sisi browser **tidak boleh** menentukan percabangan awal pada saat *initial render* di komponen RSC (React Server Component) maupun *first pass* di Client Component.

---

## 2. Studi Kasus 2: Next Navigation Error & Hooks Constraint

- **Kronologi**: Mem-porting kode navigasi layar `Assessment` (Form bertahap dari 1 hingga 5). Error module unresolved terjadi pada `npm run build`: `Module not found: Can't resolve '@/features/children/services/mock'`.
- **Root Cause**: Dalam React Native (Expo), kita menggunakan absolute path tanpa ketatnya batas kompilasi Turbopack di web. Selain itu, saat porting ada kesalahan ketik _path import_ di mana IDE otomatis menebak path secara keliru ke `features/children/services` padahal layanan `mock.ts` berada di `src/services/mock.ts`. Di Next.js *App Router*, komponen *Server* dan *Client* memiliki jalur bundler yang ketat. Jika sebuah file _Client Component_ (menggunakan `"use client"`) mencoba memuat modul yang tidak tersedia, build akan gagal total.
- **Tindakan Perbaikan**: Memperbaiki semua path absolute dari `@/` secara manual dan memastikan _dependencies_ utilitas (seperti `random.ts`) juga disertakan dan tidak tertinggal.
- **Pelajaran**: Ekosistem bundler Turbopack / Webpack Next.js jauh lebih ketat daripada Metro bundler React Native dalam mendeteksi _missing imports_. Setiap _refactor_ wajib divalidasi dengan _dry-run build_ (`npm run build`).

---

## 3. Studi Kasus 3: Z-Index & Tailwind Overflow (Mobile Wrapper vs Native Desktop)

- **Kronologi**: Awalnya untuk mempertahankan desain antarmuka, seluruh halaman dibungkus dengan `<div className="max-w-md mx-auto">`. Saat dijalankan pada layar Desktop Monitor (1920x1080), aplikasi menyisakan ruang putih raksasa di kanan dan kiri, dan posisi `BottomTabBar` yang diatur sebagai `fixed bottom-6` tampak aneh di layar lebar.
- **Root Cause**: Desain arsitektur mobile-first CSS yang di-_copy-paste_ secara harfiah ke web akan menciptakan anomali UI di layar besar. *Fixed positioning* tidak selaras secara alamiah dengan container `max-w-md` kecuali menggunakan hitungan _calc()_ atau trik penempatan absolut dalam _relative wrapper_. 
- **Tindakan Perbaikan**: Mengimplementasikan paradigma **Adaptive Native Responsive UI**. Menghancurkan belenggu `max-w-md` dan menukarnya dengan _Fluid Grid layout_ (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`). Untuk navigasi, alih-alih memaksakan `BottomTabBar` di desktop, dibuatlah `SideNavBar` melayang yang menggunakan _Media Queries_ Tailwind (`hidden md:flex`) yang hanya akan tampil di resolusi di atas `768px`, sedangkan `BottomTabBar` akan disembunyikan (`md:hidden`).
- **Pelajaran**: Aplikasi web harus selalu memanfaatkan layar sepenuhnya sesuai _breakpoint_. "Responsive" bukan berarti meletakkan kotak HP di tengah layar monitor. "Responsive" berarti komponen yang tadinya menyusun ke bawah di ruang sempit (mobile) kini menata diri menyamping dan membesar di ruang luas (desktop).
