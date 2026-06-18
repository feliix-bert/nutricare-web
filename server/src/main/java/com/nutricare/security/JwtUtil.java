package com.nutricare.security;

import com.nutricare.domain.enums.Role;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

/**
 * Utility untuk operasi JWT:
 * - Generate access token (15 menit)
 * - Generate refresh token (7 hari)
 * - Validasi & parse token
 */
@Component
@Slf4j
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.access-expiration-ms}")
    private long accessExpirationMs;   // 900000 = 15 menit

    @Value("${app.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;  // 604800000 = 7 hari

    // ── Generate Token ────────────────────────────────────────────────────────

    public String generateAccessToken(String email, String userId, Role role) {
        return Jwts.builder()
            .subject(email)
            .claims(Map.of(
                "userId", userId,
                "role", role.name(),
                "type", "ACCESS"
            ))
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + accessExpirationMs))
            .signWith(getSigningKey())
            .compact();
    }

    public String generateRefreshToken(String email, String userId) {
        return Jwts.builder()
            .subject(email)
            .claims(Map.of(
                "userId", userId,
                "type", "REFRESH"
            ))
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + refreshExpirationMs))
            .signWith(getSigningKey())
            .compact();
    }

    // ── Extract Claims ────────────────────────────────────────────────────────

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractUserId(String token) {
        return extractAllClaims(token).get("userId", String.class);
    }

    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }

    public String extractType(String token) {
        return extractAllClaims(token).get("type", String.class);
    }

    // ── Validasi ──────────────────────────────────────────────────────────────

    public boolean isTokenValid(String token) {
        try {
            extractAllClaims(token);
            return !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("JWT invalid: {}", e.getMessage());
            return false;
        }
    }

    public boolean isAccessToken(String token) {
        return "ACCESS".equals(extractType(token));
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        return resolver.apply(extractAllClaims(token));
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }
}
