package com.nutricare.dto.response.nutrition;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Response setelah foto makanan dianalisis Gemini Vision.
 */
@Data
@Builder
public class NutritionResponse {
    private String id;
    private String childId;
    private String photoUrl;

    // Hasil Gemini Vision
    private List<String> foodDetected;
    private String portionEstimate;
    private BigDecimal calories;
    private BigDecimal protein;
    private BigDecimal carbs;
    private BigDecimal fat;
    private BigDecimal fiber;
    private String adequacyNote;
    private String mpasiRecommendation;

    private OffsetDateTime createdAt;
}
