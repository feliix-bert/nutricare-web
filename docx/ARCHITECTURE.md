# ARCHITECTURE.md — Tumbuh Sehat

## 1. Gambaran Sistem

Platform ini terdiri dari **3 service utama** yang berkomunikasi via REST API, ditambah **layer blockchain** untuk verifikasi integritas data:

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                     │
│                                                                               │
│   ┌─────────────────────────┐          ┌─────────────────────────────────┐   │
│   │     Next.js (Web)       │          │     React Native (Mobile)       │   │
│   │     Port: 3000          │          │     iOS / Android               │   │
│   │                         │          │                                 │   │
│   │  - App Router           │          │  - Expo / Bare RN               │   │
│   │  - TanStack Query       │          │  - TanStack Query               │   │
│   │  - Zustand              │          │  - Zustand                      │   │
│   │  - Tailwind CSS         │          │  - React Navigation             │   │
│   │  - Recharts             │          │  - SecureStore (JWT)            │   │
│   │  - jsPDF                │          │  - expo-camera                  │   │
│   └────────────┬────────────┘          └──────────────┬──────────────────┘   │
└────────────────┼──────────────────────────────────────┼──────────────────────┘
                 │  REST + JWT                           │  REST + JWT
                 │  Authorization: Bearer <token>        │  Authorization: Bearer <token>
                 └──────────────────┬────────────────────┘
                                    │
┌───────────────────────────────────▼──────────────────────────────────────────┐
│                             SERVER LAYER                                      │
│                                                                               │
│   ┌───────────────────────────────────────────────────────────────────────┐  │
│   │                     Spring Boot (REST API)                            │  │
│   │                     Port: 8080                                        │  │
│   │                                                                       │  │
│   │   ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────┐    │  │
│   │   │  Controller │  │   Service    │  │     Repository (JPA)    │    │  │
│   │   │  Layer      │->│   Layer      │->│     Layer               │    │  │
│   │   └─────────────┘  └──────┬───────┘  └──────────┬──────────────┘    │  │
│   │                           │                      │                   │  │
│   │   ┌────────────────┐      │          ┌───────────▼──────────────┐    │  │
│   │   │ Spring Security│      │          │    Supabase PostgreSQL   │    │  │
│   │   │ JWT Filter     │      │          └──────────────────────────┘    │  │
│   │   └────────────────┘      │                                          │  │
│   │                           │          ┌──────────────────────────┐    │  │
│   │                           ├─────────>│    Supabase Storage      │    │  │
│   │                           │          │    (meal-photos bucket)  │    │  │
│   │                           │          └──────────────────────────┘    │  │
│   │                           │                                          │  │
│   │                           │          ┌──────────────────────────┐    │  │
│   │                           ├─────────>│    Google Gemini API     │    │  │
│   │                           │          │    (Flash + Pro Vision)  │    │  │
│   │                           │          └──────────────────────────┘    │  │
│   │                           │                                          │  │
│   │                           │          ┌──────────────────────────┐    │  │
│   │                           └─────────>│    IPFS / Pinata         │    │  │
│   │                                      │    (VC document storage) │    │  │
│   │                                      └──────────────────────────┘    │  │
│   └───────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│   ┌───────────────────────────────────────────────────────────────────────┐  │
│   │                     BLOCKCHAIN LAYER (Polygon)                        │  │
│   │                                                                       │  │
│   │   ┌──────────────────────────┐    ┌──────────────────────────────┐   │  │
│   │   │  GiziChainRegistry.sol  │    │    VCRegistry.sol            │   │  │
│   │   │  (Health record hash)   │    │    (VC credential CID)       │   │  │
│   │   └──────────────────────────┘    └──────────────────────────────┘   │  │
│   └───────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Struktur Folder — Spring Boot

```
server/
├── src/
│   ├── main/
│   │   ├── java/com/stuntingai/
│   │   │   │
│   │   │   ├── StuntingAiApplication.java          # Entry point
│   │   │   │
│   │   │   ├── config/
│   │   │   │   ├── SecurityConfig.java             # Spring Security bean, filter chain
│   │   │   │   ├── CorsConfig.java                 # CORS allowed origins
│   │   │   │   ├── JpaConfig.java                  # Auditing, datasource config
│   │   │   │   └── GeminiConfig.java               # Gemini client bean
│   │   │   │
│   │   │   ├── security/
│   │   │   │   ├── JwtUtil.java                    # Generate, validate, parse JWT
│   │   │   │   ├── JwtAuthFilter.java              # OncePerRequestFilter — intercept setiap request
│   │   │   │   └── UserDetailsServiceImpl.java     # Load user dari DB untuk Spring Security
│   │   │   │
│   │   │   ├── domain/
│   │   │   │   ├── enums/
│   │   │   │   │   ├── Role.java                   # PARENT, MEDIC, POSYANDU, ADMIN
│   │   │   │   │   ├── Gender.java                 # MALE, FEMALE
│   │   │   │   │   ├── StuntStatus.java            # NORMAL, AT_RISK, STUNTED, SEVERELY_STUNTED
│   │   │   │   │   ├── PredictionStatus.java       # PENDING, COMPLETED, FAILED
│   │   │   │   │   ├── AnchorStatus.java           # PENDING, CONFIRMED, PENDING_GAS, FAILED
│   │   │   │   │   └── VcType.java                 # IMMUNIZATION_COMPLETE, NUTRITION_STATUS, GROWTH_MILESTONE
│   │   │   │   │
│   │   │   │   └── entities/
│   │   │   │       ├── User.java                   # @Entity users (+ wallet_address)
│   │   │   │       ├── Child.java                  # @Entity children (+ anon_id)
│   │   │   │       ├── Assessment.java             # @Entity assessments
│   │   │   │       ├── Prediction.java             # @Entity predictions
│   │   │   │       ├── NutritionLog.java           # @Entity nutrition_logs
│   │   │   │       ├── ChatSession.java            # @Entity chat_sessions
│   │   │   │       ├── RefreshToken.java           # @Entity refresh_tokens
│   │   │   │       ├── BlockchainAnchor.java       # @Entity blockchain_anchors
│   │   │   │       └── VerifiableCredential.java   # @Entity verifiable_credentials
│   │   │   │
│   │   │   ├── repository/
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── ChildRepository.java
│   │   │   │   ├── AssessmentRepository.java
│   │   │   │   ├── PredictionRepository.java
│   │   │   │   ├── NutritionLogRepository.java
│   │   │   │   ├── ChatSessionRepository.java
│   │   │   │   ├── RefreshTokenRepository.java
│   │   │   │   ├── BlockchainAnchorRepository.java
│   │   │   │   └── VerifiableCredentialRepository.java
│   │   │   │
│   │   │   ├── dto/
│   │   │   │   ├── request/
│   │   │   │   │   ├── auth/
│   │   │   │   │   │   ├── RegisterRequest.java
│   │   │   │   │   │   ├── LoginRequest.java
│   │   │   │   │   │   └── RefreshTokenRequest.java
│   │   │   │   │   ├── child/
│   │   │   │   │   │   └── ChildRequest.java
│   │   │   │   │   ├── assessment/
│   │   │   │   │   │   └── AssessmentRequest.java
│   │   │   │   │   ├── nutrition/
│   │   │   │   │   │   └── NutritionRequest.java
│   │   │   │   │   └── chat/
│   │   │   │   │       └── ChatRequest.java
│   │   │   │   │
│   │   │   │   │   ├── blockchain/
│   │   │   │   │   │   └── AnchorRequest.java
│   │   │   │   │   └── vc/
│   │   │   │   │       ├── IssueVcRequest.java
│   │   │   │   │       └── RevokeVcRequest.java
│   │   │   │   │
│   │   │   │   └── response/
│   │   │   │       ├── auth/
│   │   │   │       │   ├── AuthResponse.java       # { accessToken, refreshToken, user }
│   │   │   │       │   └── UserResponse.java
│   │   │   │       ├── child/
│   │   │   │       │   └── ChildResponse.java
│   │   │   │       ├── assessment/
│   │   │   │       │   └── AssessmentResponse.java  # + blockchain field
│   │   │   │       ├── prediction/
│   │   │   │       │   └── PredictionResponse.java
│   │   │   │       ├── nutrition/
│   │   │   │       │   └── NutritionResponse.java
│   │   │   │       ├── chat/
│   │   │   │       │   └── ChatResponse.java
│   │   │   │       ├── blockchain/
│   │   │   │       │   ├── AnchorResponse.java
│   │   │   │       │   └── VerifyResponse.java
│   │   │   │       ├── vc/
│   │   │   │       │   ├── IssueVcResponse.java
│   │   │   │       │   ├── VcDetailResponse.java
│   │   │   │       │   └── VerifyQrResponse.java
│   │   │   │       ├── PageResponse.java           # Generic wrapper pagination
│   │   │   │       └── ErrorResponse.java          # { status, error, message, timestamp, path }
│   │   │   │
│   │   │   ├── controller/
│   │   │   │   ├── AuthController.java             # /api/auth/**
│   │   │   │   ├── ChildController.java            # /api/children/**
│   │   │   │   ├── AssessmentController.java       # /api/assessments/**
│   │   │   │   ├── NutritionController.java        # /api/nutrition/**
│   │   │   │   ├── ChatController.java             # /api/chat/**
│   │   │   │   ├── ReportController.java           # /api/reports/**
│   │   │   │   ├── MedicController.java            # /api/medic/**
│   │   │   │   ├── AdminController.java            # /api/admin/**
│   │   │   │   ├── BlockchainController.java       # /api/blockchain/**
│   │   │   │   └── VcController.java               # /api/vc/**, /api/verify
│   │   │   │
│   │   │   ├── service/
│   │   │   │   ├── AuthService.java
│   │   │   │   ├── ChildService.java
│   │   │   │   ├── AssessmentService.java
│   │   │   │   ├── PredictionService.java          # Hitung z-score + call Gemini
│   │   │   │   ├── NutritionService.java           # Upload storage + Gemini Vision
│   │   │   │   ├── ChatService.java
│   │   │   │   ├── ReportService.java              # Generate PDF
│   │   │   │   ├── StorageService.java             # Supabase Storage REST client
│   │   │   │   ├── GeminiService.java              # Wrapper Gemini API calls
│   │   │   │   ├── BlockchainService.java          # Web3j — anchor & verify ke Polygon
│   │   │   │   ├── VcService.java                  # Issue, revoke, verify VC
│   │   │   │   └── IpfsService.java                # Pinata client — upload & pin JSON
│   │   │   │
│   │   │   ├── util/
│   │   │   │   ├── ZScoreCalculator.java           # Kalkulasi z-score standar WHO
│   │   │   │   ├── PromptBuilder.java              # Builder untuk prompt Gemini
│   │   │   │   └── CuidGenerator.java             # Generate CUID untuk PK
│   │   │   │
│   │   │   └── exception/
│   │   │       ├── GlobalExceptionHandler.java     # @ControllerAdvice
│   │   │       ├── ResourceNotFoundException.java  # 404
│   │   │       ├── ForbiddenException.java         # 403
│   │   │       ├── DuplicateResourceException.java # 409
│   │   │       ├── GeminiException.java            # AI-related errors
│   │   │       ├── BlockchainException.java        # RPC timeout, revert, gas insufficient
│   │   │       └── VcException.java                # VC already revoked, invalid issuer
│   │   │
│   │   └── resources/
│   │       ├── application.yml                     # Config utama
│   │       ├── application-dev.yml                 # Override untuk dev
│   │       ├── application-prod.yml                # Override untuk prod
│   │       └── db/
│   │           └── migration/                      # Flyway migration files
│   │               ├── V1__create_enums.sql
│   │               ├── V2__create_users.sql
│   │               ├── V3__create_children.sql
│   │               ├── V4__create_assessments.sql
│   │               ├── V5__create_predictions.sql
│   │               ├── V6__create_nutrition_logs.sql
│   │               ├── V7__create_chat_sessions.sql
│   │               ├── V8__create_refresh_tokens.sql
│   │               ├── V9__create_indexes.sql
│   │               ├── V10__add_wallet_and_anon_id.sql
│   │               ├── V11__create_blockchain_anchors.sql
│   │               └── V12__create_verifiable_credentials.sql
│   │
│   └── test/
│       └── java/com/stuntingai/
│           ├── service/
│           │   ├── AuthServiceTest.java
│           │   ├── ZScoreCalculatorTest.java
│           │   ├── PredictionServiceTest.java
│           │   ├── BlockchainServiceTest.java
│           │   └── VcServiceTest.java
│           └── controller/
│               ├── AuthControllerTest.java
│               ├── AssessmentControllerTest.java
│               ├── BlockchainControllerTest.java
│               └── VcControllerTest.java
│
├── pom.xml
└── .env
```

---

## 3. Struktur Folder — Next.js Web

```
web/
├── public/
│   ├── icons/
│   └── images/
│
├── src/
│   ├── app/                                        # App Router Next.js
│   │   ├── layout.tsx                             # Root layout (font, providers)
│   │   ├── page.tsx                               # Landing page / redirect
│   │   │
│   │   ├── (auth)/                                # Route group — no navbar
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (app)/                                 # Route group — dengan navbar, auth protected
│   │   │   ├── layout.tsx                         # Navbar + auth guard
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx                       # Daftar anak milik user
│   │   │   │
│   │   │   ├── children/
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx                   # Form tambah anak
│   │   │   │   └── [childId]/
│   │   │   │       ├── page.tsx                   # Detail anak + tab riwayat
│   │   │   │       ├── assessment/
│   │   │   │       │   └── new/
│   │   │   │       │       └── page.tsx           # Form assessment multi-step
│   │   │   │       ├── nutrition/
│   │   │   │       │   └── page.tsx               # Upload foto + riwayat gizi
│   │   │   │       └── growth-chart/
│   │   │   │           └── page.tsx               # Grafik tumbuh kembang
│   │   │   │
│   │   │   ├── assessments/
│   │   │   │   └── [assessmentId]/
│   │   │   │       ├── page.tsx                   # Detail assessment + hasil prediksi
│   │   │   │       └── chat/
│   │   │   │           └── page.tsx               # Chatbot konsultasi
│   │   │   │
│   │   │   ├── profile/
│   │   │   │   └── page.tsx                       # Profil user
│   │   │   │
│   │   │   ├── medic/                             # Hanya MEDIC & ADMIN
│   │   │   │   ├── layout.tsx                     # Role guard MEDIC
│   │   │   │   └── patients/
│   │   │   │       ├── page.tsx                   # Daftar semua pasien
│   │   │   │       └── [childId]/
│   │   │   │           └── page.tsx               # Detail pasien (sama dgn /children/[id])
│   │   │   │
│   │   │   └── admin/                             # Hanya ADMIN
│   │   │       ├── layout.tsx                     # Role guard ADMIN
│   │   │       ├── page.tsx                       # Dashboard statistik agregat
│   │   │       ├── users/
│   │   │       │   └── page.tsx                   # Manajemen user
│   │   │       └── map/
│   │   │           └── page.tsx                   # Peta sebaran stunting
│   │   │
│   │   └── api/                                   # TIDAK ADA API routes aktif
│   │                                              # Folder ini kosong / tidak dipakai
│   │
│   ├── components/
│   │   ├── ui/                                    # Komponen atom (Button, Input, Card, dll)
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── PageHeader.tsx
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   │
│   │   ├── children/
│   │   │   ├── ChildCard.tsx
│   │   │   ├── ChildList.tsx
│   │   │   └── ChildForm.tsx
│   │   │
│   │   ├── assessment/
│   │   │   ├── AssessmentStepper.tsx              # Container multi-step
│   │   │   ├── steps/
│   │   │   │   ├── Step1BasicData.tsx
│   │   │   │   ├── Step2Anthropometry.tsx
│   │   │   │   ├── Step3FeedingHistory.tsx
│   │   │   │   ├── Step4IllnessHistory.tsx
│   │   │   │   └── Step5Review.tsx
│   │   │   └── AssessmentHistoryItem.tsx
│   │   │
│   │   ├── prediction/
│   │   │   ├── PredictionResult.tsx               # Kartu hasil prediksi
│   │   │   ├── ZScoreDisplay.tsx                  # z-score + interpretasi
│   │   │   ├── RecommendationList.tsx
│   │   │   └── DisclaimerBanner.tsx               # Disclaimer wajib
│   │   │
│   │   ├── nutrition/
│   │   │   ├── PhotoUploader.tsx                  # Drag & drop / file picker
│   │   │   ├── NutritionResult.tsx
│   │   │   └── NutritionLogList.tsx
│   │   │
│   │   ├── chat/
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── ChatBubble.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   └── SuggestedQuestions.tsx
│   │   │
│   │   ├── charts/
│   │   │   ├── GrowthChart.tsx                    # Recharts — BB/TB/lingkar vs WHO
│   │   │   └── StuntingDistributionChart.tsx      # Untuk dashboard admin
│   │   │
│   │   └── medic/
│   │       ├── PatientTable.tsx
│   │       └── PatientFilters.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                             # Auth state dari Zustand
│   │   ├── useChildren.ts                         # TanStack Query hooks untuk children
│   │   ├── useAssessment.ts
│   │   ├── usePrediction.ts
│   │   ├── useNutrition.ts
│   │   └── useChat.ts
│   │
│   ├── stores/
│   │   ├── authStore.ts                           # User state, token
│   │   └── assessmentFormStore.ts                 # State form multi-step
│   │
│   ├── lib/
│   │   ├── api.ts                                 # Axios instance + interceptor token
│   │   ├── queryClient.ts                         # TanStack Query client config
│   │   └── utils.ts                               # Helper functions (format tanggal, dll)
│   │
│   ├── services/                                  # Fungsi API call per domain
│   │   ├── auth.service.ts
│   │   ├── children.service.ts
│   │   ├── assessment.service.ts
│   │   ├── prediction.service.ts
│   │   ├── nutrition.service.ts
│   │   ├── chat.service.ts
│   │   └── report.service.ts
│   │
│   └── types/
│       ├── auth.types.ts
│       ├── child.types.ts
│       ├── assessment.types.ts
│       ├── prediction.types.ts
│       ├── nutrition.types.ts
│       └── chat.types.ts
│
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. Struktur Folder — React Native

```
mobile/
├── assets/
│   ├── fonts/
│   └── images/
│
├── src/
│   ├── navigation/
│   │   ├── RootNavigator.tsx                      # Entry navigator — cek auth lalu arahkan
│   │   ├── AuthNavigator.tsx                      # Stack: Login, Register
│   │   ├── AppNavigator.tsx                       # Bottom Tab: Home, Scan, Chat, Profile
│   │   └── stacks/
│   │       ├── HomeStack.tsx                      # Home → ChildDetail → Assessment → Prediction
│   │       ├── ScanStack.tsx                      # Scan Camera → NutritionResult
│   │       └── ProfileStack.tsx                   # Profile → Settings
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   │
│   │   ├── home/
│   │   │   └── HomeScreen.tsx                     # Daftar anak
│   │   │
│   │   ├── children/
│   │   │   ├── AddChildScreen.tsx
│   │   │   └── ChildDetailScreen.tsx              # Info anak + tab riwayat
│   │   │
│   │   ├── assessment/
│   │   │   ├── AssessmentFlowScreen.tsx           # Container multi-step
│   │   │   ├── steps/
│   │   │   │   ├── Step1Screen.tsx
│   │   │   │   ├── Step2Screen.tsx
│   │   │   │   ├── Step3Screen.tsx
│   │   │   │   ├── Step4Screen.tsx
│   │   │   │   └── Step5ReviewScreen.tsx
│   │   │   └── AssessmentResultScreen.tsx         # Hasil prediksi
│   │   │
│   │   ├── nutrition/
│   │   │   ├── CameraScreen.tsx                   # Kamera / galeri foto makanan
│   │   │   ├── NutritionResultScreen.tsx
│   │   │   └── NutritionHistoryScreen.tsx
│   │   │
│   │   ├── chat/
│   │   │   └── ChatScreen.tsx
│   │   │
│   │   ├── growth/
│   │   │   └── GrowthChartScreen.tsx
│   │   │
│   │   ├── map/
│   │   │   └── FaskesMapScreen.tsx                # Lokasi faskes terdekat
│   │   │
│   │   └── profile/
│   │       └── ProfileScreen.tsx
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── AppButton.tsx
│   │   │   ├── AppInput.tsx
│   │   │   ├── AppCard.tsx
│   │   │   ├── LoadingOverlay.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── ErrorState.tsx
│   │   │
│   │   ├── assessment/
│   │   │   ├── StepIndicator.tsx
│   │   │   └── AssessmentCard.tsx
│   │   │
│   │   ├── prediction/
│   │   │   ├── PredictionCard.tsx
│   │   │   ├── ZScoreBadge.tsx
│   │   │   └── DisclaimerText.tsx
│   │   │
│   │   ├── nutrition/
│   │   │   ├── NutritionCard.tsx
│   │   │   └── FoodTagList.tsx
│   │   │
│   │   └── chat/
│   │       ├── ChatBubble.tsx
│   │       ├── ChatInput.tsx
│   │       └── SuggestedChips.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useChildren.ts
│   │   ├── useAssessment.ts
│   │   ├── usePrediction.ts
│   │   ├── useNutrition.ts
│   │   └── useChat.ts
│   │
│   ├── stores/
│   │   ├── authStore.ts
│   │   └── assessmentFormStore.ts
│   │
│   ├── services/
│   │   ├── api.ts                                 # Axios instance + interceptor token
│   │   ├── auth.service.ts
│   │   ├── children.service.ts
│   │   ├── assessment.service.ts
│   │   ├── prediction.service.ts
│   │   ├── nutrition.service.ts
│   │   └── chat.service.ts
│   │
│   └── types/
│       ├── auth.types.ts
│       ├── child.types.ts
│       ├── assessment.types.ts
│       ├── prediction.types.ts
│       ├── nutrition.types.ts
│       └── chat.types.ts
│
├── app.json
├── .env
├── tsconfig.json
└── package.json
```

---

## 5. Auth Flow — JWT

### Register & Login

```
Client                                    Spring Boot
  │                                            │
  │──── POST /api/auth/register ─────────────>│
  │     { email, password, name }             │
  │                                            │ 1. Validasi input (@Valid)
  │                                            │ 2. Cek email belum terdaftar
  │                                            │ 3. Hash password (BCrypt strength=12)
  │                                            │ 4. Simpan User ke DB (role=PARENT)
  │<─── 201 Created ──────────────────────────│
  │     { id, email, name, role }             │
  │                                            │
  │──── POST /api/auth/login ─────────────────>│
  │     { email, password }                   │
  │                                            │ 1. Load user by email
  │                                            │ 2. Verify BCrypt password
  │                                            │ 3. Generate accessToken (JWT, 15 menit)
  │                                            │    Payload: { sub, email, role, iat, exp }
  │                                            │ 4. Generate refreshToken (JWT, 7 hari)
  │                                            │ 5. Hash refreshToken, simpan ke refresh_tokens
  │<─── 200 OK ────────────────────────────────│
  │     { accessToken, refreshToken, user }   │
  │                                            │
```

### Request Terautentikasi

```
Client                          JwtAuthFilter              Controller
  │                                  │                         │
  │── GET /api/children ────────────>│                         │
  │   Authorization: Bearer <token>  │                         │
  │                                  │ 1. Extract token dari header
  │                                  │ 2. Validasi signature JWT
  │                                  │ 3. Cek expiry
  │                                  │ 4. Extract userId + role
  │                                  │ 5. Set SecurityContext
  │                                  │─────────────────────────>│
  │                                  │                         │ 6. @PreAuthorize check role
  │                                  │                         │ 7. Proses business logic
  │<── 200 OK + data ────────────────────────────────────────────│
  │                                  │                         │
  │   (jika token expired)           │                         │
  │── GET /api/children ────────────>│                         │
  │   Authorization: Bearer <expired>│                         │
  │                                  │ validasi gagal — expired │
  │<── 401 Unauthorized ─────────────│                         │
  │   { error: "TOKEN_EXPIRED" }     │                         │
  │                                  │                         │
  │── POST /api/auth/refresh ────────────────────────────────────>│
  │   { refreshToken }               │                         │ 1. Hash inbound token
  │                                  │                         │ 2. Lookup di refresh_tokens
  │                                  │                         │ 3. Cek revoked = false
  │                                  │                         │ 4. Cek expires_at
  │                                  │                         │ 5. Generate accessToken baru
  │<── 200 OK ────────────────────────────────────────────────────│
  │   { accessToken }                │                         │
```

### JWT Payload
```json
{
  "sub": "clx_user_001",
  "email": "user@email.com",
  "role": "PARENT",
  "iat": 1721800000,
  "exp": 1721800900
}
```

---

## 6. Data Flow — Assessment & Prediksi + Blockchain Anchor

```
Client                         AssessmentController          PredictionService          BlockchainService
  │                                    │                            │                           │
  │── POST /api/assessments ──────────>│                            │                           │
  │   { childId, weight, height, ... } │                            │                           │
  │                                    │ 1. @Valid — validasi input  │                           │
  │                                    │ 2. Cek childId milik user  │                           │
  │                                    │ 3. Simpan Assessment ke DB │                           │
  │                                    │ 4. Buat Prediction(PENDING)│                           │
  │                                    │ 5. @Async trigger ─────────>│                           │
  │<── 201 Created ───────────────────-│                            │                           │
  │   { assessmentId,                  │                            │ 6. Ambil data anak        │
  │     prediction: { PENDING } }      │                            │ 7. Hitung usia dalam bulan │
  │                                    │                            │ 8. ZScoreCalculator:       │
  │                                    │                            │    - z-score BB/U (WHO)    │
  │                                    │                            │    - z-score TB/U         │
  │                                    │                            │    - z-score BB/TB        │
  │                                    │                            │ 9. Tentukan StuntStatus   │
  │                                    │                            │ 10. PromptBuilder.build() │
  │                                    │                            │ 11. GeminiService.call()  │
  │                                    │                            │     ┌──────────────┐      │
  │                                    │                            │     │  Gemini API  │      │
  │                                    │                            │     │  return JSON  │      │
  │                                    │                            │     └──────────────┘      │
  │                                    │                            │ 12. Parse JSON response   │
  │                                    │                            │ 13. Update Prediction:    │
  │                                    │                            │     status=COMPLETED      │
  │                                    │                            │     zscore, summary,      │
  │                                    │                            │     recommendations       │
  │                                    │                            │ 14. @Async anchor ───────>│
  │                                    │                            │                           │ 15. Buat recordHash = keccak256(
  │                                    │                            │                           │     childId + assessmentId + zscore + timestamp )
  │                                    │                            │                           │ 16. Call GiziChainRegistry.anchorRecord()
  │                                    │                            │                           │     ┌──────────────────────┐
  │                                    │                            │                           │     │  Polygon Blockchain  │
  │                                    │                            │                           │     │  GiziChainRegistry   │
  │                                    │                            │                           │     └──────────────────────┘
  │                                    │                            │                           │ 17. Simpan BlockchainAnchor
  │                                    │                            │                           │     ke DB (status=CONFIRMED)
  │                                    │                            │                           │
  │── GET /api/assessments/{id} ──────>│                            │                           │
  │<── 200 OK + full result + blockchain ──────────────────────────────────────────────────────│
```

---

## 7. Data Flow — Deteksi Gizi Foto

```
Client                       NutritionController          StorageService    GeminiService
  │                                  │                          │                 │
  │── POST /api/nutrition ──────────>│                          │                 │
  │   multipart: { childId, photo }  │                          │                 │
  │                                  │ 1. Validasi file         │                 │
  │                                  │    (MIME, size ≤ 5MB)    │                 │
  │                                  │ 2. Konversi ke base64    │                 │
  │                                  │                          │                 │
  │                                  │ CompletableFuture.allOf()│                 │
  │                                  │─── [Task A] ────────────>│                 │
  │                                  │    upload ke Supabase    │ PUT /storage/   │
  │                                  │    Storage               │ return URL      │
  │                                  │                          │                 │
  │                                  │─── [Task B] ─────────────────────────────>│
  │                                  │    kirim base64 + prompt │                 │ call Gemini Vision
  │                                  │    ke Gemini Vision      │                 │ model: pro
  │                                  │                          │                 │ return JSON gizi
  │                                  │ 3. Merge hasil A + B     │                 │
  │                                  │ 4. Simpan NutritionLog   │                 │
  │<── 201 Created ──────────────────│                          │                 │
  │    { photoUrl, nutrition, ... }  │                          │                 │
```

---

## 8. Data Flow — Chatbot

```
Client                            ChatController              GeminiService
  │                                     │                          │
  │── POST /api/chat ───────────────────>│                          │
  │   { predictionId, message }         │                          │
  │                                     │ 1. Load Prediction (cek COMPLETED)
  │                                     │ 2. Load atau buat ChatSession
  │                                     │ 3. Ambil 10 pesan terakhir
  │                                     │ 4. Build system context:
  │                                     │    - nama anak, usia, gender
  │                                     │    - status prediksi, z-score
  │                                     │    - tanggal assessment
  │                                     │ 5. Build messages array:
  │                                     │    [ ...last10, { role:user, content:message } ]
  │                                     │─────────────────────────>│
  │                                     │                          │ call Gemini
  │                                     │                          │ system + messages
  │                                     │                          │ return reply
  │                                     │ 6. Append user + assistant│
  │                                     │    ke ChatSession.messages│
  │                                     │ 7. Simpan ke DB          │
  │<── 200 OK ──────────────────────────│                          │
   │    { reply, suggestedQuestions }    │                          │
```

---

## 9. Data Flow — Verifiable Credential Issuance

```
Client (MEDIC)                    VcController               VcService              IpfsService           BlockchainService
  │                                     │                        │                       │                       │
  │── POST /api/vc/issue ──────────────>│                        │                       │                       │
  │   { childId, vcType, expiresAt }    │                        │                       │                       │
  │                                     │ 1. Validasi child + issuer wallet              │                       │
  │                                     │ 2. @Async trigger ───>│                       │                       │
  │<── 202 Accepted ────────────────────│                        │                       │                       │
  │                                     │                        │ 3. Build VC JSON-LD   │                       │
  │                                     │                        │    document           │                       │
  │                                     │                        │ 4. Sign dgn EIP-712   │                       │
  │                                     │                        │    (issuer privateKey)│                       │
  │                                     │                        │                       │                       │
  │                                     │                        │── upload ke IPFS ────>│                       │
  │                                     │                        │                       │ pin JSON ke Pinata   │
  │                                     │                        │<── return IpfsCid ────│                       │
  │                                     │                        │                       │                       │
  │                                     │                        │── anchor CID ─────────────────────────────────>│
  │                                     │                        │                       │                       │ Call VCRegistry
  │                                     │                        │                       │                       │ .issueVC()
  │                                     │                        │<── return txHash ──────────────────────────────│
  │                                     │                        │                       │                       │
  │                                     │                        │ 5. Simpan VC ke DB    │                       │
  │                                     │                        │ 6. Generate QR payload│                       │
  │                                     │                        │    (base64 JWT)       │                       │
```

---

## 10. RBAC — Role-Based Access Control

Spring Security dikonfigurasi dengan `@PreAuthorize` di level method:

```
Request masuk
     │
     ▼
JwtAuthFilter
     │ extract role dari JWT
     ▼
SecurityContext (role tersimpan)
     │
     ▼
Controller Method
     │
     ▼
@PreAuthorize("hasRole('MEDIC') or hasRole('ADMIN')")
     │
     ├── PASS → proses request
     └── FAIL → 403 Forbidden
```

### Matriks Akses Endpoint

| Endpoint | PARENT | MEDIC | ADMIN | Catatan |
|----------|--------|-------|-------|---------|
| `POST /api/auth/**` | ✅ | ✅ | ✅ | Public |
| `GET /api/children` | ✅ own | ✅ all | ✅ all | PARENT filter by userId |
| `POST /api/children` | ✅ | ❌ | ✅ | MEDIC tidak tambah anak |
| `GET /api/children/{id}` | ✅ own | ✅ all | ✅ all | — |
| `POST /api/assessments` | ✅ | ❌ | ✅ | — |
| `GET /api/assessments/**` | ✅ own | ✅ all | ✅ all | — |
| `POST /api/nutrition` | ✅ | ❌ | ✅ | — |
| `GET /api/nutrition/**` | ✅ own | ✅ all | ✅ all | — |
| `POST /api/chat` | ✅ | ❌ | ✅ | — |
| `GET /api/chat/**` | ✅ own | ✅ all | ✅ all | — |
| `GET /api/reports/**` | ✅ own | ✅ all | ✅ all | — |
| `GET /api/medic/**` | ❌ | ✅ | ✅ | 403 untuk PARENT |
| `GET /api/admin/**` | ❌ | ❌ | ✅ | 403 untuk PARENT & MEDIC |
| `POST /api/admin/users` | ❌ | ❌ | ✅ | Buat akun MEDIC/ADMIN |
| `POST /api/blockchain/anchor` | ❌ | ❌ | ❌ | Internal server-only, bukan client |
| `GET /api/blockchain/verify/**` | ✅ | ✅ | ✅ | Publik read-only |
| `POST /api/vc/issue` | ❌ | ✅ | ✅ | MEDIC dengan wallet terdaftar |
| `GET /api/vc/**` | ✅ | ✅ | ✅ | Publik, anonim |
| `POST /api/vc/revoke` | ❌ | ✅ | ✅ | Hanya issuer VC |
| `GET /api/verify` | ✅ | ✅ | ✅ | Publik, tanpa auth |

---

## 11. Error Handling

### Format Respons Error (Konsisten)
```json
{
  "status": 403,
  "error": "FORBIDDEN",
  "message": "You do not have access to this resource",
  "timestamp": "2025-07-24T10:00:00Z",
  "path": "/api/medic/patients"
}
```

### Peta Exception → HTTP Status

| Exception | HTTP Status | Kapan |
|-----------|-------------|-------|
| `MethodArgumentNotValidException` | 400 | Validasi @Valid gagal |
| `ConstraintViolationException` | 400 | Validasi parameter query/path |
| `BadCredentialsException` | 401 | Login gagal |
| `ExpiredJwtException` | 401 | Access token expired |
| `ForbiddenException` | 403 | Role tidak punya akses |
| `ResourceNotFoundException` | 404 | Entity tidak ditemukan di DB |
| `DuplicateResourceException` | 409 | Email sudah terdaftar |
| `GeminiException` | 422 | Gemini tidak bisa proses input |
| `BlockchainException` | 500 | RPC timeout, gas insufficient, contract revert |
| `VcException` | 400 | VC sudah di-revoke, issuer tidak valid |
| `StorageException` | 500 | Supabase Storage error |
| `Exception` (fallback) | 500 | Error tidak terduga |

### Strategi Gemini Failure

```
GeminiService.call()
     │
     ├── Success → parse JSON → update Prediction(COMPLETED)
     │
     ├── Timeout (>10 detik)
     │       └── set Prediction(PENDING) → scheduled retry job tiap 5 menit
     │
     ├── Invalid JSON response
     │       └── retry 1x → jika masih gagal → set Prediction(FAILED)
     │
      └── Rate limit / quota habis
              └── set Prediction(FAILED) → alert log ERROR → notifikasi admin
```

### Strategi Blockchain Failure

```
BlockchainService.anchorRecord()
     │
     ├── Success → update BlockchainAnchor(CONFIRMED)
     │
     ├── RPC timeout (>15 detik)
     │       └── set BlockchainAnchor(PENDING) → retry job tiap 5 menit
     │
     ├── Gas insufficient (low MATIC balance)
     │       └── set BlockchainAnchor(PENDING_GAS) → alert admin via email
     │
     └── Smart contract revert
             └── parse revert reason → log Sentry → set BlockchainAnchor(FAILED)
```

---

## 12. Komunikasi Client ↔ Server

### Headers Wajib
```
Content-Type: application/json
Authorization: Bearer <accessToken>     // semua endpoint kecuali /api/auth/**
```

### Upload Foto
```
Content-Type: multipart/form-data
Authorization: Bearer <accessToken>
```

### Base URL
| Environment | URL |
|-------------|-----|
| Development (server) | `http://localhost:8080` |
| Development (web) | `http://localhost:3000` |
| Development (mobile device fisik) | `http://192.168.x.x:8080` |
| Production API | Dikonfigurasi via `NEXT_PUBLIC_API_URL` / `EXPO_PUBLIC_API_URL` |

### Token Refresh Strategy (Client Side)
```
Axios interceptor (response)
     │
     ├── Response bukan 401 → lanjut normal
     │
     └── Response 401 + error: TOKEN_EXPIRED
             │
             ├── Hit POST /api/auth/refresh dengan refreshToken
             │
             ├── Berhasil → update accessToken di store
             │             → retry request original
             │
             └── Gagal (refreshToken expired/revoked)
                     └── clear store → redirect ke /login
```
