export type Frequency = 'daily' | 'weekly' | 'custom';

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  frequency: Frequency;
  /** When `frequency` is `custom`: JS weekday indices 0=Sun … 6=Sat. Otherwise null/omit. */
  customWeekdays: number[] | null;
  reminderTime: string | null;
  xpReward: number;
  archived: boolean;
  createdAt: string;
}

export interface Completion {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completedAt: string; // ISO
  skipped: boolean;
  note: string | null;
  xpAwarded: number;
}

export interface StreakInfo {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
}
