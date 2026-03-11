import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { View, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../lib/api';
import { StatusBar } from 'expo-status-bar';

// Custom Bell Component to fetch unread count
function NotificationBell() {
  const router = useRouter();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    // Poll every 15 seconds, just like the web widget!
    const fetchNotifs = () => {
      api.get('/notifications').then(res => {
        setUnread(res.data.filter((n: any) => !n.readAt).length);
      }).catch(() => {});
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <TouchableOpacity onPress={() => router.push('/notifications')} style={{ marginRight: 15, position: 'relative' }}>
      <Ionicons name="notifications-outline" size={24} color="#ffffff" />
      {unread > 0 && (
        <View style={{ position: 'absolute', right: -4, top: -4, backgroundColor: '#ef4444', borderRadius: 10, width: 16, height: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#18181b' }}>
          <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>{unread > 9 ? '9+' : unread}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function RootLayout() {
  const { user, isInitialized, initAuth } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    initAuth();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    const onLoginScreen = segments.length === 0 || segments[0] === 'index';

    if (user && onLoginScreen) {
      router.replace('/(tabs)/dashboard');
    } else if (!user && !onLoginScreen) {
      router.replace('/');
    }
  }, [user, isInitialized, segments]);

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, backgroundColor: '#09090b', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <StatusBar style="light" />
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#18181b' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: 'bold' },
        // INJECTING THE BELL GLOBALLY
        headerRight: () => (user ? <NotificationBell /> : null),
      }}
    >
      <Stack.Screen name="index" options={{ title: 'PF Client Portal', headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="project/[id]" options={{ title: 'Project Overview' }} />
      <Stack.Screen name="support/[id]" options={{ title: 'Live Support Chat' }} />
      <Stack.Screen name="order/[id]" options={{ title: 'Order Details' }} />
      <Stack.Screen name="support/new" options={{ title: 'Start New Chat', presentation: 'modal' }} />
      <Stack.Screen name="notifications" options={{ title: 'Alerts', presentation: 'modal' }} />
      <Stack.Screen name="organization" options={{ title: 'Organization' }} />
    </Stack>
  );
}