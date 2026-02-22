export const XP_PER_COMPLETION = 10;

/** XP needed for level 1, 2, 3... (cumulative or per-level; we use per-level threshold) */
export function xpToLevel(totalXP: number): number {
  let level = 1;
  let required = 100;
  let remaining = totalXP;
  while (remaining >= required) {
    remaining -= required;
    level += 1;
    required = Math.floor(100 + (level - 1) * 50); // 100, 150, 200, ...
  }
  return level;
}

export function xpProgressInLevel(totalXP: number): { level: number; current: number; required: number } {
  let level = 1;
  let required = 100;
  let remaining = totalXP;
  while (remaining >= required) {
    remaining -= required;
    level += 1;
    required = Math.floor(100 + (level - 1) * 50);
  }
  return { level, current: remaining, required };
}
