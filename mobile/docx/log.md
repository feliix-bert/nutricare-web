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

## Phase 3 — GiziChain AI Health Tracker Brand & Feature Integration

This log details the changes made to implement Phase 3 (GiziChain Integration, AI Nutrition, Blockchain Health Vault, and Assessment flow) in the mobile application.

### 1. Brand Identity & Design System Migration
- **Theme Configurations (`src/constants/theme.ts` & `tailwind.config.js`)**: Migrated to GiziChain color tokens (`#3e646a` Soft Teal, `#506444` Secondary Sage Green, `#64601e` Tertiary Gold, and `#fcf9f8` Warm White background). Added 24px-32px border radiuses for containers (`rounded-lg`, `rounded-md`).
- **Pill Button Adjustments (`src/components/ui/Button.tsx`)**: Replaced standard rectangular buttons with pill-shaped actions utilizing Soft Blue (`#bde6ec`) containers and dark text labels.
- **Card Polishing (`src/components/ui/Card.tsx`)**: Upgraded shadow properties to low-opacity drop shadows matching the background hue, and converted border structures to outline variants (`border-outline-variant/15`).
- **Extended Icons (`src/components/ui/icon-symbol.tsx`)**: Added mappings for `shield`, `wallet`, `qrcode.viewfinder`, `chatbubble`, and arrow icons.

### 2. State & Decentralized Data Architecture
- **Zustand Nutrition Store (`src/stores/nutritionStore.ts`)**: Built in-memory store tracking daily meals, calorie totals, and protein/fat/carb breakdowns.
- **Zustand Blockchain Vault (`src/stores/vaultStore.ts`)**: Designed mock blockchain ledger tracking cryptographic signatures, gas fees (in `GZI`), block heights, and verification proof logs.

### 3. Screen Integrations & Routing
- **Beranda (HomeScreen)**: Updated with a secure blockchain status banner, custom color tokens, and children lists.
- **Log Gizi (Nutrition Hub)**: Integrated daily macro summaries, entry Bento triggers, recommended MPASI horizontal lists, and food log histories.
- **AI Vision Scanner**:
  - `ScannerScreen.tsx`: Simulates a camera viewfinder with shutter triggers and upload progression statuses.
  - `AnalysisScreen.tsx`: Processes captured plates using simulated Gemini AI pipeline steps to automatically write estimated macros.
  - `ManualEntryScreen.tsx`: Searchable food database with portion counters.
- **Child Growth Assessment**:
  - `BodySizeScreen.tsx`: Captures child measurements with input validation checks.
  - `ReviewScreen.tsx`: Cryptographic review displaying block details, payload hashes, and gas costs.
  - `ResultsScreen.tsx`: Colored risk indicator gauge presenting WHO growth diagnostics and advice.
  - `ChildDetailScreen.tsx`: Replaced design placeholders with active growth logs histories fetched dynamically from the blockchain vault.
- **AI Chat Consultant (`ConsultScreen.tsx`)**: Interactive chatbot simulating streaming consult responses to child development topics.

### 4. Performance Optimizations — React Native Best Practices
- **Zustand Selectors Optimization**: Implemented strict selection hooks on new stores (`useNutritionStore` and `useVaultStore`) preventing unnecessary re-renders when other kids' logs update.
- **Uncontrolled Inputs in Manual Entry**: Handled searchQuery state and portions dynamically to prevent full-screen form re-renders on keystroke inputs.
- **FlatList Item Memoization**: Memoized FlatList list items (`RecordCard` in `VaultScreen.tsx` and `LogItem` in `NutritionScreen.tsx`) via `React.memo` to optimize scrolling performance.

## Phase 3.5 — GiziChain UI Polishing & Optimization

This log details the follow-up design upgrades, polishing, and optimizations implemented to fully align the mobile application with the GiziChain web identity:

### 1. Active Parent Dashboard Redesign
- **Home Screen Redesign**: Fully redesigned `HomeScreen.tsx` to align 100% with the Stitch `active_parent_dashboard/screen.png` layout.
  - Added the user profile greeting header with avatar image, "Hello, Ibu Ani!", search button, and notification bell with a red badge.
  - Implemented the horizontal Child Selector pills with active status styling (Soft Green fill for the active child, Light Gray fill for inactive children).
  - Integrated the main Soft Blue Overview Card containing the status badge, progress percentage (91%), and an interactive calorie meter ring arc (using custom React Native borders and style rotation).
  - Added side-by-side metric cards for weight and height, displaying current metrics (9.5 Kg, 74.0 cm), metric change labels (+200g, +1.2cm), and 5-bar mini trend charts.
  - Added the "Nutrisi Hari Ini" card with a fork & knife header, "+" entry trigger, and 4 vertical progress fill bars (Prot, Fats, Carbs, RDC).
- **Child Detail Screen Upgrades**: Redesigned `ChildDetailScreen.tsx` to align with the Stitch `growth_chart_history/screen.png` layout. Created a custom mathematical vector curve rendering system (`RenderLine`) to draw standard WHO growth limits and custom kid trajectory points. Added a custom hook `useChildGrowthTracker.ts` to fully separate the data modeling (ready for server integrations) from the visual rendering, in accordance with User Rule 6.

### 2. Component Refactoring & Rules Compliance
- **Text Input Standardization**: Refactored all custom text inputs and inline input fields (such as those in `BodySizeScreen.tsx` and `ManualEntryScreen.tsx`) to use the unified shared `<Input />` component, eliminating inline HTML/React Native text input wrappers in compliance with User Rule 3.
- **Suffix & Suffix Unit Support**: Added `rightElement` prop support to the custom `<Input />` component to cleanly support units such as "kg" or "cm" suffix elements.
- **Active State Adjustments**: Upgraded Active State selector pills in the manual entry flow to use `bg-primary-container` and `text-on-surface` to perfectly align with GiziChain brand specifications.
- **Icon Support**: Added new icon symbol mappings in `icon-symbol.tsx` to support Material Icons and SF Symbols fallback for fitness-center, ruler, fork/knife, search, and notification bell.
- **Verification**: Verified that the entire TypeScript codebase compiles without error.

## Phase 3.6 — Java Spring Boot DTO Alignment & Clinical Disclaimers Integration

This log details the modifications implemented to align the mobile client models with Spring Boot Java API response DTOs and to integrate mandatory medical disclaimers:

### 1. Java Spring Boot DTO Schema Compliance
- **Assessment Types (`src/features/assessment/types/assessment.types.ts`)**: Created strict types matching `API.md` response schemas (such as `AssessmentResponseDTO`, `AssessmentPredictionDTO`, and `BlockchainAnchorDTO`).
- **Mock Service Alignment (`src/services/mock.ts`)**: Upgraded in-memory store and `addMockAssessment` helper to process and return structured, mock Java-style response DTOs (including WHO Z-Scores, AI summaries, advice, and transaction proof).
- **Nutrition Log Schema (`src/stores/nutritionStore.ts`)**: Refactored the `NutritionLog` type and store data to match the database table `nutrition_logs` from `ERD.md`, adding `foodDetected` array, `photoUrl`, `portionEstimate`, `fiber`, `adequacyNote`, and `mpasiRecommendation`.

### 2. Complete Stunt Assessment Wizard Flow (5 Steps)
- **State Store (`src/stores/assessmentFormStore.ts`)**: Integrated a new Zustand store to manage input values across all wizard steps.
- **Antropometri Input (`BodySizeScreen.tsx`)**: Incorporated the head circumference input field with constraints validation (20 - 60 cm) and bound input state to the form store.
- **Feeding History Screen (`FeedingHistoryScreen.tsx`)**: Created Step 3 of the wizard to log exclusive breastfeeding status, starting age of MPASI, and daily feeding frequency.
- **Illness History Screen (`IllnessHistoryScreen.tsx`)**: Created Step 4 of the wizard to log infant infection history up to 500 characters.
- **Review & Submit Screen (`ReviewScreen.tsx`)**: Redesigned Step 5 to show a complete parameters review card, execute mock DTO submissions, post cryptographic transaction receipts to the ledger, and reset form state.
- **Diagnostic Results Screen (`ResultsScreen.tsx`)**: Upgraded layout to render WAZ, HAZ, and WHZ scores, AI recommendations, next assessment date, and transactional blockchain details.

### 3. Medical Disclaimer Banners
- **Disclaimer Banner Component (`DisclaimerText.tsx`)**: Built a reusable clinical disclaimer component for infant stunting screenings.
- **Screen Implementations**:
  - Embedded `<DisclaimerText />` at the bottom of the stunting diagnosis `ResultsScreen.tsx`.
  - Added a sticky AI medical consult advice warning banner directly below the header in `ConsultScreen.tsx`.

### 4. Nutrition Log UI Updates
- **Log Item Refactoring**: Redesigned `LogItem` in `NutritionScreen.tsx` to handle the new `foodDetected` array, `portionEstimate` tags, and format DTO timestamps locally.
- **Fiber Tracking**: Integrated fiber tracking and visual counters in the Daily Nutrients Summary card.
- **Save Operations**: Updated `ManualEntryScreen.tsx` and `AnalysisScreen.tsx` to execute `addLog` operations complying with the updated nutrition schema.

### 5. Type Safety
- **Verification**: Verified that the entire React Native codebase compiles cleanly under TypeScript using `npx tsc --noEmit`.

---

## Phase 4 — React Native Performance Audit & Code Quality Improvements

This log details the systematic audit and fixes applied based on React Native Best Practices guidelines (Callstack), targeting 28 identified violations across 7 categories.

### 1. List Performance — Critical (11 violations → 0)

#### FlashList Migration
- **Before**: 3 `FlatList` usages in `VaultScreen`, `ConsultScreen`, `ManualEntryScreen` — no virtualization optimization
- **After**: Migrated all to `@shopify/flash-list` v2.0.2 with stabilized `renderItem` callbacks via `useCallback`
- **Impact**: CRITICAL — virtualized rendering for all scrollable lists, JS thread freed from layout calculations

#### Stable Callback References
- **Before**: Inline `renderItem={({ item }) => <Component item={item} />}` — new function object per render, breaks `React.memo`
- **After**: Extracted to `useCallback(fn, [])` — stable references across renders
- **Files**: `VaultScreen.tsx`, `ConsultScreen.tsx`, `ManualEntryScreen.tsx`
- **Impact**: HIGH — prevents unnecessary re-renders of all list items

#### Inline Style Extraction
- **Before**: Inline `style={{ transform: [{ rotate: ... }] }}` in list items — new object per render
- **After**: Extracted to module-level constants (`chevronExpandedStyle`, `chevronCollapsedStyle`, `deleteIconStyle`, `searchIconStyle`, `inputBarKeyboardStyle`, `inputBarDefaultStyle`)
- **Files**: `VaultScreen.tsx`, `NutritionScreen.tsx`, `ManualEntryScreen.tsx`, `ConsultScreen.tsx`
- **Impact**: MEDIUM — reduces object allocation per render in list items

### 2. Image Optimization — expo-image Migration
- **Before**: `Image` from `react-native` used in `HomeScreen.tsx`, `NutritionScreen.tsx`, `ChildDetailScreen.tsx` — no caching, no blurhash
- **After**: Migrated to `Image` from `expo-image` (already installed) with `contentFit="cover"` prop for explicit sizing control
- **Impact**: HIGH — automatic disk caching, blurhash placeholders, improved memory usage

### 3. Animation — UI Thread Migration
- **Before**: `animate-bounce` (NativeWind CSS animation) — runs on JS thread, causes frame drops
- **After**: Created reusable `useBounceAnimation` hook with Reanimated `withRepeat`/`withSequence`/`withTiming` — runs on UI thread via worklet
- **Files**: `AnalysisScreen.tsx`, `ScannerScreen.tsx`
- **Impact**: HIGH — animations no longer blocked by JS thread work

### 4. State Management — Zustand Selector Fix
- **File**: `NutritionScreen.tsx`
- **Before**: `const { logs, removeLog } = useNutritionStore()` — subscribes to entire store, re-renders on any state change
- **After**: `const logs = useNutritionStore(s => s.logs); const removeLog = useNutritionStore(s => s.removeLog)` — subscribes only to specific fields
- **Impact**: HIGH — eliminates re-render when unrelated store fields change

### 5. Child Pills Extraction
- **File**: `HomeScreen.tsx`
- **Before**: Inline `.map()` with arrow functions recreating press handlers — 4 child pills re-created every render
- **After**: Extracted `React.memo`-wrapped `ChildPill` component with stable `onPress` callbacks
- **Impact**: MEDIUM — child selector pills no longer re-render when unrelated state changes

---

## Phase 4.1 — Code Duplication Refactoring

Identified and extracted 3 duplicated code patterns across the codebase:

### 1. useBounceAnimation Hook (`src/hooks/useBounceAnimation.ts`)
- **Duplication**: ~15 lines identical in `ScannerScreen.tsx` and `AnalysisScreen.tsx`
- **Solution**: Custom hook with optional `{ amplitude?, duration? }` config
- **Reduction**: -30 lines total, single source of truth for bounce animations

### 2. randomHex Utility (`src/utils/random.ts`)
- **Duplication**: `Math.random().toString(16).substring(2, 12)` in `mock.ts` and `vaultStore.ts`
- **Solution**: Shared `randomHex(length?)` with configurable length
- **Reduction**: -2 duplicate definitions

### 3. formatTime Utility (`src/utils/format.ts`)
- **Duplication**: Two different implementations with same purpose:
  - `NutritionScreen.tsx`: `Intl.DateTimeFormat("id-ID", ...)` with "WIB" suffix
  - `ConsultScreen.tsx`: Manual date arithmetic without suffix
- **Solution**: Unified `formatTime(isoString?)` with hoisted `Intl.DateTimeFormat` + "WIB" suffix
- **Reduction**: -15 lines total, consistent time formatting across app

### Type Safety
- **Verification**: Full TypeScript compilation pass: `npx tsc --noEmit` — **zero errors**



