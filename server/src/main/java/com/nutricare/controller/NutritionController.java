package com.nutricare.controller;

import com.nutricare.domain.entity.User;
import com.nutricare.domain.enums.Role;
import com.nutricare.dto.response.nutrition.NutritionResponse;
import com.nutricare.exception.ResourceNotFoundException;
import com.nutricare.repository.ChildRepository;
import com.nutricare.service.impl.NutritionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * NutritionController — /api/nutrition/**
 *
 * BE-403: POST /api/nutrition — upload foto makanan + analisis Gemini Vision
 * BE-404: GET  /api/nutrition/child/{childId} — riwayat log gizi anak
 */
@RestController
@RequestMapping("/api/nutrition")
@RequiredArgsConstructor
public class NutritionController {

    private final NutritionService nutritionService;
    private final ChildRepository childRepository;

    /**
     * POST /api/nutrition
     * Upload foto makanan dan analisis kandungan gizi.
     * Content-Type: multipart/form-data
     *
     * @param childId ID anak
     * @param photo   file foto (JPEG/PNG/WebP, max 5 MB)
     * @param user    user yang login
     * @return hasil analisis gizi
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('PARENT') or hasRole('ADMIN')")
    public ResponseEntity<NutritionResponse> analyzeNutrition(
            @RequestParam("childId") String childId,
            @RequestParam("photo") MultipartFile photo,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(nutritionService.analyzeMealPhoto(childId, photo, user.getId()));
    }

    /**
     * GET /api/nutrition/child/{childId}?page=0&size=10
     * Ambil riwayat log gizi seorang anak dengan pagination.
     *
     * @param childId ID anak
     * @param page    halaman (default 0)
     * @param size    ukuran halaman (default 10)
     * @param user    user yang login
     * @return halaman riwayat log gizi
     */
    @GetMapping("/child/{childId}")
    public ResponseEntity<com.nutricare.dto.response.PageResponse<NutritionResponse>> getNutritionHistory(
            @PathVariable String childId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User user) {
        String ownerId = user.getRole() == Role.PARENT
                ? user.getId()
                : childRepository.findById(childId)
                        .orElseThrow(() -> new ResourceNotFoundException("Anak tidak ditemukan"))
                        .getUser().getId();
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(nutritionService.getNutritionHistory(childId, ownerId, pageable));
    }

    /**
     * DELETE /api/nutrition/{logId}
     * Hapus log gizi tertentu.
     * PARENT hanya bisa hapus milik sendiri, MEDIC/ADMIN bisa semua.
     *
     * @param logId ID log gizi
     * @param user  user yang login
     * @return 204 No Content
     */
    @DeleteMapping("/{logId}")
    @PreAuthorize("hasRole('PARENT') or hasRole('MEDIC') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteNutritionLog(
            @PathVariable String logId,
            @AuthenticationPrincipal User user) {
        nutritionService.deleteNutritionLog(logId, user.getId(), user.getRole());
        return ResponseEntity.noContent().build();
    }
}
