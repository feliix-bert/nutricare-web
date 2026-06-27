package com.nutricare.service.impl;

import com.nutricare.domain.entity.*;
import com.nutricare.domain.enums.PredictionStatus;
import com.nutricare.domain.enums.StuntStatus;
import com.nutricare.dto.request.assessment.AssessmentRequest;
import com.nutricare.dto.response.prediction.PredictionResponse;
import com.nutricare.dto.response.PageResponse;
import com.nutricare.exception.ForbiddenException;
import com.nutricare.exception.ResourceNotFoundException;
import com.nutricare.repository.*;
import com.nutricare.util.CuidGenerator;
import com.nutricare.util.ZScoreCalculator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Period;
import java.util.List;

/**
 * AssessmentService — Phase 3
 * BE-302: POST /api/assessments (simpan + trigger prediksi async)
 * BE-304: GET  /api/assessments/{id}
 * BE-305: GET  /api/assessments/child/{childId}
 * BE-306: Retry job untuk prediksi PENDING
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AssessmentService {

    private final AssessmentRepository assessmentRepository;
    private final PredictionRepository predictionRepository;
    private final ChildRepository childRepository;
    private final BlockchainAnchorRepository blockchainAnchorRepository;
    private final ZScoreCalculator zScoreCalculator;
    private final PredictionService predictionService;

    // ── BE-302: Buat assessment baru ──────────────────────────────────────────

    @Transactional
    public PredictionResponse createAssessment(AssessmentRequest request, String userId) {
        // Verifikasi anak milik user
        Child child = childRepository.findByIdAndUserId(request.getChildId(), userId)
            .orElseThrow(() -> new ForbiddenException("Anak tidak ditemukan atau bukan milik Anda"));

        // Hitung usia anak dalam bulan
        int ageMonths = Period.between(child.getBirthDate(), LocalDate.now()).getYears() * 12
                      + Period.between(child.getBirthDate(), LocalDate.now()).getMonths();

        // Hitung Z-Score di server (bukan di AI — sesuai aturan klinis CONTEXT.md)
        BigDecimal zscoreHa = zScoreCalculator.calculateHeightForAge(
            request.getHeight().doubleValue(), ageMonths, child.getGender());
        BigDecimal zscoreWa = zScoreCalculator.calculateWeightForAge(
            request.getWeight().doubleValue(), ageMonths, child.getGender());
        BigDecimal zscoreWh = zScoreCalculator.calculateWeightForHeight(
            request.getWeight().doubleValue(), request.getHeight().doubleValue(), child.getGender());

        // Tentukan status stunting
        StuntStatus status = zScoreCalculator.determineStuntStatus(zscoreHa);
        short riskLevel = zScoreCalculator.determineRiskLevel(status);

        // Simpan assessment (immutable)
        Assessment assessment = Assessment.builder()
            .id(CuidGenerator.generate())
            .child(child)
            .weight(request.getWeight())
            .height(request.getHeight())
            .headCircumference(request.getHeadCircumference())
            .bfExclusive(request.getBfExclusive())
            .mpasiAge(request.getMpasiAge())
            .mealFreq(request.getMealFreq())
            .illnessHistory(request.getIllnessHistory())
            .build();
        assessmentRepository.save(assessment);

        // Buat prediction dengan status PENDING
        Prediction prediction = Prediction.builder()
            .id(CuidGenerator.generate())
            .assessment(assessment)
            .status(status)
            .predictionStatus(PredictionStatus.PENDING)
            .zscoreHa(zscoreHa)
            .zscoreWa(zscoreWa)
            .zscoreWh(zscoreWh)
            .riskLevel(riskLevel)
            .build();
        predictionRepository.save(prediction);

        // Trigger Gemini secara async (tidak memblokir response)
        predictionService.generatePredictionAsync(prediction.getId(), assessment, child, ageMonths);

        return mapToResponse(prediction, child);
    }

    // ── BE-304: Get assessment by ID ──────────────────────────────────────────

    public PredictionResponse getAssessment(String assessmentId, String userId) {
        Assessment assessment = assessmentRepository.findById(assessmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Assessment tidak ditemukan"));

        // Ownership check untuk PARENT
        if (!assessment.getChild().getUser().getId().equals(userId)) {
            throw new ForbiddenException("Anda tidak memiliki akses ke data ini");
        }

        Prediction prediction = predictionRepository.findByAssessmentId(assessmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Prediksi tidak ditemukan"));

        return mapToResponse(prediction, assessment.getChild());
    }

    // ── BE-305: Get assessments by child ─────────────────────────────────────

    public PageResponse<PredictionResponse> getAssessmentsByChild(
            String childId, String userId, Pageable pageable) {

        childRepository.findByIdAndUserId(childId, userId)
            .orElseThrow(() -> new ForbiddenException("Anak tidak ditemukan atau bukan milik Anda"));

        org.springframework.data.domain.Page<com.nutricare.domain.entity.Assessment> pageResult = assessmentRepository.findByChildIdOrderByCreatedAtDesc(childId, pageable);
        
        java.util.List<PredictionResponse> responses = pageResult.stream()
            .map(a -> {
                Prediction p = predictionRepository.findByAssessmentId(a.getId()).orElse(null);
                return p != null ? mapToResponse(p, a.getChild()) : null;
            })
            .toList();

        return PageResponse.<PredictionResponse>builder()
            .data(responses)
            .page(pageResult.getNumber())
            .size(pageResult.getSize())
            .totalElements(pageResult.getTotalElements())
            .totalPages(pageResult.getTotalPages())
            .build();
    }

    // ── BE-306: Retry job untuk PENDING ──────────────────────────────────────

    @Scheduled(fixedDelay = 300000) // tiap 5 menit
    public void retryPendingPredictions() {
        List<Prediction> pending = predictionRepository.findByPredictionStatus(PredictionStatus.PENDING);
        log.info("Retry job: {} prediksi PENDING ditemukan", pending.size());
        for (Prediction prediction : pending) {
            Assessment assessment = prediction.getAssessment();
            Child child = assessment.getChild();
            int ageMonths = Period.between(child.getBirthDate(), LocalDate.now()).getYears() * 12
                          + Period.between(child.getBirthDate(), LocalDate.now()).getMonths();
            predictionService.generatePredictionAsync(prediction.getId(), assessment, child, ageMonths);
        }
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private PredictionResponse mapToResponse(Prediction prediction, Child child) {
        blockchainAnchorRepository.findByAssessmentId(prediction.getAssessment().getId())
            .ifPresent(anchor -> {});

        var anchor = blockchainAnchorRepository
            .findByAssessmentId(prediction.getAssessment().getId())
            .map(a -> PredictionResponse.BlockchainInfo.builder()
                .anchorStatus(a.getAnchorStatus().name())
                .txHash(a.getTxHash())
                .polygonscanUrl(a.getTxHash() != null
                    ? "https://amoy.polygonscan.com/tx/" + a.getTxHash()
                    : null)
                .isVerified(a.getBlockNumber() != null)
                .build())
            .orElse(null);

        return PredictionResponse.builder()
            .id(prediction.getId())
            .assessmentId(prediction.getAssessment().getId())
            .childId(child.getId())
            .childName(child.getName())
            .status(prediction.getStatus())
            .predictionStatus(prediction.getPredictionStatus())
            .riskLevel(prediction.getRiskLevel())
            .statusLabel(PredictionResponse.getLabelForStatus(prediction.getStatus()))
            .statusColor(PredictionResponse.getColorForStatus(prediction.getStatus()))
            .zscoreHa(prediction.getZscoreHa())
            .zscoreWa(prediction.getZscoreWa())
            .zscoreWh(prediction.getZscoreWh())
            .summary(prediction.getSummary())
            .nextAssessmentDate(prediction.getNextAssessmentDate())
            .disclaimer(PredictionResponse.DISCLAIMER)
            .blockchain(anchor)
            .createdAt(prediction.getCreatedAt())
            .build();
    }
}
