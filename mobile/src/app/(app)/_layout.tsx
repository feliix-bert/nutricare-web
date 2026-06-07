import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="children/new"
        options={{ title: 'Tambah Anak', headerBackTitle: 'Kembali' }}
      />
      <Stack.Screen
        name="children/[childId]"
        options={{ title: 'Detail Anak', headerBackTitle: 'Kembali' }}
      />
    </Stack>
  );
}
