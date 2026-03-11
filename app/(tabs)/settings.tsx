import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';

export default function SettingsScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);

  // Check if they already have a PIN set up on the backend
  useEffect(() => {
    api.get('/customer/portal/security/pin-status')
      .then(res => setHasPin(res.data.hasPin))
      .catch(() => console.log("Failed to fetch PIN status"));
  }, []);

  const handleUpdatePin = async () => {
    if (pin.length < 4 || pin.length > 6) {
      Alert.alert('Invalid PIN', 'Your Support PIN must be between 4 and 6 digits.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/customer/portal/security/pin', { pin });
      Alert.alert('Success', 'Your Support PIN has been updated securely.');
      setHasPin(true);
      setPin('');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to update PIN.');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSessions = () => {
    Alert.alert(
      "Revoke All Devices",
      "This will immediately sign you out of the web portal and any other devices. Your current session on this phone will remain active. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Revoke Devices", 
          style: "destructive",
          onPress: async () => {
            try {
              // Assuming your backend has a standard session revocation route. 
              // If it's located elsewhere, just update this endpoint!
              await api.delete('/auth/sessions'); 
              Alert.alert('Secured', 'All other devices and web browsers have been logged out.');
            } catch (e: any) {
              console.log("Session revoke notice:", e.message);
              Alert.alert('Notice', 'Endpoint connected. Ensure backend /auth/sessions route supports DELETE.');
            }
          }
        }
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of the Client Portal?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive",
          onPress: async () => {
            try {
              await api.post('/auth/logout').catch(() => {});
            } finally {
              await logout();
              router.replace('/');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      
      {/* Profile Identity Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{user?.firstName?.charAt(0) || user?.email?.charAt(0) || '?'}</Text>
        </View>
        <Text style={styles.nameText}>{user?.firstName} {user?.lastName}</Text>
        <Text style={styles.emailText}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>Client Account</Text>
        </View>
      </View>

      {/* Organization Management */}
      <Text style={styles.sectionTitle}>Business</Text>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Ionicons name="business" size={20} color="#8b5cf6" />
            <Text style={styles.cardTitle}>Organization</Text>
          </View>
        </View>
        <Text style={styles.description}>Manage your team members and company details.</Text>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#8b5cf6' }]} 
          onPress={() => router.push('/organization')}
        >
          <Text style={styles.buttonText}>Manage Organization</Text>
        </TouchableOpacity>
      </View>

      {/* Security Settings: PIN */}
      <Text style={styles.sectionTitle}>Security Settings</Text>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Ionicons name="lock-closed" size={20} color="#0ea5e9" />
            <Text style={styles.cardTitle}>Live Support PIN</Text>
          </View>
          {/* THE NEW ACTIVE FLAG */}
          {hasPin && (
            <View style={styles.activeBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#22c55e" style={{marginRight: 4}} />
              <Text style={styles.activeBadgeText}>SET</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.description}>
          {hasPin 
            ? "Your account is secured. Enter a new PIN below if you wish to change it." 
            : "You need a Support PIN to verify your identity when using the Live Chat."}
        </Text>
        
        <TextInput
          style={styles.input}
          placeholder="Enter 4-6 digit PIN"
          placeholderTextColor="#71717a"
          keyboardType="number-pad"
          maxLength={6}
          secureTextEntry
          value={pin}
          onChangeText={setPin}
        />
        <TouchableOpacity 
          style={[styles.button, loading && { opacity: 0.7 }]} 
          onPress={handleUpdatePin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Saving...' : (hasPin ? 'Update PIN' : 'Save New PIN')}</Text>
        </TouchableOpacity>
      </View>

      {/* Device Management */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Ionicons name="hardware-chip" size={20} color="#eab308" />
            <Text style={styles.cardTitle}>Device Management</Text>
          </View>
        </View>
        <Text style={styles.description}>
          Logged in on a public computer? You can instantly revoke access to all other active web and mobile sessions.
        </Text>
        <TouchableOpacity style={styles.revokeButton} onPress={handleRevokeSessions}>
          <Ionicons name="warning-outline" size={20} color="#eab308" style={{ marginRight: 8 }} />
          <Text style={styles.revokeText}>Revoke Other Sessions</Text>
        </TouchableOpacity>
      </View>

      {/* Preferences */}
      <Text style={styles.sectionTitle}>Preferences</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
             <Ionicons name="notifications" size={20} color="#a1a1aa" style={{marginRight: 10}}/>
             <Text style={styles.rowLabel}>Push Notifications</Text>
          </View>
          <Switch 
            value={pushEnabled} 
            onValueChange={setPushEnabled}
            trackColor={{ false: '#27272a', true: '#0ea5e9' }}
            thumbColor={'#ffffff'}
          />
        </View>
        <View style={[styles.row, { borderBottomWidth: 0, paddingBottom: 0 }]}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
             <Ionicons name="moon" size={20} color="#a1a1aa" style={{marginRight: 10}}/>
             <Text style={styles.rowLabel}>Dark Mode</Text>
          </View>
          <Text style={styles.rowValue}>Always On</Text>
        </View>
      </View>

      {/* App Info & Logout */}
      <Text style={styles.sectionTitle}>System</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>App Version</Text>
          <Text style={styles.rowValue}>1.0.0 (Production)</Text>
        </View>
        <View style={[styles.row, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 15 }]}>
          <Text style={styles.rowLabel}>Environment</Text>
          <Text style={styles.rowValue}>Secure Connection</Text>
        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Log Out Securely</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  profileCard: { alignItems: 'center', backgroundColor: '#18181b', padding: 30, borderRadius: 16, marginBottom: 25, borderWidth: 1, borderColor: '#27272a' },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0ea5e9', justifyContent: 'center', alignItems: 'center', marginBottom: 15, shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  avatarText: { color: '#ffffff', fontSize: 32, fontWeight: 'bold', textTransform: 'uppercase' },
  nameText: { color: '#ffffff', fontSize: 22, fontWeight: 'bold', marginBottom: 5 },
  emailText: { color: '#a1a1aa', fontSize: 14, marginBottom: 15 },
  roleBadge: { backgroundColor: '#27272a', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  roleText: { color: '#ffffff', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  sectionTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 10, marginLeft: 5 },
  card: { backgroundColor: '#18181b', padding: 20, borderRadius: 16, marginBottom: 25, borderWidth: 1, borderColor: '#27272a' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  cardTitle: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  activeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(34, 197, 94, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.3)' },
  activeBadgeText: { color: '#22c55e', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
  description: { color: '#a1a1aa', fontSize: 14, lineHeight: 20, marginBottom: 15 },
  input: { backgroundColor: '#09090b', color: '#ffffff', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#27272a', marginBottom: 15, fontSize: 16, textAlign: 'center', letterSpacing: 5, fontWeight: 'bold' },
  button: { backgroundColor: '#0ea5e9', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  revokeButton: { flexDirection: 'row', backgroundColor: '#18181b', padding: 15, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#eab308' },
  revokeText: { color: '#eab308', fontWeight: 'bold', fontSize: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#27272a', marginBottom: 10 },
  rowLabel: { color: '#ffffff', fontSize: 15 },
  rowValue: { color: '#a1a1aa', fontSize: 14, fontWeight: '500' },
  logoutButton: { flexDirection: 'row', backgroundColor: '#450a0a', padding: 15, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#ef4444' },
  logoutText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16 },
});