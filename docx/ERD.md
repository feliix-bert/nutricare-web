# ERD.md — Stunting AI Platform

## Diagram Relasi Entitas

```
┌─────────────────────────────────────────────────────────────────┐
│                            users                                │
│  id (PK)  │  email  │  password_hash  │  name  │  role  │ ...  │
└─────────────────────────────┬───────────────────────────────────┘
                              │ 1
                              │
                              │ has many
                              │ N
                    ┌─────────▼──────────┐
                    │      children      │
                    │  id (PK)           │
                    │  user_id (FK)      │
                    │  name              │
                    │  birth_date        │
                    │  gender            │
                    └──┬─────────────┬───┘
                       │             │
              has many │             │ has many
                       │             │
               ┌───────▼──────┐  ┌───▼──────────────┐
               │ assessments  │  │  nutrition_logs   │
               │  id (PK)     │  │  id (PK)          │
               │  child_id(FK)│  │  child_id (FK)    │
               │  weight      │  │  photo_url        │
               │  height      │  │  calories         │
               │  ...         │  │  protein          │
               └───────┬──────┘  │  carbs            │
                       │         │  fat              │
              has one  │         │  fiber            │
                       │         │  gemini_raw (JSON)│
               ┌───────▼──────┐  └───────────────────┘
               │ predictions  │
               │  id (PK)     │
               │  assessment  │
               │    _id (FK)  │
               │  status      │
               │  zscore_wa   │
               │  zscore_ha   │
               │  zscore_wh   │
               │  risk_level  │
               │  ...         │
               └───────┬──────┘
                       │
              has many │
                       │
               ┌───────▼──────────┐
               │  chat_sessions   │
               │  id (PK)         │
               │  prediction_id   │
               │    (FK)          │
               │  messages (JSON) │
               │  updated_at      │
               └──────────────────┘
```

---

## Detail Tabel

### `users`
| Kolom | Tipe | Constraint | Keterangan |
|-------|------|-----------|------------|
| `id` | `VARCHAR(30)` | PK | CUID |
| `email` | `VARCHAR(255)` | UNIQUE, NOT NULL | Email login |
| `password_hash` | `VARCHAR(255)` | NOT NULL | BCrypt hash |
| `name` | `VARCHAR(100)` | NOT NULL | Nama lengkap |
| `role` | `role_enum` | NOT NULL, DEFAULT 'PARENT' | Role akses |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT true | Soft disable oleh ADMIN |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | — |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | — |

---

### `children`
| Kolom | Tipe | Constraint | Keterangan |
|-------|------|-----------|------------|
| `id` | `VARCHAR(30)` | PK | CUID |
| `user_id` | `VARCHAR(30)` | FK → users.id, NOT NULL | Pemilik data |
| `name` | `VARCHAR(100)` | NOT NULL | Nama anak |
| `birth_date` | `DATE` | NOT NULL | Tanggal lahir |
| `gender` | `gender_enum` | NOT NULL | MALE / FEMALE |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | — |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | — |

---

### `assessments`
| Kolom | Tipe | Constraint | Keterangan |
|-------|------|-----------|------------|
| `id` | `VARCHAR(30)` | PK | CUID |
| `child_id` | `VARCHAR(30)` | FK → children.id, NOT NULL | — |
| `weight` | `NUMERIC(5,2)` | NOT NULL | kg, min 0.5 max 50 |
| `height` | `NUMERIC(5,2)` | NOT NULL | cm, min 30 max 130 |
| `head_circumference` | `NUMERIC(4,1)` | NULLABLE | cm, min 20 max 60 |
| `bf_exclusive` | `BOOLEAN` | NOT NULL | ASI eksklusif 6 bulan |
| `mpasi_age` | `SMALLINT` | NULLABLE | Usia mulai MPASI (bulan) |
| `meal_freq` | `SMALLINT` | NOT NULL | Frekuensi makan per hari |
| `illness_history` | `TEXT` | NULLABLE | Riwayat penyakit (teks bebas) |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Immutable setelah insert |

> Assessment bersifat **append-only**. Tidak ada kolom `updated_at`.

---

### `predictions`
| Kolom | Tipe | Constraint | Keterangan |
|-------|------|-----------|------------|
| `id` | `VARCHAR(30)` | PK | CUID |
| `assessment_id` | `VARCHAR(30)` | FK → assessments.id, UNIQUE, NOT NULL | One-to-one |
| `status` | `stunt_status_enum` | NOT NULL | Status stunting |
| `prediction_status` | `prediction_status_enum` | NOT NULL, DEFAULT 'PENDING' | Status proses AI |
| `zscore_wa` | `NUMERIC(5,2)` | NULLABLE | Z-score BB/U |
| `zscore_ha` | `NUMERIC(5,2)` | NULLABLE | Z-score TB/U |
| `zscore_wh` | `NUMERIC(5,2)` | NULLABLE | Z-score BB/TB |
| `risk_level` | `SMALLINT` | NULLABLE | 1–4 (1=normal, 4=severely stunted) |
| `summary` | `TEXT` | NULLABLE | Ringkasan dari Gemini |
| `recommendations` | `TEXT[]` | NULLABLE | Array rekomendasi dari Gemini |
| `next_assessment_date` | `DATE` | NULLABLE | Tanggal assessment berikutnya |
| `gemini_raw` | `JSONB` | NULLABLE | Raw response Gemini (untuk debugging) |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | — |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Diupdate saat AI selesai |

---

### `nutrition_logs`
| Kolom | Tipe | Constraint | Keterangan |
|-------|------|-----------|------------|
| `id` | `VARCHAR(30)` | PK | CUID |
| `child_id` | `VARCHAR(30)` | FK → children.id, NOT NULL | — |
| `photo_url` | `TEXT` | NOT NULL | Public URL Supabase Storage |
| `food_detected` | `TEXT[]` | NULLABLE | Daftar makanan terdeteksi |
| `portion_estimate` | `VARCHAR(100)` | NULLABLE | Estimasi porsi |
| `calories` | `NUMERIC(6,1)` | NULLABLE | kkal |
| `protein` | `NUMERIC(5,1)` | NULLABLE | gram |
| `carbs` | `NUMERIC(5,1)` | NULLABLE | gram |
| `fat` | `NUMERIC(5,1)` | NULLABLE | gram |
| `fiber` | `NUMERIC(5,1)` | NULLABLE | gram |
| `adequacy_note` | `TEXT` | NULLABLE | Catatan kecukupan gizi dari Gemini |
| `mpasi_recommendation` | `TEXT` | NULLABLE | Rekomendasi MPASI dari Gemini |
| `gemini_raw` | `JSONB` | NULLABLE | Raw response Gemini |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | — |

---

### `chat_sessions`
| Kolom | Tipe | Constraint | Keterangan |
|-------|------|-----------|------------|
| `id` | `VARCHAR(30)` | PK | CUID |
| `prediction_id` | `VARCHAR(30)` | FK → predictions.id, UNIQUE, NOT NULL | Satu sesi per prediksi |
| `messages` | `JSONB` | NOT NULL, DEFAULT '[]' | Array pesan (lihat struktur di bawah) |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | Diupdate setiap ada pesan baru |

#### Struktur `messages` (JSONB)
```json
[
  {
    "role": "user",
    "content": "Anak saya susah makan, apa yang harus dilakukan?",
    "timestamp": "2025-07-24T10:00:00Z"
  },
  {
    "role": "assistant",
    "content": "Berdasarkan kondisi Andi...",
    "timestamp": "2025-07-24T10:00:05Z"
  }
]
```

---

### `refresh_tokens`
| Kolom | Tipe | Constraint | Keterangan |
|-------|------|-----------|------------|
| `id` | `VARCHAR(30)` | PK | CUID |
| `user_id` | `VARCHAR(30)` | FK → users.id, NOT NULL | — |
| `token_hash` | `VARCHAR(255)` | UNIQUE, NOT NULL | Hash dari refresh token |
| `expires_at` | `TIMESTAMPTZ` | NOT NULL | Expiry 7 hari dari issued |
| `revoked` | `BOOLEAN` | NOT NULL, DEFAULT false | Revoke saat logout / refresh |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT now() | — |

---

## Enum Types

```sql
CREATE TYPE role_enum AS ENUM ('PARENT', 'MEDIC', 'ADMIN');

CREATE TYPE gender_enum AS ENUM ('MALE', 'FEMALE');

CREATE TYPE stunt_status_enum AS ENUM (
  'NORMAL',
  'AT_RISK',
  'STUNTED',
  'SEVERELY_STUNTED'
);

CREATE TYPE prediction_status_enum AS ENUM (
  'PENDING',    -- Menunggu proses Gemini
  'COMPLETED',  -- Prediksi berhasil
  'FAILED'      -- Gemini gagal setelah retry
);
```

---

## Indexes

```sql
-- Lookup anak berdasarkan user (paling sering dipakai)
CREATE INDEX idx_children_user_id ON children(user_id);

-- Lookup assessment berdasarkan anak
CREATE INDEX idx_assessments_child_id ON assessments(child_id);

-- Lookup nutrition log berdasarkan anak
CREATE INDEX idx_nutrition_logs_child_id ON nutrition_logs(child_id);

-- Lookup prediksi dengan status PENDING (untuk retry job)
CREATE INDEX idx_predictions_status ON predictions(prediction_status)
  WHERE prediction_status = 'PENDING';

-- Refresh token lookup
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
```

---

## Catatan Penting

1. **Tidak ada soft delete** — data anak dan assessment tidak pernah dihapus, hanya user yang bisa di-deactivate (`is_active = false`)
2. **Assessment immutable** — setelah insert tidak bisa diupdate. Koreksi dilakukan dengan assessment baru
3. **Foto tidak disimpan di DB** — hanya URL string dari Supabase Storage
4. **JSONB untuk raw Gemini** — kolom `gemini_raw` menyimpan response mentah Gemini untuk keperluan debugging dan audit
5. **CUID sebagai primary key** — lebih aman dari sequential integer untuk eksposur di API
