package com.nutricare.dto.response.admin;

import com.nutricare.domain.enums.Role;
import lombok.Builder;
import lombok.Data;

/**
 * Response DTO untuk create user di AdminController.
 */
@Data
@Builder
public class AdminCreateUserResponse {
    private String id;
    private String email;
    private String name;
    private Role role;
    private Boolean isActive;
}
