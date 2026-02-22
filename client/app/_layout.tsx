import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { HabitsProvider } from '@/context/habits-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <HabitsProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="habit/new" options={{ title: 'New Habit' }} />
          <Stack.Screen name="habit/[id]" options={{ title: 'Habit' }} />
          <Stack.Screen name="habit/edit/[id]" options={{ title: 'Edit Habit' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Settings', headerShown: true }} />
        </Stack>
        <StatusBar style="auto" />
      </HabitsProvider>
    </ThemeProvider>
  );
}
