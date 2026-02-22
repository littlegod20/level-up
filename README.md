# Level Up

A React Native mobile app for habit tracking with gamification: complete habits to earn XP, level up, and build streaks.

## Overview

Level Up is built **Expo + local-only** for v1: no backend, no auth, no cloud sync. All data is stored on the device so the app works fully offline.

## What the project will consist of

### Core features

- **Habits** – Create, edit, archive habits with name, icon, color, and frequency (daily, weekly). Optional reminder times.
- **Tracking** – Check off habits from a Today list; optional skip or note. History per habit.
- **Gamification** – XP per completion, user level (from total XP), and per-habit streaks (current and longest).
- **Views** – Today (habits due today + progress), Habits list (manage/reorder), Habit detail (history, streak), Stats (level, XP, completion %, charts).
- **Reminders** – Local push notifications per habit (e.g. “Time to do X”) via `expo-notifications`.
- **Settings** – Notifications, theme (light/dark), data export, about. Optional onboarding.

### Tech stack

| Layer        | Choice |
| ------------ | ------ |
| Framework    | [Expo](https://expo.dev) (React Native, managed workflow) |
| Navigation   | React Navigation (tabs: Today, Habits, Stats; stack for detail/settings) |
| State        | React Context or Zustand |
| Persistence  | AsyncStorage (v1); optional move to `expo-sqlite` later |
| Notifications| `expo-notifications` |
| Charts       | `react-native-chart-kit` or `victory-native` (Stats screen) |
| UI           | Custom components + StyleSheet |

### Data model (local)

- **Habit** – id, name, icon, color, frequency, reminderTime, xpReward, archived, createdAt.
- **Completion** – id, habitId, date, completedAt, skipped?, note?, xpAwarded.
- **User/level** – totalXP and level (computed or stored); streaks derived from completions.

### Screens

- **Today** – List of habits due today; tap to complete or skip; daily progress (e.g. 3/5).
- **Habits** – List of habits; add, edit, reorder, archive.
- **Habit detail** – Single habit; calendar/history; streak; edit.
- **Stats** – Level, total XP; per-habit stats; completion % and simple charts.
- **Settings** – Notifications, theme, export, about.
- **Onboarding** (optional) – Short intro + create first habit.

### V1 scope

**In scope:** Expo app, tab + stack navigation, habits CRUD, Today + completions, AsyncStorage persistence, XP + user level, per-habit streaks, optional reminders and stats/charts.

**Out of scope for v1:** Backend, auth, cloud sync, multi-device, social/leaderboards.

## Implementation phases (planned)

1. Scaffold Expo app, navigation, theme.
2. Habits CRUD + storage layer (AsyncStorage).
3. Today screen + completions (check-off, persist, history).
4. XP and levels; display on Today/Stats.
5. Streaks (per-habit); display on Today and habit detail.
6. Reminders (`expo-notifications`).
7. Stats and charts.
8. Polish: onboarding, accessibility, optional future sync.

## Getting started (when building)

1. Scaffold: `npx create-expo-app@latest .` (or in a `client/` folder); add React Navigation and a basic theme.
2. Add a small storage module for habits and completions (e.g. `src/lib/storage`).
3. Build Habits list + add/edit form; wire to storage.
4. Build Today screen: filter habits due today, check-off writes a completion and refreshes.

No backend required for v1; the entire app runs in this repository.
