package com.nutricare.controller;

import com.nutricare.domain.entity.User;
import com.nutricare.domain.enums.Role;
import com.nutricare.dto.request.admin.CreateUserRequest;
import com.nutricare.dto.request.admin.UpdateUserRoleRequest;
import com.nutricare.dto.request.admin.UpdateUserStatusRequest;
import com.nutricare.dto.response.PageResponse;
import com.nutricare.dto.response.admin.AdminCreateUserResponse;
import com.nutricare.dto.response.admin.AdminStatsResponse;
import com.nutricare.dto.response.admin.UserAdminResponse;
import com.nutricare.service.impl.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * AdminController — /api/admin/**
 *
 * BE-604: Manajemen user, statistik agregat
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    /**
     * GET /api/admin/users?page=0&size=10&role=&search=
     * Daftar semua user dengan pagination, filter role, dan pencarian.
     */
    @GetMapping("/users")
    public ResponseEntity<PageResponse<UserAdminResponse>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) String search) {

        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<User> userPage = adminService.getUsers(search, role, pageable);

        var data = userPage.getContent().stream()
                .map(adminService::toUserAdminResponse)
                .toList();

        PageResponse<UserAdminResponse> response = PageResponse.<UserAdminResponse>builder()
                .data(data)
                .page(userPage.getNumber())
                .size(userPage.getSize())
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/admin/users
     * Buat akun baru untuk role MEDIC, POSYANDU, atau ADMIN.
     */
    @PostMapping("/users")
    public ResponseEntity<AdminCreateUserResponse> createUser(
            @Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(adminService.createUser(request));
    }

    /**
     * PATCH /api/admin/users/{userId}/status
     * Aktifkan atau nonaktifkan akun user (soft disable).
     */
    @PatchMapping("/users/{userId}/status")
    public ResponseEntity<UserAdminResponse> updateUserStatus(
            @PathVariable String userId,
            @Valid @RequestBody UpdateUserStatusRequest request) {
        return ResponseEntity.ok(adminService.updateUserStatus(userId, request));
    }

    /**
     * PATCH /api/admin/users/{userId}/role
     * Ubah role user.
     */
    @PatchMapping("/users/{userId}/role")
    public ResponseEntity<UserAdminResponse> updateUserRole(
            @PathVariable String userId,
            @Valid @RequestBody UpdateUserRoleRequest request) {
        return ResponseEntity.ok(adminService.updateUserRole(userId, request));
    }

    /**
     * GET /api/admin/stats
     * Statistik agregat stunting.
     */
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }
}
