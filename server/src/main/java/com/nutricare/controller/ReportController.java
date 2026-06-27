package com.nutricare.controller;

import com.nutricare.domain.entity.User;
import com.nutricare.domain.enums.Role;
import com.nutricare.repository.ChildRepository;
import com.nutricare.service.impl.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * ReportController — /api/reports/**
 *
 * BE-601: GET /api/reports/child/{childId} — download PDF laporan anak
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final ChildRepository childRepository;

    /**
     * GET /api/reports/child/{childId}?from=yyyy-MM-dd&to=yyyy-MM-dd
     * Generate dan unduh laporan PDF tumbuh kembang anak.
     *
     * @param childId ID anak
     * @param from    tanggal awal filter (default 30 hari lalu)
     * @param to      tanggal akhir filter (default hari ini)
     * @param user    user yang login
     * @return file PDF sebagai byte array
     */
    @GetMapping("/child/{childId}")
    @PreAuthorize("hasRole('PARENT') or hasRole('MEDIC') or hasRole('ADMIN')")
    public ResponseEntity<byte[]> downloadReport(
            @PathVariable String childId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @AuthenticationPrincipal User user) {

        LocalDate startDate = from != null ? from : LocalDate.now().minusDays(30);
        LocalDate endDate = to != null ? to : LocalDate.now();

        // PARENT → ownership check di service; MEDIC & ADMIN → kirim owner userId
        String ownerId = user.getRole() == Role.PARENT
                ? user.getId()
                : childRepository.findById(childId)
                        .orElseThrow()
                        .getUser().getId();

        byte[] pdfBytes = reportService.generateChildReport(childId, ownerId, startDate, endDate);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"laporan-anak-" + childId + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
