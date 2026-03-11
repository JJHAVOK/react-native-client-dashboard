import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import api from '../../lib/api';

export default function SupportScreen() {
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/customer/portal/tickets');
      setTickets(res.data);
    } catch (err) {
      console.log('Error fetching tickets:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchTickets(); }, []));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTickets();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Support Tickets</Text>
        {/* Wired up the new ticket button! */}
        <TouchableOpacity style={styles.newButton} onPress={() => router.push('/support/new')}>
          <Text style={styles.newButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#0ea5e9" size="large" style={{ marginTop: 50 }} />
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0ea5e9" colors={['#0ea5e9']} />}
        >
          {tickets.length === 0 ? (
            <Text style={styles.emptyText}>No support tickets found.</Text>
          ) : (
            tickets.map((t) => (
              <Link href={`/support/${t.id}`} key={t.id} asChild>
                <TouchableOpacity style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.subject} numberOfLines={1}>{t.subject}</Text>
                    <View style={[styles.badge, t.status === 'RESOLVED' ? styles.badgeResolved : null]}>
                      <Text style={styles.badgeText}>{t.status}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.ticketNumber}>Ticket #{t.ticketNumber}</Text>
                  
                  <View style={styles.footer}>
                    <Text style={styles.dateText}>
                      {new Date(t.createdAt).toLocaleDateString()}
                    </Text>
                    <Text style={styles.viewText}>View Chat →</Text>
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
  header: { padding: 20, paddingTop: 10, borderBottomWidth: 1, borderBottomColor: '#27272a', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#ffffff', fontSize: 24, fontWeight: 'bold' },
  newButton: { backgroundColor: '#18181b', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#27272a' },
  newButtonText: { color: '#0ea5e9', fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  emptyText: { color: '#a1a1aa', textAlign: 'center', marginTop: 40, fontSize: 16 },
  card: { backgroundColor: '#18181b', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#27272a' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  subject: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', flex: 1, marginRight: 10 },
  badge: { backgroundColor: '#0ea5e9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeResolved: { backgroundColor: '#22c55e' },
  badgeText: { color: '#ffffff', fontSize: 10, fontWeight: 'bold' },
  ticketNumber: { color: '#71717a', fontSize: 12, marginBottom: 15 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#27272a', paddingTop: 12 },
  dateText: { color: '#a1a1aa', fontSize: 12 },
  viewText: { color: '#0ea5e9', fontSize: 14, fontWeight: '600' },
});