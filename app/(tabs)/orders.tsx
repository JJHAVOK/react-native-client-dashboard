import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../lib/api';
import * as Haptics from 'expo-haptics';

export default function OrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/customer/portal/orders');
      setOrders(res.data);
    } catch (err) {
      console.log('Error fetching orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchOrders(); }, []));

  const onRefresh = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRefreshing(true);
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
      case 'DELIVERED': return '#22c55e';
      case 'PENDING': return '#eab308';
      case 'CANCELLED': return '#ef4444';
      default: return '#0ea5e9';
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator color="#0ea5e9" size="large" style={{ marginTop: 50 }} />
      ) : (
        <ScrollView 
          style={{ flex: 1 }} // <-- FIX: Makes the whole screen pullable!
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0ea5e9" colors={['#0ea5e9']} title="Refreshing..." titleColor="#0ea5e9" />}
        >
          {orders.length === 0 ? (
            <Text style={styles.emptyText}>No order history found.</Text>
          ) : (
            orders.map((o) => (
              <Link href={`/order/${o.id}`} key={o.id} asChild>
                <TouchableOpacity style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.titleRow}>
                        <Ionicons name="cube-outline" size={20} color="#0ea5e9" style={{marginRight: 8}}/>
                        <Text style={styles.orderNumber}>Order #{o.orderNumber || o.id.substring(0,8)}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: getStatusColor(o.status) }]}>
                      <Text style={styles.badgeText}>{o.status}</Text>
                    </View>
                  </View>
                  <View style={styles.footer}>
                    <Text style={styles.dateText}>{new Date(o.createdAt).toLocaleDateString()}</Text>
                    <Text style={styles.priceText}>${Number(o.totalAmount || 0).toFixed(2)}</Text>
                  </View>
                </TouchableOpacity>
              </Link>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  scrollContent: { padding: 20 },
  emptyText: { color: '#a1a1aa', textAlign: 'center', marginTop: 40, fontSize: 16 },
  card: { backgroundColor: '#18181b', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#27272a' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  orderNumber: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#ffffff', fontSize: 10, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#27272a', paddingTop: 12 },
  dateText: { color: '#a1a1aa', fontSize: 14 },
  priceText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
});