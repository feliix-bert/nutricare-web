# server.md — Progress & Roadmap Backend

## Status Keseluruhan: ~65%

---

## ✅ Sudah Selesai (100%)

| Komponen | Detail |
|----------|--------|
| **Entities (9/9)** | User, Child, Assessment, Prediction, NutritionLog, ChatSession, RefreshToken, BlockchainAnchor, VerifiableCredential |
| **Repositories (9/9)** | User, Child, Assessment, Prediction, NutritionLog, ChatSession, RefreshToken, BlockchainAnchor, VerifiableCredential + custom query methods |
| **Enums (6/6)** | Role, Gender, StuntStatus, PredictionStatus, AnchorStatus, VcType |
| **Security/JWT** | JwtUtil (generate/validate/parse), JwtAuthFilter, UserDetailsServiceImpl |
| **Config (2 file)** | SecurityConfig (filter chain, CORS, method security), AppConfig (WebClient, ObjectMapper) |
| **Exception Handler** | GlobalExceptionHandler + 6 custom exceptions |
| **Utilities** | CuidGenerator, ZScoreCalculator |
| **NutricareApplication** | `@EnableAsync` + `@EnableScheduling` |
| **AuthService** | register, login, refresh, logout, getMe — BCrypt + token rotation |
| **ChildService** | CRUD lengkap + ownership validation |
| **AssessmentService** | create assessment + @Async trigger prediksi, get by id, get by child (paginated), @Scheduled retry job |
| **PredictionService** | Hitung z-score, build prompt, call Gemini via GeminiService, parse JSON response — refactored from hardcoded HTTP |
| **GeminiService** | Wrapper call Gemini API — `callText(prompt)` + `callVision(base64, prompt)`, konfigurasi URL terpisah text/vision |
| **StorageService** | Upload file ke Supabase Storage via REST, delete, generate public URL |
| **NutritionService** | Upload foto + Gemini Vision parallel (CompletableFuture), simpan NutritionLog, riwayat paginated |
| **ChatService** | Chatbot dengan konteks prediksi, manajemen session, riwayat chat, guard status COMPLETED |
| **IpfsService** | Upload & pin JSON ke IPFS via Pinata, fetch dari gateway |
| **BlockchainService** | SHA-256 hash anchoring + verifikasi, simulation flag `app.blockchain.simulation` (default true) |
| **VcService** | Issue/revoke/verify W3C Verifiable Credential + QR code, simulation flag |
| **ReportService** | Generate PDF laporan anak dengan iText (data anak + riwayat assessment + prediksi) |
| **Controllers (3/10)** | AuthController, ChildController, AssessmentController |
| **DTO Request (10)** | RegisterRequest, LoginRequest, RefreshTokenRequest, ChildRequest, AssessmentRequest, NutritionRequest, ChatRequest, AnchorRequest, IssueVcRequest, RevokeVcRequest |
| **DTO Response (12)** | AuthResponse, ChildResponse, AssessmentResponse, PredictionResponse, NutritionResponse, ChatResponse, AnchorResponse, VerifyResponse, IssueVcResponse, VcDetailResponse, VerifyQrResponse, PageResponse\<T\> |
| **pom.xml** | Spring Boot 3.2.0, JDK 17, Web3j 4.12.0, iText 8.0.4 |
| **AssessmentRepository** | Tambah query `findByChildIdAndDateRange` untuk ReportService |

---

## ❌ Belum Selesai / Missing

### 🔴 Missing Controllers (7 file)

| Controller | Endpoints |
|------------|-----------|
| `NutritionController` | POST /api/nutrition, GET /api/nutrition/child/{childId} |
| `ChatController` | POST /api/chat, GET /api/chat/{predictionId} |
| `BlockchainController` | POST /api/blockchain/anchor, GET /api/blockchain/verify/{assessmentId} |
| `VcController` | POST /api/vc/issue, GET /api/vc/{vcId}, POST /api/vc/revoke, GET /api/verify |
| `ReportController` | GET /api/reports/child/{childId} |
| `MedicController` | GET /api/medic/patients, GET /api/medic/patients/{childId}/summary |
| `AdminController` | GET/POST /api/admin/users, PATCH /api/admin/users/{id}/status & role, GET /api/admin/stats |

### 🟡 Lainnya

| Item | Detail |
|------|--------|
| `AssessmentResponse.java` | Didefinisikan tapi tidak pernah dipakai |
| `application-dev.yml` | Belum dibuat |
| `application-prod.yml` | Belum dibuat |
| `.env` template | Belum dibuat |
| `db/migration/` | Tidak ada — pakai `ddl-auto=update` |
| Tests | Hanya 1 file: `NutricareApplicationTests.java` (context load only) |
| `PromptBuilder.java` | Tidak ada — prompt dibangun inline di PredictionService |
| `VcException.java` | Disebut di ARCHITECTURE.md tapi belum dibuat |
| Web3j real implementation | BlockchainService & VcService masih mode simulasi |

---

## 📋 Resource Files

```
src/
├── main/
│   ├── java/com/nutricare/
│   │   ├── NutricareApplication.java
│   │   ├── config/                        # 2 file
│   │   ├── security/                      # 3 file
│   │   ├── controller/                    # 3 file
│   │   ├── domain/
│   │   │   ├── entity/                    # 9 entities
│   │   │   └── enums/                     # 6 enums
│   │   ├── dto/
│   │   │   ├── request/                   # 10 file (auth/3, child/1, assessment/1, nutrition/1, chat/1, blockchain/1, vc/2)
│   │   │   └── response/                  # 12 file (auth/1, child/1, assessment/1, prediction/1, nutrition/1, chat/1, blockchain/2, vc/3, page/1)
│   │   ├── exception/                     # 7 file
│   │   ├── repository/                    # 9 file
│   │   ├── service/
│   │   │   └── impl/                      # 12 file (Auth, Child, Assessment, Prediction, Gemini, Storage, Nutrition, Chat, Ipfs, Blockchain, Vc, Report)
│   │   └── util/                          # 2 file
│   └── resources/
│       └── application.properties         # ✅ DB, JWT, Gemini, Supabase, CORS, multipart, Polygon, Pinata, simulation
└── test/
    └── java/com/nutricare/
        └── NutricareApplicationTests.java
```

---

## 📋 Urutan Pengerjaan

### Sprint 1 ✅ — Fix Critical Errors
```
✅ @EnableAsync + @EnableScheduling di NutricareApplication
✅ Fix kompilasi: JDK 24 → JDK 17 (Lombok inkompatibel)
✅ Isi application.properties (DB, JWT, Gemini, Supabase, CORS)
⬜ Hapus/refactor AssessmentResponse yang tidak terpakai
```

### Sprint 2 ✅ — Fitur Inti (Services)
```
✅ GeminiService + StorageService
✅ NutritionService
✅ ChatService
✅ ReportService (PDF)
```

### Sprint 3 ⬜ — Role-based API (Controllers)
```
1. Bikin NutritionController
2. Bikin ChatController
3. Bikin ReportController
4. Bikin MedicController
5. Bikin AdminController
```

### Sprint 4 ⬜ — Blockchain & VC (Controllers)
```
6. Bikin BlockchainController
7. Bikin VcController
```

### Sprint 5 ⬜ — Implementasi Web3j Real
```
8. Deploy smart contracts ke testnet (GiziChainRegistry + VCRegistry)
9. Implementasi Web3j di BlockchainService (anchor + verify real)
10. Implementasi Web3j di VcService (issue/revoke real)
11. Set app.blockchain.simulation=false
```

### Sprint 6 ⬜ — Testing
```
12. Unit test service-service kritis
13. Integration test controller
```

---

## Catatan Penting

1. **JDK 17 required** — Java 24 tidak kompatibel dengan Lombok 1.18.30. Set `JAVA_HOME` ke JDK 17.
2. **application.properties** — port 8080, DB Supabase, JWT, Gemini url-text & url-vision terpisah, Supabase, CORS, multipart, Polygon (placeholder `your-xxx`), Pinata (placeholder `your-xxx`), simulation flag.
3. **Simulation mode** — `app.blockchain.simulation=true` (default). BlockchainService dan VcService generate fake txHash. Saat siap mainnet, set `false` dan implementasi Web3j.
4. **PredictionService** — sudah refactored: call Gemini via `GeminiService.callText()`, JSON parsing pakai regex `(?s)^.*?(\\{.*\\}).*$`.
5. **GeminiService** — dua URL terpisah: `gemini.api.url-text` (flash) dan `gemini.api.url-vision` (pro).
6. **NutritionService** — parallelism via `CompletableFuture.allOf()` untuk upload storage + vision.
7. **ZScoreCalculator simplified** — linear approximation, bukan full WHO 2006 reference tables.
8. **AssessmentResponse.java tidak dipakai** — bisa dihapus atau diintegrasikan.
9. **Services**: Semua service class langsung di `service/impl/` tanpa interface di `service/` root.
10. **@Builder**: 7 dari 9 entity punya @Builder. ChatSession & NutritionLog belum ada @Builder.

---

## Konfigurasi Saat Ini

| Parameter | Nilai |
|-----------|-------|
| Server port | 8080 |
| DB | Supabase PostgreSQL (SSL required) |
| JWT access token | 15 menit |
| JWT refresh token | 7 hari |
| Gemini text model | gemini-1.5-flash |
| Gemini vision model | gemini-1.5-pro |
| Supabase bucket | food-photos |
| CORS origins | localhost:3000, localhost:8081 |
| Max upload | 5 MB |
| Async pool | core=4, max=8 |
| Scheduling pool | size=2 |
| Blockchain simulation | true |
| Polygon chain | Mumbai testnet (chainId=80001) |

---

## 📋 Sprint 7 ⬜ — Agent Skills `.md` untuk Gemini AI

### Status: Direncanakan

### Masalah Saat Ini
- 3 system prompt hardcoded di Java (`PredictionService`, `ChatService`, `NutritionService`) — butuh recompile untuk edit teks
- Tidak ada domain knowledge asli (tabel WHO, standar gizi) — hanya instruksi generik minimal
- `String.format()` dengan banyak argumen rentan human error
- Ahli gizi/dokter tidak bisa review isi prompt karena di file `.java`
- Aturan yang sama (misal: "berisiko" bukan "menderita") di-copy paste di 3 tempat

### Arsitektur Baru

```
src/main/resources/agents/
├── prediction-agent.md      # WHO standards + interpretasi Z-Score
├── chat-agent.md            # Chatbot konsultasi stunting
└── nutrition-agent.md       # Analisis gizi foto makanan

src/main/java/.../util/
└── PromptLoader.java        # Load .md, strip frontmatter → String
```

### Data Flow

```
[.md file] ──→ PromptLoader.load("prediction")
                     │ strip YAML frontmatter
                     ▼
              String (markdown murni — tabel, list, heading)
                     │
Service panggil ────┤ append data mentah:
                     │   "\n\n---\nDATA ANAK:\n" + data
                     ▼
              geminiService.callText(fullPrompt)
                     │
                     ▼
              Gemini baca markdown langsung — tanpa parsing Java
```

### Yang Java Lakukan — Cuma Load + Concat

```java
String agent = promptLoader.load("prediction");
String data = "\n\n---\nDATA ANAK:\nNama: " + child.getAnonId() + "\n...";
geminiService.callText(agent + data);
```

Tidak ada `String.format()`, `replace()`, atau parsing JSON.

### Format `.md` File

Setiap file diawali YAML frontmatter (untuk metadata internal, di-strip sebelum dikirim ke Gemini):

```yaml
---
name: prediction-agent
description: Interpretasi Z-Score stunting WHO 2006 untuk anak 0-60 bulan
model: gemini-1.5-flash
---
```

Lalu domain knowledge asli dalam markdown: tabel WHO, kategori status gizi, format output, constraints.

### New Files (4)

| # | File | Fungsi |
|---|---|---|
| 1 | `util/PromptLoader.java` | Load .md dari classpath, strip YAML frontmatter |
| 2 | `resources/agents/prediction-agent.md` | Domain knowledge interpretasi Z-Score |
| 3 | `resources/agents/chat-agent.md` | Domain knowledge chatbot konsultasi |
| 4 | `resources/agents/nutrition-agent.md` | Domain knowledge analisis gizi makanan |

### Modified Files (3)

| # | File | Perubahan |
|---|---|---|
| 5 | `PredictionService.java` | Inject PromptLoader, `buildPrompt()` → load .md + append data |
| 6 | `ChatService.java` | Inject PromptLoader, `buildSystemContext()` → load .md + append data |
| 7 | `NutritionService.java` | Inject PromptLoader, `buildNutritionPrompt()` → load .md + append data |

### Implementation Steps

#### Phase 1 — PromptLoader.java
- `@Component`, method `load(String agentName) → String`
- Baca file `classpath:agents/{name}-agent.md`
- Strip YAML frontmatter (`---...---`)
- Return markdown murni
- Handle edge cases: file missing → throw jelas, frontmatter invalid → return full content

#### Phase 2 — 3 File `.md` dengan Domain Knowledge

Setiap file 1 agent complete — domain knowledge inline, tidak pecah ke file referensi terpisah. Appendix References di akhir sebagai audit trail sumber asli.

---

##### `prediction-agent.md`
Buat dengan struktur:
- YAML frontmatter: name, description, model (gemini-1.5-flash)
- ## Role — interpretasi Z-Score, bukan diagnosis
- ## WHO Growth Standards 2006 — tabel TB/U, BB/U, BB/TB + kategori + interpretasi klinis + kombinasi status gizi
- ## Data Anak — placeholder (diisi runtime)
- ## Constraints — "berisiko" bukan "menderita", batas 0-60 bln, disclaimer
- ## Output Format — JSON summary + recommendations + nextAssessmentDate
- ## References — WHO 2006, Kemenkes PMK No.2/2020

##### `chat-agent.md`
Buat dengan struktur:
- YAML frontmatter: name, description, model (gemini-1.5-flash)
- ## Role — asisten konsultasi untuk orang tua
- ## Domain Knowledge — 1000 HPK, intervensi spesifik & sensitif, tabel MPASI per usia, 4 bintang
- ## Data Anak — placeholder (diisi runtime)
- ## Constraints — Bahasa Indonesia, "berisiko", batas 0-60 bln, disclaimer
- ## References — WHO Essential Nutrition Actions, IDAI Rekomendasi MPASI

##### `nutrition-agent.md`
Buat dengan struktur:
- YAML frontmatter: name, description, model (gemini-1.5-pro)
- ## Role — ahli gizi analisis foto makanan
- ## Standar Porsi MPASI — tabel per usia
- ## Estimasi Energi — daftar makanan umum + nilai gizi (+- akurat)
- ## Data Anak — placeholder (diisi runtime)
- ## Constraints — estimasi saja, jangan paksa analisis kalo foto gak jelas
- ## Output Format — JSON foodDetected, portionEstimate, calories, protein, carbs, fat, fiber, adequacyNote, mpasiRecommendation
- ## References — TKPI Kemenkes, WHO IYCF, AKG Balita

#### Phase 3 — Refactor 3 Services
- Tambah field `PromptLoader promptLoader`
- Ganti `String.format(...)` → `promptLoader.load("xxx") + data`
- Data anak di-append mentah (concatenation, tanpa format specifier)

#### Phase 4 — Validasi
- `mvn clean compile -q`
- Test endpoint: prediksi, chat, nutrition — output harus sama dengan sebelum refactor

### Dependencies

```
Phase 1 (PromptLoader)
    │
    ▼
Phase 2 (.md files) ─── parallel dengan Phase 1
    │
    ▼
Phase 3 (3 service refactor) ─── butuh Phase 1 + 2
    │
    ▼
Phase 4 (validasi)
```

### Success Criteria
- [ ] `mvn clean compile -q` sukses
- [ ] Semua prompt dihapus dari Java code — hanya di `.md`
- [ ] Output Gemini tetap sama formatnya (JSON/text sesuai agent)
- [ ] Ahli gizi bisa baca/edit `.md` tanpa ngerti Java
- [ ] PromptLoader handle error cases (file missing, frontmatter invalid)
