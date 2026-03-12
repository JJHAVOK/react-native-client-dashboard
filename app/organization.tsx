import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../lib/api';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';

// SKELETON LOADER COMPONENT
const SkeletonOrg = () => (
  <View style={styles.container}>
    <View style={{ height: 100, backgroundColor: '#18181b', borderRadius: 12, margin: 20, opacity: 0.5 }} />
    <View style={{ height: 200, backgroundColor: '#18181b', borderRadius: 12, marginHorizontal: 20, opacity: 0.5 }} />
  </View>
);

export default function OrganizationScreen() {
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  const fetchOrg = () => {
    api.get('/customer/portal/organization')
      .then(res => setOrg(res.data))
      .catch(() => setOrg(null))
      .finally(() => { 
        setLoading(false); 
        setRefreshing(false); 
      });
  };

  useEffect(() => { 
    fetchOrg(); 
  }, []);

  const onRefresh = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    fetchOrg();
  }, []);

  const handleCreate = async () => {
    if (!orgName.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await api.post('/customer/portal/organization', { name: orgName });
      Toast.show({ type: 'success', text1: 'Success', text2: 'Organization created!' });
      fetchOrg();
    } catch(err: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: err.response?.data?.message || 'Failed to create organization.' });
    }
  };

  const handleInvite = () => {
      if (!inviteEmail.trim()) return;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({ type: 'success', text1: 'Invite Sent', text2: `An invitation has been sent to ${inviteEmail}.` });
      setInviteEmail('');
  };

  if (loading) return <SkeletonOrg />;

  if (!org) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="business-outline" size={64} color="#0ea5e9" style={{ marginBottom: 20 }} />
          <Text style={styles.emptyTitle}>No Organization Found</Text>
          <Text style={styles.emptySubtitle}>Become the team lead and invite others to collaborate.</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Organization Name" 
            placeholderTextColor="#71717a" 
            value={orgName} 
            onChangeText={setOrgName} 
          />
          <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
            <Text style={styles.createButtonText}>Create Organization</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={{ padding: 20 }}
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
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
            <Text style={styles.orgName}>{org.name}</Text>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>ACTIVE</Text>
            </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Team Members</Text>
      <View style={styles.listCard}>
        {org.contacts?.map((c: any, index: number) => (
          <View key={c.id} style={[styles.memberRow, index === org.contacts.length - 1 && { borderBottomWidth: 0 }]}>
            <View>
              <Text style={styles.memberName}>{c.firstName} {c.lastName}</Text>
              <Text style={styles.memberEmail}>{c.email}</Text>
            </View>
            <View style={styles.memberBadge}>
              <Text style={styles.memberBadgeText}>Member</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Invite Colleague</Text>
      <View style={styles.inviteCard}>
        <TextInput 
          style={styles.input} 
          placeholder="Colleague's Email Address" 
          placeholderTextColor="#71717a" 
          keyboardType="email-address" 
          autoCapitalize="none" 
          value={inviteEmail} 
          onChangeText={setInviteEmail} 
        />
        <TouchableOpacity style={styles.inviteButton} onPress={handleInvite}>
          <Text style={styles.inviteButtonText}>Send Invite</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, marginTop: -50 },
  emptyTitle: { color: '#ffffff', fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  emptySubtitle: { color: '#a1a1aa', textAlign: 'center', marginBottom: 30, fontSize: 16, lineHeight: 24 },
  input: { backgroundColor: '#18181b', color: '#ffffff', width: '100%', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#27272a', marginBottom: 15, fontSize: 16 },
  createButton: { backgroundColor: '#0ea5e9', width: '100%', padding: 15, borderRadius: 10, alignItems: 'center' },
  createButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  headerCard: { backgroundColor: '#18181b', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#27272a', marginBottom: 25 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orgName: { color: '#ffffff', fontSize: 22, fontWeight: 'bold' },
  activeBadge: { backgroundColor: 'rgba(34, 197, 94, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.3)' },
  activeBadgeText: { color: '#22c55e', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
  sectionTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 10, marginLeft: 5 },
  listCard: { backgroundColor: '#18181b', borderRadius: 12, borderWidth: 1, borderColor: '#27272a', marginBottom: 25 },
  memberRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#27272a' },
  memberName: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  memberEmail: { color: '#a1a1aa', fontSize: 14 },
  memberBadge: { backgroundColor: '#27272a', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  memberBadgeText: { color: '#a1a1aa', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  inviteCard: { backgroundColor: '#18181b', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#27272a' },
  inviteButton: { backgroundColor: '#8b5cf6', padding: 15, borderRadius: 10, alignItems: 'center' },
  inviteButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 }
});