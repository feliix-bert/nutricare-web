package com.nutricare.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutricare.domain.entity.Assessment;
import com.nutricare.domain.entity.Child;
import com.nutricare.domain.entity.Prediction;
import com.nutricare.domain.enums.PredictionStatus;
import com.nutricare.repository.PredictionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

/**
 * PredictionService — BE-303
 * Memanggil Gemini untuk interpretasi hasil Z-Score dan rekomendasi.
 *
 * PENTING: Gemini hanya sebagai interpreter & recommendation engine.
 * Z-Score sudah dihitung di ZScoreCalculator (server-side).
 * Gemini TIDAK boleh mengklaim diagnosis definitif.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PredictionService {

    private final PredictionRepository predictionRepository;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    /**
     * Panggil Gemini secara async — tidak memblokir response ke client.
     * Setelah selesai, update prediction di database.
     */
    @Async
    public void generatePredictionAsync(
            String predictionId, Assessment assessment, Child child, int ageMonths) {

        Prediction prediction = predictionRepository.findById(predictionId).orElse(null);
        if (prediction == null) return;

        try {
            String prompt = buildPrompt(assessment, child, ageMonths, prediction);
            String geminiResponse = callGemini(prompt);

            // Parse response Gemini
            parseAndUpdatePrediction(prediction, geminiResponse);

        } catch (Exception e) {
            log.error("Gemini error untuk prediction {}: {}", predictionId, e.getMessage());
            prediction.setPredictionStatus(PredictionStatus.PENDING); // retry nanti
            predictionRepository.save(prediction);
        }
    }

    /**
     * Build prompt untuk Gemini — sesuai batasan domain dari CONTEXT.md.
     */
    private String buildPrompt(Assessment assessment, Child child, int ageMonths, Prediction prediction) {
        return String.format("""
            Anda adalah sistem AI kesehatan anak yang membantu interpretasi hasil skrining stunting.
            
            PENTING: Anda hanya memberikan interpretasi dan rekomendasi — BUKAN diagnosis medis.
            Selalu gunakan frasa "berisiko" bukan "menderita". Batasi pada domain 0-60 bulan.
            
            DATA ANAK:
            - Nama: %s (anonim)
            - Usia: %d bulan
            - Jenis Kelamin: %s
            - Berat Badan: %s kg
            - Tinggi Badan: %s cm
            
            HASIL KALKULASI Z-SCORE (WHO 2006):
            - Z-Score TB/U (Tinggi/Usia): %s SD → Indikator stunting utama
            - Z-Score BB/U (Berat/Usia): %s SD
            - Z-Score BB/TB (Berat/Tinggi): %s SD
            - Status: %s
            
            RIWAYAT:
            - ASI Eksklusif: %s
            - Frekuensi makan: %d kali/hari
            - Usia mulai MPASI: %s bulan
            - Riwayat penyakit: %s
            
            Berikan respons HANYA dalam format JSON berikut (tanpa markdown):
            {
              "summary": "penjelasan 2-3 kalimat tentang kondisi anak dalam Bahasa Indonesia yang mudah dipahami orang tua",
              "recommendations": [
                "rekomendasi 1 yang spesifik dan actionable",
                "rekomendasi 2",
                "rekomendasi 3",
                "rekomendasi 4",
                "rekomendasi 5"
              ],
              "nextAssessmentDate": "YYYY-MM-DD"
            }
            """,
            child.getAnonId(),  // gunakan anonId, bukan nama asli
            ageMonths,
            child.getGender(),
            assessment.getWeight(),
            assessment.getHeight(),
            prediction.getZscoreHa(),
            prediction.getZscoreWa(),
            prediction.getZscoreWh(),
            prediction.getStatus(),
            assessment.getBfExclusive() ? "Ya" : "Tidak",
            assessment.getMealFreq(),
            assessment.getMpasiAge() != null ? assessment.getMpasiAge().toString() : "Belum MPASI",
            assessment.getIllnessHistory() != null ? assessment.getIllnessHistory() : "Tidak ada"
        );
    }

    /**
     * Panggil Gemini API melalui GeminiService.
     */
    private String callGemini(String prompt) {
        return geminiService.callText(prompt);
    }

    /**
     * Parse JSON response dari Gemini dan update prediction.
     */
    private void parseAndUpdatePrediction(Prediction prediction, String geminiResponse) {
        try {
            String cleanJson = geminiResponse
                .replaceAll("(?s)^.*?(\\{.*\\}).*$", "$1").trim();

            JsonNode parsed = objectMapper.readTree(cleanJson);

            String summary = parsed.path("summary").asText();
            List<String> recommendationsList = objectMapper.convertValue(
                parsed.path("recommendations"),
                new TypeReference<List<String>>() {}
            );
            String nextDateStr = parsed.path("nextAssessmentDate").asText();

            prediction.setSummary(summary);
            prediction.setRecommendations(recommendationsList);
            prediction.setGeminiRaw(geminiResponse);
            prediction.setPredictionStatus(PredictionStatus.COMPLETED);

            if (nextDateStr != null && !nextDateStr.isEmpty() && !nextDateStr.equals("null")) {
                try {
                    prediction.setNextAssessmentDate(LocalDate.parse(nextDateStr));
                } catch (Exception e) {
                    log.warn("Gagal parse nextAssessmentDate: {}", nextDateStr);
                }
            }

            predictionRepository.save(prediction);
            log.info("Prediksi {} berhasil diselesaikan", prediction.getId());

        } catch (Exception e) {
            log.error("Gagal parse response Gemini: {}", e.getMessage());
            prediction.setPredictionStatus(PredictionStatus.FAILED);
            predictionRepository.save(prediction);
        }
    }
}
