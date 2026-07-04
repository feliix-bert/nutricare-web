# ERD.md — Tumbuh Sehat (GiziChain)

**Update:** 2026-07-02 — Adaptasi dari Java JPA entities → Supabase PostgreSQL.

---

## Diagram Relasi Entitas

```
┌──────────────────────────────────────────────────────────────────┐
│                       auth.users (Supabase built-in)            │
│  id (UUID)  │  email  │  encrypted_password  │  raw_user_meta   │
│  created_at  │  updated_at  │  last_sign_in_at                  │
└──────────────────────────────┬───────────────────────────────────┘
                               │ 1
                               │
                               │ has one (trigger on signup)
                               │
                    ┌──────────▼──────────────────────────────┐
                    │           public.users                    │
                    │  id (UUID, FK → auth.users.id)           │
                    │  name (TEXT)                             │
                    │  role (role_enum) → DEFAULT 'PARENT'     │
                    │  wallet_address (TEXT, NULLABLE)         │
                    │  is_active (BOOLEAN) → DEFAULT true      │
                    │  created_at (TIMESTAMPTZ)                │
                    │  updated_at (TIMESTAMPTZ)                │
                    └──────────────────┬───────────────────────┘
                                       │ 1
                                       │
                                       │ has many
                                       │ N
                             ┌─────────▼─────────────┐
                             │       children         │
                             │  id (UUID, PK)         │
                             │  user_id (FK → users)  │
                             │  name (TEXT)           │
                             │  birth_date (DATE)     │
                             │  gender (gender_enum)  │
                             │  anon_id (TEXT, UNIQUE)│
                             │  created_at            │
                             │  updated_at            │
                             └──┬─────────────────┬───┘
                                │                 │
                       has many │                 │ has many
                                │                 │
                        ┌───────▼──────┐  ┌───────▼───────────────┐
                        │ assessments  │  │   nutrition_logs      │
                        │  id (UUID)   │  │  id (UUID)            │
                        │  child_id(FK)│  │  child_id (FK)        │
                        │  weight      │  │  photo_url (TEXT)     │
                        │  height      │  │  food_detected (TEXT[])│
                        │  head_circ   │  │  portion_estimate     │
                        │  bf_exclusive│  │  calories, protein    │
                        │  mpasi_age   │  │  carbs, fat, fiber    │
                        │  meal_freq   │  │  adequacy_note        │
                        │  illness_hist│  │  mpasi_recommendation │
                        │  created_at  │  │  gemini_raw (JSONB)   │
                        └───────┬──────┘  │  created_at           │
                                │         └───────────────────────┘
                       has one  │
                                │
                        ┌───────▼──────────┐
                        │   predictions    │
                        │  id (UUID)       │
                        │  assessment_id   │
                        │    (FK, UNIQUE)  │
                        │  stunt_status    │
                        │  prediction_status│
                        │  zscore_wa       │
                        │  zscore_ha       │
                        │  zscore_wh       │
                        │  risk_level      │
                        │  summary         │
                        │  recommendations │
                        │  next_assessment │
                        │  gemini_raw      │
                        │  created_at      │
                        │  updated_at      │
                        └───────┬──────────┘
                                │
                       has many │
                                │
                        ┌───────▼─────────────┐
                        │   chat_sessions     │
                        │  id (UUID)          │
                        │  prediction_id (FK) │
                        │  messages (JSONB)   │
                        │  updated_at         │
                        └─────────────────────┘

          ┌──────────────────────────────────┐
          │     blockchain_anchors           │
          │  id (UUID)                       │
          │  assessment_id (FK, UNIQUE)      │
          │  record_hash (TEXT)              │
          │  tx_hash (TEXT)                  │
          │  block_number (INTEGER)          │
          │  contract_address (TEXT)         │
          │  anchor_status (anchor_enum)     │
          │  anchored_at                     │
          └──────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│           verifiable_credentials                 │
│  id (UUID)                                       │
│  child_id (FK)                                   │
│  issuer_id (FK → users.id, FK)                   │
│  vc_type (vc_type_enum)                          │
│  ipfs_cid (TEXT)                                 │
│  tx_hash (TEXT)                                  │
│  is_revoked (BOOLEAN, DEFAULT false)              │
│  revoke_tx_hash (TEXT, NULLABLE)                 │
│  expires_at (TIMESTAMPTZ, NULLABLE)              │
│  wallet_address (TEXT)                           │
│  created_at (TIMESTAMPTZ)                        │
└──────────────────────────────────────────────────┘
```

---

## Perubahan dari ERD Java (JPA)

| Aspek | JPA Entities | Supabase PostgreSQL |
|-------|-------------|-------------------|
| **Primary Key** | CUID (VARCHAR(30)) | UUID (built-in Postgres) |
| **Users table** | `public.users` (manual) | `auth.users` (built-in) + `public.users` (profile) |
| **Password** | `password_hash` BCrypt | `encrypted_password` di `auth.users` |
| **Auto increment** | Tidak ada (CUID) | `gen_random_uuid()` default |
| **Enums** | Java enum class | SQL `CREATE TYPE ... AS ENUM` |
| **Migration** | `ddl-auto=update` | Supabase Migration SQL |
| **Indexes** | JPA `@Index` | `CREATE INDEX` |

---

## Detail Tabel

### `auth.users` — Supabase Built-in

Tabel ini dikelola otomatis oleh Supabase Auth. Tidak boleh di-insert/diupdate langsung.

| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| `id` | `UUID` | PK, auto-generated |
| `email` | `TEXT` | UNIQUE, NOT NULL |
| `encrypted_password` | `TEXT` | NOT NULL — auto-hash oleh Supabase |
| `raw_user_meta_data` | `JSONB` | Berisi `{ name: "..." }` dari signUp options |
| `created_at` | `TIMESTAMPTZ` | — |
| `updated_at` | `TIMESTAMPTZ` | — |
| `last_sign_in_at` | `TIMESTAMPTZ` | — |

**Integrasi dengan public.users:**
```sql
-- Trigger: Setiap signup, auto-copy ke public.users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, role, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    'PARENT',
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

### `public.users`

| Kolom | Tipe | Default | Keterangan |
|-------|------|---------|------------|
| `id` | `UUID` | — | PK, FK → `auth.users.id` (NOT NULL) |
| `name` | `TEXT` | — | Nama lengkap |
| `role` | `role_enum` | `'PARENT'` | PARENT, MEDIC, POSYANDU, ADMIN |
| `wallet_address` | `TEXT` | `NULL` | Polygon address — untuk MEDIC sign VC |
| `is_active` | `BOOLEAN` | `true` | Soft disable oleh ADMIN |
| `created_at` | `TIMESTAMPTZ` | `now()` | — |
| `updated_at` | `TIMESTAMPTZ` | `now()` | — |

---

### `children`

| Kolom | Tipe | Default | Keterangan |
|-------|------|---------|------------|
| `id` | `UUID` | `gen_random_uuid()` | PK |
| `user_id` | `UUID` | — | FK → `users.id`, NOT NULL |
| `name` | `TEXT` | — | Nama anak |
| `birth_date` | `DATE` | — | Tanggal lahir |
| `gender` | `gender_enum` | — | MALE / FEMALE |
| `anon_id` | `TEXT` | — | UNIQUE, NOT NULL — ID publik, pake `nanoid()` |
| `created_at` | `TIMESTAMPTZ` | `now()` | — |
| `updated_at` | `TIMESTAMPTZ` | `now()` | — |

---

### `assessments`

| Kolom | Tipe | Default | Keterangan |
|-------|------|---------|------------|
| `id` | `UUID` | `gen_random_uuid()` | PK |
| `child_id` | `UUID` | — | FK → `children.id`, NOT NULL |
| `weight` | `NUMERIC(5,2)` | — | kg |
| `height` | `NUMERIC(5,2)` | — | cm |
| `head_circumference` | `NUMERIC(4,1)` | `NULL` | cm |
| `bf_exclusive` | `BOOLEAN` | — | ASI eksklusif |
| `mpasi_age` | `SMALLINT` | `NULL` | Usia mulai MPASI (bulan) |
| `meal_freq` | `SMALLINT` | — | Frekuensi makan/hari |
| `illness_history` | `TEXT` | `NULL` | Riwayat penyakit |
| `created_at` | `TIMESTAMPTZ` | `now()` | Immutable |

> Assessment **append-only**. Tidak ada kolom `updated_at`.

---

### `predictions`

| Kolom | Tipe | Default | Keterangan |
|-------|------|---------|------------|
| `id` | `UUID` | `gen_random_uuid()` | PK |
| `assessment_id` | `UUID` | — | FK → `assessments.id`, UNIQUE |
| `stunt_status` | `stunt_enum` | — | NORMAL / AT_RISK / STUNTED / SEVERELY_STUNTED |
| `prediction_status` | `pred_status_enum` | `'PENDING'` | PENDING / COMPLETED / FAILED |
| `zscore_wa` | `NUMERIC(5,2)` | `NULL` | BB/U |
| `zscore_ha` | `NUMERIC(5,2)` | `NULL` | TB/U |
| `zscore_wh` | `NUMERIC(5,2)` | `NULL` | BB/TB |
| `risk_level` | `SMALLINT` | `NULL` | 1–4 |
| `summary` | `TEXT` | `NULL` | Dari Gemini |
| `recommendations` | `TEXT[]` | `NULL` | Array rekomendasi |
| `next_assessment_date` | `DATE` | `NULL` | — |
| `gemini_raw` | `JSONB` | `NULL` | Raw response Gemini |
| `created_at` | `TIMESTAMPTZ` | `now()` | — |
| `updated_at` | `TIMESTAMPTZ` | `now()` | Diupdate saat prediksi selesai |

---

### `nutrition_logs`

| Kolom | Tipe | Default | Keterangan |
|-------|------|---------|------------|
| `id` | `UUID` | `gen_random_uuid()` | PK |
| `child_id` | `UUID` | — | FK → `children.id` |
| `photo_url` | `TEXT` | — | Public URL Supabase Storage |
| `food_detected` | `TEXT[]` | `NULL` | Daftar makanan |
| `portion_estimate` | `TEXT` | `NULL` | — |
| `calories` | `NUMERIC(6,1)` | `NULL` | kkal |
| `protein` | `NUMERIC(5,1)` | `NULL` | gram |
| `carbs` | `NUMERIC(5,1)` | `NULL` | gram |
| `fat` | `NUMERIC(5,1)` | `NULL` | gram |
| `fiber` | `NUMERIC(5,1)` | `NULL` | gram |
| `adequacy_note` | `TEXT` | `NULL` | — |
| `mpasi_recommendation` | `TEXT` | `NULL` | — |
| `gemini_raw` | `JSONB` | `NULL` | — |
| `created_at` | `TIMESTAMPTZ` | `now()` | — |

---

### `chat_sessions`

| Kolom | Tipe | Default | Keterangan |
|-------|------|---------|------------|
| `id` | `UUID` | `gen_random_uuid()` | PK |
| `prediction_id` | `UUID` | — | FK → `predictions.id`, UNIQUE |
| `messages` | `JSONB` | `'[]'` | Array pesan |
| `created_at` | `TIMESTAMPTZ` | `now()` | — |
| `updated_at` | `TIMESTAMPTZ` | `now()` | Diupdate setiap pesan baru |

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

### `blockchain_anchors`

| Kolom | Tipe | Default | Keterangan |
|-------|------|---------|------------|
| `id` | `UUID` | `gen_random_uuid()` | PK |
| `assessment_id` | `UUID` | — | FK → `assessments.id`, UNIQUE |
| `record_hash` | `TEXT` | — | SHA-256 hash data assessment |
| `tx_hash` | `TEXT` | `NULL` | Transaction hash Polygon |
| `block_number` | `INTEGER` | `NULL` | Block number |
| `contract_address` | `TEXT` | — | Address GiziChainRegistry |
| `anchor_status` | `anchor_enum` | `'PENDING'` | PENDING / CONFIRMED / FAILED |
| `anchored_at` | `TIMESTAMPTZ` | `now()` | — |

---

### `verifiable_credentials`

| Kolom | Tipe | Default | Keterangan |
|-------|------|---------|------------|
| `id` | `UUID` | `gen_random_uuid()` | PK |
| `child_id` | `UUID` | — | FK → `children.id` |
| `issuer_id` | `UUID` | — | FK → `users.id` |
| `vc_type` | `vc_type_enum` | — | IMMUNIZATION_COMPLETE / NUTRITION_STATUS / GROWTH_MILESTONE |
| `ipfs_cid` | `TEXT` | — | CID di IPFS via Pinata |
| `tx_hash` | `TEXT` | — | TX ID di VCRegistry contract |
| `is_revoked` | `BOOLEAN` | `false` | — |
| `revoke_tx_hash` | `TEXT` | `NULL` | — |
| `expires_at` | `TIMESTAMPTZ` | `NULL` | — |
| `created_at` | `TIMESTAMPTZ` | `now()` | — |

---

## Enum Types

```sql
CREATE TYPE role_enum AS ENUM ('PARENT', 'MEDIC', 'POSYANDU', 'ADMIN');
CREATE TYPE gender_enum AS ENUM ('MALE', 'FEMALE');
CREATE TYPE stunt_enum AS ENUM ('NORMAL', 'AT_RISK', 'STUNTED', 'SEVERELY_STUNTED');
CREATE TYPE pred_status_enum AS ENUM ('PENDING', 'COMPLETED', 'FAILED');
CREATE TYPE anchor_enum AS ENUM ('PENDING', 'CONFIRMED', 'FAILED');
CREATE TYPE vc_type_enum AS ENUM ('IMMUNIZATION_COMPLETE', 'NUTRITION_STATUS', 'GROWTH_MILESTONE');
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

-- Blockchain anchor PENDING
CREATE INDEX idx_blockchain_anchors_status ON blockchain_anchors(anchor_status)
  WHERE anchor_status = 'PENDING';

-- VC per anak
CREATE INDEX idx_verifiable_credentials_child_id ON verifiable_credentials(child_id);
```

---

## Perubahan Signifikan dari ERD Java

| Perubahan | Java (JPA) | Supabase |
|-----------|-----------|----------|
| **ID type** | CUID (`VARCHAR(30)`) | UUID (`gen_random_uuid()`) |
| **Users** | 1 tabel (`public.users` + password) | 2 tabel: `auth.users` (otomatis) + `public.users` (profile) |
| **Anon ID** | CUID manual di Java | `nanoid()` via pgcrypto extension |
| **FK constraint** | JPA `@ManyToOne` + `@JoinColumn` | SQL `REFERENCES ... ON DELETE CASCADE` |
| **Timestamps** | `@CreatedDate`, `@LastModifiedDate` | `DEFAULT now()` + trigger update |
| **Password** | BCrypt manual | Otomatis — jangan sentuh |
| **Role default** | Default di Java | DEFAULT 'PARENT' di SQL |

---

## Catatan Penting

1. **RLS (Row Level Security)** diaktifkan di semua tabel `public.*` — bukan di Java code
2. **Foto tidak disimpan di DB** — hanya URL string dari Supabase Storage
3. **Assessment immutable** — setelah insert tidak bisa diupdate
4. **JSONB untuk raw Gemini** — menyimpan response mentah untuk debugging
5. **UUID sebagai primary key** — bukan CUID. `gen_random_uuid()` built-in Postgres
