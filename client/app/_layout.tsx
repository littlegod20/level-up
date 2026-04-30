import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { HabitsProvider } from '@/context/habits-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <HabitsProvider>
          <RootStack />
          <StatusBar style="auto" />
        </HabitsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function RootStack() {
  const { token } = useAuth();

  const showAuth = !token;
  return (
    <Stack>
      <Stack.Screen name="auth" options={{ headerShown: false }} redirect={!showAuth} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} redirect={showAuth} />
      <Stack.Screen name="habit/new" options={{ title: 'New Habit' }} redirect={showAuth} />
      <Stack.Screen name="habit/[id]" options={{ title: 'Habit' }} redirect={showAuth} />
      <Stack.Screen name="habit/edit/[id]" options={{ title: 'Edit Habit' }} redirect={showAuth} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Settings', headerShown: true }} redirect={showAuth} />
    </Stack>
  );
}
