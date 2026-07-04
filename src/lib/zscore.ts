// ============================================================================
// Z-Score Calculator — WHO Child Growth Standards (2006)
// ============================================================================
// Port dari Java: com.nutricare.util.ZScoreCalculator
//
// Z-Score = (Nilai Anak - Median WHO) / SD WHO
//
// CATATAN: Implementasi ini pakai linear approximation (sama persis dgn Java).
// Untuk akurasi klinis penuh, ganti dgn tabel WHO reference actual:
// https://www.who.int/tools/child-growth-standards
//
// Indikator:
// - TB/U (Height-for-Age)   → indikator UTAMA stunting
// - BB/U (Weight-for-Age)   → indikator underweight
// - BB/TB (Weight-for-Height) → indikator wasting/overweight
// ============================================================================

import type { Gender, StuntStatus } from "@/features/children/types/child.types";

// ─── Tipe ─────────────────────────────────────────────────────────────────────

export type ZScoreResult = {
  /** Z-Score TB/U — indicator utama stunting */
  zscoreHa: number;
  /** Z-Score BB/U — underweight indicator */
  zscoreWa: number;
  /** Z-Score BB/TB — wasting/overweight indicator */
  zscoreWh: number;
  /** Status stunting dari classifyStunting(zscoreHa) */
  stuntStatus: StuntStatus;
  /** Risk level 1-4 untuk UI */
  riskLevel: RiskLevel;
};

export type RiskLevel = 1 | 2 | 3 | 4;

// ─── Kalkulasi Z-Score ────────────────────────────────────────────────────────

/**
 * Hitung Z-Score Tinggi/Usia (TB/U) — indikator utama stunting.
 *
 * Interpretasi:
 *  ≥ -2.0 SD → NORMAL
 *  [-2.5, -2.0) → AT_RISK
 *  [-3.0, -2.5) → STUNTED
 *  < -3.0 SD → SEVERELY_STUNTED
 */
export function calculateZScoreHA(
  heightCm: number,
  ageMonths: number,
  gender: Gender,
): number {
  const [median, sd] = getHeightForAgeParams(ageMonths, gender);
  return roundZScore((heightCm - median) / sd);
}

/**
 * Hitung Z-Score Berat/Usia (BB/U).
 */
export function calculateZScoreWA(
  weightKg: number,
  ageMonths: number,
  gender: Gender,
): number {
  const [median, sd] = getWeightForAgeParams(ageMonths, gender);
  return roundZScore((weightKg - median) / sd);
}

/**
 * Hitung Z-Score Berat/Tinggi (BB/TB).
 */
export function calculateZScoreWH(
  weightKg: number,
  heightCm: number,
  gender: Gender,
): number {
  const [median, sd] = getWeightForHeightParams(heightCm, gender);
  return roundZScore((weightKg - median) / sd);
}

/**
 * Hitung semua Z-Score sekaligus.
 */
export function calculateAllZScores(
  weightKg: number,
  heightCm: number,
  ageMonths: number,
  gender: Gender,
): Pick<ZScoreResult, "zscoreHa" | "zscoreWa" | "zscoreWh"> {
  return {
    zscoreHa: calculateZScoreHA(heightCm, ageMonths, gender),
    zscoreWa: calculateZScoreWA(weightKg, ageMonths, gender),
    zscoreWh: calculateZScoreWH(weightKg, heightCm, gender),
  };
}

// ─── Klasifikasi ──────────────────────────────────────────────────────────────

/**
 * Tentukan status stunting berdasarkan Z-Score TB/U.
 *
 * Threshold persis sama dgn Java original:
 *  < -3.0   → SEVERELY_STUNTED
 *  [-3.0, -2.5) → STUNTED
 *  [-2.5, -2.0) → AT_RISK
 *  >= -2.0  → NORMAL
 */
export function classifyStunting(zscoreHa: number): StuntStatus {
  if (zscoreHa < -3.0) return "SEVERELY_STUNTED";
  if (zscoreHa < -2.5) return "STUNTED";
  if (zscoreHa < -2.0) return "AT_RISK";
  return "NORMAL";
}

/**
 * Tentukan risk level (1-4) untuk UI.
 */
export function determineRiskLevel(stuntStatus: StuntStatus): RiskLevel {
  switch (stuntStatus) {
    case "NORMAL":
      return 1;
    case "AT_RISK":
      return 2;
    case "STUNTED":
      return 3;
    case "SEVERELY_STUNTED":
      return 4;
  }
}

// ─── Helper ────────────────────────────────────────────────────────────────────

function roundZScore(value: number): number {
  return Math.round(value * 100) / 100;
}

// ─── Parameter WHO (disederhanakan — linear approximation) ──────────────────
// Nilai approx berdasarkan tabel WHO 2006.
// Format return: [median, SD]

function getHeightForAgeParams(
  ageMonths: number,
  gender: Gender,
): [number, number] {
  if (gender === "MALE") {
    return [49.9 + ageMonths * 1.73, 1.9 + ageMonths * 0.03];
  }
  return [49.1 + ageMonths * 1.7, 1.9 + ageMonths * 0.03];
}

function getWeightForAgeParams(
  ageMonths: number,
  gender: Gender,
): [number, number] {
  if (gender === "MALE") {
    return [3.3 + ageMonths * 0.27, 0.45 + ageMonths * 0.015];
  }
  return [3.2 + ageMonths * 0.25, 0.43 + ageMonths * 0.015];
}

function getWeightForHeightParams(
  heightCm: number,
  gender: Gender,
): [number, number] {
  if (gender === "MALE") {
    return [(heightCm - 49.9) * 0.185 + 3.3, 0.5];
  }
  return [(heightCm - 49.1) * 0.175 + 3.2, 0.48];
}
