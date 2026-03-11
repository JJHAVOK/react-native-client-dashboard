import { useState, useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';

// THE BELL LIVES HERE NOW!
function NotificationBell() {
  const router = useRouter();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
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
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const router = useRouter();
  const { user } = useAuthStore();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: '#18181b' },
          headerTintColor: '#fff',
          tabBarStyle: { backgroundColor: '#18181b', borderTopColor: '#27272a' },
          tabBarActiveTintColor: '#0ea5e9', 
          tabBarInactiveTintColor: '#a1a1aa',
          // INJECTING THE BELL ON THE VISIBLE HEADERS!
          headerRight: () => (user ? <NotificationBell /> : null),
        }}>
        <Tabs.Screen name="dashboard" options={{ title: 'Dashboard', tabBarLabel: 'Home', tabBarIcon: ({color}) => <Ionicons name="home" size={24} color={color}/> }} />
        <Tabs.Screen name="projects" options={{ title: 'My Projects', tabBarLabel: 'Projects', tabBarIcon: ({color}) => <Ionicons name="briefcase" size={24} color={color}/> }} />
        <Tabs.Screen name="orders" options={{ title: 'Order History', tabBarLabel: 'Orders', tabBarIcon: ({color}) => <Ionicons name="receipt" size={24} color={color}/> }} />
        <Tabs.Screen name="support" options={{ title: 'Helpdesk', tabBarLabel: 'Support', tabBarIcon: ({color}) => <Ionicons name="help-buoy" size={24} color={color}/> }} />
        <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarLabel: 'Profile', tabBarIcon: ({color}) => <Ionicons name="person" size={24} color={color}/> }} />
      </Tabs>

      <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={() => router.push('/support/new')}>
        <Ionicons name="chatbubble-ellipses" size={32} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  fab: { position: 'absolute', bottom: 90, right: 20, backgroundColor: '#0ea5e9', width: 65, height: 65, borderRadius: 35, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8 },
  badge: { position: 'absolute', right: -4, top: -4, backgroundColor: '#ef4444', borderRadius: 10, width: 16, height: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#18181b' },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' }
});