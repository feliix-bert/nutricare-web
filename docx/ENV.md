# ENV.md — Tumbuh Sehat

## Aturan Umum

- **Jangan pernah commit file `.env` ke repository**
- Semua secret dikelola via environment variable (Vercel, Railway, atau platform hosting masing-masing)
- Nilai di bawah yang berformat `your-xxx` adalah placeholder yang harus diganti
- Untuk development, salin file ini ke `.env.local` (web/mobile) atau `.env` (server)

---

## 1. Spring Boot Server

File: `application.properties` atau `application-prod.properties` di Spring Boot (atau konfigurasi di platform hosting Railway / Fly.io / VPS)

```properties
# ─── Server ───────────────────────────────────────────────
spring.application.name=stunting-backend
server.port=8085

# ─── Database (Supabase PostgreSQL) ───────────────────────
spring.datasource.url=jdbc:postgresql://db.[project-ref].supabase.co:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=your-supabase-db-password
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA / Hibernate
spring.jpa.hibernate.ddl-auto=update
# Options: validate (prod) | update (dev) | create-drop (test)
spring.jpa.show-sql=false
# Set true hanya saat debugging lokal
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true

# ─── JWT ──────────────────────────────────────────────────
app.jwt.secret=your-very-long-random-secret-min-256-bits
# Generate dengan: openssl rand -hex 64
app.jwt.expiration-ms=86400000
# 24 jam = 86400000 ms (access token)
# Rencana: tambah app.jwt.refresh-expiration-ms=604800000 (7 hari) saat refresh token diimplementasi

# ─── Supabase Storage ─────────────────────────────────────
supabase.url=https://[project-ref].supabase.co
supabase.key=your-supabase-key
# Saat ini menggunakan supabase.key — konfirmasi apakah service role key atau anon key
# Rencana: gunakan service role key untuk akses storage dari server
supabase.bucket=food-photos

# ─── Google Gemini ────────────────────────────────────────
gemini.api.key=your-google-gemini-api-key
gemini.api.url=your-gemini-api-url
# Contoh: https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
# Rencana: tambah gemini.text-model dan gemini.vision-model saat multi-model diimplementasi
# Rencana: tambah gemini.timeout-seconds=10 untuk fallback ke PENDING

# ─── Polygon Blockchain ───────────────────────────────────
polygon.rpc-url=https://polygon-mumbai.g.alchemy.com/v2/your-alchemy-key
# Testnet: Mumbai (chainId=80001) | Mainnet: Polygon PoS (chainId=137)
polygon.chain-id=80001
polygon.registry-contract=0xAddressGiziChainRegistry
polygon.vc-registry-contract=0xAddressVCRegistry
polygon.anchor-private-key=0xYourAnchorWalletPrivateKey
# Dedicated hot wallet dengan saldo MATIC cukup untuk gas

# ─── IPFS / Pinata ────────────────────────────────────────
pinata.api-key=your-pinata-api-key
pinata.secret-key=your-pinata-secret-key
pinata.api-url=https://api.pinata.cloud
pinata.gateway-url=https://gateway.pinata.cloud/ipfs

# ─── File Upload ──────────────────────────────────────────
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# ─── CORS ─────────────────────────────────────────────────
app.cors.allowed-origins=http://localhost:3000,https://stunting-ai.vercel.app
# Pisahkan dengan koma untuk multiple origin

# ─── Logging ──────────────────────────────────────────────
# Rencana: LOG_LEVEL=INFO | DEBUG | WARN | ERROR
```

### Catatan Spring Boot

- `spring.datasource.url` menggunakan connection pooling HikariCP (default Spring Boot)
- `app.jwt.secret` harus minimal 256 bit (32 karakter hex = 64 karakter) untuk algoritma HS256
- `app.jwt.expiration-ms` saat ini single token 24 jam — refresh token belum diimplementasi
- `supabase.key` — verifikasi apakah service role key atau anon key; service role key memberi akses penuh, jangan expose ke client
- `gemini.api.url` — isi dengan URL endpoint Gemini yang dipakai (termasuk model dan method)
- `spring.servlet.multipart` — batas upload file foto makanan, max 10MB per file dan per request
- `polygon.*` — gunakan testnet Mumbai untuk development, mainnet Polygon PoS untuk production
- `polygon.anchor-private-key` adalah **dedicated hot wallet** — jangan pakai wallet pribadi. Pastikan saldo MATIC cukup.
- `pinata.*` — API key dari dashboard Pinata. `pinata.gateway-url` untuk akses publik file IPFS

---

## 2. Next.js Web

File: `.env.local`

```env
# ─── API ──────────────────────────────────────────────────
NEXT_PUBLIC_API_URL=http://localhost:8085
# Production: https://api.stunting-ai.com

# ─── App ──────────────────────────────────────────────────
NEXT_PUBLIC_APP_NAME=Stunting AI
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Production: https://stunting-ai.vercel.app

# ─── Maps (untuk fitur lokasi faskes) ─────────────────────
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# ─── Sentry (error monitoring, opsional) ──────────────────
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-auth-token
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=stunting-ai-web
```

### Catatan Next.js

- Variabel dengan prefix `NEXT_PUBLIC_` ter-expose ke browser — **jangan taruh secret di sini**
- `NEXT_PUBLIC_API_URL` adalah base URL Spring Boot, bukan URL Supabase langsung
- Next.js **tidak** memerlukan akses Supabase langsung (semua via Spring Boot)

---

## 3. React Native Mobile

File: `.env` (dengan library `react-native-dotenv` atau `expo-constants`)

```env
# ─── API ──────────────────────────────────────────────────
EXPO_PUBLIC_API_URL=http://localhost:8085
# Production: https://api.stunting-ai.com
# Untuk testing di device fisik: gunakan IP lokal, misal http://192.168.1.x:8085

EXPO_PUBLIC_APP_NAME=Stunting AI

# ─── Maps ─────────────────────────────────────────────────
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# ─── Push Notification (Expo) ─────────────────────────────
EXPO_PUBLIC_PROJECT_ID=your-expo-project-id
# Didapat dari dashboard Expo (untuk push notification)

# ─── Sentry (opsional) ────────────────────────────────────
EXPO_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

### Catatan React Native

- Expo: variabel dengan prefix `EXPO_PUBLIC_` otomatis ter-expose ke app — **jangan taruh secret**
- Untuk testing di device fisik, `EXPO_PUBLIC_API_URL` harus menggunakan IP lokal, bukan `localhost`
- JWT disimpan di `expo-secure-store`, bukan `AsyncStorage`

---

## Ringkasan Secret per Service

| Variabel                          | Service | Sensitif? | Keterangan                                           |
| --------------------------------- | ------- | --------- | ---------------------------------------------------- |
| `spring.datasource.password`      | Server  | 🔴 Ya     | Password DB Supabase                                 |
| `app.jwt.secret`                  | Server  | 🔴 Ya     | Kunci signing JWT                                    |
| `supabase.key`                    | Server  | 🔴 Ya     | Akses Supabase (verifikasi: service role atau anon?) |
| `gemini.api.key`                  | Server  | 🔴 Ya     | Google AI API key                                    |
| `polygon.rpc-url`                 | Server  | 🟡 Aman   | URL RPC provider (bisa public)                       |
| `polygon.anchor-private-key`      | Server  | 🔴 Ya     | Private key wallet Polygon untuk gas                 |
| `polygon.registry-contract`       | Server  | 🟡 Aman   | Address smart contract GiziChainRegistry             |
| `polygon.vc-registry-contract`    | Server  | 🟡 Aman   | Address smart contract VCRegistry                    |
| `pinata.api-key`                  | Server  | 🟡 Batasi | API key Pinata (rate limit by IP)                    |
| `pinata.secret-key`               | Server  | 🔴 Ya     | Secret key Pinata                                    |
| `SENTRY_AUTH_TOKEN`               | Web     | 🔴 Ya     | Upload source maps                                   |
| `NEXT_PUBLIC_API_URL`             | Web     | 🟡 Aman   | URL publik API (port 8085)                           |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Web     | 🟡 Batasi | Batasi di Google Console                             |
| `EXPO_PUBLIC_API_URL`             | Mobile  | 🟡 Aman   | URL publik API (port 8085)                           |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | Mobile  | 🟡 Batasi | Batasi di Google Console                             |

---

## Setup Development Cepat

### 1. Clone dan Setup Server

```bash
cd server
cp .env.example .env
# Edit .env dengan nilai yang sesuai
./mvnw spring-boot:run
```

### 2. Setup Web

```bash
cd web
cp .env.example .env.local
# Edit .env.local
npm install
npm run dev
```

### 3. Setup Mobile

```bash
cd mobile
cp .env.example .env
# Edit .env
npm install
npx expo start
```

---

## Checklist Sebelum Deploy Production

- [ ] `app.jwt.secret` di-generate ulang dengan nilai random minimal 64 karakter
- [ ] `spring.jpa.hibernate.ddl-auto` diset ke `validate` (bukan `update` atau `create`)
- [ ] `spring.jpa.show-sql` diset ke `false`
- [ ] `app.cors.allowed-origins` hanya berisi domain production
- [ ] `supabase.key` tidak ter-expose di log atau response API — verifikasi tipe key (service role vs anon)
- [ ] `gemini.api.url` sudah mengarah ke endpoint production yang benar
- [ ] Google Maps API key dibatasi per domain/bundleId di Google Console
- [ ] Semua variabel server tidak memiliki prefix `NEXT_PUBLIC_` atau `EXPO_PUBLIC_`
- [ ] `polygon.anchor-private-key` adalah dedicated hot wallet dengan saldo MATIC cukup untuk gas
- [ ] Smart contract address `GiziChainRegistry` dan `VCRegistry` sudah di-deploy dan tercatat
- [ ] Polygon chain ID sudah sesuai (80001 testnet / 137 mainnet)
- [ ] `pinata.api-key` dan `pinata.secret-key` valid — test upload file ke IPFS
- [ ] `pinata.gateway-url` dapat diakses publik untuk verifikasi VC offline
