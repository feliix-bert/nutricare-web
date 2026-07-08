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
        name="children/[childId]/edit"
        options={{ title: 'Edit Anak', headerBackTitle: 'Kembali' }}
      />
      <Stack.Screen
        name="children/[childId]/assessment/review"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="children/[childId]/assessment/feeding-history"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="children/[childId]/assessment/illness-history"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="children/[childId]/assessment/results"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="report"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="blockchain/verify/[assessmentId]"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="chat/[parentId]"
        options={{ title: 'Konsultasi' }}
      />
      <Stack.Screen
        name="chat/my-doctor"
        options={{ title: 'Konsultasi Dokter' }}
      />
      <Stack.Screen
        name="medic/dashboard"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="vc/scan"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="vc/verify-result"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="vc/[vcId]"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="donate/index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="donate/form"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}


