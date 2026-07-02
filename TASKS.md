# TASKS.md — GiziChain Migration

> **Status:** 🟢 Documentasi selesai, eksekusi dimulai
> **Target:** Java Spring Boot → Next.js + Supabase + Expo
> **Last updated:** 2026-07-02

---

## Fase 0: Prasyarat

- [ ] **0.1** Buat project Next.js (App Router) di `/desktop`
  - `npx create-next-app@latest desktop --typescript --tailwind --app`
- [ ] **0.2** Buat project Supabase (via dashboard.supabase.com)
  - Catat: Project URL, anon key, service_role key
- [ ] **0.3** Setup env variables Next.js
  ```
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  GEMINI_API_KEY=
  ```
- [ ] **0.4** Setup env variables Expo Mobile
  ```
  EXPO_PUBLIC_SUPABASE_URL=
  EXPO_PUBLIC_SUPABASE_ANON_KEY=
  EXPO_PUBLIC_API_URL=http://localhost:3000
  ```
- [ ] **0.5** Install dependencies Next.js
  - `@supabase/supabase-js`, `@google/generative-ai`, `wagmi`, `viem`, `ethers`
- [ ] **0.6** Install dependencies Mobile
  - `@supabase/supabase-js`, `@supabase/ssr`

---

## Fase 1: Database & Auth

- [ ] **1.1** Jalankan SQL migration — buat semua enum types
  - `role_enum`, `gender_enum`, `stunt_enum`, `pred_status_enum`, `anchor_enum`, `vc_type_enum`
- [ ] **1.2** Jalankan SQL migration — buat tabel `public.users` + trigger `handle_new_user()`
- [ ] **1.3** Jalankan SQL migration — buat tabel:
  - `children`, `assessments`, `predictions`, `nutrition_logs`, `chat_sessions`, `blockchain_anchors`, `verifiable_credentials`
- [ ] **1.4** Jalankan SQL migration — buat indexes
- [ ] **1.5** Setup RLS policies di semua tabel:
  - `users`: read own, admin all
  - `children`: parent → own, medic/admin → all
  - `assessments`: parent → own children, medic/admin → all
  - `predictions`: parent → own children, medic/admin → all
  - `nutrition_logs`: parent → own children, medic/admin → all
  - `chat_sessions`: parent → own, medic/admin → all
- [ ] **1.6** Setup Supabase Auth:
  - Disable signup without email confirm (sesuai kebutuhan)
  - Atur Site URL untuk redirect
- [ ] **1.7** Buat `lib/supabase/client.ts` di Next.js
  - Browser client (anon key + RLS)
- [ ] **1.8** Buat `lib/supabase/server.ts` di Next.js
  - Server client (service_role key)
  - Dipakai di API Routes admin/blockchain/gemini
- [ ] **1.9** Buat `services/supabase.ts` di Mobile
  - SecureStore untuk session persist

---

## Fase 2: Auth Flow

- [ ] **2.1** Halaman Register (Next.js + Expo)
  - `supabase.auth.signUp()` + handle error
- [ ] **2.2** Halaman Login (Next.js + Expo)
  - `supabase.auth.signInWithPassword()`
- [ ] **2.3** Logout handler
- [ ] **2.4** Auth state listener + redirect logic
  - `supabase.auth.onAuthStateChange()`
- [ ] **2.5** Protected route middleware (Next.js)
  - `middleware.ts` — cek session sebelum akses halaman
- [ ] **2.6** Protected route guard (Expo)
  - Auth gate di root layout

---

## Fase 3: Core CRUD (client → Supabase langsung)

- [ ] **3.1** Children CRUD
  - Tambah, lihat daftar, detail, edit anak
- [ ] **3.2** Assessments — insert + validasi
  - Validasi range: weight(0.5-50), height(30-130), meal_freq(1-10)
- [ ] **3.3** Assessments — riwayat + detail dengan join predictions
- [ ] **3.4** Nutrition logs — riwayat per anak
- [ ] **3.5** Chat sessions — get history
- [ ] **3.6** VC list — lihat VC terbit

---

## Fase 4: Z-Score Calculator (port dari Java)

- [ ] **4.1** Port `ZScoreCalculator.java` → `lib/zscore.ts`
  - Tabel referensi WHO (BB/U, TB/U, BB/TB)
  - Fungsi `calculateZScoreWA()`, `calculateZScoreHA()`, `calculateZScoreWH()`
  - Fungsi `classifyStunting(zscoreHA)`
- [ ] **4.2** Unit test z-score functions
  - Bandingkan output dengan Java original
- [ ] **4.3** Port `GrowthChartData.java` → `lib/growth-chart.ts`
  - Kurva WHO untuk grafik

---

## Fase 5: Gemini AI (Next.js API Routes)

- [ ] **5.1** `POST /api/gemini/predict`
  - Terima assessmentId
  - Hitung z-score (panggil lib/zscore.ts)
  - Kirim data + z-score ke Gemini
  - Insert hasil ke tabel `predictions`
  - Trigger blockchain anchor setelah sukses
- [ ] **5.2** `POST /api/gemini/nutrition`
  - Terima photoUrl + childId
  - Kirim ke Gemini Vision
  - Return data nutrisi
- [ ] **5.3** `POST /api/gemini/chat`
  - Terima predictionId + message
  - Load context prediksi
  - Kirim ke Gemini + simpan ke chat_sessions
- [ ] **5.4** Error handling + retry logic
  - Gemini failure → prediction_status = FAILED
  - Exponential backoff optional

---

## Fase 6: Blockchain (Next.js API Routes + Wagmi)

- [ ] **6.1** Setup Wagmi provider di Next.js
  - Provider config untuk Polygon Amoy + Mumbai
- [ ] **6.2** `POST /api/blockchain/anchor`
  - Generate SHA-256 hash dari assessment data
  - Call smart contract GiziChainRegistry
  - Simpan tx_hash, block_number ke `blockchain_anchors`
- [ ] **6.3** `GET /api/blockchain/verify/:assessmentId`
  - Bandingkan hash on-chain vs DB
- [ ] **6.4** Smart contract (Solidity)
  - Deploy GiziChainRegistry ke Polygon Amoy
  - Fungsi: `anchorRecord(hash)`, `getRecord(id) → hash`, `verifyRecord(id, hash) → bool`

---

## Fase 7: Verifiable Credentials (Next.js API Routes)

- [ ] **7.1** `POST /api/vc/issue`
  - Generate VC JSON-LD (W3C format)
  - Upload ke IPFS via Pinata SDK
  - Call smart contract VCRegistry
  - Simpan ke tabel `verifiable_credentials`
- [ ] **7.2** `POST /api/vc/revoke`
  - Update is_revoked = true
  - Catat revoke_tx_hash
- [ ] **7.3** QR Code generation untuk VC
  - Encode `{ vcCid, issuerDID, signature }`

---

## Fase 8: Storage & Reports

- [ ] **8.1** Setup Supabase Storage bucket
  - `food-photos` — public read, authenticated write
  - RLS policy: hanya parent anak itu bisa upload
- [ ] **8.2** Upload photo flow (client → Storage langsung)
- [ ] **8.3** `GET /api/reports/:childId`
  - Generate PDF (puppeteer atau @pdf-lib)
  - Embed QR code VC jika ada
  - Download response

---

## Fase 9: Mobile Cleanup

- [ ] **9.1** Hapus file yang tidak dipakai:
  - ~~`services/api.ts`~~ (pindah ke supabase-js)
  - ~~`services/auth.ts`~~ (pindah ke supabase.auth)
  - ~~`services/assessment.ts`~~ (pindah)
  - ~~`services/nutrition.ts`~~ (pindah)
  - ~~`services/chat.ts`~~ (pindah)
  - ~~`services/storage.ts`~~ (pindah ke supabase.storage)
- [ ] **9.2** Hapus ~~`stores/authStore.ts`~~ (diganti `supabase.auth.onAuthStateChange`)
- [ ] **9.3** Update hooks — ganti panggilan API → supabase-js
- [ ] **9.4** Test semua fitur mobile dengan Supabase langsung

---

## Fase 10: Admin Dashboard (Next.js)

- [ ] **10.1** `POST /api/admin/users` — buat user (service_role)
- [ ] **10.2** `PATCH /api/admin/users/:id/status` — nonaktifkan
- [ ] **10.3** `PATCH /api/admin/users/:id/role` — ubah role
- [ ] **10.4** `GET /api/admin/stats` — statistik agregat
- [ ] **10.5** Halaman admin — tabel user + filter + action

---

## Fase 11: Deploy

- [ ] **11.1** Deploy smart contract ke Polygon Amoy (testnet)
- [ ] **11.2** Deploy Next.js ke Vercel
- [ ] **11.3** Setup Supabase production (bukan local)
- [ ] **11.4** Setup custom domain (opsional)
- [ ] **11.5** Test end-to-end di production

---

## Progress Tracker

| Fase | Task Total | Selesai | % |
|------|-----------|---------|---|
| 0 Prasyarat | 6 | 0 | 0% |
| 1 Database & Auth | 9 | 0 | 0% |
| 2 Auth Flow | 6 | 0 | 0% |
| 3 Core CRUD | 6 | 0 | 0% |
| 4 Z-Score Port | 3 | 0 | 0% |
| 5 Gemini AI | 4 | 0 | 0% |
| 6 Blockchain | 4 | 0 | 0% |
| 7 VC | 3 | 0 | 0% |
| 8 Storage & Reports | 3 | 0 | 0% |
| 9 Mobile Cleanup | 4 | 0 | 0% |
| 10 Admin Dashboard | 5 | 0 | 0% |
| 11 Deploy | 5 | 0 | 0% |
| **Total** | **58** | **0** | **0%** |

---

## Catatan

- Checklist diisi manual — ganti `[ ]` jadi `[x]` pas selesai
- Tiap task selesai → update progress tracker
- Jangan skip Fase 0 — prasyarat wajib sebelum ngapa-ngapain
- Urutan fase by design — nomor kecil duluan
