package com.nutricare.controller;

import com.nutricare.TestDataFactory;
import com.nutricare.controller.support.WithMockCustomUser;
import com.nutricare.domain.entity.Assessment;
import com.nutricare.domain.entity.Child;
import com.nutricare.domain.entity.Prediction;
import com.nutricare.domain.entity.User;
import com.nutricare.domain.enums.Role;
import com.nutricare.domain.enums.StuntStatus;
import com.nutricare.repository.AssessmentRepository;
import com.nutricare.repository.ChildRepository;
import com.nutricare.repository.NutritionLogRepository;
import com.nutricare.repository.PredictionRepository;
import com.nutricare.security.JwtUtil;
import com.nutricare.security.UserDetailsServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.context.annotation.Import;
import com.nutricare.config.SecurityConfig;
import com.nutricare.security.JwtAuthFilter;

@WebMvcTest(MedicController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class})
class MedicControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ChildRepository childRepository;

    @MockBean
    private AssessmentRepository assessmentRepository;

    @MockBean
    private PredictionRepository predictionRepository;

    @MockBean
    private NutritionLogRepository nutritionLogRepository;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private UserDetailsServiceImpl userDetailsService;

    @Test
    @WithMockCustomUser(role = Role.PARENT)
    void getPatients_asParent_shouldReturn403Forbidden() throws Exception {
        mockMvc.perform(get("/api/medic/patients"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockCustomUser(role = Role.MEDIC)
    void getPatients_asMedic_shouldReturnPaginatedPatients() throws Exception {
        User parent = TestDataFactory.createParent();
        Child child = TestDataFactory.createChild(parent);
        child.setId("child-1");

        Assessment assessment = TestDataFactory.createAssessment(child);
        Prediction prediction = TestDataFactory.createPrediction(assessment);
        prediction.setStatus(StuntStatus.NORMAL);

        when(childRepository.findAll(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(child)));
        when(predictionRepository.findLatestByChildIds(List.of("child-1")))
                .thenReturn(List.of(prediction));

        mockMvc.perform(get("/api/medic/patients?page=0&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].id").value("child-1"))
                .andExpect(jsonPath("$.data[0].latestPrediction.status").value("NORMAL"));
    }

    @Test
    @WithMockCustomUser(role = Role.MEDIC)
    void getPatientSummary_asMedic_shouldReturnSummary() throws Exception {
        User parent = TestDataFactory.createParent();
        parent.setId("parent-id");
        Child child = TestDataFactory.createChild(parent);
        child.setId("child-1");

        Assessment assessment = TestDataFactory.createAssessment(child);
        assessment.setId("assess-1");

        Prediction prediction = TestDataFactory.createPrediction(assessment);

        when(childRepository.findById("child-1")).thenReturn(Optional.of(child));
        when(assessmentRepository.findByChildIdOrderByCreatedAtDesc("child-1"))
                .thenReturn(List.of(assessment));
        when(predictionRepository.findByAssessmentIdIn(List.of("assess-1")))
                .thenReturn(List.of(prediction));
        when(nutritionLogRepository.findTop7ByChildIdOrderByCreatedAtDesc("child-1"))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/medic/patients/child-1/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("child-1"))
                .andExpect(jsonPath("$.parent.id").value("parent-id"));
    }
}
