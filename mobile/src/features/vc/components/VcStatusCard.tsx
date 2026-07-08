import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { VcRecord } from '../types/vc-types';

export const VcStatusCard = ({ vc, hasActiveVc, isLoading, onViewDetails }: { vc: VcRecord | null | undefined, hasActiveVc: boolean, isLoading?: boolean, onViewDetails?: () => void }) => {
  if (isLoading) return <Card className="p-4 mb-4"><Text>Memuat status VC...</Text></Card>;
  if (!vc || !hasActiveVc) return (
    <Card className="p-4 mb-4">
      <Text className="font-bold">Verifiable Credential</Text>
      <Text className="text-xs">Belum ada VC aktif</Text>
    </Card>
  );
  return (
    <Pressable onPress={onViewDetails}>
      <Card className="p-4 mb-4 border border-primary/20 bg-primary/5">
        <Text className="font-bold">Verifiable Credential</Text>
        <Text className="text-xs text-primary font-bold">{vc.status}</Text>
        <Text className="text-[10px] mt-1">Tx: {vc.txHash.slice(0,10)}...</Text>
      </Card>
    </Pressable>
  );
};
