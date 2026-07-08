# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Dokumen master untuk AI agent yang bekerja di `mobile/`. Tidak perlu membaca `docx/*` global — semua konteks penting sudah dirangkum di sini.

---

## 1. PROJECT OVERVIEW

**TumbuhSehat** = Gizi + Blockchain. Platform deteksi stunting dini untuk anak 0–60 bulan.

- **Tagline**: *"Data Gizi Anak: Teranalisis oleh AI, Dijamin oleh Blockchain."*
- **Target**: Orang tua (PARENT), tenaga medis (MEDIC), kader posyandu (POSYANDU), admin (ADMIN)
- **Arsitektur**: Expo standalone — **dual client**: `supabase-js` (CRUD via RLS) + **Gemini API langsung** (Z-score + Chat + Nutrition)
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Mobile**: React Native / Expo SDK 54
- **Blockchain**: Polygon (testnet Amoy chainId=80002, mainnet chainId=137)
- **AI**: Google Gemini (Flash) — **langsung dari mobile** via `fetch()`, tanpa server perantara
- **Storage**: Supabase Storage (RLS-protected) — upload langsung dari client
- **VC**: Verifiable Credential W3C — IPFS via Pinata
- **Consultation Chat**: Realtime Broadcast via Supabase Realtime (channel `consult_<parentId>`), bukan WebSocket manual

---

## 2. TECH STACK (Mobile)

| Library | Version | Fungsi |
|---------|---------|--------|
| `expo` | ~54.0.34 | Framework |
| `react-native` | 0.81.5 | Runtime |
| `expo-router` | ~6.0.23 | File-based routing |
| `@tanstack/react-query` | ^5.101.0 | Server state / caching |
| `zustand` | ^5.0.14 | Client state |
| `axios` | ^1.17.0 | HTTP client |
| `expo-secure-store` | ~15.0.8 | JWT storage |
| `nativewind` | 4.2.1 | Tailwind CSS for RN |
| `react-native-reanimated` | ~4.1.1 | Animasi |

**WAJIB**: Gunakan `npx expo install <package>` bukan `npm install` untuk hindari mismatch versi SDK.

---

## 3. ROUTING (Expo Router)

```
_layout.tsx                           # Root: QueryClientProvider + Auth Gate
├── sign-in.tsx                       # → SignInScreen (unauthenticated)
├── register.tsx                      # → RegisterScreen (unauthenticated)
│
└── (app)/                            # Protected by auth guard
    ├── _layout.tsx                   # Stack navigator
    │   ├── (tabs)/                   # Bottom tabs
    │   │   ├── _layout.tsx           # Custom floating tab bar
    │   │   ├── index.tsx             # Beranda → HomeScreen
    │   │   ├── scanner.tsx           # Log Gizi → NutritionScreen
    │   │   ├── consult.tsx           # Tanya AI → ConsultScreen
    │   │   ├── vault.tsx             # Vault → VaultScreen
    │   │   └── profile.tsx           # Profil → ProfileScreen
    │   │
    │   ├── children/new.tsx          # → AddChildScreen
    │   ├── children/[childId].tsx    # → ChildDetailScreen
    │   ├── children/[childId]/edit.tsx      # → EditChildScreen
    │   ├── children/[childId]/assessment/
    │   │   ├── body-size.tsx         # → BodySizeScreen (Step 2)
    │   │   ├── feeding-history.tsx   # → FeedingHistoryScreen (Step 3)
    │   │   ├── illness-history.tsx   # → IllnessHistoryScreen (Step 4)
    │   │   ├── review.tsx            # → ReviewScreen (Step 5)
    │   │   └── results.tsx           # → ResultsScreen
    │   │
    │   ├── scanner/scan.tsx          # → ScannerScreen (camera simulasi)
    │   ├── scanner/manual.tsx        # → ManualEntryScreen
    │   ├── scanner/analysis.tsx      # → AnalysisScreen
    │   ├── chat/[parentId].tsx       # → ConsultationParentScreen
    │   ├── chat/my-doctor.tsx        # → ConsultationDoctorScreen
    │   ├── report.tsx                # → ReportScreen (PDF)
    │   ├── medic/dashboard.tsx       # → MedicDashboardScreen
    │   ├── blockchain/verify/[assessmentId].tsx  # → BlockchainVerifyScreen
    │   ├── vc/[vcId].tsx             # → VcDetailScreen
    │   ├── vc/scan.tsx               # → VcScannerScreen
    │   └── vc/verify-result.tsx      # → VcVerifyResultScreen
```

**Auth Gate**: `app/_layout.tsx` — `Stack.Protected` berdasarkan `isAuthenticated` dari authStore. `onAuthStateChange` listener sync session + profile ke store. SplashScreen ditahan sampai `isHydrated = true`.

> **Catatan**: Next.js (desktop) adalah client independen yang mengonsumsi Supabase yang sama, bukan server gateway untuk mobile.

---

## 4. FOLDER STRUCTURE

```
src/
├── app/                          # Expo Router entry points (thin wrappers)
├── data/                         # Bundled data / skill documents
│   └── skills/                   # 5 markdown docs for Gemini RAG
├── features/                     # Domain modules per fitur (semua punya barrel index.ts)
│   ├── auth/                     # Sign in, register, refresh
│   ├── children/                 # CRUD anak + growth tracker
│   ├── home/                     # Dashboard beranda
│   ├── profile/                  # Profil user
│   ├── assessment/               # Assessment 5-langkah + prediksi + polling
│   ├── nutrition/                # Log gizi, scanner, analisis
│   ├── chat/                     # Chatbot AI + Realtime consultation (menggantikan consult/)
│   ├── gemini/                   # Gemini AI service + hooks (predict, nutrition, chat)
│   ├── vault/                    # Blockchain ledger (Zustand store)
│   ├── consult/                  # (legacy — screens still used, prefer chat/)
│   ├── blockchain/               # Verifikasi on-chain
│   ├── vc/                       # Verifiable Credential W3C
│   ├── medic/                    # Dashboard tenaga medis + conversation list
│   ├── posyandu/                 # Modul kader posyandu
│   └── report/                   # Unduh laporan PDF
│
├── components/                   # Shared UI (global atomik, stateless)
│   ├── ui/                       # Button, Input, Card, StatusBadge, EmptyState, dll
│   └── common/                   # ConversationCard, InputField, StatusBadge
├── services/                     # Shared networking
│   └── api.ts                    # Axios instance + interceptor
├── stores/                       # Zustand stores
│   ├── authStore.ts
│   ├── assessmentFormStore.ts
│   ├── nutritionStore.ts
│   └── vaultStore.ts
├── types/                        # Shared types
│   ├── api-types.ts              # ApiError, PageResponse<T>
│   └── conversation-types.ts     # Conversation type
├── constants/                    # Theme colors & spacing
│   └── theme.ts
├── utils/                        # Helpers
│   ├── cn.ts                     # className utility
│   ├── random.ts                 # generateId, randomHex
│   ├── who-zscore.ts             # WHO LMS Z-score engine (HAZ/WAZ/WHZ) — local
│   └── gemini-client.ts          # Gemini API wrapper with system_instruction
```

---

## 5. API ENDPOINTS — Arsitektur Dua Jalur

Expo standalone akses data via **dua jalur**:

```
┌───────────────────────────────────────────────────────────┐
│                     EXPO MOBILE                            │
│                                                           │
│  ┌──────────────────────┐                                 │
│  │   supabase-js SDK    │                                 │
│  │   (anon + RLS)       │                                 │
│  │                      │                                 │
│  │  — CRUD langsung     │                                 │
│  │  — Auth              │                                 │
│  │  — Storage upload    │                                 │
│  │  — Realtime subscribe│                                 │
│  │  — Chat persist      │                                 │
│  └──────────────────────┘                                 │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │   fetch() → Gemini API langsung                     │  │
│  │   (EXPO_PUBLIC_GEMINI_API_KEY)                      │  │
│  │                                                     │  │
│  │  — Z-score + interpretasi (predict)                 │  │
│  │  — Analisis foto makanan (nutrition)                │  │
│  │  — Chatbot AI (chat)                               │  │
│  └────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

### Base URL
```
Supabase:  EXPO_PUBLIC_SUPABASE_URL       (https://[project].supabase.co)
Gemini:    EXPO_PUBLIC_GEMINI_API_KEY        (langsung dari mobile)
```

### Jalur 1: Langsung ke Supabase (via `supabase-js`)

Semua operasi ini lewat `supabase.from('table').*()` — RLS enforce otomatis per session.

| Operasi | Kode |
|---------|------|
| **Register** | `supabase.auth.signUp({ email, password, options: { data: { name } } })` |
| **Login** | `supabase.auth.signInWithPassword({ email, password })` |
| **Logout** | `supabase.auth.signOut()` |
| **Session** | `supabase.auth.getSession()` |
| **Profile** | `supabase.from('users').select('*').eq('id', user.id).single()` |
| **List Children** | `supabase.from('children').select('*').order('created_at', { ascending: false })` |
| **Add Child** | `supabase.from('children').insert({ name, birth_date, gender, user_id, anon_id }).select().single()` |
| **Detail Child** | `supabase.from('children').select('*, assessments(*, prediction:predictions(*))').eq('id', childId).single()` |
| **Submit Assessment** | `supabase.from('assessments').insert({ ...assessmentData }).select().single()` |
| **List Nutrition** | `supabase.from('nutrition_logs').select('*').eq('child_id', childId).order('created_at', { ascending: false })` |
| **Upload Photo** | `supabase.storage.from('nutrition-photos').upload(path, file)` |
| **Chat Sessions** | `supabase.from('chat_sessions').select('*').eq('prediction_id', predictionId).single()` |

### Jalur 2: Gemini Langsung (via `fetch()`)

Semua AI lewat `generateContent()` dari `utils/gemini-client.ts` — `system_instruction` + skill documents (RAG lite).

| Operasi | Fungsi | System Instruction |
|---------|--------|-------------------|
| **Predict (Z-score + interpretasi)** | `geminiService.predict()` | "analis gizi anak" + 5 dokumen skill |
| **Nutrition Analysis** | `geminiService.analyzeNutrition()` | "analis gizi anak" + 5 dokumen skill |
| **Chatbot AI** | `chatService.sendMessage()` | "BundaSehat" + 5 dokumen skill + 10 aturan perilaku |

**Error Handling Gemini (predict)**: Semua error path (429, quota, network, JSON parse) ditangkap dengan catch-all. INSERT `predictions` **selalu berhasil** dengan summary fallback + `ai_limited = true`. Tidak ada kasus dimana prediction row tidak dibuat → polling di ResultsScreen tidak pernah infinite.

**Alur predict**: INSERT assessment → baca assessment+child dari Supabase → hitung Z-score lokal (`who-zscore.ts`) → call Gemini untuk interpretasi → INSERT prediction (`COMPLETED`) ke Supabase — semuanya client-side.

**Alur predict jika Gemini gagal**: Z-score tetap dihitung lokal → catch-all error handler → INSERT prediction dengan `ai_limited = true` + summary/rekomendasi fallback → `predictionStatus = COMPLETED` → polling berhenti normal → `ResultsScreen` tampilkan banner kuning "Analisis AI Tidak Tersedia".

### Assessment Validation
| Field | Rule |
|-------|------|
| weight | 0.5 – 50 kg |
| height | 30 – 130 cm |
| headCircumference | 20 – 60 cm (opsional) |
| mpasiAge | 0 – 24 bulan (opsional) |
| mealFreq | 1 – 10 kali/hari |
| illnessHistory | max 500 karakter (opsional) |

---

## 6. TYPES / DTOs

### api-types.ts
```typescript
type ApiError = { status: number; error: string; message: string; timestamp: string; path: string }
type PageResponse<T> = { data: T[]; page: number; size: number; totalElements: number; totalPages: number }
```

### auth-types.ts
```typescript
type Role = 'PARENT' | 'MEDIC' | 'POSYANDU' | 'ADMIN'
type User = { id: string; email: string; name: string; role: Role; walletAddress: string | null; isActive?: boolean }
type LoginRequest = { email: string; password: string }
type RegisterRequest = { email: string; password: string; name: string }
type AuthResponse = { accessToken: string; refreshToken: string; user: User }  // register juga return ini
type RefreshResponse = { accessToken: string; refreshToken: string; user: User }  // refresh return full tokens
```

### child-types.ts
```typescript
type Gender = 'MALE' | 'FEMALE'
type StuntStatus = 'NORMAL' | 'AT_RISK' | 'STUNTED' | 'SEVERELY_STUNTED'
type LatestPrediction = { status: StuntStatus; riskLevel?: number; createdAt: string }
type Child = { id: string; name: string; birthDate: string; gender: Gender; ageMonths: number; anonId?: string; createdAt?: string; latestPrediction: LatestPrediction | null }
type ChildDetail = Child & {
  assessments: Array<{
    id: string; weight?: number; height?: number; headCircumference?: number;
    bfExclusive?: boolean; mpasiAge?: number; mealFreq?: number; illnessHistory?: string;
    createdAt: string;
    prediction?: { id?: string; status: StuntStatus; predictionStatus?: string; riskLevel: number;
      zscoreWa?: number; zscoreHa?: number; zscoreWh?: number; summary?: string;
      recommendations?: string[]; nextAssessmentDate?: string; createdAt?: string } | null
  }>
}
type ChildRequest = { name: string; birthDate: string; gender: Gender }
type ChildUpdateRequest = { name: string; birthDate: string }
```

### assessment-types.ts — flat ServerPredictionResponse → nested DTOs
```typescript
// — Server raw —
type ServerPredictionResponse = {
  id: string; assessmentId: string; childId: string; childName: string;
  createdAt: string; status: StuntStatus; predictionStatus: string;
  zscoreWa: number; zscoreHa: number; zscoreWh: number;
  riskLevel: number; summary: string; recommendations: string[];
  nextAssessmentDate: string; disclaimer: string;
  blockchain?: { anchorStatus: string; isVerified?: boolean; txHash?: string; polygonscanUrl?: string } | null;
}

// — Mobile DTOs (hasil transform) —
type AssessmentPredictionDTO = {
  id: string; status: StuntStatus;
  predictionStatus: 'COMPLETED' | 'PENDING' | 'FAILED';
  zscoreWa: number; zscoreHa: number; zscoreWh: number;
  riskLevel: number; summary: string; recommendations: string[];
  nextAssessmentDate: string; disclaimer: string;
  aiLimited?: boolean;  // true jika Gemini tidak tersedia saat analisis
}
type BlockchainAnchorDTO = {
  id: string; anchored: boolean; recordHash: string; txHash: string;
  blockNumber: number; anchorStatus: 'CONFIRMED' | 'PENDING';
  explorerUrl: string; verifyUrl: string;
}
type AssessmentResponseDTO = {
  id: string;
  child: { id: string; name: string; ageMonths?: number };
  weight?: number; height?: number; headCircumference?: number;
  bfExclusive?: boolean; mpasiAge?: number; mealFreq?: number;
  illnessHistory?: string; createdAt: string;
  prediction: AssessmentPredictionDTO;
  blockchain?: BlockchainAnchorDTO;   // opsional
}
type AssessmentRequestDTO = {
  childId: string; weight: number; height: number; headCircumference?: number;
  bfExclusive: boolean; mpasiAge?: number; mealFreq: number; illnessHistory?: string;
}
```

### Conversation (conversation-types.ts)
```typescript
type Conversation = {
  parentId: string;
  parentName: string;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
}
```

### NutritionLog (store type, matches API response)
```typescript
type NutritionLog = {
  id: string; childId: string; photoUrl: string;
  foodDetected: string[]; portionEstimate: string;
  calories: number; protein: number; fat: number; carbs: number; fiber: number;
  adequacyNote: string; mpasiRecommendation: string; createdAt: string;
}
```

### BlockchainRecord (vault store type)
```typescript
type BlockchainRecord = {
  id: string; childId: string; childName: string;
  weight: number; height: number; ageMonths: number;
  status: StuntStatus; timestamp: string;
  blockNumber: number; txHash: string; gasFee: string;
}
```

---

## 7. STATE MANAGEMENT

### authStore (Zustand + SecureStore) — Supabase Session Based
```
State: user, session, isAuthenticated, isHydrated
Actions: setSession, setUser, logout, hydrate
```
- **setSession(session)**: update session + derive `isAuthenticated`
- **setUser(user)**: update profile dari `public.users`
- **logout()**: panggil `supabase.auth.signOut()` + reset store
- **hydrate()**: panggil `supabase.auth.getSession()` → fetch profile dari `public.users` → `isHydrated = true`
- Session persist via SecureStore (otomatis oleh supabase-js adapter)
- **Tidak ada token manual** — Supabase SDK handle auto-refresh

`app/_layout.tsx` subscribe ke `supabase.auth.onAuthStateChange()` untuk sync session + profile ke store.

### Assessment Prediction Polling
```
State: {
  predictions: Map<assessmentId, { status: 'PENDING'|'COMPLETED'|'FAILED', result: PredictionDTO | null }>
}
Actions: startPolling(assessmentId), stopPolling(assessmentId)
Mechanism: poll supabase.from('predictions').select('*').eq('assessment_id', id) every 3s via TanStack Query refetchInterval
```
Polling dilakukan lewat TanStack Query `refetchInterval: 3000`, bukan Zustand.

### assessmentFormStore (Zustand, non-persistent)
```
State: weight, height, headCircumference, bfExclusive, mpasiAge, mealFreq, illnessHistory
Actions: setWeight, setHeight, setHeadCircumference, setBfExclusive, setMpasiAge, setMealFreq, setIllnessHistory, resetForm
```

### nutritionStore (Zustand, in-memory)
```
State: logs[] (with 2 seed entries)
Actions: addLog, removeLog, getLogsByChild
```

### vaultStore (Zustand, in-memory)
```
State: records[] (with 2 seed entries)
Actions: addRecord → generates blockNumber, txHash, gasFee
```

---

## 8. MOCK SYSTEM

### Mechanism
- Semua service langsung menggunakan **Supabase** — tidak ada mock
- Setiap service module mengikuti pola dual-mode (supabase/axios) dengan satu fungsi per method

### Seed Data
- Tidak ada seed data in-memory — semua data dari Supabase langsung

---

## 9. HTTP CLIENTS

### Supabase Client — CRUD Utama (`services/supabase.ts`)

```typescript
import * as SecureStore from 'expo-secure-store'
import { createClient } from '@supabase/supabase-js'

const ExpoSecureStoreAdapter = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_KEY!,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
)
```
- Session persist via SecureStore (native)
- Auto-refresh token — tidak perlu manual interceptor
- RLS enforce per query

---

## 10. THEME & STYLING

### Colors (TumbuhSehat palette)
```
primary:      #3e646a (Soft Teal)
secondary:    #506444 (Sage Green)
tertiary:     #64601e (Gold)
background:   #fcf9f8 (Warm White)
danger:       #ba1a1a
dangerDark:   #93000a
cardBg:       #ffffff
border:       #eae7e7
```

### StuntStatus Badge Colors
```
NORMAL:           green (#506444)
AT_RISK:          amber (#64601e)
STUNTED:          red (#ba1a1a)
SEVERELY_STUNTED: dark red (#93000a)
```

### Styling Approach
- NativeWind (Tailwind CSS for React Native): `className="flex-1 bg-background p-4"`
- Atoms in `components/ui/` — Button, Input (basic), Card, Badge, Field, Empty, LoadingOverlay, Label
- Molecules in `components/common/` — InputField (composes Input + Field), StatusBadge (composes Badge)
- Always register new top-level folders in `tailwind.config.js` `content[]`
- **Aturan `components/ui/`**: WAJIB stateless & tanpa logika bisnis. Komponen dengan logika spesifik fitur (ZScoreBadge, ChatBubble, dll) taruh di `features/xxx/components/`.

### Icon System
- `components/ui/icon-symbol.tsx` — maps SF Symbol names → Material Icons
- `components/ui/icon-symbol.ios.tsx` — native `SymbolView` for iOS
- Usage: `<IconSymbol name="house.fill" size={24} color="#3e646a" />`

---

## 11. BUSINESS RULES (Critical untuk Mobile)

1. **Satu PARENT bisa punya banyak anak**
2. **Assessment bersifat append-only** — tidak bisa diedit setelah submit
3. **Prediksi di-generate client-side** — INSERT assessment → baca data → hitung Z-score lokal (`who-zscore.ts`) → Gemini API → INSERT prediction (`COMPLETED`) — semuanya dari mobile
   - Jika Gemini gagal (429 / network / timeout): catch-all fallback → INSERT prediction tetap jalan dengan `ai_limited = true` — **user tidak pernah stuck di loading**
4. **Blockchain anchoring async** — tidak memblokir UI
5. **Foto makanan max 5MB** — format JPEG/PNG/WebP — upload ke Supabase Storage langsung
6. **Chatbot hanya bisa diakses** jika anak punya ≥1 prediksi COMPLETED
7. **Hanya ADMIN yang bisa buat akun MEDIC/POSYANDU** — tidak bisa self-register
8. **PII tidak pernah masuk ke chain** — hanya hash & CID IPFS
9. **VC hanya diterbitkan oleh MEDIC** yang punya `walletAddress`
10. **Assessment 5 langkah**: (1) Data dasar → (2) Antropometri → (3) Riwayat makan → (4) Riwayat penyakit → (5) Review & submit
11. **Consultation chat via Realtime Broadcast**: Setiap PARENT punya channel `consult_<parentId>` yang di-subscribe oleh MEDIC. Broadcast hanya untuk pengiriman — persist pakai `insert` ke Supabase (bukan `upsert`).
12. **Family doctor**: PARENT bisa assign 1 MEDIC sebagai dokter keluarga. Dokter bisa melihat daftar pasien + chat inbox di dashboard-nya.

**Catatan**: Di mobile, Step 1 (data dasar) di-skip karena child sudah dipilih sebelumnya. Assessment dimulai dari Step 2 (body-size).

---

## 12. CLINICAL RULES

### Target Populasi
Anak **0–60 bulan** (0–5 tahun).

### Klasifikasi Stunting (TB/U)
| Status | Z-score TB/U |
|--------|-------------|
| NORMAL | ≥ -2 SD |
| AT_RISK | -2 SD hingga -2.5 SD |
| STUNTED | < -2 SD |
| SEVERELY_STUNTED | < -3 SD |

### Aturan Wajib
1. **Z-score dihitung di mobile** (`utils/who-zscore.ts`) pakai tabel WHO LMS — bukan oleh AI
2. **Gemini hanya interpreter & recommendation engine** — bukan kalkulator klinis
3. **Setiap hasil prediksi WAJIB sertakan disclaimer**:
   > "Hasil ini bersifat skrining awal dan bukan diagnosis medis. Konsultasikan dengan dokter atau tenaga kesehatan."
4. Gunakan frasa **"berisiko"** bukan **"menderita"**

### Disclaimer Component
Sudah ada: `features/assessment/components/DisclaimerText.tsx` — warna amber, reusable.

---

## 13. CLINICAL BANNER (Chat)
Di `ConsultScreen.tsx` ada banner warning sticky di bawah header:
> "Konsultasi AI ini hanya bersifat edukatif awal dan tidak menggantikan diagnosis atau saran keputusan medis dari dokter anak."

---

## 14. FEATURE STATUS (Gap Analysis)

| Fitur | Status | Mock? | Prioritas |
|-------|--------|-------|-----------|
| Auth (Login/Register/Refresh/Logout) | ✅ Complete | Real API | Critical |
| Children (List/Create/Detail/Edit) | ✅ Complete | Real API | Critical |
| Assessment 5-Step (Body → Feeding → Illness → Review → Results) | ✅ Complete | Real API | Critical |
| Loading PENDING + polling prediction (usePrediction hook, 3s interval) | ✅ Complete | Real API | High |
| WHO Growth Chart proper | ✅ Complete | Real API | High |
| Gemini AI Predict (assessment → z-score + rekomendasi) | ✅ Complete | Real API | High |
| Gemini AI Nutrition Analysis (foto makanan) | ✅ Complete | Real API | High |
| Nutrition Scanner/Camera | ⚠️ Simulated UI | Real API | High |
| Nutrition History List | ✅ Complete | Real API | Medium |
| Chatbot AI (via Gemini Chat) | ✅ Complete | Real API | High |
| Chat History Persistent | ✅ Complete | Real API | Medium |
| PDF Reports | ✅ Complete | Real API | Medium |
| MEDIC Dashboard | ✅ Complete | Real API | High |
| POSYANDU Screens | ⚠️ Partial (no server endpoint) | No API | Medium |
| ADMIN Screens | ❌ Missing | — | Low |
| QR Scanner (VC) | ✅ Complete | Real API | High |
| VC Status on Child Detail | ✅ Complete | Real API | High |
| Blockchain Verification | ✅ Complete | Real API | Medium |
| Supabase Test Script | ✅ `scripts/test-supabase.ts` | Real API | Low |
| Push Notifications | ❌ Missing | — | Low |
| Maps / Faskes Terdekat | ❌ Missing | — | Low |
| Offline Mode | ❌ Missing | — | Low |

---

## 15. DEVELOPMENT RULES (dari pengalaman fatal)

1. **Gunakan `npx expo install` bukan `npm install`** — hindari mismatch versi SDK
2. **Jika terpaksa `npm install`, kunci versi dengan `~54.x.x`** (sesuai SDK 54)
3. **Daftarkan folder baru di `tailwind.config.js` `content[]`** — setiap buat top-level dir baru
4. **Bersihkan cache Metro** setelah ubah dependensi/config: `npx expo start -c`
5. **Gunakan Zustand selector individual** — hindari destructuring penuh untuk cegah re-render
6. **Ekstrak lookup tables ke konstanta modul** — jangan define di dalam komponen
7. **Gunakan uncontrolled TextInput (`useRef`)** untuk form input — hindari re-render per keystroke
8. **Bungkus komponen leaf/list dengan `React.memo`** — cegah re-render tidak perlu
9. **Jangan fire-and-forget `mutateAsync` tanpa `await`** — selalu `await triggerPrediction()` dan bungkus di try/catch terpisah dari step sebelumnya. Unhandled rejection dari mutation menyebabkan polling infinite.
10. **Gemini error = fallback, bukan crash** — `geminiService.predict()` menggunakan catch-all: semua error path (429/network/JSON) tetap INSERT prediction dengan `ai_limited = true`. Jangan ubah ke `throw err` kecuali ada alasan kuat.

---

## 16. ENVIRONMENT VARIABLES

| Variable | Default | Keterangan |
|----------|---------|------------|
| `EXPO_PUBLIC_SUPABASE_URL` | `https://[project].supabase.co` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_KEY` | — | Supabase anon/publishable key (aman utk client) |
| `EXPO_PUBLIC_GEMINI_API_KEY` | — | Google Gemini API key (langsung dari mobile) |
| `EXPO_PUBLIC_APP_NAME` | `Tumbuh Sehat` | Nama app |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | — | Untuk fitur faskes (future) |
| `EXPO_PUBLIC_PROJECT_ID` | — | Expo push notification (future) |
| `EXPO_PUBLIC_SENTRY_DSN` | — | Error monitoring (opsional) |

**Catatan**: `EXPO_PUBLIC_GEMINI_API_KEY` terekspose ke client. Aman untuk dev/preview, jangan digunakan di produksi publik tanpa proteksi server.

---

## 17. SERVICE PATTERN (WAJIB DIIKUTI)

Setiap service module mengikuti pola langsung ke Supabase dengan **satu fungsi per method**:

```typescript
// Contoh: children/service/children-service.ts
import { supabase } from '@/utils/supabase'
import type { Child } from '@/types/child-types'

export const childrenService = {
  list: async (): Promise<Child[]> => {
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data.map(transformChild)
  },
}
```

**Aturan:**
- Hanya 1 fungsi per method — langsung real API, tanpa cabang mock
- Transform server→client DTO ditulis sebagai fungsi helper di file yang sama

---

## 18. PERFORMANCE OPTIMIZATIONS (Sudah Diterapkan)

- **Zustand selectors**: `useAuthStore(s => s.field)` — subscribe ke field spesifik
- **Uncontrolled TextInput**: Form auth & add child pakai `useRef`, bukan `useState` + `value`
- **React.memo**: StatusBadge, Empty, HomeScreen items, FlatList items (Vault, Nutrition)
- **Static constants**: Variant styles & size classes diekstrak ke konstanta modul
- **FlatList memoization**: RecordCard (Vault) & LogItem (Nutrition) dibungkus `React.memo`

---

## 19. SERVICE & HOOK STATUS

| Fitur | Service | Via | Hook | Status |
|-------|---------|-----|------|--------|
| Auth | `auth/services/auth-service.ts` ✅ | `supabase.auth.*()` | `auth/hooks/useAuth.ts` ✅ | Login/register via supabase, `setSession`/`setUser` di store |
| Children | `children/services/children-service.ts` ✅ | `supabase.from('children').*()` | `children/hooks/useChildren.ts` ✅ | Mengganti GET/POST `/api/children` |
| Assessment | `assessment/services/assessment-service.ts` ✅ | `supabase.from('assessments').*()` | `assessment/hooks/useAssessment.ts` ✅ | Insert ke Supabase, trigger backend |
| Nutrition | `nutrition/services/nutrition-service.ts` ✅ | `supabase.from('nutrition_logs').*()` + `supabase.storage` | `nutrition/hooks/useNutrition.ts` ✅ | Storage langsung dari client |
| Chat | `chat/services/chat-service.ts` ✅ | `supabase.from('chat_sessions').*()` | `chat/hooks/useChat.ts` ✅ | Read history dari Supabase |
| Gemini Predict | `gemini/services/gemini-service.ts` ✅ | `fetch() → Gemini API langsung` | `gemini/hooks/useGeminiPrediction.ts` ✅ | Z-score lokal + Gemini + INSERT prediction — semua client-side |
| Gemini Nutrition | `gemini/services/gemini-service.ts` ✅ | `fetch() → Gemini API langsung` | `gemini/hooks/useGeminiNutrition.ts` ✅ | Analisis foto makanan langsung |
| Gemini Chat | `chat/services/chat-service.ts` ✅ | `fetch() → Gemini API langsung` | `chat/hooks/useChat.ts` ✅ | System instruction + skill dokumen, persist via Supabase |
| Blockchain | `blockchain/services/blockchain-service.ts` ✅ | `apiClient → backend` | `blockchain/hooks/useBlockchain.ts` ✅ | Perlu migrasi ke Supabase langsung |
| Medic | `medic/services/medic-service.ts` ✅ | `supabase.from('children').select(...)` | `medic/hooks/useMedic.ts` ✅ | Query multi-anak via RLS |
| Vc | `vc/services/vc-service.ts` ✅ | `axios → /api/vc/*` | `vc/hooks/useVc.ts` ✅ | Perlu migrasi ke Supabase langsung |
| Posyandu | `posyandu/services/posyandu-service.ts` ⚠️ | — | `posyandu/hooks/usePosyandu.ts` ⚠️ | Belum ada endpoint |
| Report | `report/services/report-service.ts` ✅ | `axios → GET /api/reports/*` | `report/hooks/useReport.ts` ✅ | Perlu migrasi ke Supabase langsung |

---

## 20. COMPONENT STATUS

✅ **Semua komponen yang sebelumnya inline sudah diekstrak:**

| Komponen | Lokasi | Status |
|----------|--------|--------|
| `DisclaimerText` | `assessment/components/` | ✅ |
| `AssessmentCard` | `assessment/components/` | ✅ |
| `PredictionCard` | `assessment/components/` | ✅ |
| `ZScoreBadge` | `assessment/components/` | ✅ |
| `NutritionCard` | `nutrition/components/` | ✅ |
| `FoodTagList` | `nutrition/components/` | ✅ |
| `ChatBubble` | `chat/components/` | ✅ |
| `ChatInput` | `chat/components/` | ✅ |
| `SuggestedChips` | `chat/components/` | ✅ |
| `RealtimeChat` | `chat/components/` | ✅ |
| `ConversationCard` | `components/common/` | ✅ |

---

## 21. KEY FILES REFERENCE

| File | Purpose |
|------|---------|
| `app/_layout.tsx` | Root — QueryClient + Auth Gate + SplashScreen |
| `app/(app)/_layout.tsx` | Stack navigator for protected routes |
| `app/(app)/(tabs)/_layout.tsx` | Bottom tabs config |
| `services/api.ts` | Axios client + interceptors |
| `services/api.ts` | Axios client + interceptors |
| `stores/authStore.ts` | Session-based auth store — hydrate dari supabase.auth.getSession() |
| `features/gemini/` | Gemini types, service (predict + analyzeNutrition), hooks (useGeminiPrediction, useGeminiNutrition) |
| `features/assessment/hooks/useAssessment.ts` | Assessment queries + prediction polling via TanStack Query |
| `stores/assessmentFormStore.ts` | Assessment wizard state |
| `stores/nutritionStore.ts` | Nutrition logs |
| `stores/vaultStore.ts` | Blockchain records |
| `constants/theme.ts` | Color tokens & spacing |
| `utils/cn.ts` | className helper |
| `utils/random.ts` | generateId, randomHex |
| `utils/who-zscore.ts` | WHO LMS Z-score engine (HAZ/WAZ/WHZ) — local |
| `utils/gemini-client.ts` | Gemini API wrapper with system_instruction |
| `data/skills/` | 5 skill markdown docs for Gemini RAG |
| `types/conversation-types.ts` | Shared Conversation type |
| `features/medic/hooks/useMedic.ts` | useConversations (refetchInterval 10s) |
| `scripts/test-supabase.ts` | Full Supabase CRUD + RLS integration test |
| `components/ui/icon-symbol.tsx` | Icon mapping |
