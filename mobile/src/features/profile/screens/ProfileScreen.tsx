import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';

const ROLE_LABELS: Record<string, string> = {
  PARENT: 'Orang Tua',
  MEDIC: 'Tenaga Medis',
  POSYANDU: 'Petugas Posyandu',
  ADMIN: 'Administrator',
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row justify-between items-center py-2">
    <Text className="text-sm text-gray-500">{label}</Text>
    <Text className="text-sm font-semibold text-gray-900">{value}</Text>
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
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 24 }} className="gap-5" showsVerticalScrollIndicator={false}>
        {/* Page Title */}
        <Text className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">Profil</Text>

        {/* User Card */}
        <View className="flex-row items-center gap-5 py-5 px-5 bg-white rounded-2xl">
          <View className="w-16 h-16 rounded-full items-center justify-center bg-primary-light flex-shrink-0">
            <Text className="text-2xl font-extrabold text-primary">{initials}</Text>
          </View>
          <View className="flex-1 gap-1.5">
            <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
              {user?.name ?? '-'}
            </Text>
            <Text className="text-xs text-gray-500" numberOfLines={1}>
              {user?.email ?? '-'}
            </Text>
            <View className="px-3 py-1 rounded-full bg-primary-light self-start">
              <Text className="text-[11px] font-bold text-primary">
                {ROLE_LABELS[user?.role ?? ''] ?? user?.role ?? '-'}
              </Text>
            </View>
          </View>
        </View>

        {/* Info Section */}
        <View className="py-5 px-5 bg-white rounded-2xl gap-2">
          <Text className="text-base font-bold text-gray-900">Informasi Akun</Text>
          <View className="h-[1px] bg-gray-100 my-1" />
          <InfoRow label="Email" value={user?.email ?? '-'} />
          <InfoRow label="Role" value={ROLE_LABELS[user?.role ?? ''] ?? '-'} />
        </View>

        {/* Logout */}
        <Button
          onPress={handleLogout}
          variant="outline"
          className="mt-2 border-danger"
          textClassName="text-danger"
        >
          Keluar dari Aplikasi
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};
