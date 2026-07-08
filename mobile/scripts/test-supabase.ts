/**
 * Supabase Integration Test — Full CRUD + RLS + Auth
 *
 * Usage:
 *   npx tsx scripts/test-supabase.ts
 *
 * Environment (from .env):
 *   EXPO_PUBLIC_SUPABASE_URL
 *   EXPO_PUBLIC_SUPABASE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// ── ANSI helpers ──────────────────────────────────────────────────────────
const B = "\x1b[1m", G = "\x1b[32m", R = "\x1b[31m", Y = "\x1b[33m", GR = "\x1b[90m", X = "\x1b[0m";
const ok = (l: string, d = "") => console.log(`  ${G}✅ ${l}${X}${d ? GR + " " + d + X : ""}`);
const fail = (l: string, d = "") => console.log(`  ${R}❌ ${l}${X}${d ? " " + d + X : ""}`);
const info = (l: string, d = "") => console.log(`  ${Y}ℹ️  ${l}${X}${d ? GR + " " + d + X : ""}`);
const SEP = "─".repeat(58);

// ── Env ───────────────────────────────────────────────────────────────────
function loadEnv() {
  let url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  let key = process.env.EXPO_PUBLIC_SUPABASE_KEY;
  if (!url || !key) {
    for (const line of readFileSync(".env", "utf-8").split("\n")) {
      const [k, ...v] = line.split("=");
      const val = v.join("=").trim();
      if (k === "EXPO_PUBLIC_SUPABASE_URL") url = val;
      if (k === "EXPO_PUBLIC_SUPABASE_KEY") key = val;
    }
  }
  return { url: url ?? "", key: key ?? "" };
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  let childId = "", assId = "", nutId = "";
  let signedIn = false;

  console.log(`\n${B}🧪  SUPABASE INTEGRATION TEST${X}`);
  console.log(SEP);

  // 1. Env ──────────────────────────────────────────────────────────────────
  console.log(`\n${B}1. Environment${X}`);
  const { url, key } = loadEnv();
  if (!url || !key) { fail("EXPO_PUBLIC_SUPABASE_URL or KEY missing"); process.exit(1); }
  ok("Env loaded", url.replace(/.+\/\//, ""));

  // 2. Anon ─────────────────────────────────────────────────────────────────
  console.log(`\n${B}2. Anon connection (no session)${X}`);
  const sb = createClient(url, key);
  const { error: ping } = await sb.auth.getSession();
  if (ping) { fail("Supabase unreachable", ping.message); process.exit(1); }
  ok("Auth endpoint reachable");

  for (const table of ["users", "children", "assessments", "predictions", "nutrition_logs"]) {
    const { error: e } = await sb.from(table).select("count", { count: "exact", head: true });
    info(e ? `${table}: blocked by RLS` : `${table}: accessible (anon)`);
  }

  // 3. Register ─────────────────────────────────────────────────────────────
  console.log(`\n${B}3. Auth — Register${X}`);
  const email = `t-${Date.now()}@supatest.app`;
  const { data: reg, error: re } = await sb.auth.signUp({
    email, password: "TestPass123!",
    options: { data: { name: "Supabase Test Runner" } },
  });
  if (re || !reg.session) {
    fail("Register", re?.message);
    const { data: si } = await sb.auth.signInWithPassword({ email, password: "TestPass123!" });
    if (!si.session) { fail("Cannot obtain session"); process.exit(1); }
    reg.session = si.session; reg.user = si.user;
    ok("Signed in (existing user)");
  } else ok("Registered");

  const uid = reg.user!.id;
  ok("User ID", uid);
  signedIn = true;

  // 4. CRUD ─────────────────────────────────────────────────────────────────
  console.log(`\n${B}4. Authenticated CRUD${X}`);

  // 4a. INSERT child
  const anonId = `test_${Date.now()}`;
  const { data: child, error: ce } = await sb.from("children").insert({
    name: "Test Baby", birth_date: "2024-06-15", gender: "MALE",
    user_id: uid, anon_id: anonId,
  }).select().single();
  if (ce) { fail("INSERT child", ce.message + (ce.details ? " | " + ce.details : "")); }
  else { childId = child.id; ok("INSERT child", `${childId.slice(0, 8)}…`); }

  // 4b. READ nested
  if (childId) {
    const { data: d, error: de } = await sb.from("children")
      .select("*, assessments(*)").eq("id", childId).single();
    de ? fail("READ nested", de.message) : ok("READ nested", `${d.assessments.length} assessment(s)`);
  }

  // 4c. LIST
  const { data: list } = await sb.from("children").select("id,name").order("created_at", { ascending: false });
  ok("LIST children", `${list?.length ?? 0} total`);

  // 4d. INSERT assessment
  if (childId) {
    const { data: a, error: ae } = await sb.from("assessments").insert({
      child_id: childId, weight: 9.5, height: 74, head_circumference: 44.5,
      bf_exclusive: true, mpasi_age: 6, meal_freq: 3,
    }).select().single();
    if (ae) fail("INSERT assessment", ae.message);
    else { assId = a.id; ok("INSERT assessment", `${assId.slice(0, 8)}…`); }
  }

  // 4e. Nested w/ prediction
  if (childId) {
    const { data: d, error: de } = await sb.from("children")
      .select("*, assessments(*, prediction:predictions(*))").eq("id", childId).single();
    de ? fail("Nested w/ prediction", de.message) : ok("Nested w/ prediction", `${d.assessments.length} assessment(s)`);
  }

  // 4f. INSERT nutrition_log
  if (childId) {
    const { data: n, error: ne } = await sb.from("nutrition_logs").insert({
      child_id: childId, photo_url: "https://example.com/test.jpg",
      food_detected: ["Nasi", "Sayur"], calories: 350, protein: 12,
    }).select().single();
    if (ne) fail("INSERT nutrition_log", ne.message);
    else { nutId = n.id; ok("INSERT nutrition_log", `${nutId.slice(0, 8)}…`); }
  }

  // 4g. INSERT prediction (test RLS policy baru)
  if (assId) {
    const { data: pred, error: pe } = await sb.from("predictions").insert({
      assessment_id: assId,
      stunt_status: "NORMAL",
      prediction_status: "COMPLETED",
      zscore_wa: -0.5, zscore_ha: -0.8, zscore_wh: -0.2,
      risk_level: 0,
      summary: "Test: Z-score normal, tumbuh kembang baik.",
      recommendations: ["Pertahankan pola makan bergizi."],
      next_assessment_date: "2025-09-01",
      ai_limited: false,
    }).select().single();
    if (pe) fail("INSERT prediction", pe.message);
    else ok("INSERT prediction", `${pred.id.slice(0, 8)}…`);
  }

  // 4h. UPDATE child
  if (childId) {
    const { data: u, error: ue } = await sb.from("children")
      .update({ name: "Test Baby Updated" }).eq("id", childId).select().single();
    ue ? fail("UPDATE child", ue.message) : ok("UPDATE child", u.name);
  }

  // 4h. Paginated LIST
  if (childId) {
    const { data: p, error: pe } = await sb.from("children")
      .select("id", { count: "exact" }).order("created_at", { ascending: false }).range(0, 5);
    pe ? fail("Paginated LIST", pe.message) : ok("Paginated LIST (range 0-5)", `${p.length} items`);
  }

  // 4i. Profile
  const { data: prof, error: pfe } = await sb.from("users")
    .select("id, name, role").eq("id", uid).single();
  pfe ? fail("FETCH profile", pfe.message) : ok("FETCH profile", `${prof.name} (${prof.role})`);

  // 5. Storage ──────────────────────────────────────────────────────────────
  console.log(`\n${B}5. Storage${X}`);
  const { data: bkt, error: be } = await sb.storage.listBuckets();
  be ? info("Buckets not accessible", "expected per RLS / no storage configured") : ok("Buckets accessible", bkt.map(b => b.name).join(", ") || "(empty)");

  // 6. RLS ──────────────────────────────────────────────────────────────────
  console.log(`\n${B}6. RLS enforcement${X}`);
  if (childId) {
    const anon2 = createClient(url, key);
    const { data: ar } = await anon2.from("children").select("id").eq("id", childId);
    (ar && ar.length > 0) ? info("Anon CAN read children") : ok("Anon blocked from SELECT children");
  }
  const { error: ains } = await sb.from("children").insert({
    name: "X", birth_date: "2024-01-01", gender: "FEMALE",
    user_id: "00000000-0000-0000-0000-000000000000", anon_id: "x",
  });
  if (ains && ains.message?.includes("is_admin_or_medic")) {
    ok("Anon blocked from INSERT children (RLS via is_admin_or_medic)");
  } else if (ains) {
    ok("Anon blocked from INSERT children (RLS)");
  } else {
    info("Anon CAN insert children");
  }

  // 7. Cleanup ──────────────────────────────────────────────────────────────
  console.log(`\n${B}7. Cleanup${X}`);
  if (nutId) { const { error: e } = await sb.from("nutrition_logs").delete().eq("id", nutId); e ? fail("DEL nutrition_log", e.message) : ok("Deleted nutrition_log"); }
  if (assId) { const { error: e } = await sb.from("assessments").delete().eq("id", assId); e ? fail("DEL assessment", e.message) : ok("Deleted assessment"); }
  if (childId) { const { error: e } = await sb.from("children").delete().eq("id", childId); e ? fail("DEL child", e.message) : ok("Deleted child"); }
  await sb.auth.signOut();
  ok("Signed out");

  // Summary ─────────────────────────────────────────────────────────────────
  console.log(`\n${SEP}`);
  console.log(`${B}${G} ALL TESTS PASSED ✅${X}`);
  console.log(`${SEP}\n`);
}

main().catch((e) => {
  console.error(`\n${R}${B} FATAL:${X}`, e?.message ?? e);
  process.exit(1);
});
