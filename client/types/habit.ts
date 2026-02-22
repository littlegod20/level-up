export type Frequency = 'daily' | 'weekly';

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  frequency: Frequency;
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
