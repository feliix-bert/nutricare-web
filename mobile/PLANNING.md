# PLANNING.md — Mobile App TumbuhSehat/GiziChain

## Ringkasan

Dokumen ini menyusun rencana pengembangan mobile app TumbuhSehat/GiziChain berdasarkan gap analysis di `CLAUDE.md`, terutama section 14, 19, dan 20.

Fokus MVP berikutnya adalah mengganti simulasi kritikal dengan integrasi service/hook yang konsisten, menambahkan polling prediksi async, integrasi kamera/QR nyata, persistensi chat, dashboard MEDIC, serta status Verifiable Credential di detail anak.

---

## Sprint 0 — Foundation Services, Hooks, dan Component Extraction

### Tujuan
Menyiapkan fondasi service/hook dual-mode mock/real agar fitur high priority bisa dibangun tanpa hardcoded logic di screen.

### Tasks

| ID | Task | File | Complexity |
|----|------|------|------------|
| S0.1 | Buat assessment service dual-mode | `features/assessment/services/assessment.service.ts` | M |
| S0.2 | Buat prediction service dual-mode | `features/assessment/services/prediction.service.ts` | M |
| S0.3 | Buat hook `usePrediction` dgn React Query polling | `features/assessment/hooks/usePrediction.ts` | M |
| S0.4 | Buat nutrition service dual-mode | `features/nutrition/services/nutrition.service.ts` | M |
| S0.5 | Buat hook `useNutrition` | `features/nutrition/hooks/useNutrition.ts` | M |
| S0.6 | Buat chat service dual-mode | `features/chat/services/chat.service.ts` | M |
| S0.7 | Buat hook `useChat` | `features/chat/hooks/useChat.ts` | M |
| S0.8 | Ekstrak komponen assessment inline | `features/assessment/components/` (AssessmentCard, PredictionCard, ZScoreBadge) | M |
| S0.9 | Ekstrak komponen nutrition inline | `features/nutrition/components/` (NutritionCard, FoodTagList) | S |
| S0.10 | Ekstrak komponen chat inline | `features/chat/components/` (ChatBubble, ChatInput, SuggestedChips) | M |
| S0.11 | Barrel export per feature | `features/assessment/index.ts`, `features/nutrition/index.ts`, `features/chat/index.ts` | S |
| S0.12 | Perluas mock in-memory store | `services/mock.ts` | M |

---

## Sprint 1 — Assessment Submit, Loading PENDING, dan Polling Prediction (SELESAI)

### Tujuan
Mengganti submit assessment dengan flow async: `predictionStatus=PENDING` → loading → polling sampai COMPLETED/FAILED.

### Tasks
| ID | Task | Complexity | Status |
|----|------|------------|--------|
| S1.1 | Refactor submit assessment pakai service | M | ✅ |
| S1.2 | Buat pending/loading prediction UI | M | ✅ |
| S1.3 | Implement React Query polling sampai final | M | ✅ |
| S1.4 | Ubah navigation bawa `assessmentId` bukan seluruh DTO | M | ✅ |
| S1.5 | Invalidate children/detail setelah completed | S | ✅ |
| S1.6 | Tambah mock async PENDING → COMPLETED/FAILED | M | ✅ |
| S1.7 | Tambah error/retry state untuk polling timeout | M | ✅ |

**Dependensi:** S0.1, S0.2, S0.3

---

## Sprint 2 — WHO Growth Chart Proper & Edit Child (SELESAI)

### Tujuan
Ganti hardcoded chart data dengan visualisasi berbasis data assessment nyata & z-score dari backend.

### Tasks
| ID | Task | Complexity | Status |
|----|------|------------|--------|
| S2.1 | Tambah method list assessment by child di service | S | ✅ |
| S2.2 | Buat hook assessment history | M | ✅ |
| S2.3 | Refactor child growth tracker pakai API data | M | ✅ |
| S2.4 | Buat komponen GrowthChart (Gifted Charts) | L | ✅ |
| S2.5 | Integrasikan chart di child detail | M | ✅ |
| S2.6 | State untuk < 2 titik data | S | ✅ |
| S2.7 | Audit teks klinis "berisiko" bukan "menderita" | S | ✅ |
| S2.8 | Buat screen & integrasi Edit Data Anak | M | ✅ |

**Dependensi:** S0.1, endpoint `GET /api/assessments/child/{childId}`

---

## Sprint 3 — Nutrition Scanner/Camera Real

### Tujuan
Ganti scanner simulasi dengan kamera nyata + upload multipart, sambungkan history ke API.

### Tasks
| ID | Task | Complexity |
|----|------|------------|
| S3.1 | Install dependency kamera compatible Expo SDK 54 | M |
| S3.2 | Permission handling kamera/gallery | M |
| S3.3 | Ganti viewfinder simulasi dengan camera preview | L |
| S3.4 | Implement multipart upload di service | M |
| S3.5 | Integrasikan `useUploadNutritionPhoto` | M |
| S3.6 | AnalysisScreen pakai data dari query cache | M |
| S3.7 | Load nutrition history real API | M |
| S3.8 | Empty/loading/error state history | S |
| S3.9 | Ekstrak card/tag UI | S |

**Dependensi:** S0.4, S0.5

---

## Sprint 4 — Chat History Persistent

### Tujuan
Ganti chat mock lokal dengan chat dari API, simpan & load history berdasarkan `predictionId`.

### Tasks
| ID | Task | Complexity |
|----|------|------------|
| S4.1 | Tambah tipe chat | S |
| S4.2 | Implement chat.service.ts dual-mode | M |
| S4.3 | Implement useChat (query + mutation) | M |
| S4.4 | Refactor ConsultScreen pakai hook/service | L |
| S4.5 | Ekstrak ChatBubble, ChatInput, SuggestedChips | M |
| S4.6 | Prediction selector/child context untuk chat | M |
| S4.7 | Guard jika belum ada prediction completed | S |

**Dependensi:** S0.6, S0.7, S1.x

---

## Sprint 5 — VC Status & QR Scanner

### Tujuan
Status VC di detail anak + QR scanner verifikasi VC.

### Tasks
| ID | Task | Complexity |
|----|------|------------|
| S5.1 | Tambah tipe VC | S |
| S5.2 | Buat VC service dual-mode | M |
| S5.3 | Buat hook `useVcStatus` & `useVerifyVc` | M |
| S5.4 | Buat komponen VcStatusCard | S |
| S5.5 | Tampilkan VC status di child detail | M |
| S5.6 | Route QR scanner VC | S |
| S5.7 | Screen QR scanner | L |
| S5.8 | Screen hasil verifikasi VC | M |
| S5.9 | Register stack routes | S |
| S5.10 | Perluas mock VC & verify QR | M |

**Dependensi:** S0.12, S3.1 (reuse kamera dep)

---

## Sprint 6 — MEDIC Dashboard

### Tujuan
Screen untuk tenaga medis: lihat semua pasien, filter/search, akses detail & VC.

### Tasks
| ID | Task | Complexity |
|----|------|------------|
| S6.1 | Mock user role MEDIC | S |
| S6.2 | Types medic dashboard | S |
| S6.3 | Medic service dual-mode | M |
| S6.4 | Hook medic dashboard | M |
| S6.5 | MedicDashboardScreen | L |
| S6.6 | Route medic dashboard | S |
| S6.7 | Role-aware tab/redirect | M |
| S6.8 | PatientCard component | M |
| S6.9 | Integrasi aksi issue/revoke VC placeholder | M |

**Dependensi:** AuthStore role, S5.x, Role-aware routing

---

## Sprint 7 — Medium Priority

| ID | Task | Complexity |
|----|------|------------|
| S7.1 | Edit Child screen | M |
| S7.2 | Register edit child route | S |
| S7.3 | Nutrition History List real API polish | M |
| S7.4 | PDF reports service | M |
| S7.5 | PDF reports screen/actions | L |
| S7.6 | POSYANDU module skeleton | L |
| S7.7 | Blockchain verification service | M |
| S7.8 | Blockchain verification screen | M |

---

## Sprint 8 — Low Priority / Post-MVP

| ID | Task | Complexity |
|----|------|------------|
| S8.1 | Push notification setup | L |
| S8.2 | Maps/Faskes nearby | XL |
| S8.3 | Offline mode read cache | XL |
| S8.4 | ADMIN screens skeleton | XL |
| S8.5 | Error monitoring optional | M |

---

## Catatan Teknis Arsitektur

### Service Pattern
Setiap service wajib dual-mode (mock/real) dengan `USE_MOCK` toggle.

### React Query Key Pattern
- `ASSESSMENTS_QUERY_KEY`, `assessmentQueryKey(id)`, `childAssessmentsQueryKey(childId)`
- `predictionQueryKey(assessmentId)`, `nutritionLogsQueryKey(childId)`
- Invalidate query setelah mutation sukses

### Zustand → client state only
Auth, wizard form — bukan server data. Server state tetap di React Query.

### Role-Aware UX
PARENT → dashboard anak sendiri. MEDIC → dashboard pasien. POSYANDU/ADMIN → future.

### Clinical Safety
- Z-score dari server, bukan mobile
- Disclaimer wajib di setiap hasil prediksi
- "berisiko" bukan "menderita"
- Chat banner klinis wajib
- Chat hanya aktif untuk prediction COMPLETED

### Dependencies
Gunakan `npx expo install` selalu. Hindari `npm install` tanpa kunci versi.
