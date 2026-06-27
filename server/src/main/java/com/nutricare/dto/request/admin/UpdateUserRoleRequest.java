package com.nutricare.dto.request.admin;

import com.nutricare.domain.enums.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request untuk ADMIN mengubah role user.
 */
@Data
public class UpdateUserRoleRequest {
    @NotNull(message = "Role wajib diisi")
    private Role role;
}
