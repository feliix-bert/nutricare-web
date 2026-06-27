package com.nutricare.dto.request.admin;

import com.nutricare.domain.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request untuk ADMIN membuat akun MEDIC, POSYANDU, atau ADMIN lain.
 */
@Data
public class CreateUserRequest {
    @NotBlank(message = "Nama wajib diisi")
    private String name;

    @NotBlank(message = "Email wajib diisi")
    @Email(message = "Format email tidak valid")
    private String email;

    @NotBlank(message = "Password wajib diisi")
    @Size(min = 8, message = "Password minimal 8 karakter")
    private String password;

    @NotNull(message = "Role wajib diisi")
    private Role role;
}
