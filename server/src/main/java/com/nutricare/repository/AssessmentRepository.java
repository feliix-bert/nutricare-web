package com.nutricare.repository;
import com.nutricare.domain.entity.Assessment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, String> {
    List<Assessment> findByChildIdOrderByCreatedAtDesc(String childId);
    Page<Assessment> findByChildIdOrderByCreatedAtDesc(String childId, Pageable pageable);
    Optional<Assessment> findFirstByChildIdOrderByCreatedAtDesc(String childId);
    long countByChildId(String childId);
    @Query("SELECT COUNT(a) > 0 FROM Assessment a WHERE a.id = :id AND a.child.user.id = :userId")
    boolean existsByIdAndUserId(@Param("id") String id, @Param("userId") String userId);
}
