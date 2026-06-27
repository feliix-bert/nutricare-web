package com.nutricare.repository;

import com.nutricare.domain.entity.Child;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChildRepository extends JpaRepository<Child, String> {
    List<Child> findByUserId(String userId);
    Optional<Child> findByIdAndUserId(String id, String userId);
    Optional<Child> findByAnonId(String anonId);
    boolean existsByAnonId(String anonId);
    long countByUserId(String userId);

    // ── Medic/Admin queries ─────────────────────────────────────────────────────

    @Query("SELECT c FROM Child c JOIN c.user u " +
           "WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "   OR LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Child> findBySearchWithParent(@Param("search") String search, Pageable pageable);
}
