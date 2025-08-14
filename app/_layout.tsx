import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useImageStore } from '@/stores/imageStore';
import { useAuthStore } from '@/stores/authStore';

export default function RootLayout() {
  useFrameworkReady();
  const { loadImages } = useImageStore();
  const { loadAuth } = useAuthStore();

  useEffect(() => {
    // Load persisted data on app start
    loadImages();
    loadAuth();
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}