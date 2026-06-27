package com.nutricare.dto.request.admin;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request untuk ADMIN mengaktifkan/nonaktifkan akun user.
 */
@Data
public class UpdateUserStatusRequest {
    @NotNull(message = "Status aktif wajib diisi")
    private Boolean isActive;
}
