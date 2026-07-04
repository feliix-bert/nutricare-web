// ============================================================================
// ZScoreCalculator — Unit Tests (port dari Java)
// ============================================================================

import { describe, it, expect } from "vitest";
import {
  calculateZScoreHA,
  calculateZScoreWA,
  calculateZScoreWH,
  classifyStunting,
  determineRiskLevel,
  calculateAllZScores,
} from "@/lib/zscore";

// ─── Height-for-Age (TB/U) ─────────────────────────────────────────────────

describe("calculateZScoreHA", () => {
  it("should return normal for 24mo male 89cm", () => {
    const z = calculateZScoreHA(89.0, 24, "MALE");
    expect(z).toBeGreaterThanOrEqual(-2.0);
    expect(classifyStunting(z)).toBe("NORMAL");
  });

  it("should return stunted for 24mo male 75cm", () => {
    const z = calculateZScoreHA(75.0, 24, "MALE");
    expect(z).toBeLessThan(-2.0);
    expect(classifyStunting(z)).not.toBe("NORMAL");
  });

  it("should return severely stunted for 24mo male 65cm", () => {
    const z = calculateZScoreHA(65.0, 24, "MALE");
    expect(z).toBeLessThan(-3.0);
    expect(classifyStunting(z)).toBe("SEVERELY_STUNTED");
  });

  it("should return value for female", () => {
    const z = calculateZScoreHA(80.0, 18, "FEMALE");
    expect(z).not.toBeNaN();
  });
});

// ─── Weight-for-Age (BB/U) ─────────────────────────────────────────────────

describe("calculateZScoreWA", () => {
  it("should return value for 24mo female 10.5kg", () => {
    const z = calculateZScoreWA(10.5, 24, "FEMALE");
    expect(z).not.toBeNaN();
  });
});

// ─── Weight-for-Height (BB/TB) ─────────────────────────────────────────────

describe("calculateZScoreWH", () => {
  it("should return value for 85cm male 10.5kg", () => {
    const z = calculateZScoreWH(10.5, 85.0, "MALE");
    expect(z).not.toBeNaN();
  });
});

// ─── classifyStunting ───────────────────────────────────────────────────────

describe("classifyStunting", () => {
  it("should return NORMAL for z >= -2.0", () => {
    expect(classifyStunting(-1.5)).toBe("NORMAL");
    expect(classifyStunting(0.0)).toBe("NORMAL");
    expect(classifyStunting(2.0)).toBe("NORMAL");
    expect(classifyStunting(-1.9)).toBe("NORMAL");
    expect(classifyStunting(-2.0)).toBe("NORMAL"); // boundary
  });

  it("should return AT_RISK for z in [-2.5, -2.0)", () => {
    expect(classifyStunting(-2.1)).toBe("AT_RISK");
    expect(classifyStunting(-2.3)).toBe("AT_RISK");
    expect(classifyStunting(-2.5)).toBe("AT_RISK"); // boundary
  });

  it("should return STUNTED for z in [-3.0, -2.5)", () => {
    expect(classifyStunting(-2.6)).toBe("STUNTED");
    expect(classifyStunting(-2.8)).toBe("STUNTED");
    expect(classifyStunting(-2.9)).toBe("STUNTED");
    expect(classifyStunting(-3.0)).toBe("STUNTED"); // boundary
  });

  it("should return SEVERELY_STUNTED for z < -3.0", () => {
    expect(classifyStunting(-3.1)).toBe("SEVERELY_STUNTED");
    expect(classifyStunting(-5.0)).toBe("SEVERELY_STUNTED");
  });
});

// ─── determineRiskLevel ─────────────────────────────────────────────────────

describe("determineRiskLevel", () => {
  it("should map correctly", () => {
    expect(determineRiskLevel("NORMAL")).toBe(1);
    expect(determineRiskLevel("AT_RISK")).toBe(2);
    expect(determineRiskLevel("STUNTED")).toBe(3);
    expect(determineRiskLevel("SEVERELY_STUNTED")).toBe(4);
  });
});

// ─── calculateAllZScores ────────────────────────────────────────────────────

describe("calculateAllZScores", () => {
  it("should return all 3 z-scores", () => {
    const result = calculateAllZScores(10.5, 85.0, 24, "MALE");
    expect(result).toHaveProperty("zscoreHa");
    expect(result).toHaveProperty("zscoreWa");
    expect(result).toHaveProperty("zscoreWh");
    expect(typeof result.zscoreHa).toBe("number");
    expect(typeof result.zscoreWa).toBe("number");
    expect(typeof result.zscoreWh).toBe("number");
  });
});
