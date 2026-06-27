package com.nutricare.service.impl;

import com.nutricare.domain.entity.Assessment;
import com.nutricare.domain.entity.Child;
import com.nutricare.domain.entity.Prediction;
import com.nutricare.domain.entity.User;
import com.nutricare.dto.request.child.ChildRequest;
import com.nutricare.dto.response.child.ChildDetailResponse;
import com.nutricare.dto.response.child.ChildResponse;
import com.nutricare.exception.ForbiddenException;
import com.nutricare.exception.ResourceNotFoundException;
import com.nutricare.repository.AssessmentRepository;
import com.nutricare.repository.ChildRepository;
import com.nutricare.repository.PredictionRepository;
import com.nutricare.repository.UserRepository;
import com.nutricare.util.CuidGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.stream.Collectors;

/**
 * ChildService — Phase 2 (BE-201 sampai BE-204)
 */
@Service
@RequiredArgsConstructor
public class ChildService {

    private final ChildRepository childRepository;
    private final UserRepository userRepository;
    private final PredictionRepository predictionRepository;
    private final AssessmentRepository assessmentRepository;

    // ── BE-201: Get all children ──────────────────────────────────────────────

    public Page<ChildResponse> getChildren(String userId, Pageable pageable) {
        Page<Child> childPage = childRepository.findByUserId(userId, pageable);
        return childPage.map(this::mapToResponse);
    }

    public List<ChildResponse> getChildren(String userId) {
        return childRepository.findByUserId(userId).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // ── BE-202: Create child ──────────────────────────────────────────────────

    @Transactional
    public ChildResponse createChild(ChildRequest request, String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        // Generate anon_id unik untuk blockchain
        String anonId;
        do { anonId = CuidGenerator.generate(); }
        while (childRepository.existsByAnonId(anonId));

        Child child = Child.builder()
            .id(CuidGenerator.generate())
            .user(user)
            .name(request.getName())
            .gender(request.getGender())
            .birthDate(request.getBirthDate())
            .anonId(anonId)
            .build();

        return mapToResponse(childRepository.save(child));
    }

    // ── BE-203: Get child by ID + ownership check ─────────────────────────────

    public ChildResponse getChild(String childId, String userId) {
        Child child = childRepository.findById(childId)
            .orElseThrow(() -> new ResourceNotFoundException("Anak tidak ditemukan"));

        if (!child.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Anda tidak memiliki akses ke data ini");
        }

        return mapToResponse(child);
    }

    /**
     * Detail anak — termasuk riwayat assessment + prediksi.
     */
    public ChildDetailResponse getChildDetail(String childId, String userId) {
        Child child = childRepository.findById(childId)
            .orElseThrow(() -> new ResourceNotFoundException("Anak tidak ditemukan"));

        if (!child.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Anda tidak memiliki akses ke data ini");
        }

        int ageMonths = Period.between(child.getBirthDate(), LocalDate.now()).getMonths()
                      + Period.between(child.getBirthDate(), LocalDate.now()).getYears() * 12;

        List<Assessment> assessments = assessmentRepository
            .findByChildIdOrderByCreatedAtDesc(childId);

        List<ChildDetailResponse.AssessmentItem> assessmentItems = assessments.stream()
            .map(a -> {
                Prediction pred = a.getPrediction();
                ChildDetailResponse.PredictionItem predItem = pred != null
                    ? ChildDetailResponse.PredictionItem.builder()
                        .id(pred.getId())
                        .status(pred.getStatus())
                        .predictionStatus(pred.getPredictionStatus())
                        .riskLevel(pred.getRiskLevel())
                        .zscoreWa(pred.getZscoreWa())
                        .zscoreHa(pred.getZscoreHa())
                        .zscoreWh(pred.getZscoreWh())
                        .summary(pred.getSummary())
                        .recommendations(pred.getRecommendations())
                        .nextAssessmentDate(pred.getNextAssessmentDate())
                        .createdAt(pred.getCreatedAt())
                        .build()
                    : null;

                return ChildDetailResponse.AssessmentItem.builder()
                    .id(a.getId())
                    .weight(a.getWeight())
                    .height(a.getHeight())
                    .headCircumference(a.getHeadCircumference())
                    .bfExclusive(a.getBfExclusive())
                    .mpasiAge(a.getMpasiAge())
                    .mealFreq(a.getMealFreq())
                    .illnessHistory(a.getIllnessHistory())
                    .createdAt(a.getCreatedAt())
                    .prediction(predItem)
                    .build();
            })
            .collect(Collectors.toList());

        return ChildDetailResponse.builder()
            .id(child.getId())
            .name(child.getName())
            .gender(child.getGender())
            .birthDate(child.getBirthDate())
            .anonId(child.getAnonId())
            .ageMonths(ageMonths)
            .createdAt(child.getCreatedAt())
            .assessments(assessmentItems)
            .build();
    }

    // ── BE-204: Update child ──────────────────────────────────────────────────

    @Transactional
    public ChildResponse updateChild(String childId, ChildRequest request, String userId) {
        Child child = childRepository.findByIdAndUserId(childId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Anak tidak ditemukan atau bukan milik Anda"));

        child.setName(request.getName());
        child.setGender(request.getGender());
        child.setBirthDate(request.getBirthDate());

        return mapToResponse(childRepository.save(child));
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private ChildResponse mapToResponse(Child child) {
        int ageMonths = Period.between(child.getBirthDate(), LocalDate.now()).getMonths()
                      + Period.between(child.getBirthDate(), LocalDate.now()).getYears() * 12;

        // Ambil prediksi terbaru
        Prediction latestPred = predictionRepository
            .findFirstByAssessmentChildIdOrderByCreatedAtDesc(child.getId())
            .orElse(null);

        ChildResponse.LatestPrediction latestPrediction = latestPred != null
            ? ChildResponse.LatestPrediction.builder()
                .status(latestPred.getStatus())
                .riskLevel(latestPred.getRiskLevel())
                .createdAt(latestPred.getCreatedAt())
                .build()
            : null;

        return ChildResponse.builder()
            .id(child.getId())
            .name(child.getName())
            .gender(child.getGender())
            .birthDate(child.getBirthDate())
            .anonId(child.getAnonId())
            .ageMonths(ageMonths)
            .createdAt(child.getCreatedAt())
            .latestPrediction(latestPrediction)
            .build();
    }
}
