package com.nutricare.dto.response.admin;

import com.nutricare.domain.enums.Role;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;

/**
 * Response DTO untuk data user di AdminController.
 */
@Data
@Builder
public class UserAdminResponse {
    private String id;
    private String email;
    private String name;
    private Role role;
    private Boolean isActive;
    private String walletAddress;
    private OffsetDateTime createdAt;
}
