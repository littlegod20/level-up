import { useMemo } from 'react';
import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useHabits } from '@/context/habits-context';
import { xpProgressInLevel } from '@/constants/xp';
import { computeStreak } from '@/lib/streaks';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function StatsScreen() {
  const { habits, completions, loading } = useHabits();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const totalXP = useMemo(
    () => completions.filter((c) => !c.skipped).reduce((s, c) => s + c.xpAwarded, 0),
    [completions]
  );
  const { level, current, required } = xpProgressInLevel(totalXP);
  const totalCompletions = useMemo(
    () => completions.filter((c) => !c.skipped).length,
    [completions]
  );
  const activeHabits = habits.filter((h) => !h.archived);

  const last7Days = useMemo(() => {
    const days: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const date = d.toISOString().slice(0, 10);
      const count = completions.filter((c) => c.date === date && !c.skipped).length;
      days.push({ date, count });
    }
    return days;
  }, [completions]);

  const maxCount = Math.max(1, ...last7Days.map((d) => d.count));

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>Loading…</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <ThemedText type="title">Stats</ThemedText>
          <Link href="/modal" asChild>
            <Pressable>
              <ThemedText type="link">Settings</ThemedText>
            </Pressable>
          </Link>
        </View>
        <ThemedView style={[styles.card, styles.levelCard]}>
          <ThemedText type="subtitle">Level {level}</ThemedText>
          <ThemedText style={styles.xpBig}>{totalXP} total XP</ThemedText>
          <View style={styles.xpBar}>
            <View
              style={[
                styles.xpFill,
                { backgroundColor: colors.tint, width: `${(current / required) * 100}%` },
              ]}
            />
          </View>
          <ThemedText style={styles.xpLabel}>
            {current} / {required} XP to level {level + 1}
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.card}>
          <ThemedText type="subtitle">Last 7 days</ThemedText>
          <View style={styles.chartRow}>
            {last7Days.map((d) => (
              <View key={d.date} style={styles.chartCol}>
                <View style={styles.barWrap}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${(d.count / maxCount) * 100}%`,
                        backgroundColor: colors.tint,
                      },
                    ]}
                  />
                </View>
                <ThemedText style={styles.barLabel}>
                  {new Date(d.date).toLocaleDateString(undefined, { weekday: 'narrow' })}
                </ThemedText>
                <ThemedText style={styles.barCount}>{d.count}</ThemedText>
              </View>
            ))}
          </View>
        </ThemedView>
        <ThemedView style={styles.card}>
          <ThemedText type="subtitle">Activity</ThemedText>
          <ThemedText>Total completions: {totalCompletions}</ThemedText>
          <ThemedText style={styles.muted}>Habits tracked: {activeHabits.length}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.card}>
          <ThemedText type="subtitle">Streaks</ThemedText>
          {activeHabits.length === 0 ? (
            <ThemedText style={styles.muted}>Add habits to see streaks.</ThemedText>
          ) : (
            activeHabits.slice(0, 5).map((h) => {
              const { current: cur, longest } = computeStreak(completions, h.id);
              return (
                <View key={h.id} style={styles.streakRow}>
                  <ThemedText type="defaultSemiBold">{h.name}</ThemedText>
                  <ThemedText>
                    🔥 {cur} day streak · Best: {longest}
                  </ThemedText>
                </View>
              );
            })
          )}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  card: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: 'rgba(128,128,128,0.08)',
  },
  levelCard: { borderLeftWidth: 4, borderLeftColor: '#0a7ea4' },
  xpBig: { fontSize: 24, fontWeight: 'bold', marginVertical: 8 },
  xpBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(128,128,128,0.2)',
    overflow: 'hidden',
  },
  xpFill: { height: '100%', borderRadius: 4 },
  xpLabel: { fontSize: 12, marginTop: 4, opacity: 0.8 },
  muted: { opacity: 0.8, marginTop: 4 },
  streakRow: { marginTop: 8 },
  chartRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  chartCol: { alignItems: 'center', flex: 1 },
  barWrap: { height: 60, width: 24, justifyContent: 'flex-end', marginBottom: 4 },
  bar: { width: '100%', minHeight: 4, borderRadius: 4 },
  barLabel: { fontSize: 10, opacity: 0.8 },
  barCount: { fontSize: 12, fontWeight: '600' },
});
