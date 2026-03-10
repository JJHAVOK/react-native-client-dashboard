import { Tabs, useRouter } from 'expo-router';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
// Using Expo's built in vector icons
import { Ionicons } from '@expo/vector-icons'; 

export default function TabLayout() {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: '#18181b' },
          headerTintColor: '#fff',
          tabBarStyle: { backgroundColor: '#18181b', borderTopColor: '#27272a' },
          tabBarActiveTintColor: '#0ea5e9', 
          tabBarInactiveTintColor: '#a1a1aa', 
        }}>
        <Tabs.Screen name="dashboard" options={{ title: 'Dashboard', tabBarLabel: 'Home', tabBarIcon: ({color}) => <Ionicons name="home" size={24} color={color}/> }} />
        <Tabs.Screen name="projects" options={{ title: 'My Projects', tabBarLabel: 'Projects', tabBarIcon: ({color}) => <Ionicons name="briefcase" size={24} color={color}/> }} />
        <Tabs.Screen name="support" options={{ title: 'Helpdesk', tabBarLabel: 'Support', tabBarIcon: ({color}) => <Ionicons name="help-buoy" size={24} color={color}/> }} />
      </Tabs>

      {/* THE GLOBAL FLOATING CHAT WIDGET */}
      <TouchableOpacity 
        style={styles.fab} 
        activeOpacity={0.8}
        onPress={() => router.push('/support/new')}
      >
        <Ionicons name="chatbubble-ellipses" size={32} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 90, // Sits right above the tab bar
    right: 20,
    backgroundColor: '#0ea5e9',
    width: 65,
    height: 65,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  }
});