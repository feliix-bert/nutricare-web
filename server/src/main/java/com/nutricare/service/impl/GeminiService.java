package com.nutricare.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutricare.exception.GeminiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

/**
 * Service untuk berkomunikasi dengan Google Gemini API.
 * Menyediakan method untuk text generation dan vision analysis.
 * Semua pemanggilan Gemini dilakukan melalui service ini.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url-text}")
    private String textApiUrl;

    @Value("${gemini.api.url-vision}")
    private String visionApiUrl;

    /**
     * Memanggil Gemini text model untuk menghasilkan respons berdasarkan prompt.
     *
     * @param prompt teks prompt yang akan dikirim ke Gemini
     * @return teks respons dari Gemini
     * @throws GeminiException jika panggilan API gagal atau respons tidak valid
     */
    public String callText(String prompt) {
        Map<String, Object> requestBody = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(Map.of("text", prompt)))
            ),
            "generationConfig", Map.of(
                "temperature", 0.3,
                "maxOutputTokens", 1024
            )
        );

        try {
            String response = webClient.post()
                .uri(textApiUrl + "?key=" + geminiApiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

            JsonNode root = objectMapper.readTree(response);
            return root.path("candidates").get(0)
                .path("content").path("parts").get(0)
                .path("text").asText();
        } catch (Exception e) {
            log.error("Gagal memanggil Gemini API: {}", e.getMessage());
            throw new GeminiException("Gagal memproses permintaan ke AI: " + e.getMessage());
        }
    }

    /**
     * Memanggil Gemini Vision model untuk menganalisis gambar.
     * Mengirimkan gambar dalam format base64 bersama prompt.
     *
     * @param base64Image gambar yang sudah diencode ke base64
     * @param prompt teks prompt untuk analisis gambar
     * @return teks hasil analisis dari Gemini
     * @throws GeminiException jika panggilan API gagal
     */
    public String callVision(String base64Image, String prompt) {
        Map<String, Object> requestBody = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(
                    Map.of("text", prompt),
                    Map.of("inlineData", Map.of(
                        "mimeType", "image/jpeg",
                        "data", base64Image
                    ))
                ))
            ),
            "generationConfig", Map.of(
                "temperature", 0.2,
                "maxOutputTokens", 1024
            )
        );

        try {
            String response = webClient.post()
                .uri(visionApiUrl + "?key=" + geminiApiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

            JsonNode root = objectMapper.readTree(response);
            return root.path("candidates").get(0)
                .path("content").path("parts").get(0)
                .path("text").asText();
        } catch (Exception e) {
            log.error("Gagal memanggil Gemini Vision API: {}", e.getMessage());
            throw new GeminiException("Gagal menganalisis gambar: " + e.getMessage());
        }
    }
}
