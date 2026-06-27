package com.nutricare.service.impl;

import com.nutricare.TestDataFactory;
import com.nutricare.domain.entity.*;
import com.nutricare.domain.enums.PredictionStatus;
import com.nutricare.domain.enums.StuntStatus;
import com.nutricare.dto.request.assessment.AssessmentRequest;
import com.nutricare.exception.ForbiddenException;
import com.nutricare.repository.*;
import com.nutricare.util.ZScoreCalculator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AssessmentServiceTest {

    @Mock private AssessmentRepository assessmentRepository;
    @Mock private PredictionRepository predictionRepository;
    @Mock private ChildRepository childRepository;
    @Mock private BlockchainAnchorRepository blockchainAnchorRepository;
    @Mock private ZScoreCalculator zScoreCalculator;
    @Mock private PredictionService predictionService;

    private AssessmentService assessmentService;

    @BeforeEach
    void setUp() {
        assessmentService = new AssessmentService(
            assessmentRepository, predictionRepository, childRepository,
            blockchainAnchorRepository, zScoreCalculator, predictionService);
    }

    @Test
    void createAssessment_shouldSucceed() {
        User parent = TestDataFactory.createParent();
        Child child = TestDataFactory.createChild(parent);

        AssessmentRequest request = new AssessmentRequest();
        request.setChildId(child.getId());
        request.setWeight(BigDecimal.valueOf(10.5));
        request.setHeight(BigDecimal.valueOf(85.0));
        request.setHeadCircumference(BigDecimal.valueOf(48.0));
        request.setBfExclusive(true);
        request.setMpasiAge((short) 6);
        request.setMealFreq((short) 3);

        when(childRepository.findByIdAndUserId(child.getId(), parent.getId())).thenReturn(Optional.of(child));
        when(zScoreCalculator.calculateHeightForAge(anyDouble(), anyInt(), any())).thenReturn(BigDecimal.valueOf(-1.2));
        when(zScoreCalculator.calculateWeightForAge(anyDouble(), anyInt(), any())).thenReturn(BigDecimal.valueOf(-0.8));
        when(zScoreCalculator.calculateWeightForHeight(anyDouble(), anyDouble(), any())).thenReturn(BigDecimal.valueOf(-0.5));
        when(zScoreCalculator.determineStuntStatus(any())).thenReturn(StuntStatus.NORMAL);
        when(zScoreCalculator.determineRiskLevel(any())).thenReturn((short) 1);
        when(assessmentRepository.save(any(Assessment.class))).thenAnswer(inv -> inv.getArgument(0));
        when(predictionRepository.save(any(Prediction.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = assessmentService.createAssessment(request, parent.getId());

        assertNotNull(response);
        assertEquals(StuntStatus.NORMAL, response.getStatus());
        assertEquals(PredictionStatus.PENDING, response.getPredictionStatus());
    }

    @Test
    void createAssessment_shouldThrow_whenChildNotOwned() {
        User parent = TestDataFactory.createParent();
        User other = TestDataFactory.createParent();

        AssessmentRequest request = new AssessmentRequest();
        request.setChildId("child-other");
        request.setWeight(BigDecimal.valueOf(10.5));
        request.setHeight(BigDecimal.valueOf(85.0));
        request.setBfExclusive(true);
        request.setMealFreq((short) 3);

        when(childRepository.findByIdAndUserId(anyString(), anyString())).thenReturn(Optional.empty());

        assertThrows(ForbiddenException.class, () -> assessmentService.createAssessment(request, parent.getId()));
    }

    @Test
    void getAssessment_shouldSucceed() {
        User parent = TestDataFactory.createParent();
        Child child = TestDataFactory.createChild(parent);
        Assessment assessment = TestDataFactory.createAssessment(child);
        Prediction prediction = TestDataFactory.createPrediction(assessment);

        when(assessmentRepository.findById(assessment.getId())).thenReturn(Optional.of(assessment));
        when(predictionRepository.findByAssessmentId(assessment.getId())).thenReturn(Optional.of(prediction));

        var response = assessmentService.getAssessment(assessment.getId(), parent.getId());

        assertNotNull(response);
        assertEquals(StuntStatus.NORMAL, response.getStatus());
        assertEquals(-1.2, response.getZscoreHa().doubleValue(), 0.01);
    }

    @Test
    void getAssessment_shouldThrow_whenNotOwner() {
        User parent = TestDataFactory.createParent();
        User other = TestDataFactory.createUser(com.nutricare.domain.enums.Role.PARENT, "other@test.com", "Lain");
        Child child = TestDataFactory.createChild(parent);
        Assessment assessment = TestDataFactory.createAssessment(child);

        when(assessmentRepository.findById(assessment.getId())).thenReturn(Optional.of(assessment));

        assertThrows(ForbiddenException.class,
            () -> assessmentService.getAssessment(assessment.getId(), other.getId()));
    }

    @Test
    void getAssessmentsByChild_shouldReturnPage() {
        User parent = TestDataFactory.createParent();
        Child child = TestDataFactory.createChild(parent);
        Assessment assessment = TestDataFactory.createAssessment(child);
        Prediction prediction = TestDataFactory.createPrediction(assessment);

        PageRequest pageable = PageRequest.of(0, 10);

        when(childRepository.findByIdAndUserId(child.getId(), parent.getId())).thenReturn(Optional.of(child));
        when(assessmentRepository.findByChildIdOrderByCreatedAtDesc(child.getId(), pageable))
            .thenReturn(new PageImpl<>(List.of(assessment)));
        when(predictionRepository.findByAssessmentId(assessment.getId())).thenReturn(Optional.of(prediction));

        var result = assessmentService.getAssessmentsByChild(child.getId(), parent.getId(), pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals(StuntStatus.NORMAL, result.getData().get(0).getStatus());
    }
}
