import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../lib/api';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';

export default function NewSupportTicket() {
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    api.get('/customer/portal/tickets')
      .then(res => {
         const openTicket = res.data.find((t: any) => t.status !== 'CLOSED' && t.status !== 'RESOLVED');
         if (openTicket) {
             router.replace(`/support/${openTicket.id}`);
         } else {
             setLoading(false);
         }
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!subject || !message) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Toast.show({ type: 'error', text1: 'Missing Fields', text2: 'Please fill out all fields.' });
        return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    
    try {
      const res = await api.post('/customer/portal/tickets', { 
          subject: `[General Inquiry] ${subject}`, 
          message: message 
      });
      
      const newId = res.data?.id || res.data?.data?.id;
      
      if (newId) {
          router.replace(`/support/${newId}`);
      } else {
          throw new Error('Failed to retrieve ID');
      }
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.response?.data?.message || 'Failed to start chat.' });
      setLoading(false);
    }
  };

  if (loading) {
      return (
          <View style={styles.container}>
              <ActivityIndicator size="large" color="#0ea5e9" />
              <Text style={{color: '#a1a1aa', textAlign: 'center', marginTop: 20}}>Checking active sessions...</Text>
          </View>
      );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How can we help?</Text>
      <Text style={styles.subtitle}>Start a new live chat session.</Text>

      <TextInput 
        style={styles.input} 
        placeholder="Subject" 
        placeholderTextColor="#a1a1aa" 
        value={subject} 
        onChangeText={setSubject} 
      />
      <TextInput 
        style={[styles.input, styles.textArea]} 
        placeholder="How can we help you today?" 
        placeholderTextColor="#a1a1aa" 
        multiline 
        value={message} 
        onChangeText={setMessage} 
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>Start Live Chat</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({ 
  container: { flex: 1, backgroundColor: '#09090b', padding: 20, justifyContent: 'center' }, 
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold', textAlign: 'center' }, 
  subtitle: { color: '#a1a1aa', textAlign: 'center', marginBottom: 30 }, 
  input: { backgroundColor: '#18181b', color: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#27272a' }, 
  textArea: { height: 120, textAlignVertical: 'top' }, 
  button: { backgroundColor: '#0ea5e9', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 }, 
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 } 
});