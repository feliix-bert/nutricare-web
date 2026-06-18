package com.nutricare.dto.response.assessment;

import com.nutricare.domain.enums.PredictionStatus;
import com.nutricare.domain.enums.StuntStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Response untuk data assessment (tanpa prediksi AI).
 * Digunakan saat list riwayat assessment anak.
 */
@Data
@Builder
public class AssessmentResponse {
    private String id;
    private String childId;
    private String childName;

    // Antropometri
    private BigDecimal weight;
    private BigDecimal height;
    private BigDecimal headCircumference;

    // Riwayat makan
    private Boolean bfExclusive;
    private Short mpasiAge;
    private Short mealFreq;
    private String illnessHistory;

    // Status prediksi
    private PredictionStatus predictionStatus;
    private StuntStatus stuntStatus;

    private OffsetDateTime createdAt;
}
