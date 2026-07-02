# ARCHITECTURE.md — Tumbuh Sehat (GiziChain)

**Update:** 2026-07-02 — Migrasi dari Java Spring Boot → Fullstack Next.js + Supabase.

---

## 1. Gambaran Sistem

Platform terdiri dari **2 client + 1 platform backend-as-a-service** (Supabase) + **layer blockchain** untuk verifikasi integritas data. **Tidak ada server backend Java.**

```
┌──────────────────────────────────────────┐
│              Supabase Cloud              │
│                                          │
│  ┌──────────┐   ┌──────────────────┐    │
│  │   Auth   │   │   PostgreSQL     │    │
│  │ (bawaan) │   │   + Row Level    │    │
│  │          │   │   Security (RLS) │    │
│  └──────────┘   └──────────────────┘    │
│  ┌──────────┐   ┌──────────────────┐    │
│  │ Storage  │   │   Realtime       │    │
│  │ + RLS    │   │   (WebSocket)    │    │
│  └──────────┘   └──────────────────┘    │
│  ┌──────────────────────────────────┐   │
│  │   Edge Functions (future)        │   │
│  └──────────────────────────────────┘   │
└──────────────────────────────────────────┘
        ▲                    ▲
        │                    │
        │ supabase-js        │ supabase-js
        │ (service_role)     │ (anon key + RLS)
        │                    │
  ┌─────┴──────────┐  ┌─────┴──────────┐
  │   Next.js      │  │   Expo Mobile  │
  │  (Server)      │  │  (Client)      │
  │                │  │                │
  │ Port: 3000     │  │  SDK 54        │
  │                │  │                │
  │ - App Router   │  │  - TanStack    │
  │ - Server       │  │    Query       │
  │   Actions      │  │  - Zustand     │
  │ - API Routes   │  │  - NativeWind  │
  │ - Tailwind     │  │  - Camera      │
  │ - Recharts     │  │  - QR Scanner  │
  └───────┬────────┘  └────────┬───────┘
          │                    │
          │   Gemini AI        │   langsung ke Supabase
          │   (API key rahasia)│   untuk CRUD via RLS
          │                    │
          └────────┬───────────┘
                   │
         ┌─────────▼──────────────────────┐
         │         BLOCKCHAIN LAYER        │
         │          (Polygon Amoy)         │
         │                                │
         │  ┌──────────────────────────┐  │
         │  │  GiziChainRegistry.sol   │  │
         │  │  (Health record hash)    │  │
         │  └──────────────────────────┘  │
         │  ┌──────────────────────────┐  │
         │  │    VCRegistry.sol        │  │
         │  │  (VC credential CID)     │  │
         │  └──────────────────────────┘  │
         │                                │
         │  ┌──────────────────────────┐  │
         │  │  IPFS / Pinata           │  │
         │  │  (VC document storage)   │  │
         │  └──────────────────────────┘  │
         └────────────────────────────────┘
```

### Service Layer Distribution

| Layanan | Lokasi | Alasan |
|---------|--------|--------|
| **Auth** | Supabase Auth (built-in) | `supabase.auth.signUp()` / `signIn()` — no custom code |
| **CRUD anak, assessment, dll** | Client → Supabase via RLS | Langsung dari mobile/web, RLS jamin akses |
| **Z-score kalkulasi** | Next.js API Route (server) | Butuh WHO lookup tables, rahasia bisnis logic |
| **Gemini AI** | Next.js API Route (server) | API key rahasia |
| **Blockchain anchor** | Next.js API Route (server) | Wallet private key rahasia |
| **VC issuance** | Next.js API Route (server) | Signing key rahasia |
| **PDF report** | Next.js API Route (server) | Library berat |
| **File upload** | Client → Supabase Storage langsung | RLS jamin akses |
| **Web3 read** | Client (Wagmi) | View-only, bisa dari client |
| **Web3 write** | Next.js API Route (server) | Private key di server |

---

## 2. Struktur Folder — Next.js Web

```
web/
├── public/
│   ├── icons/
│   └── images/
│
├── src/
│   ├── supabase/                           # Supabase clients
│   │   ├── client.ts                       # Browser client (anon key + RLS)
│   │   ├── server.ts                       # Server client (service_role)
│   │   └── middleware.ts                   # Auth helper for Next.js middleware
│   │
│   ├── app/                                # App Router
│   │   ├── layout.tsx                      # Root layout (font, Supabase providers)
│   │   ├── page.tsx                        # Landing page / redirect
│   │   │
│   │   ├── (auth)/                         # Route group — no navbar
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (app)/                          # Route group — dgn navbar, auth protected
│   │   │   ├── layout.tsx                  # Navbar + auth guard
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── children/
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [childId]/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── assessment/
│   │   │   │       │   ├── new/
│   │   │   │       │   │   └── page.tsx
│   │   │   │       │   └── [assessmentId]/
│   │   │   │       │       └── page.tsx
│   │   │   │       ├── nutrition/
│   │   │   │       │   └── page.tsx
│   │   │   │       └── growth-chart/
│   │   │   │           └── page.tsx
│   │   │   │
│   │   │   └── medic/
│   │   │       ├── layout.tsx
│   │   │       ├── patients/
│   │   │       │   └── page.tsx
│   │   │       └── [childId]/
│   │   │           └── page.tsx
│   │   │
│   │   ├── admin/
│   │   │   ├── page.tsx
│   │   │   ├── users/
│   │   │   │   └── page.tsx
│   │   │   └── map/
│   │   │       └── page.tsx
│   │   │
│   │   └── api/                            # Next.js API Routes (server-only)
│   │       ├── auth/
│   │       │   └── callback/route.ts       # OAuth callback handler
│   │       ├── gemini/
│   │       │   ├── predict/route.ts        # Z-score + Gemini interpret
│   │       │   ├── nutrition/route.ts      # Gemini Vision analisis
│   │       │   └── chat/route.ts           # Chatbot endpoint
│   │       ├── blockchain/
│   │       │   ├── anchor/route.ts         # Hash + anchor ke Polygon
│   │       │   └── verify/route.ts         # Verifikasi hash on-chain
│   │       ├── vc/
│   │       │   ├── issue/route.ts          # Terbitkan VC
│   │       │   └── revoke/route.ts         # Cabut VC
│   │       └── reports/
│   │           └── [childId]/route.ts      # Generate PDF
│   │
│   ├── components/
│   │   ├── ui/                             # Atomik (Button, Input, Card, Badge, dll)
│   │   ├── layout/                         # Navbar, Sidebar, PageHeader
│   │   ├── auth/                           # LoginForm, RegisterForm
│   │   ├── children/                       # ChildCard, ChildList, ChildForm
│   │   ├── assessment/                     # AssessmentStepper, steps, PredictionResult
│   │   ├── nutrition/                      # PhotoUploader, NutritionResult
│   │   ├── chat/                           # ChatWindow, ChatBubble, ChatInput
│   │   ├── charts/                         # GrowthChart, StuntingDistributionChart
│   │   └── medic/                          # PatientTable, PatientFilters
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                      # Supabase auth state
│   │   ├── useSupabase.ts                  # Supabase client hook
│   │   └── ... (per domain TanStack Query hooks)
│   │
│   ├── lib/
│   │   ├── zscore.ts                       # Z-score calculator (port dari Java)
│   │   ├── supabase.ts                     # Client init
│   │   └── utils.ts                        # Helpers (format date, dll)
│   │
│   ├── stores/
│   │   └── assessmentFormStore.ts          # Form multi-step state
│   │
│   └── types/
│       ├── database.types.ts               # Generated dari Supabase schema
│       └── *.types.ts                      # Domain types
│
├── supabase/
│   ├── migrations/                         # DB migrations
│   └── seed.sql                            # Data awal
│
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 3. Struktur Folder — React Native (Expo)

```
mobile/
├── assets/
├── src/
│   ├── app/                                # File-based routing
│   │   ├── _layout.tsx                     # Root: QueryClient + Supabase Auth
│   │   ├── sign-in.tsx
│   │   ├── register.tsx
│   │   └── (app)/                          # Protected route group
│   │       ├── _layout.tsx
│   │       ├── (tabs)/
│   │       │   ├── _layout.tsx
│   │       │   ├── index.tsx               # Beranda
│   │       │   ├── scanner.tsx             # Kamera/gizi
│   │       │   ├── consult.tsx             # Chatbot
│   │       │   ├── vault.tsx               # Blockchain ledger
│   │       │   └── profile.tsx
│   │       ├── children/                   # Manajemen anak
│   │       └── scanner/                    # Log gizi
│   │
│   ├── features/                           # Domain modules
│   │   ├── auth/                           # Ganti: pakai Supabase Auth
│   │   ├── children/
│   │   ├── home/
│   │   ├── assessment/
│   │   ├── nutrition/
│   │   ├── chat/
│   │   └── blockchain/
│   │
│   ├── components/ui/                      # Shared UI atomik
│   ├── stores/                             # Zustand
│   ├── services/
│   │   ├── supabase.ts                     # Supabase client (anon key + RLS)
│   │   ├── api.ts                          # Hanya untuk Next.js API routes
│   │   └── mock.ts                         # 🔜 akan dihapus (USE_MOCK=false)
│   └── types/
│
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

### Perubahan Mobile dari Arsitektur Lama

| Aspek | Sebelum | Sesudah |
|-------|---------|---------|
| **Auth** | `authStore` (Zustand + SecureStore manual) + Axios ke `/api/auth/*` | `supabase.auth` langsung + `@supabase/ssr` |
| **API call** | Axios → Spring Boot REST | **Dual:** supabase-js untuk CRUD (via RLS) + Axios untuk Next.js API (Gemini, blockchain, PDF) |
| **Storage upload** | `multipart/form-data` ke Java → terus ke Supabase | Langsung `supabase.storage.from('bucket').upload()` |
| **Realtime** | WebSocket manual | `supabase.channel('xxx').on('postgres_changes', ...)` |
| **Mock** | `USE_MOCK` flag | 🔜 Hapus — semua real |
| **Token JWT** | Manual refresh di Axios interceptor | Supabase Auth handle auto-refresh |

---

## 4. Auth Flow — Supabase Auth

### Register & Login

```
Client (Expo / Next.js)              Supabase Auth
      │                                    │
      │── supabase.auth.signUp({ ──────────>│
      │     email, password, options }      │
      │                                    │ 1. Buat user di auth.users
      │                                    │ 2. Trigger DB function →
      │                                    │    INSERT ke public.users
      │<── 200 { user, session } ──────────│
      │                                    │
      │── supabase.auth.signInWithPassword(─>│
      │     { email, password }             │
      │                                    │ 1. Verifikasi credential
      │                                    │ 2. Return session (access + refresh)
      │<── 200 { user, session } ──────────│
```

**RLS aktif otomatis** karena `auth.uid()` = user.id.

### Request Terautentikasi

```
Client                              Supabase (via RLS)
  │                                       │
  │── supabase.from('children') ──────────>│
  │     .select('*')                       │
  │     .eq('user_id', auth.uid())        │  RLS: user_id = auth.uid()
  │                                       │
  │<── 200 [ ...data milik user saja ] ───│
```

**Zero custom code.** RLS di level database handle semuanya.

### Token Refresh
Supabase JS SDK handle auto-refresh session. **Manual refresh token di Axios interceptor tidak diperlukan lagi** untuk query yang lewat supabase-js.

Hanya untuk request ke Next.js API Routes, token dikirim sebagai header `Authorization: Bearer <access_token>` dan diverifikasi di server.

---

## 5. Data Flow — Assessment & Prediksi + Blockchain Anchor

```
Client                     Next.js API Route            Supabase         Gemini/Blockchain
  │                             │                          │                    │
  │ 1. Insert assessment ──────>│                          │                    │
  │    langsung ke Supabase     │ (tidak lewat API)        │                    │
  │                             │                          │                    │
  │── supabase.from('assessments').insert({...}) ─────────>│                    │
  │                             │                          │                    │
  │ 2. Panggil API predict ────>│                          │                    │
  │── POST /api/gemini/predict ─>│                          │                    │
  │   { assessmentId, ... }     │                          │                    │
  │                             │ 3. Load data anak+asmen  │                    │
  │                             │── supabase.from(...) ────>│                    │
  │                             │                          │                    │
  │                             │ 4. Hitung z-score (WHO)  │                    │
  │                             │ 5. Siapin prompt + call ─────────────────>│
  │                             │                          │   Gemini API      │
  │                             │                          │                    │
  │                             │ 6. Parse response        │                    │
  │                             │ 7. Update prediction ────>│                    │
  │                             │── supabase.from('predictions').update(...) ─>│
  │                             │                          │                    │
  │                             │ 8. Anchor ke chain ────────────────────>│
  │                             │                          │   Polygon via     │
  │                             │                          │   ethers.js       │
  │                             │                          │                    │
  │<── 200 { prediction } ──────│                          │                    │
```

### Perubahan dari Arsitektur Java

| Step | Java Dulu | Sekarang |
|------|-----------|----------|
| Insert assessment | POST `/api/assessments` → Controller → Service → DB | `supabase.from('assessments').insert()` langsung dari client, RLS jamin akses |
| Trigger prediksi | `@Async` di Spring | Client call `/api/gemini/predict` setelah insert sukses |
| Z-score | `ZScoreCalculator.java` | `lib/zscore.ts` (port) |
| Gemini call | `GeminiService.java` → WebClient | `@google/generative-ai` SDK |
| Update prediction | JPA `save()` | `supabase.from('predictions').update()` via server client (service_role) |
| Blockchain anchor | `BlockchainService.java` → Web3j | `ethers.js` di Next.js API Route |

---

## 6. Data Flow — Deteksi Gizi Foto

```
Client (Expo)                        Supabase Storage           Next.js API
     │                                    │                        │
     │ 1. Upload foto langsung ──────────>│                        │
     │── supabase.storage.from(           │                        │
     │     'food-photos').upload(...)      │                        │
     │<── { publicUrl } ──────────────────│                        │
     │                                    │                        │
     │ 2. Panggil analisis ───────────────────────────────────────>│
     │── POST /api/gemini/nutrition ──────>│                        │
     │   { childId, photoUrl }            │                        │
     │                                    │                        │ 3. Download foto
     │                                    │                        │ 4. Gemini Vision
     │                                    │                        │ 5. Parse nutrition
     │                                    │                        │
     │ 6. Simpan hasil ──────────────────>│                        │
     │── supabase.from('nutrition_logs')   │                        │
     │     .insert({...})                  │                        │
     │                                    │                        │
     │<── { nutritionLog } ───────────────│                        │
```

### Perubahan dari Arsitektur Java

| Step | Java Dulu | Sekarang |
|------|-----------|----------|
| Upload foto | Multipart ke Java → REST ke Supabase | Langsung ke Supabase Storage dari client |
| Vision call | `GeminiService.callVision()` di `NutritionService.java` | `@google/generative-ai` di `/api/gemini/nutrition` |
| Simpan log | JPA `save()` | `supabase.from('nutrition_logs').insert()` via server client |

---

## 7. Data Flow — Chatbot

```
Client (Expo/Next.js)              Next.js API Route            Geminii API
     │                                    │                        │
     │── POST /api/gemini/chat ───────────>│                        │
     │   { predictionId, message }        │                        │
     │                                    │ 1. Load prediction +   │
     │                                    │    conversation history│
     │                                    │ 2. Build system prompt │
     │                                    │ 3. Call Gemini ──────────────────>│
     │                                    │                        │ reply
     │                                    │ 4. Simpan ke chat_sessions      │
     │<── 200 { reply } ──────────────────│                        │
```

---

## 8. RBAC — Row Level Security (Supabase)

Auth di Java: `@PreAuthorize("hasRole('MEDIC')")` → 403 Forbidden.

Auth di arsitektur baru: **RLS policies di Supabase** — aturan akses di level database, bukan kode.

### Contoh RLS Policies

```sql
-- 1. Parent hanya bisa lihat anak miliknya
CREATE POLICY "parent_own_children"
  ON children FOR ALL
  USING (user_id = auth.uid());

-- 2. Medic & Admin bisa lihat semua anak
CREATE POLICY "medic_admin_all_children"
  ON children FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('MEDIC', 'ADMIN')
    )
  );

-- 3. Assessment: parent punya akses ke anaknya
CREATE POLICY "parent_own_assessments"
  ON assessments FOR ALL
  USING (
    child_id IN (
      SELECT id FROM children WHERE user_id = auth.uid()
    )
  );

-- 4. Admin bisa manage users
CREATE POLICY "admin_manage_users"
  ON users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );
```

### Role Check di Server

Untuk operasi yang butuh server (Gemini, blockchain), role dicek via **custom claims** atau query ke `users` table:

```typescript
// Next.js API Route
const { data: user } = await supabaseServer
  .from('users')
  .select('role')
  .eq('id', userId)
  .single();

if (user.role !== 'MEDIC' && user.role !== 'ADMIN') {
  return new Response('Forbidden', { status: 403 });
}
```

---

## 9. Supabase Schema & Clients

### Dua Client Supabase

| Client | Lokasi | Key | Kemampuan |
|--------|--------|-----|-----------|
| **Browser client** | `mobile/src/services/supabase.ts` & `web/src/supabase/client.ts` | `anon` public key | CRUD via RLS only |
| **Server client** | `web/src/supabase/server.ts` | `service_role` key (rahasia) | Bypass RLS — hanya di Next.js API Routes & Server Actions |

### Aturan Ketat

1. **Jangan pernah expose service_role key ke client.** Hanya di Next.js API Routes.
2. **Semua operasi client wajib lewat RLS.** Jika RLS blum ada, operasi harus lewat Next.js API Route.
3. **Server client hanya untuk:** Gemini AI, blockchain ops, PDF generation, admin-only ops.

---

## 10. Perbandingan Komponen: Java vs Fullstack JS

| Komponen | Java (hapus) | JS (baru) |
|----------|-------------|-----------|
| `AuthController` | 1 file | ❌ Hapus — Supabase Auth |
| `JwtUtil` | 1 file | ❌ Hapus — Supabase session |
| `JwtAuthFilter` | 1 file | ❌ Hapus — RLS |
| `SecurityConfig` | 1 file | ❌ Hapus — RLS policies |
| `AuthService` | 1 file | ❌ Hapus |
| `ChildController` + `ChildService` | 2 file | → Client langsung ke Supabase |
| `AssessmentController` + `AssessmentService` | 2 file | → Client insert + Next.js API predict |
| `PredictionService` + `GeminiService` | 2 file | → `src/lib/zscore.ts` + `/api/gemini/predict` |
| `NutritionController` + `NutritionService` | 2 file | → Client upload + `/api/gemini/nutrition` |
| `ChatController` + `ChatService` | 2 file | → `/api/gemini/chat` |
| `BlockchainController` + `BlockchainService` | 2 file | → `/api/blockchain/*` + Wagmi client |
| `VcController` + `VcService` | 2 file | → `/api/vc/*` |
| `ReportController` + `ReportService` | 2 file | → `/api/reports/*` |
| `StorageService` | 1 file | ❌ Hapus — Supabase Storage SDK |
| `IpfsService` | 1 file | → Pinata SDK JS |
| `ZScoreCalculator` | 1 file | → `lib/zscore.ts` (port) |
| `CuidGenerator` | 1 file | → `cuid2` npm package |
| `GlobalExceptionHandler` | 1 file | ❌ Hapus |
| 9 Entities + 9 Repositories | 18 file | → Migrasi ke SQL + Supabase types |
| 13 Request/Response DTOs | 13 file | → TypeScript types |
| 6 Enums | 6 file | → SQL enum types |
| **Total file dihapus** | **~60 file** | |

---

## 11. Environment Variables

### Next.js (.env.local)
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Google Gemini
GEMINI_API_KEY=...
GEMINI_TEXT_MODEL=gemini-1.5-flash
GEMINI_VISION_MODEL=gemini-1.5-pro

# Blockchain
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology/
WALLET_PRIVATE_KEY=...        # Server wallet untuk anchor
VC_SIGNING_KEY=...            # Untuk sign VC

# Pinata (IPFS)
PINATA_API_KEY=...
PINATA_SECRET_KEY=...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Expo (.env)
```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_API_URL=http://localhost:3000    # Next.js URL
```

---

## 12. Strategi Migrasi File per File

| Urutan | File | Aksi |
|--------|------|------|
| 1 | DB schema (migrate enums, tables, indexes) | Export SQL → Supabase SQL editor |
| 2 | RLS policies | Tulis semua policies sebelum client connect |
| 3 | `lib/zscore.ts` | Port dari `ZScoreCalculator.java` |
| 4 | `supabase/client.ts` + `supabase/server.ts` | Init clients |
| 5 | Auth UI (login, register) | Ganti form manual → `supabase.auth` |
| 6 | Child CRUD | Ganti API call → supabase-js langsung |
| 7 | Assessment + Prediction | Client insert + `/api/gemini/predict` |
| 8 | Nutrition | Client upload + `/api/gemini/nutrition` |
| 9 | Chat | `/api/gemini/chat` |
| 10 | Blockchain | Wagmi (client) + `/api/blockchain/*` (server) |
| 11 | VC | `/api/vc/*` |
| 12 | Reports | `/api/reports/*` |
| 13 | Service layer mobile | Adaptasi dari Java REST → Supabase SDK |
| 14 | Hapus mock system | Cleanup |

---

## 13. Catatan Penting

1. **JDK dan Spring Boot tidak diperlukan lagi.** Semua backend = Next.js.
2. **Supabase Auth = built-in.** Tidak perlu JWT manual, refresh token, atau auth store sendiri.
3. **RLS adalah security utama.** Policies harus benar sebelum client connect.
4. **service_role key = rahasia.** Hanya di Next.js API Routes, tidak pernah di client.
5. **Gemini prompt tetap di file `.md`.** Sama seperti yang direncanakan di Sprint 7 Java — pindahkan file `.md` ke `web/src/agents/`.
6. **Mobile tetap Expo.** Layer data berubah, UI tidak.
7. **TanStack Query tetap dipakai.** Fetcher berubah dari Axios → supabase-js.
8. **Total file Java yang bisa dihapus:** ~60 file. Hanya `ZScoreCalculator` yang perlu di-port.
