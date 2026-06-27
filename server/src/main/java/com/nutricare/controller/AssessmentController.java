package com.nutricare.controller;

import com.nutricare.domain.entity.User;
import com.nutricare.domain.enums.Role;
import com.nutricare.dto.request.assessment.AssessmentRequest;
import com.nutricare.dto.response.PageResponse;
import com.nutricare.dto.response.prediction.PredictionResponse;
import com.nutricare.repository.AssessmentRepository;
import com.nutricare.service.impl.AssessmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * AssessmentController — /api/assessments/**
 * BE-302: POST /api/assessments
 * BE-304: GET  /api/assessments/{id}
 * BE-305: GET  /api/assessments/child/{childId}
 */
@RestController
@RequestMapping("/api/assessments")
@RequiredArgsConstructor
public class AssessmentController {

    private final AssessmentService assessmentService;
    private final AssessmentRepository assessmentRepository;

    /**
     * POST /api/assessments
     * Hanya PARENT dan ADMIN yang bisa submit assessment.
     */
    @PostMapping
    @PreAuthorize("hasRole('PARENT') or hasRole('ADMIN')")
    public ResponseEntity<PredictionResponse> createAssessment(
            @Valid @RequestBody AssessmentRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(assessmentService.createAssessment(request, user.getId()));
    }

    /**
     * GET /api/assessments/{id}
     * PARENT → ownership check di service
     * MEDIC & ADMIN → akses bebas
     */
    @GetMapping("/{id}")
    public ResponseEntity<PredictionResponse> getAssessment(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {

        String userId = user.getRole() == Role.PARENT ? user.getId()
            : assessmentRepository.findById(id)
                .orElseThrow().getChild().getUser().getId();

        return ResponseEntity.ok(assessmentService.getAssessment(id, userId));
    }

    /**
     * GET /api/assessments/child/{childId}?page=0&size=10
     * Riwayat assessment satu anak dengan pagination.
     */
    @GetMapping("/child/{childId}")
    public ResponseEntity<PageResponse<PredictionResponse>> getAssessmentsByChild(
            @PathVariable String childId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User user) {

        String userId = user.getRole() == Role.PARENT ? user.getId()
            : assessmentRepository.findFirstByChildIdOrderByCreatedAtDesc(childId)
                .map(a -> a.getChild().getUser().getId())
                .orElse(user.getId());

        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(assessmentService.getAssessmentsByChild(childId, userId, pageable));
    }
}
