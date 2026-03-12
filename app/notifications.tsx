import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../lib/api';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';

// SKELETON
const SkeletonNotifs = () => (
  <View style={styles.container}>
    {[1, 2, 3, 4].map(i => (
      <View 
        key={i} 
        style={{ height: 80, backgroundColor: '#18181b', marginHorizontal: 20, marginTop: 15, borderRadius: 8, opacity: 0.5 }} 
      />
    ))}
  </View>
);

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifs = () => {
    api.get('/notifications')
      .then(res => setNotifications(res.data))
      .catch(() => {})
      .finally(() => { 
        setLoading(false); 
        setRefreshing(false); 
      });
  };

  useEffect(() => { 
    fetchNotifs(); 
  }, []);

  const onRefresh = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, readAt: new Date() } : n));
    } catch(e) {}
  };

  const handleMarkAllRead = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Toast.show({ type: 'success', text1: 'Cleared', text2: 'All notifications marked as read.' });
    try {
      const unread = notifications.filter(n => !n.readAt);
      for (const n of unread) {
        await api.patch(`/notifications/${n.id}/read`);
      }
      setNotifications(prev => prev.map(n => ({ ...n, readAt: new Date() })));
    } catch(e) {}
  };

  const unreadCount = notifications.filter(n => !n.readAt).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <SkeletonNotifs />
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={48} color="#27272a" />
          <Text style={styles.emptyText}>No notifications yet.</Text>
        </View>
      ) : (
        <ScrollView 
          style={{ flex: 1 }} 
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              tintColor="#0ea5e9" 
              colors={['#0ea5e9']} 
            />
          }
        >
          {notifications.map(n => (
            <TouchableOpacity 
              key={n.id} 
              style={[styles.notifCard, !n.readAt && styles.unreadCard]} 
              onPress={() => !n.readAt && handleMarkRead(n.id)}
            >
              <View style={styles.notifContent}>
                <Text style={styles.notifTitle}>{n.title}</Text>
                <Text style={styles.notifMessage}>{n.message}</Text>
                <Text style={styles.notifTime}>
                  {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Text>
              </View>
              {!n.readAt && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#27272a' },
  headerTitle: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
  markAllText: { color: '#0ea5e9', fontSize: 14, fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#71717a', marginTop: 10, fontSize: 16 },
  notifCard: { flexDirection: 'row', padding: 20, borderBottomWidth: 1, borderBottomColor: '#27272a', alignItems: 'center' },
  unreadCard: { backgroundColor: 'rgba(14, 165, 233, 0.05)' },
  notifContent: { flex: 1, paddingRight: 10 },
  notifTitle: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  notifMessage: { color: '#a1a1aa', fontSize: 14, lineHeight: 20, marginBottom: 8 },
  notifTime: { color: '#71717a', fontSize: 12 },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#0ea5e9' }
});