import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#18181b',
        },
        headerTintColor: '#fff',
        tabBarStyle: {
          backgroundColor: '#18181b',
          borderTopColor: '#27272a',
        },
        tabBarActiveTintColor: '#0ea5e9', // Our primary blue
        tabBarInactiveTintColor: '#a1a1aa', // Gray
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Home',
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'My Projects',
          tabBarLabel: 'Projects',
        }}
      />
    </Tabs>
  );
}