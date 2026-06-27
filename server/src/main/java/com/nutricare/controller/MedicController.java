package com.nutricare.controller;

import com.nutricare.domain.entity.Assessment;
import com.nutricare.domain.entity.Child;
import com.nutricare.domain.entity.NutritionLog;
import com.nutricare.domain.entity.Prediction;
import com.nutricare.domain.enums.StuntStatus;
import com.nutricare.dto.response.PageResponse;
import com.nutricare.exception.ResourceNotFoundException;
import com.nutricare.repository.AssessmentRepository;
import com.nutricare.repository.ChildRepository;
import com.nutricare.repository.NutritionLogRepository;
import com.nutricare.repository.PredictionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.Period;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * MedicController — /api/medic/**
 *
 * BE-602: GET /api/medic/patients — daftar semua anak (search + filter status)
 * BE-603: GET /api/medic/patients/{childId}/summary — ringkasan lengkap anak
 */
@RestController
@RequestMapping("/api/medic")
@RequiredArgsConstructor
@PreAuthorize("hasRole('MEDIC') or hasRole('ADMIN')")
public class MedicController {

    private final ChildRepository childRepository;
    private final AssessmentRepository assessmentRepository;
    private final PredictionRepository predictionRepository;
    private final NutritionLogRepository nutritionLogRepository;

    /**
     * GET /api/medic/patients?page=0&size=10&search=&status=
     * Daftar semua anak dengan pagination dan filter.
     *
     * @param page   halaman (default 0)
     * @param size   ukuran halaman (default 10)
     * @param search cari nama anak atau nama orang tua (opsional)
     * @param status filter StuntStatus (opsional)
     * @return paginated list anak
     */
    @GetMapping("/patients")
    public ResponseEntity<PageResponse<Map<String, Object>>> getPatients(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) StuntStatus status) {

        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Child> childPage;

        if (search != null && !search.isBlank()) {
            childPage = childRepository.findBySearchWithParent(search, pageable);
        } else {
            childPage = childRepository.findAll(pageable);
        }

        // Batch load latest predictions untuk semua child (menghindari N+1)
        List<String> childIds = childPage.getContent().stream()
                .map(Child::getId)
                .toList();
        List<Prediction> latestPredictions = predictionRepository.findLatestByChildIds(childIds);
        Map<String, Prediction> predictionByChildId = latestPredictions.stream()
                .collect(Collectors.toMap(
                        pred -> pred.getAssessment().getChild().getId(),
                        pred -> pred,
                        (a, b) -> a  // jika ada duplikat, ambil yang pertama
                ));

        List<Map<String, Object>> patients = childPage.getContent().stream()
                .map(child -> buildPatientItem(child, predictionByChildId.get(child.getId())))
                .filter(item -> status == null || matchesStatus(item, status))
                .toList();

        // Karena kita filter after pagination, hitung manual
        PageResponse<Map<String, Object>> response = PageResponse.<Map<String, Object>>builder()
                .data(patients)
                .page(childPage.getNumber())
                .size(childPage.getSize())
                .totalElements(childPage.getTotalElements())
                .totalPages(childPage.getTotalPages())
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/medic/patients/{childId}/summary
     * Ringkasan lengkap seorang anak: data anak, semua assessment & prediksi, log gizi.
     *
     * @param childId ID anak
     * @return ringkasan lengkap
     */
    @GetMapping("/patients/{childId}/summary")
    public ResponseEntity<Map<String, Object>> getPatientSummary(@PathVariable String childId) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new ResourceNotFoundException("Anak tidak ditemukan: " + childId));

        int ageMonths = Period.between(child.getBirthDate(), LocalDate.now()).getMonths()
                + Period.between(child.getBirthDate(), LocalDate.now()).getYears() * 12;

        // Batch load semua predictions untuk assessments
        List<Assessment> allAssessments = assessmentRepository
                .findByChildIdOrderByCreatedAtDesc(childId);
        List<String> assessmentIds = allAssessments.stream()
                .map(Assessment::getId)
                .toList();
        Map<String, Prediction> predictionByAssessmentId = predictionRepository
                .findByAssessmentIdIn(assessmentIds).stream()
                .collect(Collectors.toMap(
                        pred -> pred.getAssessment().getId(),
                        pred -> pred,
                        (a, b) -> a
                ));

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("id", child.getId());
        summary.put("name", child.getName());
        summary.put("gender", child.getGender());
        summary.put("birthDate", child.getBirthDate());
        summary.put("ageMonths", ageMonths);
        summary.put("anonId", child.getAnonId());
        summary.put("parent", Map.of(
                "id", child.getUser().getId(),
                "name", child.getUser().getName(),
                "email", child.getUser().getEmail()
        ));

        List<Map<String, Object>> assessments = allAssessments.stream()
                .map(a -> buildAssessmentItem(a, predictionByAssessmentId.get(a.getId())))
                .toList();
        summary.put("assessments", assessments);

        // Nutrition logs (last 7)
        List<NutritionLog> nutritionLogs = nutritionLogRepository
                .findTop7ByChildIdOrderByCreatedAtDesc(childId);
        summary.put("recentNutritionLogs", nutritionLogs.stream()
                .map(nl -> (Map<String, Object>) Map.of(
                        "id", nl.getId(),
                        "photoUrl", nl.getPhotoUrl(),
                        "foodDetected", nl.getFoodDetected(),
                        "calories", nl.getCalories(),
                        "createdAt", nl.getCreatedAt()
                ))
                .toList());

        return ResponseEntity.ok(summary);
    }

    // ── Helper methods ──────────────────────────────────────────────────────────

    private Map<String, Object> buildPatientItem(Child child, Prediction latestPrediction) {
        int ageMonths = Period.between(child.getBirthDate(), LocalDate.now()).getMonths()
                + Period.between(child.getBirthDate(), LocalDate.now()).getYears() * 12;

        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", child.getId());
        item.put("name", child.getName());
        item.put("gender", child.getGender());
        item.put("birthDate", child.getBirthDate());
        item.put("ageMonths", ageMonths);
        item.put("parentName", child.getUser().getName());
        item.put("latestPrediction", latestPrediction != null
                ? Map.of(
                        "status", latestPrediction.getStatus(),
                        "riskLevel", latestPrediction.getRiskLevel(),
                        "createdAt", latestPrediction.getCreatedAt()
                )
                : null);
        return item;
    }

    private boolean matchesStatus(Map<String, Object> item, StuntStatus status) {
        Map<?, ?> pred = (Map<?, ?>) item.get("latestPrediction");
        return pred != null && pred.get("status") == status;
    }

    private Map<String, Object> buildAssessmentItem(Assessment a, Prediction prediction) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", a.getId());
        item.put("weight", a.getWeight());
        item.put("height", a.getHeight());
        item.put("headCircumference", a.getHeadCircumference());
        item.put("bfExclusive", a.getBfExclusive());
        item.put("mealFreq", a.getMealFreq());
        item.put("illnessHistory", a.getIllnessHistory());
        item.put("createdAt", a.getCreatedAt());

        if (prediction != null) {
            Map<String, Object> predMap = new LinkedHashMap<>();
            predMap.put("id", prediction.getId());
            predMap.put("status", prediction.getStatus());
            predMap.put("predictionStatus", prediction.getPredictionStatus());
            predMap.put("zscoreHa", prediction.getZscoreHa());
            predMap.put("zscoreWa", prediction.getZscoreWa());
            predMap.put("zscoreWh", prediction.getZscoreWh());
            predMap.put("riskLevel", prediction.getRiskLevel());
            predMap.put("summary", prediction.getSummary());
            predMap.put("recommendations", prediction.getRecommendations());
            predMap.put("nextAssessmentDate", prediction.getNextAssessmentDate());
            predMap.put("createdAt", prediction.getCreatedAt());
            item.put("prediction", predMap);
        }
        return item;
    }
}
