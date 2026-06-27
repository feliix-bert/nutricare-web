package com.nutricare.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutricare.TestDataFactory;
import com.nutricare.controller.support.WithMockCustomUser;
import com.nutricare.domain.entity.User;
import com.nutricare.domain.enums.Role;
import com.nutricare.dto.request.auth.LoginRequest;
import com.nutricare.dto.request.auth.RefreshTokenRequest;
import com.nutricare.dto.request.auth.RegisterRequest;
import com.nutricare.dto.response.auth.AuthResponse;
import com.nutricare.security.JwtUtil;
import com.nutricare.security.UserDetailsServiceImpl;
import com.nutricare.service.impl.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.context.annotation.Import;
import com.nutricare.config.SecurityConfig;
import com.nutricare.security.JwtAuthFilter;

@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class})
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private UserDetailsServiceImpl userDetailsService;

    @Test
    void register_shouldReturn21Created() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setName("Ani");
        request.setEmail("ani@test.com");
        request.setPassword("password123");

        User user = TestDataFactory.createUser(Role.PARENT, "ani@test.com", "Ani");
        AuthResponse response = AuthResponse.builder()
                .accessToken("access")
                .refreshToken("refresh")
                .user(AuthResponse.UserResponse.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .isActive(user.getIsActive())
                        .build())
                .build();

        when(authService.register(any(RegisterRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/register")
                        .with(SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").value("access"))
                .andExpect(jsonPath("$.user.name").value("Ani"));

        verify(authService).register(any(RegisterRequest.class));
    }

    @Test
    void login_shouldReturn200Ok() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("parent@test.com");
        request.setPassword("password123");

        AuthResponse response = AuthResponse.builder()
                .accessToken("access")
                .refreshToken("refresh")
                .build();

        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .with(SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("access"));

        verify(authService).login(any(LoginRequest.class));
    }

    @Test
    void refresh_shouldReturn200Ok() throws Exception {
        RefreshTokenRequest request = new RefreshTokenRequest();
        request.setRefreshToken("refresh-token");

        AuthResponse response = AuthResponse.builder()
                .accessToken("new-access")
                .refreshToken("new-refresh")
                .build();

        when(authService.refresh(any(RefreshTokenRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/refresh")
                        .with(SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("new-access"));

        verify(authService).refresh(any(RefreshTokenRequest.class));
    }

    @Test
    void logout_shouldReturn200Ok() throws Exception {
        RefreshTokenRequest request = new RefreshTokenRequest();
        request.setRefreshToken("refresh-token");

        doNothing().when(authService).logout(anyString());

        mockMvc.perform(post("/api/auth/logout")
                        .with(SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Logout berhasil"));

        verify(authService).logout("refresh-token");
    }

    @Test
    @WithMockCustomUser(role = Role.PARENT, email = "parent@test.com", name = "Orang Tua")
    void me_shouldReturn200Ok_whenAuthenticated() throws Exception {
        AuthResponse.UserResponse response = AuthResponse.UserResponse.builder()
                .id("some-id")
                .email("parent@test.com")
                .name("Orang Tua")
                .role(Role.PARENT)
                .isActive(true)
                .build();

        // Di Controller, me() memanggil authService.getMe(user.getId())
        when(authService.getMe(anyString())).thenReturn(response);

        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("parent@test.com"))
                .andExpect(jsonPath("$.name").value("Orang Tua"))
                .andExpect(jsonPath("$.role").value("PARENT"));
    }

    @Test
    void me_shouldReturn403Forbidden_whenNotAuthenticated() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isForbidden());
    }
}
