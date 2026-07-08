import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Card } from '@/components/ui/Card';
import type { Patient } from '../types/medic-types';

type VcAction = 'issuing' | 'revoking' | 'none';

type PatientCardProps = {
  patient: Patient;
  onPress?: (patient: Patient) => void;
  onChat?: (patient: Patient) => void;
  onIssueVc?: (patient: Patient) => void;
  onRevokeVc?: (patient: Patient) => void;
  vcAction?: VcAction;
};

const STATUS_COLORS: Record<string, string> = {
  NORMAL: '#506444', AT_RISK: '#64601e', STUNTED: '#ba1a1a', SEVERELY_STUNTED: '#93000a',
};

export const PatientCard = React.memo(({ patient, onPress, onChat, onIssueVc, onRevokeVc, vcAction }: PatientCardProps) => {
  return (
    <Pressable onPress={() => onPress?.(patient)} disabled={!onPress} className="mb-3 active:opacity-80">
      <Card className="p-4 bg-surface-low border border-outline-variant/10">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="font-bold text-on-surface">{patient.childName}</Text>
            <Text className="text-xs text-outline">{patient.childAgeMonths} bulan</Text>
            <Text className="text-xs text-outline mt-1">Orang tua: {patient.parentName}</Text>
          </View>
          {patient.lastStatus && (
            <View className={`px-2 py-1 rounded-full`} style={{ backgroundColor: `${STATUS_COLORS[patient.lastStatus]}20` }}>
              <Text className="text-[10px] font-bold" style={{ color: STATUS_COLORS[patient.lastStatus] }}>{patient.lastStatus}</Text>
            </View>
          )}
        </View>
        {onChat && (
          <Pressable onPress={() => onChat(patient)}
            className='flex-1 bg-secondary py-2 rounded-full items-center'>
            <Text className='text-xs font-bold text-white'>Chat</Text>
          </Pressable>
        )}
        {(onIssueVc || onRevokeVc) && (
          <View className="flex-row gap-2 mt-3 pt-3 border-t border-outline-variant/10">
            {!patient.hasActiveVc && onIssueVc && (
              <Pressable onPress={() => onIssueVc(patient)} disabled={vcAction === 'issuing'}
                className="flex-1 bg-primary py-2 rounded-full items-center disabled:opacity-50">
                <Text className="text-xs font-bold text-white">{vcAction === 'issuing' ? 'Memproses...' : 'Terbitkan VC'}</Text>
              </Pressable>
            )}
            {patient.hasActiveVc && onRevokeVc && (
              <Pressable onPress={() => onRevokeVc(patient)} disabled={vcAction === 'revoking'}
                className="flex-1 bg-danger/10 border border-danger/30 py-2 rounded-full items-center disabled:opacity-50">
                <Text className="text-xs font-bold text-danger">{vcAction === 'revoking' ? 'Memproses...' : 'Cabut VC'}</Text>
              </Pressable>
            )}
          </View>
        )}
      </Card>
    </Pressable>
  );
});

PatientCard.displayName = 'PatientCard';


