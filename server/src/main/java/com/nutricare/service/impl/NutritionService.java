package com.nutricare.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutricare.domain.entity.Child;
import com.nutricare.domain.entity.NutritionLog;
import com.nutricare.dto.response.nutrition.NutritionResponse;
import com.nutricare.dto.response.PageResponse;
import com.nutricare.domain.enums.Role;
import com.nutricare.exception.ForbiddenException;
import com.nutricare.exception.ResourceNotFoundException;
import com.nutricare.exception.StorageException;
import com.nutricare.repository.ChildRepository;
import com.nutricare.repository.NutritionLogRepository;
import com.nutricare.util.CuidGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Service untuk analisis gizi makanan melalui foto.
 * Menggabungkan upload file ke Supabase Storage dan analisis Gemini Vision
 * secara parallel untuk efisiensi.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NutritionService {

    private final NutritionLogRepository nutritionLogRepository;
    private final ChildRepository childRepository;
    private final StorageService storageService;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
        "image/jpeg", "image/png", "image/webp"
    );

    /**
     * Menganalisis foto makanan yang diupload oleh orang tua.
     * Proses dilakukan secara parallel: upload ke storage dan analisis Gemini Vision.
     *
     * @param childId ID anak
     * @param file file foto makanan (JPEG/PNG/WebP, max 5MB)
     * @param userId ID user yang mengupload
     * @return hasil analisis gizi dari Gemini Vision
     */
    @Transactional
    public NutritionResponse analyzeMealPhoto(String childId, MultipartFile file, String userId) {
        Child child = childRepository.findById(childId)
            .orElseThrow(() -> new ResourceNotFoundException("Anak tidak ditemukan"));

        if (!child.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Anda tidak memiliki akses ke data ini");
        }

        validateFile(file);

        try {
            byte[] fileBytes = file.getBytes();
            String prompt = buildNutritionPrompt(child);

            CompletableFuture<String> uploadFuture = CompletableFuture.supplyAsync(() ->
                storageService.upload(fileBytes, file.getOriginalFilename(), file.getContentType()));

            CompletableFuture<String> visionFuture = CompletableFuture.supplyAsync(() -> {
                String base64Image = Base64.getEncoder().encodeToString(fileBytes);
                return geminiService.callVision(base64Image, prompt);
            });

            CompletableFuture.allOf(uploadFuture, visionFuture).join();

            String photoUrl = uploadFuture.get();
            String geminiResponse = visionFuture.get();

            NutritionLog log = parseAndSaveNutritionLog(child, photoUrl, geminiResponse);

            return mapToResponse(log);
        } catch (StorageException e) {
            throw e;
        } catch (Exception e) {
            log.error("Gagal menganalisis foto makanan: {}", e.getMessage());
            throw new RuntimeException("Gagal menganalisis foto makanan", e);
        }
    }

    /**
     * Mengambil riwayat log gizi seorang anak.
     *
     * @param childId ID anak
     * @param userId ID user yang meminta
     * @param pageable parameter pagination
     * @return halaman riwayat log gizi
     */
    public PageResponse<NutritionResponse> getNutritionHistory(String childId, String userId, Pageable pageable) {
        childRepository.findByIdAndUserId(childId, userId)
            .orElseThrow(() -> new ForbiddenException("Anak tidak ditemukan atau bukan milik Anda"));

        org.springframework.data.domain.Page<com.nutricare.domain.entity.NutritionLog> pageResult = nutritionLogRepository.findByChildIdOrderByCreatedAtDesc(childId, pageable);

        return PageResponse.<NutritionResponse>builder()
            .data(pageResult.stream().map(this::mapToResponse).toList())
            .page(pageResult.getNumber())
            .size(pageResult.getSize())
            .totalElements(pageResult.getTotalElements())
            .totalPages(pageResult.getTotalPages())
            .build();
    }

    /**
     * Menghapus log gizi.
     * Ownership: PARENT hanya bisa hapus milik sendiri, MEDIC/ADMIN bisa semua.
     *
     * @param logId ID log gizi
     * @param userId ID user yang meminta
     * @param role Role user yang meminta
     */
    @Transactional
    public void deleteNutritionLog(String logId, String userId, Role role) {
        NutritionLog log = nutritionLogRepository.findById(logId)
            .orElseThrow(() -> new ResourceNotFoundException("Log gizi tidak ditemukan"));

        if (role == Role.PARENT && !log.getChild().getUser().getId().equals(userId)) {
            throw new ForbiddenException("Anda tidak memiliki akses ke data ini");
        }

        nutritionLogRepository.delete(log);
    }

    /**
     * Memvalidasi file foto yang diupload.
     */
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new StorageException("File tidak boleh kosong");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new StorageException("Format file tidak didukung. Gunakan JPEG, PNG, atau WebP");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new StorageException("Ukuran file maksimal 5 MB");
        }
    }

    /**
     * Membuat prompt untuk Gemini Vision dalam Bahasa Indonesia.
     */
    private String buildNutritionPrompt(Child child) {
        return String.format("""
            Anda adalah ahli gizi anak. Analisis foto makanan bayi/balita ini.

            DATA ANAK:
            - Usia: %d bulan (dihitung dari tanggal lahir %s)
            - Jenis Kelamin: %s

            Berikan analisis dalam format JSON berikut (tanpa markdown):
            {
              "foodDetected": ["makanan 1", "makanan 2"],
              "portionEstimate": "estimasi porsi dalam Bahasa Indonesia",
              "calories": 0.0,
              "protein": 0.0,
              "carbs": 0.0,
              "fat": 0.0,
              "fiber": 0.0,
              "adequacyNote": "catatan kecukupan gizi 1-2 kalimat dalam Bahasa Indonesia",
              "mpasiRecommendation": "rekomendasi MPASI dalam Bahasa Indonesia"
            }

            Gunakan perkiraan yang realistis berdasarkan porsi yang terlihat di foto.
            """,
            java.time.Period.between(child.getBirthDate(), java.time.LocalDate.now()).getMonths()
                + java.time.Period.between(child.getBirthDate(), java.time.LocalDate.now()).getYears() * 12,
            child.getBirthDate(),
            child.getGender()
        );
    }

    /**
     * Memparse respons JSON dari Gemini dan menyimpan ke database.
     */
    private NutritionLog parseAndSaveNutritionLog(Child child, String photoUrl, String geminiResponse) {
        try {
            String cleanJson = geminiResponse
                .replaceAll("(?s)^.*?(\\{.*\\}).*$", "$1").trim();

            JsonNode parsed = objectMapper.readTree(cleanJson);

            NutritionLog log = new NutritionLog();
            log.setId(CuidGenerator.generate());
            log.setChild(child);
            log.setPhotoUrl(photoUrl);

            if (parsed.has("foodDetected") && !parsed.get("foodDetected").isNull()) {
                List<String> foodDetected = objectMapper.convertValue(
                    parsed.get("foodDetected"), new TypeReference<List<String>>() {});
                log.setFoodDetected(foodDetected);
            }

            log.setPortionEstimate(getText(parsed, "portionEstimate"));
            log.setCalories(getDecimal(parsed, "calories"));
            log.setProtein(getDecimal(parsed, "protein"));
            log.setCarbs(getDecimal(parsed, "carbs"));
            log.setFat(getDecimal(parsed, "fat"));
            log.setFiber(getDecimal(parsed, "fiber"));
            log.setAdequacyNote(getText(parsed, "adequacyNote"));
            log.setMpasiRecommendation(getText(parsed, "mpasiRecommendation"));
            log.setGeminiRaw(geminiResponse);

            return nutritionLogRepository.save(log);
        } catch (Exception e) {
            log.error("Gagal parse respons Gemini Vision: {}", e.getMessage());

            NutritionLog log = new NutritionLog();
            log.setId(CuidGenerator.generate());
            log.setChild(child);
            log.setPhotoUrl(photoUrl);
            log.setGeminiRaw(geminiResponse);
            return nutritionLogRepository.save(log);
        }
    }

    private String getText(JsonNode node, String field) {
        JsonNode value = node.get(field);
        return value != null && !value.isNull() ? value.asText() : null;
    }

    private BigDecimal getDecimal(JsonNode node, String field) {
        JsonNode value = node.get(field);
        return value != null && !value.isNull() ? BigDecimal.valueOf(value.asDouble()) : null;
    }

    /**
     * Memetakan entity NutritionLog ke response DTO.
     */
    private NutritionResponse mapToResponse(NutritionLog log) {
        return NutritionResponse.builder()
            .id(log.getId())
            .childId(log.getChild().getId())
            .photoUrl(log.getPhotoUrl())
            .foodDetected(log.getFoodDetected())
            .portionEstimate(log.getPortionEstimate())
            .calories(log.getCalories())
            .protein(log.getProtein())
            .carbs(log.getCarbs())
            .fat(log.getFat())
            .fiber(log.getFiber())
            .adequacyNote(log.getAdequacyNote())
            .mpasiRecommendation(log.getMpasiRecommendation())
            .createdAt(log.getCreatedAt())
            .build();
    }
}
