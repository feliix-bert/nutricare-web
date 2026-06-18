package com.nutricare.util;

import java.security.SecureRandom;

/**
 * Generator CUID sederhana untuk primary key.
 * Format: c + timestamp + fingerprint + random
 * Panjang: ~25 karakter (masuk dalam VARCHAR(30))
 */
public class CuidGenerator {

    private static final String ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();
    private static int counter = 0;

    public static String generate() {
        long timestamp = System.currentTimeMillis();
        String ts = Long.toString(timestamp, 36);
        String rand = randomBlock(4) + randomBlock(4);
        String cnt = String.format("%04d", counter++ % 9999);
        return "c" + ts + cnt + rand;
    }

    private static String randomBlock(int length) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            sb.append(ALPHABET.charAt(RANDOM.nextInt(ALPHABET.length())));
        }
        return sb.toString();
    }
}
