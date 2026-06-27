package com.nutricare.controller;

import com.nutricare.domain.entity.User;
import com.nutricare.dto.request.vc.IssueVcRequest;
import com.nutricare.dto.request.vc.RevokeVcRequest;
import com.nutricare.dto.response.vc.IssueVcResponse;
import com.nutricare.dto.response.vc.VcDetailResponse;
import com.nutricare.dto.response.vc.VcStatusResponse;
import com.nutricare.dto.response.vc.VerifyQrResponse;
import com.nutricare.service.impl.VcService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * VcController — /api/vc/** dan GET /api/verify
 *
 * BE-601: POST /api/vc/issue — terbitkan VC (MEDIC/ADMIN)
 * BE-602: GET  /api/vc/{vcId} — detail VC (publik)
 * BE-603: POST /api/vc/revoke — cabut VC (MEDIC/ADMIN issuer only)
 * BE-604: GET  /api/verify?qr=... — verifikasi QR publik
 */
@RestController
@RequiredArgsConstructor
public class VcController {

    private final VcService vcService;

    // ── POST /api/vc/issue ─────────────────────────────────────────────────

    /**
     * POST /api/vc/issue
     * Menerbitkan Verifiable Credential baru untuk seorang anak.
     * Hanya MEDIC dan ADMIN yang berhak.
     */
    @PostMapping("/api/vc/issue")
    @PreAuthorize("hasRole('MEDIC') or hasRole('ADMIN')")
    public ResponseEntity<IssueVcResponse> issueVc(
            @Valid @RequestBody IssueVcRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(vcService.issueVc(request, user.getId()));
    }

    // ── GET /api/vc/{vcId} ─────────────────────────────────────────────────

    /**
     * GET /api/vc/{vcId}
     * Detail Verifiable Credential — endpoint publik (tanpa PII).
     * Bisa diakses faskes, sekolah, atau siapapun untuk verifikasi.
     */
    @GetMapping("/api/vc/{vcId}")
    public ResponseEntity<VcDetailResponse> getVc(@PathVariable String vcId) {
        return ResponseEntity.ok(vcService.getVc(vcId));
    }

    // ── GET /api/vc/child/{childId} ──────────────────────────────────────────────

    /**
     * GET /api/vc/child/{childId}
     * Mendapatkan VC status untuk seorang anak (VC aktif terbaru).
     * Endpoint publik — bisa diakses siapa saja.
     */
    @GetMapping("/api/vc/child/{childId}")
    public ResponseEntity<VcStatusResponse> getVcByChild(@PathVariable String childId) {
        return ResponseEntity.ok(vcService.getVcByChild(childId));
    }

    // ── POST /api/vc/revoke ────────────────────────────────────────────────

    /**
     * POST /api/vc/revoke
     * Mencabut VC yang sudah diterbitkan.
     * Service akan memeriksa apakah user adalah issuer dari VC tersebut.
     * Hanya MEDIC dan ADMIN yang bisa mengakses endpoint.
     */
    @PostMapping("/api/vc/revoke")
    @PreAuthorize("hasRole('MEDIC') or hasRole('ADMIN')")
    public ResponseEntity<VcDetailResponse> revokeVc(
            @Valid @RequestBody RevokeVcRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(vcService.revokeVc(request, user.getId()));
    }

    // ── GET /api/verify ────────────────────────────────────────────────────

    /**
     * GET /api/verify?qr={payload}
     * Verifikasi QR code VC — endpoint publik tanpa autentikasi.
     * Digunakan oleh faskes untuk memverifikasi status gizi anak.
     */
    @GetMapping("/api/verify")
    public ResponseEntity<VerifyQrResponse> verifyQr(@RequestParam("qr") String qrPayload) {
        return ResponseEntity.ok(vcService.verifyQr(qrPayload));
    }
}
