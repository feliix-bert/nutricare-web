package com.nutricare.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutricare.TestDataFactory;
import com.nutricare.controller.support.WithMockCustomUser;
import com.nutricare.domain.entity.Assessment;
import com.nutricare.domain.entity.Child;
import com.nutricare.domain.entity.User;
import com.nutricare.domain.enums.Role;
import com.nutricare.dto.request.blockchain.AnchorRequest;
import com.nutricare.dto.response.blockchain.AnchorResponse;
import com.nutricare.dto.response.blockchain.VerifyResponse;
import com.nutricare.repository.AssessmentRepository;
import com.nutricare.security.JwtUtil;
import com.nutricare.security.UserDetailsServiceImpl;
import com.nutricare.service.impl.BlockchainService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.context.annotation.Import;
import com.nutricare.config.SecurityConfig;
import com.nutricare.security.JwtAuthFilter;

@WebMvcTest(BlockchainController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class})
class BlockchainControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BlockchainService blockchainService;

    @MockBean
    private AssessmentRepository assessmentRepository;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private UserDetailsServiceImpl userDetailsService;

    @Test
    @WithMockCustomUser(role = Role.PARENT, id = "parent-id")
    void anchorAssessment_asParent_shouldVerifyOwnershipAndSucceed() throws Exception {
        AnchorRequest request = new AnchorRequest();
        request.setAssessmentId("assess-id");

        User parent = TestDataFactory.createParent();
        parent.setId("parent-id");
        Child child = TestDataFactory.createChild(parent);
        Assessment assessment = TestDataFactory.createAssessment(child);

        AnchorResponse response = AnchorResponse.builder()
                .txHash("0x123")
                .build();

        when(assessmentRepository.findById("assess-id")).thenReturn(Optional.of(assessment));
        when(blockchainService.anchorAssessment("assess-id")).thenReturn(response);

        mockMvc.perform(post("/api/blockchain/anchor")
                        .with(SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.txHash").value("0x123"));

        verify(blockchainService).anchorAssessment("assess-id");
    }

    @Test
    @WithMockCustomUser(role = Role.PARENT, id = "other-parent-id")
    void anchorAssessment_asParent_whenNotOwner_shouldReturn403Forbidden() throws Exception {
        AnchorRequest request = new AnchorRequest();
        request.setAssessmentId("assess-id");

        User parent = TestDataFactory.createParent();
        parent.setId("parent-id");
        Child child = TestDataFactory.createChild(parent);
        Assessment assessment = TestDataFactory.createAssessment(child);

        when(assessmentRepository.findById("assess-id")).thenReturn(Optional.of(assessment));

        mockMvc.perform(post("/api/blockchain/anchor")
                        .with(SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockCustomUser(role = Role.ADMIN)
    void anchorAssessment_asAdmin_shouldSkipOwnershipAndSucceed() throws Exception {
        AnchorRequest request = new AnchorRequest();
        request.setAssessmentId("assess-id");

        AnchorResponse response = AnchorResponse.builder()
                .txHash("0x123")
                .build();

        when(blockchainService.anchorAssessment("assess-id")).thenReturn(response);

        mockMvc.perform(post("/api/blockchain/anchor")
                        .with(SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.txHash").value("0x123"));
    }

    @Test
    @WithMockCustomUser(role = Role.MEDIC)
    void anchorAssessment_asMedic_shouldReturn403Forbidden() throws Exception {
        AnchorRequest request = new AnchorRequest();
        request.setAssessmentId("assess-id");

        mockMvc.perform(post("/api/blockchain/anchor")
                        .with(SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void verifyAssessment_isPublic_shouldSucceed() throws Exception {
        VerifyResponse response = VerifyResponse.builder()
                .isValid(true)
                .build();

        when(blockchainService.verifyAssessment("assess-id")).thenReturn(response);

        mockMvc.perform(get("/api/blockchain/verify/assess-id"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isValid").value(true));
    }
}
