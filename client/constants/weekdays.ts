/** JavaScript `Date.getDay()`: 0 = Sunday … 6 = Saturday */
export const WEEKDAY_ORDER: number[] = [1, 2, 3, 4, 5, 6, 0];

const LABEL: Record<number, string> = {
  0: 'SUN',
  1: 'MON',
  2: 'TUE',
  3: 'WED',
  4: 'THU',
  5: 'FRI',
  6: 'SAT',
};

export function weekdayLabel(d: number): string {
  return LABEL[d] ?? '?';
}

export function sortWeekdayIndices(days: number[]): number[] {
  return [...new Set(days)].sort(
    (a, b) => WEEKDAY_ORDER.indexOf(a) - WEEKDAY_ORDER.indexOf(b)
  );
}
