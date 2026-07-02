# CONTEXT.md — Tumbuh Sehat (GiziChain)

## Gambaran Proyek

**GiziChain** (Gizi + Chain) adalah platform kesehatan anak berbasis web dan mobile yang membantu
orang tua dan tenaga medis mendeteksi risiko stunting secara dini. Sistem ini menggabungkan standar
klinis WHO dengan kecerdasan buatan (Google Gemini) untuk memberikan skrining, analisis gizi, dan
konsultasi yang mudah diakses — sekaligus menjamin integritas data rekam medis anak melalui
blockchain Polygon dan Verifiable Credentials (W3C VC).

Tagline: *"Data Gizi Anak: Teranalisis oleh AI, Dijamin oleh Blockchain."*

Platform ini bukan pengganti diagnosis medis. Setiap output AI wajib disertai disclaimer
dan anjuran konsultasi ke tenaga kesehatan.

---

## Arsitektur Baru (2026)

```
┌──────────────────────────────────────────┐
│              Supabase Cloud              │
│  ┌──────────┐  ┌────────┐  ┌─────────┐  │
│  │   Auth   │  │Postgres│  │ Storage │  │
│  │ (bawaan) │  │ + RLS  │  │ + RLS   │  │
│  └──────────┘  └────────┘  └─────────┘  │
│  ┌──────────┐  ┌────────┐               │
│  │ Realtime │  │ Edge   │               │
│  │ (WS)     │  │ Func   │               │
│  └──────────┘  └────────┘               │
└──────────────────────────────────────────┘
        ▲                    ▲
        │ supabase-js SDK    │ supabase-js SDK
        │ (service role)     │ (anon + RLS)
  ┌─────┴──────────┐  ┌─────┴──────────┐
  │   Next.js      │  │   Expo Mobile  │
  │  (Server       │  │  (Client       │
  │   Actions +    │  │   langsung     │
  │   API Routes)  │  │   ke DB via    │
  │                │  │   RLS)         │
  │ - Gemini AI    │  │                │
  │ - Web3 (RPC    │  │  - Camera      │
  │   token rahasia)│  │  - QR Scanner  │
  └────────────────┘  └────────────────┘
```

### Perubahan Besar dari Arsitektur Lama

| Aspek | Sebelum (Java) | Sesudah (Fullstack JS) |
|-------|---------------|----------------------|
| Backend | Spring Boot 3.2.0 (Java 17) | Next.js API Routes + Server Actions |
| Auth | JWT manual + Spring Security | Supabase Auth (built-in, RLS native) |
| DB | JPA/Hibernate + Flyway | Supabase PostgreSQL + RLS |
| Storage | REST client manual | Supabase Storage SDK |
| Realtime | WebSocket manual | Supabase Realtime (WS built-in) |
| AI Gemini | GeminiService.java | `@google/generative-ai` SDK |
| Blockchain | Web3j (Java) | Wagmi + ethers.js (frontend) |
| IPFS | IpfsService.java (Pinata REST) | Pinata SDK JS |
| PDF | iText (Java) | `@pdf-lib` atau `puppeteer` |
| Report | ReportService.java | Next.js API Route |

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
- Hanya bisa mengakses data anak miliknya sendiri (via RLS)
- Tidak bisa melihat data pasien lain

---

### MEDIC
Tenaga medis (dokter, bidan, ahli gizi).

**Akses:**
- Semua akses PARENT
- Dashboard daftar semua pasien yang terdaftar
- Melihat detail assessment dan prediksi semua anak
- Menambahkan catatan klinis pada assessment
- **Menerbitkan Verifiable Credential** untuk anak (butuh `walletAddress`)
- **Mencabut (revoke) VC** yang sudah diterbitkan
- Melihat ringkasan statistik populasi

**Batasan:**
- Tidak bisa mengubah data akun pengguna
- Tidak bisa mengakses fitur manajemen sistem

---

### POSYANDU
Petugas posyandu atau kader kesehatan.

**Akses:**
- Input data berat/tinggi rutin anak
- Scan QR untuk verifikasi VC anak
- Update status imunisasi

**Batasan:**
- Tidak bisa menerbitkan VC
- Tidak bisa melihat laporan prediksi AI lengkap

---

### ADMIN
Administrator sistem.

**Akses:**
- Semua akses MEDIC
- Manajemen akun pengguna (buat, nonaktifkan, ubah role)
- Peta sebaran stunting agregat per wilayah
- Laporan statistik agregat nasional/regional
- Konfigurasi sistem (jadwal imunisasi, threshold notifikasi)
- Dashboard transparansi blockchain (total anchor, total VC aktif)
- Monitor kesehatan chain (saldo wallet MATIC, status retry queue)

---

## Fitur Utama

### 1. Assessment Stunting
Form multi-step (5 langkah) yang mengumpulkan:
1. Data dasar anak — nama, tanggal lahir, jenis kelamin
2. Antropometri — berat badan, tinggi badan, lingkar kepala
3. Riwayat makan — ASI eksklusif, usia MPASI, frekuensi makan
4. Riwayat penyakit — infeksi berulang, diare, ISPA
5. Review & submit

### 2. Prediksi AI + Blockchain Anchoring
- Hitung z-score di backend berdasarkan standar WHO
- Kirim ke Gemini untuk interpretasi dan rekomendasi
- Hasilkan: status, risk level, ringkasan, rekomendasi, jadwal assessment berikutnya
- **Setelah prediksi selesai, hash SHA-256 dari data assessment di-anchor ke Polygon**
- Badge "✓ Terverifikasi di Blockchain" + link Polygonscan ditampilkan di hasil

### 3. Verifiable Credential (VC)
- Diterbitkan oleh MEDIC untuk anak setelah assessment
- Format: W3C Verifiable Credential JSON-LD
- Ditandatangani kriptografis, disimpan di IPFS (Pinata), CID dicatat di smart contract
- Orang tua mendapat QR code yang encode `{ vcCid, issuerDID, signature }`
- Mendukung verifikasi offline (validasi signature dari cache) dan online (query IPFS + chain)
- VC dapat dicabut (revoke) oleh issuer

### 4. Deteksi Gizi Foto Makanan
- Upload foto makanan via mobile atau web
- Foto disimpan ke Supabase Storage
- Gemini Vision menganalisis kandungan gizi
- Output: daftar makanan terdeteksi, estimasi kalori & makronutrien, rekomendasi

### 5. Chatbot Konsultasi
- Konteks berbasis data prediksi terakhir anak
- Riwayat percakapan disimpan di database
- Maksimal 10 pesan terakhir dikirim ke Gemini per request

### 6. Grafik Tumbuh Kembang
- Visualisasi BB, TB, lingkar kepala vs kurva WHO
- Filter per periode waktu
- Tersedia di web (Recharts) dan mobile

### 7. Laporan PDF
- Generate otomatis dari data assessment + prediksi
- **QR code VC tertanam** di laporan (jika VC tersedia)
- Bisa diunduh oleh PARENT, diakses MEDIC

### 8. Notifikasi Jadwal
- Pengingat jadwal assessment berikutnya
- Pengingat jadwal imunisasi
- Push notification di mobile, email di web

### 9. Lokasi Faskes Terdekat
- Integrasi Maps API
- Deteksi lokasi via GPS (mobile)
- Tampilkan puskesmas/posyandu terdekat

---

## Aturan Bisnis

1. Satu akun PARENT bisa mendaftarkan lebih dari satu anak
2. Assessment bersifat append-only — tidak bisa diedit setelah submit, hanya bisa ditambah assessment baru
3. Prediksi di-generate otomatis setelah assessment tersimpan (async)
4. Blockchain anchoring dilakukan async — tidak memblokir UI
5. Foto makanan maksimal 5 MB, format JPEG/PNG/WebP
6. Chatbot hanya bisa diakses jika anak sudah memiliki minimal 1 prediksi COMPLETED
7. Data agregat di dashboard ADMIN tidak boleh mengekspos data individu
8. Akun MEDIC dan ADMIN hanya bisa dibuat oleh ADMIN, tidak bisa self-register
9. **PII tidak pernah masuk ke chain** — chain hanya menyimpan hash & CID IPFS
10. **VC hanya boleh diterbitkan oleh MEDIC** yang memiliki `walletAddress` terdaftar
11. **QR VC tidak boleh diterbitkan** sebelum tx blockchain terkonfirmasi dan CID IPFS tersedia
12. VC dapat dicabut (revoke) oleh issuer — status revoke dicatat on-chain
13. **Semua akses client ke Supabase diamankan via RLS** — service_role key hanya dipakai di Next.js server

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

---

## Keunggulan Arsitektur Baru

| Aspek | Java Lama | Fullstack JS Baru |
|-------|-----------|-------------------|
| **Kecepatan develop** | Lambat — setup manual semua | Cepat — SDK siap pakai |
| **Auth** | JWT manual + 3 file security | Supabase Auth — 1 baris RLS |
| **Realtime** | WebSocket handler manual | Supabase Realtime — subscribe channel |
| **Storage** | REST client ke Supabase | SDK langsung dari client |
| **Jumlah backend** | 2 (Java + Next.js) | 1 (Next.js) |
| **Web3 library** | Web3j (java, jelek) | ethers.js / Wagmi (mature) |
| **Deploy** | Server VPS + config | Vercel + Supabase (0 server mgmt) |
| **Cocok lomba** | ❌ Overkill | ✅ Cepat hasil |
