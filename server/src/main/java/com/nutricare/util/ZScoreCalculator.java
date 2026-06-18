package com.nutricare.util;

import com.nutricare.domain.enums.Gender;
import com.nutricare.domain.enums.StuntStatus;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * ZScoreCalculator — BE-301
 *
 * Menghitung Z-Score berdasarkan standar WHO Child Growth Standards (2006).
 * Z-Score = (Nilai Anak - Median WHO) / SD WHO
 *
 * CATATAN PENTING:
 * Implementasi ini menggunakan nilai median & SD yang disederhanakan.
 * Untuk produksi/lomba yang butuh akurasi klinis penuh, ganti dengan
 * tabel WHO lengkap dari: https://www.who.int/tools/child-growth-standards
 *
 * Indikator yang dihitung:
 * - TB/U (Height-for-Age)    → indikator UTAMA stunting
 * - BB/U (Weight-for-Age)    → indikator underweight
 * - BB/TB (Weight-for-Height)→ indikator wasting/overweight
 */
@Component
public class ZScoreCalculator {

    /**
     * Hitung Z-Score Tinggi/Usia (TB/U) — indikator utama stunting.
     *
     * Interpretasi:
     *  ≥ -2.0 SD → NORMAL
     * -2.0 s/d -2.5 SD → AT_RISK
     *  < -2.0 SD → STUNTED
     *  < -3.0 SD → SEVERELY_STUNTED
     */
    public BigDecimal calculateHeightForAge(double heightCm, int ageMonths, Gender gender) {
        double[] params = getHeightForAgeParams(ageMonths, gender);
        double median = params[0];
        double sd     = params[1];
        double zscore = (heightCm - median) / sd;
        return BigDecimal.valueOf(zscore).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Hitung Z-Score Berat/Usia (BB/U).
     */
    public BigDecimal calculateWeightForAge(double weightKg, int ageMonths, Gender gender) {
        double[] params = getWeightForAgeParams(ageMonths, gender);
        double median = params[0];
        double sd     = params[1];
        double zscore = (weightKg - median) / sd;
        return BigDecimal.valueOf(zscore).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Hitung Z-Score Berat/Tinggi (BB/TB).
     */
    public BigDecimal calculateWeightForHeight(double weightKg, double heightCm, Gender gender) {
        double[] params = getWeightForHeightParams(heightCm, gender);
        double median = params[0];
        double sd     = params[1];
        double zscore = (weightKg - median) / sd;
        return BigDecimal.valueOf(zscore).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Tentukan status stunting berdasarkan Z-Score TB/U.
     */
    public StuntStatus determineStuntStatus(BigDecimal zscoreHa) {
        double z = zscoreHa.doubleValue();
        if (z < -3.0)       return StuntStatus.SEVERELY_STUNTED;
        if (z < -2.0)       return StuntStatus.STUNTED;
        if (z < -2.5)       return StuntStatus.AT_RISK; // -2.0 s/d -2.5
        return StuntStatus.NORMAL;
    }

    /**
     * Tentukan risk level (1-4) untuk UI.
     */
    public short determineRiskLevel(StuntStatus status) {
        return switch (status) {
            case NORMAL -> 1;
            case AT_RISK -> 2;
            case STUNTED -> 3;
            case SEVERELY_STUNTED -> 4;
        };
    }

    // ── Parameter WHO (disederhanakan) ────────────────────────────────────────
    // Format: [median, SD]
    // Untuk akurasi penuh, load dari tabel WHO CSV

    private double[] getHeightForAgeParams(int ageMonths, Gender gender) {
        // Nilai approx berdasarkan tabel WHO 2006
        if (gender == Gender.MALE) {
            double median = 49.9 + (ageMonths * 1.73);
            double sd = 1.9 + (ageMonths * 0.03);
            return new double[]{median, sd};
        } else {
            double median = 49.1 + (ageMonths * 1.70);
            double sd = 1.9 + (ageMonths * 0.03);
            return new double[]{median, sd};
        }
    }

    private double[] getWeightForAgeParams(int ageMonths, Gender gender) {
        if (gender == Gender.MALE) {
            double median = 3.3 + (ageMonths * 0.27);
            double sd = 0.45 + (ageMonths * 0.015);
            return new double[]{median, sd};
        } else {
            double median = 3.2 + (ageMonths * 0.25);
            double sd = 0.43 + (ageMonths * 0.015);
            return new double[]{median, sd};
        }
    }

    private double[] getWeightForHeightParams(double heightCm, Gender gender) {
        if (gender == Gender.MALE) {
            double median = (heightCm - 49.9) * 0.185 + 3.3;
            return new double[]{median, 0.5};
        } else {
            double median = (heightCm - 49.1) * 0.175 + 3.2;
            return new double[]{median, 0.48};
        }
    }
}
