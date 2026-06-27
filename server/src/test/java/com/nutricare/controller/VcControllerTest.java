package com.nutricare.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutricare.controller.support.WithMockCustomUser;
import com.nutricare.domain.enums.Role;
import com.nutricare.domain.enums.VcType;
import com.nutricare.dto.request.vc.IssueVcRequest;
import com.nutricare.dto.request.vc.RevokeVcRequest;
import com.nutricare.dto.response.vc.IssueVcResponse;
import com.nutricare.dto.response.vc.VcDetailResponse;
import com.nutricare.dto.response.vc.VcStatusResponse;
import com.nutricare.dto.response.vc.VerifyQrResponse;
import com.nutricare.security.JwtUtil;
import com.nutricare.security.UserDetailsServiceImpl;
import com.nutricare.service.impl.VcService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.context.annotation.Import;
import com.nutricare.config.SecurityConfig;
import com.nutricare.security.JwtAuthFilter;

@WebMvcTest(VcController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class})
class VcControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private VcService vcService;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private UserDetailsServiceImpl userDetailsService;

    @Test
    @WithMockCustomUser(role = Role.MEDIC, id = "medic-id")
    void issueVc_asMedic_shouldReturn201Created() throws Exception {
        IssueVcRequest request = new IssueVcRequest();
        request.setChildId("child-id");
        request.setVcType(VcType.NUTRITION_STATUS);

        IssueVcResponse response = IssueVcResponse.builder()
                .id("vc-id")
                .ipfsCid("Qm123")
                .build();

        when(vcService.issueVc(any(IssueVcRequest.class), eq("medic-id"))).thenReturn(response);

        mockMvc.perform(post("/api/vc/issue")
                        .with(SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("vc-id"));

        verify(vcService).issueVc(any(IssueVcRequest.class), eq("medic-id"));
    }

    @Test
    @WithMockCustomUser(role = Role.PARENT)
    void issueVc_asParent_shouldReturn403Forbidden() throws Exception {
        IssueVcRequest request = new IssueVcRequest();
        request.setChildId("child-id");
        request.setVcType(VcType.NUTRITION_STATUS);

        mockMvc.perform(post("/api/vc/issue")
                        .with(SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void getVc_isPublic_shouldReturnDetails() throws Exception {
        VcDetailResponse response = VcDetailResponse.builder()
                .id("vc-id")
                .build();

        when(vcService.getVc("vc-id")).thenReturn(response);

        mockMvc.perform(get("/api/vc/vc-id"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("vc-id"));
    }

    @Test
    void getVcByChild_isPublic_shouldReturnStatus() throws Exception {
        VcStatusResponse response = VcStatusResponse.builder()
                .vc(VcDetailResponse.builder().id("vc-id").build())
                .build();

        when(vcService.getVcByChild("child-id")).thenReturn(response);

        mockMvc.perform(get("/api/vc/child/child-id"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.vc.id").value("vc-id"));
    }

    @Test
    @WithMockCustomUser(role = Role.MEDIC, id = "medic-id")
    void revokeVc_asMedic_shouldReturnUpdatedVc() throws Exception {
        RevokeVcRequest request = new RevokeVcRequest();
        request.setVcId("vc-id");

        VcDetailResponse response = VcDetailResponse.builder()
                .id("vc-id")
                .isRevoked(true)
                .build();

        when(vcService.revokeVc(any(RevokeVcRequest.class), eq("medic-id"))).thenReturn(response);

        mockMvc.perform(post("/api/vc/revoke")
                        .with(SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("vc-id"))
                .andExpect(jsonPath("$.isRevoked").value(true));
    }

    @Test
    void verifyQr_isPublic_shouldReturnStatus() throws Exception {
        VerifyQrResponse response = VerifyQrResponse.builder()
                .valid(true)
                .build();

        when(vcService.verifyQr("qr-payload")).thenReturn(response);

        mockMvc.perform(get("/api/verify?qr=qr-payload"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true));
    }
}
