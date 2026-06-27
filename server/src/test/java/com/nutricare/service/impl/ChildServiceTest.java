package com.nutricare.service.impl;

import com.nutricare.TestDataFactory;
import com.nutricare.domain.entity.Child;
import com.nutricare.domain.entity.User;
import com.nutricare.dto.request.child.ChildRequest;
import com.nutricare.exception.ForbiddenException;
import com.nutricare.exception.ResourceNotFoundException;
import com.nutricare.repository.AssessmentRepository;
import com.nutricare.repository.ChildRepository;
import com.nutricare.repository.PredictionRepository;
import com.nutricare.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChildServiceTest {

    @Mock private ChildRepository childRepository;
    @Mock private UserRepository userRepository;
    @Mock private PredictionRepository predictionRepository;
    @Mock private AssessmentRepository assessmentRepository;

    private ChildService childService;

    @BeforeEach
    void setUp() {
        childService = new ChildService(childRepository, userRepository, predictionRepository, assessmentRepository);
    }

    @Test
    void getChildren_shouldReturnList() {
        User parent = TestDataFactory.createParent();
        Child child = TestDataFactory.createChild(parent);
        when(childRepository.findByUserId(parent.getId())).thenReturn(List.of(child));

        var result = childService.getChildren(parent.getId());

        assertEquals(1, result.size());
        assertEquals(child.getName(), result.get(0).getName());
    }

    @Test
    void createChild_shouldSucceed() {
        User parent = TestDataFactory.createParent();
        ChildRequest request = new ChildRequest();
        request.setName("Ani");
        request.setGender(com.nutricare.domain.enums.Gender.FEMALE);
        request.setBirthDate(LocalDate.of(2024, 1, 1));

        when(userRepository.findById(parent.getId())).thenReturn(Optional.of(parent));
        when(childRepository.existsByAnonId(anyString())).thenReturn(false);
        when(childRepository.save(any(Child.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = childService.createChild(request, parent.getId());

        assertNotNull(response);
        assertEquals("Ani", response.getName());
        assertEquals(com.nutricare.domain.enums.Gender.FEMALE, response.getGender());
    }

    @Test
    void getChild_shouldSucceed_forOwner() {
        User parent = TestDataFactory.createParent();
        Child child = TestDataFactory.createChild(parent);

        when(childRepository.findById(child.getId())).thenReturn(Optional.of(child));

        var response = childService.getChild(child.getId(), parent.getId());

        assertNotNull(response);
        assertEquals(child.getName(), response.getName());
    }

    @Test
    void getChild_shouldThrow_whenNotOwner() {
        User parent = TestDataFactory.createParent();
        User other = TestDataFactory.createUser(com.nutricare.domain.enums.Role.PARENT, "other@test.com", "Lain");
        Child child = TestDataFactory.createChild(parent);

        when(childRepository.findById(child.getId())).thenReturn(Optional.of(child));

        assertThrows(ForbiddenException.class, () -> childService.getChild(child.getId(), other.getId()));
    }

    @Test
    void getChild_shouldThrow_whenNotFound() {
        when(childRepository.findById(anyString())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> childService.getChild("nonexistent", "userid"));
    }

    @Test
    void updateChild_shouldSucceed() {
        User parent = TestDataFactory.createParent();
        Child child = TestDataFactory.createChild(parent);

        ChildRequest request = new ChildRequest();
        request.setName("Nama Baru");
        request.setGender(com.nutricare.domain.enums.Gender.MALE);
        request.setBirthDate(LocalDate.of(2023, 6, 15));

        when(childRepository.findByIdAndUserId(child.getId(), parent.getId())).thenReturn(Optional.of(child));
        when(childRepository.save(any(Child.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = childService.updateChild(child.getId(), request, parent.getId());

        assertEquals("Nama Baru", response.getName());
        assertEquals(com.nutricare.domain.enums.Gender.MALE, response.getGender());
    }

    @Test
    void getChildren_withPagination_shouldReturn() {
        User parent = TestDataFactory.createParent();
        Child child = TestDataFactory.createChild(parent);
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0, 10);

        when(childRepository.findByUserId(parent.getId(), pageable))
            .thenReturn(new org.springframework.data.domain.PageImpl<>(java.util.List.of(child)));

        var result = childService.getChildren(parent.getId(), pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    void getChildDetail_shouldReturn_withAssessments() {
        User parent = TestDataFactory.createParent();
        Child child = TestDataFactory.createChild(parent);
        com.nutricare.domain.entity.Assessment assessment = TestDataFactory.createAssessment(child);
        var prediction = com.nutricare.domain.entity.Prediction.builder()
            .id("pred1")
            .assessment(assessment)
            .status(com.nutricare.domain.enums.StuntStatus.NORMAL)
            .predictionStatus(com.nutricare.domain.enums.PredictionStatus.COMPLETED)
            .build();

        when(childRepository.findById(child.getId())).thenReturn(java.util.Optional.of(child));
        when(assessmentRepository.findByChildIdOrderByCreatedAtDesc(child.getId()))
            .thenReturn(java.util.List.of(assessment));

        var result = childService.getChildDetail(child.getId(), parent.getId());

        assertNotNull(result);
        assertEquals(child.getName(), result.getName());
        assertFalse(result.getAssessments().isEmpty());
    }

    @Test
    void getChildDetail_shouldThrow_whenNotOwner() {
        User parent = TestDataFactory.createParent();
        User other = TestDataFactory.createParent();
        Child child = TestDataFactory.createChild(parent);

        when(childRepository.findById(child.getId())).thenReturn(java.util.Optional.of(child));

        assertThrows(ForbiddenException.class,
            () -> childService.getChildDetail(child.getId(), other.getId()));
    }

    @Test
    void updateChild_shouldThrow_whenNotFound() {
        ChildRequest request = new ChildRequest();
        request.setName("Nama");
        request.setGender(com.nutricare.domain.enums.Gender.MALE);
        request.setBirthDate(LocalDate.of(2023, 6, 15));

        when(childRepository.findByIdAndUserId(anyString(), anyString())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
            () -> childService.updateChild("x", request, "y"));
    }
}
