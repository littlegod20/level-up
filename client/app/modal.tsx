import { Link, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function SettingsModal() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Settings</ThemedText>
      <View style={styles.section}>
        <ThemedText type="subtitle">Level Up</ThemedText>
        <ThemedText style={styles.muted}>Habit tracking with XP and streaks. V1 – local only.</ThemedText>
      </View>
      <Link href="/" asChild>
        <ThemedText type="link" style={styles.link}>Back to Today</ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  section: { marginTop: 16 },
  muted: { opacity: 0.8, marginTop: 4 },
  link: { marginTop: 24 },
});
