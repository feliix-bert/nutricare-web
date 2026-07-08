import { supabase } from '@/utils/supabase';
import type { Patient, Conversation } from '../types/medic-types';

// ── Transform helpers ────────────────────────────────────────────────────

type SupabaseChildRow = {
  id: string;
  name: string;
  birth_date: string;
  created_at: string;
  parent: { id: string; name: string } | null;
  assessments: Array<{
    created_at: string;
    prediction: {
      stunt_status: string;
      risk_level: number | null;
      created_at: string;
    } | null;
  }>;
};

function toPatient(row: SupabaseChildRow): Patient {
  const latest = row.assessments?.length > 0
    ? row.assessments.reduce((a, b) => (a.created_at > b.created_at ? a : b))
    : null;
  const birth = new Date(row.birth_date);
  const now = new Date();
  const ageMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  return {
    childId: row.id,
    childName: row.name,
    childAgeMonths: Math.max(0, ageMonths),
    lastAssessmentDate: latest?.prediction?.created_at ?? undefined,
    lastStatus: (latest?.prediction?.stunt_status as Patient['lastStatus']) ?? undefined,
    hasActiveVc: false,
    parentId: row.parent?.id ?? '',
    parentName: row.parent?.name ?? '',
  };
}

// ── Service ──────────────────────────────────────────────────────────────

export const medicService = {
  getConversations: async (): Promise<{ data: Conversation[] }> => {
    const { data: msgs, error } = await supabase
      .from('consultation_messages')
      .select(`
        content,
        created_at,
        consultation:consultations!inner (
          parent_id
        )
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;

    const latestByParent = new Map<string, { content: string; created_at: string }>();
    for (const item of (msgs ?? []) as any[]) {
      const pid = item.consultation?.parent_id;
      if (!pid) continue;
      if (!latestByParent.has(pid)) {
        latestByParent.set(pid, { content: item.content, created_at: item.created_at });
      }
    }

    if (latestByParent.size === 0) return { data: [] };

    const parentIds = Array.from(latestByParent.keys());
    const { data: parents } = await supabase
      .from('users')
      .select('id, name')
      .in('id', parentIds);

    const nameMap = new Map(parents?.map((p) => [p.id, p.name]) ?? []);

    return {
      data: Array.from(latestByParent.entries()).map(([pid, msg]) => ({
        parentId: pid,
        parentName: nameMap.get(pid) ?? 'Unknown',
        lastMessage: msg.content,
        lastMessageAt: msg.created_at,
      })),
    };
  },

  getPatients: async (page = 0, size = 10, search?: string, status?: string): Promise<{ data: Patient[] }> => {
    let query = supabase
      .from('children')
      .select(`
        id, name, birth_date, created_at,
        parent:users(id, name),
        assessments(
          created_at,
          prediction:predictions(stunt_status, risk_level, created_at)
        )
      `)
      .order('created_at', { ascending: false });
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }
    const from = page * size;
    const to = from + size - 1;
    const { data, error } = await query.range(from, to);
    if (error) throw error;
    const rows = (data ?? []) as unknown as SupabaseChildRow[];
    let patients = rows.map(toPatient);
    if (status && status !== 'ALL') {
      patients = patients.filter((p) => p.lastStatus === status);
    }
    return { data: patients };
  },
};
