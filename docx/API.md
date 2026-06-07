# API.md — Tumbuh Sehat

## Konvensi

- **Base URL**: `http://localhost:8080` (dev) / `https://api.stunting-ai.com` (prod)
- **Content-Type**: `application/json` (kecuali upload foto: `multipart/form-data`)
- **Auth**: Semua endpoint kecuali `/api/auth/**` memerlukan header:
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

---

## Auth — `/api/auth`

### POST `/api/auth/register`
Registrasi akun baru. Hanya untuk role `PARENT` (self-register).
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
  "id": "clx1234567890",
  "email": "orang.tua@email.com",
  "name": "Budi Santoso",
  "role": "PARENT"
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
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "user": {
  "id": "clx1234567890",
  "email": "orang.tua@email.com",
  "name": "Budi Santoso",
  "role": "PARENT",
  "walletAddress": null
}
}
```

**Errors**: `401` email/password salah, `403` akun dinonaktifkan

---

### POST `/api/auth/refresh`
Dapatkan access token baru menggunakan refresh token.

**Auth**: ❌ Tidak diperlukan

**Request Body**:
```json
{
  "refreshToken": "eyJhbGci..."
}
```

**Response `200 OK`**:
```json
{
  "accessToken": "eyJhbGci..."
}
```

**Errors**: `401` refresh token invalid atau expired

---

### POST `/api/auth/logout`
Revoke refresh token aktif.

**Auth**: ✅ Bearer token

**Request Body**:
```json
{
  "refreshToken": "eyJhbGci..."
}
```

**Response `204 No Content`**

---

### GET `/api/auth/me`
Ambil data user yang sedang login.

**Auth**: ✅ Bearer token

**Response `200 OK`**:
```json
{
  "id": "clx1234567890",
  "email": "orang.tua@email.com",
  "name": "Budi Santoso",
  "role": "PARENT"
}
```

---

## Children — `/api/children`

### GET `/api/children`
Ambil semua anak milik user yang login.

**Auth**: ✅ PARENT (own), MEDIC & ADMIN (semua anak)

**Query Params**: `page` (default 0), `size` (default 10)

**Response `200 OK`**:
```json
{
  "data": [
    {
      "id": "clx_child_001",
      "name": "Andi Santoso",
      "birthDate": "2023-01-15",
      "gender": "MALE",
      "ageMonths": 18,
      "latestPrediction": {
        "status": "AT_RISK",
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

**Auth**: ✅ PARENT

**Request Body**:
```json
{
  "name": "Andi Santoso",
  "birthDate": "2023-01-15",
  "gender": "MALE"
}
```

**Response `201 Created`**:
```json
{
  "id": "clx_child_001",
  "name": "Andi Santoso",
  "birthDate": "2023-01-15",
  "gender": "MALE",
  "ageMonths": 18
}
```

**Errors**: `400` validasi gagal

---

### GET `/api/children/{childId}`
Ambil detail anak beserta riwayat assessment terbaru.

**Auth**: ✅ PARENT (own), MEDIC & ADMIN (semua)

**Response `200 OK`**:
```json
{
  "id": "clx_child_001",
  "name": "Andi Santoso",
  "birthDate": "2023-01-15",
  "gender": "MALE",
  "ageMonths": 18,
  "assessments": [
    {
      "id": "clx_assessment_001",
      "weight": 9.5,
      "height": 74.0,
      "createdAt": "2025-07-01T00:00:00Z",
      "prediction": {
        "status": "AT_RISK",
        "riskLevel": 2
      }
    }
  ]
}
```

**Errors**: `403` bukan milik user, `404` tidak ditemukan

---

### PUT `/api/children/{childId}`
Update data anak (hanya nama dan tanggal lahir).

**Auth**: ✅ PARENT (own)

**Request Body**:
```json
{
  "name": "Andi Budi Santoso",
  "birthDate": "2023-01-15"
}
```

**Response `200 OK`**: Data anak terbaru

---

## Assessments — `/api/assessments`

### POST `/api/assessments`
Submit assessment baru. Prediksi AI di-generate otomatis secara async.

**Auth**: ✅ PARENT

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
  "id": "clx_assessment_001",
  "childId": "clx_child_001",
  "weight": 9.5,
  "height": 74.0,
  "createdAt": "2025-07-24T10:00:00Z",
    "prediction": {
    "id": "clx_pred_001",
    "status": "PENDING",
    "message": "Prediksi sedang diproses, harap tunggu."
  },
  "blockchain": null
}
```

---

### GET `/api/assessments/{assessmentId}`
Ambil detail assessment beserta prediksinya.

**Auth**: ✅ PARENT (own), MEDIC & ADMIN (semua)

**Response `200 OK`**:
```json
{
  "id": "clx_assessment_001",
  "child": {
    "id": "clx_child_001",
    "name": "Andi Santoso",
    "ageMonths": 18
  },
  "weight": 9.5,
  "height": 74.0,
  "headCircumference": 45.5,
  "bfExclusive": true,
  "mpasiAge": 6,
  "mealFreq": 3,
  "illnessHistory": "Diare 2 kali dalam 3 bulan terakhir",
  "createdAt": "2025-07-24T10:00:00Z",
  "prediction": {
    "id": "clx_pred_001",
    "status": "AT_RISK",
    "predictionStatus": "COMPLETED",
    "zscoreWa": -1.8,
    "zscoreHa": -2.1,
    "zscoreWh": -1.2,
    "riskLevel": 2,
    "summary": "Tinggi badan Andi berada di bawah -2 SD dari median WHO.",
    "recommendations": [
      "Tingkatkan frekuensi makan menjadi 5–6 kali sehari",
      "Berikan makanan padat gizi: telur, tempe, sayuran hijau",
      "Konsultasi dengan dokter anak dalam 2 minggu"
    ],
    "nextAssessmentDate": "2025-10-24",
    "disclaimer": "Hasil ini bersifat skrining awal dan bukan diagnosis medis. Konsultasikan dengan dokter atau tenaga kesehatan."
  },
  "blockchain": {
    "id": "clx_anchor_001",
    "anchored": true,
    "recordHash": "0xabc123...def456",
    "txHash": "0xabc123...def456",
    "blockNumber": 48291034,
    "anchorStatus": "CONFIRMED",
    "explorerUrl": "https://polygonscan.com/tx/0xabc123...def456",
    "verifyUrl": "/api/blockchain/verify/clx_assessment_001"
  }
}
```

---

### GET `/api/assessments/child/{childId}`
Ambil semua riwayat assessment seorang anak.

**Auth**: ✅ PARENT (own), MEDIC & ADMIN (semua)

**Query Params**: `page`, `size`

**Response `200 OK`**: Paginated list assessment

---

## Nutrition — `/api/nutrition`

### POST `/api/nutrition`
Upload foto makanan dan analisis kandungan gizi.

**Auth**: ✅ PARENT

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
  "photoUrl": "https://[project].supabase.co/storage/v1/object/public/meal-photos/...",
  "foodDetected": ["nasi putih", "ayam goreng", "sayur bayam"],
  "portionEstimate": "porsi sedang (~300g)",
  "nutrition": {
    "calories": 420.0,
    "protein": 18.0,
    "carbs": 52.0,
    "fat": 14.0,
    "fiber": 3.0
  },
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

**Response `200 OK`**: Paginated list nutrition logs

---

## Chat — `/api/chat`

### POST `/api/chat`
Kirim pesan ke chatbot konsultasi.

**Auth**: ✅ PARENT

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
  "reply": "Berdasarkan kondisi Andi (status AT_RISK, z-score TB/U -2.1), susah makan bisa disebabkan oleh...",
  "suggestedQuestions": [
    "Makanan apa yang sebaiknya dihindari?",
    "Berapa kali idealnya Andi makan dalam sehari?"
  ]
}
```

**Errors**: `400` prediksi belum ada atau masih PENDING, `404` prediksi tidak ditemukan

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
  ],
  "updatedAt": "2025-07-24T10:00:05Z"
}
```

---

## Blockchain — `/api/blockchain`
> Endpoint untuk meng-anchor hash data assessment ke Polygon dan memverifikasi integritasnya.

### POST `/api/blockchain/anchor`
Anchor hash assessment ke blockchain Polygon. Dipanggil otomatis oleh server setelah prediksi selesai.

**Auth**: ✅ SERVER (internal, tidak dipanggil langsung oleh client)

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
  "explorerUrl": "https://polygonscan.com/tx/0xabc123...def456"
}
```

**Errors**: `404` assessment tidak ditemukan atau belum di-anchor

---

## Verifiable Credential — `/api/vc`
> Kelola Verifiable Credential (W3C) untuk status gizi dan imunisasi anak. VC disimpan di IPFS via Pinata dan dicatat di smart contract.

### POST `/api/vc/issue`
Terbitkan Verifiable Credential baru untuk seorang anak.

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
Ambil detail VC (publik, data anonim — tanpa PII).

**Auth**: ✅ ANY

**Response `200 OK`**:
```json
{
  "id": "clx_vc_001",
  "@context": ["https://www.w3.org/2018/credentials/v1"],
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

### POST `/api/vc/revoke`
Cabut (revoke) VC yang sudah diterbitkan. Hanya issuer yang bisa revoke.

**Auth**: ✅ MEDIC, ADMIN

**Request Body**:
```json
{
  "vcId": "clx_vc_001"
}
```

**Response `200 OK`**:
```json
{
  "id": "clx_vc_001",
  "isRevoked": true,
  "revokeTxHash": "0xdef789...abc012",
  "revokedAt": "2025-07-25T10:00:00Z"
}
```

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

## Medic — `/api/medic`
> Semua endpoint ini memerlukan role `MEDIC` atau `ADMIN`.

### GET `/api/medic/patients`
Ambil daftar semua anak yang terdaftar di sistem.

**Auth**: ✅ MEDIC, ADMIN

**Query Params**: `page`, `size`, `search` (nama anak/orang tua), `status` (filter stunt status)

**Response `200 OK`**: Paginated list anak beserta prediksi terbaru

---

### GET `/api/medic/patients/{childId}/summary`
Ringkasan lengkap seorang anak: semua assessment, prediksi, dan log gizi.

**Auth**: ✅ MEDIC, ADMIN

**Response `200 OK`**: Data lengkap anak

---

## Admin — `/api/admin`
> Semua endpoint ini memerlukan role `ADMIN`.

### GET `/api/admin/users`
Daftar semua akun pengguna.

**Auth**: ✅ ADMIN

**Query Params**: `page`, `size`, `role`, `search`

**Response `200 OK`**: Paginated list user

---

### POST `/api/admin/users`
Buat akun baru untuk role `MEDIC` atau `ADMIN`.

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

**Response `201 Created`**: Data user baru

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

**Response `200 OK`**: Data user terbaru

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

**Response `200 OK`**: Data user terbaru

---

### GET `/api/admin/stats`
Statistik agregat stunting (untuk peta sebaran dan dashboard).

**Auth**: ✅ ADMIN

**Query Params**: `from`, `to`

**Response `200 OK`**:
```json
{
  "totalChildren": 1240,
  "totalAssessments": 3820,
  "distribution": {
    "NORMAL": 820,
    "AT_RISK": 210,
    "STUNTED": 155,
    "SEVERELY_STUNTED": 55
  },
  "percentageStunted": 16.9,
  "period": {
    "from": "2025-01-01",
    "to": "2025-07-24"
  }
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
| `422` | Unprocessable Entity — data valid tapi tidak bisa diproses (misal foto tidak dikenali Gemini, VC expired) |
| `500` | Internal Server Error |
| `503` | Service Unavailable — Gemini, Supabase, atau blockchain RPC tidak bisa dijangkau |
