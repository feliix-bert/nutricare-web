package com.nutricare.service.impl;

import com.nutricare.domain.entity.User;
import com.nutricare.domain.enums.Role;
import com.nutricare.domain.enums.StuntStatus;
import com.nutricare.dto.request.admin.CreateUserRequest;
import com.nutricare.dto.request.admin.UpdateUserRoleRequest;
import com.nutricare.dto.request.admin.UpdateUserStatusRequest;
import com.nutricare.dto.response.admin.AdminCreateUserResponse;
import com.nutricare.dto.response.admin.AdminStatsResponse;
import com.nutricare.dto.response.admin.UserAdminResponse;
import com.nutricare.exception.DuplicateResourceException;
import com.nutricare.exception.ResourceNotFoundException;
import com.nutricare.repository.AssessmentRepository;
import com.nutricare.repository.ChildRepository;
import com.nutricare.repository.PredictionRepository;
import com.nutricare.repository.UserRepository;
import com.nutricare.util.CuidGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * AdminService — operasi administratif untuk role ADMIN.
 *
 * BE-604: Manajemen user, statistik agregat
 */
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ChildRepository childRepository;
    private final AssessmentRepository assessmentRepository;
    private final PredictionRepository predictionRepository;
    private final PasswordEncoder passwordEncoder;

    // ── GET /api/admin/users ───────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<User> getUsers(String search, Role role, Pageable pageable) {
        if ((search != null && !search.isBlank()) && role != null) {
            return userRepository.findBySearchAndRole(search, role, pageable);
        } else if (search != null && !search.isBlank()) {
            return userRepository.findBySearch(search, pageable);
        } else if (role != null) {
            return userRepository.findByRole(role, pageable);
        } else {
            return userRepository.findAll(pageable);
        }
    }

    // ── POST /api/admin/users ─────────────────────────────────────────────────

    @Transactional
    public AdminCreateUserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email sudah terdaftar: " + request.getEmail());
        }

        User user = User.builder()
                .id(CuidGenerator.generate())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .role(request.getRole())
                .isActive(true)
                .build();

        User saved = userRepository.save(user);
        return toCreateUserResponse(saved);
    }

    // ── PATCH /api/admin/users/{userId}/status ─────────────────────────────────

    @Transactional
    public UserAdminResponse updateUserStatus(String userId, UpdateUserStatusRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        user.setIsActive(request.getIsActive());
        return toUserAdminResponse(userRepository.save(user));
    }

    // ── PATCH /api/admin/users/{userId}/role ───────────────────────────────────

    @Transactional
    public UserAdminResponse updateUserRole(String userId, UpdateUserRoleRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        user.setRole(request.getRole());
        return toUserAdminResponse(userRepository.save(user));
    }

    // ── GET /api/admin/stats ───────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public AdminStatsResponse getStats() {
        long totalUsers = userRepository.count();
        long totalChildren = childRepository.count();
        long totalAssessments = assessmentRepository.count();

        // Distribution per stunt status
        Map<String, Long> distribution = new LinkedHashMap<>();
        distribution.put("NORMAL", 0L);
        distribution.put("AT_RISK", 0L);
        distribution.put("STUNTED", 0L);
        distribution.put("SEVERELY_STUNTED", 0L);

        List<Object[]> statusCounts = predictionRepository.countByStatus();
        for (Object[] row : statusCounts) {
            StuntStatus status = (StuntStatus) row[0];
            Long count = (Long) row[1];
            distribution.put(status.name(), count);
        }

        long totalWithPrediction = distribution.values().stream().mapToLong(Long::longValue).sum();
        double percentageStunted = totalWithPrediction > 0
                ? (double) (distribution.get("STUNTED") + distribution.get("SEVERELY_STUNTED")) / totalWithPrediction * 100
                : 0.0;

        return AdminStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalChildren(totalChildren)
                .totalAssessments(totalAssessments)
                .distribution(distribution)
                .percentageStunted(Math.round(percentageStunted * 10.0) / 10.0)
                .build();
    }

    // ── Helper mappers ─────────────────────────────────────────────────────────

    public UserAdminResponse toUserAdminResponse(User user) {
        return UserAdminResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .walletAddress(user.getWalletAddress())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private AdminCreateUserResponse toCreateUserResponse(User user) {
        return AdminCreateUserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .build();
    }
}
