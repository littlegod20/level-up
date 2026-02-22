import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Completion, Habit } from '@/types/habit';
import { getCompletions, getHabits, setCompletions, setHabits } from '@/lib/storage';
import { XP_PER_COMPLETION } from '@/constants/xp';
import { cancelHabitReminder, scheduleHabitReminder } from '@/lib/notifications';

type HabitsContextValue = {
  habits: Habit[];
  completions: Completion[];
  loading: boolean;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  archiveHabit: (id: string) => Promise<void>;
  completeHabit: (habitId: string, date: string, skipped?: boolean, note?: string | null) => Promise<void>;
  uncompleteHabit: (habitId: string, date: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const HabitsContext = createContext<HabitsContextValue | null>(null);

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function todayString(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabitsState] = useState<Habit[]>([]);
  const [completions, setCompletionsState] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [h, c] = await Promise.all([getHabits(), getCompletions()]);
    setHabitsState(h);
    setCompletionsState(c);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await refresh();
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
  }, [refresh]);

  const addHabit = useCallback(async (habit: Omit<Habit, 'id' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...habit,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const next = [...habits, newHabit];
    setHabitsState(next);
    await setHabits(next);
    if (newHabit.reminderTime) {
      const [h, m] = newHabit.reminderTime.split(':').map(Number);
      if (!isNaN(h) && !isNaN(m)) await scheduleHabitReminder(newHabit.id, newHabit.name, h, m);
    }
  }, [habits]);

  const updateHabit = useCallback(async (id: string, updates: Partial<Habit>) => {
    const prev = habits.find((h) => h.id === id);
    const next = habits.map((h) => (h.id === id ? { ...h, ...updates } : h));
    setHabitsState(next);
    await setHabits(next);
    if (updates.reminderTime !== undefined) {
      if (updates.reminderTime) {
        const [h, m] = updates.reminderTime.split(':').map(Number);
        if (!isNaN(h) && !isNaN(m))
          await scheduleHabitReminder(id, updates.name ?? prev?.name ?? 'Habit', h, m);
      } else await cancelHabitReminder(id);
    }
  }, [habits]);

  const deleteHabit = useCallback(async (id: string) => {
    await cancelHabitReminder(id);
    const nextHabits = habits.filter((h) => h.id !== id);
    const nextCompletions = completions.filter((c) => c.habitId !== id);
    setHabitsState(nextHabits);
    setCompletionsState(nextCompletions);
    await setHabits(nextHabits);
    await setCompletions(nextCompletions);
  }, [habits, completions]);

  const archiveHabit = useCallback(async (id: string) => {
    await updateHabit(id, { archived: true });
  }, [updateHabit]);

  const completeHabit = useCallback(async (
    habitId: string,
    date: string,
    skipped = false,
    note: string | null = null
  ) => {
    const existing = completions.find((c) => c.habitId === habitId && c.date === date);
    if (existing) return;

    const habit = habits.find((h) => h.id === habitId);
    const xpAwarded = skipped ? 0 : (habit?.xpReward ?? XP_PER_COMPLETION);

    const newCompletion: Completion = {
      id: generateId(),
      habitId,
      date,
      completedAt: new Date().toISOString(),
      skipped,
      note,
      xpAwarded,
    };
    const next = [...completions, newCompletion];
    setCompletionsState(next);
    await setCompletions(next);
  }, [habits, completions]);

  const uncompleteHabit = useCallback(async (habitId: string, date: string) => {
    const next = completions.filter((c) => !(c.habitId === habitId && c.date === date));
    setCompletionsState(next);
    await setCompletions(next);
  }, [completions]);

  const value = useMemo<HabitsContextValue>(
    () => ({
      habits,
      completions,
      loading,
      addHabit,
      updateHabit,
      deleteHabit,
      archiveHabit,
      completeHabit,
      uncompleteHabit,
      refresh,
    }),
    [
      habits,
      completions,
      loading,
      addHabit,
      updateHabit,
      deleteHabit,
      archiveHabit,
      completeHabit,
      uncompleteHabit,
      refresh,
    ]
  );

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
}

export function useHabits(): HabitsContextValue {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error('useHabits must be used within HabitsProvider');
  return ctx;
}
