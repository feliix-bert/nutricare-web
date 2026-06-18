package com.nutricare.dto.response.chat;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

/**
 * Response chatbot AI.
 */
@Data
@Builder
public class ChatResponse {
    private String sessionId;
    private String predictionId;
    private String role;        // "assistant"
    private String content;     // balasan AI
    private OffsetDateTime timestamp;

    /**
     * Response untuk riwayat percakapan lengkap.
     */
    @Data
    @Builder
    public static class HistoryResponse {
        private String sessionId;
        private String predictionId;
        private List<Map<String, String>> messages;
    }
}
