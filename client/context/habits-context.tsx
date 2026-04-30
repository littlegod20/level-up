import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Completion, Habit } from '@/types/habit';
import { cancelHabitReminder, scheduleHabitReminder } from '@/lib/notifications';
import {
  apiCreateCompletion,
  apiCreateHabit,
  apiDeleteCompletion,
  apiDeleteHabit,
  apiGetCompletions,
  apiGetHabits,
  apiGetMe,
  apiUpdateHabit,
} from '@/lib/api';
import { useAuth } from '@/context/auth-context';

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

function firstReminder(value: string | null): string | null {
  if (!value) return null;
  const first = value.split(',')[0]?.trim() ?? '';
  return /^\d{1,2}:\d{2}$/.test(first) ? first : null;
}

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabitsState] = useState<Habit[]>([]);
  const [completions, setCompletionsState] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, status } = useAuth();

  const refresh = useCallback(async () => {
    if (!token) {
      setHabitsState([]);
      setCompletionsState([]);
      return;
    }

    await apiGetMe(token);
    const h = await apiGetHabits(token);
    setHabitsState(h);

    const completionBuckets = await Promise.all(
      h.map(async (habit) => apiGetCompletions(token, habit.id))
    );
    setCompletionsState(completionBuckets.flat());
  }, [token]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (status === 'loading') return;
      setLoading(true);
      try {
        await refresh();
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [refresh, status]);

  const addHabit = useCallback(async (habit: Omit<Habit, 'id' | 'createdAt'>) => {
    if (!token) return;
    const reminderTime = firstReminder(habit.reminderTime);
    const created = await apiCreateHabit(token, {
      ...habit,
      reminderTime,
    });
    setHabitsState((prev) => [...prev, created]);
    if (created.reminderTime) {
      const [h, m] = created.reminderTime.split(':').map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        await scheduleHabitReminder(created.id, created.name, h, m);
      }
    }
  }, [token]);

  const updateHabit = useCallback(async (id: string, updates: Partial<Habit>) => {
    if (!token) return;
    const prev = habits.find((h) => h.id === id);
    const payload: Partial<Habit> = { ...updates };
    if (payload.reminderTime !== undefined) {
      payload.reminderTime = firstReminder(payload.reminderTime ?? null);
    }
    const updated = await apiUpdateHabit(token, id, payload);
    setHabitsState((prevState) => prevState.map((h) => (h.id === id ? updated : h)));

    if (payload.reminderTime !== undefined) {
      if (updated.reminderTime) {
        const [h, m] = updated.reminderTime.split(':').map(Number);
        if (!isNaN(h) && !isNaN(m))
          await scheduleHabitReminder(id, updated.name ?? prev?.name ?? 'Habit', h, m);
      } else await cancelHabitReminder(id);
    }
  }, [habits, token]);

  const deleteHabit = useCallback(async (id: string) => {
    if (!token) return;
    await apiDeleteHabit(token, id);
    await cancelHabitReminder(id);
    setHabitsState((prev) => prev.filter((h) => h.id !== id));
    setCompletionsState((prev) => prev.filter((c) => c.habitId !== id));
  }, [token]);

  const archiveHabit = useCallback(async (id: string) => {
    await updateHabit(id, { archived: true });
  }, [updateHabit]);

  const completeHabit = useCallback(async (
    habitId: string,
    date: string,
    skipped = false,
    note: string | null = null
  ) => {
    if (!token) return;
    const existing = completions.find((c) => c.habitId === habitId && c.date === date);
    if (existing) return;
    const created = await apiCreateCompletion(token, habitId, { date, skipped, note });
    setCompletionsState((prev) => [...prev, created]);
  }, [completions, token]);

  const uncompleteHabit = useCallback(async (habitId: string, date: string) => {
    if (!token) return;
    await apiDeleteCompletion(token, habitId, date);
    setCompletionsState((prev) => prev.filter((c) => !(c.habitId === habitId && c.date === date)));
  }, [token]);

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
