package com.nutricare.repository;
import com.nutricare.domain.entity.BlockchainAnchor;
import com.nutricare.domain.enums.AnchorStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
@Repository
public interface BlockchainAnchorRepository extends JpaRepository<BlockchainAnchor, String> {
    Optional<BlockchainAnchor> findByAssessmentId(String assessmentId);
    boolean existsByAssessmentId(String assessmentId);
    List<BlockchainAnchor> findByAnchorStatus(AnchorStatus status);
    Optional<BlockchainAnchor> findByTxHash(String txHash);
    Optional<BlockchainAnchor> findByRecordHash(String recordHash);
    @Query("SELECT ba FROM BlockchainAnchor ba WHERE ba.anchorStatus IN ('PENDING', 'PENDING_GAS')")
    List<BlockchainAnchor> findPendingAnchors();
}
