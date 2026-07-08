/**
 * ASSIGN DOCTOR — hubungkan orang tua dengan dokter
 *
 * Fungsi:
 *   Mengisi kolom `doctor_id` di public.users untuk role PARENT,
 *   sehingga orang tua dan anak-anaknya terdaftar sebagai pasien
 *   dari seorang MEDIC. Wajib dijalankan SETELAH akun MEDIC dan
 *   PARENT sudah dibuat.
 *
 * Requirements:
 *   SUPABASE_SERVICE_ROLE_KEY di .env (dari dashboard Supabase > Settings > API)
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import * as readline from "readline";

const B = "\x1b[1m", G = "\x1b[32m", R = "\x1b[31m", Y = "\x1b[33m", C = "\x1b[36m", X = "\x1b[0m";

function loadEnv() {
  let url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  let serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  try {
    for (const line of readFileSync(".env", "utf-8").split("\n")) {
      const [k, ...v] = line.split("=");
      const val = v.join("=").trim();
      if (k === "EXPO_PUBLIC_SUPABASE_URL") url = val;
      if (k === "SUPABASE_SERVICE_ROLE_KEY") serviceKey = val;
    }
  } catch {}
  return { url: url ?? "", serviceKey: serviceKey ?? "" };
}

function ask(rl: readline.Interface, query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, (answer) => resolve(answer.trim())));
}

async function main() {
  const { url, serviceKey } = loadEnv();
  if (!url || !serviceKey) {
    console.error(`\n${R}${B}ERROR:${X} Butuh SUPABASE_SERVICE_ROLE_KEY di .env\n`);
    console.log(`Tambahkan ke .env:\n  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key\n`);
    console.log(`Cari di: https://supabase.com/dashboard/project/_/settings/api`);
    process.exit(1);
  }

  const sb = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  const parentArg = process.argv.indexOf("--parent");
  const doctorArg = process.argv.indexOf("--doctor");

  if (parentArg !== -1 && doctorArg !== -1) {
    const parentId = process.argv[parentArg + 1];
    const doctorId = process.argv[doctorArg + 1];
    if (parentId && doctorId) {
      await assign(sb, parentId, doctorId);
      return;
    }
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log(`\n${B}🔗  ASSIGN PARENT → DOCTOR${X}\n`);

  // ── List MEDICs ──────────────────────────────────────────────
  console.log(`${B}Mencari dokter...${X}`);
  const { data: medics, error: medicErr } = await sb
    .from("users")
    .select("id, name, email, wallet_address")
    .eq("role", "MEDIC")
    .eq("is_active", true);

  if (medicErr) {
    console.error(`\n${R}${B}ERROR:${X} ${medicErr.message}\n`);
    process.exit(1);
  }

  if (!medics || medics.length === 0) {
    console.log(`\n${Y}Tidak ada MEDIC aktif. Buat dulu: npx tsx scripts/create-medic.ts${X}\n`);
    process.exit(1);
  }

  console.log(`\n${B}Pilih Dokter:${X}\n`);
  for (let i = 0; i < medics.length; i++) {
    console.log(`  ${C}${i + 1}${X}. ${medics[i].name}  (${medics[i].email})`);
  }
  console.log(`  ${C}0${X}. Batal`);
  const docChoice = await ask(rl, `\n  Pilihan [1-${medics.length}]: `);
  const docIdx = parseInt(docChoice) - 1;
  if (isNaN(docIdx) || docIdx < 0 || docIdx >= medics.length) {
    console.log(`\n${Y}Dibatalkan.${X}\n`);
    process.exit(0);
  }
  const doctor = medics[docIdx];

  // ── List PARENTs ────────────────────────────────────────────
  console.log(`\n${B}Mencari orang tua tanpa dokter...${X}`);
  const { data: parents, error: parentErr } = await sb
    .from("users")
    .select("id, name, email, doctor_id")
    .eq("role", "PARENT")
    .eq("is_active", true)
    .is("doctor_id", null);

  if (parentErr) {
    console.error(`\n${R}${B}ERROR:${X} ${parentErr.message}\n`);
    process.exit(1);
  }

  if (!parents || parents.length === 0) {
    console.log(`\n${Y}Semua PARENT sudah punya dokter.${X}\n`);
    process.exit(0);
  }

  console.log(`\n${B}Pilih Orang Tua:${X}\n`);
  for (let i = 0; i < parents.length; i++) {
    console.log(`  ${C}${i + 1}${X}. ${parents[i].name}  (${parents[i].email})`);
  }
  console.log(`  ${C}0${X}. Batal`);
  const parentChoice = await ask(rl, `\n  Pilihan [1-${parents.length}]: `);
  const parentIdx = parseInt(parentChoice) - 1;
  if (isNaN(parentIdx) || parentIdx < 0 || parentIdx >= parents.length) {
    console.log(`\n${Y}Dibatalkan.${X}\n`);
    process.exit(0);
  }
  const parent = parents[parentIdx];

  rl.close();

  console.log(`\n${B}📋  RINGKASAN${X}`);
  console.log(`  Dokter : ${doctor.name} (${doctor.email})`);
  console.log(`  Pasien : ${parent.name} (${parent.email})`);

  const confirm = await ask(readline.createInterface({ input: process.stdin, output: process.stdout }), `\n  ${Y}Konfirmasi assign? (y/N): ${X}`);
  if (confirm.toLowerCase() !== "y") {
    console.log(`\n${Y}Dibatalkan.${X}\n`);
    process.exit(0);
  }

  await assign(sb, parent.id, doctor.id);
}

async function assign(
  sb: ReturnType<typeof createClient>,
  parentId: string,
  doctorId: string,
) {
  const { error } = await sb
    .from("users")
    .update({ doctor_id: doctorId })
    .eq("id", parentId);

  if (error) {
    console.error(`\n${R}${B}ERROR:${X} ${error.message}\n`);
    process.exit(1);
  }

  console.log(`\n${B}${G}✅  SELESAI — Orang tua terhubung dengan dokter${X}\n`);
}

main().catch((e) => {
  console.error(`\n${R}${B}FATAL:${X} ${e?.message ?? e}\n`);
  process.exit(1);
});
