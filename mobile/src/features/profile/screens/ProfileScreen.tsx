import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';

const ROLE_LABELS: Record<string, string> = {
  PARENT: 'Orang Tua',
  MEDIC: 'Tenaga Medis',
  POSYANDU: 'Petugas Posyandu',
  ADMIN: 'Administrator',
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row justify-between items-center py-0.5">
    <Text className="text-sm text-gray-500 dark:text-gray-400">{label}</Text>
    <Text className="text-sm font-semibold text-gray-900 dark:text-gray-100">{value}</Text>
  </View>
);

export const ProfileScreen = () => {
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();

  const initials =
    user?.name
      ?.split(' ')
      .map((w: string) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() ?? '?';

  const handleLogout = () => {
    Alert.alert('Keluar', 'Kamu yakin ingin keluar dari aplikasi?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ padding: 24 }} className="gap-4" showsVerticalScrollIndicator={false}>
        {/* Page Title */}
        <Text className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-2">Profil</Text>

        {/* User Card */}
        <AppCard pressable={false}>
          <View className="flex-row items-center gap-4">
            <View className="w-16 h-16 rounded-full items-center justify-center bg-primary-light dark:bg-primary-dark/20 flex-shrink-0">
              <Text className="text-2xl font-extrabold text-primary dark:text-primary-light">{initials}</Text>
            </View>
            <View className="flex-1 gap-1">
              <Text className="text-lg font-bold text-gray-900 dark:text-gray-100" numberOfLines={1}>
                {user?.name ?? '-'}
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
                {user?.email ?? '-'}
              </Text>
              <View className="px-2.5 py-1 rounded-full bg-primary-light dark:bg-primary-dark/20 self-start mt-0.5">
                <Text className="text-[11px] font-bold text-primary dark:text-primary-light">
                  {ROLE_LABELS[user?.role ?? ''] ?? user?.role ?? '-'}
                </Text>
              </View>
            </View>
          </View>
        </AppCard>

        {/* Info Section (placeholder for future settings) */}
        <AppCard pressable={false} className="gap-3">
          <Text className="text-base font-bold text-gray-900 dark:text-gray-100">Informasi Akun</Text>
          <View className="h-[1px] bg-gray-100 dark:bg-gray-800 my-1" />
          <InfoRow label="Email" value={user?.email ?? '-'} />
          <InfoRow label="Role" value={ROLE_LABELS[user?.role ?? ''] ?? '-'} />
        </AppCard>

        {/* Logout */}
        <AppButton
          onPress={handleLogout}
          variant="outline"
          className="mt-4 border-danger dark:border-danger/80"
          textClassName="text-danger dark:text-danger/90"
        >
          Keluar dari Aplikasi
        </AppButton>
      </ScrollView>
    </SafeAreaView>
  );
};
