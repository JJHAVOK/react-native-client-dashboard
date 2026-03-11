import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../lib/api';

export default function MobileOrderDetail() {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/customer/portal/orders/${id}`)
      .then(res => setOrder(res.data))
      .catch(err => console.log('Error fetching order:', err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <View style={styles.container}><ActivityIndicator color="#0ea5e9" size="large" style={{ marginTop: 50 }} /></View>;
  if (!order) return <View style={styles.container}><Text style={styles.errorText}>Order not found.</Text></View>;

  return (
    <ScrollView style={styles.container}>
      {/* Header Info */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
            <Text style={styles.orderNumber}>Order #{order.orderNumber || order.id.substring(0,8)}</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>{order.status}</Text></View>
        </View>
        <Text style={styles.dateText}>Placed on {new Date(order.createdAt).toLocaleDateString()}</Text>
      </View>

      {/* Line Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Items</Text>
        {order.items && order.items.length > 0 ? (
            order.items.map((item: any, index: number) => (
                <View key={index} style={styles.itemRow}>
                    <View style={styles.itemLeft}>
                        <Ionicons name="pricetag-outline" size={20} color="#a1a1aa" style={{marginRight: 10}} />
                        <View>
                            <Text style={styles.itemName}>{item.product?.name || 'Unknown Item'}</Text>
                            <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                        </View>
                    </View>
                    <Text style={styles.itemPrice}>${Number(item.price || 0).toFixed(2)}</Text>
                </View>
            ))
        ) : (
            <Text style={styles.emptyText}>No items found in this order.</Text>
        )}
      </View>

      {/* Financial Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Amount</Text>
                <Text style={styles.summaryValue}>${Number(order.totalAmount || 0).toFixed(2)}</Text>
            </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  header: { padding: 20, backgroundColor: '#18181b', borderBottomWidth: 1, borderBottomColor: '#27272a' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderNumber: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
  badge: { backgroundColor: '#0ea5e9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  dateText: { color: '#a1a1aa', fontSize: 14 },
  section: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#27272a' },
  sectionTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, backgroundColor: '#18181b', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#27272a' },
  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  itemName: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  itemQty: { color: '#a1a1aa', fontSize: 12 },
  itemPrice: { color: '#0ea5e9', fontSize: 16, fontWeight: 'bold' },
  summaryBox: { backgroundColor: '#18181b', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#27272a' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { color: '#a1a1aa', fontSize: 16 },
  summaryValue: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  emptyText: { color: '#71717a' },
  errorText: { color: '#ef4444', textAlign: 'center', marginTop: 50 },
});