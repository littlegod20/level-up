import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAuth } from '@/context/auth-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function SettingsModal() {
  const { email, signOut } = useAuth();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Settings</ThemedText>
      <View style={styles.section}>
        <ThemedText type="subtitle">Level Up</ThemedText>
        <ThemedText style={styles.muted}>Connected to backend API.</ThemedText>
        <ThemedText style={styles.muted}>Signed in as {email ?? 'unknown user'}</ThemedText>
      </View>
      <Pressable onPress={signOut} style={styles.signOutBtn}>
        <ThemedText type="link">Sign out</ThemedText>
      </Pressable>
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
  signOutBtn: { marginTop: 16 },
  link: { marginTop: 24 },
});
