import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/utils/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { ConsultationMessage } from '@/features/chat/types/chat-types';
import { RealtimeChat } from '@/features/chat/components/RealtimeChat';

type DbMessageRow = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

function mapHistory(
  rows: DbMessageRow[],
  parentId: string,
  parentName: string,
  doctorName: string,
): ConsultationMessage[] {
  return rows.map((r) => ({
    id: r.id,
    content: r.content,
    senderId: r.sender_id,
    userName: r.sender_id === parentId ? parentName : doctorName,
    createdAt: r.created_at,
  }));
}

async function ensureConsultation(parentId: string, doctorId: string): Promise<string> {
  const { data: existing } = await supabase
    .from('consultations')
    .select('id')
    .eq('parent_id', parentId)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: firstChild } = await supabase
    .from('children')
    .select('id')
    .eq('user_id', parentId)
    .limit(1)
    .maybeSingle();

  const { data: created, error } = await supabase
    .from('consultations')
    .insert({
      parent_id: parentId,
      medic_id: doctorId,
      child_id: firstChild?.id ?? null,
      status: 'OPEN',
    })
    .select('id')
    .single();

  if (error || !created) throw new Error('Gagal membuat sesi konsultasi');
  return created.id;
}

export const ConsultationParentScreen = () => {
  const user = useAuthStore((s) => s.user);
  const consultationIdRef = useRef<string | null>(null);
  const [doctorName, setDoctorName] = useState('');
  const [history, setHistory] = useState<ConsultationMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.doctorId || !user?.id) { setLoading(false); return; }
    (async () => {
      const [doctorRes] = await Promise.all([
        supabase.from('users').select('name').eq('id', user.doctorId!).single(),
      ]);
      const dName = doctorRes.data?.name ?? 'Dokter';
      setDoctorName(dName);

      const consId = await ensureConsultation(user.id, user.doctorId!);
      consultationIdRef.current = consId;

      const { data: msgRows } = await supabase
        .from('consultation_messages')
        .select('*')
        .eq('consultation_id', consId)
        .order('created_at', { ascending: true });

      setHistory(mapHistory(
        (msgRows ?? []) as DbMessageRow[],
        user.id,
        user.name ?? 'Saya',
        dName,
      ));
      setLoading(false);
    })();
  }, [user?.doctorId, user?.id, user?.name]);

  const handleMessage = useCallback(
    async (messages: ConsultationMessage[]) => {
      const last = messages[messages.length - 1];
      if (!last || !user || !consultationIdRef.current) return;
      if (last.senderId !== user.id) return;
      const { error } = await supabase.from('consultation_messages').insert({
        id: last.id,
        consultation_id: consultationIdRef.current,
        sender_id: user.id,
        content: last.content,
        created_at: last.createdAt,
      });
      if (error && !error.message?.includes('duplicate key')) {
        console.error('Failed to persist message:', error.message);
      }
    },
    [user],
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#3e646a" />
      </SafeAreaView>
    );
  }

  if (!user?.doctorId) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-gray-500 text-center">
          Kamu belum terdaftar ke dokter. Hubungi admin untuk pendaftaran.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Konsultasi - ' + doctorName }} />
      <RealtimeChat
        roomName={'consult_' + user.id}
        username={user.name ?? ''}
        userId={user.id}
        messages={history}
        onMessage={handleMessage}
      />
    </>
  );
};
