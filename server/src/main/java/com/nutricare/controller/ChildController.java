package com.nutricare.controller;

import com.nutricare.domain.entity.User;
import com.nutricare.domain.enums.Role;
import com.nutricare.dto.request.child.ChildRequest;
import com.nutricare.dto.response.PageResponse;
import com.nutricare.dto.response.child.ChildDetailResponse;
import com.nutricare.dto.response.child.ChildResponse;
import com.nutricare.exception.ResourceNotFoundException;
import com.nutricare.repository.ChildRepository;
import com.nutricare.service.impl.ChildService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * ChildController — /api/children/**
 * BE-201: GET  /api/children
 * BE-202: POST /api/children
 * BE-203: GET  /api/children/{childId}
 * BE-204: PUT  /api/children/{childId}
 */
@RestController
@RequestMapping("/api/children")
@RequiredArgsConstructor
public class ChildController {

    private final ChildService childService;
    private final ChildRepository childRepository;

/**
     * GET /api/children
     * PARENT → hanya anaknya sendiri (paginated)
     * MEDIC & ADMIN → semua anak (paginated)
     */
    @GetMapping
    public ResponseEntity<PageResponse<ChildResponse>> getChildren(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User user) {

        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        if (user.getRole() == Role.PARENT) {
            Page<ChildResponse> childPage = childService.getChildren(user.getId(), pageable);
            PageResponse<ChildResponse> response = PageResponse.<ChildResponse>builder()
                .data(childPage.getContent())
                .page(childPage.getNumber())
                .size(childPage.getSize())
                .totalElements(childPage.getTotalElements())
                .totalPages(childPage.getTotalPages())
                .build();
            return ResponseEntity.ok(response);
        }

        // MEDIC & ADMIN — ambil semua anak (paginated)
        Page<com.nutricare.domain.entity.Child> childPage = childRepository.findAll(pageable);
        List<ChildResponse> children = childPage.getContent().stream()
            .map(c -> childService.getChild(c.getId(), c.getUser().getId()))
            .collect(Collectors.toList());

        PageResponse<ChildResponse> response = PageResponse.<ChildResponse>builder()
            .data(children)
            .page(childPage.getNumber())
            .size(childPage.getSize())
            .totalElements(childPage.getTotalElements())
            .totalPages(childPage.getTotalPages())
            .build();
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/children
     * Hanya PARENT dan ADMIN yang bisa tambah anak
     */
    @PostMapping
    @PreAuthorize("hasRole('PARENT') or hasRole('ADMIN')")
    public ResponseEntity<ChildResponse> createChild(
            @Valid @RequestBody ChildRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(childService.createChild(request, user.getId()));
    }

    /**
     * GET /api/children/{childId}
     * Return detail anak termasuk riwayat assessment + prediksi.
     * PARENT → ownership check di service
     * MEDIC & ADMIN → bebas akses
     */
    @GetMapping("/{childId}")
    public ResponseEntity<ChildDetailResponse> getChild(
            @PathVariable String childId,
            @AuthenticationPrincipal User user) {

        if (user.getRole() == Role.PARENT) {
            return ResponseEntity.ok(childService.getChildDetail(childId, user.getId()));
        }
        // MEDIC & ADMIN: akses tanpa ownership check
        String ownerId = childRepository.findById(childId)
            .orElseThrow(() -> new ResourceNotFoundException("Anak tidak ditemukan"))
            .getUser().getId();
        return ResponseEntity.ok(childService.getChildDetail(childId, ownerId));
    }

    /**
     * PUT /api/children/{childId}
     * Hanya pemilik (PARENT) atau ADMIN
     */
    @PutMapping("/{childId}")
    @PreAuthorize("hasRole('PARENT') or hasRole('ADMIN')")
    public ResponseEntity<ChildResponse> updateChild(
            @PathVariable String childId,
            @Valid @RequestBody ChildRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(childService.updateChild(childId, request, user.getId()));
    }
}
