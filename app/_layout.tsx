import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        {/* 🛠️ CORRECCIÓN: Quitamos los paréntesis para que coincidan con tus carpetas reales */}
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="tabs" options={{ headerShown: false }} />
        <Stack.Screen name="clinicas" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}