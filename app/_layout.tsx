import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#18181b', // Changed this so it stands out from the black background!
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {/* We define our screens here. index is the default home screen */}
      <Stack.Screen name="index" options={{ title: 'PF Client Portal' }} />
    </Stack>
  );
}