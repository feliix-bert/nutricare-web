/**
 * CREATE MEDIC ACCOUNT — daftarkan tenaga medis baru
 *
 * Fungsi:
 *   Membuat akun MEDIC baru (signup via Supabase Admin API + insert profile
 *   ke public.users). Cocok untuk ADMIN yang mau nambahin dokter tanpa
 *   perlu registrasi dari hp.
 *
 * Requirements:
 *   SUPABASE_SERVICE_ROLE_KEY di .env (dari dashboard Supabase > Settings > API)
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import * as readline from "readline";

const B = "\x1b[1m", G = "\x1b[32m", R = "\x1b[31m", Y = "\x1b[33m", X = "\x1b[0m";

function randomWallet(): string {
  const hex = "0123456789abcdef";
  let addr = "0x";
  for (let i = 0; i < 40; i++) addr += hex[Math.floor(Math.random() * 16)];
  return addr;
}

function loadEnv() {
  let url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  let serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  for (const line of readFileSync(".env", "utf-8").split("\n")) {
    const [k, ...v] = line.split("=");
    const val = v.join("=").trim();
    if (k === "EXPO_PUBLIC_SUPABASE_URL") url = val;
    if (k === "SUPABASE_SERVICE_ROLE_KEY") serviceKey = val;
  }
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

  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4];
  const wallet = process.argv[5];

  if (email && password && name) {
    await createMedic(sb, email, password, name, wallet ?? randomWallet());
    return;
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log(`\n${B}👤  BUAT AKUN MEDIC${X}\n`);

  const inputEmail = await ask(rl, "  Email            : ");
  const inputPassword = await ask(rl, "  Password         : ");
  const inputName = await ask(rl, "  Nama Lengkap     : ");
  const inputWallet = await ask(rl, `  Wallet Address   (biarkan kosong untuk generate otomatis): `);
  const finalWallet = inputWallet || randomWallet();

  if (!inputEmail || !inputPassword || !inputName) {
    console.log(`\n${R}Email, password, dan nama wajib diisi.\n`);
    process.exit(1);
  }

  rl.close();
  await createMedic(sb, inputEmail, inputPassword, inputName, finalWallet);
}

async function createMedic(
  sb: ReturnType<typeof createClient>,
  email: string,
  password: string,
  name: string,
  wallet: string,
) {
  console.log(`\n${B}📋  MEMBUAT MEDIC ACCOUNT${X}`);
  console.log(`  Email    : ${email}`);
  console.log(`  Nama     : ${name}`);
  console.log(`  Wallet   : ${wallet}\n`);

  const { data: authUser, error: authErr } = await sb.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });

  if (authErr) {
    if (authErr.message.includes("already registered")) {
      console.log(`  ${Y}⚠️  Email sudah terdaftar, lanjut insert profile...${X}`);
    } else {
      console.error(`\n${R}${B}ERROR:${X} ${authErr.message}\n`);
      process.exit(1);
    }
  } else {
    console.log(`  ${G}✅ Auth user created${X} ${authUser.user?.id ?? ""}`);
  }

  let uid = authUser?.user?.id;
  if (!uid) {
    const { data: existing } = await sb.auth.admin.listUsers();
    const found = existing?.users?.find((u: { email?: string }) => u.email === email);
    uid = found?.id;
    if (!uid) {
      console.error(`\n${R}${B}ERROR:${X} User ID tidak ditemukan\n`);
      process.exit(1);
    }
  }

  const { error: profileErr } = await sb.from("users").upsert({
    id: uid,
    email,
    name,
    role: "MEDIC",
    wallet_address: wallet || null,
    is_active: true,
  }, { onConflict: "id" });

  if (profileErr) {
    console.error(`\n${R}${B}ERROR insert profile:${X} ${profileErr.message}\n`);
    process.exit(1);
  }

  console.log(`  ${G}✅ Profile inserted${X} (role: MEDIC)`);
  console.log(`\n${B}${G}✨  SELESAI — Akun MEDIC siap digunakan${X}\n`);
}

main().catch((e) => {
  console.error(`\n${R}${B}FATAL:${X} ${e?.message ?? e}\n`);
  process.exit(1);
});
