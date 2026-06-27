package com.nutricare.dto.response.vc;

import lombok.Builder;
import lombok.Data;

/**
 * Response untuk GET /api/vc/child/{childId}
 * Mengembalikan VC aktif milik anak, atau null jika tidak ada.
 */
@Data
@Builder
public class VcStatusResponse {
    private VcDetailResponse vc; // bisa null jika tidak ada VC aktif
}
