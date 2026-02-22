import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useMemo, useEffect } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useHabits } from '@/context/habits-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Frequency } from '@/types/habit';

const COLORS = ['#0a7ea4', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c'];

export default function EditHabitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { habits, updateHabit } = useHabits();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const habit = useMemo(() => habits.find((h) => h.id === id), [habits, id]);

  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [xpReward, setXpReward] = useState('10');
  const [reminderTime, setReminderTime] = useState('');

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setFrequency(habit.frequency);
      setSelectedColor(habit.color);
      setXpReward(String(habit.xpReward));
      setReminderTime(habit.reminderTime ?? '');
    }
  }, [habit]);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Name required', 'Please enter a habit name.');
      return;
    }
    const xp = parseInt(xpReward, 10);
    if (isNaN(xp) || xp < 1) {
      Alert.alert('Invalid XP', 'XP reward must be at least 1.');
      return;
    }
    const reminder = reminderTime.trim();
    const parsed = reminder && /\d{1,2}:\d{2}/.test(reminder) ? reminder : null;
    await updateHabit(id!, {
      name: trimmed,
      frequency,
      color: selectedColor,
      xpReward: xp,
      reminderTime: parsed ?? null,
    });
    router.back();
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
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Name</ThemedText>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.icon }]}
            placeholder="Habit name"
            placeholderTextColor={colors.icon}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </ThemedView>
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Frequency</ThemedText>
          <View style={styles.row}>
            <Pressable
              style={[styles.chip, frequency === 'daily' && { backgroundColor: colors.tint }]}
              onPress={() => setFrequency('daily')}
            >
              <ThemedText style={frequency === 'daily' && styles.chipText}>Daily</ThemedText>
            </Pressable>
            <Pressable
              style={[styles.chip, frequency === 'weekly' && { backgroundColor: colors.tint }]}
              onPress={() => setFrequency('weekly')}
            >
              <ThemedText style={frequency === 'weekly' && styles.chipText}>Weekly</ThemedText>
            </Pressable>
          </View>
        </ThemedView>
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Color</ThemedText>
          <View style={styles.row}>
            {COLORS.map((c) => (
              <Pressable
                key={c}
                style={[
                  styles.colorDot,
                  { backgroundColor: c },
                  selectedColor === c && styles.colorDotSelected,
                ]}
                onPress={() => setSelectedColor(c)}
              />
            ))}
          </View>
        </ThemedView>
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Reminder (optional)</ThemedText>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.icon }]}
            placeholder="e.g. 09:00"
            placeholderTextColor={colors.icon}
            value={reminderTime}
            onChangeText={setReminderTime}
          />
        </ThemedView>
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">XP per completion</ThemedText>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.icon }]}
            placeholder="10"
            placeholderTextColor={colors.icon}
            value={xpReward}
            onChangeText={setXpReward}
            keyboardType="number-pad"
          />
        </ThemedView>
        <Pressable style={[styles.button, { backgroundColor: colors.tint }]} onPress={handleSave}>
          <ThemedText style={styles.buttonText}>Save changes</ThemedText>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 20, paddingBottom: 40 },
  section: { marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginTop: 8,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(128,128,128,0.2)',
  },
  chipText: { color: '#fff' },
  colorDot: { width: 36, height: 36, borderRadius: 18 },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
