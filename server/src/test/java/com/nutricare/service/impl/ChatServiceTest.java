package com.nutricare.service.impl;

import com.nutricare.TestDataFactory;
import com.nutricare.domain.entity.*;
import com.nutricare.domain.enums.PredictionStatus;
import com.nutricare.exception.ForbiddenException;
import com.nutricare.exception.ResourceNotFoundException;
import com.nutricare.repository.ChatSessionRepository;
import com.nutricare.repository.PredictionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock private ChatSessionRepository chatSessionRepository;
    @Mock private PredictionRepository predictionRepository;
    @Mock private GeminiService geminiService;

    private com.fasterxml.jackson.databind.ObjectMapper objectMapper;
    private ChatService chatService;

    @BeforeEach
    void setUp() {
        objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
        objectMapper.findAndRegisterModules();
        chatService = new ChatService(chatSessionRepository, predictionRepository, geminiService, objectMapper);
    }

    @Test
    void sendMessage_shouldSucceed() {
        User parent = TestDataFactory.createParent();
        Child child = TestDataFactory.createChild(parent);
        Assessment assessment = TestDataFactory.createAssessment(child);
        Prediction prediction = TestDataFactory.createPrediction(assessment);
        prediction.setPredictionStatus(PredictionStatus.COMPLETED);

        when(predictionRepository.findById(prediction.getId())).thenReturn(Optional.of(prediction));
        when(chatSessionRepository.findByPredictionId(prediction.getId())).thenReturn(Optional.empty());
        when(chatSessionRepository.save(any(ChatSession.class))).thenAnswer(inv -> inv.getArgument(0));
        when(geminiService.callText(anyString())).thenReturn("Anak Anda dalam kondisi gizi yang baik.");

        var response = chatService.sendMessage(prediction.getId(), "Bagaimana kondisi anak saya?", parent.getId());

        assertNotNull(response);
        assertEquals("assistant", response.getRole());
        assertTrue(response.getContent().contains("gizi"));
        verify(geminiService).callText(anyString());
    }

    @Test
    void sendMessage_shouldThrow_whenPredictionNotFound() {
        when(predictionRepository.findById(anyString())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
            () -> chatService.sendMessage("nonexistent", "Halo", "userid"));
    }

    @Test
    void sendMessage_shouldThrow_whenPredictionNotCompleted() {
        User parent = TestDataFactory.createParent();
        Child child = TestDataFactory.createChild(parent);
        Assessment assessment = TestDataFactory.createAssessment(child);
        Prediction prediction = TestDataFactory.createPrediction(assessment);
        prediction.setPredictionStatus(PredictionStatus.PENDING);

        when(predictionRepository.findById(prediction.getId())).thenReturn(Optional.of(prediction));

        assertThrows(ForbiddenException.class,
            () -> chatService.sendMessage(prediction.getId(), "Halo", parent.getId()));
    }

    @Test
    void sendMessage_shouldThrow_whenNotOwner() {
        User parent = TestDataFactory.createParent();
        User other = TestDataFactory.createParent();
        Child child = TestDataFactory.createChild(parent);
        Assessment assessment = TestDataFactory.createAssessment(child);
        Prediction prediction = TestDataFactory.createPrediction(assessment);
        prediction.setPredictionStatus(PredictionStatus.COMPLETED);

        when(predictionRepository.findById(prediction.getId())).thenReturn(Optional.of(prediction));

        ForbiddenException exception = assertThrows(ForbiddenException.class,
            () -> chatService.sendMessage(prediction.getId(), "Halo", other.getId()));
        assertTrue(exception.getMessage().contains("tidak memiliki akses"));
    }

    @Test
    void getChatHistory_shouldSucceed() {
        User parent = TestDataFactory.createParent();
        Child child = TestDataFactory.createChild(parent);
        Assessment assessment = TestDataFactory.createAssessment(child);
        Prediction prediction = TestDataFactory.createPrediction(assessment);
        ChatSession session = TestDataFactory.createChatSession(prediction);

        when(chatSessionRepository.findByPredictionId(prediction.getId())).thenReturn(Optional.of(session));

        var response = chatService.getChatHistory(prediction.getId(), parent.getId());

        assertNotNull(response);
        assertEquals(prediction.getId(), response.getPredictionId());
    }

    @Test
    void getChatHistory_shouldThrow_whenNotFound() {
        when(chatSessionRepository.findByPredictionId(anyString())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
            () -> chatService.getChatHistory("nonexistent", "userid"));
    }

    @Test
    void getChatHistory_shouldThrow_whenNotOwner() {
        User parent = TestDataFactory.createParent();
        User other = TestDataFactory.createParent();
        Child child = TestDataFactory.createChild(parent);
        Assessment assessment = TestDataFactory.createAssessment(child);
        Prediction prediction = TestDataFactory.createPrediction(assessment);
        ChatSession session = TestDataFactory.createChatSession(prediction);

        when(chatSessionRepository.findByPredictionId(prediction.getId())).thenReturn(Optional.of(session));

        assertThrows(ForbiddenException.class,
            () -> chatService.getChatHistory(prediction.getId(), other.getId()));
    }
}
