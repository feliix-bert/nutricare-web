/**
 * /api/chat — Next.js Route Handler
 *
 * ⚠️  Route ini sudah TIDAK DIGUNAKAN.
 *
 * Sesuai arsitektur (ARCHITECTURE.md & ENV.md), semua panggilan AI (Gemini)
 * dilakukan oleh Spring Boot (folder /server, port 8080).
 * Desktop hanya meneruskan request ke Spring Boot via apiClient.
 *
 * Endpoint yang benar: POST http://localhost:8080/api/chat
 */

import { NextResponse } from 'next/server';

export function POST() {
  return NextResponse.json(
    {
      error:
        'Endpoint ini tidak aktif. Semua request AI diteruskan ke Spring Boot (/server).',
    },
    { status: 410 },
  );
}
