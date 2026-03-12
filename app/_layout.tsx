import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { View, ActivityIndicator, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';

export default function RootLayout() {
  const { user, isInitialized, initAuth } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(true);

  // Monitor Offline Status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(!!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

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
    <>
      <StatusBar style="light" />
      
      {/* OFFLINE BANNER */}
      {!isConnected && (
        <View style={{ backgroundColor: '#ef4444', paddingTop: 50, paddingBottom: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
          <Ionicons name="cloud-offline" size={16} color="#fff" style={{ marginRight: 8 }} />
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>No Internet Connection</Text>
        </View>
      )}

      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#18181b' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'PF Client Portal', headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="project/[id]" options={{ title: 'Project Overview' }} />
        <Stack.Screen name="support/[id]" options={{ title: 'Live Support Chat' }} />
        <Stack.Screen name="order/[id]" options={{ title: 'Order Details' }} />
        <Stack.Screen name="organization" options={{ title: 'Organization' }} />
        
        {/* Upgraded to presentation: 'formSheet' for Native Swipeable Bottom Sheets on iOS! */}
        <Stack.Screen name="support/new" options={{ title: 'Start New Chat', presentation: 'formSheet' }} />
        <Stack.Screen name="notifications" options={{ title: 'Alerts', presentation: 'formSheet' }} />
      </Stack>
      
      {/* GLOBAL TOAST MOUNT */}
      <Toast />
    </>
  );
}