# Panduan AI — UI NutriCare (Mobile-First Web)

Dokumen ini adalah **sumber kebenaran** bagi AI agent saat membuat atau mengubah UI di folder `desktop/`. Ikuti panduan ini agar tampilan selaras dengan referensi desain (pastel bento, friendly, clean).

> **PENTING: Mobile-first.** Desain dan markup harus dioptimalkan untuk layar ponsel terlebih dahulu. Breakpoint `md:` / `lg:` hanya menambah atau mengatur ulang layout untuk tablet/desktop — bukan sebaliknya.

---

## 1. Prinsip Utama

| Prinsip | Arti | Larangan |
|--------|------|----------|
| **Mobile-first** | Base CSS tanpa prefix = tampilan ponsel; `md:`/`lg:` = enhancement desktop | Jangan menulis layout desktop lalu `max-md:` untuk mobile |
| **Bento / modular** | Informasi dalam kartu terpisah, radius besar, mudah di-scan | Jangan halaman panjang tanpa hierarki visual |
| **Friendly & accessible** | Font cukup besar, kontras cukup, bahasa sederhana | Font < 12px untuk teks penting; hindari hitam pekat `#000` |
| **Soft pastel** | Warna tenang, sehat, ramah semua usia | Jangan warna neon atau kontras keras |
| **Responsive proporsional** | Di desktop, kartu berdampingan — bukan stretch penuh | Jangan satu kolom sempit di tengah layar lebar |

---

## 2. Palet Warna (CSS Variables)

Gunakan token dari `globals.css`:

```
Background:     --color-background (#fcf9f8)
Surface/Kartu:  --color-surface, --color-surface-lowest
Primary (biru): --color-primary, --color-primary-container
Secondary (hijau): --color-secondary, --color-secondary-container
Tertiary (kuning): --color-tertiary, --color-tertiary-container
Teks:           --color-on-surface, --color-on-surface-variant
Outline:        --color-outline, --color-outline-variant
Danger:         --color-danger
```

**Pemetaan kartu pastel:**
- Progress / kalori → `primary-container`
- Aktivitas / gizi → `secondary-container`
- Highlight / aksi → `tertiary-container`

---

## 3. Tipografi

- **Font:** `Quicksand` (`font-sans`)
- **Mobile (default):**
  - Judul halaman: `text-xl font-bold`
  - Angka metrik: `text-4xl font-extrabold`
  - Label: `text-sm font-semibold text-outline`
  - Isi: `text-base` (min 16px)
- **Desktop enhancement:** `md:text-2xl`, `md:text-5xl`, dll.

---

## 4. Bentuk & Spacing

```
Kartu:           rounded-3xl
Tombol/chip:     rounded-full
Padding mobile:  px-4 py-5, kartu p-5
Padding desktop: md:px-8 md:py-8, md:p-6
Gap:             gap-4 md:gap-6
Shadow:          shadow-sm — tipis
```

---

## 5. Layout Mobile-First

### Mobile (default, < md)

```
┌─────────────────────────┐
│  Header / greeting      │
│  Child pills (scroll →) │
│  ┌───────────────────┐  │
│  │  Kartu progress   │  │
│  └───────────────────┘  │
│  ┌─────────┬─────────┐  │
│  │ Metric  │ Metric  │  │  ← bisa 2 kolom kecil
│  └─────────┴─────────┘  │
│  ┌───────────────────┐  │
│  │  Nutrisi          │  │
│  └───────────────────┘  │
│  [ Bottom Tab Bar ]     │
└─────────────────────────┘
```

- **Navigasi:** `BottomTabBar` — fixed bawah, `pb-24` pada konten utama
- **Satu kolom** untuk kartu besar; metric cards boleh `grid-cols-2`
- **Horizontal scroll** untuk pill selector (anak, prompt cepat)
- **Touch target** minimal 44×44px

### Desktop (md / lg enhancement)

```
┌──────────┬──────────────────────────────────┐
│ Sidebar  │  PageShell — grid multi-kolom    │
│ md:flex  │  grid-cols-1 lg:grid-cols-12     │
└──────────┴──────────────────────────────────┘
```

- **Sidebar:** `hidden md:flex` — hanya desktop
- **Bottom tab:** `md:hidden` — hanya mobile
- **Main:** `md:ml-64`
- **Grid:** `grid-cols-1 lg:grid-cols-12` (mobile stack → desktop bento)

### Aturan Tailwind Mobile-First

```tsx
// ✅ Benar
<div className="flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-3">

// ❌ Salah
<div className="grid grid-cols-3 max-md:flex max-md:flex-col">
```

---

## 6. Komponen Wajib

### PageShell

- Base: `px-4 py-5`
- Desktop: `md:px-8 md:py-8`
- Judul mobile: `text-xl`, desktop: `md:text-2xl`

### Avatar (DiceBear)

```tsx
<Avatar seed="Ibu Ani" variant="parent" size="md" />
```

| Variant | Style | Konteks |
|---------|-------|---------|
| `parent` | `lorelei.json` | Orang tua |
| `child` | `big-smile.json` | Anak |
| `ai` | `bottts.json` | Konsultan AI |
| `food` | `shapes.json` | Makanan |

Wajib: `@dicebear/core` + `@dicebear/styles`. Tanpa URL eksternal untuk profil.

### Ikon Animasi (`src/components/icons/*`)

Lucide-animated pattern + Motion untuk: navigasi, search, bell, plus, scan, send, utensils.

### Brand Logo (`src/components/brand/BrandLogo.tsx`)

Wajib pakai `/public/logo.png` — jangan emoji atau huruf "G" sebagai brand mark.

| Size | Pemakaian |
|------|-----------|
| `hero` | Intro page |
| `lg` | Auth panel |
| `sidebar` | SideNavBar desktop |
| `sm` | Auth mobile header |
| `splash` | Loading ringkas |

```tsx
<BrandLogo size="sidebar" href="/" priority />
```

### Intro Page (`src/components/brand/IntroPage.tsx`)

Referensi: Wellspace/Wellnest — pastel orbs, logo reveal, motion halus, progress bar.

- Tampil sekali per session di beranda (`useSessionIntro`)
- `SplashScreen` memakai variant `minimal` + `autoDismiss={false}`
- Logo di kartu glassmorphism, tagline + feature pills interaktif
- Ketuk untuk skip

---

## 7. Pola Halaman

### Beranda
- Mobile: stack vertikal — progress → metrics 2-col → nutrisi
- Desktop: `lg:grid-cols-12` bento

### Log Gizi
- Mobile: ringkasan → riwayat → aksi scan
- Desktop: `lg:col-span-8` + sidebar `lg:col-span-4`

### Konsultasi
- Mobile: chat full-width, quick prompts horizontal scroll
- Desktop: chat + panel saran `hidden lg:flex`

### Auth
- Mobile: form centered full-width
- Desktop: `lg:grid-cols-2` split branding + form

---

## 8. Checklist

- [ ] Base styles = mobile; `md:`/`lg:` = desktop enhancement
- [ ] Bottom tab di mobile, sidebar di desktop (tidak keduanya bersamaan)
- [ ] Konten utama `pb-24 md:pb-0`
- [ ] Avatar DiceBear, bukan URL eksternal
- [ ] Font Quicksand, teks penting ≥ 14px
- [ ] Ikon interaktif pakai lucide-animated
- [ ] Hanya edit file di folder `desktop/`

---

## 9. Referensi Visual

Lihat `UI_GUIDE.md` dan screenshot referensi. Adaptasi: MPASI, tumbuh kembang, konsultasi gizi AI.
