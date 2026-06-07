# Development Log — Phase 1 & 2 Mobile Dev

This log details the changes made to implement Phase 1 (Authentication) and Phase 2 (Child Management) in the Tumbuh Sehat mobile application.

## Summary of Accomplishments

### 1. Project Infrastructure & Dependencies
- Upgraded configuration context from Expo SDK 53 to SDK 54 (`expo ~54.0.34`, `react-native 0.81.5`, `react 19.1.0`).
- Installed core libraries:
  - `zustand` (State management)
  - `@tanstack/react-query` (Server state caching)
  - `axios` (HTTP communication)
  - `expo-secure-store` (Secure credentials storage on devices)

### 2. Core Architectural Layers
- **Types Layer (`types/`)**: Created matching data structures for Auth (`auth.types.ts`), Child data (`child.types.ts`), and API common wrappers (`api.types.ts`) derived from `docx/API.md`.
- **Zustand Auth Store (`stores/authStore.ts`)**: Built persisted auth storage that caches JWT tokens safely using `expo-secure-store` and fallback `localStorage` for web.
- **Service Layer (`services/`)**:
  - `api.ts`: Setup Axios client instance with automatic header injection and 401 interceptors to handle token refreshes in the future.
  - `mock.ts`: Core mock environment featuring simulated network latency (~600ms), in-memory users, age calculation helpers, and dummy child records.
  - `auth.service.ts` & `children.service.ts`: Service methods implementing clean interface mapping. Set up with dual-mode support via `USE_MOCK` flag so they can easily swap to real HTTP endpoints later.
- **Query Hooks (`hooks/`)**: Wrappers for React Query (`useChildren.ts`) managing lists, details, and creations with auto-invalidation, plus hook wrapper for auth state (`useAuth.ts`).

### 3. UI Component System (`components/ui/`)
All new components adhere to project styling guidelines:
- `AppButton.tsx`: Spring press animation with Reanimated, support for variant outline/ghost/primary/secondary, size options, and inline loading indicator.
- `AppInput.tsx`: Custom text input with error borders, focused state, labels, and secure text toggling.
- `AppCard.tsx`: Shadow borders with press animations.
- `StatusBadge.tsx`: Color codes matching stunt statuses (NORMAL, AT_RISK, STUNTED, SEVERELY_STUNTED).
- `LoadingOverlay.tsx` & `EmptyState.tsx`: Reusable screens to handle pending and blank list pages.

### 4. Routing Restructure (`app/`)
- Cleared out initial project template files.
- Restructured `_layout.tsx` to handle authentication using the `Stack.Protected` pattern provided by Expo Router.
- Implemented Screens:
  - `sign-in.tsx` & `register.tsx` (Unauthenticated public flow).
  - `(app)/(tabs)/index.tsx` (Children dashboard listing with pull-to-refresh).
  - `(app)/(tabs)/profile.tsx` (User card details + logout popup validation).
  - `(app)/children/new.tsx` (New child registration with segmented gender selection).
  - `(app)/children/[childId].tsx` (Detail child parameters with placeholders for subsequent phases).

### 5. Feature-Based Architecture Refactoring
- Created the `features/` directory and modularized all domain-specific files:
  - **`features/auth/`**: Encapsulates `SignInScreen`, `RegisterScreen`, `useAuth` hook, `auth.service`, and `auth.types`.
  - **`features/children/`**: Encapsulates `AddChildScreen`, `ChildDetailScreen`, `useChildren` hook, `children.service`, and `child.types`.
  - **`features/home/`**: Encapsulates `HomeScreen`.
  - **`features/profile/`**: Encapsulates `ProfileScreen`.
- Left global shared layers in root (`components/ui/`, `stores/`, `services/api.ts`, `services/mock.ts`, `hooks/use-color-scheme.ts`, and `types/api.types.ts`).
- Rewrote all routing endpoints under `app/` to be thin wrappers, ensuring all routing/rendering concerns are cleanly separated.
- Installed `babel-preset-expo` directly in devDependencies to resolve Metro bundling resolution issues.
- Fixed TypeScript types and verified project compilation via `npx tsc --noEmit` successfully.

## 6. Performance Optimization — React Native Best Practices

Menerapkan optimasi performa berdasarkan panduan "React Native Best Practices" (Callstack), mencakup pengurangan re-render dan optimalisasi bundle:

### 6.1 Zustand Selector Optimization
- **File**: `app/_layout.tsx`, `features/auth/hooks/useAuth.ts`
- **Before**: Destructuring `const { ... } = useAuthStore()` — subscribe ke seluruh store, re-render saat field *apapun* berubah
- **After**: Individual selectors (`useAuthStore(s => s.field)`) — komponen hanya re-render saat field spesifik berubah
- **Impact**: HIGH — eliminasi re-render tidak perlu di root navigator dan auth hook

### 6.2 Static Data Extraction
- **File**: `components/ui/AppButton.tsx`
- **Before**: `variantClasses` dan `sizeClasses` lookup tables didefinisikan di dalam komponen — dialokasi ulang setiap render
- **After**: Diekstrak ke konstanta modul `VARIANT_STYLES` / `SIZE_STYLES`
- **Impact**: MEDIUM — mengurangi alokasi objek per render

### 6.3 Uncontrolled TextInput Migration
- **File**: `features/auth/screens/SignInScreen.tsx`, `RegisterScreen.tsx`, `features/children/screens/AddChildScreen.tsx`
- **Before**: Controlled pattern (`useState` + `value` + `onChangeText`) — re-render seluruh screen tiap karakter diketik
- **After**: Uncontrolled pattern (`useRef` + `defaultValue`) — nilai hanya dibaca dari ref saat submit, tidak ada re-render saat mengetik
- **Impact**: CRITICAL — menghilangkan re-render per keystroke di form auth dan input anak

### 6.4 React.memo Addition
- **File**: `components/ui/StatusBadge.tsx`, `themed-text.tsx`, `themed-view.tsx`, `EmptyState.tsx`, `features/home/screens/HomeScreen.tsx`
- **Before**: Semua komponen re-render saat parent re-render meski props tidak berubah
- **After**: Dibungkus `React.memo` — shallow comparison props, skip render jika tidak berubah
- **Impact**: MEDIUM-HIGH — komponen leaf dan list items tidak re-render secara sia-sia

