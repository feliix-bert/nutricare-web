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
      <Stack.Screen
        name="scanner/scan"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="scanner/manual"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="scanner/analysis"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="children/[childId]/assessment/body-size"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="children/[childId]/assessment/review"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="children/[childId]/assessment/results"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
