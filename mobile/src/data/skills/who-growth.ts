export const WHO_GROWTH = `# Interpretasi Z-score WHO 2006

## Klasifikasi Status Gizi Anak 0-60 Bulan

### Tinggi Badan / Panjang Badan menurut Umur (TB/U atau PB/U)
Indikator stunting (gangguan pertumbuhan kronis).

| Status | Z-score | Interpretasi Klinis |
|--------|---------|---------------------|
| NORMAL | ≥ -2 SD | Pertumbuhan linear normal |
| AT_RISK (Berisiko Stunting) | -2 SD hingga -2.5 SD | Perlu pemantauan ketat, intervensi dini |
| STUNTED (Stunting) | < -2 SD | Gangguan pertumbuhan kronis, butuh intervensi |
| SEVERELY STUNTED | < -3 SD | Gangguan berat, butuh rujukan segera |

### Berat Badan menurut Umur (BB/U)
Indikator gizi kurang (underweight) — gabungan akut dan kronis.

| Status | Z-score |
|--------|---------|
| Gizi Baik | ≥ -2 SD |
| Gizi Kurang (Underweight) | < -2 SD |
| Gizi Buruk (Severely Underweight) | < -3 SD |

### Berat Badan menurut Tinggi Badan (BB/TB)
Indikator wasting (gizi akut).

| Status | Z-score |
|--------|---------|
| Normal | ≥ -2 SD |
| Wasting (Gizi Akut) | < -2 SD |
| Severe Wasting | < -3 SD |

### Berat Badan menurut Panjang Badan (BB/PB) — untuk anak 0-24 bulan
Sama dengan BB/TB, menggunakan panjang badan (rebah) bukan tinggi badan (berdiri).

### Indeks Massa Tubuh menurut Umur (IMT/U)
Untuk skrining obesitas pada anak > 24 bulan.

| Status | Z-score |
|--------|---------|
| Normal | -2 SD hingga +1 SD |
| Risiko Gizi Lebih | +1 SD hingga +2 SD |
| Gizi Lebih (Overweight) | +2 SD hingga +3 SD |
| Obesitas | > +3 SD |

## Definisi Operasional
- **Stunting (TB/U)**: anak dengan z-score < -2 SD. Mencerminkan kekurangan gizi kronis akibat asupan gizi yang tidak adekuat dalam waktu lama, infeksi berulang, atau keduanya.
- **Wasting (BB/TB)**: anak dengan z-score < -2 SD. Mencerminkan kekurangan gizi akut (penurunan berat badan drastis).
- **Underweight (BB/U)**: anak dengan z-score < -2 SD. Indikator kombinasi stunting dan wasting.

## Interpretasi Klinis Stunting
- Stunting adalah indikator kekurangan gizi **kronis**
- Tidak bisa dikoreksi dalam waktu singkat
- Dampak: gangguan perkembangan kognitif, penurunan produktivitas di masa dewasa
- Periode kritis intervensi: 0-24 bulan (1000 HPK / Hari Pertama Kehidupan)
- Setelah 24 bulan, perbaikan linear growth sangat terbatas

## Aturan Penting untuk Konsultan AI
1. Gunakan istilah "berisiko" bukan "menderita" untuk AT_RISK
2. Jangan pernah memberikan diagnosis definitif — hanya interpretasi skrining
3. Selalu sarankan konfirmasi ke tenaga kesehatan untuk hasil < -2 SD
4. Stunting dan wasting adalah kondisi berbeda dengan penanganan berbeda
5. Faktor sosial ekonomi dan lingkungan berkontribusi signifikan
`;
