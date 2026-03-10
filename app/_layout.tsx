import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const { user, isInitialized, initAuth } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    initAuth();
  }, []);

  // FIXED ROUTING LOGIC:
  useEffect(() => {
    if (!isInitialized) return;

    // Are they currently on the login screen?
    const onLoginScreen = segments.length === 0 || segments[0] === 'index';

    if (user && onLoginScreen) {
      // If logged in and sitting on the login screen -> Send to Dashboard
      router.replace('/(tabs)/dashboard');
    } else if (!user && !onLoginScreen) {
      // If NOT logged in, but trying to view internal pages -> Kick to Login
      router.replace('/');
    }
    // We removed the "!inTabsGroup" rule so you can safely visit /support/[id] and /project/[id]!
  }, [user, isInitialized, segments]);

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, backgroundColor: '#09090b', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#18181b' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'PF Client Portal' }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="project/[id]" options={{ title: 'Project Overview' }} />
      <Stack.Screen name="support/[id]" options={{ title: 'Live Support Chat' }} />
      <Stack.Screen name="support/new" options={{ title: 'Start New Chat', presentation: 'modal' }} />
    </Stack>
  );
}