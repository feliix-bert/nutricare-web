package com.nutricare.service.impl;

import com.nutricare.exception.StorageException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.UUID;

/**
 * Service untuk mengelola file di Supabase Storage.
 * Menyediakan fungsi upload, delete, dan generate URL publik.
 * File foto makanan disimpan di bucket yang dikonfigurasi.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StorageService {

    private final WebClient webClient;

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    @Value("${supabase.bucket}")
    private String bucket;

    /**
     * Mengupload file ke Supabase Storage dan mengembalikan URL publik.
     * File disimpan dengan nama unik untuk menghindari bentrok.
     *
     * @param data byte array dari file yang akan diupload
     * @param originalName nama asli file (digunakan untuk ekstensi)
     * @param contentType tipe MIME file
     * @return URL publik file yang sudah terupload
     * @throws StorageException jika upload gagal
     */
    public String upload(byte[] data, String originalName, String contentType) {
        String fileName = generateFileName(originalName);
        String uploadUrl = supabaseUrl + "/storage/v1/object/" + bucket + "/" + fileName;

        try {
            webClient.post()
                .uri(uploadUrl)
                .header("apikey", supabaseKey)
                .header("Authorization", "Bearer " + supabaseKey)
                .contentType(MediaType.parseMediaType(contentType))
                .bodyValue(data)
                .retrieve()
                .bodyToMono(Void.class)
                .block();

            return supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + fileName;
        } catch (Exception e) {
            log.error("Gagal upload file ke Supabase Storage: {}", e.getMessage());
            throw new StorageException("Gagal mengupload file: " + e.getMessage());
        }
    }

    /**
     * Menghapus file dari Supabase Storage berdasarkan URL publik.
     *
     * @param publicUrl URL publik file yang akan dihapus
     * @throws StorageException jika penghapusan gagal
     */
    public void delete(String publicUrl) {
        try {
            String path = extractPathFromUrl(publicUrl);
            String deleteUrl = supabaseUrl + "/storage/v1/object/" + bucket + "/" + path;

            webClient.delete()
                .uri(deleteUrl)
                .header("apikey", supabaseKey)
                .header("Authorization", "Bearer " + supabaseKey)
                .retrieve()
                .bodyToMono(Void.class)
                .block();
        } catch (Exception e) {
            log.error("Gagal hapus file dari Supabase Storage: {}", e.getMessage());
            throw new StorageException("Gagal menghapus file: " + e.getMessage());
        }
    }

    /**
     * Membuat nama file unik dengan tetap mempertahankan ekstensi asli.
     */
    private String generateFileName(String originalName) {
        String extension = "";
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf("."));
        }
        return UUID.randomUUID().toString() + extension;
    }

    /**
     * Mengekstrak path file dari URL publik Supabase Storage.
     */
    private String extractPathFromUrl(String publicUrl) {
        String prefix = "/storage/v1/object/public/" + bucket + "/";
        int startIndex = publicUrl.indexOf(prefix);
        if (startIndex == -1) {
            throw new StorageException("URL file tidak valid");
        }
        return publicUrl.substring(startIndex + prefix.length());
    }
}
