# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**GiziChain** (a.k.a. Tumbuh Sehat / Nutricare) — platform kesehatan anak untuk deteksi stunting dini berbasis AI (Google Gemini) dengan verifikasi integritas data di blockchain Polygon (W3C Verifiable Credentials + IPFS).

Target pengguna: anak usia 0–60 bulan. Z-score dihitung server-side pakai standar WHO 2006 (bukan AI). AI hanya sebagai interpreter & recommendation engine.

**Tagline:** *"Data Gizi Anak: Teranalisis oleh AI, Dijamin oleh Blockchain."*

Seluruh dokumentasi detail ada di `docx/`:
- `ARCHITECTURE.md` — diagram sistem, struktur folder server
- `CONTEXT.md` — domain klinis, role pengguna, aturan bisnis, batasan AI
- `API.md` — daftar endpoint REST lengkap
- `ENV.md` — konfigurasi environment variables
- `ERD.md` — entity relationship diagram
- `TASKS.md` — pembagian task sprint

## Struktur Repository

```
├── server/          # Spring Boot 3.2.0 — Java 17, Maven
├── mobile/          # React Native / Expo — file-based routing (expo-router)
├── desktop/         # Next.js (App Router) — frontend web
└── docx/            # Dokumentasi lengkap
```

### Server (Spring Boot — `server/`)

Package structure (base: `com.nutricare`):

```
config/          — SecurityConfig, AppConfig (WebClient, ObjectMapper)
security/        — JwtUtil, JwtAuthFilter, UserDetailsServiceImpl
domain/
  entity/        — User, Child, Assessment, Prediction, NutritionLog,
                   ChatSession, RefreshToken, BlockchainAnchor, VerifiableCredential
  enums/         — Role, Gender, StuntStatus, PredictionStatus, AnchorStatus, VcType
repository/      — JPA repositories (9 total)
dto/
  request/       — Auth, Child, Assessment, Nutrition, Chat, Blockchain, VC
  response/      — PageResponse, ErrorResponse + per-feature responses
controller/      — Auth, Child, Assessment, Nutrition, Chat, Report, Medic, Admin,
                   Blockchain, Vc (10 controller)
service/impl/    — Auth, Child, Assessment, Prediction, Nutrition, Chat, Report,
                   Storage, Gemini, Blockchain, Vc, Ipfs (12 service)
util/            — ZScoreCalculator, CuidGenerator
exception/       — GlobalExceptionHandler, ResourceNotFoundException,
                   DuplicateResourceException, ForbiddenException,
                   BlockchainException, GeminiException, StorageException
```

Key dependencies: Spring Web, Spring Data JPA, Spring Security, Spring WebFlux (WebClient), jjwt 0.12.3, PostgreSQL, Web3j 4.12.0, iText7 8.0.4, Lombok.

### Mobile (React Native / Expo — `mobile/`)

```
src/
  app/                         — File-based routing (expo-router)
    _layout.tsx                — Root layout: QueryClient + auth guard
    sign-in.tsx, register.tsx  — Auth screens
    (app)/
      _layout.tsx              — Stack navigator
      (tabs)/                  — Bottom tabs: Beranda, Log Gizi, Tanya AI, Vault, Profil
        _layout.tsx            — Custom floating tab bar
      children/
        new.tsx, [childId].tsx — Child CRUD
        [childId]/assessment/  — Multi-step assessment flow
      scanner/                 — Nutrition scanning
  features/                    — Feature-based modules
    auth/        — screens, hooks, services, types
    children/    — screens, hooks, services, types
    assessment/  — screens, components, types
    home/        — screens, index
    nutrition/   — screens
    consult/     — screens
    vault/       — screens
    profile/     — screens
  components/ui/ — Reusable UI components (Button, Card, Input, Badge, etc.)
  stores/        — Zustand stores: authStore, assessmentFormStore, nutritionStore, vaultStore
  services/      — api.ts (Axios instance + interceptors), mock.ts (mock data)
  constants/     — theme.ts (Colors, Spacing)
  types/         — api.types.ts (PageResponse, ApiError)
  utils/         — cn.ts, format.ts, random.ts
```

Key mobile dependencies: Expo, expo-router, NativeWind (Tailwind), TanStack Query, Zustand, Axios, expo-secure-store, expo-haptics, @shopify/flash-list, expo-image.

### Desktop (Next.js — `desktop/`)

Struktur mirip mobile dengan App Router. Pages di `src/app/` + components/ui dan feature modules yang sama.

## Pola Arsitektur

1. **Feature-based modules** — setiap fitur punya screens/, hooks/, services/, types/
2. **Feature barrel exports** — setiap fitur punya `index.ts` yang re-export semua komponen publik
3. **Services toggle mock/real** — setiap service file punya implementasi mock dan real, dipilih via `USE_MOCK` flag di `services/mock.ts`
4. **Zustand stores** — state management sederhana, persist token di SecureStore (mobile) / localStorage (web)
5. **TanStack Query** — data fetching dengan query keys per resource (lihat `CHILDREN_QUERY_KEY` pattern)
6. **Axios interceptor** — auto-attach Bearer token + auto-refresh on 401
7. **File-based routing** — expo-router (mobile) dan Next.js App Router (desktop)

## Alur Autentikasi

- Login → dapat accessToken (15 menit) + refreshToken (7 hari)
- Token disimpan di SecureStore (mobile) atau localStorage (web)
- Axios request interceptor: attach `Authorization: Bearer <accessToken>`
- Axios response interceptor: intercept 401 → call `/api/auth/refresh` → retry original request
- Zustand `authStore` mengelola state auth + hydrate dari storage saat startup
- Root layout (`_layout.tsx`) mengecek `isAuthenticated` + `isHydrated` untuk routing guard

## Commands

### Server
```bash
cd server
./mvnw spring-boot:run        # Run development server (port 8080)
./mvnw clean install           # Build
./mvnw test                    # Run tests
```

### Mobile
```bash
cd mobile
npm install                    # Install dependencies
npx expo start                 # Start Expo dev server
npx expo start --ios           # iOS simulator
npx expo start --android       # Android emulator
npx expo run:ios               # Production build iOS
npx expo run:android           # Production build Android
```

### Desktop
```bash
cd desktop
npm install
npm run dev                    # Dev server (port 3000)
npm run build                  # Production build
npm run lint                   # ESLint
```

## Klasifikasi Stunting (WHO 2006)

| Status | Z-score TB/U |
|--------|-------------|
| NORMAL | ≥ -2 SD |
| AT_RISK | -2 SD hingga -2.5 SD |
| STUNTED | < -2 SD |
| SEVERELY_STUNTED | < -3 SD |

**Aturan penting:** Z-score dihitung server-side di `ZScoreCalculator.java`. Gemini hanya untuk interpretasi & rekomendasi, bukan kalkulator klinis. Setiap output wajib menyertakan disclaimer: *"Hasil ini bersifat skrining awal dan bukan diagnosis medis."*

## Konvensi API

- **Base URL**: `http://localhost:8080` (dev) / `https://api.stunting-ai.com` (prod)
- **Format error**: `{ status, error, message, timestamp, path }`
- **Pagination**: `{ data[], page, size, totalElements, totalPages }`
- **Primary Key**: CUID (`util/CuidGenerator.java`)
- **Assessment bersifat append-only** — tidak bisa diedit setelah submit
- **Auth**: JWT Bearer token untuk semua endpoint kecuali `/api/auth/**` dan `/api/verify`

## Mock Mode

Saat `USE_MOCK = true` di `mobile/src/services/mock.ts` dan `desktop/src/services/mock.ts`, aplikasi berjalan tanpa backend. Mock data di-initialize dengan sample data (anak, assessment, dll). Toggle ke `false` untuk connect ke server sungguhan.

## Catatan Penting

- `server/` menggunakan Lombok (`@Slf4j`, `@RequiredArgsConstructor`) — pastikan IDE terinstall Lombok plugin
- Environment variables dikelola via `spring-dotenv` — buat `.env` di `server/`
- `app.blockchain.simulation=true` — anchor cuma simpan di DB tanpa write ke Polygon
- PII tidak pernah masuk ke blockchain — chain hanya menyimpan hash & CID IPFS
- Foto makanan maks 5 MB (JPEG/PNG/WebP), disimpan di Supabase Storage bucket `food-photos`
