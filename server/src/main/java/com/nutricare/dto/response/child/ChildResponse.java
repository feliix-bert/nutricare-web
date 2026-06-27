package com.nutricare.dto.response.child;

import com.nutricare.domain.enums.Gender;
import com.nutricare.domain.enums.StuntStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * Response untuk data anak.
 * Digunakan di list GET /api/children dan detail GET /api/children/{childId}.
 */
@Data
@Builder
public class ChildResponse {
    private String id;
    private String name;
    private Gender gender;
    private LocalDate birthDate;
    private String anonId;
    private int ageMonths;    // dihitung di service
    private OffsetDateTime createdAt;

    // Prediksi terbaru (untuk list card di mobile)
    private LatestPrediction latestPrediction;

    @Data
    @Builder
    public static class LatestPrediction {
        private StuntStatus status;
        private Short riskLevel;
        private OffsetDateTime createdAt;
    }
}
