package com.nutricare.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutricare.TestDataFactory;
import com.nutricare.domain.entity.*;
import com.nutricare.domain.enums.PredictionStatus;
import com.nutricare.repository.PredictionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PredictionServiceTest {

    @Mock private PredictionRepository predictionRepository;
    @Mock private GeminiService geminiService;

    private ObjectMapper objectMapper;
    private PredictionService predictionService;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();
        predictionService = new PredictionService(predictionRepository, geminiService, objectMapper);
    }

    @Test
    void generatePredictionAsync_shouldParseGeminiResponse() {
        User parent = TestDataFactory.createParent();
        Child child = TestDataFactory.createChild(parent);
        Assessment assessment = TestDataFactory.createAssessment(child);
        Prediction prediction = TestDataFactory.createPrediction(assessment);
        prediction.setPredictionStatus(PredictionStatus.PENDING);

        String geminiResponse = """
            {
                "summary": "Anak dalam kondisi gizi baik, pertumbuhan normal sesuai usianya.",
                "recommendations": [
                    "Lanjutkan ASI eksklusif",
                    "Tambah variasi MPASI",
                    "Pantau berat badan setiap bulan"
                ],
                "nextAssessmentDate": "2026-10-01"
            }
            """;

        when(predictionRepository.findById(prediction.getId())).thenReturn(Optional.of(prediction));
        when(geminiService.callText(anyString())).thenReturn(geminiResponse);
        when(predictionRepository.save(any(Prediction.class))).thenAnswer(inv -> inv.getArgument(0));

        predictionService.generatePredictionAsync(prediction.getId(), assessment, child, 24);

        verify(predictionRepository).save(argThat(p ->
            p.getPredictionStatus() == PredictionStatus.COMPLETED
            && p.getSummary() != null
            && p.getRecommendations() != null
            && p.getRecommendations().size() == 3
        ));
    }

    @Test
    void generatePredictionAsync_shouldHandleGeminiError() {
        User parent = TestDataFactory.createParent();
        Child child = TestDataFactory.createChild(parent);
        Assessment assessment = TestDataFactory.createAssessment(child);
        Prediction prediction = TestDataFactory.createPrediction(assessment);
        prediction.setPredictionStatus(PredictionStatus.PENDING);

        when(predictionRepository.findById(prediction.getId())).thenReturn(Optional.of(prediction));
        when(geminiService.callText(anyString())).thenThrow(new RuntimeException("Gemini down"));

        predictionService.generatePredictionAsync(prediction.getId(), assessment, child, 24);

        verify(predictionRepository).save(argThat(p ->
            p.getPredictionStatus() == PredictionStatus.PENDING
        ));
    }

    @Test
    void generatePredictionAsync_shouldHandleInvalidJson() {
        User parent = TestDataFactory.createParent();
        Child child = TestDataFactory.createChild(parent);
        Assessment assessment = TestDataFactory.createAssessment(child);
        Prediction prediction = TestDataFactory.createPrediction(assessment);
        prediction.setPredictionStatus(PredictionStatus.PENDING);

        when(predictionRepository.findById(prediction.getId())).thenReturn(Optional.of(prediction));
        when(geminiService.callText(anyString())).thenReturn("{invalid json");

        predictionService.generatePredictionAsync(prediction.getId(), assessment, child, 24);

        verify(predictionRepository).save(argThat(p ->
            p.getPredictionStatus() == PredictionStatus.FAILED
        ));
    }

    @Test
    void generatePredictionAsync_shouldSkip_whenNotFound() {
        when(predictionRepository.findById(anyString())).thenReturn(Optional.empty());

        predictionService.generatePredictionAsync("nonexistent", null, null, 0);

        verify(predictionRepository, never()).save(any());
    }
}
