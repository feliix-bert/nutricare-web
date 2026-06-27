package com.nutricare.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutricare.TestDataFactory;
import com.nutricare.controller.support.WithMockCustomUser;
import com.nutricare.domain.entity.Assessment;
import com.nutricare.domain.entity.Child;
import com.nutricare.domain.entity.User;
import com.nutricare.domain.enums.Role;
import com.nutricare.dto.request.assessment.AssessmentRequest;
import com.nutricare.dto.response.prediction.PredictionResponse;
import com.nutricare.repository.AssessmentRepository;
import com.nutricare.repository.PredictionRepository;
import com.nutricare.security.JwtUtil;
import com.nutricare.security.UserDetailsServiceImpl;
import com.nutricare.service.impl.AssessmentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.context.annotation.Import;
import com.nutricare.config.SecurityConfig;
import com.nutricare.security.JwtAuthFilter;

@WebMvcTest(AssessmentController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class})
class AssessmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AssessmentService assessmentService;

    @MockBean
    private AssessmentRepository assessmentRepository;

    @MockBean
    private PredictionRepository predictionRepository;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private UserDetailsServiceImpl userDetailsService;

    @Test
    @WithMockCustomUser(role = Role.PARENT, id = "parent-id")
    void createAssessment_asParent_shouldSucceed() throws Exception {
        AssessmentRequest request = new AssessmentRequest();
        request.setChildId("child-id");
        request.setWeight(BigDecimal.valueOf(12.5));
        request.setHeight(BigDecimal.valueOf(90.0));
        request.setBfExclusive(true);
        request.setMealFreq((short) 3);

        PredictionResponse response = PredictionResponse.builder()
                .id("pred-id")
                .summary("Sehat")
                .build();

        when(assessmentService.createAssessment(any(AssessmentRequest.class), eq("parent-id")))
                .thenReturn(response);

        mockMvc.perform(post("/api/assessments")
                        .with(SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("pred-id"));
    }

    @Test
    @WithMockCustomUser(role = Role.MEDIC)
    void createAssessment_asMedic_shouldReturn403Forbidden() throws Exception {
        AssessmentRequest request = new AssessmentRequest();
        request.setChildId("child-id");
        request.setWeight(BigDecimal.valueOf(12.5));
        request.setHeight(BigDecimal.valueOf(90.0));
        request.setBfExclusive(true);
        request.setMealFreq((short) 3);

        mockMvc.perform(post("/api/assessments")
                        .with(SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockCustomUser(role = Role.PARENT, id = "parent-id")
    void getAssessment_asParent_shouldPassOwnUserId() throws Exception {
        PredictionResponse response = PredictionResponse.builder()
                .id("pred-id")
                .summary("Sehat")
                .build();

        when(assessmentService.getAssessment("assess-id", "parent-id"))
                .thenReturn(response);

        mockMvc.perform(get("/api/assessments/assess-id"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("pred-id"));
    }

    @Test
    @WithMockCustomUser(role = Role.MEDIC)
    void getAssessment_asMedic_shouldResolveOwnerIdAndSucceed() throws Exception {
        User parent = TestDataFactory.createParent();
        parent.setId("parent-owner-id");
        Child child = TestDataFactory.createChild(parent);
        Assessment assessment = TestDataFactory.createAssessment(child);

        PredictionResponse response = PredictionResponse.builder()
                .id("pred-id")
                .build();

        when(assessmentRepository.findById("assess-id")).thenReturn(Optional.of(assessment));
        when(assessmentService.getAssessment("assess-id", "parent-owner-id"))
                .thenReturn(response);

        mockMvc.perform(get("/api/assessments/assess-id"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockCustomUser(role = Role.PARENT, id = "parent-id")
    void getAssessmentsByChild_asParent_shouldPassOwnUserId() throws Exception {
        PredictionResponse response = PredictionResponse.builder()
                .id("pred-id")
                .build();

        when(assessmentService.getAssessmentsByChild(eq("child-id"), eq("parent-id"), any(Pageable.class)))
                .thenReturn(com.nutricare.dto.response.PageResponse.<PredictionResponse>builder().data(List.of(response)).page(0).size(10).totalElements(1).totalPages(1).build());

        mockMvc.perform(get("/api/assessments/child/child-id"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].id").value("pred-id"));
    }

    @Test
    @WithMockCustomUser(role = Role.MEDIC, id = "medic-id")
    void getAssessmentsByChild_asMedic_shouldResolveOwnerIdAndSucceed() throws Exception {
        User parent = TestDataFactory.createParent();
        parent.setId("parent-owner-id");
        Child child = TestDataFactory.createChild(parent);
        Assessment assessment = TestDataFactory.createAssessment(child);

        PredictionResponse response = PredictionResponse.builder()
                .id("pred-id")
                .build();

        when(assessmentRepository.findFirstByChildIdOrderByCreatedAtDesc("child-id"))
                .thenReturn(Optional.of(assessment));
        when(assessmentService.getAssessmentsByChild(eq("child-id"), eq("parent-owner-id"), any(Pageable.class)))
                .thenReturn(com.nutricare.dto.response.PageResponse.<PredictionResponse>builder().data(List.of(response)).page(0).size(10).totalElements(1).totalPages(1).build());

        mockMvc.perform(get("/api/assessments/child/child-id"))
                .andExpect(status().isOk());
    }
}
