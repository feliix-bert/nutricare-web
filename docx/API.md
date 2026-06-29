# API.md — Tumbuh Sehat (GiziChain)

> Cocok dengan implementasi server Spring Boot actual. Update terakhir: 2026-06-29.

## Konvensi

- **Base URL**: `http://localhost:8080` (dev) / `https://api.stunting-ai.com` (prod)
- **Content-Type**: `application/json` (kecuali upload foto: `multipart/form-data`)
- **Auth**: Semua endpoint kecuali `/api/auth/**` dan `/api/verify` memerlukan header:
  ```
  Authorization: Bearer <accessToken>
  ```
- **Format Error**:
  ```json
  {
    "status": 400,
    "error": "BAD_REQUEST",
    "message": "Deskripsi error",
    "timestamp": "2025-07-24T10:00:00Z",
    "path": "/api/endpoint"
  }
  ```
- **Pagination** (untuk endpoint list):
  ```json
  {
    "data": [...],
    "page": 0,
    "size": 10,
    "totalElements": 42,
    "totalPages": 5
  }
  ```
- **Primary Key**: CUID (`util/CuidGenerator.java`)

---

## Auth — `/api/auth`

### POST `/api/auth/register`
Registrasi akun baru. Hanya untuk role `PARENT` (self-register). Langsung return token (auto-login).
`MEDIC` dan `ADMIN` dibuat oleh ADMIN via `/api/admin/users`.

**Auth**: ❌ Tidak diperlukan

**Request Body**:
```json
{
  "email": "orang.tua@email.com",
  "password": "min8karakter",
  "name": "Budi Santoso"
}
```

**Response `201 Created`**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "user": {
    "id": "clx1234567890",
    "name": "Budi Santoso",
    "email": "orang.tua@email.com",
    "role": "PARENT",
    "isActive": true,
    "walletAddress": null
  }
}
```

**Errors**: `400` validasi gagal, `409` email sudah terdaftar

---

### POST `/api/auth/login`
Login dan dapatkan JWT.

**Auth**: ❌ Tidak diperlukan

**Request Body**:
```json
{
  "email": "orang.tua@email.com",
  "password": "min8karakter"
}
```

**Response `200 OK`**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "user": {
    "id": "clx1234567890",
    "name": "Budi Santoso",
    "email": "orang.tua@email.com",
    "role": "PARENT",
    "isActive": true,
    "walletAddress": null
  }
}
```

**Errors**: `401` email/password salah, `403` akun dinonaktifkan

---

### POST `/api/auth/refresh`
Dapatkan access token baru + refresh token baru (token rotation — refresh token lama direvoke).

**Auth**: ❌ Tidak diperlukan

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Response `200 OK`**: Sama seperti login — full `AuthResponse` (accessToken baru + refreshToken baru + user).

**Errors**: `404` refresh token invalid atau expired

---

### POST `/api/auth/logout`
Revoke refresh token aktif.

**Auth**: ✅ Bearer token

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Response `200 OK`**:
```json
{
  "message": "Logout berhasil"
}
```

---

### GET `/api/auth/me`
Ambil data user yang sedang login.

**Auth**: ✅ Bearer token

**Response `200 OK`**:
```json
{
  "id": "clx1234567890",
  "name": "Budi Santoso",
  "email": "orang.tua@email.com",
  "role": "PARENT",
  "isActive": true,
  "walletAddress": null
}
```

---

## Children — `/api/children`

### GET `/api/children`
Ambil semua anak milik user yang login.

**Auth**: ✅ PARENT (own), MEDIC & ADMIN (semua anak)

**Query Params**: `page` (default 0), `size` (default 10), `search`, `status`

**Response `200 OK`**:
```json
{
  "data": [
    {
      "id": "clx_child_001",
      "name": "Andi Santoso",
      "gender": "MALE",
      "birthDate": "2023-01-15",
      "anonId": "anon_abc123",
      "ageMonths": 18,
      "createdAt": "2025-07-01T00:00:00Z",
      "latestPrediction": {
        "status": "AT_RISK",
        "riskLevel": 2,
        "createdAt": "2025-07-01T00:00:00Z"
      }
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 1,
  "totalPages": 1
}
```

---

### POST `/api/children`
Tambah data anak baru.

**Auth**: ✅ PARENT, ADMIN

**Request Body**:
```json
{
  "name": "Andi Santoso",
  "birthDate": "2023-01-15",
  "gender": "MALE"
}
```

**Response `201 Created`**: Sama seperti item di GET `/api/children`.

**Errors**: `400` validasi gagal

---

### GET `/api/children/{childId}`
Ambil detail anak beserta riwayat assessment + prediksi lengkap.

**Auth**: ✅ PARENT (own), MEDIC & ADMIN (semua)

**Response `200 OK`**:
```json
{
  "id": "clx_child_001",
  "name": "Andi Santoso",
  "gender": "MALE",
  "birthDate": "2023-01-15",
  "anonId": "anon_abc123",
  "ageMonths": 18,
  "createdAt": "2025-07-01T00:00:00Z",
  "assessments": [
    {
      "id": "clx_assessment_001",
      "weight": 9.5,
      "height": 74.0,
      "headCircumference": 45.5,
      "bfExclusive": true,
      "mpasiAge": 6,
      "mealFreq": 3,
      "illnessHistory": "Diare 2 kali dalam 3 bulan terakhir",
      "createdAt": "2025-07-01T00:00:00Z",
      "prediction": {
        "id": "clx_pred_001",
        "status": "AT_RISK",
        "predictionStatus": "COMPLETED",
        "riskLevel": 2,
        "zscoreWa": -1.8,
        "zscoreHa": -2.1,
        "zscoreWh": -1.2,
        "summary": "Tinggi badan Andi berada di bawah -2 SD dari median WHO.",
        "recommendations": [
          "Tingkatkan frekuensi makan menjadi 5–6 kali sehari",
          "Berikan makanan padat gizi: telur, tempe, sayuran hijau",
          "Konsultasi dengan dokter anak dalam 2 minggu"
        ],
        "nextAssessmentDate": "2025-10-24",
        "createdAt": "2025-07-01T00:00:00Z"
      }
    }
  ]
}
```

**Errors**: `403` bukan milik user, `404` tidak ditemukan

---

### PUT `/api/children/{childId}`
Update data anak (nama, tanggal lahir, gender).

**Auth**: ✅ PARENT (own), ADMIN

**Request Body**:
```json
{
  "name": "Andi Budi Santoso",
  "birthDate": "2023-01-15",
  "gender": "MALE"
}
```

**Response `200 OK`**: Data anak terbaru (sama seperti POST).

---

## Assessments — `/api/assessments`

### POST `/api/assessments`
Submit assessment baru. Prediksi di-generate secara **async** (`@Async`). Response langsung return PredictionResponse dengan `predictionStatus: "PENDING"`.

**Auth**: ✅ PARENT, ADMIN

**Request Body**:
```json
{
  "childId": "clx_child_001",
  "weight": 9.5,
  "height": 74.0,
  "headCircumference": 45.5,
  "bfExclusive": true,
  "mpasiAge": 6,
  "mealFreq": 3,
  "illnessHistory": "Diare 2 kali dalam 3 bulan terakhir"
}
```

**Validasi**:
| Field | Rule |
|-------|------|
| `weight` | 0.5 – 50 kg |
| `height` | 30 – 130 cm |
| `headCircumference` | 20 – 60 cm (opsional) |
| `mpasiAge` | 0 – 24 bulan (opsional) |
| `mealFreq` | 1 – 10 kali/hari |
| `illnessHistory` | maks 500 karakter (opsional) |

**Response `201 Created`**:
```json
{
  "id": "clx_pred_001",
  "assessmentId": "clx_assessment_001",
  "childId": "clx_child_001",
  "childName": "Andi Santoso",
  "status": "AT_RISK",
  "predictionStatus": "PENDING",
  "riskLevel": 2,
  "statusLabel": "Berisiko Stunting",
  "statusColor": "yellow",
  "zscoreWa": -1.8,
  "zscoreHa": -2.1,
  "zscoreWh": -1.2,
  "summary": "Tinggi badan Andi berada di bawah -2 SD dari median WHO.",
  "recommendations": [
    "Tingkatkan frekuensi makan menjadi 5–6 kali sehari"
  ],
  "nextAssessmentDate": "2025-10-24",
  "disclaimer": "Hasil ini bersifat skrining awal dan bukan diagnosis medis. Konsultasikan dengan dokter atau tenaga kesehatan.",
  "blockchain": null,
  "createdAt": "2025-07-24T10:00:00Z"
}
```

> Catatan: Saat `predictionStatus: "PENDING"`, field z-score, summary, recommendations akan null. Client perlu pooling GET `/api/assessments/{id}` sampai `predictionStatus: "COMPLETED"`. Retry job otomatis tiap 5 menit untuk yang gagal.

---

### GET `/api/assessments/{assessmentId}`
Ambil detail prediksi assessment (flat structure — `PredictionResponse`).

**Auth**: ✅ PARENT (own), MEDIC & ADMIN (semua)

**Response `200 OK`**:
```json
{
  "id": "clx_pred_001",
  "assessmentId": "clx_assessment_001",
  "childId": "clx_child_001",
  "childName": "Andi Santoso",
  "status": "AT_RISK",
  "predictionStatus": "COMPLETED",
  "riskLevel": 2,
  "statusLabel": "Berisiko Stunting",
  "statusColor": "yellow",
  "zscoreWa": -1.8,
  "zscoreHa": -2.1,
  "zscoreWh": -1.2,
  "summary": "Tinggi badan Andi berada di bawah -2 SD dari median WHO.",
  "recommendations": [
    "Tingkatkan frekuensi makan menjadi 5–6 kali sehari",
    "Berikan makanan padat gizi: telur, tempe, sayuran hijau",
    "Konsultasi dengan dokter anak dalam 2 minggu"
  ],
  "nextAssessmentDate": "2025-10-24",
  "disclaimer": "Hasil ini bersifat skrining awal dan bukan diagnosis medis. Konsultasikan dengan dokter atau tenaga kesehatan.",
  "blockchain": {
    "anchorStatus": "CONFIRMED",
    "txHash": "0xabc123...def456",
    "polygonscanUrl": "https://amoy.polygonscan.com/tx/0xabc123...def456",
    "isVerified": true
  },
  "createdAt": "2025-07-24T10:00:00Z"
}
```

> Catatan: Server return struktur FLAT, **bukan** nested seperti `{ child, weight, height, prediction, blockchain }`. Field anthropometry tidak ada di response ini — hanya z-score. Untuk detail anthropometry + prediction + child info, gunakan `GET /api/children/{childId}`.

---

### GET `/api/assessments/child/{childId}`
Ambil semua riwayat prediksi seorang anak (paginated).

**Auth**: ✅ PARENT (own), MEDIC & ADMIN (semua)

**Query Params**: `page`, `size`

**Response `200 OK`**: Paginated list `PredictionResponse` (sama format seperti GET assessment detail).

---

## Nutrition — `/api/nutrition`

### POST `/api/nutrition`
Upload foto makanan dan analisis kandungan gizi via Gemini Vision.

**Auth**: ✅ PARENT, ADMIN

**Content-Type**: `multipart/form-data`

**Form Fields**:
| Field | Tipe | Keterangan |
|-------|------|-----------|
| `childId` | String | ID anak |
| `photo` | File | JPEG/PNG/WebP, maks 5 MB |

**Response `201 Created`**:
```json
{
  "id": "clx_nutrition_001",
  "childId": "clx_child_001",
  "photoUrl": "https://[project].supabase.co/storage/v1/object/public/food-photos/...",
  "foodDetected": ["nasi putih", "ayam goreng", "sayur bayam"],
  "portionEstimate": "porsi sedang (~300g)",
  "calories": 420.0,
  "protein": 18.0,
  "carbs": 52.0,
  "fat": 14.0,
  "fiber": 3.0,
  "adequacyNote": "Cukup untuk anak 12–18 bulan (1 kali makan)",
  "mpasiRecommendation": "Tambahkan sumber zat besi seperti hati ayam 2x seminggu",
  "createdAt": "2025-07-24T10:00:00Z"
}
```

**Errors**: `400` file bukan gambar atau terlalu besar, `422` foto tidak bisa dianalisis Gemini

---

### GET `/api/nutrition/child/{childId}`
Ambil riwayat log gizi seorang anak.

**Auth**: ✅ PARENT (own), MEDIC & ADMIN (semua)

**Query Params**: `page`, `size`

**Response `200 OK`**: Paginated list `NutritionResponse` (sama format seperti POST).

---

### DELETE `/api/nutrition/{logId}`
Hapus log nutrisi.

**Auth**: ✅ PARENT (own)

**Response `204 No Content`**

---

## Chat — `/api/chat`

### POST `/api/chat`
Kirim pesan ke chatbot konsultasi.

**Auth**: ✅ PARENT, ADMIN

**Request Body**:
```json
{
  "predictionId": "clx_pred_001",
  "message": "Anak saya susah makan nasi, apa yang harus saya lakukan?"
}
```

**Response `200 OK`**:
```json
{
  "sessionId": "clx_session_001",
  "predictionId": "clx_pred_001",
  "role": "assistant",
  "content": "Berdasarkan kondisi Andi (status AT_RISK, z-score TB/U -2.1), susah makan bisa disebabkan oleh...",
  "timestamp": "2025-07-24T10:00:00Z"
}
```

**Errors**: `400` prediksi belum PENDING/FAILED, `404` prediksi tidak ditemukan, `403` bukan milik user

---

### GET `/api/chat/{predictionId}`
Ambil riwayat percakapan untuk prediksi tertentu.

**Auth**: ✅ PARENT (own), MEDIC & ADMIN (semua)

**Response `200 OK`**:
```json
{
  "sessionId": "clx_session_001",
  "predictionId": "clx_pred_001",
  "messages": [
    {
      "role": "user",
      "content": "Anak saya susah makan nasi...",
      "timestamp": "2025-07-24T10:00:00Z"
    },
    {
      "role": "assistant",
      "content": "Berdasarkan kondisi Andi...",
      "timestamp": "2025-07-24T10:00:05Z"
    }
  ]
}
```

---

## Reports — `/api/reports`

### GET `/api/reports/child/{childId}`
Generate dan unduh laporan PDF untuk seorang anak.

**Auth**: ✅ PARENT (own), MEDIC & ADMIN (semua)

**Query Params**:
| Param | Tipe | Default | Keterangan |
|-------|------|---------|-----------|
| `from` | Date | 30 hari lalu | Filter tanggal mulai |
| `to` | Date | hari ini | Filter tanggal akhir |

**Response `200 OK`**:
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="laporan-anak-[id].pdf"`

---

## Blockchain — `/api/blockchain`

### POST `/api/blockchain/anchor`
Anchor hash assessment ke blockchain Polygon. Dipanggil otomatis oleh server (`@Async` setelah prediksi selesai), **bukan oleh client**.

**Auth**: ✅ Server internal (tidak dipanggil langsung oleh client)

**Response `200 OK`**:
```json
{
  "id": "clx_anchor_001",
  "assessmentId": "clx_assessment_001",
  "recordHash": "0xabc123...def456",
  "txHash": "0xabc123...def456",
  "blockNumber": 48291034,
  "contractAddress": "0xGiziChainRegistryAddress",
  "anchorStatus": "CONFIRMED",
  "anchoredAt": "2025-07-24T10:00:00Z"
}
```

**Errors**: `500` RPC timeout atau gas insufficient

---

### GET `/api/blockchain/verify/{assessmentId}`
Verifikasi integritas data assessment dengan membandingkan hash on-chain.

**Auth**: ✅ ANY (publik, endpoint read-only)

**Response `200 OK`**:
```json
{
  "assessmentId": "clx_assessment_001",
  "isValid": true,
  "recordHash": "0xabc123...def456",
  "anchoredAt": "2025-07-24T10:00:00Z",
  "txHash": "0xabc123...def456",
  "blockNumber": 48291034,
  "explorerUrl": "https://amoy.polygonscan.com/tx/0xabc123...def456"
}
```

**Errors**: `404` assessment tidak ditemukan atau belum di-anchor

---

## Verifiable Credential — `/api/vc`

### POST `/api/vc/issue`
Terbitkan Verifiable Credential baru untuk seorang anak. Data disimpan di IPFS via Pinata dan dicatat di smart contract (simulasi).

**Auth**: ✅ MEDIC, ADMIN

**Request Body**:
```json
{
  "childId": "clx_child_001",
  "vcType": "NUTRITION_STATUS",
  "expiresAt": "2026-07-24T10:00:00Z"
}
```

**Response `201 Created`**:
```json
{
  "id": "clx_vc_001",
  "childId": "clx_child_001",
  "childAnonId": "clx_anon_001",
  "issuerId": "clx_medic_001",
  "issuerWallet": "did:polygon:0xMedicWalletAddress",
  "vcType": "NUTRITION_STATUS",
  "ipfsCid": "bafybeig...abc123",
  "txHash": "0xabc123...def456",
  "expiresAt": "2026-07-24T10:00:00Z",
  "createdAt": "2025-07-24T10:00:00Z",
  "qrPayload": "eyJhbGciOiJFUzI1NksifQ..."
}
```

**Errors**: `400` childId tidak valid, `403` issuer belum punya wallet terdaftar

---

### GET `/api/vc/{vcId}`
Ambil detail VC dalam format W3C (publik, data anonim — tanpa PII).

**Auth**: ✅ ANY (publik)

**Response `200 OK`**:
```json
{
  "id": "clx_vc_001",
  "context": ["https://www.w3.org/2018/credentials/v1"],
  "type": ["VerifiableCredential", "ChildHealthCredential"],
  "issuer": {
    "id": "did:polygon:0xMedicWalletAddress",
    "name": "Puskesmas Ilir Timur I Palembang"
  },
  "issuanceDate": "2025-07-24T10:00:00Z",
  "expirationDate": "2026-07-24T10:00:00Z",
  "credentialSubject": {
    "id": "urn:gizichain:child:clx_anon_001",
    "ageMonths": 18,
    "gender": "MALE",
    "nutritionStatus": "AT_RISK",
    "immunizationComplete": true
  },
  "isRevoked": false,
  "ipfsCid": "bafybeig...abc123",
  "txHash": "0xabc123...def456"
}
```

---

### GET `/api/vc/child/{childId}`
Mendapatkan VC aktif terbaru milik seorang anak.

**Auth**: ✅ ANY (publik)

**Response `200 OK`**:
```json
{
  "vc": {
    "id": "clx_vc_001",
    "context": ["https://www.w3.org/2018/credentials/v1"],
    "type": ["VerifiableCredential", "ChildHealthCredential"],
    "issuer": { ... },
    "issuanceDate": "...",
    "expirationDate": "...",
    "credentialSubject": { ... },
    "isRevoked": false,
    "ipfsCid": "Qm...",
    "txHash": "0x..."
  }
}
```

`vc` bisa `null` jika anak belum punya VC aktif.

---

### POST `/api/vc/revoke`
Cabut (revoke) VC yang sudah diterbitkan. Hanya issuer yang bisa revoke.

**Auth**: ✅ MEDIC, ADMIN

**Request Body**:
```json
{
  "vcId": "clx_vc_001"
}
```

**Response `200 OK`**: Return full `VcDetailResponse` dengan `isRevoked: true`.

**Errors**: `403` bukan issuer VC ini, `400` VC sudah di-revoke sebelumnya

---

### GET `/api/verify`
Verifikasi QR code VC. Endpoint publik tanpa auth — bisa diakses oleh faskes manapun.

**Auth**: ❌ Tidak diperlukan (publik)

**Query Params**:
| Param | Tipe | Wajib | Keterangan |
|-------|------|-------|-----------|
| `qr` | String | ✅ | Encoded payload dari QR code (base64 JSON) |

**Response `200 OK`**:
```json
{
  "valid": true,
  "vcId": "clx_vc_001",
  "vcType": "NUTRITION_STATUS",
  "childAnonId": "clx_anon_001",
  "issuerName": "Puskesmas Ilir Timur I Palembang",
  "issuedAt": "2025-07-24T10:00:00Z",
  "expiresAt": "2026-07-24T10:00:00Z",
  "isRevoked": false,
  "verificationMethod": "offline_signature + online_ipfs_chain",
  "ipfsCid": "bafybeig...abc123"
}
```

**Errors**: `400` QR payload tidak valid, `422` VC telah di-revoke atau expired

---

## Medic — `/api/medic`

### GET `/api/medic/patients`
Ambil daftar semua anak yang terdaftar di sistem.

**Auth**: ✅ MEDIC, ADMIN

**Query Params**: `page`, `size`, `search` (nama anak/orang tua), `status` (filter StuntStatus)

**Response `200 OK`**: Paginated list Map:
```json
{
  "data": [
    {
      "id": "clx_child_001",
      "name": "Andi Santoso",
      "gender": "MALE",
      "birthDate": "2023-01-15",
      "ageMonths": 18,
      "parentName": "Budi Santoso",
      "latestPrediction": {
        "status": "AT_RISK",
        "riskLevel": 2,
        "createdAt": "2025-07-01T00:00:00Z"
      }
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 1,
  "totalPages": 1
}
```

> Catatan: Response berupa dynamic `Map<String, Object>`, bukan DTO tetap. Field: `id, name, gender, birthDate, ageMonths, parentName, latestPrediction`.

---

### GET `/api/medic/patients/{childId}/summary`
Ringkasan lengkap seorang anak: data anak, semua assessment + prediksi, dan log gizi (7 terakhir).

**Auth**: ✅ MEDIC, ADMIN

**Response `200 OK`**:
```json
{
  "id": "clx_child_001",
  "name": "Andi Santoso",
  "gender": "MALE",
  "birthDate": "2023-01-15",
  "ageMonths": 18,
  "anonId": "anon_abc123",
  "parent": {
    "id": "clx_user_001",
    "name": "Budi Santoso",
    "email": "orang.tua@email.com"
  },
  "assessments": [
    {
      "id": "clx_assessment_001",
      "weight": 9.5,
      "height": 74.0,
      "headCircumference": 45.5,
      "bfExclusive": true,
      "mealFreq": 3,
      "illnessHistory": "...",
      "createdAt": "...",
      "prediction": {
        "id": "clx_pred_001",
        "status": "AT_RISK",
        "predictionStatus": "COMPLETED",
        "zscoreHa": -2.1,
        "zscoreWa": -1.8,
        "zscoreWh": -1.2,
        "riskLevel": 2,
        "summary": "...",
        "recommendations": ["..."],
        "nextAssessmentDate": "2025-10-24",
        "createdAt": "..."
      }
    }
  ],
  "recentNutritionLogs": [
    {
      "id": "clx_nutrition_001",
      "photoUrl": "https://...",
      "foodDetected": ["nasi", "ayam"],
      "calories": 420.0,
      "createdAt": "..."
    }
  ]
}
```

---

## Admin — `/api/admin`

### GET `/api/admin/users`
Daftar semua akun pengguna.

**Auth**: ✅ ADMIN

**Query Params**: `page`, `size`, `role`, `search`

**Response `200 OK`**: Paginated list `UserAdminResponse`:
```json
{
  "data": [
    {
      "id": "clx_user_001",
      "email": "orang.tua@email.com",
      "name": "Budi Santoso",
      "role": "PARENT",
      "isActive": true,
      "walletAddress": null,
      "createdAt": "2025-07-01T00:00:00Z"
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 3,
  "totalPages": 1
}
```

---

### POST `/api/admin/users`
Buat akun baru untuk role `MEDIC`, `POSYANDU`, atau `ADMIN`.

**Auth**: ✅ ADMIN

**Request Body**:
```json
{
  "email": "dokter@puskesmas.go.id",
  "password": "tempPassword123",
  "name": "dr. Siti Rahayu",
  "role": "MEDIC"
}
```

**Response `201 Created`**:
```json
{
  "id": "clx_user_002",
  "email": "dokter@puskesmas.go.id",
  "name": "dr. Siti Rahayu",
  "role": "MEDIC",
  "isActive": true
}
```

---

### PATCH `/api/admin/users/{userId}/status`
Aktifkan atau nonaktifkan akun user.

**Auth**: ✅ ADMIN

**Request Body**:
```json
{
  "isActive": false
}
```

**Response `200 OK`**: Data user terbaru (`UserAdminResponse`).

---

### PATCH `/api/admin/users/{userId}/role`
Ubah role user.

**Auth**: ✅ ADMIN

**Request Body**:
```json
{
  "role": "MEDIC"
}
```

**Response `200 OK`**: Data user terbaru (`UserAdminResponse`).

---

### GET `/api/admin/stats`
Statistik agregat stunting (untuk dashboard).

**Auth**: ✅ ADMIN

**Response `200 OK`**:
```json
{
  "totalUsers": 10,
  "totalChildren": 1240,
  "totalAssessments": 3820,
  "distribution": {
    "NORMAL": 820,
    "AT_RISK": 210,
    "STUNTED": 155,
    "SEVERELY_STUNTED": 55
  },
  "percentageStunted": 16.9
}
```

---

## HTTP Status Code Ringkasan

| Code | Arti |
|------|------|
| `200` | OK |
| `201` | Created |
| `204` | No Content |
| `400` | Bad Request — validasi gagal |
| `401` | Unauthorized — token tidak valid / expired |
| `403` | Forbidden — role tidak punya akses |
| `404` | Not Found |
| `409` | Conflict — data duplikat (email sudah ada) |
| `422` | Unprocessable Entity — data valid tapi tidak bisa diproses |
| `500` | Internal Server Error |
| `503` | Service Unavailable — Gemini, Supabase, atau blockchain RPC tidak bisa dijangkau |

## Status Label Mapping

| `StuntStatus` | `statusLabel` | `statusColor` |
|---------------|---------------|---------------|
| `NORMAL` | "Normal" | "green" |
| `AT_RISK` | "Berisiko Stunting" | "yellow" |
| `STUNTED` | "Stunting" | "orange" |
| `SEVERELY_STUNTED` | "Stunting Berat" | "red" |

## Disclaimer

Semua response prediksi menyertakan disclaimer berikut:
> "Hasil ini bersifat skrining awal dan bukan diagnosis medis. Konsultasikan dengan dokter atau tenaga kesehatan."
