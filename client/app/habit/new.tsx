import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useHabits } from '@/context/habits-context';
import { XP_PER_COMPLETION } from '@/constants/xp';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Frequency } from '@/types/habit';

const COLORS = ['#0a7ea4', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c'];

export default function NewHabitScreen() {
  const { addHabit } = useHabits();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [reminderTime, setReminderTime] = useState(''); // e.g. "09:00"

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Name required', 'Please enter a habit name.');
      return;
    }
    const reminder = reminderTime.trim();
    const parsed = reminder ? (reminder.match(/^\d{1,2}:\d{2}$/) ? reminder : null) : null;
    await addHabit({
      name: trimmed,
      icon: 'star.fill',
      color: selectedColor,
      frequency,
      reminderTime: parsed,
      xpReward: XP_PER_COMPLETION,
      archived: false,
    });
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Name</ThemedText>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.icon }]}
            placeholder="e.g. Morning run"
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
              style={[
                styles.chip,
                frequency === 'daily' && { backgroundColor: colors.tint },
              ]}
              onPress={() => setFrequency('daily')}
            >
              <ThemedText style={frequency === 'daily' ? styles.chipText : undefined}>Daily</ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.chip,
                frequency === 'weekly' && { backgroundColor: colors.tint },
              ]}
              onPress={() => setFrequency('weekly')}
            >
              <ThemedText style={frequency === 'weekly' ? styles.chipText : undefined}>Weekly</ThemedText>
            </Pressable>
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
        <Pressable style={[styles.button, { backgroundColor: colors.tint }]} onPress={handleSave}>
          <ThemedText style={styles.buttonText}>Save habit</ThemedText>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  chipText: { color: '#fff' as const },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
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
