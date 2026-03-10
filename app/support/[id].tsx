import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { io, Socket } from 'socket.io-client';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore'; // IMPORT THE STORE

export default function MobileSupportChat() {
  const { id } = useLocalSearchParams();
  const { token } = useAuthStore(); // GET THE JWT TOKEN
  
  const [ticket, setTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  // 1. Load Initial Ticket Data
  useEffect(() => {
    api.get(`/customer/portal/tickets`)
      .then(res => {
         const found = res.data.find((t: any) => t.id === id);
         if (found) setTicket(found);
      })
      .catch(err => console.log('Error fetching ticket:', err));

    api.get(`/customer/portal/tickets/${id}`)
      .then(res => {
         if (res.data && res.data.messages) {
            const mapped = res.data.messages.map((m: any) => ({
                id: m.id,
                content: m.content,
                sender: m.staffUserId ? 'STAFF' : 'CUSTOMER',
                createdAt: m.createdAt
            }));
            setMessages(mapped);
         }
      })
      .finally(() => setLoading(false));
  }, [id]);

  // 2. Connect Socket for Live Chat with correctly formatted JWT Injection
  useEffect(() => {
      if (!id || !token) return;
      
      const newSocket = io('https://api.pixelforgedeveloper.com/chat', { 
          transports: ['websocket'], 
          // FIX: The backend splits by space looking for "Bearer token". 
          // We must format it exactly how NestJS expects it!
          auth: { 
              token: `Bearer ${token}` 
          },
      });
      
      newSocket.on('connect', () => {
          console.log('Mobile Socket Connected to Ticket:', id);
          newSocket.emit('join_ticket', id);
      });

      newSocket.on('new_message', (msg) => {
          setMessages(prev => {
              if (prev.some(x => x.id === msg.id)) return prev;
              return [...prev, msg];
          });
      });

      newSocket.on('connect_error', (err) => {
          console.log('Socket Connection Error:', err.message);
      });

      setSocket(newSocket);
      
      return () => { 
          if (newSocket) newSocket.disconnect(); 
      };
  }, [id, token]);

  const handleSend = async () => {
      if (!input.trim()) return; 
      
      const currentInput = input;
      setInput(''); 
      
      const tempMsg = { 
          id: 'temp-' + Date.now(), 
          content: currentInput, 
          sender: 'CUSTOMER', 
          createdAt: new Date().toISOString() 
      };
      setMessages(prev => [...prev, tempMsg]);
      
      try {
          if (socket && socket.connected) {
              console.log("Sending via Socket...");
              socket.emit('send_message', { ticketId: id, content: currentInput });
          } else {
              console.log("Socket disconnected. Falling back to REST...");
              await api.post(`/customer/portal/tickets/${id}/messages`, { 
                  content: currentInput 
              });
          }
      } catch (error: any) {
          console.log('Failed to send message:', error.response?.data || error.message);
      }
  };

  if (loading) return <View style={styles.container}><ActivityIndicator color="#0ea5e9" size="large" style={{ marginTop: 50 }} /></View>;
  if (!ticket) return <View style={styles.container}><Text style={styles.errorText}>Ticket not found.</Text></View>;

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <View>
            <Text style={styles.subjectText} numberOfLines={1}>{ticket.subject}</Text>
            <Text style={styles.ticketNumber}>Ticket #{ticket.ticketNumber}</Text>
        </View>
        <View style={styles.badge}><Text style={styles.badgeText}>{ticket.status}</Text></View>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.chatArea}
        contentContainerStyle={{ padding: 15 }}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((m, i) => {
            const isMe = m.sender === 'CUSTOMER';
            return (
                <View key={i} style={[styles.messageWrapper, isMe ? styles.messageRight : styles.messageLeft]}>
                    <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleStaff]}>
                        <Text style={[styles.senderName, isMe ? styles.senderNameMe : styles.senderNameStaff]}>
                            {isMe ? 'You' : 'Support Team'}
                        </Text>
                        <Text style={styles.messageText}>{m.content}</Text>
                    </View>
                </View>
            );
        })}
      </ScrollView>

      {/* Input Area */}
      {ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#71717a"
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  header: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#27272a', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#18181b' },
  subjectText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', maxWidth: 220 },
  ticketNumber: { color: '#71717a', fontSize: 12, marginTop: 2 },
  badge: { backgroundColor: '#27272a', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#ffffff', fontSize: 10, fontWeight: 'bold' },
  chatArea: { flex: 1 },
  messageWrapper: { marginBottom: 15, flexDirection: 'row' },
  messageRight: { justifyContent: 'flex-end' },
  messageLeft: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 16 },
  bubbleMe: { backgroundColor: '#0ea5e9', borderBottomRightRadius: 4 },
  bubbleStaff: { backgroundColor: '#27272a', borderBottomLeftRadius: 4 },
  senderName: { fontSize: 10, fontWeight: 'bold', marginBottom: 4 },
  senderNameMe: { color: '#e0f2fe' },
  senderNameStaff: { color: '#a1a1aa' },
  messageText: { color: '#ffffff', fontSize: 14, lineHeight: 20 },
  inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#18181b', borderTopWidth: 1, borderTopColor: '#27272a', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#27272a', color: '#ffffff', borderRadius: 20, paddingHorizontal: 15, paddingTop: 12, paddingBottom: 12, maxHeight: 100, fontSize: 14 },
  sendButton: { backgroundColor: '#0ea5e9', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10, marginLeft: 10, justifyContent: 'center' },
  sendButtonText: { color: '#ffffff', fontWeight: 'bold' },
  errorText: { color: '#ef4444', textAlign: 'center', marginTop: 50 },
});