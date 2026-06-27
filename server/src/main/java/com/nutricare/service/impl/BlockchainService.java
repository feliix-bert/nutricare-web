package com.nutricare.service.impl;

import com.nutricare.domain.entity.Assessment;
import com.nutricare.domain.entity.BlockchainAnchor;
import com.nutricare.domain.entity.Prediction;
import com.nutricare.domain.enums.AnchorStatus;
import com.nutricare.dto.response.blockchain.AnchorResponse;
import com.nutricare.dto.response.blockchain.VerifyResponse;
import com.nutricare.exception.BlockchainException;
import com.nutricare.exception.ResourceNotFoundException;
import com.nutricare.repository.AssessmentRepository;
import com.nutricare.repository.BlockchainAnchorRepository;
import com.nutricare.util.CuidGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/**
 * Service untuk interaksi dengan blockchain Polygon.
 * Mengelola proses anchoring hash data assessment ke smart contract
 * GiziChainRegistry dan verifikasi integritas data on-chain.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BlockchainService {

    private final BlockchainAnchorRepository blockchainAnchorRepository;
    private final AssessmentRepository assessmentRepository;

    @Value("${polygon.rpc-url}")
    private String rpcUrl;

    @Value("${polygon.chain-id}")
    private long chainId;

    @Value("${polygon.registry-contract}")
    private String registryContract;

    @Value("${polygon.anchor-private-key}")
    private String anchorPrivateKey;

    @Value("${app.blockchain.simulation}")
    private boolean simulation;

    /**
     * Meng-anchor hash data assessment ke blockchain Polygon.
     * Hash dihitung dari kombinasi data assessment dan prediksi.
     * Dipanggil secara async setelah prediksi selesai.
     *
     * @param assessmentId ID assessment yang akan di-anchor
     * @return detail hasil anchoring
     */
    @Transactional
    public AnchorResponse anchorAssessment(String assessmentId) {
        Assessment assessment = assessmentRepository.findById(assessmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Assessment tidak ditemukan"));

        String recordHash = calculateRecordHash(assessment);

        String txHash;
        Integer blockNumber;
        AnchorStatus status;

        if (simulation) {
            txHash = "0x" + CuidGenerator.generate().replace("-", "");
            blockNumber = (int) ((System.currentTimeMillis() / 1000) % 100000000);
            status = AnchorStatus.CONFIRMED;
            log.info("[SIMULASI] Assessment {} di-anchor dengan txHash: {}", assessmentId, txHash);
        } else {
            // TODO: Implementasi Web3j — panggil GiziChainRegistry.anchorRecord()
            // txHash = web3j.contract.methods.anchor(recordHash).send().getTransactionHash();
            // blockNumber = receipt.getBlockNumber().intValue();
            // status = AnchorStatus.CONFIRMED;
            throw new BlockchainException("Mode non-simulasi belum diimplementasikan");
        }

        BlockchainAnchor anchor = BlockchainAnchor.builder()
            .id(CuidGenerator.generate())
            .assessment(assessment)
            .recordHash(recordHash)
            .txHash(txHash)
            .blockNumber(blockNumber)
            .contractAddress(registryContract)
            .anchorStatus(status)
            .build();

        blockchainAnchorRepository.save(anchor);

        return AnchorResponse.builder()
            .id(anchor.getId())
            .assessmentId(assessmentId)
            .recordHash(recordHash)
            .txHash(txHash)
            .blockNumber(anchor.getBlockNumber())
            .contractAddress(registryContract)
            .anchorStatus(status.name())
            .anchoredAt(anchor.getAnchoredAt())
            .build();
    }

    /**
     * Memverifikasi integritas data assessment dengan membandingkan
     * hash on-chain dengan hash yang tersimpan di database.
     *
     * @param assessmentId ID assessment yang akan diverifikasi
     * @return hasil verifikasi
     */
    public VerifyResponse verifyAssessment(String assessmentId) {
        Assessment assessment = assessmentRepository.findById(assessmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Assessment tidak ditemukan"));

        BlockchainAnchor anchor = blockchainAnchorRepository.findByAssessmentId(assessmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Assessment belum di-anchor ke blockchain"));

        String currentHash = calculateRecordHash(assessment);
        boolean isValid = currentHash.equals(anchor.getRecordHash());

        String explorerUrl = anchor.getTxHash() != null
            ? "https://amoy.polygonscan.com/tx/" + anchor.getTxHash()
            : null;

        return VerifyResponse.builder()
            .assessmentId(assessmentId)
            .isValid(isValid)
            .recordHash(anchor.getRecordHash())
            .anchoredAt(anchor.getAnchoredAt())
            .txHash(anchor.getTxHash())
            .blockNumber(anchor.getBlockNumber())
            .explorerUrl(explorerUrl)
            .build();
    }

    /**
     * Menghitung hash SHA-256 dari data assessment untuk di-anchor ke blockchain.
     */
    private String calculateRecordHash(Assessment assessment) {
        try {
            Prediction prediction = assessment.getPrediction();

            StringBuilder data = new StringBuilder();
            data.append(assessment.getChild().getId());
            data.append(assessment.getId());
            data.append(assessment.getWeight());
            data.append(assessment.getHeight());
            data.append(assessment.getCreatedAt().toString());

            if (prediction != null) {
                data.append(prediction.getZscoreHa());
                data.append(prediction.getZscoreWa());
                data.append(prediction.getZscoreWh());
            }

            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.toString().getBytes(StandardCharsets.UTF_8));

            StringBuilder hex = new StringBuilder("0x");
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (Exception e) {
            log.error("Gagal menghitung hash: {}", e.getMessage());
            throw new BlockchainException("Gagal menghitung hash data assessment");
        }
    }
}
