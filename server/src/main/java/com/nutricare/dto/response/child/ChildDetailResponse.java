package com.nutricare.dto.response.child;

import com.nutricare.domain.enums.Gender;
import com.nutricare.domain.enums.PredictionStatus;
import com.nutricare.domain.enums.StuntStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * Response detail anak — digunakan di GET /api/children/{childId}.
 * Include riwayat assessment + prediksi.
 */
@Data
@Builder
public class ChildDetailResponse {
    private String id;
    private String name;
    private Gender gender;
    private LocalDate birthDate;
    private String anonId;
    private int ageMonths;
    private OffsetDateTime createdAt;

    // Riwayat assessment
    private java.util.List<AssessmentItem> assessments;

    @Data
    @Builder
    public static class AssessmentItem {
        private String id;
        private BigDecimal weight;
        private BigDecimal height;
        private BigDecimal headCircumference;
        private Boolean bfExclusive;
        private Short mpasiAge;
        private Short mealFreq;
        private String illnessHistory;
        private OffsetDateTime createdAt;

        private PredictionItem prediction;
    }

    @Data
    @Builder
    public static class PredictionItem {
        private String id;
        private StuntStatus status;
        private PredictionStatus predictionStatus;
        private Short riskLevel;
        private BigDecimal zscoreWa;
        private BigDecimal zscoreHa;
        private BigDecimal zscoreWh;
        private String summary;
        private java.util.List<String> recommendations;
        private LocalDate nextAssessmentDate;
        private OffsetDateTime createdAt;
    }
}
