import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import * as Haptics from 'expo-haptics';

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  
  const [stats, setStats] = useState({ activeProjects: 0, openTickets: 0, recentOrders: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [projectsRes, ticketsRes, ordersRes] = await Promise.all([
        api.get('/customer/portal/projects'),
        api.get('/customer/portal/tickets'),
        api.get('/customer/portal/orders')
      ]);

      setStats({
        activeProjects: projectsRes.data.filter((p: any) => p.status === 'ACTIVE').length,
        openTickets: ticketsRes.data.filter((t: any) => t.status !== 'CLOSED' && t.status !== 'RESOLVED').length,
        recentOrders: ordersRes.data.length
      });
    } catch (error) {
      console.log('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = useCallback(() => {
    // UPGRADED TO MEDIUM SO YOU CAN FEEL IT
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRefreshing(true);
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} // <-- FIX: This turns the background black again!
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh} 
          tintColor="#0ea5e9" 
          colors={['#0ea5e9']} 
          title="Refreshing..."
          titleColor="#0ea5e9"
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.name}>{user?.firstName || 'Client'}!</Text>
      </View>

      <Text style={styles.sectionTitle}>Overview</Text>
      
      <View style={styles.grid}>
        <TouchableOpacity style={styles.card} onPress={() => router.push('/projects')}>
          <Ionicons name="briefcase-outline" size={32} color="#8b5cf6" style={styles.icon} />
          <Text style={styles.cardNumber}>{stats.activeProjects}</Text>
          <Text style={styles.cardLabel}>Active Projects</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => router.push('/support')}>
          <Ionicons name="ticket-outline" size={32} color="#f59e0b" style={styles.icon} />
          <Text style={styles.cardNumber}>{stats.openTickets}</Text>
          <Text style={styles.cardLabel}>Open Tickets</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => router.push('/orders')}>
          <Ionicons name="cube-outline" size={32} color="#10b981" style={styles.icon} />
          <Text style={styles.cardNumber}>{stats.recentOrders}</Text>
          <Text style={styles.cardLabel}>Total Orders</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/support/new')}>
          <Ionicons name="chatbubbles-outline" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Start Live Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#27272a' }]} onPress={() => router.push('/settings')}>
          <Ionicons name="settings-outline" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Account Settings</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  scrollContent: { padding: 20 },
  header: { marginBottom: 30, marginTop: 10 },
  greeting: { color: '#a1a1aa', fontSize: 16, marginBottom: 4 },
  name: { color: '#ffffff', fontSize: 28, fontWeight: 'bold' },
  sectionTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 15 },
  card: { backgroundColor: '#18181b', borderRadius: 16, padding: 20, width: '47%', borderWidth: 1, borderColor: '#27272a', alignItems: 'center' },
  icon: { marginBottom: 15 },
  cardNumber: { color: '#ffffff', fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  cardLabel: { color: '#a1a1aa', fontSize: 12, textAlign: 'center' },
  actionSection: { marginTop: 30 },
  actionButton: { backgroundColor: '#0ea5e9', flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 12 },
  actionButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginLeft: 12 },
});