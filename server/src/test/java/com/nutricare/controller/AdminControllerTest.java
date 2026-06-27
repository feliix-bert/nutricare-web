package com.nutricare.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutricare.TestDataFactory;
import com.nutricare.controller.support.WithMockCustomUser;
import com.nutricare.domain.entity.User;
import com.nutricare.domain.enums.Role;
import com.nutricare.dto.request.admin.CreateUserRequest;
import com.nutricare.dto.request.admin.UpdateUserRoleRequest;
import com.nutricare.dto.request.admin.UpdateUserStatusRequest;
import com.nutricare.dto.response.admin.AdminCreateUserResponse;
import com.nutricare.dto.response.admin.AdminStatsResponse;
import com.nutricare.dto.response.admin.UserAdminResponse;
import com.nutricare.security.JwtUtil;
import com.nutricare.security.UserDetailsServiceImpl;
import com.nutricare.service.impl.AdminService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.context.annotation.Import;
import com.nutricare.config.SecurityConfig;
import com.nutricare.security.JwtAuthFilter;

@WebMvcTest(AdminController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class})
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AdminService adminService;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private UserDetailsServiceImpl userDetailsService;

    @Test
    @WithMockCustomUser(role = Role.PARENT)
    void anyEndpoint_asParent_shouldReturn403Forbidden() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockCustomUser(role = Role.ADMIN)
    void getUsers_asAdmin_shouldReturnPaginatedUsers() throws Exception {
        User user = TestDataFactory.createMedic();
        UserAdminResponse response = UserAdminResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .role(Role.MEDIC)
                .build();

        when(adminService.getUsers(eq("search"), eq(Role.MEDIC), any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(user)));
        when(adminService.toUserAdminResponse(any(User.class)))
                .thenReturn(response);

        mockMvc.perform(get("/api/admin/users?page=0&size=10&role=MEDIC&search=search"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].id").value(user.getId()))
                .andExpect(jsonPath("$.data[0].role").value("MEDIC"));
    }

    @Test
    @WithMockCustomUser(role = Role.ADMIN)
    void createUser_asAdmin_shouldReturnCreated() throws Exception {
        CreateUserRequest request = new CreateUserRequest();
        request.setName("Dokter Baru");
        request.setEmail("dokter@test.com");
        request.setPassword("password123");
        request.setRole(Role.MEDIC);

        AdminCreateUserResponse response = AdminCreateUserResponse.builder()
                .id("new-medic-id")
                .name("Dokter Baru")
                .email("dokter@test.com")
                .role(Role.MEDIC)
                .build();

        when(adminService.createUser(any(CreateUserRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/admin/users")
                        .with(SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("new-medic-id"))
                .andExpect(jsonPath("$.role").value("MEDIC"));
    }

    @Test
    @WithMockCustomUser(role = Role.ADMIN)
    void updateUserStatus_asAdmin_shouldReturnUpdated() throws Exception {
        UpdateUserStatusRequest request = new UpdateUserStatusRequest();
        request.setIsActive(false);

        UserAdminResponse response = UserAdminResponse.builder()
                .id("user-id")
                .isActive(false)
                .build();

        when(adminService.updateUserStatus(eq("user-id"), any(UpdateUserStatusRequest.class)))
                .thenReturn(response);

        mockMvc.perform(patch("/api/admin/users/user-id/status")
                        .with(SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isActive").value(false));
    }

    @Test
    @WithMockCustomUser(role = Role.ADMIN)
    void updateUserRole_asAdmin_shouldReturnUpdated() throws Exception {
        UpdateUserRoleRequest request = new UpdateUserRoleRequest();
        request.setRole(Role.ADMIN);

        UserAdminResponse response = UserAdminResponse.builder()
                .id("user-id")
                .role(Role.ADMIN)
                .build();

        when(adminService.updateUserRole(eq("user-id"), any(UpdateUserRoleRequest.class)))
                .thenReturn(response);

        mockMvc.perform(patch("/api/admin/users/user-id/role")
                        .with(SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    @WithMockCustomUser(role = Role.ADMIN)
    void getStats_asAdmin_shouldReturnStats() throws Exception {
        AdminStatsResponse response = AdminStatsResponse.builder()
                .totalUsers(10L)
                .totalChildren(50L)
                .build();

        when(adminService.getStats()).thenReturn(response);

        mockMvc.perform(get("/api/admin/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").value(10))
                .andExpect(jsonPath("$.totalChildren").value(50));
    }
}
