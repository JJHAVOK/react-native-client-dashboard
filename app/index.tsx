import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  
  const [step, setStep] = useState<'LOGIN' | 'MFA'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaToken, setMfaToken] = useState('');
  const [loading, setLoading] = useState(false);

  // Matches your web handleLogin exactly
  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    if (step === 'MFA' && !mfaToken) {
      Alert.alert('Error', 'Please enter your Security PIN');
      return;
    }

    setLoading(true);
    try {
      // Build the payload just like the web app
      const payload: any = { email, password };
      if (step === 'MFA') {
        payload.code = mfaToken; 
      }

      // Hit the same endpoint using our new configured API client
      const res = await api.post('/customer/auth/login', payload);

      // Success! Pass the user. We will handle mobile cookies later!
      await login(res.data.user, res.data.token);
      
      // Send them to the new Dashboard tab! (We removed the alert so it feels like a real native app)
      router.replace('/(tabs)/dashboard');

    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed.';
      
      // Check for exact MFA Challenge string
      if (msg === 'MFA_REQUIRED' || err.response?.status === 403) {
          setStep('MFA');
      } else {
          Alert.alert('Login Failed', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{step === 'LOGIN' ? 'Customer Login' : 'Security PIN'}</Text>
      <Text style={styles.subtitle}>
        {step === 'LOGIN' ? 'Sign in to your Client Portal' : 'Enter the security code sent to your app'}
      </Text>

      <View style={styles.form}>
        {step === 'LOGIN' ? (
          <>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="name@example.com"
              placeholderTextColor="#a1a1aa"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#a1a1aa"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </>
        ) : (
          <>
            <Text style={styles.label}>Security PIN</Text>
            <TextInput
              style={[styles.input, { textAlign: 'center', letterSpacing: 5, fontSize: 24 }]}
              placeholder="000000"
              placeholderTextColor="#a1a1aa"
              keyboardType="number-pad"
              maxLength={6}
              value={mfaToken}
              onChangeText={setMfaToken}
            />
          </>
        )}

        <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{step === 'MFA' ? 'Verify & Login' : 'Login'}</Text>
          )}
        </TouchableOpacity>

        {step === 'MFA' && (
          <TouchableOpacity style={{ marginTop: 20, alignItems: 'center' }} onPress={() => setStep('LOGIN')}>
            <Text style={{ color: '#a1a1aa' }}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b', padding: 20, justifyContent: 'center' },
  title: { color: '#ffffff', fontSize: 32, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { color: '#a1a1aa', fontSize: 16, marginBottom: 40 },
  form: { width: '100%' },
  label: { color: '#ffffff', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: '#18181b', borderWidth: 1, borderColor: '#27272a', borderRadius: 8, color: '#ffffff', padding: 15, fontSize: 16, marginBottom: 20 },
  button: { backgroundColor: '#0ea5e9', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
});