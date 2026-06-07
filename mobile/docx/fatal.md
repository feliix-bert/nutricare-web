# Evaluasi Fatal: Masalah Resolusi Versi Dependensi di React Native / Expo

Dokumen ini mencatat evaluasi insiden kegagalan runtime (crash) akibat ketidakcocokan versi Babel Preset dengan Expo SDK setelah proses restrukturisasi folder.

---

## 1. Kronologi Kejadian (Incident Timeline)
- **Kondisi Awal**: Aplikasi berjalan lancar menggunakan struktur folder lama (flat).
- **Langkah Refaktor**: Memindahkan komponen-komponen UI, hooks, services, dan types ke dalam folder `features/`.
- **Masalah Kompilasi Pertama**: Metro Bundler mengalami kegagalan kompilasi karena `babel-preset-expo` tidak ditemukan di root `node_modules`. Hal ini terjadi karena paket tersebut tidak terdaftar sebagai dependensi langsung di `package.json` (hanya dependensi transitif di bawah `expo`).
- **Tindakan Perbaikan Pertama**: Menginstal `babel-preset-expo` menggunakan perintah `npm install -D babel-preset-expo`.
- **Kegagalan Runtime**: Aplikasi mengalami crash dengan layar merah bertuliskan:
  `[runtime not ready]: SyntaxError: private properties are not supported`
- **Analisis Root Cause**: Perintah instalasi di atas mengunduh versi terbaru (`^56.0.14`), sementara aplikasi kita menggunakan **Expo SDK 54** (`~54.0.34`). Versi 56.x menonaktifkan transform Babel untuk *class private properties* (`#`), padahal engine Hermes bawaan SDK 54 belum mendukung fitur JavaScript modern tersebut secara native.
- **Tindakan Perbaikan Kedua**: Menurunkan dan mengunci versi paket menjadi `"babel-preset-expo": "~54.0.0"` agar selaras dengan versi SDK.
- **Masalah Tampilan Kedua (Aplikasi Berwarna Putih/Hancur)**: Setelah bundler berhasil dikompilasi, tampilan aplikasi pecah dan warna teks/kartu terdistorsi (misal: background putih polos di area beranda dan teks berwarna putih sehingga tidak terlihat).
- **Analisis Root Cause Kedua**: Kita membuat folder baru bernama `features/` di root proyek untuk mengemas logika dan UI modul. Namun, file `tailwind.config.js` bawaan hanya mencantumkan `./app/**/*.{js,jsx,ts,tsx}` dan `./components/**/*.{js,jsx,ts,tsx}` pada array `content`. Akibatnya, seluruh utility classes Tailwind di dalam folder `features/` tidak dikompilasi ke CSS. Komponen global (seperti `AppCard`) yang dikompilasi menerapkan warna gelap (karena HP berada di dark-mode), sementara layar utamanya (yang tidak terkompilasi) kehilangan background gelapnya dan kembali ke default putih.
- **Tindakan Perbaikan Ketiga**: Menambahkan `"./features/**/*.{js,jsx,ts,tsx}"` ke konfigurasi `content` di file `tailwind.config.js`.

---

## 2. Kenapa Sebelumnya Berhasil? (Mengapa Baru Eror Sekarang?)
1. **Metro & Babel Cache**: Sebelum folder diubah, Metro Bundler telah menyelesaikan kompilasi dan menyimpan seluruh file dalam cache memori. Selama file tersebut tidak diubah lokasinya, Metro tidak perlu memanggil Babel Compiler kembali.
2. **Cold Compilation**: Pemindahan lokasi file ke folder baru (`features/`) memicu Metro melakukan kompilasi ulang dari nol (*cold start compilation*) untuk path baru tersebut. Di saat kompilasi dingin inilah Babel dipanggil kembali dan mendeteksi dependensi preset versi `56.x` yang tidak kompatibel.
3. **Flat Folder vs New Folder**: Sebelumnya semua file screen berada langsung di bawah folder `app/`, sehingga terdeteksi oleh aturan pencarian Tailwind `./app/**/*`. Begitu dipindahkan ke `features/`, kelas-kelas Tailwind-nya hilang dari pemindaian.

---

## 3. Aturan Pencegahan (Preventive Rules)

Untuk mencegah insiden serupa terulang kembali, wajib mematuhi aturan berikut saat memodifikasi/menambahkan dependensi pada project React Native / Expo:

1. **Selalu Gunakan `npx expo install` alih-alih `npm install`**
   - Perintah `npx expo install <package-name>` secara otomatis mendeteksi versi SDK yang terpasang di proyek Anda dan mencari versi paket yang divalidasi kompatibel dengan versi SDK tersebut.
   - Contoh: Gunakan `npx expo install babel-preset-expo` untuk menginstal versi yang tepat.

2. **Periksa Versi SDK Sebelum Menginstal Secara Manual**
   - Jika terpaksa menggunakan `npm install`, selalu periksa versi mayor SDK di `package.json` (misalnya Expo v54) dan kunci versinya dengan tag versi yang sesuai (misalnya `@~54.0.0`).

3. **Daftarkan Folder Root Baru ke File Konfigurasi Tailwind**
   - Setiap kali membuat folder tingkat atas (*top-level directory*) baru yang berisi komponen React atau file `.tsx` (misalnya `features/`, `layouts/`, `modules/`), **wajib** mendaftarkan pola path folder tersebut ke array `content` di `tailwind.config.js`.
   - Contoh: `"./features/**/*.{js,jsx,ts,tsx}"`.

4. **Bersihkan Cache Metro Setiap Mengubah Dependensi Rendah (Low-Level DevDependencies) / Config**
   - Setiap kali mengubah paket Babel, konfigurasi Tailwind, Metro, React Native, atau konfigurasi compiler, selalu bersihkan cache Metro saat menjalankan server kembali:
     ```bash
     npx expo start -c
     # atau
     npx expo start --clear
     ```
   - Ini memastikan bundler tidak menyajikan file JavaScript lama yang rusak dari cache.
