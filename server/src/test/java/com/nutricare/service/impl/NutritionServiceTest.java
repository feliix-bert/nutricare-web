package com.nutricare.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutricare.TestDataFactory;
import com.nutricare.domain.entity.Child;
import com.nutricare.domain.enums.Role;
import com.nutricare.domain.entity.NutritionLog;
import com.nutricare.domain.entity.User;
import com.nutricare.exception.ForbiddenException;
import com.nutricare.exception.ResourceNotFoundException;
import com.nutricare.exception.StorageException;
import com.nutricare.repository.ChildRepository;
import com.nutricare.repository.NutritionLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NutritionServiceTest {

    @Mock private NutritionLogRepository nutritionLogRepository;
    @Mock private ChildRepository childRepository;
    @Mock private StorageService storageService;
    @Mock private GeminiService geminiService;

    private ObjectMapper objectMapper;
    private NutritionService nutritionService;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();
        nutritionService = new NutritionService(nutritionLogRepository, childRepository,
            storageService, geminiService, objectMapper);
    }

    @Test
    void analyzeMealPhoto_shouldSucceed() throws Exception {
        User parent = TestDataFactory.createParent();
        Child child = TestDataFactory.createChild(parent);

        MultipartFile file = new MockMultipartFile(
            "photo", "meal.jpg", "image/jpeg", "test-image-content".getBytes());

        String geminiResponse = """
            {
                "foodDetected": ["Nasi", "Sayur bayam", "Tempe"],
                "portionEstimate": "1 porsi sedang",
                "calories": 350.0,
                "protein": 12.5,
                "carbs": 45.0,
                "fat": 8.0,
                "fiber": 3.5,
                "adequacyNote": "Porsi cukup",
                "mpasiRecommendation": "Tambahkan sumber protein hewani"
            }
            """;

        when(childRepository.findById(child.getId())).thenReturn(Optional.of(child));
        when(storageService.upload(any(), anyString(), anyString())).thenReturn("https://storage/meal.jpg");
        when(geminiService.callVision(anyString(), anyString())).thenReturn(geminiResponse);
        when(nutritionLogRepository.save(any(NutritionLog.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = nutritionService.analyzeMealPhoto(child.getId(), file, parent.getId());

        assertNotNull(response);
        assertTrue(response.getFoodDetected().contains("Nasi"));
        assertEquals(350.0, response.getCalories().doubleValue(), 0.1);
        assertEquals(12.5, response.getProtein().doubleValue(), 0.1);
    }

    @Test
    void analyzeMealPhoto_shouldThrow_whenNotOwner() {
        User parent = TestDataFactory.createParent();
        User other = TestDataFactory.createParent();
        Child child = TestDataFactory.createChild(parent);

        MultipartFile file = new MockMultipartFile(
            "photo", "meal.jpg", "image/jpeg", "test".getBytes());

        when(childRepository.findById(child.getId())).thenReturn(Optional.of(child));

        assertThrows(ForbiddenException.class,
            () -> nutritionService.analyzeMealPhoto(child.getId(), file, other.getId()));
    }

    @Test
    void analyzeMealPhoto_shouldThrow_whenFileEmpty() {
        User parent = TestDataFactory.createParent();
        Child child = TestDataFactory.createChild(parent);

        MultipartFile emptyFile = new MockMultipartFile(
            "photo", "empty.jpg", "image/jpeg", new byte[0]);

        when(childRepository.findById(child.getId())).thenReturn(Optional.of(child));

        assertThrows(StorageException.class,
            () -> nutritionService.analyzeMealPhoto(child.getId(), emptyFile, parent.getId()));
    }

    @Test
    void analyzeMealPhoto_shouldThrow_whenInvalidContentType() {
        User parent = TestDataFactory.createParent();
        Child child = TestDataFactory.createChild(parent);

        MultipartFile badFile = new MockMultipartFile(
            "photo", "file.pdf", "application/pdf", "test".getBytes());

        when(childRepository.findById(child.getId())).thenReturn(Optional.of(child));

        assertThrows(StorageException.class,
            () -> nutritionService.analyzeMealPhoto(child.getId(), badFile, parent.getId()));
    }

    @Test
    void getNutritionHistory_shouldSucceed() {
        User parent = TestDataFactory.createParent();
        Child child = TestDataFactory.createChild(parent);
        NutritionLog log = TestDataFactory.createNutritionLog(child);

        PageRequest pageable = PageRequest.of(0, 10);

        when(childRepository.findByIdAndUserId(child.getId(), parent.getId())).thenReturn(Optional.of(child));
        when(nutritionLogRepository.findByChildIdOrderByCreatedAtDesc(child.getId(), pageable))
            .thenReturn(new PageImpl<>(List.of(log)));

        Page<com.nutricare.dto.response.nutrition.NutritionResponse> result =
            nutritionService.getNutritionHistory(child.getId(), parent.getId(), pageable);

        assertEquals(1, result.getTotalElements());
        assertTrue(result.getContent().get(0).getFoodDetected().contains("Nasi"));
    }

    @Test
    void getNutritionHistory_shouldThrow_whenChildNotOwned() {
        User parent = TestDataFactory.createParent();
        User other = TestDataFactory.createParent();
        Child child = TestDataFactory.createChild(parent);

        when(childRepository.findByIdAndUserId(child.getId(), other.getId())).thenReturn(Optional.empty());

        PageRequest pageable = PageRequest.of(0, 10);

        assertThrows(ForbiddenException.class,
            () -> nutritionService.getNutritionHistory(child.getId(), other.getId(), pageable));
    }

    @Test
    void deleteNutritionLog_shouldSucceed_forOwner() {
        User parent = TestDataFactory.createParent();
        Child child = TestDataFactory.createChild(parent);
        NutritionLog log = TestDataFactory.createNutritionLog(child);

        when(nutritionLogRepository.findById(log.getId())).thenReturn(Optional.of(log));

        assertDoesNotThrow(() ->
            nutritionService.deleteNutritionLog(log.getId(), parent.getId(), Role.PARENT));
        verify(nutritionLogRepository).delete(log);
    }

    @Test
    void deleteNutritionLog_shouldSucceed_forMedic() {
        User parent = TestDataFactory.createParent();
        User medic = TestDataFactory.createMedic();
        Child child = TestDataFactory.createChild(parent);
        NutritionLog log = TestDataFactory.createNutritionLog(child);

        when(nutritionLogRepository.findById(log.getId())).thenReturn(Optional.of(log));

        assertDoesNotThrow(() ->
            nutritionService.deleteNutritionLog(log.getId(), medic.getId(), Role.MEDIC));
        verify(nutritionLogRepository).delete(log);
    }

    @Test
    void deleteNutritionLog_shouldThrow_whenNotOwner() {
        User parent = TestDataFactory.createParent();
        User other = TestDataFactory.createParent();
        Child child = TestDataFactory.createChild(parent);
        NutritionLog log = TestDataFactory.createNutritionLog(child);

        when(nutritionLogRepository.findById(log.getId())).thenReturn(Optional.of(log));

        assertThrows(ForbiddenException.class,
            () -> nutritionService.deleteNutritionLog(log.getId(), other.getId(), Role.PARENT));
        verify(nutritionLogRepository, never()).delete(any());
    }

    @Test
    void deleteNutritionLog_shouldThrow_whenNotFound() {
        when(nutritionLogRepository.findById("notfound")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
            () -> nutritionService.deleteNutritionLog("notfound", "user", Role.PARENT));
    }
}
