import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../lib/api';

export default function NewSupportTicket() {
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  // Start loading immediately while we check for existing tickets
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState('');

  // 1. Check for existing open tickets!
  useEffect(() => {
    api.get('/customer/portal/tickets')
      .then(res => {
         // Find any ticket that is NOT closed or resolved
         const openTicket = res.data.find((t: any) => t.status !== 'CLOSED' && t.status !== 'RESOLVED');
         
         if (openTicket) {
             // Found one! Redirect them to it immediately!
             router.replace(`/support/${openTicket.id}`);
         } else {
             // No open tickets found. Stop loading and show the form.
             setLoading(false);
         }
      })
      .catch(err => {
         console.log('Error checking tickets:', err);
         // If it fails, just stop loading and let them use the form as a fallback
         setLoading(false);
      });
  }, []);

  const handleSubmit = async () => {
    if (!subject || !message) {
        setError('Please fill out all fields.');
        return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await api.post('/customer/portal/tickets', { 
          subject: `[General Inquiry] ${subject}`, 
          message: message 
      });
      
      const newId = res.data?.id || res.data?.data?.id;
      
      if (newId) {
          router.replace(`/support/${newId}`);
      } else {
          setError('Failed to retrieve new ticket ID.');
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to start chat.');
    } finally {
      setLoading(false);
    }
  };

  // If we are checking the backend for existing tickets, show a spinner
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

      {error ? <Text style={styles.error}>{error}</Text> : null}

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
  error: { color: '#ef4444', textAlign: 'center', marginBottom: 15, backgroundColor: '#450a0a', padding: 10, borderRadius: 8 },
  input: { backgroundColor: '#18181b', color: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#27272a' },
  textArea: { height: 120, textAlignVertical: 'top' },
  button: { backgroundColor: '#0ea5e9', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});