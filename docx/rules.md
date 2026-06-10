# Aturan Pengembangan Desktop Web (Next.js)

Dokumen ini mendefinisikan aturan dan standar pengembangan untuk aplikasi web (folder `desktop`), yang diadaptasi dari aturan dan arsitektur aplikasi mobile.

---

## 1. Arsitektur & Struktur Folder
Arsitektur web harus konsisten dengan arsitektur mobile untuk memudahkan sinkronisasi:
- **`src/app/`**: App Router Next.js untuk definisi rute dan halaman (`page.tsx`, `layout.tsx`).
- **`src/features/`**: Folder modular berbasis domain/fitur (contoh: `auth`, `children`, `assessment`, `nutrition`, `consult`). Setiap folder fitur berisi `components/`, `hooks/`, `services/`, dan `types/` spesifik fitur tersebut.
- **`src/components/ui/`**: Komponen UI reusable global (contoh: `Button`, `Card`, `InputField`, `StatusBadge`).
- **`src/stores/`**: Global state management menggunakan Zustand.
- **`src/services/`**: Layanan API global dan file mock (`api.ts`, `mock.ts`).

---

## 2. Standar Migrasi Mobile ke Web (Next.js)
Saat melakukan porting fitur dari mobile ke web, patuhi konvensi berikut:

### 2.1. Routing
- Ganti `expo-router` dengan `next/navigation`.
- `router.push('/path')` menggunakan `useRouter()` dari `next/navigation`.
- Akses parameter path (contoh: `[childId]`) menggunakan `useParams()`.
- Akses query string menggunakan `useSearchParams()`.

### 2.2. Komponen UI
- Ganti komponen React Native (`View`, `Text`, `Pressable`, `ScrollView`, `SafeAreaView`) dengan elemen HTML semantik (`div`, `span`, `p`, `button`, `main`, `section`).
- Ganti `Image` dari `expo-image` dengan `next/image` (`<Image />`).
- Ganti input teks dengan `<input type="text" />` atau komponen `<InputField />` kustom.
- Hindari komponen khusus mobile seperti `KeyboardAvoidingView` atau `FlashList`. Gunakan CSS overflow dan div biasa untuk web.

### 2.3. Styling (Tailwind CSS)
- Web menggunakan Tailwind CSS v4.
- Token warna utama GiziChain harus digunakan secara seragam: `primary` (#3e646a), `secondary` (#506444), `tertiary` (#64601e).
- Pastikan utilitas Flexbox standar web digunakan dengan benar (misal: `flex flex-col` sebagai pengganti bawaan `flexDirection: 'column'` di RN).

### 2.4. Ikon
- Ganti `IconSymbol` atau `@expo/vector-icons` dengan pustaka **`lucide-react`**.

### 2.5. Storage & Persistensi
- Ganti `expo-secure-store` dengan `localStorage` (hanya dijalankan di sisi klien/browser).

---

## 3. Best Practices Kinerja (Diadopsi dari Mobile)

### 3.1. Zustand Selectors
Gunakan selector spesifik saat mengambil state dari Zustand untuk mencegah re-render yang tidak perlu.
```tsx
// ❌ Salah (Re-render jika ada field apapun yang berubah)
const { user, logout } = useAuthStore();

// ✅ Benar (Re-render hanya jika user atau logout berubah)
const user = useAuthStore((s) => s.user);
const logout = useAuthStore((s) => s.logout);
```

### 3.2. Memoization
Bungkus komponen list item atau card yang sering di-render berulang kali menggunakan `React.memo` untuk mencegah re-render jika props tidak berubah.

### 3.3. Uncontrolled Inputs
Untuk form yang panjang atau kompleks, pertimbangkan penggunaan uncontrolled inputs (menggunakan `useRef` atau native form submission) untuk mencegah re-render seluruh halaman pada setiap keystroke, kecuali validasi real-time diperlukan.

---

## 4. Integrasi Hardware (Kamera/Scanner)
Pada aplikasi web, akses native ke kamera (Viewfinder) seperti di mobile tidak tersedia secara langsung dengan mudah. Gunakan elemen HTML `<input type="file" accept="image/*" capture="environment" />` untuk memicu interface kamera native bawaan OS dari browser.

---

## 5. Disclaimer Medis
Pastikan komponen `<DisclaimerText />` atau peringatan medis disematkan pada fitur AI dan Assessment untuk mengingatkan bahwa hasil AI bersifat edukatif, bukan diagnosis medis resmi.
