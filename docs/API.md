# API.md — Tumbuh Sehat (GiziChain)

**Update:** 2026-07-02 — Migrasi dari Java Spring Boot → Next.js + Supabase.

## Arsitektur API Baru

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT (Expo / Next.js)                      │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              supabase-js (anon key + RLS)                │  │
│  │  ── CRUD langsung ke Supabase:                          │  │
│  │     auth, children, assessments, nutrition_logs,        │  │
│  │     predictions, chat_sessions, users, dll               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Axios / fetch (ke Next.js)                  │  │
│  │  ── Operasi yang butuh server rahasia:                   │  │
│  │     Gemini AI, Blockchain, PDF, VC                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         │                                    │
         ▼                                    ▼
┌──────────────────────┐     ┌──────────────────────────────────┐
│    Supabase REST     │     │      Next.js API Routes         │
│  (auto dari SDK)     │     │  /api/gemini/*                  │
│                      │     │  /api/blockchain/*              │
│  - Auth bawaan       │     │  /api/vc/*                      │
│  - RLS enforce       │     │  /api/reports/*                 │
│  - Realtime WS       │     └──────────────────────────────────┘
└──────────────────────┘
```

---

## Service Distribution

| Kategori | Via | Base URL | Auth |
|----------|-----|----------|------|
| **Auth** (register, login, logout) | `supabase.auth.*()` | Supabase | — |
| **CRUD** (children, assessments, predictions, nutrition, chat) | `supabase.from('table').*()` | Supabase REST | RLS + session |
| **Gemini AI** (prediksi, nutrition vision, chat) | `POST /api/gemini/*` | Next.js | Bearer token (forward ke Supabase) |
| **Blockchain** (anchor, verify) | `POST /api/blockchain/*` | Next.js | Bearer token (forward ke Supabase) |
| **VC** (issue, revoke, verify) | `POST /api/vc/*` | Next.js | Bearer token (forward ke Supabase) |
| **PDF Reports** | `GET /api/reports/*` | Next.js | Bearer token (forward ke Supabase) |
| **Storage upload** | `supabase.storage.from('bucket').upload()` | Supabase Storage | RLS + session |

---

## Base URLs

| Environment | Supabase | Next.js |
|------------|----------|---------|
| **Dev** | `http://localhost:54321` (local) / project URL | `http://localhost:3000` |
| **Prod** | `https://[project].supabase.co` | `https://[app].vercel.app` |

---

## Auth — Supabase Auth (bukan API custom)

### Register
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'orang.tua@email.com',
  password: 'min8karakter',
  options: {
    data: { name: 'Budi Santoso' }
  }
});
```

**Response:**
```json
{
  "user": { "id": "...", "email": "...", "user_metadata": { "name": "Budi Santoso" } },
  "session": { "access_token": "...", "refresh_token": "...", "expires_in": 3600 }
}
```

**Trigger:** Setelah signup, Supabase Auth auto-create user di `auth.users`.  
**DB Trigger:** `on_auth_user_created()` → INSERT ke `public.users`.

---

### Login
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'orang.tua@email.com',
  password: 'min8karakter'
});
```

**Response:** Sama seperti register — `{ user, session }`.

---

### Logout
```typescript
await supabase.auth.signOut();
```

**Effect:** Session di-revoke. RLS otomatis tolak query anonim.

---

### Get Current Session
```typescript
const { data: { session } } = await supabase.auth.getSession();
// Atau subscribe perubahan:
supabase.auth.onAuthStateChange((event, session) => { ... });
```

---

### Token Refresh
**Handle otomatis oleh Supabase JS SDK.** Tidak perlu manual refresh token interceptor seperti di Java.

Session di-refresh otomatis sebelum expired. Di mobile, session persist via `@supabase/ssr` atau `AsyncStorage`.

---

### Get Current User (setara GET /api/auth/me)
```typescript
const { data: { user } } = await supabase.auth.getUser();
// Atau query dari public.users untuk data tambahan
const { data: profile } = await supabase
  .from('users')
  .select('*')
  .eq('id', user.id)
  .single();
```

---

## Children — Langsung ke Supabase

### GET /children — Ambil daftar anak
```typescript
const { data } = await supabase
  .from('children')
  .select('*')
  .order('created_at', { ascending: false });
```

**RLS enforce:** Parent → hanya anak miliknya. MEDIC/ADMIN → semua anak.

---

### POST /children — Tambah anak
```typescript
const { data, error } = await supabase
  .from('children')
  .insert({
    name: 'Andi Santoso',
    birth_date: '2023-01-15',
    gender: 'MALE'
  })
  .select()
  .single();
```

---

### GET /children/{childId} — Detail anak + assessments
```typescript
const { data: child } = await supabase
  .from('children')
  .select(`
    *,
    assessments:assessments(
      *,
      prediction:predictions(*)
    )
  `)
  .eq('id', childId)
  .single();
```

---

### PUT /children/{childId} — Update anak
```typescript
const { data, error } = await supabase
  .from('children')
  .update({ name: 'Andi Budi Santoso', birth_date: '2023-01-15' })
  .eq('id', childId)
  .select()
  .single();
```

---

## Assessments — Insert via Supabase, Predict via Next.js

### POST /assessments — Submit assessment baru
```typescript
// Step 1: Insert assessment ke Supabase (langsung dari client)
const { data: assessment, error } = await supabase
  .from('assessments')
  .insert({
    child_id: 'clx_child_001',
    weight: 9.5,
    height: 74.0,
    head_circumference: 45.5,
    bf_exclusive: true,
    mpasi_age: 6,
    meal_freq: 3,
    illness_history: 'Diare 2 kali'
  })
  .select()
  .single();

// Step 2: Panggil Next.js API untuk prediksi (async)
const prediction = await fetch('/api/gemini/predict', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({ assessmentId: assessment.id })
}).then(r => r.json());

// Step 3: Poll prediction status (pake TanStack Query)
const { data: pred } = await supabase
  .from('predictions')
  .select('*')
  .eq('assessment_id', assessment.id)
  .single();
// pred.prediction_status: PENDING → COMPLETED / FAILED
```

**Validasi (di client — mirror aturan Java):**
| Field | Rule |
|-------|------|
| `weight` | 0.5 – 50 kg |
| `height` | 30 – 130 cm |
| `head_circumference` | 20 – 60 cm (opsional) |
| `mpasi_age` | 0 – 24 bulan (opsional) |
| `meal_freq` | 1 – 10 kali/hari |
| `illness_history` | maks 500 karakter (opsional) |

---

### GET /assessments/{assessmentId}
```typescript
const { data } = await supabase
  .from('assessments')
  .select(`
    *,
    prediction:predictions(*),
    child:children(
      id, name, birth_date, gender,
      user:users(id, name)
    )
  `)
  .eq('id', assessmentId)
  .single();
```

---

### GET /assessments/child/{childId}
```typescript
const { data } = await supabase
  .from('assessments')
  .select(`
    *,
    prediction:predictions(*)
  `)
  .eq('child_id', childId)
  .order('created_at', { ascending: false });
```

---

## Nutrition — Langsung ke Supabase + Next.js Gemini Vision

### POST /nutrition — Upload foto + analisis
```typescript
// Step 1: Upload foto langsung ke Supabase Storage
const { data: uploadData } = await supabase.storage
  .from('food-photos')
  .upload(`${childId}/${Date.now()}.jpg`, photoFile);

const photoUrl = supabase.storage
  .from('food-photos')
  .getPublicUrl(uploadData.path).data.publicUrl;

// Step 2: Panggil Gemini Vision via Next.js
const analysis = await fetch('/api/gemini/nutrition', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({ childId, photoUrl })
}).then(r => r.json());

// Step 3: Simpan hasil ke Supabase
const { data: nutritionLog } = await supabase
  .from('nutrition_logs')
  .insert({
    child_id: childId,
    photo_url: photoUrl,
    food_detected: analysis.foodDetected,
    portion_estimate: analysis.portionEstimate,
    calories: analysis.calories,
    protein: analysis.protein,
    carbs: analysis.carbs,
    fat: analysis.fat,
    fiber: analysis.fiber,
    adequacy_note: analysis.adequacyNote,
    mpasi_recommendation: analysis.mpasiRecommendation
  })
  .select()
  .single();
```

**File constraints:** JPEG/PNG/WebP, max 5 MB.

---

### GET /nutrition/child/{childId}
```typescript
const { data } = await supabase
  .from('nutrition_logs')
  .select('*')
  .eq('child_id', childId)
  .order('created_at', { ascending: false });
```

---

## Chat — Next.js API Route (Gemini)

### POST /api/gemini/chat
Kirim pesan ke chatbot konsultasi.

**Auth:** ✅ Bearer token

**Request Body:**
```json
{
  "predictionId": "clx_pred_001",
  "message": "Anak saya susah makan nasi, apa yang harus saya lakukan?"
}
```

**Response 200 OK:**
```json
{
  "sessionId": "clx_session_001",
  "predictionId": "clx_pred_001",
  "role": "assistant",
  "content": "Berdasarkan kondisi Andi (status AT_RISK, z-score TB/U -2.1), susah makan bisa disebabkan oleh...",
  "timestamp": "2025-07-24T10:00:00Z"
}
```

**Errors:** `400` prediksi blm COMPLETED, `404` prediksi tidak ditemukan, `403` bukan milik user

---

### GET /chat/{predictionId} — Langsung dari Supabase
```typescript
const { data } = await supabase
  .from('chat_sessions')
  .select('*')
  .eq('prediction_id', predictionId)
  .single();
```

**Response:**
```json
{
  "id": "clx_session_001",
  "prediction_id": "clx_pred_001",
  "messages": [
    { "role": "user", "content": "...", "timestamp": "..." },
    { "role": "assistant", "content": "...", "timestamp": "..." }
  ],
  "updated_at": "2025-07-24T10:00:00Z"
}
```

---

## Reports — Next.js API Route

### GET /api/reports/{childId}
Generate dan unduh laporan PDF.

**Auth:** ✅ Bearer token

**Query Params:** `from`, `to` (format YYYY-MM-DD)

**Response 200 OK:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="laporan-anak-[id].pdf"`

**Guard:** Server cek RLS-equivalent — parent hanya bisa download anaknya sendiri.

---

## Blockchain — Next.js API Routes

### POST /api/blockchain/anchor
Anchor hash assessment ke Polygon. Dipanggil otomatis oleh server setelah prediksi selesai.

**Guard:** Server internal (hanya server yang punya private key).

**Response 200 OK:**
```json
{
  "assessmentId": "clx_assessment_001",
  "recordHash": "0xabc123...def456",
  "txHash": "0xabc123...def456",
  "blockNumber": 48291034,
  "anchorStatus": "CONFIRMED",
  "anchoredAt": "2025-07-24T10:00:00Z",
  "explorerUrl": "https://amoy.polygonscan.com/tx/0x..."
}
```

---

### GET /api/blockchain/verify/{assessmentId}
Verifikasi integritas data assessment dengan membandingkan hash on-chain.

**Auth:** ✅ ANY (publik, read-only)

**Response 200 OK:**
```json
{
  "assessmentId": "clx_assessment_001",
  "isValid": true,
  "recordHash": "0xabc123...def456",
  "anchoredAt": "2025-07-24T10:00:00Z",
  "txHash": "0xabc123...def456",
  "blockNumber": 48291034,
  "explorerUrl": "https://amoy.polygonscan.com/tx/0x..."
}
```

**Atau dari client via Wagmi (view-only):**
```typescript
import { useReadContract } from 'wagmi';

const { data } = useReadContract({
  address: GiziChainRegistry.address,
  abi: GiziChainRegistry.abi,
  functionName: 'getRecord',
  args: [assessmentHash]
});
```

---

## Verifiable Credential — Next.js API Routes

### POST /api/vc/issue
Terbitkan Verifiable Credential baru. Data disimpan di IPFS via Pinata, CID dicatat di smart contract.

**Auth:** ✅ MEDIC, ADMIN

**Request Body:**
```json
{
  "childId": "clx_child_001",
  "vcType": "NUTRITION_STATUS",
  "expiresAt": "2026-07-24T10:00:00Z"
}
```

**Response 201 Created:**
```json
{
  "id": "clx_vc_001",
  "childId": "clx_child_001",
  "issuerId": "clx_medic_001",
  "vcType": "NUTRITION_STATUS",
  "ipfsCid": "bafybeig...abc123",
  "txHash": "0xabc123...def456",
  "expiresAt": "2026-07-24T10:00:00Z",
  "createdAt": "2025-07-24T10:00:00Z"
}
```

---

### GET /vc/{vcId} — Langsung dari Supabase
```typescript
const { data } = await supabase
  .from('verifiable_credentials')
  .select('*')
  .eq('id', vcId)
  .single();
```

---

### POST /api/vc/revoke
Cabut VC. Hanya issuer yang bisa revoke.

**Auth:** ✅ MEDIC, ADMIN

**Response 200 OK:** `{ id, isRevoked: true, ... }`

---

## Medic — Langsung dari Supabase

### GET /medic/patients — Semua pasien (paginated)
```typescript
// Pakai edge function atau server route untuk search
const { data } = await supabase
  .from('children')
  .select(`
    id, name, birth_date, gender,
    user:users(id, name, email),
    latest_prediction:predictions(
      status, risk_level, created_at
    )
  `)
  .order('created_at', { ascending: false });
```

---

## Admin — Server Route (bypass RLS)

Admin routes perlu server client (service_role) karena admin butuh akses semua data:

### GET /api/admin/users
**Auth:** ✅ ADMIN

### POST /api/admin/users
**Auth:** ✅ ADMIN

### PATCH /api/admin/users/{userId}/status
**Auth:** ✅ ADMIN

### PATCH /api/admin/users/{userId}/role
**Auth:** ✅ ADMIN

### GET /api/admin/stats
**Auth:** ✅ ADMIN

---

## HTTP Status Code Ringkasan

| Code | Arti | Sumber |
|------|------|--------|
| `200` | OK | Supabase / Next.js |
| `201` | Created | Supabase insert |
| `204` | No Content | Supabase delete |
| `400` | Bad Request — validasi gagal | Client-side validation |
| `401` | Unauthorized — session expired | Supabase Auth |
| `403` | Forbidden — RLS blokir | Supabase RLS |
| `404` | Not Found | Supabase query empty |
| `409` | Conflict — unique constraint | Supabase DB constraint |
| `422` | Unprocessable — Gemini gagal proses | Next.js API |
| `429` | Too Many Requests — rate limit | Supabase / Gemini |
| `500` | Internal Server Error | Next.js API |
| `503` | Service Unavailable | Gemini / RPC down |

---

## Status Label Mapping

| StuntStatus | statusLabel | statusColor |
|-------------|-------------|-------------|
| `NORMAL` | "Normal" | "green" |
| `AT_RISK` | "Berisiko Stunting" | "yellow" |
| `STUNTED` | "Stunting" | "orange" |
| `SEVERELY_STUNTED` | "Stunting Berat" | "red" |

---

## Disclaimer

Semua response prediksi menyertakan disclaimer berikut:
> "Hasil ini bersifat skrining awal dan bukan diagnosis medis. Konsultasikan dengan dokter atau tenaga kesehatan."

---

## Perubahan dari API Lama (Java Spring Boot)

| Endpoint Java | Status | Pengganti |
|---------------|--------|-----------|
| `POST /api/auth/register` | ❌ Hapus | `supabase.auth.signUp()` |
| `POST /api/auth/login` | ❌ Hapus | `supabase.auth.signInWithPassword()` |
| `POST /api/auth/refresh` | ❌ Hapus | Auto-refresh by SDK |
| `POST /api/auth/logout` | ❌ Hapus | `supabase.auth.signOut()` |
| `GET /api/auth/me` | ❌ Hapus | `supabase.auth.getUser()` |
| `GET/POST/PUT /api/children/**` | ❌ Hapus | `supabase.from('children').*()` |
| `POST /api/assessments` | ⚠️ Pindah | Client insert + `POST /api/gemini/predict` |
| `GET /api/assessments/**` | ❌ Hapus | `supabase.from('assessments').select()` |
| `POST /api/nutrition` | ⚠️ Pindah | Client upload + `POST /api/gemini/nutrition` |
| `POST /api/chat` | 🔀 Pindah | `POST /api/gemini/chat` |
| `GET /api/chat/**` | ❌ Hapus | `supabase.from('chat_sessions').select()` |
| `GET /api/reports/**` | 🔀 Pindah | `GET /api/reports/{childId}` |
| `POST /api/blockchain/anchor` | 🔀 Pindah | `POST /api/blockchain/anchor` |
| `GET /api/blockchain/verify/**` | 🔀 Pindah | `GET /api/blockchain/verify/{id}` (atau Wagmi langsung) |
| `POST /api/vc/issue` | 🔀 Pindah | `POST /api/vc/issue` |
| `POST /api/vc/revoke` | 🔀 Pindah | `POST /api/vc/revoke` |
| `GET /api/vc/**` | ❌ Hapus | `supabase.from('verifiable_credentials').select()` |
| `GET /api/medic/**` | ❌ Hapus | `supabase.from('children').select()` + server route |
| `GET/POST /api/admin/**` | 🔀 Pindah | Server routes (service_role) |
