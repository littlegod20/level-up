import { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useHabits } from '@/context/habits-context';
import { XP_PER_COMPLETION } from '@/constants/xp';
import { Colors } from '@/constants/theme';
import { sortWeekdayIndices } from '@/constants/weekdays';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Frequency } from '@/types/habit';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CustomWeekdaysPicker } from '@/components/custom-weekdays-picker';

const COLORS = ['#0a7ea4', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c'];

function parseTimeToDate(s: string | null): Date {
  const d = new Date();
  if (s && /^\d{1,2}:\d{2}$/.test(s)) {
    const [h, m] = s.split(':').map(Number);
    d.setHours(h, m, 0, 0);
  } else {
    d.setHours(9, 0, 0, 0);
  }
  return d;
}

function toStorageTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function formatReminderDisplay(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h)) return hhmm;
  return new Date(2000, 0, 1, h, m).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function NewHabitScreen() {
  const { addHabit } = useHabits();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [customWeekdays, setCustomWeekdays] = useState<number[]>([]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [reminderTimes, setReminderTimes] = useState<string[]>([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [draftTime, setDraftTime] = useState(() => parseTimeToDate(null));

  const openReminderPicker = () => {
    setDraftTime(parseTimeToDate(reminderTimes[0] ?? null));
    setShowTimePicker(true);
  };

  const onTimeChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
      if (event.type === 'set' && date) setReminderTimes(prev => [...prev, toStorageTime(date)]);
    } else if (date) {
      setDraftTime(date);
    }
  };

  const confirmIosReminder = () => {
    setReminderTimes((prev) => {
      if (prev.includes(toStorageTime(draftTime))) {
        return prev;
      }
      return [...prev, toStorageTime(draftTime)];
    });
  };

  const doneIosReminder = () => {
    setShowTimePicker(false);
  };

  const clearReminder = (time: string) => {
    setReminderTimes((prev) => prev.filter((t) => t !== time));
    setShowTimePicker(false);
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Name required', 'Please enter a habit name.');
      return;
    }
    if (frequency === 'custom' && customWeekdays.length === 0) {
      Alert.alert('Choose days', 'Add at least one day for a custom schedule.');
      return;
    }
    const parsed =
      reminderTimes.length > 0 && reminderTimes.every(t => /^\d{1,2}:\d{2}$/.test(t)) ? reminderTimes.join(',') : null;
    await addHabit({
      name: trimmed,
      icon: 'star.fill',
      color: selectedColor,
      frequency,
      customWeekdays: frequency === 'custom' ? sortWeekdayIndices(customWeekdays) : null,
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
                frequency === 'daily' && { backgroundColor: colors.primary },
              ]}
              onPress={() => setFrequency('daily')}
            >
              <ThemedText style={frequency === 'daily' ? styles.chipText : undefined}>Daily</ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.chip,
                frequency === 'weekly' && { backgroundColor: colors.primary },
              ]}
              onPress={() => setFrequency('weekly')}
            >
              <ThemedText style={frequency === 'weekly' ? styles.chipText : undefined}>Weekly</ThemedText>
            </Pressable>

            <Pressable
              style={[
                styles.chip,
                frequency === 'custom' && { backgroundColor: colors.primary },
              ]}
              onPress={() => setFrequency('custom')}
            >
              <ThemedText style={frequency === 'custom' ? styles.chipText : undefined}>Custom</ThemedText>
            </Pressable>
          </View>
        </ThemedView>

        {frequency === 'custom' && (
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Choose days</ThemedText>
            <CustomWeekdaysPicker
              value={customWeekdays}
              onChange={setCustomWeekdays}
              accentColor={colors.primary}
              borderColor={colors.icon}
              textColor={colors.text}
              mutedColor={colors.icon}
            />
          </ThemedView>
        )}

        <ThemedView style={styles.section}>
          <View style={styles.rowBetween}>
            <ThemedText type="subtitle">Reminders (optional)</ThemedText>
            <Pressable
              style={[styles.reminderButton, { backgroundColor: colors.primary }]}
              onPress={openReminderPicker}
              accessibilityRole="button"
              accessibilityLabel="Add reminder time"
            >
              <IconSymbol name="plus" size={20} color="#fff" />
            </Pressable>
          </View>
         
          {showTimePicker ? (
            <View style={styles.pickerBlock}>
              <RNDateTimePicker
                value={draftTime}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onTimeChange}
              />
              {Platform.OS === 'ios' ? (
                <View style={styles.iosPickerActions}>
                  <Pressable onPress={() => setShowTimePicker(false)} style={styles.iosPickerBtn}>
                    <ThemedText type="link">Cancel</ThemedText>
                  </Pressable>
                  <Pressable onPress={confirmIosReminder} style={styles.iosPickerBtn}>
                    <ThemedText type="link">Add</ThemedText>
                  </Pressable>
                  <Pressable onPress={doneIosReminder} style={styles.iosPickerBtn}>
                    <ThemedText type="link">Done</ThemedText>
                  </Pressable>
                </View>
              ) : null}
            </View>
          ) : null}

           {reminderTimes.length > 0 ? (
            <View style={styles.reminderBadgeRow}>
              {reminderTimes.map((time, index) => (
                <View
                  key={`${time}-${index}`}
                  style={[styles.reminderBadge, { borderColor: colors.primary, backgroundColor: colors.primary + '22' }]}
                >
                  <ThemedText style={{ color: colors.text }}>{formatReminderDisplay(time)}</ThemedText>
                  <Pressable
                    onPress={() => clearReminder(time)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Remove reminder"
                  >
                    <ThemedText style={[styles.reminderBadgeClear, { color: colors.icon }]}>×</ThemedText>
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}
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
        <Pressable style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleSave}>
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
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
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
  reminderButton: {
    padding: 6,
    borderRadius: 10,
  },
  reminderBadgeRow: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  reminderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  reminderBadgeClear: { fontSize: 20, lineHeight: 22 },
  pickerBlock: { marginTop: 8 },
  iosPickerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
    marginTop: 8,
  },
  iosPickerBtn: { paddingVertical: 8, paddingHorizontal: 4 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
