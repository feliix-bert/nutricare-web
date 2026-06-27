package com.nutricare.controller;

import com.nutricare.domain.entity.User;
import com.nutricare.domain.enums.Role;
import com.nutricare.dto.request.chat.ChatRequest;
import com.nutricare.dto.response.chat.ChatResponse;
import com.nutricare.exception.ResourceNotFoundException;
import com.nutricare.repository.ChatSessionRepository;
import com.nutricare.service.impl.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * ChatController — /api/chat/**
 *
 * BE-502: POST /api/chat — kirim pesan ke chatbot konsultasi
 * BE-503: GET  /api/chat/{predictionId} — riwayat percakapan
 */
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final ChatSessionRepository chatSessionRepository;

    /**
     * POST /api/chat
     * Kirim pesan ke chatbot konsultasi.
     * Hanya bisa diakses jika prediksi sudah COMPLETED (guard di service).
     */
    @PostMapping
    @PreAuthorize("hasRole('PARENT') or hasRole('ADMIN')")
    public ResponseEntity<ChatResponse> sendMessage(
            @Valid @RequestBody ChatRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(
                chatService.sendMessage(request.getPredictionId(), request.getMessage(), user.getId()));
    }

    /**
     * GET /api/chat/{predictionId}
     * Ambil riwayat percakapan untuk suatu prediksi.
     * PARENT → hanya miliknya sendiri (ownership check di service)
     * MEDIC & ADMIN → semua
     */
    @GetMapping("/{predictionId}")
    @PreAuthorize("hasRole('PARENT') or hasRole('MEDIC') or hasRole('ADMIN')")
    public ResponseEntity<ChatResponse.HistoryResponse> getChatHistory(
            @PathVariable String predictionId,
            @AuthenticationPrincipal User user) {
        String ownerId = user.getRole() == Role.PARENT
                ? user.getId()
                : chatSessionRepository.findByPredictionId(predictionId)
                        .orElseThrow(() -> new ResourceNotFoundException("Riwayat chat tidak ditemukan"))
                        .getPrediction().getAssessment().getChild().getUser().getId();
        return ResponseEntity.ok(chatService.getChatHistory(predictionId, ownerId));
    }
}
