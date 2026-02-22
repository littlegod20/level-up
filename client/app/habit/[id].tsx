import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useHabits } from '@/context/habits-context';
import { computeStreak } from '@/lib/streaks';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { habits, completions, deleteHabit } = useHabits();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const habit = useMemo(() => habits.find((h) => h.id === id), [habits, id]);
  const habitCompletions = useMemo(
    () => completions.filter((c) => c.habitId === id && !c.skipped).sort((a, b) => b.date.localeCompare(a.date)),
    [completions, id]
  );
  const { current, longest } = useMemo(
    () => (habit ? computeStreak(completions, habit.id) : { current: 0, longest: 0 }),
    [completions, habit]
  );

  const handleEdit = () => router.push(`/habit/edit/${id}`);
  const handleDelete = () => {
    Alert.alert(
      'Delete habit',
      'Are you sure? This will remove all completion history for this habit.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          await deleteHabit(id!);
          router.back();
        } },
      ]
    );
  };

  if (!habit) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>Habit not found.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.header, { borderLeftColor: habit.color }]}>
          <View style={[styles.iconWrap, { backgroundColor: habit.color + '30' }]}>
            <IconSymbol name="star.fill" size={40} color={habit.color} />
          </View>
          <ThemedText type="title">{habit.name}</ThemedText>
          <ThemedText style={styles.meta}>
            {habit.frequency} · {habit.xpReward} XP per completion
          </ThemedText>
        </View>
        <ThemedView style={styles.card}>
          <ThemedText type="subtitle">Streaks</ThemedText>
          <ThemedText>Current: {current} days</ThemedText>
          <ThemedText>Longest: {longest} days</ThemedText>
        </ThemedView>
        <ThemedView style={styles.card}>
          <ThemedText type="subtitle">Recent completions</ThemedText>
          {habitCompletions.length === 0 ? (
            <ThemedText style={styles.muted}>None yet.</ThemedText>
          ) : (
            habitCompletions.slice(0, 14).map((c) => (
              <View key={c.id} style={styles.historyRow}>
                <ThemedText>{c.date}</ThemedText>
              </View>
            ))
          )}
        </ThemedView>
        <Pressable style={[styles.button, { backgroundColor: colors.tint }]} onPress={handleEdit}>
          <ThemedText style={styles.buttonText}>Edit habit</ThemedText>
        </Pressable>
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <ThemedText style={styles.deleteText}>Delete habit</ThemedText>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 20, paddingBottom: 40 },
  header: {
    paddingBottom: 20,
    borderLeftWidth: 4,
    paddingLeft: 16,
    marginBottom: 16,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  meta: { marginTop: 4, opacity: 0.8 },
  card: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: 'rgba(128,128,128,0.08)',
  },
  muted: { opacity: 0.8 },
  historyRow: { marginTop: 6 },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  deleteButton: { padding: 16, alignItems: 'center', marginTop: 12 },
  deleteText: { color: '#e74c3c', fontWeight: '600' },
});
