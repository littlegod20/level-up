import type { Completion } from '@/types/habit';

/** Get completions for a habit sorted by date descending */
function getCompletionsForHabit(completions: Completion[], habitId: string): Completion[] {
  return completions
    .filter((c) => c.habitId === habitId && !c.skipped)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Compute current and longest streak for a habit (consecutive days) */
export function computeStreak(completions: Completion[], habitId: string): { current: number; longest: number } {
  const list = getCompletionsForHabit(completions, habitId);
  if (list.length === 0) return { current: 0, longest: 0 };

  const dates = [...new Set(list.map((c) => c.date))].sort((a, b) => b.localeCompare(a));

  let current = 0;
  const today = new Date().toISOString().slice(0, 10);
  let check = today;
  for (const d of dates) {
    if (d === check) {
      current++;
      const next = new Date(check);
      next.setDate(next.getDate() - 1);
      check = next.toISOString().slice(0, 10);
    } else break;
  }

  let longest = 0;
  let run = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    prev.setDate(prev.getDate() - 1);
    const expected = prev.toISOString().slice(0, 10);
    if (dates[i] === expected) run++;
    else {
      longest = Math.max(longest, run);
      run = 1;
    }
  }
  longest = Math.max(longest, run, current);

  return { current, longest };
}
