package com.nutricare.service.impl;

import com.nutricare.domain.entity.RefreshToken;
import com.nutricare.domain.entity.User;
import com.nutricare.domain.enums.Role;
import com.nutricare.dto.request.auth.LoginRequest;
import com.nutricare.dto.request.auth.RefreshTokenRequest;
import com.nutricare.dto.request.auth.RegisterRequest;
import com.nutricare.dto.response.auth.AuthResponse;
import com.nutricare.exception.DuplicateResourceException;
import com.nutricare.exception.ResourceNotFoundException;
import com.nutricare.repository.RefreshTokenRepository;
import com.nutricare.repository.UserRepository;
import com.nutricare.security.JwtUtil;
import com.nutricare.util.CuidGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.OffsetDateTime;

/**
 * AuthService — Phase 1 (BE-101 sampai BE-105)
 * - register (PARENT only, MEDIC/ADMIN hanya bisa dibuat oleh ADMIN)
 * - login → access token (15 menit) + refresh token (7 hari)
 * - refresh → access token baru
 * - logout → revoke refresh token
 * - me → info user yang sedang login
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Value("${app.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    // ── BE-101: Register ──────────────────────────────────────────────────────

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email sudah terdaftar: " + request.getEmail());
        }

        User user = User.builder()
            .id(CuidGenerator.generate())
            .email(request.getEmail())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .name(request.getName())
            .role(Role.PARENT) // Self-register hanya bisa jadi PARENT
            .isActive(true)
            .build();

        User saved = userRepository.save(user);
        return generateAuthResponse(saved);
    }

    // ── BE-102: Login ─────────────────────────────────────────────────────────

    @Transactional
    public AuthResponse login(LoginRequest request) {
        // Spring Security verify email + password
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        return generateAuthResponse(user);
    }

    // ── BE-103: Refresh Token ─────────────────────────────────────────────────

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        String tokenHash = hashToken(request.getRefreshToken());

        RefreshToken storedToken = refreshTokenRepository.findByTokenHash(tokenHash)
            .orElseThrow(() -> new ResourceNotFoundException("Refresh token tidak valid"));

        if (!storedToken.isValid()) {
            throw new ResourceNotFoundException("Refresh token sudah kadaluarsa atau direvoke");
        }

        // Revoke token lama (rotation pattern — lebih aman)
        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        // Generate token baru
        User user = storedToken.getUser();
        return generateAuthResponse(user);
    }

    // ── BE-104: Logout ────────────────────────────────────────────────────────

    @Transactional
    public void logout(String refreshTokenValue) {
        String tokenHash = hashToken(refreshTokenValue);
        refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
    }

    // ── BE-105: Me ────────────────────────────────────────────────────────────

    public AuthResponse.UserResponse getMe(String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        return AuthResponse.UserResponse.builder()
            .id(user.getId())
            .name(user.getName())
            .email(user.getEmail())
            .role(user.getRole())
            .isActive(user.getIsActive())
            .walletAddress(user.getWalletAddress())
            .build();
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private AuthResponse generateAuthResponse(User user) {
        String accessToken  = jwtUtil.generateAccessToken(user.getEmail(), user.getId(), user.getRole());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail(), user.getId());

        // Simpan refresh token ke DB (hanya hash-nya)
        RefreshToken storedToken = RefreshToken.builder()
            .id(CuidGenerator.generate())
            .user(user)
            .tokenHash(hashToken(refreshToken))
            .expiresAt(OffsetDateTime.now().plusNanos(refreshExpirationMs * 1_000_000))
            .revoked(false)
            .build();
        refreshTokenRepository.save(storedToken);

        return AuthResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .user(AuthResponse.UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .walletAddress(user.getWalletAddress())
                .build())
            .build();
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) hex.append(String.format("%02x", b));
            return hex.toString();
        } catch (Exception e) {
            throw new RuntimeException("Gagal hash token", e);
        }
    }
}
