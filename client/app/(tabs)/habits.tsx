import { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useHabits } from '@/context/habits-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Habit } from '@/types/habit';

export default function HabitsScreen() {
  const { habits, loading } = useHabits();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const activeHabits = habits.filter((h) => !h.archived);

  const handleAdd = useCallback(() => router.push('/habit/new'), []);
  const handleHabit = useCallback((id: string) => router.push(`/habit/${id}`), []);

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>Loading…</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <ThemedText type="title">Habits</ThemedText>
        <ThemedText type="subtitle">Manage your habits</ThemedText>
      </View>
      <FlatList
        data={activeHabits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <ThemedView style={styles.empty}>
            <ThemedText>No habits yet. Tap + to add one.</ThemedText>
          </ThemedView>
        }
        renderItem={({ item }) => (
          <HabitRow habit={item} onPress={() => handleHabit(item.id)} colors={colors} />
        )}
      />
      <Pressable
        style={[styles.fab, { backgroundColor: colors.tint }]}
        onPress={handleAdd}
        accessibilityRole="button"
        accessibilityLabel="Add new habit"
      >
        <IconSymbol name="plus" size={28} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
}

function HabitRow({
  habit,
  onPress,
  colors,
}: {
  habit: Habit;
  onPress: () => void;
  colors: { tint: string };
}) {
  return (
    <Pressable style={styles.card} onPress={onPress} accessibilityRole="button" accessibilityLabel={`Open ${habit.name}`}>
      <View style={[styles.iconWrap, { backgroundColor: habit.color + '30' }]}>
        <IconSymbol name="star.fill" size={24} color={habit.color} />
      </View>
      <View style={styles.cardContent}>
        <ThemedText type="defaultSemiBold">{habit.name}</ThemedText>
        <ThemedText style={styles.meta}>
          {habit.frequency} · {habit.xpReward} XP
        </ThemedText>
      </View>
      <IconSymbol name="chevron.right" size={20} color={colors.tint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  list: { padding: 16, paddingBottom: 80 },
  empty: { padding: 24, alignItems: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(128,128,128,0.08)',
  },
  iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardContent: { flex: 1 },
  meta: { fontSize: 12, marginTop: 2, opacity: 0.8 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
