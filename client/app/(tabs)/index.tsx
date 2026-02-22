import { useCallback, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useHabits } from '@/context/habits-context';
import { computeStreak } from '@/lib/streaks';
import { xpProgressInLevel } from '@/constants/xp';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

const TODAY = new Date().toISOString().slice(0, 10);

function isHabitDueToday(habit: { frequency: string }): boolean {
  return habit.frequency === 'daily';
}

export default function TodayScreen() {
  const { habits, completions, loading, completeHabit, uncompleteHabit } = useHabits();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const activeHabits = useMemo(
    () => habits.filter((h) => !h.archived && isHabitDueToday(h)),
    [habits]
  );

  const completedToday = useMemo(
    () => completions.filter((c) => c.date === TODAY && !c.skipped).length,
    [completions]
  );

  const totalXP = useMemo(
    () => completions.filter((c) => !c.skipped).reduce((s, c) => s + c.xpAwarded, 0),
    [completions]
  );
  const { level, current, required } = xpProgressInLevel(totalXP);

  const isCompleted = useCallback(
    (habitId: string) => completions.some((c) => c.habitId === habitId && c.date === TODAY),
    [completions]
  );

  const handleToggle = useCallback(
    async (habitId: string) => {
      if (isCompleted(habitId)) {
        await uncompleteHabit(habitId, TODAY);
      } else {
        await completeHabit(habitId, TODAY);
      }
    },
    [completeHabit, uncompleteHabit, isCompleted]
  );

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
        <ThemedText type="title">Today</ThemedText>
        <ThemedText type="subtitle">
          Level {level} · {completedToday}/{activeHabits.length} done
        </ThemedText>
        <View style={styles.xpBar}>
          <View
            style={[
              styles.xpFill,
              { backgroundColor: colors.tint, width: `${(current / required) * 100}%` },
            ]}
          />
        </View>
        <ThemedText style={styles.xpLabel}>
          {current} / {required} XP to next level
        </ThemedText>
      </View>
      <FlatList
        data={activeHabits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <ThemedView style={styles.empty}>
            <ThemedText type="subtitle">Welcome to Level Up</ThemedText>
            <ThemedText style={styles.emptySub}>Get started by adding your first habit. Complete habits to earn XP and build streaks.</ThemedText>
            <Pressable style={[styles.addFirst, { backgroundColor: colors.tint }]} onPress={() => router.push('/habit/new')}>
              <ThemedText style={styles.buttonText}>Add your first habit</ThemedText>
            </Pressable>
          </ThemedView>
        }
        renderItem={({ item }) => {
          const done = isCompleted(item.id);
          const { current: streak } = computeStreak(completions, item.id);
          return (
            <Pressable
              style={[styles.card, { borderLeftColor: item.color }]}
              onPress={() => handleToggle(item.id)}
              accessibilityRole="button"
              accessibilityLabel={`${item.name}. ${done ? 'Completed' : 'Mark complete'}`}
            >
              <View style={styles.cardLeft}>
                <View style={[styles.iconWrap, { backgroundColor: item.color + '30' }]}>
                  <IconSymbol name="star.fill" size={24} color={item.color} />
                </View>
                <View>
                  <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                  {streak > 0 && (
                    <ThemedText style={styles.streak}>🔥 {streak} day streak</ThemedText>
                  )}
                </View>
              </View>
              <View style={[styles.checkbox, done && { backgroundColor: colors.tint }]}>
                {done ? (
                  <IconSymbol name="checkmark" size={22} color="#fff" />
                ) : (
                  <View style={styles.checkboxEmpty} />
                )}
              </View>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  xpBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(128,128,128,0.2)',
    marginTop: 8,
    overflow: 'hidden',
  },
  xpFill: { height: '100%', borderRadius: 4 },
  xpLabel: { fontSize: 12, marginTop: 4, opacity: 0.8 },
  list: { padding: 16, paddingBottom: 32 },
  empty: { padding: 24, alignItems: 'center' },
  emptySub: { textAlign: 'center', marginTop: 8, marginBottom: 16 },
  addFirst: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
  buttonText: { color: '#fff', fontWeight: '600' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    backgroundColor: 'rgba(128,128,128,0.08)',
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  streak: { fontSize: 12, marginTop: 2, opacity: 0.8 },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxEmpty: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(128,128,128,0.5)',
  },
});
