package com.nutricare.controller;

import com.nutricare.TestDataFactory;
import com.nutricare.controller.support.WithMockCustomUser;
import com.nutricare.domain.entity.Child;
import com.nutricare.domain.entity.User;
import com.nutricare.domain.enums.Role;
import com.nutricare.repository.ChildRepository;
import com.nutricare.security.JwtUtil;
import com.nutricare.security.UserDetailsServiceImpl;
import com.nutricare.service.impl.ReportService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.context.annotation.Import;
import com.nutricare.config.SecurityConfig;
import com.nutricare.security.JwtAuthFilter;

@WebMvcTest(ReportController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class})
class ReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReportService reportService;

    @MockBean
    private ChildRepository childRepository;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private UserDetailsServiceImpl userDetailsService;

    @Test
    @WithMockCustomUser(role = Role.PARENT, id = "parent-id")
    void downloadReport_asParent_shouldSucceed() throws Exception {
        byte[] pdfBytes = "pdf-content".getBytes();

        when(reportService.generateChildReport(eq("child-id"), eq("parent-id"), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(pdfBytes);

        mockMvc.perform(get("/api/reports/child/child-id?from=2026-06-01&to=2026-06-28"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"laporan-anak-child-id.pdf\""))
                .andExpect(content().bytes(pdfBytes));

        verify(reportService).generateChildReport(eq("child-id"), eq("parent-id"), eq(LocalDate.parse("2026-06-01")), eq(LocalDate.parse("2026-06-28")));
    }

    @Test
    @WithMockCustomUser(role = Role.MEDIC)
    void downloadReport_asMedic_shouldResolveOwnerIdAndSucceed() throws Exception {
        User parent = TestDataFactory.createParent();
        parent.setId("parent-owner-id");
        Child child = TestDataFactory.createChild(parent);

        byte[] pdfBytes = "pdf-content".getBytes();

        when(childRepository.findById("child-id")).thenReturn(Optional.of(child));
        when(reportService.generateChildReport(eq("child-id"), eq("parent-owner-id"), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(pdfBytes);

        mockMvc.perform(get("/api/reports/child/child-id"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(content().bytes(pdfBytes));
    }
}
