# Level Up — Functional & Technical Specification

**Version:** 1.0 (V1 — local-only client)  
**Last updated:** 2026-04-03

---

## Part A — Functional specification

### A.1 Purpose and scope

**Purpose:** Mobile habit tracking with gamification (XP, levels, streaks) and optional local reminders.

**V1 scope:** Single user, **device-local** storage only — no accounts, no server, no cloud sync.

**Out of scope (V1):** Backend, authentication, multi-device sync, social features, leaderboards.

### A.2 Definitions

| Term | Meaning |
|------|--------|
| **Habit** | A recurring behavior: name, appearance, frequency, XP reward, optional reminder, lifecycle (active/archived). |
| **Completion** | Record for a habit on a calendar day: completed/skipped, optional note, XP awarded. |
| **Streak** | Consecutive days with qualifying completions per habit (see business rules). |
| **Level** | Derived from total XP using the app’s XP curve. |

### A.3 User roles

| Role | Description |
|------|-------------|
| **User** | Single end user on one device; no login. |

### A.4 Functional requirements

#### Habit management

| ID | Requirement |
|----|-------------|
| HM-1 | Create habit: name, frequency, color, icon (as supported by UI), XP reward default. |
| HM-2 | Optional reminder time; schedule **local** daily notification subject to OS permission. |
| HM-3 | View habit detail: metadata, streaks, recent history. |
| HM-4 | Edit habit; reminder changes update/cancel scheduled notifications. |
| HM-5 | Archive habit (hidden from primary lists). |
| HM-6 | Delete habit with confirmation; removes associated completions. |
| HM-7 | *Optional V1:* UI to list archived habits, unarchive or delete. |
| HM-8 | *Optional V1:* Reorder habits in list. |

#### Today

| ID | Requirement |
|----|-------------|
| TD-1 | Show habits **due today** per frequency rules (daily + weekly per defined rule). |
| TD-2 | Mark complete for today; record completion and award XP. |
| TD-3 | Undo today’s completion. |
| TD-4 | *Optional V1:* Skip with 0 XP. |
| TD-5 | *Optional V1:* Optional note on completion. |
| TD-6 | Show daily progress (e.g. done / due) and level / XP within level. |
| TD-7 | Show streak where UI specifies. |

#### Habits list & Stats

| ID | Requirement |
|----|-------------|
| HL-1 | List non-archived habits with summary; empty state; navigation to add/detail. |
| ST-1 | Stats: total XP, level, progress to next level. |
| ST-2 | Aggregate metrics (completions, habit count). |
| ST-3 | Recent activity (e.g. last 7 days). |
| ST-4 | Per-habit streak summary. |
| ST-5 | Access to Settings. |

#### Settings & notifications

| SG-1 | Settings describe app and local-only V1. |
| SG-2 | Navigation back to main app. |
| SG-3 | *Optional V1:* Theme, export JSON, notification permission copy. |
| NT-1 | Notification permission denial must not crash app. |
| NT-2 | At most one daily local reminder per habit when configured. |
| NT-3 | Edit/clear reminder or delete habit updates/cancels scheduling. |

#### Persistence

| PR-1 | Data survives app restart (local persistence). |
| PR-2 | Core features work offline. |

### A.5 Business rules

- **XP:** Non-skipped completions award XP per habit; skipped award 0.
- **Level:** From total XP via defined curve (`constants/xp.ts`).
- **Streaks:** Must match implementation in `lib/streaks.ts` (consecutive calendar days with non-skipped completions).

### A.6 Open product decisions

1. Weekly habit “due” rule (weekday vs any day in week).
2. Skip/note in V1 or later.
3. Archive UX completeness.
4. Reorder and icon picker in V1 or later.

---

## Part B — Technical specification

### B.1 Repository layout

| Path | Role |
|------|------|
| `client/` | Expo (React Native) application — primary V1 codebase. |
| `server/` | Placeholder for future backend (no API in V1). |
| Root `README.md` | Product and phase overview. |

### B.2 Client technology stack

| Layer | Technology |
|-------|------------|
| Runtime | Expo (~54), React 19, React Native |
| Navigation | `expo-router` (file-based), React Navigation tabs/stack |
| State | React Context (`HabitsProvider`) |
| Persistence | `@react-native-async-storage/async-storage` (JSON blobs) |
| Notifications | `expo-notifications` (daily triggers per habit id) |
| UI | React Native `StyleSheet`, themed components |

### B.3 Module map

| Area | Location |
|------|----------|
| Global state | `client/context/habits-context.tsx` |
| Storage I/O | `client/lib/storage.ts` |
| Types | `client/types/habit.ts` |
| XP / level math | `client/constants/xp.ts` |
| Streak calculation | `client/lib/streaks.ts` |
| Notifications | `client/lib/notifications.ts` |
| Theme | `client/constants/theme.ts`, `client/hooks/use-color-scheme*.ts` |
| Routes | `client/app/` — `(tabs)/` for Today, Habits, Stats; `habit/` for new, detail, edit; `modal` for settings |

### B.4 Data model (client)

**Habit:** `id`, `name`, `icon`, `color`, `frequency` (`daily` \| `weekly`), `reminderTime` (`HH:mm` or null), `xpReward`, `archived`, `createdAt` (ISO).

**Completion:** `id`, `habitId`, `date` (YYYY-MM-DD), `completedAt` (ISO), `skipped`, `note`, `xpAwarded`.

**Storage keys:** `@level_up/habits`, `@level_up/completions` — JSON arrays.

### B.5 Context API (behavioral contract)

Exposed by `useHabits()`:

- `habits`, `completions`, `loading`
- `addHabit`, `updateHabit`, `deleteHabit`, `archiveHabit`
- `completeHabit(habitId, date, skipped?, note?)` — no duplicate same habit+date
- `uncompleteHabit(habitId, date)`
- `refresh()` — reload from AsyncStorage

Side effects: persist after mutations; schedule/cancel notifications when `reminderTime` changes or habit is deleted.

### B.6 XP and level algorithm

Implemented in `client/constants/xp.ts`: progressive XP thresholds per level segment; `xpToLevel` / `xpProgressInLevel` are the single source of truth for level display.

### B.7 Streak algorithm

`client/lib/streaks.ts`: uses non-skipped completions, unique dates sorted; computes current streak from today backward and longest run of consecutive days.

### B.8 Notifications

- Handler shows alert + sound (`setNotificationHandler`).
- `scheduleHabitReminder` uses notification `identifier` = `habitId`; daily trigger at hour/minute.
- Cancel on delete or when reminder cleared.

### B.9 Known implementation gaps (vs functional intent)

- Today screen may filter only daily habits until weekly rules are fully specified in code.
- Skip/note exist in context but may not be exposed in all UIs.
- New habit reminder UI may need alignment with edit flow and `HH:mm` parsing.
- Settings modal may be minimal vs optional SG-* items.
- `client/app/(tabs)/explore.tsx` may remain as hidden Expo template (`href: null` in tab layout).

### B.10 Future backend (non-V1)

When added: REST or GraphQL API, database (e.g. PostgreSQL), auth, sync — **separate technical design**; client would add HTTP client, token storage, and merge/sync strategy.

---

## Document control

| Version | Date | Notes |
|---------|------|--------|
| 1.0 | 2026-04-03 | Initial combined functional + technical spec for V1 local app |
