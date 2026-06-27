package com.nutricare.service.impl;

import com.nutricare.TestDataFactory;
import com.nutricare.domain.entity.*;
import com.nutricare.domain.enums.Role;
import com.nutricare.domain.enums.StuntStatus;
import com.nutricare.dto.request.admin.CreateUserRequest;
import com.nutricare.dto.request.admin.UpdateUserRoleRequest;
import com.nutricare.dto.request.admin.UpdateUserStatusRequest;
import com.nutricare.exception.DuplicateResourceException;
import com.nutricare.repository.AssessmentRepository;
import com.nutricare.repository.ChildRepository;
import com.nutricare.repository.PredictionRepository;
import com.nutricare.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private ChildRepository childRepository;
    @Mock private AssessmentRepository assessmentRepository;
    @Mock private PredictionRepository predictionRepository;
    @Mock private PasswordEncoder passwordEncoder;

    private AdminService adminService;

    @BeforeEach
    void setUp() {
        adminService = new AdminService(userRepository, childRepository,
            assessmentRepository, predictionRepository, passwordEncoder);
    }

    @Test
    void getUsers_shouldReturnAll() {
        User admin = TestDataFactory.createAdmin();
        when(userRepository.findAll(any(PageRequest.class)))
            .thenReturn(new PageImpl<>(List.of(admin)));

        Page<User> result = adminService.getUsers(null, null, PageRequest.of(0, 10));

        assertEquals(1, result.getTotalElements());
    }

    @Test
    void getUsers_shouldFilterByRole() {
        User medic = TestDataFactory.createMedic();
        when(userRepository.findByRole(eq(Role.MEDIC), any(PageRequest.class)))
            .thenReturn(new PageImpl<>(List.of(medic)));

        Page<User> result = adminService.getUsers(null, Role.MEDIC, PageRequest.of(0, 10));

        assertEquals(1, result.getTotalElements());
    }

    @Test
    void createUser_shouldSucceed() {
        CreateUserRequest request = new CreateUserRequest();
        request.setEmail("newuser@test.com");
        request.setPassword("password123");
        request.setName("User Baru");
        request.setRole(Role.MEDIC);

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$hash");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            return User.builder()
                .id(u.getId()).email(u.getEmail()).name(u.getName())
                .role(u.getRole()).isActive(true).build();
        });

        var response = adminService.createUser(request);

        assertNotNull(response);
        assertEquals("newuser@test.com", response.getEmail());
        assertEquals(Role.MEDIC, response.getRole());
    }

    @Test
    void createUser_shouldThrow_whenEmailExists() {
        CreateUserRequest request = new CreateUserRequest();
        request.setEmail("existing@test.com");
        request.setPassword("password123");
        request.setName("User");
        request.setRole(Role.MEDIC);

        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> adminService.createUser(request));
    }

    @Test
    void updateUserStatus_shouldSucceed() {
        User user = TestDataFactory.createParent();
        UpdateUserStatusRequest request = new UpdateUserStatusRequest();
        request.setIsActive(false);

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = adminService.updateUserStatus(user.getId(), request);

        assertNotNull(response);
        assertFalse(response.getIsActive());
    }

    @Test
    void updateUserRole_shouldSucceed() {
        User user = TestDataFactory.createParent();
        UpdateUserRoleRequest request = new UpdateUserRoleRequest();
        request.setRole(Role.MEDIC);

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = adminService.updateUserRole(user.getId(), request);

        assertEquals(Role.MEDIC, response.getRole());
    }

    @Test
    void getStats_shouldReturnAggregates() {
        User parent = TestDataFactory.createParent();
        Child child = TestDataFactory.createChild(parent);
        Assessment assessment = TestDataFactory.createAssessment(child);
        Prediction prediction = TestDataFactory.createPrediction(assessment);

        when(userRepository.count()).thenReturn(5L);
        when(childRepository.count()).thenReturn(10L);
        when(assessmentRepository.count()).thenReturn(20L);
        when(predictionRepository.countByStatus()).thenReturn(List.of(
            new Object[]{StuntStatus.NORMAL, 10L},
            new Object[]{StuntStatus.AT_RISK, 5L},
            new Object[]{StuntStatus.STUNTED, 3L},
            new Object[]{StuntStatus.SEVERELY_STUNTED, 2L}
        ));

        var stats = adminService.getStats();

        assertEquals(5, stats.getTotalUsers());
        assertEquals(10, stats.getTotalChildren());
        assertEquals(20, stats.getTotalAssessments());
        assertEquals(4, stats.getDistribution().size());
        assertEquals(25.0, stats.getPercentageStunted(), 0.1); // (3+2)/20 * 100 = 25%
    }
}
