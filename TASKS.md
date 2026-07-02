# TASKS.md — GiziChain Desktop (Next.js)

> **Status:** Documentasi selesai, eksekusi dimulai
> **Target:** Java Spring Boot → Next.js + Supabase
> **Last updated:** 2026-07-02

---

## Fase 0: Prasyarat

- [x] **0.1** Setup project Next.js — *Next.js 16.2.6 + React 19 (done)*
- [x] **0.2** Install dependencies inti
  ```bash
  npm install @supabase/supabase-js @supabase/ssr      # ✅
  # @google/generative-ai, wagmi, viem, @tanstack/react-query ✅ already in package.json
  ```
- [x] **0.3** Setup env variables — *`.env` updated with Supabase URL + ANON_KEY*
- [ ] **0.4** Setup Supabase project — *URL exists, need service_role key from dashboard*
- [x] **0.5** Setup folder structure — *`src/lib/supabase/client.ts`, `server.ts`, `src/types/supabase.ts`, `supabase/migrations/`*

---

## Fase 1: Database Migration

- [x] **1.1** SQL — 6 enum types ✅
- [x] **1.2** SQL — trigger `handle_new_user()` + `public.users` ✅
- [x] **1.3** SQL — 8 tabel ✅
- [x] **1.4** SQL — indexes ✅
- [x] **1.5** SQL — RLS policies semua tabel ✅
  - `users`: read own, admin all
  - `children`: parent → own children, medic/admin → all
  - `assessments`: parent → own children, medic/admin → all
  - `predictions`: parent → own children, medic/admin → all
  - `nutrition_logs`: parent → own children, medic/admin → all
  - `chat_sessions`: parent → own, medic/admin → all
  - `blockchain_anchors`: insert by server, read own
  - `verifiable_credentials`: medic insert, parent read own

---

## Fase 2: Supabase Client Setup

- [x] **2.1** `lib/supabase/client.ts` — browser client ✅
- [x] **2.2** `lib/supabase/server.ts` — server client ✅
- [x] **2.3** `middleware.ts` — session refresh + redirect ✅
- [ ] **2.4** Types — generate dari Supabase (manual dulu, regenerate via CLI nanti)

---

## Fase 3: Auth UI

- [x] **3.1** Halaman `/auth/sign-in` — email + password ✅ (Supabase Auth)
- [x] **3.2** Halaman `/auth/register` — nama + email + password ✅ (Supabase Auth)
- [ ] **3.3** Halaman `/auth/callback` — handle email confirmation redirect
- [x] **3.4** Auth provider — `SupabaseAuthListener` + Zustand store ✅
- [x] **3.5** Protected route — `middleware.ts` redirect ke /auth/sign-in ✅

---

## Fase 4: Core CRUD (langsung ke Supabase via RLS)

- [x] **4.1** Service layer → Supabase langsung (children, assessment, nutrition, medic, chat)
- [ ] **4.2** `/children/[id]` — detail anak + riwayat assessment
- [ ] **4.3** `/children/[id]/edit` — edit data anak
- [ ] **4.4** `/assessments/[id]` — detail assessment + prediksi
- [ ] **4.5** `/nutrition` — riwayat log makanan (read-only)
- [ ] **4.6** Notification bell — jadwal assessment berikutnya

---

## Fase 5: Z-Score Calculator (port dari Java)

- [ ] **5.1** `lib/zscore.ts`
  - Tabel referensi WHO (BB/U, TB/U, BB/TB)
  - Fungsi `calculateZScoreWA(weight, age, gender)`
  - Fungsi `calculateZScoreHA(height, age, gender)`
  - Fungsi `calculateZScoreWH(weight, height, gender)`
  - Fungsi `classifyStunting(zscoreHA)` → `stunt_enum`
- [ ] **5.2** Test — bandingkan output dengan Java original

---

## Fase 6: Gemini AI Integration

- [ ] **6.1** `app/api/gemini/predict/route.ts`
  - Terima `assessmentId`
  - Hitung z-score via `lib/zscore.ts`
  - Prompt ke Gemini: data assessment + z-score → interpretasi + rekomendasi
  - Insert ke `predictions` table
  - Trigger blockchain anchor async
- [ ] **6.2** `app/api/gemini/nutrition/route.ts`
  - Terima `photoUrl` + `childId`
  - Gemini Vision → analisis makanan
  - Return: food_detected, calories, protein, carbs, fat, fiber
- [ ] **6.3** `app/api/gemini/chat/route.ts`
  - Terima `predictionId` + `message`
  - Load context prediksi + riwayat chat
  - Kirim ke Gemini, simpan response ke `chat_sessions`
- [ ] **6.4** Polling prediction status (TanStack Query)
  - Query `predictions` by `assessment_id`
  - Auto-refresh sampai status COMPLETED / FAILED

---

## Fase 7: Assessment Flow (end-to-end)

- [ ] **7.1** Form assessment multi-step (5 langkah)
  - Step 1: Pilih anak
  - Step 2: Antropometri (weight, height, head circumference)
  - Step 3: Riwayat makan (BF exclusive, MPASI age, meal freq)
  - Step 4: Riwayat penyakit
  - Step 5: Review + submit
- [ ] **7.2** Validasi form (mirip aturan Java)
- [ ] **7.3** Submit → insert assessments + panggil `/api/gemini/predict`
- [ ] **7.4** Result page — loading → completed/failed
  - Tampilkan stunt_status, z-scores, risk_level, summary, recommendations
  - Badge "✓ Terverifikasi Blockchain" jika anchored

---

## Fase 8: Nutrition (Upload + Analisis)

- [ ] **8.1** Setup Supabase Storage bucket `food-photos` + RLS
- [ ] **8.2** `/nutrition` page — form upload foto
- [ ] **8.3** Upload → call `/api/gemini/nutrition` → simpan hasil
- [ ] **8.4** Riwayat nutrition log + detail

---

## Fase 9: Chatbot

- [ ] **9.1** `/chat/[predictionId]` page
- [ ] **9.2** Chat UI — bubble component, loading state
- [ ] **9.3** Send message → call `/api/gemini/chat` → display response
- [ ] **9.4** Riwayat chat dari `chat_sessions` (load on mount)
- [ ] **9.5** Guard — hanya bisa chat jika prediction COMPLETED

---

## Fase 10: Blockchain

- [ ] **10.1** Setup Wagmi provider (layout client)
- [ ] **10.2** `app/api/blockchain/anchor/route.ts`
  - SHA-256 hash assessment data
  - Call GiziChainRegistry contract
  - Simpan tx_hash, block_number
- [ ] **10.3** `app/api/blockchain/verify/[assessmentId]/route.ts`
  - Bandingkan hash on-chain vs DB hash
  - Kembalikan isValid + link explorer
- [ ] **10.4** Smart contract GiziChainRegistry (Solidity)
  - Deploy ke Polygon Amoy testnet
- [ ] **10.5** Tapilkan badge blockchain di result assessment (verified / pending / failed)

---

## Fase 11: Verifiable Credentials

- [ ] **11.1** `app/api/vc/issue/route.ts`
  - Generate JSON-LD W3C VC
  - Upload IPFS via Pinata
  - Simpan ke `verifiable_credentials`
- [ ] **11.2** `app/api/vc/revoke/route.ts`
  - Update is_revoked + revoke_tx_hash
- [ ] **11.3** `/admin/vc` — daftar VC, filter, issue, revoke
- [ ] **11.4** QR Code component untuk VC

---

## Fase 12: Reports

- [ ] **12.1** `app/api/reports/[childId]/route.ts`
  - Generate PDF (puppeteer atau @pdf-lib)
  - Embed QR code VC jika ada
  - Content-Disposition: attachment
- [ ] **12.2** Button download PDF di halaman anak

---

## Fase 13: Grafik Tumbuh Kembang

- [ ] **13.1** Install recharts
- [ ] **13.2** Grafik BB/U — weight vs WHO curve
- [ ] **13.3** Grafik TB/U — height vs WHO curve
- [ ] **13.4** Grafik BB/TB — weight-for-height vs WHO curve
- [ ] **13.5** Filter range tanggal

---

## Fase 14: Medic Dashboard

- [ ] **14.1** `/medic/patients` — daftar semua pasien + search
  - Supabase langsung (RLS allows all untuk MEDIC)
- [ ] **14.2** `/medic/patients/[childId]` — detail pasien
- [ ] **14.3** `/medic/vc` — issue VC untuk anak (butuh wallet_address)

---

## Fase 15: Admin Dashboard

- [ ] **15.1** `app/api/admin/users/route.ts` — CRUD user (service_role)
- [ ] **15.2** `app/api/admin/stats/route.ts` — statistik agregat
- [ ] **15.3** `/admin/users` — tabel user + filter role + nonaktifkan
- [ ] **15.4** `/admin/stats` — peta sebaran stunting, total VC, total anchor

---

## Fase 16: Deploy

- [ ] **16.1** Deploy smart contract ke Polygon Amoy (testnet)
- [ ] **16.2** Push ke Vercel
  ```bash
  vercel --prod
  ```
- [ ] **16.3** Setup Supabase production
  - Enable SSL enforcement
  - Setup rate limiting
- [ ] **16.4** Custom domain (opsional)

---

## Progress Tracker

| Fase | Task | Selesai | % |
|------|------|---------|---|
| 0 Prasyarat | 5 | 0 | 0% |
| 1 Database Migration | 5 | 0 | 0% |
| 2 Supabase Client | 4 | 0 | 0% |
| 3 Auth UI | 5 | 0 | 0% |
| 4 Core CRUD | 6 | 0 | 0% |
| 5 Z-Score | 2 | 0 | 0% |
| 6 Gemini AI | 4 | 0 | 0% |
| 7 Assessment Flow | 4 | 0 | 0% |
| 8 Nutrition | 4 | 0 | 0% |
| 9 Chatbot | 5 | 0 | 0% |
| 10 Blockchain | 5 | 0 | 0% |
| 11 VC | 4 | 0 | 0% |
| 12 Reports | 2 | 0 | 0% |
| 13 Grafik | 5 | 0 | 0% |
| 14 Medic Dashboard | 3 | 0 | 0% |
| 15 Admin Dashboard | 4 | 0 | 0% |
| 16 Deploy | 4 | 0 | 0% |
| **Total** | **71** | **0** | **0%** |

---

## Catatan

- Checklist: ganti `[ ]` → `[x]` pas selesai
- Urutan fase by design — jangan loncat sebelum dependensi kebangun
- Tiap API route butuh auth check: verify session token → verify RLS-equivalent di server
- Service_role key cuma dipake di server, never exposed ke client
