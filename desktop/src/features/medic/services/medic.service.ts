import { createClient } from "@/lib/supabase/client";
import type { PaginatedPatients, Patient, IssueVcPayload, RevokeVcPayload } from "../types/medic.types";

const calcAgeMonths = (birthDate: string) => {
  const birth = new Date(birthDate);
  const now = new Date();
  return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
};

export const fetchPatients = async (
  page = 0,
  size = 10,
  search = "",
  status = "ALL",
): Promise<PaginatedPatients> => {
  const supabase = createClient();
  const from = page * size;
  const to = from + size - 1;

  // Get current medic's id
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Step 1: Get child IDs that this medic has consultations with
  const { data: consultedRows } = await supabase
    .from("consultations")
    .select("child_id")
    .eq("medic_id", user.id);

  const childIdsFromConsults: string[] = (consultedRows ?? [])
    .map((c: { child_id: string }) => c.child_id)
    .filter(Boolean);

  // Step 2: Build child query
  // Include children where: medic_id = me, OR child_id is in consultations list
  let query = supabase
    .from("children")
    .select(
      `
      id,
      name,
      gender,
      birth_date,
      user_id,
      medic_id,
      users!user_id!inner(name),
      assessments(
        id,
        created_at,
        predictions(stunt_status, risk_level, zscore_ha, zscore_wa, zscore_wh)
      )
    `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false });

  if (childIdsFromConsults.length > 0) {
    // OR: medic_id matches, or child is in consultation list
    query = query.or(
      `medic_id.eq.${user.id},id.in.(${childIdsFromConsults.join(",")})`
    );
  } else {
    query = query.eq("medic_id", user.id);
  }

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  const patients: Patient[] = (data ?? []).map((row) => {
    const assessments = (row.assessments as Array<{
      id: string;
      created_at: string;
      predictions: Array<{
        stunt_status: string;
        risk_level: number;
        zscore_ha?: number;
        zscore_wa?: number;
        zscore_wh?: number;
      }> | null;
    }>) ?? [];

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
      lastStatus: (predData?.stunt_status ?? "NORMAL") as Patient["lastStatus"],
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
      users!user_id(name, wallet_address),
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
