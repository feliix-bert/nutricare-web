package com.nutricare.repository;

import com.nutricare.domain.entity.Prediction;
import com.nutricare.domain.enums.PredictionStatus;
import com.nutricare.domain.enums.StuntStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PredictionRepository extends JpaRepository<Prediction, String> {
    Optional<Prediction> findByAssessmentId(String assessmentId);
    Optional<Prediction> findFirstByAssessmentChildIdOrderByCreatedAtDesc(String childId);
    List<Prediction> findByPredictionStatus(PredictionStatus status);
    boolean existsByAssessmentId(String assessmentId);

    @Query("SELECT p FROM Prediction p WHERE p.assessment.child.id IN :childIds " +
           "AND p.createdAt = (SELECT MAX(p2.createdAt) FROM Prediction p2 WHERE p2.assessment.child.id = p.assessment.child.id)")
    List<Prediction> findLatestByChildIds(@Param("childIds") List<String> childIds);

    @Query("SELECT p FROM Prediction p WHERE p.assessment.id IN :assessmentIds")
    List<Prediction> findByAssessmentIdIn(@Param("assessmentIds") List<String> assessmentIds);

    @Query("SELECT p.status, COUNT(p) FROM Prediction p GROUP BY p.status")
    List<Object[]> countByStatus();
}
