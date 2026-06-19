# Code Review: Backend NutriCare

**Range:** `main...HEAD` (new codebase — 269 files across Java backend + Next.js frontend)
**Effort:** High (3 correctness + 3 cleanup + 1 altitude + 1 conventions angles)
**Date:** 2026-06-20

---

## Findings (ranked by severity)

### 1. 🔴 `@EnableAsync` and `@EnableScheduling` missing — async/scheduled annotations are dead

**Files:**
- `src/main/java/com/nutricare/NutricareApplication.java:6` — no `@EnableAsync` or `@EnableScheduling`
- `src/main/java/com/nutricare/service/impl/PredictionService.java:40` — `@Async` has no effect
- `src/main/java/com/nutricare/service/impl/AssessmentService.java:136` — `@Scheduled` has no effect

**Summary:** Neither `@EnableAsync` nor `@EnableScheduling` is present in any configuration class. Two critical mechanisms silently do nothing.

**Failure scenario (async):** `AssessmentService.createAssessment()` (line 97) calls `generatePredictionAsync()` believing it returns immediately. Without `@EnableAsync`, Spring ignores the `@Async` annotation and calls the method synchronously on the Tomcat request thread. The HTTP response for `POST /api/assessments` blocks for 5-15 seconds waiting for Gemini, instead of returning `201 Created` immediately as designed. The Tomcat thread pool (default 200) exhausts quickly under any concurrent load.

**Failure scenario (scheduled):** `retryPendingPredictions()` never fires. Any prediction stuck in `PENDING` state stays there permanently — no automated recovery. If Gemini has a transient failure, every assessment created during that window is lost to the retry mechanism that doesn't exist.

**Fix:** Add `@EnableAsync` and `@EnableScheduling` to `NutricareApplication` or a `@Configuration` class. Also `@EnableAsync` needs `AsyncConfigurer` to set a thread pool (Spring defaults to `SimpleAsyncTaskExecutor` which creates one thread per task with no limit).

---

### 2. 🔴 `ZScoreCalculator.determineStuntStatus()` — `AT_RISK` branch is unreachable dead code

**File:** `src/main/java/com/nutricare/util/ZScoreCalculator.java:71-77`

```java
public StuntStatus determineStuntStatus(BigDecimal zscoreHa) {
    double z = zscoreHa.doubleValue();
    if (z < -3.0)       return StuntStatus.SEVERELY_STUNTED;
    if (z < -2.0)       return StuntStatus.STUNTED;
    if (z < -2.5)       return StuntStatus.AT_RISK;  // ← NEVER REACHED
    return StuntStatus.NORMAL;
}
```

**Summary:** The third condition `z < -2.5` is after `z < -2.0`, so every value below -2.0 is already caught by the second branch. Z-scores in [-2.5, -2.0) — which the WHO defines as "at risk" — are misclassified as `STUNTED`.

**Failure scenario:** A child has Height-for-Age Z-Score of -2.3 SD. The WHO standard says this merits monitoring ("at risk") but not stunting. The code assigns `STUNTED` (severity 3) instead of `AT_RISK` (level 2). The UI shows a red "Stunted" badge instead of yellow "At Risk." The parent receives unnecessarily alarming recommendations. If this classification anchors on-chain, the incorrect status is permanently recorded.

**Fix:** Reorder conditions from most negative to least negative:

```java
if (z < -3.0) return StuntStatus.SEVERELY_STUNTED;
if (z < -2.5) return StuntStatus.AT_RISK;       // -3.0 .. -2.5
if (z < -2.0) return StuntStatus.STUNTED;        // -2.5 .. -2.0
return StuntStatus.NORMAL;                        // ≥ -2.0
```

---

### 3. 🟠 Controllers call Repositories directly — `orElseThrow()` without args returns HTTP 500 instead of 404

**Files:**
- `src/main/java/com/nutricare/controller/ChildController.java:80-81`
- `src/main/java/com/nutricare/controller/AssessmentController.java:60-61`

```java
// ChildController.java:80-81 — MEDIC/ADMIN getChild path
childRepository.findById(childId)
    .orElseThrow()           // ← No args → throws NoSuchElementException
    .getUser().getId()

// AssessmentController.java:60-61 — MEDIC/ADMIN getAssessment path
assessmentRepository.findById(id)
    .orElseThrow()           // ← Same issue
    .getChild().getUser().getId()
```

**Summary:** `Optional.orElseThrow()` with zero arguments (Java 10+) throws `NoSuchElementException` with message "No value present". This is NOT caught by `GlobalExceptionHandler` — there's no handler for `NoSuchElementException`. It falls through to the generic `Exception` handler but returns HTTP 500 with a generic message instead of a descriptive 404. Every other `orElseThrow` in the codebase properly passes a Supplier.

**Failure scenario:** A MEDIC requests GET `/api/children/nonexistent-id`. The controller resolves the owner via `childRepository.findById(...).orElseThrow()` — the entity doesn't exist → `NoSuchElementException` → `GlobalExceptionHandler.handleGeneric()` returns `500 INTERNAL_SERVER_ERROR` with message "Terjadi kesalahan server". The medic can't distinguish "child not found" from "server exploded."

**Fix:** Replace all `orElseThrow()` calls without arguments:
```java
childRepository.findById(childId)
    .orElseThrow(() -> new ResourceNotFoundException("Anak tidak ditemukan"))
```

---

### 4. 🟠 `WebClient` bean has no request timeout — outbound HTTP calls can hang threads indefinitely

**File:** `src/main/java/com/nutricare/config/AppConfig.java:12-17`

```java
@Bean
public WebClient webClient() {
    return WebClient.builder()
        .codecs(c -> c.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
        .build();
    // No connectTimeout, readTimeout, or requestTimeout!
}
```

**Summary:** The single `WebClient` bean used by `GeminiService`, `IpfsService`, and `StorageService` has zero timeouts. Spring WebClient's default Reactor Netty transport has no request timeout — if the downstream server (Gemini API, Pinata, Supabase) hangs or is unreachable, the calling thread blocks on `.block()` forever.

**Failure scenario:** Gemini API has a transient network partition. All 4 requests to `callText()/callVision()` block indefinitely. Each pins a Tomcat worker thread (shared pool of 200). Within seconds, all threads are consumed, and the entire API surface returns 503/connection timeouts to every client, not just the Gemini-dependent endpoints. Full self-DoS from a missing timeout.

**Fix:** Add request and connect timeouts:
```java
@Bean
public WebClient webClient() {
    return WebClient.builder()
        .clientConnector(new ReactorClientHttpConnector(
            HttpClient.create()
                .responseTimeout(Duration.ofSeconds(30))
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 5000)
        ))
        .codecs(c -> c.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
        .build();
}
```

---

### 5. 🟠 Age-in-months calculation copy-pasted across 6 files with double `LocalDate.now()` call

**Files (6 occurrences across 5 services):**
- `ChildService.java:95-96`
- `ChatService.java:132-133`
- `ReportService.java:91-92`
- `AssessmentService.java:54-55` and `143-144`
- `NutritionService.java:158-159`

```java
int ageMonths = Period.between(child.getBirthDate(), LocalDate.now()).getMonths()
              + Period.between(child.getBirthDate(), LocalDate.now()).getYears() * 12;
```

**Summary:** The same formula is inlined 6 times. Each call constructs two `Period` objects instead of one, and calls `LocalDate.now()` twice — if the system clock ticks past midnight between the two calls, the periods are computed from different dates. Use `Period.toTotalMonths()` (Java 9+) which does the same math in a single call.

**Failure scenario (clock-tick):** Child born 2024-12-01. First `LocalDate.now()` returns 2025-12-31 23:59:59 → Period = P1Y → getMonths() = 0. Second `LocalDate.now()` returns 2026-01-01 00:00:00 → Period = P1Y1M → getYears() = 1. Result: `0 + 1×12 = 12` months. Correct answer is 13 months. Off by one on ~1 child in every ~86,400 requests near midnight.

**Failure scenario (maintenance):** To change the formula (e.g., switch to a different rounding rule), all 6 sites must be found and updated together. ChatService and NutritionService already drift by using fully-qualified `java.time` names instead of imports — evidence of copy-paste in flight.

**Fix:** Extract to `Child.getAgeInMonths()` or an `AgeCalculator` utility:
```java
public int getAgeInMonths() {
    return (int) Period.between(this.birthDate, LocalDate.now()).toTotalMonths();
}
```

---

### 6. 🟠 `AssessmentService.mapToResponse()` — dead code and redundant DB query

**File:** `src/main/java/com/nutricare/service/impl/AssessmentService.java:151-167`

```java
// Line 153-155: DEAD CODE — result discarded, ifPresent is a no-op
PredictionResponse.BlockchainInfo blockchainInfo = null;
blockchainAnchorRepository.findByAssessmentId(prediction.getAssessment().getId())
    .ifPresent(anchor -> {});

// Lines 157-167: SAME query runs again (this time used)
var anchor = blockchainAnchorRepository
    .findByAssessmentId(prediction.getAssessment().getId())
    .map(a -> PredictionResponse.BlockchainInfo.builder()/*...*/)
    .orElse(null);
```

**Summary:** The first query at line 154 is completely dead — its result is discarded in an empty `ifPresent()` lambda and assigned to a local variable that is never read. The identical query runs again at line 157.

**Failure scenario:** Every assessment list/detail page doubles the query count on the `blockchain_anchor` table. At 100 concurrent users viewing assessment history, this means 200 queries instead of 100 — unnecessary database load.

**Fix:** Delete lines 153-156 entirely. Keep only the second query.

---

### 7. 🟡 `PredictionService` retries failing predictions forever — no backoff or max-retry

**Files:**
- `src/main/java/com/nutricare/service/impl/PredictionService.java:55-57`
- `src/main/java/com/nutricare/service/impl/AssessmentService.java:136-147`

```java
// PredictionService: on ANY exception → set back to PENDING
catch (Exception e) {
    prediction.setPredictionStatus(PredictionStatus.PENDING);
    predictionRepository.save(prediction);
}

// AssessmentService: every 5 minutes, retry ALL PENDING predictions
@Scheduled(fixedDelay = 300000)
public void retryPendingPredictions() { /* spawns @Async for each */ }
```

**Summary:** When Gemini fails (network error, 429 throttling, bad response), `PredictionService` resets status to `PENDING`. The retry cron retries ALL PENDING predictions every 5 minutes. There is no retry count, exponential backoff, or circuit breaker. A consistently failing prediction runs forever (given Finding 1, the scheduled job is dead anyway, but when fixed it will amplify the problem).

**Fix:** Add a `retryCount` field to `Prediction`. Cap retries at e.g. 5, then set `FAILED`. Also add `lastRetryAt` for time-based backoff.

---

### 8. 🟡 `NutritionService` validates file type by Content-Type header only (no magic bytes)

**File:** `src/main/java/com/nutricare/service/impl/NutritionService.java:117-130`

```java
private void validateFile(MultipartFile file) {
    String contentType = file.getContentType();        // ← client-controlled
    if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
        throw new StorageException("Format file tidak didukung");
    }
    // NO magic-byte / file signature verification
}
```

**Summary:** File type validation relies entirely on the HTTP `Content-Type` header, which is client-controlled and trivially spoofed. The raw bytes pass through to `StorageService.upload()`, which stores the file in Supabase Storage and returns a public URL.

**Failure scenario:** Attacker sends a request with `Content-Type: image/jpeg` but the body is a malicious script. Validation passes. The file is stored in the public Supabase bucket and a public URL is returned. The attacker now has arbitrary file storage on the trusted domain.

**Fix:** Validate file header magic bytes after reading the upload:
```java
private static final byte[][] MAGIC_BYTES = {
    {(byte)0xFF, (byte)0xD8, (byte)0xFF}, // JPEG
    {(byte)0x89, (byte)0x50, (byte)0x4E}, // PNG
    {(byte)0x52, (byte)0x49, (byte)0x46}, // WebP
};
```

---

### 9. 🟡 `ChildController` MEDIC/ADMIN endpoints use N+1 queries

**File:** `src/main/java/com/nutricare/controller/ChildController.java:42-51`

```java
// MEDIC/ADMIN getChildren() path
List<ChildResponse> all = childRepository.findAll().stream()
    .map(c -> childService.getChild(c.getId(), c.getUser().getId()))  // ← N queries
    .collect(Collectors.toList());
```

**Summary:** The MEDIC/ADMIN `getChildren()` path calls `findAll()` (1 query), then for every child calls `childService.getChild()` which internally does `childRepository.findById()` (N queries). Total: N+1 queries. Also, `getChild()` for MEDIC/ADMIN (lines 80-81) calls `findById()` twice in the same request.

**Fix:** Map directly from the `findAll()` result using the same `mapToResponse` helper, or add a `findAllWithDetails()` repository method.

---

### 10. 🟡 `AuthService` refresh token rotation lacks theft/reuse detection

**File:** `src/main/java/com/nutricare/service/impl/AuthService.java:89-107`

```java
storedToken.setRevoked(true);
refreshTokenRepository.save(storedToken);
// → But does NOT detect: was this token ALREADY revoked?
```

**Summary:** The refresh token rotation pattern correctly revokes the old token when a new one is issued. But when a stolen/expired token is presented, the code silently fails with `ResourceNotFoundException`. It does not log a security event, invalidate the replacement token, or force a re-login — missing the canonical signal of token theft.

**Fix:** Check if the presented token was already revoked and its replacement issued — if so, log a security event and revoke all tokens for that user (forced re-login).

---

## Summary

| # | Severity | Category | File | Description |
|---|----------|----------|------|-------------|
| 1 | 🔴 Critical | Bug | `NutricareApplication.java` | `@EnableAsync`/`@EnableScheduling` missing — async & scheduled annotations dead |
| 2 | 🔴 Critical | Bug | `ZScoreCalculator.java` | `AT_RISK` branch unreachable, misclassifies Z-scores -2.5 to -2.0 |
| 3 | 🟠 High | Bug | `ChildController.java`, `AssessmentController.java` | `orElseThrow()` without args → 500 instead of 404 |
| 4 | 🟠 High | Bug | `AppConfig.java` | WebClient has no timeout — threads hang forever |
| 5 | 🟠 High | Reuse | 6 files across 5 services | Age-in-months formula duplicated, double `LocalDate.now()` |
| 6 | 🟠 High | Simplification | `AssessmentService.java` | Dead DB query + dead variable in `mapToResponse()` |
| 7 | 🟡 Medium | Altitude | `PredictionService.java`, `AssessmentService.java` | Infinite retry loop for PENDING predictions |
| 8 | 🟡 Medium | Security | `NutritionService.java` | File type validated by Content-Type header only |
| 9 | 🟡 Medium | Efficiency | `ChildController.java` | N+1 queries for MEDIC/ADMIN endpoints |
| 10 | 🟡 Medium | Security | `AuthService.java` | No refresh token theft/reuse detection |

---

*Generated by `/code-review` at high effort — 3 correctness + 3 cleanup + 1 altitude + 1 conventions angles, 1-vote verify (recall-biased)*
