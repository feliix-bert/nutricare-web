package com.nutricare.repository;

import com.nutricare.domain.entity.User;
import com.nutricare.domain.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByWalletAddress(String walletAddress);

    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role AND u.isActive = true")
    long countActiveByRole(@Param("role") Role role);

    // ── Admin queries ───────────────────────────────────────────────────────────

    Page<User> findByRole(Role role, Pageable pageable);

    @Query("SELECT u FROM User u WHERE LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "   OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<User> findBySearch(@Param("search") String search, Pageable pageable);

    @Query("SELECT u FROM User u WHERE (:search IS NULL OR LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%'))" +
           "   OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "   AND (:role IS NULL OR u.role = :role)")
    Page<User> findBySearchAndRole(@Param("search") String search, @Param("role") Role role, Pageable pageable);

    long countByRole(Role role);
}
