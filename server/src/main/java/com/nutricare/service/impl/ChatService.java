package com.nutricare.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutricare.domain.entity.ChatSession;
import com.nutricare.domain.entity.Prediction;
import com.nutricare.domain.enums.PredictionStatus;
import com.nutricare.dto.response.chat.ChatResponse;
import com.nutricare.exception.ForbiddenException;
import com.nutricare.exception.ResourceNotFoundException;
import com.nutricare.repository.ChatSessionRepository;
import com.nutricare.repository.PredictionRepository;
import com.nutricare.util.CuidGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Service untuk chatbot konsultasi stunting.
 * Chatbot menggunakan konteks dari hasil prediksi terakhir anak
 * untuk memberikan rekomendasi yang relevan dan personal.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatSessionRepository chatSessionRepository;
    private final PredictionRepository predictionRepository;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    private static final int MAX_HISTORY_MESSAGES = 10;

    /**
     * Mengirim pesan ke chatbot dan mendapatkan respons AI.
     * Chatbot menggunakan konteks prediksi untuk memberikan jawaban yang relevan.
     *
     * @param predictionId ID prediksi yang menjadi konteks chat
     * @param message pesan dari user
     * @param userId ID user yang mengirim pesan
     * @return respons dari AI
     */
    @Transactional
    public ChatResponse sendMessage(String predictionId, String message, String userId) {
        Prediction prediction = predictionRepository.findById(predictionId)
            .orElseThrow(() -> new ResourceNotFoundException("Prediksi tidak ditemukan"));

        if (prediction.getPredictionStatus() != PredictionStatus.COMPLETED) {
            throw new ForbiddenException("Chatbot hanya bisa diakses jika prediksi sudah selesai");
        }

        if (!prediction.getAssessment().getChild().getUser().getId().equals(userId)) {
            throw new ForbiddenException("Anda tidak memiliki akses ke data ini");
        }

        ChatSession session = chatSessionRepository.findByPredictionId(predictionId)
            .orElseGet(() -> createNewSession(prediction));

        List<Map<String, String>> messages = parseMessages(session.getMessages());

        String systemContext = buildSystemContext(prediction);
        String reply = callGeminiWithContext(systemContext, messages, message);

        messages.add(Map.of("role", "user", "content", message,
            "timestamp", OffsetDateTime.now().toString()));
        messages.add(Map.of("role", "assistant", "content", reply,
            "timestamp", OffsetDateTime.now().toString()));

        session.setMessages(toJsonString(messages));
        session.setUpdatedAt(OffsetDateTime.now());
        chatSessionRepository.save(session);

        return ChatResponse.builder()
            .sessionId(session.getId())
            .predictionId(predictionId)
            .role("assistant")
            .content(reply)
            .timestamp(OffsetDateTime.now())
            .build();
    }

    /**
     * Mengambil riwayat percakapan untuk suatu prediksi.
     *
     * @param predictionId ID prediksi
     * @param userId ID user yang meminta
     * @return riwayat percakapan lengkap
     */
    public ChatResponse.HistoryResponse getChatHistory(String predictionId, String userId) {
        ChatSession session = chatSessionRepository.findByPredictionId(predictionId)
            .orElseThrow(() -> new ResourceNotFoundException("Riwayat chat tidak ditemukan"));

        if (!session.getPrediction().getAssessment().getChild().getUser().getId().equals(userId)) {
            throw new ForbiddenException("Anda tidak memiliki akses ke data ini");
        }

        List<Map<String, String>> messages = parseMessages(session.getMessages());

        return ChatResponse.HistoryResponse.builder()
            .sessionId(session.getId())
            .predictionId(predictionId)
            .messages(messages)
            .build();
    }

    /**
     * Membuat sesi chat baru untuk prediksi tertentu.
     */
    private ChatSession createNewSession(Prediction prediction) {
        ChatSession session = new ChatSession();
        session.setId(CuidGenerator.generate());
        session.setPrediction(prediction);
        session.setMessages("[]");
        session.setUpdatedAt(OffsetDateTime.now());
        return chatSessionRepository.save(session);
    }

    /**
     * Membangun system context untuk Gemini berdasarkan data prediksi.
     */
    private String buildSystemContext(Prediction prediction) {
        var child = prediction.getAssessment().getChild();
        int ageMonths = java.time.Period.between(child.getBirthDate(), java.time.LocalDate.now()).getMonths()
            + java.time.Period.between(child.getBirthDate(), java.time.LocalDate.now()).getYears() * 12;

        return String.format("""
            Anda adalah asisten kesehatan anak yang membantu orang tua memahami kondisi gizi anak.

            KONTEKS ANAK:
            - Nama: %s (anonim)
            - Usia: %d bulan
            - Jenis Kelamin: %s

            HASIL PREDIKSI TERAKHIR:
            - Status: %s
            - Z-Score TB/U: %s SD
            - Z-Score BB/U: %s SD
            - Z-Score BB/TB: %s SD
            - Level Risiko: %d

            RINGKASAN DARI PREDIKSI:
            %s

            REKOMENDASI SEBELUMNYA:
            %s

            ATURAN:
            1. Jawab dalam Bahasa Indonesia yang mudah dipahami orang tua
            2. Gunakan frasa "berisiko" bukan "menderita"
            3. Batasi jawaban pada topik gizi dan tumbuh kembang anak 0-60 bulan
            4. Jika ditanya di luar domain, jawab: "Pertanyaan ini di luar cakupan aplikasi. Silakan konsultasi langsung dengan dokter atau bidan."
            5. Berikan jawaban yang informatif tapi tidak menggantikan diagnosis medis
            6. Jika relevan, sarankan untuk berkonsultasi dengan tenaga kesehatan
            """,
            child.getAnonId(),
            ageMonths,
            child.getGender(),
            prediction.getStatus(),
            prediction.getZscoreHa(),
            prediction.getZscoreWa(),
            prediction.getZscoreWh(),
            prediction.getRiskLevel(),
            prediction.getSummary() != null ? prediction.getSummary() : "Belum ada ringkasan",
            prediction.getRecommendations() != null
                ? String.join("\n", prediction.getRecommendations())
                : "Belum ada rekomendasi"
        );
    }

    /**
     * Memanggil Gemini dengan konteks dan riwayat pesan.
     * Hanya mengirim MAX_HISTORY_MESSAGES pesan terakhir.
     */
    private String callGeminiWithContext(String systemContext, List<Map<String, String>> history, String userMessage) {
        StringBuilder fullPrompt = new StringBuilder();
        fullPrompt.append(systemContext).append("\n\nRIWAYAT PERCAKAPAN:\n");

        int startIdx = Math.max(0, history.size() - MAX_HISTORY_MESSAGES);
        for (int i = startIdx; i < history.size(); i++) {
            Map<String, String> msg = history.get(i);
            fullPrompt.append(msg.get("role")).append(": ").append(msg.get("content")).append("\n");
        }

        fullPrompt.append("user: ").append(userMessage).append("\n\nassistant: ");

        return geminiService.callText(fullPrompt.toString());
    }

    /**
     * Memparse JSON string menjadi list pesan.
     */
    private List<Map<String, String>> parseMessages(String messagesJson) {
        try {
            return objectMapper.readValue(messagesJson, new TypeReference<List<Map<String, String>>>() {});
        } catch (JsonProcessingException e) {
            log.warn("Gagal parse messages JSON, return empty list: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * Mengkonversi list pesan ke JSON string.
     */
    private String toJsonString(List<Map<String, String>> messages) {
        try {
            return objectMapper.writeValueAsString(messages);
        } catch (JsonProcessingException e) {
            log.error("Gagal konversi messages ke JSON: {}", e.getMessage());
            return "[]";
        }
    }
}
