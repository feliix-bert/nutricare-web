import { createClient } from "@/lib/supabase/client";
import type { PaginatedPatients, Patient, IssueVcPayload, RevokeVcPayload } from "../types/medic.types";

export const fetchPatients = async (
  page = 0,
  size = 10,
  search = "",
  status = "ALL",
): Promise<PaginatedPatients> => {
  const supabase = createClient();
  const from = page * size;
  const to = from + size - 1;

  // Build query: children joined with users (parent name) and latest prediction
  let query = supabase
    .from("children")
    .select(
      `
      id,
      name,
      gender,
      birth_date,
      user_id,
      users!inner(name),
      assessments(
        id,
        created_at,
        predictions(stunt_status, risk_level)
      )
    `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(`name.ilike.%${search}%,users.name.ilike.%${search}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  const calcAgeMonths = (birthDate: string) => {
    const birth = new Date(birthDate);
    const now = new Date();
    return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  };

  const patients: Patient[] = (data ?? []).map((row) => {
    const assessments = row.assessments ?? [];
    const sorted = [...assessments].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    const latestAssessment = sorted[0];
    const prediction = latestAssessment?.predictions;
    const predData = Array.isArray(prediction) ? prediction[0] : prediction;

    return {
      childId: row.id,
      childName: row.name,
      gender: row.gender as Patient["gender"],
      birthDate: row.birth_date,
      ageMonths: calcAgeMonths(row.birth_date),
      parentName: (row.users as unknown as { name: string }).name ?? "Unknown",
      lastStatus: predData?.stunt_status ?? "NORMAL",
      lastAssessmentDate: latestAssessment?.created_at ?? null,
      activeVcId: undefined,
      vcStatus: undefined,
    };
  });

  // Filter by status client-side if needed
  const filtered = status !== "ALL" ? patients.filter((p) => p.lastStatus === status) : patients;

  return {
    data: filtered,
    page,
    size,
    totalElements: count ?? 0,
    totalPages: count ? Math.ceil(count / size) : 0,
  };
};

export const fetchPatientSummary = async (childId: string) => {
  const supabase = createClient();

  const { data: child } = await supabase
    .from("children")
    .select(
      `
      *,
      users(name, wallet_address),
      assessments(
        *,
        predictions(*),
        blockchain_anchors(*)
      )
    `,
    )
    .eq("id", childId)
    .single();

  return child;
};

export const issueVc = async (payload: IssueVcPayload) => {
  // This still goes through Next.js API route (server-side signing + IPFS)
  const res = await fetch("/api/vc/issue", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to issue VC");
  return res.json();
};

export const revokeVc = async (payload: RevokeVcPayload) => {
  const res = await fetch("/api/vc/revoke", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to revoke VC");
  return res.json();
};
