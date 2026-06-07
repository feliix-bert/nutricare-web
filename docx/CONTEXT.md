# CONTEXT.md — Stunting AI Platform

## Gambaran Proyek

**Stunting AI** adalah platform kesehatan anak berbasis web dan mobile yang membantu orang tua
dan tenaga medis mendeteksi risiko stunting secara dini. Sistem ini menggabungkan standar klinis
WHO dengan kecerdasan buatan (Google Gemini) untuk memberikan skrining, analisis gizi, dan
konsultasi yang mudah diakses.

Platform ini bukan pengganti diagnosis medis. Setiap output AI wajib disertai disclaimer
dan anjuran konsultasi ke tenaga kesehatan.

---

## Domain & Batasan Klinis

### Target Populasi
Anak usia **0–60 bulan** (0–5 tahun).

### Standar Klinis yang Digunakan
- **WHO Child Growth Standards (2006)** — z-score cutoff klasifikasi status gizi
- **Kemenkes RI** — Jadwal imunisasi dasar, panduan MPASI 2023
- **IDAI** — Panduan tumbuh kembang anak Indonesia

### Klasifikasi Status Stunting (TB/U)
| Status | Z-score TB/U |
|--------|-------------|
| `NORMAL` | ≥ -2 SD |
| `AT_RISK` | -2 SD hingga -2.5 SD |
| `STUNTED` | < -2 SD |
| `SEVERELY_STUNTED` | < -3 SD |

### Klasifikasi Status Gizi Lainnya
| Indikator | Status | Z-score |
|-----------|--------|---------|
| BB/U | Underweight | < -2 SD |
| BB/TB | Wasting | < -2 SD |
| BB/TB | Overweight | > +2 SD |

### Aturan Klinis Wajib
1. **Z-score dihitung di server** menggunakan tabel WHO — tidak diserahkan ke AI
2. Gemini hanya berperan sebagai **interpreter & recommendation engine**, bukan kalkulator klinis
3. Setiap output prediksi **wajib menyertakan disclaimer**:
   > *"Hasil ini bersifat skrining awal dan bukan diagnosis medis. Konsultasikan dengan dokter atau tenaga kesehatan."*
4. Agen tidak boleh menyebut diagnosis definitif — gunakan frasa "berisiko" bukan "menderita"

---

## Role Pengguna Aplikasi

### PARENT
Orang tua atau wali anak.

**Akses:**
- Mendaftarkan dan mengelola data anak
- Mengisi form assessment stunting
- Melihat hasil prediksi dan riwayat assessment
- Menggunakan chatbot konsultasi
- Upload foto makanan untuk analisis gizi
- Melihat grafik tumbuh kembang anak
- Mengunduh laporan PDF

**Batasan:**
- Hanya bisa mengakses data anak miliknya sendiri
- Tidak bisa melihat data pasien lain

---

### MEDIC
Tenaga medis (dokter, bidan, ahli gizi).

**Akses:**
- Semua akses PARENT
- Dashboard daftar semua pasien yang terdaftar
- Melihat detail assessment dan prediksi semua anak
- Menambahkan catatan klinis pada assessment
- Melihat ringkasan statistik populasi

**Batasan:**
- Tidak bisa mengubah data akun pengguna
- Tidak bisa mengakses fitur manajemen sistem

---

### ADMIN
Administrator sistem.

**Akses:**
- Semua akses MEDIC
- Manajemen akun pengguna (buat, nonaktifkan, ubah role)
- Peta sebaran stunting agregat per wilayah
- Laporan statistik agregat nasional/regional
- Konfigurasi sistem (jadwal imunisasi, threshold notifikasi)

---

## Fitur Utama

### 1. Assessment Stunting
Form multi-step (5 langkah) yang mengumpulkan:
1. Data dasar anak — nama, tanggal lahir, jenis kelamin
2. Antropometri — berat badan, tinggi badan, lingkar kepala
3. Riwayat makan — ASI eksklusif, usia MPASI, frekuensi makan
4. Riwayat penyakit — infeksi berulang, diare, ISPA
5. Review & submit

### 2. Prediksi AI
- Hitung z-score di backend berdasarkan standar WHO
- Kirim ke Gemini untuk interpretasi dan rekomendasi
- Hasilkan: status, risk level, ringkasan, rekomendasi, jadwal assessment berikutnya

### 3. Deteksi Gizi Foto Makanan
- Upload foto makanan via mobile atau web
- Foto disimpan ke Supabase Storage
- Gemini Vision menganalisis kandungan gizi
- Output: daftar makanan terdeteksi, estimasi kalori & makronutrien, rekomendasi

### 4. Chatbot Konsultasi
- Konteks berbasis data prediksi terakhir anak
- Riwayat percakapan disimpan di database
- Maksimal 10 pesan terakhir dikirim ke Gemini per request

### 5. Grafik Tumbuh Kembang
- Visualisasi BB, TB, lingkar kepala vs kurva WHO
- Filter per periode waktu
- Tersedia di web (Recharts) dan mobile

### 6. Laporan PDF
- Generate otomatis dari data assessment + prediksi
- Bisa diunduh oleh PARENT, diakses MEDIC

### 7. Notifikasi Jadwal
- Pengingat jadwal assessment berikutnya
- Pengingat jadwal imunisasi
- Push notification di mobile, email di web

### 8. Lokasi Faskes Terdekat
- Integrasi Maps API
- Deteksi lokasi via GPS (mobile)
- Tampilkan puskesmas/posyandu terdekat

---

## Aturan Bisnis

1. Satu akun PARENT bisa mendaftarkan lebih dari satu anak
2. Assessment bersifat append-only — tidak bisa diedit setelah submit, hanya bisa ditambah assessment baru
3. Prediksi di-generate otomatis setelah assessment tersimpan (async)
4. Foto makanan maksimal 5 MB, format JPEG/PNG/WebP
5. Chatbot hanya bisa diakses jika anak sudah memiliki minimal 1 prediksi
6. Data agregat di dashboard ADMIN tidak boleh mengekspos data individu
7. Akun MEDIC dan ADMIN hanya bisa dibuat oleh ADMIN, tidak bisa self-register

---

## Batasan Domain AI

Sistem **hanya** menjawab pertanyaan dalam domain:
- Tumbuh kembang anak usia 0–60 bulan
- Gizi dan pola makan bayi/balita
- Stunting, wasting, underweight berbasis standar WHO
- Jadwal imunisasi Kemenkes Indonesia
- Rekomendasi MPASI dan ASI

Sistem **tidak menjawab**:
- Pertanyaan medis di luar domain anak (penyakit dewasa, obat resep)
- Topik non-kesehatan
- Permintaan yang mengekspos data pasien lain

Respons default untuk pertanyaan di luar domain:
> *"Pertanyaan ini di luar cakupan aplikasi. Untuk pertanyaan medis lebih lanjut, silakan konsultasi langsung dengan dokter atau bidan."*
