package com.nutricare.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutricare.TestDataFactory;
import com.nutricare.controller.support.WithMockCustomUser;
import com.nutricare.domain.entity.Assessment;
import com.nutricare.domain.entity.ChatSession;
import com.nutricare.domain.entity.Child;
import com.nutricare.domain.entity.Prediction;
import com.nutricare.domain.entity.User;
import com.nutricare.domain.enums.Role;
import com.nutricare.dto.request.chat.ChatRequest;
import com.nutricare.dto.response.chat.ChatResponse;
import com.nutricare.repository.ChatSessionRepository;
import com.nutricare.security.JwtUtil;
import com.nutricare.security.UserDetailsServiceImpl;
import com.nutricare.service.impl.ChatService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
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

@WebMvcTest(ChatController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class})
class ChatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ChatService chatService;

    @MockBean
    private ChatSessionRepository chatSessionRepository;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private UserDetailsServiceImpl userDetailsService;

    @Test
    @WithMockCustomUser(role = Role.PARENT, id = "parent-id")
    void sendMessage_asParent_shouldCallService() throws Exception {
        ChatRequest request = new ChatRequest();
        request.setPredictionId("pred-id");
        request.setMessage("Halo");

        ChatResponse response = ChatResponse.builder()
                .content("Hai")
                .build();

        when(chatService.sendMessage("pred-id", "Halo", "parent-id"))
                .thenReturn(response);

        mockMvc.perform(post("/api/chat")
                        .with(SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").value("Hai"));

        verify(chatService).sendMessage("pred-id", "Halo", "parent-id");
    }

    @Test
    @WithMockCustomUser(role = Role.MEDIC)
    void sendMessage_asMedic_shouldReturn403Forbidden() throws Exception {
        ChatRequest request = new ChatRequest();
        request.setPredictionId("pred-id");
        request.setMessage("Halo");

        mockMvc.perform(post("/api/chat")
                        .with(SecurityMockMvcRequestPostProcessors.csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockCustomUser(role = Role.PARENT, id = "parent-id")
    void getChatHistory_asParent_shouldPassOwnUserId() throws Exception {
        ChatResponse.HistoryResponse response = ChatResponse.HistoryResponse.builder()
                .messages(List.of())
                .build();

        when(chatService.getChatHistory("pred-id", "parent-id"))
                .thenReturn(response);

        mockMvc.perform(get("/api/chat/pred-id"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockCustomUser(role = Role.MEDIC)
    void getChatHistory_asMedic_shouldResolveOwnerIdAndSucceed() throws Exception {
        User parent = TestDataFactory.createParent();
        parent.setId("parent-owner-id");
        Child child = TestDataFactory.createChild(parent);
        Assessment assessment = TestDataFactory.createAssessment(child);
        Prediction prediction = TestDataFactory.createPrediction(assessment);
        ChatSession session = TestDataFactory.createChatSession(prediction);

        ChatResponse.HistoryResponse response = ChatResponse.HistoryResponse.builder()
                .messages(List.of())
                .build();

        when(chatSessionRepository.findByPredictionId("pred-id"))
                .thenReturn(Optional.of(session));
        when(chatService.getChatHistory("pred-id", "parent-owner-id"))
                .thenReturn(response);

        mockMvc.perform(get("/api/chat/pred-id"))
                .andExpect(status().isOk());
    }
}
