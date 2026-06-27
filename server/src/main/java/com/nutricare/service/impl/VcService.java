package com.nutricare.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutricare.domain.entity.Child;
import com.nutricare.domain.entity.User;
import com.nutricare.domain.entity.VerifiableCredential;
import com.nutricare.dto.response.vc.VcStatusResponse;
import com.nutricare.domain.enums.VcType;
import com.nutricare.dto.request.vc.IssueVcRequest;
import com.nutricare.dto.request.vc.RevokeVcRequest;
import com.nutricare.dto.response.vc.IssueVcResponse;
import com.nutricare.dto.response.vc.VcDetailResponse;
import com.nutricare.dto.response.vc.VerifyQrResponse;
import com.nutricare.exception.ForbiddenException;
import com.nutricare.exception.ResourceNotFoundException;
import com.nutricare.repository.ChildRepository;
import com.nutricare.repository.UserRepository;
import com.nutricare.repository.VerifiableCredentialRepository;
import com.nutricare.util.CuidGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Service untuk mengelola Verifiable Credential (W3C VC).
 * VC digunakan sebagai bukti digital status gizi dan imunisasi anak
 * yang diterbitkan oleh tenaga kesehatan (MEDIC).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VcService {

    private final VerifiableCredentialRepository verifiableCredentialRepository;
    private final ChildRepository childRepository;
    private final UserRepository userRepository;
    private final IpfsService ipfsService;
    private final ObjectMapper objectMapper;

    @Value("${app.blockchain.simulation}")
    private boolean simulation;

    /**
     * Menerbitkan Verifiable Credential baru untuk seorang anak.
     * VC akan diupload ke IPFS dan dicatat di blockchain.
     *
     * @param request data VC yang akan diterbitkan
     * @param issuerUserId ID user yang menerbitkan (MEDIC/ADMIN)
     * @return detail VC yang sudah diterbitkan
     */
    @Transactional
    public IssueVcResponse issueVc(IssueVcRequest request, String issuerUserId) {
        Child child = childRepository.findById(request.getChildId())
            .orElseThrow(() -> new ResourceNotFoundException("Anak tidak ditemukan"));

        User issuer = userRepository.findById(issuerUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        if (issuer.getWalletAddress() == null || issuer.getWalletAddress().isBlank()) {
            throw new ForbiddenException("Anda belum memiliki wallet terdaftar untuk menerbitkan VC");
        }

        Map<String, Object> vcDocument = buildVcDocument(child, issuer, request.getVcType(), request.getExpiresAt());

        String ipfsCid = ipfsService.uploadJson(vcDocument);

        String txHash;
        if (simulation) {
            txHash = "0x" + CuidGenerator.generate().replace("-", "");
            log.info("[SIMULASI] VC {} diterbitkan dengan txHash: {}", request.getChildId(), txHash);
        } else {
            // TODO: Implementasi Web3j — catat CID ke VCRegistry.recordVc()
            // txHash = web3j.contract.methods.recordVc(ipfsCid).send().getTransactionHash();
            throw new ForbiddenException("Mode non-simulasi belum diimplementasikan");
        }

        VerifiableCredential vc = VerifiableCredential.builder()
            .id(CuidGenerator.generate())
            .child(child)
            .issuer(issuer)
            .vcType(request.getVcType())
            .ipfsCid(ipfsCid)
            .txHash(txHash)
            .isRevoked(false)
            .expiresAt(request.getExpiresAt())
            .build();

        verifiableCredentialRepository.save(vc);

        String qrPayload = generateQrPayload(vc.getId(), ipfsCid, issuer.getWalletAddress());

        return IssueVcResponse.builder()
            .id(vc.getId())
            .childId(child.getId())
            .childAnonId(child.getAnonId())
            .issuerId(issuer.getId())
            .issuerWallet(issuer.getWalletAddress())
            .vcType(request.getVcType().name())
            .ipfsCid(ipfsCid)
            .txHash(txHash)
            .expiresAt(request.getExpiresAt())
            .createdAt(vc.getCreatedAt())
            .qrPayload(qrPayload)
            .build();
    }

    /**
     * Mendapatkan detail Verifiable Credential berdasarkan ID.
     * Data bersifat publik dan anonim (tanpa PII).
     *
     * @param vcId ID Verifiable Credential
     * @return detail VC
     */
    public VcDetailResponse getVc(String vcId) {
        VerifiableCredential vc = verifiableCredentialRepository.findById(vcId)
            .orElseThrow(() -> new ResourceNotFoundException("Verifiable Credential tidak ditemukan"));

        return VcDetailResponse.builder()
            .id(vc.getId())
            .context(List.of("https://www.w3.org/2018/credentials/v1"))
            .type(List.of("VerifiableCredential", "ChildHealthCredential"))
            .issuer(Map.of(
                "id", "did:polygon:" + (vc.getIssuer().getWalletAddress() != null
                    ? vc.getIssuer().getWalletAddress() : "unknown"),
                "name", vc.getIssuer().getName()
            ))
            .issuanceDate(vc.getCreatedAt())
            .expirationDate(vc.getExpiresAt())
            .credentialSubject(Map.of(
                "id", "urn:gizichain:child:" + vc.getChild().getAnonId(),
                "ageMonths", calculateAgeInMonths(vc.getChild()),
                "gender", vc.getChild().getGender().name(),
                "vcType", vc.getVcType().name()
            ))
            .isRevoked(vc.getIsRevoked())
            .ipfsCid(vc.getIpfsCid())
            .txHash(vc.getTxHash())
            .build();
    }

    /**
     * Mencabut (revoke) Verifiable Credential yang sudah diterbitkan.
     * Hanya issuer yang berhak mencabut VC-nya.
     *
     * @param request data VC yang akan dicabut
     * @param userId ID user yang mencabut
     * @return detail VC setelah dicabut
     */
    @Transactional
    public VcDetailResponse revokeVc(RevokeVcRequest request, String userId) {
        VerifiableCredential vc = verifiableCredentialRepository.findById(request.getVcId())
            .orElseThrow(() -> new ResourceNotFoundException("Verifiable Credential tidak ditemukan"));

        if (!vc.getIssuer().getId().equals(userId)) {
            throw new ForbiddenException("Anda tidak berhak mencabut VC ini. Hanya issuer yang bisa mencabut.");
        }

        if (vc.getIsRevoked()) {
            throw new ForbiddenException("VC ini sudah dicabut sebelumnya");
        }

        vc.setIsRevoked(true);

        if (simulation) {
            vc.setRevokeTxHash("0x" + CuidGenerator.generate().replace("-", ""));
            log.info("[SIMULASI] VC {} berhasil dicabut", request.getVcId());
        } else {
            // TODO: Implementasi Web3j — revoke on-chain
            // vc.setRevokeTxHash(web3j.contract.methods.revokeVc(vc.getIpfsCid()).send().getTransactionHash());
            throw new ForbiddenException("Mode non-simulasi belum diimplementasikan");
        }

        verifiableCredentialRepository.save(vc);

        return getVc(request.getVcId());
    }

    /**
     * Memverifikasi QR code VC.
     * Endpoint publik yang bisa diakses tanpa autentikasi.
     *
     * @param qrPayload encoded payload dari QR code
     * @return hasil verifikasi
     */
    public VerifyQrResponse verifyQr(String qrPayload) {
        try {
            String decoded = new String(Base64.getDecoder().decode(qrPayload));
            Map<String, String> payload = objectMapper.readValue(decoded, Map.class);

            String vcId = payload.get("vcId");
            if (vcId == null) {
                throw new ResourceNotFoundException("Payload QR tidak valid");
            }

            VerifiableCredential vc = verifiableCredentialRepository.findById(vcId)
                .orElseThrow(() -> new ResourceNotFoundException("VC tidak ditemukan"));

            return VerifyQrResponse.builder()
                .valid(vc.isValid())
                .vcId(vc.getId())
                .vcType(vc.getVcType().name())
                .childAnonId(vc.getChild().getAnonId())
                .issuerName(vc.getIssuer().getName())
                .issuedAt(vc.getCreatedAt())
                .expiresAt(vc.getExpiresAt())
                .isRevoked(vc.getIsRevoked())
                .verificationMethod("offline_signature + online_ipfs_chain")
                .ipfsCid(vc.getIpfsCid())
                .build();
        } catch (Exception e) {
            log.error("Gagal verifikasi QR: {}", e.getMessage());
            throw new ResourceNotFoundException("QR payload tidak valid: " + e.getMessage());
        }
    }

    /**
     * Mendapatkan VC status untuk seorang anak (VC aktif terbaru).
     *
     * @param childId ID anak
     * @return status VC anak (bisa null jika tidak ada VC aktif)
     */
    public VcStatusResponse getVcByChild(String childId) {
        List<VerifiableCredential> validVcs = verifiableCredentialRepository
            .findValidByChildId(childId);

        VcDetailResponse vcDetail = null;
        if (!validVcs.isEmpty()) {
            vcDetail = getVc(validVcs.get(0).getId());
        }

        return VcStatusResponse.builder()
            .vc(vcDetail)
            .build();
    }

    /**
     * Membangun dokumen VC dalam format W3C JSON-LD.
     */
    private Map<String, Object> buildVcDocument(Child child, User issuer, VcType vcType, OffsetDateTime expiresAt) {
        Map<String, Object> credentialSubject = new LinkedHashMap<>();
        credentialSubject.put("id", "urn:gizichain:child:" + child.getAnonId());
        credentialSubject.put("ageMonths", calculateAgeInMonths(child));
        credentialSubject.put("gender", child.getGender().name());
        credentialSubject.put("vcType", vcType.name());

        Map<String, Object> document = new LinkedHashMap<>();
        document.put("@context", List.of("https://www.w3.org/2018/credentials/v1"));
        document.put("type", List.of("VerifiableCredential", "ChildHealthCredential"));
        document.put("issuer", Map.of(
            "id", "did:polygon:" + issuer.getWalletAddress(),
            "name", issuer.getName()
        ));
        document.put("issuanceDate", OffsetDateTime.now().toString());
        if (expiresAt != null) {
            document.put("expirationDate", expiresAt.toString());
        }
        document.put("credentialSubject", credentialSubject);

        return document;
    }

    /**
     * Menghitung usia anak dalam bulan.
     */
    private int calculateAgeInMonths(Child child) {
        return java.time.Period.between(child.getBirthDate(), java.time.LocalDate.now()).getMonths()
            + java.time.Period.between(child.getBirthDate(), java.time.LocalDate.now()).getYears() * 12;
    }

    /**
     * Membuat payload QR code yang diencode base64.
     */
    private String generateQrPayload(String vcId, String ipfsCid, String issuerWallet) {
        try {
            Map<String, String> payload = new LinkedHashMap<>();
            payload.put("vcId", vcId);
            payload.put("ipfsCid", ipfsCid);
            payload.put("issuerDID", "did:polygon:" + issuerWallet);

            String json = objectMapper.writeValueAsString(payload);
            return Base64.getEncoder().encodeToString(json.getBytes());
        } catch (Exception e) {
            log.error("Gagal generate QR payload: {}", e.getMessage());
            return "";
        }
    }
}
