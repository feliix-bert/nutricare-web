# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Dokumen master untuk AI agent yang bekerja di `mobile/`.

---

## 1. PROJECT OVERVIEW

**TumbuhSehat** = Gizi + Blockchain. Platform deteksi stunting dini untuk anak 0–60 bulan.

- **Tagline**: *"Data Gizi Anak: Teranalisis oleh AI, Dijamin oleh Blockchain."*
- **Target**: Orang tua (PARENT), tenaga medis (MEDIC), kader posyandu (POSYANDU), admin (ADMIN)
- **Mobile**: React Native / Expo SDK 54
- **Web**: Next.js (App Router) — server untuk Gemini/blockchain/PDF
- **Backend**: Supabase (Auth, PostgreSQL, Storage, Realtime) — **tidak ada Java server**
- **Blockchain**: Polygon (testnet Amoy, chainId=80002)
- **AI**: Google Gemini (Flash + Pro Vision)
- **Storage**: Supabase Storage
- **VC**: Verifiable Credential W3C — IPFS via Pinata

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
    │   ├── report.tsx                # → ReportScreen (PDF)
    │   ├── medic/dashboard.tsx       # → MedicDashboardScreen
    │   ├── blockchain/verify/[assessmentId].tsx  # → BlockchainVerifyScreen
    │   ├── vc/[vcId].tsx             # → VcDetailScreen
    │   ├── vc/scan.tsx               # → VcScannerScreen
    │   └── vc/verify-result.tsx      # → VcVerifyResultScreen
```

**Auth Gate**: `app/_layout.tsx` — `Stack.Protected` berdasarkan `isAuthenticated` dari authStore. SplashScreen ditahan sampai `isHydrated = true`.

---

## 4. FOLDER STRUCTURE

```
src/
├── app/                          # Expo Router entry points (thin wrappers)
├── features/                     # Domain modules per fitur (semua punya barrel index.ts)
│   ├── auth/                     # Sign in, register, refresh
│   ├── children/                 # CRUD anak + growth tracker
│   ├── home/                     # Dashboard beranda
│   ├── profile/                  # Profil user
│   ├── assessment/               # Assessment 5-langkah + prediksi
│   ├── nutrition/                # Log gizi, scanner, analisis
│   ├── chat/                     # Chatbot AI (lebih baru dari consult/)
│   ├── vault/                    # Blockchain ledger (Zustand store)
│   ├── consult/                  # (legacy — masih ada screens/, prefer chat/)
│   ├── blockchain/               # Verifikasi on-chain
│   ├── vc/                       # Verifiable Credential W3C
│   ├── medic/                    # Dashboard tenaga medis
│   ├── posyandu/                 # Modul kader posyandu
│   └── report/                   # Unduh laporan PDF
│
├── components/                   # Shared UI (global atomik, stateless)
│   └── ui/                       # Button, Input, Card, StatusBadge, EmptyState, dll
├── services/                     # Shared networking
│   ├── api.ts                    # Axios instance + interceptor
│   └── mock.ts                   # Mock backend in-memory
├── stores/                       # Zustand stores
│   ├── authStore.ts
│   ├── assessmentFormStore.ts
│   ├── nutritionStore.ts
│   └── vaultStore.ts
├── types/                        # Shared types
│   └── api.types.ts              # ApiError, PageResponse<T>
├── constants/                    # Theme colors & spacing
│   └── theme.ts
└── utils/                        # Helpers
    └── cn.ts                     # className utility
```

---

## 5. API / DATA ACCESS

### Arsitektur: Supabase + Next.js (bukan Java Spring Boot)

```
┌─────────────────────────────────────────────────────┐
│                    MOBILE (Expo)                      │
│                                                       │
│  ┌───────────────────────────────────────────┐       │
│  │  supabase-js (anon key + RLS)             │       │
│  │  → CRUD langsung ke Supabase              │       │
│  │  → Auth: signUp, signIn, signOut           │       │
│  │  → Realtime subscribe                     │       │
│  └───────────────────────────────────────────┘       │
│                                                       │
│  ┌───────────────────────────────────────────┐       │
│  │  Axios / fetch (ke Next.js:3000)          │       │
│  │  → Gemini AI predict/chat/nutrition       │       │
│  │  → Blockchain anchor/verify               │       │
│  │  → VC issue/revoke                        │       │
│  │  → PDF report download                    │       │
│  └───────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────┘
```

### Base URL
```
Supabase: EXPO_PUBLIC_SUPABASE_URL (dari project Supabase)
Next.js:  EXPO_PUBLIC_API_URL = http://<laptop-ip>:3000
```

### Error Format (Next.js API)
```json
{ "status": 400, "error": "BAD_REQUEST", "message": "...", "timestamp": "...", "path": "..." }
```

### Auth — Supabase Auth (no custom endpoints)

| Operasi | Cara | Keterangan |
|---------|------|-----------|
| Register | `supabase.auth.signUp({ email, password, options })` | Auto-create user + trigger ke `public.users` |
| Login | `supabase.auth.signInWithPassword({ email, password })` | Return session (access + refresh) |
| Logout | `supabase.auth.signOut()` | Revoke session |
| Session | `supabase.auth.getSession()` | Auto-refresh by SDK |
| User data | `supabase.from('users').select('*').eq('id', userId).single()` | Dari `public.users` |

**Ga perlu refresh token manual.** SDK handle otomatis.

### Children — via `supabase-js` langsung

| Operasi | Cara |
|---------|------|
| List | `supabase.from('children').select('*').order('created_at', { ascending: false })` |
| Create | `supabase.from('children').insert({ name, birth_date, gender }).select().single()` |
| Detail | `supabase.from('children').select('*, assessments(*, prediction:predictions(*))').eq('id', childId).single()` |
| Update | `supabase.from('children').update({...}).eq('id', childId).select().single()` |

### Assessments — Insert via `supabase-js`, predict via Next.js

| Operasi | Cara |
|---------|------|
| Create | `supabase.from('assessments').insert({...}).select().single()` |
| Predict | `POST /api/gemini/predict` → { assessmentId } → return prediction |
| Get detail | `supabase.from('assessments').select('*, prediction:predictions(*)').eq('id', id).single()` |
| Get by child | `supabase.from('assessments').select('*, prediction:predictions(*)').eq('child_id', childId).order('created_at', { ascending: false })` |

**Validasi Assessment:**
| Field | Rule |
|-------|------|
| weight | 0.5 – 50 kg |
| height | 30 – 130 cm |
| headCircumference | 20 – 60 cm (opsional) |
| mpasiAge | 0 – 24 bulan (opsional) |
| mealFreq | 1 – 10 kali/hari |
| illnessHistory | max 500 karakter (opsional) |

### Nutrition — Upload ke Supabase Storage, analisis via Next.js

| Operasi | Cara |
|---------|------|
| Upload foto | `supabase.storage.from('food-photos').upload(path, file)` |
| Analisis | `POST /api/gemini/nutrition` → { childId, photoUrl } → return nutrition data |
| Simpan log | `supabase.from('nutrition_logs').insert({...}).select().single()` |
| Riwayat | `supabase.from('nutrition_logs').select('*').eq('child_id', childId).order('created_at', { ascending: false })` |

### Chat — via Next.js API

| Operasi | Cara |
|---------|------|
| Send message | `POST /api/gemini/chat` → { predictionId, message } |
| Riwayat | `supabase.from('chat_sessions').select('*').eq('prediction_id', predictionId).single()` |

**Guard:** Chat hanya bisa jika prediction status = COMPLETED.

### Blockchain
| Operasi | Cara |
|---------|------|
| Verify | `GET /api/blockchain/verify/{assessmentId}` → public |
| Anchor | `POST /api/blockchain/anchor` → server internal |

### Reports
| Operasi | Cara |
|---------|------|
| Download PDF | `GET /api/reports/{childId}?from=&to=` → download blob |

### Verifiable Credential
| Operasi | Cara |
|---------|------|
| Issue | `POST /api/vc/issue` → MEDIC/ADMIN |
| Revoke | `POST /api/vc/revoke` → MEDIC/ADMIN |
| Get detail | `supabase.from('verifiable_credentials').select('*').eq('id', vcId).single()` |
| Get by child | `supabase.from('verifiable_credentials').select('*').eq('child_id', childId).single()` |

---

## 6. TYPES / DTOs

### api.types.ts
```typescript
type ApiError = { status: number; error: string; message: string; timestamp: string; path: string }
type PageResponse<T> = { data: T[]; page: number; size: number; totalElements: number; totalPages: number }
```

### auth.types.ts
```typescript
type Role = 'PARENT' | 'MEDIC' | 'POSYANDU' | 'ADMIN'
type User = { id: string; email: string; name: string; role: Role; walletAddress: string | null; isActive?: boolean }
type LoginRequest = { email: string; password: string }
type RegisterRequest = { email: string; password: string; name: string }
type AuthResponse = { accessToken: string; refreshToken: string; user: User }  // register juga return ini
type RefreshResponse = { accessToken: string; refreshToken: string; user: User }  // refresh return full tokens
```

### child.types.ts
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

### assessment.types.ts — flat ServerPredictionResponse → nested DTOs
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

### authStore (Zustand + SecureStore)
```
State: user, accessToken, refreshToken, isAuthenticated, isHydrated
Actions: setAuth, setUser, logout, hydrate
Storage: expo-secure-store (native) / localStorage (web)
Keys: 'tumbuh_access_token', 'tumbuh_refresh_token'
```
Hydration dipanggil di `app/_layout.tsx` useEffect. Auth gate menunggu `isHydrated = true`.

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
Actions: addRecord → generates mock blockNumber, txHash, gasFee
```

---

## 8. MOCK SYSTEM

### Mechanism
- Flag `USE_MOCK = false` di `services/mock.ts` (sekarang real API)
- Service files toggle: `if (USE_MOCK) { ... } else { apiClient.get(...) }`
- **Tidak ada** fungsi `mockXxx`/`realXxx` terpisah — query method tunggal per method

### Mock Data
```
Seeded users: 1 (orang.tua@email.com / password123)
Seeded children: 2 (Andi Santoso, Sari Dewi)
Seeded assessments: 2 (with mock predictions + blockchain anchors)
```

### Mock Prediction Logic (simplified)
```typescript
// BUKAN kalkulasi WHO riil — hanya threshold tinggi:
status = height < 60 ? 'SEVERELY_STUNTED'
       : height < 75 ? 'STUNTED'
       : height < 85 ? 'AT_RISK'
       : 'NORMAL'
```

### Mock Auth
- Fake JWT: `base64(JSON.stringify({ sub, role, exp })).fakesig`
- Refresh token selalu dianggap valid

### Switch to Real API
Set `USE_MOCK = true` untuk fallback ke mock in-memory. Saat `USE_MOCK = false` service pakai `apiClient` yang mengarah ke `EXPO_PUBLIC_API_URL`.

---

## 9. AXIOS CLIENT (`services/api.ts`)

```typescript
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080'
apiClient = axios.create({ baseURL: BASE_URL, timeout: 15000 })
```
- **Request interceptor**: Attach `Authorization: Bearer <accessToken>` dari authStore
- **Response interceptor**: On 401 → try refresh token via `/api/auth/refresh` → retry original request → on fail, logout

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
3. **Prediksi di-generate async** — status PENDING → COMPLETED (perlu polling)
4. **Blockchain anchoring async** — tidak memblokir UI
5. **Foto makanan max 5MB** — format JPEG/PNG/WebP
6. **Chatbot hanya bisa diakses** jika anak punya ≥1 prediksi COMPLETED
7. **Hanya ADMIN yang bisa buat akun MEDIC/POSYANDU** — tidak bisa self-register
8. **PII tidak pernah masuk ke chain** — hanya hash & CID IPFS
9. **VC hanya diterbitkan oleh MEDIC** yang punya `walletAddress`
10. **Assessment 5 langkah**: (1) Data dasar → (2) Antropometri → (3) Riwayat makan → (4) Riwayat penyakit → (5) Review & submit

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
1. **Z-score dihitung di server** (Spring Boot) pakai tabel WHO — bukan di mobile
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
| Loading PENDING + polling prediction | ✅ Complete | Real API | High |
| WHO Growth Chart proper | ✅ Complete | Real API | High |
| Nutrition Scanner/Camera | ⚠️ Simulated UI | Real API | High |
| Nutrition History List | ✅ Complete | Real API | Medium |
| Chatbot AI | ✅ Complete | Real API | High |
| Chat History Persistent | ❌ Missing | — | Medium |
| PDF Reports | ✅ Complete | Real API | Medium |
| MEDIC Dashboard | ✅ Complete | Real API | High |
| POSYANDU Screens | ⚠️ Partial (no server endpoint) | Fallback Mock | Medium |
| ADMIN Screens | ❌ Missing | — | Low |
| QR Scanner (VC) | ✅ Complete | Real API | High |
| VC Status on Child Detail | ✅ Complete | Real API | High |
| Blockchain Verification | ✅ Complete | Real API | Medium |
| Push Notifications | ❌ Missing | — | Low |
| Maps / Faskes Terdekat | ❌ Missing | — | Low |
| Offline Mode | ❌ Missing | — | Low |

---

## 15. ENVIRONMENT VARIABLES

| Variable | Default | Keterangan |
|----------|---------|------------|
| `EXPO_PUBLIC_SUPABASE_URL` | — | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | — | Supabase anon/public key |
| `EXPO_PUBLIC_API_URL` | `http://localhost:3000` | Base URL Next.js (Gemini/blockchain/PDF) |
| `EXPO_PUBLIC_APP_NAME` | `Tumbuh Sehat` | Nama app |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | — | Untuk fitur faskes (future) |

**⚠️ `EXPO_PUBLIC_*` = terekspose ke client.** Cuma anon key Supabase yang aman. Service_role key dan API key Gemini jangan pernah di sini.

---

## 16. SERVICE PATTERN (BARU — Supabase + Next.js)

Setiap service module pake pola dual-provider (Supabase untuk CRUD, Next.js untuk AI/blockchain):

```typescript
import { supabase } from '@/services/supabase';

export const childrenService = {
  getAll: async (): Promise<Child[]> => {
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  getById: async (childId: string): Promise<ChildDetail> => {
    const { data, error } = await supabase
      .from('children')
      .select('*, assessments(*, prediction:predictions(*))')
      .eq('id', childId)
      .single();
    if (error) throw error;
    return data;
  },

  create: async (req: ChildRequest): Promise<Child> => {
    const { data, error } = await supabase
      .from('children')
      .insert(req)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
```

### Pattern untuk Next.js API (Gemini/blockchain/VC)
```typescript
import { apiClient } from '@/services/api';

export const predictionService = {
  predict: async (assessmentId: string): Promise<PredictionResponse> => {
    const res = await apiClient.post('/api/gemini/predict', { assessmentId });
    return res.data;
  },
};
```

### Migration Plan per Service

| Service | Sumber Data Lama | Sumber Data Baru | Tipe |
|---------|-----------------|------------------|------|
| `auth.service.ts` | POST `/api/auth/*` → Java | `supabase.auth.*()` | 🔄 Ubah total |
| `children.service.ts` | GET/POST/PUT `/api/children` → Java | `supabase.from('children').*()` | 🔄 Ubah total |
| `assessment.service.ts` | POST/GET `/api/assessments` → Java | Insert ke Supabase + `POST /api/gemini/predict` | 🔄 Ubah total |
| `nutrition.service.ts` | POST `/api/nutrition` → Java | Upload Storage + `POST /api/gemini/nutrition` | 🔄 Ubah total |
| `chat.service.ts` | POST/GET `/api/chat` → Java | `POST /api/gemini/chat` + query Supabase | 🔄 Ubah total |
| `blockchain.service.ts` | GET `/api/blockchain/verify` → Java | `GET /api/blockchain/verify/{id}` | 🔄 Ubah endpoint |
| `vc.service.ts` | POST/GET `/api/vc` → Java | `POST /api/vc/*` + query Supabase | 🔄 Ubah endpoint |
| `medic.service.ts` | GET `/api/medic` → Java | `supabase.from('children').select()` | 🔄 Ubah total |
| `report.service.ts` | GET `/api/reports` → Java | `GET /api/reports/{childId}` | 🔄 Ubah endpoint |
| `posyandu.service.ts` | Fallback mock | `supabase.from('children').select()` | 🔄 Ubah total |

---

## 17. NEW SERVICE: `services/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: {
      getItem: async (key) => SecureStore.getItemAsync(key),
      setItem: async (key, value) => SecureStore.setItemAsync(key, value),
      removeItem: async (key) => SecureStore.deleteItemAsync(key),
    },
  },
});
```

**Ga perlu authStore manual lagi.** Session di-persist via SecureStore, auto-refresh oleh SDK.

---

## 18. PERFORMANCE OPTIMIZATIONS (Tetap Berlaku)

- **Zustand selectors**: `useAuthStore(s => s.field)` — subscribe ke field spesifik
- **Uncontrolled TextInput**: Form auth & add child pakai `useRef`, bukan `useState` + `value`
- **React.memo**: StatusBadge, Empty, HomeScreen items, FlatList items (Vault, Nutrition)
- **Static constants**: Variant styles & size classes diekstrak ke konstanta modul
- **FlatList memoization**: RecordCard (Vault) & LogItem (Nutrition) dibungkus `React.memo`

---

## 19. HOOK MIGRATION PLAN (TanStack Query)

React Query hooks tetap sama, cuma fetcher berubah:

```typescript
// ⬅️ Dulu: axios.get('/api/children')
export function useChildren() {
  return useQuery({
    queryKey: ['children'],
    queryFn: () => childrenService.getAll(),
  });
}

// ➡️ Sekarang: supabase.from('children').select('*')
// Sama persis! Cuma beda queryFn.

export function useChildren() {
  return useQuery({
    queryKey: ['children'],
    queryFn: () => supabase.from('children').select('*'),
  });
}
```

### Realtime Subscription (Fitur Baru — ga ada di Java)
```typescript
// Subscribe perubahan realtime di assessment
useEffect(() => {
  const channel = supabase
    .channel('assessment-changes')
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'predictions',
        filter: `assessment_id=eq.${assessmentId}` },
      (payload) => {
        queryClient.invalidateQueries({ queryKey: ['assessment', assessmentId] });
      }
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [assessmentId]);
```

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

---

## 21. KEY FILES REFERENCE

| File | Purpose |
|------|---------|
| `app/_layout.tsx` | Root — QueryClient + Auth Gate + SplashScreen |
| `app/(app)/_layout.tsx` | Stack navigator for protected routes |
| `app/(app)/(tabs)/_layout.tsx` | Bottom tabs config |
| `services/supabase.ts` | **BARU** — Supabase client (anon key + RLS) |
| `services/api.ts` | Axios client + interceptors (tetap ada untuk Next.js API) |
| `services/mock.ts` | Mock backend + USE_MOCK flag (🔜 akan dihapus) |
| `stores/authStore.ts` | Zustand auth (🔜 akan dihapus — ganti `supabase.auth`) |
| `stores/assessmentFormStore.ts` | Assessment wizard state |
| `stores/nutritionStore.ts` | Nutrition logs (🔜 akan ganti ke Supabase query) |
| `stores/vaultStore.ts` | Blockchain records (🔜 akan ganti ke Supabase query) |
| `constants/theme.ts` | Color tokens & spacing |
| `utils/cn.ts` | className helper |
| `components/ui/icon-symbol.tsx` | Icon mapping |
