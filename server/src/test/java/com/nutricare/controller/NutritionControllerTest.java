package com.nutricare.controller;

import com.nutricare.TestDataFactory;
import com.nutricare.controller.support.WithMockCustomUser;
import com.nutricare.domain.entity.Child;
import com.nutricare.domain.entity.User;
import com.nutricare.domain.enums.Role;
import com.nutricare.dto.response.nutrition.NutritionResponse;
import com.nutricare.repository.ChildRepository;
import com.nutricare.security.JwtUtil;
import com.nutricare.security.UserDetailsServiceImpl;
import com.nutricare.service.impl.NutritionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.context.annotation.Import;
import com.nutricare.config.SecurityConfig;
import com.nutricare.security.JwtAuthFilter;

@WebMvcTest(NutritionController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class})
class NutritionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private NutritionService nutritionService;

    @MockBean
    private ChildRepository childRepository;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private UserDetailsServiceImpl userDetailsService;

    @Test
    @WithMockCustomUser(role = Role.PARENT, id = "parent-id")
    void analyzeNutrition_asParent_shouldSucceed() throws Exception {
        MockMultipartFile photo = new MockMultipartFile(
                "photo", "meal.jpg", MediaType.IMAGE_JPEG_VALUE, "photo-content".getBytes());

        NutritionResponse response = NutritionResponse.builder()
                .id("log-id")
                .calories(java.math.BigDecimal.valueOf(350))
                .build();

        when(nutritionService.analyzeMealPhoto(eq("child-id"), any(MultipartFile.class), eq("parent-id")))
                .thenReturn(response);

        mockMvc.perform(multipart("/api/nutrition")
                        .file(photo)
                        .param("childId", "child-id")
                        .with(SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("log-id"));
    }

    @Test
    @WithMockCustomUser(role = Role.MEDIC)
    void analyzeNutrition_asMedic_shouldReturn403Forbidden() throws Exception {
        MockMultipartFile photo = new MockMultipartFile(
                "photo", "meal.jpg", MediaType.IMAGE_JPEG_VALUE, "photo-content".getBytes());

        mockMvc.perform(multipart("/api/nutrition")
                        .file(photo)
                        .param("childId", "child-id")
                        .with(SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockCustomUser(role = Role.PARENT, id = "parent-id")
    void getNutritionHistory_asParent_shouldPassOwnUserId() throws Exception {
        NutritionResponse response = NutritionResponse.builder()
                .id("log-id")
                .build();

        when(nutritionService.getNutritionHistory(eq("child-id"), eq("parent-id"), any(Pageable.class)))
                .thenReturn(com.nutricare.dto.response.PageResponse.<NutritionResponse>builder().data(List.of(response)).page(0).size(10).totalElements(1).totalPages(1).build());

        mockMvc.perform(get("/api/nutrition/child/child-id"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].id").value("log-id"));
    }

    @Test
    @WithMockCustomUser(role = Role.MEDIC)
    void getNutritionHistory_asMedic_shouldResolveOwnerIdAndSucceed() throws Exception {
        User parent = TestDataFactory.createParent();
        parent.setId("parent-owner-id");
        Child child = TestDataFactory.createChild(parent);

        NutritionResponse response = NutritionResponse.builder()
                .id("log-id")
                .build();

        when(childRepository.findById("child-id")).thenReturn(Optional.of(child));
        when(nutritionService.getNutritionHistory(eq("child-id"), eq("parent-owner-id"), any(Pageable.class)))
                .thenReturn(com.nutricare.dto.response.PageResponse.<NutritionResponse>builder().data(List.of(response)).page(0).size(10).totalElements(1).totalPages(1).build());

        mockMvc.perform(get("/api/nutrition/child/child-id"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockCustomUser(role = Role.PARENT, id = "parent-id")
    void deleteNutritionLog_asParent_shouldCallService() throws Exception {
        doNothing().when(nutritionService).deleteNutritionLog("log-id", "parent-id", Role.PARENT);

        mockMvc.perform(delete("/api/nutrition/log-id")
                        .with(SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isNoContent());

        verify(nutritionService).deleteNutritionLog("log-id", "parent-id", Role.PARENT);
    }
}
