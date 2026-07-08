import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
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

export const ConsultationDoctorScreen = () => {
  const { parentId } = useLocalSearchParams<{ parentId: string }>();
  const user = useAuthStore((s) => s.user);
  const consultationIdRef = useRef<string | null>(null);
  const [parentName, setParentName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [history, setHistory] = useState<ConsultationMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!parentId || !user) return;
    (async () => {
      const { data: consultation } = await supabase
        .from('consultations')
        .select('id')
        .eq('parent_id', parentId)
        .maybeSingle();

      if (!consultation) { setLoading(false); return; }
      consultationIdRef.current = consultation.id;

      const [parentRes, doctorRes, msgRes] = await Promise.all([
        supabase.from('users').select('name').eq('id', parentId).single(),
        supabase.from('users').select('name').eq('id', user.id).single(),
        supabase
          .from('consultation_messages')
          .select('*')
          .eq('consultation_id', consultation.id)
          .order('created_at', { ascending: true }),
      ]);
      const pName = parentRes.data?.name ?? 'Pasien';
      const dName = doctorRes.data?.name ?? user.name ?? 'Dokter';
      setParentName(pName);
      setDoctorName(dName);
      setHistory(mapHistory((msgRes.data ?? []) as DbMessageRow[], parentId, pName, dName));
      setLoading(false);
    })();
  }, [parentId, user]);

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

  return (
    <>
      <Stack.Screen options={{ title: parentName }} />
      <RealtimeChat
        roomName={'consult_' + parentId}
        username={user?.name ?? ''}
        userId={user?.id ?? ''}
        messages={history}
        onMessage={handleMessage}
      />
    </>
  );
};
