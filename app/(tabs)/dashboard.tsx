import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';
import api from '../../lib/api'; 

export default function DashboardScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ projectsCount: 0, ticketsCount: 0, ordersCount: 0 });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Using the exact endpoints from your Next.js web storefront!
      const projectsRes = await api.get('/customer/portal/projects'); 
      const ticketsRes = await api.get('/customer/portal/tickets');
      const ordersRes = await api.get('/customer/portal/orders');

      setStats({
        projectsCount: projectsRes.data?.length || 0,
        ticketsCount: ticketsRes.data?.length || 0,
        ordersCount: ordersRes.data?.length || 0,
      });

    } catch (error: any) {
      console.log('API Error Fetching Dashboard Data:', error?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/'); 
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.nameText}>{user?.firstName || 'Client'}!</Text>
      </View>

      <View style={styles.statsContainer}>
        {/* Projects Box */}
        <View style={styles.statBox}>
          {loading ? <ActivityIndicator color="#0ea5e9" /> : <Text style={styles.statNumber}>{stats.projectsCount}</Text>}
          <Text style={styles.statLabel}>Active Projects</Text>
        </View>
        
        {/* Tickets Box */}
        <View style={styles.statBox}>
          {loading ? <ActivityIndicator color="#0ea5e9" /> : <Text style={styles.statNumber}>{stats.ticketsCount}</Text>}
          <Text style={styles.statLabel}>Support Tickets</Text>
        </View>
      </View>

      <View style={[styles.statsContainer, { paddingTop: 0 }]}>
         {/* Orders Box */}
         <View style={[styles.statBox, { width: '100%' }]}>
          {loading ? <ActivityIndicator color="#22c55e" /> : <Text style={[styles.statNumber, { color: '#22c55e' }]}>{stats.ordersCount}</Text>}
          <Text style={styles.statLabel}>Recent Orders</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  header: { padding: 20, marginTop: 10 },
  welcomeText: { color: '#a1a1aa', fontSize: 16 },
  nameText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  statsContainer: { flexDirection: 'row', padding: 20, justifyContent: 'space-between' },
  statBox: { backgroundColor: '#18181b', padding: 20, borderRadius: 12, width: '48%', borderWidth: 1, borderColor: '#27272a', alignItems: 'center' },
  statNumber: { color: '#0ea5e9', fontSize: 32, fontWeight: 'bold' },
  statLabel: { color: '#a1a1aa', marginTop: 5, fontSize: 14 },
  logoutButton: { margin: 20, backgroundColor: '#ef4444', padding: 15, borderRadius: 8, alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: 'bold' },
});