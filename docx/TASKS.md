# TASKS.md — Tumbuh Sehat

## Pembagian Tim Developer

| Tim | Stack | Scope |
|-----|-------|-------|
| **Backend Dev** | Spring Boot, PostgreSQL, Gemini API | REST API, business logic, auth, AI integration |
| **Web Dev** | Next.js, TypeScript, Tailwind CSS | Frontend web, konsumsi API, UI/UX |
| **Mobile Dev** | React Native, TypeScript, Expo | Aplikasi mobile iOS/Android |

> Setiap task memiliki ID unik untuk tracking. Format: `[BE/WEB/MOB]-[nomor]`

---

## PHASE 0 — Setup & Infrastruktur

### Backend Dev

| ID | Task | Prioritas | Dependensi |
|----|------|-----------|-----------|
| BE-001 | Setup project Spring Boot (dependencies, struktur package) | 🔴 Critical | — |
| BE-002 | Konfigurasi koneksi Supabase PostgreSQL + HikariCP | 🔴 Critical | BE-001 |
| BE-003 | Setup Liquibase / Flyway untuk database migration | 🔴 Critical | BE-002 |
| BE-004 | Buat semua tabel via migration (sesuai ERD.md) | 🔴 Critical | BE-003 |
| BE-005 | Setup Spring Security + JWT filter chain | 🔴 Critical | BE-001 |
| BE-006 | Konfigurasi CORS untuk Next.js dan React Native | 🔴 Critical | BE-005 |
| BE-007 | Setup global exception handler (`@ControllerAdvice`) | 🟡 High | BE-001 |
| BE-008 | Konfigurasi Supabase Storage client | 🟡 High | BE-001 |

### Web Dev

| ID | Task | Prioritas | Dependensi |
|----|------|-----------|-----------|
| WEB-001 | Setup project Next.js (App Router, TypeScript, Tailwind) | 🔴 Critical | — |
| WEB-002 | Setup TanStack Query + Axios/fetch instance (base URL, interceptor token) | 🔴 Critical | WEB-001 |
| WEB-003 | Setup Zustand store (auth state, form state) | 🔴 Critical | WEB-001 |
| WEB-004 | Setup folder struktur dan routing App Router | 🟡 High | WEB-001 |

### Mobile Dev

| ID | Task | Prioritas | Dependensi |
|----|------|-----------|-----------|
| MOB-001 | Setup project React Native / Expo (TypeScript) | 🔴 Critical | — |
| MOB-002 | Setup React Navigation (stack + tab navigator) | 🔴 Critical | MOB-001 |
| MOB-003 | Setup TanStack Query + Axios instance (base URL, interceptor) | 🔴 Critical | MOB-001 |
| MOB-004 | Setup Zustand store | 🔴 Critical | MOB-001 |
| MOB-005 | Setup expo-secure-store untuk JWT | 🔴 Critical | MOB-001 |

---

## PHASE 1 — Autentikasi

### Backend Dev

| ID | Task | Prioritas | Dependensi |
|----|------|-----------|-----------|
| BE-101 | Implementasi `POST /api/auth/register` | 🔴 Critical | BE-004, BE-005 |
| BE-102 | Implementasi `POST /api/auth/login` (generate access + refresh token) | 🔴 Critical | BE-101 |
| BE-103 | Implementasi `POST /api/auth/refresh` | 🔴 Critical | BE-102 |
| BE-104 | Implementasi `POST /api/auth/logout` (revoke refresh token) | 🟡 High | BE-103 |
| BE-105 | Implementasi `GET /api/auth/me` | 🟡 High | BE-102 |
| BE-106 | Unit test: AuthService (register, login, token validation) | 🟡 High | BE-102 |

### Web Dev

| ID | Task | Prioritas | Dependensi |
|----|------|-----------|-----------|
| WEB-101 | Halaman Login (`/login`) — form, validasi, error state | 🔴 Critical | WEB-002, BE-102 |
| WEB-102 | Halaman Register (`/register`) — form, validasi | 🔴 Critical | WEB-002, BE-101 |
| WEB-103 | Auth guard (redirect ke login jika tidak ada token) | 🔴 Critical | WEB-101 |
| WEB-104 | Auto-refresh token (intercept 401, hit refresh endpoint) | 🔴 Critical | WEB-102, BE-103 |
| WEB-105 | Logout (hapus token, redirect ke login) | 🟡 High | WEB-101, BE-104 |
| WEB-106 | Persistent auth state (token di httpOnly cookie atau memory) | 🟡 High | WEB-101 |

### Mobile Dev

| ID | Task | Prioritas | Dependensi |
|----|------|-----------|-----------|
| MOB-101 | Screen Login — form, validasi, error state | 🔴 Critical | MOB-003, BE-102 |
| MOB-102 | Screen Register | 🔴 Critical | MOB-003, BE-101 |
| MOB-103 | Simpan JWT ke SecureStore setelah login | 🔴 Critical | MOB-101 |
| MOB-104 | Auth flow (splash screen cek token → login / home) | 🔴 Critical | MOB-103 |
| MOB-105 | Auto-refresh token | 🔴 Critical | MOB-104, BE-103 |
| MOB-106 | Logout (hapus token dari SecureStore) | 🟡 High | MOB-103, BE-104 |

---

## PHASE 2 — Manajemen Data Anak

### Backend Dev

| ID | Task | Prioritas | Dependensi |
|----|------|-----------|-----------|
| BE-201 | Implementasi `GET /api/children` (filter by userId untuk PARENT) | 🔴 Critical | BE-101 |
| BE-202 | Implementasi `POST /api/children` | 🔴 Critical | BE-201 |
| BE-203 | Implementasi `GET /api/children/{childId}` + ownership check | 🔴 Critical | BE-202 |
| BE-204 | Implementasi `PUT /api/children/{childId}` | 🟡 High | BE-203 |
| BE-205 | Unit test: ChildService (CRUD + ownership validation) | 🟡 High | BE-203 |

### Web Dev

| ID | Task | Prioritas | Dependensi |
|----|------|-----------|-----------|
| WEB-201 | Halaman daftar anak (`/dashboard`) — card list, loading state | 🔴 Critical | WEB-103, BE-201 |
| WEB-202 | Modal / halaman tambah anak — form nama, tanggal lahir, jenis kelamin | 🔴 Critical | WEB-201, BE-202 |
| WEB-203 | Halaman detail anak (`/children/[id]`) — info + tab riwayat | 🟡 High | WEB-202, BE-203 |
| WEB-204 | Edit data anak | 🟢 Medium | WEB-203, BE-204 |

### Mobile Dev

| ID | Task | Prioritas | Dependensi |
|----|------|-----------|-----------|
| MOB-201 | Screen Home — daftar anak (list card), empty state | 🔴 Critical | MOB-104, BE-201 |
| MOB-202 | Screen Tambah Anak — form + validasi | 🔴 Critical | MOB-201, BE-202 |
| MOB-203 | Screen Detail Anak — info dasar + tab navigator | 🟡 High | MOB-202, BE-203 |
| MOB-204 | Edit data anak | 🟢 Medium | MOB-203, BE-204 |

---

## PHASE 3 — Assessment & Prediksi Stunting

### Backend Dev

| ID | Task | Prioritas | Dependensi |
|----|------|-----------|-----------|
| BE-301 | Implementasi kalkulasi z-score WHO (BB/U, TB/U, BB/TB) | 🔴 Critical | BE-004 |
| BE-302 | Implementasi `POST /api/assessments` (simpan + trigger prediksi async) | 🔴 Critical | BE-301 |
| BE-303 | Implementasi PredictionService (build prompt, call Gemini, parse JSON, simpan) | 🔴 Critical | BE-302 |
| BE-304 | Implementasi `GET /api/assessments/{id}` | 🔴 Critical | BE-302 |
| BE-305 | Implementasi `GET /api/assessments/child/{childId}` | 🟡 High | BE-302 |
| BE-306 | Implementasi retry logic untuk prediksi `PENDING` (scheduled job) | 🟡 High | BE-303 |
| BE-307 | Unit test: ZScoreCalculator (semua range usia, semua indikator) | 🔴 Critical | BE-301 |
| BE-308 | Unit test: PredictionService (mock Gemini, validasi output) | 🟡 High | BE-303 |

### Web Dev

| ID | Task | Prioritas | Dependensi |
|----|------|-----------|-----------|
| WEB-301 | Form assessment multi-step (5 langkah) — state Zustand | 🔴 Critical | WEB-203, BE-302 |
| WEB-302 | Step 1: Data dasar — validasi nama, tanggal lahir, jenis kelamin | 🔴 Critical | WEB-301 |
| WEB-303 | Step 2: Antropometri — validasi range berat, tinggi, lingkar kepala | 🔴 Critical | WEB-301 |
| WEB-304 | Step 3: Riwayat makan | 🔴 Critical | WEB-301 |
| WEB-305 | Step 4: Riwayat penyakit | 🔴 Critical | WEB-301 |
| WEB-306 | Step 5: Review & submit | 🔴 Critical | WEB-302 – WEB-305 |
| WEB-307 | Halaman hasil prediksi — z-score + interpretasi + rekomendasi + disclaimer | 🔴 Critical | WEB-306, BE-304 |
| WEB-308 | Polling status prediksi (saat masih PENDING) | 🟡 High | WEB-307 |
| WEB-309 | Grafik tumbuh kembang (Recharts) vs kurva WHO | 🟡 High | WEB-307, BE-305 |

### Mobile Dev

| ID | Task | Prioritas | Dependensi |
|----|------|-----------|-----------|
| MOB-301 | Flow assessment multi-step (React Navigation stack) | 🔴 Critical | MOB-203, BE-302 |
| MOB-302 | Screen Step 1–4 assessment (form + validasi) | 🔴 Critical | MOB-301 |
| MOB-303 | Screen Review & Submit | 🔴 Critical | MOB-302 |
| MOB-304 | Screen Hasil Prediksi — z-score, status, rekomendasi, disclaimer | 🔴 Critical | MOB-303, BE-304 |
| MOB-305 | Loading state prediksi PENDING + auto-refresh | 🟡 High | MOB-304 |
| MOB-306 | Grafik tumbuh kembang (Victory Native / Gifted Charts) | 🟡 High | MOB-304 |

---

## PHASE 4 — Deteksi Gizi Foto Makanan

### Backend Dev

| ID | Task | Prioritas | Dependensi |
|----|------|-----------|-----------|
| BE-401 | Implementasi upload foto ke Supabase Storage | 🔴 Critical | BE-008 |
| BE-402 | Implementasi NutritionService (paralel upload + Gemini Vision) | 🔴 Critical | BE-401 |
| BE-403 | Implementasi `POST /api/nutrition` (multipart) | 🔴 Critical | BE-402 |
| BE-404 | Implementasi `GET /api/nutrition/child/{childId}` | 🟡 High | BE-403 |
| BE-405 | Validasi file (tipe MIME, ukuran maks 5 MB) | 🔴 Critical | BE-403 |

### Web Dev

| ID | Task | Prioritas | Dependensi |
|----|------|-----------|-----------|
| WEB-401 | Halaman upload foto makanan — drag & drop / file picker | 🟡 High | WEB-203, BE-403 |
| WEB-402 | Preview foto sebelum upload | 🟡 High | WEB-401 |
| WEB-403 | Tampilkan hasil analisis gizi — food detected, tabel nutrisi, rekomendasi | 🟡 High | WEB-401, BE-403 |
| WEB-404 | Riwayat log gizi (list + foto thumbnail) | 🟢 Medium | WEB-403, BE-404 |

### Mobile Dev

| ID | Task | Prioritas | Dependensi |
|----|------|-----------|-----------|
| MOB-401 | Screen kamera / galeri untuk foto makanan | 🔴 Critical | MOB-203, BE-403 |
| MOB-402 | Preview foto + tombol submit | 🟡 High | MOB-401 |
| MOB-403 | Screen hasil analisis gizi | 🟡 High | MOB-402, BE-403 |
| MOB-404 | Riwayat log gizi | 🟢 Medium | MOB-403, BE-404 |

---

## PHASE 5 — Chatbot Konsultasi

### Backend Dev

| ID | Task | Prioritas | Dependensi |
|----|------|-----------|-----------|
| BE-501 | Implementasi ChatService (build context, call Gemini, simpan session) | 🟡 High | BE-303 |
| BE-502 | Implementasi `POST /api/chat` | 🟡 High | BE-501 |
| BE-503 | Implementasi `GET /api/chat/{predictionId}` | 🟡 High | BE-502 |
| BE-504 | Guard: chatbot hanya aktif jika prediction status = COMPLETED | 🟡 High | BE-502 |

### Web Dev

| ID | Task | Prioritas | Dependensi |
|----|------|-----------|-----------|
| WEB-501 | UI chat bubble (user vs assistant) | 🟡 High | WEB-307, BE-502 |
| WEB-502 | Input pesan + kirim (enter / tombol) | 🟡 High | WEB-501 |
| WEB-503 | Loading state saat menunggu balasan AI | 🟡 High | WEB-502 |
| WEB-504 | Suggested questions (chip tombol) | 🟢 Medium | WEB-502 |
| WEB-505 | Riwayat chat persistent (load dari server) | 🟢 Medium | WEB-501, BE-503 |

### Mobile Dev

| ID | Task | Prioritas | Dependensi |
|----|------|-----------|-----------|
| MOB-501 | Screen Chat — bubble list, input, send button | 🟡 High | MOB-304, BE-502 |
| MOB-502 | Loading indicator saat AI membalas | 🟡 High | MOB-501 |
| MOB-503 | Suggested questions | 🟢 Medium | MOB-501 |
| MOB-504 | Riwayat chat persistent | 🟢 Medium | MOB-501, BE-503 |

---

## PHASE 6 — Fitur Tambahan

### Backend Dev

| ID | Task | Prioritas | Dependensi |
|----|------|-----------|-----------|
| BE-601 | Implementasi `GET /api/reports/child/{childId}` (generate PDF di server) | 🟢 Medium | BE-305 |
| BE-602 | Implementasi `GET /api/medic/patients` + pagination + filter | 🟢 Medium | BE-201 |
| BE-603 | Implementasi `GET /api/medic/patients/{childId}/summary` | 🟢 Medium | BE-602 |
| BE-604 | Implementasi seluruh endpoint `/api/admin/**` | 🟢 Medium | BE-101 |
| BE-605 | Scheduled job: notifikasi jadwal assessment berikutnya | 🔵 Low | BE-302 |

### Web Dev

| ID | Task | Prioritas | Dependensi |
|----|------|-----------|-----------|
| WEB-601 | Tombol download laporan PDF | 🟢 Medium | WEB-307, BE-601 |
| WEB-602 | Dashboard MEDIC — tabel pasien, search, filter | 🟢 Medium | WEB-103, BE-602 |
| WEB-603 | Dashboard ADMIN — statistik agregat, peta sebaran | 🔵 Low | WEB-602, BE-604 |
| WEB-604 | Halaman lokasi faskes terdekat (Google Maps embed) | 🔵 Low | — |
| WEB-605 | Manajemen user (ADMIN) | 🔵 Low | BE-604 |

### Mobile Dev

| ID | Task | Prioritas | Dependensi |
|----|------|-----------|-----------|
| MOB-601 | Screen laporan PDF (viewer atau download) | 🟢 Medium | MOB-304, BE-601 |
| MOB-602 | Push notification — jadwal assessment & imunisasi | 🟢 Medium | MOB-001 |
| MOB-603 | Screen lokasi faskes terdekat (Maps + GPS) | 🟢 Medium | — |
| MOB-604 | Offline mode — cache hasil prediksi terakhir | 🔵 Low | MOB-304 |

---

## PHASE 7 — Blockchain & Verifiable Credential

### Backend Dev

| ID | Task | Prioritas | Dependensi |
|----|------|-----------|-----------|
| BE-701 | Setup Web3j dependency + Polygon RPC config | 🔴 Critical | BE-001 |
| BE-702 | Deploy smart contracts GiziChainRegistry + VCRegistry ke testnet | 🔴 Critical | — |
| BE-703 | Implementasi BlockchainService (anchorRecord + verifyRecord) | 🔴 Critical | BE-701, BE-702 |
| BE-704 | Implementasi `POST /api/blockchain/anchor` (internal, dipanggil server) | 🔴 Critical | BE-703, BE-303 |
| BE-705 | Implementasi `GET /api/blockchain/verify/{assessmentId}` | 🟡 High | BE-703 |
| BE-706 | Setup Pinata client + IpfsService (upload & pin JSON) | 🟡 High | — |
| BE-707 | Implementasi VcService (build VC document, sign, issue, revoke) | 🔴 Critical | BE-706, BE-702 |
| BE-708 | Implementasi `POST /api/vc/issue` | 🔴 Critical | BE-707 |
| BE-709 | Implementasi `GET /api/vc/{vcId}` | 🟡 High | BE-707 |
| BE-710 | Implementasi `POST /api/vc/revoke` | 🟡 High | BE-707 |
| BE-711 | QR code generator + offline signature verification | 🟡 High | BE-707 |
| BE-712 | Implementasi `GET /api/verify` (publik, verifikasi QR) | 🟡 High | BE-711 |
| BE-713 | Migration DB: tambah kolom `wallet_address` di users | 🔴 Critical | BE-004 |
| BE-714 | Migration DB: tambah kolom `anon_id` di children | 🔴 Critical | BE-004 |
| BE-715 | Migration DB: buat tabel `blockchain_anchors` | 🔴 Critical | BE-004 |
| BE-716 | Migration DB: buat tabel `verifiable_credentials` | 🔴 Critical | BE-004 |
| BE-717 | Buat enums: `anchor_status_enum`, `vc_type_enum` | 🔴 Critical | BE-004 |
| BE-718 | Retry job untuk anchor PENDING (Vercel Cron / scheduler tiap 5 menit) | 🟢 Medium | BE-704 |
| BE-719 | Alert system jika saldo MATIC wallet di bawah threshold | 🟢 Medium | BE-703 |
| BE-720 | Unit test: BlockchainService (mock RPC) | 🟡 High | BE-703 |
| BE-721 | Unit test: VcService (mock IPFS + blockchain) | 🟡 High | BE-707 |

### Web Dev

| ID | Task | Prioritas | Dependensi |
|----|------|-----------|-----------|
| WEB-701 | Badge "✓ Terverifikasi di Blockchain" + link Polygonscan di hasil prediksi | 🔴 Critical | WEB-307, BE-704 |
| WEB-702 | Halaman verifikasi VC publik (`/verify`) — input QR / scan | 🟡 High | BE-712 |
| WEB-703 | Tampilkan status VC anak di detail anak (active / revoked) | 🟡 High | WEB-203, BE-709 |
| WEB-704 | Dashboard ADMIN — statistik blockchain (total anchor, VC aktif) | 🟢 Medium | WEB-603, BE-604 |

### Mobile Dev

| ID | Task | Prioritas | Dependensi |
|----|------|-----------|-----------|
| MOB-701 | QR code scanner untuk verifikasi VC | 🟡 High | MOB-203, BE-712 |
| MOB-702 | Screen hasil verifikasi QR (valid / revoked / expired) | 🟡 High | MOB-701 |
| MOB-703 | Tampilkan status VC anak di detail anak | 🟢 Medium | MOB-203, BE-709 |
| MOB-704 | Cache VC terakhir untuk verifikasi offline | 🟢 Medium | MOB-702 |

---

## Legenda Prioritas

| Simbol | Level | Keterangan |
|--------|-------|------------|
| 🔴 | Critical | Blocker — harus selesai sebelum fitur lain bisa jalan |
| 🟡 | High | Penting untuk MVP |
| 🟢 | Medium | Fitur lengkap, bisa diiterate |
| 🔵 | Low | Nice to have, bisa di-sprint berikutnya |

---

## Urutan Sprint yang Disarankan

```
Sprint 1  →  Phase 0 (setup) + Phase 1 (auth)
Sprint 2  →  Phase 2 (data anak) + Phase 3 (assessment & prediksi)
Sprint 3  →  Phase 4 (foto gizi) + Phase 5 (chatbot)
Sprint 4  →  Phase 6 (laporan, dashboard, notifikasi)
Sprint 5  →  Phase 7 (blockchain & VC) — deploy contract, migration, anchor, VC issue/verify
```
