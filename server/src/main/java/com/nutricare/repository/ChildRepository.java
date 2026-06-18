package com.nutricare.repository;
import com.nutricare.domain.entity.Child;
import org.springframework.data.jpa.repository.JpaRepository;
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
}
