package com.nutricare.domain.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;

/**
 * Entity User — tabel "users"
 *
 * Menggunakan CUID (String) sebagai primary key,
 * lebih aman dari integer sequential karena tidak bisa ditebak.
 *
 * wallet_address diisi hanya untuk role MEDIC & POSYANDU
 * yang berhak menerbitkan Verifiable Credential (VC) on-chain.
 */
@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {

    @Id
    @Column(length = 30)
    private String id; // CUID — di-generate di service sebelum save

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash; // BCrypt hash

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "role_enum")
    private Role role = Role.PARENT; // Mengacu langsung ke file Role.java di folder yang sama

    // Hanya diisi untuk MEDIC & POSYANDU (Ethereum address, 42 karakter)
    @Column(name = "wallet_address", unique = true, length = 42)
    private String walletAddress;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false,
            columnDefinition = "TIMESTAMPTZ DEFAULT now()")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at", nullable = false,
            columnDefinition = "TIMESTAMPTZ DEFAULT now()")
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    // ── Relasi ────────────────────────────────────────────────────────────────

    // Satu user bisa punya banyak anak
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Child> children;

    // VC yang diterbitkan oleh user ini (jika role MEDIC)
    @OneToMany(mappedBy = "issuer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<VerifiableCredential> issuedCredentials;

    // ── UserDetails (Spring Security) ─────────────────────────────────────────

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() { return passwordHash; }

    @Override
    public String getUsername() { return email; }

    @Override public boolean isAccountNonExpired()     { return true; }
    @Override public boolean isAccountNonLocked()      { return isActive; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled()               { return isActive; }

    // FIX: "public enum Role" yang menduplikasi file Role.java sudah dihapus dari sini!
}