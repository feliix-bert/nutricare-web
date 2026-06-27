package com.nutricare.dto.response.admin;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

/**
 * Response DTO untuk statistik agregat di AdminController.
 */
@Data
@Builder
public class AdminStatsResponse {
    private long totalUsers;
    private long totalChildren;
    private long totalAssessments;
    private Map<String, Long> distribution;
    private double percentageStunted;
}
