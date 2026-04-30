import type { Completion, Habit } from '@/types/habit';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

type ApiErrorBody = { message?: string };

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, headers, ...rest } = options;
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
  });

  if (!res.ok) {
    let body: ApiErrorBody = {};
    try {
      body = (await res.json()) as ApiErrorBody;
    } catch {
      body = {};
    }
    throw new Error(body.message ?? `Request failed (${res.status})`);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

export type RegisterPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
};

export async function apiRegister(payload: RegisterPayload): Promise<{ accessToken: string; user: { id: string; email: string } }> {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function apiLogin(email: string, password: string): Promise<{ accessToken: string; user: { id: string; email: string } }> {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function apiGetMe(token: string): Promise<void> {
  await request('/api/health', { token });
}

export async function apiGetHabits(token: string): Promise<Habit[]> {
  const out = await request<{ habits: Habit[] }>('/api/habits', { token });
  return out.habits;
}

export async function apiCreateHabit(
  token: string,
  payload: Omit<Habit, 'id' | 'createdAt'>
): Promise<Habit> {
  const out = await request<{ habit: Habit }>('/api/habits', {
    token,
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return out.habit;
}

export async function apiUpdateHabit(
  token: string,
  habitId: string,
  payload: Partial<Habit>
): Promise<Habit> {
  const out = await request<{ habit: Habit }>(`/api/habits/${habitId}`, {
    token,
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return out.habit;
}

export async function apiDeleteHabit(token: string, habitId: string): Promise<void> {
  await request(`/api/habits/${habitId}`, {
    token,
    method: 'DELETE',
  });
}

export async function apiGetCompletions(token: string, habitId: string): Promise<Completion[]> {
  const out = await request<{ completions: Completion[] }>(`/api/habits/${habitId}/completions`, {
    token,
  });
  return out.completions;
}

export async function apiCreateCompletion(
  token: string,
  habitId: string,
  payload: { date: string; skipped?: boolean; note?: string | null }
): Promise<Completion> {
  const out = await request<{ completion: Completion }>(`/api/habits/${habitId}/completions`, {
    token,
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return out.completion;
}

export async function apiDeleteCompletion(
  token: string,
  habitId: string,
  date: string
): Promise<void> {
  await request(`/api/habits/${habitId}/completions/${date}`, {
    token,
    method: 'DELETE',
  });
}
