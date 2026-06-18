package com.nutricare.dto.request.nutrition;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request untuk upload foto makanan.
 * File foto dikirim sebagai multipart, bukan di body JSON ini.
 * DTO ini hanya untuk field tambahan yang dikirim bersama foto.
 */
@Data
public class NutritionRequest {

    @NotBlank(message = "Child ID wajib diisi")
    private String childId;

    // Catatan tambahan dari orang tua (opsional)
    private String notes;
}
