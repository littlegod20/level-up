import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Habit, Completion } from '@/types/habit';

const HABITS_KEY = '@level_up/habits';
const COMPLETIONS_KEY = '@level_up/completions';

function normalizeHabit(raw: Habit): Habit {
  return {
    ...raw,
    customWeekdays: raw.customWeekdays ?? null,
  };
}

export async function getHabits(): Promise<Habit[]> {
  const raw = await AsyncStorage.getItem(HABITS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((h: Habit) => normalizeHabit(h));
  } catch {
    return [];
  }
}

export async function setHabits(habits: Habit[]): Promise<void> {
  await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

export async function getCompletions(): Promise<Completion[]> {
  const raw = await AsyncStorage.getItem(COMPLETIONS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function setCompletions(completions: Completion[]): Promise<void> {
  await AsyncStorage.setItem(COMPLETIONS_KEY, JSON.stringify(completions));
}
