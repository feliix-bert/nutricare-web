package com.nutricare.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutricare.TestDataFactory;
import com.nutricare.controller.support.WithMockCustomUser;
import com.nutricare.domain.entity.Child;
import com.nutricare.domain.entity.User;
import com.nutricare.domain.enums.Gender;
import com.nutricare.domain.enums.Role;
import com.nutricare.dto.request.child.ChildRequest;
import com.nutricare.dto.response.child.ChildDetailResponse;
import com.nutricare.dto.response.child.ChildResponse;
import com.nutricare.repository.ChildRepository;
import com.nutricare.security.JwtUtil;
import com.nutricare.security.UserDetailsServiceImpl;
import com.nutricare.service.impl.ChildService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.context.annotation.Import;
import com.nutricare.config.SecurityConfig;
import com.nutricare.security.JwtAuthFilter;

@WebMvcTest(ChildController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class})
class ChildControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ChildService childService;

    @MockBean
    private ChildRepository childRepository;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private UserDetailsServiceImpl userDetailsService;

    @Test
    @WithMockCustomUser(role = Role.PARENT, id = "parent-id")
    void getChildren_asParent_shouldReturnPaginatedOwnChildren() throws Exception {
        ChildResponse child = ChildResponse.builder()
                .id("child-1")
                .name("Anak 1")
                .build();

        when(childService.getChildren(eq("parent-id"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(child)));

        mockMvc.perform(get("/api/children?page=0&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].id").value("child-1"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockCustomUser(role = Role.MEDIC)
    void getChildren_asMedic_shouldReturnPaginatedAllChildren() throws Exception {
        User parent = TestDataFactory.createParent();
        Child childEntity = TestDataFactory.createChild(parent);
        childEntity.setId("child-1");

        ChildResponse childResponse = ChildResponse.builder()
                .id("child-1")
                .name("Anak 1")
                .build();

        when(childRepository.findAll(any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(childEntity)));
        when(childService.getChild("child-1", parent.getId()))
                .thenReturn(childResponse);

        mockMvc.perform(get("/api/children?page=0&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].id").value("child-1"));
    }

    @Test
    @WithMockCustomUser(role = Role.PARENT, id = "parent-id")
    void createChild_asParent_shouldSucceed() throws Exception {
        ChildRequest request = new ChildRequest();
        request.setName("Anak Baru");
        request.setGender(Gender.MALE);
        request.setBirthDate(LocalDate.now().minusMonths(12));

        ChildResponse response = ChildResponse.builder()
                .id("child-new")
                .name("Anak Baru")
                .build();

        when(childService.createChild(any(ChildRequest.class), eq("parent-id")))
                .thenReturn(response);

        mockMvc.perform(post("/api/children")
                        .with(SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("child-new"));
    }

    @Test
    @WithMockCustomUser(role = Role.MEDIC)
    void createChild_asMedic_shouldReturn403Forbidden() throws Exception {
        ChildRequest request = new ChildRequest();
        request.setName("Anak Baru");
        request.setGender(Gender.MALE);
        request.setBirthDate(LocalDate.now().minusMonths(12));

        mockMvc.perform(post("/api/children")
                        .with(SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockCustomUser(role = Role.PARENT, id = "parent-id")
    void getChild_asParent_shouldSucceed() throws Exception {
        ChildDetailResponse response = ChildDetailResponse.builder()
                .id("child-1")
                .name("Anak Detail")
                .build();

        when(childService.getChildDetail("child-1", "parent-id"))
                .thenReturn(response);

        mockMvc.perform(get("/api/children/child-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("child-1"));
    }

    @Test
    @WithMockCustomUser(role = Role.MEDIC)
    void getChild_asMedic_shouldAccessWithoutOwnershipCheck() throws Exception {
        User parent = TestDataFactory.createParent();
        parent.setId("parent-id");
        Child childEntity = TestDataFactory.createChild(parent);

        ChildDetailResponse response = ChildDetailResponse.builder()
                .id("child-1")
                .name("Anak Detail")
                .build();

        when(childRepository.findById("child-1")).thenReturn(Optional.of(childEntity));
        when(childService.getChildDetail("child-1", "parent-id"))
                .thenReturn(response);

        mockMvc.perform(get("/api/children/child-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("child-1"));
    }

    @Test
    @WithMockCustomUser(role = Role.PARENT, id = "parent-id")
    void updateChild_asParent_shouldSucceed() throws Exception {
        ChildRequest request = new ChildRequest();
        request.setName("Nama Baru");
        request.setGender(Gender.FEMALE);
        request.setBirthDate(LocalDate.now().minusMonths(12));

        ChildResponse response = ChildResponse.builder()
                .id("child-1")
                .name("Nama Baru")
                .build();

        when(childService.updateChild(eq("child-1"), any(ChildRequest.class), eq("parent-id")))
                .thenReturn(response);

        mockMvc.perform(put("/api/children/child-1")
                        .with(SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Nama Baru"));
    }
}
